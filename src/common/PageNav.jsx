import { Link } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from './SafeIcon';

const { FiHome, FiSearch } = FiIcons;

// Every public page used to carry its own copy of the "Back to Home"
// corner button, with no way to reach Search short of going back to Home
// first and knowing to look for it among the quick links. Centralizing it
// here gives every page the same two-tap reach (Home, Search) and means a
// future addition to this cluster only has to change in one place.
// hideSearch is for the Search page itself, which shouldn't link to itself.
export default function PageNav({ hideSearch = false }) {
  return (
    <div className="fixed top-6 right-6 z-50 flex items-center gap-3">
      {!hideSearch && (
        <Link
          to="/search"
          className="inline-flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95 bg-white"
          title="Search"
        >
          <SafeIcon icon={FiSearch} className="h-5 w-5" style={{ color: '#cc4733' }} />
        </Link>
      )}
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
