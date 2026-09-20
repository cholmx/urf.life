/*
  # Create online RSVP submissions table for Happenings

  ## Problem
  A Happening with signup_mode 'online' or 'both' needs a place for
  visitors to submit their info directly, with a live list/count visible
  to staff - following the same public-INSERT/admin-only-read shape as
  contact_messages_portal123 / table_group_signups_portal123.

  ## What this does
  Creates happening_rsvps_portal123, one row per RSVP, linked to its
  Happening by happening_id. The INSERT policy is stricter than this
  project's usual "WITH CHECK (true)" on public-form tables: it also
  confirms the target row is actually published and actually accepting
  online RSVPs, so a visitor can't submit an RSVP against a draft or
  sheet-only Happening by guessing its id.
*/

CREATE TABLE IF NOT EXISTS happening_rsvps_portal123 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  happening_id uuid NOT NULL REFERENCES staff_announcements_portal123(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  phone text,
  party_size integer,
  notes text,
  archived boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE happening_rsvps_portal123 ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit an RSVP for a published, open happening" ON happening_rsvps_portal123;
CREATE POLICY "Anyone can submit an RSVP for a published, open happening"
  ON happening_rsvps_portal123 FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff_announcements_portal123 s
      WHERE s.id = happening_id
        AND s.is_published = true
        AND s.signup_mode IN ('online', 'both')
    )
  );

DROP POLICY IF EXISTS "Authenticated users can view happening rsvps" ON happening_rsvps_portal123;
CREATE POLICY "Authenticated users can view happening rsvps"
  ON happening_rsvps_portal123 FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Authenticated users can update happening rsvps" ON happening_rsvps_portal123;
CREATE POLICY "Authenticated users can update happening rsvps"
  ON happening_rsvps_portal123 FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated users can delete happening rsvps" ON happening_rsvps_portal123;
CREATE POLICY "Authenticated users can delete happening rsvps"
  ON happening_rsvps_portal123 FOR DELETE TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_happening_rsvps_happening_id ON happening_rsvps_portal123(happening_id);
CREATE INDEX IF NOT EXISTS idx_happening_rsvps_created_at ON happening_rsvps_portal123(created_at DESC);
