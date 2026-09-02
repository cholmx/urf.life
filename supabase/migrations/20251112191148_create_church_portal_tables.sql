/*
  # Create Church Portal Database Schema

  1. New Tables
    - `announcements_portal123`
      - `id` (uuid, primary key)
      - `title` (text)
      - `content` (text)
      - `author` (text)
      - `announcement_date` (date)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `sermon_series_portal123`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `start_date` (date)
      - `end_date` (date)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `sermons_portal123`
      - `id` (uuid, primary key)
      - `title` (text)
      - `speaker` (text)
      - `sermon_date` (date)
      - `youtube_url` (text)
      - `summary` (text)
      - `discussion_questions` (text)
      - `sermon_series_id` (uuid, foreign key)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `events_portal123`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `event_date` (date)
      - `location` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `classes_portal123`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `start_date` (date)
      - `instructor` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `resources_portal123`
      - `id` (uuid, primary key)
      - `title` (text)
      - `amazon_link` (text)
      - `description` (text)
      - `image_url` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `daily_scriptures_portal123`
      - `id` (uuid, primary key)
      - `verse_text` (text)
      - `reference` (text)
      - `notes` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `daily_devotionals_portal123`
      - `id` (uuid, primary key)
      - `title` (text)
      - `content` (text)
      - `scripture_reference` (text)
      - `author` (text)
      - `devotional_date` (date)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access (church portal is public)
    - Add policies for authenticated admin access for inserts/updates/deletes
*/

-- Create announcements table
CREATE TABLE IF NOT EXISTS announcements_portal123 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text DEFAULT '',
  author text DEFAULT '',
  announcement_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE announcements_portal123 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view announcements"
  ON announcements_portal123 FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert announcements"
  ON announcements_portal123 FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update announcements"
  ON announcements_portal123 FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete announcements"
  ON announcements_portal123 FOR DELETE
  TO authenticated
  USING (true);

-- Create sermon_series table
CREATE TABLE IF NOT EXISTS sermon_series_portal123 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  start_date date DEFAULT CURRENT_DATE,
  end_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE sermon_series_portal123 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view sermon series"
  ON sermon_series_portal123 FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert sermon series"
  ON sermon_series_portal123 FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update sermon series"
  ON sermon_series_portal123 FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete sermon series"
  ON sermon_series_portal123 FOR DELETE
  TO authenticated
  USING (true);

-- Create sermons table
CREATE TABLE IF NOT EXISTS sermons_portal123 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  speaker text DEFAULT '',
  sermon_date date DEFAULT CURRENT_DATE,
  youtube_url text DEFAULT '',
  summary text DEFAULT '',
  discussion_questions text DEFAULT '',
  sermon_series_id uuid REFERENCES sermon_series_portal123(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE sermons_portal123 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view sermons"
  ON sermons_portal123 FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert sermons"
  ON sermons_portal123 FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update sermons"
  ON sermons_portal123 FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete sermons"
  ON sermons_portal123 FOR DELETE
  TO authenticated
  USING (true);

-- Create events table
CREATE TABLE IF NOT EXISTS events_portal123 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  event_date date DEFAULT CURRENT_DATE,
  location text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE events_portal123 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view events"
  ON events_portal123 FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert events"
  ON events_portal123 FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update events"
  ON events_portal123 FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete events"
  ON events_portal123 FOR DELETE
  TO authenticated
  USING (true);

-- Create classes table
CREATE TABLE IF NOT EXISTS classes_portal123 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  start_date date DEFAULT CURRENT_DATE,
  instructor text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE classes_portal123 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view classes"
  ON classes_portal123 FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert classes"
  ON classes_portal123 FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update classes"
  ON classes_portal123 FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete classes"
  ON classes_portal123 FOR DELETE
  TO authenticated
  USING (true);

-- Create resources table
CREATE TABLE IF NOT EXISTS resources_portal123 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  amazon_link text DEFAULT '',
  description text DEFAULT '',
  image_url text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE resources_portal123 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view resources"
  ON resources_portal123 FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert resources"
  ON resources_portal123 FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update resources"
  ON resources_portal123 FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete resources"
  ON resources_portal123 FOR DELETE
  TO authenticated
  USING (true);

-- Create daily_scriptures table
CREATE TABLE IF NOT EXISTS daily_scriptures_portal123 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  verse_text text NOT NULL,
  reference text NOT NULL,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE daily_scriptures_portal123 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view daily scriptures"
  ON daily_scriptures_portal123 FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert daily scriptures"
  ON daily_scriptures_portal123 FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update daily scriptures"
  ON daily_scriptures_portal123 FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete daily scriptures"
  ON daily_scriptures_portal123 FOR DELETE
  TO authenticated
  USING (true);

-- Create daily_devotionals table
CREATE TABLE IF NOT EXISTS daily_devotionals_portal123 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text DEFAULT '',
  scripture_reference text DEFAULT '',
  author text DEFAULT '',
  devotional_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE daily_devotionals_portal123 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view daily devotionals"
  ON daily_devotionals_portal123 FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert daily devotionals"
  ON daily_devotionals_portal123 FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update daily devotionals"
  ON daily_devotionals_portal123 FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete daily devotionals"
  ON daily_devotionals_portal123 FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_announcements_date ON announcements_portal123(announcement_date DESC);
CREATE INDEX IF NOT EXISTS idx_sermons_date ON sermons_portal123(sermon_date DESC);
CREATE INDEX IF NOT EXISTS idx_sermons_series ON sermons_portal123(sermon_series_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events_portal123(event_date);
CREATE INDEX IF NOT EXISTS idx_classes_date ON classes_portal123(start_date);
CREATE INDEX IF NOT EXISTS idx_devotionals_date ON daily_devotionals_portal123(devotional_date DESC);