import React, { useState, useRef, useEffect } from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { useAdminNotifications } from '../../hooks/useAdminNotifications';

const { FiBell, FiX } = FiIcons;

// Shown in both the desktop sidebar header and the mobile top bar in
// Admin.jsx - a single bell driven by one shared hook so the two spots
// never disagree on the count. align="left" opens the dropdown rightward
// (for the narrow sidebar, which has no room to the left) vs the default
// right-anchored dropdown (fits fine in the full-width mobile bar).
const NotificationBell = ({ onSelect, align = 'right' }) => {
  const { counts, total, refresh, dismiss, dismissAll, sources } = useAdminNotifications(true);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const toggleOpen = () => {
    if (!open) refresh();
    setOpen((v) => !v);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggleOpen}
        className="relative p-2 text-white/70 hover:text-white transition-colors"
        aria-label="Notifications"
        title="New submissions"
      >
        <SafeIcon icon={FiBell} className="h-4 w-4" />
        {total > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
            {total > 9 ? '9+' : total}
          </span>
        )}
      </button>

      {open && (
        <div className={`absolute ${align === 'left' ? 'left-0' : 'right-0'} mt-2 w-64 bg-white rounded-xl shadow-modern-lg border border-neutral-100 py-2 z-50 text-left`}>
          <div className="flex items-center justify-between px-3 pb-2 mb-1 border-b border-neutral-100">
            <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">New Submissions</span>
            {total > 0 && (
              <button onClick={dismissAll} className="text-xs text-primary hover:underline">
                Dismiss all
              </button>
            )}
          </div>
          {sources.map((s) => (
            <div key={s.key} className="flex items-center group">
              <button
                onClick={() => { setOpen(false); onSelect(s.key); }}
                className="flex-1 flex items-center justify-between px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors text-left"
              >
                <span>{s.label}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${counts[s.key] > 0 ? 'bg-red-50 text-red-600' : 'bg-neutral-100 text-neutral-400'}`}>
                  {counts[s.key] || 0}
                </span>
              </button>
              {counts[s.key] > 0 && (
                <button
                  onClick={() => dismiss(s.key)}
                  className="px-2 text-neutral-300 hover:text-neutral-600 transition-colors"
                  title={`Dismiss ${s.label} notifications`}
                >
                  <SafeIcon icon={FiX} className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
