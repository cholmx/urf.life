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

export function StageTab({ announcements, today, onError }: StageTabProps) {
  const [generating, setGenerating] = useState(false);
  const [script, setScript] = useState('');
  const [loadingScript, setLoadingScript] = useState(true);
  const [useAI, setUseAI] = useState(false);
  const [copied, copy] = useCopyToClipboard();

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
      .eq('week_date', today)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.content) {
          setScript(data.content);
          setUseAI(true);
        }
        setLoadingScript(false);
      });
  }, [today]);

  const saveScript = async (content: string) => {
    await supabase.from('staff_generated_scripts_portal123').upsert(
      { type: 'stage', week_date: today, content },
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

  const displayScript = useAI ? script : buildRawNotes();

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
          Only "Whole Church" scope announcements appear here. Use Raw Notes for reference, or Generate Script for a ready-to-read version.
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
          onClick={handleGenerateAI}
          disabled={generating || stageItems.length === 0 || loadingScript}
          style={{
            ...(useAI ? { ...btnPrimary, background: C.stageAccent } : btnGhost),
            fontSize: 12,
            padding: '7px 16px',
            opacity: (stageItems.length === 0 || loadingScript) ? 0.4 : 1,
          }}
        >
          {generating ? 'Writing...' : 'Generate Script'}
        </button>
      </div>

      <div style={{
        background: useAI ? C.stageBg : C.card,
        border: `1px solid ${useAI ? 'transparent' : C.border}`,
        borderRadius: 10,
        padding: '28px 28px',
        position: 'relative',
        minHeight: 120,
      }}>
        <pre style={{
          fontFamily: useAI ? font.body : 'monospace',
          fontSize: useAI ? 15 : 13,
          lineHeight: 1.7,
          color: useAI ? C.stageText : C.text,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          margin: 0,
        }}>
          {loadingScript ? '' : displayScript}
        </pre>
        <button
          onClick={() => copy(displayScript)}
          style={{
            marginTop: 16,
            padding: '7px 16px',
            border: `1px solid ${useAI ? 'rgba(255,255,255,0.12)' : C.border}`,
            borderRadius: 5,
            background: useAI ? 'rgba(255,255,255,0.06)' : 'transparent',
            color: copied
              ? (useAI ? C.stageAccent : C.accent)
              : (useAI ? 'rgba(255,255,255,0.5)' : C.textSec),
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
      </div>
    </div>
  );
}
