import React,{useState,useEffect} from 'react';
import {Link} from 'react-router-dom';
import {motion} from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import {SkeletonCard,LoadingTransition} from '../components/LoadingSkeletons';
import {useCleanContent} from '../hooks/useCleanContent';
import supabase from '../lib/supabase';
import {formatDate,getTodayDateString} from '../utils/dateFormat';
import {ensureScriptHtml} from '../lib/textToHtml';
import {sanitizeHtml} from '../utils/sanitizeHtml';
import {getWeekStartDate} from '../staffComms/lib/helpers';

const {FiMail,FiHome}=FiIcons;

const Announcements=()=> {
  const [script,setScript]=useState(null);
  const [loading,setLoading]=useState(true);

  // Use the custom hook to clean inline styles
  useCleanContent();

  useEffect(()=> {
    fetchLatestScript();
  },[]);

  const fetchLatestScript=async ()=> {
    try {
      // Prefer this calendar week's own script (keyed by its Sunday - see
      // HappeningsTab). Falling back to "most recent by week_date" alone
      // isn't safe: a row saved before week_date was Sunday-anchored can
      // carry a date later in the week than this week's real Sunday (e.g.
      // a Friday build outranking Sunday numerically), which would keep
      // outranking this week's correct row forever. Only fall back to
      // "most recent" when this week doesn't have its own row yet - staff
      // would rather visitors see last week's than nothing at all.
      const thisWeekSunday=getWeekStartDate(getTodayDateString());
      const {data: thisWeek,error: thisWeekError}=await supabase
        .from('staff_generated_scripts_portal123')
        .select('content,week_date')
        .eq('type','happenings')
        .eq('week_date',thisWeekSunday)
        .maybeSingle();
      if (thisWeekError) throw thisWeekError;

      if (thisWeek) {
        setScript(thisWeek);
      } else {
        const {data: fallback,error: fallbackError}=await supabase
          .from('staff_generated_scripts_portal123')
          .select('content,week_date')
          .eq('type','happenings')
          .order('week_date',{ascending: false})
          .limit(1)
          .maybeSingle();
        if (fallbackError) throw fallbackError;
        setScript(fallback || null);
      }
    } catch (error) {
      console.error('Error fetching the Happenings script:',error);
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
            {script?.week_date ? `Week of ${formatDate(script.week_date)}` : 'What’s happening around the church'}
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
          {!script?.content ? (
            <motion.div
              initial={{opacity: 0,y: 20}}
              animate={{opacity: 1,y: 0}}
              className="bg-white rounded-2xl shadow-modern p-16 text-center"
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
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div
                className="happenings-script p-8 md:p-10 text-text-primary text-[14px]"
                dangerouslySetInnerHTML={{__html: sanitizeHtml(ensureScriptHtml(script.content))}}
              />
            </motion.div>
          )}
        </LoadingTransition>
      </div>
    </div>
  );
};

export default Announcements;
