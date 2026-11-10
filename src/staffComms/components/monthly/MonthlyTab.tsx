import { C, font } from '../../lib/theme';
import { btnGhost } from '../ui/inputs';
import { getActiveMonthlyItems, formatDateNice, formatTime12h, escapeHtml, stripLeadingTitle } from '../../lib/helpers';
import { getNextOccurrenceDate } from '../../lib/calendar-grid';
import type { Announcement } from '../../types';

interface MonthlyTabProps {
  announcements: Announcement[];
  today: string;
}

const BATHROOM_NOTE_LINES = [
  'Please do not flush feminine hygiene products in the toilet.',
  'Please use the bags provided and deposit in the trash can.',
  'Thank you!',
];

const TEAL = '#1E2522';
const ORANGE = '#EAA235';
// Its own constant rather than font.display (currently the same Arial
// value, but this is printed material representing the public site,
// independent of whatever the admin UI's own display font happens to be
// set to).
const FLYER_FONT = "Arial, Helvetica, sans-serif";

// Weekly/biweekly/monthly items only ever store their very first session
// in event_date (see getNextOccurrenceDate's own comment) - using it
// directly here is exactly how this flyer ended up printing a recurring
// item's original first-ever date forever, regardless of which month was
// actually selected. today is optional only for estimateFlyerItemHeightPt's
// layout-estimation pass below, which doesn't care which real date it
// measures the string length of - every actual display call site passes it.
function allEventDates(a: Announcement, today?: string): string[] {
  const all = new Set<string>();
  const recurring = a.recurrence_type !== 'one_time' && a.recurrence_type !== 'date_range';
  if (today && recurring) {
    // event_dates is skipped here on purpose - for a recurring item it's
    // just a stale mirror of the original event_date (same first-session-
    // only field getNextOccurrenceDate's own comment warns about), so
    // blending it in printed "Oct 4 + Nov 1" alongside the real next
    // occurrence instead of just "Nov 1".
    const next = getNextOccurrenceDate(a, today);
    if (next) all.add(next);
  } else {
    if (a.event_date) all.add(a.event_date);
    if (a.event_dates?.length) a.event_dates.filter(Boolean).forEach(d => all.add(d));
  }
  return [...all].sort();
}

function formatDateList(a: Announcement, today?: string): string {
  const dates = allEventDates(a, today);
  if (!dates.length) return '';
  return dates.map(formatDateNice).join(' + ');
}

// Same date list, with the event's time appended - a single time (or a
// start-end range, when an end_time is set) applies across every date in
// the list, since multi-date items are the same recurring time slot on
// different days, not different times per date.
//
// A date_range item (e.g. a multi-day retreat) is a different shape
// entirely - event_date/event_time is the start, recurrence_end_date/
// end_time is the end, and allEventDates doesn't even look at
// recurrence_end_date, so without this it silently dropped the end date.
export function formatDateTimeList(a: Announcement, today?: string): string {
  if (a.recurrence_type === 'date_range' && a.event_date && a.recurrence_end_date) {
    const startDate = formatDateNice(a.event_date);
    const endDate = formatDateNice(a.recurrence_end_date);
    const start = a.event_time ? `${startDate}, ${formatTime12h(a.event_time)}` : startDate;
    const end = a.end_time ? `${endDate}, ${formatTime12h(a.end_time)}` : endDate;
    return `${start} – ${end}`;
  }

  const dateLabel = formatDateList(a, today);
  if (!dateLabel) return '';
  if (!a.event_time) return dateLabel;
  const start = formatTime12h(a.event_time);
  const timeLabel = a.end_time ? `${start}–${formatTime12h(a.end_time)}` : start;
  return `${dateLabel}, ${timeLabel}`;
}

export interface ScaleParams {
  headerFontSize: number;
  headerPadV: number;
  bodyPadV: number;
  bodyPadH: number;
  itemPadV: number;
  titleFontSize: number;
  dateFontSize: number;
  bodyFontSize: number;
  contactFontSize: number;
  contactMarginTop: number;
  titleMarginBottom: number;
  gap: number;
  subtitleFontSize: number;
  orgFontSize: number;
  monthFontSize: number;
}

