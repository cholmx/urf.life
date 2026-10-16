import { describe, it, expect } from 'vitest';
import { parseTimeToMinutes, findRoomConflicts } from './rentalConflicts';

describe('parseTimeToMinutes', () => {
  it('parses standard 12-hour times', () => {
    expect(parseTimeToMinutes('6:00 PM')).toBe(18 * 60);
    expect(parseTimeToMinutes('9:30 AM')).toBe(9 * 60 + 30);
    expect(parseTimeToMinutes('12:00 PM')).toBe(12 * 60);
    expect(parseTimeToMinutes('12:00 AM')).toBe(0);
  });

  it('returns null for empty or unparseable input', () => {
    expect(parseTimeToMinutes('')).toBeNull();
    expect(parseTimeToMinutes(null)).toBeNull();
    expect(parseTimeToMinutes('not a time')).toBeNull();
  });
});

function makeRequest(overrides) {
  return {
    id: 'r1',
    event_date: '2026-11-01',
    event_start_time: '6:00 PM',
    event_end_time: '8:00 PM',
    rooms_requested: ['Fellowship Hall'],
    archived: false,
    ...overrides,
  };
}

describe('findRoomConflicts', () => {
  it('flags two requests for the same room on an overlapping time range', () => {
    const a = makeRequest({ id: 'a', event_start_time: '6:00 PM', event_end_time: '8:00 PM' });
    const b = makeRequest({ id: 'b', event_start_time: '7:00 PM', event_end_time: '9:00 PM' });
    expect(findRoomConflicts(a, [a, b]).map((c) => c.id)).toEqual(['b']);
    expect(findRoomConflicts(b, [a, b]).map((c) => c.id)).toEqual(['a']);
  });

  it('does not flag requests that touch end-to-end but do not overlap', () => {
    const a = makeRequest({ id: 'a', event_start_time: '6:00 PM', event_end_time: '8:00 PM' });
    const b = makeRequest({ id: 'b', event_start_time: '8:00 PM', event_end_time: '10:00 PM' });
    expect(findRoomConflicts(a, [a, b])).toEqual([]);
  });

  it('does not flag requests for different rooms, even at the same overlapping time', () => {
    const a = makeRequest({ id: 'a', rooms_requested: ['Sanctuary'] });
    const b = makeRequest({ id: 'b', rooms_requested: ['Fellowship Hall'] });
    expect(findRoomConflicts(a, [a, b])).toEqual([]);
  });

  it('does not flag requests on different dates', () => {
    const a = makeRequest({ id: 'a', event_date: '2026-11-01' });
    const b = makeRequest({ id: 'b', event_date: '2026-11-02' });
    expect(findRoomConflicts(a, [a, b])).toEqual([]);
  });

  it('flags a conflict even when the other request is archived', () => {
    const a = makeRequest({ id: 'a' });
    const b = makeRequest({ id: 'b', archived: true });
    expect(findRoomConflicts(a, [a, b]).map((c) => c.id)).toEqual(['b']);
  });

  it('flags a conflict when only one of several shared rooms overlaps', () => {
    const a = makeRequest({ id: 'a', rooms_requested: ['Fellowship Hall', 'Kitchen'] });
    const b = makeRequest({ id: 'b', rooms_requested: ['Sanctuary', 'Kitchen'] });
    expect(findRoomConflicts(a, [a, b]).map((c) => c.id)).toEqual(['b']);
  });

  it('never flags a request against itself', () => {
    const a = makeRequest({ id: 'a' });
    expect(findRoomConflicts(a, [a])).toEqual([]);
  });
});
