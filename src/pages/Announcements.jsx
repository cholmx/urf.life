import React,{useState,useEffect} from 'react';
import {Link} from 'react-router-dom';
import {motion} from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import {SkeletonCard,LoadingTransition} from '../components/LoadingSkeletons';
import {useCleanContent} from '../hooks/useCleanContent';
import supabase from '../lib/supabase';
import {formatDate} from '../utils/dateFormat';
import {sanitizeHtml} from '../utils/sanitizeHtml';
import {plainTextToHtml} from '../lib/textToHtml';

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
      // Always show the most recently generated weekly script - if this
      // week's hasn't been written yet, staff would rather visitors see
      // last week's than nothing at all.
      const {data,error}=await supabase
        .from('staff_generated_scripts_portal123')
        .select('content,week_date')
        .eq('type','happenings')
        .order('week_date',{ascending: false})
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setScript(data || null);
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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <SkeletonCard showImage={false} showMeta={false} />
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
              <div className="p-8 md:p-10 prose max-w-none">
                <div
                  className="announcement-content"
                  dangerouslySetInnerHTML={{__html: sanitizeHtml(plainTextToHtml(script.content))}}
                />
              </div>
            </motion.div>
          )}
        </LoadingTransition>
      </div>
    </div>
  );
};

export default Announcements;
