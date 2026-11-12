import React, {useState, useRef, useEffect, useCallback, useMemo} from 'react';
import useGoogleFonts from './hooks/useGoogleFonts';
import {ToastProvider, useToast} from './hooks/useToast.jsx';
import {useUndoHistory} from './hooks/useUndoHistory';
import {BACKGROUNDS, HEADLINE_FONT, HEADLINE_WEIGHT, BODY_FONT, BODY_WEIGHT, ASPECT_RATIOS, TEXTURES} from './constants/data';
import {C, ui} from './constants/styles';
import {sharpenCanvas, loadImage, averageBrightness} from './utils/canvasUtils';
import {getPhotos} from './services/photoService';
import {isSlideActive, formatDateNice} from '../../staffComms/lib/helpers';
import SlideCanvas from './components/SlideCanvas';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';

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

// Fixed brand typography and the "Dark" swatch's default text color - no
// font picker and no custom color pickers (see constants/data.js).
const DEFAULT_BRAND = {
  bgColor: BACKGROUNDS[0].bg,
  textColor: BACKGROUNDS[0].textOptions[0].color,
  hFont: HEADLINE_FONT,
  bFont: BODY_FONT,
  hWeight: HEADLINE_WEIGHT,
  bWeight: BODY_WEIGHT,
  churchName: "UPPER ROOM FELLOWSHIP",
  hLetterSpacing: 0,
};

// The automatic-background pool: the 10 built-in textures (as src strings,
// loaded on demand) plus any photo in the library staff have flagged with
// the ✨ toggle in the Photos tab (already loaded - see getPhotos below) -
// lets the pool grow from the admin UI without a code change.
function getTexturePool(photos) {
  const library = (photos || []).filter(p => p && p.isTexture).map(p => ({img: p.img}));
  return [...TEXTURES.map(src => ({src})), ...library];
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

// Buckets the texture's average brightness into the dark/light background
// it reads best against, picks that bucket's first text color, and an
// overlay that nudges the texture toward a flatter, more even tone so text
// stays readable over its own internal light/dark variation.
function autoBrandForBrightness(brightness) {
  const bucket = brightness < 0.5 ? BACKGROUNDS[0] : BACKGROUNDS[1];
  return {
    bgColor: bucket.bg,
    textColor: bucket.textOptions[0].color,
    overlayColor: brightness < 0.5 ? "#000000" : "#FFFFFF",
  };
}

export default function SlideMaker({announcements, today, onToggleSlideMade}) {
  return (
    <ToastProvider>
      <SlideMakerInner announcements={announcements} today={today} onToggleSlideMade={onToggleSlideMade} />
    </ToastProvider>
  );
}

function SlideMakerInner({announcements, today, onToggleSlideMade}) {
  useGoogleFonts();
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
  const [activePhoto, setActivePhoto] = useState(null);
  const [ov, setOv] = useState(86);
  const [blur, setBlur] = useState(0);
  const [overlayColor, setOverlayColor] = useState("#000000");
  // Land on the queue whenever there's something pending, instead of
  // always opening to whatever was last on the canvas - that's the whole
  // point of the queue existing, but it was never actually the default.
  const [tab, setTab] = useState(() => (queueItems.length > 0 ? "queue" : "content"));
  const [aspectRatio, setAspectRatio] = useState(ASPECT_RATIOS[0]);

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
    }).catch(() => {
      if (!cancelled) toast.show('Could not load your photo library.', 'error');
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeQueueItem, setActiveQueueItem] = useState(null);
  const canvasRef = useRef(null);

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
  const applyAutoBackground = useCallback(async (entry) => {
    try {
      const img = entry.img || await loadImage(entry.src);
      const auto = autoBrandForBrightness(averageBrightness(img));
      setActivePhoto(img);
      setBrand(b => ({...b, bgColor: auto.bgColor, textColor: auto.textColor}));
      setOverlayColor(auto.overlayColor);
      setOv(35);
    } catch (error) {
      toast.show('Could not load an automatic background for this slide.', 'error');
    }
  }, [toast]);

  const loadQueueItem = useCallback((a) => {
    pushUndo();
    const dates = (a.event_dates && a.event_dates.length > 0)
      ? [...a.event_dates].filter(Boolean).sort()
      : (a.event_date ? [a.event_date] : []);
    const dateStr = dates.map(d => formatDateNice(d)).join(' · ');
    // Date/time and location used to split across the subhead and the
    // now-removed detail line (with slide_override, when set, taking the
    // subhead spot instead) - folded into the one remaining subhead line.
    const dateLocation = [dateStr, a.event_location].filter(Boolean).join(' · ');
    setData(p => ({
      ...p,
      line1: a.title || '',
      line2: a.slide_override ? [a.slide_override, dateLocation].filter(Boolean).join(' · ') : dateLocation,
    }));
    // Every event gets a fully automatic slide: a texture background
    // (same one each time this event is reopened), colors picked from
    // that texture's brightness, and the 16:9 size.
    setAspectRatio(ASPECT_RATIOS.find(r => r.id === "16:9") || ASPECT_RATIOS[ASPECT_RATIOS.length - 1]);
    applyAutoBackground(pickTextureForId(getTexturePool(photos), a.id));
    setActiveQueueItem(a);
    setTab("content");
    setSidebarOpen(false);
  }, [pushUndo, applyAutoBackground, photos]);

  const reshuffleBackground = useCallback(() => {
    pushUndo();
    applyAutoBackground(pickRandomTexture(getTexturePool(photos)));
  }, [pushUndo, applyAutoBackground, photos]);

  // One click from "just finished this slide" to "building the next one" -
  // no manual trip back to the queue tab to find what's left.
  const markMadeAndNext = useCallback(() => {
    if (!activeQueueItem) return;
    onToggleSlideMade(activeQueueItem.id, true);
    const next = queueItems.find(a => a.id !== activeQueueItem.id && !a.slide_made);
    if (next) {
      loadQueueItem(next);
    } else {
      setActiveQueueItem(null);
      setTab("queue");
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
            activePhoto={activePhoto} setActivePhoto={setActivePhoto}
            ov={ov} setOv={handleSetOv}
            blur={blur} setBlur={handleSetBlur}
            overlayColor={overlayColor} setOverlayColor={handleSetOverlayColor}
            slideProps={slideProps}
            canvasRef={canvasRef}
            onLoadPreset={loadPreset}
            queueItems={queueItems}
            onUseQueueItem={loadQueueItem}
            onToggleSlideMade={onToggleSlideMade}
          />
        </div>
      </div>

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
              activePhoto={activePhoto} setActivePhoto={setActivePhoto}
              ov={ov} setOv={handleSetOv}
              blur={blur} setBlur={handleSetBlur}
              overlayColor={overlayColor} setOverlayColor={handleSetOverlayColor}
              slideProps={slideProps}
              canvasRef={canvasRef}
              onLoadPreset={loadPreset}
              queueItems={queueItems}
              onUseQueueItem={loadQueueItem}
              onToggleSlideMade={onToggleSlideMade}
            />
          </div>
        </>
      )}
    </div>
  );
}
