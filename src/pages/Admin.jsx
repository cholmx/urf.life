import React,{useState,useEffect,lazy,Suspense} from 'react';
import {Link} from 'react-router-dom';
import {motion,AnimatePresence} from 'framer-motion';
import { FiPlay, FiBookOpen, FiHome, FiLock, FiStar, FiHeart, FiUsers, FiUserPlus, FiTrendingUp, FiMessageSquare, FiGrid, FiLogOut, FiInbox, FiMic, FiPrinter, FiCalendar, FiArchive, FiMail, FiImage, FiClipboard, FiMenu, FiX, FiKey } from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import supabase from '../lib/supabase';
import {SkeletonBox,LoadingTransition} from '../components/LoadingSkeletons';
import {StaffCommsStyles} from '../staffComms/components/StaffCommsStyles';
import {ErrorToastContainer} from '../staffComms/components/ui/ErrorToast';
import {useHappeningsData} from '../staffComms/hooks/useHappeningsData';
import {ManagePage} from '../staffComms/components/manage/ManagePage';
import {CalendarPage} from '../staffComms/components/calendar/CalendarPage';
import {StageScriptPage} from '../staffComms/components/stage/StageScriptPage';
import {PrintablesPage} from '../staffComms/components/printables/PrintablesPage';
import {ArchivePage} from '../staffComms/components/archive/ArchivePage';
import {HappeningsPage} from '../staffComms/components/happenings/HappeningsPage';
import NotificationBell from '../components/admin-submissions/NotificationBell';

// Each of these is only ever needed once its own nav section is opened -
// eagerly importing them here used to pull all ten (SlideMaker and
// SignupSheetMaker included) into the same chunk as Admin.jsx itself, so
// every admin page load downloaded every tool's code up front.
const AdminSermons = lazy(() => import('../components/AdminSermons'));
const AdminResources = lazy(() => import('../components/AdminResources'));
const AdminFeaturedButtons = lazy(() => import('../components/AdminFeaturedButtons'));
const AdminMinistries = lazy(() => import('../components/AdminMinistries'));
const AdminStaffContacts = lazy(() => import('../components/AdminStaffContacts'));
const AdminCapitalCampaign = lazy(() => import('../components/AdminCapitalCampaign'));
const AdminComments = lazy(() => import('../components/AdminComments'));
const AdminStaffAccess = lazy(() => import('../components/AdminStaffAccess'));
const AdminDashboard = lazy(() => import('../components/AdminDashboard'));
const AdminSubmissions = lazy(() => import('../components/AdminSubmissions'));
const AdminRentals = lazy(() => import('../components/AdminRentals'));
const SlideMaker = lazy(() => import('../staffTools/slideMaker/SlideMaker'));
const SignupSheetMaker = lazy(() => import('../staffTools/signupSheet/SignupSheetMaker'));

