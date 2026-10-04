/*
  # Add staff notes to facility rental requests

  ## Problem
  Staff reviewing a rental request in /admin have nowhere to jot internal
  notes (deposit received, coordinator assigned, special instructions)
  that aren't part of the renter's own submission.

  ## What this does
  Adds a single nullable notes column to facility_rental_requests_portal123.
  No RLS policy changes needed - it's covered by the existing
  authenticated-only UPDATE policy on this table.
*/

ALTER TABLE facility_rental_requests_portal123 ADD COLUMN IF NOT EXISTS notes text;
