import { useState, useEffect, useCallback } from 'react';
import supabase from '../lib/supabase';

// A row only ever counts as "new" while it's unarchived (archiving it in
// Submissions/Rentals still means "I've handled this") AND it was created
// after this source was last dismissed from the bell - dismissing just
// clears the alert, it doesn't archive/hide the real submissions, so a
// genuinely new one coming in afterward still lights the bell back up.
const SOURCES = [
  { key: 'contact', table: 'contact_messages_portal123', label: 'Contact' },
  { key: 'realm', table: 'realm_signups_portal123', label: 'Join Realm' },
  { key: 'tableGroups', table: 'table_group_signups_portal123', label: 'Table Groups' },
  { key: 'rentals', table: 'facility_rental_requests_portal123', label: 'Facility Rentals' },
];

const POLL_MS = 30000;
const STORAGE_KEY = 'admin_notification_dismissals';

// Per-browser, not synced across devices/staff - a notification-clearing
// preference, not data, so this is an acceptable trade-off for not needing
// a new table/column just to track it.
function readDismissals() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function writeDismissals(dismissals) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dismissals));
  } catch {
    /* ignore - private browsing, storage blocked, etc. */
  }
}

export function useAdminNotifications(enabled) {
  const [counts, setCounts] = useState({ contact: 0, realm: 0, tableGroups: 0, rentals: 0 });

  const refresh = useCallback(async () => {
    if (!enabled) return;
    try {
      const dismissals = readDismissals();
      const results = await Promise.all(
        SOURCES.map(({ key, table }) => {
          let query = supabase.from(table).select('id', { count: 'exact', head: true }).eq('archived', false);
          if (dismissals[key]) query = query.gt('created_at', dismissals[key]);
          return query;
        })
      );
      const next = {};
      SOURCES.forEach(({ key }, i) => { next[key] = results[i].count || 0; });
      setCounts(next);
    } catch (err) {
      console.error('Error fetching admin notification counts:', err);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    refresh();
    const interval = setInterval(refresh, POLL_MS);
    return () => clearInterval(interval);
  }, [enabled, refresh]);

  const dismiss = useCallback((key) => {
    const dismissals = readDismissals();
    dismissals[key] = new Date().toISOString();
    writeDismissals(dismissals);
    setCounts((prev) => ({ ...prev, [key]: 0 }));
  }, []);

  const dismissAll = useCallback(() => {
    const now = new Date().toISOString();
    const dismissals = readDismissals();
    SOURCES.forEach(({ key }) => { dismissals[key] = now; });
    writeDismissals(dismissals);
    setCounts({ contact: 0, realm: 0, tableGroups: 0, rentals: 0 });
  }, []);

  const total = SOURCES.reduce((sum, { key }) => sum + (counts[key] || 0), 0);

  return { counts, total, refresh, dismiss, dismissAll, sources: SOURCES };
}
