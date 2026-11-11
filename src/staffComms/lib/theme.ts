import { colors, fonts } from '../../styles/designTokens.js';

// Every color below is one of the site's five literal hexes, imported
// from the one shared designTokens.js file (also consumed by
// tailwind.config.js) instead of re-typed here - no invented tint, shade
// or opacity blend standing in as a would-be sixth color. The category
// badges (scope/happening_type/recurring) used to keep their own
// informational hues (blue for event, purple for class, etc.), distinct
// from the site's own chrome, so each type was instantly recognizable
// without reading the label - now limited to the same five, so some of
// that at-a-glance distinction is gone; they're differentiated by
// bg/text/border combination instead of by hue.
export const scopeChipColors: Record<string, { bg: string; text: string; border: string }> = {
  whole_church:  { bg: colors.secondary, text: colors.white, border: colors.secondary },
  ministry:      { bg: colors.primary, text: colors.white, border: colors.primary },
  informational: { bg: colors.section, text: colors.secondary, border: colors.secondary },
};

export const scopeRangeColors: Record<string, string> = {
  whole_church:  colors.secondary,
  ministry:      colors.primary,
  informational: colors.gold,
};

export const happeningTypeChipColors: Record<string, { bg: string; text: string; border: string }> = {
  announcement: { bg: colors.section, text: colors.secondary, border: colors.secondary },
  event:        { bg: colors.primary, text: colors.white, border: colors.primary },
  class:        { bg: colors.gold, text: colors.secondary, border: colors.gold },
  general:      { bg: colors.red, text: colors.white, border: colors.red },
};

// A recurring item's schedule needs its own flag in that same badge row -
// reuses gold as an outline (white fill, gold border/text) rather than
// gold's own solid fill, which "class" already uses, so the two don't
// read as the same badge.
export const recurringChipColor = { bg: colors.white, text: colors.gold, border: colors.gold };

// This suite (Manage, Happenings, Calendar, Stage, Printables, Archive)
// renders via inline styles off this object instead of Tailwind classes,
// so it needs its own copy of the site's palette rather than picking the
// Tailwind tokens up automatically - but that copy is these same five
// colors.* values, not independently hand-typed hexes.
export const C = {
  // Surfaces
  bg:          colors.page,
  bgSubtle:    colors.section,
  card:        colors.white,
  cardAlt:     colors.section,
  // Borders
  border:      colors.primary,
  borderMed:   colors.secondary,
  borderFocus: colors.primary,
  // Text
  text:        colors.secondary,
  textSec:     colors.primary,
  textTer:     colors.primary,
  textMuted:   colors.primary,
  // Accent (matches the main site's admin buttons)
  accent:      colors.primary,
  accentBg:    colors.section,
  accentDark:  colors.secondary,
  accentHover: colors.secondary,
  // Status
  warn:        colors.red,
  warnBg:      colors.section,
  success:     colors.primary,
  successBg:   colors.section,
  // Interaction tints
  high:        colors.primary,
  highBg:      colors.section,
  // Dark panels
  stageBg:     colors.secondary,
  stageText:   colors.white,
  // Nav
  navBg:       colors.secondary,
  navText:     colors.white,
} as const;

// display is this suite's "title/header" font - used on every actual
// section/panel title (always already bold, matching the public site's
// own h1-h6 rule in index.css) and, consistently with that same
// public-site convention (.btn also uses the heading font), on the bold
// buttons/pills/labels styled to match. Matches the public site's
// current defaults (also from designTokens.js): Inter Tight Bold for
// headers, Inter Regular for body.
export const font = {
  body:    fonts.body,
  display: fonts.heading,
  mono:    "'JetBrains Mono', 'Fira Mono', monospace",
} as const;
