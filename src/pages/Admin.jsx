import React,{useState,useEffect} from 'react';
import {Link} from 'react-router-dom';
import {motion,AnimatePresence} from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import supabase from '../lib/supabase';
import {SkeletonForm,LoadingTransition} from '../components/LoadingSkeletons';
import AdminSermons from '../components/AdminSermons';
import AdminResources from '../components/AdminResources';
import AdminFeaturedButtons from '../components/AdminFeaturedButtons';
import AdminMinistries from '../components/AdminMinistries';
import AdminStaffContacts from '../components/AdminStaffContacts';
import AdminCapitalCampaign from '../components/AdminCapitalCampaign';
import AdminComments from '../components/AdminComments';
import AdminDashboard from '../components/AdminDashboard';
import AdminSubmissions from '../components/AdminSubmissions';
import {StaffCommsStyles} from '../staffComms/components/StaffCommsStyles';
import {ErrorToastContainer} from '../staffComms/components/ui/ErrorToast';
import {useHappeningsData} from '../staffComms/hooks/useHappeningsData';
import {ManagePage} from '../staffComms/components/manage/ManagePage';
import {CalendarPage} from '../staffComms/components/calendar/CalendarPage';
import {OutputsPage} from '../staffComms/components/outputs/OutputsPage';
import {ArchivePage} from '../staffComms/components/archive/ArchivePage';
import {HappeningsPage} from '../staffComms/components/happenings/HappeningsPage';
import SlideMaker from '../staffTools/slideMaker/SlideMaker';
import SignupSheetMaker from '../staffTools/signupSheet/SignupSheetMaker';

const {FiPlay,FiBookOpen,FiHome,FiLock,FiStar,FiHeart,FiUsers,FiTrendingUp,FiMessageSquare,FiGrid,FiLogOut,FiInbox,FiRadio,FiCalendar,FiArchive,FiMail,FiImage,FiClipboard,FiMenu,FiX}=FiIcons;

const NAV_SECTIONS=[
  {
    items: [
      {id: 'overview',label: 'Dashboard',icon: FiGrid},
      {id: 'submissions',label: 'Submissions',icon: FiInbox},
    ],
  },
  {
    label: 'Communication',
    items: [
      {id: 'calendar',label: 'Calendar',icon: FiCalendar},
      {id: 'happenings',label: 'The Happenings',icon: FiMail},
      {id: 'outputs',label: 'Outputs',icon: FiRadio},
      {id: 'archive',label: 'Archive',icon: FiArchive},
    ],
  },
  {
    label: 'Content',
    items: [
      {id: 'sermons',label: 'Sermons',icon: FiPlay},
      {id: 'resources',label: 'Resources',icon: FiBookOpen},
      {id: 'ministries',label: 'Ministries',icon: FiHeart},
      {id: 'staff',label: 'Staff Contacts',icon: FiUsers},
      {id: 'featured',label: 'Featured Buttons',icon: FiStar},
      {id: 'campaign',label: 'Growth Campaign',icon: FiTrendingUp},
      {id: 'comments',label: 'Comments',icon: FiMessageSquare},
    ],
  },
  {
    label: 'Tools',
    items: [
      {id: 'slideMaker',label: 'Slide Maker',icon: FiImage},
      {id: 'signupSheet',label: 'Sign-up Sheets',icon: FiClipboard},
    ],
  },
];

const ALL_TABS=NAV_SECTIONS.flatMap((section)=> section.items);

