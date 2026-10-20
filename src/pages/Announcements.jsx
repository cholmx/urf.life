import React,{useState,useEffect} from 'react';
import {Link} from 'react-router-dom';
import {motion} from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import PageNav from '../common/PageNav';
import {SkeletonCard,LoadingTransition} from '../components/LoadingSkeletons';
import {useCleanContent} from '../hooks/useCleanContent';
import supabase from '../lib/supabase';
import {formatDate,getTodayDateString} from '../utils/dateFormat';
import {ensureScriptHtml} from '../lib/textToHtml';
import {sanitizeHtml} from '../utils/sanitizeHtml';
import {getWeekStartDate,isHappeningsActive,buildHappeningsScript} from '../staffComms/lib/helpers';

const {FiMail}=FiIcons;

const Announcements=()=> {
  const [weekDate,setWeekDate]=useState(null);
  const [html,setHtml]=useState('');
  const [loading,setLoading]=useState(true);

  // Use the custom hook to clean inline styles
  useCleanContent();

  useEffect(()=> {
    fetchHappenings();
  },[]);

  const fetchHappenings=async ()=> {
    try {
      const today=getTodayDateString();
      const thisWeekSunday=getWeekStartDate(today);

      // The list itself is always live - same announcement data and the
      // same assembly logic the admin Happenings tab previews, so this
      // page never needs anyone to have "built" anything first.
      const {data: items,error: itemsError}=await supabase
        .from('staff_announcements_portal123')
        .select('*')
        .eq('is_published',true)
        .eq('show_in_happenings',true);
      if (itemsError) throw itemsError;
      const active=(items || []).filter(a=> isHappeningsActive(a,today));
      const assembledHtml=buildHappeningsScript(active);

      // The Weekly Note is the one piece staff actually write and save -
      // only shown if they've written one for this exact week, no
      // fallback to a prior week's (that would read as stale/confusing
      // next to an always-current list).
      const {data: noteRow,error: noteError}=await supabase
        .from('staff_generated_scripts_portal123')
        .select('content')
        .eq('type','happenings')
        .eq('week_date',thisWeekSunday)
        .maybeSingle();
      if (noteError) throw noteError;
      const noteHtml=noteRow?.content ? ensureScriptHtml(noteRow.content) : '';

      setWeekDate(thisWeekSunday);
      setHtml(noteHtml + assembledHtml);
    } catch (error) {
      console.error('Error fetching the Happenings:',error);
    } finally {
      // Add minimum delay to show skeleton
      setTimeout(()=> setLoading(false),600);
    }
  };

  return (
    <div className="min-h-screen bg-accent py-12 relative">
      <PageNav />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{opacity: 0,y: 30}}
            animate={{opacity: 1,y: 0}}
            transition={{duration: 0.8}}
            className="flex items-center justify-center space-x-4 mb-1"
          >
            <SafeIcon icon={FiMail} className="h-8 w-8 text-primary" />
            <Link to="/" className="hover:text-primary transition-colors">
              <h1 className="text-3xl md:text-4xl"> The Happenings </h1>
            </Link>
          </motion.div>
          <motion.p
            initial={{opacity: 0,y: 30}}
            animate={{opacity: 1,y: 0}}
            transition={{duration: 0.8,delay: 0.2}}
            className="text-base page-subtitle"
          >
            {weekDate ? `Week of ${formatDate(weekDate)}` : 'What’s happening around the church'}
          </motion.p>
        </div>

        {/* Script with Loading */}
        <LoadingTransition
          isLoading={loading}
          skeleton={
            <div className="space-y-8">
              <SkeletonCard
                showMeta={false}
                rounded="rounded-lg"
                shadow="shadow-md"
                padding="p-8 md:p-10"
                lines={8}
              />
            </div>
          }
        >
          {!html ? (
            <motion.div
              initial={{opacity: 0,y: 20}}
              animate={{opacity: 1,y: 0}}
              className="card-clay rounded-2xl shadow-modern p-16 text-center"
            >
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-5">
                <SafeIcon icon={FiMail} className="h-9 w-9 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">Nothing here yet</h3>
              <p className="text-text-light max-w-xs mx-auto">Check back soon for this week's update.</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{opacity: 0,y: 30}}
              animate={{opacity: 1,y: 0}}
              transition={{duration: 0.5}}
              className="card-clay rounded-lg shadow-md overflow-hidden"
            >
              <div
                className="happenings-script p-8 md:p-10 text-text-primary text-[17px]"
                dangerouslySetInnerHTML={{__html: sanitizeHtml(html)}}
              />
            </motion.div>
          )}
        </LoadingTransition>
      </div>
    </div>
  );
};

export default Announcements;
