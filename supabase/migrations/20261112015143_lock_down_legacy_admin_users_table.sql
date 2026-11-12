/*
# Close Data API access to the legacy admin_users table

1. Security
- Revoke every privilege held by `anon` and `authenticated` on
  `public.admin_users`, which stores `password_hash`.
- Drop the permissive SELECT policy that returned those hashes to any
  signed-in session.

2. Notes
- No application code references this table (admin login authenticates against
  the ADMIN_PASSWORD edge function secret), so nothing breaks.
- No rows or columns are removed; the data is retained for the owner to review.
*/

DROP POLICY IF EXISTS "Authenticated users can read admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can read admin_users" ON public.admin_users;

DO $$
DECLARE pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies
             WHERE schemaname = 'public' AND tablename = 'admin_users'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.admin_users', pol.policyname);
  END LOOP;
END $$;

REVOKE ALL ON TABLE public.admin_users FROM anon;
REVOKE ALL ON TABLE public.admin_users FROM authenticated;

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
