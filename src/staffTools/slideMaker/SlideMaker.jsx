import React, {useState, useRef, useEffect, useCallback, useMemo} from 'react';
import useGoogleFonts from './hooks/useGoogleFonts';
import {ToastProvider, useToast} from './hooks/useToast.jsx';
import {HEADLINE_FONT, HEADLINE_WEIGHT, BODY_FONT, BODY_WEIGHT, ASPECT_RATIOS, FRAME_STYLES} from './constants/data';
import {C, ui} from './constants/styles';
import {sharpenCanvas, loadImage, averageBrightness} from './utils/canvasUtils';
import {render} from './utils/renderEngine';
import {getPhotos} from './services/photoService';
import {getMarks} from './services/markService';
import {getFontPairings} from './services/fontPairingService';
import {getBackgroundColors} from './services/backgroundColorService';
import {isSlideActive, formatDateNice, stripLeadingTitle} from '../../staffComms/lib/helpers';
import LibraryPanel from './components/LibraryPanel';
import QueueTab from './components/tabs/QueueTab';

const SCOPE_ORDER = {whole_church: 0, ministry: 1, informational: 2};

const DEFAULT_DATA = {
  line1: "HEADLINE",
  line2: "Input details here",
  dateNum: "5",
  dateMo: "APRIL",
  label: "JOIN US",
};

// Dark/light buckets a photo's own average brightness is sorted into for
// its color overlay wash (see autoBrandForBrightness below) - looked up
// by role (not id/name, which staff can freely rename) in the Palette
// tab's staff-managed backgroundColors state - see findBucket. These
// two fallbacks are only for the brief window before that state loads
// (or the vanishingly unlikely case neither role survived) - they're
// what "dark"/"light" meant before the Palette tab existed, not a bucket
// identity of their own.
const FALLBACK_DARK_BUCKET = {hex: "#1C2A2B", textColors: [{name: "White", hex: "#FFFFFF"}]};
const FALLBACK_LIGHT_BUCKET = {hex: "#FFFFFF", textColors: [{name: "Black", hex: "#000000"}]};

function findBucket(backgroundColors, role, fallback) {
  return (backgroundColors || []).find(b => b.role === role) || fallback;
}

// Standard perceptual luminance (0 = black, 1 = white) - used wherever a
// background's own brightness (not a fixed id like the old "light"/
// "mint") decides whether white or black ink reads on it (see
// pickMarkOverlay's isLight argument in computeAutoSlide).
function hexBrightness(hex) {
  const h = (hex || "#000000").replace("#", "");
  const r = parseInt(h.substring(0, 2), 16) || 0;
  const g = parseInt(h.substring(2, 4), 16) || 0;
  const b = parseInt(h.substring(4, 6), 16) || 0;
  return (r * 299 + g * 587 + b * 114) / 1000 / 255;
}

// Fixed brand typography and the dark-bucket swatch's (currently Jet
// Black) default text color - no font picker and no custom color pickers
// (see constants/data.js). The literal hex/white here are just a sane
// first paint before backgroundColors loads - DEFAULT_BRAND can't read
// that state (it's evaluated once at module load); generateQueueThumbnailFromEntry
// overrides it the moment a real automatic pick is made.
// bItalic:true matches this same pairing's long-standing behavior (the
// subhead has always rendered in italic); the automatic slide maker
// overrides both hItalic/bItalic per its own randomly picked pairing -
// see computeAutoSlide below.
const DEFAULT_BRAND = {
  bgColor: FALLBACK_DARK_BUCKET.hex,
  textColor: FALLBACK_DARK_BUCKET.textColors[0].hex,
  hFont: HEADLINE_FONT,
  bFont: BODY_FONT,
  hWeight: HEADLINE_WEIGHT,
  bWeight: BODY_WEIGHT,
  hItalic: false,
  bItalic: true,
  hUppercase: false,
  churchName: "UPPER ROOM FELLOWSHIP",
  hLetterSpacing: 0,
  markImg: null,
  markOpacity: 0,
  markFrame: null,
};

