import React from 'react';
import {Link} from 'react-router-dom';
import {motion} from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const {FiClock, FiMapPin, FiUsers, FiMusic, FiBookOpen, FiHeart, FiHome} = FiIcons;

const Services = () => {
  const services = [
    {
      title: 'Sunday Worship Service',
      time: '10:00 AM',
      location: 'Main Sanctuary',
      description: 'Join us for inspiring worship, biblical teaching, and fellowship with our church family.',
      features: ['Contemporary Worship', 'Biblical Preaching', 'Communion', 'Prayer Time']
    },
    {
      title: 'Wednesday Bible Study',
      time: '7:00 PM',
      location: 'Fellowship Hall',
      description: 'Dive deeper into God\'s Word with interactive study and meaningful discussion.',
      features: ['Verse-by-verse Study', 'Small Groups', 'Q&A Session', 'Take-home Materials']
    },
    {
      title: 'Friday Prayer Meeting',
      time: '6:30 PM',
      location: 'Prayer Room',
      description: 'Come together for focused prayer, intercession, and seeking God\'s will.',
      features: ['Corporate Prayer', 'Personal Prayer Time', 'Prayer Requests', 'Worship']
    }
  ];

  const whatToExpect = [
    {
      icon: FiMusic,
      title: 'Uplifting Worship',
      description: 'Contemporary music that helps you connect with God and lifts your spirit.'
    },
    {
      icon: FiBookOpen,
      title: 'Biblical Teaching',
      description: 'Practical, life-changing messages rooted in Scripture and relevant to daily life.'
    },
    {
      icon: FiUsers,
      title: 'Warm Community',
      description: 'Friendly people who genuinely care about you and your spiritual journey.'
    },
    {
      icon: FiHeart,
      title: 'Authentic Faith',
      description: 'A place where you can be yourself and grow in your relationship with God.'
    }
  ];

  return (
    <div className="min-h-screen bg-accent relative">
      {/* Back to Home Button - Top Right */}
      <div className="fixed top-6 right-6 z-50">
        <Link to="/" className="inline-flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105" style={{backgroundColor: '#83A682'}} title="Back to Home">
          <SafeIcon icon={FiHome} className="h-5 w-5 text-white" />
        </Link>
      </div>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.h1
            initial={{opacity: 0, y: 30}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.8}}
            className="text-4xl md:text-6xl font-bold mb-6 font-inter"
          >
            Join Us for Worship
          </motion.h1>
          <motion.p
            initial={{opacity: 0, y: 30}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.8, delay: 0.2}}
            className="text-xl text-primary-light page-subtitle"
          >
            Experience meaningful worship, biblical teaching, and authentic community
          </motion.p>
        </div>
      </section>

      {/* Service Times */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4 font-fraunces">Service Times</h2>
            <p className="text-xl text-text-primary page-subtitle">Multiple opportunities to worship and grow together</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{opacity: 0, y: 30}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.5, delay: index * 0.1}}
                className="bg-white border border-accent rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="bg-primary text-white p-6">
                  <h3 className="text-2xl mb-2 font-fraunces">{service.title}</h3>
                  <div className="flex items-center space-x-4 text-primary-light">
                    <div className="flex items-center space-x-1">
                      <SafeIcon icon={FiClock} className="h-4 w-4" />
                      <span className="font-inter">{service.time}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <SafeIcon icon={FiMapPin} className="h-4 w-4" />
                      <span className="font-inter">{service.location}</span>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-text-primary mb-4 font-inter">{service.description}</p>
                  <div>
                    <h4 className="font-semibold text-text-primary mb-2 font-fraunces">What's Included:</h4>
                    <ul className="space-y-1">
                      {service.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center space-x-2 text-text-primary">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          <span className="font-inter">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What to Expect */}
      <section className="py-16 bg-accent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4 font-fraunces">What to Expect</h2>
            <p className="text-xl text-text-primary page-subtitle">Your first visit should feel welcoming and comfortable</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whatToExpect.map((item, index) => (
              <motion.div
                key={index}
                initial={{opacity: 0, y: 30}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.5, delay: index * 0.1}}
                className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <SafeIcon icon={item.icon} className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl mb-3 text-text-primary font-fraunces">{item.title}</h3>
                <p className="text-text-primary font-inter">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* First Time Visitor Info */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl mb-4 font-fraunces">First Time Visiting?</h2>
            <p className="text-xl text-primary-light mb-8 page-subtitle">
              We'd love to welcome you and help you feel at home. Here's what you need to know:
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-primary-dark p-6 rounded-lg">
              <h3 className="text-xl mb-3 font-fraunces">What to Wear</h3>
              <p className="text-primary-light font-inter">
                Come as you are! We welcome people in all types of clothing, from casual to formal. The most important thing is that you're comfortable.
              </p>
            </div>
            <div className="bg-primary-dark p-6 rounded-lg">
              <h3 className="text-xl mb-3 font-fraunces">When to Arrive</h3>
              <p className="text-primary-light font-inter">
                We recommend arriving 10-15 minutes early to find parking, get oriented, and grab a coffee before the service begins.
              </p>
            </div>
            <div className="bg-primary-dark p-6 rounded-lg">
              <h3 className="text-xl mb-3 font-fraunces">What About Kids</h3>
              <p className="text-primary-light font-inter">
                Children are always welcome in our services. We also offer age-appropriate children's programs during Sunday worship.
              </p>
            </div>
            <div className="bg-primary-dark p-6 rounded-lg">
              <h3 className="text-xl mb-3 font-fraunces">Getting Connected</h3>
              <p className="text-primary-light font-inter">
                Stop by our welcome center after the service to learn more about our church and find ways to get involved.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;