// Strips HTML tags so rich-text fields (announcements, ministries, etc.) can
// be shown as plain-text search snippets.
export const stripHtml = (html) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
};

export const makeSnippet = (text, maxLength = 160) => {
  const clean = stripHtml(text);
  if (!clean) return '';
  if (clean.length <= maxLength) return clean;
  // Trim to the last whole word so the snippet doesn't cut off mid-word.
  return `${clean.slice(0, maxLength).replace(/\s+\S*$/, '')}…`;
};

// PostgREST .or() filter strings use "," to separate conditions and "()" to
// group them, and ilike patterns treat "%"/"*" as wildcards - so raw user
// input containing those characters could corrupt the filter or change what
// it matches. Strip them before the term is interpolated into the filter.
export const sanitizeForFilter = (query) => {
  if (!query) return '';
  return query.replace(/[,()%*]/g, ' ').trim();
};
