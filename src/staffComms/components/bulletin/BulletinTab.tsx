import { useEffect, useRef, useState } from 'react';
import { C, font } from '../../lib/theme';
import { btnGhost } from '../ui/inputs';
import { getActiveMonthlyItems, formatDateNice, escapeHtml, stripLeadingTitle } from '../../lib/helpers';
import type { Announcement } from '../../types';
import type { ReactNode } from 'react';

const TEAL = '#000000';
const TEAL_LIGHT = '#FFFFFF';
const ORANGE = '#000000';
const LOGO_URL = '/logonegtransblack.png';
// The bulletin's own headings (org name, item titles) use the site's real
// heading font, not the admin's own Inter Tight (font.display) - this is
// printed material representing the public site, independent of the admin
// UI it's edited in.
const BULLETIN_FONT = "'Google Sans Flex', Inter, sans-serif";

interface BulletinTabProps {
  announcements: Announcement[];
  today: string;
}

function getMonthLabel(today: string): string {
  return new Date(today + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function announcementDateLabel(a: Announcement): string {
  if (a.recurrence_type === 'weekly' && a.recurrence_label) return a.recurrence_label;
  if (a.recurrence_type === 'biweekly' && a.recurrence_label) return a.recurrence_label;
  if (a.recurrence_type === 'monthly' && a.recurrence_label) return a.recurrence_label;
  if (a.recurrence_type === 'date_range' && a.recurrence_label) return a.recurrence_label;
  if (a.event_date) return formatDateNice(a.event_date);
  if (a.event_dates?.length) return a.event_dates.map(formatDateNice).join(', ');
  return '';
}

function getAnnouncementBody(a: Announcement): string {
  const raw = a.flyer_text || a.short_version || '';
  return stripLeadingTitle(raw, a.title);
}

/* ── Fit calculation ────────────────────────────────────────────────
   One-sided bulletin: every active item renders once on a single
   5.5x8.5in half-page (same text printed twice on the landscape sheet,
   cut down the middle, for two copies). Text shrinks in tiers as the
   month gets busier, same idea as the Monthly Flyer's getScaleParams,
   so everything still fits on the one side instead of needing a back
   page. */

export const BULLETIN_CONTENT_WIDTH_PT = (5.5 - 0.75 * 2) * 72;
export const BULLETIN_CONTENT_HEIGHT_PT = (8.5 - 0.85 * 2) * 72;
// Rough fixed cost of the header, date line, divider, and footer, in
// points - whatever's left is available for items.
export const FRONT_CHROME_PT = 138;

function estimateWrappedLines(text: string, fontSizePt: number, widthPt: number): number {
  if (!text) return 0;
  const charsPerLine = Math.max(1, Math.floor(widthPt / (fontSizePt * 0.46)));
  return Math.max(1, Math.ceil(text.length / charsPerLine));
}

export interface BulletinScale {
  titleFontSize: number;
  dateFontSize: number;
  bodyFontSize: number;
  contactFontSize: number;
  itemPadV: number;
}

// Ordered largest to smallest - pickBulletinScale walks these to find the
// largest one where every item actually fits on the one side, rather than
// just guessing from item count the way getScaleParams does for the
// Monthly Flyer.
export const BULLETIN_SCALE_TIERS: BulletinScale[] = [
  { titleFontSize: 11.5, dateFontSize: 9, bodyFontSize: 9.5, contactFontSize: 7.5, itemPadV: 11 },
  { titleFontSize: 10.5, dateFontSize: 8.5, bodyFontSize: 9, contactFontSize: 7, itemPadV: 8 },
  { titleFontSize: 9.5, dateFontSize: 8, bodyFontSize: 8.5, contactFontSize: 6.5, itemPadV: 6 },
  { titleFontSize: 8.5, dateFontSize: 7.5, bodyFontSize: 8, contactFontSize: 6, itemPadV: 5 },
  { titleFontSize: 7.5, dateFontSize: 6.5, bodyFontSize: 7, contactFontSize: 5.5, itemPadV: 4 },
  { titleFontSize: 6.5, dateFontSize: 6, bodyFontSize: 6.5, contactFontSize: 5, itemPadV: 3 },
];

export function estimateItemHeightPt(a: Announcement, scale: BulletinScale): number {
  const text = getAnnouncementBody(a);
  let h = scale.titleFontSize * 1.25 + 4;
  if (text) h += estimateWrappedLines(text, scale.bodyFontSize, BULLETIN_CONTENT_WIDTH_PT) * scale.bodyFontSize * 1.4 + 4;
  if (a.contact_info) h += scale.contactFontSize * 1.2 + 4;
  h += scale.itemPadV * 2 * 0.75;
  return h;
}

// Falls back to the smallest tier (same as the Monthly Flyer) rather than
// looping forever or dropping anything - at that point it's as small as
// it can readably go, same degrade-gracefully behavior as before.
export function pickBulletinScale(items: Announcement[]): BulletinScale {
  const budget = BULLETIN_CONTENT_HEIGHT_PT - FRONT_CHROME_PT;
  for (const scale of BULLETIN_SCALE_TIERS) {
    const used = items.reduce((sum, a) => sum + estimateItemHeightPt(a, scale), 0);
    if (used <= budget) return scale;
  }
  return BULLETIN_SCALE_TIERS[BULLETIN_SCALE_TIERS.length - 1];
}

export function BulletinTab({ announcements, today }: BulletinTabProps) {
  const monthLabel = getMonthLabel(today);
  // Same source as the Monthly Flyer - isMonthlyActive filtered, soonest
  // date first - so the two printables always agree on what's current.
  const monthItems = getActiveMonthlyItems(announcements, today);
  const bulletinScale = pickBulletinScale(monthItems);

  const handlePrint = () => {
    const html = buildBulletinHTML(monthItems, monthLabel);
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
            Monthly Bulletin
          </h3>
          <p style={{ fontFamily: font.body, fontSize: 13, color: C.textSec, margin: 0 }}>
            {monthItems.length} announcement{monthItems.length !== 1 ? 's' : ''} for {monthLabel}. Prints two identical copies on one landscape page with a cut line down the middle.
          </p>
        </div>
        <button onClick={handlePrint} style={{ ...btnGhost, fontSize: 12, padding: '7px 14px' }}>
          Print / Save PDF
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
        <ScaledPreview>
          <BulletinPreview items={monthItems} scale={bulletinScale} monthLabel={monthLabel} />
        </ScaledPreview>
      </div>
    </div>
  );
}

/* ── Preview wrapper ─────────────────────────────────────────────── */

// The actual preview below is a fixed 11x8.5in (at 96dpi) so it matches
// the real printed page exactly - this scales that fixed-size box down to
// whatever width the admin panel actually has, so it never forces the
// page into horizontal scrolling the way a bare 11in-wide element would
// in a narrower sidebar-and-content layout.
const PREVIEW_NATIVE_WIDTH = 11 * 96;
const PREVIEW_NATIVE_HEIGHT = 8.5 * 96;

function ScaledPreview({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const width = el.clientWidth;
      setScale(width > 0 ? Math.min(1, width / PREVIEW_NATIVE_WIDTH) : 1);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} style={{ width: '100%', maxWidth: PREVIEW_NATIVE_WIDTH, height: PREVIEW_NATIVE_HEIGHT * scale }}>
      <div style={{ width: PREVIEW_NATIVE_WIDTH, height: PREVIEW_NATIVE_HEIGHT, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        {children}
      </div>
    </div>
  );
}

function BulletinPreview({ items, scale, monthLabel }: { items: Announcement[]; scale: BulletinScale; monthLabel: string }) {
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
      <BulletinHalf><BulletinContent items={items} scale={scale} monthLabel={monthLabel} /></BulletinHalf>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: 0, borderLeft: '1px dashed #000', pointerEvents: 'none' }} />
      <BulletinHalf><BulletinContent items={items} scale={scale} monthLabel={monthLabel} /></BulletinHalf>
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
      padding: '0.85in 0.75in',
      boxSizing: 'border-box',
      overflow: 'hidden',
    }}>
      {children}
    </div>
  );
}

