// One-time bootstrap for the single hardcoded admin identity. This
// project has public self-service signups disabled on purpose (nobody
// should be able to create their own account by just typing an email into
// the login form) - but that also means chris@urfellowship.com's very
// first login has no existing auth.users row to send a magic link to,
// and supabase.auth.signInWithOtp refuses to create one, erroring with
// "Signups not allowed for this instance". This function uses the
// privileged admin API (inviteUserByEmail), which bypasses that
// project-level restriction the same way the invite-staff function does
// for everyone else, to create chris's real account and email him an
// actual sign-in link. Every login after this one goes through the
// normal public signInWithOtp path above, since his account then exists.
//
// Deliberately takes no email input - this only ever touches the one
// hardcoded address, so there's nothing an attacker could redirect to
// invite or spam a different inbox. It's unauthenticated (has to be -
// nobody can be logged in yet), so it's rate-limited per IP the same way
// the old admin-login function was, since repeated calls would otherwise
// just spam chris's own inbox.

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ADMIN_EMAIL = 'chris@urfellowship.com';

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const BASE_LOCKOUT_MS = 60 * 1000;
const MAX_LOCKOUT_MS = 60 * 60 * 1000;

interface AttemptRecord {
  count: number;
  firstAt: number;
  lockedUntil: number;
}
const attempts = new Map<string, AttemptRecord>();

function clientKey(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for') ?? '';
  return forwarded.split(',')[0].trim() || req.headers.get('cf-connecting-ip') || 'unknown';
}

function recordFailure(key: string, now: number) {
  const current = attempts.get(key) ?? { count: 0, firstAt: now, lockedUntil: 0 };
  current.count += 1;
  if (current.count >= MAX_ATTEMPTS) {
    const over = current.count - MAX_ATTEMPTS;
    current.lockedUntil = now + Math.min(BASE_LOCKOUT_MS * Math.pow(2, over), MAX_LOCKOUT_MS);
  }
  attempts.set(key, current);
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const now = Date.now();
  const key = clientKey(req);
  const record = attempts.get(key);
  if (record) {
    if (now - record.firstAt > WINDOW_MS) {
      attempts.delete(key);
    } else if (now < record.lockedUntil) {
      const retryAfter = Math.ceil((record.lockedUntil - now) / 1000);
      return new Response(JSON.stringify({ error: 'Too many attempts. Please try again later.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': String(retryAfter) },
      });
    }
  }

  try {
    const { redirectTo } = await req.json().catch(() => ({ redirectTo: undefined }));

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(ADMIN_EMAIL, {
      redirectTo: redirectTo || undefined,
    });

    // Already has an account (e.g. bootstrapped once before) - nothing left
    // to do here, the normal sign-in-link path now works for this address.
    if (inviteError && !/already registered|already exists/i.test(inviteError.message || '')) {
      recordFailure(key, now);
      console.error('admin-bootstrap inviteUserByEmail failed:', inviteError);
      return new Response(JSON.stringify({ error: 'Could not send the sign-in link.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    attempts.delete(key);
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    recordFailure(key, now);
    console.error('admin-bootstrap error:', err);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
