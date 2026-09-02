import { useState } from 'react';
import { C, font } from '../../lib/theme';
import { CATEGORIES, SCOPE_OPTIONS, MINISTRY_OPTIONS, DEFAULT_ANNOUNCEMENT, HAPPENING_TYPE_OPTIONS, SIGNUP_MODE_OPTIONS } from '../../lib/constants';
import { inputBase, labelBase, btnPrimary, btnGhost } from '../ui/inputs';
import {
  formatDateNice,
  getSlideStartDate,
  getAutoHappeningsStartDate,
  getAutoHappeningsEndDate,
  getScopeLeadWeeks,
} from '../../lib/helpers';
import { AIWriteButton } from './AIWriteButton';
import { useAnnouncementAI } from '../../hooks/useAnnouncementAI';
import { STATUS_OPTIONS } from '../../types';
import type { Announcement, RecurrenceType } from '../../types';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const RECURRENCE_OPTIONS: { value: RecurrenceType; label: string; desc: string }[] = [
  { value: 'one_time', label: 'One-Time', desc: 'A single event on one date' },
  { value: 'date_range', label: 'Date Range', desc: 'Spans multiple consecutive days (e.g. a retreat)' },
  { value: 'weekly', label: 'Weekly Class', desc: 'Repeats every week on the same day' },
];

function weekdayOf(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T12:00:00');
  return WEEKDAYS[d.getDay()] || '';
}

