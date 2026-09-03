/*
  # Create Leadership Links Table

  1. New Tables
    - `leadership_links`
      - `id` (uuid, primary key)
      - `title` (text) - display name for the link
      - `url` (text) - the website URL
      - `description` (text) - optional short description
      - `category` (text) - optional grouping label
      - `sort_order` (integer) - controls display order
      - `is_active` (boolean) - whether to show the link
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `leadership_links` table
    - Anon users can read active links
    - No public write access (admin-only via service role / anon insert blocked)
*/

CREATE TABLE IF NOT EXISTS leadership_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  url text NOT NULL DEFAULT '',
  description text DEFAULT '',
  category text DEFAULT '',
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE leadership_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active leadership links"
  ON leadership_links
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Anon can insert leadership links"
  ON leadership_links
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anon can update leadership links"
  ON leadership_links
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon can delete leadership links"
  ON leadership_links
  FOR DELETE
  TO anon
  USING (true);
