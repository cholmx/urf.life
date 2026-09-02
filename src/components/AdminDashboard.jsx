import React,{useState,useEffect} from 'react';
import {motion} from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import supabase from '../lib/supabase';
import { formatDate as formatDateSafe } from '../utils/dateFormat';

const {
  FiBell,FiPlay,FiCalendar,FiBookOpen,FiHeart,FiUsers,FiTrendingUp,
  FiMessageSquare,FiStar,FiMic,FiExternalLink,FiArrowRight,FiRefreshCw
}=FiIcons;

const StatCard=({icon,label,count,color,onClick,delay=0})=> (
  <motion.button
    initial={{opacity: 0,y: 20}}
    animate={{opacity: 1,y: 0}}
    transition={{duration: 0.4,delay}}
    onClick={onClick}
    className="admin-card text-left w-full hover:-translate-y-1 hover:shadow-modern-lg transition-all duration-300 group"
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <SafeIcon icon={icon} className="h-6 w-6 text-white" />
      </div>
      <SafeIcon icon={FiArrowRight} className="h-4 w-4 text-text-light group-hover:text-primary transition-colors" />
    </div>
    <div className="text-3xl font-bold text-text-primary mb-1">
      {count === null ? (
        <span className="inline-block w-10 h-8 bg-accent animate-pulse rounded" />
      ) : count}
    </div>
    <div className="text-sm text-text-light font-medium">{label}</div>
  </motion.button>
);

