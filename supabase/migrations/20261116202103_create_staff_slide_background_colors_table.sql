/*
  # Create a staff-manageable library for Slide Maker background colors

  ## Problem
  The Slide Maker's solid background swatches (and the text colors that
  read well on each one) were a fixed array in constants/data.js
  (BACKGROUNDS) - same situation marks and font pairings were in before
  their own staff_slide_* tables: only a developer editing that file and
  redeploying could add, remove, or retint a background, and staff had no
  way to see or change what's in the Custom Editor's Colors tab or the
  automatic generator's rotation.

  ## What this does
  Creates `staff_slide_background_colors_portal123`, giving background
  colors the same staff-manageable treatment. Unlike marks, this is pure
  data (no file), same as font pairings - a name, a hex, and the list of
  text colors allowed on it (text_colors, a small jsonb array of
  {name, hex} - not worth a join table for something this small and
  always read/written as a whole).

  ## Columns
  - `id`: Unique background identifier.
  - `name`: Staff-facing background name.
  - `hex`: Background color value.
  - `text_colors`: JSON list of allowed readable text colors.
  - `in_auto_rotation`: Whether automatic slide generation can use it.
  - `role`: Optional protected dark or light bucket role.
  - `created_at`, `updated_at`: Record timestamps.

  ## Security
  - Enables row-level security on the new table.
  - Grants signed-in staff SELECT, INSERT, UPDATE, and DELETE access.
  - Adds separate authenticated-only CRUD policies.
  - Restricts each protected background role to one row.

  ## Important notes
  1. Protected dark and light bucket roles remain available to automatic
     background selection.
  2. The application prevents deletion or role removal when a protected
     bucket is required.
  3. The updated-at trigger keeps changes timestamped automatically.
*/

CREATE TABLE IF NOT EXISTS staff_slide_background_colors_portal123 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  hex text NOT NULL,
  text_colors jsonb NOT NULL DEFAULT '[]'::jsonb,
  in_auto_rotation boolean NOT NULL DEFAULT true,
  role text CHECK (role IN ('dark_bucket', 'light_bucket')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_staff_slide_background_colors_role
  ON staff_slide_background_colors_portal123(role) WHERE role IS NOT NULL;

ALTER TABLE staff_slide_background_colors_portal123 ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view staff slide background colors" ON staff_slide_background_colors_portal123;
CREATE POLICY "Authenticated users can view staff slide background colors"
  ON staff_slide_background_colors_portal123 FOR SELECT
  TO authenticated USING (true);
DROP POLICY IF EXISTS "Authenticated users can insert staff slide background colors" ON staff_slide_background_colors_portal123;
CREATE POLICY "Authenticated users can insert staff slide background colors"
  ON staff_slide_background_colors_portal123 FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated users can update staff slide background colors" ON staff_slide_background_colors_portal123;
CREATE POLICY "Authenticated users can update staff slide background colors"
  ON staff_slide_background_colors_portal123 FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated users can delete staff slide background colors" ON staff_slide_background_colors_portal123;
CREATE POLICY "Authenticated users can delete staff slide background colors"
  ON staff_slide_background_colors_portal123 FOR DELETE
  TO authenticated USING (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON staff_slide_background_colors_portal123 TO authenticated;

CREATE INDEX IF NOT EXISTS idx_staff_slide_background_colors_created_at ON staff_slide_background_colors_portal123(created_at ASC);

DROP TRIGGER IF EXISTS staff_slide_background_colors_updated_at ON staff_slide_background_colors_portal123;
CREATE TRIGGER staff_slide_background_colors_updated_at
  BEFORE UPDATE ON staff_slide_background_colors_portal123
  FOR EACH ROW EXECUTE FUNCTION staff_slide_set_updated_at();

NOTIFY pgrst, 'reload schema';