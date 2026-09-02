import { useState, useEffect } from 'react';
import { C, font } from '../../lib/theme';
import { btnGhost, btnPrimary } from '../ui/inputs';
import { isHappeningsActive, formatDateNice } from '../../lib/helpers';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { callAI } from '../../lib/ai';
import { supabase } from '../../lib/supabase';
import { Radio } from 'lucide-react';
import type { Announcement } from '../../types';

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
    if (a.contact_name || a.contact_info) {
      t += `Contact: ${[a.contact_name, a.contact_info].filter(Boolean).join(' | ')}\n`;
    }
    t += '\n';
  });
  return t;
}

const SYS_PROMPT = `You are assembling the weekly "Happenings" email for Upper Room Fellowship. Each item below already has finished flyer copy that staff wrote for it - your job is light editing, not rewriting. Combine the flyer texts into one flowing email, adding only brief transitions between items so it reads naturally, one thing moving into the next. Keep each item's own wording, details, and tone as close to the original as you can - do not rephrase sentences that are already fine, and do not add claims or details that aren't already in the source text. Never set up or pre-announce what you're about to say, just say it. When mentioning dates, always use the actual date (like "Saturday, July 12"). Never use relative terms like "tomorrow", "this weekend", "next week", or "in a few days", you do not know when this email will be read. No bullet points. No lists. No em dashes. No colons. No headers. Plain sentences. End with a brief closer and point people to urf.life for the full list. Write ONLY the email body text. No subject line. No extra commentary.`;

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
        if (data?.content) setScript(data.content);
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
        const fallback = `Nothing officially scheduled this week, but we'd still love to see you. Check urf.life for anything that might come up.`;
        setScript(fallback);
        setDirty(false);
        await saveScript(fallback);
        return;
      }
      const rawData = buildRawUpdateData(allItems, today);
      const result = await callAI(
        SYS_PROMPT,
        `Here is this week's flyer copy for each item. Assemble the Happenings email:\n\n${rawData}`,
      );
      const text = result.trim() || 'Could not generate script.';
      setScript(text);
      setDirty(false);
      await saveScript(text);
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
              onClick={() => copy(script)}
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
          <textarea
            value={script}
            onChange={e => { setScript(e.target.value); setDirty(true); setConfirmRegenerate(false); }}
            placeholder={`No script yet for this week. Press "Generate Script" to assemble this week's flyer copy into a Happenings email, or start typing here.`}
            disabled={generating}
            style={{
              width: '100%',
              minHeight: 360,
              border: 'none',
              outline: 'none',
              resize: 'vertical',
              background: 'transparent',
              fontFamily: font.body,
              fontSize: 15,
              lineHeight: 1.8,
              color: C.stageText,
              boxSizing: 'border-box',
            }}
          />
        </div>
      )}
    </div>
  );
}
