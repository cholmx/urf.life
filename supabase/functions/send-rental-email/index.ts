      'A $50 refundable security deposit is required with your reservation, separate from your rental fee/final payment.',
      'Submit it as a separate check made payable to Upper Room Fellowship, in person during office hours or by mail to 500 Sponseller Road, Columbiana, Ohio 44408. Please write your event date and full name in the memo line.',
    ],
  },
  {
    title: 'Deposit Return',
    items: [
      'Your deposit is not applied toward your rental fee and will be fully refunded if the facility is returned to its original condition: furniture and equipment back in place, surfaces clean, decorations and signage removed, no damage, and all trash removed to outside dumpsters.',
      'The facility will be inspected by staff after your event. If all conditions are met, your deposit will be returned within 14 days. Any necessary cleaning, repair, or charges for extended use will be deducted from your deposit; if damages exceed the deposit amount, additional charges will apply.',
    ],
  },
  {
    title: 'Final Payment',
    items: [
      'Your rental fee payment is due one week before your scheduled event, separate from your security deposit. Pay in person during office hours, by mail, or online through Realm Giving.',
    ],
  },
];
function buildPolicyHtml(): string {
  return POLICY_SECTIONS.map((section) => `
    <div style="margin-top:20px;">
      <div style="font-size:13px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:#83A682;margin-bottom:6px;">${escapeHtml(section.title)}</div>
      <ul style="margin:0;padding-left:18px;font-size:13px;line-height:1.6;color:#333;">
        ${section.items.map((i) => `<li style="margin-bottom:4px;">${escapeHtml(i)}</li>`).join('')}
      </ul>
    </div>
  `).join('');
}
async function sendViaResend(apiKey: string, from: string, to: string | string[], subject: string, html: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to, subject, html }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend error (${res.status}): ${text}`);
  }
  return res.json();
}
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const apiKey = Deno.env.get('RESEND_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'RESEND_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const from = Deno.env.get('RESEND_FROM_EMAIL') || DEFAULT_FROM;
    const rental = await req.json();
    if (!rental?.responsible_email || !rental?.event_name) {
      return new Response(
        JSON.stringify({ error: 'Missing required rental request fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    const { data: settings } = await supabaseAdmin
      .from('facility_rental_settings_portal123')
      .select('notification_email')
      .limit(1)
      .maybeSingle();
    const notificationEmails = (settings?.notification_email || 'info@urfellowship.com')
      .split(',')
      .map((e: string) => e.trim())
      .filter(Boolean);
    const summaryTable = buildSummaryTable(rental);
    const confirmationHtml = emailShell('Your Facilities Use Request', `
      <h1 style="font-size:20px;margin:0 0 4px;color:#1E1E21;">Thank you, ${escapeHtml(rental.responsible_first_name)}!</h1>
      <p style="font-size:14px;line-height:1.6;color:#333;margin:0 0 20px;">
        We've received your Facilities Use Request for <strong>${escapeHtml(rental.event_name)}</strong> on ${escapeHtml(formatDateNice(rental.event_date))}.
        Church leadership will respond within 3 business days to confirm your date. To secure your reservation, submit your $50 refundable deposit
        by separate check once you're approved - details below.
      </p>
      <div style="border-top:1px solid #E5E5E5;border-bottom:1px solid #E5E5E5;padding:16px 0;margin-bottom:20px;">
        ${summaryTable}
      </div>
      <p style="font-size:14px;line-height:1.6;color:#333;">
        Questions? Call the church office at (330) 482-9058, option 1, or email
        <a href="mailto:info@urfellowship.com" style="color:#83A682;">info@urfellowship.com</a>.
        Office hours are Tuesday&ndash;Thursday, 9:00 AM&ndash;12:00 PM.
      </p>
      <h2 style="font-size:16px;margin:28px 0 0;color:#1E1E21;">Your Signed Agreement</h2>
      <p style="font-size:13px;color:#666;margin:4px 0 0;">A copy of the guidelines and policies you agreed to, for your records.</p>
      ${buildPolicyHtml()}
    `);
    const notificationHtml = emailShell('New Facility Rental Request', `
      <h1 style="font-size:18px;margin:0 0 16px;color:#1E1E21;">New Facilities Use Request</h1>
      ${summaryTable}
    `);
    await Promise.all([
      sendViaResend(apiKey, from, rental.responsible_email, `Your Facilities Use Request - ${rental.event_name}`, confirmationHtml),
      sendViaResend(apiKey, from, notificationEmails, `New Facility Rental Request: ${rental.event_name} (${rental.event_date})`, notificationHtml),
    ]);
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('send-rental-email failed:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});