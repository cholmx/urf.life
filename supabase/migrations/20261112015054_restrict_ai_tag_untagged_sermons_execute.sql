/*
# Restrict the AI sermon tagging RPC to signed-in admins

1. Security
- Revoke the default PUBLIC EXECUTE privilege on `ai_tag_untagged_sermons(int)`
  and revoke it explicitly from `anon`, so unauthenticated visitors can no
  longer call it through the Data API.
- Re-grant EXECUTE to `authenticated` so the admin screen keeps working.

2. Notes
- Postgres grants EXECUTE to PUBLIC on every new function, which made this
  SECURITY DEFINER function an anonymous public endpoint that spends the
  vaulted Anthropic API key and rewrites sermon tags.
*/

REVOKE EXECUTE ON FUNCTION public.ai_tag_untagged_sermons(int) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.ai_tag_untagged_sermons(int) FROM anon;
GRANT EXECUTE ON FUNCTION public.ai_tag_untagged_sermons(int) TO authenticated;
