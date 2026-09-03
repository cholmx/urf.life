import { describe, it, expect } from 'vitest';
import { getEventItems } from './calendar-grid';
import type { Announcement } from '../types';

function makeAnnouncement(overrides: Partial<Announcement>): Announcement {
  return {
    id: 'a1',
    title: 'Test',
    description: '',
    body: '',
    short_version: '',
    category: 'General Info',
    scope: 'informational',
    happening_type: 'class',
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
    show_on_slides: false,
    show_in_happenings: false,
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

describe('getEventItems', () => {
  it('matches a one-time item on its single event_date', () => {
    const a = makeAnnouncement({ event_date: '2026-09-10', event_dates: ['2026-09-10'] });
    expect(getEventItems('2026-09-10', [a])).toEqual([a]);
    expect(getEventItems('2026-09-17', [a])).toEqual([]);
  });

  it('matches a multi-date one-time item on each listed date', () => {
    const a = makeAnnouncement({ event_date: '2026-09-06', event_dates: ['2026-09-06', '2026-09-20'] });
    expect(getEventItems('2026-09-06', [a])).toEqual([a]);
    expect(getEventItems('2026-09-20', [a])).toEqual([a]);
    expect(getEventItems('2026-09-13', [a])).toEqual([]);
  });

  it('expands a weekly recurrence onto every matching weekday, not just the first', () => {
    // 2026-09-03 is a Thursday
    const a = makeAnnouncement({
      recurrence_type: 'weekly',
      recurrence_day: 'Thursday',
      event_date: '2026-09-03',
      event_dates: ['2026-09-03'],
    });
    expect(getEventItems('2026-09-03', [a])).toEqual([a]); // first session
    expect(getEventItems('2026-09-10', [a])).toEqual([a]); // following week
    expect(getEventItems('2026-09-17', [a])).toEqual([a]);
    expect(getEventItems('2026-09-09', [a])).toEqual([]); // a Wednesday - wrong weekday
    expect(getEventItems('2026-08-27', [a])).toEqual([]); // before the first session
  });

  it('stops a weekly recurrence at recurrence_end_date', () => {
    const a = makeAnnouncement({
      recurrence_type: 'weekly',
      recurrence_day: 'Thursday',
      event_date: '2026-09-03',
      event_dates: ['2026-09-03'],
      recurrence_end_date: '2026-09-10',
    });
    expect(getEventItems('2026-09-10', [a])).toEqual([a]);
    expect(getEventItems('2026-09-17', [a])).toEqual([]);
  });

  it('expands a biweekly recurrence onto every other matching weekday', () => {
    // 2026-09-03 is a Thursday
    const a = makeAnnouncement({
      recurrence_type: 'biweekly',
      recurrence_day: 'Thursday',
      event_date: '2026-09-03',
      event_dates: ['2026-09-03'],
    });
    expect(getEventItems('2026-09-03', [a])).toEqual([a]); // first session
    expect(getEventItems('2026-09-10', [a])).toEqual([]); // one week later - skipped
    expect(getEventItems('2026-09-17', [a])).toEqual([a]); // two weeks later
    expect(getEventItems('2026-10-01', [a])).toEqual([a]); // four weeks later
    expect(getEventItems('2026-08-27', [a])).toEqual([]); // before the first session
  });

  it('stops a biweekly recurrence at recurrence_end_date', () => {
    const a = makeAnnouncement({
      recurrence_type: 'biweekly',
      recurrence_day: 'Thursday',
      event_date: '2026-09-03',
      event_dates: ['2026-09-03'],
      recurrence_end_date: '2026-09-17',
    });
    expect(getEventItems('2026-09-17', [a])).toEqual([a]);
    expect(getEventItems('2026-10-01', [a])).toEqual([]);
  });

  it('expands a monthly recurrence onto the same date each month', () => {
    const a = makeAnnouncement({
      recurrence_type: 'monthly',
      event_date: '2026-01-15',
      event_dates: ['2026-01-15'],
    });
    expect(getEventItems('2026-01-15', [a])).toEqual([a]); // first session
    expect(getEventItems('2026-02-15', [a])).toEqual([a]);
    expect(getEventItems('2026-03-15', [a])).toEqual([a]);
    expect(getEventItems('2026-02-16', [a])).toEqual([]); // wrong day
    expect(getEventItems('2025-12-15', [a])).toEqual([]); // before the first session
  });

  it('clamps a monthly recurrence started on the 31st to the last day of shorter months', () => {
    const a = makeAnnouncement({
      recurrence_type: 'monthly',
      event_date: '2026-01-31',
      event_dates: ['2026-01-31'],
    });
    expect(getEventItems('2026-01-31', [a])).toEqual([a]);
    expect(getEventItems('2026-02-28', [a])).toEqual([a]); // Feb has no 31st
    expect(getEventItems('2026-04-30', [a])).toEqual([a]); // April has no 31st
  });

  it('stops a monthly recurrence at recurrence_end_date', () => {
    const a = makeAnnouncement({
      recurrence_type: 'monthly',
      event_date: '2026-01-15',
      event_dates: ['2026-01-15'],
      recurrence_end_date: '2026-02-15',
    });
    expect(getEventItems('2026-02-15', [a])).toEqual([a]);
    expect(getEventItems('2026-03-15', [a])).toEqual([]);
  });

  it('expands a monthly weekday-position recurrence onto the Nth weekday each month', () => {
    // September 2026 has 5 Wednesdays: 2, 9, 16, 23, 30
    const a = makeAnnouncement({
      recurrence_type: 'monthly',
      recurrence_day: 'Wednesday',
      recurrence_week_of_month: 'first',
      event_date: '2026-09-01',
      event_dates: ['2026-09-01'],
    });
    expect(getEventItems('2026-09-02', [a])).toEqual([a]); // first Wednesday
    expect(getEventItems('2026-09-09', [a])).toEqual([]); // second Wednesday - not selected
    expect(getEventItems('2026-10-07', [a])).toEqual([a]); // first Wednesday of October
  });

  it('distinguishes "fourth" from "last" in a month with a fifth occurrence', () => {
    const fourth = makeAnnouncement({
      recurrence_type: 'monthly', recurrence_day: 'Wednesday', recurrence_week_of_month: 'fourth',
      event_date: '2026-09-01', event_dates: ['2026-09-01'],
    });
    const last = makeAnnouncement({
      recurrence_type: 'monthly', recurrence_day: 'Wednesday', recurrence_week_of_month: 'last',
      event_date: '2026-09-01', event_dates: ['2026-09-01'],
    });
    expect(getEventItems('2026-09-23', [fourth])).toEqual([fourth]); // 4th Wednesday
    expect(getEventItems('2026-09-30', [fourth])).toEqual([]); // 5th, not 4th
    expect(getEventItems('2026-09-30', [last])).toEqual([last]); // last Wednesday (the 5th)
    expect(getEventItems('2026-09-23', [last])).toEqual([]); // not the last one
  });

  it('expands a monthly item with multiple week positions (e.g. 1st and 3rd)', () => {
    const a = makeAnnouncement({
      recurrence_type: 'monthly',
      recurrence_day: 'Wednesday',
      recurrence_week_of_month: 'first,third',
      event_date: '2026-09-01',
      event_dates: ['2026-09-01'],
    });
    expect(getEventItems('2026-09-02', [a])).toEqual([a]); // 1st Wednesday
    expect(getEventItems('2026-09-09', [a])).toEqual([]); // 2nd - not selected
    expect(getEventItems('2026-09-16', [a])).toEqual([a]); // 3rd Wednesday
    expect(getEventItems('2026-09-23', [a])).toEqual([]); // 4th - not selected
  });

  it('expands a monthly item on the 2nd and 4th Tuesday', () => {
    const a = makeAnnouncement({
      recurrence_type: 'monthly',
      recurrence_day: 'Tuesday',
      recurrence_week_of_month: 'second,fourth',
      event_date: '2026-09-01',
      event_dates: ['2026-09-01'],
    });
    expect(getEventItems('2026-09-01', [a])).toEqual([]); // 1st Tuesday - not selected
    expect(getEventItems('2026-09-08', [a])).toEqual([a]); // 2nd Tuesday
    expect(getEventItems('2026-09-15', [a])).toEqual([]); // 3rd - not selected
    expect(getEventItems('2026-09-22', [a])).toEqual([a]); // 4th Tuesday
    expect(getEventItems('2026-09-29', [a])).toEqual([]); // 5th - not selected
  });

  it('stops a monthly weekday-position recurrence at recurrence_end_date', () => {
    const a = makeAnnouncement({
      recurrence_type: 'monthly',
      recurrence_day: 'Wednesday',
      recurrence_week_of_month: 'first',
      event_date: '2026-09-01',
      event_dates: ['2026-09-01'],
      recurrence_end_date: '2026-09-30',
    });
    expect(getEventItems('2026-09-02', [a])).toEqual([a]);
    expect(getEventItems('2026-10-07', [a])).toEqual([]);
  });

  it('expands a date_range item across every day in its span', () => {
    const a = makeAnnouncement({
      recurrence_type: 'date_range',
      event_date: '2026-09-18',
      event_dates: ['2026-09-18'],
      recurrence_end_date: '2026-09-20',
    });
    expect(getEventItems('2026-09-18', [a])).toEqual([a]);
    expect(getEventItems('2026-09-19', [a])).toEqual([a]);
    expect(getEventItems('2026-09-20', [a])).toEqual([a]);
    expect(getEventItems('2026-09-21', [a])).toEqual([]);
    expect(getEventItems('2026-09-17', [a])).toEqual([]);
  });
});
