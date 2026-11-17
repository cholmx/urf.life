export const SW = 2560;
export const SH = 1600; // 16:10
export const CORNER_R = 0;

export const ASPECT_RATIOS = [
  { id: "16:10", label: "16:10", w: 2560, h: 1600 },
  { id: "16:9",  label: "16:9",  w: 2560, h: 1440 },
];

// Fallback brand typography - Inter Tight Bold for the headline, Playfair
// Display for the subhead. Used by DEFAULT_BRAND and pickAutoFontPairing's
// empty-library fallback when the Fonts tab has no pairings imported yet.
export const HEADLINE_FONT = "'Inter Tight',sans-serif";
export const HEADLINE_WEIGHT = 700;
export const BODY_FONT = "'Playfair Display',serif";
export const BODY_WEIGHT = 400;

// Seed list for the Fonts tab's one-time "Import built-in pairings"
// action (see FontsTab.jsx / fontPairingService.js's
// importBuiltInFontPairings) - the same role TEXTURES/BUILT_IN_MARKS
// play for their own tabs. Once imported, each becomes an ordinary row
// in staff_slide_font_pairings_portal123, editable/deletable from that
// tab; the live automatic generator reads that DB-backed state (see
// pickAutoFontPairing in SlideMaker.jsx), never this array directly -
// it only matters the one time a pairing gets imported. Pairing 1
// mirrors the fallback pairing above exactly (Inter Tight Bold headline,
// Playfair Display italic subhead); every pairing after it brings in a
// font not used anywhere else in this tool.
// hUppercase renders the headline in caps (Google Sans Flex, Montserrat,
// and Outfit - each a naturally all-caps display face) without touching
// the announcement's own title text (data.line1) - see computeHeadline
// in templateRenderers.js. hGeneric/bGeneric is each font's CSS fallback
// family (serif or sans-serif).
export const BUILT_IN_FONT_PAIRINGS = [
  { hFont: "Inter Tight", hGeneric: "sans-serif", hWeight: HEADLINE_WEIGHT, hItalic: false, hUppercase: false, bFont: "Playfair Display", bGeneric: "serif", bWeight: BODY_WEIGHT, bItalic: true },
  { hFont: "Google Sans Flex", hGeneric: "sans-serif", hWeight: 900, hItalic: false, hUppercase: true, bFont: "Newsreader", bGeneric: "serif", bWeight: 400, bItalic: false },
  { hFont: "Archivo Black", hGeneric: "sans-serif", hWeight: 400, hItalic: false, hUppercase: false, bFont: "Source Serif 4", bGeneric: "serif", bWeight: 400, bItalic: false },
  { hFont: "Montserrat", hGeneric: "sans-serif", hWeight: 900, hItalic: false, hUppercase: true, bFont: "Lora", bGeneric: "serif", bWeight: 400, bItalic: false },
  { hFont: "Anton", hGeneric: "sans-serif", hWeight: 400, hItalic: false, hUppercase: false, bFont: "Merriweather", bGeneric: "serif", bWeight: 300, bItalic: false },
  { hFont: "Fraunces", hGeneric: "serif", hWeight: 900, hItalic: false, hUppercase: false, bFont: "Spectral", bGeneric: "serif", bWeight: 400, bItalic: false },
  { hFont: "Rubik", hGeneric: "sans-serif", hWeight: 900, hItalic: false, hUppercase: false, bFont: "PT Serif", bGeneric: "serif", bWeight: 400, bItalic: false },
  { hFont: "Work Sans", hGeneric: "sans-serif", hWeight: 900, hItalic: false, hUppercase: false, bFont: "Libre Baskerville", bGeneric: "serif", bWeight: 400, bItalic: false },
  { hFont: "Outfit", hGeneric: "sans-serif", hWeight: 900, hItalic: false, hUppercase: true, bFont: "Petrona", bGeneric: "serif", bWeight: 400, bItalic: false },
  { hFont: "Poppins", hGeneric: "sans-serif", hWeight: 900, hItalic: false, hUppercase: false, bFont: "Cormorant Garamond", bGeneric: "serif", bWeight: 500, bItalic: false },
];

