/*
# Limit file size and type on the staff slide storage buckets

1. Changes
- Set a 15 MB file size limit and an image-only MIME allowlist on the
  `staff-slide-photos` and `staff-slide-preset-thumbnails` buckets, which were
  created with no limits at all.

2. Security
- Prevents uploading arbitrarily large files, and prevents HTML or script
  files being uploaded and then served as live markup from the public bucket
  origin.

3. Notes
- Both buckets only ever hold photos and thumbnails, so the allowlist matches
  existing usage.
*/

UPDATE storage.buckets
SET file_size_limit = 15728640,
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
WHERE id IN ('staff-slide-photos', 'staff-slide-preset-thumbnails');
