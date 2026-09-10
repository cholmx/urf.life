/*
# Add show_in_weekly column to staff_announcements_portal123

1. Modified Tables
   - `staff_announcements_portal123`: adds `show_in_weekly` boolean column,
     NOT NULL, defaulting to `true`. This controls whether an announcement
     appears in the weekly staff communication output, mirroring the existing
     `show_on_slides` and `show_in_happenings` toggles.
2. Security
   - No RLS policy changes. The column inherits the table's existing RLS
     policies.
3. Notes
   - Uses a DO $$ block to conditionally add the column only if it does not
     already exist, making the migration safe to re-run.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'staff_announcements_portal123'
      AND column_name = 'show_in_weekly'
  ) THEN
    ALTER TABLE staff_announcements_portal123
      ADD COLUMN show_in_weekly boolean NOT NULL DEFAULT true;
  END IF;
END $$;