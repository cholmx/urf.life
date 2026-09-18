import type { Announcement } from '../types';

export function getScopeLeadWeeks(scope: Announcement['scope']): number {
  if (scope === 'whole_church') return 6;
  if (scope === 'ministry') return 4;
  return 3;
}

export function getSlideStartDate(a: Announcement): string | null {
  if (!a.event_date || !a.show_on_slides) return null;
  const d = new Date(a.event_date + 'T12:00:00');
  d.setDate(d.getDate() - getScopeLeadWeeks(a.scope) * 7);
  return d.toISOString().split('T')[0];
}

export function getSlideEndDate(a: Announcement): string | null {
  if (!a.event_date) return a.happenings_end_date || null;
  return a.event_date;
}

export function getAutoHappeningsStartDate(a: Announcement, today: string): string {
  if (a.is_recurring) return a.happenings_start_date || today;
  if (!a.event_date) return today;
  const leadWeeks = getScopeLeadWeeks(a.scope);
  const d = new Date(a.event_date + 'T12:00:00');
  d.setDate(d.getDate() - leadWeeks * 7);
  const calculated = d.toISOString().split('T')[0];
  return calculated < today ? today : calculated;
}

export function getAutoHappeningsEndDate(a: Announcement): string | null {
  if (a.is_recurring) return a.happenings_end_date || null;
  return a.event_date || a.happenings_end_date || null;
}

export function isSlideActive(a: Announcement, today: string): boolean {
  if (!a.show_on_slides) return false;
  if (a.is_recurring) {
    const start = a.happenings_start_date || '2000-01-01';
    const end = a.happenings_end_date || '2099-12-31';
    return today >= start && today <= end;
  }
  // A one-time item with no event_date is "ongoing" (see the form's "no
  // dates set, runs until removed") - isHappeningsActive already treats
  // that as always-active starting today; Slides needs the same fallback,
  // since getSlideStartDate/getSlideEndDate both require event_date and
  // return null without it, which silently dropped every dateless item
  // that had Slides checked.
  if (!a.event_date) return true;
  const start = getSlideStartDate(a);
  const end = getSlideEndDate(a);
  if (!start || !end) return false;
  return today >= start && today <= end;
}

export function isHappeningsActive(a: Announcement, today: string): boolean {
  if (!a.show_in_happenings) return false;
  const start = getAutoHappeningsStartDate(a, today);
  const end = getAutoHappeningsEndDate(a) || '2099-12-31';
  return today >= start && today <= end;
}

export function isMonthlyActive(a: Announcement, today: string): boolean {
  if (!a.monthly_include) return false;
  const cm = today.slice(0, 7);
  const startDate = getAutoHappeningsStartDate(a, today);
  const endDate = getAutoHappeningsEndDate(a) || a.event_date;
  const sm = (startDate || '2000-01').slice(0, 7);
  const em = (endDate || '2099-12').slice(0, 7);
  return sm <= cm && em >= cm;
}

function earliestEventDate(a: Announcement): string | null {
  const candidates: string[] = [];
  if (a.event_date) candidates.push(a.event_date);
  if (a.event_dates?.length) candidates.push(...a.event_dates.filter(Boolean));
  if (!candidates.length) return null;
  return candidates.sort()[0];
}

// Shared by the Monthly Flyer and the Monthly Bulletin so both always show
// the exact same set of items in the exact same order - filtered by
// isMonthlyActive, then soonest date first (dateless items last), title as
// the tiebreaker.
export function getActiveMonthlyItems(items: Announcement[], today: string): Announcement[] {
  return items
    .filter(a => isMonthlyActive(a, today))
    .sort((a, b) => {
      const da = earliestEventDate(a);
      const db = earliestEventDate(b);
      if (!da && !db) return a.title.localeCompare(b.title);
      if (!da) return 1;
      if (!db) return -1;
      if (da !== db) return da < db ? -1 : 1;
      return a.title.localeCompare(b.title);
    });
}

export function isStageActive(a: Announcement, today: string): boolean {
  // Whole Church scope alone used to be enough to land something on the
  // Stage Script automatically - show_on_stage (default true, see its
  // migration) narrows that: it still has to be whole-church, but staff
  // can now exclude a whole-church item that isn't something the pastor
  // should actually read out loud.
  if (a.scope !== 'whole_church' || !a.show_on_stage) return false;
  if (a.is_recurring) {
    const start = a.happenings_start_date || '2000-01-01';
    const end = a.happenings_end_date || '2099-12-31';
    return today >= start && today <= end;
  }
  if (a.event_date) {
    const start = getSlideStartDate(a) || getAutoHappeningsStartDate(a, today);
    if (today < start) return false;
    // A class stays on the stage script through the same one-week grace
    // window the public listing uses (see isClassListingActive) instead of
    // dropping off the instant it starts - the pastor still needs to
    // mention it isn't too late to join the Sunday right after it began.
    if (a.happening_type === 'class') return isClassListingActive(a.event_date, today);
    return today <= a.event_date;
  }
  const start = getAutoHappeningsStartDate(a, today);
  const end = getAutoHappeningsEndDate(a) || '2099-12-31';
  return today >= start && today <= end;
}

