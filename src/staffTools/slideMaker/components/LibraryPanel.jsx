import React, {useState} from 'react';
import {C, ui} from '../constants/styles';
import PhotosTab from './tabs/PhotosTab';
import MarksTab from './tabs/MarksTab';
import FontsTab from './tabs/FontsTab';
import PaletteTab from './tabs/PaletteTab';

const TABS = [
  {key: "photos", label: "🖼 Photos"},
  {key: "marks", label: "💧 Marks"},
  {key: "fonts", label: "🔤 Fonts"},
  {key: "palette", label: "🖍 Palette"},
];

// Everything the automatic slide generator draws from (photos/textures,
// watermark marks, font pairings, background colors) - the Custom
// Editor's own manual-editing tabs (Content/Layout/Colors/Presets) had
// no automatic-generator role and were removed along with it, but these
// four libraries still need somewhere to live.
export default function LibraryPanel({photos, setPhotos, marks, setMarks, fontPairings, setFontPairings, backgroundColors, setBackgroundColors}) {
  const [tab, setTab] = useState("photos");

  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      overflow: "hidden",
      boxShadow: "0 4px 16px rgba(0,0,0,0.07)",
    }}>
      <div style={{display: "flex", flexWrap: "wrap", borderBottom: `1px solid ${C.border}`, background: C.cardAlt}}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: "10px 14px",
              border: "none",
              borderBottom: tab === t.key ? `3px solid ${C.accent}` : "3px solid transparent",
              background: tab === t.key ? C.accentBg : "transparent",
              color: tab === t.key ? C.accentDark : C.textTer,
              fontFamily: ui.display,
              fontSize: 11,
              fontWeight: tab === t.key ? 700 : 500,
              letterSpacing: "0.04em",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{padding: 16, maxHeight: 520, overflowY: "auto"}}>
        {tab === "photos" && <PhotosTab photos={photos} setPhotos={setPhotos} />}
        {tab === "marks" && <MarksTab marks={marks} setMarks={setMarks} />}
        {tab === "fonts" && <FontsTab fontPairings={fontPairings} setFontPairings={setFontPairings} />}
        {tab === "palette" && <PaletteTab backgroundColors={backgroundColors} setBackgroundColors={setBackgroundColors} />}
      </div>
    </div>
  );
}