// The automatic-background pool mixes two kinds of entry: every photo in
// the library flagged as a texture with the ✨ toggle in the Photos tab
// (built-in or staff-uploaded, no distinction - see PhotosTab's "Import
// built-in textures" action for how the original set gets in there), plus
// every Palette tab background with its own inAutoRotation flag on
// ({solid: bgOption}) - so a plain Jet Black/Rosy Copper/Sandy Brown/etc.
// slide with no photo at all is a real, regularly-occurring possible
// outcome, not just a texture tinted to look dark or light. White ships
// with inAutoRotation off by default (too many plain-white auto slides)
// but stays a normal manual choice - staff can flip it back on from the
// Palette tab any time, same as any other background.
function getAutoBackgroundPool(photos, backgroundColors) {
  const textures = (photos || []).filter(p => p && p.isTexture).map(p => ({img: p.img}));
  const solids = (backgroundColors || []).filter(bg => bg.inAutoRotation).map(bg => ({solid: bg}));
  if (textures.length === 0 && solids.length === 0) {
    // backgroundColors hasn't loaded yet, or nothing's been imported
    // into the Palette tab yet, or everything in it currently has
    // rotation switched off - pickTextureForId/pickRandomTexture index
    // into this pool with a modulo, so an empty array divides by zero
    // and crashes rather than just failing gracefully. One safe solid
    // keeps every caller working (if plainly) until a real pool exists.
    return [{solid: FALLBACK_DARK_BUCKET}];
  }
  return [...textures, ...solids];
}

// Identifies a pool entry for repeat-avoidance purposes - a texture by
// its image src (stable across pool rebuilds, unlike object identity),
// a solid by its Palette tab row id.
function entryKey(entry) {
  if (!entry) return null;
  if (entry.img) return `img:${entry.img.src}`;
  if (entry.solid) return `solid:${entry.solid.id}`;
  return null;
}

// Deterministic per-event pick (same event always lands on the same
// texture) so reopening an already-built slide doesn't shuffle its look.
// avoidEntry - the adjacent queue slide's own resolved pick - nudges it
// off that exact background (same idea as avoidOverlayColors for the
// overlay wash) so two neighboring slides don't show up with the
// identical texture/solid under otherwise-different colors; only tried
// once, since forcing it further would break the "same event, same
// background" determinism this function exists for.
function pickTextureForId(pool, id, avoidEntry) {
  const str = String(id ?? "");
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  const idx = hash % pool.length;
  if (pool.length > 1 && avoidEntry && entryKey(pool[idx]) === entryKey(avoidEntry)) {
    return pool[(idx + 1) % pool.length];
  }
  return pool[idx];
}

function pickRandomTexture(pool, avoidEntry) {
  if (pool.length <= 1) return pool[0];
  let pick = pool[Math.floor(Math.random() * pool.length)];
  let attempts = 0;
  while (avoidEntry && entryKey(pick) === entryKey(avoidEntry) && attempts < 10) {
    pick = pool[Math.floor(Math.random() * pool.length)];
    attempts += 1;
  }
  return pick;
}

// Overlay choices for a dark-bucket texture, picked at random for some
// variety between slides. Black and the brand dark teal pair fine with
// either of the dark bucket's text colors (white or yellow). The three
// brand accent colors (rosy copper, sandy brown, jungle teal) are
// medium-brightness, not dark/light - they only read reliably with white
// text, so they force it rather than leaving it to the bucket's own
// random white/yellow pick.
//
// ov is each color's own overlay strength - copper and sandy brown are
// the two the texture shows through the most at the teals' own 65%,
// washing them out toward a muddy brown instead of a clean brand color,
// so they get a stronger wash to stay recognizably on-brand. No plain
// black wash option here (removed on request) - black stays available
// as a text color (see the Palette tab's White/Cream text-color options),
// just not as a photo-overlay tint.
const DARK_OVERLAY_OPTIONS = [
  {color: "#172B2C", textColor: null, ov: 65},
  {color: "#C65D3B", textColor: "#FFFFFF", ov: 88},
  {color: "#F9AB55", textColor: "#FFFFFF", ov: 88},
  {color: "#5B8B75", textColor: "#FFFFFF", ov: 65},
];

// How far apart (on the 0-1 hexBrightness scale) a text color and its
// background need to read before they're trusted to actually contrast -
// below this, both sides are "medium" enough that reading them is a
// strain no matter which of a swatch's curated text options got picked.
// See pickContrastingTextColor.
const MIN_CONTRAST_DIFF = 0.5;

// What a photo-overlay wash actually looks like once rendered: the
// overlay color at its own strength (ov, 0-100) blended over the photo's
// own average brightness underneath. A medium-brightness overlay (e.g.
// the brand's Rosy Copper or Jungle Teal, both near 0.5) lands close to
// its own brightness pretty much regardless of the photo, since ov is
// always a strong wash (65-88) - this is what lets that combination come
// out "medium" even when the curated text options were picked with a
// clearly light or dark backdrop in mind.
function blendedBrightness(overlayHex, ov, baseBrightness) {
  const strength = (ov || 0) / 100;
  return strength * hexBrightness(overlayHex) + (1 - strength) * baseBrightness;
}