function computeRecurrenceLabel(
  type: RecurrenceType,
  eventDate: string | null,
  endDate: string | null,
  day: string,
): string {
  if (type === 'one_time' || !eventDate) return '';
  if (type === 'date_range') {
    if (!endDate) return '';
    const s = new Date(eventDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const e = new Date(endDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${s} – ${e}`;
  }
  if (type === 'weekly') {
    const wd = day || weekdayOf(eventDate);
    if (!endDate) return `Every ${wd}`;
    const s = new Date(eventDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const e = new Date(endDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `Every ${wd}, ${s} – ${e}`;
  }
  return '';
}

interface AnnouncementFormProps {
  announcement: Announcement | null;
  initialOverrides?: Partial<Omit<Announcement, 'id' | 'created_at' | 'updated_at'>>;
  onSave: (a: Omit<Announcement, 'id' | 'created_at' | 'updated_at'> & { id?: string }) => Promise<void>;
  onCancel: () => void;
  onError: (msg: string) => void;
  onOpenSignupSheet?: (a: { id: string; title: string; event_date: string | null }) => void;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        fontFamily: font.mono,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: C.textTer,
        marginBottom: 10,
        paddingBottom: 8,
        borderBottom: `1px solid ${C.border}`,
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}

export function AnnouncementForm({ announcement, initialOverrides, onSave, onCancel, onError, onOpenSignupSheet }: AnnouncementFormProps) {
  const today = new Date().toISOString().split('T')[0];

  const [f, setF] = useState<Omit<Announcement, 'id' | 'created_at' | 'updated_at'> & { id?: string }>(
    announcement
      ? announcement.id === 'new'
        ? (() => { const { id: _omit, ...rest } = announcement; return rest; })()
        : { ...announcement }
      : { ...DEFAULT_ANNOUNCEMENT, ...initialOverrides }
  );
  const [saving, setSaving] = useState(false);
  const [ministryOther, setMinistryOther] = useState(
    () => announcement?.ministry != null && !MINISTRY_OPTIONS.includes(announcement.ministry as typeof MINISTRY_OPTIONS[number])
  );

  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) =>
    setF(p => {
      const next = { ...p, [k]: v };
      if (k === 'recurrence_type' || k === 'event_date' || k === 'recurrence_end_date' || k === 'recurrence_day') {
        next.recurrence_label = computeRecurrenceLabel(
          next.recurrence_type,
          next.event_date,
          next.recurrence_end_date,
          next.recurrence_type === 'weekly' ? (next.recurrence_day || weekdayOf(next.event_date || '')) : '',
        );
        if (k === 'recurrence_type' && v === 'weekly' && next.event_date && !next.recurrence_day) {
          next.recurrence_day = weekdayOf(next.event_date);
        }
        if (k === 'recurrence_type') {
          next.is_recurring = v !== 'one_time';
        }
      }
      return next;
    });

  const { aiLoading, hasEnoughForAI, generateBody, generateSlide, generateFlyer, generateAll } =
    useAnnouncementAI(f, set, onError);

  const slideStart = f.event_date ? getSlideStartDate(f as Announcement) : null;
  const slideEnd   = f.event_date ?? null;
  const autoStart  = getAutoHappeningsStartDate(f as Announcement, today);
  const autoEnd    = getAutoHappeningsEndDate(f as Announcement);
  const leadWeeks  = getScopeLeadWeeks(f.scope);
  const startsImmediately = f.event_date && autoStart === today;

  const syncDatesFromArray = (dates: string[]) => {
    const sorted = [...dates].filter(Boolean).sort();
    const primary = sorted[0] ?? null;
    setF(p => ({ ...p, event_dates: dates, event_date: primary }));
  };

  const addDate = () => syncDatesFromArray([...f.event_dates, '']);
  const updateDate = (i: number, val: string) => syncDatesFromArray(f.event_dates.map((d, idx) => idx === i ? val : d));
  const removeDate = (i: number) => syncDatesFromArray(f.event_dates.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    if (!f.title.trim()) return;
    setSaving(true);
    try { await onSave(f); } finally { setSaving(false); }
  };

  const fg: React.CSSProperties = { marginBottom: 14 };

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
      <style>{`@keyframes aispin { to { transform: rotate(360deg); } }`}</style>

      {/* Header bar */}
      <div style={{ padding: '16px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: C.bgSubtle }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 3, height: 20, background: C.accent, borderRadius: 99 }} />
          <span style={{ fontFamily: font.display, fontSize: 13, fontWeight: 800, color: C.text, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {announcement && announcement.id !== 'new' ? 'Edit Announcement' : 'New Announcement'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <AIWriteButton label="Write All" loading={aiLoading.all} onClick={generateAll} disabled={!hasEnoughForAI} />
          <button
            type="button"
            onClick={() => set('is_published', !f.is_published)}
            title={f.is_published ? 'Won\'t appear on the public site once you Save' : 'Will appear on the public site once you Save'}
            style={{
              fontFamily: font.display, fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
              padding: '6px 12px', borderRadius: 6, cursor: 'pointer', transition: 'all 0.15s',
              border: `1px solid ${f.is_published ? '#15803D' : C.borderMed}`,
              background: f.is_published ? 'rgba(22,163,74,0.12)' : C.card,
              color: f.is_published ? '#15803D' : C.textSec,
            }}
          >
            {f.is_published ? 'Published' : 'Unpublished'}
          </button>
        </div>
      </div>

      <div style={{ padding: '24px 24px 20px' }}>

        <Section title="Basics">
          <div style={fg}>
            <label style={labelBase}>Type</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {HAPPENING_TYPE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  title={opt.desc}
                  onClick={() => set('happening_type', opt.value)}
                  style={{
                    fontFamily: font.body,
                    fontSize: 12,
                    fontWeight: 600,
                    padding: '8px 14px',
                    borderRadius: 6,
                    border: `1px solid ${f.happening_type === opt.value ? C.accent : C.borderMed}`,
                    background: f.happening_type === opt.value ? C.accentBg : C.card,
                    color: f.happening_type === opt.value ? C.accent : C.textSec,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div style={fg}>
            <label style={labelBase}>Title</label>
            <input
              style={{ ...inputBase, fontFamily: font.display, fontWeight: 700, fontSize: 15 }}
              value={f.title}
              onChange={e => set('title', e.target.value)}
              placeholder="Announcement title"
            />
          </div>
          <div style={fg}>
            <label style={labelBase}>Short Description <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(helps AI generate better content)</span></label>
            <textarea
              style={{ ...inputBase, minHeight: 68, resize: 'vertical', fontSize: 13 }}
              value={f.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Brief summary: what's happening, who it's for, why it matters."
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelBase}>Category</label>
              <select style={inputBase} value={f.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={labelBase}>Scope</label>
              <select style={inputBase} value={f.scope} onChange={e => set('scope', e.target.value as Announcement['scope'])}>
                {SCOPE_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label} ({o.desc})</option>
                ))}
              </select>
              {f.scope === 'whole_church' && (
                <div style={{ fontFamily: font.mono, fontSize: 10, color: C.accent, marginTop: 4, letterSpacing: '0.02em' }}>
                  → appears in Stage Script
                </div>
              )}
            </div>
          </div>
          {f.scope === 'ministry' && (
            <div style={{ marginTop: 12 }}>
              <label style={labelBase}>Specific Ministry</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <select
                  style={{ ...inputBase, width: 'auto', minWidth: 160 }}
                  value={ministryOther ? '__other' : (f.ministry || '')}
                  onChange={e => {
                    if (e.target.value === '__other') {
                      setMinistryOther(true);
                      set('ministry', '');
                    } else {
                      setMinistryOther(false);
                      set('ministry', e.target.value);
                    }
                  }}
                >
                  <option value="">Select...</option>
                  {MINISTRY_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                  <option value="__other">Other (write in)</option>
                </select>
                {ministryOther && (
                  <input
                    style={{ ...inputBase, flex: 1, minWidth: 180 }}
                    value={f.ministry}
                    onChange={e => set('ministry', e.target.value)}
                    placeholder="Type ministry name..."
                    autoFocus
                  />
                )}
              </div>
            </div>
          )}
        </Section>

        <Section title="Details">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelBase}>Location</label>
              <input style={inputBase} value={f.event_location} onChange={e => set('event_location', e.target.value)} placeholder="e.g. Fellowship Hall, Room 201" />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelBase}>Registration Link <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
              <input type="url" style={inputBase} value={f.link} onChange={e => set('link', e.target.value)} placeholder="https://example.com/register" />
            </div>
            <div>
              <label style={labelBase}>Contact Name</label>
              <input style={inputBase} value={f.contact_name} onChange={e => set('contact_name', e.target.value)} placeholder="Optional" />
            </div>
            <div>
              <label style={labelBase}>Contact Info</label>
              <input style={inputBase} value={f.contact_info} onChange={e => set('contact_info', e.target.value)} placeholder="Email or phone" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
            <div>
              <label style={labelBase}>Status</label>
              <select style={inputBase} value={f.status} onChange={e => set('status', e.target.value as Announcement['status'])}>
                {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label} ({o.desc})</option>)}
              </select>
            </div>
            <div>
              <label style={labelBase}>Assigned To</label>
              <input style={inputBase} value={f.assigned_to} onChange={e => set('assigned_to', e.target.value)} placeholder="Who's responsible" />
            </div>
          </div>
        </Section>

        <Section title="Timing">
          <div style={fg}>
            <label style={labelBase}>Event Type</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {RECURRENCE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  title={opt.desc}
                  onClick={() => set('recurrence_type', opt.value)}
                  style={{
                    fontFamily: font.body,
                    fontSize: 12,
                    fontWeight: 600,
                    padding: '8px 14px',
                    borderRadius: 6,
                    border: `1px solid ${f.recurrence_type === opt.value ? C.accent : C.borderMed}`,
                    background: f.recurrence_type === opt.value ? C.accentBg : C.card,
                    color: f.recurrence_type === opt.value ? C.accent : C.textSec,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {f.recurrence_type === 'one_time' && (
            <div style={fg}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={labelBase}>Event Date{f.event_dates.length > 1 ? 's' : ''}</label>
                <button
                  type="button"
                  onClick={addDate}
                  style={{ fontFamily: font.display, fontSize: 10, fontWeight: 700, color: C.accent, background: 'none', border: `1px solid ${C.accent}44`, borderRadius: 4, padding: '3px 10px', cursor: 'pointer', letterSpacing: '0.05em', textTransform: 'uppercase' }}
                >
                  + Add Date
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {f.event_dates.length === 0 && (
                  <div style={{ fontFamily: font.mono, fontSize: 11, color: C.textMuted, padding: '6px 0' }}>
                    no dates set, runs until removed
                  </div>
                )}
                {f.event_dates.map((d, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      style={{ ...inputBase, width: 160, fontFamily: font.mono, fontSize: 12 }}
                      type="date"
                      value={d}
                      onChange={e => updateDate(i, e.target.value)}
                    />
                    <button type="button" onClick={() => removeDate(i)} style={{ fontFamily: font.body, fontSize: 12, color: C.textMuted, background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', lineHeight: 1 }}>×</button>
                    {i === 0 && f.event_dates.length > 1 && (
                      <span style={{ fontFamily: font.mono, fontSize: 9, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>primary</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {f.recurrence_type === 'date_range' && (
            <div style={{ ...fg, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelBase}>Start Date *</label>
                <input
                  type="date"
                  style={{ ...inputBase, fontFamily: font.mono, fontSize: 12 }}
                  value={f.event_date || ''}
                  onChange={e => {
                    const val = e.target.value || null;
                    setF(p => ({ ...p, event_date: val, event_dates: val ? [val] : [] }));
                  }}
                />
              </div>
              <div>
                <label style={labelBase}>End Date *</label>
                <input
                  type="date"
                  style={{ ...inputBase, fontFamily: font.mono, fontSize: 12 }}
                  value={f.recurrence_end_date || ''}
                  onChange={e => set('recurrence_end_date', e.target.value || null)}
                />
              </div>
            </div>
          )}

          {f.recurrence_type === 'weekly' && (
            <>
              <div style={{ ...fg, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelBase}>First Session *</label>
                  <input
                    type="date"
                    style={{ ...inputBase, fontFamily: font.mono, fontSize: 12 }}
                    value={f.event_date || ''}
                    onChange={e => {
                      const val = e.target.value || null;
                      setF(p => ({
                        ...p,
                        event_date: val,
                        event_dates: val ? [val] : [],
                        recurrence_day: val ? weekdayOf(val) : p.recurrence_day,
                      }));
                    }}
                  />
                </div>
                <div>
                  <label style={labelBase}>Last Session (optional)</label>
                  <input
                    type="date"
                    style={{ ...inputBase, fontFamily: font.mono, fontSize: 12 }}
                    value={f.recurrence_end_date || ''}
                    onChange={e => set('recurrence_end_date', e.target.value || null)}
                  />
                </div>
              </div>
              <div style={fg}>
                <label style={labelBase}>Repeats On</label>
                <select
                  style={inputBase}
                  value={f.recurrence_day || weekdayOf(f.event_date || '') || ''}
                  onChange={e => set('recurrence_day', e.target.value)}
                >
                  <option value="">Select a day...</option>
                  {WEEKDAYS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </>
          )}

          <div style={{ ...fg, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelBase}>Start Time</label>
              <input
                type="time"
                style={{ ...inputBase, fontFamily: font.mono, fontSize: 12 }}
                value={f.event_time || ''}
                onChange={e => set('event_time', e.target.value)}
              />
            </div>
            <div>
              <label style={labelBase}>End Time</label>
              <input
                type="time"
                style={{ ...inputBase, fontFamily: font.mono, fontSize: 12 }}
                value={f.end_time || ''}
                onChange={e => set('end_time', e.target.value)}
              />
            </div>
          </div>

          {f.recurrence_label && (
            <div style={{ fontFamily: font.body, fontSize: 12, color: C.accent, fontWeight: 600, padding: '6px 12px', background: C.accentBg, borderRadius: 6, border: `1px solid ${C.accent}33`, marginBottom: 14 }}>
              {f.recurrence_label}
            </div>
          )}

          {f.event_date && (
            <div style={{ background: C.bgSubtle, border: `1px solid ${C.border}`, borderRadius: 6, padding: '10px 14px', fontFamily: font.mono, fontSize: 11, color: C.textTer, lineHeight: 1.8 }}>
              <div style={{ fontFamily: font.display, fontSize: 9, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Auto schedule</div>
              <div>
                <span style={{ color: C.textMuted }}>active </span>
                <span style={{ color: C.accent }}>
                  {startsImmediately ? `now (within ${leadWeeks}w window)` : formatDateNice(autoStart)}
                </span>
                <span style={{ color: C.textMuted }}> → </span>
                <span style={{ color: C.accent }}>{formatDateNice(autoEnd)}</span>
              </div>
              {f.show_on_slides && slideStart && slideEnd && (
                <div>
                  <span style={{ color: C.textMuted }}>slides </span>
                  <span style={{ color: C.accent }}>{formatDateNice(slideStart)}</span>
                  <span style={{ color: C.textMuted }}> → </span>
                  <span style={{ color: C.accent }}>{formatDateNice(slideEnd)}</span>
                </div>
              )}
            </div>
          )}
        </Section>

        <Section title="Destinations">
          <div style={{ fontFamily: font.mono, fontSize: 10, color: C.textMuted, marginBottom: 10, letterSpacing: '0.02em' }}>
            Whole Church scope → Stage Script automatically
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {[
              { key: 'show_on_slides' as const, label: 'Sunday Slides' },
              { key: 'show_in_happenings' as const, label: 'The Happenings' },
              { key: 'monthly_include' as const, label: 'Monthly Flyer' },
            ].map(d => (
              <label key={d.key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: font.body, fontSize: 13, color: C.textSec, cursor: 'pointer', padding: '6px 12px', border: `1px solid ${f[d.key] ? C.accent + '44' : C.border}`, borderRadius: 6, background: f[d.key] ? C.accentBg : C.card, transition: 'all 0.15s' }}>
                <input
                  type="checkbox"
                  checked={f[d.key] as boolean}
                  onChange={e => set(d.key, e.target.checked)}
                  style={{ accentColor: C.accent, width: 13, height: 13 }}
                />
                <span style={{ fontFamily: font.display, fontSize: 11, fontWeight: 600, letterSpacing: '0.02em' }}>{d.label}</span>
              </label>
            ))}
          </div>

          <div style={{ marginTop: 14 }}>
            <label style={labelBase}>Sign-Up</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {SIGNUP_MODE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => set('signup_mode', opt.value)}
                  style={{
                    fontFamily: font.body,
                    fontSize: 12,
                    fontWeight: 600,
                    padding: '8px 14px',
                    borderRadius: 6,
                    border: `1px solid ${f.signup_mode === opt.value ? C.accent : C.borderMed}`,
                    background: f.signup_mode === opt.value ? C.accentBg : C.card,
                    color: f.signup_mode === opt.value ? C.accent : C.textSec,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {(f.signup_mode === 'sheet' || f.signup_mode === 'both') && (
            <div style={{ marginTop: 14 }}>
              <button
                type="button"
                disabled={!onOpenSignupSheet || !f.id}
                title={!f.id ? 'Save this happening first' : 'Open the Sign-up Sheet builder for this happening'}
                onClick={() => f.id && onOpenSignupSheet?.({ id: f.id, title: f.title, event_date: f.event_date })}
                style={{
                  ...btnGhost,
                  fontSize: 12,
                  fontWeight: 700,
                  opacity: !onOpenSignupSheet || !f.id ? 0.5 : 1,
                  cursor: !onOpenSignupSheet || !f.id ? 'default' : 'pointer',
                }}
              >
                {f.signup_sheet_config ? 'Edit Sign-up Sheet' : 'Create Sign-up Sheet'}
              </button>
            </div>
          )}
        </Section>

        <Section title="Content">
          <div style={fg}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
              <label style={labelBase}>Full Description <span style={{ fontWeight: 400, textTransform: 'none' }}>(The Happenings email)</span></label>
              <AIWriteButton label="Draft" loading={aiLoading.body} onClick={generateBody} disabled={!hasEnoughForAI} />
            </div>
            <textarea
              style={{ ...inputBase, minHeight: 80, resize: 'vertical' }}
              value={f.body}
              onChange={e => set('body', e.target.value)}
              placeholder="Full email copy. AI can write this for you."
            />
          </div>

          <div style={fg}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
              <div>
                <label style={labelBase}>Flyer Text <span style={{ fontWeight: 400, textTransform: 'none' }}>(Monthly Flyer)</span></label>
                <div style={{ fontFamily: font.mono, fontSize: 10, color: C.textMuted, marginTop: 1 }}>2–3 sentences, max 65 words</div>
              </div>
              <AIWriteButton label="Draft" loading={aiLoading.flyer} onClick={generateFlyer} disabled={!hasEnoughForAI} />
            </div>
            <textarea
              style={{ ...inputBase, minHeight: 60, resize: 'vertical' }}
              value={f.flyer_text}
              onChange={e => set('flyer_text', e.target.value)}
              placeholder="Medium-length copy for the printed monthly flyer."
            />
          </div>

          <div style={fg}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
              <div>
                <label style={labelBase}>Short Line <span style={{ fontWeight: 400, textTransform: 'none' }}>(Slides & Email one-liner)</span></label>
                <div style={{ fontFamily: font.mono, fontSize: 10, color: C.textMuted, marginTop: 1 }}>one sentence, pipe-delimited</div>
              </div>
              <AIWriteButton label="Draft" loading={aiLoading.slide} onClick={generateSlide} disabled={!hasEnoughForAI} />
            </div>
            <input
              style={{ ...inputBase, fontFamily: font.mono, fontSize: 12 }}
              value={f.slide_override}
              onChange={e => { set('slide_override', e.target.value); set('short_version', e.target.value); }}
              placeholder="Men's Bible Study | May 6 | 7 PM | Fellowship Hall"
            />
          </div>
        </Section>

        <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
          <button
            onClick={handleSave}
            disabled={saving || !f.title.trim()}
            style={{ ...btnPrimary, opacity: saving || !f.title.trim() ? 0.5 : 1 }}
            onMouseEnter={e => { if (!saving && f.title.trim()) (e.currentTarget as HTMLElement).style.background = C.accentHover; }}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = C.accent}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button onClick={onCancel} style={btnGhost}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
