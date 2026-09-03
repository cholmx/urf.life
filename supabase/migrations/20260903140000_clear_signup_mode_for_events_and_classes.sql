/*
  # Events and Classes sign up externally, not through this app

  Events and Classes register people through an outside service (Realm,
  etc.) via the happening's Link field - the built-in online RSVP /
  printable sign-up sheet picker is no longer offered for these two
  types in the Communication Organizer (it stays available for General/
  Announcement happenings, and Table Group sign-ups are a separate,
  unrelated system). This is the one-time catch-up for any Event/Class
  rows that already had a sign-up mode set before that change.
*/

UPDATE staff_announcements_portal123
SET signup_mode = 'none'
WHERE happening_type IN ('event', 'class')
  AND signup_mode <> 'none';
