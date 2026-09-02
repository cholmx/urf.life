export const CATEGORIES = [
  'Worship & Services',
  'Groups & Classes',
  'Outreach & Missions',
  'Youth & Kids',
  'Events & Fellowship',
  'Building & Facilities',
  'General Info',
] as const;

export const SCOPE_OPTIONS = [
  { value: 'whole_church', label: 'Whole Church', desc: 'Everyone needs to know' },
  { value: 'ministry', label: 'Ministry Specific', desc: 'Relevant to a group or ministry' },
  { value: 'informational', label: 'Informational', desc: 'Good to know, low urgency' },
] as const;

export const MINISTRY_OPTIONS = [
  'Men',
  'Women',
  'Youth',
  'Parents',
  'Children',
] as const;

export const HAPPENING_TYPE_OPTIONS = [
  { value: 'announcement', label: 'Announcement', desc: 'News or an update, no signup needed' },
  { value: 'event', label: 'Event', desc: 'A one-time or occasional gathering' },
  { value: 'class', label: 'Class', desc: 'An ongoing or scheduled class' },
  { value: 'general', label: 'General', desc: 'Anything else' },
] as const;

// Online RSVP is built (happening_rsvps_portal123, the public RSVP modal,
// the admin RSVP panel) but intentionally not offered as a choice right
// now - 'online' and 'both' are left out of this list on purpose. See git
// history around this line for how to bring the option back later.
export const SIGNUP_MODE_OPTIONS = [
  { value: 'none', label: 'No sign-up needed' },
  { value: 'sheet', label: 'Printable sign-up sheet' },
] as const;

export const OUTPUT_TABS = [
  { key: 'stage', label: 'Stage Script' },
  { key: 'slides', label: 'Sunday Slides' },
  { key: 'monthly', label: 'Monthly Flyer' },
  { key: 'weekly', label: 'Weekly Bulletin' },
] as const;

export const DEFAULT_ANNOUNCEMENT = {
  title: '',
  description: '',
  body: '',
  short_version: '',
  category: 'General Info',
  scope: 'ministry' as const,
  happening_type: 'announcement' as const,
  link: '',
  event_date: null as string | null,
  event_dates: [] as string[],
  event_time: '',
  end_time: '',
  is_recurring: false,
  slides_lead_weeks: 3,
  happenings_start_date: null as string | null,
  happenings_end_date: null as string | null,
  monthly_include: false,
  show_on_slides: true,
  show_in_happenings: true,
  event_location: '',
  contact_name: '',
  contact_info: '',
  slide_override: '',
  month_override: '',
  flyer_text: '',
  stage_notes: '',
  needs_signup: false,
  signup_mode: 'none' as const,
  signup_sheet_config: null,
  is_published: false,
  published_at: null as string | null,
  slide_made: false,
  status: 'draft' as const,
  assigned_to: '',
  ministry: '',
  recurrence_type: 'one_time' as const,
  recurrence_day: '',
  recurrence_end_date: null as string | null,
  recurrence_label: '',
};
