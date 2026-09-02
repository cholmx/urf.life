import React from 'react';
import {C, ui} from '../constants/styles';
import FontsTab from './tabs/FontsTab';
import ColorsTab from './tabs/ColorsTab';
import TemplatesTab from './tabs/TemplatesTab';
import ContentTab from './tabs/ContentTab';
import PhotosTab from './tabs/PhotosTab';
import PresetsTab from './tabs/PresetsTab';

const TABS = [
  {key: "content", label: "✏️ Content"},
  {key: "templates", label: "⬜ Layout"},
  {key: "palettes", label: "🎨 Colors"},
  {key: "fonts", label: "Aa Fonts"},
  {key: "photos", label: "🖼 Photos"},
  {key: "presets", label: "💾 Presets"},
];

export default function Sidebar(props) {
  const {
    tab, setTab,
    combo, updateCombo,
    palette, updatePalette,
    brand, setBrand,
    tmplId, setTmplId,
    data, ds,
    photos, setPhotos,
    activePhoto, setActivePhoto,
    accentPhoto, setAccentPhoto,
    ov, setOv,
    blur, setBlur,
    canvasRef,
    onLoadPreset,
  } = props;

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      overflow: "hidden",
      boxShadow: "0 4px 16px rgba(0,0,0,0.07)",
      maxHeight: "calc(100vh - 116px)",
      position: "sticky",
      top: 68,
    }}>
      {/* Tab pills — scrollable on mobile */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        borderBottom: `1px solid ${C.border}`,
        background: C.cardAlt,
        flexShrink: 0,
      }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: "8px 10px",
              border: "none",
              borderBottom: tab === t.key ? `3px solid ${C.accent}` : "3px solid transparent",
              background: tab === t.key ? C.accentBg : "transparent",
              color: tab === t.key ? C.accentDark : C.textTer,
              fontFamily: ui.display,
              fontSize: 10,
              fontWeight: tab === t.key ? 700 : 500,
              letterSpacing: "0.04em",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.15s",
              flexShrink: 0,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content — scrollable */}
      <div style={{
        overflowY: "auto",
        overflowX: "hidden",
        flex: 1,
        padding: 16,
        scrollbarWidth: "thin",
        scrollbarColor: `${C.border} transparent`,
      }}>
        {tab === "content" && (
          <ContentTab tmplId={tmplId} data={data} ds={ds} brand={brand} setBrand={setBrand} />
        )}
        {tab === "templates" && (
          <TemplatesTab
            tmplId={tmplId} setTmplId={setTmplId}
            data={data} brand={brand}
            bgImg={activePhoto} ov={ov} blur={blur}
          />
        )}
        {tab === "palettes" && (
          <ColorsTab palette={palette} updatePalette={updatePalette} brand={brand} setBrand={setBrand} />
        )}
        {tab === "fonts" && (
          <FontsTab combo={combo} updateCombo={updateCombo} brand={brand} setBrand={setBrand} />
        )}
        {tab === "photos" && (
          <PhotosTab
            photos={photos} setPhotos={setPhotos}
            activePhoto={activePhoto} setActivePhoto={setActivePhoto}
            accentPhoto={accentPhoto} setAccentPhoto={setAccentPhoto}
            tmplId={tmplId}
            ov={ov} setOv={setOv}
            blur={blur} setBlur={setBlur}
          />
        )}
        {tab === "presets" && (
          <PresetsTab
            canvasRef={canvasRef}
            tmplId={tmplId}
            data={data}
            brand={brand}
            activePhoto={activePhoto}
            accentPhoto={accentPhoto}
            ov={ov}
            blur={blur}
            onLoadPreset={onLoadPreset}
          />
        )}
      </div>
    </div>
  );
}
