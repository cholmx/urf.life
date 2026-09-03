/*
  # Update Church Portal Tables Schema

  1. Changes
    - Update events_portal123 table to match old schema (details, link instead of description, event_date, location)
    - Update resources_portal123 table to match old schema (add author, category_id columns, remove updated_at)

  2. Notes
    - These changes align the new database with the existing data structure from the old database
*/

-- Update events table structure
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events_portal123' AND column_name = 'description'
  ) THEN
    ALTER TABLE events_portal123 DROP COLUMN description;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events_portal123' AND column_name = 'event_date'
  ) THEN
    ALTER TABLE events_portal123 DROP COLUMN event_date;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events_portal123' AND column_name = 'location'
  ) THEN
    ALTER TABLE events_portal123 DROP COLUMN location;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events_portal123' AND column_name = 'details'
  ) THEN
    ALTER TABLE events_portal123 ADD COLUMN details text DEFAULT '';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events_portal123' AND column_name = 'link'
  ) THEN
    ALTER TABLE events_portal123 ADD COLUMN link text DEFAULT '';
  END IF;
END $$;

-- Update resources table structure
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'resources_portal123' AND column_name = 'author'
  ) THEN
    ALTER TABLE resources_portal123 ADD COLUMN author text DEFAULT '';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'resources_portal123' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE resources_portal123 ADD COLUMN category_id uuid;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'resources_portal123' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE resources_portal123 DROP COLUMN updated_at;
  END IF;
END $$;