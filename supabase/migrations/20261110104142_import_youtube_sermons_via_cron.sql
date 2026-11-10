/*
  # Automatically import sermons from YouTube

  Everything runs inside the database itself - two pg_cron jobs calling two
  plpgsql functions, no Edge Function and no server. This mirrors the
  approach already proven out on another church site, adapted to this
  project's schema.

  1. New functions
    - `youtube_unescape_xml(text)` - decodes the handful of XML entities
      (&amp; &lt; &gt; &quot; &#39;) that can appear in a video's title or
      description inside the raw feed XML.
    - `extract_youtube_video_id(text)` - pulls the 11-character video ID out
      of any common YouTube URL shape (watch/youtu.be/embed/shorts), or a
      bare ID unchanged. Used to match a freshly-fetched video against an
      existing *manually-entered* sermon row (whose youtube_url predates
      the youtube_video_id column) without ever creating a duplicate.
    - `parse_sermon_title(text)` - "Series :: Sermon Name // Speaker" or
      standalone "Sermon Name // Speaker" -> jsonb {series, sermon_name,
      speaker}, or null if the title doesn't match either shape yet (older
      videos, or ones not following the convention).
    - `split_sermon_description(text)` - splits raw description text on its
      "Summary:"/"Discussion Questions:" headers (case-insensitive, each on
      its own line) into jsonb {summary, discussion_questions}. Plain text
      splitting, no AI - matches the convention in this repo's earlier
      splitDescriptionSections() helper.
    - `net_wait_response(bigint, int, numeric)` - polls pg_net's response
      table for a request fired via net.http_get/http_post until it
      completes or times out, since pg_net delivers responses
      asynchronously via a background worker. Written against
      net._http_response directly (stable across pg_net versions) rather
      than any particular version's helper function, since that's the one
      piece of this migration I can't verify against this project's exact
      installed pg_net version before it's actually applied.
    - `import_youtube_videos()` - fetches the channel's public Atom feed
      (no API key - the feed lists the 15 newest uploads), and for each
      video: skips it if already imported, backfills just
      youtube_video_id onto an existing manually-entered sermon with a
      matching video ID (leaving every other field untouched), or inserts
      a new sermon (finding/creating its series by name) if the title
      parses and it's genuinely new. A title that doesn't parse is
      skipped, never guessed at.
    - `ai_tag_untagged_sermons(integer)` - for sermons with no tags yet,
      calls Claude (via pg_net, using the Anthropic key stored in Vault)
      to generate a handful of short topical tags from the sermon's
      title/summary/discussion questions, and saves them. Processes at
      most the given number of sermons per call, so a single cron tick
      can't balloon into an unbounded number of API calls.

  2. Scheduled jobs
    - `import-youtube-videos` - every hour at :17 past, runs
      `import_youtube_videos()`.
    - `ai-tag-sermons` - every hour at :47 past, runs
      `ai_tag_untagged_sermons(10)`. Offset from the import job so tagging
      always has a full run's worth of newly-imported sermons to work
      through, and offset from the hour itself so these don't all fire
      alongside every other service's own top-of-the-hour jobs.

  3. One-time manual step (cannot be done from a migration)
    This migration does NOT store an Anthropic API key anywhere - a real
    secret value must never be committed to a migration file. Before
    ai_tag_untagged_sermons can do anything useful, run this once in the
    Supabase SQL Editor (not as a migration), with your real key:

      select vault.create_secret('your-actual-anthropic-api-key', 'anthropic_api_key');

    Until that secret exists, ai_tag_untagged_sermons logs a warning and
    does nothing - it never fails the whole cron job over a missing key.

    (import_youtube_videos' channel ID is already filled in below - it's
    a public, non-secret value, not something that needs a manual step.)

  4. Notes
    - Both new sermon-matching functions are intentionally deterministic
      (no AI) - only tag generation calls out to Claude, same split as
      the proven reference implementation.
    - A sermon is only ever inserted or backfilled *once* - never updated
      again after that by import_youtube_videos - so editing a sermon
      afterward in the admin panel is never silently reverted by a later
      run. ai_tag_untagged_sermons only ever touches sermons with an empty
      tags array, so it never overwrites tags staff already set or edited.
*/

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- ---------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------

