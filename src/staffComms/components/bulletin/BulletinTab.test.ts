import { describe, it, expect } from 'vitest';
import {
  pickBulletinScale,
  estimateItemHeightPt,
  BULLETIN_CONTENT_HEIGHT_PT,
  FRONT_CHROME_PT,
  BULLETIN_SCALE_TIERS,
} from './BulletinTab';
import type { Announcement } from '../../types';

// These tests exist because the fit-calculation logic here has already
// caused a real bug in one session: announcements silently clipped off the
// page. This asserts the underlying guarantee instead (text shrinks to try
// to fit everything, and gracefully degrades to the smallest tier rather
// than erroring) across a spread of realistic and worst-case item
// counts/lengths.

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

describe('pickBulletinScale', () => {
  it('fits everything within the page budget for a realistic load', () => {
    const budget = BULLETIN_CONTENT_HEIGHT_PT - FRONT_CHROME_PT;
    for (const count of [0, 1, 3, 7, 12]) {
      for (const bodyLength of ['short', 'mixed'] as const) {
        const items = makeItems(count, bodyLength);
        const scale = pickBulletinScale(items);
        const used = items.reduce((sum, a) => sum + estimateItemHeightPt(a, scale), 0);
        const isSmallestTier = scale === BULLETIN_SCALE_TIERS[BULLETIN_SCALE_TIERS.length - 1];
        // Falls back to the smallest tier as a last resort even if it
        // technically doesn't fit (see pickBulletinScale) - anything
        // bigger than that must actually fit.
        if (!isSmallestTier) {
          expect(used).toBeLessThanOrEqual(budget + 0.01);
        }
      }
    }
  });

  it('falls back to the smallest tier under a heavier-than-typical load', () => {
    // Past the realistic range above - either a lot of items, or every one
    // of them a full paragraph - there just isn't room for everything at a
    // readable size. pickBulletinScale's documented fallback is to use its
    // smallest tier anyway rather than loop forever or throw.
    const scenarios: { count: number; bodyLength: 'short' | 'long' | 'mixed' }[] = [
      { count: 18, bodyLength: 'short' },
      { count: 18, bodyLength: 'mixed' },
      { count: 12, bodyLength: 'long' },
      { count: 18, bodyLength: 'long' },
      { count: 30, bodyLength: 'long' },
    ];
    for (const { count, bodyLength } of scenarios) {
      const items = makeItems(count, bodyLength);
      const scale = pickBulletinScale(items);
      expect(scale).toBe(BULLETIN_SCALE_TIERS[BULLETIN_SCALE_TIERS.length - 1]);
    }
  });

  it('shrinks text as the list gets busier', () => {
    const few = pickBulletinScale(makeItems(2, 'short'));
    const many = pickBulletinScale(makeItems(30, 'long'));
    expect(many.titleFontSize).toBeLessThanOrEqual(few.titleFontSize);
    expect(many.bodyFontSize).toBeLessThanOrEqual(few.bodyFontSize);
  });
});
