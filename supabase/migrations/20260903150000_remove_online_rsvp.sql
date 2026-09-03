/*
  # Remove online RSVP entirely

  Online RSVP (happening_rsvps_portal123, signup_mode 'online'/'both') was
  built but never actually wired up on the public site - no page ever
  rendered a form for it, so it's been dead code since it was added. The
  app no longer offers it as an option anywhere (Events/Classes point to
  an external link instead; General/Announcement happenings only offer
  the printable sign-up sheet). This drops the now-unused table and tightens
  signup_mode down to the two values still in use.
*/

-- Preserve intent where it can be mapped to something real: 'both' meant
-- online + sheet, so it becomes plain 'sheet'. Bare 'online' becomes
-- 'none' - it never had a working form to preserve.
UPDATE staff_announcements_portal123 SET signup_mode = 'sheet' WHERE signup_mode = 'both';
UPDATE staff_announcements_portal123 SET signup_mode = 'none' WHERE signup_mode = 'online';

ALTER TABLE staff_announcements_portal123
  DROP CONSTRAINT IF EXISTS staff_announcements_portal123_signup_mode_check;
ALTER TABLE staff_announcements_portal123
  ADD CONSTRAINT staff_announcements_portal123_signup_mode_check
  CHECK (signup_mode IN ('none', 'sheet'));

DROP TABLE IF EXISTS happening_rsvps_portal123;
