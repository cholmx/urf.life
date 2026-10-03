/*
  # Create facility rental settings table

  ## Problem
  The send-rental-email edge function needs to know where to send the
  internal staff notification for a new rental request, and that address
  needs to be editable from /admin rather than hardcoded - whoever handles
  rentals may not be whoever last edited the code.

  ## What this does
  A single-row settings table (not a generic key/value settings table -
  there's only this one setting so far, and a dedicated table is simpler
  than building generic settings infrastructure nothing else needs yet).
  No anon access at all: this isn't a public form, and the edge function
  reads it with the service role key, which bypasses RLS entirely.
*/

CREATE TABLE IF NOT EXISTS facility_rental_settings_portal123 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_email text NOT NULL DEFAULT 'info@urfellowship.com',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE facility_rental_settings_portal123 ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view rental settings" ON facility_rental_settings_portal123;
CREATE POLICY "Authenticated users can view rental settings"
  ON facility_rental_settings_portal123 FOR SELECT
  TO authenticated USING (true);
DROP POLICY IF EXISTS "Authenticated users can update rental settings" ON facility_rental_settings_portal123;
CREATE POLICY "Authenticated users can update rental settings"
  ON facility_rental_settings_portal123 FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated users can insert rental settings" ON facility_rental_settings_portal123;
CREATE POLICY "Authenticated users can insert rental settings"
  ON facility_rental_settings_portal123 FOR INSERT
  TO authenticated WITH CHECK (true);

-- Seed the single settings row so the admin UI always has one to update
-- rather than needing insert-or-update logic.
INSERT INTO facility_rental_settings_portal123 (notification_email)
SELECT 'info@urfellowship.com'
WHERE NOT EXISTS (SELECT 1 FROM facility_rental_settings_portal123);