// Seed list for the Palette tab's one-time "Import built-in backgrounds"
// action (see PaletteTab.jsx / backgroundColorService.js's
// importBuiltInBackgroundColor) - the same role TEXTURES/BUILT_IN_MARKS/
// BUILT_IN_FONT_PAIRINGS play for their own tabs. Once imported, each
// becomes an ordinary row in staff_slide_background_colors_portal123,
// editable/deletable from that tab; the live automatic generator reads
// that DB-backed state (see backgroundColors in SlideMaker.jsx), never
// this array directly - it only matters the one time a background gets
// imported.
//
// role marks White and Jet Black as the two structural buckets every
// photo/texture gets brightness-sorted into (see autoBrandForBrightness/
// findBucket in SlideMaker.jsx) - either can be retinted, renamed, or
// even deleted; findBucket falls back to a hardcoded dark/light pair
// when no row currently holds a given role. White also starts with
// inAutoRotation: false (too many plain-white auto slides - see the
// commit that excluded it) even though it still anchors the light
// bucket; the other five are purely decorative and fully staff-editable.
export const BUILT_IN_BACKGROUND_COLORS = [
  { name: "White", hex: "#FFFFFF", role: "light_bucket", inAutoRotation: false, textColors: [
    { name: "Black", hex: "#000000" },
    { name: "#1C2A2B", hex: "#1C2A2B" },
  ] },
  { name: "Jet Black", hex: "#1C2A2B", role: "dark_bucket", inAutoRotation: true, textColors: [
    { name: "White", hex: "#FFFFFF" },
    { name: "Yellow", hex: "#FFEAB7" },
    { name: "Cream", hex: "#F4ECDD" },
  ] },
  { name: "Cream", hex: "#F4ECDD", role: null, inAutoRotation: true, textColors: [
    { name: "Black", hex: "#000000" },
    { name: "#1C2A2B", hex: "#1C2A2B" },
  ] },
  { name: "Dark Teal", hex: "#172B2C", role: null, inAutoRotation: true, textColors: [
    { name: "White", hex: "#FFFFFF" },
    { name: "Yellow", hex: "#FFEAB7" },
    { name: "Cream", hex: "#F4ECDD" },
  ] },
  { name: "Rosy Copper", hex: "#C65D3B", role: null, inAutoRotation: true, textColors: [
    { name: "White", hex: "#FFFFFF" },
    { name: "Yellow", hex: "#FFEAB7" },
    { name: "Cream", hex: "#F4ECDD" },
  ] },
  { name: "Sandy Brown", hex: "#F9AB55", role: null, inAutoRotation: true, textColors: [
    { name: "White", hex: "#FFFFFF" },
    { name: "#1C2A2B", hex: "#1C2A2B" },
    { name: "Cream", hex: "#F4ECDD" },
  ] },
  { name: "Jungle Teal", hex: "#5B8B75", role: null, inAutoRotation: true, textColors: [
    { name: "White", hex: "#FFFFFF" },
    { name: "Yellow", hex: "#FFEAB7" },
    { name: "Cream", hex: "#F4ECDD" },
  ] },
];

// These three arrays are now only the seed list for the Marks tab's
// one-time "Import built-in marks" action (see MarksTab.jsx /
// markService.js's importBuiltInMark) - the same role TEXTURES above
// plays for the Photos tab's textures. Once imported, each becomes an
// ordinary row in staff_slide_marks_portal123 with its own pool column
// (dark/light/universal), toggleable and deletable from that tab like
// anything staff upload themselves. pickMarkOverlay in SlideMaker.jsx
// reads the live `marks` state (loaded via markService's getMarks), never
// these arrays directly - they only matter the one time a mark gets
// imported.
//
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
  "/slide-marks/mark-pattern-dots.png",
  "/slide-marks/mark-ripple.png",
  "/slide-marks/mark-beam.png",
];

// The Light/Mint counterpart to MARK_OVERLAYS above - same idea, drawn in
// black ink instead of white so it actually shows up on those two pale
// backgrounds. mark-cornerstamp is a black diagonal corner wedge (plus the
// chevron badge) that reads clearly on White/Cream but all but disappears
// on a dark fill, which is why it lives here instead of MARK_OVERLAYS.
export const MARK_OVERLAYS_LIGHT = [
  "/slide-marks/mark-cornerstamp.png",
];

// A third pool, added alongside the two above rather than folded into
// either - these are grayscale darkening treatments (layered mountain-
// ridge silhouettes, a diagonal corner wedge, top/bottom bars, two grain/
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
  "/slide-marks/mark-ridgeline.png",
];

// The flat {src, pool} list MarksTab.jsx's one-time import action walks -
// built from the three arrays above so there's exactly one place (not
// three, kept in sync by hand) that pairs each seed mark with the pool it
// ought to land in.
export const BUILT_IN_MARKS = [
  ...MARK_OVERLAYS.map(src => ({src, pool: "dark"})),
  ...MARK_OVERLAYS_LIGHT.map(src => ({src, pool: "light"})),
  ...MARK_OVERLAYS_UNIVERSAL.map(src => ({src, pool: "universal"})),
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