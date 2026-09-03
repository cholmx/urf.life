import React from 'react';
import { C, ui } from '../../constants/styles';
import { formatDateNice } from '../../../../staffComms/lib/helpers';

export default function QueueTab({ items, onUseItem, onToggleSlideMade }) {
  if (items.length === 0) {
    return (
      <p style={{ fontFamily: ui.body, fontSize: 12, color: C.textTer, textAlign: 'center', padding: '24px 8px' }}>
        Nothing needs a slide right now.
      </p>
    );
  }

  const doneCount = items.filter(a => a.slide_made).length;

  return (
    <div>
      <div style={{ fontFamily: ui.body, fontSize: 11, color: C.textTer, marginBottom: 12 }}>
        {doneCount}/{items.length} made
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map(a => {
          const dates = (a.event_dates && a.event_dates.length > 0)
            ? [...a.event_dates].filter(Boolean).sort()
            : (a.event_date ? [a.event_date] : []);
          const dateStr = dates.map(d => formatDateNice(d)).join(' · ');

          return (
            <div
              key={a.id}
              style={{
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                padding: '10px 12px',
                background: a.slide_made ? C.cardAlt : C.card,
              }}
            >
              <div style={{
                fontFamily: ui.display,
                fontSize: 13,
                fontWeight: 700,
                color: C.text,
                textDecoration: a.slide_made ? 'line-through' : 'none',
                opacity: a.slide_made ? 0.55 : 1,
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
                <button
                  onClick={() => onToggleSlideMade(a.id, !a.slide_made)}
                  style={{
                    flex: 1,
                    padding: '5px 8px',
                    border: `1px solid ${C.border}`,
                    borderRadius: 5,
                    background: a.slide_made ? C.card : C.accentDark,
                    color: a.slide_made ? C.textTer : '#fff',
                    fontFamily: ui.body,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {a.slide_made ? 'Mark Not Made' : 'Mark Made'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
