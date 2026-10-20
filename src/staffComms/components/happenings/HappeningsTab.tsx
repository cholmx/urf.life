import { useState, useEffect, useMemo } from 'react';
import { C, font } from '../../lib/theme';
import { btnGhost, btnPrimary } from '../ui/inputs';
import { isHappeningsActive, formatDateNice, scriptHtmlToText, looksLikeHtml, getWeekStartDate, buildHappeningsScript } from '../../lib/helpers';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { supabase } from '../../lib/supabase';
import { sanitizeHtml } from '../../../utils/sanitizeHtml';
import { Radio } from 'lucide-react';
import type { Announcement } from '../../types';
import { ScriptEditor } from './ScriptEditor';

interface HappeningsTabProps {
  announcements: Announcement[];
  today: string;
}

// The announcement list below is always live - computed fresh from
// current data on every render, exactly like the public page does, so
// there's nothing to build or go stale. The only thing staff actually
// edit and save here is the Weekly Note, a few lines of free text that
// isn't tied to any announcement (a greeting, a one-off heads-up, a
// correction) which the public page prepends to that same live list.
export function HappeningsTab({ announcements, today }: HappeningsTabProps) {
  const [note, setNote] = useState('');
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingNote, setLoadingNote] = useState(true);
  const [copied, copy] = useCopyToClipboard();

  const active = announcements.filter(a => isHappeningsActive(a, today));
  const assembledHtml = useMemo(() => buildHappeningsScript(active), [active]);

  // Weeks run Sunday-Saturday - anchor the saved note to that week's
  // Sunday, not the literal day it happens to be edited on, so editing
  // the note later in the same week updates the same row instead of
  // creating a separate one (see the public page's own matching lookup).
  const weekStartDate = getWeekStartDate(today);

  useEffect(() => {
    setNote('');
    setDirty(false);
    setLoadingNote(true);
    supabase
      .from('staff_generated_scripts_portal123')
      .select('content')
      .eq('type', 'happenings')
      .eq('week_date', weekStartDate)
      .maybeSingle()
      .then(({ data }) => {
        setLoadingNote(false);
        if (data?.content) {
          // Rows saved before the rich-text editor was added are plain
          // text, not HTML - convert on the way in so they still render
          // (and format) correctly in ScriptEditor.
          setNote(looksLikeHtml(data.content) ? data.content : `<p>${data.content}</p>`);
        }
      });
  }, [weekStartDate]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await supabase.from('staff_generated_scripts_portal123').upsert(
        { type: 'happenings', week_date: weekStartDate, content: note },
        { onConflict: 'type,week_date,user_id' },
      );
      setDirty(false);
    } finally {
      setSaving(false);
    }
  };

  const fullText = scriptHtmlToText(`${note}${assembledHtml}`);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontFamily: font.display, fontSize: 18, fontWeight: 800, color: C.text, margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            The Happenings
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <p style={{ fontFamily: font.mono, fontSize: 11, color: C.textMuted, margin: 0, letterSpacing: '0.03em' }}>
              {active.length} items · week of {formatDateNice(weekStartDate)}
            </p>
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
              Always live on urf.life
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <button
            onClick={() => copy(fullText)}
            style={{ ...btnGhost, fontSize: 12, padding: '7px 14px', color: copied ? C.accent : C.textSec }}
          >
            {copied ? 'Copied!' : 'Copy Full Text'}
          </button>
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
              {saving ? 'Saving...' : 'Save Note'}
            </button>
          )}
        </div>
      </div>

      {/* Weekly Note - the only editable part. Not touched by anything
          else, and included first on the public page, above the live
          list below. */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontFamily: font.display, fontSize: 12, fontWeight: 700, color: C.textSec, margin: '0 0 6px', letterSpacing: '0.02em' }}>
          Weekly Note <span style={{ fontWeight: 400, color: C.textMuted }}>- optional, shown above the list below on the public page</span>
        </p>
        {loadingNote ? (
          <div style={{ padding: '24px 0', textAlign: 'center', fontFamily: font.body, fontSize: 13, color: C.textMuted }}>
            Loading...
          </div>
        ) : (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: '20px 24px' }}>
            {!note && (
              <p style={{ fontFamily: font.body, fontSize: 13, color: C.textMuted, margin: '0 0 8px' }}>
                Add a greeting, a one-off note, or anything else that isn't its own announcement...
              </p>
            )}
            <ScriptEditor
              value={note}
              onChange={html => { setNote(html); setDirty(true); }}
            />
          </div>
        )}
      </div>

      {/* Live list - always exactly what's on the public page right now,
          nothing to build or save. */}
      <div>
        <p style={{ fontFamily: font.display, fontSize: 12, fontWeight: 700, color: C.textSec, margin: '0 0 6px', letterSpacing: '0.02em' }}>
          This Week's List <span style={{ fontWeight: 400, color: C.textMuted }}>- live, from announcements marked "The Happenings"</span>
        </p>
        <div
          className="happenings-script"
          style={{ background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 10, padding: '20px 24px', color: C.textSec }}
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(assembledHtml) }}
        />
      </div>
    </div>
  );
}
