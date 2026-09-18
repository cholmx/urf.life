import { C, font } from '../../lib/theme';
import { btnGhost } from '../ui/inputs';
import { getActiveMonthlyItems, formatDateNice, escapeHtml, stripLeadingTitle } from '../../lib/helpers';
import type { Announcement } from '../../types';
import type { ReactNode } from 'react';

const TEAL = '#000000';
const TEAL_LIGHT = '#FFFFFF';
const ORANGE = '#000000';
const LOGO_URL = '/logonegtransblack.png';
// The bulletin's own headings (org name, item titles, section titles) use
// the site's real heading font, not the admin's own Inter Tight (font.display) -
// this is printed material representing the public site, independent of
// the admin UI it's edited in.
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
  const raw = a.flyer_text || a.short_version || a.body || '';
  return stripLeadingTitle(raw, a.title);
}

/* ── Overflow handling ──────────────────────────────────────────────
   The front page's item list used to just render everything and clip
   whatever didn't fit inside its fixed-size container - a busy month could
   silently lose announcements off the bottom. Instead: text shrinks in
   tiers as the month gets busier (same idea as the Monthly Flyer's
   getScaleParams), and anything that still doesn't fit within the front
   page's available height spills onto the back page, above the static
   info sections, rather than being cut off. */

export const BULLETIN_CONTENT_WIDTH_PT = (5.5 - 0.75 * 2) * 72;
export const BULLETIN_CONTENT_HEIGHT_PT = (8.5 - 0.85 * 2) * 72;
// Rough fixed cost of the front page's logo header, date line, divider,
// and footer, in points - whatever's left is available for items.
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

// Ordered largest to smallest - pickBulletinScale (below, after the back
// page's static-section tiers) walks these to find the largest one where
// everything actually fits on both pages, rather than just guessing from
// item count the way getScaleParams does for the Monthly Flyer. A busy
// month can need more shrinking than count alone suggests, e.g. a handful
// of long items that spill onto a back page already tight on space.
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

export function splitBulletinItems(items: Announcement[], scale: BulletinScale): { front: Announcement[]; back: Announcement[] } {
  const budget = BULLETIN_CONTENT_HEIGHT_PT - FRONT_CHROME_PT;
  const front: Announcement[] = [];
  const back: Announcement[] = [];
  let used = 0;
  for (const a of items) {
    const h = estimateItemHeightPt(a, scale);
    if (back.length === 0 && (used + h <= budget || front.length === 0)) {
      front.push(a);
      used += h;
    } else {
      back.push(a);
    }
  }
  return { front, back };
}

/* ── Back page's static info box ────────────────────────────────────
   The Table Groups / Kids / etc. sections at the bottom of the back page
   must always be fully visible, never squeezed off the fixed-size page by
   overflow items spilled from the front - their own text shrinks in tiers
   as overflow eats into the available space, same idea as the items. */

// Compact header + divider + footer, in points.
export const BACK_CHROME_PT = 104;

export interface BackSectionsScale {
  titleFontSize: number;
  bodyFontSize: number;
  lineHeight: number;
  gap: number;
  boxPadV: number;
}

export const BACK_SECTIONS_TIERS: BackSectionsScale[] = [
  { titleFontSize: 10, bodyFontSize: 9, lineHeight: 1.25, gap: 8, boxPadV: 12 },
  { titleFontSize: 9, bodyFontSize: 8, lineHeight: 1.2, gap: 6, boxPadV: 10 },
  { titleFontSize: 8, bodyFontSize: 7.25, lineHeight: 1.15, gap: 5, boxPadV: 8 },
  { titleFontSize: 7, bodyFontSize: 6.5, lineHeight: 1.1, gap: 4, boxPadV: 6 },
  { titleFontSize: 6.25, bodyFontSize: 5.75, lineHeight: 1.05, gap: 3, boxPadV: 5 },
];

export function estimateBackSectionsHeightPt(scale: BackSectionsScale): number {
  const boxWidthPt = BULLETIN_CONTENT_WIDTH_PT - 28 * 0.75;
  let total = 2 * (scale.boxPadV * 0.75);
  total += (BACK_SECTIONS.length - 1) * (scale.gap * 0.75);
  for (const s of BACK_SECTIONS) {
    total += scale.titleFontSize + 2 * 0.75;
    const plain = s.body.replace(/<[^>]+>/g, ' ');
    total += estimateWrappedLines(plain, scale.bodyFontSize, boxWidthPt) * scale.bodyFontSize * scale.lineHeight;
  }
  return total;
}

