import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useErrorToast } from '../components/ui/ErrorToast';
import { getAutoHappeningsStartDate, getAutoHappeningsEndDate, isArchived } from '../lib/helpers';
import type { Announcement } from '../types';

// Shared happenings state, lifted out of the old single StaffCommsApp so the
// Manage/Calendar/Outputs/Archive views can live as separate top-level admin
// pages while still sharing one fetch, one preview date, and one toast queue.
export function useHappeningsData(enabled: boolean, onNavigateToManage?: () => void) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Announcement | 'new' | null>(null);
  const [copySource, setCopySource] = useState<Omit<Announcement, 'id' | 'created_at' | 'updated_at'> | null>(null);
  const [today, setToday] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const { toasts, showError, showSuccess, dismissToast } = useErrorToast();

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('staff_announcements_portal123')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) showError('Failed to load announcements.');
    else if (data) setAnnouncements(data as Announcement[]);
    setLoading(false);
  }, [showError]);

  useEffect(() => {
    if (enabled) fetchAnnouncements();
  }, [enabled, fetchAnnouncements]);

  const handleSave = async (f: Omit<Announcement, 'id' | 'created_at' | 'updated_at'> & { id?: string }) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      showError('Session expired. Please sign back in.');
      return;
    }
    const announcementLike = { ...f, id: f.id ?? '' } as Announcement;
    const payload = {
      title: f.title,
      body: f.body,
      description: f.description,
      short_version: f.short_version,
      category: f.category,
      scope: f.scope,
      happening_type: f.happening_type || 'announcement',
      link: f.link || '',
      event_date: f.event_date || null,
      event_time: f.event_time || null,
      end_time: f.end_time || '',
      is_recurring: f.is_recurring,
      slides_lead_weeks: f.slides_lead_weeks,
      happenings_start_date: getAutoHappeningsStartDate(announcementLike, today),
      happenings_end_date: getAutoHappeningsEndDate(announcementLike),
      monthly_include: f.monthly_include,
      show_on_slides: f.show_on_slides,
      show_in_happenings: f.show_in_happenings,
      contact_name: f.contact_name,
      contact_info: f.contact_info,
      slide_override: f.slide_override,
      month_override: f.month_override,
      flyer_text: f.flyer_text,
      stage_notes: f.stage_notes,
      needs_signup: f.needs_signup,
      signup_mode: f.signup_mode || 'none',
      signup_sheet_config: f.signup_sheet_config ?? null,
      is_published: f.is_published,
      published_at: f.is_published ? (f.published_at || new Date().toISOString()) : f.published_at,
      event_location: f.event_location,
      event_dates: f.event_dates,
      slide_made: f.slide_made,
      status: f.status,
      assigned_to: f.assigned_to,
      ministry: f.scope === 'ministry' ? (f.ministry || '') : '',
      recurrence_type: f.recurrence_type || 'one_time',
      recurrence_day: f.recurrence_day || '',
      recurrence_end_date: f.recurrence_end_date || null,
      recurrence_label: f.recurrence_label || '',
    };

    if (f.id && f.id !== 'new') {
      const { error } = await supabase
        .from('staff_announcements_portal123')
        .update(payload)
        .eq('id', f.id);
      if (error) showError(`Failed to save announcement: ${error.message}`);
      else setAnnouncements(prev => prev.map(a => a.id === f.id ? { ...a, ...payload } : a));
    } else {
      const { data, error } = await supabase
        .from('staff_announcements_portal123')
        .insert(payload)
        .select()
        .single();
      if (error) showError(`Failed to create announcement: ${error.message}`);
      else if (data) setAnnouncements(prev => [data as Announcement, ...prev]);
    }
  };

  const handleCopyFromArchive = (a: Announcement) => {
    const { id: _id, created_at: _c, updated_at: _u, ...rest } = a;
    setCopySource({
      ...rest,
      event_date: null,
      event_dates: [],
      happenings_start_date: null,
      happenings_end_date: null,
      slide_made: false,
      status: 'draft',
    });
    setEditing('new');
    onNavigateToManage?.();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('staff_announcements_portal123').delete().eq('id', id);
    if (error) showError('Failed to delete announcement.');
    else setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  const handleToggleSlideMade = async (id: string, value: boolean) => {
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, slide_made: value } : a));
    const { error } = await supabase.from('staff_announcements_portal123').update({ slide_made: value }).eq('id', id);
    if (error) {
      showError('Failed to update slide status.');
      setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, slide_made: !value } : a));
    }
  };

  const handleApprove = async (id: string) => {
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, status: 'approved' } : a));
    const { error } = await supabase.from('staff_announcements_portal123').update({ status: 'approved' }).eq('id', id);
    if (error) {
      showError('Failed to approve announcement.');
      setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, status: 'draft' } : a));
    }
  };

  // Toggles a happening's visibility on the public site in place - no more
  // copying into a separate table. published_at is stamped the first time
  // a happening is published and preserved across later unpublish/
  // republish cycles, so republishing doesn't make it look brand new.
  const handleTogglePublish = async (a: Announcement) => {
    const nextPublished = !a.is_published;
    const nextPublishedAt = nextPublished ? (a.published_at || new Date().toISOString()) : a.published_at;
    setAnnouncements(prev => prev.map(x => x.id === a.id ? { ...x, is_published: nextPublished, published_at: nextPublishedAt } : x));
    const { error } = await supabase
      .from('staff_announcements_portal123')
      .update({ is_published: nextPublished, published_at: nextPublishedAt })
      .eq('id', a.id);
    if (error) {
      showError('Failed to update publish status.');
      setAnnouncements(prev => prev.map(x => x.id === a.id ? { ...x, is_published: a.is_published, published_at: a.published_at } : x));
    } else {
      showSuccess(nextPublished ? 'Published to the public site.' : 'Unpublished from the public site.');
    }
  };

  const activeAnnouncements = announcements.filter(a => !isArchived(a, today));
  const archivedAnnouncements = announcements.filter(a => isArchived(a, today));

  return {
    announcements, activeAnnouncements, archivedAnnouncements, loading,
    today, setToday,
    editing, setEditing, copySource, setCopySource,
    handleSave, handleDelete, handleApprove, handleTogglePublish, handleToggleSlideMade, handleCopyFromArchive,
    toasts, showError, showSuccess, dismissToast,
  };
}