create or replace function youtube_unescape_xml(input text)
returns text
language sql
immutable
as $$
  select replace(replace(replace(replace(replace(
    coalesce(input, ''),
    '&amp;', '&'),
    '&lt;', '<'),
    '&gt;', '>'),
    '&quot;', '"'),
    '&#39;', '''');
$$;

create or replace function extract_youtube_video_id(input text)
returns text
language plpgsql
immutable
as $$
declare
  trimmed text := trim(coalesce(input, ''));
  m text[];
begin
  if trimmed = '' then
    return null;
  end if;
  if trimmed ~ '^[A-Za-z0-9_-]{11}$' then
    return trimmed;
  end if;
  m := regexp_match(trimmed, '[?&]v=([A-Za-z0-9_-]{11})');
  if m is not null then return m[1]; end if;
  m := regexp_match(trimmed, 'youtu\.be/([A-Za-z0-9_-]{11})');
  if m is not null then return m[1]; end if;
  m := regexp_match(trimmed, '/embed/([A-Za-z0-9_-]{11})');
  if m is not null then return m[1]; end if;
  m := regexp_match(trimmed, '/shorts/([A-Za-z0-9_-]{11})');
  if m is not null then return m[1]; end if;
  return null;
end;
$$;

-- "Series :: Sermon Name // Speaker" or standalone "Sermon Name // Speaker".
-- Returns null (not a guess) when the title matches neither shape.
create or replace function parse_sermon_title(title text)
returns jsonb
language plpgsql
immutable
as $$
declare
  m text[];
begin
  if title is null or trim(title) = '' then
    return null;
  end if;

  m := regexp_match(title, '^(.+?)\s*::\s*(.+?)\s*//\s*(.+?)\s*$');
  if m is not null then
    return jsonb_build_object('series', trim(m[1]), 'sermon_name', trim(m[2]), 'speaker', trim(m[3]));
  end if;

  m := regexp_match(title, '^(.+?)\s*//\s*(.+?)\s*$');
  if m is not null then
    return jsonb_build_object('series', null, 'sermon_name', trim(m[1]), 'speaker', trim(m[2]));
  end if;

  return null;
end;
$$;

-- Plain-text split on "Summary:"/"Discussion Questions:" headers - no AI
-- here, matches this repo's own prior splitDescriptionSections() helper.
create or replace function split_sermon_description(description text)
returns jsonb
language plpgsql
immutable
as $$
declare
  lower_desc text;
  summary_pos int;
  questions_pos int;
  summary_text text := '';
  questions_text text := '';
begin
  if description is null or trim(description) = '' then
    return jsonb_build_object('summary', '', 'discussion_questions', '');
  end if;

  lower_desc := lower(description);
  summary_pos := position('summary:' in lower_desc);
  questions_pos := position('discussion questions:' in lower_desc);

  if summary_pos > 0 then
    if questions_pos > summary_pos then
      summary_text := substring(description from summary_pos + length('summary:') for questions_pos - summary_pos - length('summary:'));
    else
      summary_text := substring(description from summary_pos + length('summary:'));
    end if;
    summary_text := regexp_replace(summary_text, '^\s+|\s+$', '', 'g');
  end if;

  if questions_pos > 0 then
    questions_text := substring(description from questions_pos + length('discussion questions:'));
    questions_text := regexp_replace(questions_text, '^\s+|\s+$', '', 'g');
  end if;

  return jsonb_build_object('summary', summary_text, 'discussion_questions', questions_text);
end;
$$;

-- Polls pg_net's response table until the given request completes or
-- max_attempts * delay_seconds elapses. pg_net queues the request and a
-- background worker fills in net._http_response asynchronously, so a
-- plain select immediately after firing the request can easily find
-- nothing yet.
create or replace function net_wait_response(req_id bigint, max_attempts int default 30, delay_seconds numeric default 0.3)
returns table(status_code int, content text, error_msg text)
language plpgsql
as $$
declare
  attempt int := 0;
  rec record;
begin
  loop
    select r.status_code, r.content, r.error_msg into rec
    from net._http_response r
    where r.id = req_id;

    if found and (rec.status_code is not null or rec.error_msg is not null) then
      status_code := rec.status_code;
      content := rec.content;
      error_msg := rec.error_msg;
      return next;
      return;
    end if;

    attempt := attempt + 1;
    if attempt >= max_attempts then
      status_code := null;
      content := null;
      error_msg := 'timed out waiting for pg_net response';
      return next;
      return;
    end if;

    perform pg_sleep(delay_seconds);
  end loop;
end;
$$;

-- ---------------------------------------------------------------------
-- The import job
-- ---------------------------------------------------------------------

create or replace function import_youtube_videos()
returns void
language plpgsql
security definer
set search_path = public, extensions, net
as $$
declare
  -- The channel's YouTube Channel ID (public, not a secret).
  channel_id constant text := 'UCQtl2NJ6-SnnsgMXpsV1K6w';
  feed_url text;
  request_id bigint;
  resp record;
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
  feed_url := 'https://www.youtube.com/feeds/videos.xml?channel_id=' || channel_id;

  select net.http_get(url := feed_url, timeout_milliseconds := 10000) into request_id;
  select * into resp from net_wait_response(request_id);

  if resp.status_code is null or resp.status_code >= 300 then
    raise warning 'import_youtube_videos: feed fetch failed - status % - %', resp.status_code, coalesce(resp.error_msg, 'no error message');
    return;
  end if;

  feed_xml := resp.content;
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
$$;

-- ---------------------------------------------------------------------
-- AI tagging
-- ---------------------------------------------------------------------

create or replace function ai_tag_untagged_sermons(batch_size int default 10)
returns void
language plpgsql
security definer
set search_path = public, extensions, net, vault
as $$
declare
  anthropic_key text;
  sermon record;
  request_id bigint;
  resp record;
  response_body jsonb;
  tool_input jsonb;
  tags_array text[];
  tagged_count int := 0;
begin
  select decrypted_secret into anthropic_key
  from vault.decrypted_secrets
  where name = 'anthropic_api_key'
  limit 1;

  if anthropic_key is null then
    raise warning 'ai_tag_untagged_sermons: no anthropic_api_key secret in Vault yet - run select vault.create_secret(''your-key'', ''anthropic_api_key''); once, then this will start working.';
    return;
  end if;

  for sermon in
    select id, title, summary, discussion_questions
    from sermons_portal123
    where (tags is null or array_length(tags, 1) is null)
    order by sermon_date desc
    limit batch_size
  loop
    select net.http_post(
      url := 'https://api.anthropic.com/v1/messages',
      headers := jsonb_build_object(
        'x-api-key', anthropic_key,
        'anthropic-version', '2023-06-01',
        'content-type', 'application/json'
      ),
      body := jsonb_build_object(
        'model', 'claude-sonnet-5-5',
        'max_tokens', 512,
        'system', 'You tag church sermons for a website. Given a sermon''s title, summary, and discussion questions, call the sermon_tags tool with 3-6 short topical tags (1-3 words each, title case, e.g. "Forgiveness", "The Holy Spirit") describing what it is actually about.',
        'messages', jsonb_build_array(
          jsonb_build_object(
            'role', 'user',
            'content', 'Title: ' || coalesce(sermon.title, '') ||
                       E'\n\nSummary: ' || coalesce(regexp_replace(sermon.summary, '<[^>]*>', ' ', 'g'), '') ||
                       E'\n\nDiscussion Questions: ' || coalesce(regexp_replace(sermon.discussion_questions, '<[^>]*>', ' ', 'g'), '')
          )
        ),
        'tools', jsonb_build_array(
          jsonb_build_object(
            'name', 'sermon_tags',
            'description', 'The topical tags for this sermon.',
            'input_schema', jsonb_build_object(
              'type', 'object',
              'properties', jsonb_build_object(
                'tags', jsonb_build_object('type', 'array', 'items', jsonb_build_object('type', 'string'))
              ),
              'required', jsonb_build_array('tags'),
              'additionalProperties', false
            ),
            'strict', true
          )
        ),
        'tool_choice', jsonb_build_object('type', 'auto')
      ),
      timeout_milliseconds := 30000
    ) into request_id;

    select * into resp from net_wait_response(request_id, 60, 0.5);

    if resp.status_code is null or resp.status_code >= 300 then
      raise warning 'ai_tag_untagged_sermons: request failed for sermon % - status % - %', sermon.id, resp.status_code, coalesce(resp.error_msg, 'no error message');
      continue;
    end if;

    begin
      response_body := resp.content::jsonb;
    exception when others then
      raise warning 'ai_tag_untagged_sermons: could not parse response as JSON for sermon %', sermon.id;
      continue;
    end;

    if response_body->>'stop_reason' = 'refusal' then
      raise warning 'ai_tag_untagged_sermons: Claude declined for sermon %', sermon.id;
      continue;
    end if;

    select content_block->'input' into tool_input
    from jsonb_array_elements(response_body->'content') as content_block
    where content_block->>'type' = 'tool_use' and content_block->>'name' = 'sermon_tags'
    limit 1;

    if tool_input is null then
      raise warning 'ai_tag_untagged_sermons: no sermon_tags tool call in response for sermon %', sermon.id;
      continue;
    end if;

    select array_agg(value) into tags_array
    from jsonb_array_elements_text(tool_input->'tags') as value;

    update sermons_portal123 set tags = coalesce(tags_array, '{}') where id = sermon.id;
    tagged_count := tagged_count + 1;
  end loop;

  raise notice 'ai_tag_untagged_sermons: tagged % sermon(s)', tagged_count;
end;
$$;

-- ---------------------------------------------------------------------
-- Scheduling
-- ---------------------------------------------------------------------

select cron.unschedule(jobid) from cron.job where jobname = 'import-youtube-videos';
select cron.unschedule(jobid) from cron.job where jobname = 'ai-tag-sermons';

select cron.schedule('import-youtube-videos', '17 * * * *', $$select import_youtube_videos();$$);
select cron.schedule('ai-tag-sermons', '47 * * * *', $$select ai_tag_untagged_sermons(10);$$);
