const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const EDGE_FN_URL = `${SUPABASE_URL}/functions/v1/generate-script`;

const headers = () => ({
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
});

export async function callAI(systemPrompt: string, userPrompt: string, options?: { json?: boolean }): Promise<string> {
  const res = await fetch(EDGE_FN_URL, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ _direct: true, systemPrompt, userPrompt, _json: options?.json ?? false }),
  });
  const data = await res.json();
  // This used to fall back to returning data.error as if it were the
  // generated text, which meant any AI failure (a truncated response, an
  // invalid model name, a rate limit) landed silently inside whatever
  // field called it - "weird" text that was actually an error message,
  // not a bug in the writing itself. Throw instead, so callers' existing
  // catch/onError handling surfaces it properly.
  if (!res.ok || data.error) {
    throw new Error(data.error || `AI request failed (${res.status})`);
  }
  return data.script || '';
}

export async function generateStageScript(
  announcements: import('../types').Announcement[],
  date: string,
): Promise<string> {
  const res = await fetch(EDGE_FN_URL, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ announcements, date }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to generate script');
  return data.script || '';
}
