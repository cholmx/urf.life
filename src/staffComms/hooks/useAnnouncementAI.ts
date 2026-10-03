import { useState } from 'react';
import { callAI } from '../lib/ai';
import { formatDateNice } from '../lib/helpers';
import type { Announcement } from '../types';

type FormData = Omit<Announcement, 'id' | 'created_at' | 'updated_at'> & { id?: string };
type Setter = <K extends keyof FormData>(k: K, v: FormData[K]) => void;

const AI_THRESHOLD = 2;

const SYS_BASE = `You are a church communications writer for Upper Room Fellowship, writing official church communications. This is formal in register, not a casual note or a text to a friend, and not a devotional or a reflection. Write in a restrained, dignified, professional tone. No clever transitions or constructed phrases. No em dashes. No greeting-card language. No slang. Keep it clear and direct. Always write so a first-time guest would fully understand, never use acronyms or insider shorthand without explaining them, and never assume the reader knows the building, the programs, or the people.

Open every piece of writing with a plain statement of what the event or class is - its exact name and what it's about - in the first sentence. Do not open with a reflection, a generalization about people's shared feelings or experience ("most of us," "many people," "we all," "so many of us"), a rhetorical question, or an inclusive address like "whether you are ___ or ___, this is for you." Those read as a devotional or a sales pitch, not an announcement. State facts. If you mention why something matters, say it as one plain, short sentence, not a meditation.

Every piece of concrete information given below - the exact event title, every date, every time, the location, and any named contact or leader - must appear in what you write, stated specifically. Never omit, generalize, soften, or talk around any of these details for the sake of flow, brevity, or style, even if it makes the text longer. Always name the event by its exact title at least once - never refer to it only descriptively ("this gathering," "this opportunity") without ever stating its actual name.`;

function buildContext(f: FormData): string {
  const parts = [`Title: ${f.title || '(none yet)'}`];
  if (f.description) parts.push(`Description: ${f.description}`);
  if (f.short_version) parts.push(`Short version: ${f.short_version}`);
  if (f.flyer_text) parts.push(`Description: ${f.flyer_text}`);
  if (f.event_dates && f.event_dates.filter(Boolean).length > 0) {
    parts.push(`Event dates: ${f.event_dates.filter(Boolean).sort().map(formatDateNice).join(', ')}`);
  } else if (f.event_date) {
    parts.push(`Event date: ${formatDateNice(f.event_date)}`);
  }
  if (f.event_time) parts.push(`Time: ${f.event_time}${f.end_time ? ` to ${f.end_time}` : ''}`);
  if (f.category) parts.push(`Category: ${f.category}`);
  if (f.scope) parts.push(`Scope: ${f.scope}`);
  if (f.event_location) parts.push(`Location: ${f.event_location}`);
  if (f.contact_name) parts.push(`Contact: ${f.contact_name}`);
  if (f.contact_info) parts.push(`Contact info: ${f.contact_info}`);
  if (f.stage_notes) parts.push(`Tone notes: ${f.stage_notes}`);
  return parts.join('\n');
}

interface AILoadingState {
  slide: boolean;
  flyer: boolean;
  all: boolean;
}

// Every field nullable and unvalidated on purpose - this is exactly what
// the edge function's ParseDraftSchema returns, and the caller (the form,
// which owns the field-level validation/normalization already) decides
// what's safe to apply.
export interface ParsedDraft {
  title: string | null;
  happening_type: string | null;
  recurrence_type: string | null;
  event_date: string | null;
  recurrence_end_date: string | null;
  recurrence_day: string | null;
  recurrence_week_of_month: string | null;
  event_time: string | null;
  end_time: string | null;
  event_location: string | null;
}

interface UseAnnouncementAIReturn {
  aiLoading: AILoadingState;
  hasEnoughForAI: boolean;
  generateSlide: () => Promise<void>;
  generateFlyer: () => Promise<void>;
  generateAll: () => Promise<void>;
  parsingDraft: boolean;
  parseDraft: (draftText: string) => Promise<ParsedDraft | null>;
}