// Picks a text color that actually contrasts against a background of the
// given (already-blended, where relevant) brightness, instead of trusting
// a swatch's own curated text-color list - or a single forced color - to
// always be safe. A swatch that's itself medium-brightness (see above)
// can have every one of its "intended" text options read as medium-on-
// medium once blended in, which is exactly the "two mediums" failure this
// guards against. Falls back to pure white or pure black, whichever side
// of the midpoint the background sits on, when nothing given clears the
// bar - that pairing has enough contrast against literally any background.
function pickContrastingTextColor(options, bgBrightness) {
  const withDiff = (options || []).map(o => ({hex: o.hex, diff: Math.abs(hexBrightness(o.hex) - bgBrightness)}));
  const safe = withDiff.filter(o => o.diff >= MIN_CONTRAST_DIFF);
  const pool = safe.length > 0 ? safe : [{hex: bgBrightness < 0.5 ? "#FFFFFF" : "#000000"}];
  return pool[Math.floor(Math.random() * pool.length)].hex;
}

// Buckets the texture's average brightness into the dark/light background
// it reads best against, picks an overlay (dark bucket: one of the five
// options above; light bucket: whatever's currently in the Palette tab's
// rotation), and a text color that actually contrasts against how that
// overlay renders once blended with the photo underneath (see
// blendedBrightness/pickContrastingTextColor) - not just whichever of the
// bucket's or overlay's curated options random happens to land on.
//
// avoidOverlayColors excludes colors from the random pick entirely (not
// just a reroll-and-hope) - used to keep adjacent queue slides from
// landing on the same overlay color by chance, and to guarantee "try a
// different background" actually gives back something different.
// darkBucket/lightBucket come from the Palette tab's staff-managed
// backgroundColors (see findBucket) - whatever two backgrounds carry
// the dark_bucket/light_bucket role right now, not a fixed pair.
function autoBrandForBrightness(brightness, avoidOverlayColors = [], darkBucket, lightBucket, backgroundColors = []) {
  const bucket = brightness < 0.5 ? darkBucket : lightBucket;

  if (brightness < 0.5) {
    const choices = DARK_OVERLAY_OPTIONS.filter(o => !avoidOverlayColors.includes(o.color));
    const pool = choices.length > 0 ? choices : DARK_OVERLAY_OPTIONS;
    const overlay = pool[Math.floor(Math.random() * pool.length)];
    const effectiveBg = blendedBrightness(overlay.color, overlay.ov, brightness);
    const candidates = overlay.textColor ? [{hex: overlay.textColor}] : bucket.textColors;
    const textColor = pickContrastingTextColor(candidates, effectiveBg);
    return {bgColor: bucket.hex, textColor, overlayColor: overlay.color, ov: overlay.ov};
  }
  // Light bucket wash draws from whatever's currently in the Palette
  // tab's auto-rotation pool (the same backgrounds solid slides pick
  // from) instead of a fixed white - so deleting a color there, White
  // included, removes it from this wash too. Falls back to the light
  // bucket's own color only if nothing's in rotation at all.
  const rotation = (backgroundColors || []).filter(bg => bg.inAutoRotation);
  const choices = rotation.filter(bg => !avoidOverlayColors.includes(bg.hex));
  const pool = choices.length > 0 ? choices : rotation;
  if (pool.length > 0) {
    const choice = pool[Math.floor(Math.random() * pool.length)];
    const effectiveBg = blendedBrightness(choice.hex, 80, brightness);
    const textColor = pickContrastingTextColor(choice.textColors, effectiveBg);
    return {bgColor: bucket.hex, textColor, overlayColor: choice.hex, ov: 80};
  }
  const effectiveBg = blendedBrightness(bucket.hex, 80, brightness);
  return {bgColor: bucket.hex, textColor: pickContrastingTextColor(bucket.textColors, effectiveBg), overlayColor: bucket.hex, ov: 80};
}

// Picks one of the Fonts tab's staff-managed pairings (fontPairings -
// see getFontPairings in fontPairingService.js) at random and resolves
// it into the concrete hFont/bFont/weight/italic/uppercase values
// computeTextBlock actually reads off brand - hFont/bFont become real
// CSS font-family stacks here ('Name',generic), since the pairing itself
// only stores the plain Google Fonts name. Falls back to a fixed
// pairing if the library is empty (nothing imported yet, or still
// loading) rather than crashing on an empty array.
function pickAutoFontPairing(fontPairings) {
  if (!fontPairings || fontPairings.length === 0) {
    return {hFont: HEADLINE_FONT, hWeight: HEADLINE_WEIGHT, hItalic: false, hUppercase: false, bFont: BODY_FONT, bWeight: BODY_WEIGHT, bItalic: true};
  }
  const pairing = fontPairings[Math.floor(Math.random() * fontPairings.length)];
  return {
    hFont: `'${pairing.hFont}',${pairing.hGeneric}`, hWeight: pairing.hWeight, hItalic: !!pairing.hItalic, hUppercase: !!pairing.hUppercase,
    bFont: `'${pairing.bFont}',${pairing.bGeneric}`, bWeight: pairing.bWeight, bItalic: !!pairing.bItalic,
  };
}

