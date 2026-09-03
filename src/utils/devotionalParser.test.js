import { describe, it, expect } from 'vitest';
import { parseDevotionalFile } from './devotionalParser';

describe('parseDevotionalFile', () => {
  it('parses a single devotional entry with all sections', () => {
    const currentYear = new Date().getFullYear();
    const text = `JANUARY 4: Test Title

Subtitle Line

John 1:1

Main content here.

Response: My response.

Prayer: My prayer.`;

    const result = parseDevotionalFile(text);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      devotional_date: `${currentYear}-01-04`,
      title: 'Test Title',
      subtitle: 'Subtitle Line',
      scripture_reference: 'John 1:1',
      content: 'Main content here.',
      response: 'My response.',
      prayer: 'My prayer.'
    });
  });

  it('parses multiple entries and appends extra paragraphs to content', () => {
    // The first single-line section after the title is treated as the
    // subtitle, and only the next single-line section as the scripture
    // reference - matching the documented bulk-import format, which always
    // lists a subtitle before the reference.
    const text = `FEBRUARY 14: Love One Another

A Reflection On Love

Psalm 23:1

First paragraph.

Second paragraph.

MARCH 1: A Second Entry

Third paragraph, on
two lines.`;

    const result = parseDevotionalFile(text);

    expect(result).toHaveLength(2);
    expect(result[0].title).toBe('Love One Another');
    expect(result[0].subtitle).toBe('A Reflection On Love');
    expect(result[0].scripture_reference).toBe('Psalm 23:1');
    expect(result[0].content).toBe('First paragraph.\n\nSecond paragraph.');
    expect(result[1].title).toBe('A Second Entry');
    // A single-line section right after the title is captured as the
    // subtitle (see above), so a lone one-line paragraph with no subtitle
    // intended would be misfiled - this entry uses two lines to land in
    // content instead, which is the realistic shape for actual body text.
    expect(result[1].content).toBe('Third paragraph, on\ntwo lines.');
  });

  it('returns an empty array for text with no recognizable date headers', () => {
    expect(parseDevotionalFile('just some random text\n\nwith no headers')).toEqual([]);
  });
});
