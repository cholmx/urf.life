/*
  # Seed a growth-campaign toggle row in featured_buttons_portal123

  ## Problem
  The "Transforming Together Growth Campaign" button on the homepage
  was hardcoded in Home.jsx and always visible, unlike the other
  featured buttons, which can be toggled on/off from /admin. Staff want
  the same on/off control for it.

  ## What this does
  Seeds a dedicated row (button_type = 'growth_campaign') in the
  existing featured_buttons_portal123 table so its visibility can be
  controlled through the same is_active flag and admin screen as every
  other featured button, without a new table. Home.jsx still renders
  this button's distinctive gradient background, icon and copy itself -
  it only reads this row's is_active flag to decide whether to show it
  at all - so the title/description/path/icon_name columns here are
  just descriptive placeholders for whoever looks at the table, not
  what actually renders.

  is_active defaults to true to match the button's existing always-on
  behavior, so this migration doesn't change what visitors see.
*/

INSERT INTO featured_buttons_portal123 (button_type, title, description, is_active, path, icon_name, display_order)
VALUES (
  'growth_campaign',
  'Transforming Together Growth Campaign',
  'Updates, vision, and ways to give and commit',
  true,
  '/capital-campaign',
  'FiTrendingUp',
  -1
)
ON CONFLICT (button_type) DO NOTHING;
