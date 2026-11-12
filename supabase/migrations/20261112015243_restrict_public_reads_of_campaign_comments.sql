/*
# Restrict public reads of campaign comments

1. Security
- Replace the anonymous SELECT policy `USING (true)` on `campaign_comments`
  with `USING (is_approved = true)` so unapproved or rejected comments are no
  longer publicly readable.
- Replace the table-wide `anon` SELECT grant with a column-scoped grant that
  excludes `author_email`, so commenter email addresses cannot be harvested
  through the Data API.

2. Notes
- The admin comments screen runs as `authenticated` and keeps its full-table
  SELECT policy and grant, so moderation is unaffected.
*/

DROP POLICY IF EXISTS "Anyone can view all comments" ON public.campaign_comments;

CREATE POLICY "Anyone can view approved comments"
  ON public.campaign_comments FOR SELECT
  TO anon
  USING (is_approved = true);

REVOKE SELECT ON TABLE public.campaign_comments FROM anon;

GRANT SELECT (id, campaign_update_id, author_name, comment_text, is_approved, admin_reply, created_at, approved_at)
  ON TABLE public.campaign_comments TO anon;
