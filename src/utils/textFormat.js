const FILLER_WORDS = new Set([
  'a', 'an', 'the',
  'and', 'but', 'or', 'nor',
  'of', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'from', 'into', 'onto', 'upon'
])

export const toTitleCase = (str) => {
  if (!str || typeof str !== 'string') return str
  return str
    .trim()
    .split(/\s+/)
    .map((word, index) => {
      const lower = word.toLowerCase()
      if (index === 0 || !FILLER_WORDS.has(lower)) {
        return lower.charAt(0).toUpperCase() + lower.slice(1)
      }
      return lower
    })
    .join(' ')
}
