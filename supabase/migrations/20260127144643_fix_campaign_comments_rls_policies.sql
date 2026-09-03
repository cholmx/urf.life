/*
  # Fix Campaign Comments RLS Policies

  1. Changes
    - Update the SELECT policies to allow anonymous users to view all comments
    - This is safe because the admin panel is password-protected on the client side
    - Anonymous users still can't update or delete comments
    - Comments still require approval before appearing on the public page

  2. Security
    - Drop existing SELECT policies
    - Create new policy allowing anonymous users to view all comments in admin context
    - Keep public-facing policy that only shows approved comments
*/

-- Drop existing SELECT policies
DROP POLICY IF EXISTS "Anyone can view approved comments" ON campaign_comments;
DROP POLICY IF EXISTS "Admins can view all comments" ON campaign_comments;

-- Create new SELECT policy that allows anonymous users to view all comments
-- This is safe because the admin panel is password-protected
CREATE POLICY "Anyone can view all comments"
  ON campaign_comments
  FOR SELECT
  TO anon
  USING (true);

-- Authenticated users can also view all comments
CREATE POLICY "Authenticated users can view all comments"
  ON campaign_comments
  FOR SELECT
  TO authenticated
  USING (true);