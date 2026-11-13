/*
# Fix automatic YouTube sermon import

1. Problem
- The hourly import asked for the YouTube feed and waited for the answer inside the same database transaction.
- The request is only sent after that transaction finishes, so the wait always timed out and the import stopped before adding anything.

2. Changes
- New helper `youtube_feed_url()` holds the channel feed address in one place.
- New scheduled job `request-youtube-feed` runs at 10 minutes past every hour and asks YouTube for the feed.
- `import_youtube_videos()` no longer makes the request. It reads the most recent saved feed response for the channel (responses older than 3 hours are ignored) and imports from it at 17 minutes past the hour, as before.
- Import logic (duplicate checks, claiming manually entered sermons, title parsing, series creation) is unchanged.

3. Security
- `youtube_feed_url()` is not callable by public, anon, or authenticated roles; only the scheduled job and the import function use it.

4. Notes
- Existing sermons are never duplicated: videos already linked by ID are skipped, and manually entered sermons matching a video URL are claimed rather than copied.
*/

CREATE OR REPLACE FUNCTION public.youtube_feed_url()
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path TO ''
AS $function$
  SELECT 'https://www.youtube.com/feeds/videos.xml?channel_id=UCQtl2NJ6-SnnsgMXpsV1K6w'::text;
$function$;

REVOKE EXECUTE ON FUNCTION public.youtube_feed_url() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.import_youtube_videos()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions', 'net'
AS $function$
declare
-- The channel's YouTube Channel ID (public, not a secret).
channel_id constant text := 'UCQtl2NJ6-SnnsgMXpsV1K6w';
latest record;
feed_xml text;
entries text[];
entry text;
video_id text;
raw_title text;
published text;
raw_description text;
parsed jsonb;
series_id uuid;
description_parts jsonb;
existing_id uuid;
imported_count int := 0;
backfilled_count int := 0;
skipped_count int := 0;
unmatched_count int := 0;
begin
select r.status_code, r.content, r.created into latest
from net._http_response r
where r.content like '%' || channel_id || '%'
order by r.created desc
limit 1;

if latest.created is null then
raise warning 'import_youtube_videos: no feed response has been saved yet';
return;
end if;

if latest.status_code is null or latest.status_code >= 300 then
raise warning 'import_youtube_videos: latest feed fetch failed - status %', latest.status_code;
return;
end if;

if latest.created < now() - interval '3 hours' then
raise warning 'import_youtube_videos: latest feed response is stale (saved %)', latest.created;
return;
end if;

feed_xml := latest.content;
if feed_xml is null or feed_xml = '' then
raise warning 'import_youtube_videos: feed response had no body';
return;
end if;

-- Splitting on the literal "<entry>" tag turns the feed into one chunk
-- per video (the first chunk, before any <entry>, is header junk and
-- is skipped below by starting the loop at index 2).
entries := regexp_split_to_array(feed_xml, '<entry>');

for i in 2 .. array_length(entries, 1) loop
entry := entries[i];

video_id := (regexp_match(entry, '<yt:videoId>([^<]*)</yt:videoId>'))[1];
if video_id is null then
continue;
end if;

-- Already imported - nothing to do.
select id into existing_id from sermons_portal123 where youtube_video_id = video_id limit 1;
if existing_id is not null then
skipped_count := skipped_count + 1;
continue;
end if;

-- Matches an existing manually-entered sermon (same video, found by
-- extracting the ID from its stored youtube_url) - just claim it,
-- leave every other field exactly as staff entered it.
select id into existing_id
from sermons_portal123
where youtube_video_id is null
and extract_youtube_video_id(youtube_url) = video_id
limit 1;
if existing_id is not null then
update sermons_portal123 set youtube_video_id = video_id where id = existing_id;
backfilled_count := backfilled_count + 1;
continue;
end if;

raw_title := youtube_unescape_xml((regexp_match(entry, '<title>([^<]*)</title>'))[1]);
published := (regexp_match(entry, '<published>([^<]*)</published>'))[1];
raw_description := youtube_unescape_xml((regexp_match(entry, '<media:description>([^<]*)</media:description>'))[1]);

parsed := parse_sermon_title(raw_title);
if parsed is null then
raise notice 'import_youtube_videos: skipping "%" - title does not match "Series :: Name // Speaker" or "Name // Speaker"', raw_title;
unmatched_count := unmatched_count + 1;
continue;
end if;

series_id := null;
if parsed->>'series' is not null then
select id into series_id from sermon_series_portal123 where lower(name) = lower(parsed->>'series') limit 1;
if series_id is null then
insert into sermon_series_portal123 (name, description, start_date)
values (parsed->>'series', '', current_date)
returning id into series_id;
end if;
end if;

description_parts := split_sermon_description(raw_description);

insert into sermons_portal123 (
title, speaker, sermon_date, youtube_url, youtube_video_id,
summary, discussion_questions, tags, sermon_series_id
) values (
parsed->>'sermon_name',
parsed->>'speaker',
coalesce(published::date, current_date),
'https://www.youtube.com/watch?v=' || video_id,
video_id,
coalesce(description_parts->>'summary', ''),
coalesce(description_parts->>'discussion_questions', ''),
'{}',
series_id
);
imported_count := imported_count + 1;
end loop;

raise notice 'import_youtube_videos: imported %, backfilled %, skipped %, % not yet in the expected title format',
imported_count, backfilled_count, skipped_count, unmatched_count;
end;
$function$;

SELECT cron.schedule(
'request-youtube-feed',
'10 * * * *',
$cron$select net.http_get(url := public.youtube_feed_url(), timeout_milliseconds := 10000);$cron$
);
