import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import NotificationSettings from '../components/NotificationSettings';

const { FiSettings, FiHome } = FiIcons;

const Settings = () => {
  return (
    <div className="min-h-screen bg-accent py-12 relative">
      {/* Back to Home Button - Top Right */}
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center justify-center space-x-4 mb-3"
          >
            <SafeIcon icon={FiSettings} className="h-8 w-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold text-text-primary font-inter">
              Settings
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg text-text-primary font-inter"
          >
            Manage your preferences and notifications
          </motion.p>
        </div>

        {/* Settings Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-white rounded-lg shadow-md p-8"
        >
          <NotificationSettings />
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;