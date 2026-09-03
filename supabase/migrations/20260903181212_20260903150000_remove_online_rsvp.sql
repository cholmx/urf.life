UPDATE staff_announcements_portal123 SET signup_mode = 'sheet' WHERE signup_mode = 'both';
UPDATE staff_announcements_portal123 SET signup_mode = 'none' WHERE signup_mode = 'online';

ALTER TABLE staff_announcements_portal123
  DROP CONSTRAINT IF EXISTS staff_announcements_portal123_signup_mode_check;
ALTER TABLE staff_announcements_portal123
  ADD CONSTRAINT staff_announcements_portal123_signup_mode_check
  CHECK (signup_mode IN ('none', 'sheet'));

DROP TABLE IF EXISTS happening_rsvps_portal123;