import { lazy, Suspense } from 'react';
import { C, font } from '../../lib/theme';
import type { Announcement } from '../../types';

const ArchiveTab = lazy(() => import('./ArchiveTab').then(m => ({ default: m.ArchiveTab })));

function Fallback() {
  return (
    <div style={{ padding: 40, textAlign: 'center', fontFamily: font.body, color: C.textTer, fontSize: 13 }}>
      Loading...
    </div>
  );
}

interface ArchivePageProps {
  announcements: Announcement[];
  onDelete: (id: string) => Promise<void>;
  onCopy: (a: Announcement) => void;
}

export function ArchivePage(props: ArchivePageProps) {
  return (
    <div className="staff-comms-app" style={{ fontFamily: font.body }}>
      <Suspense fallback={<Fallback />}>
        <ArchiveTab {...props} />
      </Suspense>
    </div>
  );
}
