import { lazy, Suspense } from 'react';
import { C, font } from '../../lib/theme';
import { PreviewDateControl } from '../PreviewDateControl';
import type { Announcement } from '../../types';

const PrintablesTab = lazy(() => import('./PrintablesTab').then(m => ({ default: m.PrintablesTab })));

function Fallback() {
  return (
    <div style={{ padding: 40, textAlign: 'center', fontFamily: font.body, color: C.textTer, fontSize: 13 }}>
      Loading...
    </div>
  );
}

interface PrintablesPageProps {
  announcements: Announcement[];
  today: string;
  onPreviewDateChange: (date: string) => void;
}

export function PrintablesPage({ today, onPreviewDateChange, ...rest }: PrintablesPageProps) {
  return (
    <div className="staff-comms-app" style={{ fontFamily: font.body }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <PreviewDateControl value={today} onChange={onPreviewDateChange} />
      </div>
      <Suspense fallback={<Fallback />}>
        <PrintablesTab today={today} {...rest} />
      </Suspense>
    </div>
  );
}
