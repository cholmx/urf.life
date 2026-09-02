import React from 'react';
import { C, ui, lS } from '../constants/styles';

export default function Slider({ label, value, min, max, onChange }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <label style={lS}>{label}</label>
        <span style={{ fontFamily: ui.body, fontSize: 11, fontWeight: 600, color: C.accent }}>{value}</span>
      </div>
      <input
        type="range" min={min} max={max} value={value}
        onChange={e => onChange(+e.target.value)}
        style={{ width: "100%", accentColor: C.accent, height: 4, cursor: "pointer" }}
      />
    </div>
  );
}