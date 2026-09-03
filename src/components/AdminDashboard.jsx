import React,{useState,useEffect} from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import supabase from '../lib/supabase';
import { formatDate as formatDateSafe } from '../utils/dateFormat';

const {FiMic,FiExternalLink,FiRefreshCw}=FiIcons;

const AdminDashboard=({onNavigate})=> {
  const [recentAnnouncements,setRecentAnnouncements]=useState([]);
  const [recentSermons,setRecentSermons]=useState([]);
  const [loadingRecent,setLoadingRecent]=useState(true);

  useEffect(()=> {
    fetchRecent();
  },[]);

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

  const formatDate=(d)=> {
    if (!d) return '';
    return formatDateSafe(d,{month: 'short',day: 'numeric'});
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold text-text-light uppercase tracking-wider">Overview</h2>
        <button
          onClick={fetchRecent}
          className="flex items-center gap-1 text-xs text-text-light hover:text-text-primary transition-colors"
        >
          <SafeIcon icon={FiRefreshCw} className="h-3 w-3" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-xs">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-text-secondary">Recently Published</span>
          </div>
          {loadingRecent ? (
            <div className="space-y-1.5">
              {[1,2,3].map(i=> <div key={i} className="h-4 bg-accent animate-pulse rounded" />)}
            </div>
          ) : recentAnnouncements.length===0 ? (
            <p className="text-text-light">Nothing published yet</p>
          ) : (
            <div className="space-y-1">
              {recentAnnouncements.map(a=> (
                <div key={a.id} className="flex items-center justify-between py-1 border-b border-accent last:border-0">
                  <span className="text-text-primary truncate pr-3">{a.title}</span>
                  <span className="text-text-light whitespace-nowrap">{formatDate(a.event_date || a.published_at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-text-secondary">Recent Sermons</span>
            <button onClick={()=> onNavigate('sermons')} className="text-primary hover:underline">
              View all
            </button>
          </div>
          {loadingRecent ? (
            <div className="space-y-1.5">
              {[1,2,3].map(i=> <div key={i} className="h-4 bg-accent animate-pulse rounded" />)}
            </div>
          ) : recentSermons.length===0 ? (
            <p className="text-text-light">No sermons yet</p>
          ) : (
            <div className="space-y-1">
              {recentSermons.map(s=> (
                <div key={s.id} className="flex items-center justify-between py-1 border-b border-accent last:border-0">
                  <span className="text-text-primary truncate pr-3">
                    {s.title}{s.speaker ? ` — ${s.speaker}` : ''}
                  </span>
                  <span className="text-text-light whitespace-nowrap">{formatDate(s.sermon_date)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="pt-1 flex items-center gap-4 text-xs text-text-light">
        <span className="flex items-center gap-1 font-medium text-text-secondary">
          <SafeIcon icon={FiMic} className="h-3 w-3" />
          Hidden podcast pages:
        </span>
        <a href="https://urf.life/#/yellow" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-text-primary transition-colors">
          Yellow <SafeIcon icon={FiExternalLink} className="h-3 w-3" />
        </a>
        <a href="https://urf.life/#/green" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-text-primary transition-colors">
          Green <SafeIcon icon={FiExternalLink} className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
};

export default AdminDashboard;
