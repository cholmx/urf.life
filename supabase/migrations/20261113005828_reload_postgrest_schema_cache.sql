/*
  # Force a PostgREST schema cache reload

  ## Problem
  Staff hit "Could not find the 'is_texture' column of
  'staff_slide_photos_portal123' in the schema cache" when toggling a
  photo's texture flag, and "Cannot read properties of undefined (reading
  'img')" when the automatic background pool came back empty - both
  trace back to the same thing: PostgREST (the REST API layer in front of
  Postgres) caches the table schema in memory and doesn't always notice a
  column added by a later migration (is_texture, added in
  20261112140000_add_is_texture_to_slide_photos.sql) until it's told to
  reload. Until it does, requests that touch that column - a SELECT that
  reads it back, or an UPDATE that sets it - fail or silently return
  nothing, which is exactly what both error messages above are.

  ## What this does
  Sends PostgREST's standard reload signal. This is a no-op if the cache
  is already current; it's here so every migration run fixes this class
  of problem automatically instead of requiring a manual "Reload schema"
  click in the Supabase dashboard's API settings.
*/

NOTIFY pgrst, 'reload schema';
