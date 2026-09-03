import React from 'react';
import {Link} from 'react-router-dom';
import {motion} from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const {FiHeart,FiUsers,FiBookOpen,FiTarget,FiHome}=FiIcons;

const About=()=> {
  const values=[
    {icon: FiHeart,title: 'Love',description: 'We believe in showing God\'s love to everyone through our actions and words.'},
    {icon: FiUsers,title: 'Community',description: 'Building meaningful relationships and supporting one another in faith.'},
    {icon: FiBookOpen,title: 'Truth',description: 'Grounded in Biblical truth and committed to sharing God\'s Word.'},
    {icon: FiTarget,title: 'Purpose',description: 'Helping everyone discover and live out their God-given purpose.'}
  ];

  const staff=[
    {name: 'Pastor John Smith',role: 'Senior Pastor',image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',bio: 'Pastor John has been leading Upper Room Fellowship for over 15 years with a heart for discipleship and community outreach.'},
    {name: 'Sarah Johnson',role: 'Worship Leader',image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face',bio: 'Sarah leads our worship team with passion and creativity,helping our congregation connect with God through music.'},
    {name: 'Michael Davis',role: 'Youth Pastor',image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face',bio: 'Michael is passionate about mentoring young people and helping them grow in their faith journey.'}
  ];

  return (
    <div className="min-h-screen relative" style={{backgroundColor: '#fcfaf2'}}>
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
            initial={{opacity: 0,y: 30}}
            animate={{opacity: 1,y: 0}}
            transition={{duration: 0.8}}
            className="text-4xl md:text-6xl mb-2"
          >
            About Upper Room Fellowship
          </motion.h1>
          <motion.p
            initial={{opacity: 0,y: 30}}
            animate={{opacity: 1,y: 0}}
            transition={{duration: 0.8,delay: 0.2}}
            className="text-lg text-primary-light opacity-90 page-subtitle"
          >
            Discover our story,mission,and the heart behind our church community
          </motion.p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl mb-6">Our Story</h2>
              <p className="text-lg text-text-primary mb-4">
                Upper Room Fellowship was founded in 1985 with a simple vision: to create a place where people from all walks of life could come together to worship,grow,and serve God.
              </p>
              <p className="text-lg text-text-primary mb-4">
                Over the years,we've grown from a small gathering of families to a vibrant community of believers who are passionate about making a difference in our city and beyond.
              </p>
              <p className="text-lg text-text-primary">
                Our church is built on the foundation of God's love,grace,and truth. We believe that every person has value and purpose,and we're committed to helping each individual discover their unique calling in God's kingdom.
              </p>
            </div>
            <div className="lg:order-first">
              <img
                src="https://images.unsplash.com/photo-1438032005730-c779502df39b?w=600&h=400&fit=crop"
                alt="Church community"
                className="rounded-lg shadow-lg w-full h-96 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16" style={{backgroundColor: '#fcfaf2'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <motion.div
              initial={{opacity: 0,x: -30}}
              animate={{opacity: 1,x: 0}}
              transition={{duration: 0.8}}
              className="bg-white p-8 rounded-lg shadow-md"
            >
              <h3 className="text-2xl mb-4">Our Mission</h3>
              <p className="text-text-primary text-lg">
                To make disciples of Jesus Christ who love God,love people,and serve the world with passion and purpose. We exist to help people find and follow Jesus.
              </p>
            </motion.div>
            <motion.div
              initial={{opacity: 0,x: 30}}
              animate={{opacity: 1,x: 0}}
              transition={{duration: 0.8,delay: 0.2}}
              className="bg-white p-8 rounded-lg shadow-md"
            >
              <h3 className="text-2xl mb-4">Our Vision</h3>
              <p className="text-text-primary text-lg">
                To be a church that transforms lives and communities through the power of God's love,creating a lasting impact for generations to come.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl mb-2">Our Core Values</h2>
            <p className="text-lg text-text-primary page-subtitle">The principles that guide everything we do</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value,index)=> (
              <motion.div
                key={index}
                initial={{opacity: 0,y: 30}}
                animate={{opacity: 1,y: 0}}
                transition={{duration: 0.5,delay: index * 0.1}}
                className="text-center p-6 rounded-lg hover:shadow-md transition-shadow"
                style={{backgroundColor: '#fcfaf2'}}
              >
                <SafeIcon icon={value.icon} className="h-12 w-12 text-text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold font-heading mb-3 text-text-primary">{value.title}</h3>
                <p className="text-text-primary">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Staff Section */}
      <section className="py-16" style={{backgroundColor: '#fcfaf2'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl mb-2">Meet Our Team</h2>
            <p className="text-lg text-text-primary page-subtitle">The dedicated leaders serving our church family</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {staff.map((member,index)=> (
              <motion.div
                key={index}
                initial={{opacity: 0,y: 30}}
                animate={{opacity: 1,y: 0}}
                transition={{duration: 0.5,delay: index * 0.1}}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <img src={member.image} alt={member.name} className="w-full h-64 object-cover" />
                <div className="p-6">
                  <h3 className="text-xl font-bold font-heading mb-1 text-text-primary">{member.name}</h3>
                  <p className="text-primary font-medium mb-3">{member.role}</p>
                  <p className="text-text-primary">{member.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;