/*
  # Create facility rental requests table

  ## Purpose
  The /rental public form lets visitors submit a facility rental request
  (event space, rooms, equipment, etc.). This table is the durable record
  of those submissions, visible to admin staff in the Admin dashboard under
  the Rentals tab. The send-rental-email edge function reads the
  notification_email from facility_rental_settings_portal123 and emails
  staff whenever a new row is inserted here.

  ## Table: facility_rental_requests_portal123
  - id (uuid, primary key)
  - requester_name (text, not null) — name of the person requesting the rental
  - requester_email (text, not null) — email to reply to
  - requester_phone (text) — optional phone number
  - organization (text) — optional organization name
  - event_type (text) — e.g. wedding, concert, meeting
  - event_title (text) — name/title of the event
  - event_description (text) — what the event is about
  - requested_dates (text) — free-text date/dates requested
  - expected_attendance (text) — estimated number of attendees
  - rooms_requested (text) — which rooms/facilities are needed
  - special_requirements (text) — A/V, catering, parking, etc.
  - status (text, default 'pending') — pending / approved / declined
  - archived (boolean, default false) — admin can archive handled requests
  - created_at (timestamptz, default now())

  ## Security
  - RLS enabled.
  - Anyone (anon) can INSERT — this is a public form.
  - Only authenticated admin sessions can SELECT/UPDATE/DELETE — this is
    visitor-submitted PII, not public content.
*/

CREATE TABLE IF NOT EXISTS facility_rental_requests_portal123 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_name text NOT NULL,
  requester_email text NOT NULL,
  requester_phone text,
  organization text,
  event_type text,
  event_title text,
  event_description text,
  requested_dates text,
  expected_attendance text,
  rooms_requested text,
  special_requirements text,
  status text NOT NULL DEFAULT 'pending',
  archived boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE facility_rental_requests_portal123 ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit a rental request" ON facility_rental_requests_portal123;
CREATE POLICY "Anyone can submit a rental request"
  ON facility_rental_requests_portal123 FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can view rental requests" ON facility_rental_requests_portal123;
CREATE POLICY "Authenticated users can view rental requests"
  ON facility_rental_requests_portal123 FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can update rental requests" ON facility_rental_requests_portal123;
CREATE POLICY "Authenticated users can update rental requests"
  ON facility_rental_requests_portal123 FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete rental requests" ON facility_rental_requests_portal123;
CREATE POLICY "Authenticated users can delete rental requests"
  ON facility_rental_requests_portal123 FOR DELETE
  TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_rental_requests_created_at ON facility_rental_requests_portal123(created_at DESC);
