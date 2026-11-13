DROP POLICY IF EXISTS "Authenticated users can view staff announcements" ON staff_announcements_portal123;
CREATE POLICY "Authenticated users can view staff announcements"
  ON staff_announcements_portal123 FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert staff announcements" ON staff_announcements_portal123;
CREATE POLICY "Authenticated users can insert staff announcements"
  ON staff_announcements_portal123 FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update staff announcements" ON staff_announcements_portal123;
CREATE POLICY "Authenticated users can update staff announcements"
  ON staff_announcements_portal123 FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete staff announcements" ON staff_announcements_portal123;
CREATE POLICY "Authenticated users can delete staff announcements"
  ON staff_announcements_portal123 FOR DELETE
  TO authenticated USING (true);

NOTIFY pgrst, 'reload schema';
