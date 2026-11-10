// Pure, dependency-free parsing helpers for the YouTube sermon import -
// kept separate from index.ts (which talks to the YouTube/Claude/Supabase
// APIs) so the actual parsing logic can be unit tested without network
// access or credentials. Plain portable TS (no Deno- or Node-specific
// APIs), so the same file is both deployed with the edge function and
// imported directly by parse.test.ts under Vitest.

// Expected title shapes going forward:
//   "Series :: Sermon Name // Speaker"   (part of a series)
//   "Sermon Name // Speaker"             (standalone, no series)
// A title matching neither (older videos, or one not yet following the
// convention) returns null so the caller can skip it rather than guess.
export interface ParsedSermonTitle {
  series: string | null;
  sermonName: string;
  speaker: string;
}

export function parseSermonTitle(title: string | null | undefined): ParsedSermonTitle | null {
  if (!title || typeof title !== 'string') return null;

  const withSeries = title.match(/^(.+?)\s*::\s*(.+?)\s*\/\/\s*(.+?)\s*$/);
  if (withSeries) {
    const [, series, sermonName, speaker] = withSeries;
    if (series && sermonName && speaker) {
      return { series: series.trim(), sermonName: sermonName.trim(), speaker: speaker.trim() };
    }
  }

  const standalone = title.match(/^(.+?)\s*\/\/\s*(.+?)\s*$/);
  if (standalone) {
    const [, sermonName, speaker] = standalone;
    if (sermonName && speaker) {
      return { series: null, sermonName: sermonName.trim(), speaker: speaker.trim() };
    }
  }

  return null;
}

// Pulls the 11-character video ID out of any common YouTube URL shape
// (watch?v=, youtu.be/, /embed/, /shorts/), or returns it unchanged if
// already a bare ID. Used to match a freshly-fetched video against
// existing sermons whose youtube_url was typed in by hand long before
// youtube_video_id existed, in whatever format staff happened to paste.
export function extractYouTubeVideoId(input: string | null | undefined): string | null {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();

  if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) return trimmed;

  const patterns = [
    /[?&]v=([A-Za-z0-9_-]{11})/,
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /\/embed\/([A-Za-z0-9_-]{11})/,
    /\/shorts\/([A-Za-z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Splits raw description text on its "Summary:"/"Discussion Questions:"
// headers as a first pass, before Claude reviews and cleans it up - gives
// the AI call a concrete starting point instead of the whole raw
// description, and lets the caller skip the AI call entirely when a
// description has neither header (nothing to extract).
export function splitDescriptionSections(description: string | null | undefined): { summary: string; discussionQuestions: string } {
  if (!description || typeof description !== 'string') {
    return { summary: '', discussionQuestions: '' };
  }

  const summaryMatch = description.match(
    /summary:\s*([\s\S]*?)(?=\n\s*discussion questions:|$)/i
  );
  const questionsMatch = description.match(/discussion questions:\s*([\s\S]*)$/i);

  return {
    summary: summaryMatch ? summaryMatch[1].trim() : '',
    discussionQuestions: questionsMatch ? questionsMatch[1].trim() : '',
  };
}
