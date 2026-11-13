/*
  # Real per-person login with role-based access

  ## Problem
  The admin area has no real user accounts - everyone who knows the one
  shared password becomes the exact same Supabase Auth user
  (admin@urf-life.internal, see the admin-login edge function). There's no
  way to tell who's actually logged in, give someone a narrower set of
  admin pages, or revoke just one person's access without changing the
  password for everyone.

  ## What this does
  Creates `staff_users_portal123`, a simple email -> role table (`admin`
  or `staff`). The app looks up the logged-in session's own email here to
  decide what they can see - a `staff` login is limited in the UI to a
  fixed set of admin sections; an `admin` login sees everything, same as
  today. Seeds the one real admin identity (chris@urfellowship.com) as an
  `admin` row.

  Row reads stay open to any authenticated session, matching how every
  other admin table in this app already works (this is internal staff
  tooling behind /admin, not public data) - the UI-level restriction is
  the actual access control for ordinary content, same tradeoff already
  made everywhere else in this schema.

  Writes to THIS table are the one exception: only chris@urfellowship.com
  may insert/update/delete a role row, enforced directly in these
  policies by literal email match rather than a self-referencing role
  lookup (this table has no existing-table precedent to extend, and
  letting any authenticated session write its own role here would let a
  `staff` login grant itself `admin`). The invite-staff edge function
  double-checks this same rule server-side before it ever reaches
  Postgres, using the service role - these policies are the backstop, not
  the only gate.
*/

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
