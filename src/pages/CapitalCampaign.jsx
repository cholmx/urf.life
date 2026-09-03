import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { SkeletonCard, LoadingTransition } from '../components/LoadingSkeletons';
import { useCleanContent } from '../hooks/useCleanContent';
import supabase from '../lib/supabase';
import LivingStonesGallery from '../components/LivingStonesGallery';
import LivingStonesUpload from '../components/LivingStonesUpload';
import { sanitizeHtml } from '../utils/sanitizeHtml';

const { FiTrendingUp, FiHome, FiPlayCircle, FiFileText, FiEye, FiHelpCircle, FiChevronDown, FiChevronUp, FiCamera } = FiIcons;

const CapitalCampaign = () => {
  const [updates, setUpdates] = useState([]);
  const [visionItems, setVisionItems] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('updates');
  const [openFaqId, setOpenFaqId] = useState(null);

  useCleanContent();

  useEffect(() => {
    fetchAllContent();
  }, []);

  const fetchAllContent = async () => {
    try {
      const [updatesRes, visionRes, faqsRes] = await Promise.all([
        supabase
          .from('campaign_updates')
          .select('*')
          .eq('published', true)
          .order('display_order', { ascending: true })
          .order('created_at', { ascending: false }),
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

      if (updatesRes.error) throw updatesRes.error;
      if (visionRes.error) throw visionRes.error;
      if (faqsRes.error) throw faqsRes.error;

      setUpdates(updatesRes.data || []);
      setVisionItems(visionRes.data || []);
      setFaqs(faqsRes.data || []);
    } catch (error) {
      console.error('Error fetching growth campaign content:', error);
    } finally {
      setTimeout(() => setLoading(false), 600);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderUpdates = () => (
    <div className="space-y-8">
      {updates.length === 0 ? (
        <div className="text-center py-12">
          <SafeIcon icon={FiFileText} className="h-16 w-16 text-text-light mx-auto mb-4" />
          <p className="text-xl">No updates yet</p>
          <p className="text-text-light">Check back soon for updates!</p>
        </div>
      ) : (
        updates.map((update, index) => (
          <motion.div
            key={update.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="p-8">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <SafeIcon
                    icon={update.type === 'video' ? FiPlayCircle : FiFileText}
                    className="h-6 w-6 text-primary"
                  />
                  <h3 className="text-2xl md:text-3xl">{update.title}</h3>
                </div>
                <span className="text-sm text-text-light whitespace-nowrap ml-4">
                  {formatDate(update.created_at)}
                </span>
              </div>

              {update.type === 'video' && update.video_url && (
                <div className="mb-6 rounded-lg overflow-hidden aspect-video bg-gray-100">
                  {update.video_url.includes('youtube.com') || update.video_url.includes('youtu.be') ? (
                    <iframe
                      src={update.video_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                      title={update.title}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video controls className="w-full h-full">
                      <source src={update.video_url} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  )}
                </div>
              )}

              {update.thumbnail_url && update.type === 'video' && !update.video_url && (
                <div className="mb-6">
                  <img
                    src={update.thumbnail_url}
                    alt={update.title}
                    className="w-full rounded-lg"
                  />
                </div>
              )}

              <div className="prose max-w-none">
                <div
                  className="announcement-content"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(update.content) }}
                />
              </div>
            </div>
          </motion.div>
        ))
      )}
    </div>
  );

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
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
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
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className="bg-white rounded-lg shadow-md overflow-hidden"
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
                transition={{ duration: 0.3 }}
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

  return (
    <div className="min-h-screen py-12 relative" style={{ backgroundColor: '#fcfaf2' }}>
      {/* Back to Home Button */}
      <div className="fixed top-6 right-6 z-50">
        <Link
          to="/"
          className="inline-flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
          style={{ backgroundColor: '#83A682' }}
          title="Back to Home"
        >
          <SafeIcon icon={FiHome} className="h-5 w-5 text-white" />
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
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
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-base page-subtitle"
          >
            Transforming Together
          </motion.p>
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="flex flex-col sm:flex-row justify-center gap-4 mb-10"
        >
          <a
            href="https://onrealm.org/urfellowship/give/growthcampaign"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-lg text-sm text-white hover:text-white hover:scale-105 transition-all duration-300 shadow-lg"
            style={{ backgroundColor: '#E2BA49', fontFamily: "'Inter Tight', sans-serif", fontWeight: 700 }}
          >
            <SafeIcon icon={FiTrendingUp} className="h-4 w-4" />
            <span>Give to the Growth Campaign</span>
          </a>
          <a
            href="https://onrealm.org/urfellowship/AddPledge/goalcard"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-lg text-sm text-white hover:text-white hover:scale-105 transition-all duration-300 shadow-lg"
            style={{ backgroundColor: '#E2BA49', fontFamily: "'Inter Tight', sans-serif", fontWeight: 700 }}
          >
            <SafeIcon icon={FiFileText} className="h-4 w-4" />
            <span>Submit Your Commitment Card</span>
          </a>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          <button
            onClick={() => setActiveTab('living-stones')}
            className={`px-4 py-2 rounded-lg transition-all duration-300 text-sm ${
              activeTab === 'living-stones'
                ? 'shadow-lg text-white'
                : 'bg-white shadow-md hover:shadow-lg'
            }`}
            style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 700, ...(activeTab === 'living-stones' ? { backgroundColor: '#83A682' } : {}) }}
          >
            <div className="flex items-center space-x-1.5">
              <SafeIcon icon={FiCamera} className="h-4 w-4" />
              <span>Living Stones</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('updates')}
            className={`px-4 py-2 rounded-lg transition-all duration-300 text-sm ${
              activeTab === 'updates'
                ? 'shadow-lg text-white'
                : 'bg-white shadow-md hover:shadow-lg'
            }`}
            style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 700, ...(activeTab === 'updates' ? { backgroundColor: '#83A682' } : {}) }}
          >
            <div className="flex items-center space-x-1.5">
              <SafeIcon icon={FiFileText} className="h-4 w-4" />
              <span>Updates</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('vision')}
            className={`px-4 py-2 rounded-lg transition-all duration-300 text-sm ${
              activeTab === 'vision'
                ? 'shadow-lg text-white'
                : 'bg-white shadow-md hover:shadow-lg'
            }`}
            style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 700, ...(activeTab === 'vision' ? { backgroundColor: '#83A682' } : {}) }}
          >
            <div className="flex items-center space-x-1.5">
              <SafeIcon icon={FiEye} className="h-4 w-4" />
              <span>Vision</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('faqs')}
            className={`px-4 py-2 rounded-lg transition-all duration-300 text-sm ${
              activeTab === 'faqs'
                ? 'shadow-lg text-white'
                : 'bg-white shadow-md hover:shadow-lg'
            }`}
            style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 700, ...(activeTab === 'faqs' ? { backgroundColor: '#83A682' } : {}) }}
          >
            <div className="flex items-center space-x-1.5">
              <SafeIcon icon={FiHelpCircle} className="h-4 w-4" />
              <span>Q&A</span>
            </div>
          </button>
        </motion.div>

        {/* Content */}
        <LoadingTransition
          isLoading={loading}
          skeleton={
            <div className="space-y-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonCard key={i} showImage={false} showMeta={true} />
              ))}
            </div>
          }
        >
          {activeTab === 'updates' && renderUpdates()}
          {activeTab === 'vision' && renderVision()}
          {activeTab === 'faqs' && renderFaqs()}
          {activeTab === 'living-stones' && (
            <div className="space-y-10">
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-2xl md:text-3xl mb-3">Living Stones Gallery</h2>
                  <p className="text-text-light max-w-xl mx-auto leading-relaxed">
                    As part of our Growth Campaign, members of our congregation are painting stones as a symbol of our living faith. Share yours below!
                  </p>
                </div>
                <LivingStonesGallery />
              </div>
              <div className="max-w-lg mx-auto">
                <LivingStonesUpload />
              </div>
            </div>
          )}
        </LoadingTransition>
      </div>
    </div>
  );
};

export default CapitalCampaign;
