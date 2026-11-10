import React,{useState,useEffect,useMemo} from 'react';
import {Link} from 'react-router-dom';
import {AnimatePresence,motion} from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import PageNav from '../common/PageNav';
import {LoadingTransition} from '../components/LoadingSkeletons';
import AddToCalendarButton from '../components/AddToCalendarButton';
import supabase from '../lib/supabase';
import {getTodayDateString,formatTime} from '../utils/dateFormat';
import {getEventItems,getRangeItems} from '../staffComms/lib/calendar-grid';
import {downloadIcsCalendar} from '../utils/generateIcs';

const {FiCalendar,FiClock,FiMapPin,FiExternalLink,FiX,FiDownload}=FiIcons;

// How far ahead the upcoming list and the bulk calendar download look -
// far enough to be useful (a season's worth of weekly recurring items),
// not so far it drags in things nobody's ready to commit to yet.
const UPCOMING_WINDOW_DAYS=120;
const UPCOMING_DISPLAY_LIMIT=8;

const TYPE_STYLES={
  event: {dot: 'bg-primary',label: 'Event'},
  class: {dot: 'bg-brand-yellow',label: 'Class'},
  general: {dot: 'bg-secondary',label: 'General'},
  announcement: {dot: 'bg-secondary',label: 'Announcement'},
};

