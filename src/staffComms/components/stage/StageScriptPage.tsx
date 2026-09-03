import { lazy, Suspense } from 'react';
import { C, font } from '../../lib/theme';
import { PreviewDateControl } from '../PreviewDateControl';
import type { Announcement } from '../../types';

const StageTab = lazy(() => import('./StageTab').then(m => ({ default: m.StageTab })));

function Fallback() {
  return (
    <div style={{ padding: 40, textAlign: 'center', fontFamily: font.body, color: C.textTer, fontSize: 13 }}>
      Loading...
    </div>
  );
}

interface StageScriptPageProps {
  announcements: Announcement[];
  today: string;
  onPreviewDateChange: (date: string) => void;
  onError: (msg: string) => void;
}

export function StageScriptPage({ today, onPreviewDateChange, ...rest }: StageScriptPageProps) {
  return (
    <div className="staff-comms-app" style={{ fontFamily: font.body }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <PreviewDateControl value={today} onChange={onPreviewDateChange} />
      </div>
      <Suspense fallback={<Fallback />}>
        <StageTab today={today} {...rest} />
      </Suspense>
    </div>
  );
}
