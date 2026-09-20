/*
# Allow public read of happenings scripts

1. Security Changes
   - Adds a SELECT policy on `staff_generated_scripts_portal123` allowing the
     `anon` role to read rows where `type = 'happenings'`. This makes the
     happenings script publicly viewable without authentication, while all
     other script types remain restricted to their authenticated owner.
   - The existing authenticated-only SELECT policy is kept unchanged.
2. Notes
   - Drops the policy first if it already exists, making the migration
     idempotent.
*/

DROP POLICY IF EXISTS "Public can view the happenings script" ON staff_generated_scripts_portal123;

CREATE POLICY "Public can view the happenings script"
  ON staff_generated_scripts_portal123 FOR SELECT
  TO anon USING (type = 'happenings');