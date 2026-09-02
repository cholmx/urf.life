import { C, font, scopeRangeColors } from '../../lib/theme';
import { ScopePill } from '../ui/Pill';
import { formatDateNice } from '../../lib/helpers';
import type { Announcement } from '../../types';

interface DayPanelProps {
  day: string;
  eventItems: Announcement[];
  rangeItems: Announcement[];
  onEdit: (a: Announcement) => void;
  onAddForDay: () => void;
  onClose: () => void;
}

export function DayPanel({ day, eventItems, rangeItems, onEdit, onAddForDay, onClose }: DayPanelProps) {
  const allItems = [...eventItems, ...rangeItems];
  const dateLabel = new Date(day + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 16px',
        borderBottom: allItems.length > 0 ? `1px solid ${C.border}` : 'none',
        background: C.bgSubtle,
      }}>
        <div>
          <div style={{ fontFamily: font.display, fontSize: 14, fontWeight: 800, color: C.text, letterSpacing: '-0.01em' }}>{dateLabel}</div>
          <div style={{ fontFamily: font.mono, fontSize: 10, color: C.textMuted, marginTop: 2, letterSpacing: '0.03em' }}>
            {allItems.length === 0 ? 'no announcements' : `${allItems.length} announcement${allItems.length !== 1 ? 's' : ''}`}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button
            onClick={onAddForDay}
            style={{ padding: '6px 14px', border: 'none', borderRadius: 6, background: C.accent, color: '#fff', fontFamily: font.display, fontWeight: 700, fontSize: 11, cursor: 'pointer', letterSpacing: '0.04em', textTransform: 'uppercase' }}
          >
            + Add
          </button>
          <button
            onClick={onClose}
            style={{ width: 28, height: 28, border: `1px solid ${C.border}`, borderRadius: 5, background: 'transparent', color: C.textTer, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font.body, lineHeight: 1 }}
          >
            &times;
          </button>
        </div>
      </div>

      {allItems.length > 0 && (
        <div style={{ padding: '8px 0' }}>
          {eventItems.length > 0 && (
            <div>
              {rangeItems.length > 0 && (
                <div style={{ padding: '4px 16px 2px', fontFamily: font.mono, fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.textMuted }}>
                  Events on this date
                </div>
              )}
              {eventItems.map(a => <PanelItem key={a.id} a={a} type="event" onEdit={onEdit} />)}
            </div>
          )}
          {rangeItems.length > 0 && (
            <div style={{ marginTop: eventItems.length > 0 ? 4 : 0 }}>
              {eventItems.length > 0 && (
                <div style={{ padding: '4px 16px 2px', fontFamily: font.mono, fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.textMuted }}>
                  Active this date
                </div>
              )}
              {rangeItems.map(a => <PanelItem key={a.id} a={a} type="range" onEdit={onEdit} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PanelItem({ a, type, onEdit }: { a: Announcement; type: 'event' | 'range'; onEdit: (a: Announcement) => void }) {
  const color = scopeRangeColors[a.scope] || C.borderFocus;
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '8px 14px 8px 12px',
      borderLeft: `3px solid ${type === 'event' ? color : color + '55'}`,
      marginLeft: 16, marginRight: 16, marginBottom: 4,
      background: C.card, border: `1px solid ${C.border}`, borderLeftWidth: 3, borderLeftStyle: 'solid', borderLeftColor: type === 'event' ? color : color + '55', borderRadius: '0 6px 6px 0',
    }}>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontFamily: font.display, fontSize: 12, fontWeight: 800, color: C.text, marginBottom: 3, letterSpacing: '-0.01em' }}>
          {a.title}
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <ScopePill scope={a.scope} />
          <span style={{ fontFamily: font.mono, fontSize: 10, color: C.textMuted }}>{a.category}</span>
          {type === 'range' && a.happenings_end_date && (
            <span style={{ fontFamily: font.mono, fontSize: 10, color: C.textMuted }}>ends {formatDateNice(a.happenings_end_date)}</span>
          )}
        </div>
      </div>
      <button
        onClick={() => onEdit(a)}
        style={{ marginLeft: 10, padding: '4px 12px', border: `1px solid ${C.border}`, borderRadius: 5, background: C.card, color: C.textSec, fontSize: 11, fontWeight: 600, fontFamily: font.display, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, letterSpacing: '0.03em' }}
      >
        Edit
      </button>
    </div>
  );
}
