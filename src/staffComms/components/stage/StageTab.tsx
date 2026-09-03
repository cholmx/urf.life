import { useState, useCallback, useEffect } from 'react';
import { C, font } from '../../lib/theme';
import { btnPrimary, btnGhost } from '../ui/inputs';
import { isStageActive, formatDateNice, formatDateLong, weeksUntil } from '../../lib/helpers';
import { generateStageScript } from '../../lib/ai';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { supabase } from '../../lib/supabase';
import type { Announcement } from '../../types';

interface StageTabProps {
  announcements: Announcement[];
  today: string;
  onError: (msg: string) => void;
}

// The script is written for a specific Sunday, so it's cached under that
// Sunday's date rather than whatever day it happens to be viewed on -
// otherwise it looks "gone" (and staff have to regenerate it) every time
// they open this tab on a different day within the same week.
function getUpcomingSunday(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  const daysUntilSunday = d.getDay() === 0 ? 0 : 7 - d.getDay();
  d.setDate(d.getDate() + daysUntilSunday);
  return d.toISOString().split('T')[0];
}

export function StageTab({ announcements, today, onError }: StageTabProps) {
  const [generating, setGenerating] = useState(false);
  const [script, setScript] = useState('');
  const [loadingScript, setLoadingScript] = useState(true);
  const [useAI, setUseAI] = useState(false);
  const [copied, copy] = useCopyToClipboard();
  const [justSaved, setJustSaved] = useState(false);

  const sundayKey = getUpcomingSunday(today);
  const stageItems = announcements.filter(a => isStageActive(a, today));

  const buildRawNotes = useCallback(() => {
    if (stageItems.length === 0) return 'No whole-church announcements active for this Sunday.';
    let s = '';
    stageItems.forEach((a, i) => {
      const wks = weeksUntil(a.event_date, today);
      s += `── ${i + 1}. ${a.title.toUpperCase()} ──\n`;
      s += a.body + '\n';
      if (a.event_date) s += `Date: ${formatDateNice(a.event_date)}${wks !== null && wks > 0 ? ` (${wks} weeks out)` : ''}\n`;
      if (a.contact_name || a.contact_info) s += `Contact: ${[a.contact_name, a.contact_info].filter(Boolean).join(' | ')}\n`;
      if (a.stage_notes) s += `[Tone: ${a.stage_notes}]\n`;
      s += '\n';
    });
    return s.trim();
  }, [stageItems, today]);

  useEffect(() => {
    setScript('');
    setUseAI(false);
    setLoadingScript(true);
    supabase
      .from('staff_generated_scripts_portal123')
      .select('content')
      .eq('type', 'stage')
      .eq('week_date', sundayKey)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.content) {
          setScript(data.content);
          setUseAI(true);
        }
        setLoadingScript(false);
      });
  }, [sundayKey]);

  const saveScript = async (content: string) => {
    await supabase.from('staff_generated_scripts_portal123').upsert(
      { type: 'stage', week_date: sundayKey, content },
      { onConflict: 'type,week_date,user_id' },
    );
  };

  const handleGenerateAI = async () => {
    setGenerating(true);
    try {
      const result = await generateStageScript(stageItems, today);
      const text = result || 'Could not generate script.';
      setScript(text);
      setUseAI(true);
      await saveScript(text);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      onError(`Failed to generate script: ${msg}`);
      setScript(`Error generating script: ${msg}`);
      setUseAI(true);
    } finally {
      setGenerating(false);
    }
  };

  const handleScriptBlur = async () => {
    if (!useAI) return;
    await saveScript(script);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1500);
  };

  const displayScript = useAI ? script : buildRawNotes();
  const hasScript = script.trim().length > 0;

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: font.display, fontSize: 18, fontWeight: 800, color: C.text, margin: '0 0 4px', letterSpacing: '-0.02em' }}>
          Stage Script
        </h2>
        <p style={{ fontFamily: font.mono, fontSize: 11, color: C.textMuted, margin: '0 0 2px', letterSpacing: '0.03em' }}>
          {stageItems.length} whole-church · {formatDateLong(today)}
        </p>
        <p style={{ fontFamily: font.body, fontSize: 12, color: C.textTer, margin: 0 }}>
          Only "Whole Church" scope announcements appear here. Use Raw Notes for reference, or Generate Script for a ready-to-read version you can edit right here - it's saved automatically.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          onClick={() => setUseAI(false)}
          style={{ ...(!useAI ? btnPrimary : btnGhost), fontSize: 12, padding: '7px 16px' }}
        >
          Raw Notes
        </button>
        <button
          onClick={() => { if (hasScript) setUseAI(true); else handleGenerateAI(); }}
          disabled={generating || loadingScript || (!hasScript && stageItems.length === 0)}
          style={{
            ...(useAI ? btnPrimary : btnGhost),
            fontSize: 12,
            padding: '7px 16px',
            opacity: (!hasScript && stageItems.length === 0) || loadingScript ? 0.4 : 1,
          }}
        >
          {generating ? 'Writing...' : hasScript ? 'Script' : 'Generate Script'}
        </button>
      </div>

      <div style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 10,
        padding: '28px 28px',
        position: 'relative',
        minHeight: 120,
      }}>
        {useAI ? (
          <textarea
            value={loadingScript ? '' : script}
            onChange={e => setScript(e.target.value)}
            onBlur={handleScriptBlur}
            placeholder="Loading..."
            style={{
              width: '100%',
              minHeight: 200,
              fontFamily: font.body,
              fontSize: 15,
              lineHeight: 1.7,
              color: C.text,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              resize: 'vertical',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              margin: 0,
              padding: 0,
              display: 'block',
            }}
          />
        ) : (
          <pre style={{
            fontFamily: 'monospace',
            fontSize: 13,
            lineHeight: 1.7,
            color: C.text,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            margin: 0,
          }}>
            {loadingScript ? '' : displayScript}
          </pre>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
          <button
            onClick={() => copy(displayScript)}
            style={{
              padding: '7px 16px',
              border: `1px solid ${C.border}`,
              borderRadius: 5,
              background: 'transparent',
              color: copied ? C.accent : C.textSec,
              fontSize: 11,
              fontWeight: 600,
              fontFamily: font.body,
              cursor: 'pointer',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              transition: 'color 0.2s',
            }}
          >
            {copied ? 'Copied!' : 'Copy Script'}
          </button>
          {useAI && (
            <button
              onClick={handleGenerateAI}
              disabled={generating || stageItems.length === 0}
              title="Write a fresh script from scratch, replacing what's here"
              style={{
                padding: '7px 16px',
                border: `1px solid ${C.border}`,
                borderRadius: 5,
                background: 'transparent',
                color: C.textSec,
                fontSize: 11,
                fontWeight: 600,
                fontFamily: font.body,
                cursor: 'pointer',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                opacity: (generating || stageItems.length === 0) ? 0.4 : 1,
              }}
            >
              {generating ? 'Writing...' : 'Regenerate'}
            </button>
          )}
          {useAI && (
            <span style={{
              fontFamily: font.mono,
              fontSize: 10,
              color: C.textMuted,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              opacity: justSaved ? 1 : 0,
              transition: 'opacity 0.3s',
            }}>
              Saved
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
