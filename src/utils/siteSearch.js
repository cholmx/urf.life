import supabase from '../lib/supabase';
import { makeSnippet, sanitizeForFilter } from './searchHelpers';

// Events and classes are Communication Organizer items (happening_type)
// living in the same unified table as plain announcements now - grouped
// and linked by type so search results still read like separate sections.
const HAPPENING_TYPE_META = {
  event: { label: 'Events', url: '/event-registration' },
  class: { label: 'Classes', url: '/class-registration' },
};
const DEFAULT_HAPPENING_META = { label: 'Announcements', url: '/announcements' };

const SOURCES = [
  {
    type: 'announcement',
    table: 'staff_announcements_portal123',
    select: 'id,title,body,happening_type',
    columns: ['title', 'body'],
    titleField: 'title',
    snippetField: 'body',
    resolveMeta: (row) => HAPPENING_TYPE_META[row.happening_type] || DEFAULT_HAPPENING_META,
    extraFilter: (q) => q.eq('is_published', true),
  },
  {
    type: 'sermon',
    label: 'Sermons',
    table: 'sermons_portal123',
    select: 'id,title,speaker,summary,sermon_date',
    columns: ['title', 'speaker', 'summary'],
    titleField: 'title',
    snippetField: 'summary',
    url: '/sermon-blog',
  },
  {
    type: 'resource',
    label: 'Resources',
    table: 'resources_portal123',
    select: 'id,title,description,author',
    columns: ['title', 'description', 'author'],
    titleField: 'title',
    snippetField: 'description',
    url: '/resources',
  },
  {
    type: 'devotional',
    label: 'Daily Devotionals',
    table: 'daily_devotionals_portal123',
    select: 'id,title,subtitle,scripture_reference,content,devotional_date',
    columns: ['title', 'subtitle', 'scripture_reference', 'content'],
    titleField: 'title',
    snippetField: 'content',
    url: '/daily-devotionals',
  },
  {
    type: 'ministry',
    label: 'Ministries & Opportunities',
    table: 'ministries_portal123',
    select: 'id,title,description',
    columns: ['title', 'description'],
    titleField: 'title',
    snippetField: 'description',
    url: '/ministries',
  },
];

const searchSource = async (source, term) => {
  const pattern = `%${term}%`;
  const orFilter = source.columns.map((column) => `${column}.ilike.${pattern}`).join(',');

  let query = supabase.from(source.table).select(source.select);
  if (source.extraFilter) query = source.extraFilter(query);
  const { data, error } = await query.or(orFilter).limit(10);

  if (error) {
    console.error(`Search failed for ${source.table}:`, error);
    return [];
  }

  return (data || []).map((row) => {
    const meta = source.resolveMeta ? source.resolveMeta(row) : { label: source.label, url: source.url };
    return {
      type: source.type,
      label: meta.label,
      id: row.id,
      title: row[source.titleField] || 'Untitled',
      snippet: makeSnippet(row[source.snippetField]),
      url: meta.url,
    };
  });
};

export const searchSite = async (query) => {
  const term = sanitizeForFilter(query);
  if (!term) return [];

  const results = await Promise.all(SOURCES.map((source) => searchSource(source, term)));
  return results.flat();
};