const Admin=()=> {
  const [isAuthenticated,setIsAuthenticated]=useState(false);
  const [checkingSession,setCheckingSession]=useState(true);
  const [password,setPassword]=useState('');
  const [error,setError]=useState('');
  const [activeTab,setActiveTab]=useState('overview');
  const [loading,setLoading]=useState(false);
  const [sidebarOpen,setSidebarOpen]=useState(false);
  const [signupSheetTarget,setSignupSheetTarget]=useState(null);

  // Shared across the Dashboard's embedded Manage section, Calendar,
  // Outputs, and Archive pages - one fetch, one preview date, one toast
  // queue, no matter which of those pages is currently active.
  const happenings=useHappeningsData(isAuthenticated,()=> setActiveTab('overview'));

  useEffect(()=> {
    supabase.auth.getSession().then(({data: {session}})=> {
      setIsAuthenticated(!!session);
      setCheckingSession(false);
    });
    const {data: listener}=supabase.auth.onAuthStateChange((_event,session)=> {
      setIsAuthenticated(!!session);
    });
    return ()=> listener.subscription.unsubscribe();
  },[]);

  const handlePasswordSubmit=async (e)=> {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const {data,error: fnError}=await supabase.functions.invoke('admin-login',{
        body: {password}
      });
      if (fnError || data?.error) {
        throw new Error(data?.error || fnError?.message || 'Invalid password');
      }
      const {error: otpError}=await supabase.auth.verifyOtp({
        token_hash: data.token,
        type: 'magiclink'
      });
      if (otpError) throw otpError;
      setPassword('');
    } catch (err) {
      console.error('Admin login failed:',err);
      setError(err?.message || 'Login failed. Please try again.');
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout=async ()=> {
    await supabase.auth.signOut();
  };

  const selectTab=(id)=> {
    setActiveTab(id);
    setSidebarOpen(false);
  };

  const renderContent=()=> {
    switch (activeTab) {
      case 'overview':
        return (
          <>
            <h2 className="text-xl font-bold text-neutral-900 mb-4">Communication Organizer</h2>
            <ManagePage
              announcements={happenings.activeAnnouncements}
              today={happenings.today}
              onPreviewDateChange={happenings.setToday}
              onSave={happenings.handleSave}
              onDelete={happenings.handleDelete}
              onApprove={happenings.handleApprove}
              onTogglePublish={happenings.handleTogglePublish}
              editing={happenings.editing}
              setEditing={happenings.setEditing}
              copySource={happenings.copySource}
              setCopySource={happenings.setCopySource}
              loading={happenings.loading}
              onError={happenings.showError}
              onOpenSignupSheet={(a)=> { setSignupSheetTarget(a); setActiveTab('signupSheet'); }}
            />
            <div className="mt-10 pt-6 border-t border-neutral-200">
              <AdminDashboard onNavigate={selectTab} />
            </div>
          </>
        );
      case 'submissions':
        return <AdminSubmissions />;
      case 'calendar':
        return (
          <CalendarPage
            announcements={happenings.activeAnnouncements}
            today={happenings.today}
            onSave={happenings.handleSave}
            onDelete={happenings.handleDelete}
            onPreviewDateChange={happenings.setToday}
            onError={happenings.showError}
          />
        );
      case 'happenings':
        return (
          <HappeningsPage
            announcements={happenings.activeAnnouncements}
            today={happenings.today}
            onPreviewDateChange={happenings.setToday}
          />
        );
      case 'outputs':
        return (
          <OutputsPage
            announcements={happenings.activeAnnouncements}
            today={happenings.today}
            onPreviewDateChange={happenings.setToday}
            onToggleSlideMade={happenings.handleToggleSlideMade}
            onError={happenings.showError}
          />
        );
      case 'archive':
        return (
          <ArchivePage
            announcements={happenings.archivedAnnouncements}
            onDelete={happenings.handleDelete}
            onCopy={happenings.handleCopyFromArchive}
          />
        );
      case 'sermons':
        return <AdminSermons />;
      case 'resources':
        return <AdminResources />;
      case 'ministries':
        return <AdminMinistries />;
      case 'staff':
        return <AdminStaffContacts />;
      case 'featured':
        return <AdminFeaturedButtons />;
      case 'campaign':
        return <AdminCapitalCampaign />;
      case 'comments':
        return <AdminComments />;
      case 'slideMaker':
        return (
          <SlideMaker
            announcements={happenings.activeAnnouncements}
            today={happenings.today}
            onToggleSlideMade={happenings.handleToggleSlideMade}
          />
        );
      case 'signupSheet':
        return (
          <SignupSheetMaker
            happening={signupSheetTarget}
            onClearHappening={()=> setSignupSheetTarget(null)}
          />
        );
      default:
        return <AdminDashboard onNavigate={selectTab} />;
    }
  };

  // Password protection screen
  if (!isAuthenticated) {
    if (checkingSession) {
      return (
        <div className="admin-shell min-h-screen py-12 flex items-center justify-center bg-neutral-50">
          <SkeletonForm />
        </div>
      );
    }
    return (
      <div className="admin-shell min-h-screen py-12 flex items-center justify-center relative bg-neutral-50">
        {/* Back to Home Button - Top Right */}
        <div className="fixed top-6 right-6 z-50">
          <Link
            to="/"
            className="inline-flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 bg-neutral-900"
            title="Back to Home"
          >
            <SafeIcon icon={FiHome} className="h-5 w-5 text-white" />
          </Link>
        </div>

        <LoadingTransition isLoading={loading} skeleton={<SkeletonForm />}>
          <motion.div
            initial={{opacity: 0,scale: 0.9}}
            animate={{opacity: 1,scale: 1}}
            transition={{duration: 0.5}}
            className="bg-white rounded-3xl shadow-modern-lg p-8 max-w-md w-full mx-4 border border-neutral-100"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <SafeIcon icon={FiLock} className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-neutral-900 mb-2">
                Admin Access
              </h1>
              <p className="text-neutral-500">
                Please enter the admin password to continue
              </p>
            </div>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="admin-label">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e)=> setPassword(e.target.value)}
                  required
                  className="admin-input"
                  placeholder="Enter admin password"
                  autoFocus
                />
              </div>
              {error && (
                <div className="text-red-600 text-sm">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-neutral-900 text-white py-3 px-6 rounded-xl font-semibold hover:bg-neutral-700 transition-colors disabled:opacity-50 active:scale-[0.98]"
              >
                {loading ? 'Authenticating...' : 'Access Admin Dashboard'}
              </button>
            </form>
          </motion.div>
        </LoadingTransition>
      </div>
    );
  }

  const activeLabel=ALL_TABS.find((t)=> t.id===activeTab)?.label || 'Overview';

  const NavList=()=> (
    <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
      {NAV_SECTIONS.map((section,i)=> (
        <div key={section.label || `top-${i}`}>
          {section.label && (
            <div className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/35">
              {section.label}
            </div>
          )}
          <div className="space-y-0.5">
            {section.items.map((tab)=> (
              <button
                key={tab.id}
                onClick={()=> selectTab(tab.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                  activeTab===tab.id
                    ? 'bg-white/10 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <SafeIcon icon={tab.icon} className="h-4 w-4 flex-shrink-0" />
                <span className="text-left leading-tight">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );

  // Main admin dashboard (shown after authentication)
  return (
    <div className="admin-shell min-h-screen bg-neutral-50 md:flex">
      <StaffCommsStyles />
      {/* Sidebar - desktop */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:flex-shrink-0 bg-neutral-900">
        <div className="px-5 py-5 border-b border-white/10">
          <div className="text-white font-bold text-lg leading-tight">Admin</div>
          <div className="text-white/40 text-xs">Upper Room Fellowship</div>
        </div>
        <NavList />
        <div className="px-3 py-4 border-t border-white/10 space-y-0.5">
          <Link
            to="/"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium !text-white/60 hover:!text-white hover:bg-white/5 transition-colors"
          >
            <SafeIcon icon={FiHome} className="h-4 w-4" />
            Back to Site
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors"
          >
            <SafeIcon icon={FiLogOut} className="h-4 w-4" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden sticky top-0 z-40 bg-neutral-900 text-white flex items-center justify-between px-4 h-14">
        <button onClick={()=> setSidebarOpen(true)} className="p-2 -ml-2" aria-label="Open menu">
          <SafeIcon icon={FiMenu} className="h-5 w-5" />
        </button>
        <span className="font-semibold text-sm truncate">{activeLabel}</span>
        <Link to="/" className="p-2 -mr-2 !text-white" title="Back to Home">
          <SafeIcon icon={FiHome} className="h-5 w-5" />
        </Link>
      </div>

      {/* Mobile sidebar drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              exit={{opacity: 0}}
              onClick={()=> setSidebarOpen(false)}
              className="md:hidden fixed inset-0 bg-black/40 z-40"
            />
            <motion.aside
              initial={{x: '-100%'}}
              animate={{x: 0}}
              exit={{x: '-100%'}}
              transition={{duration: 0.2}}
              className="md:hidden fixed top-0 left-0 bottom-0 w-72 bg-neutral-900 z-50 flex flex-col"
            >
              <div className="px-5 py-5 border-b border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-white font-bold text-lg leading-tight">Admin</div>
                  <div className="text-white/40 text-xs">Upper Room Fellowship</div>
                </div>
                <button onClick={()=> setSidebarOpen(false)} className="p-2 text-white/60 hover:text-white" aria-label="Close menu">
                  <SafeIcon icon={FiX} className="h-5 w-5" />
                </button>
              </div>
              <NavList />
              <div className="px-3 py-4 border-t border-white/10 space-y-0.5">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <SafeIcon icon={FiLogOut} className="h-4 w-4" />
                  Log Out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="hidden md:block text-2xl font-bold text-neutral-900 mb-6">
            {activeLabel}
          </h1>
          <motion.div
            key={activeTab}
            initial={{opacity: 0,y: 12}}
            animate={{opacity: 1,y: 0}}
            transition={{duration: 0.3}}
          >
            {renderContent()}
          </motion.div>
        </div>
      </div>

      <ErrorToastContainer toasts={happenings.toasts} onDismiss={happenings.dismissToast} />
    </div>
  );
};

export default Admin;
