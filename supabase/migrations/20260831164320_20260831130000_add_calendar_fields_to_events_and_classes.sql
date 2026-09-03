/*
  # Add optional structured date/time fields for calendar export

  ## Problem
  events_portal123 and classes_portal123 both used to have a structured
  date column (event_date / start_date) plus a location column, but earlier
  migrations dropped them in favor of putting everything - including the
  date, time, and location - into a single free-text `details` rich-text
  field. That works fine for display, but there's no way to generate an
  "Add to Calendar" (.ics) link without a real date to build it from.

  ## What this does
  Adds event_date/start_time/end_time/location back as nullable columns on
  both tables - nullable and with no default, unlike the original columns,
  so existing rows (and any admin who doesn't need calendar export) are
  completely unaffected. The "Add to Calendar" button only appears once an
  admin explicitly fills in a date for a given event or class.
*/

ALTER TABLE events_portal123
  ADD COLUMN IF NOT EXISTS event_date date,
  ADD COLUMN IF NOT EXISTS start_time time,
  ADD COLUMN IF NOT EXISTS end_time time,
  ADD COLUMN IF NOT EXISTS location text;

ALTER TABLE classes_portal123
  ADD COLUMN IF NOT EXISTS start_date date,
  ADD COLUMN IF NOT EXISTS start_time time,
  ADD COLUMN IF NOT EXISTS end_time time,
  ADD COLUMN IF NOT EXISTS location text;
