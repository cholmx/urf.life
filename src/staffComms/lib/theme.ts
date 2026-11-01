// Every color below is one of the site's six literal hexes - F7F5EE,
// FFFFFF, CC7D28, 3E584D, 1E2522, CC4733 - no invented tint, shade or
// opacity blend standing in as a would-be seventh color. The category
// badges (scope/happening_type/recurring) used to keep their own
// informational hues (blue for event, purple for class, etc.), distinct
// from the site's own chrome, so each type was instantly recognizable
// without reading the label - now limited to the same six, so some of
// that at-a-glance distinction is gone; they're differentiated by
// bg/text/border combination instead of by hue.
export const scopeChipColors: Record<string, { bg: string; text: string; border: string }> = {
  whole_church:  { bg: '#1E2522', text: '#FFFFFF', border: '#1E2522' },
  ministry:      { bg: '#3E584D', text: '#FFFFFF', border: '#3E584D' },
  informational: { bg: '#F7F5EE', text: '#1E2522', border: '#1E2522' },
};

export const scopeRangeColors: Record<string, string> = {
  whole_church:  '#1E2522',
  ministry:      '#3E584D',
  informational: '#CC7D28',
};

export const happeningTypeChipColors: Record<string, { bg: string; text: string; border: string }> = {
  announcement: { bg: '#F7F5EE', text: '#1E2522', border: '#1E2522' },
  event:        { bg: '#3E584D', text: '#FFFFFF', border: '#3E584D' },
  class:        { bg: '#CC7D28', text: '#1E2522', border: '#CC7D28' },
  general:      { bg: '#CC4733', text: '#FFFFFF', border: '#CC4733' },
};

// A recurring item's schedule needs its own flag in that same badge row -
// reuses gold as an outline (white fill, gold border/text) rather than
// gold's own solid fill, which "class" already uses, so the two don't
// read as the same badge.
export const recurringChipColor = { bg: '#FFFFFF', text: '#CC7D28', border: '#CC7D28' };

// This suite (Manage, Happenings, Calendar, Stage, Printables, Archive)
// renders via inline styles off this object instead of Tailwind classes,
// so it needs its own copy of the site's six-color palette rather than
// picking the tokens up automatically.
export const C = {
  // Surfaces
  bg:          '#F7F5EE',
  bgSubtle:    '#FFFFFF',
  card:        '#FFFFFF',
  cardAlt:     '#F7F5EE',
  // Borders
  border:      '#3E584D',
  borderMed:   '#1E2522',
  borderFocus: '#3E584D',
  // Text
  text:        '#1E2522',
  textSec:     '#3E584D',
  textTer:     '#3E584D',
  textMuted:   '#3E584D',
  // Accent (matches the main site's admin buttons)
  accent:      '#3E584D',
  accentBg:    '#F7F5EE',
  accentDark:  '#1E2522',
  accentHover: '#1E2522',
  // Status
  warn:        '#CC4733',
  warnBg:      '#F7F5EE',
  success:     '#3E584D',
  successBg:   '#F7F5EE',
  // Interaction tints
  high:        '#3E584D',
  highBg:      '#F7F5EE',
  // Dark panels
  stageBg:     '#1E2522',
  stageText:   '#FFFFFF',
  // Nav
  navBg:       '#1E2522',
  navText:     '#FFFFFF',
} as const;

// display is this suite's "title/header" font - used on every actual
// section/panel title (always already bold + uppercase, matching the
// public site's own h1-h6 rule in index.css) and, consistently with that
// same public-site convention (.btn also uses the heading font), on the
// bold uppercase buttons/pills/labels styled to match. Was Inter Tight;
// now the same Google Sans Flex every other title on the site uses.
export const font = {
  body:    "'Inter', sans-serif",
  display: "'Google Sans Flex', Inter, sans-serif",
  mono:    "'JetBrains Mono', 'Fira Mono', monospace",
} as const;
