import { useState, useEffect } from 'react';
import { C, font } from '../../lib/theme';
import { btnGhost, btnPrimary } from '../ui/inputs';
import { isHappeningsActive, formatDateNice, formatTime12h, escapeHtml, scriptTextToHtml, scriptHtmlToText, looksLikeHtml } from '../../lib/helpers';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { supabase } from '../../lib/supabase';
import { Radio } from 'lucide-react';
import type { Announcement, RecurrenceType } from '../../types';
import { ScriptEditor } from './ScriptEditor';

interface HappeningsTabProps {
  announcements: Announcement[];
  today: string;
}

const RECURRING_TYPES: RecurrenceType[] = ['weekly', 'biweekly', 'monthly', 'date_range'];

// Mirrors the "when" label shown elsewhere (e.g. the printed weekly
// bulletin) - prefer the human-written recurrence_label for anything that
// repeats, otherwise fall back to the actual date(s).
function whenLabel(a: Announcement): string {
  if (RECURRING_TYPES.includes(a.recurrence_type) && a.recurrence_label) return a.recurrence_label;
  if (a.event_date) return formatDateNice(a.event_date);
  if (a.event_dates?.length) return a.event_dates.map(formatDateNice).join(', ');
  return '';
}

// Assembles this week's active items into the Happenings update HTML,
// verbatim - each item's own Short Description (the same copy used on the
// calendar, monthly flyer, and printed invite) becomes its body text
// unchanged, with only the title (Title format) and when/where (Bold
// format) added around it. No AI rewriting: what staff already wrote for
// the item is what goes out.
function buildAssembledScript(items: Announcement[]): string {
  if (items.length === 0) {
    return scriptTextToHtml(`Nothing officially scheduled this week, but we'd still love to see you. Check urf.life for anything that might come up.`);
  }
  const sections = items.map(a => {
    const description = (a.flyer_text || a.short_version || a.body || '').trim();
    const whenWhere = [
      [whenLabel(a), a.event_time ? formatTime12h(a.event_time) : ''].filter(Boolean).join(' · '),
      a.event_location || '',
    ].filter(Boolean).join(' · ');

    let html = `<h3>${escapeHtml(a.title)}</h3>`;
    if (whenWhere) html += `<p><strong>${escapeHtml(whenWhere)}</strong></p>`;
    if (description) html += scriptTextToHtml(description);
    return html;
  });
  return sections.join('') + `<p>For the full list of what's happening, visit urf.life.</p>`;
}

export function HappeningsTab({ announcements, today }: HappeningsTabProps) {
  const [script, setScript] = useState('');
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);
  const [building, setBuilding] = useState(false);
  const [loadingScript, setLoadingScript] = useState(true);
  const [buildError, setBuildError] = useState('');
  const [copied, copy] = useCopyToClipboard();

  const active = announcements.filter(a => isHappeningsActive(a, today));
  const grouped: Record<string, Announcement[]> = {};
  active.forEach(a => {
    if (!grouped[a.category]) grouped[a.category] = [];
    grouped[a.category].push(a);
  });

  useEffect(() => {
    setScript('');
    setDirty(false);
    setConfirmRegenerate(false);
    setLoadingScript(true);
    supabase
      .from('staff_generated_scripts_portal123')
      .select('content')
      .eq('type', 'happenings')
      .eq('week_date', today)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.content) {
          // Scripts saved before the rich-text editor was added are plain
          // text, not HTML - convert on the way in so they still render
          // (and format) correctly in ScriptEditor.
          setScript(looksLikeHtml(data.content) ? data.content : scriptTextToHtml(data.content));
        }
        setLoadingScript(false);
      });
  }, [today]);

  const saveScript = async (content: string) => {
    await supabase.from('staff_generated_scripts_portal123').upsert(
      { type: 'happenings', week_date: today, content },
      { onConflict: 'type,week_date,user_id' },
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveScript(script);
      setDirty(false);
    } finally {
      setSaving(false);
    }
  };

  const runAssemble = async () => {
    const allItems = Object.values(grouped).flat();
    setBuilding(true);
    setBuildError('');
    setConfirmRegenerate(false);
    try {
      const html = buildAssembledScript(allItems);
      setScript(html);
      setDirty(false);
      await saveScript(html);
    } catch (e) {
      setBuildError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setBuilding(false);
    }
  };

  const handleBuildClick = () => {
    if (dirty && script) {
      setConfirmRegenerate(true);
      return;
    }
    runAssemble();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontFamily: font.display, fontSize: 18, fontWeight: 800, color: C.text, margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            The Happenings
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <p style={{ fontFamily: font.mono, fontSize: 11, color: C.textMuted, margin: 0, letterSpacing: '0.03em' }}>
              {active.length} items · week of {formatDateNice(today)}
            </p>
            {script && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontFamily: font.mono,
                fontSize: 10,
                fontWeight: 600,
                color: C.success,
                background: C.successBg,
                border: `1px solid ${C.success}30`,
                borderRadius: 999,
                padding: '2px 8px',
                letterSpacing: '0.04em',
              }}>
                <Radio size={10} strokeWidth={2.5} />
                Live on urf.life
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {script && !building && (
            <button
              onClick={() => copy(scriptHtmlToText(script))}
              style={{ ...btnGhost, fontSize: 12, padding: '7px 14px', color: copied ? C.accent : C.textSec }}
            >
              {copied ? 'Copied!' : 'Copy Script'}
            </button>
          )}
          {dirty && (
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                ...btnPrimary,
                fontSize: 12,
                padding: '7px 16px',
                opacity: saving ? 0.7 : 1,
                cursor: saving ? 'wait' : 'pointer',
              }}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          )}
          {confirmRegenerate ? (
            <>
              <button
                onClick={() => setConfirmRegenerate(false)}
                style={{ ...btnGhost, fontSize: 12, padding: '7px 14px' }}
              >
                Cancel
              </button>
              <button
                onClick={runAssemble}
                style={{ ...btnPrimary, fontSize: 12, padding: '7px 16px', background: C.warn }}
              >
                Overwrite unsaved edits
              </button>
            </>
          ) : (
            <button
              onClick={handleBuildClick}
              disabled={building}
              style={{
                ...(script ? btnGhost : btnPrimary),
                fontSize: 12,
                padding: '7px 16px',
                opacity: building ? 0.7 : 1,
                cursor: building ? 'wait' : 'pointer',
              }}
            >
              {building ? 'Building...' : script ? 'Rebuild Update' : 'Build Update'}
            </button>
          )}
        </div>
      </div>

      {buildError && (
        <p style={{ fontFamily: font.body, fontSize: 13, color: C.warn, marginBottom: 12 }}>
          {buildError}
        </p>
      )}

      {loadingScript ? (
        <div style={{ padding: '48px 0', textAlign: 'center', fontFamily: font.body, fontSize: 13, color: C.textMuted }}>
          Loading...
        </div>
      ) : (
        <div style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 10,
          padding: '32px 36px',
        }}>
          {!script && !building && (
            <p style={{ fontFamily: font.body, fontSize: 13, color: C.textMuted, margin: '0 0 12px' }}>
              No update yet for this week. Press "Build Update" to put this week's Short Descriptions together into a Happenings update, or start typing below.
            </p>
          )}
          <ScriptEditor
            value={script}
            onChange={html => { setScript(html); setDirty(true); setConfirmRegenerate(false); }}
            disabled={building}
          />
        </div>
      )}
    </div>
  );
}
