import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch notification_email from the rental settings table. The column is
    // a text field that may contain a single address or a comma-separated
    // list of addresses. We split on commas and send to every address.
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from("facility_rental_settings_portal123")
      .select("notification_email")
      .limit(1)
      .maybeSingle();

    if (settingsError) {
      console.error("Error fetching rental settings:", settingsError);
      return new Response(
        JSON.stringify({ error: "Could not load notification settings" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const rawEmail = settings?.notification_email;
    if (!rawEmail) {
      return new Response(
        JSON.stringify({ error: "No notification email configured" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const recipients = rawEmail
      .split(",")
      .map((e: string) => e.trim())
      .filter((e: string) => e.length > 0);

    if (recipients.length === 0) {
      return new Response(
        JSON.stringify({ error: "No valid notification email addresses" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail = Deno.env.get("RESEND_FROM_EMAIL");

    if (!resendApiKey || !fromEmail) {
      console.error("RESEND_API_KEY or RESEND_FROM_EMAIL not configured");
      return new Response(
        JSON.stringify({ error: "Email service is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const fullName = [body.responsible_first_name, body.responsible_last_name].filter(Boolean).join(" ");
    const emailSubject = `New Facility Rental Request: ${fullName || body.event_name || "Unknown"}`;

    const emailHtml = buildEmailHtml(body);

    const sendResults = await Promise.allSettled(
      recipients.map((to: string) =>
        fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromEmail,
            to,
            subject: emailSubject,
            html: emailHtml,
          }),
        })
      )
    );

    const failures = sendResults.filter(
      (r): r is PromiseRejectedResult => r.status === "rejected"
    );

    if (failures.length === recipients.length) {
      console.error("All email sends failed:", failures);
      return new Response(
        JSON.stringify({ error: "Failed to send notification emails" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (failures.length > 0) {
      console.error(`${failures.length} of ${recipients.length} emails failed`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        sentTo: recipients.length,
        failed: failures.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("send-rental-email error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function escapeHtml(text: unknown): string {
  if (text == null) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildEmailHtml(body: Record<string, unknown>): string {
  const rooms = Array.isArray(body.rooms_requested)
    ? (body.rooms_requested as string[]).join(", ")
    : String(body.rooms_requested ?? "");
  const services = Array.isArray(body.additional_services)
    ? (body.additional_services as string[]).join(", ")
    : String(body.additional_services ?? "");
  const fullName = [body.responsible_first_name, body.responsible_last_name]
    .filter(Boolean).join(" ");

  const fields: Array<[string, string]> = [
    ["Event Name", escapeHtml(body.event_name)],
    ["Event Type", escapeHtml(body.event_type === "personal" ? "Personal" : "Community")],
    ["Organization", escapeHtml(body.organization_name)],
    ["Purpose", escapeHtml(body.purpose)],
    ["Event Date", escapeHtml(body.event_date)],
    ["Time", escapeHtml([body.event_start_time, body.event_end_time].filter(Boolean).join(" – "))],
    ["Guest Count", escapeHtml(body.guest_count)],
    ["Member", escapeHtml(body.is_member ? "Yes" : "No")],
    ["Rooms Requested", escapeHtml(rooms)],
    ["Additional Services", escapeHtml(services)],
    ["Calculated Total", escapeHtml(body.calculated_total != null ? `${body.calculated_total}` : "")],
    ["Setup Schedule", escapeHtml(body.setup_schedule === "day_of" ? "Day of event" : "Day before event")],
    ["Setup Arrival", escapeHtml(body.setup_arrival_time)],
    ["Setup Departure", escapeHtml(body.setup_departure_time)],
    ["Responsible Person", escapeHtml(fullName)],
    ["Email", escapeHtml(body.responsible_email)],
    ["Phone", escapeHtml(body.responsible_phone)],
    ["Return Address", escapeHtml(body.return_address)],
    ["Signature", escapeHtml(body.signature_name)],
    ["Signature Date", escapeHtml(body.signature_date)],
  ];

  const rows = fields
    .filter(([, value]) => value && value.length > 0)
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 16px 8px 0;font-weight:600;color:#374151;vertical-align:top;white-space:nowrap;">${label}</td><td style="padding:8px 0;color:#4B5563;">${value}</td></tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
  <h2 style="color:#1F2937;margin-bottom:16px;">New Facility Rental Request</h2>
  <p style="color:#6B7280;margin-bottom:24px;">A new facility rental request has been submitted.</p>
  <table style="width:100%;border-collapse:collapse;font-size:14px;">
    ${rows}
  </table>
  <p style="margin-top:24px;color:#9CA3AF;font-size:12px;">Submitted at ${new Date().toLocaleString()}</p>
</body>
</html>`;
}
