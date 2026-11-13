CREATE TABLE IF NOT EXISTS staff_users_portal123 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  role text NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
  invited_by text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE staff_users_portal123 ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view staff users" ON staff_users_portal123;
CREATE POLICY "Authenticated users can view staff users"
  ON staff_users_portal123 FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "Only the admin email can insert staff users" ON staff_users_portal123;
CREATE POLICY "Only the admin email can insert staff users"
  ON staff_users_portal123 FOR INSERT
  TO authenticated WITH CHECK ((auth.jwt() ->> 'email') = 'chris@urfellowship.com');

DROP POLICY IF EXISTS "Only the admin email can update staff users" ON staff_users_portal123;
CREATE POLICY "Only the admin email can update staff users"
  ON staff_users_portal123 FOR UPDATE
  TO authenticated USING ((auth.jwt() ->> 'email') = 'chris@urfellowship.com')
  WITH CHECK ((auth.jwt() ->> 'email') = 'chris@urfellowship.com');

DROP POLICY IF EXISTS "Only the admin email can delete staff users" ON staff_users_portal123;
CREATE POLICY "Only the admin email can delete staff users"
  ON staff_users_portal123 FOR DELETE
  TO authenticated USING ((auth.jwt() ->> 'email') = 'chris@urfellowship.com');

CREATE INDEX IF NOT EXISTS idx_staff_users_email ON staff_users_portal123(email);

INSERT INTO staff_users_portal123 (email, role)
VALUES ('chris@urfellowship.com', 'admin')
ON CONFLICT (email) DO UPDATE SET role = 'admin';

NOTIFY pgrst, 'reload schema';