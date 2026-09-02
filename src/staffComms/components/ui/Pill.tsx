import { C, font, scopeChipColors } from '../../lib/theme';

interface PillProps {
  children: React.ReactNode;
  color?: string;
  bg?: string;
  border?: string;
}

export function Pill({ children, color = C.textTer, bg = C.cardAlt, border }: PillProps) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      fontSize: 10,
      fontWeight: 600,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      padding: '2px 7px',
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

export function ScopePill({ scope }: { scope: string }) {
  const colors = scopeChipColors[scope] || scopeChipColors.informational;
  const labels: Record<string, string> = {
    whole_church: 'Whole Church',
    ministry: 'Ministry',
    informational: 'Info',
  };
  return (
    <Pill color={colors.text} bg={colors.bg} border={colors.border}>
      {labels[scope] ?? scope}
    </Pill>
  );
}
