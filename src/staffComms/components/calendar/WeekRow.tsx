import { C, font, scopeRangeColors } from '../../lib/theme';
import { getEventItems, computeRangeRows } from '../../lib/calendar-grid';
import { EventChip } from './EventChip';
import type { Announcement } from '../../types';

interface WeekRowProps {
  week: string[];
  announcements: Announcement[];
  today: string;
  selectedDay: string | null;
  draggedId: string | null;
  dragOverDay: string | null;
  inCurrentMonth: (d: string) => boolean;
  isLastRow: boolean;
  onDayClick: (d: string) => void;
  onDragStart: (id: string, sourceDay: string) => void;
  onDragOver: (d: string) => void;
  onDrop: (d: string) => void;
  onDragEnd: () => void;
  onEditChip: (a: Announcement) => void;
}

export function WeekRow({
  week, announcements, today, selectedDay, draggedId, dragOverDay,
  inCurrentMonth, isLastRow, onDayClick, onDragStart, onDragOver, onDrop, onDragEnd, onEditChip,
}: WeekRowProps) {
  const weekStart = week[0];
  const weekEnd   = week[6];
  const rangeRows = computeRangeRows(announcements, weekStart, weekEnd);

  return (
    <div style={{ borderBottom: isLastRow ? 'none' : `1px solid ${C.border}` }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', position: 'relative' }}>
        {week.map((day, ci) => {
          const eventItems  = getEventItems(day, announcements);
          const isToday     = day === today;
          const isSelected  = day === selectedDay;
          const isDragTarget = day === dragOverDay;
          const inMonth     = inCurrentMonth(day);

          return (
            <div
              key={day}
              onClick={() => onDayClick(day)}
              onDragOver={e => { e.preventDefault(); onDragOver(day); }}
              onDrop={e => { e.preventDefault(); onDrop(day); }}
              style={{
                height: 90,
                overflow: 'hidden',
                borderLeft: ci > 0 ? `1px solid ${C.border}` : 'none',
                padding: '6px 5px 4px',
                cursor: 'pointer',
                background: isDragTarget ? C.highBg : isSelected ? '#EEF5F4' : 'transparent',
                transition: 'background 0.1s',
                position: 'relative',
                boxSizing: 'border-box',
              }}
            >
              <div style={{
                width: 22, height: 22,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '50%',
                background: isToday ? C.accent : 'transparent',
                marginBottom: 2,
                fontFamily: font.mono,
                fontSize: 11,
                fontWeight: isToday ? 700 : inMonth ? 500 : 400,
                color: isToday ? '#fff' : inMonth ? C.text : C.textMuted,
              }}>
                {new Date(day + 'T12:00:00').getDate()}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                {eventItems.slice(0, 2).map(a => {
                  // Weekly/date-range items now show a chip on every occurrence
                  // day, but there's still only one stored date to drag - only
                  // the anchor (first) occurrence can actually be rescheduled.
                  const anchorDay = a.event_dates?.[0] || a.event_date;
                  const isDraggable = a.recurrence_type === 'one_time' || anchorDay === day;
                  return (
                    <EventChip
                      key={a.id}
                      a={a}
                      isDragging={draggedId === a.id}
                      draggable={isDraggable}
                      onDragStart={() => onDragStart(a.id, day)}
                      onDragEnd={onDragEnd}
                      onEdit={() => onEditChip(a)}
                    />
                  );
                })}
                {eventItems.length > 2 && (
                  <span style={{ fontSize: 9, color: C.textMuted, fontFamily: font.mono, paddingLeft: 2, letterSpacing: '0.02em' }}>
                    +{eventItems.length - 2}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {rangeRows.length > 0 && (
        <div style={{ position: 'relative', height: rangeRows.length * 18, pointerEvents: 'none' }}>
          {rangeRows.map(({ a, row, startCol, span }) => {
            const color   = scopeRangeColors[a.scope] || C.borderFocus;
            const isStart = a.happenings_start_date ? week.includes(a.happenings_start_date) && a.happenings_start_date >= week[0] : startCol === 0;
            const isEnd   = a.happenings_end_date   ? week.includes(a.happenings_end_date)   && a.happenings_end_date   <= week[6] : startCol + span === 7;
            const colW    = 100 / 7;
            return (
              <div
                key={a.id + '-row-' + row}
                style={{
                  position: 'absolute',
                  top: row * 18 + 2,
                  left: `calc(${startCol * colW}% + ${isStart ? 4 : 0}px)`,
                  width: `calc(${span * colW}% - ${(isStart ? 4 : 0) + (isEnd ? 4 : 0)}px)`,
                  height: 14,
                  background: color + '22',
                  borderTop: `2px solid ${color}55`,
                  borderBottom: `2px solid ${color}55`,
                  borderLeft:  isStart ? `2px solid ${color}` : 'none',
                  borderRight: isEnd   ? `2px solid ${color}` : 'none',
                  borderRadius: `${isStart ? 4 : 0}px ${isEnd ? 4 : 0}px ${isEnd ? 4 : 0}px ${isStart ? 4 : 0}px`,
                  overflow: 'hidden',
                }}
              >
                {isStart && (
                  <span style={{
                    paddingLeft: 4,
                    fontSize: 9,
                    fontWeight: 600,
                    color,
                    fontFamily: font.body,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: 'block',
                    lineHeight: '14px',
                  }}>
                    {a.title}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
