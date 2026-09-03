import { C, font } from '../../lib/theme';
import { isSlideActive, formatDateNice } from '../../lib/helpers';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import type { Announcement } from '../../types';

interface SlidesTabProps {
  announcements: Announcement[];
  today: string;
  onToggleSlideMade: (id: string, value: boolean) => void;
}

export function SlidesTab({ announcements, today, onToggleSlideMade }: SlidesTabProps) {
  const active = announcements.filter(a => isSlideActive(a, today));
  const sorted = [...active].sort((a, b) => {
    const so: Record<string, number> = { whole_church: 0, ministry: 1, informational: 2 };
    return (so[a.scope] ?? 2) - (so[b.scope] ?? 2);
  });

  const doneCount = sorted.filter(a => a.slide_made).length;

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <h2 style={{ fontFamily: font.display, fontSize: 18, fontWeight: 800, color: C.text, margin: 0, letterSpacing: '-0.02em' }}>
            Sunday Slides
          </h2>
          <a
            href="https://urfslides.bolt.host"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: font.body,
              fontSize: 11,
              fontWeight: 600,
              color: C.accent,
              letterSpacing: '0.04em',
              textDecoration: 'none',
              textTransform: 'uppercase',
              opacity: 0.85,
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '0.85')}
          >
            Open Slides ↗
          </a>
        </div>
        <p style={{ fontFamily: font.mono, fontSize: 11, color: C.textMuted, margin: 0, letterSpacing: '0.03em' }}>
          {sorted.length} active
          {sorted.length > 0 && (
            <span style={{ marginLeft: 8, color: doneCount === sorted.length ? C.accent : C.textMuted }}>
              · {doneCount}/{sorted.length} made
            </span>
          )}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {sorted.length === 0 && (
          <p style={{ fontFamily: font.body, color: C.textTer, textAlign: 'center', padding: 40 }}>
            No slides active for this date.
          </p>
        )}
        {sorted.map((a, i) => (
          <SlideCard
            key={a.id}
            a={a}
            index={i}
            today={today}
            onToggle={onToggleSlideMade}
          />
        ))}
      </div>
    </div>
  );
}

function SlideCard({
  a,
  index,
  today,
  onToggle,
}: {
  a: Announcement;
  index: number;
  today: string;
  onToggle: (id: string, value: boolean) => void;
}) {
  const [copied, copy] = useCopyToClipboard();
  const headline = a.title;
  const location = a.event_location || '';
  const subtitle = a.slide_override || '';
  const contact = [a.contact_name, a.contact_info].filter(Boolean).join(', ');

  const dates: string[] = (a.event_dates && a.event_dates.length > 0)
    ? [...a.event_dates].filter(Boolean).sort()
    : a.event_date ? [a.event_date] : [];

  const copyText = [
    headline,
    subtitle || null,
    dates.length > 0 ? dates.map(d => formatDateNice(d)).join(' · ') : null,
    location || null,
    contact || null,
  ].filter(Boolean).join('\n');

  return (
    <div style={{
      background: a.slide_made ? 'rgba(255,255,255,0.04)' : C.slideBg,
      borderRadius: 10,
      padding: '20px 22px',
      position: 'relative',
      transition: 'opacity 0.2s, background 0.2s',
    }}>
      <div style={{ position: 'absolute', top: 10, right: 14, display: 'flex', gap: 8, alignItems: 'center' }}>
        {a.scope === 'whole_church' && !a.slide_made && (
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
            color: C.stageAccent, fontFamily: font.body,
          }}>
            Priority
          </span>
        )}
        <span style={{
          fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.2)', fontFamily: font.body,
        }}>
          Slide {index + 1}
        </span>
      </div>

      <div style={{
        fontFamily: font.display,
        fontSize: 18,
        fontWeight: 800,
        color: a.slide_made ? 'rgba(255,255,255,0.6)' : C.slideText,
        lineHeight: 1.3,
        marginBottom: 6,
        letterSpacing: '-0.01em',
        paddingRight: 60,
        textDecoration: a.slide_made ? 'line-through' : 'none',
        transition: 'color 0.2s',
      }}>
        {headline}
      </div>

      {subtitle && (
        <div style={{
          fontFamily: font.body,
          fontSize: 13,
          color: 'rgba(255,255,255,0.5)',
          lineHeight: 1.4,
          marginBottom: 8,
          maxWidth: 420,
        }}>
          {subtitle}
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
        {dates.map((d, i) => (
          <span key={d} style={{
            fontSize: 12, fontWeight: 600, fontFamily: font.body,
            color: 'rgba(255,255,255,0.55)', letterSpacing: '0.03em',
          }}>
            {formatDateNice(d)}
            {i < dates.length - 1 && (
              <span style={{ color: 'rgba(255,255,255,0.2)', marginLeft: 5 }}>|</span>
            )}
          </span>
        ))}
      </div>

      {location && (
        <div style={{
          fontFamily: font.body,
          fontSize: 12,
          color: 'rgba(255,255,255,0.4)',
          marginBottom: 4,
        }}>
          {location}
        </div>
      )}

      {contact && (
        <div style={{
          fontFamily: font.body,
          fontSize: 12,
          color: 'rgba(255,255,255,0.4)',
          marginBottom: 4,
        }}>
          {contact}
        </div>
      )}

      <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          onClick={() => copy(copyText)}
          style={{
            padding: '4px 12px',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 4,
            background: 'rgba(255,255,255,0.04)',
            color: copied ? C.stageAccent : 'rgba(255,255,255,0.35)',
            fontSize: 10,
            fontWeight: 600,
            fontFamily: font.body,
            cursor: 'pointer',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            transition: 'color 0.2s',
          }}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>

        <button
          onClick={() => onToggle(a.id, !a.slide_made)}
          style={{
            padding: '4px 12px',
            border: `1px solid ${a.slide_made ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: 4,
            background: a.slide_made ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
            color: a.slide_made ? C.stageAccent : 'rgba(255,255,255,0.35)',
            fontSize: 10,
            fontWeight: 600,
            fontFamily: font.body,
            cursor: 'pointer',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            transition: 'color 0.2s, background 0.2s, border-color 0.2s',
          }}
        >
          {a.slide_made ? 'Slide Made' : 'Mark Made'}
        </button>
      </div>
    </div>
  );
}