const AdminDashboard=({onNavigate,onJumpToManage})=> {
  const [counts,setCounts]=useState({
    announcements: null,
    sermons: null,
    events: null,
    classes: null,
    resources: null,
    ministries: null,
    staff: null,
    comments: null,
  });
  const [recentAnnouncements,setRecentAnnouncements]=useState([]);
  const [recentSermons,setRecentSermons]=useState([]);
  const [loadingRecent,setLoadingRecent]=useState(true);

  useEffect(()=> {
    fetchCounts();
    fetchRecent();
  },[]);

  const fetchCounts=async ()=> {
    try {
      const otherTables=[
        {key: 'sermons',table: 'sermons_portal123'},
        {key: 'resources',table: 'resources_portal123'},
        {key: 'ministries',table: 'ministries_portal123'},
        {key: 'staff',table: 'staff_contacts_portal123'},
        {key: 'comments',table: 'campaign_comments_portal123'},
      ];

      const [otherResults,annRes,eventRes,classRes]=await Promise.all([
        Promise.all(otherTables.map(({table})=> supabase.from(table).select('id',{count: 'exact',head: true}))),
        supabase.from('staff_announcements_portal123').select('id',{count: 'exact',head: true}).eq('happening_type','announcement').eq('is_published',true),
        supabase.from('staff_announcements_portal123').select('id',{count: 'exact',head: true}).eq('happening_type','event').eq('is_published',true),
        supabase.from('staff_announcements_portal123').select('id',{count: 'exact',head: true}).eq('happening_type','class').eq('is_published',true),
      ]);

      const newCounts={
        announcements: annRes.count ?? 0,
        events: eventRes.count ?? 0,
        classes: classRes.count ?? 0,
      };
      otherTables.forEach(({key},i)=> {
        newCounts[key]=otherResults[i].count ?? 0;
      });
      setCounts(newCounts);
    } catch (error) {
      console.error('Error fetching counts:',error);
    }
  };

  const fetchRecent=async ()=> {
    try {
      const [annRes,sermonRes]=await Promise.all([
        supabase.from('staff_announcements_portal123').select('id,title,event_date,published_at').eq('is_published',true).order('published_at',{ascending: false,nullsFirst: false}).limit(4),
        supabase.from('sermons_portal123').select('id,title,sermon_date,speaker').order('sermon_date',{ascending: false}).limit(4),
      ]);
      setRecentAnnouncements(annRes.data || []);
      setRecentSermons(sermonRes.data || []);
    } catch (error) {
      console.error('Error fetching recent:',error);
    } finally {
      setLoadingRecent(false);
    }
  };

  const stats=[
    {key: 'announcements',icon: FiBell,label: 'Announcements',color: 'bg-neutral-900',navTo: '__manage__'},
    {key: 'sermons',icon: FiPlay,label: 'Sermons',color: 'bg-neutral-900',navTo: 'sermons'},
    {key: 'events',icon: FiCalendar,label: 'Events',color: 'bg-neutral-900',navTo: '__manage__'},
    {key: 'classes',icon: FiBookOpen,label: 'Classes',color: 'bg-neutral-900',navTo: '__manage__'},
    {key: 'resources',icon: FiBookOpen,label: 'Resources',color: 'bg-neutral-900',navTo: 'resources'},
    {key: 'ministries',icon: FiHeart,label: 'Ministries',color: 'bg-neutral-900',navTo: 'ministries'},
    {key: 'staff',icon: FiUsers,label: 'Staff Members',color: 'bg-neutral-900',navTo: 'staff'},
    {key: 'comments',icon: FiMessageSquare,label: 'Campaign Comments',color: 'bg-neutral-900',navTo: 'comments'},
  ];

  const goTo=(navTo)=> {
    if (navTo==='__manage__') onJumpToManage?.();
    else onNavigate(navTo);
  };

  const formatDate=(d)=> {
    if (!d) return '';
    return formatDateSafe(d,{month: 'short',day: 'numeric',year: 'numeric'});
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Overview</h2>
          <p className="text-sm text-text-light mt-1">A snapshot of your portal content</p>
        </div>
        <button
          onClick={()=> { fetchCounts(); fetchRecent(); }}
          className="admin-btn-secondary"
        >
          <SafeIcon icon={FiRefreshCw} className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat,i)=> (
          <StatCard
            key={stat.key}
            icon={stat.icon}
            label={stat.label}
            count={counts[stat.key]}
            color={stat.color}
            onClick={()=> goTo(stat.navTo)}
            delay={i * 0.05}
          />
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Announcements */}
        <motion.div
          initial={{opacity: 0,y: 20}}
          animate={{opacity: 1,y: 0}}
          transition={{duration: 0.4,delay: 0.4}}
          className="admin-card"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-text-primary flex items-center space-x-2">
              <SafeIcon icon={FiBell} className="h-4 w-4 text-neutral-900" />
              <span>Recently Published</span>
            </h3>
            <button
              onClick={()=> onJumpToManage?.()}
              className="text-sm text-primary hover:underline font-medium"
            >
              View all
            </button>
          </div>
          {loadingRecent ? (
            <div className="space-y-3">
              {[1,2,3].map(i=> (
                <div key={i} className="h-10 bg-accent animate-pulse rounded-xl" />
              ))}
            </div>
          ) : recentAnnouncements.length===0 ? (
            <p className="text-sm text-text-light py-4 text-center">Nothing published yet</p>
          ) : (
            <div className="space-y-3">
              {recentAnnouncements.map(a=> (
                <div key={a.id} className="flex items-center justify-between py-2 border-b border-accent last:border-0">
                  <span className="text-sm text-text-primary font-medium truncate pr-4">{a.title}</span>
                  <span className="text-xs text-text-light whitespace-nowrap">{formatDate(a.event_date || a.published_at)}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent Sermons */}
        <motion.div
          initial={{opacity: 0,y: 20}}
          animate={{opacity: 1,y: 0}}
          transition={{duration: 0.4,delay: 0.5}}
          className="admin-card"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-text-primary flex items-center space-x-2">
              <SafeIcon icon={FiPlay} className="h-4 w-4 text-primary" />
              <span>Recent Sermons</span>
            </h3>
            <button
              onClick={()=> onNavigate('sermons')}
              className="text-sm text-primary hover:underline font-medium"
            >
              View all
            </button>
          </div>
          {loadingRecent ? (
            <div className="space-y-3">
              {[1,2,3].map(i=> (
                <div key={i} className="h-10 bg-accent animate-pulse rounded-xl" />
              ))}
            </div>
          ) : recentSermons.length===0 ? (
            <p className="text-sm text-text-light py-4 text-center">No sermons yet</p>
          ) : (
            <div className="space-y-3">
              {recentSermons.map(s=> (
                <div key={s.id} className="flex items-center justify-between py-2 border-b border-accent last:border-0">
                  <div className="min-w-0 pr-4">
                    <p className="text-sm text-text-primary font-medium truncate">{s.title}</p>
                    {s.speaker && <p className="text-xs text-text-light">{s.speaker}</p>}
                  </div>
                  <span className="text-xs text-text-light whitespace-nowrap">{formatDate(s.sermon_date)}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick Links */}
      <motion.div
        initial={{opacity: 0,y: 20}}
        animate={{opacity: 1,y: 0}}
        transition={{duration: 0.4,delay: 0.6}}
        className="admin-card"
      >
        <h3 className="font-bold text-text-primary mb-4 flex items-center space-x-2">
          <SafeIcon icon={FiMic} className="h-4 w-4 text-primary" />
          <span>Hidden Podcast Pages</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="https://urf.life/#/yellow"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 border-2 border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{backgroundColor: '#E2BA49'}}>
                <SafeIcon icon={FiMic} className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-text-primary text-sm">Yellow Podcast</p>
                <p className="text-xs text-text-light">urf.life/#/yellow</p>
              </div>
            </div>
            <SafeIcon icon={FiExternalLink} className="h-4 w-4 text-text-light group-hover:text-text-primary" />
          </a>
          <a
            href="https://urf.life/#/green"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 border-2 border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{backgroundColor: '#83A682'}}>
                <SafeIcon icon={FiMic} className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-text-primary text-sm">Green Podcast</p>
                <p className="text-xs text-text-light">urf.life/#/green</p>
              </div>
            </div>
            <SafeIcon icon={FiExternalLink} className="h-4 w-4 text-text-light group-hover:text-text-primary" />
          </a>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