export function pickBackSectionsScale(overflowItems: Announcement[], itemScale: BulletinScale): BackSectionsScale {
  const overflowHeight = overflowItems.reduce((sum, a) => sum + estimateItemHeightPt(a, itemScale), 0);
  const overflowMargin = overflowItems.length > 0 ? 12 * 0.75 : 0;
  const available = BULLETIN_CONTENT_HEIGHT_PT - BACK_CHROME_PT - overflowHeight - overflowMargin;
  for (const tier of BACK_SECTIONS_TIERS) {
    if (estimateBackSectionsHeightPt(tier) <= available) return tier;
  }
  return BACK_SECTIONS_TIERS[BACK_SECTIONS_TIERS.length - 1];
}

// Picking an item-text tier from count alone (as the Monthly Flyer does)
// isn't enough here - a handful of long items overflowing onto the back
// page can eat all its space before the static info box gets a look in,
// and no amount of shrinking that box alone would fix it. Walk tiers
// largest to smallest and use the first one where the back page's
// overflow items still leave room for at least the smallest static-box
// tier, so the info box is never squeezed off the page.
export function pickBulletinScale(items: Announcement[]): BulletinScale {
  const smallestSectionsHeight = estimateBackSectionsHeightPt(BACK_SECTIONS_TIERS[BACK_SECTIONS_TIERS.length - 1]);
  for (const scale of BULLETIN_SCALE_TIERS) {
    const { back } = splitBulletinItems(items, scale);
    const overflowHeight = back.reduce((sum, a) => sum + estimateItemHeightPt(a, scale), 0);
    const overflowMargin = back.length > 0 ? 12 * 0.75 : 0;
    const available = BULLETIN_CONTENT_HEIGHT_PT - BACK_CHROME_PT - overflowHeight - overflowMargin;
    if (available >= smallestSectionsHeight) return scale;
  }
  return BULLETIN_SCALE_TIERS[BULLETIN_SCALE_TIERS.length - 1];
}

export function BulletinTab({ announcements, today }: BulletinTabProps) {
  const monthLabel = getMonthLabel(today);
  // Same source as the Monthly Flyer - isMonthlyActive filtered, soonest
  // date first - so the two printables always agree on what's current.
  const monthItems = getActiveMonthlyItems(announcements, today);

  const bulletinScale = pickBulletinScale(monthItems);
  const { front: frontItems, back: backOverflowItems } = splitBulletinItems(monthItems, bulletinScale);
  const backSectionsScale = pickBackSectionsScale(backOverflowItems, bulletinScale);

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
            {monthItems.length} announcement{monthItems.length !== 1 ? 's' : ''} for {monthLabel}. Prints two identical bulletins per page (front and back) on landscape paper with a cut line down the middle.
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
        <BulletinPreview frontItems={frontItems} backOverflowItems={backOverflowItems} scale={bulletinScale} sectionsScale={backSectionsScale} monthLabel={monthLabel} side="front" />
        <div style={{ fontFamily: font.display, fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: 8 }}>
          Back (Page 2)
        </div>
        <BulletinPreview frontItems={frontItems} backOverflowItems={backOverflowItems} scale={bulletinScale} sectionsScale={backSectionsScale} monthLabel={monthLabel} side="back" />
      </div>
    </div>
  );
}

/* ── Preview wrappers ────────────────────────────────────────────── */

function BulletinPreview({ frontItems, backOverflowItems, scale, sectionsScale, monthLabel, side }: { frontItems: Announcement[]; backOverflowItems: Announcement[]; scale: BulletinScale; sectionsScale: BackSectionsScale; monthLabel: string; side: 'front' | 'back' }) {
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
        ? <FrontContent items={frontItems} scale={scale} monthLabel={monthLabel} />
        : <BackContent overflowItems={backOverflowItems} scale={scale} sectionsScale={sectionsScale} />}</BulletinHalf>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: 0, borderLeft: '1px dashed #000', pointerEvents: 'none' }} />
      <BulletinHalf>{side === 'front'
        ? <FrontContent items={frontItems} scale={scale} monthLabel={monthLabel} />
        : <BackContent overflowItems={backOverflowItems} scale={scale} sectionsScale={sectionsScale} />}</BulletinHalf>
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

/* ── Shared header ───────────────────────────────────────────────── */

