// Lets the one real admin (chris@urfellowship.com) invite someone else to
// log into /admin as a restricted "staff" user. Two identity checks
// happen here, not one: `verify_jwt = true` (set in config.toml) means
// Supabase itself has already confirmed the caller holds a valid,
// unexpired session before this code runs; this function then also
// checks that specific session's email is the one true admin address
// before doing anything. The UI hides the "Invite" button from
// non-admins, but that's convenience, not security - this is the actual
// enforcement point.

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ADMIN_EMAIL = 'chris@urfellowship.com';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const jwt = authHeader.replace(/^Bearer\s+/i, '');
    if (!jwt) {
      return new Response(JSON.stringify({ error: 'Not signed in.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: { user: caller }, error: callerError } = await supabaseAdmin.auth.getUser(jwt);
    if (callerError || !caller?.email) {
      return new Response(JSON.stringify({ error: 'Not signed in.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (caller.email.toLowerCase() !== ADMIN_EMAIL) {
      return new Response(JSON.stringify({ error: 'Only the admin can invite staff.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { email, redirectTo } = await req.json();
    const cleanEmail = String(email || '').trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return new Response(JSON.stringify({ error: 'A valid email is required.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (cleanEmail === ADMIN_EMAIL) {
      return new Response(JSON.stringify({ error: 'That email is already the admin.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { error: upsertError } = await supabaseAdmin
      .from('staff_users_portal123')
      .upsert({ email: cleanEmail, role: 'staff', invited_by: caller.email }, { onConflict: 'email' });
    if (upsertError) throw upsertError;

    const { error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(cleanEmail, {
      redirectTo: redirectTo || undefined,
    });
    // Supabase errors here if this email already has an account (e.g.
    // re-inviting someone who already accepted and signed in once) - the
    // role row above is what actually matters in that case, so only a
    // genuine failure should abort the request.
    if (inviteError && !/already registered|already exists/i.test(inviteError.message || '')) {
      throw inviteError;
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('invite-staff failed:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
