// Imports new sermon videos from the church's YouTube channel into
// sermons_portal123, run on a schedule by .github/workflows/import-sermons.yml.
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
// Required environment variables (set as GitHub Actions secrets - see the
// workflow file for the exact names):
//   YOUTUBE_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY
//
// Re-running this script is always safe: every video is either skipped,
// backfilled (metadata-only), or inserted once - never updated after that,
// so a staff edit made afterward in the admin UI is never silently
// overwritten by a later run.

import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import { parseSermonTitle, extractYouTubeVideoId, splitDescriptionSections } from './parse.js';

const YOUTUBE_CHANNEL_HANDLE = 'TheUpperRoomFellowship';
const MAX_VIDEOS_PER_RUN = 50;

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

async function fetchChannelUploadsPlaylistId(apiKey) {
  const url = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&forHandle=${encodeURIComponent(YOUTUBE_CHANNEL_HANDLE)}&key=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`YouTube channels.list failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  const uploadsId = data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploadsId) throw new Error(`Could not resolve uploads playlist for channel handle "${YOUTUBE_CHANNEL_HANDLE}"`);
  return uploadsId;
}

async function fetchRecentUploads(apiKey, uploadsPlaylistId, limit) {
  const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=${limit}&key=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`YouTube playlistItems.list failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return (data.items || []).map((item) => ({
    videoId: item.contentDetails.videoId,
    title: item.snippet.title,
    description: item.snippet.description || '',
    publishedAt: item.contentDetails.videoPublishedAt || item.snippet.publishedAt,
  }));
}

// Claude reviews the naive header-split (if any) against the full raw
// description and returns the cleaned-up, render-ready HTML plus tags -
// this is the "look at it and make sure it's right" step, not a second
// opinion the script trusts blindly: a description with neither header
// still gets tags from whatever it does say.
async function extractSermonContent(anthropic, { title, description, naiveSummary, naiveQuestions }) {
  const tool = {
    name: 'sermon_content',
    description: 'The cleaned-up sermon summary, discussion questions, and topical tags extracted from a YouTube video description.',
    input_schema: {
      type: 'object',
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

  const toolUse = response.content.find((block) => block.type === 'tool_use' && block.name === 'sermon_content');
  if (!toolUse) {
    console.warn('  Claude did not call sermon_content - leaving summary/discussion questions/tags empty for this video.');
    return { summary_html: '', discussion_questions_html: '', tags: [] };
  }
  return toolUse.input;
}

async function findOrCreateSeries(supabase, seriesName) {
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
  console.log(`  Created new sermon series: "${seriesName}"`);
  return created.id;
}

async function run() {
  const youtubeApiKey = requireEnv('YOUTUBE_API_KEY');
  const supabaseUrl = requireEnv('SUPABASE_URL');
  const supabaseServiceRoleKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY');
  const anthropicApiKey = requireEnv('ANTHROPIC_API_KEY');

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
  const anthropic = new Anthropic({ apiKey: anthropicApiKey });

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
    existingSermons.filter((s) => s.youtube_video_id).map((s) => s.youtube_video_id)
  );
  const unclaimedByVideoId = new Map();
  for (const sermon of existingSermons) {
    if (sermon.youtube_video_id) continue;
    const id = extractYouTubeVideoId(sermon.youtube_url);
    if (id) unclaimedByVideoId.set(id, sermon.id);
  }

  let skipped = 0, backfilled = 0, imported = 0, unmatched = 0;

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
    imported += 1;
  }

  console.log(`\nDone. Imported ${imported}, backfilled ${backfilled}, skipped ${skipped} (already imported), ${unmatched} not yet in the expected title format.`);
}

run().catch((error) => {
  console.error('Import failed:', error);
  process.exit(1);
});
