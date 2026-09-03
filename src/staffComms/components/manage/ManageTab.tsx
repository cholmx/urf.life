import { useState, useMemo } from 'react';
import { C, font } from '../../lib/theme';
import { btnPrimary, btnGhost } from '../ui/inputs';
import { AnnouncementCard } from './AnnouncementCard';
import { AnnouncementForm } from './AnnouncementForm';
import { isSlideActive } from '../../lib/helpers';
import type { Announcement } from '../../types';

interface ManageTabProps {
  announcements: Announcement[];
  today: string;
  onSave: (a: Omit<Announcement, 'id' | 'created_at' | 'updated_at'> & { id?: string }) => Promise<Announcement | null>;
  onDelete: (id: string) => Promise<void>;
  onTogglePublish: (a: Announcement) => Promise<void>;
  editing: Announcement | 'new' | null;
  setEditing: (v: Announcement | 'new' | null) => void;
  copySource: Omit<Announcement, 'id' | 'created_at' | 'updated_at'> | null;
  setCopySource: (v: Omit<Announcement, 'id' | 'created_at' | 'updated_at'> | null) => void;
  loading: boolean;
  onError: (msg: string) => void;
  onOpenSignupSheet?: (a: { id: string; title: string; event_date: string | null }) => void;
  onNavigateTab?: (tab: string) => void;
}

export function ManageTab({ announcements, today, onSave, onDelete, onTogglePublish, editing, setEditing, copySource, setCopySource, loading, onError, onOpenSignupSheet, onNavigateTab }: ManageTabProps) {
  const [search, setSearch] = useState('');
  const [justSaved, setJustSaved] = useState<Announcement | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return announcements;
    return announcements.filter(a =>
      a.title.toLowerCase().includes(q) ||
      (a.body || '').toLowerCase().includes(q) ||
      (a.description || '').toLowerCase().includes(q) ||
      (a.assigned_to || '').toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q)
    );
  }, [announcements, search]);

  const slidesPending = useMemo(
    () => announcements.filter(a => isSlideActive(a, today) && !a.slide_made),
    [announcements, today],
  );

  if (editing) {
    return (
      <AnnouncementForm
        announcement={editing === 'new' ? null : editing}
        initialOverrides={editing === 'new' && copySource ? copySource : undefined}
        onSave={async (f) => {
          const saved = await onSave(f);
          setEditing(null);
          setCopySource(null);
          if (saved && (saved.show_on_slides || saved.show_in_happenings || saved.signup_mode === 'sheet')) {
            setJustSaved(saved);
          }
        }}
        onCancel={() => { setEditing(null); setCopySource(null); }}
        onError={onError}
        onOpenSignupSheet={onOpenSignupSheet}
      />
    );
  }

  return (
    <div>
      {justSaved && (
        <SavedNextSteps
          saved={justSaved}
          onNavigateTab={onNavigateTab}
          onOpenSignupSheet={onOpenSignupSheet}
          onDismiss={() => setJustSaved(null)}
        />
      )}

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
        </div>
      )}

      {/* Search bar */}
      {!loading && announcements.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <input
            type="text"
            placeholder="Search by title, text, assignee, category..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '7px 12px',
              border: `1px solid ${C.border}`,
              borderRadius: 6,
              fontFamily: font.body,
              fontSize: 13,
              color: C.text,
              background: C.card,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
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
            onTogglePublish={onTogglePublish}
          />
        ))}
      </div>
    </div>
  );
}

// Shown right after saving something with a destination toggled on, so
// staff don't have to remember on their own that a slide, the weekly
// script, or a sign-up sheet still needs attention elsewhere in the app.
function SavedNextSteps({ saved, onNavigateTab, onOpenSignupSheet, onDismiss }: {
  saved: Announcement;
  onNavigateTab?: (tab: string) => void;
  onOpenSignupSheet?: (a: { id: string; title: string; event_date: string | null }) => void;
  onDismiss: () => void;
}) {
  const steps: { label: string; onClick: () => void }[] = [];
  if (saved.show_on_slides && !saved.slide_made) {
    steps.push({ label: 'Make its slide →', onClick: () => onNavigateTab?.('slideMaker') });
  }
  if (saved.show_in_happenings) {
    steps.push({ label: 'Update this week\'s Happenings →', onClick: () => onNavigateTab?.('happenings') });
  }
  if (saved.signup_mode === 'sheet' && onOpenSignupSheet) {
    steps.push({
      label: saved.signup_sheet_config ? 'Edit its sign-up sheet →' : 'Create its sign-up sheet →',
      onClick: () => onOpenSignupSheet({ id: saved.id, title: saved.title, event_date: saved.event_date }),
    });
  }

  if (steps.length === 0) return null;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10,
      background: C.accentBg, border: `1px solid ${C.accent}33`, borderRadius: 8,
      padding: '12px 16px', marginBottom: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: font.display, fontSize: 12, fontWeight: 800, color: C.accent }}>
          "{saved.title}" saved.
        </span>
        {steps.map(s => (
          <button
            key={s.label}
            onClick={s.onClick}
            style={{ ...btnGhost, fontSize: 12, padding: '5px 12px', borderColor: C.accent + '55', color: C.accent }}
          >
            {s.label}
          </button>
        ))}
      </div>
      <button
        onClick={onDismiss}
        style={{ background: 'none', border: 'none', color: C.textMuted, fontFamily: font.body, fontSize: 12, cursor: 'pointer', padding: 4 }}
      >
        Dismiss
      </button>
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
