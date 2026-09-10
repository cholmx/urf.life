import { describe, it, expect } from 'vitest';
import { buildIcsContent, buildIcsCalendar } from './generateIcs';

describe('buildIcsContent', () => {
  it('returns null when there is no date', () => {
    expect(buildIcsContent({ title: 'No Date Event' })).toBeNull();
  });

  it('builds an all-day event with DTEND the day after DTSTART', () => {
    const content = buildIcsContent({ title: 'Christmas Eve Service', date: '2026-12-24' });
    expect(content).toContain('DTSTART;VALUE=DATE:20261224');
    expect(content).toContain('DTEND;VALUE=DATE:20261225');
    expect(content).toContain('SUMMARY:Christmas Eve Service');
    expect(content).not.toContain('DTSTART:2026'); // not the timed form
  });

  it('builds a timed event using the given start and end time', () => {
    const content = buildIcsContent({
      title: 'Sunday Service',
      date: '2026-09-06',
      startTime: '10:00',
      endTime: '11:30'
    });
    expect(content).toContain('DTSTART:20260906T100000');
    expect(content).toContain('DTEND:20260906T113000');
  });

  it('defaults to a one-hour block when no end time is given', () => {
    const content = buildIcsContent({ title: 'Prayer Meeting', date: '2026-09-06', startTime: '19:00' });
    expect(content).toContain('DTSTART:20260906T190000');
    expect(content).toContain('DTEND:20260906T200000');
  });

  it('rolls an end time past midnight over to the next hour correctly', () => {
    const content = buildIcsContent({ title: 'Late Watch Night', date: '2026-12-31', startTime: '23:30' });
    expect(content).toContain('DTSTART:20261231T233000');
    expect(content).toContain('DTEND:20261231T003000');
  });

  it('strips HTML from the description and escapes commas/semicolons', () => {
    const content = buildIcsContent({
      title: 'Potluck',
      date: '2026-09-06',
      description: '<p>Bring a dish, drinks; and good company!</p>'
    });
    expect(content).toContain('DESCRIPTION:Bring a dish\\, drinks\\; and good company!');
  });

  it('includes LOCATION only when provided', () => {
    const withLocation = buildIcsContent({ title: 'Bible Study', date: '2026-09-06', location: 'Fellowship Hall' });
    expect(withLocation).toContain('LOCATION:Fellowship Hall');

    const withoutLocation = buildIcsContent({ title: 'Bible Study', date: '2026-09-06' });
    expect(withoutLocation).not.toContain('LOCATION');
  });
});

describe('buildIcsCalendar', () => {
  it('returns null when no events have a date', () => {
    expect(buildIcsCalendar([{ title: 'No Date' }])).toBeNull();
  });

  it('wraps multiple events in a single VCALENDAR with one VEVENT each', () => {
    const content = buildIcsCalendar([
      { title: 'Sunday Service', date: '2026-09-06', startTime: '10:00' },
      { title: 'Marriage Class', date: '2026-09-13', startTime: '18:00' },
    ]);
    expect(content.match(/BEGIN:VCALENDAR/g)).toHaveLength(1);
    expect(content.match(/END:VCALENDAR/g)).toHaveLength(1);
    expect(content.match(/BEGIN:VEVENT/g)).toHaveLength(2);
    expect(content.match(/END:VEVENT/g)).toHaveLength(2);
    expect(content).toContain('SUMMARY:Sunday Service');
    expect(content).toContain('SUMMARY:Marriage Class');
  });

  it('skips dateless events but keeps the dated ones', () => {
    const content = buildIcsCalendar([
      { title: 'Ongoing Ministry' },
      { title: 'Potluck', date: '2026-09-06' },
    ]);
    expect(content.match(/BEGIN:VEVENT/g)).toHaveLength(1);
    expect(content).toContain('SUMMARY:Potluck');
    expect(content).not.toContain('Ongoing Ministry');
  });

  it('uses a deterministic UID when one is supplied, for stable re-downloads', () => {
    const content = buildIcsCalendar([
      { uid: 'class-1-2026-09-06', title: 'Marriage Class', date: '2026-09-06' },
    ]);
    expect(content).toContain('UID:class-1-2026-09-06@urf.life');
  });

  it('sets X-WR-CALNAME when a calendar name is given', () => {
    const content = buildIcsCalendar([{ title: 'Potluck', date: '2026-09-06' }], 'Upper Room Fellowship');
    expect(content).toContain('X-WR-CALNAME:Upper Room Fellowship');
  });
});
