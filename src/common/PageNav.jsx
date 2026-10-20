import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from './SafeIcon';

const { FiHome, FiMenu, FiMail, FiCalendar, FiFileText, FiMic, FiHeadphones, FiCreditCard, FiUsers, FiKey, FiUserPlus, FiBookOpen, FiSearch } = FiIcons;

// Everywhere people actually want to go from any page, not just Home -
// mirrors Home.jsx's own primary/quick-link buttons, minus the ones that
// only show there when there's actually content behind them (Classes,
// Events) since this nav has no way to check that without a query on
// every single page load.
const NAV_LINKS = [
  { title: 'The Happenings', icon: FiMail, path: '/announcements' },
  { title: 'Calendar', icon: FiCalendar, path: '/calendar' },
  { title: 'Sermon Blog', icon: FiFileText, path: '/sermon-blog' },
  { title: 'Shine Podcast', icon: FiMic, path: '/shine-podcast' },
  { title: 'Sermon Podcast', icon: FiHeadphones, path: '/sermon-podcast' },
  { title: 'Give', icon: FiCreditCard, path: 'https://onrealm.org/urfellowship/-/form/give/now', external: true },
  { title: 'Table Group Sign-Up', icon: FiUsers, path: '/table-group-signup' },
  { title: 'Facility Rental', icon: FiKey, path: '/rental' },
  { title: 'Join Realm', icon: FiUserPlus, path: '/join-realm' },
  { title: 'Resources', icon: FiBookOpen, path: '/resources' },
  { title: 'Contact', icon: FiMail, path: '/contact' },
];

// Every public page used to carry its own copy of the "Back to Home"
// corner button, with search reachable only via its own matching icon.
// That left no way to jump straight to any other page short of going
// back Home first. Centralizing it here gives every page the same
// one-tap reach into the whole site, plus Home, from one corner.
// hideSearch drops the Search entry for the Search page itself, which
// shouldn't link to itself.
export default function PageNav({ hideSearch = false }) {
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

  return (
    <div className="fixed top-6 right-6 z-50 flex items-center gap-3">
      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95"
          style={{ backgroundColor: '#E2BA49' }}
          title="Menu"
          aria-label="Site navigation"
        >
          <SafeIcon icon={FiMenu} className="h-5 w-5" style={{ color: '#1E1E21' }} />
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-modern-lg border border-neutral-100 py-2 z-50 text-left">
            {NAV_LINKS.map((item) => {
              const linkClasses = 'flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors';
              const inner = (
                <>
                  <SafeIcon icon={item.icon} className="h-4 w-4 flex-shrink-0 text-neutral-400" />
                  <span>{item.title}</span>
                </>
              );
              return item.external ? (
                <a key={item.path} href={item.path} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} className={linkClasses}>
                  {inner}
                </a>
              ) : (
                <Link key={item.path} to={item.path} onClick={() => setOpen(false)} className={linkClasses}>
                  {inner}
                </Link>
              );
            })}
            {!hideSearch && (
              <Link
                to="/search"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors border-t border-neutral-100 mt-1 pt-2.5"
              >
                <SafeIcon icon={FiSearch} className="h-4 w-4 flex-shrink-0 text-neutral-400" />
                <span>Search</span>
              </Link>
            )}
          </div>
        )}
      </div>
      <Link
        to="/"
        className="inline-flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95"
        style={{ backgroundColor: '#cc4733' }}
        title="Back to Home"
      >
        <SafeIcon icon={FiHome} className="h-5 w-5 text-white" />
      </Link>
    </div>
  );
}
