export const SW = 2560;
export const SH = 1600; // 16:10
export const CORNER_R = 0;

export const ASPECT_RATIOS = [
  { id: "16:10", label: "16:10", w: 2560, h: 1600 },
  { id: "16:9",  label: "16:9",  w: 2560, h: 1440 },
  { id: "portrait_legal", label: "11x8.5", w: 2560, h: 3313 },
];

// Fixed brand typography - Inter Tight Bold for the headline, Aleo for
// everything else, matching the public site's own type system
// (designTokens.js). No font picker: this is the only combo.
export const HEADLINE_FONT = "'Inter Tight',sans-serif";
export const HEADLINE_WEIGHT = 700;
export const BODY_FONT = "'Aleo',serif";
// Aleo's real static instances only go up to 700 (300/400/700), no 500/600 -
// 400 is its true regular weight, not a synthesized one (see
// designTokens.js's own note on this).
export const BODY_WEIGHT = 400;

// Two fixed background swatches - no custom color picker. Each has its own
// pair of allowed text colors, so picking a background always leaves a
// readable, on-brand text color selected.
export const BACKGROUNDS = [
  { id: "dark", name: "Dark", bg: "#2B433E", textOptions: [
    { id: "white", name: "White", color: "#FFFFFF" },
    { id: "yellow", name: "Yellow", color: "#EAA235" },
  ] },
  { id: "light", name: "Light", bg: "#FFFFFF", textOptions: [
    { id: "black", name: "Black", color: "#000000" },
    { id: "charcoal", name: "#1E2522", color: "#1E2522" },
  ] },
];

export const TEMPLATES = [
  { id: "minimal", name: "Centered" },
  { id: "left_block", name: "Left Aligned" },
];