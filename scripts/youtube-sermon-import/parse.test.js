import { describe, it, expect } from 'vitest';
import { parseSermonTitle, extractYouTubeVideoId, splitDescriptionSections } from './parse.js';

describe('parseSermonTitle', () => {
  it('parses a title with a series', () => {
    expect(parseSermonTitle('Acts :: Can God Use This Mess? // Chris Holm')).toEqual({
      series: 'Acts',
      sermonName: 'Can God Use This Mess?',
      speaker: 'Chris Holm',
    });
  });

  it('parses a standalone title with no series', () => {
    expect(parseSermonTitle('Ananias and Sapphira // Chris Holm')).toEqual({
      series: null,
      sermonName: 'Ananias and Sapphira',
      speaker: 'Chris Holm',
    });
  });

  it('trims extra whitespace around the delimiters', () => {
    expect(parseSermonTitle('Acts   ::   Can God Use This Mess?   //   Chris Holm')).toEqual({
      series: 'Acts',
      sermonName: 'Can God Use This Mess?',
      speaker: 'Chris Holm',
    });
  });

  it('returns null for a title matching neither shape (not yet following the convention)', () => {
    expect(parseSermonTitle('Sunday Service - October 18')).toBeNull();
  });

  it('returns null for empty or missing input', () => {
    expect(parseSermonTitle('')).toBeNull();
    expect(parseSermonTitle(null)).toBeNull();
    expect(parseSermonTitle(undefined)).toBeNull();
  });
});

describe('extractYouTubeVideoId', () => {
  const ID = 'dQw4w9WgXcQ';

  it('extracts from a standard watch URL', () => {
    expect(extractYouTubeVideoId(`https://www.youtube.com/watch?v=${ID}`)).toBe(ID);
  });

  it('extracts from a watch URL with extra query params', () => {
    expect(extractYouTubeVideoId(`https://www.youtube.com/watch?v=${ID}&t=42s&list=PL123`)).toBe(ID);
  });

  it('extracts from a youtu.be short link', () => {
    expect(extractYouTubeVideoId(`https://youtu.be/${ID}`)).toBe(ID);
  });

  it('extracts from an embed URL', () => {
    expect(extractYouTubeVideoId(`https://www.youtube.com/embed/${ID}`)).toBe(ID);
  });

  it('extracts from a shorts URL', () => {
    expect(extractYouTubeVideoId(`https://www.youtube.com/shorts/${ID}`)).toBe(ID);
  });

  it('returns a bare 11-character ID unchanged', () => {
    expect(extractYouTubeVideoId(ID)).toBe(ID);
  });

  it('returns null for an unrelated or empty string', () => {
    expect(extractYouTubeVideoId('not a youtube url')).toBeNull();
    expect(extractYouTubeVideoId('')).toBeNull();
    expect(extractYouTubeVideoId(null)).toBeNull();
  });
});

describe('splitDescriptionSections', () => {
  it('splits a description with both headers', () => {
    const description = [
      'Summary:',
      'This week we looked at Acts 7.',
      '',
      'Discussion Questions:',
      'What stood out to you?',
      'How will you apply this?',
    ].join('\n');
    const result = splitDescriptionSections(description);
    expect(result.summary).toContain('Acts 7');
    expect(result.discussionQuestions).toContain('What stood out to you?');
    expect(result.discussionQuestions).toContain('How will you apply this?');
  });

  it('is case-insensitive on the headers', () => {
    const description = 'summary:\nShort summary.\n\ndiscussion questions:\nQ1?';
    const result = splitDescriptionSections(description);
    expect(result.summary).toBe('Short summary.');
    expect(result.discussionQuestions).toBe('Q1?');
  });

  it('returns empty strings when neither header is present', () => {
    expect(splitDescriptionSections('Just a plain description, no headers.')).toEqual({
      summary: '',
      discussionQuestions: '',
    });
  });

  it('handles missing/empty input', () => {
    expect(splitDescriptionSections('')).toEqual({ summary: '', discussionQuestions: '' });
    expect(splitDescriptionSections(null)).toEqual({ summary: '', discussionQuestions: '' });
  });
});
