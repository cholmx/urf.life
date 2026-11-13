/*
  # Un-silo staff_announcements_portal123 from its original per-user design

  ## Problem
  staff_announcements_portal123's original RLS (from back when this table
  was first created, months before real per-person logins existed)
  scopes every operation to `auth.uid() = user_id` - "only see/edit rows
  you created". That was invisible while every admin login shared the
  exact same fake account (admin@urf-life.internal, one fixed uid), since
  every row's user_id always matched whoever was looking.

  Now that real per-person logins exist (see the staff_users_portal123
  migration), each person has their own distinct auth.uid() - and it
  doesn't match the user_id on any of the announcements/happenings
  created under the old shared account, or on ones a different staff
  member creates going forward. The admin Dashboard and the public
  Announcements/Happenings pages both went silently blank: not a data
  loss, PostgREST just returned zero rows because none of them matched
  the caller's own uid - no error, nothing to see on the frontend to
  explain why.

  ## Fix
  Replace the four `auth.uid() = user_id` policies with `true`, matching
  every other shared admin table in this schema (see e.g.
  happening_rsvps_portal123, or the explicit reasoning in the
  staff_users_portal123 migration) - this is internal staff tooling
  behind /admin, where anyone with access is meant to see and manage
  everything, not a per-user mailbox. The anon "Anyone can view published
  happenings" policy (is_published = true) is untouched - that one was
  never the problem and still correctly limits public visitors to
  published content only.

  staff_generated_scripts_portal123 has this exact same latent bug, but
  is left alone here on purpose - it also has a `UNIQUE (type, week_date,
  user_id)` constraint, so opening its RLS without also addressing that
  constraint could let multiple people's cached rows for the same week
  coexist where the app expects exactly one, which is a separate, riskier
  change than this one.
*/

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
