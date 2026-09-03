import { C, font } from '../../lib/theme';
import { getMonthGrid, getEventItems, getRangeItems } from '../../lib/calendar-grid';
import { CalendarProvider, useCalendarState, useCalendarActions } from './CalendarContext';
import { WeekRow } from './WeekRow';
import { DayPanel } from './DayPanel';
import { EditModal } from './EditModal';
import type { Announcement } from '../../types';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const navBtn: React.CSSProperties = {
  padding: '5px 12px',
  border: `1px solid ${C.border}`,
  borderRadius: 6,
  background: C.card,
  color: C.textSec,
  fontFamily: font.display,
  fontWeight: 700,
  fontSize: 12,
  cursor: 'pointer',
  letterSpacing: '0.01em',
};

interface CalendarTabProps {
  announcements: Announcement[];
  today: string;
  onSave: (a: Omit<Announcement, 'id' | 'created_at' | 'updated_at'> & { id?: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onPreviewDateChange: (date: string) => void;
  onError: (msg: string) => void;
}

export function CalendarTab(props: CalendarTabProps) {
  return (
    <CalendarProvider initialDate={props.today}>
      <CalendarInner {...props} />
    </CalendarProvider>
  );
}

function CalendarInner({ announcements, today, onSave, onDelete, onPreviewDateChange, onError }: CalendarTabProps) {
  const { viewYear, viewMonth, selectedDay, editingAnnouncement, addingForDay, draggedId, draggedSourceDay, dragOverDay, panelRef } = useCalendarState();
  const { setViewYear, setViewMonth, setSelectedDay, setEditingAnnouncement, setAddingForDay, setDragStart, setDragOverDay, clearDrag } = useCalendarActions();

  const cells = getMonthGrid(viewYear, viewMonth);
  const weeks: string[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const currentMonthStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`;
  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
    setSelectedDay(null);
  };

  const goToToday = () => {
    const t = new Date(today + 'T12:00:00');
    setViewYear(t.getFullYear());
    setViewMonth(t.getMonth());
    setSelectedDay(today);
    onPreviewDateChange(today);
  };

  const handleDayClick = (day: string) => {
    setSelectedDay(prev => prev === day ? null : day);
    onPreviewDateChange(day);
    setTimeout(() => panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
  };

  const handleDrop = async (day: string) => {
    if (!draggedId) return;
    const a = announcements.find(x => x.id === draggedId);
    if (!a) { clearDrag(); return; }

    if (a.event_dates?.length > 1 && draggedSourceDay) {
      if (draggedSourceDay === day) { clearDrag(); return; }
      const newDates = a.event_dates.map(d => d === draggedSourceDay ? day : d);
      const sorted = [...newDates].filter(Boolean).sort();
      await onSave({ ...a, event_dates: newDates, event_date: sorted[0] ?? null });
    } else {
      if (a.event_date === day) { clearDrag(); return; }
      await onSave({ ...a, event_date: day, event_dates: [day] });
    }
    clearDrag();
  };

  const handleEditSave = async (f: Omit<Announcement, 'id' | 'created_at' | 'updated_at'> & { id?: string }) => {
    await onSave(f);
    setEditingAnnouncement(null);
    setAddingForDay(null);
  };

  const inCurrentMonth = (day: string) => day.startsWith(currentMonthStr);

  const selectedEventItems = selectedDay ? getEventItems(selectedDay, announcements) : [];
  const selectedRangeItems = selectedDay ? getRangeItems(selectedDay, announcements)  : [];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontFamily: font.display, fontSize: 20, fontWeight: 800, color: C.text, margin: 0, letterSpacing: '-0.02em' }}>
          {monthLabel}
        </h3>
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={goToToday} style={navBtn}>Today</button>
          <button onClick={prevMonth} style={navBtn} aria-label="Previous month">‹</button>
          <button onClick={nextMonth} style={navBtn} aria-label="Next month">›</button>
        </div>
      </div>

      <div style={{ fontFamily: font.mono, fontSize: 10, color: C.textMuted, marginBottom: 12, letterSpacing: '0.03em' }}>
        drag to reschedule · click day for details
      </div>

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: `1px solid ${C.border}`, background: C.bgSubtle }}>
          {DAYS.map(d => (
            <div key={d} style={{
              padding: '8px 0',
              textAlign: 'center',
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: C.textMuted,
              fontFamily: font.display,
            }}>
              {d}
            </div>
          ))}
        </div>

        {weeks.map((week, wi) => (
          <WeekRow
            key={wi}
            week={week}
            announcements={announcements}
            today={today}
            selectedDay={selectedDay}
            draggedId={draggedId}
            dragOverDay={dragOverDay}
            inCurrentMonth={inCurrentMonth}
            isLastRow={wi === weeks.length - 1}
            onDayClick={handleDayClick}
            onDragStart={setDragStart}
            onDragOver={setDragOverDay}
            onDrop={handleDrop}
            onDragEnd={clearDrag}
            onEditChip={setEditingAnnouncement}
          />
        ))}
      </div>

      {selectedDay && (
        <div ref={panelRef} style={{ marginTop: 12 }}>
          <DayPanel
            day={selectedDay}
            eventItems={selectedEventItems}
            rangeItems={selectedRangeItems.map(x => x.a)}
            onEdit={setEditingAnnouncement}
            onAddForDay={() => setAddingForDay(selectedDay)}
            onClose={() => setSelectedDay(null)}
          />
        </div>
      )}

      {(editingAnnouncement || addingForDay) && (
        <EditModal
          announcement={editingAnnouncement}
          defaultDate={addingForDay}
          onSave={handleEditSave}
          onDelete={editingAnnouncement ? async () => { await onDelete(editingAnnouncement.id); setEditingAnnouncement(null); } : undefined}
          onCancel={() => { setEditingAnnouncement(null); setAddingForDay(null); }}
          onError={onError}
        />
      )}
    </div>
  );
}
