import { describe, it, expect } from 'vitest';
import { parseResourcesFile } from './resourceParser';

describe('parseResourcesFile', () => {
  it('parses a single book with category, author, and multiple links', () => {
    const text = `Category: Suffering & Healing
Title: The Problem of Pain
Author: C.S. Lewis
Links to Books:

https://www.amazon.com/dp/0060652969
https://www.barnesandnoble.com/w/the-problem-of-pain`;

    const result = parseResourcesFile(text);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      category: 'Suffering & Healing',
      title: 'The Problem of Pain',
      author: 'C.S. Lewis',
      links: [
        'https://www.amazon.com/dp/0060652969',
        'https://www.barnesandnoble.com/w/the-problem-of-pain'
      ]
    });
  });

  it('parses multiple books separated by a blank line between entries', () => {
    const text = `Category: Christian Living
Title: Mere Christianity
Author: C.S. Lewis
Links to Books:

https://www.amazon.com/dp/0060652926


Category: Prayer
Title: The Practice of the Presence of God
Author: Brother Lawrence
Links to Books:

https://www.amazon.com/dp/0007101940`;

    const result = parseResourcesFile(text);

    expect(result).toHaveLength(2);
    expect(result[0].title).toBe('Mere Christianity');
    expect(result[1].title).toBe('The Practice of the Presence of God');
  });

  it('drops entries with no title or no links', () => {
    const text = `Category: Incomplete
Links to Books:

https://www.amazon.com/dp/0000000000`;

    expect(parseResourcesFile(text)).toEqual([]);
  });
});
