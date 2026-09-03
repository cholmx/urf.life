import { C, font } from '../../lib/theme';
import { btnGhost } from '../ui/inputs';
import { formatDateNice } from '../../lib/helpers';
import type { Announcement } from '../../types';
import type { ReactNode } from 'react';

const TEAL = '#000000';
const TEAL_LIGHT = '#FFFFFF';
const ORANGE = '#000000';
const LOGO_URL = '/logonegtransblack.png';

interface WeeklyTabProps {
  announcements: Announcement[];
  today: string;
}

function getWeekStart(dateStr: string): Date {
  const d = new Date(dateStr + 'T12:00:00');
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  return d;
}

function getWeekEnd(start: Date): Date {
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return end;
}

function isThisWeek(a: Announcement, weekStart: Date, weekEnd: Date): boolean {
  const dates: string[] = [];
  if (a.event_date) dates.push(a.event_date);
  if (a.event_dates?.length) dates.push(...a.event_dates.filter(Boolean));
  if (!dates.length) return false;
  return dates.some(d => {
    const dd = new Date(d + 'T12:00:00');
    return dd >= weekStart && dd <= weekEnd;
  });
}

function formatDateRange(start: Date, end: Date): string {
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  return `${fmt(start)} to ${fmt(end)}`;
}

function getSundayDate(weekStart: Date): string {
  return weekStart.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function announcementDateLabel(a: Announcement): string {
  if (a.recurrence_type === 'weekly' && a.recurrence_label) return a.recurrence_label;
  if (a.recurrence_type === 'date_range' && a.recurrence_label) return a.recurrence_label;
  if (a.event_date) return formatDateNice(a.event_date);
  if (a.event_dates?.length) return a.event_dates.map(formatDateNice).join(', ');
  return '';
}

function getAnnouncementBody(a: Announcement): string {
  const raw = a.flyer_text || a.body || a.short_version || '';
  return raw.replace(new RegExp(`^${a.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*[:\\-–—]?\\s*`, 'i'), '');
}

export function WeeklyTab({ announcements, today }: WeeklyTabProps) {
  const weekStart = getWeekStart(today);
  const weekEnd = getWeekEnd(weekStart);
  const weekLabel = formatDateRange(weekStart, weekEnd);
  const sundayDate = getSundayDate(weekStart);

  const weekItems = announcements
    .filter(a => isThisWeek(a, weekStart, weekEnd))
    .sort((a, b) => {
      const da = a.event_date || a.event_dates?.[0] || '';
      const db = b.event_date || b.event_dates?.[0] || '';
      return da < db ? -1 : da > db ? 1 : 0;
    });

  const handlePrint = () => {
    const html = buildBulletinHTML(weekItems, sundayDate);
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.top = '-10000px';
    iframe.style.left = '-10000px';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow?.document;
    if (!doc) return;
    doc.open();
    doc.write(html);
    doc.close();
    setTimeout(() => {
      try { iframe.contentWindow?.focus(); iframe.contentWindow?.print(); }
      catch { /* ignore */ }
      setTimeout(() => document.body.removeChild(iframe), 1000);
    }, 800);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h3 style={{ fontFamily: font.display, fontSize: 16, fontWeight: 800, color: C.text, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Weekly Bulletin
          </h3>
          <p style={{ fontFamily: font.body, fontSize: 13, color: C.textSec, margin: 0 }}>
            {weekItems.length} announcement{weekItems.length !== 1 ? 's' : ''} for {weekLabel}. Prints two identical bulletins per page (front and back) on landscape paper with a cut line down the middle.
          </p>
        </div>
        <button onClick={handlePrint} style={{ ...btnGhost, fontSize: 12, padding: '7px 14px' }}>
          Print / Save PDF
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
        <div style={{ fontFamily: font.display, fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
          Front (Page 1)
        </div>
        <BulletinPreview items={weekItems} sundayDate={sundayDate} side="front" />
        <div style={{ fontFamily: font.display, fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: 8 }}>
          Back (Page 2)
        </div>
        <BulletinPreview items={weekItems} sundayDate={sundayDate} side="back" />
      </div>
    </div>
  );
}

/* ── Preview wrappers ────────────────────────────────────────────── */

function BulletinPreview({ items, sundayDate, side }: { items: Announcement[]; sundayDate: string; side: 'front' | 'back' }) {
  return (
    <div style={{
      width: '11in',
      height: '8.5in',
      background: '#fff',
      fontFamily: font.body,
      display: 'flex',
      boxSizing: 'border-box',
      overflow: 'hidden',
      boxShadow: '0 4px 32px rgba(0,0,0,0.10)',
      border: '1px solid #000',
      position: 'relative',
    }}>
      <BulletinHalf>{side === 'front'
        ? <FrontContent items={items} sundayDate={sundayDate} />
        : <BackContent />}</BulletinHalf>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: 0, borderLeft: '1px dashed #000', pointerEvents: 'none' }} />
      <BulletinHalf>{side === 'front'
        ? <FrontContent items={items} sundayDate={sundayDate} />
        : <BackContent />}</BulletinHalf>
    </div>
  );
}

function BulletinHalf({ children }: { children: ReactNode }) {
  return (
    <div style={{
      width: '5.5in',
      height: '8.5in',
      display: 'flex',
      flexDirection: 'column',
      padding: '0.75in 0.7in',
      boxSizing: 'border-box',
      overflow: 'hidden',
    }}>
      {children}
    </div>
  );
}

/* ── Shared header ───────────────────────────────────────────────── */

function BulletinHeader({ size = 'full' }: { size?: 'full' | 'compact' }) {
  const logoH = size === 'compact' ? 40 : 52;
  const line1Size = size === 'compact' ? 18 : 22;
  const line2Size = size === 'compact' ? 13 : 16;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
      <img src={LOGO_URL} alt="URF" style={{ height: logoH, width: 'auto', flexShrink: 0 }} />
      <div>
        <div style={{ fontFamily: font.display, fontSize: line1Size, fontWeight: 900, color: TEAL, lineHeight: 1, letterSpacing: '-0.01em' }}>
          Upper Room Fellowship
        </div>
        <div style={{ fontFamily: font.display, fontSize: line2Size, fontWeight: 700, color: ORANGE, lineHeight: 1.1, marginTop: 2 }}>
          Weekly Announcements
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div style={{ borderTop: `1.5pt solid ${ORANGE}`, paddingTop: 7, textAlign: 'center', flexShrink: 0, marginTop: 6 }}>
      <div style={{ fontFamily: font.body, fontSize: 7.5, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: TEAL }}>
        Upper Room Fellowship &nbsp;·&nbsp; urf.life &nbsp;·&nbsp; Info@urfellowship.com
      </div>
    </div>
  );
}

/* ── Front side ──────────────────────────────────────────────────── */

function FrontContent({ items, sundayDate }: { items: Announcement[]; sundayDate: string }) {
  return (
    <>
      <BulletinHeader />
      <div style={{ fontFamily: font.display, fontSize: 10, fontWeight: 600, color: ORANGE, letterSpacing: '0.1em', marginBottom: 2 }}>
        {sundayDate}
      </div>
      <div style={{ borderTop: `2.5pt solid ${ORANGE}`, marginTop: 8, marginBottom: 10, flexShrink: 0 }} />

      <div style={{ flex: 1, overflow: 'hidden' }}>
        {items.length === 0 && (
          <div style={{ color: '#000', padding: '40px 0', textAlign: 'center', fontSize: 13 }}>
            No announcements for this week.
          </div>
        )}
        {items.map(a => <FrontAnnouncement key={a.id} a={a} />)}
      </div>

      <Footer />
    </>
  );
}

function FrontAnnouncement({ a }: { a: Announcement }) {
  const dateLabel = announcementDateLabel(a);
  const accent = a.scope === 'whole_church' ? ORANGE : TEAL;
  const text = getAnnouncementBody(a);

  return (
    <div style={{
      display: 'flex',
      gap: 10,
      padding: '8px 0',
      borderBottom: '1pt solid #000',
      alignItems: 'flex-start',
    }}>
      <div style={{ width: '4pt', alignSelf: 'stretch', minHeight: '0.35in', background: accent, borderRadius: '2pt', flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', marginBottom: 2 }}>
          <span style={{ fontFamily: font.display, fontSize: 13, fontWeight: 800, color: TEAL }}>{a.title}</span>
          {dateLabel && <span style={{ fontFamily: font.display, fontSize: 10, fontWeight: 700, color: ORANGE }}>{dateLabel}</span>}
          {a.ministry && <Pill>{a.ministry}</Pill>}
        </div>
        {text && <div style={{ fontFamily: font.body, fontSize: 10.5, color: '#1A1A1A', lineHeight: 1.3, marginBottom: 2 }}>{text}</div>}
        {a.contact_info && <ContactLine a={a} />}
      </div>
    </div>
  );
}

function Pill({ children }: { children: ReactNode }) {
  return (
    <span style={{ fontFamily: font.body, fontSize: 7.5, fontWeight: 700, color: TEAL, background: TEAL_LIGHT, borderRadius: '999px', padding: '2pt 7pt' }}>
      {children}
    </span>
  );
}

function ContactLine({ a }: { a: Announcement }) {
  return (
    <div style={{ fontFamily: font.body, fontSize: 8, color: '#000', marginTop: 3 }}>
      {a.contact_name ? `${a.contact_name}, ` : ''}{a.contact_info}
    </div>
  );
}

/* ── Back side ───────────────────────────────────────────────────── */

const BACK_SECTIONS: { title: string; color: string; body: string }[] = [
  { title: 'Table Groups', color: TEAL, body: 'Life is better together. Table Groups meet in homes throughout the community to study, pray, and share life. Groups run in 8&ndash;12 week semesters and meet biweekly or monthly, with options for every age and stage of life. Sign up at urf.life or ask at the Connection Center to find a group near you.' },
  { title: 'Upper Room Kids', color: TEAL, body: 'Kids from birth through 5th grade start in the main service with their families, then head to age-appropriate classes during the message. Our nursery is open the entire service, and a parent viewing room is available for those with little ones. All volunteers are background-checked and trained, and our secure check-in system means only authorized adults can pick up your child.' },
  { title: 'Listen Everywhere', color: TEAL, body: 'Need help hearing the service? The Listen Everywhere app streams our audio straight to your phone or tablet &mdash; just bring your own headphones. Free on the App Store and Google Play.' },
  { title: 'Social and Online', color: TEAL, body: 'Follow us and stay connected between Sundays.<br><strong style="color:' + TEAL + ';">Facebook:</strong> facebook.com/urfellowship<br><strong style="color:' + TEAL + ';">Instagram:</strong> instagram.com/urfellowship<br><strong style="color:' + TEAL + ';">YouTube:</strong> The Upper Room Fellowship' },
  { title: 'Contact Us', color: TEAL, body: 'Have a question or need prayer? We would love to hear from you.<br><strong style="color:' + TEAL + ';">Info@urfellowship.com</strong>' },
];

function BackContent() {
  return (
    <>
      <BulletinHeader size="compact" />
      <div style={{ borderTop: `2.5pt solid ${ORANGE}`, marginTop: 6, marginBottom: 12, flexShrink: 0 }} />

      <div style={{ flex: 1 }} />

      <div style={{
        flexShrink: 0,
        padding: '12px 14px',
        background: '#FFFFFF',
        borderRadius: '6px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}>
        {BACK_SECTIONS.map(s => <BackSection key={s.title} {...s} />)}
      </div>

      <Footer />
    </>
  );
}

function BackSection({ title, color, body }: { title: string; color: string; body: string }) {
  return (
    <div>
      <div style={{ fontFamily: font.display, fontSize: 10, fontWeight: 800, color, marginBottom: 2, lineHeight: 1, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {title}
      </div>
      <div style={{ fontFamily: font.body, fontSize: 9, color: '#1A1A1A', lineHeight: 1.25 }}
        dangerouslySetInnerHTML={{ __html: body }} />
    </div>
  );
}

/* ── Print HTML ──────────────────────────────────────────────────── */

function buildBulletinHTML(items: Announcement[], sundayDate: string): string {
  const itemsHTML = items.length === 0
    ? `<div style="color:#000;padding:40px 0;text-align:center;font-size:13pt;">No announcements for this week.</div>`
    : items.map(a => {
        const dateLabel = announcementDateLabel(a);
        const accent = a.scope === 'whole_church' ? ORANGE : TEAL;
        const raw = a.flyer_text || a.body || a.short_version || '';
        const text = raw.replace(new RegExp(`^${a.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*[:\\-–—]?\\s*`, 'i'), '');
        return `<div style="display:flex;gap:10px;padding:8px 0;border-bottom:1pt solid #000;align-items:flex-start;">
          <div style="width:4pt;align-self:stretch;min-height:0.35in;background:${accent};border-radius:2pt;flex-shrink:0;"></div>
          <div style="flex:1;min-width:0;">
            <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-bottom:2px;">
              <span style="font-family:'Inter Tight',sans-serif;font-size:13pt;font-weight:800;color:${TEAL};">${a.title}</span>
              ${dateLabel ? `<span style="font-family:'Inter Tight',sans-serif;font-size:10pt;font-weight:700;color:${ORANGE};">${dateLabel}</span>` : ''}
              ${a.ministry ? `<span style="font-family:'Inter',sans-serif;font-size:7.5pt;font-weight:700;color:${TEAL};background:${TEAL_LIGHT};border-radius:999px;padding:2pt 7pt;">${a.ministry}</span>` : ''}
            </div>
            ${text ? `<div style="font-family:'Inter',sans-serif;font-size:10.5pt;color:#1A1A1A;line-height:1.3;margin-bottom:2px;">${text}</div>` : ''}
            ${a.contact_info ? `<div style="font-family:'Inter',sans-serif;font-size:8pt;color:#000;margin-top:3px;">${a.contact_name ? `${a.contact_name}, ` : ''}${a.contact_info}</div>` : ''}
          </div>
        </div>`;
      }).join('');

  const frontHalf = buildPrintFront(itemsHTML, sundayDate);
  const backHalf = buildPrintBack();

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Upper Room Fellowship Weekly Announcements - ${sundayDate}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter+Tight:ital,wght@0,400;0,600;0,700;0,800;0,900;1,400&family=Inter:ital,opsz,wght@0,14..32,400;0,14..32,500;0,14..32,700;1,14..32,400&display=swap" rel="stylesheet">
  <style>
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #fff; }
    .page { width: 11in; height: 8.5in; display: flex; page-break-after: always; break-after: page; overflow: hidden; position: relative; }
    .bulletin { width: 5.5in; height: 8.5in; display: flex; flex-direction: column; padding: 0.75in 0.7in; box-sizing: border-box; overflow: hidden; }
    .cut-line { position: absolute; top: 0; bottom: 0; left: 50%; width: 0; border-left: 1px dashed #000; pointer-events: none; }
    @page { size: 11in 8.5in landscape; margin: 0; }
    @media screen { body { background: #eee; padding: 20px; display: flex; flex-direction: column; gap: 16px; align-items: center; } .page { box-shadow: 0 4px 24px rgba(0,0,0,0.12); } }
  </style>
</head>
<body>
  <div class="page">
    ${frontHalf}
    <div class="cut-line"></div>
    ${frontHalf}
  </div>
  <div class="page">
    ${backHalf}
    <div class="cut-line"></div>
    ${backHalf}
  </div>
  <script>
    window.addEventListener('load', function() { setTimeout(function() { window.print(); }, 600); });
  </script>
</body>
</html>`;
}

function buildPrintFront(itemsHTML: string, sundayDate: string): string {
  return `<div class="bulletin">
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:12px;">
      <img src="${LOGO_URL}" alt="URF" style="height:52px;width:auto;flex-shrink:0;" />
      <div>
        <div style="font-family:'Inter Tight',sans-serif;font-size:22pt;font-weight:900;color:${TEAL};line-height:1;letter-spacing:-0.01em;">Upper Room Fellowship</div>
        <div style="font-family:'Inter Tight',sans-serif;font-size:16pt;font-weight:700;color:${ORANGE};line-height:1.1;margin-top:2px;">Weekly Announcements</div>
      </div>
    </div>
    <div style="font-family:'Inter Tight',sans-serif;font-size:10pt;font-weight:600;color:${ORANGE};letter-spacing:0.1em;margin-bottom:2px;">${sundayDate}</div>
    <div style="border-top:2.5pt solid ${ORANGE};margin-top:8px;margin-bottom:10px;flex-shrink:0;"></div>
    <div style="flex:1;overflow:hidden;">
      ${itemsHTML}
    </div>
    <div style="border-top:1.5pt solid ${ORANGE};padding-top:7px;text-align:center;flex-shrink:0;margin-top:6px;">
      <div style="font-family:'Inter',sans-serif;font-size:7.5pt;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:${TEAL};">Upper Room Fellowship &nbsp;&middot;&nbsp; urf.life &nbsp;&middot;&nbsp; Info@urfellowship.com</div>
    </div>
  </div>`;
}

function buildPrintBack(): string {
  const sectionsHTML = BACK_SECTIONS.map(s =>
    `<div>
      <div style="font-family:'Inter Tight',sans-serif;font-size:10pt;font-weight:800;color:${s.color};margin-bottom:2px;line-height:1;text-transform:uppercase;letter-spacing:0.06em;">${s.title}</div>
      <div style="font-family:'Inter',sans-serif;font-size:9pt;color:#1A1A1A;line-height:1.25;">${s.body}</div>
    </div>`).join('');

  return `<div class="bulletin">
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:12px;">
      <img src="${LOGO_URL}" alt="URF" style="height:40px;width:auto;flex-shrink:0;" />
      <div>
        <div style="font-family:'Inter Tight',sans-serif;font-size:18pt;font-weight:900;color:${TEAL};line-height:1;letter-spacing:-0.01em;">Upper Room Fellowship</div>
        <div style="font-family:'Inter Tight',sans-serif;font-size:13pt;font-weight:700;color:${ORANGE};line-height:1.1;margin-top:2px;">Weekly Announcements</div>
      </div>
    </div>
    <div style="border-top:2.5pt solid ${ORANGE};margin-top:6px;margin-bottom:12px;flex-shrink:0;"></div>
    <div style="flex:1;"></div>
    <div style="flex-shrink:0;padding:12px 14px;background:#FFFFFF;border-radius:6px;display:flex;flex-direction:column;gap:8px;">
      ${sectionsHTML}
    </div>
    <div style="border-top:1.5pt solid ${ORANGE};padding-top:7px;text-align:center;flex-shrink:0;margin-top:6px;">
      <div style="font-family:'Inter',sans-serif;font-size:7.5pt;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:${TEAL};">Upper Room Fellowship &nbsp;&middot;&nbsp; urf.life &nbsp;&middot;&nbsp; Info@urfellowship.com</div>
    </div>
  </div>`;
}
