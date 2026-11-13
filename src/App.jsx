import {lazy, Suspense, useEffect} from 'react'
import {HashRouter as Router,Routes,Route,useLocation,useNavigate} from 'react-router-dom'
import {AnimatePresence,motion} from 'framer-motion'
import './App.css'

import Home from './pages/Home'
import ErrorBoundary from './components/ErrorBoundary'
import { LoadingSpinner } from './components/LoadingSpinner'
import { ToastProvider } from './hooks/useToast'
import { ConfirmProvider } from './hooks/useConfirm'
import supabase from './lib/supabase'

const About = lazy(() => import('./pages/About'))
const Services = lazy(() => import('./pages/Services'))
const Ministries = lazy(() => import('./pages/Ministries'))
const Give = lazy(() => import('./pages/Give'))
const Contact = lazy(() => import('./pages/Contact'))
const Announcements = lazy(() => import('./pages/Announcements'))
const PublicCalendar = lazy(() => import('./pages/PublicCalendar'))
const SermonBlog = lazy(() => import('./pages/SermonBlog'))
const ShinePodcast = lazy(() => import('./pages/ShinePodcast'))
const SermonPodcast = lazy(() => import('./pages/SermonPodcast'))
const TableGroupSignup = lazy(() => import('./pages/TableGroupSignup'))
const EventRegistration = lazy(() => import('./pages/EventRegistration'))
const ClassRegistration = lazy(() => import('./pages/ClassRegistration'))
const JoinRealm = lazy(() => import('./pages/JoinRealm'))
const Rental = lazy(() => import('./pages/Rental'))
const Resources = lazy(() => import('./pages/Resources'))
const DailyDevotionals = lazy(() => import('./pages/DailyDevotionals'))
const Search = lazy(() => import('./pages/Search'))
const Admin = lazy(() => import('./pages/Admin'))
const Yellow = lazy(() => import('./pages/Yellow'))
const Green = lazy(() => import('./pages/Green'))
const CapitalCampaign = lazy(() => import('./pages/CapitalCampaign'))
const NotFound = lazy(() => import('./pages/NotFound'))

const pageVariants = {
  initial: {opacity: 0, y: 16},
  animate: {opacity: 1, y: 0},
  exit: {opacity: 0, y: -8},
}

const pageTransition = {duration: 0.14, ease: [0.4, 0, 0.2, 1]}

const PageLoader = () => (
  <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
    <LoadingSpinner size="lg" />
  </div>
)

// Supabase delivers magic-link sessions by appending `#access_token=...`
// (or `#error=...` for an expired/used link) onto the redirect URL we gave
// it - which is just the plain origin (see Admin.jsx/AdminStaffAccess.jsx),
// since with HashRouter the route itself already lives in the hash and
// can't share it with a second, nested `#`. That means every magic-link
// click lands here as if visiting an unmapped hash path, with Supabase's
// own client already having read the token out of that hash during its
// own initialization. This runs once on mount, regardless of which route
// matched, and sends the browser on to /admin - the only place in this
// app a magic link is ever used - so Admin.jsx's existing session/role
// resolution can pick up the session supabase-js already established.
const AuthRedirectBridge = () => {
  const navigate = useNavigate()
  useEffect(() => {
    const hash = window.location.hash
    if (!hash.includes('access_token=') && !hash.includes('error=')) return

    // HashRouter owns this same hash for routing, so navigating before
    // Supabase has actually read the token out of it would overwrite -
    // and lose - the very data Supabase needs. getSession() internally
    // awaits Supabase's own hash-processing before resolving, so by the
    // time it returns we know whether a session landed, and it's safe to
    // take the hash over for routing either way.
    let cancelled = false
    const goToAdmin = () => {
      if (!cancelled) navigate('/admin', {replace: true})
    }
    supabase.auth.getSession().then(({data: {session}}) => {
      if (cancelled) return
      if (session) {
        goToAdmin()
        return
      }
      // A used/expired link lands here with no session - still move on to
      // /admin so the normal login form shows there instead of a blank
      // unmapped hash.
      goToAdmin()
    })
    return () => {
      cancelled = true
    }
  }, [navigate])
  return null
}

const AnimatedRoutes = () => {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={pageTransition}
        style={{minHeight: '100vh'}}
      >
        <Suspense fallback={<PageLoader />}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/events" element={<EventRegistration />} />
            <Route path="/ministries" element={<Ministries />} />
            <Route path="/give" element={<Give />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/daily-devotionals" element={<DailyDevotionals />} />
            <Route path="/search" element={<Search />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/calendar" element={<PublicCalendar />} />
            <Route path="/sermon-blog" element={<SermonBlog />} />
            <Route path="/shine-podcast" element={<ShinePodcast />} />
            <Route path="/sermon-podcast" element={<SermonPodcast />} />
            <Route path="/table-group-signup" element={<TableGroupSignup />} />
            <Route path="/event-registration" element={<EventRegistration />} />
            <Route path="/class-registration" element={<ClassRegistration />} />
            <Route path="/join-realm" element={<JoinRealm />} />
            <Route path="/rental" element={<Rental />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/yellow" element={<Yellow />} />
            <Route path="/green" element={<Green />} />
            <Route path="/capital-campaign" element={<CapitalCampaign />} />
            <Route path="/growth-campaign" element={<CapitalCampaign />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <ConfirmProvider>
          <Router>
            <div className="min-h-screen bg-accent">
              <AuthRedirectBridge />
              <AnimatedRoutes />
            </div>
          </Router>
        </ConfirmProvider>
      </ToastProvider>
    </ErrorBoundary>
  )
}

export default App
