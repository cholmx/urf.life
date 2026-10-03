/*
  # Create facility rental requests table

  ## Problem
  The /rental page's Facilities Use Request form (event details, room/
  service selection, pricing, and the responsible person's signed
  agreement) currently has nowhere to go - this stores it.

  ## What this does
  Creates facility_rental_requests_portal123, one row per submission, with
  the same RLS shape as the other public-form tables (contact_messages,
  realm_signups, table_group_signups): anyone can INSERT (it's a public
  form), only an authenticated admin session can SELECT/UPDATE/DELETE,
  since this carries a renter's contact info and mailing address.

  rooms_requested and additional_services are text[] rather than their own
  join tables - a fixed, small set of options (5 rooms, 3 services), never
  queried by individual value, just displayed back whole on the admin side.

  calculated_total is stored (not just computed client-side) so staff
  reviewing a request don't have to re-derive it by hand, and so a later
  change to the pricing logic doesn't retroactively change what an old
  request appears to owe.
*/

CREATE TABLE IF NOT EXISTS facility_rental_requests_portal123 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Event Information
  event_type text NOT NULL CHECK (event_type IN ('personal', 'community')),
  organization_name text,
  event_name text NOT NULL,
  purpose text NOT NULL,
  guest_count integer NOT NULL,
  event_date date NOT NULL,
  event_start_time text NOT NULL,
  event_end_time text NOT NULL,
  setup_schedule text NOT NULL CHECK (setup_schedule IN ('day_of', 'day_before')),
  setup_arrival_time text NOT NULL,
  setup_departure_time text NOT NULL,

  -- Pricing & Rooms
  is_member boolean NOT NULL,
  rooms_requested text[] NOT NULL DEFAULT '{}',
  additional_services text[] NOT NULL DEFAULT '{}',
  calculated_total numeric NOT NULL DEFAULT 0,

  -- Responsible Person / Agreement
  responsible_first_name text NOT NULL,
  responsible_last_name text NOT NULL,
  responsible_email text NOT NULL,
  responsible_phone text NOT NULL,
  return_address text NOT NULL,
  signature_name text NOT NULL,
  signature_date date NOT NULL,
  agreed_to_terms boolean NOT NULL DEFAULT false,

  archived boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE facility_rental_requests_portal123 ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit a facility rental request" ON facility_rental_requests_portal123;
CREATE POLICY "Anyone can submit a facility rental request"
  ON facility_rental_requests_portal123 FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated users can view facility rental requests" ON facility_rental_requests_portal123;
CREATE POLICY "Authenticated users can view facility rental requests"
  ON facility_rental_requests_portal123 FOR SELECT
  TO authenticated USING (true);
DROP POLICY IF EXISTS "Authenticated users can update facility rental requests" ON facility_rental_requests_portal123;
CREATE POLICY "Authenticated users can update facility rental requests"
  ON facility_rental_requests_portal123 FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated users can delete facility rental requests" ON facility_rental_requests_portal123;
CREATE POLICY "Authenticated users can delete facility rental requests"
  ON facility_rental_requests_portal123 FOR DELETE
  TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_facility_rental_requests_created_at ON facility_rental_requests_portal123(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_facility_rental_requests_event_date ON facility_rental_requests_portal123(event_date);
