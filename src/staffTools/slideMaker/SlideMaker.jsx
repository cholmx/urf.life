import React, {useState, useRef, useEffect, useCallback, useMemo} from 'react';
import useGoogleFonts from './hooks/useGoogleFonts';
import {ToastProvider, useToast} from './hooks/useToast.jsx';
import {useUndoHistory} from './hooks/useUndoHistory';
import {FONT_COMBOS, COLOR_PALETTES, ASPECT_RATIOS} from './constants/data';
import {C, ui} from './constants/styles';
import {sharpenCanvas, checkContrast} from './utils/canvasUtils';
import SlideCanvas from './components/SlideCanvas';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';

const DEFAULT_DATA = {
  line1: "HEADLINE",
  line2: "Input details here",
  line3: "",
  dateNum: "5",
  dateMo: "APRIL",
  label: "JOIN US",
  s1: 155, s2: 65, s3: 24,
  uppercaseHeadline: false,
  autoFit: true,
  headLineHeight: 1.12,
};

const DEFAULT_BRAND = (combo) => ({
  bgColor: "#1E1E21",
  textColor: "#F0EDE8",
  accentColor: "#E98A15",
  hFont: combo.h,
  bFont: combo.b,
  churchName: "UPPER ROOM FELLOWSHIP",
  hLetterSpacing: 0,
  textShadow: true,
});

export default function SlideMaker() {
  return (
    <ToastProvider>
      <SlideMakerInner />
    </ToastProvider>
  );
}

