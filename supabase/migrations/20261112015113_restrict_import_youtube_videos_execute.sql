/*
# Restrict the YouTube import RPC to signed-in admins

1. Security
- Revoke the default PUBLIC EXECUTE privilege on `import_youtube_videos()`
  and revoke it explicitly from `anon`.
- Re-grant EXECUTE to `authenticated` so the admin sermon screen keeps working.

2. Notes
- This SECURITY DEFINER function performs outbound HTTP and writes
  `sermons_portal123`; the PUBLIC default made it callable anonymously.
*/

REVOKE EXECUTE ON FUNCTION public.import_youtube_videos() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.import_youtube_videos() FROM anon;
GRANT EXECUTE ON FUNCTION public.import_youtube_videos() TO authenticated;
