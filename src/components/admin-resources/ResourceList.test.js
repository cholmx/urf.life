import { describe, it, expect } from 'vitest';
import { getCleanDescription, getWebsiteName } from './ResourceList';

describe('getCleanDescription', () => {
  it('strips "Available from multiple sources" boilerplate', () => {
    expect(getCleanDescription('A great book. Available from multiple sources.')).toBe('A great book.');
  });

  it('returns an empty string when nothing but the boilerplate remains', () => {
    expect(getCleanDescription('Available from multiple sources.')).toBe('');
  });

  it('leaves a normal description untouched', () => {
    expect(getCleanDescription('A thoughtful reflection on suffering.')).toBe('A thoughtful reflection on suffering.');
  });

  it('returns an empty string for no description', () => {
    expect(getCleanDescription(null)).toBe('');
    expect(getCleanDescription('')).toBe('');
  });
});

describe('getWebsiteName', () => {
  it('recognizes known retailers by domain', () => {
    expect(getWebsiteName('https://www.amazon.com/dp/123')).toBe('Amazon');
    expect(getWebsiteName('https://www.barnesandnoble.com/w/book')).toBe('Barnes & Noble');
    expect(getWebsiteName('https://www.christianbook.com/book')).toBe('Christian Book');
  });

  it('falls back to "Website" for an unrecognized domain', () => {
    expect(getWebsiteName('https://www.example.com/book')).toBe('Website');
  });

  it('falls back to "Website" for an unparseable URL instead of throwing', () => {
    expect(getWebsiteName('not-a-url')).toBe('Website');
  });
});
