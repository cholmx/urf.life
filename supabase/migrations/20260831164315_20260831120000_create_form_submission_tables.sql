/*
  # Create form submission tables

  ## Problem
  Contact, Join Realm (membership), Table Group, and Overflow signup forms
  only ever sent an email (via Formspree) - three of the four also faked a
  "stored" copy in the *visitor's own browser* localStorage, which is
  useless to the church (gone when the tab closes, never visible to anyone
  but that one visitor). There is no record of these submissions anywhere
  the church can actually see, and no way to recover one if the email is
  missed or lands in spam.

  ## What this does
  Creates one table per form, matching the data each form already collects.
  RLS is the opposite shape from the CMS content tables: anyone (anon) can
  INSERT (these are public forms), but only an authenticated admin session
  can SELECT/UPDATE/DELETE - this is visitor-submitted PII (address, phone,
  birthday), not public content, so it must not be publicly readable.

  An `archived` flag lets the admin inbox hide submissions once handled
  without deleting the record.
*/

CREATE TABLE IF NOT EXISTS contact_messages_portal123 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text,
  message text NOT NULL,
  archived boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS realm_signups_portal123 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  zip_code text,
  country text,
  birthday date,
  marital_status text,
  anniversary date,
  archived boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS table_group_signups_portal123 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  party_size integer,
  unavailable_days jsonb DEFAULT '[]'::jsonb,
  archived boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS overflow_signups_portal123 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  email text,
  party_size integer,
  selected_sundays jsonb DEFAULT '[]'::jsonb,
  archived boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_messages_portal123 ENABLE ROW LEVEL SECURITY;
ALTER TABLE realm_signups_portal123 ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_group_signups_portal123 ENABLE ROW LEVEL SECURITY;
ALTER TABLE overflow_signups_portal123 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a contact message"
  ON contact_messages_portal123 FOR INSERT
  TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can view contact messages"
  ON contact_messages_portal123 FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "Authenticated users can update contact messages"
  ON contact_messages_portal123 FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete contact messages"
  ON contact_messages_portal123 FOR DELETE
  TO authenticated USING (true);

CREATE POLICY "Anyone can submit a realm signup"
  ON realm_signups_portal123 FOR INSERT
  TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can view realm signups"
  ON realm_signups_portal123 FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "Authenticated users can update realm signups"
  ON realm_signups_portal123 FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete realm signups"
  ON realm_signups_portal123 FOR DELETE
  TO authenticated USING (true);

CREATE POLICY "Anyone can submit a table group signup"
  ON table_group_signups_portal123 FOR INSERT
  TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can view table group signups"
  ON table_group_signups_portal123 FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "Authenticated users can update table group signups"
  ON table_group_signups_portal123 FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete table group signups"
  ON table_group_signups_portal123 FOR DELETE
  TO authenticated USING (true);

CREATE POLICY "Anyone can submit an overflow signup"
  ON overflow_signups_portal123 FOR INSERT
  TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can view overflow signups"
  ON overflow_signups_portal123 FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "Authenticated users can update overflow signups"
  ON overflow_signups_portal123 FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete overflow signups"
  ON overflow_signups_portal123 FOR DELETE
  TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages_portal123(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_realm_signups_created_at ON realm_signups_portal123(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_table_group_signups_created_at ON table_group_signups_portal123(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_overflow_signups_created_at ON overflow_signups_portal123(created_at DESC);
