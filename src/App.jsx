import {lazy, Suspense} from 'react'
import {HashRouter as Router,Routes,Route,useLocation} from 'react-router-dom'
import {AnimatePresence,motion} from 'framer-motion'
import './App.css'

import Home from './pages/Home'
import ErrorBoundary from './components/ErrorBoundary'
import { ToastProvider } from './hooks/useToast'
import { ConfirmProvider } from './hooks/useConfirm'

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

const pageTransition = {duration: 0.28, ease: [0.4, 0, 0.2, 1]}

const PageLoader = () => (
  <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
  </div>
)

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
              <AnimatedRoutes />
            </div>
          </Router>
        </ConfirmProvider>
      </ToastProvider>
    </ErrorBoundary>
  )
}

export default App
