import React from 'react';
import { FONT_COMBOS } from '../../constants/data';
import { C, ui } from '../../constants/styles';

export default function FontsTab({ combo, updateCombo }) {
  return (
    <div>
      <p style={{ fontFamily: ui.body, fontSize: 12, color: C.textTer, marginBottom: 12 }}>
        Font pairs are carefully matched for readability and style.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {FONT_COMBOS.map(c => (
          <div key={c.id} onClick={() => updateCombo(c)} style={{
            background: combo.id === c.id ? C.accentBg : C.card,
            border: `2px solid ${combo.id === c.id ? C.accent : C.border}`,
            borderRadius: 8, padding: "10px 14px", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 12,
            transition: "border-color 0.15s",
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: c.h, fontSize: 20, fontWeight: c.hWeight ?? 800, color: C.text, lineHeight: 1.1 }}>The Word</div>
              <div style={{ fontFamily: c.b, fontSize: 12, color: C.textTer, marginTop: 2 }}>Sunday 9 & 11 AM</div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontFamily: ui.display, fontSize: 10, fontWeight: 700, color: combo.id === c.id ? C.accentDark : C.textSec, textTransform: "uppercase", letterSpacing: "0.05em" }}>{c.name}</div>
              <div style={{ fontFamily: ui.body, fontSize: 9, color: C.textTer }}>{c.vibe}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}