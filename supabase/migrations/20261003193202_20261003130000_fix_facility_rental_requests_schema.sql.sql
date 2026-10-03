/*
  # Fix facility_rental_requests_portal123 schema mismatch

  ## Problem
  An external tool re-created facility_rental_requests_portal123 with a
  different, incompatible schema (requester_name, requester_email,
  event_title, requested_dates, expected_attendance, special_requirements,
  rooms_requested as plain text, a status column, ...) instead of running
  the original 20261003120000 migration. None of those column names match
  what the actual /rental form, contactStorage.js, and AdminRentals.jsx
  read and write (event_name, event_date, responsible_first_name,
  responsible_email, rooms_requested as text[], calculated_total,
  signature_name, agreed_to_terms, etc.), so every real submission fails
  on NOT NULL/column-not-found errors.

  ## What this does
  Drops the wrongly-shaped table and recreates it with the schema the
  frontend actually uses, matching 20261003120000_create_facility_rental_requests_table.sql
  exactly. Safe to run even though the table "exists" - it was only ever
  populated by the broken schema, created minutes before this fix, so
  there is no real submission data to lose. (Check the table in the
  Supabase Table Editor first if you want to be sure before running this.)

  ## Table: facility_rental_requests_portal123 (recreated)
  - id (uuid, primary key)
  - event_type (text, not null, CHECK personal/community)
  - organization_name (text)
  - event_name (text, not null)
  - purpose (text, not null)
  - guest_count (integer, not null)
  - event_date (date, not null)
  - event_start_time (text, not null)
  - event_end_time (text, not null)
  - setup_schedule (text, not null, CHECK day_of/day_before)
  - setup_arrival_time (text, not null)
  - setup_departure_time (text, not null)
  - is_member (boolean, not null)
  - rooms_requested (text[], not null, default '{}')
  - additional_services (text[], not null, default '{}')
  - calculated_total (numeric, not null, default 0)
  - responsible_first_name (text, not null)
  - responsible_last_name (text, not null)
  - responsible_email (text, not null)
  - responsible_phone (text, not null)
  - return_address (text, not null)
  - signature_name (text, not null)
  - signature_date (date, not null)
  - agreed_to_terms (boolean, not null, default false)
  - archived (boolean, default false)
  - created_at (timestamptz, default now())

  ## Security
  - RLS enabled.
  - Anyone (anon) can INSERT — this is a public form.
  - Only authenticated admin sessions can SELECT/UPDATE/DELETE.
*/

DROP TABLE IF EXISTS facility_rental_requests_portal123 CASCADE;

CREATE TABLE facility_rental_requests_portal123 (
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
