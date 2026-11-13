export const SW = 2560;
export const SH = 1600; // 16:10
export const CORNER_R = 0;

export const ASPECT_RATIOS = [
  { id: "16:10", label: "16:10", w: 2560, h: 1600 },
  { id: "16:9",  label: "16:9",  w: 2560, h: 1440 },
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

// Fixed background swatches - no custom color picker. Each has its own set
// of allowed text colors, so picking a background always leaves a readable,
// on-brand text color selected. Every brand/overlay color (see
// DARK_OVERLAY_OPTIONS in SlideMaker.jsx, used for the semi-transparent
// texture overlays of automatic generation) is also available here as a
// full-opacity solid background in its own right - the two systems share
// colors but not opacity. White isn't repeated as its own swatch since
// Light already is that color.
export const BACKGROUNDS = [
  { id: "dark", name: "Dark", bg: "#1E2522", textOptions: [
    { id: "white", name: "White", color: "#FFFFFF" },
    { id: "yellow", name: "Yellow", color: "#FFD944" },
  ] },
  { id: "light", name: "Light", bg: "#FFFFFF", textOptions: [
    { id: "black", name: "Black", color: "#000000" },
    { id: "charcoal", name: "#1E2522", color: "#1E2522" },
  ] },
  { id: "black", name: "Black", bg: "#000000", textOptions: [
    { id: "white", name: "White", color: "#FFFFFF" },
    { id: "yellow", name: "Yellow", color: "#FFD944" },
  ] },
  { id: "green", name: "Green", bg: "#2a3834", textOptions: [
    { id: "white", name: "White", color: "#FFFFFF" },
    { id: "yellow", name: "Yellow", color: "#FFD944" },
  ] },
  { id: "red", name: "Red", bg: "#C74F2F", textOptions: [
    { id: "white", name: "White", color: "#FFFFFF" },
    { id: "yellow", name: "Yellow", color: "#FFD944" },
  ] },
  { id: "gold", name: "Gold", bg: "#EAA235", textOptions: [
    { id: "white", name: "White", color: "#FFFFFF" },
    { id: "charcoal", name: "#1E2522", color: "#1E2522" },
  ] },
  { id: "sage", name: "Sage", bg: "#597F5C", textOptions: [
    { id: "white", name: "White", color: "#FFFFFF" },
    { id: "yellow", name: "Yellow", color: "#FFD944" },
  ] },
];

export const TEMPLATES = [
  { id: "minimal", name: "Centered" },
  { id: "left_block", name: "Left Aligned" },
];

// Seed images for the Photos tab's one-time "Import built-in textures"
// action (see PhotosTab.jsx / photoService.js's importBuiltInTexture) -
// not read anywhere else. Once imported they're ordinary photo-library
// rows like anything staff upload themselves, and the automatic
// background pool (SlideMaker.jsx's getTexturePool) reads only from that
// library, never from this array directly.
export const TEXTURES = [
  "/slide-textures/texture-1.jpg",
  "/slide-textures/texture-2.jpg",
  "/slide-textures/texture-3.jpg",
  "/slide-textures/texture-4.jpg",
  "/slide-textures/texture-5.jpg",
  "/slide-textures/texture-6.jpg",
  "/slide-textures/texture-7.jpg",
  "/slide-textures/texture-8.jpg",
  "/slide-textures/texture-9.jpg",
  "/slide-textures/texture-10.jpg",
  "/slide-textures/texture-11.jpg",
  "/slide-textures/texture-12.jpg",
  "/slide-textures/texture-13.jpg",
  "/slide-textures/texture-14.jpg",
  "/slide-textures/texture-15.jpg",
];