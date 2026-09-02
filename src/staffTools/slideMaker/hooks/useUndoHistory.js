import { useRef, useCallback } from 'react';

export function useUndoHistory(maxHistory = 50) {
  const past = useRef([]);
  const present = useRef(null);
  const future = useRef([]);
  const initialized = useRef(false);

  const init = useCallback((state) => {
    present.current = state;
    initialized.current = true;
  }, []);

  const push = useCallback((newState) => {
    if (!initialized.current) {
      present.current = newState;
      initialized.current = true;
      return;
    }
    past.current = [...past.current, present.current].slice(-maxHistory);
    present.current = newState;
    future.current = [];
  }, [maxHistory]);

  const undo = useCallback(() => {
    if (past.current.length === 0) return null;
    const previous = past.current[past.current.length - 1];
    past.current = past.current.slice(0, -1);
    future.current = [present.current, ...future.current];
    present.current = previous;
    return previous;
  }, []);

  const canUndo = useCallback(() => past.current.length > 0, []);

  return { init, push, undo, canUndo };
}
