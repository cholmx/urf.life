const pad = (n) => String(n).padStart(2, '0');

// Formats a local date (+ optional time) as an iCalendar DATE-TIME value.
// Deliberately "floating" (no Z, no TZID) so it displays as the wall-clock
// time the admin actually entered, rather than risking a UTC conversion
// that shifts it by several hours in whatever timezone the calendar app
// assumes.
const formatIcsDateTime = (dateStr, timeStr) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!timeStr) return `${year}${pad(month)}${pad(day)}`;
  const [hour, minute] = timeStr.split(':').map(Number);
  return `${year}${pad(month)}${pad(day)}T${pad(hour)}${pad(minute)}00`;
};

const escapeIcsText = (text) =>
  (text || '')
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');

// Strips HTML tags from RichTextEditor content for use as a plain-text
// calendar description.
const stripHtml = (html) => (html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

// Builds a minimal RFC 5545 .ics file body for one event - pure string
// building, no DOM, so it's unit-testable on its own.
export const buildIcsContent = ({ title, description, date, startTime, endTime, location }) => {
  if (!date) return null;

  const dtStart = formatIcsDateTime(date, startTime);

  let dtEnd;
  if (!startTime) {
    // All-day events: DTEND is exclusive per the spec, so it's the day
    // after DTSTART for a single-day event.
    const [y, m, d] = date.split('-').map(Number);
    const next = new Date(y, m - 1, d + 1);
    dtEnd = `${next.getFullYear()}${pad(next.getMonth() + 1)}${pad(next.getDate())}`;
  } else if (endTime) {
    dtEnd = formatIcsDateTime(date, endTime);
  } else {
    // No end time given - default to a one-hour block.
    const [h, min] = startTime.split(':').map(Number);
    dtEnd = formatIcsDateTime(date, `${pad((h + 1) % 24)}:${pad(min)}`);
  }

  const now = new Date();
  const stamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Upper Room Fellowship//urf.life//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${stamp}-${Math.random().toString(36).slice(2)}@urf.life`,
    `DTSTAMP:${stamp}`,
    startTime ? `DTSTART:${dtStart}` : `DTSTART;VALUE=DATE:${dtStart}`,
    startTime ? `DTEND:${dtEnd}` : `DTEND;VALUE=DATE:${dtEnd}`,
    `SUMMARY:${escapeIcsText(title)}`,
    description ? `DESCRIPTION:${escapeIcsText(stripHtml(description))}` : null,
    location ? `LOCATION:${escapeIcsText(location)}` : null,
    'END:VEVENT',
    'END:VCALENDAR'
  ].filter(Boolean);

  return lines.join('\r\n');
};

// Triggers a browser download of the .ics file built above. Returns false
// (and downloads nothing) if there's no date to build a calendar event
// from - callers should only render the "Add to Calendar" button when a
// date is actually set, but this stays safe either way.
export const downloadIcsEvent = (event) => {
  const content = buildIcsContent(event);
  if (!content) return false;

  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(event.title || 'event').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return true;
};
