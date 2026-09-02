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

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Slow down brute-force password guessing.
  await new Promise((resolve) => setTimeout(resolve, 400));

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

    if (typeof password !== 'string' || password !== expectedPassword) {
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
