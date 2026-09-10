import { useState } from 'react';
import { C, font, scopeRangeColors } from '../../lib/theme';
import { ScopePill, Pill } from '../ui/Pill';
import { formatDateNice, weeksUntil } from '../../lib/helpers';
import { buildInviteHTMLFromAnnouncement } from './invitePrinter';
import type { Announcement, DestinationKey } from '../../types';

const DEST_LABELS: { key: DestinationKey; short: string }[] = [
  { key: 'show_on_slides' as const,     short: 'Slides' },
  { key: 'show_in_happenings' as const, short: 'Email' },
  { key: 'monthly_include' as const,    short: 'Flyer' },
  { key: 'show_in_weekly' as const,     short: 'Bulletin' },
];

// Only meaningful for Whole Church scope (isStageActive requires both) -
// shown only on those cards rather than as a fifth always-dashed entry
// that would do nothing if checked on a Ministry/Informational item.
const STAGE_DEST = { key: 'show_on_stage' as const, short: 'Stage' };

interface AnnouncementCardProps {
  a: Announcement;
  today: string;
  onEdit: (a: Announcement) => void;
  onDelete: (id: string) => void;
  onTogglePublish: (a: Announcement) => Promise<void>;
  onToggleDestination: (a: Announcement, key: DestinationKey) => Promise<void>;
}

const SIGNUP_MODE_LABELS: Record<string, string> = {
  sheet: 'Sign-up Sheet',
};

