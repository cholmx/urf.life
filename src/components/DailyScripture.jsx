import React,{useState,useEffect} from 'react';
import {motion} from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import supabase from '../lib/supabase';
import {sanitizeHtml} from '../utils/sanitizeHtml';

const {FiBookOpen,FiRefreshCw}=FiIcons;

const DailyScripture=()=> {
  const [currentScripture,setCurrentScripture]=useState(null);
  const [loading,setLoading]=useState(true);

  useEffect(()=> {
    fetchTodaysScripture();
  },[]);

  const fetchTodaysScripture=async ()=> {
    try {
      const {data,error}=await supabase
        .from('daily_scriptures_portal123')
        .select('*')
        .order('created_at',{ascending: true});

      if (error) throw error;

      if (data && data.length > 0) {
        // Calculate which verse to show based on days since epoch
        const daysSinceEpoch=Math.floor(Date.now() / (1000 * 60 * 60 * 24));
        const scriptureIndex=daysSinceEpoch % data.length;
        setCurrentScripture(data[scriptureIndex]);
      } else {
        setCurrentScripture(null);
      }
    } catch (error) {
      console.error('Error fetching daily scripture:',error);
      setCurrentScripture(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{opacity: 0,y: 20}}
        animate={{opacity: 1,y: 0}}
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

  if (!currentScripture) {
    return null; // Don't show anything if no scriptures are configured
  }

  return (
    <motion.div
      initial={{opacity: 0,y: 20}}
      animate={{opacity: 1,y: 0}}
      transition={{duration: 0.8}}
      className="bg-white rounded-lg shadow-md overflow-hidden border-l-4 border-primary"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiBookOpen} className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-text-primary font-inter">
              Today's Scripture
            </h3>
          </div>
          <button
            onClick={fetchTodaysScripture}
            className="p-1 text-text-primary hover:text-primary transition-colors"
            title="Refresh"
          >
            <SafeIcon icon={FiRefreshCw} className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div
            className="text-text-primary leading-relaxed scripture-text"
            style={{
              fontFamily: 'Inter Tight, sans-serif',
              fontSize: '14px',
              fontWeight: '500',
              lineHeight: '1.6'
            }}
          >
            <div dangerouslySetInnerHTML={{__html: sanitizeHtml(currentScripture.verse_text)}} />
          </div>
          <div className="text-right">
            <span className="text-text-primary font-semibold font-inter">
              - {currentScripture.reference}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DailyScripture;