/* ── Shared header/footer ────────────────────────────────────────── */

function BulletinHeader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
      <img src={LOGO_URL} alt="URF" style={{ height: 52, width: 'auto', flexShrink: 0 }} />
      <div>
        <div style={{ fontFamily: BULLETIN_FONT, fontSize: 22, fontWeight: 900, color: TEAL, lineHeight: 1, letterSpacing: '-0.01em' }}>
          Upper Room Fellowship
        </div>
        <div style={{ fontFamily: BULLETIN_FONT, fontSize: 16, fontWeight: 700, color: ORANGE, lineHeight: 1.1, marginTop: 2 }}>
          Monthly Announcements
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div style={{ borderTop: `1.5pt solid ${ORANGE}`, paddingTop: 9, textAlign: 'center', flexShrink: 0, marginTop: 10 }}>
      <div style={{ fontFamily: font.body, fontSize: 7.5, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: TEAL }}>
        Upper Room Fellowship &nbsp;·&nbsp; urf.life &nbsp;·&nbsp; Info@urfellowship.com
      </div>
    </div>
  );
}

/* ── Content ─────────────────────────────────────────────────────── */

function BulletinContent({ items, scale, monthLabel }: { items: Announcement[]; scale: BulletinScale; monthLabel: string }) {
  return (
    <>
      <BulletinHeader />
      <div style={{ fontFamily: BULLETIN_FONT, fontSize: 10, fontWeight: 600, color: ORANGE, letterSpacing: '0.1em', marginBottom: 4 }}>
        {monthLabel}
      </div>
      <div style={{ borderTop: `2.5pt solid ${ORANGE}`, marginTop: 10, marginBottom: 14, flexShrink: 0 }} />

      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly' }}>
        {items.length === 0 && (
          <div style={{ color: '#000', padding: '40px 0', textAlign: 'center', fontSize: 13 }}>
            No announcements for this month.
          </div>
        )}
        {items.map(a => <BulletinAnnouncement key={a.id} a={a} scale={scale} />)}
      </div>

      <Footer />
    </>
  );
}

