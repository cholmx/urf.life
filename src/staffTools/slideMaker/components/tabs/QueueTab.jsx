import React from 'react';
import { C, ui } from '../../constants/styles';
import { formatDateNice } from '../../../../staffComms/lib/helpers';

function downloadPreview(dataUrl, title) {
  const slug = (title || 'slide').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const a = document.createElement('a');
  a.download = `slide-${slug || 'slide'}.png`;
  a.href = dataUrl;
  a.click();
}

export default function QueueTab({ items, previews, onUseItem, onToggleSlideMade }) {
  if (items.length === 0) {
    return (
      <p style={{ fontFamily: ui.body, fontSize: 12, color: C.textTer, textAlign: 'center', padding: '24px 8px' }}>
        Nothing needs a slide right now.
      </p>
    );
  }

  return (
    <div>
      <div style={{ fontFamily: ui.body, fontSize: 11, color: C.textTer, marginBottom: 12 }}>
        {items.length} still need{items.length === 1 ? 's' : ''} a slide — a ready-made one is building for each below; download it directly, or open it to tweak.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map(a => {
          const dates = (a.event_dates && a.event_dates.length > 0)
            ? [...a.event_dates].filter(Boolean).sort()
            : (a.event_date ? [a.event_date] : []);
          const dateStr = dates.map(d => formatDateNice(d)).join(' · ');
          const previewUrl = previews && previews[a.id];

          return (
            <div
              key={a.id}
              style={{
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                padding: '10px 12px',
                background: C.card,
              }}
            >
              <div style={{
                borderRadius: 6,
                overflow: 'hidden',
                marginBottom: 8,
                aspectRatio: '16/9',
                background: C.cardAlt,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {previewUrl ? (
                  <img src={previewUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <span style={{ fontFamily: ui.body, fontSize: 10, color: C.textTer }}>Building preview…</span>
                )}
              </div>
              <div style={{
                fontFamily: ui.display,
                fontSize: 13,
                fontWeight: 700,
                color: C.text,
                marginBottom: 2,
              }}>
                {a.title}
              </div>
              {dateStr && (
                <div style={{ fontFamily: ui.body, fontSize: 11, color: C.textTer, marginBottom: 8 }}>
                  {dateStr}
                </div>
              )}
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => onUseItem(a)}
                  style={{
                    flex: 1,
                    padding: '5px 8px',
                    border: `1px solid ${C.border}`,
                    borderRadius: 5,
                    background: C.accentBg,
                    color: C.accentDark,
                    fontFamily: ui.body,
                    fontSize: 11,
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
                      width: 32,
                      padding: '5px 0',
                      border: `1px solid ${C.border}`,
                      borderRadius: 5,
                      background: 'transparent',
                      color: C.textSec,
                      fontSize: 13,
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
                    padding: '5px 8px',
                    border: `1px solid ${C.border}`,
                    borderRadius: 5,
                    background: C.accentDark,
                    color: '#fff',
                    fontFamily: ui.body,
                    fontSize: 11,
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