const PublicCalendar=()=> {
  const today=getTodayDateString();
  const [announcements,setAnnouncements]=useState([]);
  const [loading,setLoading]=useState(true);
  const [selectedDay,setSelectedDay]=useState(null);

  useEffect(()=> {
    fetchHappenings();
  },[]);

  const fetchHappenings=async ()=> {
    try {
      const {data,error}=await supabase
        .from('staff_announcements_portal123')
        .select('*')
        .eq('is_published',true);
      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error('Error fetching calendar happenings:',error);
    } finally {
      setLoading(false);
    }
  };

  // Every occurrence (including each future date of a recurring item) in
  // the next UPCOMING_WINDOW_DAYS days, deduped and in chronological order -
  // reuses the same getEventItems logic the month grid and day panel use,
  // so this list always matches what the grid itself would show.
  const upcomingItems=useMemo(()=> {
    const items=[];
    const seen=new Set();
    for (let i=0;i<=UPCOMING_WINDOW_DAYS;i++) {
      const d=new Date(today + 'T12:00:00');
      d.setDate(d.getDate() + i);
      const dayStr=d.toISOString().split('T')[0];
      for (const a of getEventItems(dayStr,announcements)) {
        const key=`${a.id}-${dayStr}`;
        if (seen.has(key)) continue;
        seen.add(key);
        items.push({...a,occurrenceDate: dayStr});
      }
    }
    items.sort((x,y)=> (x.occurrenceDate + (x.event_time || '')).localeCompare(y.occurrenceDate + (y.event_time || '')));
    return items;
  },[announcements,today]);

  // The list shown on the page is "what's coming up", not "every date it
  // happens" - a weekly item should take one line (its next occurrence),
  // not crowd out everything else with a row per future Sunday. The full
  // occurrence set above still feeds the calendar download, where every
  // date genuinely belongs.
  const upcomingDisplayItems=useMemo(()=> {
    const seenIds=new Set();
    const out=[];
    for (const item of upcomingItems) {
      if (seenIds.has(item.id)) continue;
      seenIds.add(item.id);
      out.push(item);
    }
    return out;
  },[upcomingItems]);

  const handleDownloadUpcoming=()=> {
    downloadIcsCalendar(
      upcomingItems.map(a=> ({
        uid: `${a.id}-${a.occurrenceDate}`,
        title: a.title,
        description: a.flyer_text,
        date: a.occurrenceDate,
        startTime: a.event_time,
        endTime: a.end_time,
        location: a.event_location,
      })),
      'urf-life-upcoming.ics',
      'Upper Room Fellowship'
    );
  };

  const selectedEventItems=selectedDay ? getEventItems(selectedDay,announcements) : [];
  const selectedRangeItems=selectedDay ? getRangeItems(selectedDay,announcements).map(x=> x.a) : [];
  const selectedItems=[...selectedEventItems,...selectedRangeItems.filter(a=> !selectedEventItems.some(e=> e.id===a.id))];

  const selectedDateLabel=selectedDay
    ? new Date(selectedDay + 'T12:00:00').toLocaleDateString('en-US',{weekday: 'long',month: 'long',day: 'numeric'})
    : '';

  return (
    <div className="min-h-screen bg-accent py-12 relative">
      <PageNav />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.div
            initial={{opacity: 0,y: 30}}
            animate={{opacity: 1,y: 0}}
            transition={{duration: 0.4}}
            className="flex items-center justify-center space-x-4 mb-1"
          >
            <SafeIcon icon={FiCalendar} className="h-8 w-8 text-primary" />
            <h1 className="text-3xl md:text-4xl">Calendar</h1>
          </motion.div>
          <motion.p
            initial={{opacity: 0,y: 30}}
            animate={{opacity: 1,y: 0}}
            transition={{duration: 0.4,delay: 0.1}}
            className="text-base page-subtitle"
          >
            What's coming up at Upper Room Fellowship
          </motion.p>
        </div>

        <LoadingTransition
          isLoading={loading}
          skeleton={<div className="card-clay rounded-2xl shadow-modern h-96 animate-pulse" />}
        >
          {upcomingItems.length===0 ? (
            <motion.div
              initial={{opacity: 0,y: 20}}
              animate={{opacity: 1,y: 0}}
              className="card-clay rounded-2xl shadow-modern p-16 text-center"
            >
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-5">
                <SafeIcon icon={FiCalendar} className="h-9 w-9 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-text-primary mb-2">Nothing scheduled yet</h2>
              <p className="text-text-light max-w-xs mx-auto">Check back soon — upcoming events will appear here.</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{opacity: 0,y: 20}}
              animate={{opacity: 1,y: 0}}
              transition={{duration: 0.3,delay: 0.05}}
              className="card-clay rounded-2xl shadow-modern overflow-hidden"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-5 border-b border-accent-dark">
                <div>
                  <h2 className="text-xl md:text-2xl font-semibold text-text-primary">Coming Up</h2>
                  <p className="text-sm text-text-light">
                    Next {Math.min(upcomingDisplayItems.length,UPCOMING_DISPLAY_LIMIT)} happening{Math.min(upcomingDisplayItems.length,UPCOMING_DISPLAY_LIMIT) !== 1 ? 's' : ''}
                  </p>
                </div>
                <button
                  onClick={handleDownloadUpcoming}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition-colors"
                  title="Download an .ics file of everything upcoming to import into Google, Apple, or Outlook Calendar"
                >
                  <SafeIcon icon={FiDownload} className="h-4 w-4" />
                  <span>Add to Your Calendar</span>
                </button>
              </div>

              <div className="divide-y divide-accent-dark">
                {upcomingDisplayItems.slice(0,UPCOMING_DISPLAY_LIMIT).map(a=> {
                  const style=TYPE_STYLES[a.happening_type] || TYPE_STYLES.general;
                  const [weekdayLabel,monthDayLabel]=new Date(a.occurrenceDate + 'T12:00:00')
                    .toLocaleDateString('en-US',{weekday: 'short',month: 'short',day: 'numeric'})
                    .split(', ');
                  return (
                    <button
                      key={`${a.id}-${a.occurrenceDate}`}
                      onClick={()=> setSelectedDay(a.occurrenceDate)}
                      className="w-full text-left flex items-center gap-4 px-6 py-4 hover:bg-accent-dark/20 transition-colors"
                    >
                      <div className="flex-shrink-0 w-16 text-center">
                        <div className="text-[10px] font-bold uppercase tracking-wide text-text-light">{weekdayLabel}</div>
                        <div className="text-sm font-semibold text-text-primary">{monthDayLabel}</div>
                      </div>
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${style.dot}`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-text-primary truncate">{a.title}</p>
                        <div className="flex flex-wrap items-center gap-x-3 text-xs text-text-light">
                          {a.event_time && <span>{formatTime(a.event_time)}</span>}
                          {a.event_location && <span>{a.event_location}</span>}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {upcomingDisplayItems.length > UPCOMING_DISPLAY_LIMIT && (
                <div className="px-6 py-3 border-t border-accent-dark text-center">
                  <span className="text-xs text-text-light">
                    +{upcomingDisplayItems.length - UPCOMING_DISPLAY_LIMIT} more in the next {Math.round(UPCOMING_WINDOW_DAYS / 30)} months
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </LoadingTransition>
      </div>

      <AnimatePresence>
        {selectedDay && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <motion.div
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              exit={{opacity: 0}}
              className="absolute inset-0 bg-black/40"
              onClick={()=> setSelectedDay(null)}
            />
            <motion.div
              initial={{opacity: 0,scale: 0.96,y: 10}}
              animate={{opacity: 1,scale: 1,y: 0}}
              exit={{opacity: 0,scale: 0.96}}
              transition={{duration: 0.125}}
              className="relative card-clay rounded-3xl shadow-modern-lg max-w-lg w-full max-h-[85vh] overflow-y-auto"
            >
              <div className="px-6 py-4 border-b border-accent-dark flex items-start justify-between sticky top-0 bg-white rounded-t-3xl">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">{selectedDateLabel}</h3>
                  <p className="text-sm text-text-light">
                    {selectedItems.length===0 ? 'Nothing scheduled' : `${selectedItems.length} happening${selectedItems.length !== 1 ? 's' : ''}`}
                  </p>
                </div>
                <button
                  onClick={()=> setSelectedDay(null)}
                  aria-label="Close"
                  className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full text-text-light hover:bg-accent transition-colors"
                >
                  <SafeIcon icon={FiX} className="h-4 w-4" />
                </button>
              </div>

              {selectedItems.length > 0 && (
                <div className="divide-y divide-accent-dark">
                  {selectedItems.map(a=> {
                    const style=TYPE_STYLES[a.happening_type] || TYPE_STYLES.general;
                    return (
                      <div key={a.id} className="px-6 py-4">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${style.dot}`} />
                          <h4 className="text-base font-semibold text-text-primary">{a.title}</h4>
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-text-light">{style.label}</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-light mb-2">
                          {a.event_time && (
                            <div className="flex items-center gap-1.5">
                              <SafeIcon icon={FiClock} className="h-3.5 w-3.5" />
                              <span>
                                {formatTime(a.event_time)}
                                {a.end_time ? ` – ${formatTime(a.end_time)}` : ''}
                              </span>
                            </div>
                          )}
                          {a.event_location && (
                            <div className="flex items-center gap-1.5">
                              <SafeIcon icon={FiMapPin} className="h-3.5 w-3.5" />
                              <span>{a.event_location}</span>
                            </div>
                          )}
                        </div>

                        {a.flyer_text && (
                          <p className="text-sm text-text-primary mb-3 leading-relaxed whitespace-pre-wrap">{a.flyer_text}</p>
                        )}

                        <div className="flex flex-wrap items-center gap-4">
                          <AddToCalendarButton
                            title={a.title}
                            description={a.flyer_text}
                            date={selectedDay}
                            startTime={a.event_time}
                            endTime={a.end_time}
                            location={a.event_location}
                          />
                          {a.link && (
                            <a
                              href={a.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-primary hover:underline text-sm"
                            >
                              <span>Learn more</span>
                              <SafeIcon icon={FiExternalLink} className="h-3.5 w-3.5" />
                            </a>
                          )}
                          {a.signup_mode==='sheet' && (
                            <span className="text-sm text-text-light italic">Sign up in person</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PublicCalendar;