// Coin flip between the two template renderers (see renderEngine.js) so an
// automatic slide sometimes comes out centered instead of always
// left-aligned.
function pickAutoTemplate() {
  return Math.random() < 0.5 ? "left_block" : "minimal";
}

// How faint the branded chevron-mark watermark (see MARK_OVERLAYS) reads
// on an automatic slide - low enough to stay a texture, not a second
// graphic competing with the headline.
const MARK_OPACITY_MIN = 0.1;
const MARK_OPACITY_MAX = 0.24;

// A frame's single thin stroke needs far more opacity than an image mark
// to read as an intentional border at all - nowhere near as much ink on
// the slide as a filled graphic, even before its own low opacity.
const FRAME_OPACITY_MIN = 0.4;
const FRAME_OPACITY_MAX = 0.6;

// How often an automatic slide gets a watermark at all, solid-color or
// photo-backed alike - the rest come back plain so it reads as an
// occasional accent rather than something on literally every slide.
const MARK_SHOW_CHANCE = 0.8;

// Resolves the watermark for one automatic slide: an 80% chance of one
// entry from the combined pool - staff-managed marks from the Marks tab
// (see markService's getMarks) whose own `pool` column is 'dark' (brand
// ink, for every background except Light/Mint), 'light' (ink for those
// two pale ones), or 'universal' (reads fine on anything, mixed in
// either way) - plus FRAME_STYLES (a native rounded-rectangle border, not
// an image - see drawMarkFrame in renderEngine.js). A frame pick returns
// markImg/markOpacity null and markFrame set instead; an image pick is
// the other way around - never both from one pick. Marks arrive already
// decoded (getMarks awaits each Image before resolving), so picking one
// needs no async load of its own; the try/catch is only for the
// vanishingly unlikely case its img never finished decoding - better a
// plain background than a card stuck forever on "Building preview..."
// because of a decorative extra.
async function pickMarkOverlay(isLight, marks) {
  if (Math.random() >= MARK_SHOW_CHANCE) return {markImg: null, markOpacity: 0, markFrame: null};
  const wantedPool = isLight ? "light" : "dark";
  const imagePool = (marks || []).filter(m => m && (m.pool === wantedPool || m.pool === "universal"));
  const pool = [
    ...imagePool.map(m => ({kind: "image", img: m.img})),
    ...FRAME_STYLES.map(style => ({kind: "frame", style})),
  ];
  if (pool.length === 0) return {markImg: null, markOpacity: 0, markFrame: null};
  const pick = pool[Math.floor(Math.random() * pool.length)];
  if (pick.kind === "frame") {
    const opacity = FRAME_OPACITY_MIN + Math.random() * (FRAME_OPACITY_MAX - FRAME_OPACITY_MIN);
    return {markImg: null, markOpacity: 0, markFrame: {style: pick.style, color: isLight ? "#000000" : "#FFFFFF", opacity}};
  }
  try {
    if (!pick.img) throw new Error('Mark image not loaded');
    const markOpacity = MARK_OPACITY_MIN + Math.random() * (MARK_OPACITY_MAX - MARK_OPACITY_MIN);
    return {markImg: pick.img, markOpacity, markFrame: null};
  } catch (error) {
    console.error('Could not use the slide watermark:', error);
    return {markImg: null, markOpacity: 0, markFrame: null};
  }
}

// Loads a pool entry and works out the full automatic look for it
// (background/text/overlay colors, a light random blur, a font pairing,
// a left-aligned-or-centered template, a faint chevron-mark watermark)
// without touching any component state - used by the off-screen queue-
// thumbnail generator below.
// A {solid} entry (one of the Palette tab's backgrounds) skips the photo
// entirely - no image, just that color and one of its own allowed text
// colors. The watermark applies either way (see pickMarkOverlay) - drawn
// over the photo's own texture/color wash, not instead of it.
async function computeAutoSlide(entry, avoidOverlayColors = [], marks = [], fontPairings = [], backgroundColors = []) {
  const font = pickAutoFontPairing(fontPairings);
  const tmpl = pickAutoTemplate();
  if (entry.solid) {
    const bg = entry.solid;
    const textColor = pickContrastingTextColor(bg.textColors, hexBrightness(bg.hex));
    const mark = await pickMarkOverlay(hexBrightness(bg.hex) >= 0.5, marks);
    return {img: null, bgColor: bg.hex, textColor, overlayColor: null, ov: 0, blur: 0, tmpl, ...mark, ...font};
  }
  const img = entry.img || await loadImage(entry.src);
  const brightness = averageBrightness(img);
  const darkBucket = findBucket(backgroundColors, "dark_bucket", FALLBACK_DARK_BUCKET);
  const lightBucket = findBucket(backgroundColors, "light_bucket", FALLBACK_LIGHT_BUCKET);
  const auto = autoBrandForBrightness(brightness, avoidOverlayColors, darkBucket, lightBucket, backgroundColors);
  const mark = await pickMarkOverlay(brightness >= 0.5, marks);
  return {
    img,
    bgColor: auto.bgColor,
    textColor: auto.textColor,
    overlayColor: auto.overlayColor,
    ov: auto.ov,
    tmpl,
    ...mark,
    ...font,
    blur: Math.round(Math.random() * 5),
  };
}

