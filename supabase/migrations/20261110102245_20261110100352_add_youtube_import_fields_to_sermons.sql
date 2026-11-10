/*
  # Add YouTube import fields to sermons

  1. Changes
    - `sermons_portal123.youtube_video_id` (text, unique when set) - the
      YouTube video ID (not the full URL), used by the automated import
      script to recognize a video it has already created a row for (or
      already matched to a pre-existing manually-entered row), so re-runs
      never create duplicates and never overwrite a row a second time.
    - `sermons_portal123.tags` (text[], default '{}') - short topical tags
      the import's AI step derives from the video description, shown
      alongside each sermon and editable by staff like any other field.

  2. Notes
    - Both columns are nullable/optional so every existing manually-entered
      sermon keeps working unchanged - the import script backfills
      `youtube_video_id` onto a matching existing row (by extracting the
      video ID from its existing `youtube_url`) rather than creating a
      second row for it.
    - The partial unique index (WHERE youtube_video_id IS NOT NULL) allows
      any number of rows with a null youtube_video_id (every existing
      sermon today) while still preventing two rows from ever claiming the
      same video id.
*/

ALTER TABLE sermons_portal123
  ADD COLUMN IF NOT EXISTS youtube_video_id text,
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

CREATE UNIQUE INDEX IF NOT EXISTS idx_sermons_youtube_video_id
  ON sermons_portal123 (youtube_video_id)
  WHERE youtube_video_id IS NOT NULL;
