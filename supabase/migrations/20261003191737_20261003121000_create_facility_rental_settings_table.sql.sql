/*
  # Create facility rental settings table

  ## Purpose
  Stores configuration for the facility rental feature, specifically the
  notification_email (or comma-separated list of emails) that the
  send-rental-email edge function reads to know which staff members should
  be notified when a new rental request is submitted.

  ## Table: facility_rental_settings_portal123
  - id (uuid, primary key)
  - notification_email (text, not null) — single email or comma-separated list
  - created_at (timestamptz, default now())
  - updated_at (timestamptz, default now())

  ## Seed
  Inserts one default row with notification_email set to the church info
  address so the system works out of the box. Admin staff can update this
  later through the Admin Rentals settings.

  ## Security
  - RLS enabled.
  - Only authenticated admin sessions can SELECT/INSERT/UPDATE/DELETE —
    this is internal configuration, not public data.
*/

CREATE TABLE IF NOT EXISTS facility_rental_settings_portal123 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_email text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE facility_rental_settings_portal123 ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view rental settings" ON facility_rental_settings_portal123;
CREATE POLICY "Authenticated users can view rental settings"
  ON facility_rental_settings_portal123 FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert rental settings" ON facility_rental_settings_portal123;
CREATE POLICY "Authenticated users can insert rental settings"
  ON facility_rental_settings_portal123 FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update rental settings" ON facility_rental_settings_portal123;
CREATE POLICY "Authenticated users can update rental settings"
  ON facility_rental_settings_portal123 FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete rental settings" ON facility_rental_settings_portal123;
CREATE POLICY "Authenticated users can delete rental settings"
  ON facility_rental_settings_portal123 FOR DELETE
  TO authenticated USING (true);

INSERT INTO facility_rental_settings_portal123 (notification_email)
SELECT 'info@urfellowship.com'
WHERE NOT EXISTS (SELECT 1 FROM facility_rental_settings_portal123);
