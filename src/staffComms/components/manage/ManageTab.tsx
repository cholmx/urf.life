import { useState, useMemo, useEffect } from 'react';
import { C, font, scopeChipColors, happeningTypeChipColors, recurringChipColor } from '../../lib/theme';
import { btnPrimary, btnGhost } from '../ui/inputs';
import { AnnouncementCard } from './AnnouncementCard';
import { AnnouncementForm } from './AnnouncementForm';
import { isSlideActive, isFlyerTextStale } from '../../lib/helpers';
import { HAPPENING_TYPE_OPTIONS, SCOPE_OPTIONS } from '../../lib/constants';
import { supabase } from '../../lib/supabase';
import type { Announcement, DestinationKey } from '../../types';

interface ManageTabProps {
  announcements: Announcement[];
  today: string;
  onSave: (a: Omit<Announcement, 'id' | 'created_at' | 'updated_at'> & { id?: string }) => Promise<Announcement | null>;
  onDelete: (id: string) => Promise<void>;
  onTogglePublish: (a: Announcement) => Promise<void>;
  onToggleDestination: (a: Announcement, key: DestinationKey) => Promise<void>;
  editing: Announcement | 'new' | null;
  setEditing: (v: Announcement | 'new' | null) => void;
  copySource: Omit<Announcement, 'id' | 'created_at' | 'updated_at'> | null;
  setCopySource: (v: Omit<Announcement, 'id' | 'created_at' | 'updated_at'> | null) => void;
  loading: boolean;
  onError: (msg: string) => void;
  onOpenSignupSheet?: (a: { id: string; title: string; event_date: string | null }) => void;
  onNavigateTab?: (tab: string) => void;
}

