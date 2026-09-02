import React from 'react';
import { COLOR_PALETTES } from '../../constants/data';
import { C, ui, iS, lS } from '../../constants/styles';

export default function ColorsTab({ palette, updatePalette, brand, setBrand }) {
  return (
    <div>
      <p style={{ fontFamily: ui.body, fontSize: 12, color: C.textTer, marginBottom: 12 }}>
        Select a palette or customize your brand colors below.
      </p>

      {/* Custom overrides */}
      <div style={{ background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 8, padding: 12, marginBottom: 20 }}>
        <div style={{ fontFamily: ui.display, fontSize: 10, fontWeight: 700, color: C.textTer, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Custom Colors</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {[
            { label: "Background", key: "bgColor" },
            { label: "Text", key: "textColor" },
            { label: "Accent", key: "accentColor" },
          ].map(({ label, key }) => (
            <div key={key}>
              <label style={lS}>{label}</label>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input type="color" value={brand[key]} onChange={e => setBrand(b => ({ ...b, [key]: e.target.value }))}
                  style={{ width: 32, height: 32, border: `1px solid ${C.border}`, borderRadius: 4, padding: 2, cursor: "pointer", background: "none" }} />
                <span style={{ fontFamily: ui.body, fontSize: 10, color: C.textTer }}>{brand[key]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Text Shadow Toggle */}
      <div style={{ background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 8, padding: 12, marginBottom: 20 }}>
        <div style={{ fontFamily: ui.display, fontSize: 10, fontWeight: 700, color: C.textTer, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Text Effects</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: ui.body, fontSize: 13, color: C.text }}>Text Shadow</span>
          <button
            onClick={() => setBrand(b => ({ ...b, textShadow: !b.textShadow }))}
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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 20 }}>
        {COLOR_PALETTES.map(p => (
          <div key={p.id} onClick={() => updatePalette(p)} style={{
            border: `2px solid ${palette.id === p.id ? C.accent : C.border}`,
            borderRadius: 8, overflow: "hidden", cursor: "pointer",
            boxShadow: palette.id === p.id ? `0 0 0 3px ${C.accentBg}` : "none",
            transition: "border-color 0.15s",
          }}>
            <div style={{ background: p.bg, padding: "10px 8px 8px", minHeight: 48 }}>
              <div style={{ fontFamily: brand.hFont, fontSize: 14, fontWeight: 800, color: p.tx, lineHeight: 1.1 }}>Aa</div>
              <div style={{ fontFamily: brand.bFont, fontSize: 9, color: p.ac, marginTop: 2 }}>accent</div>
            </div>
            <div style={{ padding: "4px 8px 6px", background: C.card }}>
              <div style={{ fontFamily: ui.display, fontSize: 9, fontWeight: 700, color: palette.id === p.id ? C.accentDark : C.textTer, textTransform: "uppercase", letterSpacing: "0.04em" }}>{p.name}</div>
              <div style={{ display: "flex", gap: 2, marginTop: 3 }}>
                {[p.bg, p.tx, p.ac].map((clr, i) => (
                  <div key={i} style={{ width: 12, height: 12, borderRadius: 2, background: clr, border: `1px solid ${C.border}` }} />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}