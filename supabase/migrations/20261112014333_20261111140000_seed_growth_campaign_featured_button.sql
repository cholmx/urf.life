/*
  # Seed the Growth Campaign row in featured_buttons_portal123

  1. Purpose
    - AdminFeaturedButtons.jsx and Home.jsx already special-case a
      button_type = 'growth_campaign' row to let admins toggle the
      "Transforming Together Growth Campaign" homepage button on/off,
      but no migration ever inserted that row - so the toggle in the
      admin panel has had nothing to switch, and Home.jsx has been
      falling back to always showing the button.
    - This inserts that row so the existing toggle actually works.

  2. Data
    - title/description/path mirror the values Home.jsx has been
      hardcoding for this button, so turning it on changes nothing
      about what's shown.
    - is_active defaults to true, preserving today's always-shown
      behavior until an admin turns it off.
*/

INSERT INTO featured_buttons_portal123 (button_type, title, description, is_active, path, icon_name, display_order)
VALUES (
  'growth_campaign',
  'Transforming Together Growth Campaign',
  'Updates, vision, and ways to give and commit',
  true,
  '/capital-campaign',
  'FiTrendingUp',
  0
)
ON CONFLICT (button_type) DO NOTHING;
