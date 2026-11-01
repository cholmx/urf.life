import { describe, it, expect } from 'vitest';
import { pickFlyerScale, FLYER_SCALE_TIERS, formatDateTimeList } from './MonthlyTab';
import type { Announcement } from '../../types';

// pickFlyerScale replaced a pure item-count lookup (getScaleParams) that
// had no idea how much text was actually in each item - a month with few
// items but long descriptions (or, once date/time and multi-day ranges
// got added to the date line, just a long date label) could still run text
// off the page at that function's largest, most spacious tier regardless
// of what was really there. These assert the fit guarantee pickFlyerScale
// adds instead: shrink to whatever tier actually fits, and degrade
// gracefully (smallest tier, never throw) when nothing does.

let nextId = 0;
function makeAnnouncement(overrides: Partial<Announcement> = {}): Announcement {
  nextId += 1;
  return {
    id: `a${nextId}`,
    title: `Test Announcement ${nextId}`,
    description: '',
    short_version: '',
    category: 'General Info',
    scope: 'ministry',
    happening_type: 'announcement',
    link: '',
    event_date: '2026-09-12',
    event_dates: [],
    event_time: '',
    end_time: '',
    is_recurring: false,
    slides_lead_weeks: 3,
    happenings_start_date: null,
    happenings_end_date: null,
    monthly_include: true,
    show_on_slides: true,
    show_in_happenings: true,
    show_in_weekly: true,
    show_on_stage: true,
    event_location: '',
    contact_name: '',
    contact_info: '',
    slide_override: '',
    month_override: '',
    flyer_text: 'Short flyer copy for this item.',
    slide_made: false,
    needs_signup: false,
    signup_mode: 'none',
    signup_sheet_config: null,
    is_published: true,
    published_at: null,
    status: 'approved',
    assigned_to: '',
    ministry: '',
    recurrence_type: 'one_time',
    recurrence_day: '',
    recurrence_week_of_month: '',
    recurrence_end_date: null,
    recurrence_label: '',
    ...overrides,
  };
}

const SHORT_BODY = 'A brief note.';
const LONG_BODY = 'This is a much longer announcement body that goes on for a while, describing the full schedule for the day, who should attend and why, what to bring, where to park, and who to contact with any questions about accessibility or accommodations for this particular event.';

function makeItems(count: number, bodyLength: 'short' | 'long' | 'mixed'): Announcement[] {
  return Array.from({ length: count }, (_, i) => {
    const body = bodyLength === 'mixed' ? (i % 2 === 0 ? LONG_BODY : SHORT_BODY) : bodyLength === 'long' ? LONG_BODY : SHORT_BODY;
    return makeAnnouncement({
      flyer_text: body,
      contact_info: i % 3 === 0 ? '555-0100' : '',
      ministry: i % 4 === 0 ? 'Youth' : '',
    });
  });
}

// Real bug: a recurring item's date line always read straight off
// event_date, which only ever holds its very first-ever session - so a
// monthly item set up back in, say, October kept printing "Oct 4" forever,
// regardless of which month's flyer was actually being built.
describe('formatDateTimeList', () => {
  it('advances a monthly weekday-position item to the real upcoming date instead of its frozen first session', () => {
    const a = makeAnnouncement({
      recurrence_type: 'monthly',
      is_recurring: true,
      event_date: '2026-10-04', // first Sunday of October - the "frozen" date
      recurrence_day: 'Sunday',
      recurrence_week_of_month: 'first',
      recurrence_end_date: null,
    });
    // Previewing November's flyer should show November's first Sunday, not October's.
    expect(formatDateTimeList(a, '2026-11-01')).toContain('Nov 1');
    expect(formatDateTimeList(a, '2026-11-01')).not.toContain('Oct 4');
  });

  it('advances a weekly item past its frozen first session', () => {
    const a = makeAnnouncement({
      recurrence_type: 'weekly',
      is_recurring: true,
      event_date: '2026-08-05',
      recurrence_day: 'Wednesday',
      recurrence_end_date: null,
    });
    const label = formatDateTimeList(a, '2026-11-01');
    expect(label).not.toContain('Aug 5');
  });

  it('still shows a one-time item\'s actual date, unaffected', () => {
    const a = makeAnnouncement({ recurrence_type: 'one_time', event_date: '2026-11-07' });
    expect(formatDateTimeList(a, '2026-11-01')).toContain('Nov 7');
  });

  it('still builds a date_range item\'s start-end label, unaffected', () => {
    const a = makeAnnouncement({
      recurrence_type: 'date_range',
      event_date: '2026-10-09',
      event_time: '17:00',
      recurrence_end_date: '2026-10-10',
      end_time: '12:00',
    });
    const label = formatDateTimeList(a, '2026-11-01');
    expect(label).toContain('Oct 9');
    expect(label).toContain('Oct 10');
  });
});

