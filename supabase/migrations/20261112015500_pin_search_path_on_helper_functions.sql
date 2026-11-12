/*
# Pin an explicit search_path on helper functions

1. Security
- Set an explicit `search_path` on eight functions that previously had a
  mutable one, so a shadowed function or operator in an earlier schema on the
  resolution path cannot change what their bodies do.

2. Notes
- The paths include `extensions` and `net` where the bodies rely on them, so
  behaviour is unchanged.
*/

ALTER FUNCTION public.to_title_case(text) SET search_path = public, pg_temp;
ALTER FUNCTION public.staff_comms_set_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.staff_slide_set_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.youtube_unescape_xml(text) SET search_path = public, pg_temp;
ALTER FUNCTION public.extract_youtube_video_id(text) SET search_path = public, pg_temp;
ALTER FUNCTION public.parse_sermon_title(text) SET search_path = public, pg_temp;
ALTER FUNCTION public.split_sermon_description(text) SET search_path = public, pg_temp;
ALTER FUNCTION public.net_wait_response(bigint, integer, numeric) SET search_path = public, extensions, net, pg_temp;
