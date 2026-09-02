import { lazy, Suspense } from 'react';
import { C, font } from '../../lib/theme';
import { PreviewDateControl } from '../PreviewDateControl';
import type { Announcement } from '../../types';

const ManageTab = lazy(() => import('./ManageTab').then(m => ({ default: m.ManageTab })));

function Fallback() {
  return (
    <div style={{ padding: 40, textAlign: 'center', fontFamily: font.body, color: C.textTer, fontSize: 13 }}>
      Loading...
    </div>
  );
}

interface ManagePageProps {
  announcements: Announcement[];
  today: string;
  onPreviewDateChange: (date: string) => void;
  onSave: (a: Omit<Announcement, 'id' | 'created_at' | 'updated_at'> & { id?: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onApprove: (id: string) => Promise<void>;
  onTogglePublish: (a: Announcement) => Promise<void>;
  editing: Announcement | 'new' | null;
  setEditing: (v: Announcement | 'new' | null) => void;
  copySource: Omit<Announcement, 'id' | 'created_at' | 'updated_at'> | null;
  setCopySource: (v: Omit<Announcement, 'id' | 'created_at' | 'updated_at'> | null) => void;
  loading: boolean;
  onError: (msg: string) => void;
  onOpenSignupSheet?: (a: { id: string; title: string; event_date: string | null }) => void;
}

export function ManagePage({ today, onPreviewDateChange, ...rest }: ManagePageProps) {
  return (
    <div className="staff-comms-app" style={{ fontFamily: font.body }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <PreviewDateControl value={today} onChange={onPreviewDateChange} />
      </div>
      <Suspense fallback={<Fallback />}>
        <ManageTab today={today} {...rest} />
      </Suspense>
    </div>
  );
}
