import { useState } from 'react';
import { ChevronDown, ChevronUp, Search, X, CopyPlus } from 'lucide-react';
import { C, font } from '../../lib/theme';
import { ScopePill } from '../ui/Pill';
import { formatDateNice } from '../../lib/helpers';
import type { Announcement } from '../../types';

interface ArchiveTabProps {
  announcements: Announcement[];
  onDelete: (id: string) => Promise<void>;
  onCopy: (a: Announcement) => void;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontFamily: font.mono, fontSize: 9, color: C.textMuted, letterSpacing: '0.07em', textTransform: 'uppercase' }}>{label}</span>
      <span style={{ fontFamily: font.body, fontSize: 13, color: C.textSec, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{value}</span>
    </div>
  );
}

function ArchiveCard({ a, onDelete, onCopy }: { a: Announcement; onDelete: (id: string) => Promise<void>; onCopy: (a: Announcement) => void }) {
  const [confirming, setConfirming] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const lastDate = (() => {
    const dates: string[] = [];
    if (a.event_date) dates.push(a.event_date);
    if (a.event_dates?.length) dates.push(...a.event_dates);
    if (a.happenings_end_date) dates.push(a.happenings_end_date);
    return dates.sort().at(-1) ?? null;
  })();

  const allDates = (() => {
    const dates: string[] = [];
    if (a.event_date) dates.push(a.event_date);
    if (a.event_dates?.length) dates.push(...a.event_dates);
    return [...new Set(dates)].sort().map(d => formatDateNice(d)).join(', ');
  })();

  return (
    <div style={{ background: C.card, border: `1px solid ${expanded ? C.borderMed : C.border}`, borderRadius: 8, overflow: 'hidden', transition: 'border-color 0.15s' }}>
      {/* Header row */}
      <div
        onClick={() => setExpanded(v => !v)}
        style={{ padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', userSelect: 'none' }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
            <ScopePill scope={a.scope} />
            {a.ministry && (
              <span style={{
                fontFamily: font.mono,
                fontSize: 10,
                fontWeight: 600,
                color: C.success,
                background: C.successBg,
                border: `1px solid ${C.success}25`,
                borderRadius: 999,
                padding: '1px 7px',
                letterSpacing: '0.03em',
              }}>
                {a.ministry}
              </span>
            )}
            {a.category && (
              <span style={{ fontFamily: font.mono, fontSize: 10, color: C.textMuted, letterSpacing: '0.03em' }}>
                {a.category}
              </span>
            )}
            {lastDate && (
              <span style={{ fontFamily: font.mono, fontSize: 10, color: C.textMuted, letterSpacing: '0.02em' }}>
                · {formatDateNice(lastDate)}
              </span>
            )}
          </div>
          <div style={{ fontFamily: font.display, fontSize: 13, fontWeight: 800, color: C.text, letterSpacing: '-0.01em' }}>
            {a.title}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
          {confirming ? (
            <>
              <span style={{ fontFamily: font.mono, fontSize: 10, color: C.textMuted }}>delete?</span>
              <button
                onClick={e => { e.stopPropagation(); onDelete(a.id); setConfirming(false); }}
                style={{ fontFamily: font.display, fontSize: 10, fontWeight: 700, color: C.warn, background: C.warnBg, border: `1px solid ${C.warn}33`, borderRadius: 5, padding: '4px 10px', cursor: 'pointer', letterSpacing: '0.04em', textTransform: 'uppercase' }}
              >Yes</button>
              <button
                onClick={e => { e.stopPropagation(); setConfirming(false); }}
                style={{ fontFamily: font.display, fontSize: 10, fontWeight: 600, color: C.textSec, background: C.card, border: `1px solid ${C.border}`, borderRadius: 5, padding: '4px 10px', cursor: 'pointer', letterSpacing: '0.04em', textTransform: 'uppercase' }}
              >No</button>
            </>
          ) : (
            <>
              <button
                onClick={e => { e.stopPropagation(); onCopy(a); }}
                style={{ fontFamily: font.display, fontSize: 10, fontWeight: 600, color: C.accent, background: C.accentBg, border: `1px solid ${C.accent}33`, borderRadius: 5, padding: '4px 10px', cursor: 'pointer', letterSpacing: '0.04em', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 4 }}
              >
                <CopyPlus size={11} />
                Copy to New
              </button>
              <button
                onClick={e => { e.stopPropagation(); setConfirming(true); }}
                style={{ fontFamily: font.display, fontSize: 10, fontWeight: 600, color: C.textMuted, background: C.card, border: `1px solid ${C.border}`, borderRadius: 5, padding: '4px 10px', cursor: 'pointer', letterSpacing: '0.04em', textTransform: 'uppercase' }}
              >
                Delete
              </button>
            </>
          )}
          <span style={{ color: C.textMuted, display: 'flex', alignItems: 'center' }}>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </span>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ borderTop: `1px solid ${C.border}`, padding: '14px 14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {a.description && <DetailRow label="Description" value={a.description} />}
          {a.body && <DetailRow label="Full text" value={a.body} />}
          {a.short_version && <DetailRow label="Short version" value={a.short_version} />}
          {a.flyer_text && <DetailRow label="Flyer text" value={a.flyer_text} />}
          {a.stage_notes && <DetailRow label="Stage notes" value={a.stage_notes} />}
          {allDates && <DetailRow label="Date(s)" value={allDates} />}
          {a.event_location && <DetailRow label="Location" value={a.event_location} />}
          {(a.contact_name || a.contact_info) && (
            <DetailRow label="Contact" value={[a.contact_name, a.contact_info].filter(Boolean).join(' · ')} />
          )}
        </div>
      )}
    </div>
  );
}

