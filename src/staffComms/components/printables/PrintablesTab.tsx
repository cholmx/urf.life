import { useState, lazy, Suspense } from 'react';
import { C, font } from '../../lib/theme';
import { PRINTABLES_TABS } from '../../lib/constants';
import { btnGhost } from '../ui/inputs';
import type { Announcement, PrintablesTab as PrintablesTabKey } from '../../types';

const MonthlyTab = lazy(() => import('../monthly/MonthlyTab').then(m => ({ default: m.MonthlyTab })));
const WeeklyTab  = lazy(() => import('../weekly/WeeklyTab').then(m => ({ default: m.WeeklyTab })));

function SubFallback() {
  return (
    <div style={{ padding: 40, textAlign: 'center', fontFamily: font.body, color: C.textTer, fontSize: 13 }}>
      Loading...
    </div>
  );
}

interface PrintablesTabProps {
  announcements: Announcement[];
  today: string;
}

export function PrintablesTab({ announcements, today }: PrintablesTabProps) {
  const [sub, setSub] = useState<PrintablesTabKey>('weekly');

  return (
    <div>
      <div style={{
        display: 'flex',
        gap: 0,
        marginBottom: 24,
        borderBottom: `1px solid ${C.border}`,
        overflowX: 'auto',
        scrollbarWidth: 'none',
      }}>
        {PRINTABLES_TABS.map(t => {
          const isActive = sub === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setSub(t.key as PrintablesTabKey)}
              style={{
                ...btnGhost,
                fontSize: 11,
                padding: '8px 14px',
                fontWeight: isActive ? 700 : 500,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: isActive ? C.accent : C.textMuted,
                borderBottom: isActive ? `2px solid ${C.accent}` : '2px solid transparent',
                borderRadius: 0,
                border: 'none',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                transition: 'color 0.15s, border-color 0.15s',
                background: 'transparent',
                cursor: 'pointer',
                outline: 'none',
              }}
              onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = C.textSec; }}
              onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = C.textMuted; }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <Suspense fallback={<SubFallback />}>
        {sub === 'weekly' && <WeeklyTab announcements={announcements} today={today} />}
        {sub === 'monthly' && <MonthlyTab announcements={announcements} today={today} />}
      </Suspense>
    </div>
  );
}
