/*
  # Add notes column to facility rental requests

  ## What this does
  Adds a nullable `notes` text column to facility_rental_requests_portal123
  so admin staff can record internal notes on a rental request (e.g.
  "Called back, confirmed for Saturday", "Needs follow-up on insurance").

  ## Changes
  - New column: notes (text, nullable) on facility_rental_requests_portal123
*/

ALTER TABLE facility_rental_requests_portal123 ADD COLUMN IF NOT EXISTS notes text;
