/*
  # Make the weekly "Happenings" script publicly readable

  The public site's "/announcements" page (now branded "The Happenings")
  shows the single AI-assembled weekly script staff write in the
  Communication Organizer, instead of a list of individual published
  happenings. `staff_generated_scripts_portal123` was originally created
  as 100% internal planning material with no anon access at all - this
  adds a narrow anon SELECT policy scoped to `type = 'happenings'` only,
  so the backstage "stage" (announcer) script stays private while the
  happenings script becomes public. Postgres OR-combines permissive
  policies, so staff keep full CRUD on their own rows via the existing
  authenticated-only policies.
*/

CREATE POLICY "Public can view the happenings script"
  ON staff_generated_scripts_portal123 FOR SELECT
  TO anon USING (type = 'happenings');
