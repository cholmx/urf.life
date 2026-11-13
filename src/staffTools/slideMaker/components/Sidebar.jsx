import React from 'react';
import {C, ui} from '../constants/styles';
import ColorsTab from './tabs/ColorsTab';
import TemplatesTab from './tabs/TemplatesTab';
import ContentTab from './tabs/ContentTab';
import PhotosTab from './tabs/PhotosTab';
import PresetsTab from './tabs/PresetsTab';
import QueueTab from './tabs/QueueTab';

const TABS = [
  {key: "queue", label: "📋 Needs Making"},
  {key: "content", label: "✏️ Content"},
  {key: "templates", label: "⬜ Layout"},
  {key: "palettes", label: "🎨 Colors"},
  {key: "photos", label: "🖼 Photos"},
  {key: "presets", label: "💾 Presets"},
];

export default function Sidebar(props) {
  const {
    tab, setTab,
    updateBackground, updateTextColor,
    brand, setBrand,
    tmplId, setTmplId,
    data, ds,
    photos, setPhotos,
    activePhoto, setActivePhoto,
    ov, setOv,
    blur, setBlur,
    overlayColor, setOverlayColor,
    canvasRef,
    onLoadPreset,
    queueItems, queuePreviews, hasTextures, onRegenerateQueuePreview, onUseQueueItem, onToggleSlideMade,
  } = props;

  // queueItems is already filtered to just what still needs a slide made.
  const pendingCount = (queueItems || []).length;

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
            {t.key === "queue" && pendingCount > 0 && (
              <span style={{
                marginLeft: 5,
                display: "inline-block",
                minWidth: 15,
                padding: "0 4px",
                borderRadius: 999,
                background: tab === t.key ? C.accentDark : C.textTer,
                color: "#fff",
                fontSize: 9,
                fontWeight: 700,
                lineHeight: "15px",
                textAlign: "center",
              }}>
                {pendingCount}
              </span>
            )}
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
        {tab === "queue" && (
          <QueueTab
            items={queueItems || []}
            previews={queuePreviews}
            hasTextures={hasTextures}
            onGoToPhotos={() => setTab("photos")}
            onRegenerate={onRegenerateQueuePreview}
            onUseItem={onUseQueueItem}
            onToggleSlideMade={onToggleSlideMade}
          />
        )}
        {tab === "content" && (
          <ContentTab tmplId={tmplId} data={data} ds={ds} brand={brand} setBrand={setBrand} />
        )}
        {tab === "templates" && (
          <TemplatesTab
            tmplId={tmplId} setTmplId={setTmplId}
            data={data} brand={brand}
            bgImg={activePhoto} overlayColor={overlayColor} ov={ov} blur={blur}
          />
        )}
        {tab === "palettes" && (
          <ColorsTab brand={brand} updateBackground={updateBackground} updateTextColor={updateTextColor} />
        )}
        {tab === "photos" && (
          <PhotosTab
            photos={photos} setPhotos={setPhotos}
            activePhoto={activePhoto} setActivePhoto={setActivePhoto}
            ov={ov} setOv={setOv}
            blur={blur} setBlur={setBlur}
            overlayColor={overlayColor} setOverlayColor={setOverlayColor}
          />
        )}
        {tab === "presets" && (
          <PresetsTab
            canvasRef={canvasRef}
            tmplId={tmplId}
            data={data}
            brand={brand}
            photos={photos}
            activePhoto={activePhoto}
            ov={ov}
            blur={blur}
            overlayColor={overlayColor}
            onLoadPreset={onLoadPreset}
          />
        )}
      </div>
    </div>
  );
}
