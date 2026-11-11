import React from 'react';
import { BACKGROUNDS } from '../../constants/data';
import { C, ui } from '../../constants/styles';

export default function ColorsTab({ brand, setBrand, updateBackground, updateTextColor }) {
  const activeBg = BACKGROUNDS.find(b => b.bg === brand.bgColor) || BACKGROUNDS[0];

  return (
    <div>
      <p style={{ fontFamily: ui.body, fontSize: 12, color: C.textTer, marginBottom: 12 }}>
        Pick a background, then a text color that reads well on it.
      </p>

      <div style={{ fontFamily: ui.display, fontSize: 10, fontWeight: 700, color: C.textTer, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
        Background
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, marginBottom: 20 }}>
        {BACKGROUNDS.map(b => (
          <div key={b.id} onClick={() => updateBackground(b)} style={{
            border: `2px solid ${activeBg.id === b.id ? C.accent : C.border}`,
            borderRadius: 8, overflow: "hidden", cursor: "pointer",
            boxShadow: activeBg.id === b.id ? `0 0 0 3px ${C.accentBg}` : "none",
            transition: "border-color 0.15s",
          }}>
            <div style={{ background: b.bg, height: 48, border: b.id === "light" ? `1px solid ${C.border}` : "none" }} />
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
        {activeBg.textOptions.map(t => (
          <div key={t.id} onClick={() => updateTextColor(t.color)} style={{
            display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", cursor: "pointer",
            border: `2px solid ${brand.textColor === t.color ? C.accent : C.border}`,
            borderRadius: 8,
            boxShadow: brand.textColor === t.color ? `0 0 0 3px ${C.accentBg}` : "none",
            transition: "border-color 0.15s",
          }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", background: t.color, border: `1px solid ${C.border}`, flexShrink: 0 }} />
            <span style={{ fontFamily: ui.display, fontSize: 11, fontWeight: 700, color: C.text }}>{t.name}</span>
          </div>
        ))}
      </div>

      {/* Text Shadow Toggle */}
      <div style={{ background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 8, padding: 12 }}>
        <div style={{ fontFamily: ui.display, fontSize: 10, fontWeight: 700, color: C.textTer, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Text Effects</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: ui.body, fontSize: 13, color: C.text }}>Text Shadow</span>
          <button
            onClick={() => setBrand(b => ({ ...b, textShadow: !(b.textShadow !== false) }))}
            style={{
              width: 40, height: 22, borderRadius: 11, border: "none", cursor: "pointer",
              background: brand.textShadow !== false ? C.accent : C.border,
              position: "relative", transition: "background 0.2s", flexShrink: 0,
            }}
          >
            <span style={{
              position: "absolute", top: 3, left: brand.textShadow !== false ? 20 : 3,
              width: 16, height: 16, borderRadius: "50%", background: "#fff",
              transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            }} />
          </button>
        </div>
      </div>
    </div>
  );
}
