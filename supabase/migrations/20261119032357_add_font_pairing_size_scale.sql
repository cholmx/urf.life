/*
  # Let each Slide Maker font pairing carry its own headline/subhead size

  ## Problem
  Every pairing's headline renders at the same target width (a fixed
  fraction of the slide's own width - see HEADLINE_WIDTH_FRACTION in
  templateRenderers.js) regardless of which fonts it uses, and the
  subhead scales off the headline's own resolved size the same way for
  every pairing too. Staff had no way to make one pairing read
  deliberately bigger or smaller than another - a display face meant to
  dominate a slide and a quieter secondary face were stuck at the same
  relative size.

  ## What this does
  Adds `h_size_scale`/`b_size_scale` to staff_slide_font_pairings_portal123
  - multipliers applied on top of the existing target-width fractions
  (1 = today's behavior, unchanged for every existing row). Set from the
  Fonts tab's Add a Pairing form, so staff choosing a pairing's fonts
  choose its size at the same time.

  ## Columns
  - `h_size_scale`: Multiplier on the headline's target width (default 1).
  - `b_size_scale`: Multiplier on the subhead's target width and size cap (default 1).

  ## Important notes
  1. Bounded to a sane 0.5-2.5 range - well outside that is more likely a
     typo than a deliberate design choice, and the renderer's own maxH
     cap already guards against a headline sized so large it can't fit.
*/

ALTER TABLE staff_slide_font_pairings_portal123
  ADD COLUMN IF NOT EXISTS h_size_scale numeric NOT NULL DEFAULT 1 CHECK (h_size_scale BETWEEN 0.5 AND 2.5),
  ADD COLUMN IF NOT EXISTS b_size_scale numeric NOT NULL DEFAULT 1 CHECK (b_size_scale BETWEEN 0.5 AND 2.5);

NOTIFY pgrst, 'reload schema';