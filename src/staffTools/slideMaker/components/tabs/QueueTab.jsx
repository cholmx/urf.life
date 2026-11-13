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

export default function QueueTab({ items, previews, onRegenerate, onUseItem, onToggleSlideMade }) {
  const [regeneratingIds, setRegeneratingIds] = useState(() => new Set());

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
        {items.length} still need{items.length === 1 ? 's' : ''} a slide — a ready-made one is building for each below; download it directly, or open it to tweak.
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: 20 }}>
        {items.map(a => {
          const dates = (a.event_dates && a.event_dates.length > 0)
            ? [...a.event_dates].filter(Boolean).sort()
            : (a.event_date ? [a.event_date] : []);
          const dateStr = dates.map(d => formatDateNice(d)).join(' · ');
          const preview = previews && previews[a.id];
          const previewUrl = preview && preview.dataUrl;
          const regenerating = regeneratingIds.has(a.id);

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
              <div style={{
                fontFamily: ui.display,
                fontSize: 16,
                fontWeight: 700,
                color: C.text,
                marginBottom: 3,
              }}>
                {a.title}
              </div>
              {dateStr && (
                <div style={{ fontFamily: ui.body, fontSize: 13, color: C.textTer, marginBottom: 12 }}>
                  {dateStr}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => onUseItem(a)}
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
                  Use This
                </button>
                {previewUrl && (
                  <button
                    onClick={() => downloadPreview(previewUrl, a.title)}
                    title="Download this slide now, no editing needed"
                    style={{
                      flex: '0 0 auto',
                      width: 40,
                      padding: '8px 0',
                      border: `1px solid ${C.border}`,
                      borderRadius: 6,
                      background: 'transparent',
                      color: C.textSec,
                      fontSize: 15,
                      cursor: 'pointer',
                    }}
                  >
                    ⬇
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
