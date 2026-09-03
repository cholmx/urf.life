import { C, font } from '../lib/theme';

interface PreviewDateControlProps {
  value: string;
  onChange: (value: string) => void;
}

// Lets staff preview happenings/calendar/outputs as of a date other than
// today (e.g. to check what a future week's Happenings script will look
// like). Shared across the Manage, Calendar, and Outputs pages since they
// all key off the same "today" value from useHappeningsData.
export function PreviewDateControl({ value, onChange }: PreviewDateControlProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontFamily: font.mono, fontSize: 10, color: C.textMuted, letterSpacing: '0.05em' }}>preview</span>
      <input
        type="date"
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          padding: '5px 7px',
          border: `1px solid ${C.border}`,
          borderRadius: 5,
          fontFamily: font.mono,
          fontSize: 11,
          fontWeight: 500,
          color: C.textSec,
          background: C.card,
          outline: 'none',
          colorScheme: 'light',
          cursor: 'pointer',
          maxWidth: 130,
        }}
      />
    </div>
  );
}
