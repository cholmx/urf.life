/*
  # Create a staff-manageable library for Slide Maker overlay marks

  ## Problem
  The Slide Maker's automatic generator layers a faint watermark (a brand
  pattern, a silhouette, a native frame, etc. - see MARK_OVERLAYS /
  MARK_OVERLAYS_LIGHT / MARK_OVERLAYS_UNIVERSAL in constants/data.js) over
  every automatic slide. Until now that pool only grew by a developer
  editing data.js and committing new image files - staff had no way to see
  what marks exist or add their own, unlike backgrounds (the Photos tab's
  photo library + "is_texture" flag).

  ## What this does
  Creates `staff_slide_marks_portal123`, a sibling of
  `staff_slide_photos_portal123` for these overlay marks, plus the
  `staff-slide-marks` storage bucket it uploads into. Same
  authenticated-only row access and public-read-storage shape as the
  existing slide photos table/bucket (internal staff tooling, not public
  content; images read back via the public-URL CDN path).

  `pool` records which of the three pools above a mark belongs to - 'dark'
  (brand ink, for every background except White/Cream), 'light' (ink for
  White/Cream), or 'universal' (reads fine on anything, no ink of its own).
  This is a mark's whole reason for existing (determines which slides it
  can show up on), so it's a required column with no default.
*/

CREATE TABLE IF NOT EXISTS staff_slide_marks_portal123 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name text NOT NULL,
  storage_path text NOT NULL UNIQUE,
  thumbnail_url text,
  pool text NOT NULL CHECK (pool IN ('dark', 'light', 'universal')),
  width integer,
  height integer,
  file_size integer,
  mime_type text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE staff_slide_marks_portal123 ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view staff slide marks" ON staff_slide_marks_portal123;
CREATE POLICY "Authenticated users can view staff slide marks"
  ON staff_slide_marks_portal123 FOR SELECT
  TO authenticated USING (true);
DROP POLICY IF EXISTS "Authenticated users can insert staff slide marks" ON staff_slide_marks_portal123;
CREATE POLICY "Authenticated users can insert staff slide marks"
  ON staff_slide_marks_portal123 FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated users can update staff slide marks" ON staff_slide_marks_portal123;
CREATE POLICY "Authenticated users can update staff slide marks"
  ON staff_slide_marks_portal123 FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated users can delete staff slide marks" ON staff_slide_marks_portal123;
CREATE POLICY "Authenticated users can delete staff slide marks"
  ON staff_slide_marks_portal123 FOR DELETE
  TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_staff_slide_marks_created_at ON staff_slide_marks_portal123(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_staff_slide_marks_pool ON staff_slide_marks_portal123(pool);

DROP TRIGGER IF EXISTS staff_slide_marks_updated_at ON staff_slide_marks_portal123;
CREATE TRIGGER staff_slide_marks_updated_at
  BEFORE UPDATE ON staff_slide_marks_portal123
  FOR EACH ROW EXECUTE FUNCTION staff_slide_set_updated_at();

-- Storage bucket - file_size_limit/allowed_mime_types set up front (see
-- 20261112015357_limit_staff_slide_bucket_uploads.sql, which had to add
-- these to the older slide buckets after the fact).
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('staff-slide-marks', 'staff-slide-marks', true, 15728640, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Anyone can view staff slide marks in storage" ON storage.objects;
CREATE POLICY "Anyone can view staff slide marks in storage"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'staff-slide-marks');
DROP POLICY IF EXISTS "Authenticated users can upload staff slide marks" ON storage.objects;
CREATE POLICY "Authenticated users can upload staff slide marks"
  ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'staff-slide-marks');
DROP POLICY IF EXISTS "Authenticated users can update staff slide marks in storage" ON storage.objects;
CREATE POLICY "Authenticated users can update staff slide marks in storage"
  ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id = 'staff-slide-marks') WITH CHECK (bucket_id = 'staff-slide-marks');
DROP POLICY IF EXISTS "Authenticated users can delete staff slide marks in storage" ON storage.objects;
CREATE POLICY "Authenticated users can delete staff slide marks in storage"
  ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'staff-slide-marks');

NOTIFY pgrst, 'reload schema';
