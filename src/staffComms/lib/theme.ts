import { colors, categoryColors, fonts } from '../../styles/designTokens.js';

// Scope stays on the five core brand colors - whole_church/ministry read
// as deliberately different weights of "how official is this" (near-black
// vs the brand green), which is its own useful signal.
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

// Happening type uses two of the core colors (gold, red) plus the two
// category-only colors from designTokens.js - event used to share the
// same dark green as the ministry scope pill right next to it on the
// same card, so the two looked like one undifferentiated dark badge
// instead of two separate pieces of information.
export const happeningTypeChipColors: Record<string, { bg: string; text: string; border: string }> = {
  announcement: { bg: categoryColors.blue, text: colors.white, border: categoryColors.blue },
  event:        { bg: colors.gold, text: colors.secondary, border: colors.gold },
  class:        { bg: categoryColors.plum, text: colors.white, border: categoryColors.plum },
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
  accentHover: colors.secondary,
  // Status
  warn:        colors.red,
  warnBg:      colors.section,
  success:     colors.primary,
  successBg:   colors.section,
  // Interaction tints
  highBg:      colors.section,
  // Dark panels
  stageBg:     colors.secondary,
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
