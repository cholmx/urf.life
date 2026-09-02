import React from 'react';
import { C, lS, iS, ui } from '../../constants/styles';
import Slider from '../Slider';

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={lS}>{label}</label>
      {children}
    </div>
  );
}

export default function ContentTab({ tmplId, data, ds, brand, setBrand }) {
  const hLS = brand.hLetterSpacing ?? 0;
  const headLineHeight = data.headLineHeight ?? 1.12;
  const autoFit = data.autoFit ?? true;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <Field label="Headline">
        <textarea style={{ ...iS, minHeight: 64, resize: "vertical", lineHeight: 1.4 }}
          value={data.line1 || ""}
          onChange={e => ds("line1", e.target.value)}
        />
      </Field>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <input
          type="checkbox"
          id="uppercase-toggle"
          checked={data.uppercaseHeadline || false}
          onChange={e => ds("uppercaseHeadline", e.target.checked)}
          style={{ cursor: "pointer" }}
        />
        <label htmlFor="uppercase-toggle" style={{ ...lS, marginBottom: 0, cursor: "pointer" }}>
          ALL UPPERCASE
        </label>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <input
          type="checkbox"
          id="autofit-toggle"
          checked={autoFit}
          onChange={e => ds("autoFit", e.target.checked)}
          style={{ cursor: "pointer" }}
        />
        <label htmlFor="autofit-toggle" style={{ ...lS, marginBottom: 0, cursor: "pointer" }}>
          AUTO-FIT TEXT
        </label>
      </div>
      <Slider label="Headline Size" value={data.s1 || 155} min={100} max={400} onChange={v => ds("s1", v)} />
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <label style={lS}>Headline Letter Spacing</label>
          <span style={{ fontFamily: ui.body, fontSize: 11, fontWeight: 600, color: C.accent }}>{hLS > 0 ? `+${hLS}` : hLS}px</span>
        </div>
        <input
          type="range" min={-10} max={30} step={1} value={hLS}
          onChange={e => setBrand(b => ({ ...b, hLetterSpacing: +e.target.value }))}
          style={{ width: "100%", accentColor: C.accent, height: 4, cursor: "pointer" }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
          <span style={{ fontFamily: ui.body, fontSize: 9, color: C.textTer }}>Tight</span>
          <span style={{ fontFamily: ui.body, fontSize: 9, color: C.textTer }}>Wide</span>
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <label style={lS}>Headline Line Height</label>
          <span style={{ fontFamily: ui.body, fontSize: 11, fontWeight: 600, color: C.accent }}>{headLineHeight.toFixed(2)}</span>
        </div>
        <input
          type="range" min={0.85} max={1.6} step={0.01} value={headLineHeight}
          onChange={e => ds("headLineHeight", +e.target.value)}
          style={{ width: "100%", accentColor: C.accent, height: 4, cursor: "pointer" }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
          <span style={{ fontFamily: ui.body, fontSize: 9, color: C.textTer }}>Tight</span>
          <span style={{ fontFamily: ui.body, fontSize: 9, color: C.textTer }}>Loose</span>
        </div>
      </div>

      <Field label="Subtext">
        <textarea style={{ ...iS, minHeight: 56, resize: "vertical" }}
          value={data.line2 || ""}
          onChange={e => ds("line2", e.target.value)}
        />
      </Field>
      <Slider label="Subtext Size" value={data.s2 || 65} min={20} max={160} onChange={v => ds("s2", v)} />

      <Field label="Detail Line">
        <textarea style={{ ...iS, minHeight: 48, resize: "vertical" }}
          value={data.line3 || ""}
          onChange={e => ds("line3", e.target.value)}
        />
      </Field>
      <Slider label="Detail Size" value={data.s3 || 32} min={18} max={72} onChange={v => ds("s3", v)} />
    </div>
  );
}
