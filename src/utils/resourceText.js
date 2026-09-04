// Longer, period-inclusive variants must come before their shorter
// no-period counterparts: String.replace only removes the first literal
// match, so checking the no-period form first left a stray "." behind
// whenever the noise phrase in the source text actually ended in one.
const DESCRIPTION_NOISE = [
  'Available from multiple sources.',
  'Available from multiple sources',
  'available from multiple sources.',
  'available from multiple sources',
  'AVAILABLE FROM MULTIPLE SOURCES.',
  'AVAILABLE FROM MULTIPLE SOURCES'
];

// Strips leftover "Available from multiple sources" boilerplate that used
// to get pasted into descriptions before the bulk-import format changed.
// Shared by BookCard (public) and ResourceList (admin) so a fix only has
// to be made once.
export const getCleanDescription = (description) => {
  if (!description) return '';
  let cleanDescription = description.trim();
  DESCRIPTION_NOISE.forEach(text => {
    cleanDescription = cleanDescription.replace(text, '').trim();
  });
  if (!cleanDescription || cleanDescription.match(/^[.,!?;:\s]*$/)) return '';
  return cleanDescription;
};
