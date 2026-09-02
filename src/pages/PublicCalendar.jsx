import React,{useState,useEffect,useMemo} from 'react';
import {Link} from 'react-router-dom';
import {AnimatePresence,motion} from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import {LoadingTransition} from '../components/LoadingSkeletons';
import AddToCalendarButton from '../components/AddToCalendarButton';
import supabase from '../lib/supabase';
import {getTodayDateString,formatTime} from '../utils/dateFormat';
import {getMonthGrid,getEventItems,getRangeItems} from '../staffComms/lib/calendar-grid';

const {FiCalendar,FiClock,FiMapPin,FiExternalLink,FiHome,FiChevronLeft,FiChevronRight,FiX}=FiIcons;

const DAYS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

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
  const [viewYear,setViewYear]=useState(()=> Number(today.slice(0,4)));
  const [viewMonth,setViewMonth]=useState(()=> Number(today.slice(5,7)) - 1);
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

  const weeks=useMemo(()=> {
    const cells=getMonthGrid(viewYear,viewMonth);
    const rows=[];
    for (let i=0;i<cells.length;i+=7) rows.push(cells.slice(i,i + 7));
    return rows;
  },[viewYear,viewMonth]);

  const currentMonthStr=`${viewYear}-${String(viewMonth + 1).padStart(2,'0')}`;
  const monthLabel=new Date(viewYear,viewMonth,1).toLocaleDateString('en-US',{month: 'long',year: 'numeric'});

  const prevMonth=()=> {
    if (viewMonth===0) {setViewYear(y=> y - 1); setViewMonth(11);}
    else setViewMonth(m=> m - 1);
  };
  const nextMonth=()=> {
    if (viewMonth===11) {setViewYear(y=> y + 1); setViewMonth(0);}
    else setViewMonth(m=> m + 1);
  };
  const goToToday=()=> {
    setViewYear(Number(today.slice(0,4)));
    setViewMonth(Number(today.slice(5,7)) - 1);
    setSelectedDay(today);
  };

  const selectedEventItems=selectedDay ? getEventItems(selectedDay,announcements) : [];
  const selectedRangeItems=selectedDay ? getRangeItems(selectedDay,announcements).map(x=> x.a) : [];
  const selectedItems=[...selectedEventItems,...selectedRangeItems.filter(a=> !selectedEventItems.some(e=> e.id===a.id))];

  const selectedDateLabel=selectedDay
    ? new Date(selectedDay + 'T12:00:00').toLocaleDateString('en-US',{weekday: 'long',month: 'long',day: 'numeric'})
    : '';

  return (
    <div className="min-h-screen py-12 relative" style={{backgroundColor: '#fcfaf2'}}>
      <div className="fixed top-6 right-6 z-50">
        <Link to="/" className="inline-flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105" style={{backgroundColor: '#83A682'}} title="Back to Home">
          <SafeIcon icon={FiHome} className="h-5 w-5 text-white" />
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.div
            initial={{opacity: 0,y: 30}}
            animate={{opacity: 1,y: 0}}
            transition={{duration: 0.8}}
            className="flex items-center justify-center space-x-4 mb-1"
          >
            <SafeIcon icon={FiCalendar} className="h-8 w-8 text-primary" />
            <h1 className="text-3xl md:text-4xl">Calendar</h1>
          </motion.div>
          <motion.p
            initial={{opacity: 0,y: 30}}
            animate={{opacity: 1,y: 0}}
            transition={{duration: 0.8,delay: 0.2}}
            className="text-base page-subtitle"
          >
            Everything happening at Upper Room Fellowship, all in one place
          </motion.p>
        </div>

        <LoadingTransition
          isLoading={loading}
          skeleton={<div className="bg-white rounded-2xl shadow-modern h-96 animate-pulse" />}
        >
          <div className="bg-white rounded-2xl shadow-modern overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-accent-dark">
              <h2 className="text-xl md:text-2xl font-semibold text-text-primary">{monthLabel}</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={goToToday}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wide text-secondary border border-accent-dark hover:bg-accent-dark transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={prevMonth}
                  aria-label="Previous month"
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-accent-dark text-secondary hover:bg-accent-dark transition-colors"
                >
                  <SafeIcon icon={FiChevronLeft} className="h-4 w-4" />
                </button>
                <button
                  onClick={nextMonth}
                  aria-label="Next month"
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-accent-dark text-secondary hover:bg-accent-dark transition-colors"
                >
                  <SafeIcon icon={FiChevronRight} className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 border-b border-accent-dark bg-accent-dark/40">
              {DAYS.map(d=> (
                <div key={d} className="py-2 text-center text-[10px] font-bold uppercase tracking-widest text-text-light">
                  {d}
                </div>
              ))}
            </div>

            {weeks.map((week,wi)=> (
              <div key={wi} className={`grid grid-cols-7 ${wi < weeks.length - 1 ? 'border-b border-accent-dark' : ''}`}>
                {week.map((day,ci)=> {
                  const items=getEventItems(day,announcements);
                  const isToday=day===today;
                  const isSelected=day===selectedDay;
                  const inMonth=day.startsWith(currentMonthStr);
                  return (
                    <button
                      key={day}
                      onClick={()=> setSelectedDay(prev=> prev===day ? null : day)}
                      className={`text-left h-24 sm:h-28 p-1.5 sm:p-2 overflow-hidden transition-colors ${ci > 0 ? 'border-l border-accent-dark' : ''} ${isSelected ? 'bg-primary/10' : 'hover:bg-accent-dark/30'}`}
                    >
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${isToday ? 'bg-primary text-white font-bold' : inMonth ? 'text-text-primary' : 'text-text-light'}`}>
                        {new Date(day + 'T12:00:00').getDate()}
                      </span>
                      <div className="mt-1 flex flex-col gap-0.5">
                        {items.slice(0,2).map(a=> {
                          const style=TYPE_STYLES[a.happening_type] || TYPE_STYLES.general;
                          return (
                            <div key={a.id} className="flex items-center gap-1 min-w-0">
                              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${style.dot}`} />
                              <span className="text-[10px] sm:text-[11px] text-text-secondary truncate">{a.title}</span>
                            </div>
                          );
                        })}
                        {items.length > 2 && (
                          <span className="text-[9px] text-text-light pl-2.5">+{items.length - 2} more</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
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
              transition={{duration: 0.25}}
              className="relative bg-white rounded-3xl shadow-modern-lg max-w-lg w-full max-h-[85vh] overflow-y-auto"
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

                        <div className="flex flex-wrap items-center gap-4">
                          <AddToCalendarButton
                            title={a.title}
                            description={a.body}
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
                          {(a.signup_mode==='sheet' || a.signup_mode==='both') && (
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
