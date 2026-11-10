-- Tracks which occurrence date flyer_text (the shared description used in
-- the Happenings email, monthly flyer/bulletin, printed invites, and the
-- public Events/Classes pages) was last AI-generated for. Recurring items
-- only ever store their very first session in event_date, so a stored
-- date alone can't tell whether flyer_text's wording (e.g. "meets Sunday,
-- October 4") still matches the item's actual next occurrence or is
-- talking about a date that's already passed. AnnouncementForm compares
-- this against the live next-occurrence calculation to show a
-- regenerate-when-stale banner. Null for anything never AI-generated,
-- which just means no staleness check runs for it.
alter table staff_announcements_portal123
  add column if not exists flyer_text_date date;
