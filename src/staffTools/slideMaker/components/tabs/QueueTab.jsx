import React, { useState } from 'react';
import { C, ui } from '../../constants/styles';
import { formatDateNice } from '../../../../staffComms/lib/helpers';

function downloadPreview(dataUrl, title) {
  const slug = (title || 'slide').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const a = document.createElement('a');
  a.download = `slide-${slug || 'slide'}.png`;
  a.href = dataUrl;
  a.click();
}

// Headline/subtext only - no layout/color controls here. Meant for the
// occasional case where the auto-generated wording (derived from the
// announcement's own title/description) reads awkwardly once wrapped
// onto a slide, without reopening a full editor or touching the
// announcement record itself (see updateQueueItemText in
// SlideMaker.jsx). Overridden text survives a background/font shuffle;
// "Reset to automatic" clears it back to whatever the announcement
// itself would produce.
function TextEditForm({ initial, hasOverride, onSave, onReset, onCancel }) {
  const [line1, setLine1] = useState(initial.line1 || '');
  const [line2, setLine2] = useState(initial.line2 || '');

  return (
    <div style={{ marginBottom: 12, padding: 12, border: `1px solid ${C.border}`, borderRadius: 8, background: C.cardAlt }}>
      <label style={{ display: 'block', fontFamily: ui.display, fontSize: 10, fontWeight: 700, color: C.textTer, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
        Headline
      </label>
      <input
        type="text"
        value={line1}
        onChange={e => setLine1(e.target.value)}
        style={{ width: '100%', boxSizing: 'border-box', padding: '7px 9px', marginBottom: 10, border: `1px solid ${C.border}`, borderRadius: 6, fontFamily: ui.body, fontSize: 13 }}
      />
      <label style={{ display: 'block', fontFamily: ui.display, fontSize: 10, fontWeight: 700, color: C.textTer, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
        Subtext
      </label>
      <textarea
        value={line2}
        onChange={e => setLine2(e.target.value)}
        rows={2}
        style={{ width: '100%', boxSizing: 'border-box', padding: '7px 9px', marginBottom: 10, border: `1px solid ${C.border}`, borderRadius: 6, fontFamily: ui.body, fontSize: 13, resize: 'vertical' }}
      />
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => onSave({ line1, line2 })}
          style={{ padding: '6px 12px', border: 'none', borderRadius: 6, background: C.accentDark, color: '#fff', fontFamily: ui.body, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
        >
          Save
        </button>
        <button
          onClick={onCancel}
          style={{ padding: '6px 12px', border: `1px solid ${C.border}`, borderRadius: 6, background: 'transparent', color: C.textSec, fontFamily: ui.body, fontSize: 12, cursor: 'pointer' }}
        >
          Cancel
        </button>
        {hasOverride && (
          <button
            onClick={onReset}
            title="Go back to the text the announcement itself would produce"
            style={{ marginLeft: 'auto', padding: '6px 12px', border: `1px solid ${C.border}`, borderRadius: 6, background: 'transparent', color: C.textTer, fontFamily: ui.body, fontSize: 12, cursor: 'pointer' }}
          >
            Reset to automatic
          </button>
        )}
      </div>
    </div>
  );
}

const SIZE_SCALE_MIN = 0.5;
const SIZE_SCALE_MAX = 2.5;

// A single Headline/Subhead Size slider for one queue card - same range
// as the Fonts tab's own size sliders (see SizeScaleSlider in
// FontsTab.jsx), kept as its own small copy here rather than imported
// across tab files, since each tab stays self-contained in this app.
function SizeSlider({ id, label, value, onChange }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <label htmlFor={id} style={{ fontFamily: ui.display, fontSize: 9, fontWeight: 700, color: C.textTer, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </label>
        <span style={{ fontFamily: ui.body, fontSize: 11, color: C.textSec }}>{Math.round(value * 100)}%</span>
      </div>
      <input
        id={id}
        type="range"
        min={SIZE_SCALE_MIN}
        max={SIZE_SCALE_MAX}
        step={0.05}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', cursor: 'pointer' }}
      />
    </div>
  );
}

export default function QueueTab({ items, previews, onRegenerate, onToggleSlideMade, defaultSlideTexts, textOverrides, onUpdateText, fontPairings, fontOverrides, onUpdateFont, sizeOverrides, onUpdateSize }) {
  const [regeneratingIds, setRegeneratingIds] = useState(() => new Set());
  const [editingId, setEditingId] = useState(null);

  const handleRegenerate = async (a) => {
    setRegeneratingIds(prev => new Set(prev).add(a.id));
    try {
      await onRegenerate?.(a);
    } finally {
      setRegeneratingIds(prev => {
        const next = new Set(prev);
        next.delete(a.id);
        return next;
      });
    }
  };

  if (items.length === 0) {
    return (
      <p style={{ fontFamily: ui.body, fontSize: 12, color: C.textTer, textAlign: 'center', padding: '24px 8px' }}>
        Nothing needs a slide right now.
      </p>
    );
  }

  return (
    <div>
      <div style={{ fontFamily: ui.body, fontSize: 13, color: C.textTer, marginBottom: 16 }}>
        {items.length} still need{items.length === 1 ? 's' : ''} a slide — a ready-made one is building for each below; download it directly, or shuffle for a different look.
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(620px, 1fr))', gap: 24 }}>
        {items.map(a => {
          const dates = (a.event_dates && a.event_dates.length > 0)
            ? [...a.event_dates].filter(Boolean).sort()
            : (a.event_date ? [a.event_date] : []);
          const dateStr = dates.map(d => formatDateNice(d)).join(' · ');
          const preview = previews && previews[a.id];
          const previewUrl = preview && preview.dataUrl;
          const regenerating = regeneratingIds.has(a.id);
          const hasOverride = !!(textOverrides && textOverrides[a.id]);
          const editing = editingId === a.id;
          const currentText = (textOverrides && textOverrides[a.id]) || (defaultSlideTexts && defaultSlideTexts[a.id]) || { line1: a.title || '', line2: '' };
          const fontOverride = (fontOverrides && fontOverrides[a.id]) || '';
          // The size a fresh "Reset" should fall back to, and what the
          // sliders show before staff have touched them for this slide:
          // a size override if one's set, else whatever size the
          // currently-active pairing (the font override above, or
          // whatever the automatic generator actually picked - see
          // preview.auto) already specifies.
          const activePairing = fontOverride ? (fontPairings || []).find(p => p.id === fontOverride) : null;
          const hasSizeOverride = !!(sizeOverrides && sizeOverrides[a.id]);
          const effectiveSize = (sizeOverrides && sizeOverrides[a.id]) || {
            hSizeScale: activePairing?.hSizeScale ?? preview?.auto?.hSizeScale ?? 1,
            bSizeScale: activePairing?.bSizeScale ?? preview?.auto?.bSizeScale ?? 1,
          };

          return (
            <div
              key={a.id}
              style={{
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                padding: '14px 16px',
                background: C.card,
              }}
            >
              <div style={{
                position: 'relative',
                borderRadius: 8,
                overflow: 'hidden',
                marginBottom: 12,
                aspectRatio: '16/10',
                background: C.cardAlt,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {previewUrl ? (
                  <img src={previewUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: regenerating ? 0.5 : 1 }} />
                ) : (
                  <span style={{ fontFamily: ui.body, fontSize: 12, color: C.textTer }}>Building preview…</span>
                )}
                {previewUrl && (
                  <button
                    onClick={() => setEditingId(editing ? null : a.id)}
                    title="Edit this slide's headline/subtext"
                    style={{
                      position: 'absolute', top: 10, left: 10, width: 32, height: 32, borderRadius: 16, border: 'none',
                      background: editing ? C.accent : 'rgba(0,0,0,0.65)', color: '#fff', fontSize: 15,
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1,
                    }}
                  >
                    ✏️
                  </button>
                )}
                {previewUrl && (
                  <button
                    onClick={() => handleRegenerate(a)}
                    disabled={regenerating}
                    title="Try a different automatic background"
                    style={{
                      position: 'absolute', top: 10, right: 10, width: 32, height: 32, borderRadius: 16, border: 'none',
                      background: 'rgba(0,0,0,0.65)', color: '#fff', fontSize: 16,
                      cursor: regenerating ? 'wait' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1,
                    }}
                  >
                    {regenerating ? '⏳' : '🔀'}
                  </button>
                )}
              </div>

              {editing ? (
                <TextEditForm
                  initial={currentText}
                  hasOverride={hasOverride}
                  onSave={(next) => { onUpdateText(a, next); setEditingId(null); }}
                  onReset={() => { onUpdateText(a, null); setEditingId(null); }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                  <div style={{ fontFamily: ui.display, fontSize: 16, fontWeight: 700, color: C.text }}>
                    {a.title}
                  </div>
                  {hasOverride && (
                    <span title="This slide's text was edited by hand" style={{ fontFamily: ui.body, fontSize: 10, color: C.accentDark, background: C.accentBg, border: `1px solid ${C.border}`, borderRadius: 999, padding: '1px 7px' }}>
                      ✏️ edited
                    </span>
                  )}
                </div>
              )}
              {!editing && dateStr && (
                <div style={{ fontFamily: ui.body, fontSize: 13, color: C.textTer, marginBottom: 12 }}>
                  {dateStr}
                </div>
              )}
              {!editing && fontPairings && fontPairings.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontFamily: ui.display, fontSize: 9, fontWeight: 700, color: C.textTer, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>
                    Font
                  </label>
                  <select
                    value={fontOverride}
                    onChange={e => onUpdateFont(a, e.target.value || null)}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '6px 8px', border: `1px solid ${C.border}`, borderRadius: 6, fontFamily: ui.body, fontSize: 12, color: C.text, cursor: 'pointer' }}
                  >
                    <option value="">Default (Automatic)</option>
                    {fontPairings.map(p => (
                      <option key={p.id} value={p.id}>{p.hFont} / {p.bFont}</option>
                    ))}
                  </select>
                </div>
              )}
              {!editing && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12, padding: '8px 10px', border: `1px solid ${C.border}`, borderRadius: 8, background: C.cardAlt }}>
                  <SizeSlider
                    id={`queue-${a.id}-head-size`}
                    label="Headline Size"
                    value={effectiveSize.hSizeScale}
                    onChange={v => onUpdateSize(a, { ...effectiveSize, hSizeScale: v })}
                  />
                  <SizeSlider
                    id={`queue-${a.id}-body-size`}
                    label="Subhead Size"
                    value={effectiveSize.bSizeScale}
                    onChange={v => onUpdateSize(a, { ...effectiveSize, bSizeScale: v })}
                  />
                  {hasSizeOverride && (
                    <button
                      onClick={() => onUpdateSize(a, null)}
                      title="Go back to this slide's current font's own size"
                      style={{ alignSelf: 'flex-start', padding: '4px 10px', border: `1px solid ${C.border}`, borderRadius: 6, background: 'transparent', color: C.textTer, fontFamily: ui.body, fontSize: 11, cursor: 'pointer' }}
                    >
                      Reset size
                    </button>
                  )}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                {previewUrl && (
                  <button
                    onClick={() => downloadPreview(previewUrl, a.title)}
                    title="Download this slide"
                    style={{
                      flex: 1,
                      padding: '8px 10px',
                      border: `1px solid ${C.border}`,
                      borderRadius: 6,
                      background: C.accentBg,
                      color: C.accentDark,
                      fontFamily: ui.body,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    ⬇ Download
                  </button>
                )}
                <button
                  onClick={() => onToggleSlideMade(a.id, true)}
                  title="Removes it from this list"
                  style={{
                    flex: 1,
                    padding: '8px 10px',
                    border: `1px solid ${C.border}`,
                    borderRadius: 6,
                    background: C.accentDark,
                    color: '#fff',
                    fontFamily: ui.body,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Mark Made
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
