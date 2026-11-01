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

// Site palette (F7F5EE/FFFFFF/D49E46/3E584D/1E2522/CC4733), same values
// tailwind.config.js uses for the rest of the app - this suite (Manage,
// Happenings, Calendar, Stage, Printables, Archive) renders via inline
// styles off this object instead of Tailwind classes, so it needs its own
// copy rather than picking the tokens up automatically. A few entries are
// necessarily derived tints (borders, hover/muted steps) rather than one
// of the six literal hexes, same reasoning as tailwind.config.js's custom
// neutral ramp - every one is still anchored to F7F5EE or 1E2522, not an
// unrelated hue.
export const C = {
  // Surfaces
  bg:          '#F7F5EE',
  bgSubtle:    '#FFFFFF',
  card:        '#FFFFFF',
  cardAlt:     '#F7F5EE',
  // Borders
  border:      'rgba(30, 37, 34, 0.12)',
  borderMed:   'rgba(30, 37, 34, 0.25)',
  borderFocus: '#3E584D',
  // Text
  text:        '#1E2522',
  textSec:     '#3E584D',
  textTer:     'rgba(30, 37, 34, 0.6)',
  textMuted:   'rgba(30, 37, 34, 0.4)',
  // Accent (matches the main site's admin buttons)
  accent:      '#3E584D',
  accentBg:    'rgba(62, 88, 77, 0.1)',
  accentDark:  '#1E2522',
  accentHover: '#1E2522',
  // Status
  warn:        '#CC4733',
  warnBg:      '#FBE4DF',
  success:     '#3E584D',
  successBg:   'rgba(62, 88, 77, 0.12)',
  // Interaction tints
  high:        '#3E584D',
  highBg:      'rgba(62, 88, 77, 0.1)',
  // Dark panels
  stageBg:     '#1E2522',
  stageText:   '#FFFFFF',
  // Nav
  navBg:       '#1E2522',
  navText:     '#FFFFFF',
} as const;

export const font = {
  body:    "'Inter', sans-serif",
  display: "'Inter Tight', sans-serif",
  mono:    "'JetBrains Mono', 'Fira Mono', monospace",
} as const;
