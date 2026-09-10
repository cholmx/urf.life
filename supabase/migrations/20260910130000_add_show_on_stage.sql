-- A fifth "Destination" toggle: whether a Whole Church item is actually
-- read from the stage on Sunday. Previously scope = 'whole_church' alone
-- was enough - every whole-church item landed on the Stage Script with no
-- way to exclude one that's whole-church-relevant but not something the
-- pastor should read out loud (e.g. a slides/email-only notice). Defaults
-- to true to preserve that automatic behavior for existing rows; staff can
-- now uncheck it per item. isStageActive still also requires
-- scope = 'whole_church' - this narrows what that scope produces, it
-- doesn't replace it.
alter table staff_announcements_portal123
  add column if not exists show_on_stage boolean default true;
