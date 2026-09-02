import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import supabase from '../lib/supabase';
import { parseLocalDate } from '../utils/dateFormat';

const { FiBookOpen, FiCalendar, FiChevronLeft, FiChevronRight, FiRefreshCw } = FiIcons;

const DailyDevotional = () => {
  const [currentDevotional, setCurrentDevotional] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [availableDates, setAvailableDates] = useState([]);

  useEffect(() => {
    fetchAvailableDates();
  }, []);

  useEffect(() => {
    if (availableDates.length > 0) {
      fetchDevotionalForDate(selectedDate);
    }
  }, [selectedDate, availableDates]);

  const fetchAvailableDates = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_devotionals_portal123')
        .select('devotional_date')
        .order('devotional_date', { ascending: true });

      if (error) throw error;
      
      const dates = data.map(item => parseLocalDate(item.devotional_date));
      setAvailableDates(dates);
      
      // Set initial date to today if available, otherwise first available date
      const today = new Date();
      const todayString = formatDateForComparison(today);
      const hasToday = data.some(item => item.devotional_date === todayString);
      
      if (hasToday) {
        setSelectedDate(today);
      } else if (dates.length > 0) {
        setSelectedDate(dates[0]);
      }
    } catch (error) {
      console.error('Error fetching available dates:', error);
    }
  };

  const fetchDevotionalForDate = async (date) => {
    setLoading(true);
    try {
      const dateString = formatDateForComparison(date);
      
      const { data, error } = await supabase
        .from('daily_devotionals_portal123')
        .select('*')
        .eq('devotional_date', dateString)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw error;
      }
      
      setCurrentDevotional(data || null);
    } catch (error) {
      console.error('Error fetching devotional:', error);
      setCurrentDevotional(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDateForComparison = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDateDisplay = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const navigateDate = (direction) => {
    const currentIndex = availableDates.findIndex(
      date => formatDateForComparison(date) === formatDateForComparison(selectedDate)
    );
    
    if (direction === 'prev' && currentIndex > 0) {
      setSelectedDate(availableDates[currentIndex - 1]);
    } else if (direction === 'next' && currentIndex < availableDates.length - 1) {
      setSelectedDate(availableDates[currentIndex + 1]);
    }
  };

  const goToToday = () => {
    const today = new Date();
    const todayString = formatDateForComparison(today);
    const hasToday = availableDates.some(date => formatDateForComparison(date) === todayString);
    
    if (hasToday) {
      setSelectedDate(today);
    }
  };

  const canNavigatePrev = () => {
    const currentIndex = availableDates.findIndex(
      date => formatDateForComparison(date) === formatDateForComparison(selectedDate)
    );
    return currentIndex > 0;
  };

  const canNavigateNext = () => {
    const currentIndex = availableDates.findIndex(
      date => formatDateForComparison(date) === formatDateForComparison(selectedDate)
    );
    return currentIndex < availableDates.length - 1;
  };

  if (availableDates.length === 0 && !loading) {
    return null; // Don't show component if no devotionals are available
  }

  if (loading && availableDates.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-md p-6"
      >
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="bg-white rounded-lg shadow-md overflow-hidden border-l-4 border-secondary"
    >
      {/* Header with Navigation */}
      <div className="bg-secondary text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiBookOpen} className="h-5 w-5" />
            <h3 className="text-lg font-semibold font-inter">Daily Devotional</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateDate('prev')}
              disabled={!canNavigatePrev()}
              className="p-1 rounded hover:bg-secondary-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <SafeIcon icon={FiChevronLeft} className="h-4 w-4" />
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1 text-xs bg-secondary-light rounded hover:bg-secondary-400 transition-colors font-inter"
            >
              Today
            </button>
            <button
              onClick={() => navigateDate('next')}
              disabled={!canNavigateNext()}
              className="p-1 rounded hover:bg-secondary-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <SafeIcon icon={FiChevronRight} className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        ) : currentDevotional ? (
          <div className="space-y-4">
            {/* Date */}
            <div className="flex items-center space-x-2 text-sm text-text-light">
              <SafeIcon icon={FiCalendar} className="h-4 w-4" />
              <span className="font-inter">{formatDateDisplay(selectedDate)}</span>
            </div>

            {/* Title */}
            <h4 className="text-xl font-bold text-text-primary font-inter">
              {currentDevotional.title}
            </h4>

            {/* Subtitle */}
            {currentDevotional.subtitle && (
              <h5 className="text-lg font-semibold text-primary font-inter">
                {currentDevotional.subtitle}
              </h5>
            )}

            {/* Scripture Reference */}
            {currentDevotional.scripture_reference && (
              <p className="text-sm font-medium text-text-primary italic font-inter">
                {currentDevotional.scripture_reference}
              </p>
            )}

            {/* Content */}
            {currentDevotional.content && (
              <div className="text-text-primary leading-relaxed font-inter">
                {currentDevotional.content.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-3">
                    {paragraph}
                  </p>
                ))}
              </div>
            )}

            {/* Response */}
            {currentDevotional.response && (
              <div className="bg-accent p-4 rounded-lg">
                <h6 className="font-semibold text-text-primary mb-2 font-inter">Response:</h6>
                <p className="text-text-primary font-inter">{currentDevotional.response}</p>
              </div>
            )}

            {/* Prayer */}
            {currentDevotional.prayer && (
              <div className="bg-primary bg-opacity-10 p-4 rounded-lg">
                <h6 className="font-semibold text-text-primary mb-2 font-inter">Prayer:</h6>
                <p className="text-text-primary italic font-inter">{currentDevotional.prayer}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <SafeIcon icon={FiBookOpen} className="h-12 w-12 text-text-light mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-text-primary mb-2 font-inter">
              No Devotional for This Date
            </h4>
            <p className="text-text-light font-inter">
              Select a different date using the navigation arrows.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default DailyDevotional;