# Import YouTube Sermons

Automatically imports new sermon videos from the church's YouTube channel
into `sermons_portal123`. Runs as a Supabase Edge Function - see
`index.ts` for what it actually does.

## One-time setup

### 1. Deploy the function

From the repo root, with the [Supabase CLI](https://supabase.com/docs/guides/cli)
installed and linked to this project (`supabase link`):

```bash
supabase functions deploy import-youtube-sermons
```

### 2. Set the one secret this function needs

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided automatically
to every Edge Function, and `ANTHROPIC_API_KEY` is already set project-wide
(the `generate-script` function already uses it) - secrets are shared
across every Edge Function in the project, not set per-function. You only
need to add this one:

```bash
supabase secrets set YOUTUBE_API_KEY=your-youtube-data-api-v3-key
```

(Or set it without the CLI: Supabase Dashboard -> Edge Functions ->
Secrets.)

If your Anthropic key is a personal/service-account key not scoped to a
single workspace, it also needs `ANTHROPIC_WORKSPACE_ID` set - same as
`generate-script` - but if that function already works today, yours is
already covered and there's nothing more to do here.

### 3. Schedule it to run automatically

Supabase Dashboard -> Edge Functions -> `import-youtube-sermons` ->
Cron Triggers -> Add a new cron trigger. A daily schedule (e.g. once
every morning) is plenty, since sermons are posted roughly weekly - the
function safely no-ops on every video it's already seen, so running it
more often than new content appears costs nothing but a wasted check.

No SQL or extra setup needed - the dashboard handles authenticating the
scheduled call to the function for you.

### 4. Test it

Dashboard -> Edge Functions -> `import-youtube-sermons` -> "Invoke" (or
`supabase functions invoke import-youtube-sermons`) to run it once by
hand and see the result (`{ imported, backfilled, skipped, unmatched,
importedTitles, unmatchedTitles }`) before waiting on the schedule.

## How it decides what to do with each video

- **Already imported** (its video ID is already on a sermon row) -> skipped.
- **Matches an existing, manually-entered sermon** (same video ID, found
  by extracting it from that row's stored `youtube_url`) -> only
  `youtube_video_id` is backfilled onto it; everything else about that
  row is left exactly as staff entered it.
- **Genuinely new** -> the title is parsed as `Series :: Sermon Name //
  Speaker` or standalone `Sermon Name // Speaker`; Claude cleans up the
  description's `Summary:`/`Discussion Questions:` sections and adds a
  few topical tags; the series is matched or created by name; a new row
  is inserted.
- **Title doesn't match either shape** (older videos, or one not yet
  following the convention) -> skipped and logged, never guessed at.

A video is only ever inserted or backfilled *once* - never updated again
after that - so editing a sermon afterward in the admin panel is never
silently reverted by a later run.
