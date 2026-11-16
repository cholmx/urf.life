/*
  # Create a staff-manageable library for Slide Maker font pairings

  ## Problem
  The automatic slide maker picks a random headline/subhead font pairing
  per slide from a fixed array in constants/data.js (AUTO_FONT_PAIRINGS) -
  same situation the overlay marks were in before
  staff_slide_marks_portal123: only a developer editing that file and
  redeploying could change what's in the pool, and staff had no way to
  see what's there.

  ## What this does
  Creates `staff_slide_font_pairings_portal123`, giving font pairings the
  same staff-manageable treatment marks already got. Unlike marks, a
  pairing is pure data (two Google Fonts family names plus weight/style
  flags) - no file, so no storage bucket here, just the row. Same
  authenticated-only access shape as every other staff_slide_* table.

  ## Columns
  - `id`: Unique pairing identifier.
  - `h_font`, `b_font`: Google Fonts family names for the headline and body.
  - `h_generic`, `b_generic`: CSS fallback families, limited to serif or sans-serif.
  - `h_weight`, `b_weight`: Font weights for the headline and body.
  - `h_italic`, `b_italic`: Whether each font renders in italics.
  - `h_uppercase`: Whether the headline renders in uppercase.
  - `created_at`, `updated_at`: Record timestamps.

  ## Security
  - Enables row-level security on the new table.
  - Grants signed-in staff SELECT, INSERT, UPDATE, and DELETE access.
  - Adds separate authenticated-only CRUD policies.

  ## Important notes
  1. Google Fonts names are validated by the application before insertion.
  2. The generic-family checks prevent unsupported CSS fallback values.
  3. The updated-at trigger keeps changes timestamped automatically.
*/

CREATE TABLE IF NOT EXISTS staff_slide_font_pairings_portal123 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  h_font text NOT NULL,
  h_generic text NOT NULL DEFAULT 'sans-serif' CHECK (h_generic IN ('serif', 'sans-serif')),
  h_weight integer NOT NULL DEFAULT 700,
  h_italic boolean NOT NULL DEFAULT false,
  h_uppercase boolean NOT NULL DEFAULT false,
  b_font text NOT NULL,
  b_generic text NOT NULL DEFAULT 'serif' CHECK (b_generic IN ('serif', 'sans-serif')),
  b_weight integer NOT NULL DEFAULT 400,
  b_italic boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE staff_slide_font_pairings_portal123 ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON staff_slide_font_pairings_portal123 TO authenticated;

DROP POLICY IF EXISTS "Authenticated users can view staff slide font pairings" ON staff_slide_font_pairings_portal123;
CREATE POLICY "Authenticated users can view staff slide font pairings"
  ON staff_slide_font_pairings_portal123 FOR SELECT
  TO authenticated USING (true);
DROP POLICY IF EXISTS "Authenticated users can insert staff slide font pairings" ON staff_slide_font_pairings_portal123;
CREATE POLICY "Authenticated users can insert staff slide font pairings"
  ON staff_slide_font_pairings_portal123 FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated users can update staff slide font pairings" ON staff_slide_font_pairings_portal123;
CREATE POLICY "Authenticated users can update staff slide font pairings"
  ON staff_slide_font_pairings_portal123 FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated users can delete staff slide font pairings" ON staff_slide_font_pairings_portal123;
CREATE POLICY "Authenticated users can delete staff slide font pairings"
  ON staff_slide_font_pairings_portal123 FOR DELETE
  TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_staff_slide_font_pairings_created_at ON staff_slide_font_pairings_portal123(created_at DESC);

DROP TRIGGER IF EXISTS staff_slide_font_pairings_updated_at ON staff_slide_font_pairings_portal123;
CREATE TRIGGER staff_slide_font_pairings_updated_at
  BEFORE UPDATE ON staff_slide_font_pairings_portal123
  FOR EACH ROW EXECUTE FUNCTION staff_slide_set_updated_at();

NOTIFY pgrst, 'reload schema';