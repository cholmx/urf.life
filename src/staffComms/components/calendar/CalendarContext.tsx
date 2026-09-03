import { createContext, useContext, useState, useRef, useCallback } from 'react';
import type { Announcement } from '../../types';

interface CalendarState {
  viewYear: number;
  viewMonth: number;
  selectedDay: string | null;
  editingAnnouncement: Announcement | null;
  addingForDay: string | null;
  draggedId: string | null;
  draggedSourceDay: string | null;
  dragOverDay: string | null;
  panelRef: React.RefObject<HTMLDivElement>;
}

interface CalendarActions {
  setViewYear: (y: number | ((prev: number) => number)) => void;
  setViewMonth: (m: number | ((prev: number) => number)) => void;
  setSelectedDay: (d: string | null | ((prev: string | null) => string | null)) => void;
  setEditingAnnouncement: (a: Announcement | null) => void;
  setAddingForDay: (d: string | null) => void;
  setDraggedId: (id: string | null) => void;
  setDragStart: (id: string, sourceDay: string) => void;
  setDragOverDay: (d: string | null) => void;
  clearDrag: () => void;
}

const CalendarStateCtx = createContext<CalendarState | null>(null);
const CalendarActionsCtx = createContext<CalendarActions | null>(null);

export function CalendarProvider({
  children,
  initialDate,
}: {
  children: React.ReactNode;
  initialDate: string;
}) {
  const now = new Date(initialDate + 'T12:00:00');
  const [viewYear,  setViewYear]  = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [addingForDay, setAddingForDay] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [draggedSourceDay, setDraggedSourceDay] = useState<string | null>(null);
  const [dragOverDay, setDragOverDay] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const setDragStart = useCallback((id: string, sourceDay: string) => {
    setDraggedId(id);
    setDraggedSourceDay(sourceDay);
  }, []);

  const clearDrag = useCallback(() => {
    setDraggedId(null);
    setDraggedSourceDay(null);
    setDragOverDay(null);
  }, []);

  const state: CalendarState = {
    viewYear, viewMonth, selectedDay, editingAnnouncement,
    addingForDay, draggedId, draggedSourceDay, dragOverDay, panelRef,
  };

  const actions: CalendarActions = {
    setViewYear, setViewMonth, setSelectedDay, setEditingAnnouncement,
    setAddingForDay, setDraggedId, setDragStart, setDragOverDay, clearDrag,
  };

  return (
    <CalendarStateCtx.Provider value={state}>
      <CalendarActionsCtx.Provider value={actions}>
        {children}
      </CalendarActionsCtx.Provider>
    </CalendarStateCtx.Provider>
  );
}

export function useCalendarState(): CalendarState {
  const ctx = useContext(CalendarStateCtx);
  if (!ctx) throw new Error('useCalendarState must be used inside CalendarProvider');
  return ctx;
}

export function useCalendarActions(): CalendarActions {
  const ctx = useContext(CalendarActionsCtx);
  if (!ctx) throw new Error('useCalendarActions must be used inside CalendarProvider');
  return ctx;
}