function BulletinHeader({ size = 'full' }: { size?: 'full' | 'compact' }) {
  const logoH = size === 'compact' ? 40 : 52;
  const line1Size = size === 'compact' ? 18 : 22;
  const line2Size = size === 'compact' ? 13 : 16;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
      <img src={LOGO_URL} alt="URF" style={{ height: logoH, width: 'auto', flexShrink: 0 }} />
      <div>
        <div style={{ fontFamily: BULLETIN_FONT, fontSize: line1Size, fontWeight: 900, color: TEAL, lineHeight: 1, letterSpacing: '-0.01em' }}>
          Upper Room Fellowship
        </div>
        <div style={{ fontFamily: BULLETIN_FONT, fontSize: line2Size, fontWeight: 700, color: ORANGE, lineHeight: 1.1, marginTop: 2 }}>
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

/* ── Front side ──────────────────────────────────────────────────── */

function FrontContent({ items, scale, monthLabel }: { items: Announcement[]; scale: BulletinScale; monthLabel: string }) {
  return (
    <>
      <BulletinHeader />
      <div style={{ fontFamily: BULLETIN_FONT, fontSize: 10, fontWeight: 600, color: ORANGE, letterSpacing: '0.1em', marginBottom: 4 }}>
        {monthLabel}
      </div>
      <div style={{ borderTop: `2.5pt solid ${ORANGE}`, marginTop: 10, marginBottom: 14, flexShrink: 0 }} />

      <div style={{ flex: 1, overflow: 'hidden' }}>
        {items.length === 0 && (
          <div style={{ color: '#000', padding: '40px 0', textAlign: 'center', fontSize: 13 }}>
            No announcements for this month.
          </div>
        )}
        {items.map(a => <FrontAnnouncement key={a.id} a={a} scale={scale} />)}
      </div>

      <Footer />
    </>
  );
}

function FrontAnnouncement({ a, scale }: { a: Announcement; scale: BulletinScale }) {
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

/* ── Back side ───────────────────────────────────────────────────── */

const BACK_SECTIONS: { title: string; color: string; body: string }[] = [
  { title: 'Table Groups', color: TEAL, body: 'Life is better together. Table Groups meet in homes throughout the community to study, pray, and share life. Groups run in 8&ndash;12 week semesters and meet biweekly or monthly, with options for every age and stage of life. Sign up at urf.life or ask at the Connection Center to find a group near you.' },
  { title: 'Upper Room Kids', color: TEAL, body: 'Kids from birth through 5th grade start in the main service with their families, then head to age-appropriate classes during the message. Our nursery is open the entire service, and a parent viewing room is available for those with little ones. All volunteers are background-checked and trained, and our secure check-in system means only authorized adults can pick up your child.' },
  { title: 'Listen Everywhere', color: TEAL, body: 'Need help hearing the service? The Listen Everywhere app streams our audio straight to your phone or tablet &mdash; just bring your own headphones. Free on the App Store and Google Play.' },
  { title: 'Social and Online', color: TEAL, body: 'Follow us and stay connected between Sundays.<br><strong style="color:' + TEAL + ';">Facebook:</strong> facebook.com/urfellowship<br><strong style="color:' + TEAL + ';">Instagram:</strong> instagram.com/urfellowship<br><strong style="color:' + TEAL + ';">YouTube:</strong> The Upper Room Fellowship' },
  { title: 'Contact Us', color: TEAL, body: 'Have a question or need prayer? We would love to hear from you.<br><strong style="color:' + TEAL + ';">Info@urfellowship.com</strong>' },
];

function BackContent({ overflowItems, scale, sectionsScale }: { overflowItems: Announcement[]; scale: BulletinScale; sectionsScale: BackSectionsScale }) {
  return (
    <>
      <BulletinHeader size="compact" />
      <div style={{ borderTop: `2.5pt solid ${ORANGE}`, marginTop: 6, marginBottom: 12, flexShrink: 0 }} />

      {overflowItems.length > 0 && (
        <div style={{ flexShrink: 0, marginBottom: 12 }}>
          {overflowItems.map(a => <FrontAnnouncement key={a.id} a={a} scale={scale} />)}
        </div>
      )}
      <div style={{ flex: 1 }} />

      <div style={{
        flexShrink: 0,
        padding: `${sectionsScale.boxPadV}px 14px`,
        background: '#FFFFFF',
        borderRadius: '6px',
        display: 'flex',
        flexDirection: 'column',
        gap: sectionsScale.gap,
      }}>
        {BACK_SECTIONS.map(s => <BackSection key={s.title} {...s} scale={sectionsScale} />)}
      </div>

      <Footer />
    </>
  );
}

function BackSection({ title, color, body, scale }: { title: string; color: string; body: string; scale: BackSectionsScale }) {
  return (
    <div>
      <div style={{ fontFamily: BULLETIN_FONT, fontSize: scale.titleFontSize, fontWeight: 800, color, marginBottom: 2, lineHeight: 1, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {title}
      </div>
      <div style={{ fontFamily: font.body, fontSize: scale.bodyFontSize, color: '#1A1A1A', lineHeight: scale.lineHeight }}
        dangerouslySetInnerHTML={{ __html: body }} />
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
  const raw = a.flyer_text || a.short_version || a.body || '';
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
  const { front, back } = splitBulletinItems(items, scale);
  const sectionsScale = pickBackSectionsScale(back, scale);

  const frontItemsHTML = front.length === 0
    ? `<div style="color:#000;padding:40px 0;text-align:center;font-size:13pt;">No announcements for this month.</div>`
    : front.map(a => buildItemHTML(a, scale)).join('');

  const backOverflowHTML = back.map(a => buildItemHTML(a, scale)).join('');

  const frontHalf = buildPrintFront(frontItemsHTML, monthLabel);
  const backHalf = buildPrintBack(backOverflowHTML, sectionsScale);

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
    .page { width: 11in; height: 8.5in; display: flex; page-break-after: always; break-after: page; overflow: hidden; position: relative; }
    .bulletin { width: 5.5in; height: 8.5in; display: flex; flex-direction: column; padding: 0.85in 0.75in; box-sizing: border-box; overflow: hidden; }
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

function buildPrintFront(itemsHTML: string, monthLabel: string): string {
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
    <div style="flex:1;overflow:hidden;">
      ${itemsHTML}
    </div>
    <div style="border-top:1.5pt solid ${ORANGE};padding-top:9px;text-align:center;flex-shrink:0;margin-top:10px;">
      <div style="font-family:'Inter',sans-serif;font-size:7.5pt;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:${TEAL};">Upper Room Fellowship &nbsp;&middot;&nbsp; urf.life &nbsp;&middot;&nbsp; Info@urfellowship.com</div>
    </div>
  </div>`;
}

function buildPrintBack(overflowItemsHTML: string, sectionsScale: BackSectionsScale): string {
  const sectionsHTML = BACK_SECTIONS.map(s =>
    `<div>
      <div style="font-family:'Google Sans Flex',Inter,sans-serif;font-size:${sectionsScale.titleFontSize}pt;font-weight:800;color:${s.color};margin-bottom:2px;line-height:1;text-transform:uppercase;letter-spacing:0.06em;">${s.title}</div>
      <div style="font-family:'Inter',sans-serif;font-size:${sectionsScale.bodyFontSize}pt;color:#1A1A1A;line-height:${sectionsScale.lineHeight};">${s.body}</div>
    </div>`).join('');

  const overflowBlock = overflowItemsHTML
    ? `<div style="flex-shrink:0;margin-bottom:12px;">${overflowItemsHTML}</div>`
    : '';

  return `<div class="bulletin">
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:14px;">
      <img src="${LOGO_URL}" alt="URF" style="height:40px;width:auto;flex-shrink:0;" />
      <div>
        <div style="font-family:'Google Sans Flex',Inter,sans-serif;font-size:18pt;font-weight:900;color:${TEAL};line-height:1;letter-spacing:-0.01em;">Upper Room Fellowship</div>
        <div style="font-family:'Google Sans Flex',Inter,sans-serif;font-size:13pt;font-weight:700;color:${ORANGE};line-height:1.1;margin-top:2px;">Monthly Announcements</div>
      </div>
    </div>
    <div style="border-top:2.5pt solid ${ORANGE};margin-top:6px;margin-bottom:12px;flex-shrink:0;"></div>
    ${overflowBlock}
    <div style="flex:1;"></div>
    <div style="flex-shrink:0;padding:${sectionsScale.boxPadV}px 14px;background:#FFFFFF;border-radius:6px;display:flex;flex-direction:column;gap:${sectionsScale.gap}px;">
      ${sectionsHTML}
    </div>
    <div style="border-top:1.5pt solid ${ORANGE};padding-top:9px;text-align:center;flex-shrink:0;margin-top:10px;">
      <div style="font-family:'Inter',sans-serif;font-size:7.5pt;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:${TEAL};">Upper Room Fellowship &nbsp;&middot;&nbsp; urf.life &nbsp;&middot;&nbsp; Info@urfellowship.com</div>
    </div>
  </div>`;
}
