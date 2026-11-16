import React from 'react';
import { C, ui } from '../../constants/styles';

// Reads the Palette tab's staff-managed backgroundColors (see
// backgroundColorService's getBackgroundColors, loaded once in
// SlideMaker.jsx) instead of a fixed array, so adding/deleting/retinting
// a background or its text colors there shows up here immediately - no
// separate "which backgrounds does the Custom Editor offer" list to
// keep in sync by hand.
export default function ColorsTab({ brand, backgroundColors, updateBackground, updateTextColor }) {
  if (!backgroundColors || backgroundColors.length === 0) {
    return (
      <p style={{ fontFamily: ui.body, fontSize: 12, color: C.textTer }}>
        No backgrounds yet - add some from the Palette tab.
      </p>
    );
  }

  const activeBg = backgroundColors.find(b => b.hex === brand.bgColor) || backgroundColors[0];

  return (
    <div>
      <p style={{ fontFamily: ui.body, fontSize: 12, color: C.textTer, marginBottom: 12 }}>
        Pick a background, then a text color that reads well on it.
      </p>

      <div style={{ fontFamily: ui.display, fontSize: 10, fontWeight: 700, color: C.textTer, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
        Background
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, marginBottom: 20 }}>
        {backgroundColors.map(b => (
          <div key={b.id} onClick={() => updateBackground(b)} style={{
            border: `2px solid ${activeBg.id === b.id ? C.accent : C.border}`,
            borderRadius: 8, overflow: "hidden", cursor: "pointer",
            boxShadow: activeBg.id === b.id ? `0 0 0 3px ${C.accentBg}` : "none",
            transition: "border-color 0.15s",
          }}>
            <div style={{ background: b.hex, height: 48, border: b.hex === "#FFFFFF" ? `1px solid ${C.border}` : "none" }} />
            <div style={{ padding: "4px 8px 6px", background: C.card }}>
              <div style={{ fontFamily: ui.display, fontSize: 9, fontWeight: 700, color: activeBg.id === b.id ? C.accentDark : C.textTer, textTransform: "uppercase", letterSpacing: "0.04em" }}>{b.name}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ fontFamily: ui.display, fontSize: 10, fontWeight: 700, color: C.textTer, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
        Text Color
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, marginBottom: 20 }}>
        {activeBg.textColors.map((t, i) => (
          <div key={`${t.hex}-${i}`} onClick={() => updateTextColor(t.hex)} style={{
            display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", cursor: "pointer",
            border: `2px solid ${brand.textColor === t.hex ? C.accent : C.border}`,
            borderRadius: 8,
            boxShadow: brand.textColor === t.hex ? `0 0 0 3px ${C.accentBg}` : "none",
            transition: "border-color 0.15s",
          }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", background: t.hex, border: `1px solid ${C.border}`, flexShrink: 0 }} />
            <span style={{ fontFamily: ui.display, fontSize: 11, fontWeight: 700, color: C.text }}>{t.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
