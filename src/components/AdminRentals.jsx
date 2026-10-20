import React, { useState, useEffect } from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import supabase from '../lib/supabase';
import { useSupabaseCrud } from '../hooks/useSupabaseCrud';
import { useToast } from '../hooks/useToast';
import { useConfirm } from '../hooks/useConfirm';
import { formatDate, getTodayDateString } from '../utils/dateFormat';
import { SkeletonBox, LoadingTransition } from './LoadingSkeletons';
import { findRoomConflicts } from './rentalConflicts';
import { ROOM_OPTIONS, SERVICE_OPTIONS, DEFAULT_PRICING, mergePricing } from '../lib/rentalPricing';

const { FiCalendar, FiUser, FiMail, FiPhone, FiDollarSign, FiMapPin, FiChevronDown, FiChevronUp, FiTrash2, FiSave, FiInbox, FiHome, FiPrinter, FiArchive, FiRotateCcw, FiAlertTriangle } = FiIcons;

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function printRow(label, value) {
  if (!value) return '';
  return `<tr>
    <td style="padding:6px 14px 6px 0;font-size:12px;color:#666;white-space:nowrap;vertical-align:top;">${escapeHtml(label)}</td>
    <td style="padding:6px 0;font-size:14px;color:#111;">${escapeHtml(value)}</td>
  </tr>`;
}

// Expands a stored price_breakdown into the same per-line rows the admin
// card and the price preview on the form itself show, for the printed
// paper copy - falls back to just the one Estimated Total row for
// requests submitted before price_breakdown existed.
function breakdownPrintRows(r) {
  const b = r.price_breakdown;
  if (!b) return printRow('Estimated Total', `$${Number(r.calculated_total).toFixed(2)}`);
  const rows = [printRow('Base Fee', `$${b.baseFee.toFixed(2)} (${b.isMember ? 'Member' : 'Non-Member'})`)];
  for (const room of b.roomBreakdown) {
    rows.push(printRow(`Room: ${room.label}`, `$${room.amount.toFixed(2)} (${room.duration === 'full' ? 'Full Day' : 'Half Day'})`));
  }
  if (b.isMember && b.roomTotal > 0) {
    rows.push(printRow('Member Discount', `-$${(b.roomTotal - b.roomTotalAfterDiscount).toFixed(2)}`));
  }
  for (const svc of b.serviceBreakdown) {
    rows.push(printRow(`Service: ${svc.label}`, `$${svc.amount.toFixed(2)}`));
  }
  rows.push(printRow('Total', `$${b.total.toFixed(2)}`));
  return rows.join('');
}

