export const SW = 2560;
export const SH = 1600; // 16:10
export const CORNER_R = 0;

export const ASPECT_RATIOS = [
  { id: "16:10", label: "16:10", w: 2560, h: 1600 },
  { id: "16:9",  label: "16:9",  w: 2560, h: 1440 },
];

// Fixed brand typography for the Custom Editor - Inter Tight Bold for the
// headline, Playfair Display for the subhead. No font picker: this is
// the only combo a manually-built slide gets. Inter Tight and Playfair
// Display are the only two fonts the Slide Maker uses anywhere, in
// either role depending on which pairing below gets picked.
export const HEADLINE_FONT = "'Inter Tight',sans-serif";
export const HEADLINE_WEIGHT = 700;
export const BODY_FONT = "'Playfair Display',serif";
export const BODY_WEIGHT = 400;

// The automatic slide maker (random backgrounds/colors/blur) also
// randomly picks one of these two headline/subhead font pairings per
// generated slide, alongside its other random choices - see
// computeAutoSlide in SlideMaker.jsx. Pairing 2 is exactly the Custom
// Editor's own default above (Inter Tight Bold headline, Playfair
// Display italic subhead); Pairing 1 flips the roles with Playfair
// Display Black (900 - its heaviest real static weight, not a
// synthesized bold) for the headline. Playfair Display is only ever used
// italic, headline role or body role alike - never hItalicRandom, never
// hItalic/bItalic: false.
export const AUTO_FONT_PAIRINGS = [
  { hFont: "'Playfair Display',serif", hWeight: 900, hItalicRandom: false, hItalic: true, bFont: "'Inter Tight',sans-serif", bWeight: 700, bItalic: false },
  { hFont: HEADLINE_FONT, hWeight: HEADLINE_WEIGHT, hItalicRandom: false, hItalic: false, bFont: BODY_FONT, bWeight: BODY_WEIGHT, bItalic: true },
];

// Fixed background swatches - no custom color picker. Each has its own set
// of allowed text colors, so picking a background always leaves a readable,
// on-brand text color selected. Most of these (see DARK_OVERLAY_OPTIONS in
// SlideMaker.jsx, used for the semi-transparent texture overlays of
// automatic generation) are also available here as a full-opacity solid
// background in their own right - the two systems share colors but not
// opacity. White isn't repeated as its own swatch since the first entry
// already is that color.
//
// These seven match the site's own rebranded palette (designTokens.js)
// exactly - ids are kept stable from before the rebrand (pine/mint/green/
// red/gold/sage) since SlideMaker.jsx looks several of them up by id
// (DARK_BUCKET/LIGHT_BUCKET, pickMarkOverlay's light-background check);
// only the display name and hex actually changed.
export const BACKGROUNDS = [
  { id: "light", name: "White", bg: "#FFFFFF", textOptions: [
    { id: "black", name: "Black", color: "#000000" },
    { id: "charcoal", name: "#1C2A2B", color: "#1C2A2B" },
  ] },
  { id: "pine", name: "Jet Black", bg: "#1C2A2B", textOptions: [
    { id: "white", name: "White", color: "#FFFFFF" },
    { id: "yellow", name: "Yellow", color: "#FFEAB7" },
    { id: "mint", name: "Cream", color: "#F4ECDD" },
  ] },
  { id: "mint", name: "Cream", bg: "#F4ECDD", textOptions: [
    { id: "black", name: "Black", color: "#000000" },
    { id: "charcoal", name: "#1C2A2B", color: "#1C2A2B" },
  ] },
  { id: "green", name: "Dark Teal", bg: "#172B2C", textOptions: [
    { id: "white", name: "White", color: "#FFFFFF" },
    { id: "yellow", name: "Yellow", color: "#FFEAB7" },
    { id: "mint", name: "Cream", color: "#F4ECDD" },
  ] },
  { id: "red", name: "Rosy Copper", bg: "#C65D3B", textOptions: [
    { id: "white", name: "White", color: "#FFFFFF" },
    { id: "yellow", name: "Yellow", color: "#FFEAB7" },
    { id: "mint", name: "Cream", color: "#F4ECDD" },
  ] },
  { id: "gold", name: "Sandy Brown", bg: "#F9AB55", textOptions: [
    { id: "white", name: "White", color: "#FFFFFF" },
    { id: "charcoal", name: "#1C2A2B", color: "#1C2A2B" },
    { id: "mint", name: "Cream", color: "#F4ECDD" },
  ] },
  { id: "sage", name: "Jungle Teal", bg: "#5B8B75", textOptions: [
    { id: "white", name: "White", color: "#FFFFFF" },
    { id: "yellow", name: "Yellow", color: "#FFEAB7" },
    { id: "mint", name: "Cream", color: "#F4ECDD" },
  ] },
];