function BulletinAnnouncement({ a, scale }: { a: Announcement; scale: BulletinScale }) {
  const dateLabel = announcementDateLabel(a);
  const text = getAnnouncementBody(a);

  return (
    <div style={{ padding: `${scale.itemPadV}px 0` }}>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', marginBottom: 4 }}>
        <span style={{ fontFamily: BULLETIN_FONT, fontSize: scale.titleFontSize, fontWeight: 800, color: TEAL, textTransform: 'uppercase', letterSpacing: '0.01em' }}>{a.title}</span>
        {dateLabel && <span style={{ fontFamily: BULLETIN_FONT, fontSize: scale.dateFontSize, fontWeight: 700, color: ORANGE }}>{dateLabel}</span>}
        {a.ministry && <Pill fontSize={scale.contactFontSize}>{a.ministry}</Pill>}
      </div>
      {text && <div style={{ fontFamily: font.body, fontSize: scale.bodyFontSize, color: '#1A1A1A', lineHeight: 1.4, marginBottom: 4 }}>{text}</div>}
      {a.contact_info && <ContactLine a={a} fontSize={scale.contactFontSize} />}
    </div>
  );
}

function Pill({ children, fontSize = 7.5 }: { children: ReactNode; fontSize?: number }) {
  return (
    <span style={{ fontFamily: font.body, fontSize, fontWeight: 700, color: TEAL, background: TEAL_LIGHT, borderRadius: '999px', padding: '2pt 7pt' }}>
      {children}
    </span>
  );
}

function ContactLine({ a, fontSize = 7.5 }: { a: Announcement; fontSize?: number }) {
  return (
    <div style={{ fontFamily: font.body, fontSize, color: '#000', marginTop: 4 }}>
      {a.contact_name ? `${a.contact_name}, ` : ''}{a.contact_info}
    </div>
  );
}

/* ── Print HTML ──────────────────────────────────────────────────── */
// This builds the same layout as the React preview above, but as a
// standalone HTML string for the print/PDF path (see handlePrint) - there
// is no shared rendering between the two. Any visual change above (sizes,
// spacing, colors, text) needs the identical change made here too, or the
// preview and the printed page will silently drift apart.

