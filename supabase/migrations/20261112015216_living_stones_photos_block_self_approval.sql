/*
# Prevent anonymous submitters from self-approving Living Stones photos

1. Security
- Replace the table-wide INSERT grant on `living_stones_photos` for `anon` and
  `authenticated` with a column-scoped grant covering only the fields the
  upload form legitimately sends (`photo_url`, `submitter_name`, `caption`,
  `approved`).
- Recreate the anonymous INSERT policy with `WITH CHECK (approved = false)` so
  a crafted request cannot publish a photo straight to the public gallery.

2. Notes
- The upload form already sends `approved: false`, so behaviour is unchanged
  for legitimate submissions.
- `approved_at` can no longer be set at insert time; only the moderation
  screen (running as `authenticated` via UPDATE) sets it.
*/

REVOKE INSERT ON TABLE public.living_stones_photos FROM anon;
REVOKE INSERT ON TABLE public.living_stones_photos FROM authenticated;

GRANT INSERT (photo_url, submitter_name, caption, approved)
  ON TABLE public.living_stones_photos TO anon, authenticated;

DROP POLICY IF EXISTS "Anyone can submit a living stones photo" ON public.living_stones_photos;

CREATE POLICY "Anyone can submit a living stones photo"
  ON public.living_stones_photos FOR INSERT
  TO anon, authenticated
  WITH CHECK (approved = false);