// Ordered largest to smallest - pickFlyerScale (below) walks these to find
// the largest one where the header, items, and (when printing the
// bathroom-note variant) the bathroom box all actually fit on the one
// 8.5x11in page, rather than guessing from item count alone the way this
// used to (see pickFlyerScale's comment for why that broke).
export const FLYER_SCALE_TIERS: ScaleParams[] = [
  {
    headerFontSize: 50, headerPadV: 0.65, bodyPadV: 0.45, bodyPadH: 0.5,
    itemPadV: 0.22, titleFontSize: 18, dateFontSize: 12, bodyFontSize: 11,
    contactFontSize: 9, contactMarginTop: 5, titleMarginBottom: 5,
    gap: 0.18, subtitleFontSize: 11, orgFontSize: 9, monthFontSize: 50,
  },
  {
    headerFontSize: 44, headerPadV: 0.5, bodyPadV: 0.35, bodyPadH: 0.5,
    itemPadV: 0.17, titleFontSize: 16, dateFontSize: 11, bodyFontSize: 10.5,
    contactFontSize: 8.5, contactMarginTop: 4, titleMarginBottom: 4,
    gap: 0.15, subtitleFontSize: 10.5, orgFontSize: 8.5, monthFontSize: 44,
  },
  {
    headerFontSize: 38, headerPadV: 0.38, bodyPadV: 0.28, bodyPadH: 0.5,
    itemPadV: 0.13, titleFontSize: 15, dateFontSize: 10.5, bodyFontSize: 10,
    contactFontSize: 8, contactMarginTop: 3, titleMarginBottom: 3,
    gap: 0.13, subtitleFontSize: 10, orgFontSize: 8, monthFontSize: 38,
  },
  {
    headerFontSize: 32, headerPadV: 0.28, bodyPadV: 0.2, bodyPadH: 0.5,
    itemPadV: 0.1, titleFontSize: 13, dateFontSize: 10, bodyFontSize: 9.5,
    contactFontSize: 7.5, contactMarginTop: 2, titleMarginBottom: 2,
    gap: 0.11, subtitleFontSize: 9.5, orgFontSize: 7.5, monthFontSize: 32,
  },
  {
    headerFontSize: 26, headerPadV: 0.2, bodyPadV: 0.15, bodyPadH: 0.5,
    itemPadV: 0.08, titleFontSize: 12, dateFontSize: 9.5, bodyFontSize: 9,
    contactFontSize: 7, contactMarginTop: 2, titleMarginBottom: 2,
    gap: 0.09, subtitleFontSize: 9, orgFontSize: 7, monthFontSize: 26,
  },
  {
    headerFontSize: 22, headerPadV: 0.16, bodyPadV: 0.12, bodyPadH: 0.5,
    itemPadV: 0.06, titleFontSize: 11, dateFontSize: 9, bodyFontSize: 8.5,
    contactFontSize: 6.5, contactMarginTop: 2, titleMarginBottom: 2,
    gap: 0.07, subtitleFontSize: 8.5, orgFontSize: 6.5, monthFontSize: 22,
  },
  {
    headerFontSize: 18, headerPadV: 0.12, bodyPadV: 0.1, bodyPadH: 0.5,
    itemPadV: 0.05, titleFontSize: 10, dateFontSize: 8.5, bodyFontSize: 8,
    contactFontSize: 6, contactMarginTop: 1, titleMarginBottom: 1,
    gap: 0.06, subtitleFontSize: 8, orgFontSize: 6, monthFontSize: 18,
  },
];

// 8.5x11in page, 0.5in outer padding on every side, 0.5in bodyPadH on both
// sides of the item column (constant across every tier) - what's left is
// the width item text actually wraps within, and the height everything
// (header + items + bathroom box) has to fit inside vertically.
const PAGE_CONTENT_WIDTH_PT = (8.5 - 0.5 * 2 - 0.5 * 2) * 72;
const PAGE_CONTENT_HEIGHT_PT = (11 - 0.5 * 2) * 72;

function estimateWrappedLines(text: string, fontSizePt: number, widthPt: number): number {
  if (!text) return 0;
  const charsPerLine = Math.max(1, Math.floor(widthPt / (fontSizePt * 0.46)));
  return Math.max(1, Math.ceil(text.length / charsPerLine));
}

