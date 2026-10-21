/*
  # Clear stale leftover content from The Happenings' old "built script" rows

  ## Problem
  staff_generated_scripts_portal123 rows with type='happenings' used to
  store the full assembled-and-edited announcement script from the old
  "Build Script" workflow (one row per week, keyed by week_date = the
  exact day staff clicked Build). That workflow was replaced with an
  always-live list plus a separate, short "Weekly Note" field - but the
  new code reads that same column, just interpreting it as the note
  instead. Any week that already had a built script (most plausibly
  built on a Sunday, matching this week's Sunday key) now has that old,
  frozen multi-section HTML rendered as if it were a note - showing up
  on the public page above the live list, and in admin's Weekly Note
  editor, with no corresponding row in the announcements list since it
  isn't tied to live data anymore.

  ## What this does
  Clears content back to '' for every existing type='happenings' row.
  Under the new model that's exactly what "no note written yet" looks
  like, and this ships immediately after the rework landed, so there's
  effectively no real note yet to lose. type='stage' rows (a different,
  still-valid use of this same table) are untouched.
*/

UPDATE staff_generated_scripts_portal123
SET content = '', updated_at = now()
WHERE type = 'happenings' AND content <> '';