export function useAnnouncementAI(
  f: FormData,
  set: Setter,
  onError: (msg: string) => void,
): UseAnnouncementAIReturn {
  const [aiLoading, setAiLoading] = useState<AILoadingState>({ slide: false, flyer: false, all: false });

  const hasEnoughForAI = f.title.length > AI_THRESHOLD || f.description.length > AI_THRESHOLD;

  const stripEmDash = (s: string) => s.replace(/\u2014/g, '-').replace(/\u2013/g, '-');

  const generateSlide = async () => {
    setAiLoading(p => ({ ...p, slide: true }));
    try {
      const result = await callAI(
        SYS_BASE + ` You write short one-liner text for a church pre-service slide. It must be a single phrase, not a full sentence, no subject, no verb, just the essential details someone needs to know at a glance. Normal sentence case (capitalize only the first word and proper nouns). No pipe characters. No em dashes. Include only: event name, date(s), time, and location if helpful. If multiple dates, list them with " + ". Keep it under 12 words total. Think billboard, not sentence. Example: "Men's Bible Study, May 6 + May 20, 7 PM, Fellowship Hall"`,
        `Write the slide/short text for this announcement. Return ONLY the text line, nothing else.\n\n${buildContext(f)}`,
      );
      const clean = stripEmDash(result.trim()).replace(/^["']|["']$/g, '');
      set('slide_override', clean);
      set('short_version', clean);
    } catch (e) {
      onError(e instanceof Error ? e.message : 'AI generation failed');
    } finally {
      setAiLoading(p => ({ ...p, slide: false }));
    }
  };

  const generateFlyer = async () => {
    setAiLoading(p => ({ ...p, flyer: true }));
    try {
      const result = await callAI(
        SYS_BASE + ` You write the description for a church announcement - this is the only description written for it, used everywhere: the weekly "Happenings" email, the monthly printed flyer and bulletin, printed invites, the public Events/Classes pages, and the calendar. Aim for under 60 words. Only go longer than that if the real, necessary details genuinely don't fit in fewer words - never pad to fill space, and never cut a real detail (date, time, location, who it's for) just to stay under the target. Write 2-4 short sentences. Be tight, not padded, but give real substance, not just a title restated. One to two sentences on what it is and what makes it worth showing up for, plus one sentence with the key practical details (when, where, who it's for) or the next step. No flowery language. No filler. Every word must earn its place.`,
        `Write the description for this announcement. Return ONLY the text, nothing else.\n\n${buildContext(f)}`,
      );
      set('flyer_text', stripEmDash(result.trim()));
    } catch (e) {
      onError(e instanceof Error ? e.message : 'AI generation failed');
    } finally {
      setAiLoading(p => ({ ...p, flyer: false }));
    }
  };

  const generateAll = async () => {
    if (!f.title) return;
    setAiLoading({ slide: true, flyer: true, all: true });
    try {
      const result = await callAI(
        SYS_BASE + ` You help write all versions of a church announcement at once. Provide two fields: "slide" (a single short phrase, not a full sentence, in normal sentence case, no pipe characters, under 12 words; include the event's exact name, dates, time, and location, think billboard, not sentence), and "flyer" (the description - the only one written, used everywhere: the weekly "Happenings" email, the monthly printed flyer and bulletin, printed invites, the public Events/Classes pages, and the calendar; aim for under 60 words, only go longer if the real details genuinely don't fit in fewer words; 2-4 short sentences; one to two on why it matters and what to expect, one on the key practical details or next step, naming the event and its date/time/location; tight, not padded).`,
        `Write all versions for this announcement:\n\n${buildContext(f)}`,
        { json: true },
      );
      const sd = (s: string) => stripEmDash(s);
      const cleaned = result.trim().replace(/```json|```/g, '').trim();
      let parsed: { slide?: string; flyer?: string };
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        // A malformed/truncated response used to get dumped straight into
        // the description field as a last resort, which is how half a JSON
        // blob ended up looking like "weird, cut-off" announcement text.
        // Surface an error instead of ever writing that into the form.
        throw new Error('AI returned an unexpected format. Try again, or use the individual Draft buttons instead.');
      }
      if (parsed.slide) {
        const slideClean = sd(parsed.slide.replace(/^["']|["']$/g, ''));
        set('slide_override', slideClean);
        set('short_version', slideClean);
      }
      if (parsed.flyer) set('flyer_text', sd(parsed.flyer));
    } catch (e) {
      onError(e instanceof Error ? e.message : 'AI generation failed');
    } finally {
      setAiLoading({ slide: false, flyer: false, all: false });
    }
  };

  const [parsingDraft, setParsingDraft] = useState(false);

  // Reads a staffer's rough, unstructured notes ("marriage class starts
  // sept 20, every other wed at 7, room 2, through november") and returns
  // the scheduling fields Claude could confidently pull out of them. Does
  // NOT touch form state itself - the caller applies (and validates) each
  // field, since AnnouncementForm already owns the normalization rules
  // (event_dates syncing, recurrence_label recompute, etc.) those fields
  // need to go through.
  const parseDraft = async (draftText: string): Promise<ParsedDraft | null> => {
    if (!draftText.trim()) return null;
    setParsingDraft(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const todayWeekday = new Date(today + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long' });
      const result = await callAI(
        `You read a church staff member's rough, informal notes about something happening at the church - an event, class, or announcement - and extract its scheduling details. Today is ${today}, a ${todayWeekday}. Resolve any relative date or day reference ("next Tuesday", "starting the 20th", "every other Wednesday") into an actual date using today as the reference point.

If no recurrence is mentioned, use "one_time". event_date and recurrence_end_date must be real ISO dates (YYYY-MM-DD) or null. event_time and end_time must be 24-hour HH:MM or null. recurrence_day only applies to weekly/biweekly, or to monthly when a weekday position is mentioned ("first Sunday", "third Wednesday") - otherwise null. recurrence_week_of_month is only set when such a weekday position is mentioned, otherwise null.

If a detail isn't stated or you aren't confident about it, return null for that field rather than guessing - a wrong guess is worse than a blank the staffer fills in themselves.`,
        `Extract the structured scheduling details from these rough notes:\n\n${draftText}`,
        { json: true, schema: 'parseDraft' },
      );
      const cleaned = result.trim().replace(/```json|```/g, '').trim();
      try {
        return JSON.parse(cleaned) as ParsedDraft;
      } catch {
        throw new Error('Could not read those notes into a structured form. Try rewording, or fill the fields in by hand.');
      }
    } catch (e) {
      onError(e instanceof Error ? e.message : 'AI parsing failed');
      return null;
    } finally {
      setParsingDraft(false);
    }
  };

  return { aiLoading, hasEnoughForAI, generateSlide, generateFlyer, generateAll, parsingDraft, parseDraft };
}
