/*
  # Lock down write access to authenticated admin sessions only

  ## Problem
  Nearly every content table's INSERT/UPDATE/DELETE policies grant access to
  the `anon` role — the public API key shipped in the site's JS bundle. In
  practice this means anyone who opens the browser console on the live site
  can write, edit, or delete announcements, sermons, events, devotionals,
  resources, ministries, staff contacts, and everything else, regardless of
  the admin password screen (which only ever ran in client-side JS and never
  restricted actual database access).

  The admin panel now authenticates through a real Supabase Auth session
  (see the `admin-login` edge function), so write policies can finally
  require `authenticated` instead of `anon`.

  ## What this does
  Dynamically finds every existing INSERT/UPDATE/DELETE policy on `public`
  schema tables that currently grants access to `anon`, and recreates it
  scoped to `authenticated` only — preserving the original policy name and
  per-command USING/WITH CHECK shape. SELECT (read) policies are left
  completely untouched, so public pages keep working exactly as before.

  ## Exception
  `living_stones_photos` INSERT stays open to `anon`: it's a genuine
  visitor-facing feature (church members uploading their own photos without
  logging in). Its UPDATE/DELETE (moderation) is tightened like everything
  else.
*/

DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT schemaname, tablename, policyname, cmd
    FROM pg_policies
    WHERE schemaname = 'public'
      AND cmd IN ('INSERT', 'UPDATE', 'DELETE')
      AND 'anon' = ANY (roles)
      AND NOT (tablename = 'living_stones_photos' AND cmd = 'INSERT')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);

    IF pol.cmd = 'INSERT' THEN
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (true)',
        pol.policyname, pol.tablename
      );
    ELSIF pol.cmd = 'UPDATE' THEN
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (true) WITH CHECK (true)',
        pol.policyname, pol.tablename
      );
    ELSIF pol.cmd = 'DELETE' THEN
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (true)',
        pol.policyname, pol.tablename
      );
    END IF;
  END LOOP;
END $$;
