import React,{useState,useEffect} from 'react';
import {Link} from 'react-router-dom';
import {motion} from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import supabase from '../lib/supabase';
import {sanitizeHtml} from '../utils/sanitizeHtml';

const {FiHeart,FiHome}=FiIcons;

const Ministries=()=> {
  const [ministries,setMinistries]=useState([]);
  const [loading,setLoading]=useState(true);

  useEffect(()=> {
    fetchMinistries();
  },[]);

  const fetchMinistries=async ()=> {
    try {
      const {data: ministriesData,error: ministriesError}=await supabase
        .from('ministries_portal123')
        .select('*')
        .eq('is_active',true)
        .order('display_order',{ascending: true});

      if (ministriesError) throw ministriesError;

      const ministriesWithFeatures=await Promise.all(
        ministriesData.map(async (ministry)=> {
          const {data: features}=await supabase
            .from('ministry_features_portal123')
            .select('*')
            .eq('ministry_id',ministry.id)
            .order('display_order',{ascending: true});

          return {
            ...ministry,
            features: features || []
          };
        })
      );

      setMinistries(ministriesWithFeatures);
    } catch (error) {
      console.error('Error fetching ministries:',error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-accent py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-primary">Loading opportunities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-accent py-12 relative">
      {/* Back to Home Button - Top Right */}
      <div className="fixed top-6 right-6 z-50">
        <Link to="/" className="inline-flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105" style={{backgroundColor: '#83A682'}} title="Back to Home">
          <SafeIcon icon={FiHome} className="h-5 w-5 text-white" />
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{opacity: 0,y: 30}}
            animate={{opacity: 1,y: 0}}
            transition={{duration: 0.8}}
            className="flex items-center justify-center space-x-4 mb-1"
          >
            <SafeIcon icon={FiHeart} className="h-8 w-8 text-primary" />
            <Link to="/" className="hover:text-primary transition-colors">
              <h1 className="text-3xl md:text-4xl">
                Our Opportunities
              </h1>
            </Link>
          </motion.div>
          <motion.p
            initial={{opacity: 0,y: 30}}
            animate={{opacity: 1,y: 0}}
            transition={{duration: 0.8,delay: 0.2}}
            className="text-base page-subtitle"
          >
            Discover ways to grow, serve, and connect
          </motion.p>
        </div>

        {/* Ministries List */}
        <div className="space-y-8">
          {ministries.length===0 ? (
            <motion.div
              initial={{opacity: 0,y: 30}}
              animate={{opacity: 1,y: 0}}
              transition={{duration: 0.5}}
              className="text-center py-12"
            >
              <SafeIcon icon={FiHeart} className="h-16 w-16 text-text-light mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-text-primary mb-2">
                No opportunities yet
              </h2>
              <p className="text-text-light">
                Check back soon for information about our opportunities.
              </p>
            </motion.div>
          ) : (
            ministries.map((ministry,index)=> (
              <motion.article
                key={ministry.id}
                initial={{opacity: 0,y: 30}}
                animate={{opacity: 1,y: 0}}
                transition={{duration: 0.5,delay: index * 0.1}}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6 md:p-8">
                  {/* Ministry Header */}
                  <div className="flex items-center space-x-3 mb-4">
                    <SafeIcon icon={FiHeart} className="h-8 w-8 text-primary flex-shrink-0" />
                    <h2 className="text-2xl md:text-3xl text-text-primary">
                      {ministry.title}
                    </h2>
                  </div>

                  {/* Ministry Description */}
                  <div className="mb-6">
                    <div
                      className="text-text-primary leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{__html: sanitizeHtml(ministry.description)}}
                    />
                  </div>

                  {/* Ministry Features */}
                  {ministry.features.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-text-primary mb-3">
                        What We Offer:
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {ministry.features.map((feature)=> (
                          <div
                            key={feature.id}
                            className="flex items-start space-x-2 bg-accent/50 p-3 rounded-lg"
                          >
                            <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                            <span className="text-sm text-text-primary">
                              {feature.feature_text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ministry Leader */}
                  {(ministry.leader_name || ministry.leader_role) && (
                    <div className="pt-6 border-t border-accent">
                      <div className="flex items-start space-x-3">
                        <div className="flex-1">
                          <p className="text-sm text-text-light mb-1">Opportunity Leader</p>
                          {ministry.leader_name && (
                            <p className="text-base font-semibold text-text-primary">
                              {ministry.leader_name}
                            </p>
                          )}
                          {ministry.leader_role && (
                            <p className="text-sm text-text-light">
                              {ministry.leader_role}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.article>
            ))
          )}
        </div>

        {/* Get Involved Section */}
        {ministries.length > 0 && (
          <motion.div
            initial={{opacity: 0,y: 30}}
            animate={{opacity: 1,y: 0}}
            transition={{duration: 0.8,delay: 0.5}}
            className="mt-16 bg-white rounded-lg shadow-md p-8 text-center"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-4">
              Ready to Get Involved?
            </h2>
            <p className="text-lg text-text-primary mb-6 max-w-2xl mx-auto">
              Whether you're new to faith or have been walking with Jesus for years, there's a place for you to serve and grow.
            </p>
            <Link
              to="/contact"
              className="inline-block bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-primary-dark transition-colors"
            >
              Contact Us to Get Started
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Ministries;
