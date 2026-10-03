import { C, font } from '../../lib/theme';

interface AIWriteButtonProps {
  label: string;
  loading: boolean;
  onClick: () => void;
  disabled: boolean;
}

export function AIWriteButton({ label, loading, onClick, disabled }: AIWriteButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        padding: '5px 11px',
        border: `1px solid ${C.border}`,
        borderRadius: 5,
        background: C.card,
        color: disabled ? C.textMuted : C.accent,
        fontSize: 10,
        fontWeight: 700,
        fontFamily: font.display,
        cursor: disabled || loading ? 'default' : 'pointer',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        opacity: disabled ? 0.45 : 1,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        transition: 'border-color 0.15s, color 0.15s',
        flexShrink: 0,
      }}
    >
      {loading ? (
        <span style={{
          display: 'inline-block', width: 10, height: 10,
          border: `1.5px solid ${C.border}`, borderTopColor: C.accent,
          borderRadius: '50%', animation: 'aispin 0.6s linear infinite',
        }} />
      ) : (
        <span style={{ fontSize: 11, lineHeight: 1 }}>✦</span>
      )}
      {loading ? 'Writing...' : label}
    </button>
  );
}
