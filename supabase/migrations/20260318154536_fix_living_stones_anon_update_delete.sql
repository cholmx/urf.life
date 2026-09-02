/*
  # Fix Living Stones Anon Update and Delete Access

  The admin panel uses password-based auth (not Supabase auth), so all requests
  run as the anon role. The UPDATE and DELETE policies were restricted to
  authenticated users only, preventing the admin from approving or deleting photos.

  ## Changes
  - Drop authenticated-only UPDATE and DELETE policies
  - Recreate them to also include the anon role
*/

DROP POLICY IF EXISTS "Authenticated admins can update photos" ON living_stones_photos;
DROP POLICY IF EXISTS "Authenticated admins can delete photos" ON living_stones_photos;

CREATE POLICY "Admins can update photos"
  ON living_stones_photos
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can delete photos"
  ON living_stones_photos
  FOR DELETE
  TO anon, authenticated
  USING (true);
