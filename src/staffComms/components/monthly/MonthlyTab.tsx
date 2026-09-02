import { C, font } from '../../lib/theme';
import { btnGhost } from '../ui/inputs';
import { isMonthlyActive, formatDateNice } from '../../lib/helpers';
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

const TEAL = '#003B36';
const ORANGE = '#E98A15';

function allEventDates(a: Announcement): string[] {
  const all = new Set<string>();
  if (a.event_date) all.add(a.event_date);
  if (a.event_dates?.length) a.event_dates.filter(Boolean).forEach(d => all.add(d));
  return [...all].sort();
}

function formatDateList(a: Announcement): string {
  const dates = allEventDates(a);
  if (!dates.length) return '';
  return dates.map(formatDateNice).join(' + ');
}

function earliestDate(a: Announcement): string | null {
  const candidates: string[] = [];
  if (a.event_date) candidates.push(a.event_date);
  if (a.event_dates?.length) candidates.push(...a.event_dates.filter(Boolean));
  if (!candidates.length) return null;
  return candidates.sort()[0];
}

function sortActive(items: Announcement[], today: string) {
  return items
    .filter(a => isMonthlyActive(a, today))
    .sort((a, b) => {
      const da = earliestDate(a);
      const db = earliestDate(b);
      if (!da && !db) return a.title.localeCompare(b.title);
      if (!da) return 1;
      if (!db) return -1;
      if (da !== db) return da < db ? -1 : 1;
      return a.title.localeCompare(b.title);
    });
}

interface ScaleParams {
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
  barMinH: number;
  subtitleFontSize: number;
  orgFontSize: number;
  monthFontSize: number;
}

function getScaleParams(count: number, hasBathroom: boolean): ScaleParams {
  const extra = hasBathroom ? 2 : 0;
  const n = count + extra;

  if (n <= 4) {
    return {
      headerFontSize: 50, headerPadV: 0.65, bodyPadV: 0.45, bodyPadH: 0.5,
      itemPadV: 0.22, titleFontSize: 18, dateFontSize: 12, bodyFontSize: 11,
      contactFontSize: 9, contactMarginTop: 5, titleMarginBottom: 5,
      gap: 0.18, barMinH: 0.3, subtitleFontSize: 11, orgFontSize: 9, monthFontSize: 50,
    };
  } else if (n <= 6) {
    return {
      headerFontSize: 44, headerPadV: 0.5, bodyPadV: 0.35, bodyPadH: 0.5,
      itemPadV: 0.17, titleFontSize: 16, dateFontSize: 11, bodyFontSize: 10.5,
      contactFontSize: 8.5, contactMarginTop: 4, titleMarginBottom: 4,
      gap: 0.15, barMinH: 0.25, subtitleFontSize: 10.5, orgFontSize: 8.5, monthFontSize: 44,
    };
  } else if (n <= 8) {
    return {
      headerFontSize: 38, headerPadV: 0.38, bodyPadV: 0.28, bodyPadH: 0.5,
      itemPadV: 0.13, titleFontSize: 15, dateFontSize: 10.5, bodyFontSize: 10,
      contactFontSize: 8, contactMarginTop: 3, titleMarginBottom: 3,
      gap: 0.13, barMinH: 0.22, subtitleFontSize: 10, orgFontSize: 8, monthFontSize: 38,
    };
  } else if (n <= 11) {
    return {
      headerFontSize: 32, headerPadV: 0.28, bodyPadV: 0.2, bodyPadH: 0.5,
      itemPadV: 0.1, titleFontSize: 13, dateFontSize: 10, bodyFontSize: 9.5,
      contactFontSize: 7.5, contactMarginTop: 2, titleMarginBottom: 2,
      gap: 0.11, barMinH: 0.18, subtitleFontSize: 9.5, orgFontSize: 7.5, monthFontSize: 32,
    };
  } else {
    return {
      headerFontSize: 26, headerPadV: 0.2, bodyPadV: 0.15, bodyPadH: 0.5,
      itemPadV: 0.08, titleFontSize: 12, dateFontSize: 9.5, bodyFontSize: 9,
      contactFontSize: 7, contactMarginTop: 2, titleMarginBottom: 2,
      gap: 0.09, barMinH: 0.15, subtitleFontSize: 9, orgFontSize: 7, monthFontSize: 26,
    };
  }
}

