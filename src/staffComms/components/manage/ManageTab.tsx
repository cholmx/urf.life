import { useState, useMemo, useEffect } from 'react';
import { Image, EyeOff, Clock, Key, Search } from 'lucide-react';
import { C, font, scopeChipColors, happeningTypeChipColors, recurringChipColor } from '../../lib/theme';
import { colors } from '../../../styles/designTokens.js';
import { btnPrimary, btnGhost } from '../ui/inputs';
import { AnnouncementCard } from './AnnouncementCard';
import { AnnouncementForm } from './AnnouncementForm';
import { isSlideActive, isFlyerTextStale } from '../../lib/helpers';
import { getNextOccurrenceDate } from '../../lib/calendar-grid';
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
    const matches = announcements.filter(a => {
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

    // Soonest-upcoming first, not newest-entered first - the fetch's own
    // order (created_at desc) is about when staff happened to type each
    // one in, which has nothing to do with what's actually coming up next.
    // Anything with no resolvable date (a recurring item past its last
    // occurrence, or one that's never had a date at all) sorts after
    // every dated item, keeping its original relative order among itself.
    return [...matches].sort((a, b) => {
      const dateA = getNextOccurrenceDate(a, today);
      const dateB = getNextOccurrenceDate(b, today);
      if (dateA && dateB) return dateA < dateB ? -1 : dateA > dateB ? 1 : 0;
      if (dateA) return -1;
      if (dateB) return 1;
      return 0;
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
        today={today}
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
        <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
          <DashboardStat
            icon={Image}
            label="Slides Due"
            value={slidesPending.length}
            accent={slidesPending.length > 0 ? colors.gold : colors.primary}
            sub={slidesPending.length > 0 ? 'Need making' : 'All caught up'}
            onClick={() => onNavigateTab?.('slideMaker')}
          />
          <DashboardStat
            icon={EyeOff}
            label="Unpublished"
            value={unpublishedCount}
            accent={unpublishedCount > 0 ? colors.gold : colors.primary}
            sub={unpublishedCount > 0 ? 'Not live yet' : 'All published'}
            onClick={() => { setUnpublishedOnly(v => !v); setStaleOnly(false); }}
          />
          <DashboardStat
            icon={Clock}
            label="Stale Descriptions"
            value={staleCount}
            accent={staleCount > 0 ? colors.gold : colors.primary}
            sub={staleCount > 0 ? 'Written for a past date' : 'All up to date'}
            onClick={() => { setStaleOnly(v => !v); setUnpublishedOnly(false); }}
          />
          <DashboardStat
            icon={Key}
            label="Rental Requests"
            value={pendingRentals ?? 0}
            accent={(pendingRentals ?? 0) > 0 ? colors.gold : colors.primary}
            sub={pendingRentals === null ? 'Loading...' : pendingRentals > 0 ? 'Awaiting review' : 'All handled'}
            onClick={() => onNavigateTab?.('rentals')}
          />
        </div>
      )}

      {/* Search + filters - one grouped card instead of loose controls
          floating on the page, with a small label over each filter
          cluster so it's clear at a glance what each group of chips means. */}
      {!loading && announcements.length > 0 && (
        <div style={{
          background: C.card,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06), 0 8px 20px -4px rgba(0,0,0,0.07)',
          borderRadius: 16,
          padding: '14px 16px',
          marginBottom: 20,
        }}>
          <div style={{ position: 'relative', marginBottom: 14 }}>
            <Search size={14} color={C.textMuted} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Search by title, text, assignee, category..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 32px',
                border: `1px solid ${C.border}33`,
                borderRadius: 8,
                fontFamily: font.body,
                fontSize: 13,
                color: C.text,
                background: C.bgSubtle,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18, flexWrap: 'wrap' }}>
            <FilterGroup label="Type">
              {HAPPENING_TYPE_OPTIONS.map(opt => (
                <FilterChip
                  key={opt.value}
                  label={opt.label}
                  active={typeFilter === opt.value}
                  colors={happeningTypeChipColors[opt.value]}
                  onClick={() => setTypeFilter(v => v === opt.value ? null : opt.value)}
                />
              ))}
            </FilterGroup>
            <FilterGroup label="Scope">
              {SCOPE_OPTIONS.map(opt => (
                <FilterChip
                  key={opt.value}
                  label={opt.label}
                  active={scopeFilter === opt.value}
                  colors={scopeChipColors[opt.value]}
                  onClick={() => setScopeFilter(v => v === opt.value ? null : opt.value)}
                />
              ))}
            </FilterGroup>
            <FilterGroup label="Schedule">
              <FilterChip
                label="Recurring"
                active={recurringOnly}
                colors={recurringChipColor}
                onClick={() => setRecurringOnly(v => !v)}
              />
            </FilterGroup>
            {anyFilterActive && (
              <button
                onClick={() => { setTypeFilter(null); setScopeFilter(null); setRecurringOnly(false); setUnpublishedOnly(false); setStaleOnly(false); }}
                style={{
                  fontFamily: font.display, fontSize: 10, fontWeight: 700, color: C.textMuted,
                  background: 'none', border: 'none', cursor: 'pointer', padding: '18px 6px 4px', letterSpacing: '0.03em', textTransform: 'uppercase',
                  marginLeft: 'auto',
                }}
              >
                Clear filters
              </button>
            )}
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

// One labeled cluster within the filter card (Type / Scope / Schedule) -
// the label makes each group of chips self-explanatory instead of relying
// on a bare divider line to imply "these are a different kind of filter".
function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontFamily: font.mono, fontSize: 9, fontWeight: 700, color: C.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {children}
      </div>
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

function DashboardStat({ icon: Icon, label, value, accent, sub, onClick }: { icon: React.ComponentType<{ size?: number; color?: string }>; label: string; value: number; accent: string; sub: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: '1 1 150px',
        minWidth: 150,
        background: C.card,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06), 0 8px 20px -4px rgba(0,0,0,0.07)',
        borderRadius: 14,
        borderLeft: `4px solid ${accent}`,
        padding: '12px 16px',
        textAlign: 'left',
        fontFamily: 'inherit',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow 0.15s, transform 0.15s',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.08), 0 16px 32px -8px rgba(0,0,0,0.10)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.06), 0 8px 20px -4px rgba(0,0,0,0.07)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <Icon size={13} color={accent} />
        <span style={{ fontFamily: font.mono, fontSize: 10, color: C.textMuted, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          {label}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontFamily: font.display, fontSize: 26, fontWeight: 900, color: accent, lineHeight: 1 }}>
          {value}
        </span>
        <span style={{ fontFamily: font.body, fontSize: 11, color: C.textTer }}>
          {sub}
        </span>
      </div>
    </button>
  );
}
