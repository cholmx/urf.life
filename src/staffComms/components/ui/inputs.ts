import { C, font } from '../../lib/theme';

export const inputBase: React.CSSProperties = {
  width: '100%',
  padding: '8px 11px',
  border: `1px solid ${C.border}`,
  borderRadius: 4,
  fontFamily: font.body,
  fontSize: 13,
  color: C.text,
  background: C.card,
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s, box-shadow 0.15s',
};

export const labelBase: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.07em',
  textTransform: 'uppercase',
  color: C.textSec,
  marginBottom: 6,
  fontFamily: font.mono,
};

export const btnPrimary: React.CSSProperties = {
  padding: '8px 18px',
  border: 'none',
  borderRadius: 5,
  background: C.accent,
  color: '#fff',
  fontFamily: font.display,
  fontWeight: 700,
  fontSize: 12,
  cursor: 'pointer',
  letterSpacing: '0.03em',
  transition: 'background 0.15s',
};

export const btnGhost: React.CSSProperties = {
  padding: '8px 18px',
  border: `1px solid ${C.border}`,
  borderRadius: 5,
  background: C.card,
  color: C.textSec,
  fontFamily: font.display,
  fontWeight: 600,
  fontSize: 12,
  cursor: 'pointer',
  letterSpacing: '0.02em',
  transition: 'border-color 0.15s, color 0.15s',
};