// The headline/subhead text for an event's automatic slide - pulled out
// here so the off-screen queue generator below can build it without
// going through component state.
function buildAutoSlideData(a) {
  const dates = (a.event_dates && a.event_dates.length > 0)
    ? [...a.event_dates].filter(Boolean).sort()
    : (a.event_date ? [a.event_date] : []);
  const dateStr = dates.map(d => formatDateNice(d)).join(' · ');
  const dateLocation = [dateStr, a.event_location].filter(Boolean).join(' · ');
  const shortLine = stripLeadingTitle(a.slide_override || '', a.title || '')
    .replace(/^[\s,:;–—-]+/, '');
  // generateSlide's current prompt already writes the date, time, and
  // location into slide_override itself - so when it's set, it IS the
  // subhead, not something to still append dateLocation onto. Appending
  // both used to make sense when slide_override didn't reliably carry
  // the date/location yet; now it just repeats them.
  return {
    line1: a.title || '',
    line2: shortLine || dateLocation,
  };
}

const QUEUE_PREVIEW_RATIO = ASPECT_RATIOS.find(r => r.id === "16:10") || ASPECT_RATIOS[0];

// Draws a queue thumbnail from an already-resolved `auto` look (see
// computeAutoSlide) - split out of generateQueueThumbnailFromEntry below
// so a text-only edit (see updateQueueItemText in SlideMakerInner) can
// redraw with new wording using the SAME cached background/font/mark
// pick, instead of calling computeAutoSlide again and re-rolling all of
// it just to change a line of text. textOverride, when given, replaces
// the announcement's own derived line1/line2 for this render only - it
// never touches the announcement record itself.
function renderQueueThumbnail(a, auto, textOverride) {
  const data = {...DEFAULT_DATA, ...buildAutoSlideData(a), ...(textOverride || {})};
  const brand = {...DEFAULT_BRAND, bgColor: auto.bgColor, textColor: auto.textColor, hFont: auto.hFont, hWeight: auto.hWeight, hItalic: auto.hItalic, hUppercase: auto.hUppercase, bFont: auto.bFont, bWeight: auto.bWeight, bItalic: auto.bItalic, markImg: auto.markImg, markOpacity: auto.markOpacity, markFrame: auto.markFrame};
  const canvas = document.createElement('canvas');
  render(canvas, auto.tmpl, data, brand, auto.img, auto.overlayColor, auto.ov, auto.blur, QUEUE_PREVIEW_RATIO.w, QUEUE_PREVIEW_RATIO.h, 0);
  // A solid entry has no overlay color (auto.overlayColor is null) - its
  // own background color is the thing adjacent slides should steer away
  // from repeating instead.
  return {dataUrl: sharpenCanvas(canvas).toDataURL("image/png"), overlayColor: auto.overlayColor || auto.bgColor};
}

// Renders a finished, ready-to-download slide for a queue item entirely
// off-screen - the same automatic texture/color/overlay pick a staffer
// would get by opening it in the editor, but produced the moment the
// queue loads so there's a PNG sitting there to grab without opening
// anything. Returns the resolved `auto` look alongside the image so the
// caller can cache it (for a later text-only redraw - see
// renderQueueThumbnail above) and feed its overlay color forward as the
// next item's avoidOverlayColors.
async function generateQueueThumbnailFromEntry(a, entry, avoidOverlayColors = [], marks = [], fontPairings = [], backgroundColors = [], textOverride = null) {
  const auto = await computeAutoSlide(entry, avoidOverlayColors, marks, fontPairings, backgroundColors);
  return {...renderQueueThumbnail(a, auto, textOverride), auto};
}

export default function SlideMaker({announcements, today, onToggleSlideMade}) {
  return (
    <ToastProvider>
      <SlideMakerInner announcements={announcements} today={today} onToggleSlideMade={onToggleSlideMade} />
    </ToastProvider>
  );
}

