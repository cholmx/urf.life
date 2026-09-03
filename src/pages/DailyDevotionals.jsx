import React,{useState,useEffect} from 'react';
import {Link} from 'react-router-dom';
import {motion} from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import supabase from '../lib/supabase';
import {parseLocalDate} from '../utils/dateFormat';

const {FiBookOpen,FiHome,FiCalendar,FiChevronLeft,FiChevronRight}=FiIcons;

const DailyDevotionals=()=> {
  const [devotionals,setDevotionals]=useState([]);
  const [currentDevotional,setCurrentDevotional]=useState(null);
  const [selectedDate,setSelectedDate]=useState(new Date());
  const [loading,setLoading]=useState(true);
  const [availableDates,setAvailableDates]=useState([]);

  useEffect(()=> {
    fetchDevotionals();
  },[]);

  useEffect(()=> {
    if (availableDates.length > 0) {
      fetchDevotionalForDate(selectedDate);
    }
  },[selectedDate,availableDates]);

  const fetchDevotionals=async ()=> {
    try {
      const {data,error}=await supabase
        .from('daily_devotionals_portal123')
        .select('*')
        .order('devotional_date',{ascending: true});

      if (error) throw error;
      setDevotionals(data || []);

      const dates=data.map(item=> parseLocalDate(item.devotional_date));
      setAvailableDates(dates);

      // Set initial date to today if available,otherwise first available date
      const today=new Date();
      const todayString=formatDateForComparison(today);
      const hasToday=data.some(item=> item.devotional_date===todayString);

      if (hasToday) {
        setSelectedDate(today);
      } else if (dates.length > 0) {
        setSelectedDate(dates[0]);
      }
    } catch (error) {
      console.error('Error fetching devotionals:',error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDevotionalForDate=async (date)=> {
    try {
      const dateString=formatDateForComparison(date);
      const devotional=devotionals.find(d=> d.devotional_date===dateString);
      setCurrentDevotional(devotional || null);
    } catch (error) {
      console.error('Error fetching devotional:',error);
      setCurrentDevotional(null);
    }
  };

  const formatDateForComparison=(date)=> {
    const year=date.getFullYear();
    const month=(date.getMonth() + 1).toString().padStart(2,'0');
    const day=date.getDate().toString().padStart(2,'0');
    return `${year}-${month}-${day}`;
  };

  const formatDateDisplay=(date)=> {
    return date.toLocaleDateString('en-US',{
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const navigateDate=(direction)=> {
    const currentIndex=availableDates.findIndex(
      date=> formatDateForComparison(date)===formatDateForComparison(selectedDate)
    );

    if (direction==='prev' && currentIndex > 0) {
      setSelectedDate(availableDates[currentIndex - 1]);
    } else if (direction==='next' && currentIndex < availableDates.length - 1) {
      setSelectedDate(availableDates[currentIndex + 1]);
    }
  };

  const goToToday=()=> {
    const today=new Date();
    const todayString=formatDateForComparison(today);
    const hasToday=availableDates.some(date=> formatDateForComparison(date)===todayString);

    if (hasToday) {
      setSelectedDate(today);
    }
  };

  const canNavigatePrev=()=> {
    const currentIndex=availableDates.findIndex(
      date=> formatDateForComparison(date)===formatDateForComparison(selectedDate)
    );
    return currentIndex > 0;
  };

  const canNavigateNext=()=> {
    const currentIndex=availableDates.findIndex(
      date=> formatDateForComparison(date)===formatDateForComparison(selectedDate)
    );
    return currentIndex < availableDates.length - 1;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-accent py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-primary font-inter">Loading devotionals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-accent py-12 relative">
      {/* Back to Home Button - Top Right */}
      <div className="fixed top-6 right-6 z-50">
        <Link 
          to="/" 
          className="inline-flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
          style={{backgroundColor: '#83A682'}}
          title="Back to Home"
        >
          <SafeIcon icon={FiHome} className="h-5 w-5 text-white" />
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div 
            initial={{opacity: 0,y: 30}} 
            animate={{opacity: 1,y: 0}} 
            transition={{duration: 0.8}} 
            className="flex items-center justify-center space-x-4 mb-3"
          >
            <SafeIcon icon={FiBookOpen} className="h-8 w-8 text-primary" />
            <Link to="/" className="hover:text-primary transition-colors">
              <h1 className="text-3xl md:text-4xl font-bold text-text-primary font-inter"> 
                Daily Devotionals 
              </h1>
            </Link>
          </motion.div>
          <motion.p 
            initial={{opacity: 0,y: 30}} 
            animate={{opacity: 1,y: 0}} 
            transition={{duration: 0.8,delay: 0.2}} 
            className="text-lg text-text-primary font-inter"
          > 
            Daily inspiration and reflection for your spiritual journey 
          </motion.p>
        </div>

        {/* Main Content */}
        {devotionals.length===0 ? (
          <motion.div 
            initial={{opacity: 0,y: 30}} 
            animate={{opacity: 1,y: 0}} 
            className="bg-white rounded-lg shadow-md p-12 text-center"
          >
            <SafeIcon icon={FiBookOpen} className="h-16 w-16 text-text-light mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-text-primary mb-2 font-inter"> 
              No Devotionals Available 
            </h2>
            <p className="text-text-light font-inter"> 
              Devotionals will appear here once they are uploaded by an administrator. 
            </p>
          </motion.div>
        ) : (
          <motion.div 
            initial={{opacity: 0,y: 30}} 
            animate={{opacity: 1,y: 0}} 
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            {/* Navigation Header */}
            <div className="bg-secondary text-white p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold font-inter">Daily Devotional</h2>
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={()=> navigateDate('prev')} 
                    disabled={!canNavigatePrev()} 
                    className="p-2 rounded hover:bg-secondary-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors" 
                    title="Previous devotional"
                  >
                    <SafeIcon icon={FiChevronLeft} className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={goToToday} 
                    className="px-4 py-2 text-sm bg-secondary-light rounded hover:bg-secondary-400 transition-colors font-inter"
                  > 
                    Today 
                  </button>
                  <button 
                    onClick={()=> navigateDate('next')} 
                    disabled={!canNavigateNext()} 
                    className="p-2 rounded hover:bg-secondary-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors" 
                    title="Next devotional"
                  >
                    <SafeIcon icon={FiChevronRight} className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-sm text-primary-light">
                <SafeIcon icon={FiCalendar} className="h-4 w-4" />
                <span className="font-inter">{formatDateDisplay(selectedDate)}</span>
              </div>
            </div>

            {/* Devotional Content */}
            <div className="p-8">
              {currentDevotional ? (
                <div className="space-y-6">
                  {/* Title */}
                  <h3 className="text-3xl font-bold text-text-primary font-inter"> 
                    {currentDevotional.title} 
                  </h3>

                  {/* Subtitle */}
                  {currentDevotional.subtitle && (
                    <h4 className="text-xl font-semibold text-primary font-inter"> 
                      {currentDevotional.subtitle} 
                    </h4>
                  )}

                  {/* Scripture Reference */}
                  {currentDevotional.scripture_reference && (
                    <p className="text-lg font-medium text-text-primary italic font-inter"> 
                      {currentDevotional.scripture_reference} 
                    </p>
                  )}

                  {/* Content */}
                  {currentDevotional.content && (
                    <div className="text-text-primary leading-relaxed text-lg font-inter">
                      {currentDevotional.content.split('\n\n').map((paragraph,index)=> (
                        <p key={index} className="mb-4"> 
                          {paragraph} 
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Response */}
                  {currentDevotional.response && (
                    <div className="bg-accent p-6 rounded-lg">
                      <h5 className="font-semibold text-text-primary mb-3 text-lg font-inter">Response:</h5>
                      <p className="text-text-primary font-inter text-lg">{currentDevotional.response}</p>
                    </div>
                  )}

                  {/* Prayer */}
                  {currentDevotional.prayer && (
                    <div className="bg-primary bg-opacity-10 p-6 rounded-lg">
                      <h5 className="font-semibold text-text-primary mb-3 text-lg font-inter">Prayer:</h5>
                      <p className="text-text-primary italic font-inter text-lg">{currentDevotional.prayer}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <SafeIcon icon={FiBookOpen} className="h-16 w-16 text-text-light mx-auto mb-4" />
                  <h4 className="text-xl font-semibold text-text-primary mb-2 font-inter"> 
                    No Devotional for This Date 
                  </h4>
                  <p className="text-text-light font-inter"> 
                    Use the navigation arrows to browse available devotionals. 
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DailyDevotionals;