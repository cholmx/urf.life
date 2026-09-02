import { useState, useMemo } from 'react';
import { C, font } from '../../lib/theme';
import { btnPrimary, btnGhost } from '../ui/inputs';
import { AnnouncementCard } from './AnnouncementCard';
import { AnnouncementForm } from './AnnouncementForm';
import { isSlideActive } from '../../lib/helpers';
import type { Announcement } from '../../types';

const STATUS_FILTERS = [
  { value: 'all',      label: 'All' },
  { value: 'draft',    label: 'Drafts' },
  { value: 'approved', label: 'Approved' },
] as const;

type StatusFilter = typeof STATUS_FILTERS[number]['value'];

interface ManageTabProps {
  announcements: Announcement[];
  today: string;
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

export function ManageTab({ announcements, today, onSave, onDelete, onApprove, onTogglePublish, editing, setEditing, copySource, setCopySource, loading, onError, onOpenSignupSheet }: ManageTabProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return announcements.filter(a => {
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      if (!q) return true;
      return (
        a.title.toLowerCase().includes(q) ||
        (a.body || '').toLowerCase().includes(q) ||
        (a.description || '').toLowerCase().includes(q) ||
        (a.assigned_to || '').toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
      );
    });
  }, [announcements, search, statusFilter]);

  const slidesPending = useMemo(
    () => announcements.filter(a => isSlideActive(a, today) && !a.slide_made),
    [announcements, today],
  );
  const draftCount = announcements.filter(a => a.status === 'draft').length;
  const approvedCount = announcements.filter(a => a.status === 'approved').length;

  if (editing) {
    return (
      <AnnouncementForm
        announcement={editing === 'new' ? null : editing}
        initialOverrides={editing === 'new' && copySource ? copySource : undefined}
        onSave={async (f) => { await onSave(f); setEditing(null); setCopySource(null); }}
        onCancel={() => { setEditing(null); setCopySource(null); }}
        onError={onError}
        onOpenSignupSheet={onOpenSignupSheet}
      />
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontFamily: font.display, fontSize: 18, fontWeight: 800, color: C.text, margin: 0, letterSpacing: '-0.02em' }}>
            Announcements
          </h2>
          <p style={{ fontFamily: font.mono, fontSize: 11, color: C.textMuted, margin: '2px 0 0', letterSpacing: '0.03em' }}>
            {loading ? 'loading...' : `${announcements.length} active`}
          </p>
        </div>
        <button
          onClick={() => setEditing('new')}
          style={{ ...btnPrimary, display: 'flex', alignItems: 'center', gap: 6 }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = C.accentHover}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = C.accent}
        >
          <span style={{ fontSize: 15, lineHeight: 1, marginTop: -1 }}>+</span>
          New
        </button>
      </div>

      {/* Weekly status dashboard */}
      {!loading && announcements.length > 0 && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          <DashboardStat label="Slides Due" value={slidesPending.length} accent={slidesPending.length > 0 ? '#B45309' : '#15803D'} sub={slidesPending.length > 0 ? 'Need making' : 'All caught up'} />
          <DashboardStat label="Drafts" value={draftCount} accent="#64748B" sub="In progress" />
          <DashboardStat label="Approved" value={approvedCount} accent="#15803D" sub="Cleared for use" />
        </div>
      )}

      {/* Search and filter bar */}
      {!loading && announcements.length > 0 && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search by title, text, assignee, category..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: '1 1 220px',
              minWidth: 180,
              padding: '7px 12px',
              border: `1px solid ${C.border}`,
              borderRadius: 6,
              fontFamily: font.body,
              fontSize: 13,
              color: C.text,
              background: C.card,
              outline: 'none',
            }}
          />
          <div style={{ display: 'flex', gap: 4 }}>
            {STATUS_FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                style={{
                  ...btnGhost,
                  fontSize: 11,
                  padding: '6px 12px',
                  fontWeight: 600,
                  letterSpacing: '0.03em',
                  textTransform: 'uppercase',
                  ...(statusFilter === f.value ? { background: C.accent, color: '#fff', borderColor: C.accent } : {}),
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {!loading && announcements.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '64px 24px',
          border: `1.5px dashed ${C.border}`,
          borderRadius: 10,
          background: C.card,
        }}>
          <div style={{ fontFamily: font.display, fontSize: 13, fontWeight: 800, color: C.textTer, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            No announcements
          </div>
          <div style={{ fontFamily: font.body, fontSize: 13, color: C.textMuted }}>
            Click "New" to add your first announcement.
          </div>
        </div>
      )}

      {!loading && filtered.length === 0 && announcements.length > 0 && (
        <div style={{ textAlign: 'center', padding: '48px 24px', color: C.textMuted, fontFamily: font.body, fontSize: 13 }}>
          No announcements match your search.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {filtered.map(a => (
          <AnnouncementCard
            key={a.id}
            a={a}
            today={today}
            onEdit={() => setEditing(a)}
            onDelete={onDelete}
            onApprove={onApprove}
            onTogglePublish={onTogglePublish}
          />
        ))}
      </div>
    </div>
  );
}

function DashboardStat({ label, value, accent, sub }: { label: string; value: number; accent: string; sub: string }) {
  return (
    <div style={{
      flex: '1 1 120px',
      minWidth: 120,
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: 8,
      padding: '12px 14px',
    }}>
      <div style={{ fontFamily: font.mono, fontSize: 10, color: C.textMuted, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontFamily: font.display, fontSize: 24, fontWeight: 900, color: accent, lineHeight: 1 }}>
          {value}
        </span>
        <span style={{ fontFamily: font.body, fontSize: 11, color: C.textTer }}>
          {sub}
        </span>
      </div>
    </div>
  );
}
