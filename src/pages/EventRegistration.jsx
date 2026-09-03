import React,{useState,useEffect} from 'react';
import {Link} from 'react-router-dom';
import {motion} from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import supabase from '../lib/supabase';
import StandardButton from '../components/StandardButton';
import {sanitizeHtml} from '../utils/sanitizeHtml';
import {formatDate,formatTime} from '../utils/dateFormat';
import AddToCalendarButton from '../components/AddToCalendarButton';

const {FiCalendar,FiHome,FiExternalLink}=FiIcons;

const EventRegistration=()=> {
  const [events,setEvents]=useState([]);
  const [loading,setLoading]=useState(true);

  useEffect(()=> {
    fetchEvents();
  },[]);

  const fetchEvents=async ()=> {
    try {
      const {data,error}=await supabase
        .from('events_portal123')
        .select('*')
        .order('created_at',{ascending: false});

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:',error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-accent py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
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
            <SafeIcon icon={FiCalendar} className="h-8 w-8 text-primary" />
            <Link to="/" className="hover:text-primary transition-colors">
              <h1 className="text-3xl md:text-4xl">
                Events
              </h1>
            </Link>
          </motion.div>
          <motion.p
            initial={{opacity: 0,y: 30}}
            animate={{opacity: 1,y: 0}}
            transition={{duration: 0.8,delay: 0.2}}
            className="text-base page-subtitle"
          >
            Upcoming church events and activities
          </motion.p>
        </div>

        {/* Events List */}
        {events.length===0 ? (
          <motion.div
            initial={{opacity: 0,y: 20}}
            animate={{opacity: 1,y: 0}}
            className="bg-white rounded-2xl shadow-modern p-16 text-center"
          >
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <SafeIcon icon={FiCalendar} className="h-9 w-9 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-text-primary mb-2">No Events Available</h2>
            <p className="text-text-light max-w-xs mx-auto">Check back soon — upcoming events with registration will appear here.</p>
          </motion.div>
        ) : (
          <div className={events.length===1 ? "max-w-2xl mx-auto" : "grid grid-cols-1 md:grid-cols-2 gap-8"}>
            {events.map((event,index)=> (
              <motion.div
                key={event.id}
                initial={{opacity: 0,y: 30}}
                animate={{opacity: 1,y: 0}}
                transition={{duration: 0.5,delay: index * 0.1}}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  {event.title}
                </h3>
                {event.event_date && (
                  <p className="text-sm text-text-light mb-4">
                    {formatDate(event.event_date, {weekday: 'long',year: 'numeric',month: 'long',day: 'numeric'})}
                    {event.start_time && ` at ${formatTime(event.start_time)}`}
                    {event.location && ` · ${event.location}`}
                  </p>
                )}
                <div
                  className="text-text-primary mb-6 prose prose-sm max-w-none rendered-content"
                  dangerouslySetInnerHTML={{__html: sanitizeHtml(event.details)}}
                />
                <div className="flex flex-wrap items-center gap-4">
                  {event.link && (
                    <StandardButton
                      onClick={() => window.open(event.link, '_blank', 'noopener,noreferrer')}
                      icon={FiExternalLink}
                    >
                      Register Here
                    </StandardButton>
                  )}
                  <AddToCalendarButton
                    title={event.title}
                    description={event.details}
                    date={event.event_date}
                    startTime={event.start_time}
                    endTime={event.end_time}
                    location={event.location}
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

export default EventRegistration;