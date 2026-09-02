import { lazy, Suspense } from 'react';
import { C, font } from '../../lib/theme';
import { PreviewDateControl } from '../PreviewDateControl';
import type { Announcement } from '../../types';

const CalendarTab = lazy(() => import('./CalendarTab').then(m => ({ default: m.CalendarTab })));

function Fallback() {
  return (
    <div style={{ padding: 40, textAlign: 'center', fontFamily: font.body, color: C.textTer, fontSize: 13 }}>
      Loading...
    </div>
  );
}

interface CalendarPageProps {
  announcements: Announcement[];
  today: string;
  onSave: (a: Omit<Announcement, 'id' | 'created_at' | 'updated_at'> & { id?: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onPreviewDateChange: (date: string) => void;
  onError: (msg: string) => void;
}

export function CalendarPage({ today, onPreviewDateChange, ...rest }: CalendarPageProps) {
  return (
    <div className="staff-comms-app" style={{ fontFamily: font.body }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <PreviewDateControl value={today} onChange={onPreviewDateChange} />
      </div>
      <Suspense fallback={<Fallback />}>
        <CalendarTab today={today} onPreviewDateChange={onPreviewDateChange} {...rest} />
      </Suspense>
    </div>
  );
}
