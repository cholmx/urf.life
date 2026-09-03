/*
  # Migrate existing events/classes into the unified Happenings table

  ## Problem
  events_portal123 and classes_portal123 hold real, currently-public
  content. Once the Communication Organizer becomes the single place staff
  plan this content, nothing already live on the site should disappear.

  ## What this does
  One-time copy of every row from events_portal123/classes_portal123 into
  staff_announcements_portal123, marked already-published (they're already
  live today) so the site doesn't regress the moment public pages are
  repointed to read from the unified table in a later change. Rich text in
  `details` is stripped to plain text, matching this table's existing
  plain-text `body` column and the plainTextToHtml() rendering already used
  for the (now-retired) publish-to-announcements copy.

  Guarded by the legacy_source_table/legacy_source_id unique index from the
  prior migration, so this is safe to re-run - already-migrated rows are
  skipped, not duplicated. events_portal123/classes_portal123 are left
  completely untouched (not dropped) for rollback safety.

  Every row in staff_announcements_portal123 requires a user_id owner
  (matching this app's single shared admin account model - see the
  original create_staff_comms_tables migration). Migrated rows are
  attributed to the earliest-created auth user.
*/

DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  SELECT id INTO admin_user_id FROM auth.users ORDER BY created_at ASC LIMIT 1;

  IF admin_user_id IS NULL THEN
    RAISE NOTICE 'No auth.users row found - skipping events/classes migration into staff_announcements_portal123. Re-run this migration after the admin account exists.';
    RETURN;
  END IF;

  INSERT INTO staff_announcements_portal123 (
    title, body, link, event_date, event_dates, event_time, end_time, event_location,
    happening_type, is_published, published_at, status, scope, category,
    legacy_source_table, legacy_source_id, user_id
  )
  SELECT
    e.title,
    trim(regexp_replace(regexp_replace(coalesce(e.details, ''), '<[^>]+>', ' ', 'g'), '\s+', ' ', 'g')),
    coalesce(e.link, ''),
    e.event_date,
    CASE WHEN e.event_date IS NOT NULL THEN ARRAY[e.event_date::text] ELSE '{}'::text[] END,
    coalesce(to_char(e.start_time, 'HH24:MI'), ''),
    coalesce(to_char(e.end_time, 'HH24:MI'), ''),
    coalesce(e.location, ''),
    'event',
    true,
    now(),
    'approved',
    'informational',
    'Events & Fellowship',
    'events_portal123',
    e.id,
    admin_user_id
  FROM events_portal123 e
  WHERE NOT EXISTS (
    SELECT 1 FROM staff_announcements_portal123 s
    WHERE s.legacy_source_table = 'events_portal123' AND s.legacy_source_id = e.id
  );

  INSERT INTO staff_announcements_portal123 (
    title, body, link, event_date, event_dates, event_time, end_time, event_location,
    happening_type, is_published, published_at, status, scope, category,
    legacy_source_table, legacy_source_id, user_id
  )
  SELECT
    c.title,
    trim(regexp_replace(regexp_replace(coalesce(c.details, ''), '<[^>]+>', ' ', 'g'), '\s+', ' ', 'g')),
    coalesce(c.link, ''),
    c.start_date,
    CASE WHEN c.start_date IS NOT NULL THEN ARRAY[c.start_date::text] ELSE '{}'::text[] END,
    coalesce(to_char(c.start_time, 'HH24:MI'), ''),
    coalesce(to_char(c.end_time, 'HH24:MI'), ''),
    coalesce(c.location, ''),
    'class',
    true,
    now(),
    'approved',
    'informational',
    'Groups & Classes',
    'classes_portal123',
    c.id,
    admin_user_id
  FROM classes_portal123 c
  WHERE NOT EXISTS (
    SELECT 1 FROM staff_announcements_portal123 s
    WHERE s.legacy_source_table = 'classes_portal123' AND s.legacy_source_id = c.id
  );
END $$;
