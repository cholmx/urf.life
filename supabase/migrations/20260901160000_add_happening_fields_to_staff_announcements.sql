/*
  # Extend staff_announcements_portal123 into a unified "Happening" record

  ## Problem
  Announcements, Events, Classes, and Sign-up Sheets are four disconnected
  systems even though staff already plan all of this content in the
  Communication Organizer. "Publishing" today does a one-way copy into a
  different table (announcements_portal123) with no link back - editing
  one doesn't affect the other - and Events/Classes are entirely separate
  tables/admin screens with no connection to the Organizer at all.

  ## What this does
  Adds columns needed to let a Communication Organizer row optionally
  represent an Event/Class/Announcement/General "Happening" that can be
  manually published to the public site (in place, not copied), carry an
  external registration link, a real end time, and either an online RSVP
  or an attached printable sign-up sheet. All columns are additive with
  safe defaults - existing rows and current app behavior are unaffected
  until the UI (a later migration/PR) opts into them.

  Also grants the public (anon) role read access to rows a staff member
  has explicitly published - this table previously had zero anon access
  at all (it was 100% internal planning material). Postgres OR-combines
  multiple permissive policies for the same command, so staff keep seeing
  all their own draft + published rows via the existing owner-only policy
  while anon only ever sees published ones.
*/

ALTER TABLE staff_announcements_portal123
  ADD COLUMN IF NOT EXISTS happening_type text NOT NULL DEFAULT 'announcement'
    CHECK (happening_type IN ('event', 'class', 'announcement', 'general')),
  ADD COLUMN IF NOT EXISTS link text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS end_time text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS published_at timestamptz,
  ADD COLUMN IF NOT EXISTS signup_mode text NOT NULL DEFAULT 'none'
    CHECK (signup_mode IN ('none', 'online', 'sheet', 'both')),
  ADD COLUMN IF NOT EXISTS signup_sheet_config jsonb,
  ADD COLUMN IF NOT EXISTS legacy_source_table text,
  ADD COLUMN IF NOT EXISTS legacy_source_id uuid;

-- Provenance breadcrumb for rows copied in from events_portal123/
-- classes_portal123, and an idempotency guard for that one-time copy.
CREATE UNIQUE INDEX IF NOT EXISTS idx_staff_announcements_legacy_source
  ON staff_announcements_portal123(legacy_source_table, legacy_source_id)
  WHERE legacy_source_table IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_staff_announcements_published
  ON staff_announcements_portal123(is_published) WHERE is_published = true;

CREATE POLICY "Anyone can view published happenings"
  ON staff_announcements_portal123 FOR SELECT
  TO anon
  USING (is_published = true);
