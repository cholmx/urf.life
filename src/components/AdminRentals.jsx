import React, { useState, useEffect } from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import supabase from '../lib/supabase';
import { useSupabaseCrud } from '../hooks/useSupabaseCrud';
import { useToast } from '../hooks/useToast';
import { useConfirm } from '../hooks/useConfirm';
import { formatDate, getTodayDateString } from '../utils/dateFormat';
import { SkeletonBox, LoadingTransition } from './LoadingSkeletons';

const { FiCalendar, FiUser, FiMail, FiPhone, FiDollarSign, FiMapPin, FiChevronDown, FiChevronUp, FiTrash2, FiSave, FiInbox, FiHome } = FiIcons;

function DetailRow({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{label}</span>
      <p className="text-sm text-neutral-900 whitespace-pre-wrap">{value}</p>
    </div>
  );
}

function RentalCard({ r, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-white rounded-2xl shadow-modern overflow-hidden border border-neutral-100">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between gap-4 p-5 text-left"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${r.event_type === 'community' ? 'bg-blue-50 text-blue-700' : 'bg-neutral-100 text-neutral-600'}`}>
              {r.event_type === 'community' ? 'Community' : 'Personal'}
            </span>
            {r.is_member && (
              <span className="text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-green-50 text-green-700">Member</span>
            )}
          </div>
          <h3 className="font-semibold text-neutral-900 truncate">{r.event_name}</h3>
          <p className="text-sm text-neutral-500">
            {formatDate(r.event_date, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} &middot; {r.responsible_first_name} {r.responsible_last_name}
          </p>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          <span className="font-semibold text-neutral-900">${Number(r.calculated_total).toFixed(2)}</span>
          <SafeIcon icon={expanded ? FiChevronUp : FiChevronDown} className="h-4 w-4 text-neutral-400" />
        </div>
      </button>

      {expanded && (
        <div className="border-t border-neutral-100 p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetailRow label="Purpose" value={r.purpose} />
            <DetailRow label="Guests" value={r.guest_count} />
            <DetailRow label="Event Time" value={`${r.event_start_time} - ${r.event_end_time}`} />
            <DetailRow label="Setup" value={`${r.setup_schedule === 'day_before' ? 'Day before' : 'Day of'}, ${r.setup_arrival_time} - ${r.setup_departure_time}`} />
            {r.organization_name && <DetailRow label="Organization" value={r.organization_name} />}
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Rooms &amp; Services</span>
            <p className="text-sm text-neutral-900">
              {(r.rooms_requested || []).join(', ') || 'None'}
              {r.additional_services?.length > 0 && <> &middot; {r.additional_services.join(', ')}</>}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-neutral-100">
            <div className="flex items-center gap-2 text-sm text-neutral-700">
              <SafeIcon icon={FiMail} className="h-3.5 w-3.5 text-neutral-400" />
              <a href={`mailto:${r.responsible_email}`} className="hover:underline">{r.responsible_email}</a>
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-700">
              <SafeIcon icon={FiPhone} className="h-3.5 w-3.5 text-neutral-400" />
              <span>{r.responsible_phone}</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-neutral-700 md:col-span-2">
              <SafeIcon icon={FiMapPin} className="h-3.5 w-3.5 text-neutral-400 mt-0.5 flex-shrink-0" />
              <span className="whitespace-pre-wrap">{r.return_address}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
            <p className="text-xs text-neutral-400">
              Signed {r.signature_name} &middot; {r.signature_date} &middot; Submitted {formatDate(r.created_at, { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
            <button onClick={() => onDelete(r.id)} className="admin-btn-danger" title="Delete">
              <SafeIcon icon={FiTrash2} className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const RentalsSkeleton = () => (
  <div className="space-y-3">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="bg-white rounded-2xl shadow-modern p-5">
        <SkeletonBox width="w-1/3" height="h-4" className="mb-2" />
        <SkeletonBox width="w-1/2" height="h-3" />
      </div>
    ))}
  </div>
);

const AdminRentals = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const { items, loading, deleteItem } = useSupabaseCrud('facility_rental_requests_portal123', {
    orderBy: 'event_date',
    ascending: true,
  });
  const [showPast, setShowPast] = useState(false);

  const [settingsId, setSettingsId] = useState(null);
  const [notificationEmail, setNotificationEmail] = useState('');
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('facility_rental_settings_portal123')
        .select('*')
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      if (data) {
        setSettingsId(data.id);
        setNotificationEmail(data.notification_email);
      }
    } catch (err) {
      console.error('Error fetching rental settings:', err);
    } finally {
      setLoadingSettings(false);
    }
  };

  const saveSettings = async () => {
    if (!settingsId) return;
    const emails = notificationEmail.split(',').map((e) => e.trim()).filter(Boolean);
    if (emails.length === 0 || emails.some((e) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))) {
      toast.error('Enter one or more valid email addresses, separated by commas.');
      return;
    }
    const normalized = emails.join(', ');
    setSavingSettings(true);
    try {
      const { error } = await supabase
        .from('facility_rental_settings_portal123')
        .update({ notification_email: normalized, updated_at: new Date().toISOString() })
        .eq('id', settingsId);
      if (error) throw error;
      setNotificationEmail(normalized);
      toast.success('Notification emails updated.');
    } catch (err) {
      console.error('Error saving rental settings:', err);
      toast.error('Failed to save: ' + err.message);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleDelete = async (id) => {
    if (!(await confirm('Delete this rental request permanently? This cannot be undone.'))) return;
    try {
      await deleteItem(id);
    } catch (err) {
      console.error('Error deleting rental request:', err);
      toast.error('Failed to delete: ' + err.message);
    }
  };

  const today = getTodayDateString();
  // A rental "archives" itself the moment its event date passes - no manual
  // toggle, same reasoning as the Happenings Manage/Archive split: once the
  // event has happened there's nothing left to plan for, it's just a record.
  const upcoming = items.filter((r) => r.event_date >= today).sort((a, b) => a.event_date.localeCompare(b.event_date));
  const past = items.filter((r) => r.event_date < today).sort((a, b) => b.event_date.localeCompare(a.event_date));
  const visible = showPast ? past : upcoming;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl text-text-primary">Facility Rentals</h2>
        <div className="flex items-center gap-1 bg-neutral-100 rounded-xl p-1">
          <button
            onClick={() => setShowPast(false)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${!showPast ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500'}`}
          >
            Upcoming ({upcoming.length})
          </button>
          <button
            onClick={() => setShowPast(true)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${showPast ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500'}`}
          >
            Past ({past.length})
          </button>
        </div>
      </div>

      {/* Where the /rental form's internal notification email goes - the
          renter's own confirmation always goes to the address they entered,
          this only controls the staff-facing copy. Multiple addresses are
          comma-separated and all receive the same notification. */}
      <div className="admin-card">
        <p className="admin-label">Notification Emails</p>
        <p className="text-sm text-neutral-500 mb-3">
          New rental request notifications are sent to these addresses. Separate multiple with commas.
        </p>
        {loadingSettings ? (
          <SkeletonBox width="w-64" height="h-10" />
        ) : (
          <div className="flex gap-2 max-w-md">
            <input
              type="text"
              value={notificationEmail}
              onChange={(e) => setNotificationEmail(e.target.value)}
              className="admin-input"
              placeholder="info@urfellowship.com, rentals@urfellowship.com"
            />
            <button onClick={saveSettings} disabled={savingSettings} className="admin-btn-primary flex-shrink-0">
              <SafeIcon icon={FiSave} className="h-4 w-4" />
              <span>{savingSettings ? 'Saving...' : 'Save'}</span>
            </button>
          </div>
        )}
      </div>

      <LoadingTransition isLoading={loading} skeleton={<RentalsSkeleton />}>
        {visible.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-modern p-12 text-center">
            <SafeIcon icon={showPast ? FiCalendar : FiInbox} className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-500">{showPast ? 'No past rentals.' : 'No upcoming rentals.'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {visible.map((r) => (
              <RentalCard key={r.id} r={r} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </LoadingTransition>
    </div>
  );
};

export default AdminRentals;
