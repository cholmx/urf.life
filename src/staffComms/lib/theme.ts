// Category badges are informational (letting staff tell announcement types
// apart at a glance), not brand chrome, so they keep their own colors while
// everything else below uses the site-wide dark gray / white admin palette.
export const scopeChipColors: Record<string, { bg: string; text: string; border: string }> = {
  whole_church:  { bg: '#E5E5E5', text: '#1E1E21', border: '#D0D0D0' },
  ministry:      { bg: '#EFEFEF', text: '#3A3A3D', border: '#DCDCDC' },
  informational: { bg: '#F5F5F5', text: '#6E6E6E', border: '#E5E5E5' },
};

export const scopeRangeColors: Record<string, string> = {
  whole_church:  '#1E1E21',
  ministry:      '#4A4A4D',
  informational: '#7A7A7D',
};

// happening_type badges get real hues (not grayscale like the scope
// chips above) - on the Dashboard/Manage list, scope + recurring +
// happening_type all compete for attention in the same badge row, and
// an all-gray palette made them hard to tell apart at a glance (the
// actual complaint this was added for). Announcement stays neutral
// since it's the plain/default type; event, class and general each get
// their own color so the type reads instantly without having to read
// the label text.
export const happeningTypeChipColors: Record<string, { bg: string; text: string; border: string }> = {
  announcement: { bg: '#F5F5F5', text: '#6E6E6E', border: '#E5E5E5' },
  event:        { bg: '#DCEAFE', text: '#1D4ED8', border: '#BFDBFE' },
  class:        { bg: '#EDE4FB', text: '#6D28D9', border: '#DDD0F5' },
  general:      { bg: '#FDF0D5', text: '#92650C', border: '#F7E0AD' },
};

// A recurring item's schedule (not a type, not a scope) needs its own
// visually distinct flag in that same badge row - amber reads as "this
// repeats" without colliding with any of the colors above.
export const recurringChipColor = { bg: '#FDEBD3', text: '#B45309', border: '#F9D9A8' };

export const C = {
  // Surfaces
  bg:          '#F7F7F7',
  bgSubtle:    '#EFEFEF',
  card:        '#FFFFFF',
  cardAlt:     '#F5F5F5',
  // Borders
  border:      '#E2E2E2',
  borderMed:   '#C7C7C7',
  borderFocus: '#1E1E21',
  // Text
  text:        '#1E1E21',
  textSec:     '#4A4A4D',
  textTer:     '#6E6E6E',
  textMuted:   '#9A9A9A',
  // Accent (dark gray - matches the main site's admin buttons)
  accent:      '#1E1E21',
  accentBg:    '#EFEFEF',
  accentDark:  '#000000',
  accentHover: '#3A3A3D',
  // Status
  warn:        '#BA1A1A',
  warnBg:      '#FFDAD6',
  success:     '#2E7D32',
  successBg:   '#DCF0DD',
  // Interaction tints
  high:        '#1E1E21',
  highBg:      '#EFEFEF',
  // Dark panels
  stageBg:     '#1E1E21',
  stageText:   '#FFFFFF',
  // Nav
  navBg:       '#1E1E21',
  navText:     '#FFFFFF',
} as const;

export const font = {
  body:    "'Inter', sans-serif",
  display: "'Inter Tight', sans-serif",
  mono:    "'JetBrains Mono', 'Fira Mono', monospace",
} as const;
