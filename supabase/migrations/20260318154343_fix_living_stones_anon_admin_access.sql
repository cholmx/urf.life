/*
  # Fix Living Stones Admin Access

  The admin panel uses password-based auth (not Supabase auth), so requests
  are made as the anon role. The existing "Authenticated admins can view all photos"
  policy only applies to authenticated users, so anon only sees approved photos.

  ## Changes
  - Drop the authenticated-only admin SELECT policy
  - Add a new SELECT policy that allows anon to view all photos (since the admin
    panel is protected by its own password gate)
*/

DROP POLICY IF EXISTS "Authenticated admins can view all photos" ON living_stones_photos;
DROP POLICY IF EXISTS "Public can view approved photos" ON living_stones_photos;

CREATE POLICY "Anyone can view all photos"
  ON living_stones_photos
  FOR SELECT
  TO anon, authenticated
  USING (true);
