import React from 'react';
import { C, ui } from '../constants/styles';

export default function ConfirmDialog({ message, confirmLabel = 'Delete', onConfirm, onCancel }) {
  return (
    <div onClick={onCancel} style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.45)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: C.card,
        borderRadius: 12,
        padding: '24px 28px',
        maxWidth: 360,
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        <div style={{
          fontFamily: ui.body,
          fontSize: 15,
          color: C.text,
          lineHeight: 1.5,
          marginBottom: 20,
        }}>
          {message}
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{
            padding: '9px 18px',
            border: `1px solid ${C.border}`,
            borderRadius: 6,
            background: 'transparent',
            color: C.textSec,
            fontFamily: ui.display,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}>
            Cancel
          </button>
          <button onClick={onConfirm} style={{
            padding: '9px 18px',
            border: 'none',
            borderRadius: 6,
            background: C.error,
            color: '#fff',
            fontFamily: ui.display,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