describe('pickFlyerScale', () => {
  it('never throws and always returns a complete ScaleParams for any load', () => {
    for (const count of [0, 1, 4, 8, 12, 20, 40]) {
      for (const hasBathroom of [false, true]) {
        const s = pickFlyerScale(makeItems(count, 'mixed'), hasBathroom);
        expect(s.titleFontSize).toBeGreaterThan(0);
        expect(s.bodyFontSize).toBeGreaterThan(0);
        expect(Number.isFinite(s.headerFontSize)).toBe(true);
      }
    }
  });

  it('falls back to the smallest tier (without throwing) under a heavier-than-typical load', () => {
    const scenarios: { count: number; bodyLength: 'short' | 'long' | 'mixed' }[] = [
      { count: 20, bodyLength: 'long' },
      { count: 40, bodyLength: 'long' },
      { count: 60, bodyLength: 'mixed' },
    ];
    for (const { count, bodyLength } of scenarios) {
      const s = pickFlyerScale(makeItems(count, bodyLength), false);
      expect(s).toBe(FLYER_SCALE_TIERS[FLYER_SCALE_TIERS.length - 1]);
    }
  });

  it('shrinks as the list gets busier or text gets longer', () => {
    const few = pickFlyerScale(makeItems(2, 'short'), false);
    const many = pickFlyerScale(makeItems(20, 'long'), false);
    expect(many.titleFontSize).toBeLessThanOrEqual(few.titleFontSize);
    expect(many.bodyFontSize).toBeLessThanOrEqual(few.bodyFontSize);
  });

  it('never returns a larger tier for the bathroom-note variant than the plain page at the same content', () => {
    for (const count of [0, 3, 6, 10]) {
      const items = makeItems(count, 'mixed');
      const normal = pickFlyerScale(items, false);
      const bathroom = pickFlyerScale(items, true);
      expect(bathroom.titleFontSize).toBeLessThanOrEqual(normal.titleFontSize);
      expect(bathroom.bodyFontSize).toBeLessThanOrEqual(normal.bodyFontSize);
    }
  });

  it('picks the largest tier for an empty month', () => {
    const s = pickFlyerScale([], false);
    expect(s).toBe(FLYER_SCALE_TIERS[0]);
  });

  it('shrinks a single item with a long date-range label and long body rather than keeping it at full size', () => {
    // The original bug report: a date_range item's date label (start date
    // + time through end date + time) plus a long description could run
    // off the page even with just a handful of items, since the old
    // count-based tiers never looked at label/body length at all.
    const item = makeAnnouncement({
      recurrence_type: 'date_range',
      event_date: '2026-10-09',
      event_time: '17:00',
      recurrence_end_date: '2026-10-10',
      end_time: '12:00',
      flyer_text: LONG_BODY,
    });
    const fewShort = pickFlyerScale(makeItems(2, 'short'), false);
    const withLongItem = pickFlyerScale([item, ...makeItems(2, 'short')], false);
    expect(withLongItem.titleFontSize).toBeLessThanOrEqual(fewShort.titleFontSize);
  });
});