export function ManageTab({ announcements, today, onSave, onDelete, onTogglePublish, onToggleDestination, editing, setEditing, copySource, setCopySource, loading, onError, onOpenSignupSheet, onNavigateTab }: ManageTabProps) {
  const [search, setSearch] = useState('');
  const [justSaved, setJustSaved] = useState<Announcement | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [scopeFilter, setScopeFilter] = useState<string | null>(null);
  const [recurringOnly, setRecurringOnly] = useState(false);
  const [unpublishedOnly, setUnpublishedOnly] = useState(false);
  const [staleOnly, setStaleOnly] = useState(false);
  const [pendingRentals, setPendingRentals] = useState<number | null>(null);

  // Independent of the announcements fetch above (rentals live in the
  // older admin system's own table, with no shared data layer) - just a
  // lightweight count so the dashboard can flag them without pulling in
  // that whole admin page.
  useEffect(() => {
    supabase
      .from('facility_rental_requests_portal123')
      .select('id', { count: 'exact', head: true })
      .eq('archived', false)
      .then(({ count, error }) => {
        if (!error && count !== null) setPendingRentals(count);
      });
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return announcements.filter(a => {
      if (typeFilter && a.happening_type !== typeFilter) return false;
      if (scopeFilter && a.scope !== scopeFilter) return false;
      if (recurringOnly && !a.is_recurring) return false;
      if (unpublishedOnly && a.is_published) return false;
      if (staleOnly && !isFlyerTextStale(a, today)) return false;
      if (!q) return true;
      return (
        a.title.toLowerCase().includes(q) ||
        (a.flyer_text || '').toLowerCase().includes(q) ||
        (a.description || '').toLowerCase().includes(q) ||
        (a.assigned_to || '').toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
      );
    });
  }, [announcements, search, typeFilter, scopeFilter, recurringOnly, unpublishedOnly, staleOnly, today]);

  const anyFilterActive = !!typeFilter || !!scopeFilter || recurringOnly || unpublishedOnly || staleOnly;

  const unpublishedCount = useMemo(() => announcements.filter(a => !a.is_published).length, [announcements]);
  const staleCount = useMemo(() => announcements.filter(a => isFlyerTextStale(a, today)).length, [announcements, today]);

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
          <DashboardStat
            label="Slides Due"
            value={slidesPending.length}
            accent={slidesPending.length > 0 ? '#B45309' : '#15803D'}
            sub={slidesPending.length > 0 ? 'Need making' : 'All caught up'}
            onClick={() => onNavigateTab?.('slideMaker')}
          />
          <DashboardStat
            label="Unpublished"
            value={unpublishedCount}
            accent={unpublishedCount > 0 ? '#B45309' : '#15803D'}
            sub={unpublishedCount > 0 ? 'Not live yet' : 'All published'}
            onClick={() => { setUnpublishedOnly(v => !v); setStaleOnly(false); }}
          />
          <DashboardStat
            label="Stale Descriptions"
            value={staleCount}
            accent={staleCount > 0 ? '#B45309' : '#15803D'}
            sub={staleCount > 0 ? 'Written for a past date' : 'All up to date'}
            onClick={() => { setStaleOnly(v => !v); setUnpublishedOnly(false); }}
          />
          <DashboardStat
            label="Rental Requests"
            value={pendingRentals ?? 0}
            accent={(pendingRentals ?? 0) > 0 ? '#B45309' : '#15803D'}
            sub={pendingRentals === null ? 'Loading...' : pendingRentals > 0 ? 'Awaiting review' : 'All handled'}
            onClick={() => onNavigateTab?.('rentals')}
          />
        </div>
      )}

      {/* Search bar */}
      {!loading && announcements.length > 0 && (
        <div style={{ marginBottom: 10 }}>
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

      {/* Filter chips */}
      {!loading && announcements.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
          {HAPPENING_TYPE_OPTIONS.map(opt => (
            <FilterChip
              key={opt.value}
              label={opt.label}
              active={typeFilter === opt.value}
              colors={happeningTypeChipColors[opt.value]}
              onClick={() => setTypeFilter(v => v === opt.value ? null : opt.value)}
            />
          ))}
          <span style={{ width: 1, height: 16, background: C.border, margin: '0 2px' }} />
          {SCOPE_OPTIONS.map(opt => (
            <FilterChip
              key={opt.value}
              label={opt.label}
              active={scopeFilter === opt.value}
              colors={scopeChipColors[opt.value]}
              onClick={() => setScopeFilter(v => v === opt.value ? null : opt.value)}
            />
          ))}
          <span style={{ width: 1, height: 16, background: C.border, margin: '0 2px' }} />
          <FilterChip
            label="Recurring"
            active={recurringOnly}
            colors={recurringChipColor}
            onClick={() => setRecurringOnly(v => !v)}
          />
          {anyFilterActive && (
            <button
              onClick={() => { setTypeFilter(null); setScopeFilter(null); setRecurringOnly(false); setUnpublishedOnly(false); setStaleOnly(false); }}
              style={{
                fontFamily: font.display, fontSize: 10, fontWeight: 700, color: C.textMuted,
                background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', letterSpacing: '0.03em', textTransform: 'uppercase',
              }}
            >
              Clear filters
            </button>
          )}
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
          No announcements match your search{anyFilterActive ? ' and filters' : ''}.
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
            onToggleDestination={onToggleDestination}
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

// Toggleable chip for the type/scope/recurring filter row - unselected
// chips stay neutral outline so the active ones (using the same colors
// as the badges on each card) are what draws the eye.
function FilterChip({ label, active, colors, onClick }: {
  label: string;
  active: boolean;
  colors: { bg: string; text: string; border: string };
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        fontFamily: font.display, fontSize: 11, fontWeight: 700, letterSpacing: '0.02em',
        padding: '4px 10px', borderRadius: 999, cursor: 'pointer',
        color: active ? colors.text : C.textMuted,
        background: active ? colors.bg : C.card,
        border: `1px solid ${active ? colors.border : C.border}`,
        transition: 'all 0.15s',
      }}
    >
      {label}
    </button>
  );
}

function DashboardStat({ label, value, accent, sub, onClick }: { label: string; value: number; accent: string; sub: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: '1 1 120px',
        minWidth: 120,
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 8,
        padding: '12px 14px',
        textAlign: 'left',
        fontFamily: 'inherit',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color 0.15s',
      }}
    >
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
    </button>
  );
}
