/*
  # Let staff mark a slide photo as an automatic-generation texture

  1. Purpose
    - The Slide Maker's "build this event's slide automatically" feature
      picks from a fixed set of 10 curated texture images shipped with the
      app. This adds the ability to grow that pool from the admin UI,
      without a code change, by flagging any already-uploaded photo in the
      Photos tab's library as also usable as an automatic texture.

  2. Changes
    - `staff_slide_photos_portal123.is_texture` (boolean, default false) -
      true means this library photo is included in the automatic
      background pool alongside the 10 built-in textures.
*/

alter table staff_slide_photos_portal123
  add column if not exists is_texture boolean not null default false;
