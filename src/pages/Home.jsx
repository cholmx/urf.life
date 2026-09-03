import React,{useState,useEffect} from 'react';
import {Link} from 'react-router-dom';
import {motion} from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import supabase from '../lib/supabase';

const {FiBell,FiPlay,FiMic,FiUsers,FiCreditCard,FiUserPlus,FiMail,FiCalendar,FiBookOpen,FiSettings,FiFacebook,FiInstagram,FiYoutube,FiGlobe,FiLogIn,FiExternalLink,FiFileText,FiHeadphones,FiTrendingUp,FiCheck,FiStar}=FiIcons;

const Home=()=> {
  const [hasEvents,setHasEvents]=useState(false);
  const [hasClasses,setHasClasses]=useState(false);
  const [hasResources,setHasResources]=useState(false);
  const [featuredDbButtons,setFeaturedDbButtons]=useState([]);
  const [loading,setLoading]=useState(true);

  useEffect(()=> {
    checkAvailability();
  },[]);

  const checkAvailability=async ()=> {
    try {
      const {data: events}=await supabase.from('events_portal123').select('id').limit(1);
      const {data: classes}=await supabase.from('classes_portal123').select('id').limit(1);
      const {data: resources}=await supabase.from('resources_portal123').select('id').limit(1);
      const {data: featuredButtons}=await supabase
        .from('featured_buttons_portal123')
        .select('*')
        .eq('is_active',true)
        .order('display_order',{ascending: true});

      setHasEvents(events && events.length > 0);
      setHasClasses(classes && classes.length > 0);
      setHasResources(resources && resources.length > 0);
      setFeaturedDbButtons(featuredButtons || []);
    } catch (error) {
      console.error('Error checking availability:',error);
    } finally {
      setLoading(false);
    }
  };

  const featuredButtons=[
    {title: 'Transforming Together Growth Campaign',description: 'Updates, vision, and ways to give and commit',icon: FiTrendingUp,path: '/capital-campaign',gradient: true},
    ...featuredDbButtons.map(btn=> ({
      title: btn.title,
      description: btn.description || '',
      icon: FiCheck,
      path: btn.path,
      isInternal: !btn.path.startsWith('http')
    })),
    ...(hasClasses ? [{title: 'Classes',description: 'Available church classes',icon: FiBookOpen,path: '/class-registration',isYellow: true}] : []),
    ...(hasEvents ? [{title: 'Events',description: 'Upcoming church events',icon: FiCalendar,path: '/event-registration',isOrange: true}] : [])
  ];

  const mainButtons=[
    {title: 'Announcements',description: 'Latest church news',icon: FiBell,path: '/announcements',isInternal: true},
    {title: 'Calendar',description: 'Everything coming up',icon: FiCalendar,path: '/calendar',isInternal: true},
    {title: 'Sermon Blog',description: 'Weekly sermons',icon: FiFileText,path: '/sermon-blog',isInternal: true},
    {title: 'Shine Podcast',description: 'Latest episodes',icon: FiMic,path: '/shine-podcast',isInternal: true},
    {title: 'Sermon Podcast',description: 'Listen to recordings',icon: FiHeadphones,path: '/sermon-podcast',isInternal: true},
    {title: 'Give',description: 'Support our ministry',icon: FiCreditCard,path: 'https://onrealm.org/urfellowship/-/form/give/now',isInternal: false},
    {title: 'Table Group Sign-Up',description: 'Join a small group',icon: FiUsers,path: '/table-group-signup',isInternal: true},
    ...(hasResources ? [{title: 'Resources',description: 'Helpful materials',icon: FiBookOpen,path: '/resources',isInternal: true}] : []),
    {title: 'Join Realm',description: 'Our online community',icon: FiUserPlus,path: '/join-realm',isInternal: true}
  ];

  const quickLinks=[
    {title: 'Contact',icon: FiMail,path: '/contact',isInternal: true},
    {title: 'Realm Login',icon: FiLogIn,path: 'https://onrealm.org/urfellowship/'},
    {title: 'Website',icon: FiGlobe,path: 'https://urfellowship.com'}
  ];

  const socialLinks=[
    {name: 'Facebook',icon: FiFacebook,url: 'https://www.facebook.com/urfellowship/'},
    {name: 'Instagram',icon: FiInstagram,url: 'https://www.instagram.com/urfellowship/'},
    {name: 'YouTube',icon: FiYoutube,url: 'https://www.youtube.com/c/TheUpperRoomFellowship'}
  ];

  const SkeletonButton=()=> (
    <div className="bg-accent-dark rounded-2xl animate-pulse w-full min-h-[160px] md:min-h-[200px] p-5 flex flex-col items-center justify-center">
      <div className="w-8 h-8 bg-accent rounded-full mb-3"></div>
      <div className="h-4 bg-accent rounded w-20 mb-2"></div>
      <div className="h-3 bg-accent rounded w-24"></div>
    </div>
  );

  const SkeletonQuickLink=()=> (
    <div className="bg-accent-dark rounded-xl animate-pulse w-[130px] h-[48px] md:w-[150px]">
    </div>
  );

  return (
    <div className="min-h-screen py-6 md:py-10 bg-accent">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-4 md:mb-6">
          <motion.h1
            initial={{opacity: 0,y: 20}} animate={{opacity: 1,y: 0}} transition={{duration: 0.7}}
            className="font-gsans uppercase font-black text-2xl md:text-4xl text-text-primary tracking-tight flex items-center justify-center gap-2.5"
          >
            <img src="/logonegtransblack%20copy.png" alt="" className="h-[1.35em] w-auto" />
            <span>Upper Room Fellowship</span>
          </motion.h1>
        </header>

        <main>
          {loading ? (
            <div className="flex flex-col items-center gap-8">
              <div className="w-full max-w-[344px] md:max-w-[711px]">
                <div className="bg-accent-dark rounded-2xl animate-pulse w-full h-[100px] mb-4"></div>
              </div>
              <div className="flex flex-col gap-4 w-full max-w-[344px] md:max-w-[711px]">
                <div className="bg-accent-dark rounded-2xl animate-pulse w-full h-[70px]"></div>
                <div className="bg-accent-dark rounded-2xl animate-pulse w-full h-[70px]"></div>
              </div>
              <div className="hidden md:grid md:grid-cols-3 gap-4"> {Array(9).fill(0).map((_, i) => <SkeletonButton key={i} />)} </div>
              <div className="grid grid-cols-2 md:hidden gap-3"> {Array(9).fill(0).map((_, i) => <SkeletonButton key={i} />)} </div>
              <div className="flex justify-center gap-3 mt-8">
                {Array(3).fill(0).map((_, i) => <SkeletonQuickLink key={i} />)}
              </div>
            </div>
          ) : (
            <>
              {featuredButtons.length > 0 && (
                <section className="mb-8 flex justify-center w-full">
                  <div className="flex flex-col gap-3 md:gap-4 w-full max-w-[344px] md:max-w-[711px]">
                    {featuredButtons.map((button, i) => (
                      <HomeButton key={button.title} {...button} isFeatured delay={0.3 + i * 0.1} />
                    ))}
                  </div>
                </section>
              )}

              <section className="flex justify-center w-full">
                <div className="w-full max-w-[344px] md:max-w-[711px]">
                  <div className="hidden md:grid md:grid-cols-3 gap-4 w-full items-stretch">
                    {mainButtons.map((button, i) => (
                      <HomeButton key={button.title} {...button} delay={0.5 + i * 0.05} stretch />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 md:hidden gap-3 w-full items-stretch">
                    {mainButtons.map((button, i) => (
                      <HomeButton key={button.title} {...button} delay={0.5 + i * 0.05} isLastOdd={mainButtons.length % 2 !== 0 && i === mainButtons.length - 1} stretch />
                    ))}
                  </div>
                </div>
              </section>

              <section className="mt-14 flex flex-col items-center">
                <motion.div
                  initial={{opacity: 0, y: 16}}
                  animate={{opacity: 1, y: 0}}
                  transition={{duration: 0.5, delay: 0.9}}
                  className="flex items-center gap-3 mb-5"
                >
                  <div className="h-px w-10 bg-text-light/30"></div>
                  <span className="font-caladea italic text-xs uppercase tracking-widest text-text-light">Quick Links</span>
                  <div className="h-px w-10 bg-text-light/30"></div>
                </motion.div>
                <div className="flex flex-wrap justify-center gap-3">
                  {quickLinks.map((link, i) => (
                    <QuickLinkButton key={link.title} {...link} delay={1.0 + i * 0.1} />
                  ))}
                  <motion.a
                    href="https://g.page/r/CfHLfp3nAOi_EBM/review"
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{opacity: 0, y: 12}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.4, delay: 1.3}}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-dark text-text-primary font-semibold text-sm font-gsans hover:bg-white transition-all duration-200 hover:scale-105 shadow-sm border border-text-light/10"
                  >
                    <SafeIcon icon={FiStar} className="h-4 w-4 text-yellow-500" />
                    Leave a Review
                  </motion.a>
                </div>
              </section>
            </>
          )}

          <motion.footer
            initial={{opacity: 0}} animate={{opacity: 1}} transition={{duration: 0.8, delay: 1.2}}
            className="mt-16 text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-5">
              <div className="h-px w-10 bg-text-light/30"></div>
              <span className="font-caladea italic text-xs uppercase tracking-widest text-text-light">Follow Us</span>
              <div className="h-px w-10 bg-text-light/30"></div>
            </div>
            <div className="flex justify-center space-x-3">
              {socialLinks.map((social, i) => (
                <motion.a
                  key={social.name} href={social.url} target="_blank" rel="noopener noreferrer"
                  initial={{opacity: 0, scale: 0.8}} animate={{opacity: 1, scale: 1}} transition={{duration: 0.5, delay: 1.3 + i * 0.1}}
                  className="p-3 rounded-full bg-accent-dark hover:bg-primary/15 text-text-light hover:text-primary transition-all duration-300 hover:scale-110"
                >
                  <SafeIcon icon={social.icon} className="h-5 w-5" />
                </motion.a>
              ))}
            </div>
            <div className="mt-12">
              <Link to="/admin" className="inline-flex items-center space-x-1 text-text-light/40 hover:text-text-light transition-colors text-xs">
                <SafeIcon icon={FiSettings} className="h-3 w-3" />
                <span>Admin</span>
              </Link>
            </div>
          </motion.footer>
        </main>
      </div>
    </div>
  );
};

const HomeButton = ({ title, description, icon, path, isFeatured = false, isInternal = true, delay = 0, gradient = false, isYellow = false, isOrange = false, isLastOdd = false, stretch = false }) => {
  const baseClasses = isFeatured
    ? "relative overflow-hidden p-4 md:p-5 rounded-2xl border border-white/10 shadow-modern hover:shadow-modern-lg transition-all duration-300 hover:-translate-y-1 block group w-full"
    : `relative overflow-hidden p-5 rounded-2xl border border-white/10 shadow-modern hover:shadow-modern-lg transition-all duration-300 hover:-translate-y-1 block text-center group flex flex-col justify-center items-center w-full${stretch ? ' h-full' : ' min-h-[160px] md:min-h-[200px]'}`;

  const featuredClasses = gradient ? "" : "text-white";
  const mainClasses = "bg-brand-blue text-white";

  const iconColor = (isYellow || isOrange) ? 'text-text-primary' : 'text-white';
  const textColor = (isYellow || isOrange) ? 'text-text-primary' : 'text-white';
  const subTextColor = (isYellow || isOrange) ? 'text-text-primary/70' : 'text-white/75';
  const iconBgClass = (isYellow || isOrange) ? 'bg-black/10' : 'bg-white/15';

  const content = (
    <>
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      {isFeatured ? (
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-3 md:space-x-4 flex-1">
            <div className={`${iconBgClass} p-2.5 md:p-3 rounded-xl flex-shrink-0`}>
              <SafeIcon icon={icon} className={`h-5 w-5 md:h-6 md:w-6 ${iconColor}`} />
            </div>
            <div className="text-left flex-1 min-w-0">
              <h3 className={`text-sm md:text-base font-bold font-gsans leading-tight ${textColor}`}>{title}</h3>
              <p className={`font-caladea italic text-xs leading-tight mt-0.5 ${subTextColor}`}>{description}</p>
            </div>
          </div>
          <div className={`flex items-center space-x-1 flex-shrink-0 ml-2 opacity-60 group-hover:opacity-100 transition-opacity duration-200 ${textColor}`}>
            <SafeIcon icon={FiExternalLink} className="h-4 w-4" />
          </div>
        </div>
      ) : (
        <div className="relative z-10 flex flex-col items-center">
          <div className="p-2.5 rounded-xl bg-white/15 mb-2.5 md:mb-3 transition-transform duration-300 group-hover:scale-110">
            <SafeIcon icon={icon} className="h-5 w-5 md:h-6 md:w-6" style={{color: '#E2BA49'}} />
          </div>
          <h3 className="text-sm md:text-base font-bold font-gsans leading-tight text-white">{title}</h3>
          <p className="font-caladea italic text-xs leading-tight text-white/70 mt-0.5">{description}</p>
        </div>
      )}
    </>
  );

  const gradientStyle = gradient
    ? {background: 'linear-gradient(135deg, #83A682 0%, #5a7a59 100%)'}
    : isOrange
      ? {backgroundColor: '#FF8F21'}
      : isYellow
        ? {backgroundColor: '#E2BA49'}
        : isFeatured
          ? {backgroundColor: '#C97025'}
          : {};

  return (
    <motion.div initial={{opacity: 0, y: 30}} animate={{opacity: 1, y: 0}} transition={{duration: 0.6, delay}} className={`${isLastOdd ? 'col-span-2' : ''}${stretch ? ' h-full flex flex-col' : ''}`}>
      {isInternal ? (
        <Link to={path} className={`${baseClasses} ${isFeatured ? featuredClasses : mainClasses}`} style={gradientStyle}>
          {content}
        </Link>
      ) : (
        <a href={path} target="_blank" rel="noopener noreferrer" className={`${baseClasses} ${isFeatured ? featuredClasses : mainClasses}`} style={gradientStyle}>
          {content}
        </a>
      )}
    </motion.div>
  );
};

const QuickLinkButton = ({ title, icon, path, isInternal = false, delay = 0 }) => {
  const className = "relative overflow-hidden px-4 py-3 rounded-xl bg-white border border-black/8 hover:border-primary/30 shadow-modern hover:shadow-modern-lg transition-all duration-300 hover:-translate-y-1 group flex items-center gap-2.5 w-[130px] md:w-[150px] justify-center";
  const inner = (
    <>
      <SafeIcon icon={icon} className="h-4 w-4 text-primary transition-transform duration-300 group-hover:scale-110 flex-shrink-0" />
      <span className="text-xs md:text-sm font-semibold font-gsans text-text-primary group-hover:text-primary transition-colors duration-200">{title}</span>
    </>
  );
  return (
    <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{duration: 0.5, delay}}>
      {isInternal ? (
        <Link to={path} className={className}>{inner}</Link>
      ) : (
        <a href={path} target="_blank" rel="noopener noreferrer" className={className}>{inner}</a>
      )}
    </motion.div>
  );
};

export default Home;
