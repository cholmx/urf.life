import { describe, it, expect } from 'vitest';
import { isArchived, isClassListingActive, getLastRelevantDate } from './helpers';
import type { Announcement } from '../types';

// These exist because a real bug shipped here: a multi-week recurring
// class/event with a recurrence_end_date in the past never archived, since
// isArchived exempted every is_recurring item outright without checking
// whether it actually had an end date. Only a genuinely open-ended
// recurring item (no recurrence_end_date) should stay exempt.

let nextId = 0;
function makeAnnouncement(overrides: Partial<Announcement> = {}): Announcement {
  nextId += 1;
  return {
    id: `a${nextId}`,
    title: `Test ${nextId}`,
    description: '',
    short_version: '',
    category: 'General Info',
    scope: 'ministry',
    happening_type: 'announcement',
    link: '',
    event_date: null,
    event_dates: [],
    event_time: '',
    end_time: '',
    is_recurring: false,
    slides_lead_weeks: 3,
    happenings_start_date: null,
    happenings_end_date: null,
    monthly_include: false,
    show_on_slides: true,
    show_in_happenings: true,
    show_in_weekly: true,
    show_on_stage: true,
    event_location: '',
    contact_name: '',
    contact_info: '',
    slide_override: '',
    month_override: '',
    flyer_text: '',
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

const TODAY = '2026-09-29';

describe('isClassListingActive', () => {
  it('stays active through the grace window', () => {
    expect(isClassListingActive('2026-09-25', TODAY)).toBe(true); // +4 days
  });
  it('drops off once the grace window passes', () => {
    expect(isClassListingActive('2026-09-01', TODAY)).toBe(false); // +28 days
  });
});

describe('getLastRelevantDate', () => {
  it('includes recurrence_end_date among the candidates', () => {
    const a = makeAnnouncement({ recurrence_end_date: '2026-10-05' });
    expect(getLastRelevantDate(a)).toBe('2026-10-05');
  });
  it('picks the latest of all date fields', () => {
    const a = makeAnnouncement({ event_date: '2026-09-01', happenings_end_date: '2026-09-10', recurrence_end_date: '2026-09-05' });
    expect(getLastRelevantDate(a)).toBe('2026-09-10');
  });
});

describe('isArchived', () => {
  it('never archives a one-time item with no date set', () => {
    expect(isArchived(makeAnnouncement(), TODAY)).toBe(false);
  });

  it('archives a one-time event the day after its date', () => {
    const a = makeAnnouncement({ happening_type: 'event', event_date: '2026-09-28' });
    expect(isArchived(a, TODAY)).toBe(true);
  });
  it('does not archive a one-time event on/before its date', () => {
    const a = makeAnnouncement({ happening_type: 'event', event_date: '2026-09-29' });
    expect(isArchived(a, TODAY)).toBe(false);
  });

  it('keeps a one-time class listed through its grace week', () => {
    const a = makeAnnouncement({ happening_type: 'class', event_date: '2026-09-25' });
    expect(isArchived(a, TODAY)).toBe(false);
  });
  it('archives a one-time class after its grace week', () => {
    const a = makeAnnouncement({ happening_type: 'class', event_date: '2026-09-01' });
    expect(isArchived(a, TODAY)).toBe(true);
  });

  it('never archives an open-ended recurring item (no recurrence_end_date)', () => {
    const a = makeAnnouncement({ is_recurring: true, recurrence_type: 'weekly', event_date: '2020-01-01' });
    expect(isArchived(a, TODAY)).toBe(false);
  });

  it('archives a recurring event once its recurrence_end_date passes', () => {
    const a = makeAnnouncement({
      happening_type: 'event', is_recurring: true, recurrence_type: 'weekly',
      event_date: '2026-08-01', recurrence_end_date: '2026-09-01',
    });
    expect(isArchived(a, TODAY)).toBe(true);
  });
  it('does not archive a recurring event before its recurrence_end_date', () => {
    const a = makeAnnouncement({
      happening_type: 'event', is_recurring: true, recurrence_type: 'weekly',
      event_date: '2026-08-01', recurrence_end_date: '2026-10-01',
    });
    expect(isArchived(a, TODAY)).toBe(false);
  });

  // A class's grace window is always anchored to its start date - it
  // archives a week after it first met, whether it's a one-time class,
  // still actively meeting weekly with no end date, or has a recurrence_end_date
  // months away. Real data that shipped this bug: a weekly class starting
  // Aug 16 with no end date, and one starting Sep 16 ending Nov 4 - both
  // stayed on the Manage list because recurrence_end_date (or its absence)
  // was being used instead of event_date.
  it('archives a recurring class a week after it starts, even with no end date', () => {
    const a = makeAnnouncement({
      happening_type: 'class', is_recurring: true, recurrence_type: 'weekly',
      event_date: '2026-08-16', recurrence_end_date: null,
    });
    expect(isArchived(a, TODAY)).toBe(true);
  });
  it('archives a recurring class a week after it starts, even with a future end date', () => {
    const a = makeAnnouncement({
      happening_type: 'class', is_recurring: true, recurrence_type: 'weekly',
      event_date: '2026-09-16', recurrence_end_date: '2026-11-04',
    });
    expect(isArchived(a, TODAY)).toBe(true);
  });
  it('keeps a still-new recurring class listed through its grace week', () => {
    const a = makeAnnouncement({
      happening_type: 'class', is_recurring: true, recurrence_type: 'weekly',
      event_date: '2026-09-25', recurrence_end_date: null,
    });
    expect(isArchived(a, TODAY)).toBe(false); // +4 days, still in grace
  });
});
