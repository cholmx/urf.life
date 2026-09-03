/*
  # Create Capital Campaign Tables

  1. New Tables
    - `campaign_updates`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `content` (text, required)
      - `type` (text, either 'written' or 'video')
      - `video_url` (text, optional - for video updates)
      - `thumbnail_url` (text, optional)
      - `published` (boolean, default false)
      - `display_order` (integer, default 0)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `campaign_vision`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `content` (text, required)
      - `image_url` (text, optional)
      - `published` (boolean, default false)
      - `display_order` (integer, default 0)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `campaign_faqs`
      - `id` (uuid, primary key)
      - `question` (text, required)
      - `answer` (text, required)
      - `published` (boolean, default false)
      - `display_order` (integer, default 0)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for public SELECT access to published content
    - Restrict INSERT/UPDATE/DELETE to authenticated users only
*/

-- Create campaign_updates table
CREATE TABLE IF NOT EXISTS campaign_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  type text NOT NULL CHECK (type IN ('written', 'video')),
  video_url text,
  thumbnail_url text,
  published boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create campaign_vision table
CREATE TABLE IF NOT EXISTS campaign_vision (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  image_url text,
  published boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create campaign_faqs table
CREATE TABLE IF NOT EXISTS campaign_faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  published boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE campaign_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_vision ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_faqs ENABLE ROW LEVEL SECURITY;

-- Policies for campaign_updates
CREATE POLICY "Anyone can view published campaign updates"
  ON campaign_updates FOR SELECT
  USING (published = true);

CREATE POLICY "Authenticated users can view all campaign updates"
  ON campaign_updates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert campaign updates"
  ON campaign_updates FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update campaign updates"
  ON campaign_updates FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete campaign updates"
  ON campaign_updates FOR DELETE
  TO authenticated
  USING (true);

-- Policies for campaign_vision
CREATE POLICY "Anyone can view published campaign vision"
  ON campaign_vision FOR SELECT
  USING (published = true);

CREATE POLICY "Authenticated users can view all campaign vision"
  ON campaign_vision FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert campaign vision"
  ON campaign_vision FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update campaign vision"
  ON campaign_vision FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete campaign vision"
  ON campaign_vision FOR DELETE
  TO authenticated
  USING (true);

-- Policies for campaign_faqs
CREATE POLICY "Anyone can view published campaign FAQs"
  ON campaign_faqs FOR SELECT
  USING (published = true);

CREATE POLICY "Authenticated users can view all campaign FAQs"
  ON campaign_faqs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert campaign FAQs"
  ON campaign_faqs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update campaign FAQs"
  ON campaign_faqs FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete campaign FAQs"
  ON campaign_faqs FOR DELETE
  TO authenticated
  USING (true);