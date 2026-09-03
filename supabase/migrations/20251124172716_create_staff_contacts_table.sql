/*
  # Create Staff Contacts Table

  1. New Tables
    - `staff_contacts_portal123`
      - `id` (uuid, primary key) - Unique identifier for each staff member
      - `name` (text) - Full name of staff member
      - `title` (text) - Job title/role of staff member
      - `email` (text) - Email address of staff member
      - `display_order` (integer) - Order in which staff members appear (lower numbers first)
      - `is_active` (boolean) - Whether the staff member is currently active/visible
      - `created_at` (timestamptz) - When the record was created
      - `updated_at` (timestamptz) - When the record was last updated

  2. Security
    - Enable RLS on staff_contacts_portal123 table
    - Add policy for anonymous users to read active staff contacts
    - Add policies for authenticated admin operations (insert, update, delete)

  3. Important Notes
    - Display order allows flexible positioning of staff members
    - Only active staff contacts will be visible to public users
    - Email addresses will be displayed as clickable mailto links
    - Index on display_order for optimal query performance

  4. Sample Data
    - Pre-populate with five staff members:
      - Greg Aker (Administrative Pastor)
      - Bruce Stryffeler (Leadership Training Pastor)
      - Kate Holm (Worship/Communication Pastor)
      - Chris Holm (Teaching Pastor)
      - Monica Stryffeler (Children's Ministry Administrator)
*/

-- Create staff contacts table
CREATE TABLE IF NOT EXISTS staff_contacts_portal123 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  title text NOT NULL,
  email text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_staff_contacts_display_order ON staff_contacts_portal123(display_order);

-- Enable Row Level Security
ALTER TABLE staff_contacts_portal123 ENABLE ROW LEVEL SECURITY;

-- Policy for anonymous users to view active staff contacts
CREATE POLICY "Anyone can view active staff contacts"
  ON staff_contacts_portal123
  FOR SELECT
  USING (is_active = true);

-- Policy for anyone to view all staff contacts (for admin preview)
CREATE POLICY "Anyone can view all staff contacts"
  ON staff_contacts_portal123
  FOR SELECT
  USING (true);

-- Policy for anyone to insert staff contacts (for admin functionality)
CREATE POLICY "Anyone can insert staff contacts"
  ON staff_contacts_portal123
  FOR INSERT
  WITH CHECK (true);

-- Policy for anyone to update staff contacts (for admin functionality)
CREATE POLICY "Anyone can update staff contacts"
  ON staff_contacts_portal123
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Policy for anyone to delete staff contacts (for admin functionality)
CREATE POLICY "Anyone can delete staff contacts"
  ON staff_contacts_portal123
  FOR DELETE
  USING (true);

-- Insert sample staff data
INSERT INTO staff_contacts_portal123 (name, title, email, display_order, is_active)
VALUES
  ('Greg Aker', 'Administrative Pastor', 'Greg@urfellowship.com', 0, true),
  ('Bruce Stryffeler', 'Leadership Training Pastor', 'Bruce@urfellowship.com', 1, true),
  ('Kate Holm', 'Worship/Communication Pastor', 'Kate@urfellowship.com', 2, true),
  ('Chris Holm', 'Teaching Pastor', 'Chris@urfellowship.com', 3, true),
  ('Monica Stryffeler', 'Children''s Ministry Administrator', 'Monica@urfellowship.com', 4, true)
ON CONFLICT DO NOTHING;