// Hidden-iframe print pattern reused from AnnouncementCard.tsx's printInvite -
// builds a plain printable summary of one rental request for staff to keep
// a paper copy of (deposit tracking, coordinator handoff, etc.).
function printRentalDetails(r) {
  const rows = [
    printRow('Event Type', r.event_type === 'community' ? 'Community Event' : 'Personal Event'),
    printRow('Organization', r.organization_name),
    printRow('Event Name', r.event_name),
    printRow('Purpose', r.purpose),
    printRow('Guests', r.guest_count),
    printRow('Event Date', formatDate(r.event_date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })),
    printRow('Event Time', `${r.event_start_time} - ${r.event_end_time}`),
    printRow('Setup', `${r.setup_schedule === 'day_before' ? 'Day before the event' : 'Day of the event'}, ${r.setup_arrival_time} - ${r.setup_departure_time}`),
    printRow('Member', r.is_member ? 'Yes' : 'No'),
    printRow('Rooms Requested', (r.rooms_requested || []).join(', ') || 'None'),
    printRow('Additional Services', (r.additional_services || []).join(', ') || 'None'),
    breakdownPrintRows(r),
    printRow('Responsible Person', `${r.responsible_first_name} ${r.responsible_last_name}`),
    printRow('Email', r.responsible_email),
    printRow('Phone', r.responsible_phone),
    printRow('Return Address', r.return_address),
    printRow('Signature', `${r.signature_name} · ${r.signature_date}`),
    printRow('Submitted', formatDate(r.created_at, { month: 'long', day: 'numeric', year: 'numeric' })),
  ].join('');

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Facility Rental Request - ${escapeHtml(r.event_name)}</title>
  <style>
    @page { margin: 0.75in; }
    body { font-family: Georgia, 'Times New Roman', serif; color: #111; margin: 0; }
    h1 { font-size: 20px; margin: 0 0 4px; }
    .sub { font-size: 12px; color: #666; margin: 0 0 20px; }
    table { width: 100%; border-collapse: collapse; }
    .notes { margin-top: 28px; padding-top: 16px; border-top: 1px solid #ddd; }
    .notes h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.04em; color: #666; margin: 0 0 8px; }
    .notes p { font-size: 13px; white-space: pre-wrap; margin: 0; }
  </style>
</head>
<body>
  <h1>Facility Rental Request</h1>
  <p class="sub">Upper Room Fellowship</p>
  <table>${rows}</table>
  ${r.notes ? `<div class="notes"><h2>Staff Notes</h2><p>${escapeHtml(r.notes)}</p></div>` : ''}
</body>
</html>`;

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.top = '-10000px';
  iframe.style.left = '-10000px';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);
  const doc = iframe.contentWindow?.document;
  if (!doc) return;
  doc.open();
  doc.write(html);
  doc.close();
  setTimeout(() => {
    try { iframe.contentWindow?.focus(); iframe.contentWindow?.print(); }
    catch { /* ignore */ }
    setTimeout(() => document.body.removeChild(iframe), 1000);
  }, 400);
}

function PriceField({ label, value, onChange, compact }) {
  return (
    <div>
      {!compact && <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{label}</span>}
      <div className={`relative ${compact ? '' : 'mt-1'}`}>
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">$</span>
        <input
          type="number"
          min="0"
          step="0.01"
          value={value}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          placeholder={compact ? label : undefined}
          className="admin-input w-full pl-6"
        />
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{label}</span>
      <p className="text-sm text-neutral-900 whitespace-pre-wrap">{value}</p>
    </div>
  );
}

// Line-item view of a stored price_breakdown (see rentalPricing.js's
// calculateRentalTotal) - what the renter was actually quoted at
// submission time, independent of whatever prices happen to be now.
function PriceBreakdown({ breakdown }) {
  return (
    <div className="bg-neutral-50 rounded-xl p-4 space-y-1.5 mt-2">
      <div className="flex justify-between text-sm">
        <span className="text-neutral-600">Base Fee ({breakdown.isMember ? 'Member' : 'Non-Member'})</span>
        <span className="text-neutral-900 font-medium">${breakdown.baseFee.toFixed(2)}</span>
      </div>
      {breakdown.roomBreakdown.map((room) => (
        <div key={room.id} className="flex justify-between text-sm">
          <span className="text-neutral-600">{room.label} ({room.duration === 'full' ? 'Full Day' : 'Half Day'})</span>
          <span className="text-neutral-900 font-medium">${room.amount.toFixed(2)}</span>
        </div>
      ))}
      {breakdown.isMember && breakdown.roomTotal > 0 && (
        <div className="flex justify-between text-sm text-green-700">
          <span>Member Discount ({Math.round(breakdown.memberRoomDiscount * 100)}% off rooms)</span>
          <span>-${(breakdown.roomTotal - breakdown.roomTotalAfterDiscount).toFixed(2)}</span>
        </div>
      )}
      {breakdown.serviceBreakdown.map((svc) => (
        <div key={svc.id} className="flex justify-between text-sm">
          <span className="text-neutral-600">{svc.label}</span>
          <span className="text-neutral-900 font-medium">${svc.amount.toFixed(2)}</span>
        </div>
      ))}
      <div className="flex justify-between text-sm font-semibold pt-1.5 border-t border-neutral-200">
        <span className="text-neutral-900">Total</span>
        <span className="text-neutral-900">${breakdown.total.toFixed(2)}</span>
      </div>
    </div>
  );
}

function RentalCard({ r, conflicts, onDelete, onToggleArchive, onSaveNotes }) {
  const [expanded, setExpanded] = useState(false);
  const [notesDraft, setNotesDraft] = useState(r.notes || '');
  const [savingNotes, setSavingNotes] = useState(false);
  const notesDirty = notesDraft !== (r.notes || '');

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      await onSaveNotes(r.id, notesDraft);
    } finally {
      setSavingNotes(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-modern overflow-hidden border border-neutral-100">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between gap-4 p-5 text-left"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {!r.archived && (
              <span className="text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-red-50 text-red-600">New</span>
            )}
            <span className={`text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${r.event_type === 'community' ? 'bg-blue-50 text-blue-700' : 'bg-neutral-100 text-neutral-600'}`}>
              {r.event_type === 'community' ? 'Community' : 'Personal'}
            </span>
            {r.is_member && (
              <span className="text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-green-50 text-green-700">Member</span>
            )}
            {conflicts.length > 0 && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                <SafeIcon icon={FiAlertTriangle} className="h-3 w-3" />
                Room Conflict
              </span>
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
            {r.price_breakdown ? (
              <PriceBreakdown breakdown={r.price_breakdown} />
            ) : (
              <p className="text-sm text-neutral-900">
                {(r.rooms_requested || []).join(', ') || 'None'}
                {r.additional_services?.length > 0 && <> &middot; {r.additional_services.join(', ')}</>}
              </p>
            )}
          </div>

          {conflicts.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-amber-800 font-semibold text-sm mb-2">
                <SafeIcon icon={FiAlertTriangle} className="h-4 w-4" />
                <span>Room conflict{conflicts.length > 1 ? 's' : ''}</span>
              </div>
              <ul className="space-y-1">
                {conflicts.map((c) => (
                  <li key={c.id} className="text-sm text-amber-900">
                    {c.event_name} ({c.responsible_first_name} {c.responsible_last_name}) &middot; {c.event_start_time} - {c.event_end_time} &middot; {(c.rooms_requested || []).filter((room) => (r.rooms_requested || []).includes(room)).join(', ')}
                    {c.archived ? ' · handled' : ''}
                  </li>
                ))}
              </ul>
            </div>
          )}

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

          <div className="pt-3 border-t border-neutral-100">
            <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Staff Notes</span>
            <textarea
              value={notesDraft}
              onChange={(e) => setNotesDraft(e.target.value)}
              placeholder="Deposit received, coordinator assigned, special instructions..."
              rows={3}
              className="admin-input mt-1 w-full resize-y"
            />
            {notesDirty && (
              <button
                onClick={handleSaveNotes}
                disabled={savingNotes}
                className="admin-btn-primary mt-2 text-xs"
              >
                <SafeIcon icon={FiSave} className="h-3.5 w-3.5" />
                <span>{savingNotes ? 'Saving...' : 'Save Notes'}</span>
              </button>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
            <p className="text-xs text-neutral-400">
              Signed {r.signature_name} &middot; {r.signature_date} &middot; Submitted {formatDate(r.created_at, { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => printRentalDetails(r)} className="admin-btn-edit" title="Print">
                <SafeIcon icon={FiPrinter} className="h-4 w-4" />
              </button>
              <button onClick={() => onToggleArchive(r)} className="admin-btn-edit" title={r.archived ? 'Mark as new' : 'Mark as handled'}>
                <SafeIcon icon={r.archived ? FiRotateCcw : FiArchive} className="h-4 w-4" />
              </button>
              <button onClick={() => onDelete(r.id)} className="admin-btn-danger" title="Delete">
                <SafeIcon icon={FiTrash2} className="h-4 w-4" />
              </button>
            </div>
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
  const { items, loading, updateItem, deleteItem } = useSupabaseCrud('facility_rental_requests_portal123', {
    orderBy: 'event_date',
    ascending: true,
  });
  const [showPast, setShowPast] = useState(false);

  const [settingsId, setSettingsId] = useState(null);
  const [notificationEmail, setNotificationEmail] = useState('');
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [pricing, setPricing] = useState(DEFAULT_PRICING);
  const [savingPricing, setSavingPricing] = useState(false);

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
        setPricing(mergePricing(data.pricing));
      }
    } catch (err) {
      console.error('Error fetching rental settings:', err);
    } finally {
      setLoadingSettings(false);
    }
  };

  // Shallow-merges one field into pricing (or one room/service rate, via a
  // dotted path like 'rooms.sanctuary.half') without touching the rest.
  const updatePricingField = (path, value) => {
    setPricing((prev) => {
      const next = { ...prev, rooms: { ...prev.rooms }, services: { ...prev.services } };
      const parts = path.split('.');
      if (parts.length === 1) {
        next[parts[0]] = value;
      } else {
        const [group, id, duration] = parts;
        next[group] = { ...next[group], [id]: { ...next[group][id], [duration]: value } };
      }
      return next;
    });
  };

  const savePricing = async () => {
    if (!settingsId) return;
    setSavingPricing(true);
    try {
      const { error } = await supabase
        .from('facility_rental_settings_portal123')
        .update({ pricing, updated_at: new Date().toISOString() })
        .eq('id', settingsId);
      if (error) throw error;
      toast.success('Rental pricing updated.');
    } catch (err) {
      console.error('Error saving rental pricing:', err);
      toast.error('Failed to save: ' + err.message);
    } finally {
      setSavingPricing(false);
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

  const handleToggleArchive = async (r) => {
    try {
      await updateItem(r.id, { archived: !r.archived });
    } catch (err) {
      console.error('Error updating rental request:', err);
      toast.error('Failed to update: ' + err.message);
    }
  };

  const handleSaveNotes = async (id, notes) => {
    try {
      await updateItem(id, { notes });
      toast.success('Notes saved.');
    } catch (err) {
      console.error('Error saving rental notes:', err);
      toast.error('Failed to save notes: ' + err.message);
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

      <LoadingTransition isLoading={loading} skeleton={<RentalsSkeleton />}>
        {visible.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-modern p-12 text-center">
            <SafeIcon icon={showPast ? FiCalendar : FiInbox} className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-500">{showPast ? 'No past rentals.' : 'No upcoming rentals.'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {visible.map((r) => (
              <RentalCard key={r.id} r={r} conflicts={findRoomConflicts(r, items)} onDelete={handleDelete} onToggleArchive={handleToggleArchive} onSaveNotes={handleSaveNotes} />
            ))}
          </div>
        )}
      </LoadingTransition>

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

      {/* Dollar amounts the /rental form's price preview and calculated_total
          use. Room/service ids and labels stay fixed in rentalPricing.js -
          only what each one costs lives here. */}
      <div className="admin-card">
        <p className="admin-label">Rental Pricing</p>
        <p className="text-sm text-neutral-500 mb-4">
          Changes apply to new requests only - past submissions keep the price breakdown they were quoted at.
        </p>
        {loadingSettings ? (
          <SkeletonBox width="w-full" height="h-40" />
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <PriceField label="Base Fee (Member)" value={pricing.baseFeeMember} onChange={(v) => updatePricingField('baseFeeMember', v)} />
              <PriceField label="Base Fee (Non-Member)" value={pricing.baseFeeNonMember} onChange={(v) => updatePricingField('baseFeeNonMember', v)} />
              <PriceField label="Deposit" value={pricing.depositAmount} onChange={(v) => updatePricingField('depositAmount', v)} />
              <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Member Room Discount (%)</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={Math.round(pricing.memberRoomDiscount * 100)}
                  onChange={(e) => updatePricingField('memberRoomDiscount', (Number(e.target.value) || 0) / 100)}
                  className="admin-input mt-1 w-full"
                />
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400 block mb-2">Room Rates</span>
              <div className="space-y-2">
                {ROOM_OPTIONS.map((room) => (
                  <div key={room.id} className="grid grid-cols-3 gap-3 items-center">
                    <span className="text-sm text-neutral-700">{room.label}</span>
                    <PriceField label="Half Day" value={pricing.rooms[room.id]?.half ?? 0} onChange={(v) => updatePricingField(`rooms.${room.id}.half`, v)} compact />
                    <PriceField label="Full Day" value={pricing.rooms[room.id]?.full ?? 0} onChange={(v) => updatePricingField(`rooms.${room.id}.full`, v)} compact />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400 block mb-2">Service Rates (Sanctuary rentals only)</span>
              <div className="space-y-2">
                {SERVICE_OPTIONS.map((svc) => (
                  <div key={svc.id} className="grid grid-cols-3 gap-3 items-center">
                    <span className="text-sm text-neutral-700">{svc.label}</span>
                    <PriceField label="Half Day" value={pricing.services[svc.id]?.half ?? 0} onChange={(v) => updatePricingField(`services.${svc.id}.half`, v)} compact />
                    <PriceField label="Full Day" value={pricing.services[svc.id]?.full ?? 0} onChange={(v) => updatePricingField(`services.${svc.id}.full`, v)} compact />
                  </div>
                ))}
              </div>
            </div>

            <button onClick={savePricing} disabled={savingPricing} className="admin-btn-primary">
              <SafeIcon icon={FiSave} className="h-4 w-4" />
              <span>{savingPricing ? 'Saving...' : 'Save Pricing'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRentals;