export function ArchiveTab({ announcements, onDelete, onCopy }: ArchiveTabProps) {
  const [query, setQuery] = useState('');

  const sorted = [...announcements].sort((a, b) => {
    const getDate = (x: Announcement) => {
      const dates: string[] = [];
      if (x.event_date) dates.push(x.event_date);
      if (x.event_dates?.length) dates.push(...x.event_dates);
      if (x.happenings_end_date) dates.push(x.happenings_end_date);
      return dates.sort().at(-1) ?? '';
    };
    return getDate(b).localeCompare(getDate(a));
  });

  const q = query.trim().toLowerCase();
  const filtered = q
    ? sorted.filter(a =>
        [a.title, a.body, a.description, a.category, a.ministry, a.event_location, a.contact_name, a.contact_info]
          .filter(Boolean)
          .some(v => v!.toLowerCase().includes(q))
      )
    : sorted;

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: font.display, fontSize: 18, fontWeight: 800, color: C.text, margin: '0 0 4px', letterSpacing: '-0.02em' }}>
          Archive
        </h2>
        <p style={{ fontFamily: font.mono, fontSize: 11, color: C.textMuted, margin: 0, letterSpacing: '0.03em' }}>
          {announcements.length} past event{announcements.length !== 1 ? 's' : ''} · auto-archived after date passed
        </p>
      </div>

      {announcements.length > 0 && (
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.textMuted, pointerEvents: 'none' }} />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search archive by title, text, category, ministry, location..."
            style={{
              width: '100%',
              fontFamily: font.body,
              fontSize: 13,
              color: C.text,
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              padding: '9px 36px 9px 34px',
              outline: 'none',
              transition: 'border-color 0.15s',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = C.borderFocus; }}
            onBlur={e => { e.currentTarget.style.borderColor = C.border; }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted, display: 'flex', padding: 4 }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {announcements.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '64px 24px',
          color: C.textMuted,
          fontFamily: font.body,
          fontSize: 13,
          border: `1.5px dashed ${C.border}`,
          borderRadius: 10,
          background: C.card,
        }}>
          <div style={{ fontFamily: font.display, fontSize: 13, fontWeight: 800, color: C.textTer, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Nothing archived yet
          </div>
          Past events will appear here automatically.
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '48px 24px',
          color: C.textMuted,
          fontFamily: font.body,
          fontSize: 13,
          border: `1.5px dashed ${C.border}`,
          borderRadius: 10,
          background: C.card,
        }}>
          No results for "{query}"
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {filtered.map(a => (
            <ArchiveCard key={a.id} a={a} onDelete={onDelete} onCopy={onCopy} />
          ))}
        </div>
      )}
    </div>
  );
}
