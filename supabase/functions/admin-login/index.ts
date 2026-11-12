// Verifies the admin password against the ADMIN_PASSWORD secret (server-side
// only, set in the project's Secrets panel — never shipped to the browser)
// and, on success, mints a real Supabase Auth session for a fixed internal
// admin account. The client never sees the password comparison or an email
// field; it only ever sends the password it was given and receives a
// one-time token it exchanges for a session via supabase.auth.verifyOtp.

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Internal identifier only — never displayed or entered by the admin.
const ADMIN_EMAIL = 'admin@urf-life.internal';

// --- Brute-force protection -------------------------------------------------
// A fixed delay alone does not stop a concurrent or distributed guessing
// attack, so track failed attempts per client IP and lock the IP out with
// exponential backoff once it crosses a small threshold.
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const BASE_LOCKOUT_MS = 60 * 1000;
const MAX_LOCKOUT_MS = 60 * 60 * 1000;

interface AttemptRecord {
  failures: number;
  firstFailureAt: number;
  lockedUntil: number;
}

const attempts = new Map<string, AttemptRecord>();

const pruneAttempts = (now: number) => {
  for (const [key, record] of attempts) {
    if (now - record.firstFailureAt > WINDOW_MS && now > record.lockedUntil) {
      attempts.delete(key);
    }
  }
};

const clientKey = (req: Request): string => {
  const forwarded = req.headers.get('x-forwarded-for') ?? '';
  const ip = forwarded.split(',')[0].trim();
  return ip || req.headers.get('cf-connecting-ip') || 'unknown';
};

const recordFailure = (key: string, now: number) => {
  const record = attempts.get(key) ?? { failures: 0, firstFailureAt: now, lockedUntil: 0 };
  if (now - record.firstFailureAt > WINDOW_MS) {
    record.failures = 0;
    record.firstFailureAt = now;
  }
  record.failures += 1;
  if (record.failures >= MAX_ATTEMPTS) {
    const over = record.failures - MAX_ATTEMPTS;
    record.lockedUntil = now + Math.min(BASE_LOCKOUT_MS * Math.pow(2, over), MAX_LOCKOUT_MS);
  }
  attempts.set(key, record);
};

// Constant-time string comparison so response timing does not reveal how many
// leading characters of a guess were correct.
const timingSafeEqual = (a: string, b: string): boolean => {
  const encoder = new TextEncoder();
  const aBytes = encoder.encode(a);
  const bBytes = encoder.encode(b);
  let diff = aBytes.length ^ bBytes.length;
  const len = Math.max(aBytes.length, bBytes.length);
  for (let i = 0; i < len; i++) {
    diff |= (aBytes[i] ?? 0) ^ (bBytes[i] ?? 0);
  }
  return diff === 0;
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Slow down brute-force password guessing.
  await new Promise((resolve) => setTimeout(resolve, 400));

  const now = Date.now();
  pruneAttempts(now);
  const key = clientKey(req);
  const existing = attempts.get(key);

  if (existing && now < existing.lockedUntil) {
    const retryAfter = Math.ceil((existing.lockedUntil - now) / 1000);
    return new Response(
      JSON.stringify({ error: 'Too many failed attempts. Please try again later.' }),
      {
        status: 429,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Retry-After': String(retryAfter),
        },
      }
    );
  }

  try {
    const { password } = await req.json();
    const expectedPassword = Deno.env.get('ADMIN_PASSWORD');

    if (!expectedPassword) {
      console.error('ADMIN_PASSWORD secret is not set');
      return new Response(
        JSON.stringify({ error: 'Admin login is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (typeof password !== 'string' || !timingSafeEqual(password, expectedPassword)) {
      recordFailure(key, now);
      return new Response(
        JSON.stringify({ error: 'Invalid password' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Creates the internal admin user on first successful login if it
    // doesn't exist yet, then returns a one-time token for it.
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: ADMIN_EMAIL,
    });

    if (error || !data?.properties?.hashed_token) {
      console.error('generateLink failed:', error);
      return new Response(
        JSON.stringify({ error: 'Could not create admin session' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Successful login clears the failure counter for this client.
    attempts.delete(key);

    return new Response(
      JSON.stringify({ email: ADMIN_EMAIL, token: data.properties.hashed_token }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('admin-login error:', err);
    return new Response(
      JSON.stringify({ error: 'Server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