// Shared by isArchived and the Archive tab's own display/sort - all three
// used to independently gather+sort the same three date fields.
export function getLastRelevantDate(a: Announcement): string | null {
  const dates: string[] = [];
  if (a.event_date) dates.push(a.event_date);
  if (a.event_dates?.length) dates.push(...a.event_dates);
  if (a.happenings_end_date) dates.push(a.happenings_end_date);
  return dates.length ? dates.sort().at(-1)! : null;
}

// How long a class stays listed on the public Classes page (and keeps the
// Home page's Classes button visible) after its first session starts.
// Deliberately separate from the class's own ongoing schedule (which can
// run for months) - this is a grace window so people who don't sign up
// until after it's begun still see it, not a measure of when the class
// itself ends.
export const CLASS_LISTING_GRACE_DAYS = 7;

export function isClassListingActive(eventDate: string | null | undefined, today: string): boolean {
  if (!eventDate) return true;
  const cutoff = new Date(eventDate + 'T12:00:00');
  cutoff.setDate(cutoff.getDate() + CLASS_LISTING_GRACE_DAYS);
  return today <= cutoff.toISOString().split('T')[0];
}

export function isArchived(a: Announcement, today: string): boolean {
  if (a.is_recurring) return false;
  const last = getLastRelevantDate(a);
  if (last === null) return false;
  // A class moves to the admin Archive the same moment it drops off the
  // public listing (see isClassListingActive), not the instant its start
  // date passes - otherwise staff would see it archived while visitors
  // could still register for it.
  if (a.happening_type === 'class') return !isClassListingActive(last, today);
  return last < today;
}

export function formatDateNice(d: string | null | undefined): string {
  if (!d) return '';
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatDateLong(d: string): string {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export function weeksUntil(eventDate: string | null | undefined, today: string): number | null {
  if (!eventDate) return null;
  const diff = (new Date(eventDate + 'T12:00:00').getTime() - new Date(today + 'T12:00:00').getTime()) / (1000 * 60 * 60 * 24 * 7);
  return Math.ceil(diff);
}

// Announcement body/flyer text often repeats the title as its own leading
// sentence ("Men's Bible Study - join us...") - strip that duplicate lead-in
// wherever the title is already shown separately (bulletin/flyer layouts).
export function stripLeadingTitle(text: string, title: string): string {
  if (!text || !title) return text;
  return text.replace(new RegExp(`^${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*[:\\-–—]?\\s*`, 'i'), '');
}

// The Sunday that begins the calendar week containing dateStr (weeks run
// Sunday-Saturday). Used by the Happenings email so building the
// Happenings script on any day within a week updates the same saved row
// instead of creating a fresh one keyed to that literal day.
export function getWeekStartDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().split('T')[0];
}

// Some legacy/migrated content already contains HTML entities (e.g. an
// old rich-text field that got its tags stripped but not its "&amp;"
// left behind) - decode those first so escaping stays idempotent instead
// of double-encoding them into a visible "&amp;amp;".
function decodeCommonEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'");
}

export function escapeHtml(s: string): string {
  return decodeCommonEntities(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// The Happenings script used to be stored as plain text with the public
// page rendering it via white-space: pre-wrap. It's now stored as HTML so
// staff can bold/title-format it in ScriptEditor - this converts a legacy
// (or freshly AI-generated, still-plain) block of text into paragraph HTML
// on the same blank-line-separates-paragraphs rule the old renderer used.
export function scriptTextToHtml(text: string): string {
  return (text || '')
    .split(/\n{2,}/)
    .map(block => block.trim())
    .filter(Boolean)
    .map(block => `<p>${escapeHtml(block).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

// "HH:MM" (24h, from the time <select>) -> "7:00 PM". Falls back to the raw
// string if it's already in some other format (e.g. hand-typed "7pm").
export function formatTime12h(time: string): string {
  if (!time) return '';
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$/i);
  if (!match) return time;
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = match[3]?.toLowerCase() as 'am' | 'pm' | undefined;
  let suffix: 'AM' | 'PM';
  if (period) {
    suffix = period.toUpperCase() as 'AM' | 'PM';
    if (period === 'am' && hours === 12) hours = 0;
  } else {
    suffix = hours >= 12 ? 'PM' : 'AM';
    if (hours === 0) hours = 12;
  }
  if (hours > 12) hours -= 12;
  return `${hours}:${minutes} ${suffix}`;
}

export function looksLikeHtml(content: string): boolean {
  return /<(p|div|h[1-6]|br)[\s/>]/i.test(content || '');
}

// For the "Copy Script" button, which staff use to paste the script into an
// email - bold/title formatting doesn't survive plain text, but paragraph
// breaks should.
export function scriptHtmlToText(html: string): string {
  const container = document.createElement('div');
  container.innerHTML = html || '';
  const blocks: string[] = [];
  container.childNodes.forEach(node => {
    const text = (node.textContent || '').trim();
    if (text) blocks.push(text);
  });
  return blocks.join('\n\n');
}
