import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiMenu, FiX, FiSearch, FiArrowRight } = FiIcons;

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Events', path: '/events' },
    { name: 'Opportunities', path: '/ministries' },
    { name: 'Contact', path: '/contact' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav
        className={`sticky top-0 z-50 bg-accent transition-all duration-300 ${
          scrolled ? 'backdrop-blur-md bg-accent/90 border-b border-black/5 shadow-sm' : 'border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-3 group">
              <img
                src="/logo.png"
                alt="Upper Room Fellowship"
                className="h-10 w-auto"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden items-center space-x-2">
                <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm font-gsans">UR</span>
                </div>
                <span className="text-xl font-bold text-text-primary font-gsans uppercase">Upper Room Fellowship</span>
              </div>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold font-caladea italic transition-all duration-200 ${
                    isActive(item.path)
                      ? 'text-primary bg-primary/10'
                      : 'text-text-primary hover:text-primary hover:bg-primary/8'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                to="/search"
                className="p-2 ml-1 rounded-lg text-text-primary hover:text-primary hover:bg-primary/8 transition-all duration-200"
                title="Search"
              >
                <SafeIcon icon={FiSearch} className="h-4 w-4" />
              </Link>
              <Link
                to="/give"
                className="group inline-flex items-center gap-2 bg-primary text-white font-ui font-semibold text-sm px-5 py-2.5 rounded-full transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                Give
                <SafeIcon icon={FiArrowRight} className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-1">
              <Link
                to="/search"
                className="p-2 rounded-lg text-text-primary hover:text-primary hover:bg-primary/10 transition-all duration-200"
                title="Search"
              >
                <SafeIcon icon={FiSearch} className="h-5 w-5" />
              </Link>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg text-text-primary hover:text-primary hover:bg-primary/10 transition-all duration-200"
                aria-label={isOpen ? 'Close menu' : 'Open menu'}
              >
                <SafeIcon icon={isOpen ? FiX : FiMenu} className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="md:hidden bg-white/95 backdrop-blur-md border-t border-black/5"
          >
            <div className="px-3 pt-2 pb-4 space-y-0.5">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-semibold font-caladea italic transition-all duration-200 ${
                    isActive(item.path)
                      ? 'text-primary bg-primary/10'
                      : 'text-text-primary hover:text-primary hover:bg-primary/8'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                to="/give"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center px-3 py-2.5 mt-1 rounded-lg text-sm font-semibold font-ui bg-primary text-white"
              >
                Give
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
