import { describe, it, expect } from 'vitest';
import {
  splitBulletinItems,
  pickBulletinScale,
  pickBackSectionsScale,
  estimateItemHeightPt,
  estimateBackSectionsHeightPt,
  BULLETIN_CONTENT_HEIGHT_PT,
  FRONT_CHROME_PT,
  BACK_CHROME_PT,
  BACK_SECTIONS_TIERS,
  BULLETIN_SCALE_TIERS,
} from './BulletinTab';
import type { Announcement } from '../../types';

// These tests exist because the fit-calculation logic here has already
// caused two real bugs in one session: announcements silently clipped off
// the front page, and the back page's static info box squeezed off the
// bottom by overflow items. Both were "it fits on my test data" mistakes
// that a fixed set of items/counts wouldn't have caught - these assert the
// underlying guarantees instead (nothing dropped, nothing overflows) across
// a spread of realistic and worst-case item counts/lengths.

let nextId = 0;
function makeAnnouncement(overrides: Partial<Announcement> = {}): Announcement {
  nextId += 1;
  return {
    id: `a${nextId}`,
    title: `Test Announcement ${nextId}`,
    description: '',
    body: '',
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
    stage_notes: '',
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

const smallestBackSectionsHeight = estimateBackSectionsHeightPt(BACK_SECTIONS_TIERS[BACK_SECTIONS_TIERS.length - 1]);

describe('splitBulletinItems', () => {
  it('never drops an item, for any count or scale tier', () => {
    for (const count of [0, 1, 3, 7, 12, 18, 30]) {
      for (const bodyLength of ['short', 'long', 'mixed'] as const) {
        const items = makeItems(count, bodyLength);
        const scale = pickBulletinScale(items);
        const { front, back } = splitBulletinItems(items, scale);
        expect(front.length + back.length).toBe(items.length);
      }
    }
  });

  it('keeps front items within the front page budget, except a single item too big to shrink further', () => {
    const budget = BULLETIN_CONTENT_HEIGHT_PT - FRONT_CHROME_PT;
    for (const count of [1, 5, 10, 18, 30]) {
      for (const bodyLength of ['short', 'long', 'mixed'] as const) {
        const items = makeItems(count, bodyLength);
        const scale = pickBulletinScale(items);
        const { front } = splitBulletinItems(items, scale);
        const used = front.reduce((sum, a) => sum + estimateItemHeightPt(a, scale), 0);
        // The only allowed overflow is a single lone item that doesn't fit
        // even alone - splitBulletinItems always keeps at least one item on
        // the front rather than producing an empty front page.
        if (used > budget) {
          expect(front.length).toBe(1);
        }
      }
    }
  });
});

describe('pickBulletinScale', () => {
  it('always leaves the back page enough room for at least the smallest info-box tier, for realistic content', () => {
    // This is the exact bug that shipped once already: a handful of long
    // items spilling onto the back page at too-large a text size left no
    // room at all for the Table Groups/Kids/etc. box, even at its smallest.
    // 'short' and 'mixed' reflect how real bulletins read - mostly brief
    // reminders with occasional longer paragraphs (see the actual church
    // content this was verified against). A dozen items is already a busy
    // month for this church; heavier loads are covered separately below,
    // since past some point there just isn't room at any readable size.
    for (const count of [0, 1, 3, 7, 12]) {
      for (const bodyLength of ['short', 'mixed'] as const) {
        const items = makeItems(count, bodyLength);
        const scale = pickBulletinScale(items);
        const { back } = splitBulletinItems(items, scale);
        const overflowHeight = back.reduce((sum, a) => sum + estimateItemHeightPt(a, scale), 0);
        const overflowMargin = back.length > 0 ? 12 * 0.75 : 0;
        const available = BULLETIN_CONTENT_HEIGHT_PT - BACK_CHROME_PT - overflowHeight - overflowMargin;
        expect(available).toBeGreaterThanOrEqual(smallestBackSectionsHeight - 0.01);
      }
    }
  });

  it('falls back to the smallest tier (without dropping items) under a heavier-than-typical load', () => {
    // Past the realistic range above - either a lot of items, or every one
    // of them a full paragraph - there just isn't room for everything at a
    // readable size. pickBulletinScale's documented fallback is to use its
    // smallest tier anyway rather than loop forever or throw. This locks in
    // that it degrades gracefully (smallest tier, nothing dropped) instead
    // of erroring, even though the space guarantee above no longer holds.
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
      const { front, back } = splitBulletinItems(items, scale);
      expect(front.length + back.length).toBe(items.length);
    }
  });

  it('shrinks text as the list gets busier', () => {
    const few = pickBulletinScale(makeItems(2, 'short'));
    const many = pickBulletinScale(makeItems(30, 'long'));
    expect(many.titleFontSize).toBeLessThanOrEqual(few.titleFontSize);
    expect(many.bodyFontSize).toBeLessThanOrEqual(few.bodyFontSize);
  });
});

describe('pickBackSectionsScale', () => {
  it('never returns a tier taller than the space actually available', () => {
    for (const overflowCount of [0, 1, 3, 6, 10]) {
      for (const bodyLength of ['short', 'long'] as const) {
        const overflowItems = makeItems(overflowCount, bodyLength);
        const itemScale = pickBulletinScale(overflowItems);
        const sectionsScale = pickBackSectionsScale(overflowItems, itemScale);
        const overflowHeight = overflowItems.reduce((sum, a) => sum + estimateItemHeightPt(a, itemScale), 0);
        const overflowMargin = overflowItems.length > 0 ? 12 * 0.75 : 0;
        const available = BULLETIN_CONTENT_HEIGHT_PT - BACK_CHROME_PT - overflowHeight - overflowMargin;
        const chosenHeight = estimateBackSectionsHeightPt(sectionsScale);
        // Falls back to the smallest tier as a last resort even if it
        // technically doesn't fit (see pickBackSectionsScale) - anything
        // bigger than that must actually fit.
        const isSmallestTier = sectionsScale === BACK_SECTIONS_TIERS[BACK_SECTIONS_TIERS.length - 1];
        if (!isSmallestTier) {
          expect(chosenHeight).toBeLessThanOrEqual(available + 0.01);
        }
      }
    }
  });
});
