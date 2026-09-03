/*
  # Create slide maker (Slide Designer) tables and storage buckets

  ## Problem
  Brings in the standalone React-Slide-Design-Tool app as another new tab in
  /admin, the same way the Announcement Organizer was ported. It lets staff
  build announcement slide graphics (headline/date/photo background) and
  download them as PNG/JPG, with a reusable photo library and saved presets.

  ## What this does
  Creates `staff_slide_photos_portal123` and `staff_slide_presets_portal123`
  (ported from the original app's `photos` and `presets` tables - its dead
  `queue_items` table, already dropped by the original app's own later
  migration, is intentionally not ported). Also creates the two storage
  buckets the app uploads into: `staff-slide-photos` and
  `staff-slide-preset-thumbnails`.

  Row data (which photo/preset exists) is authenticated-only, same
  reasoning as the Announcement Organizer tables - this is internal staff
  tooling behind /admin, not public content. The storage buckets stay
  public (matching the original app) because the app reads images back via
  Supabase's public-URL CDN path, not through the authenticated client, but
  uploading/deleting objects is restricted to authenticated staff sessions.

  ## New Tables
  1. `staff_slide_photos_portal123`
     - id (uuid PK)
     - file_name (text, not null)
     - storage_path (text, not null, unique)
     - thumbnail_url (text, nullable)
     - width, height, file_size (integer, nullable)
     - mime_type (text, not null)
     - created_at, updated_at (timestamptz, default now())

  2. `staff_slide_presets_portal123`
     - id (uuid PK)
     - name (text, not null)
     - description (text, nullable)
     - preset_data (jsonb, not null)
     - thumbnail_url (text, nullable)
     - created_at, updated_at (timestamptz, default now())

  ## Storage Buckets
  - `staff-slide-photos` (public) — staff-uploaded background photos
  - `staff-slide-preset-thumbnails` (public) — thumbnails for saved presets

  ## Security
  - RLS enabled on both tables; all CRUD scoped to `authenticated` only.
  - Storage buckets are public for reads (CDN), but insert/update/delete
    restricted to `authenticated`.
*/

CREATE TABLE IF NOT EXISTS staff_slide_photos_portal123 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name text NOT NULL,
  storage_path text NOT NULL UNIQUE,
  thumbnail_url text,
  width integer,
  height integer,
  file_size integer,
  mime_type text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE staff_slide_photos_portal123 ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view staff slide photos" ON staff_slide_photos_portal123;
CREATE POLICY "Authenticated users can view staff slide photos"
  ON staff_slide_photos_portal123 FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert staff slide photos" ON staff_slide_photos_portal123;
CREATE POLICY "Authenticated users can insert staff slide photos"
  ON staff_slide_photos_portal123 FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update staff slide photos" ON staff_slide_photos_portal123;
CREATE POLICY "Authenticated users can update staff slide photos"
  ON staff_slide_photos_portal123 FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete staff slide photos" ON staff_slide_photos_portal123;
CREATE POLICY "Authenticated users can delete staff slide photos"
  ON staff_slide_photos_portal123 FOR DELETE
  TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_staff_slide_photos_created_at ON staff_slide_photos_portal123(created_at DESC);

CREATE TABLE IF NOT EXISTS staff_slide_presets_portal123 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  preset_data jsonb NOT NULL,
  thumbnail_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE staff_slide_presets_portal123 ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view staff slide presets" ON staff_slide_presets_portal123;
CREATE POLICY "Authenticated users can view staff slide presets"
  ON staff_slide_presets_portal123 FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert staff slide presets" ON staff_slide_presets_portal123;
CREATE POLICY "Authenticated users can insert staff slide presets"
  ON staff_slide_presets_portal123 FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update staff slide presets" ON staff_slide_presets_portal123;
CREATE POLICY "Authenticated users can update staff slide presets"
  ON staff_slide_presets_portal123 FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete staff slide presets" ON staff_slide_presets_portal123;
CREATE POLICY "Authenticated users can delete staff slide presets"
  ON staff_slide_presets_portal123 FOR DELETE
  TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_staff_slide_presets_created_at ON staff_slide_presets_portal123(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_staff_slide_presets_name ON staff_slide_presets_portal123(name);

CREATE OR REPLACE FUNCTION staff_slide_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS staff_slide_photos_updated_at ON staff_slide_photos_portal123;
CREATE TRIGGER staff_slide_photos_updated_at
  BEFORE UPDATE ON staff_slide_photos_portal123
  FOR EACH ROW EXECUTE FUNCTION staff_slide_set_updated_at();

DROP TRIGGER IF EXISTS staff_slide_presets_updated_at ON staff_slide_presets_portal123;
CREATE TRIGGER staff_slide_presets_updated_at
  BEFORE UPDATE ON staff_slide_presets_portal123
  FOR EACH ROW EXECUTE FUNCTION staff_slide_set_updated_at();

-- Storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('staff-slide-photos', 'staff-slide-photos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('staff-slide-preset-thumbnails', 'staff-slide-preset-thumbnails', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Anyone can view staff slide photos in storage" ON storage.objects;
CREATE POLICY "Anyone can view staff slide photos in storage"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'staff-slide-photos');

DROP POLICY IF EXISTS "Authenticated users can upload staff slide photos" ON storage.objects;
CREATE POLICY "Authenticated users can upload staff slide photos"
  ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'staff-slide-photos');

DROP POLICY IF EXISTS "Authenticated users can update staff slide photos in storage" ON storage.objects;
CREATE POLICY "Authenticated users can update staff slide photos in storage"
  ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id = 'staff-slide-photos') WITH CHECK (bucket_id = 'staff-slide-photos');

DROP POLICY IF EXISTS "Authenticated users can delete staff slide photos in storage" ON storage.objects;
CREATE POLICY "Authenticated users can delete staff slide photos in storage"
  ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'staff-slide-photos');

DROP POLICY IF EXISTS "Anyone can view staff slide preset thumbnails" ON storage.objects;
CREATE POLICY "Anyone can view staff slide preset thumbnails"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'staff-slide-preset-thumbnails');

DROP POLICY IF EXISTS "Authenticated users can upload staff slide preset thumbnails" ON storage.objects;
CREATE POLICY "Authenticated users can upload staff slide preset thumbnails"
  ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'staff-slide-preset-thumbnails');

DROP POLICY IF EXISTS "Authenticated users can update staff slide preset thumbnails in storage" ON storage.objects;
CREATE POLICY "Authenticated users can update staff slide preset thumbnails in storage"
  ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id = 'staff-slide-preset-thumbnails') WITH CHECK (bucket_id = 'staff-slide-preset-thumbnails');

DROP POLICY IF EXISTS "Authenticated users can delete staff slide preset thumbnails in storage" ON storage.objects;
CREATE POLICY "Authenticated users can delete staff slide preset thumbnails in storage"
  ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'staff-slide-preset-thumbnails');