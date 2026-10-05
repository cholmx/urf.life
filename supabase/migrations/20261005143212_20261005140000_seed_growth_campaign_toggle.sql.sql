/*
  # Seed growth campaign featured button

  ## What this does
  Inserts one row into the existing featured_buttons_portal123 table for the
  Growth Campaign, with button_type = 'growth_campaign' and is_active = true.
  This makes the Growth Campaign button appear on the home page as a
  database-driven featured button (the frontend already merges DB buttons
  with its hardcoded ones).

  Safe to re-run: ON CONFLICT (button_type) DO NOTHING means if the row
  already exists, nothing happens — no duplicate, no error.

  ## Table affected
  - featured_buttons_portal123 (no schema changes, INSERT only)
*/

INSERT INTO featured_buttons_portal123 (button_type, title, description, path, icon_name, is_active, display_order)
VALUES (
  'growth_campaign',
  'Transforming Together Growth Campaign',
  'Updates, vision, and ways to give and commit',
  '/capital-campaign',
  'FiTrendingUp',
  true,
  0
)
ON CONFLICT (button_type) DO NOTHING;
