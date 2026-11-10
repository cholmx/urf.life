// Imports new sermon videos from the church's YouTube channel into
// sermons_portal123. Deploy with:
//   supabase functions deploy import-youtube-sermons
// then set it up to run on a schedule via Supabase Dashboard -> Edge
// Functions -> import-youtube-sermons -> Cron Triggers (no code needed -
// see supabase/functions/import-youtube-sermons/README.md for the exact
// steps and the two secrets this function needs).
//
// What it does, per run:
//   1. Fetch the channel's most recent uploads from the YouTube Data API.
//   2. For each video, decide one of three things:
//      - already claimed (youtube_video_id matches an existing row) -> skip
//      - matches an existing *manually-entered* row (same video ID,
//        extracted from that row's youtube_url) -> backfill just
//        youtube_video_id onto it, leave every other field untouched
//      - genuinely new -> parse the title, send the description to Claude
//        for a cleaned-up summary/discussion questions/tags, find-or-create
//        its series, and insert a new row.
//   3. A title that doesn't match "Series :: Sermon Name // Speaker" or
//      "Sermon Name // Speaker" is logged and skipped rather than guessed -
//      covers the channel's older videos, which predate this convention.
//
// Re-running this is always safe: every video is either skipped,
// backfilled (metadata-only), or inserted once - never updated after
// that, so a staff edit made afterward in the admin UI is never silently
// overwritten by a later run.

import { createClient } from 'npm:@supabase/supabase-js@2';
import Anthropic from 'npm:@anthropic-ai/sdk@1';
import { parseSermonTitle, extractYouTubeVideoId, splitDescriptionSections } from '../_shared/parse.ts';

const YOUTUBE_CHANNEL_HANDLE = 'TheUpperRoomFellowship';
const MAX_VIDEOS_PER_RUN = 50;

function requireEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

interface FetchedVideo {
  videoId: string;
  title: string;
  description: string;
  publishedAt: string;
}

async function fetchChannelUploadsPlaylistId(apiKey: string): Promise<string> {
  const url = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&forHandle=${encodeURIComponent(YOUTUBE_CHANNEL_HANDLE)}&key=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`YouTube channels.list failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  const uploadsId = data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploadsId) throw new Error(`Could not resolve uploads playlist for channel handle "${YOUTUBE_CHANNEL_HANDLE}"`);
  return uploadsId;
}

async function fetchRecentUploads(apiKey: string, uploadsPlaylistId: string, limit: number): Promise<FetchedVideo[]> {
  const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=${limit}&key=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`YouTube playlistItems.list failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return (data.items || []).map((item: any) => ({
    videoId: item.contentDetails.videoId,
    title: item.snippet.title,
    description: item.snippet.description || '',
    publishedAt: item.contentDetails.videoPublishedAt || item.snippet.publishedAt,
  }));
}

// Claude reviews the naive header-split (if any) against the full raw
// description and returns the cleaned-up, render-ready HTML plus tags -
// this is the "look at it and make sure it's right" step, not a second
// opinion the function trusts blindly: a description with neither header
// still gets tags from whatever it does say.
async function extractSermonContent(
  anthropic: Anthropic,
  { title, description, naiveSummary, naiveQuestions }: { title: string; description: string; naiveSummary: string; naiveQuestions: string }
): Promise<{ summary_html: string; discussion_questions_html: string; tags: string[] }> {
  const tool = {
    name: 'sermon_content',
    description: 'The cleaned-up sermon summary, discussion questions, and topical tags extracted from a YouTube video description.',
    input_schema: {
      type: 'object' as const,
      properties: {
        summary_html: {
          type: 'string',
          description: 'The sermon summary as simple HTML paragraphs (<p>...</p>), ready to render directly. Empty string if the description has no real summary content.',
        },
        discussion_questions_html: {
          type: 'string',
          description: 'The discussion questions as one <p>...</p> per question, ready to render directly. Empty string if the description has no discussion questions.',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: '3-6 short topical tags (1-3 words each, title case, e.g. "Forgiveness", "The Holy Spirit") describing what this sermon is actually about, based on its summary/description/title.',
        },
      },
      required: ['summary_html', 'discussion_questions_html', 'tags'],
      additionalProperties: false,
    },
    strict: true,
  };

  const response = await anthropic.messages.create({
    model: 'claude-opus-5-5',
    max_tokens: 2048,
    system: `You clean up church sermon video metadata for a church website. The video description is expected to contain a "Summary:" section and a "Discussion Questions:" section, in that order, but staff sometimes typo the headers, leave extra blank lines, or add unrelated boilerplate (links, social handles, service times) before/after/between them - find and extract the real content regardless. Discussion questions should become one <p> per question, never a <ul>. If a section genuinely isn't present, return an empty string for it rather than inventing content. Call the sermon_content tool with your result - do not respond with plain text.`,
    messages: [
      {
        role: 'user',
        content: `Video title: ${title}\n\nA naive split of the description already found:\nSummary (naive): ${naiveSummary || '(none found)'}\nDiscussion Questions (naive): ${naiveQuestions || '(none found)'}\n\nFull raw description:\n${description}`,
      },
    ],
    tools: [tool],
    tool_choice: { type: 'auto' },
  });

  const toolUse = response.content.find((block: any) => block.type === 'tool_use' && block.name === 'sermon_content');
  if (!toolUse) {
    console.warn('Claude did not call sermon_content - leaving summary/discussion questions/tags empty for this video.');
    return { summary_html: '', discussion_questions_html: '', tags: [] };
  }
  return toolUse.input as { summary_html: string; discussion_questions_html: string; tags: string[] };
}

