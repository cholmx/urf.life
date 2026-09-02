import type { Announcement, RecurrenceType } from '../../types';

const TEAL = '#003B36';
const ORANGE = '#E98A15';

interface InviteData {
  title: string;
  dateStr: string;
  endStr: string;
  timeStr: string;
  location: string;
  address: string;
  flyerText: string;
  inviteNote: string;
  contactName: string;
  contactInfo: string;
  imageUrl: string;
  recurrenceStr: string;
  recurrenceType: RecurrenceType;
}

function buildPostcardHTML(d: InviteData): string {
  const imageBlock = d.imageUrl
    ? `<div style="width:100%;height:1.1in;background:url('${d.imageUrl}') center/cover no-repeat;border-radius:6pt;margin-bottom:0.18in;"></div>`
    : '';

  const titleSize = d.title.length > 30 ? '22pt' : d.title.length > 20 ? '25pt' : '30pt';

  const recurrenceBlock = '';

  const dateLine = d.recurrenceStr
    ? d.recurrenceStr
    : d.dateStr;

  return `<div class="card" style="width:5.5in;height:4.25in;background:#fff;font-family:'Inter',sans-serif;display:flex;flex-direction:column;box-sizing:border-box;padding:0.65in 0.6in;overflow:hidden;">
    ${imageBlock}
    <div style="flex-shrink:0;text-align:left;padding-bottom:10pt;border-bottom:4pt solid ${ORANGE};">
      <div style="font-family:'Caladea',Georgia,serif;font-style:italic;font-size:22pt;color:${ORANGE};margin-bottom:0;line-height:1;">
        You're Invited
      </div>
      <div class="invite-title" style="font-family:'Google Sans Flex','Inter',sans-serif;font-size:${titleSize};font-weight:900;color:${TEAL};letter-spacing:-0.025em;line-height:0.9;margin-top:0;white-space:nowrap;overflow:hidden;text-transform:uppercase;">
        ${d.title}
      </div>
    </div>
    <div style="text-align:left;border-left:4pt solid ${TEAL};padding:8pt 0 8pt 10pt;margin-top:10pt;">
      <div style="font-family:'Google Sans Flex','Inter',sans-serif;font-size:14pt;font-weight:800;color:${TEAL};line-height:0.98;">
        ${dateLine}
      </div>
      ${recurrenceBlock}
      ${d.timeStr ? `<div style="font-family:'Caladea',Georgia,serif;font-style:italic;font-size:14pt;color:${ORANGE};margin-top:4pt;line-height:1.0;">@ ${d.timeStr}</div>` : ''}
      ${d.location ? `<div style="font-family:'Inter',sans-serif;font-size:11pt;font-weight:800;color:${TEAL};margin-top:6pt;line-height:1.0;">${d.location}</div>` : ''}
      ${d.address ? `<div style="font-family:'Inter',sans-serif;font-size:10pt;color:#666;margin-top:2pt;line-height:1.0;">${d.address}</div>` : ''}
      ${d.flyerText ? `<div style="font-family:'Inter',sans-serif;font-size:10pt;color:#222;line-height:1.08;margin-top:7pt;max-width:4.2in;white-space:pre-wrap;">${d.flyerText}</div>` : ''}
      ${d.inviteNote ? `<div style="font-family:'Caladea',Georgia,serif;font-style:italic;font-size:11pt;color:${ORANGE};margin-top:7pt;max-width:4.2in;line-height:1.0;">&ldquo;${d.inviteNote}&rdquo;</div>` : ''}
    </div>
    <div style="border-top:1pt solid #D5E8E2;padding-top:6pt;text-align:left;flex-shrink:0;margin-top:auto;">
      ${(d.contactName || d.contactInfo) ? `<div style="font-family:'Inter',sans-serif;font-size:9pt;font-weight:600;color:#666;margin-bottom:3pt;line-height:1.0;">Questions? ${d.contactName ? `${d.contactName}, ` : ''}${d.contactInfo}</div>` : ''}
    </div>
  </div>`;
}

function buildInviteHTML(d: InviteData): string {
  const card = buildPostcardHTML(d);
  const grid = [card, card, card, card].join('\n');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invites - ${d.title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:wght@400;500;700;900&family=Inter:ital,opsz,wght@0,14..32,400;0,14..32,500;0,14..32,700;1,14..32,400&family=Caladea:ital,wght@0,400;1,400;1,700&display=swap" rel="stylesheet">
  <style>
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #fff; }
    .page { width: 11in; height: 8.5in; page-break-after: always; break-after: page; display: flex; flex-wrap: wrap; position: relative; }
    .cut-h { position: absolute; left: 0; right: 0; top: 4.25in; height: 0; border-top: 0.5pt dashed #E5E5E5; pointer-events: none; }
    .cut-v { position: absolute; top: 0; bottom: 0; left: 5.5in; width: 0; border-left: 0.5pt dashed #E5E5E5; pointer-events: none; }
    @page { size: 11in 8.5in; margin: 0; }
    @media screen { body { background: #eee; padding: 20px; display: flex; justify-content: center; } .page { box-shadow: 0 4px 24px rgba(0,0,0,0.12); } }
  </style>
</head>
<body>
  <div class="page">
    ${grid}
    <div class="cut-h"></div>
    <div class="cut-v"></div>
  </div>
</body>
<script>
  (function() {
    document.querySelectorAll('.invite-title').forEach(function(el) {
      var max = 30;
      var min = 10;
      el.style.fontSize = max + 'pt';
      for (var s = max; s >= min; s -= 0.5) {
        el.style.fontSize = s + 'pt';
        if (el.scrollWidth <= el.clientWidth) break;
      }
    });
  })();
</script>
</html>`;
}

function formatTime12h(time: string): string {
  if (!time) return '';
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$/i);
  if (!match) return time;
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = match[3]?.toLowerCase() as 'am' | 'pm' | undefined;
  let suffix: 'am' | 'pm';
  if (period) {
    suffix = period;
    if (period === 'am' && hours === 12) hours = 0;
  } else {
    suffix = hours >= 12 ? 'pm' : 'am';
    if (hours === 0) hours = 12;
    if (hours > 12) hours -= 12;
  }
  return `${hours}:${minutes}${suffix}`;
}

export function buildInviteHTMLFromAnnouncement(a: Announcement): string {
  const dateStr = a.event_date
    ? new Date(a.event_date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : '';
  const endStr = a.recurrence_end_date
    ? new Date(a.recurrence_end_date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : '';
  const rawTime = a.event_time || (a.slide_override
    ? a.slide_override.split('|').slice(1).join('|').trim()
    : '');
  const timeStr = formatTime12h(rawTime);

  return buildInviteHTML({
    title: a.title,
    dateStr,
    endStr: a.recurrence_type === 'date_range' ? endStr : '',
    timeStr,
    location: a.event_location || '',
    address: '',
    flyerText: a.flyer_text || '',
    inviteNote: a.stage_notes || '',
    contactName: a.contact_name || '',
    contactInfo: a.contact_info || '',
    imageUrl: '',
    recurrenceStr: a.recurrence_label || '',
    recurrenceType: a.recurrence_type,
  });
}

export { buildInviteHTML };