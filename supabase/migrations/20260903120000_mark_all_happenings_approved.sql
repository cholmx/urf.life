/*
  # Retire the draft/approved workflow status

  Draft vs. approved never gated anything - what actually controls where a
  happening shows up is show_on_slides/show_in_happenings/monthly_include/
  is_published, not status. It was pure administrative overhead (a badge,
  a filter, an extra click to "Approve"), so the app no longer surfaces it:
  new/edited happenings are now always saved as 'approved'. This is the
  one-time catch-up for rows that were still sitting in 'draft' from
  before that change, so nothing is left looking unapproved.
*/

UPDATE staff_announcements_portal123
SET status = 'approved'
WHERE status <> 'approved';