async function findOrCreateSeries(supabase: any, seriesName: string | null): Promise<string | null> {
  if (!seriesName) return null;
  const { data: existing, error: findError } = await supabase
    .from('sermon_series_portal123')
    .select('id')
    .ilike('name', seriesName)
    .maybeSingle();
  if (findError) throw findError;
  if (existing) return existing.id;

  const { data: created, error: insertError } = await supabase
    .from('sermon_series_portal123')
    .insert({ name: seriesName, description: '', start_date: new Date().toISOString().split('T')[0] })
    .select('id')
    .single();
  if (insertError) throw insertError;
  console.log(`Created new sermon series: "${seriesName}"`);
  return created.id;
}

async function runImport() {
  const youtubeApiKey = requireEnv('YOUTUBE_API_KEY');
  const supabaseUrl = requireEnv('SUPABASE_URL');
  const supabaseServiceRoleKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY');
  const anthropicApiKey = requireEnv('ANTHROPIC_API_KEY');
  // Only needed for a personal/service-account key that isn't scoped to a
  // single workspace - see generate-script/index.ts, which uses the same
  // ANTHROPIC_API_KEY secret and the same optional header.
  const workspaceId = Deno.env.get('ANTHROPIC_WORKSPACE_ID');

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
  const anthropic = new Anthropic({
    apiKey: anthropicApiKey,
    defaultHeaders: workspaceId ? { 'anthropic-workspace-id': workspaceId } : undefined,
  });

  console.log(`Resolving uploads playlist for @${YOUTUBE_CHANNEL_HANDLE}...`);
  const uploadsPlaylistId = await fetchChannelUploadsPlaylistId(youtubeApiKey);

  console.log(`Fetching up to ${MAX_VIDEOS_PER_RUN} recent uploads...`);
  const videos = await fetchRecentUploads(youtubeApiKey, uploadsPlaylistId, MAX_VIDEOS_PER_RUN);
  console.log(`Fetched ${videos.length} videos.`);

  const { data: existingSermons, error: existingError } = await supabase
    .from('sermons_portal123')
    .select('id, youtube_url, youtube_video_id');
  if (existingError) throw existingError;

  const claimedVideoIds = new Set(
    (existingSermons as any[]).filter((s) => s.youtube_video_id).map((s) => s.youtube_video_id)
  );
  const unclaimedByVideoId = new Map<string, string>();
  for (const sermon of existingSermons as any[]) {
    if (sermon.youtube_video_id) continue;
    const id = extractYouTubeVideoId(sermon.youtube_url);
    if (id) unclaimedByVideoId.set(id, sermon.id);
  }

  let skipped = 0, backfilled = 0, imported = 0, unmatched = 0;
  const importedTitles: string[] = [];
  const unmatchedTitles: string[] = [];

  for (const video of videos) {
    if (claimedVideoIds.has(video.videoId)) {
      skipped += 1;
      continue;
    }

    if (unclaimedByVideoId.has(video.videoId)) {
      const sermonId = unclaimedByVideoId.get(video.videoId);
      const { error } = await supabase
        .from('sermons_portal123')
        .update({ youtube_video_id: video.videoId })
        .eq('id', sermonId);
      if (error) throw error;
      console.log(`Backfilled youtube_video_id onto existing sermon for "${video.title}"`);
      backfilled += 1;
      continue;
    }

    const parsedTitle = parseSermonTitle(video.title);
    if (!parsedTitle) {
      console.log(`Skipping "${video.title}" - title doesn't match "Series :: Name // Speaker" or "Name // Speaker".`);
      unmatchedTitles.push(video.title);
      unmatched += 1;
      continue;
    }

    console.log(`Importing "${video.title}"...`);
    const { summary, discussionQuestions } = splitDescriptionSections(video.description);
    const content = await extractSermonContent(anthropic, {
      title: video.title,
      description: video.description,
      naiveSummary: summary,
      naiveQuestions: discussionQuestions,
    });

    const seriesId = await findOrCreateSeries(supabase, parsedTitle.series);

    const { error: insertError } = await supabase.from('sermons_portal123').insert({
      title: parsedTitle.sermonName,
      speaker: parsedTitle.speaker,
      sermon_date: video.publishedAt.split('T')[0],
      youtube_url: `https://www.youtube.com/watch?v=${video.videoId}`,
      youtube_video_id: video.videoId,
      summary: content.summary_html || '',
      discussion_questions: content.discussion_questions_html || '',
      tags: content.tags || [],
      sermon_series_id: seriesId,
    });
    if (insertError) throw insertError;
    importedTitles.push(parsedTitle.sermonName);
    imported += 1;
  }

  return { imported, backfilled, skipped, unmatched, importedTitles, unmatchedTitles };
}

Deno.serve(async () => {
  try {
    const result = await runImport();
    console.log(`Done. Imported ${result.imported}, backfilled ${result.backfilled}, skipped ${result.skipped}, ${result.unmatched} not yet in the expected title format.`);
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Import failed:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
