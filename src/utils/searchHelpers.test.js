import { describe, it, expect } from 'vitest';
import { stripHtml, makeSnippet, sanitizeForFilter } from './searchHelpers';

describe('stripHtml', () => {
  it('removes tags and collapses whitespace', () => {
    expect(stripHtml('<p>Hello <b>world</b></p>')).toBe('Hello world');
  });

  it('returns an empty string for empty input', () => {
    expect(stripHtml('')).toBe('');
    expect(stripHtml(null)).toBe('');
  });
});

describe('makeSnippet', () => {
  it('returns the plain text unchanged when under the length limit', () => {
    expect(makeSnippet('<p>Short text</p>')).toBe('Short text');
  });

  it('truncates long text on a word boundary and adds an ellipsis', () => {
    const text = 'word '.repeat(50).trim();
    const snippet = makeSnippet(text, 20);
    expect(snippet.length).toBeLessThanOrEqual(21);
    expect(snippet.endsWith('…')).toBe(true);
    expect(snippet.slice(0, -1).endsWith(' ')).toBe(false);
  });

  it('returns an empty string for empty input', () => {
    expect(makeSnippet('')).toBe('');
    expect(makeSnippet(null)).toBe('');
  });
});

describe('sanitizeForFilter', () => {
  it('strips characters that are meaningful to PostgREST or() filter syntax', () => {
    expect(sanitizeForFilter('prayer,night(2026)')).toBe('prayer night 2026');
  });

  it('strips ilike wildcard characters', () => {
    expect(sanitizeForFilter('100% grace * amen')).toBe('100  grace   amen');
  });

  it('trims surrounding whitespace', () => {
    expect(sanitizeForFilter('  youth group  ')).toBe('youth group');
  });

  it('returns an empty string for empty input', () => {
    expect(sanitizeForFilter('')).toBe('');
    expect(sanitizeForFilter(null)).toBe('');
  });
});
