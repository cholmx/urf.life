import { lazy, Suspense } from 'react';
import { C, font } from '../../lib/theme';
import { PreviewDateControl } from '../PreviewDateControl';
import type { Announcement } from '../../types';

const OutputsTab = lazy(() => import('./OutputsTab').then(m => ({ default: m.OutputsTab })));

function Fallback() {
  return (
    <div style={{ padding: 40, textAlign: 'center', fontFamily: font.body, color: C.textTer, fontSize: 13 }}>
      Loading...
    </div>
  );
}

interface OutputsPageProps {
  announcements: Announcement[];
  today: string;
  onPreviewDateChange: (date: string) => void;
  onToggleSlideMade: (id: string, value: boolean) => Promise<void>;
  onError: (msg: string) => void;
}

export function OutputsPage({ today, onPreviewDateChange, ...rest }: OutputsPageProps) {
  return (
    <div className="staff-comms-app" style={{ fontFamily: font.body }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <PreviewDateControl value={today} onChange={onPreviewDateChange} />
      </div>
      <Suspense fallback={<Fallback />}>
        <OutputsTab today={today} {...rest} />
      </Suspense>
    </div>
  );
}
