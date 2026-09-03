import { describe, it, expect } from 'vitest';
import { parseLocalDate, formatDate, formatTime, getTodayDateString } from './dateFormat';

describe('parseLocalDate', () => {
  it('parses a YYYY-MM-DD string as a local date, not UTC midnight', () => {
    const date = parseLocalDate('2026-08-30');
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(7); // 0-indexed August
    expect(date.getDate()).toBe(30);
  });

  it('returns null for empty input', () => {
    expect(parseLocalDate('')).toBeNull();
    expect(parseLocalDate(null)).toBeNull();
  });

  it('falls back to native Date parsing for full timestamps', () => {
    const date = parseLocalDate('2026-08-30T14:00:00Z');
    expect(date instanceof Date).toBe(true);
    expect(Number.isNaN(date.getTime())).toBe(false);
  });
});

describe('formatDate', () => {
  it('never shows the day before the stored date (the original bug)', () => {
    // new Date('2026-08-30').toLocaleDateString() is the buggy behavior this
    // guards against - it renders 8/29 in any timezone behind UTC because
    // the bare date string gets parsed as UTC midnight.
    expect(formatDate('2026-08-30')).toBe('August 30, 2026');
  });

  it('returns an empty string for a missing date', () => {
    expect(formatDate('')).toBe('');
    expect(formatDate(null)).toBe('');
  });

  it('accepts custom Intl options', () => {
    expect(formatDate('2026-08-30', { month: 'short', day: 'numeric', year: 'numeric' })).toBe('Aug 30, 2026');
  });
});

describe('formatTime', () => {
  it('formats a Postgres HH:MM:SS time as 12-hour clock time', () => {
    expect(formatTime('19:00:00')).toBe('7:00 PM');
    expect(formatTime('09:05:00')).toBe('9:05 AM');
  });

  it('also accepts an HH:MM value without seconds', () => {
    expect(formatTime('19:00')).toBe('7:00 PM');
  });

  it('returns an empty string for a missing time', () => {
    expect(formatTime('')).toBe('');
    expect(formatTime(null)).toBe('');
  });
});

describe('getTodayDateString', () => {
  it('matches the current local date components', () => {
    const now = new Date();
    const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    expect(getTodayDateString()).toBe(expected);
  });
});
