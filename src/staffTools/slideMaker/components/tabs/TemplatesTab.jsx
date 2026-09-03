import React from 'react';
import { TEMPLATES } from '../../constants/data';
import { C, ui } from '../../constants/styles';
import SlideCanvas from '../SlideCanvas';

export default function TemplatesTab({ tmplId, setTmplId, data, brand, bgImg, ov, blur }) {
  return (
    <div>
      <p style={{ fontFamily: ui.body, fontSize: 12, color: C.textTer, marginBottom: 12 }}>
        Choose a layout — your content and styles carry over.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
        {TEMPLATES.map(t => (
          <div key={t.id} onClick={() => setTmplId(t.id)} style={{ cursor: "pointer" }}>
            <div style={{
              border: tmplId === t.id ? `3px solid ${C.accent}` : `2px solid ${C.border}`,
              borderRadius: 8, overflow: "hidden",
              boxShadow: tmplId === t.id ? `0 0 0 3px ${C.accentBg}` : "none",
              transition: "border-color 0.15s",
            }}>
              <SlideCanvas tmplId={t.id} data={data} brand={brand} bgImg={bgImg} ov={ov} blur={blur} />
            </div>
            <div style={{
              fontFamily: ui.display, fontSize: 10, fontWeight: 700,
              color: tmplId === t.id ? C.accent : C.textTer,
              marginTop: 5, textAlign: "center", textTransform: "uppercase", letterSpacing: "0.06em"
            }}>{t.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}