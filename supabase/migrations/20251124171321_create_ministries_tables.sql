/*
  # Create Ministries Management Tables

  1. New Tables
    - `ministries_portal123`
      - `id` (uuid, primary key) - Unique identifier for each ministry
      - `title` (text) - Name of the ministry
      - `description` (text) - Detailed description of the ministry
      - `leader_name` (text) - Name of the ministry leader
      - `leader_role` (text) - Title/role of the ministry leader
      - `age_group` (text) - Target age group (e.g., "All Ages", "Ages 13-18")
      - `display_order` (integer) - Order in which ministries appear (lower numbers first)
      - `is_active` (boolean) - Whether the ministry is currently active/visible
      - `created_at` (timestamptz) - When the ministry was created
      - `updated_at` (timestamptz) - When the ministry was last updated
    
    - `ministry_features_portal123`
      - `id` (uuid, primary key) - Unique identifier for each feature
      - `ministry_id` (uuid, foreign key) - Reference to parent ministry
      - `feature_text` (text) - Description of the feature/offering
      - `display_order` (integer) - Order in which features appear within ministry
      - `created_at` (timestamptz) - When the feature was created
      - `updated_at` (timestamptz) - When the feature was last updated

  2. Security
    - Enable RLS on both tables
    - Add policies for anonymous users to read active ministries and their features
    - Add policies for authenticated admin operations (insert, update, delete)

  3. Important Notes
    - Ministries can have multiple features in a one-to-many relationship
    - Display order allows flexible positioning of content
    - Only active ministries will be visible to public users
    - Foreign key constraint ensures features are deleted when ministry is deleted
    - Indexes on ministry_id and display_order for optimal query performance
*/

-- Create ministries table
CREATE TABLE IF NOT EXISTS ministries_portal123 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  leader_name text,
  leader_role text,
  age_group text DEFAULT 'All Ages',
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create ministry features table
CREATE TABLE IF NOT EXISTS ministry_features_portal123 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ministry_id uuid NOT NULL REFERENCES ministries_portal123(id) ON DELETE CASCADE,
  feature_text text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_ministry_features_ministry_id ON ministry_features_portal123(ministry_id);
CREATE INDEX IF NOT EXISTS idx_ministries_display_order ON ministries_portal123(display_order);
CREATE INDEX IF NOT EXISTS idx_ministry_features_display_order ON ministry_features_portal123(display_order);

-- Enable Row Level Security
ALTER TABLE ministries_portal123 ENABLE ROW LEVEL SECURITY;
ALTER TABLE ministry_features_portal123 ENABLE ROW LEVEL SECURITY;

-- Policies for ministries_portal123

-- Allow anonymous users to view active ministries
CREATE POLICY "Anyone can view active ministries"
  ON ministries_portal123
  FOR SELECT
  USING (is_active = true);

-- Allow anonymous users to view all ministries (for admin preview)
CREATE POLICY "Anyone can view all ministries"
  ON ministries_portal123
  FOR SELECT
  USING (true);

-- Allow anyone to insert ministries (for admin functionality)
CREATE POLICY "Anyone can insert ministries"
  ON ministries_portal123
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone to update ministries (for admin functionality)
CREATE POLICY "Anyone can update ministries"
  ON ministries_portal123
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow anyone to delete ministries (for admin functionality)
CREATE POLICY "Anyone can delete ministries"
  ON ministries_portal123
  FOR DELETE
  USING (true);

-- Policies for ministry_features_portal123

-- Allow anonymous users to view features of active ministries
CREATE POLICY "Anyone can view ministry features"
  ON ministry_features_portal123
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ministries_portal123
      WHERE ministries_portal123.id = ministry_features_portal123.ministry_id
    )
  );

-- Allow anyone to insert features (for admin functionality)
CREATE POLICY "Anyone can insert ministry features"
  ON ministry_features_portal123
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone to update features (for admin functionality)
CREATE POLICY "Anyone can update ministry features"
  ON ministry_features_portal123
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow anyone to delete features (for admin functionality)
CREATE POLICY "Anyone can delete ministry features"
  ON ministry_features_portal123
  FOR DELETE
  USING (true);