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

const icsStamp = () => {
  const now = new Date();
  return `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;
};

// Builds one VEVENT block. `uid` is deterministic when the caller can supply
// one (e.g. a happening's own id) so re-downloading the same event/calendar
// later is recognized as an update rather than a duplicate by calendar apps
// that dedupe by UID - falls back to a random one for a lone ad-hoc event.
const buildVEvent = ({ uid, title, description, date, startTime, endTime, location }) => {
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

  return [
    'BEGIN:VEVENT',
    `UID:${uid}@urf.life`,
    `DTSTAMP:${icsStamp()}`,
    startTime ? `DTSTART:${dtStart}` : `DTSTART;VALUE=DATE:${dtStart}`,
    startTime ? `DTEND:${dtEnd}` : `DTEND;VALUE=DATE:${dtEnd}`,
    `SUMMARY:${escapeIcsText(title)}`,
    description ? `DESCRIPTION:${escapeIcsText(stripHtml(description))}` : null,
    location ? `LOCATION:${escapeIcsText(location)}` : null,
    'END:VEVENT',
  ].filter(Boolean);
};

// Builds a minimal RFC 5545 .ics file body for one event - pure string
// building, no DOM, so it's unit-testable on its own.
export const buildIcsContent = ({ title, description, date, startTime, endTime, location }) => {
  if (!date) return null;

  const stamp = icsStamp();
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Upper Room Fellowship//urf.life//EN',
    'CALSCALE:GREGORIAN',
    ...buildVEvent({ uid: `${stamp}-${Math.random().toString(36).slice(2)}`, title, description, date, startTime, endTime, location }),
    'END:VCALENDAR'
  ];

  return lines.join('\r\n');
};

// Builds one .ics file bundling several events into a single VCALENDAR, so
// visitors can import (or a calendar app can be pointed at) a whole batch
// of upcoming happenings in one action instead of one download per event.
// Entries with no date are silently skipped rather than breaking the batch.
export const buildIcsCalendar = (events, calendarName) => {
  const withDates = (events || []).filter((e) => e.date);
  if (withDates.length === 0) return null;

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Upper Room Fellowship//urf.life//EN',
    'CALSCALE:GREGORIAN',
    calendarName ? `X-WR-CALNAME:${escapeIcsText(calendarName)}` : null,
    ...withDates.flatMap((e) => buildVEvent({ uid: e.uid || `${e.date}-${Math.random().toString(36).slice(2)}`, ...e })),
    'END:VCALENDAR'
  ].filter(Boolean);

  return lines.join('\r\n');
};

const triggerIcsDownload = (content, filename) => {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Triggers a browser download of the .ics file built above. Returns false
// (and downloads nothing) if there's no date to build a calendar event
// from - callers should only render the "Add to Calendar" button when a
// date is actually set, but this stays safe either way.
export const downloadIcsEvent = (event) => {
  const content = buildIcsContent(event);
  if (!content) return false;

  triggerIcsDownload(content, `${(event.title || 'event').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.ics`);
  return true;
};

// Triggers a browser download of one .ics file bundling several events -
// see buildIcsCalendar. Returns false (and downloads nothing) if none of
// the given events have a date.
export const downloadIcsCalendar = (events, filename = 'urf-calendar.ics', calendarName) => {
  const content = buildIcsCalendar(events, calendarName);
  if (!content) return false;

  triggerIcsDownload(content, filename);
  return true;
};
