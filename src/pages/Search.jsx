import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { searchSite } from '../utils/siteSearch';

const { FiSearch, FiHome, FiInbox } = FiIcons;

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [inputValue, setInputValue] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const runSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    try {
      const data = await searchSite(query);
      setResults(data);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }, []);

  useEffect(() => {
    runSearch(initialQuery);
  }, [initialQuery, runSearch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSearchParams(inputValue.trim() ? { q: inputValue.trim() } : {});
  };

  const groupedResults = results.reduce((groups, result) => {
    if (!groups[result.label]) groups[result.label] = [];
    groups[result.label].push(result);
    return groups;
  }, {});

  return (
    <div className="min-h-screen bg-accent py-12 relative">
      <div className="fixed top-6 right-6 z-50">
        <Link
          to="/"
          className="inline-flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
          style={{ backgroundColor: '#83A682' }}
          title="Back to Home"
        >
          <SafeIcon icon={FiHome} className="h-5 w-5 text-white" />
        </Link>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center justify-center space-x-4 mb-1"
          >
            <SafeIcon icon={FiSearch} className="h-8 w-8 text-primary" />
            <h1 className="text-3xl md:text-4xl">Search</h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-base page-subtitle"
          >
            Find announcements, sermons, events, classes, resources, and more
          </motion.p>
        </div>

        <form onSubmit={handleSubmit} className="mb-10">
          <div className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search the site..."
              autoFocus
              className="w-full px-5 py-4 pr-14 rounded-2xl border border-accent shadow-modern text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-primary text-white hover:bg-primary-dark transition-colors"
              title="Search"
            >
              <SafeIcon icon={FiSearch} className="h-4 w-4" />
            </button>
          </div>
        </form>

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-text-primary font-inter">Searching...</p>
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-modern p-16 text-center"
          >
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <SafeIcon icon={FiInbox} className="h-9 w-9 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-text-primary mb-2">No Results</h2>
            <p className="text-text-light max-w-xs mx-auto">
              Nothing matched "{initialQuery}". Try a different word or phrase.
            </p>
          </motion.div>
        )}

        {!loading && results.length > 0 && (
          <div className="space-y-8">
            {Object.entries(groupedResults).map(([label, items]) => (
              <div key={label}>
                <h2 className="text-sm font-bold uppercase tracking-wide text-text-light mb-3">{label}</h2>
                <div className="bg-white rounded-2xl shadow-modern divide-y divide-accent overflow-hidden">
                  {items.map((item) => (
                    <Link
                      key={`${item.type}-${item.id}`}
                      to={item.url}
                      className="block p-5 hover:bg-accent/40 transition-colors"
                    >
                      <h3 className="text-lg text-text-primary mb-1">{item.title}</h3>
                      {item.snippet && (
                        <p className="text-sm text-text-light">{item.snippet}</p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
