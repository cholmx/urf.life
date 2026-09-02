import { useState } from 'react';
import { C, font, scopeRangeColors } from '../../lib/theme';
import { ScopePill, Pill } from '../ui/Pill';
import { formatDateNice, weeksUntil } from '../../lib/helpers';
import { buildInviteHTMLFromAnnouncement } from './invitePrinter';
import type { Announcement } from '../../types';

const DEST_LABELS = [
  { key: 'show_on_slides' as const,    short: 'Slides' },
  { key: 'show_in_happenings' as const, short: 'Email' },
  { key: 'monthly_include' as const,   short: 'Flyer' },
];

const STATUS_STYLES: Record<Announcement['status'], { bg: string; color: string; border: string; label: string }> = {
  draft:     { bg: 'rgba(148,163,184,0.10)', color: '#64748B', border: 'rgba(148,163,184,0.30)', label: 'Draft' },
  approved:  { bg: 'rgba(22,163,74,0.12)',   color: '#15803D', border: 'rgba(22,163,74,0.35)',   label: 'Approved' },
};

interface AnnouncementCardProps {
  a: Announcement;
  today: string;
  onEdit: (a: Announcement) => void;
  onDelete: (id: string) => void;
  onApprove: (id: string) => void;
  onTogglePublish: (a: Announcement) => Promise<void>;
}

const SIGNUP_MODE_LABELS: Record<string, string> = {
  online: 'Online RSVP',
  sheet: 'Sign-up Sheet',
  both: 'RSVP + Sheet',
};

export function AnnouncementCard({ a, today, onEdit, onDelete, onApprove, onTogglePublish }: AnnouncementCardProps) {
  const [hovered, setHovered] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [publishing, setPublishing] = useState(false);

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
  const st = STATUS_STYLES[a.status];

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
        padding: '13px 16px',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        boxShadow: hovered ? '0 2px 12px rgba(0,0,0,0.07)' : '0 1px 2px rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap', minWidth: 0 }}>
          <ScopePill scope={a.scope} />
          {a.is_recurring && <Pill>Recurring</Pill>}
          {a.scope === 'whole_church' && (
            <span style={{ fontFamily: font.display, fontSize: 9, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: C.accent }}>Stage</span>
          )}
          <span style={{
            fontFamily: font.display,
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: st.color,
            background: st.bg,
            border: `1px solid ${st.border}`,
            borderRadius: 4,
            padding: '2px 7px',
          }}>{st.label}</span>
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
          {DEST_LABELS.filter(d => a[d.key]).map(d => (
            <span key={d.key} style={{ fontFamily: font.display, fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.textTer }}>
              {d.short}
            </span>
          ))}
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

      {/* Title + preview */}
      <div>
        <h4 style={{ fontFamily: font.display, fontSize: 14, fontWeight: 800, color: C.text, margin: 0, letterSpacing: '-0.01em', lineHeight: 1.3 }}>
          {a.title}
        </h4>
        {(a.short_version || a.body) && (
          <p style={{ fontFamily: font.body, fontSize: 13, color: C.textSec, margin: '3px 0 0', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {a.short_version || a.body.slice(0, 120)}
          </p>
        )}
      </div>

      {/* Bottom row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
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
        <div style={{ display: 'flex', gap: 4, opacity: hovered ? 1 : 0, transition: 'opacity 0.15s' }}>
          {a.signup_mode && a.signup_mode !== 'none' && (
            <span
              title="Edit this happening to manage sign-ups"
              style={{ fontFamily: font.display, fontSize: 10, fontWeight: 700, color: C.textSec, letterSpacing: '0.04em', textTransform: 'uppercase', padding: '4px 10px', border: `1px solid ${C.border}`, borderRadius: 5, background: C.card }}
            >
              {SIGNUP_MODE_LABELS[a.signup_mode] || 'Sign-up'}
            </span>
          )}
          {a.status === 'draft' && (
            <button
              onClick={() => onApprove(a.id)}
              style={{ fontFamily: font.display, fontSize: 10, fontWeight: 800, color: '#fff', background: '#15803D', border: `1px solid #15803D`, borderRadius: 5, padding: '4px 12px', cursor: 'pointer', letterSpacing: '0.04em', textTransform: 'uppercase', transition: 'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#167C42'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#15803D'}
            >Approve</button>
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