function SlideMakerInner({announcements, today, onToggleSlideMade}) {
  const toast = useToast();

  // What still needs a slide made, pulled straight from the Communication
  // Organizer's happenings data - lets staff jump from "what needs making"
  // straight into building it, without leaving the Slide Maker. Once a
  // slide is marked made it drops off this list entirely - it's a "Needs
  // Making" queue, not a checklist of everything eligible.
  const queueItems = useMemo(() => {
    if (!announcements || !today) return [];
    return announcements
      .filter(a => isSlideActive(a, today) && !a.slide_made)
      .sort((a, b) => (SCOPE_ORDER[a.scope] ?? 2) - (SCOPE_ORDER[b.scope] ?? 2));
  }, [announcements, today]);

  // The headline/subtext each queue item would get with no edit applied
  // - prefill for the text editor below (see updateQueueItemText), so
  // opening it shows the real current wording rather than a blank form.
  const defaultSlideTexts = useMemo(() => {
    const map = {};
    for (const a of queueItems) map[a.id] = buildAutoSlideData(a);
    return map;
  }, [queueItems]);

  const [photos, setPhotos] = useState([]);
  const [marks, setMarks] = useState([]);
  const [fontPairings, setFontPairings] = useState([]);
  const [backgroundColors, setBackgroundColors] = useState([]);
  const [libraryOpen, setLibraryOpen] = useState(false);
  // Staff-edited headline/subtext for a specific queue item, keyed by
  // announcement id - a slide-only wording tweak (a line that reads
  // awkwardly once auto-wrapped, say) that never touches the
  // announcement record itself, so it has nowhere to live but here.
  // Cleared automatically once the item leaves the queue (nothing
  // prunes it, but it's ephemeral component state - gone on refresh).
  const [textOverrides, setTextOverrides] = useState({});
  useGoogleFonts(fontPairings);

  // Loaded once here (not inside PhotosTab) so a staff-flagged texture is
  // already part of the automatic-background pool the moment the queue is
  // opened, rather than only after the Photos tab happens to have been
  // visited this session.
  // Set once each library's first fetch settles (loaded or failed) -
  // gates the queue-preview generation effect below so it never builds
  // a slide off an empty/stale library just because its own fetch
  // hadn't resolved yet. Without this, a slide generated in that window
  // locks in whatever fallback that empty state produced (e.g. every
  // early slide landing on the same hardcoded dark backup color) for
  // good - the effect only ever builds a PENDING item once, so it never
  // retries once backgroundColors/photos/etc. actually arrive.
  const [photosLoaded, setPhotosLoaded] = useState(false);
  const [marksLoaded, setMarksLoaded] = useState(false);
  const [fontPairingsLoaded, setFontPairingsLoaded] = useState(false);
  const [backgroundColorsLoaded, setBackgroundColorsLoaded] = useState(false);
  const librariesLoaded = photosLoaded && marksLoaded && fontPairingsLoaded && backgroundColorsLoaded;

  useEffect(() => {
    let cancelled = false;
    getPhotos((photo, index, total) => {
      if (cancelled) return;
      setPhotos(prev => {
        const next = prev.length === total ? [...prev] : new Array(total);
        next[index] = photo;
        return next;
      });
    }).catch((error) => {
      console.error('Could not load the photo library:', error);
      if (!cancelled) toast.show(`Could not load your photo library: ${error?.message || 'unknown error'}`, 'error');
    }).finally(() => { if (!cancelled) setPhotosLoaded(true); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Same incremental-load shape as the photos effect above, for the
  // Marks tab's library - loaded here (not inside MarksTab) so a
  // staff-uploaded mark is already part of pickMarkOverlay's pool the
  // moment the queue is opened, not only after visiting that tab.
  useEffect(() => {
    let cancelled = false;
    getMarks((mark, index, total) => {
      if (cancelled) return;
      setMarks(prev => {
        const next = prev.length === total ? [...prev] : new Array(total);
        next[index] = mark;
        return next;
      });
    }).catch((error) => {
      console.error('Could not load the mark library:', error);
      if (!cancelled) toast.show(`Could not load your mark library: ${error?.message || 'unknown error'}`, 'error');
    }).finally(() => { if (!cancelled) setMarksLoaded(true); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The Fonts tab's library, loaded here (not inside FontsTab) so a
  // staff-added pairing is already part of pickAutoFontPairing's pool
  // the moment the queue is opened - same reasoning as the photos/marks
  // effects above. No images to decode here (a pairing is just font
  // names/weights/flags), so a single fetch is enough - no incremental,
  // per-row loading needed.
  useEffect(() => {
    let cancelled = false;
    getFontPairings().then((pairings) => {
      if (!cancelled) setFontPairings(pairings);
    }).catch((error) => {
      console.error('Could not load the font pairing library:', error);
      if (!cancelled) toast.show(`Could not load your font pairings: ${error?.message || 'unknown error'}`, 'error');
    }).finally(() => { if (!cancelled) setFontPairingsLoaded(true); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The Palette tab's library, loaded here (not inside PaletteTab) for
  // the same reason as the three effects above - a staff-added
  // background or rotation-toggle flip is already live for the queue
  // the moment it's opened. Also pure data, one fetch is enough.
  useEffect(() => {
    let cancelled = false;
    getBackgroundColors().then((colors) => {
      if (!cancelled) setBackgroundColors(colors);
    }).catch((error) => {
      console.error('Could not load the background color library:', error);
      if (!cancelled) toast.show(`Could not load your background colors: ${error?.message || 'unknown error'}`, 'error');
    }).finally(() => { if (!cancelled) setBackgroundColorsLoaded(true); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ready-to-download slide PNGs for the queue, keyed by announcement id -
  // built off-screen the moment an item shows up in "Needs Making" so
  // staff can grab a finished slide straight from the queue list without
  // ever opening an editor. Generated one at a time in the background;
  // an item that's already cached (or still mid-generation from a prior
  // run of this effect) is skipped. Each entry also keeps the overlay
  // color it landed on, so the next item generated can be steered away
  // from repeating it - a plain React-state read would lag behind this
  // same loop's own earlier iterations, so the ref is the one source of
  // truth read while generating.
  const [queuePreviews, setQueuePreviews] = useState({});
  const queuePreviewOverlayRef = useRef({});
  // The actual pool entry (texture or solid) each item landed on - kept
  // alongside the overlay color above so the NEXT item's pick can steer
  // away from repeating the same background image/color outright, not
  // just the same overlay tint on top of a possibly-identical one.
  const queuePreviewEntryRef = useRef({});
  // The full resolved look (background/font/mark/etc - see
  // computeAutoSlide) each item landed on, so a text-only edit (see
  // updateQueueItemText below) can redraw with new wording via
  // renderQueueThumbnail alone, without calling computeAutoSlide again
  // and re-rolling everything else just to fix a line.
  const queuePreviewAutoRef = useRef({});
  const generatingQueuePreviewsRef = useRef(new Set());
  // A plain "cancelled" flag closed over per effect run doesn't survive
  // React StrictMode's dev-only double-invoke (mount, cleanup, mount
  // again, all before any awaited image load resolves) - it marks the
  // real in-flight work as cancelled before it ever gets to commit a
  // result. Tracking real mount state separately, updated on every mount
  // and only cleared on actual unmount, avoids that false cancellation.
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  useEffect(() => {
    // Wait for every library's first fetch to settle - see
    // librariesLoaded above - so a queue item never gets generated off
    // an empty/stale pool just because backgroundColors (or any of the
    // others) hasn't finished loading yet.
    if (!librariesLoaded) return;
    const pool = getAutoBackgroundPool(photos, backgroundColors);
    if (pool.length === 0) return;
    const pending = queueItems.filter(a => !queuePreviews[a.id] && !generatingQueuePreviewsRef.current.has(a.id));
    if (pending.length === 0) return;

    pending.forEach(a => generatingQueuePreviewsRef.current.add(a.id));

    (async () => {
      for (const a of pending) {
        try {
          const idx = queueItems.findIndex(q => q.id === a.id);
          const prevId = idx > 0 ? queueItems[idx - 1].id : null;
          const avoid = prevId && queuePreviewOverlayRef.current[prevId] ? [queuePreviewOverlayRef.current[prevId]] : [];
          const avoidEntry = prevId ? queuePreviewEntryRef.current[prevId] : null;
          const entry = pickTextureForId(pool, a.id, avoidEntry);
          const result = await generateQueueThumbnailFromEntry(a, entry, avoid, marks, fontPairings, backgroundColors, textOverrides[a.id]);
          queuePreviewOverlayRef.current[a.id] = result.overlayColor;
          queuePreviewEntryRef.current[a.id] = entry;
          queuePreviewAutoRef.current[a.id] = result.auto;
          if (isMountedRef.current) setQueuePreviews(prev => ({...prev, [a.id]: result}));
        } catch (error) {
          // Leave it unset - the queue just won't offer a direct download
          // for this one item.
        } finally {
          generatingQueuePreviewsRef.current.delete(a.id);
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queueItems, photos, marks, fontPairings, backgroundColors, librariesLoaded]);

  // "Try a different background" on a queue card - a fresh random texture
  // (not the deterministic per-event pick) and an overlay steered away
  // from both this item's own last color and its neighbor's, so clicking
  // it is guaranteed to change something visible rather than risk landing
  // right back on the same look by chance.
  const regenerateQueuePreview = useCallback(async (a) => {
    if (generatingQueuePreviewsRef.current.has(a.id)) return;
    generatingQueuePreviewsRef.current.add(a.id);
    try {
      const pool = getAutoBackgroundPool(photos, backgroundColors);
      const idx = queueItems.findIndex(q => q.id === a.id);
      const prevId = idx > 0 ? queueItems[idx - 1].id : null;
      const avoid = [queuePreviewOverlayRef.current[a.id], prevId && queuePreviewOverlayRef.current[prevId]].filter(Boolean);
      const avoidEntry = queuePreviewEntryRef.current[a.id] || (prevId && queuePreviewEntryRef.current[prevId]) || null;
      const entry = pickRandomTexture(pool, avoidEntry);
      // A reshuffled background/font/mark keeps whatever wording staff
      // already edited for this slide (see updateQueueItemText) - only
      // the look rerolls, not text they specifically fixed.
      const result = await generateQueueThumbnailFromEntry(a, entry, avoid, marks, fontPairings, backgroundColors, textOverrides[a.id]);
      queuePreviewOverlayRef.current[a.id] = result.overlayColor;
      queuePreviewEntryRef.current[a.id] = entry;
      queuePreviewAutoRef.current[a.id] = result.auto;
      if (isMountedRef.current) setQueuePreviews(prev => ({...prev, [a.id]: result}));
    } catch (error) {
      console.error('Could not rebuild that slide:', error);
      toast.show(`Could not rebuild that slide: ${error?.message || 'unknown error'}`, 'error');
    } finally {
      generatingQueuePreviewsRef.current.delete(a.id);
    }
  }, [photos, marks, fontPairings, backgroundColors, queueItems, textOverrides, toast]);

  // Redraws a queue item's cached look (same background/font/mark pick -
  // see queuePreviewAutoRef) with new headline/subtext wording, without
  // re-rolling anything else. textOverride of null/undefined clears the
  // override and reverts to the announcement's own derived text. Falls
  // through to a no-op redraw (just stores the override) if the item's
  // preview hasn't finished its first generation yet - the pending-items
  // effect above will pick the override up once it does.
  const updateQueueItemText = useCallback((a, textOverride) => {
    setTextOverrides(prev => {
      if (textOverride) return {...prev, [a.id]: textOverride};
      const next = {...prev};
      delete next[a.id];
      return next;
    });
    const auto = queuePreviewAutoRef.current[a.id];
    if (!auto) return;
    const result = renderQueueThumbnail(a, auto, textOverride);
    setQueuePreviews(prev => ({...prev, [a.id]: {...prev[a.id], dataUrl: result.dataUrl}}));
  }, []);

  return (
    <div className="slide-maker" style={{fontFamily: ui.body, background: C.bg, minHeight: "100vh"}}>
      <div style={{
        maxWidth: 1800, margin: "0 auto", width: "100%", padding: "20px 16px 0",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10,
      }}>
        <div style={{fontFamily: ui.display, fontSize: 20, fontWeight: 800, color: C.text, display: "flex", alignItems: "center", gap: 10}}>
          📋 Auto Slides
          {queueItems.length > 0 && (
            <span style={{
              display: "inline-block", minWidth: 20, padding: "1px 6px", borderRadius: 999,
              background: C.accentDark, color: "#fff", fontSize: 12, fontWeight: 700, lineHeight: "18px", textAlign: "center",
            }}>
              {queueItems.length}
            </span>
          )}
        </div>
        <button
          onClick={() => setLibraryOpen(o => !o)}
          style={{
            padding: "8px 16px", borderRadius: 8, cursor: "pointer",
            border: `2px solid ${libraryOpen ? C.accent : C.border}`,
            background: libraryOpen ? C.accentBg : C.card,
            color: libraryOpen ? C.accentDark : C.textSec,
            fontFamily: ui.display, fontSize: 12, fontWeight: 700, letterSpacing: "0.03em",
          }}
        >
          ⚙ {libraryOpen ? "Hide" : "Manage"} Photos, Marks, Fonts &amp; Colors
        </button>
      </div>

      {libraryOpen && (
        <div style={{maxWidth: 1800, margin: "0 auto", width: "100%", padding: "12px 16px 0"}}>
          <LibraryPanel
            photos={photos} setPhotos={setPhotos}
            marks={marks} setMarks={setMarks}
            fontPairings={fontPairings} setFontPairings={setFontPairings}
            backgroundColors={backgroundColors} setBackgroundColors={setBackgroundColors}
          />
        </div>
      )}

      <div style={{maxWidth: 1800, margin: "0 auto", width: "100%", padding: 16}}>
        <QueueTab
          items={queueItems}
          previews={queuePreviews}
          onRegenerate={regenerateQueuePreview}
          onToggleSlideMade={onToggleSlideMade}
          defaultSlideTexts={defaultSlideTexts}
          textOverrides={textOverrides}
          onUpdateText={updateQueueItemText}
        />
      </div>
    </div>
  );
}
