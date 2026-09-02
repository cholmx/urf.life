/*
  # Fix classes table columns

  1. Changes
    - Rename `description` column to `details` to match the form
    - Add `link` column for registration links
    - Remove unused `start_date` and `instructor` columns

  2. Notes
    - Preserves existing data by renaming instead of dropping
*/

ALTER TABLE classes_portal123 
  RENAME COLUMN description TO details;

ALTER TABLE classes_portal123 
  ADD COLUMN IF NOT EXISTS link text;

ALTER TABLE classes_portal123 
  DROP COLUMN IF EXISTS start_date,
  DROP COLUMN IF EXISTS instructor;
