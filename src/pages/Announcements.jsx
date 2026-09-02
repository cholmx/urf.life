import React,{useState,useEffect} from 'react';
import {Link} from 'react-router-dom';
import {motion} from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import {SkeletonCard,LoadingTransition} from '../components/LoadingSkeletons';
import {useCleanContent} from '../hooks/useCleanContent';
import supabase from '../lib/supabase';
import {formatDate,formatTime} from '../utils/dateFormat';
import {sanitizeHtml} from '../utils/sanitizeHtml';
import {plainTextToHtml} from '../lib/textToHtml';

const {FiBell,FiCalendar,FiClock,FiMapPin,FiExternalLink,FiHome}=FiIcons;

const TYPE_LABELS={event: 'Event',class: 'Class',general: 'General'};

const Announcements=()=> {
  const [announcements,setAnnouncements]=useState([]);
  const [loading,setLoading]=useState(true);

  // Use the custom hook to clean inline styles
  useCleanContent();

  useEffect(()=> {
    fetchAnnouncements();
  },[]);

  const fetchAnnouncements=async ()=> {
    try {
      const {data,error}=await supabase
        .from('staff_announcements_portal123')
        .select('*')
        .eq('is_published',true)
        .order('published_at',{ascending: false,nullsFirst: false});

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error('Error fetching announcements:',error);
    } finally {
      // Add minimum delay to show skeleton
      setTimeout(()=> setLoading(false),600);
    }
  };

  return (
    <div className="min-h-screen py-12 relative" style={{backgroundColor: '#fcfaf2'}}>
      {/* Back to Home Button - Top Right */}
      <div className="fixed top-6 right-6 z-50">
        <Link to="/" className="inline-flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105" style={{backgroundColor: '#83A682'}} title="Back to Home">
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
            className="flex items-center justify-center space-x-4 mb-1"
          >
            <SafeIcon icon={FiBell} className="h-8 w-8 text-primary" />
            <Link to="/" className="hover:text-primary transition-colors">
              <h1 className="text-3xl md:text-4xl"> Announcements </h1>
            </Link>
          </motion.div>
          <motion.p
            initial={{opacity: 0,y: 30}}
            animate={{opacity: 1,y: 0}}
            transition={{duration: 0.8,delay: 0.2}}
            className="text-base page-subtitle"
          >
            Stay updated with the latest church news and events
          </motion.p>
        </div>

        {/* Announcements List with Loading */}
        <LoadingTransition
          isLoading={loading}
          skeleton={
            <div className="space-y-8">
              {Array.from({length: 3}).map((_,i)=> (
                <SkeletonCard key={i} showImage={false} showMeta={true} />
              ))}
            </div>
          }
        >
          <div className="space-y-8">
            {announcements.length===0 ? (
              <motion.div
                initial={{opacity: 0,y: 20}}
                animate={{opacity: 1,y: 0}}
                className="bg-white rounded-2xl shadow-modern p-16 text-center"
              >
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-5">
                  <SafeIcon icon={FiBell} className="h-9 w-9 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-2">Nothing here yet</h3>
                <p className="text-text-light max-w-xs mx-auto">Check back soon — new announcements will appear here when they're posted.</p>
              </motion.div>
            ) : (
              announcements.map((announcement,index)=> (
                <motion.div
                  key={announcement.id}
                  initial={{opacity: 0,y: 30}}
                  animate={{opacity: 1,y: 0}}
                  transition={{duration: 0.5,delay: index * 0.1}}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="p-8">
                    <div className="flex items-start justify-between gap-4 mb-2 flex-wrap">
                      <h2 className="text-3xl md:text-4xl leading-tight">
                        {announcement.title}
                      </h2>
                      {TYPE_LABELS[announcement.happening_type] && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-primary/10 text-primary flex-shrink-0">
                          {TYPE_LABELS[announcement.happening_type]}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-text-light text-sm mb-6">
                      <div className="flex items-center space-x-2">
                        <SafeIcon icon={FiCalendar} className="h-4 w-4" />
                        <span>
                          {announcement.event_date
                            ? formatDate(announcement.event_date)
                            : formatDate(announcement.published_at || announcement.created_at)}
                        </span>
                      </div>
                      {announcement.event_time && (
                        <div className="flex items-center space-x-2">
                          <SafeIcon icon={FiClock} className="h-4 w-4" />
                          <span>
                            {formatTime(announcement.event_time)}
                            {announcement.end_time ? ` – ${formatTime(announcement.end_time)}` : ''}
                          </span>
                        </div>
                      )}
                      {announcement.event_location && (
                        <div className="flex items-center space-x-2">
                          <SafeIcon icon={FiMapPin} className="h-4 w-4" />
                          <span>{announcement.event_location}</span>
                        </div>
                      )}
                    </div>

                    <div className="prose max-w-none">
                      <div
                        className="announcement-content"
                        dangerouslySetInnerHTML={{__html: sanitizeHtml(plainTextToHtml(announcement.body))}}
                      />
                    </div>

                    {announcement.link && (
                      <div className="mt-6 pt-4 border-t border-accent">
                        <a
                          href={announcement.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 text-primary font-semibold hover:underline"
                        >
                          <span>Learn more / Register</span>
                          <SafeIcon icon={FiExternalLink} className="h-4 w-4" />
                        </a>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </LoadingTransition>
      </div>
    </div>
  );
};

export default Announcements;
