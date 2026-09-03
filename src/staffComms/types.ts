export type RecurrenceType = 'one_time' | 'date_range' | 'weekly';
export type HappeningType = 'event' | 'class' | 'announcement' | 'general';
export type SignupMode = 'none' | 'online' | 'sheet' | 'both';

export interface SignupSheetConfig {
  title: string;
  showDateTime: boolean;
  dateTimeLabel: string;
  instructions: string;
  columns: { name: string; width: number }[];
  rows: number;
  accentColor: string;
}

export interface Announcement {
  id: string;
  title: string;
  description: string;
  body: string;
  short_version: string;
  category: string;
  scope: 'whole_church' | 'ministry' | 'informational';
  happening_type: HappeningType;
  link: string;
  event_date: string | null;
  event_dates: string[];
  event_time: string;
  end_time: string;
  is_recurring: boolean;
  slides_lead_weeks: number;
  happenings_start_date: string | null;
  happenings_end_date: string | null;
  monthly_include: boolean;
  show_on_slides: boolean;
  show_in_happenings: boolean;
  event_location: string;
  contact_name: string;
  contact_info: string;
  slide_override: string;
  month_override: string;
  flyer_text: string;
  stage_notes: string;
  slide_made: boolean;
  needs_signup: boolean;
  signup_mode: SignupMode;
  signup_sheet_config: SignupSheetConfig | null;
  is_published: boolean;
  published_at: string | null;
  status: 'draft' | 'approved';
  assigned_to: string;
  ministry: string;
  recurrence_type: RecurrenceType;
  recurrence_day: string;
  recurrence_end_date: string | null;
  recurrence_label: string;
  created_at?: string;
  updated_at?: string;
}

export type OutputTab = 'stage' | 'slides' | 'happenings' | 'monthly' | 'weekly';

export const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft', desc: 'Still being written' },
  { value: 'approved', label: 'Approved', desc: 'Cleared for use' },
] as const;
