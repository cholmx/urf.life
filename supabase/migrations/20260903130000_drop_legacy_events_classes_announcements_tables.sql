/*
  # Drop the retired events/classes/announcements tables

  events_portal123, classes_portal123, and announcements_portal123 were
  superseded by staff_announcements_portal123 (the Communication
  Organizer's unified "Happening" table) - every row that was ever in
  them was copied forward by the 20260901162000 migration, and nothing in
  the app has read or written to any of the three since (confirmed: the
  admin panels that wrote to them were deleted, and the last public reads
  - ClassRegistration/EventRegistration/Home's tile check/site search -
  were repointed to staff_announcements_portal123). Kept around this long
  only as a rollback safety net; that window has passed.
*/

DROP TABLE IF EXISTS announcements_portal123;
DROP TABLE IF EXISTS events_portal123;
DROP TABLE IF EXISTS classes_portal123;
