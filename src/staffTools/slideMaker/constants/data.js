export const SW = 2560;
export const SH = 1600; // 16:10
export const CORNER_R = 0;

export const ASPECT_RATIOS = [
  { id: "16:10", label: "16:10", w: 2560, h: 1600 },
  { id: "16:9",  label: "16:9",  w: 2560, h: 1440 },
];

// Fixed brand typography for the Custom Editor - Inter Tight Bold for the
// headline, Bitter for the subhead. No font picker: this is the only
// combo a manually-built slide gets.
export const HEADLINE_FONT = "'Inter Tight',sans-serif";
export const HEADLINE_WEIGHT = 700;
export const BODY_FONT = "'Bitter',serif";
export const BODY_WEIGHT = 400;

// The automatic slide maker (random backgrounds/colors/blur) also
// randomly picks one of these two headline/subhead font pairings per
// generated slide, alongside its other random choices - see
// computeAutoSlide in SlideMaker.jsx. Pairing 2 is exactly the Custom
// Editor's own default above (Inter Tight Bold headline, Bitter italic
// subhead); Pairing 1 flips the roles with Bitter Black (900 - Bitter's
// heaviest real static weight, not a synthesized bold) for the headline,
// which also randomizes between its upright and italic faces
// (hItalicRandom) rather than being fixed either way.
export const AUTO_FONT_PAIRINGS = [
  { hFont: "'Bitter',serif", hWeight: 900, hItalicRandom: true, bFont: "'Inter Tight',sans-serif", bWeight: 700, bItalic: false },
  { hFont: HEADLINE_FONT, hWeight: HEADLINE_WEIGHT, hItalicRandom: false, hItalic: false, bFont: BODY_FONT, bWeight: BODY_WEIGHT, bItalic: true },
];

// Fixed background swatches - no custom color picker. Each has its own set
// of allowed text colors, so picking a background always leaves a readable,
// on-brand text color selected. Most of these (see DARK_OVERLAY_OPTIONS in
// SlideMaker.jsx, used for the semi-transparent texture overlays of
// automatic generation) are also available here as a full-opacity solid
// background in their own right - the two systems share colors but not
// opacity. White isn't repeated as its own swatch since Light already is
// that color. Dark and Black were dropped from this list (no longer
// pickable, manually or by the automatic generator) - Pine and Mint below
// stand in for them as the dark/light bucket automatic photo-texture
// overlays fall back to (see DARK_BUCKET/LIGHT_BUCKET in SlideMaker.jsx).
export const BACKGROUNDS = [
  { id: "light", name: "Light", bg: "#FFFFFF", textOptions: [
    { id: "black", name: "Black", color: "#000000" },
    { id: "charcoal", name: "#1E2522", color: "#1E2522" },
  ] },
  { id: "pine", name: "Pine", bg: "#04443F", textOptions: [
    { id: "white", name: "White", color: "#FFFFFF" },
    { id: "yellow", name: "Yellow", color: "#FFD944" },
  ] },
  { id: "mint", name: "Mint", bg: "#D3E5DB", textOptions: [
    { id: "black", name: "Black", color: "#000000" },
    { id: "charcoal", name: "#1E2522", color: "#1E2522" },
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

// Subtle branded watermark images the automatic slide maker layers over a
// solid-color background (one picked at random, at a random low opacity -
// see pickMarkOverlay in SlideMaker.jsx), between the flat color fill and
// the headline/subhead text. Each is a transparent PNG with the URF
// chevron mark drawn in white, at the same 16:10 aspect ratio as the
// slide canvas so it can be stretched to fill it with no distortion. Used
// on every background except Light/Mint (see MARK_OVERLAYS_LIGHT) - white
// ink on a near-white fill wouldn't read at all.
export const MARK_OVERLAYS = [
  "/slide-marks/mark-top.png",
  "/slide-marks/mark-pattern.png",
  "/slide-marks/mark-bottom.png",
  "/slide-marks/mark-pattern-dense.png",
  "/slide-marks/mark-corners.png",
];

// The Light/Mint counterpart to MARK_OVERLAYS above - same idea, drawn in
// black ink instead of white so it actually shows up on those two pale
// backgrounds.
export const MARK_OVERLAYS_LIGHT = [
  "/slide-marks/mark-corners-light.png",
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