const NAV_SECTIONS=[
  {
    items: [
      {id: 'overview',label: 'Dashboard',icon: FiGrid},
      {id: 'submissions',label: 'Submissions',icon: FiInbox},
      {id: 'rentals',label: 'Rentals',icon: FiKey},
    ],
  },
  {
    label: 'Communication',
    items: [
      {id: 'calendar',label: 'Calendar',icon: FiCalendar},
      {id: 'happenings',label: 'The Happenings',icon: FiMail},
      {id: 'stageScript',label: 'Stage Script',icon: FiMic},
      {id: 'printables',label: 'Monthly Flyer',icon: FiPrinter},
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
    ],
  },
  {
    label: 'Growth Campaign',
    items: [
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
  {
    label: 'Admin',
    items: [
      {id: 'staffAccess',label: 'Staff Access',icon: FiUserPlus},
    ],
  },
];

const ALL_TABS=NAV_SECTIONS.flatMap((section)=> section.items);

// The one real admin identity - see the staff_users_portal123 migration
// and the invite-staff edge function, which both hardcode this same
// address as the only one allowed to invite/manage other staff logins.
const ADMIN_EMAIL='chris@urfellowship.com';

// Every section a `staff`-role login is allowed to see, both in the nav
// and (defensively, in renderContent below) even if activeTab somehow
// ends up pointed at something restricted. Everything NOT listed here
// (Archive, Sermons, Resources, Ministries, Staff Contacts, Featured
// Buttons, Growth Campaign, Comments, and this file's own Staff Access
// screen) is admin-only.
const STAFF_ALLOWED_TABS=new Set([
  'overview','submissions','rentals','calendar','happenings',
  'stageScript','printables','slideMaker','signupSheet',
]);

// Matches the real login card's shape (icon circle, title, subtitle, one
// email field, one submit button) rather than the generic multi-field
// SkeletonForm, which was roughly 4x too big for this one-field form.
const LoginSkeleton=()=> (
  <div className="bg-white rounded-3xl shadow-modern-lg p-8 max-w-md w-full mx-4">
    <div className="text-center mb-6 flex flex-col items-center">
      <SkeletonBox width="w-16" height="h-16" rounded="rounded-full" className="mb-4 bg-primary/15" />
      <SkeletonBox width="w-40" height="h-7" className="mb-2 bg-primary/15" />
      <SkeletonBox width="w-56" height="h-4" />
    </div>
    <div className="space-y-4">
      <SkeletonBox width="w-full" height="h-12" rounded="rounded-xl" />
      <SkeletonBox width="w-full" height="h-12" rounded="rounded-xl" className="bg-primary/15" />
    </div>
  </div>
);

// Fallback while a lazy-loaded admin section's own code downloads - brief
// on a normal connection, but real content only starts painting once it's
// actually there rather than leaving a blank pane.
const AdminSectionSkeleton=()=> (
  <div className="space-y-4">
    <SkeletonBox width="w-48" height="h-6" />
    <SkeletonBox width="w-full" height="h-32" rounded="rounded-xl" />
    <SkeletonBox width="w-full" height="h-32" rounded="rounded-xl" />
  </div>
);

const Admin=()=> {
  const [isAuthenticated,setIsAuthenticated]=useState(false);
  const [checkingSession,setCheckingSession]=useState(true);
  // null while unknown/resolving, 'admin' | 'staff' once resolved, or
  // 'denied' for a real session whose email has no staff_users_portal123
  // row - see the resolveRole/signOut effects below.
  const [role,setRole]=useState(null);
  const [deniedEmail,setDeniedEmail]=useState(null);
  const [email,setEmail]=useState('');
  const [linkSent,setLinkSent]=useState(false);
  const [error,setError]=useState('');
  const [activeTab,setActiveTab]=useState('overview');
  const [loading,setLoading]=useState(false);
  const [sidebarOpen,setSidebarOpen]=useState(false);
  const [signupSheetTarget,setSignupSheetTarget]=useState(null);
  const [submissionsInitialTab,setSubmissionsInitialTab]=useState(null);

  // Shared across the Dashboard's embedded Manage section, Calendar,
  // Stage Script, Printables, and Archive pages - one fetch, one preview
  // date, one toast queue, no matter which of those pages is currently active.
  const happenings=useHappeningsData(isAuthenticated,()=> setActiveTab('overview'));

  useEffect(()=> {
    let cancelled=false;

    // A real Supabase session only proves someone clicked a sign-in link
    // for that email - it says nothing about whether they're actually
    // allowed into /admin. staff_users_portal123 is the real gate: no row
    // there means no access, regardless of how legitimate the session is.
    const resolveRole=async (session)=> {
      const sessionEmail=session?.user?.email || null;
      if (!sessionEmail) {
        setRole(null);
        return;
      }
      const {data,error: roleError}=await supabase
        .from('staff_users_portal123')
        .select('role')
        .eq('email',sessionEmail.toLowerCase())
        .maybeSingle();
      if (cancelled) return;
      if (roleError || !data) {
        setDeniedEmail(sessionEmail);
        setRole('denied');
        return;
      }
      setDeniedEmail(null);
      setRole(data.role);
    };

    supabase.auth.getSession().then(({data: {session}})=> {
      setIsAuthenticated(!!session);
      resolveRole(session).finally(()=> { if (!cancelled) setCheckingSession(false); });
    });
    const {data: listener}=supabase.auth.onAuthStateChange((_event,session)=> {
      setIsAuthenticated(!!session);
      resolveRole(session);
    });
    return ()=> { cancelled=true; listener.subscription.unsubscribe(); };
  },[]);

  // A denied login shouldn't linger with a live session just because the
  // UI hasn't gotten around to signing it out yet - deniedEmail (set just
  // above, right before this fires) is what actually drives the message
  // shown on the login screen afterward.
  useEffect(()=> {
    if (role==='denied') {
      supabase.auth.signOut();
    }
  },[role]);

  const handleEmailSubmit=async (e)=> {
    e.preventDefault();
    setLoading(true);
    setError('');
    setDeniedEmail(null);
    const cleanEmail=email.trim().toLowerCase();
    try {
      const {error: otpError}=await supabase.auth.signInWithOtp({
        email: cleanEmail,
        // Plain origin, not `${origin}/#/admin` - with HashRouter the route
        // already lives in the URL's hash, and Supabase delivers the magic
        // link's session by appending its OWN `#access_token=...` onto
        // whatever redirect URL we give it. Baking a hash into this URL
        // produces a double hash (`#/admin#access_token=...`) that
        // Supabase's own client can't parse back out - the AuthRedirectBridge
        // in App.jsx is what actually routes a returning magic-link click
        // into /admin once the token lands in a clean hash.
        options: {emailRedirectTo: window.location.origin}
      });
      if (otpError) {
        // This project has public self-service signups disabled, so the
        // one true admin's very first-ever login has no existing account
        // for signInWithOtp to send a link to, and it refuses to create
        // one ("Signups not allowed for this instance"). admin-bootstrap
        // uses a privileged, admin-only API to create that one hardcoded
        // account and email him a real sign-in link instead - every login
        // after this one goes through the normal path above, since his
        // account then already exists.
        if (cleanEmail===ADMIN_EMAIL && /signup/i.test(otpError.message || '')) {
          const {data,error: bootstrapError}=await supabase.functions.invoke('admin-bootstrap',{
            body: {redirectTo: window.location.origin}
          });
          if (bootstrapError || data?.error) {
            throw new Error(data?.error || bootstrapError?.message || 'Could not send the sign-in link.');
          }
        } else {
          throw otpError;
        }
      }
      setLinkSent(true);
    } catch (err) {
      console.error('Sign-in link request failed:',err);
      setError(err?.message || 'Could not send the sign-in link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout=async ()=> {
    await supabase.auth.signOut();
  };

  const selectTab=(id)=> {
    // Editing an announcement doesn't change tabs - it swaps the Dashboard
    // tab's list for its form in place - so clicking Dashboard while
    // editing was a no-op (activeTab was already 'overview') and left the
    // form stuck open. Any nav click now discards an in-progress edit,
    // same as the form's own Cancel button already does with no confirm.
    if (happenings.editing) {
      happenings.setEditing(null);
      happenings.setCopySource(null);
    }
    // A normal nav click always opens Submissions on its default sub-tab -
    // only the notification bell (handleBellSelect) deep-links to a specific one.
    setSubmissionsInitialTab(null);
    setActiveTab(id);
    setSidebarOpen(false);
  };

  const handleBellSelect=(key)=> {
    if (happenings.editing) {
      happenings.setEditing(null);
      happenings.setCopySource(null);
    }
    if (key==='rentals') {
      setActiveTab('rentals');
    } else {
      setSubmissionsInitialTab(key==='tableGroups' ? 'table-groups' : key);
      setActiveTab('submissions');
    }
    setSidebarOpen(false);
  };

  const renderContent=()=> {
    // Defense in depth: the nav already hides restricted sections from a
    // `staff` login, but activeTab is still plain state - this stops a
    // forced/stale value (e.g. the bell's deep link, or state left over
    // from before a role downgrade) from ever actually rendering one.
    if (role!=='admin' && !STAFF_ALLOWED_TABS.has(activeTab)) {
      return (
        <div className="bg-white rounded-2xl shadow-modern p-8 text-center">
          <p className="text-neutral-600">
            You don't have access to this section. Contact {ADMIN_EMAIL} if you think this is a mistake.
          </p>
        </div>
      );
    }
    switch (activeTab) {
      case 'overview':
        return (
          <>
            <ManagePage
              announcements={happenings.activeAnnouncements}
              today={happenings.today}
              onPreviewDateChange={happenings.setToday}
              onSave={happenings.handleSave}
              onDelete={happenings.handleDelete}
              onTogglePublish={happenings.handleTogglePublish}
              onToggleDestination={happenings.handleToggleDestination}
              editing={happenings.editing}
              setEditing={happenings.setEditing}
              copySource={happenings.copySource}
              setCopySource={happenings.setCopySource}
              loading={happenings.loading}
              onError={happenings.showError}
              onOpenSignupSheet={(a)=> { setSignupSheetTarget(a); setActiveTab('signupSheet'); }}
              onNavigateTab={selectTab}
            />
            <div className="mt-10 pt-6 border-t border-neutral-200">
              <AdminDashboard onNavigate={selectTab} />
            </div>
          </>
        );
      case 'submissions':
        return <AdminSubmissions initialTab={submissionsInitialTab} />;
      case 'rentals':
        return <AdminRentals />;
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
      case 'stageScript':
        return (
          <StageScriptPage
            announcements={happenings.activeAnnouncements}
            today={happenings.today}
            onPreviewDateChange={happenings.setToday}
            onError={happenings.showError}
          />
        );
      case 'printables':
        return (
          <PrintablesPage
            announcements={happenings.activeAnnouncements}
            today={happenings.today}
            onPreviewDateChange={happenings.setToday}
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
      case 'staffAccess':
        return <AdminStaffAccess />;
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

  // Still finding out whether there's a session, and - if there is - what
  // its email is actually allowed to do. Shown for the initial check AND
  // for the brief window right after a session appears (fresh sign-in,
  // or returning with one already) while the role lookup is in flight -
  // without this, a `staff` login would flash the full nav for an
  // instant before narrowing down to its real sections.
  const resolvingRole=isAuthenticated && role===null;
  if (checkingSession || resolvingRole) {
    return (
      <div className="admin-shell min-h-screen py-12 flex items-center justify-center bg-accent">
        <LoginSkeleton />
      </div>
    );
  }

  // Login screen: no session yet, or a session whose email isn't in
  // staff_users_portal123 (role==='denied' - see the signOut effect above,
  // which is already unwinding that session as this renders).
  if (!isAuthenticated || role==='denied') {
    return (
      <div className="admin-shell min-h-screen py-12 flex items-center justify-center relative bg-accent">
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

        <LoadingTransition isLoading={loading} skeleton={<LoginSkeleton />}>
          <motion.div
            initial={{opacity: 0,scale: 0.9}}
            animate={{opacity: 1,scale: 1}}
            transition={{duration: 0.25}}
            className="bg-white rounded-3xl shadow-modern-lg p-8 max-w-md w-full mx-4"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <SafeIcon icon={FiLock} className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-neutral-900 mb-2">
                Admin Access
              </h1>
              <p className="text-neutral-500">
                {linkSent
                  ? 'Check your email for a sign-in link.'
                  : "Enter your email and we'll send you a one-click sign-in link."}
              </p>
            </div>

            {deniedEmail && (
              <div className="text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm mb-4">
                {deniedEmail} isn't authorized for admin access. Contact {ADMIN_EMAIL} to request access.
              </div>
            )}

            {linkSent ? (
              <button
                type="button"
                onClick={()=> { setLinkSent(false); setEmail(''); }}
                className="w-full bg-white border border-neutral-200 text-neutral-700 py-3 px-6 rounded-xl font-semibold hover:bg-neutral-50 transition-colors"
              >
                Use a different email
              </button>
            ) : (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label className="admin-label">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e)=> setEmail(e.target.value)}
                    required
                    className="admin-input"
                    placeholder="you@example.com"
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
                  {loading ? 'Sending...' : 'Send Sign-in Link'}
                </button>
              </form>
            )}
          </motion.div>
        </LoadingTransition>
      </div>
    );
  }

  const activeLabel=ALL_TABS.find((t)=> t.id===activeTab)?.label || 'Overview';

  // A `staff` login only ever sees the sections it's allowed into - an
  // admin still sees every section, same as before this all existed.
  const visibleNavSections=role==='admin'
    ? NAV_SECTIONS
    : NAV_SECTIONS
        .map((section)=> ({...section,items: section.items.filter((item)=> STAFF_ALLOWED_TABS.has(item.id))}))
        .filter((section)=> section.items.length > 0);

  const NavList=()=> (
    <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
      {visibleNavSections.map((section,i)=> (
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
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors duration-150 ${
                  activeTab===tab.id
                    ? 'bg-white/10 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <SafeIcon icon={tab.icon} className="h-3.5 w-3.5 flex-shrink-0" />
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
    <div className="admin-shell min-h-screen bg-accent md:flex">
      <StaffCommsStyles />
      {/* Sidebar - desktop. Pinned to the viewport height (not just
          flex-stretched to match the main content column) so "Back to
          Site"/"Log Out" stay reachable without scrolling the whole page -
          the main content column can run much taller than one screen. */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:flex-shrink-0 md:sticky md:top-0 md:h-screen bg-neutral-900">
        <div className="px-5 py-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <div className="text-white font-bold text-lg leading-tight">Admin</div>
            <div className="text-white/40 text-xs">Upper Room Fellowship</div>
          </div>
          <NotificationBell onSelect={handleBellSelect} align="left" />
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
        <div className="flex items-center">
          <NotificationBell onSelect={handleBellSelect} />
          <Link to="/" className="p-2 -mr-2 !text-white" title="Back to Home">
            <SafeIcon icon={FiHome} className="h-5 w-5" />
          </Link>
        </div>
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
              transition={{duration: 0.1}}
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
            transition={{duration: 0.15}}
          >
            <Suspense fallback={<AdminSectionSkeleton />}>
              {renderContent()}
            </Suspense>
          </motion.div>
        </div>
      </div>

      <ErrorToastContainer toasts={happenings.toasts} onDismiss={happenings.dismissToast} />
    </div>
  );
};

export default Admin;
