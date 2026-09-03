import { useState, useEffect } from 'react';
import { C, font } from '../../lib/theme';
import { btnGhost, btnPrimary } from '../ui/inputs';
import { isHappeningsActive, formatDateNice, scriptTextToHtml, scriptHtmlToText, looksLikeHtml } from '../../lib/helpers';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { callAI } from '../../lib/ai';
import { supabase } from '../../lib/supabase';
import { Radio } from 'lucide-react';
import type { Announcement } from '../../types';
import { ScriptEditor } from './ScriptEditor';

interface HappeningsTabProps {
  announcements: Announcement[];
  today: string;
}

function buildRawUpdateData(allItems: Announcement[], today: string): string {
  let t = `Week of ${formatDateNice(today)}\n\n`;
  allItems.forEach(a => {
    const flyerText = (a.flyer_text || a.short_version || a.body || '').trim();
    t += `Title: ${a.title}\n`;
    if (flyerText) t += `Flyer Text: ${flyerText}\n`;
    if (a.event_date) t += `Date: ${formatDateNice(a.event_date)}\n`;
    if (a.event_time) t += `Time: ${a.event_time}\n`;
    if (a.event_location) t += `Location: ${a.event_location}\n`;
    if (a.contact_name || a.contact_info) {
      t += `Leader/Contact: ${[a.contact_name, a.contact_info].filter(Boolean).join(' | ')}\n`;
    }
    t += '\n';
  });
  return t;
}

const SYS_PROMPT = `You are assembling the weekly "Happenings" update for Upper Room Fellowship from flyer copy staff already wrote for each item. Do not rewrite, rephrase, condense, expand, or "improve" the wording of any item - use each item's flyer text essentially as written, word for word. Your only job is to stitch the items together into one flowing document: add a short transitional phrase or sentence between items, in the same warm but formal register as the source text, so the update reads naturally instead of like a list. You may adjust capitalization or punctuation right at the seam between two items if the join requires it. Do not add claims, details, or flourishes that aren't already in the source text.

The one exception: if an item's text uses a relative date ("this Saturday," "next week," "tomorrow"), replace it with the actual date (like "Saturday, July 12") since you don't know when this update will be read - change nothing else in that sentence.

Every item must keep its name and every concrete detail given for it - date, time, location, and any named leader or contact - never omit, shorten away, or generalize these for the sake of flow. No bullet points. No lists. No em dashes. No colons. No headers. Plain sentences. Separate each item from the next with a blank line. End with a brief closer and point people to urf.life for the full list. Write ONLY the update body text. No subject line. No extra commentary.`;

export function HappeningsTab({ announcements, today }: HappeningsTabProps) {
  const [script, setScript] = useState('');
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [loadingScript, setLoadingScript] = useState(true);
  const [aiError, setAiError] = useState('');
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

  const runGenerate = async () => {
    const allItems = Object.values(grouped).flat();
    setGenerating(true);
    setAiError('');
    setConfirmRegenerate(false);
    try {
      if (allItems.length === 0) {
        const fallback = scriptTextToHtml(`Nothing officially scheduled this week, but we'd still love to see you. Check urf.life for anything that might come up.`);
        setScript(fallback);
        setDirty(false);
        await saveScript(fallback);
        return;
      }
      const rawData = buildRawUpdateData(allItems, today);
      const result = await callAI(
        SYS_PROMPT,
        `Here is this week's flyer copy for each item, written essentially as-is. Stitch it into the Happenings update:\n\n${rawData}`,
      );
      const html = scriptTextToHtml(result.trim() || 'Could not generate script.');
      setScript(html);
      setDirty(false);
      await saveScript(html);
    } catch (e) {
      setAiError(e instanceof Error ? e.message : 'AI generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateClick = () => {
    if (dirty && script) {
      setConfirmRegenerate(true);
      return;
    }
    runGenerate();
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
          {script && !generating && (
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
                onClick={runGenerate}
                style={{ ...btnPrimary, fontSize: 12, padding: '7px 16px', background: C.warn }}
              >
                Overwrite unsaved edits
              </button>
            </>
          ) : (
            <button
              onClick={handleGenerateClick}
              disabled={generating}
              style={{
                ...(script ? btnGhost : btnPrimary),
                fontSize: 12,
                padding: '7px 16px',
                opacity: generating ? 0.7 : 1,
                cursor: generating ? 'wait' : 'pointer',
              }}
            >
              {generating ? 'Writing...' : script ? 'Regenerate Script' : 'Generate Script'}
            </button>
          )}
        </div>
      </div>

      {aiError && (
        <p style={{ fontFamily: font.body, fontSize: 13, color: C.warn, marginBottom: 12 }}>
          {aiError}
        </p>
      )}

      {loadingScript ? (
        <div style={{ padding: '48px 0', textAlign: 'center', fontFamily: font.body, fontSize: 13, color: C.textMuted }}>
          Loading...
        </div>
      ) : (
        <div style={{
          background: C.stageBg,
          borderRadius: 10,
          padding: '32px 36px',
        }}>
          {!script && !generating && (
            <p style={{ fontFamily: font.body, fontSize: 13, color: C.textMuted, margin: '0 0 12px' }}>
              No script yet for this week. Press "Generate Script" to assemble this week's flyer copy into a Happenings update, or start typing below.
            </p>
          )}
          <ScriptEditor
            value={script}
            onChange={html => { setScript(html); setDirty(true); setConfirmRegenerate(false); }}
            disabled={generating}
          />
        </div>
      )}
    </div>
  );
}
