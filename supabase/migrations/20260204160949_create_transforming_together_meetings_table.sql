/*
  # Create Transforming Together Meetings Table

  1. New Tables
    - `transforming_together_meetings`
      - `id` (uuid, primary key)
      - `name` (text) - Attendee name
      - `meeting_date` (text) - Meeting date (Friday, March 6 or Saturday, March 7)
      - `meeting_time` (text) - Meeting time (4pm, 5pm, 6pm, or 7pm)
      - `created_at` (timestamp) - When the signup was created
  
  2. Security
    - Enable RLS on `transforming_together_meetings` table
    - Add policy for anyone to insert (public signup)
    - Add policy for anyone to read (to check capacity)
    - Add policy for authenticated users to manage all records (admin)
*/

CREATE TABLE IF NOT EXISTS transforming_together_meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  meeting_date text NOT NULL,
  meeting_time text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transforming_together_meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can sign up for meetings"
  ON transforming_together_meetings
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can view meeting signups count"
  ON transforming_together_meetings
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete meeting signups"
  ON transforming_together_meetings
  FOR DELETE
  TO authenticated
  USING (true);