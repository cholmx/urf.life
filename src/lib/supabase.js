import { createClient } from '@supabase/supabase-js'

// Get Supabase credentials from environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

export default supabase

// supabase.functions.invoke() throws a generic "Edge Function returned a
// non-2xx status code" FunctionsHttpError whenever the function responds
// with anything but 2xx - the function's own JSON error body (what we
// actually want to show someone) is left unread on error.context, a raw
// Response object, rather than surfaced on error.message. Call this on
// the `error` from invoke() to recover that real message.
export async function extractFunctionErrorMessage(error, fallback='Something went wrong. Please try again.') {
  if (!error) return fallback;
  try {
    const body=await error.context?.json();
    if (body?.error) return body.error;
  } catch {
    // context wasn't JSON (or already consumed) - fall through to the
    // generic message below rather than throwing from inside a catch handler.
  }
  return error.message || fallback;
}