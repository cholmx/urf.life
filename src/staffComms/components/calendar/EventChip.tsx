import { C, font, scopeChipColors, scopeRangeColors } from '../../lib/theme';
import type { Announcement } from '../../types';

interface EventChipProps {
  a: Announcement;
  isDragging: boolean;
  draggable?: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onEdit: () => void;
}

export function EventChip({ a, isDragging, draggable = true, onDragStart, onDragEnd, onEdit }: EventChipProps) {
  const colors = scopeChipColors[a.scope] || scopeChipColors.informational;
  const dot = scopeRangeColors[a.scope] || C.borderFocus;

  return (
    <div
      draggable={draggable}
      onDragStart={e => { if (!draggable) { e.preventDefault(); return; } e.stopPropagation(); onDragStart(); }}
      onDragEnd={e => { e.stopPropagation(); onDragEnd(); }}
      onClick={e => { e.stopPropagation(); onEdit(); }}
      title={draggable ? a.title : `${a.title} (repeat occurrence - edit the series to reschedule)`}
      style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: 3,
        padding: '2px 5px',
        fontSize: 10,
        fontWeight: 500,
        color: colors.text,
        fontFamily: font.body,
        cursor: draggable ? 'grab' : 'pointer',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        opacity: isDragging ? 0.35 : 1,
        transition: 'opacity 0.1s',
        userSelect: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
      }}
    >
      <span style={{ width: 4, height: 4, borderRadius: '50%', background: dot, flexShrink: 0, display: 'inline-block' }} />
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>{a.title}</span>
    </div>
  );
}
