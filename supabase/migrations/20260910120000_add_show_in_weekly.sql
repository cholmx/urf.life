-- A fourth "Destination" toggle alongside show_on_slides/show_in_happenings/
-- monthly_include: whether an item is included on the printed Weekly
-- Bulletin. Previously the bulletin had no opt-out at all - it printed
-- every happening scheduled for that week - so this defaults to true to
-- preserve that behavior for existing rows and for anything saved before
-- staff notice the new checkbox.
alter table staff_announcements_portal123
  add column if not exists show_in_weekly boolean default true;
