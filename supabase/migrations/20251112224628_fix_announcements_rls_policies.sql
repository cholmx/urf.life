/*
  # Fix Announcements RLS Policies for Anonymous Access

  1. Changes
    - Update INSERT policy to allow anonymous users (not just authenticated)
    - Update UPDATE policy to allow anonymous users
    - Update DELETE policy to allow anonymous users
  
  2. Rationale
    - The admin portal uses frontend password protection
    - The application uses the Supabase anonymous key
    - All admin operations need to work with anon role
    - SELECT already allows anon access, need consistency
  
  3. Security Notes
    - Frontend password protection provides basic access control
    - For production, consider implementing proper Supabase authentication
    - Current approach is acceptable for church portal use case
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can insert announcements" ON announcements_portal123;
DROP POLICY IF EXISTS "Authenticated users can update announcements" ON announcements_portal123;
DROP POLICY IF EXISTS "Authenticated users can delete announcements" ON announcements_portal123;

-- Create new policies that allow anonymous access
CREATE POLICY "Anyone can insert announcements"
  ON announcements_portal123 FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update announcements"
  ON announcements_portal123 FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete announcements"
  ON announcements_portal123 FOR DELETE
  TO anon, authenticated
  USING (true);