function estimateHeaderHeightPt(s: ScaleParams): number {
  const padding = s.headerPadV * 72 * 1.54; // headerPadV top + headerPadV*0.54 bottom
  const orgLine = s.orgFontSize * 1.2 + 8;
  const monthLine = s.monthFontSize + 8;
  const subtitleLine = s.subtitleFontSize * 1.2;
  const border = 3;
  return padding + orgLine + monthLine + subtitleLine + border;
}

function estimateBathroomHeightPt(s: ScaleParams): number {
  const padding = (0.3 + 0.45) * 72;
  const border = 2;
  const lines = (s.bodyFontSize + 1) * 1.5 * 2 + (s.bodyFontSize + 1.5) * 1.5;
  return padding + border + lines;
}

function estimateFlyerItemHeightPt(a: Announcement, s: ScaleParams): number {
  const rawText = a.flyer_text || a.month_override || a.short_version || '';
  const text = stripLeadingTitle(rawText, a.title);
  const dateLabel = formatDateTimeList(a);

  let h = s.titleFontSize * 1.1 + s.titleMarginBottom;
  if (dateLabel || a.ministry) h += Math.max(s.dateFontSize, s.contactFontSize) * 1.1 + 1;
  if (text) h += estimateWrappedLines(text, s.bodyFontSize, PAGE_CONTENT_WIDTH_PT) * s.bodyFontSize * 1.4;
  if (a.contact_info) h += s.contactFontSize * 1.2 + s.contactMarginTop;
  h += s.itemPadV * 72 * 2; // top + bottom item padding
  h += 1; // border-bottom hairline between items
  return h;
}

// Used to pick n <= 4/6/8/11 buckets purely from item count, with no idea
// how much text was actually in each one - a month with only 3 items could
// still run off the page if those 3 had long descriptions or (since
// date/time and multi-day ranges got added to the date line) a long date
// label, while the text sat at this function's largest, most spacious
// tier regardless. This instead estimates the real rendered height of the
// header, every item, and the bathroom box (when printing that variant)
// at each tier, and picks the largest tier where it all actually fits -
// falling back to the smallest tier, same as before, if even that doesn't.
export function pickFlyerScale(items: Announcement[], hasBathroom: boolean): ScaleParams {
  for (const s of FLYER_SCALE_TIERS) {
    const headerH = estimateHeaderHeightPt(s);
    const bathroomH = hasBathroom ? estimateBathroomHeightPt(s) : 0;
    const bodyPadding = s.bodyPadV * 72 * 1.67; // bodyPadV top + bodyPadV*0.67 bottom
    const budget = PAGE_CONTENT_HEIGHT_PT - headerH - bodyPadding - bathroomH;
    const used = items.reduce((sum, a) => sum + estimateFlyerItemHeightPt(a, s), 0);
    if (used <= budget) return s;
  }
  return FLYER_SCALE_TIERS[FLYER_SCALE_TIERS.length - 1];
}

