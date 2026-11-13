import { C, font, scopeChipColors, happeningTypeChipColors } from '../../lib/theme';

interface PillProps {
  children: React.ReactNode;
  color?: string;
  bg?: string;
  border?: string;
  // 'sm' (the original size) stays the default for every existing call
  // site (Archive, the Calendar day panel) - 'md' exists only for the
  // Dashboard's announcement list, which needed bigger text/padding
  // without resizing this shared component everywhere else it's used.
  size?: 'sm' | 'md';
}

const SIZES = {
  sm: { fontSize: 10, padding: '2px 7px' },
  md: { fontSize: 12, padding: '4px 10px' },
};

export function Pill({ children, color = C.textTer, bg = C.cardAlt, border, size = 'sm' }: PillProps) {
  const { fontSize, padding } = SIZES[size];
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      fontSize,
      fontWeight: 600,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      padding,
      borderRadius: 4,
      background: bg,
      color,
      fontFamily: font.display,
      border: border ? `1px solid ${border}` : `1px solid transparent`,
      lineHeight: 1.4,
    }}>
      {children}
    </span>
  );
}

export function ScopePill({ scope, size }: { scope: string; size?: 'sm' | 'md' }) {
  const colors = scopeChipColors[scope] || scopeChipColors.informational;
  const labels: Record<string, string> = {
    whole_church: 'Whole Church',
    ministry: 'Ministry',
    informational: 'Info',
  };
  return (
    <Pill color={colors.text} bg={colors.bg} border={colors.border} size={size}>
      {labels[scope] ?? scope}
    </Pill>
  );
}

export function HappeningTypePill({ type, size }: { type: string; size?: 'sm' | 'md' }) {
  const colors = happeningTypeChipColors[type] || happeningTypeChipColors.announcement;
  const labels: Record<string, string> = {
    announcement: 'Announcement',
    event: 'Event',
    class: 'Class',
    general: 'General',
  };
  return (
    <Pill color={colors.text} bg={colors.bg} border={colors.border} size={size}>
      {labels[type] ?? type}
    </Pill>
  );
}
