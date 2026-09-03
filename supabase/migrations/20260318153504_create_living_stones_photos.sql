/*
  # Create Living Stones Photos Feature

  ## Summary
  Adds photo upload and gallery functionality for the "Living Stones" section of the Growth Campaign.
  People paint stones and can upload photos to share in a public gallery after admin approval.

  ## New Tables

  ### `living_stones_photos`
  Stores submitted stone photos with approval workflow.

  | Column | Type | Description |
  |--------|------|-------------|
  | id | uuid | Primary key |
  | photo_url | text | Full URL to the uploaded photo in Supabase storage |
  | submitter_name | text | Optional name provided by the person who submitted |
  | caption | text | Optional caption describing the photo |
  | approved | boolean | Whether the photo has been approved by an admin (default: false) |
  | approved_at | timestamptz | When the photo was approved |
  | created_at | timestamptz | When the photo was submitted |

  ## Security
  - RLS enabled on the table
  - Anyone (including anonymous users) can INSERT new photo submissions
  - Only approved photos are publicly readable (SELECT)
  - Authenticated admins can view all photos, approve, and delete them

  ## Storage
  - Creates a public `living-stones` storage bucket for photo uploads
  - Anonymous users can upload (INSERT) to the bucket
  - Anyone can read/download photos from the bucket (public)
  - Only authenticated users can delete files from the bucket
*/

CREATE TABLE IF NOT EXISTS living_stones_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_url text NOT NULL,
  submitter_name text DEFAULT '',
  caption text DEFAULT '',
  approved boolean DEFAULT false,
  approved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE living_stones_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a living stones photo"
  ON living_stones_photos
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Public can view approved photos"
  ON living_stones_photos
  FOR SELECT
  TO anon, authenticated
  USING (approved = true);

CREATE POLICY "Authenticated admins can view all photos"
  ON living_stones_photos
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated admins can update photos"
  ON living_stones_photos
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated admins can delete photos"
  ON living_stones_photos
  FOR DELETE
  TO authenticated
  USING (true);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'living-stones',
  'living-stones',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can upload living stones photos"
  ON storage.objects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'living-stones');

CREATE POLICY "Anyone can view living stones photos"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'living-stones');

CREATE POLICY "Authenticated users can delete living stones photos"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'living-stones');