function SlideMakerInner() {
  useGoogleFonts();
  const toast = useToast();

  const [tmplId, setTmplId] = useState("left_block");
  const [combo, setCombo] = useState(FONT_COMBOS[0]);
  const [palette, setPalette] = useState(COLOR_PALETTES[0]);
  const [data, setData] = useState({...DEFAULT_DATA});
  const [brand, setBrand] = useState(DEFAULT_BRAND(FONT_COMBOS[0]));
  const [photos, setPhotos] = useState([]);
  const [activePhoto, setActivePhoto] = useState(null);
  const [accentPhoto, setAccentPhoto] = useState(null);
  const [ov, setOv] = useState(86);
  const [blur, setBlur] = useState(0);
  const [tab, setTab] = useState("content");
  const [aspectRatio, setAspectRatio] = useState(ASPECT_RATIOS[0]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const canvasRef = useRef(null);

  const undoHistory = useUndoHistory(50);

  // Initialize undo history with the initial state
  useEffect(() => {
    undoHistory.init({tmplId, data, brand, combo, palette, activePhoto, accentPhoto, ov, blur, aspectRatio});
  }, []);

  const ds = useCallback((k, v) => {
    setData(p => {
      const next = {...p, [k]: v};
      return next;
    });
  }, []);

  // Push undo state whenever tracked values change (after init)
  const pushUndo = useCallback((overrides = {}) => {
    undoHistory.push({
      tmplId, data, brand, combo, palette, activePhoto, accentPhoto, ov, blur, aspectRatio,
      ...overrides,
    });
  }, [tmplId, data, brand, combo, palette, activePhoto, accentPhoto, ov, blur, aspectRatio, undoHistory]);

  const updateCombo = useCallback((c) => {
    pushUndo();
    setCombo(c);
    setBrand(b => ({...b, hFont: c.h, bFont: c.b, hWeight: c.hWeight ?? null, bWeight: c.bWeight ?? null}));
  }, [pushUndo]);

  const updatePalette = useCallback((p) => {
    pushUndo();
    setPalette(p);
    setBrand(b => ({...b, bgColor: p.bg, textColor: p.tx, accentColor: p.ac}));
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

  const handleUndo = useCallback(() => {
    const prev = undoHistory.undo();
    if (!prev) return;
    if (prev.tmplId !== undefined) setTmplId(prev.tmplId);
    if (prev.data !== undefined) setData(prev.data);
    if (prev.brand !== undefined) setBrand(prev.brand);
    if (prev.combo !== undefined) setCombo(prev.combo);
    if (prev.palette !== undefined) setPalette(prev.palette);
    if (prev.activePhoto !== undefined) setActivePhoto(prev.activePhoto);
    if (prev.accentPhoto !== undefined) setAccentPhoto(prev.accentPhoto);
    if (prev.ov !== undefined) setOv(prev.ov);
    if (prev.blur !== undefined) setBlur(prev.blur);
    if (prev.aspectRatio !== undefined) setAspectRatio(prev.aspectRatio);
  }, [undoHistory]);

  const canUndo = undoHistory.canUndo();

  const contrastWarning = useMemo(() => {
    const hasPhoto = !!activePhoto;
    const overlayStrength = activePhoto ? ((ov - 20) / 70) * 100 : 0;
    const result = checkContrast(brand.textColor, brand.bgColor, hasPhoto, overlayStrength);
    return result.ok ? null : result;
  }, [brand.textColor, brand.bgColor, activePhoto, ov]);

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

    if (presetData.photoId) {
      const photo = photos.find(p => p.dbId === presetData.photoId);
      if (photo) setActivePhoto(photo);
    } else {
      setActivePhoto(null);
    }

    if (presetData.accentPhotoId) {
      const photo = photos.find(p => p.dbId === presetData.accentPhotoId);
      setAccentPhoto(photo ? photo.img : null);
    } else {
      setAccentPhoto(null);
    }

    const fc = FONT_COMBOS.find(f => f.h === presetData.brand.hFont);
    if (fc) setCombo(fc);
    const pl = COLOR_PALETTES.find(p => p.bg === presetData.brand.bgColor && p.ac === presetData.brand.accentColor);
    if (pl) setPalette(pl);
    setTab("content");
    setSidebarOpen(false);
  };

  const cornerR = aspectRatio.id === "16:10" ? 80 : 0;
  const slideProps = {tmplId, data, brand, bgImg: activePhoto, accentImg: accentPhoto, ov, blur, canvasW: aspectRatio.w, canvasH: aspectRatio.h, cornerR};

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
          <div style={{
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
            background: "#000",
            position: "sticky",
            top: 68,
          }}>
            <SlideCanvas ref={canvasRef} {...slideProps} />
          </div>
          {contrastWarning && (
            <div style={{
              marginTop: 8, padding: "8px 12px", borderRadius: 8,
              background: "#FEF3C7", border: `1px solid #FCD34D`,
              display: "flex", alignItems: "center", gap: 8,
              fontFamily: ui.body, fontSize: 12, color: "#92400E",
            }}>
              <span style={{fontSize: 16}}>⚠️</span>
              <span>Low text contrast — your headline may be hard to read against this background. Try a stronger overlay or a different text color.</span>
            </div>
          )}
        </div>

        {/* Right: Sidebar — desktop */}
        <div className="sidebar-desktop" style={{width: 340, flexShrink: 0}}>
          <Sidebar
            tab={tab} setTab={setTab}
            combo={combo} updateCombo={updateCombo}
            palette={palette} updatePalette={updatePalette}
            brand={brand} setBrand={setBrand}
            tmplId={tmplId} setTmplId={handleSetTmplId}
            data={data} ds={ds}
            photos={photos} setPhotos={setPhotos}
            activePhoto={activePhoto} setActivePhoto={setActivePhoto}
            accentPhoto={accentPhoto} setAccentPhoto={setAccentPhoto}
            ov={ov} setOv={handleSetOv}
            blur={blur} setBlur={handleSetBlur}
            slideProps={slideProps}
            canvasRef={canvasRef}
            onLoadPreset={loadPreset}
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
              combo={combo} updateCombo={updateCombo}
              palette={palette} updatePalette={updatePalette}
              brand={brand} setBrand={setBrand}
              tmplId={tmplId} setTmplId={handleSetTmplId}
              data={data} ds={ds}
              photos={photos} setPhotos={setPhotos}
              activePhoto={activePhoto} setActivePhoto={setActivePhoto}
              accentPhoto={accentPhoto} setAccentPhoto={setAccentPhoto}
              ov={ov} setOv={handleSetOv}
              blur={blur} setBlur={handleSetBlur}
              slideProps={slideProps}
              canvasRef={canvasRef}
              onLoadPreset={loadPreset}
            />
          </div>
        </>
      )}
    </div>
  );
}
