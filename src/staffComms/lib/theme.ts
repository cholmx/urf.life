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
  // Dark panels (Stage, Slides)
  stageBg:     '#1E1E21',
  stageText:   '#FFFFFF',
  stageAccent: '#FFFFFF',
  slideBg:     '#1E1E21',
  slideText:   '#FFFFFF',
  // Nav
  navBg:       '#1E1E21',
  navText:     '#FFFFFF',
} as const;

export const font = {
  body:    "'Inter', sans-serif",
  display: "'Inter Tight', sans-serif",
  mono:    "'JetBrains Mono', 'Fira Mono', monospace",
} as const;