export const TEMPLATES = [
  { id: "minimal", name: "Centered" },
  { id: "left_block", name: "Left Aligned" },
];

// Subtle branded watermark images the automatic slide maker layers over a
// solid-color background (one picked at random, at a random low opacity -
// see pickMarkOverlay in SlideMaker.jsx), between the flat color fill and
// the headline/subhead text. Each is a transparent PNG at the same 16:10
// aspect ratio as the slide canvas so it can be stretched to fill it with
// no distortion, drawn in white ink (the URF chevron mark itself, or
// another graphic built around it). Used on every background except
// Light/Mint (see MARK_OVERLAYS_LIGHT) - white ink on a near-white fill
// wouldn't read at all.
export const MARK_OVERLAYS = [
  "/slide-marks/mark-top.png",
  "/slide-marks/mark-pattern.png",
  "/slide-marks/mark-bottom.png",
  "/slide-marks/mark-pattern-dense.png",
  "/slide-marks/mark-cropframe.png",
  "/slide-marks/mark-spotlight.png",
  "/slide-marks/mark-halftone.png",
];

// The Light/Mint counterpart to MARK_OVERLAYS above - same idea, drawn in
// black ink instead of white so it actually shows up on those two pale
// backgrounds. Empty for now (its one entry, a code-generated corner
// cluster, was deleted) - pickMarkOverlay's pool-merge in SlideMaker.jsx
// handles an empty array here fine, so Light/Mint slides still get
// MARK_OVERLAYS_UNIVERSAL and FRAME_STYLES, just no dedicated image mark
// of their own until a real black-ink asset is added.
export const MARK_OVERLAYS_LIGHT = [
];

// A third pool, added alongside the two above rather than folded into
// either - these are grayscale darkening treatments (a layered mountain-
// ridge silhouette, a diagonal corner wedge, top/bottom bars, two grain/
// noise textures, a bottom gradient, a corner vignette) rather than a
// brand-colored ink, so they read fine over any background regardless of
// light or dark. pickMarkOverlay in SlideMaker.jsx always mixes this
// pool in alongside whichever of the two above fits the slide's
// background.
export const MARK_OVERLAYS_UNIVERSAL = [
  "/slide-marks/mark-ridge.png",
  "/slide-marks/mark-wedge.png",
  "/slide-marks/mark-bars.png",
  "/slide-marks/mark-grain.png",
  "/slide-marks/mark-lowerthird.png",
  "/slide-marks/mark-vignette.png",
  "/slide-marks/mark-noise.png",
];

// A thin rounded-rectangle border, inset from the slide's edge - drawn
// natively on the canvas (see drawMarkFrame in renderEngine.js) rather
// than as an image, so it scales cleanly to any canvas size instead of
// being a fixed-proportion image stretched to fit. "pill" rounds all
// four corners the same; "diagonal" rounds only the top-left and
// bottom-right, leaving the other two square. Mixed into the same random
// pick as the image-based overlays above (see pickMarkOverlay in
// SlideMaker.jsx) - picking one of these means a frame instead of an
// image, not on top of one.
export const FRAME_STYLES = ["pill", "diagonal"];

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