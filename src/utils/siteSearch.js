import supabase from '../lib/supabase';
import { makeSnippet, sanitizeForFilter } from './searchHelpers';

const SOURCES = [
  {
    type: 'announcement',
    label: 'Announcements',
    table: 'staff_announcements_portal123',
    select: 'id,title,body',
    columns: ['title', 'body'],
    titleField: 'title',
    snippetField: 'body',
    url: '/announcements',
    // Only published happenings, and skip ones copied in from the legacy
    // events/classes tables - those are indexed separately below, still
    // pointed at their own (frozen, no-longer-added-to) tables.
    extraFilter: (q) => q.eq('is_published', true).is('legacy_source_table', null),
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
    type: 'event',
    label: 'Events',
    table: 'events_portal123',
    select: 'id,title,details,location,event_date',
    columns: ['title', 'details', 'location'],
    titleField: 'title',
    snippetField: 'details',
    url: '/events',
  },
  {
    type: 'class',
    label: 'Classes',
    table: 'classes_portal123',
    select: 'id,title,details,location,start_date',
    columns: ['title', 'details', 'location'],
    titleField: 'title',
    snippetField: 'details',
    url: '/class-registration',
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

  return (data || []).map((row) => ({
    type: source.type,
    label: source.label,
    id: row.id,
    title: row[source.titleField] || 'Untitled',
    snippet: makeSnippet(row[source.snippetField]),
    url: source.url,
  }));
};

export const searchSite = async (query) => {
  const term = sanitizeForFilter(query);
  if (!term) return [];

  const results = await Promise.all(SOURCES.map((source) => searchSource(source, term)));
  return results.flat();
};
