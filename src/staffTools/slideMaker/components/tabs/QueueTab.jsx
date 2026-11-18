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

export default function QueueTab({ items, previews, onRegenerate, onToggleSlideMade, defaultSlideTexts, textOverrides, onUpdateText }) {
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
