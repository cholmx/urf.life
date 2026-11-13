/*
  # Let staff mark a slide photo as an automatic-generation texture

  1. Purpose
    - The Slide Maker's "build this event's slide automatically" feature
      picks from a fixed set of curated texture images. This lets staff flag
      any uploaded library photo as also usable as an automatic texture.

  2. Changes
    - `staff_slide_photos_portal123.is_texture` (boolean, default false) -
      true means this library photo is included in the automatic
      background pool.
*/

alter table staff_slide_photos_portal123
  add column if not exists is_texture boolean not null default false;

NOTIFY pgrst, 'reload schema';
