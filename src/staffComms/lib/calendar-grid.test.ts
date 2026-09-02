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
