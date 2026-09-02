import { useState, useCallback, useEffect } from 'react';
import { C, font } from '../../lib/theme';

interface Toast {
  id: number;
  message: string;
  type: 'error' | 'success';
}

let nextId = 0;

interface ErrorToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}

export function ErrorToastContainer({ toasts, onDismiss }: ErrorToastContainerProps) {
  if (toasts.length === 0) return null;
  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      maxWidth: 360,
    }}>
      {toasts.map(t => (
        <ErrorToastItem key={t.id} message={t.message} type={t.type} onDismiss={() => onDismiss(t.id)} />
      ))}
    </div>
  );
}

function ErrorToastItem({ message, type, onDismiss }: { message: string; type: 'error' | 'success'; onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div style={{
      background: type === 'success' ? C.success : C.warn,
      color: '#fff',
      borderRadius: 8,
      padding: '12px 16px',
      fontFamily: font.body,
      fontSize: 13,
      lineHeight: 1.4,
      display: 'flex',
      gap: 10,
      alignItems: 'flex-start',
      boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
      animation: 'slideInToast 0.2s ease',
    }}>
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={onDismiss}
        style={{
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,0.7)',
          cursor: 'pointer',
          fontSize: 16,
          lineHeight: 1,
          padding: 0,
          flexShrink: 0,
          marginTop: 1,
          fontFamily: font.body,
        }}
      >
        &times;
      </button>
    </div>
  );
}

export function useErrorToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showError = useCallback((message: string) => {
    const id = nextId++;
    setToasts(prev => [...prev, { id, message, type: 'error' }]);
  }, []);

  const showSuccess = useCallback((message: string) => {
    const id = nextId++;
    setToasts(prev => [...prev, { id, message, type: 'success' }]);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, showError, showSuccess, dismissToast };
}
