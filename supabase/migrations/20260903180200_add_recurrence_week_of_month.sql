-- Supports "monthly on a weekday position" recurrence (e.g. "the first
-- Sunday" or "the last Friday" of every month), alongside the existing
-- "monthly on the same date" behavior. Empty means date-based monthly;
-- one of first/second/third/fourth/last means weekday-position monthly,
-- with the weekday itself stored in the existing recurrence_day column.
alter table staff_announcements_portal123
  add column if not exists recurrence_week_of_month text default '';