export function AnnouncementCard({ a, today, onEdit, onDelete, onTogglePublish, onToggleDestination }: AnnouncementCardProps) {
  const [hovered, setHovered] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [togglingKeys, setTogglingKeys] = useState<Set<DestinationKey>>(new Set());

  const handleToggleDestination = async (key: DestinationKey) => {
    setTogglingKeys(prev => new Set(prev).add(key));
    try {
      await onToggleDestination(a, key);
    } finally {
      setTogglingKeys(prev => { const next = new Set(prev); next.delete(key); return next; });
    }
  };

  const handleTogglePublish = async () => {
    setPublishing(true);
    try {
      await onTogglePublish(a);
    } finally {
      setPublishing(false);
    }
  };
  const wks = weeksUntil(a.event_date, today);
  const accentColor = scopeRangeColors[a.scope] || C.borderMed;

  const printInvite = () => {
    const html = buildInviteHTMLFromAnnouncement(a);
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.top = '-10000px';
    iframe.style.left = '-10000px';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow?.document;
    if (!doc) return;
    doc.open();
    doc.write(html);
    doc.close();
    setTimeout(() => {
      try { iframe.contentWindow?.focus(); iframe.contentWindow?.print(); }
      catch { /* ignore */ }
      setTimeout(() => document.body.removeChild(iframe), 1000);
    }, 800);
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setConfirmDelete(false); }}
      style={{
        background: C.card,
        border: `1px solid ${hovered ? C.borderMed : C.border}`,
        borderLeft: `3px solid ${accentColor}`,
        borderRadius: 8,
        padding: '9px 14px',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        boxShadow: hovered ? '0 2px 12px rgba(0,0,0,0.07)' : '0 1px 2px rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap', minWidth: 0 }}>
          <ScopePill scope={a.scope} />
          {a.is_recurring && <Pill>Recurring</Pill>}
          {a.is_published && (
            <span style={{
              fontFamily: font.display,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#15803D',
              background: 'rgba(22,163,74,0.12)',
              border: '1px solid rgba(22,163,74,0.35)',
              borderRadius: 4,
              padding: '2px 7px',
            }}>Published</span>
          )}
        </div>
        {a.event_date && (
          <span style={{ fontFamily: font.mono, fontSize: 11, color: C.textMuted, flexShrink: 0, letterSpacing: '0.02em' }}>
            {formatDateNice(a.event_date)}
            {wks !== null && wks > 0 && <span style={{ color: C.textMuted, opacity: 0.6 }}> · {wks}w</span>}
          </span>
        )}
        {!a.event_date && a.is_recurring && (
          <span style={{ fontFamily: font.mono, fontSize: 11, color: C.textMuted }}>recurring</span>
        )}
      </div>

      {/* Where this shows up - always all of them, checked or not, so it
          reads as a full picture rather than only the ones turned on.
          Click one to flip it right here, no need to open Edit. Stage
          only appears for Whole Church items, since it does nothing
          otherwise (isStageActive requires both). */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {(a.scope === 'whole_church' ? [...DEST_LABELS, STAGE_DEST] : DEST_LABELS).map(d => {
          const on = !!a[d.key];
          const toggling = togglingKeys.has(d.key);
          return (
            <button
              key={d.key}
              type="button"
              onClick={() => handleToggleDestination(d.key)}
              disabled={toggling}
              title={`Click to ${on ? 'remove from' : 'include in'} ${d.short}`}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                fontFamily: font.display, fontSize: 12, fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase',
                color: on ? C.accent : C.textMuted,
                opacity: toggling ? 0.5 : 1,
                background: on ? C.accentBg : C.card,
                border: `1px solid ${on ? C.accent + '55' : C.border}`,
                borderRadius: 6, padding: '4px 10px', margin: 0,
                cursor: toggling ? 'default' : 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: 13, lineHeight: 1 }}>{toggling ? '···' : (on ? '✓' : '–')}</span>
              {d.short}
            </button>
          );
        })}
      </div>

      {/* Title + preview */}
      <div>
        <h4 style={{ fontFamily: font.display, fontSize: 14, fontWeight: 800, color: C.text, margin: 0, letterSpacing: '-0.01em', lineHeight: 1.3 }}>
          {a.title}
        </h4>
        {(a.short_version || a.body) && (
          <p style={{ fontFamily: font.body, fontSize: 12, color: C.textSec, margin: '2px 0 0', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>
            {a.short_version || a.body.slice(0, 120)}
          </p>
        )}
      </div>

      {/* Bottom row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <span style={{ fontFamily: font.mono, fontSize: 10, color: C.textMuted, letterSpacing: '0.03em' }}>
            {a.category}
          </span>
          {a.assigned_to && (
            <span style={{ fontFamily: font.mono, fontSize: 10, color: C.textMuted, letterSpacing: '0.03em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              · {a.assigned_to}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {a.signup_mode && a.signup_mode !== 'none' && (
            <span
              title="Edit this happening to manage sign-ups"
              style={{ fontFamily: font.display, fontSize: 10, fontWeight: 700, color: C.textSec, letterSpacing: '0.04em', textTransform: 'uppercase', padding: '4px 10px', border: `1px solid ${C.border}`, borderRadius: 5, background: C.card }}
            >
              {SIGNUP_MODE_LABELS[a.signup_mode] || 'Sign-up'}
            </span>
          )}
          {confirmDelete ? (
            <>
              <span style={{ fontFamily: font.display, fontSize: 10, color: C.textTer, alignSelf: 'center', marginRight: 2 }}>Remove?</span>
              <button
                onClick={() => onDelete(a.id)}
                style={{ fontFamily: font.display, fontSize: 10, fontWeight: 700, color: C.warn, background: C.warnBg, border: `1px solid ${C.warn}33`, borderRadius: 5, padding: '4px 10px', cursor: 'pointer', letterSpacing: '0.04em', textTransform: 'uppercase' }}
              >Yes</button>
              <button
                onClick={() => setConfirmDelete(false)}
                style={{ fontFamily: font.display, fontSize: 10, fontWeight: 600, color: C.textSec, background: C.card, border: `1px solid ${C.border}`, borderRadius: 5, padding: '4px 10px', cursor: 'pointer', letterSpacing: '0.04em', textTransform: 'uppercase' }}
              >No</button>
            </>
          ) : (
            <>
              <button
                onClick={handleTogglePublish}
                disabled={publishing}
                title={a.is_published ? 'Remove from the public site' : 'Publish to the public site'}
                style={a.is_published
                  ? { fontFamily: font.display, fontSize: 10, fontWeight: 700, color: C.textSec, background: C.card, border: `1px solid ${C.border}`, borderRadius: 5, padding: '4px 10px', cursor: publishing ? 'default' : 'pointer', letterSpacing: '0.04em', textTransform: 'uppercase', opacity: publishing ? 0.6 : 1, transition: 'background 0.15s' }
                  : { fontFamily: font.display, fontSize: 10, fontWeight: 700, color: '#fff', background: C.accent, border: `1px solid ${C.accent}`, borderRadius: 5, padding: '4px 10px', cursor: publishing ? 'default' : 'pointer', letterSpacing: '0.04em', textTransform: 'uppercase', opacity: publishing ? 0.6 : 1, transition: 'background 0.15s' }
                }
              >{publishing ? 'Saving...' : a.is_published ? 'Unpublish' : 'Publish'}</button>
              <button
                onClick={printInvite}
                style={{ fontFamily: font.display, fontSize: 10, fontWeight: 700, color: C.accent, background: C.card, border: `1px solid ${C.accent}44`, borderRadius: 5, padding: '4px 10px', cursor: 'pointer', letterSpacing: '0.04em', textTransform: 'uppercase', transition: 'border-color 0.15s' }}
              >Invite</button>
              <button
                onClick={() => onEdit(a)}
                style={{ fontFamily: font.display, fontSize: 10, fontWeight: 700, color: C.textSec, background: C.card, border: `1px solid ${C.border}`, borderRadius: 5, padding: '4px 10px', cursor: 'pointer', letterSpacing: '0.04em', textTransform: 'uppercase', transition: 'border-color 0.15s' }}
              >Edit</button>
              <button
                onClick={() => setConfirmDelete(true)}
                style={{ fontFamily: font.display, fontSize: 10, fontWeight: 700, color: C.warn, background: C.card, border: `1px solid ${C.border}`, borderRadius: 5, padding: '4px 10px', cursor: 'pointer', letterSpacing: '0.04em', textTransform: 'uppercase' }}
              >Remove</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
