import { useState, lazy, Suspense } from 'react';
import { C, font } from '../../lib/theme';
import { OUTPUT_TABS } from '../../lib/constants';
import { btnGhost } from '../ui/inputs';
import type { Announcement, OutputTab } from '../../types';

const StageTab      = lazy(() => import('../stage/StageTab').then(m => ({ default: m.StageTab })));
const SlidesTab     = lazy(() => import('../slides/SlidesTab').then(m => ({ default: m.SlidesTab })));
const HappeningsTab = lazy(() => import('../happenings/HappeningsTab').then(m => ({ default: m.HappeningsTab })));
const MonthlyTab    = lazy(() => import('../monthly/MonthlyTab').then(m => ({ default: m.MonthlyTab })));
const WeeklyTab     = lazy(() => import('../weekly/WeeklyTab').then(m => ({ default: m.WeeklyTab })));

function SubFallback() {
  return (
    <div style={{ padding: 40, textAlign: 'center', fontFamily: font.body, color: C.textTer, fontSize: 13 }}>
      Loading...
    </div>
  );
}

interface OutputsTabProps {
  announcements: Announcement[];
  today: string;
  onToggleSlideMade: (id: string, value: boolean) => Promise<void>;
  onError: (msg: string) => void;
}

export function OutputsTab({ announcements, today, onToggleSlideMade, onError }: OutputsTabProps) {
  const [sub, setSub] = useState<OutputTab>('stage');

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
        {OUTPUT_TABS.map(t => {
          const isActive = sub === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setSub(t.key as OutputTab)}
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
        {sub === 'stage' && <StageTab announcements={announcements} today={today} onError={onError} />}
        {sub === 'slides' && <SlidesTab announcements={announcements} today={today} onToggleSlideMade={onToggleSlideMade} />}
        {sub === 'happenings' && <HappeningsTab announcements={announcements} today={today} />}
        {sub === 'monthly' && <MonthlyTab announcements={announcements} today={today} />}
        {sub === 'weekly' && <WeeklyTab announcements={announcements} today={today} />}
      </Suspense>
    </div>
  );
}
