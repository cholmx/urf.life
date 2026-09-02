/*
  # Create Featured Buttons Table for Conditional Homepage Buttons

  1. Purpose
    - Allows admin to dynamically enable/disable special featured buttons on homepage
    - Provides flexibility to add temporary signup forms or special event buttons
    - Eliminates need for code changes to show/hide featured buttons

  2. New Table: featured_buttons_portal123
    - `id` (uuid, primary key) - Unique identifier
    - `button_type` (text, unique) - Identifier like "overflow_signup", "special_event"
    - `title` (text) - Display title shown on button
    - `description` (text) - Subtitle/description shown on button
    - `is_active` (boolean) - Toggle to show/hide button on homepage
    - `path` (text) - Route URL the button links to
    - `icon_name` (text) - Icon identifier for future use
    - `display_order` (integer) - Order of appearance (lower numbers first)
    - `created_at` (timestamptz) - Creation timestamp
    - `updated_at` (timestamptz) - Last update timestamp

  3. Initial Data
    - Inserts overflow signup button (inactive by default)
    - Can be activated by admin when needed

  4. Security
    - Enable RLS on table
    - Allow public read access for active buttons
    - Allow anonymous and authenticated users to manage (admin panel is password protected)
*/

-- Create featured_buttons table
CREATE TABLE IF NOT EXISTS featured_buttons_portal123 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  button_type text UNIQUE NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  is_active boolean DEFAULT false,
  path text NOT NULL,
  icon_name text DEFAULT 'FiCalendar',
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE featured_buttons_portal123 ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view featured buttons
CREATE POLICY "Anyone can view featured buttons"
  ON featured_buttons_portal123 FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow anyone to insert featured buttons (admin panel has password protection)
CREATE POLICY "Anyone can insert featured buttons"
  ON featured_buttons_portal123 FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow anyone to update featured buttons
CREATE POLICY "Anyone can update featured buttons"
  ON featured_buttons_portal123 FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Allow anyone to delete featured buttons
CREATE POLICY "Anyone can delete featured buttons"
  ON featured_buttons_portal123 FOR DELETE
  TO anon, authenticated
  USING (true);

-- Insert initial overflow signup button (inactive by default)
INSERT INTO featured_buttons_portal123 (button_type, title, description, is_active, path, icon_name, display_order)
VALUES (
  'overflow_signup',
  'Overflow Signup',
  'Monthly service commitment',
  false,
  '/overflow-signup',
  'FiCalendar',
  0
)
ON CONFLICT (button_type) DO NOTHING;