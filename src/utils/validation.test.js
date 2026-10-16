import { describe, it, expect } from 'vitest';
import { isValidEmail } from './validation';

describe('isValidEmail', () => {
  it('accepts a normal address', () => {
    expect(isValidEmail('person@example.com')).toBe(true);
  });
  it('accepts an address with a subdomain and plus-tag', () => {
    expect(isValidEmail('first.last+tag@mail.example.co.uk')).toBe(true);
  });
  it('rejects missing @', () => {
    expect(isValidEmail('personexample.com')).toBe(false);
  });
  it('rejects missing domain', () => {
    expect(isValidEmail('person@')).toBe(false);
  });
  it('rejects missing TLD', () => {
    expect(isValidEmail('person@example')).toBe(false);
  });
  it('rejects embedded whitespace', () => {
    expect(isValidEmail('person @example.com')).toBe(false);
  });
  it('rejects empty/null/undefined', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail(null)).toBe(false);
    expect(isValidEmail(undefined)).toBe(false);
  });
  it('trims surrounding whitespace before checking', () => {
    expect(isValidEmail('  person@example.com  ')).toBe(true);
  });
});