function buildItemHTML(a: Announcement, scale: BulletinScale): string {
  const dateLabel = escapeHtml(announcementDateLabel(a));
  const raw = a.flyer_text || a.short_version || '';
  const text = escapeHtml(stripLeadingTitle(raw, a.title));
  const title = escapeHtml(a.title);
  const ministry = escapeHtml(a.ministry);
  const contactName = escapeHtml(a.contact_name);
  const contactInfo = escapeHtml(a.contact_info);
  return `<div style="padding:${scale.itemPadV}pt 0;">
    <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-bottom:4px;">
      <span style="font-family:'Google Sans Flex',Inter,sans-serif;font-size:${scale.titleFontSize}pt;font-weight:800;color:${TEAL};text-transform:uppercase;letter-spacing:0.01em;">${title}</span>
      ${dateLabel ? `<span style="font-family:'Google Sans Flex',Inter,sans-serif;font-size:${scale.dateFontSize}pt;font-weight:700;color:${ORANGE};">${dateLabel}</span>` : ''}
      ${ministry ? `<span style="font-family:'Inter',sans-serif;font-size:${scale.contactFontSize}pt;font-weight:700;color:${TEAL};background:${TEAL_LIGHT};border-radius:999px;padding:2pt 7pt;">${ministry}</span>` : ''}
    </div>
    ${text ? `<div style="font-family:'Inter',sans-serif;font-size:${scale.bodyFontSize}pt;color:#1A1A1A;line-height:1.4;margin-bottom:4px;">${text}</div>` : ''}
    ${contactInfo ? `<div style="font-family:'Inter',sans-serif;font-size:${scale.contactFontSize}pt;color:#000;margin-top:4px;">${contactName ? `${contactName}, ` : ''}${contactInfo}</div>` : ''}
  </div>`;
}

function buildBulletinHTML(items: Announcement[], monthLabel: string): string {
  const scale = pickBulletinScale(items);

  const itemsHTML = items.length === 0
    ? `<div style="color:#000;padding:40px 0;text-align:center;font-size:13pt;">No announcements for this month.</div>`
    : items.map(a => buildItemHTML(a, scale)).join('');

  const half = buildPrintBulletin(itemsHTML, monthLabel);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Upper Room Fellowship Monthly Announcements - ${monthLabel}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:wght@400;500;700;900&family=Inter:ital,opsz,wght@0,14..32,400;0,14..32,500;0,14..32,700;1,14..32,400&display=swap" rel="stylesheet">
  <style>
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #fff; }
    .page { width: 11in; height: 8.5in; display: flex; overflow: hidden; position: relative; }
    .bulletin { width: 5.5in; height: 8.5in; display: flex; flex-direction: column; padding: 0.85in 0.75in; box-sizing: border-box; overflow: hidden; }
    .cut-line { position: absolute; top: 0; bottom: 0; left: 50%; width: 0; border-left: 1px dashed #000; pointer-events: none; }
    @page { size: 11in 8.5in landscape; margin: 0; }
    @media screen { body { background: #eee; padding: 20px; display: flex; flex-direction: column; gap: 16px; align-items: center; } .page { box-shadow: 0 4px 24px rgba(0,0,0,0.12); } }
  </style>
</head>
<body>
  <div class="page">
    ${half}
    <div class="cut-line"></div>
    ${half}
  </div>
  <script>
    window.addEventListener('load', function() { setTimeout(function() { window.print(); }, 600); });
  </script>
</body>
</html>`;
}

function buildPrintBulletin(itemsHTML: string, monthLabel: string): string {
  return `<div class="bulletin">
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:14px;">
      <img src="${LOGO_URL}" alt="URF" style="height:52px;width:auto;flex-shrink:0;" />
      <div>
        <div style="font-family:'Google Sans Flex',Inter,sans-serif;font-size:22pt;font-weight:900;color:${TEAL};line-height:1;letter-spacing:-0.01em;">Upper Room Fellowship</div>
        <div style="font-family:'Google Sans Flex',Inter,sans-serif;font-size:16pt;font-weight:700;color:${ORANGE};line-height:1.1;margin-top:2px;">Monthly Announcements</div>
      </div>
    </div>
    <div style="font-family:'Google Sans Flex',Inter,sans-serif;font-size:10pt;font-weight:600;color:${ORANGE};letter-spacing:0.1em;margin-bottom:4px;">${monthLabel}</div>
    <div style="border-top:2.5pt solid ${ORANGE};margin-top:10px;margin-bottom:14px;flex-shrink:0;"></div>
    <div style="flex:1;overflow:hidden;display:flex;flex-direction:column;justify-content:space-evenly;">
      ${itemsHTML}
    </div>
    <div style="border-top:1.5pt solid ${ORANGE};padding-top:9px;text-align:center;flex-shrink:0;margin-top:10px;">
      <div style="font-family:'Inter',sans-serif;font-size:7.5pt;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:${TEAL};">Upper Room Fellowship &nbsp;&middot;&nbsp; urf.life &nbsp;&middot;&nbsp; Info@urfellowship.com</div>
    </div>
  </div>`;
}
