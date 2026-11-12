/*
# Restrict public reads of Living Stones photo submissions

1. Security
- Replace the `USING (true)` SELECT policy on `living_stones_photos` with an
  anonymous policy scoped to `approved = true`, plus a full-table policy for
  `authenticated` so the moderation screen still sees pending submissions.

2. Notes
- The public gallery already queries `.eq('approved', true)`, so its behaviour
  is unchanged.
*/

DROP POLICY IF EXISTS "Anyone can view all photos" ON public.living_stones_photos;

CREATE POLICY "Anyone can view approved photos"
  ON public.living_stones_photos FOR SELECT
  TO anon
  USING (approved = true);

CREATE POLICY "Admins can view all photos"
  ON public.living_stones_photos FOR SELECT
  TO authenticated
  USING (true);
