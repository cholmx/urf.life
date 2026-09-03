/*
  # Create staff communications (Announcement Organizer) tables

  ## Problem
  The church runs a separate internal tool (URFCommunication) for staff to
  plan announcements across Sunday slides, the stage script, the weekly
  "Happenings" email, and the monthly flyer. It has its own React app and
  its own Supabase project. This migration brings its schema into this
  project so the tool can be ported in as a new tab in /admin instead of
  living as a separate app with its own login.

  ## What this does
  Creates `staff_announcements_portal123` (the ported `announcements` table)
  and `staff_generated_scripts_portal123` (the ported `generated_scripts`
  table, which caches AI-generated stage/happenings scripts so they aren't
  regenerated on every view). The `_portal123` suffix matches this project's
  existing table naming convention; the `staff_` prefix and distinct names
  avoid any collision with the site's own public `announcements_portal123`
  table, which is a completely different, publicly-readable table.

  This data is 100% internal planning material - never shown to site
  visitors - so unlike the site's public content tables, RLS here grants
  no anon access at all, not even SELECT. Every row is owned by the
  authenticated admin session (auth.uid() = user_id), matching this site's
  single shared admin account, exactly as the original app's RLS did.

  ## Notes
  - The original app also had an `events` table, but its own later migration
    ("the events table remains but is no longer used by the frontend")
    confirms it was dead code - it is intentionally not ported here.
  - Starting fresh, no data migration from the original app's database.
*/

CREATE OR REPLACE FUNCTION staff_comms_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS staff_announcements_portal123 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  short_version text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'General Info',
  scope text NOT NULL DEFAULT 'ministry',
  ministry text,
  event_date date,
  event_dates text[] NOT NULL DEFAULT '{}',
  event_time text DEFAULT '',
  event_location text NOT NULL DEFAULT '',
  is_recurring boolean NOT NULL DEFAULT false,
  recurrence_type text NOT NULL DEFAULT 'one_time',
  recurrence_day text DEFAULT '',
  recurrence_end_date date,
  recurrence_label text DEFAULT '',
  slides_lead_weeks integer NOT NULL DEFAULT 3,
  happenings_start_date date,
  happenings_end_date date,
  monthly_include boolean NOT NULL DEFAULT false,
  show_on_slides boolean NOT NULL DEFAULT true,
  show_in_happenings boolean NOT NULL DEFAULT true,
  contact_name text NOT NULL DEFAULT '',
  contact_info text NOT NULL DEFAULT '',
  slide_override text NOT NULL DEFAULT '',
  month_override text NOT NULL DEFAULT '',
  flyer_text text,
  stage_notes text NOT NULL DEFAULT '',
  slide_made boolean NOT NULL DEFAULT false,
  needs_signup boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'ready', 'approved')),
  assigned_to text,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE staff_announcements_portal123 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view staff announcements"
  ON staff_announcements_portal123 FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can insert staff announcements"
  ON staff_announcements_portal123 FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated users can update staff announcements"
  ON staff_announcements_portal123 FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated users can delete staff announcements"
  ON staff_announcements_portal123 FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER staff_announcements_updated_at
  BEFORE UPDATE ON staff_announcements_portal123
  FOR EACH ROW EXECUTE FUNCTION staff_comms_set_updated_at();

CREATE INDEX IF NOT EXISTS idx_staff_announcements_created_at ON staff_announcements_portal123(created_at DESC);

CREATE TABLE IF NOT EXISTS staff_generated_scripts_portal123 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('happenings', 'stage')),
  week_date date NOT NULL,
  content text NOT NULL DEFAULT '',
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (type, week_date, user_id)
);

ALTER TABLE staff_generated_scripts_portal123 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view staff generated scripts"
  ON staff_generated_scripts_portal123 FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can insert staff generated scripts"
  ON staff_generated_scripts_portal123 FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated users can update staff generated scripts"
  ON staff_generated_scripts_portal123 FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated users can delete staff generated scripts"
  ON staff_generated_scripts_portal123 FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER staff_generated_scripts_updated_at
  BEFORE UPDATE ON staff_generated_scripts_portal123
  FOR EACH ROW EXECUTE FUNCTION staff_comms_set_updated_at();
