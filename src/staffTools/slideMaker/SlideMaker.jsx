import React, {useState, useRef, useEffect, useCallback, useMemo} from 'react';
import useGoogleFonts from './hooks/useGoogleFonts';
import {ToastProvider, useToast} from './hooks/useToast.jsx';
import {useUndoHistory} from './hooks/useUndoHistory';
import {BACKGROUNDS, HEADLINE_FONT, HEADLINE_WEIGHT, BODY_FONT, BODY_WEIGHT, ASPECT_RATIOS, FRAME_STYLES} from './constants/data';
import {C, ui} from './constants/styles';
import {sharpenCanvas, loadImage, averageBrightness} from './utils/canvasUtils';
import {render} from './utils/renderEngine';
import {getPhotos} from './services/photoService';
import {getMarks} from './services/markService';
import {getFontPairings} from './services/fontPairingService';
import {isSlideActive, formatDateNice, stripLeadingTitle} from '../../staffComms/lib/helpers';
import SlideCanvas from './components/SlideCanvas';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import QueueTab from './components/tabs/QueueTab';

const SCOPE_ORDER = {whole_church: 0, ministry: 1, informational: 2};

const DEFAULT_DATA = {
  line1: "HEADLINE",
  line2: "Input details here",
  dateNum: "5",
  dateMo: "APRIL",
  label: "JOIN US",
  s1: 155, s2: 65,
  autoFit: true,
  headLineHeight: 1.12,
};

// Dark/light buckets a photo's own average brightness is sorted into for
// its color overlay wash (see autoBrandForBrightness below) - looked up by
// id rather than relying on BACKGROUNDS' order, since that order is just
// picker/pool display order. The "pine" id is the dark bucket regardless
// of what that swatch is actually named/colored today (currently Jet
// Black) - ids stayed put across both the Dark/Black-removal rebrand and
// the later site-wide color rebrand, only names and hexes moved.
const DARK_BUCKET = BACKGROUNDS.find(b => b.id === "pine");
const LIGHT_BUCKET = BACKGROUNDS.find(b => b.id === "light");

