/*
# Add a manual "check YouTube now" action for staff

1. Problem
- Sermon import only runs on the hourly cron (feed fetch at :10,
  import at :17) - staff have no way to pull a freshly-published video
  in sooner. The AI-tagging step already has a manual button in
  Admin -> Sermons; the feed fetch and import steps don't.

2. Changes
- import_youtube_videos() now returns a jsonb summary (imported/
  backfilled/skipped/unmatched counts) instead of void, so a caller can
  see what happened. The hourly cron job (`select import_youtube_videos();`)
  ignores the return value either way, so this doesn't change its
  behavior.
- New request_youtube_feed_check(): queues a fresh feed fetch (the same
  request the scheduled job makes), waits - bounded to ~8 seconds,
  polling net._http_response - for that response to land, then runs
  import_youtube_videos() and returns its summary. Returns a timeout or
  error status instead if YouTube doesn't answer in time, rather than
  importing from a stale/missing response. One call does the whole
  "check now" a staffer expects from a button, despite the underlying
  fetch being asynchronous (net.http_get queues the request and returns
  immediately; the response lands later via a background worker - this
  function just waits for it instead of giving up right away).

3. Security
- request_youtube_feed_check() is SECURITY DEFINER (needs
  youtube_feed_url() and net._http_response, neither directly granted
  to authenticated) but only EXECUTE-granted to authenticated, same
  pattern already used for import_youtube_videos().
*/

drop function if exists public.import_youtube_videos();

create function public.import_youtube_videos()
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'extensions', 'net'
as $function$
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
return jsonb_build_object('imported', 0, 'backfilled', 0, 'skipped', 0, 'unmatched', 0, 'error', 'no feed response saved yet');
end if;

if latest.status_code is null or latest.status_code >= 300 then
raise warning 'import_youtube_videos: latest feed fetch failed - status %', latest.status_code;
return jsonb_build_object('imported', 0, 'backfilled', 0, 'skipped', 0, 'unmatched', 0, 'error', format('feed fetch failed (status %s)', latest.status_code));
end if;

if latest.created < now() - interval '3 hours' then
raise warning 'import_youtube_videos: latest feed response is stale (saved %)', latest.created;
return jsonb_build_object('imported', 0, 'backfilled', 0, 'skipped', 0, 'unmatched', 0, 'error', 'latest feed response is stale');
end if;

feed_xml := latest.content;
if feed_xml is null or feed_xml = '' then
raise warning 'import_youtube_videos: feed response had no body';
return jsonb_build_object('imported', 0, 'backfilled', 0, 'skipped', 0, 'unmatched', 0, 'error', 'feed response had no body');
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

return jsonb_build_object(
'imported', imported_count,
'backfilled', backfilled_count,
'skipped', skipped_count,
'unmatched', unmatched_count
);
end;
$function$;

REVOKE EXECUTE ON FUNCTION public.import_youtube_videos() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.import_youtube_videos() FROM anon;
GRANT EXECUTE ON FUNCTION public.import_youtube_videos() TO authenticated;

CREATE OR REPLACE FUNCTION public.request_youtube_feed_check()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions', 'net'
AS $function$
DECLARE
channel_id CONSTANT text := 'UCQtl2NJ6-SnnsgMXpsV1K6w';
started_at CONSTANT timestamptz := clock_timestamp();
latest record;
import_result jsonb;
BEGIN
PERFORM net.http_get(url := public.youtube_feed_url(), timeout_milliseconds := 10000);

LOOP
SELECT r.status_code, r.created INTO latest
FROM net._http_response r
WHERE r.content LIKE '%' || channel_id || '%'
ORDER BY r.created DESC
LIMIT 1;

EXIT WHEN latest.created IS NOT NULL AND latest.created >= started_at;

IF extract(epoch FROM clock_timestamp() - started_at) > 8 THEN
RETURN jsonb_build_object('status', 'timeout', 'message', 'YouTube is taking longer than usual to respond - try again in a few seconds.');
END IF;
PERFORM pg_sleep(0.4);
END LOOP;

IF latest.status_code IS NULL OR latest.status_code >= 300 THEN
RETURN jsonb_build_object('status', 'error', 'message', format('The YouTube feed request failed (status %s).', latest.status_code));
END IF;

import_result := public.import_youtube_videos();
RETURN jsonb_build_object('status', 'ok') || coalesce(import_result, '{}'::jsonb);
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.request_youtube_feed_check() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.request_youtube_feed_check() FROM anon;
GRANT EXECUTE ON FUNCTION public.request_youtube_feed_check() TO authenticated;