function buildFlyerHTML(items: Announcement[], today: string, bathroomVariant: boolean): string {
  const active = sortActive(items, today);
  const monthLabel = new Date(today + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const s = getScaleParams(active.length, bathroomVariant);

  const itemsHTML = active.length === 0
    ? `<div style="color:#999;padding:0.5in 0;text-align:center;font-size:11pt;">No announcements for this month.</div>`
    : active.map((a, i) => {
        const rawText = a.flyer_text || a.month_override || a.body || a.short_version || '';
        const text = rawText.replace(new RegExp(`^${a.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*[:\\-–—]?\\s*`, 'i'), '');
        const isWC = a.scope === 'whole_church';
        const barColor = isWC ? ORANGE : TEAL;
        const dateLabel = formatDateList(a);
        const dateSpan = dateLabel
          ? `<span style="font-family:'Inter Tight',sans-serif;font-size:${s.dateFontSize}pt;font-weight:700;color:${ORANGE};letter-spacing:0.05em;white-space:nowrap;flex-shrink:0;">${dateLabel}</span>`
          : '';
        const ministryTag = a.ministry
          ? `<span style="font-family:'Inter',sans-serif;font-size:${Math.max(s.contactFontSize - 0.5, 7)}pt;font-weight:700;color:${TEAL};background:${isWC ? '#F0EBE0' : '#D5E8E2'};border-radius:999px;padding:1pt 7pt;letter-spacing:0.04em;white-space:nowrap;flex-shrink:0;">${a.ministry}</span>`
          : '';
        const contactHTML = a.contact_info
          ? `<div style="font-family:'Inter',sans-serif;font-size:${s.contactFontSize}pt;color:#777;margin-top:${s.contactMarginTop}pt;">${a.contact_name ? `${a.contact_name}, ` : ''}${a.contact_info}</div>`
          : '';
        const border = i < active.length - 1 ? `border-bottom:1pt solid #E8E8E8;` : '';
        return `
          <div style="display:flex;gap:${s.gap}in;padding:${s.itemPadV}in 0;${border}align-items:flex-start;">
            <div style="width:3pt;align-self:stretch;min-height:${s.barMinH}in;background:${barColor};border-radius:3pt;flex-shrink:0;"></div>
            <div style="flex:1;min-width:0;">
              <div style="margin-bottom:${s.titleMarginBottom}pt;">
                <div style="font-family:'Inter Tight',sans-serif;font-size:${s.titleFontSize}pt;font-weight:900;color:${TEAL};letter-spacing:0.02em;line-height:1.1;">${a.title}</div>
                <div style="margin-top:1pt;line-height:1.1;display:flex;gap:4pt;align-items:center;flex-wrap:wrap;">
                  ${dateSpan}
                  ${ministryTag}
                </div>
              </div>
              <div style="font-family:'Inter',sans-serif;font-size:${s.bodyFontSize}pt;color:#1A1A1A;line-height:1.4;">${text}</div>
              ${contactHTML}
            </div>
          </div>`;
      }).join('');

  const bathroomHTML = bathroomVariant ? `
    <div style="border-top:2pt solid #E8E8E8;padding:0.3in ${s.bodyPadH}in 0.45in;flex-shrink:0;text-align:center;">
      <div style="font-size:${s.bodyFontSize + 1}pt;color:#444;line-height:1.5;">${BATHROOM_NOTE_LINES[0]}</div>
      <div style="font-size:${s.bodyFontSize + 1}pt;color:#444;line-height:1.5;">${BATHROOM_NOTE_LINES[1]}</div>
      <div style="font-size:${s.bodyFontSize + 1.5}pt;font-weight:700;color:${TEAL};line-height:1.5;">${BATHROOM_NOTE_LINES[2]}</div>
    </div>` : '';

  return `
    <div style="width:8.5in;min-height:11in;background:#fff;font-family:'Inter',sans-serif;display:flex;flex-direction:column;box-sizing:border-box;padding:0.5in;">
      <div style="padding:${s.headerPadV}in 0 ${s.headerPadV * 0.54}in;flex-shrink:0;text-align:center;border-bottom:3pt solid ${ORANGE};">
        <div style="font-family:'Inter',sans-serif;font-size:${s.orgFontSize}pt;font-weight:700;letter-spacing:0.28em;text-transform:uppercase;color:${TEAL};margin-bottom:8pt;">Upper Room Fellowship &nbsp;·&nbsp; urf.life</div>
        <div style="font-family:'Inter Tight',sans-serif;font-size:${s.monthFontSize}pt;font-weight:900;color:${TEAL};text-transform:uppercase;letter-spacing:0.01em;line-height:0.95;margin-bottom:8pt;">${monthLabel}</div>
        <div style="font-family:'Inter Tight',sans-serif;font-size:${s.subtitleFontSize}pt;font-weight:600;color:${ORANGE};text-transform:uppercase;letter-spacing:0.22em;">Events &amp; Announcements</div>
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
  const active = sortActive(announcements, today);
  const monthLabel = new Date(today + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const s = getScaleParams(active.length, bathroomVariant);

  return (
    <div style={{ width: '8.5in', minHeight: '11in', background: '#ffffff', fontFamily: font.body, display: 'flex', flexDirection: 'column', boxSizing: 'border-box', padding: '0.5in' }}>

      <div style={{ padding: `${s.headerPadV}in 0 ${s.headerPadV * 0.54}in`, flexShrink: 0, textAlign: 'center', borderBottom: `3pt solid ${ORANGE}` }}>
        <div style={{ fontFamily: font.body, fontSize: `${s.orgFontSize}pt`, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: TEAL, marginBottom: '8pt' }}>
          Upper Room Fellowship &nbsp;·&nbsp; urf.life
        </div>
        <div style={{ fontFamily: font.display, fontSize: `${s.monthFontSize}pt`, fontWeight: 900, color: TEAL, textTransform: 'uppercase', letterSpacing: '0.01em', lineHeight: 0.95, marginBottom: '8pt' }}>
          {monthLabel}
        </div>
        <div style={{ fontFamily: font.display, fontSize: `${s.subtitleFontSize}pt`, fontWeight: 600, color: ORANGE, textTransform: 'uppercase', letterSpacing: '0.22em' }}>
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
          const rawText = a.flyer_text || a.month_override || a.body || a.short_version || '';
          const text = rawText.replace(new RegExp(`^${a.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*[:\\-–—]?\\s*`, 'i'), '');
          const barColor = a.scope === 'whole_church' ? ORANGE : TEAL;
          return (
            <div key={a.id} style={{ display: 'flex', gap: `${s.gap}in`, padding: `${s.itemPadV}in 0`, borderBottom: i < active.length - 1 ? `1pt solid #E8E8E8` : 'none', alignItems: 'flex-start' }}>
              <div style={{ width: '3pt', alignSelf: 'stretch', minHeight: `${s.barMinH}in`, background: barColor, borderRadius: '3pt', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ marginBottom: `${s.titleMarginBottom}pt` }}>
                  <div style={{ fontFamily: font.display, fontSize: `${s.titleFontSize}pt`, fontWeight: 900, color: TEAL, letterSpacing: '0.02em', lineHeight: 1.1 }}>
                    {a.title}
                  </div>
                  {(formatDateList(a) || a.ministry) && (
                    <div style={{ marginTop: '1pt', lineHeight: 1.1, display: 'flex', gap: '4pt', alignItems: 'center', flexWrap: 'wrap' }}>
                      {formatDateList(a) && (
                        <span style={{ fontFamily: font.display, fontSize: `${s.dateFontSize}pt`, fontWeight: 700, color: ORANGE, letterSpacing: '0.05em' }}>
                          {formatDateList(a)}
                        </span>
                      )}
                      {a.ministry && (
                        <span style={{
                          fontFamily: font.body,
                          fontSize: `${Math.max(s.contactFontSize - 0.5, 7)}pt`,
                          fontWeight: 700,
                          color: TEAL,
                          background: a.scope === 'whole_church' ? '#F0EBE0' : '#D5E8E2',
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
                <div style={{ fontFamily: font.body, fontSize: `${s.bodyFontSize}pt`, color: '#1A1A1A', lineHeight: 1.4 }}>{text}</div>
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
        <div style={{ borderTop: `2pt solid #E8E8E8`, padding: `0.3in ${s.bodyPadH}in 0.45in`, flexShrink: 0, textAlign: 'center' }}>
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
  const active = announcements.filter(a => isMonthlyActive(a, today));
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
  <link href="https://fonts.googleapis.com/css2?family=Inter+Tight:ital,wght@0,400;0,600;0,700;0,800;0,900;1,400&family=Inter:ital,opsz,wght@0,14..32,400;0,14..32,500;0,14..32,700;1,14..32,400&display=swap" rel="stylesheet">
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
          background: 'rgba(223,196,121,0.18)',
          border: '1px solid rgba(223,196,121,0.55)',
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
            background: '#715C1C',
            flexShrink: 0,
          }} />
          <span style={{
            fontFamily: font.body,
            fontSize: 13,
            color: '#4F3D00',
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
        <div style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.10)', border: `1px solid #E0E0E0` }}>
          <FlyerPagePreview announcements={announcements} today={today} bathroomVariant={false} />
        </div>
        <div style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.10)', border: `1px solid #E0E0E0` }}>
          <FlyerPagePreview announcements={announcements} today={today} bathroomVariant={true} />
        </div>
      </div>
    </div>
  );
}
