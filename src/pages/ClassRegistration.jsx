import React,{useState,useEffect} from 'react';
import {Link} from 'react-router-dom';
import {motion} from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { LoadingSpinner } from '../components/LoadingSpinner';
import supabase from '../lib/supabase';
import StandardButton from '../components/StandardButton';
import {sanitizeHtml} from '../utils/sanitizeHtml';
import {plainTextToHtml} from '../lib/textToHtml';
import {formatDate,formatTime,getTodayDateString} from '../utils/dateFormat';
import AddToCalendarButton from '../components/AddToCalendarButton';
import {isClassListingActive} from '../staffComms/lib/helpers';

const {FiBookOpen,FiHome,FiExternalLink}=FiIcons;

const ClassRegistration=()=> {
  const [classes,setClasses]=useState([]);
  const [loading,setLoading]=useState(true);

  useEffect(()=> {
    fetchClasses();
  },[]);

  const fetchClasses=async ()=> {
    try {
      // Classes are now managed in the Communication Organizer (Type: Class)
      // rather than a dedicated admin panel - this reads the same unified,
      // published-only table the Organizer and public Calendar use.
      const {data,error}=await supabase
        .from('staff_announcements_portal123')
        .select('*')
        .eq('happening_type','class')
        .eq('is_published',true)
        .order('event_date',{ascending: true,nullsFirst: false});

      if (error) throw error;
      // Keep a class listed until a week after it starts (not its whole
      // multi-week run) - late signers still see it, but it drops off once
      // that grace window passes instead of staying up indefinitely.
      const today=getTodayDateString();
      setClasses((data || []).filter(c=> isClassListingActive(c.event_date,today)));
    } catch (error) {
      console.error('Error fetching classes:',error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-accent py-12 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="justify-center mb-4" />
          <p className="text-text-primary font-inter">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-accent py-12 relative">
      {/* Back to Home Button - Top Right */}
      <div className="fixed top-6 right-6 z-50">
        <Link to="/" className="inline-flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105" style={{backgroundColor: '#83A682'}} title="Back to Home">
          <SafeIcon icon={FiHome} className="h-5 w-5 text-white" />
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{opacity: 0,y: 30}}
            animate={{opacity: 1,y: 0}}
            transition={{duration: 0.8}}
            className="flex items-center justify-center space-x-4 mb-1"
          >
            <SafeIcon icon={FiBookOpen} className="h-8 w-8 text-primary" />
            <Link to="/" className="hover:text-primary transition-colors">
              <h1 className="text-3xl md:text-4xl">
                Classes
              </h1>
            </Link>
          </motion.div>
          <motion.p
            initial={{opacity: 0,y: 30}}
            animate={{opacity: 1,y: 0}}
            transition={{duration: 0.8,delay: 0.2}}
            className="text-base page-subtitle"
          >
            Available church classes and programs
          </motion.p>
        </div>

        {/* Classes List */}
        {classes.length===0 ? (
          <motion.div
            initial={{opacity: 0,y: 20}}
            animate={{opacity: 1,y: 0}}
            className="bg-white rounded-2xl shadow-modern p-16 text-center"
          >
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <SafeIcon icon={FiBookOpen} className="h-9 w-9 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-text-primary mb-2">No Classes Available</h2>
            <p className="text-text-light max-w-xs mx-auto">Check back soon — upcoming classes with registration will appear here.</p>
          </motion.div>
        ) : (
          <div className={classes.length===1 ? "max-w-2xl mx-auto" : "grid grid-cols-1 md:grid-cols-2 gap-8"}>
            {classes.map((classItem,index)=> (
              <motion.div
                key={classItem.id}
                initial={{opacity: 0,y: 30}}
                animate={{opacity: 1,y: 0}}
                transition={{duration: 0.5,delay: index * 0.1}}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  {classItem.title}
                </h3>
                {classItem.event_date && (
                  <p className="text-sm text-text-light mb-4">
                    {formatDate(classItem.event_date, {weekday: 'long',year: 'numeric',month: 'long',day: 'numeric'})}
                    {classItem.event_time && ` at ${formatTime(classItem.event_time)}`}
                    {classItem.event_location && ` · ${classItem.event_location}`}
                  </p>
                )}
                <div
                  className="text-text-primary mb-6 prose prose-sm max-w-none rendered-content"
                  dangerouslySetInnerHTML={{__html: sanitizeHtml(plainTextToHtml(classItem.body))}}
                />
                <div className="flex flex-wrap items-center gap-4">
                  {classItem.link && (
                    <StandardButton
                      onClick={() => window.open(classItem.link, '_blank', 'noopener,noreferrer')}
                      icon={FiExternalLink}
                    >
                      Register Here
                    </StandardButton>
                  )}
                  <AddToCalendarButton
                    title={classItem.title}
                    description={classItem.body}
                    date={classItem.event_date}
                    startTime={classItem.event_time}
                    endTime={classItem.end_time}
                    location={classItem.event_location}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassRegistration;