import React from 'react';
import {C, ui} from '../constants/styles';
import {ASPECT_RATIOS} from '../constants/data';

export default function TopBar({onDownload, onDownloadJpg, onCopy, aspectRatio, onAspectRatioChange, onUndo, canUndo, onToggleSidebar}) {
  return (
    <div style={{
      background: C.card,
      borderBottom: `1px solid ${C.border}`,
      padding: "0 16px",
      position: "sticky",
      top: 0,
      zIndex: 40,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      height: 52,
      gap: 8,
    }}>
      <button
        onClick={onToggleSidebar}
        className="sidebar-toggle-btn"
        style={{
          display: 'none',
          border: 'none',
          background: C.bgSubtle,
          color: C.text,
          borderRadius: 6,
          padding: '6px 10px',
          cursor: 'pointer',
          fontSize: 16,
          flexShrink: 0,
        }}
      >
        ☰
      </button>

      <div style={{display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end", marginLeft: "auto"}}>
        <div style={{display: "flex", background: C.bgSubtle, borderRadius: 6, padding: 2}} className="aspect-ratio-group">
          {ASPECT_RATIOS.map(r => (
            <button
              key={r.id}
              onClick={() => onAspectRatioChange(r)}
              style={{
                padding: "4px 10px",
                border: "none",
                borderRadius: 4,
                background: aspectRatio?.id === r.id ? C.accent : "transparent",
                color: aspectRatio?.id === r.id ? "#fff" : C.textSec,
                fontFamily: ui.display,
                fontWeight: 700,
                fontSize: 10,
                letterSpacing: "0.05em",
                cursor: "pointer",
                transition: "background 0.15s, color 0.15s",
                whiteSpace: "nowrap",
              }}
            >
              {r.label}
            </button>
          ))}
        </div>

        <button
          onClick={onUndo}
          disabled={!canUndo}
          style={{
            padding: "6px 12px",
            border: `1px solid ${C.border}`,
            borderRadius: 6,
            background: "transparent",
            color: canUndo ? C.textSec : C.textTer,
            fontFamily: ui.display,
            fontWeight: 600,
            fontSize: 11,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            cursor: canUndo ? "pointer" : "not-allowed",
            whiteSpace: "nowrap",
          }}
          title={canUndo ? "Undo last change" : "Nothing to undo"}
        >
          ↶ Undo
        </button>

        <button onClick={onDownload} style={{...primaryBtn, whiteSpace: "nowrap"}} className="dl-png-btn">↓ PNG</button>
        <button onClick={onDownloadJpg} style={{...jpgBtn, whiteSpace: "nowrap"}} className="dl-jpg-btn">↓ JPG</button>
      </div>
    </div>
  );
}

const primaryBtn = {
  padding: "6px 16px",
  border: "none",
  borderRadius: 6,
  background: C.accent,
  color: "#fff",
  fontFamily: ui.display,
  fontWeight: 700,
  fontSize: 11,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  cursor: "pointer",
};

const jpgBtn = {
  padding: "6px 16px",
  border: `1px solid ${C.border}`,
  borderRadius: 6,
  background: "transparent",
  color: C.textSec,
  fontFamily: ui.display,
  fontWeight: 700,
  fontSize: 11,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  cursor: "pointer",
};
