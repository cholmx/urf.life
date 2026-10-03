// Sends two emails for a new Facilities Use Request: a confirmation to the
// renter (their submitted details + the Guidelines & Policies agreement,
// matching the two reference documents this was modeled on) and an
// internal notification to whoever rental requests should go to, read
// from facility_rental_settings_portal123 (admin-editable in /admin, not
// hardcoded) rather than Formspree's one fixed recipient - Formspree can't
// email an arbitrary address (the renter) or route to a configurable one,
// which is why this form uses Resend instead of the rest of the site's
// Formspree-based notifications.

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Resend's shared test domain - works immediately with no domain
// verification, but only looks right in an inbox once RESEND_FROM_EMAIL is
// set to a verified address on the church's own domain (e.g.
// "Upper Room Fellowship <rentals@urf.life>"). Safe to leave as the
// fallback: email still sends either way, this only affects the From line.
const DEFAULT_FROM = 'Upper Room Fellowship <onboarding@resend.dev>';

function escapeHtml(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatMoney(n: number): string {
  return `$${Number(n ?? 0).toFixed(2)}`;
}

function formatDateNice(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function emailShell(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:#F4F1E8;font-family:Georgia,'Times New Roman',serif;color:#1E1E21;">
  <div style="max-width:640px;margin:0 auto;padding:32px 24px;">
    <div style="text-align:center;margin-bottom:24px;">
      <div style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#83A682;font-weight:700;">Upper Room Fellowship</div>
    </div>
    <div style="background:#ffffff;border-radius:12px;padding:32px;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
      ${bodyHtml}
    </div>
    <div style="text-align:center;margin-top:20px;font-size:12px;color:#8A8A8A;">
      Upper Room Fellowship &middot; 500 Sponseller Road, Columbiana, Ohio 44408
    </div>
  </div>
</body>
</html>`;
}

function detailRow(label: string, value: string): string {
  if (!value) return '';
  return `<tr>
    <td style="padding:6px 12px 6px 0;font-size:13px;color:#6B6B6B;white-space:nowrap;vertical-align:top;">${escapeHtml(label)}</td>
    <td style="padding:6px 0;font-size:14px;color:#1E1E21;">${value}</td>
  </tr>`;
}

function buildSummaryTable(r: Record<string, unknown>): string {
  const rows = [
    detailRow('Event Type', escapeHtml(r.event_type === 'community' ? 'Community Event' : 'Personal Event')),
    detailRow('Organization', escapeHtml(r.organization_name as string || '')),
    detailRow('Event Name', escapeHtml(r.event_name as string)),
    detailRow('Purpose', escapeHtml(r.purpose as string)),
    detailRow('Guests', escapeHtml(String(r.guest_count))),
    detailRow('Event Date', escapeHtml(formatDateNice(r.event_date as string))),
    detailRow('Event Time', `${escapeHtml(r.event_start_time as string)} &ndash; ${escapeHtml(r.event_end_time as string)}`),
    detailRow('Setup', escapeHtml(r.setup_schedule === 'day_before' ? 'Day before the event' : 'Day of the event')),
    detailRow('Setup Window', `${escapeHtml(r.setup_arrival_time as string)} &ndash; ${escapeHtml(r.setup_departure_time as string)}`),
    detailRow('Member', escapeHtml(r.is_member ? 'Yes' : 'No')),
    detailRow('Rooms Requested', ((r.rooms_requested as string[]) || []).map(escapeHtml).join('<br>') || 'None'),
    detailRow('Additional Services', ((r.additional_services as string[]) || []).map(escapeHtml).join('<br>') || 'None'),
    detailRow('Estimated Total', `<strong>${formatMoney(r.calculated_total as number)}</strong>`),
    detailRow('Responsible Person', escapeHtml(`${r.responsible_first_name} ${r.responsible_last_name}`)),
    detailRow('Email', escapeHtml(r.responsible_email as string)),
    detailRow('Phone', escapeHtml(r.responsible_phone as string)),
    detailRow('Return Address', escapeHtml(r.return_address as string).replace(/\n/g, '<br>')),
    detailRow('Signature', `${escapeHtml(r.signature_name as string)} &middot; ${escapeHtml(r.signature_date as string)}`),
  ].join('');
  return `<table style="width:100%;border-collapse:collapse;">${rows}</table>`;
}

const POLICY_SECTIONS: { title: string; items: string[] }[] = [
  {
    title: 'Rental Coordinator Services',
    items: [
      'Every community event includes a Rental Coordinator who will serve as your primary contact before and during your event, provide facility orientation, be available by phone during your event, conduct pre/post event inspections, ensure proper security and facility usage, and assist with basic building system troubleshooting.',
    ],
  },
  {
    title: 'Wi-Fi Access',
    items: [
      'Complimentary Wi-Fi access is available to all renters. Network name and password will be provided by your Rental Coordinator. Please note that bandwidth is limited and intended for basic use only.',
    ],
  },
  {
    title: 'Building Use Guidelines',
    items: [
      'Prohibited: alcohol, smoking indoors, helium balloons indoors, open flames.',
      'Decorations: only Command Strips on walls (must be removed after the event).',
      'Food & drink: not permitted in the sanctuary without approval.',
      'Furniture: you are responsible for setup, takedown, and returning it to its original position.',
      'Supplies: please bring your own tablecloths, paper goods, and drinks.',
      'Cleanup: sweep/mop floors, remove trash, clean kitchen surfaces, remove decorations.',
      'Security: turn off lights/HVAC, lock doors upon leaving.',
    ],
  },
  {
    title: 'Liability & Responsibility',
    items: [
      'The person signing this agreement must be present during the entire event.',
      'The renter is responsible for all guests, activities, and any property damage.',
      'By signing, you agree to hold Upper Room Fellowship harmless from any claims.',
    ],
  },
  {
    title: 'Important Reminders',
    items: [
      'Events must end by 10:00 PM unless special permission is granted.',
      'Children must be supervised at all times.',
      'Capacity limits must be observed for each space.',
      'Emergency exits must remain clear.',
    ],
  },
  {
    title: 'Weather & Emergency Policy',
    items: [
      'In case of severe weather or emergency situations that affect use of the facility, Upper Room Fellowship will make every effort to contact you as soon as possible.',
      'If the church must cancel your event due to weather or unforeseen circumstances, you will receive a full refund of your deposit and any payments made.',
      'If you need to cancel due to severe weather conditions, please contact the church office immediately. Rescheduling options will be offered based on availability.',
    ],
  },
  {
    title: 'Deposit Information',
    items: [
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

async function sendViaResend(apiKey: string, from: string, to: string, subject: string, html: string) {
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
    const notificationEmail = settings?.notification_email || 'info@urfellowship.com';

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
      sendViaResend(apiKey, from, notificationEmail, `New Facility Rental Request: ${rental.event_name} (${rental.event_date})`, notificationHtml),
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
