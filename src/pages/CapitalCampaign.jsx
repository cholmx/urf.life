import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiFileText, FiEye, FiHelpCircle, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import PageNav from '../common/PageNav';
import { SkeletonBox, LoadingTransition } from '../components/LoadingSkeletons';
import { useCleanContent } from '../hooks/useCleanContent';
import supabase from '../lib/supabase';
import { sanitizeHtml } from '../utils/sanitizeHtml';

const CapitalCampaign = () => {
  const [visionItems, setVisionItems] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('vision');
  const [openFaqId, setOpenFaqId] = useState(null);

  useCleanContent();

  useEffect(() => {
    fetchAllContent();
  }, []);

  const fetchAllContent = async () => {
    try {
      const [visionRes, faqsRes] = await Promise.all([
        supabase
          .from('campaign_vision')
          .select('*')
          .eq('published', true)
          .order('display_order', { ascending: true })
          .order('created_at', { ascending: false }),
        supabase
          .from('campaign_faqs')
          .select('*')
          .eq('published', true)
          .order('display_order', { ascending: true })
      ]);

      if (visionRes.error) throw visionRes.error;
      if (faqsRes.error) throw faqsRes.error;

      setVisionItems(visionRes.data || []);
      setFaqs(faqsRes.data || []);
    } catch (error) {
      console.error('Error fetching growth campaign content:', error);
    } finally {
      setTimeout(() => setLoading(false), 600);
    }
  };

  const renderVision = () => (
    <div className="space-y-8">
      {visionItems.length === 0 ? (
        <div className="text-center py-12">
          <SafeIcon icon={FiEye} className="h-16 w-16 text-text-light mx-auto mb-4" />
          <p className="text-xl">No vision content yet</p>
          <p className="text-text-light">Check back soon!</p>
        </div>
      ) : (
        visionItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: index * 0.05 }}
            className="card-clay rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            {item.image_url && (
              <div className="w-full h-64 overflow-hidden">
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-8">
              <h3 className="text-2xl md:text-3xl mb-4">{item.title}</h3>
              <div className="prose max-w-none">
                <div
                  className="announcement-content"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.content) }}
                />
              </div>
            </div>
          </motion.div>
        ))
      )}
    </div>
  );

  const renderFaqs = () => (
    <div className="space-y-4">
      {faqs.length === 0 ? (
        <div className="text-center py-12">
          <SafeIcon icon={FiHelpCircle} className="h-16 w-16 text-text-light mx-auto mb-4" />
          <p className="text-xl">No Q&A entries yet</p>
          <p className="text-text-light">Check back soon!</p>
        </div>
      ) : (
        faqs.map((faq, index) => (
          <motion.div
            key={faq.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.025 }}
            className="card-clay rounded-lg shadow-md overflow-hidden"
          >
            <button
              onClick={() => setOpenFaqId(openFaqId === faq.id ? null : faq.id)}
              className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3 flex-1 pr-4">
                <SafeIcon icon={FiHelpCircle} className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="font-semibold text-lg">{faq.question}</span>
              </div>
              <SafeIcon
                icon={openFaqId === faq.id ? FiChevronUp : FiChevronDown}
                className="h-5 w-5 text-primary flex-shrink-0"
              />
            </button>

            {openFaqId === faq.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="px-6 pb-6 border-t border-gray-100"
              >
                <div
                  className="announcement-content pt-4 text-text-primary leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(faq.answer) }}
                />
              </motion.div>
            )}
          </motion.div>
        ))
      )}
    </div>
  );

  // Vision (mandatory top image + title + prose) and FAQs (a short
  // collapsed accordion row) have different enough shapes that one shared
  // skeleton would either over- or under-shoot the real height.
  const renderTabSkeleton = () => {
    if (activeTab === 'faqs') {
      return (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card-clay rounded-lg shadow-md overflow-hidden px-6 py-5 flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1 pr-4">
                <SkeletonBox width="w-5" height="h-5" rounded="rounded-full" />
                <SkeletonBox width="w-2/3" height="h-5" className="bg-primary/15" />
              </div>
              <SkeletonBox width="w-5" height="h-5" />
            </div>
          ))}
        </div>
      );
    }
    // vision (the only other tab)
    return (
      <div className="space-y-8">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="card-clay rounded-lg shadow-md overflow-hidden">
            <SkeletonBox width="w-full" height="h-64" rounded="rounded-none" />
            <div className="p-8 space-y-3">
              <SkeletonBox width="w-1/2" height="h-7" className="bg-primary/15" />
              <SkeletonBox width="w-full" height="h-4" />
              <SkeletonBox width="w-full" height="h-4" />
              <SkeletonBox width="w-3/4" height="h-4" />
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-accent py-12 relative">
      <PageNav />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-center space-x-4 mb-1"
          >
            <SafeIcon icon={FiTrendingUp} className="h-8 w-8 text-primary" />
            <Link to="/" className="hover:text-primary transition-colors">
              <h1 className="text-3xl md:text-4xl">Growth Campaign</h1>
            </Link>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-base page-subtitle"
          >
            Transforming Together
          </motion.p>
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.125 }}
          className="flex flex-col sm:flex-row justify-center gap-4 mb-10"
        >
          <a
            href="https://onrealm.org/urfellowship/give/growthcampaign"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-lg text-sm text-white hover:text-white hover:scale-105 transition-all duration-300 shadow-lg"
            style={{ backgroundColor: '#EAA235', fontFamily: "'Inter Tight', sans-serif", fontWeight: 700 }}
          >
            <SafeIcon icon={FiTrendingUp} className="h-4 w-4" />
            <span>Give to the Growth Campaign</span>
          </a>
          <a
            href="https://onrealm.org/urfellowship/AddPledge/goalcard"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-lg text-sm text-white hover:text-white hover:scale-105 transition-all duration-300 shadow-lg"
            style={{ backgroundColor: '#EAA235', fontFamily: "'Inter Tight', sans-serif", fontWeight: 700 }}
          >
            <SafeIcon icon={FiFileText} className="h-4 w-4" />
            <span>Submit Your Commitment Card</span>
          </a>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="flex justify-center mb-12"
        >
          <div className="inline-flex bg-white rounded-full shadow-md p-1.5 gap-1">
            <button
              onClick={() => setActiveTab('vision')}
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-full text-sm transition-all duration-300 ${
                activeTab === 'vision' ? 'text-white shadow-md' : 'text-text-light hover:text-text-primary'
              }`}
              style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 700, ...(activeTab === 'vision' ? { backgroundColor: '#4a6d65' } : {}) }}
            >
              <SafeIcon icon={FiEye} className="h-4 w-4" />
              <span>Vision</span>
            </button>

            <button
              onClick={() => setActiveTab('faqs')}
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-full text-sm transition-all duration-300 ${
                activeTab === 'faqs' ? 'text-white shadow-md' : 'text-text-light hover:text-text-primary'
              }`}
              style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 700, ...(activeTab === 'faqs' ? { backgroundColor: '#4a6d65' } : {}) }}
            >
              <SafeIcon icon={FiHelpCircle} className="h-4 w-4" />
              <span>Q&A</span>
            </button>
          </div>
        </motion.div>

        {/* Content */}
        <LoadingTransition
          isLoading={loading}
          skeleton={renderTabSkeleton()}
        >
          {activeTab === 'vision' && renderVision()}
          {activeTab === 'faqs' && renderFaqs()}
        </LoadingTransition>
      </div>
    </div>
  );
};

export default CapitalCampaign;