// This builds the same layout as the React preview below (FlyerPagePreview),
// but as a standalone HTML string for the print/PDF path (see handlePrint) -
// there is no shared rendering between the two. Any visual change in one
// needs the identical change made in the other, or the preview and the
// printed page will silently drift apart.
function buildFlyerHTML(items: Announcement[], today: string, bathroomVariant: boolean): string {
  const active = getActiveMonthlyItems(items, today);
  const monthLabel = new Date(today + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const s = pickFlyerScale(active, bathroomVariant);

  const itemsHTML = active.length === 0
    ? `<div style="color:#999;padding:0.5in 0;text-align:center;font-size:11pt;">No announcements for this month.</div>`
    : active.map((a, i) => {
        const rawText = a.flyer_text || a.month_override || a.short_version || '';
        const text = escapeHtml(stripLeadingTitle(rawText, a.title));
        const title = escapeHtml(a.title);
        const ministry = escapeHtml(a.ministry);
        const contactName = escapeHtml(a.contact_name);
        const contactInfo = escapeHtml(a.contact_info);
        const isWC = a.scope === 'whole_church';
        const dateLabel = escapeHtml(formatDateTimeList(a, today));
        const dateSpan = dateLabel
          ? `<span style="font-family:${FLYER_FONT};font-size:${s.dateFontSize}pt;font-weight:700;color:${ORANGE};letter-spacing:0.05em;white-space:nowrap;flex-shrink:0;">${dateLabel}</span>`
          : '';
        const ministryTag = ministry
          ? `<span style="font-family:${font.body};font-size:${Math.max(s.contactFontSize - 0.5, 7)}pt;font-weight:700;color:${TEAL};background:${isWC ? '#FFFFFF' : '#FFFFFF'};border-radius:999px;padding:1pt 7pt;letter-spacing:0.04em;white-space:nowrap;flex-shrink:0;">${ministry}</span>`
          : '';
        const contactHTML = contactInfo
          ? `<div style="font-family:${font.body};font-size:${s.contactFontSize}pt;color:#777;margin-top:${s.contactMarginTop}pt;">${contactName ? `${contactName}, ` : ''}${contactInfo}</div>`
          : '';
        const border = i < active.length - 1 ? `border-bottom:1pt solid #2B433E;` : '';
        return `
          <div style="display:flex;gap:${s.gap}in;padding:${s.itemPadV}in 0;${border}align-items:flex-start;">
            <div style="flex:1;min-width:0;">
              <div style="margin-bottom:${s.titleMarginBottom}pt;">
                <div style="font-family:${FLYER_FONT};font-size:${s.titleFontSize}pt;font-weight:900;color:${TEAL};letter-spacing:0.02em;line-height:1.1;text-transform:uppercase;">${title}</div>
                <div style="margin-top:1pt;line-height:1.1;display:flex;gap:4pt;align-items:center;flex-wrap:wrap;">
                  ${dateSpan}
                  ${ministryTag}
                </div>
              </div>
              <div style="font-family:${font.body};font-size:${s.bodyFontSize}pt;color:#1E2522;line-height:1.4;">${text}</div>
              ${contactHTML}
            </div>
          </div>`;
      }).join('');

  const bathroomHTML = bathroomVariant ? `
    <div style="border-top:2pt solid #2B433E;padding:0.3in ${s.bodyPadH}in 0.45in;flex-shrink:0;text-align:center;">
      <div style="font-size:${s.bodyFontSize + 1}pt;color:#444;line-height:1.5;">${BATHROOM_NOTE_LINES[0]}</div>
      <div style="font-size:${s.bodyFontSize + 1}pt;color:#444;line-height:1.5;">${BATHROOM_NOTE_LINES[1]}</div>
      <div style="font-size:${s.bodyFontSize + 1.5}pt;font-weight:700;color:${TEAL};line-height:1.5;">${BATHROOM_NOTE_LINES[2]}</div>
    </div>` : '';

  return `
    <div style="width:8.5in;min-height:11in;background:#fff;font-family:${font.body};display:flex;flex-direction:column;box-sizing:border-box;padding:0.5in;">
      <div style="padding:${s.headerPadV}in 0 ${s.headerPadV * 0.54}in;flex-shrink:0;text-align:center;border-bottom:3pt solid ${ORANGE};">
        <div style="font-family:${font.body};font-size:${s.orgFontSize}pt;font-weight:700;letter-spacing:0.28em;text-transform:uppercase;color:${TEAL};margin-bottom:8pt;">Upper Room Fellowship &nbsp;·&nbsp; urf.life</div>
        <div style="font-family:${FLYER_FONT};font-size:${s.monthFontSize}pt;font-weight:900;color:${TEAL};text-transform:uppercase;letter-spacing:0.01em;line-height:0.95;margin-bottom:8pt;">${monthLabel}</div>
        <div style="font-family:${FLYER_FONT};font-size:${s.subtitleFontSize}pt;font-weight:600;color:${ORANGE};text-transform:uppercase;letter-spacing:0.22em;">Events &amp; Announcements</div>
      </div>
      <div style="flex:1;padding:${s.bodyPadV}in ${s.bodyPadH}in ${s.bodyPadV * 0.67}in;background:#fff;display:flex;flex-direction:column;">
        ${itemsHTML}
      </div>
      ${bathroomHTML}
    </div>`;
}

function FlyerPagePreview({ announcements, today, bathroomVariant }: {
  announcements: Announcement[];
  today: string;
  bathroomVariant: boolean;
}) {
  const active = getActiveMonthlyItems(announcements, today);
  const monthLabel = new Date(today + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const s = pickFlyerScale(active, bathroomVariant);

  return (
    <div style={{ width: '8.5in', minHeight: '11in', background: '#ffffff', fontFamily: font.body, display: 'flex', flexDirection: 'column', boxSizing: 'border-box', padding: '0.5in' }}>

      <div style={{ padding: `${s.headerPadV}in 0 ${s.headerPadV * 0.54}in`, flexShrink: 0, textAlign: 'center', borderBottom: `3pt solid ${ORANGE}` }}>
        <div style={{ fontFamily: font.body, fontSize: `${s.orgFontSize}pt`, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: TEAL, marginBottom: '8pt' }}>
          Upper Room Fellowship &nbsp;·&nbsp; urf.life
        </div>
        <div style={{ fontFamily: FLYER_FONT, fontSize: `${s.monthFontSize}pt`, fontWeight: 900, color: TEAL, textTransform: 'uppercase', letterSpacing: '0.01em', lineHeight: 0.95, marginBottom: '8pt' }}>
          {monthLabel}
        </div>
        <div style={{ fontFamily: FLYER_FONT, fontSize: `${s.subtitleFontSize}pt`, fontWeight: 600, color: ORANGE, textTransform: 'uppercase', letterSpacing: '0.22em' }}>
          Events &amp; Announcements
        </div>
      </div>

      <div style={{ flex: 1, padding: `${s.bodyPadV}in ${s.bodyPadH}in ${s.bodyPadV * 0.67}in`, background: '#ffffff', display: 'flex', flexDirection: 'column' }}>
        {active.length === 0 && (
          <div style={{ color: '#999', padding: '0.5in 0', textAlign: 'center', fontSize: '11pt' }}>
            No announcements for this month.
          </div>
        )}
        {active.map((a, i) => {
          const rawText = a.flyer_text || a.month_override || a.short_version || '';
          const text = stripLeadingTitle(rawText, a.title);
          return (
            <div key={a.id} style={{ display: 'flex', gap: `${s.gap}in`, padding: `${s.itemPadV}in 0`, borderBottom: i < active.length - 1 ? `1pt solid #2B433E` : 'none', alignItems: 'flex-start' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ marginBottom: `${s.titleMarginBottom}pt` }}>
                  <div style={{ fontFamily: FLYER_FONT, fontSize: `${s.titleFontSize}pt`, fontWeight: 900, color: TEAL, letterSpacing: '0.02em', lineHeight: 1.1, textTransform: 'uppercase' }}>
                    {a.title}
                  </div>
                  {(formatDateTimeList(a, today) || a.ministry) && (
                    <div style={{ marginTop: '1pt', lineHeight: 1.1, display: 'flex', gap: '4pt', alignItems: 'center', flexWrap: 'wrap' }}>
                      {formatDateTimeList(a, today) && (
                        <span style={{ fontFamily: FLYER_FONT, fontSize: `${s.dateFontSize}pt`, fontWeight: 700, color: ORANGE, letterSpacing: '0.05em' }}>
                          {formatDateTimeList(a, today)}
                        </span>
                      )}
                      {a.ministry && (
                        <span style={{
                          fontFamily: font.body,
                          fontSize: `${Math.max(s.contactFontSize - 0.5, 7)}pt`,
                          fontWeight: 700,
                          color: TEAL,
                          background: a.scope === 'whole_church' ? '#FFFFFF' : '#FFFFFF',
                          borderRadius: '999px',
                          padding: '1pt 7pt',
                          letterSpacing: '0.04em',
                          whiteSpace: 'nowrap',
                        }}>
                          {a.ministry}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div style={{ fontFamily: font.body, fontSize: `${s.bodyFontSize}pt`, color: '#1E2522', lineHeight: 1.4 }}>{text}</div>
                {a.contact_info && (
                  <div style={{ fontFamily: font.body, fontSize: `${s.contactFontSize}pt`, color: '#777', marginTop: `${s.contactMarginTop}pt` }}>
                    {a.contact_name ? `${a.contact_name}, ` : ''}{a.contact_info}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {bathroomVariant && (
        <div style={{ borderTop: `2pt solid #2B433E`, padding: `0.3in ${s.bodyPadH}in 0.45in`, flexShrink: 0, textAlign: 'center' }}>
          <div style={{ fontFamily: font.body, fontSize: `${s.bodyFontSize + 1}pt`, color: '#444', lineHeight: 1.5 }}>{BATHROOM_NOTE_LINES[0]}</div>
          <div style={{ fontFamily: font.body, fontSize: `${s.bodyFontSize + 1}pt`, color: '#444', lineHeight: 1.5 }}>{BATHROOM_NOTE_LINES[1]}</div>
          <div style={{ fontFamily: font.body, fontSize: `${s.bodyFontSize + 1.5}pt`, fontWeight: 700, color: TEAL, lineHeight: 1.5 }}>{BATHROOM_NOTE_LINES[2]}</div>
        </div>
      )}

    </div>
  );
}

function getFirstSunday(year: number, month: number): Date {
  const d = new Date(year, month, 1);
  const day = d.getDay();
  if (day !== 0) d.setDate(d.getDate() + (7 - day));
  return d;
}

function isPrintReminderWeek(today: string): { show: boolean; nextMonth: string; firstSunday: string } {
  const d = new Date(today + 'T12:00:00');
  const firstSunday = getFirstSunday(d.getFullYear(), d.getMonth());
  const msUntil = firstSunday.getTime() - d.getTime();
  const daysUntil = msUntil / (1000 * 60 * 60 * 24);
  const show = daysUntil > 0 && daysUntil <= 7;
  const monthLabel = new Date(d.getFullYear(), d.getMonth(), 1)
    .toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const firstSundayLabel = firstSunday.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  return { show, nextMonth: monthLabel, firstSunday: firstSundayLabel };
}

export function MonthlyTab({ announcements, today }: MonthlyTabProps) {
  const monthLabel = new Date(today + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const active = getActiveMonthlyItems(announcements, today);
  const printReminder = isPrintReminderWeek(today);

  const handlePrint = () => {
    const page1 = buildFlyerHTML(announcements, today, false);
    const page2 = buildFlyerHTML(announcements, today, true);

    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) return;

    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Monthly Flyer - ${monthLabel}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,400;0,700;0,900;1,400;1,700&display=swap" rel="stylesheet">
  <style>
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #fff; }
    .page { width: 8.5in; min-height: 11in; page-break-after: always; break-after: page; }
    @page { size: 8.5in 11in; margin: 0; }
    @media screen { body { background: #eee; padding: 20px; display: flex; flex-direction: column; gap: 20px; align-items: flex-start; } .page { box-shadow: 0 4px 24px rgba(0,0,0,0.12); } }
  </style>
</head>
<body>
  <div class="page">${page1}</div>
  <div class="page">${page2}</div>
  <script>
    window.addEventListener('load', function() {
      setTimeout(function() { window.print(); }, 600);
    });
  </script>
</body>
</html>`);
    printWindow.document.close();
  };

  return (
    <div>
      {printReminder.show && (
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #EAA235',
          borderRadius: 8,
          padding: '10px 16px',
          marginBottom: 18,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <div style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#EAA235',
            flexShrink: 0,
          }} />
          <span style={{
            fontFamily: font.body,
            fontSize: 13,
            color: '#1E2522',
            fontWeight: 600,
          }}>
            Time to print the {printReminder.nextMonth} flyer, first Sunday is {printReminder.firstSunday}.
          </span>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h3 style={{ fontFamily: font.display, fontSize: 16, fontWeight: 800, color: C.text, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Monthly Flyer
          </h3>
          <p style={{ fontFamily: font.body, fontSize: 13, color: C.textSec, margin: 0 }}>
            {active.length} item{active.length !== 1 ? 's' : ''} for {monthLabel}. Prints 2 pages (standard + bathroom).
          </p>
        </div>
        <button onClick={handlePrint} style={{ ...btnGhost, fontSize: 12, padding: '7px 14px' }}>
          Print / Save PDF
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
        <div style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.10)', border: `1px solid #2B433E` }}>
          <FlyerPagePreview announcements={announcements} today={today} bathroomVariant={false} />
        </div>
        <div style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.10)', border: `1px solid #2B433E` }}>
          <FlyerPagePreview announcements={announcements} today={today} bathroomVariant={true} />
        </div>
      </div>
    </div>
  );
}
