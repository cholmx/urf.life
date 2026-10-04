import { useState, useEffect, useCallback } from 'react';
import supabase from '../lib/supabase';

// "New" reuses the same `archived` flag every submissions list already
// shows a "N new" count from - an unarchived row is one nobody's dealt
// with yet, across all four public forms. No separate read/seen tracking
// needed, and archiving (the action staff already take) is what clears it.
const SOURCES = [
  { key: 'contact', table: 'contact_messages_portal123', label: 'Contact' },
  { key: 'realm', table: 'realm_signups_portal123', label: 'Join Realm' },
  { key: 'tableGroups', table: 'table_group_signups_portal123', label: 'Table Groups' },
  { key: 'rentals', table: 'facility_rental_requests_portal123', label: 'Facility Rentals' },
];

const POLL_MS = 30000;

export function useAdminNotifications(enabled) {
  const [counts, setCounts] = useState({ contact: 0, realm: 0, tableGroups: 0, rentals: 0 });

  const refresh = useCallback(async () => {
    if (!enabled) return;
    try {
      const results = await Promise.all(
        SOURCES.map(({ table }) =>
          supabase.from(table).select('id', { count: 'exact', head: true }).eq('archived', false)
        )
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

  const total = SOURCES.reduce((sum, { key }) => sum + (counts[key] || 0), 0);

  return { counts, total, refresh, sources: SOURCES };
}
