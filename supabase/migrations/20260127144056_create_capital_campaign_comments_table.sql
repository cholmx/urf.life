/*
  # Create Capital Campaign Comments Table

  1. New Tables
    - `campaign_comments`
      - `id` (uuid, primary key) - Unique identifier for each comment
      - `campaign_update_id` (uuid, foreign key) - Links to the campaign update (nullable for general comments)
      - `author_name` (text) - Name of the person commenting
      - `author_email` (text) - Email of the person commenting
      - `comment_text` (text) - The actual comment or question
      - `is_approved` (boolean, default false) - Whether comment has been approved by admin
      - `admin_reply` (text, nullable) - Admin's response to the comment
      - `created_at` (timestamptz) - When the comment was submitted
      - `approved_at` (timestamptz, nullable) - When the comment was approved

  2. Security
    - Enable RLS on `campaign_comments` table
    - Anonymous users can insert comments (they start as pending)
    - Anonymous users can only view approved comments
    - Authenticated admins can view all comments
    - Authenticated admins can update comments (approve and reply)
    - Authenticated admins can delete comments
*/

CREATE TABLE IF NOT EXISTS campaign_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_update_id uuid REFERENCES campaign_updates(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  author_email text NOT NULL,
  comment_text text NOT NULL,
  is_approved boolean DEFAULT false,
  admin_reply text,
  created_at timestamptz DEFAULT now(),
  approved_at timestamptz
);

ALTER TABLE campaign_comments ENABLE ROW LEVEL SECURITY;

-- Anonymous users can insert comments (they start as unapproved)
CREATE POLICY "Anyone can submit comments"
  ON campaign_comments
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Anonymous users can only view approved comments
CREATE POLICY "Anyone can view approved comments"
  ON campaign_comments
  FOR SELECT
  TO anon
  USING (is_approved = true);

-- Authenticated users (admins) can view all comments
CREATE POLICY "Admins can view all comments"
  ON campaign_comments
  FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users (admins) can update comments to approve or reply
CREATE POLICY "Admins can update comments"
  ON campaign_comments
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Authenticated users (admins) can delete comments
CREATE POLICY "Admins can delete comments"
  ON campaign_comments
  FOR DELETE
  TO authenticated
  USING (true);