// Fixed brand typography and the dark-bucket swatch's (currently Jet
// Black) default text color - no font picker and no custom color pickers
// (see constants/data.js).
// bItalic:true matches this same pairing's long-standing behavior (the
// subhead has always rendered in italic); the automatic slide maker
// overrides both hItalic/bItalic per its own randomly picked pairing -
// see computeAutoSlide below.
const DEFAULT_BRAND = {
  bgColor: DARK_BUCKET.bg,
  textColor: DARK_BUCKET.textOptions[0].color,
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
// 6 of the 7 solid Colors-tab backgrounds themselves ({solid: bgOption}) -
// so a plain Jet Black/Rosy Copper/Sandy Brown/etc. slide with no photo at
// all is a real, regularly-occurring possible outcome, not just a texture
// tinted to look dark or light. White is excluded here (too many
// plain-white auto slides) but stays a normal manual choice in the
// Custom Editor's own Colors tab - this only narrows what gets picked
// for you.
function getAutoBackgroundPool(photos) {
  const textures = (photos || []).filter(p => p && p.isTexture).map(p => ({img: p.img}));
  const solids = BACKGROUNDS.filter(bg => bg.id !== "light").map(bg => ({solid: bg}));
  return [...textures, ...solids];
}

// Deterministic per-event pick (same event always lands on the same
// texture) so reopening an already-built slide doesn't shuffle its look.
function pickTextureForId(pool, id) {
  const str = String(id ?? "");
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return pool[hash % pool.length];
}

function pickRandomTexture(pool) {
  return pool[Math.floor(Math.random() * pool.length)];
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
// so they get a stronger wash to stay recognizably on-brand. Black needs
// a heavier wash than the teals for the same reason white does below -
// a true neutral (no hue of its own to read as "on-brand" even faintly)
// shows through as "barely tinted photo" rather than "black slide" at
// the same strength that works for an actual brand color.
const DARK_OVERLAY_OPTIONS = [
  {color: "#000000", textColor: null, ov: 80},
  {color: "#172B2C", textColor: null, ov: 65},
  {color: "#C65D3B", textColor: "#FFFFFF", ov: 88},
  {color: "#F9AB55", textColor: "#FFFFFF", ov: 88},
  {color: "#5B8B75", textColor: "#FFFFFF", ov: 65},
];

// Buckets the texture's average brightness into the dark/light background
// it reads best against, picks an overlay (dark bucket: one of the five
// options above; light bucket: always white), and a text color - the
// overlay's own forced color when it has one, otherwise a random pick from
// the bucket's two allowed text colors (so a dark-bucket slide sometimes
// lands on yellow instead of always white). The overlay nudges the texture
// toward a flatter, more even tone so text stays readable over its own
// internal light/dark variation.
//
// avoidOverlayColors excludes colors from the random pick entirely (not
// just a reroll-and-hope) - used to keep adjacent queue slides from
// landing on the same overlay color by chance, and to guarantee "try a
// different background" actually gives back something different.
function autoBrandForBrightness(brightness, avoidOverlayColors = []) {
  const bucket = brightness < 0.5 ? DARK_BUCKET : LIGHT_BUCKET;
  const randomBucketTextColor = () => bucket.textOptions[Math.floor(Math.random() * bucket.textOptions.length)].color;

  if (brightness < 0.5) {
    const choices = DARK_OVERLAY_OPTIONS.filter(o => !avoidOverlayColors.includes(o.color));
    const pool = choices.length > 0 ? choices : DARK_OVERLAY_OPTIONS;
    const overlay = pool[Math.floor(Math.random() * pool.length)];
    return {bgColor: bucket.bg, textColor: overlay.textColor || randomBucketTextColor(), overlayColor: overlay.color, ov: overlay.ov};
  }
  // Light bucket always washes white by design - nothing random to avoid.
  // Same heavier wash as black above and for the same reason (white has
  // no hue of its own to read as intentional at a lighter strength).
  return {bgColor: bucket.bg, textColor: randomBucketTextColor(), overlayColor: "#FFFFFF", ov: 80};
}

// Picks one of the Fonts tab's staff-managed pairings (fontPairings -
// see getFontPairings in fontPairingService.js) at random and resolves
// it into the concrete hFont/bFont/weight/italic/uppercase values
// computeTextBlock actually reads off brand - hFont/bFont become real
// CSS font-family stacks here ('Name',generic), since the pairing itself
// only stores the plain Google Fonts name. Falls back to the Custom
// Editor's own fixed pairing if the library is empty (nothing imported
// yet, or still loading) rather than crashing on an empty array.
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
// without touching any component state - shared by the live editor
// (applyAutoBackground) and the off-screen queue-thumbnail generator
// below, so both produce the same kind of result from the same inputs.
// A {solid} entry (one of the Colors-tab backgrounds) skips the photo
// entirely - no image, just that color and one of its own allowed text
// colors. The watermark applies either way (see pickMarkOverlay) - drawn
// over the photo's own texture/color wash, not instead of it.
async function computeAutoSlide(entry, avoidOverlayColors = [], marks = [], fontPairings = []) {
  const font = pickAutoFontPairing(fontPairings);
  const tmpl = pickAutoTemplate();
  if (entry.solid) {
    const bg = entry.solid;
    const textColor = bg.textOptions[Math.floor(Math.random() * bg.textOptions.length)].color;
    const mark = await pickMarkOverlay(bg.id === "light" || bg.id === "mint", marks);
    return {img: null, bgColor: bg.bg, textColor, overlayColor: null, ov: 0, blur: 0, tmpl, ...mark, ...font};
  }
  const img = entry.img || await loadImage(entry.src);
  const brightness = averageBrightness(img);
  const auto = autoBrandForBrightness(brightness, avoidOverlayColors);
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

// The headline/subhead text for an event's automatic slide - same date and
// "short line" formatting loadQueueItem applies when opening an item in
// the editor, pulled out here so the off-screen queue generator below can
// build the identical text without going through component state.
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

// Renders a finished, ready-to-download slide for a queue item entirely
// off-screen - the same automatic texture/color/overlay pick a staffer
// would get by opening it in the editor, but produced the moment the
// queue loads so there's a PNG sitting there to grab without opening
// anything. Returns the overlay color alongside the image so the caller
// can feed it forward as the next item's avoidOverlayColors.
async function generateQueueThumbnailFromEntry(a, entry, avoidOverlayColors = [], marks = [], fontPairings = []) {
  const auto = await computeAutoSlide(entry, avoidOverlayColors, marks, fontPairings);
  const data = {...DEFAULT_DATA, ...buildAutoSlideData(a)};
  const brand = {...DEFAULT_BRAND, bgColor: auto.bgColor, textColor: auto.textColor, hFont: auto.hFont, hWeight: auto.hWeight, hItalic: auto.hItalic, hUppercase: auto.hUppercase, bFont: auto.bFont, bWeight: auto.bWeight, bItalic: auto.bItalic, markImg: auto.markImg, markOpacity: auto.markOpacity, markFrame: auto.markFrame};
  const canvas = document.createElement('canvas');
  render(canvas, auto.tmpl, data, brand, auto.img, auto.overlayColor, auto.ov, auto.blur, QUEUE_PREVIEW_RATIO.w, QUEUE_PREVIEW_RATIO.h, 0);
  // A solid entry has no overlay color (auto.overlayColor is null) - its
  // own background color is the thing adjacent slides should steer away
  // from repeating instead.
  return {dataUrl: sharpenCanvas(canvas).toDataURL("image/png"), overlayColor: auto.overlayColor || auto.bgColor};
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

  const [tmplId, setTmplId] = useState("left_block");
  const [data, setData] = useState({...DEFAULT_DATA});
  const [brand, setBrand] = useState({...DEFAULT_BRAND});
  const [photos, setPhotos] = useState([]);
  const [marks, setMarks] = useState([]);
  const [fontPairings, setFontPairings] = useState([]);
  useGoogleFonts(fontPairings);
  const [activePhoto, setActivePhoto] = useState(null);
  const [ov, setOv] = useState(86);
  const [blur, setBlur] = useState(0);
  const [overlayColor, setOverlayColor] = useState("#000000");
  const [tab, setTab] = useState("content");
  const [aspectRatio, setAspectRatio] = useState(ASPECT_RATIOS[0]);
  // Top-level mode: Auto Slides (the queue, as its own full-width gallery)
  // versus the Custom Editor (canvas + Content/Layout/Colors/Photos/Presets).
  // These used to share one screen, with the queue squeezed in as just
  // another narrow sidebar tab next to everything else - landing on
  // whichever one there's actually pending work for, same as the old
  // default did for the tab itself.
  const [mode, setMode] = useState(() => (queueItems.length > 0 ? "auto" : "custom"));

  // Loaded once here (not inside PhotosTab) so a staff-flagged texture is
  // already part of the automatic-background pool the moment the queue is
  // opened, rather than only after the Photos tab happens to have been
  // visited this session.
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
    });
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
    });
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
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeQueueItem, setActiveQueueItem] = useState(null);
  const canvasRef = useRef(null);

  // Ready-to-download slide PNGs for the queue, keyed by announcement id -
  // built off-screen the moment an item shows up in "Needs Making" so
  // staff can grab a finished slide straight from the queue list without
  // ever opening the editor. Generated one at a time in the background;
  // an item that's already cached (or still mid-generation from a prior
  // run of this effect) is skipped. Each entry also keeps the overlay
  // color it landed on, so the next item generated can be steered away
  // from repeating it - a plain React-state read would lag behind this
  // same loop's own earlier iterations, so the ref is the one source of
  // truth read while generating.
  const [queuePreviews, setQueuePreviews] = useState({});
  const queuePreviewOverlayRef = useRef({});
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
    const pool = getAutoBackgroundPool(photos);
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
          const entry = pickTextureForId(pool, a.id);
          const result = await generateQueueThumbnailFromEntry(a, entry, avoid, marks, fontPairings);
          queuePreviewOverlayRef.current[a.id] = result.overlayColor;
          if (isMountedRef.current) setQueuePreviews(prev => ({...prev, [a.id]: result}));
        } catch (error) {
          // Leave it unset - the queue just won't offer a direct download
          // for this one item, "Use This" still works as the fallback.
        } finally {
          generatingQueuePreviewsRef.current.delete(a.id);
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queueItems, photos, marks, fontPairings]);

  // "Try a different background" on a queue card - a fresh random texture
  // (not the deterministic per-event pick) and an overlay steered away
  // from both this item's own last color and its neighbor's, so clicking
  // it is guaranteed to change something visible rather than risk landing
  // right back on the same look by chance.
  const regenerateQueuePreview = useCallback(async (a) => {
    if (generatingQueuePreviewsRef.current.has(a.id)) return;
    generatingQueuePreviewsRef.current.add(a.id);
    try {
      const pool = getAutoBackgroundPool(photos);
      const idx = queueItems.findIndex(q => q.id === a.id);
      const prevId = idx > 0 ? queueItems[idx - 1].id : null;
      const avoid = [queuePreviewOverlayRef.current[a.id], prevId && queuePreviewOverlayRef.current[prevId]].filter(Boolean);
      const entry = pickRandomTexture(pool);
      const result = await generateQueueThumbnailFromEntry(a, entry, avoid, marks, fontPairings);
      queuePreviewOverlayRef.current[a.id] = result.overlayColor;
      if (isMountedRef.current) setQueuePreviews(prev => ({...prev, [a.id]: result}));
    } catch (error) {
      console.error('Could not rebuild that slide:', error);
      toast.show(`Could not rebuild that slide: ${error?.message || 'unknown error'}`, 'error');
    } finally {
      generatingQueuePreviewsRef.current.delete(a.id);
    }
  }, [photos, marks, fontPairings, queueItems, toast]);

  const undoHistory = useUndoHistory(50);

  // Initialize undo history with the initial state
  useEffect(() => {
    undoHistory.init({tmplId, data, brand, activePhoto, ov, blur, overlayColor, aspectRatio});
  }, []);

  // Push undo state whenever tracked values change (after init)
  const pushUndo = useCallback((overrides = {}) => {
    undoHistory.push({
      tmplId, data, brand, activePhoto, ov, blur, overlayColor, aspectRatio,
      ...overrides,
    });
  }, [tmplId, data, brand, activePhoto, ov, blur, overlayColor, aspectRatio, undoHistory]);

  // ds() (every text field/slider in ContentTab) and setBrand() (color
  // pickers, letter-spacing, the text-shadow toggle) fire on every
  // keystroke/drag, so pushing a full undo snapshot on each call would make
  // Undo only ever step back one character at a time. Debounced per gate
  // key instead: the first change in a burst snapshots the pre-burst state,
  // and later changes within the quiet window extend the same step rather
  // than adding their own.
  const undoGateRef = useRef({});
  const pushUndoDebounced = useCallback((key) => {
    const gates = undoGateRef.current;
    if (!gates[key]) pushUndo();
    clearTimeout(gates[key]);
    gates[key] = setTimeout(() => { delete gates[key]; }, 700);
  }, [pushUndo]);

  const ds = useCallback((k, v) => {
    pushUndoDebounced(`data.${k}`);
    setData(p => {
      const next = {...p, [k]: v};
      return next;
    });
  }, [pushUndoDebounced]);

  const updateBrand = useCallback((updater) => {
    pushUndoDebounced('brand');
    setBrand(updater);
  }, [pushUndoDebounced]);

  // Switching background buckets (dark/light) resets text color to that
  // bucket's default, since the previously-selected text color may not be
  // one of the new bucket's two allowed options.
  const updateBackground = useCallback((bgOption) => {
    pushUndo();
    setBrand(b => ({...b, bgColor: bgOption.bg, textColor: bgOption.textOptions[0].color}));
  }, [pushUndo]);

  const updateTextColor = useCallback((color) => {
    pushUndo();
    setBrand(b => ({...b, textColor: color}));
  }, [pushUndo]);

  const handleSetTmplId = useCallback((id) => {
    pushUndo({tmplId: id});
    setTmplId(id);
  }, [pushUndo]);

  const handleSetAspectRatio = useCallback((r) => {
    pushUndo({aspectRatio: r});
    setAspectRatio(r);
  }, [pushUndo]);

  const handleSetOv = useCallback((v) => {
    setOv(v);
  }, []);

  const handleSetBlur = useCallback((v) => {
    setBlur(v);
  }, []);

  const handleSetOverlayColor = useCallback((v) => {
    setOverlayColor(v);
  }, []);

  const handleUndo = useCallback(() => {
    const prev = undoHistory.undo();
    if (!prev) return;
    if (prev.tmplId !== undefined) setTmplId(prev.tmplId);
    if (prev.data !== undefined) setData(prev.data);
    if (prev.brand !== undefined) setBrand(prev.brand);
    if (prev.activePhoto !== undefined) setActivePhoto(prev.activePhoto);
    if (prev.ov !== undefined) setOv(prev.ov);
    if (prev.blur !== undefined) setBlur(prev.blur);
    if (prev.overlayColor !== undefined) setOverlayColor(prev.overlayColor);
    if (prev.aspectRatio !== undefined) setAspectRatio(prev.aspectRatio);
  }, [undoHistory]);

  const handleRedo = useCallback(() => {
    const next = undoHistory.redo();
    if (!next) return;
    if (next.tmplId !== undefined) setTmplId(next.tmplId);
    if (next.data !== undefined) setData(next.data);
    if (next.brand !== undefined) setBrand(next.brand);
    if (next.activePhoto !== undefined) setActivePhoto(next.activePhoto);
    if (next.ov !== undefined) setOv(next.ov);
    if (next.blur !== undefined) setBlur(next.blur);
    if (next.overlayColor !== undefined) setOverlayColor(next.overlayColor);
    if (next.aspectRatio !== undefined) setAspectRatio(next.aspectRatio);
  }, [undoHistory]);

  const canUndo = undoHistory.canUndo();
  const canRedo = undoHistory.canRedo();

  const dl = () => {
    if (canvasRef.current) {
      const sharpened = sharpenCanvas(canvasRef.current);
      const a = document.createElement("a");
      a.download = `slide-${Date.now()}.png`;
      a.href = sharpened.toDataURL("image/png");
      a.click();
    }
  };

  const dlJpg = () => {
    if (canvasRef.current) {
      const sharpened = sharpenCanvas(canvasRef.current);
      const a = document.createElement("a");
      a.download = `slide-${Date.now()}.jpg`;
      a.href = sharpened.toDataURL("image/jpeg", 0.95);
      a.click();
    }
  };

  const cp = () => {
    if (canvasRef.current) {
      const sharpened = sharpenCanvas(canvasRef.current);
      sharpened.toBlob(b => {
        if (b) navigator.clipboard.write([new ClipboardItem({"image/png": b})]);
      });
    }
  };

  const loadPreset = async (presetData) => {
    pushUndo();
    setTmplId(presetData.tmplId);
    setData(presetData.data);
    setBrand(presetData.brand);
    setOv(presetData.ov);
    setBlur(presetData.blur || 0);
    // Older presets saved before the overlay-color toggle existed default
    // to black, matching the always-dark overlay they were saved with.
    setOverlayColor(presetData.overlayColor || "#000000");

    if (presetData.photoId) {
      const photo = photos.find(p => p.dbId === presetData.photoId);
      setActivePhoto(photo ? photo.img : null);
    } else {
      setActivePhoto(null);
    }

    setActiveQueueItem(null);
    setTab("content");
    setSidebarOpen(false);
  };

  // Loads a texture-pool entry (a built-in texture's src, or an
  // already-loaded library photo's img), samples its brightness, and
  // applies the matching background/text/overlay colors - the automatic
  // part of "build this event's slide." Failure just leaves whatever
  // background was already set rather than blocking the rest of
  // loadQueueItem.
  const applyAutoBackground = useCallback(async (entry, avoidOverlayColors = []) => {
    try {
      const auto = await computeAutoSlide(entry, avoidOverlayColors, marks, fontPairings);
      setActivePhoto(auto.img);
      setBrand(b => ({...b, bgColor: auto.bgColor, textColor: auto.textColor, hFont: auto.hFont, hWeight: auto.hWeight, hItalic: auto.hItalic, hUppercase: auto.hUppercase, bFont: auto.bFont, bWeight: auto.bWeight, bItalic: auto.bItalic, markImg: auto.markImg, markOpacity: auto.markOpacity, markFrame: auto.markFrame}));
      setOverlayColor(auto.overlayColor);
      setOv(auto.ov);
      setBlur(auto.blur);
      setTmplId(auto.tmpl);
    } catch (error) {
      console.error('Could not load an automatic background:', error);
      toast.show(`Could not load an automatic background: ${error?.message || 'unknown error'}`, 'error');
    }
  }, [toast, marks, fontPairings]);

  const loadQueueItem = useCallback((a) => {
    pushUndo();
    setData(p => ({...p, ...buildAutoSlideData(a)}));
    // Every event gets a fully automatic slide: a texture background
    // (same one each time this event is reopened), colors picked from
    // that texture's brightness, and the 16:10 size.
    setAspectRatio(QUEUE_PREVIEW_RATIO);
    applyAutoBackground(pickTextureForId(getAutoBackgroundPool(photos), a.id));
    setActiveQueueItem(a);
    setTab("content");
    setMode("custom");
    setSidebarOpen(false);
  }, [pushUndo, applyAutoBackground, photos]);

  const reshuffleBackground = useCallback(() => {
    pushUndo();
    // Steer away from the overlay color already on screen - otherwise
    // "Different Background" can land right back on the same color by
    // chance and look like it didn't do anything.
    applyAutoBackground(pickRandomTexture(getAutoBackgroundPool(photos)), [overlayColor]);
  }, [pushUndo, applyAutoBackground, photos, overlayColor]);

  // One click from "just finished this slide" to "building the next one" -
  // no manual trip back to Auto Slides to find what's left.
  const markMadeAndNext = useCallback(() => {
    if (!activeQueueItem) return;
    onToggleSlideMade(activeQueueItem.id, true);
    const next = queueItems.find(a => a.id !== activeQueueItem.id && !a.slide_made);
    if (next) {
      loadQueueItem(next);
    } else {
      setActiveQueueItem(null);
      setMode("auto");
    }
  }, [activeQueueItem, queueItems, onToggleSlideMade, loadQueueItem]);

  const clearActiveQueueItem = useCallback(() => setActiveQueueItem(null), []);

  const slideProps = {tmplId, data, brand, bgImg: activePhoto, overlayColor, ov, blur, canvasW: aspectRatio.w, canvasH: aspectRatio.h, cornerR: 0};

  return (
    <div className="slide-maker" style={{fontFamily: ui.body, background: C.bg, minHeight: "100vh", display: "flex", flexDirection: "column"}}>
      <style>{`
        @media (max-width: 900px) {
          .slide-maker .sidebar-desktop { display: none !important; }
          .slide-maker .sidebar-toggle-btn { display: block !important; }
        }
        @media (min-width: 901px) {
          .slide-maker .sidebar-overlay,
          .slide-maker .sidebar-mobile { display: none !important; }
        }
        @media (max-width: 700px) {
          .slide-maker .aspect-ratio-group { display: none !important; }
        }
        @media (max-width: 500px) {
          .slide-maker .dl-jpg-btn { display: none !important; }
        }
      `}</style>
      <TopBar
        onDownload={dl}
        onDownloadJpg={dlJpg}
        onCopy={cp}
        aspectRatio={aspectRatio}
        onAspectRatioChange={handleSetAspectRatio}
        onUndo={handleUndo}
        canUndo={canUndo}
        onRedo={handleRedo}
        canRedo={canRedo}
        onToggleSidebar={() => setSidebarOpen(o => !o)}
      />

      {/* Auto Slides vs Custom Editor - two genuinely separate screens
          now, not a queue tab squeezed in beside Content/Layout/Colors/
          Photos/Presets. */}
      <div style={{
        display: "flex", gap: 8, maxWidth: mode === "auto" ? 1800 : 1280, margin: "0 auto", width: "100%", padding: "12px 16px 0",
      }}>
        {[
          {key: "auto", label: "📋 Auto Slides"},
          {key: "custom", label: "🎨 Custom Editor"},
        ].map(m => (
          <button
            key={m.key}
            onClick={() => setMode(m.key)}
            style={{
              padding: "8px 16px", borderRadius: 8, cursor: "pointer",
              border: `2px solid ${mode === m.key ? C.accent : C.border}`,
              background: mode === m.key ? C.accentBg : C.card,
              color: mode === m.key ? C.accentDark : C.textSec,
              fontFamily: ui.display, fontSize: 12, fontWeight: 700, letterSpacing: "0.03em",
            }}
          >
            {m.label}
            {m.key === "auto" && queueItems.length > 0 && (
              <span style={{
                marginLeft: 7, display: "inline-block", minWidth: 16, padding: "0 4px", borderRadius: 999,
                background: mode === m.key ? C.accentDark : C.textTer, color: "#fff",
                fontSize: 10, fontWeight: 700, lineHeight: "16px", textAlign: "center",
              }}>
                {queueItems.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {mode === "auto" && (
        <div style={{maxWidth: 1800, margin: "0 auto", width: "100%", padding: 16}}>
          <QueueTab
            items={queueItems}
            previews={queuePreviews}
            onRegenerate={regenerateQueuePreview}
            onUseItem={loadQueueItem}
            onToggleSlideMade={onToggleSlideMade}
          />
        </div>
      )}

      {mode === "custom" && (
      <div style={{
        display: "flex",
        flex: 1,
        maxWidth: 1280,
        margin: "0 auto",
        width: "100%",
        padding: "16px",
        gap: 16,
        position: "relative",
      }}>
        {/* Left: Canvas */}
        <div style={{flex: 1, minWidth: 0}}>
          {activeQueueItem && (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8,
              padding: "10px 14px", marginBottom: 12,
              background: C.accentBg, border: `1px solid ${C.border}`, borderRadius: 10,
            }}>
              <span style={{fontFamily: ui.body, fontSize: 13, color: C.text}}>
                Building: <strong>{activeQueueItem.title}</strong>
              </span>
              <div style={{display: "flex", gap: 8, alignItems: "center"}}>
                <button
                  onClick={reshuffleBackground}
                  title="Try a different automatic background"
                  style={{
                    padding: "6px 10px", border: `1px solid ${C.border}`, borderRadius: 6,
                    background: "transparent", color: C.textSec,
                    fontFamily: ui.body, fontSize: 12, cursor: "pointer",
                  }}
                >
                  🔀 Different Background
                </button>
                <button
                  onClick={markMadeAndNext}
                  style={{
                    padding: "6px 12px", border: "none", borderRadius: 6,
                    background: C.accentDark, color: "#fff",
                    fontFamily: ui.body, fontSize: 12, fontWeight: 700, cursor: "pointer",
                  }}
                >
                  ✓ Mark Made &amp; Next
                </button>
                <button
                  onClick={clearActiveQueueItem}
                  title="Stop tracking this item (won't mark it made)"
                  style={{
                    padding: "6px 8px", border: `1px solid ${C.border}`, borderRadius: 6,
                    background: "transparent", color: C.textTer,
                    fontFamily: ui.body, fontSize: 12, cursor: "pointer",
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          )}
          <div style={{
            border: `1px solid ${C.border}`,
            overflow: "hidden",
            boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
            background: "#000",
            position: "sticky",
            top: 68,
          }}>
            <SlideCanvas ref={canvasRef} {...slideProps} />
          </div>
        </div>

        {/* Right: Sidebar — desktop */}
        <div className="sidebar-desktop" style={{width: 340, flexShrink: 0}}>
          <Sidebar
            tab={tab} setTab={setTab}
            updateBackground={updateBackground} updateTextColor={updateTextColor}
            brand={brand} setBrand={updateBrand}
            tmplId={tmplId} setTmplId={handleSetTmplId}
            data={data} ds={ds}
            photos={photos} setPhotos={setPhotos}
            marks={marks} setMarks={setMarks}
            fontPairings={fontPairings} setFontPairings={setFontPairings}
            activePhoto={activePhoto} setActivePhoto={setActivePhoto}
            ov={ov} setOv={handleSetOv}
            blur={blur} setBlur={handleSetBlur}
            overlayColor={overlayColor} setOverlayColor={handleSetOverlayColor}
            slideProps={slideProps}
            canvasRef={canvasRef}
            onLoadPreset={loadPreset}
          />
        </div>
      </div>
      )}

      {mode === "custom" && (
      <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div onClick={() => setSidebarOpen(false)} style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 200,
            display: 'block',
          }} className="sidebar-overlay" />
          <div style={{
            position: 'fixed',
            right: 0,
            top: 0,
            bottom: 0,
            width: '85%',
            maxWidth: 360,
            zIndex: 201,
            padding: 16,
            background: C.bg,
            overflowY: 'auto',
            boxShadow: '-4px 0 24px rgba(0,0,0,0.2)',
          }} className="sidebar-mobile">
            <Sidebar
              tab={tab} setTab={setTab}
              updateBackground={updateBackground} updateTextColor={updateTextColor}
              brand={brand} setBrand={updateBrand}
              tmplId={tmplId} setTmplId={handleSetTmplId}
              data={data} ds={ds}
              photos={photos} setPhotos={setPhotos}
              marks={marks} setMarks={setMarks}
              fontPairings={fontPairings} setFontPairings={setFontPairings}
              activePhoto={activePhoto} setActivePhoto={setActivePhoto}
              ov={ov} setOv={handleSetOv}
              blur={blur} setBlur={handleSetBlur}
              overlayColor={overlayColor} setOverlayColor={handleSetOverlayColor}
              slideProps={slideProps}
              canvasRef={canvasRef}
              onLoadPreset={loadPreset}
            />
          </div>
        </>
      )}
      </>
      )}
    </div>
  );
}
