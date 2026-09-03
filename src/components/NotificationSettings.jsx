import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import pushNotificationService from '../lib/pushNotifications';

const { FiBell, FiBellOff, FiCheck, FiX, FiSettings, FiSmartphone, FiAlertCircle, FiInfo } = FiIcons;

const NotificationSettings = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    announcements: true,
    events: true,
    sermons: true,
    reminders: true,
    emergencies: true
  });

  useEffect(() => {
    initializeNotifications();
    loadPreferences();
  }, []);

  const initializeNotifications = async () => {
    const supported = await pushNotificationService.initialize();
    setIsSupported(supported);
    setPermission(pushNotificationService.getPermissionStatus());
    setIsSubscribed(pushNotificationService.isSubscribed());
  };

  const loadPreferences = () => {
    try {
      const saved = localStorage.getItem('notification_preferences_portal123');
      if (saved) {
        setPreferences(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const savePreferences = (newPreferences) => {
    try {
      localStorage.setItem('notification_preferences_portal123', JSON.stringify(newPreferences));
      setPreferences(newPreferences);
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  const handleEnableNotifications = async () => {
    setLoading(true);
    try {
      const hasPermission = await pushNotificationService.requestPermission();
      if (hasPermission) {
        const subscription = await pushNotificationService.subscribe();
        if (subscription) {
          setIsSubscribed(true);
          setPermission('granted');
        }
      } else {
        setPermission('denied');
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDisableNotifications = async () => {
    setLoading(true);
    try {
      const success = await pushNotificationService.unsubscribe();
      if (success) {
        setIsSubscribed(false);
      }
    } catch (error) {
      console.error('Error disabling notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async () => {
    if (isSubscribed) {
      await pushNotificationService.sendTestNotification();
    }
  };

  const handlePreferenceChange = (key) => {
    const newPreferences = {
      ...preferences,
      [key]: !preferences[key]
    };
    savePreferences(newPreferences);
  };

  const getStatusColor = () => {
    if (!isSupported) return 'text-text-light';
    if (permission === 'granted' && isSubscribed) return 'text-green-600';
    if (permission === 'denied') return 'text-red-600';
    return 'text-yellow-600';
  };

  const getStatusText = () => {
    if (!isSupported) return 'Not Supported';
    if (permission === 'granted' && isSubscribed) return 'Enabled';
    if (permission === 'denied') return 'Blocked';
    return 'Disabled';
  };

  const notificationTypes = [
    {
      key: 'announcements',
      title: 'Church Announcements',
      description: 'Important updates and news from the church'
    },
    {
      key: 'events',
      title: 'Upcoming Events',
      description: 'Reminders about church events and activities'
    },
    {
      key: 'sermons',
      title: 'New Sermons',
      description: 'Notifications when new sermons are posted'
    },
    {
      key: 'reminders',
      title: 'Service Reminders',
      description: 'Reminders before church services'
    },
    {
      key: 'emergencies',
      title: 'Emergency Alerts',
      description: 'Critical updates and emergency notifications'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <SafeIcon icon={FiBell} className="h-6 w-6 text-primary" />
        <h3 className="text-xl font-semibold text-text-primary font-inter">
          Push Notifications
        </h3>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          isSupported 
            ? permission === 'granted' && isSubscribed 
              ? 'bg-green-100 text-green-800' 
              : permission === 'denied'
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
            : 'bg-gray-100 text-text-light'
        } font-inter`}>
          {getStatusText()}
        </span>
      </div>

      {/* Browser Support Check */}
      {!isSupported && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
        >
          <div className="flex items-start space-x-3">
            <SafeIcon icon={FiAlertCircle} className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-800 mb-1 font-inter">
                Notifications Not Supported
              </h4>
              <p className="text-yellow-700 text-sm font-inter">
                Your browser doesn't support push notifications. Please use a modern browser like Chrome, Firefox, or Safari.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Controls */}
      {isSupported && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-accent-dark rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <SafeIcon 
                icon={isSubscribed ? FiBell : FiBellOff} 
                className={`h-8 w-8 ${getStatusColor()}`} 
              />
              <div>
                <h4 className="font-semibold text-text-primary font-inter">
                  Push Notifications
                </h4>
                <p className="text-sm text-text-light font-inter">
                  Stay updated with important church news and reminders
                </p>
              </div>
            </div>
            
            {permission !== 'denied' && (
              <button
                onClick={isSubscribed ? handleDisableNotifications : handleEnableNotifications}
                disabled={loading}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 inline-flex items-center space-x-2 font-inter ${
                  isSubscribed
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-primary text-white hover:bg-primary-dark'
                }`}
              >
                <SafeIcon 
                  icon={loading ? FiSettings : isSubscribed ? FiBellOff : FiBell} 
                  className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} 
                />
                <span>
                  {loading ? 'Processing...' : isSubscribed ? 'Disable' : 'Enable'}
                </span>
              </button>
            )}
          </div>

          {/* Permission Denied Message */}
          {permission === 'denied' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <SafeIcon icon={FiX} className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <h5 className="font-semibold text-red-800 mb-1 font-inter">
                    Notifications Blocked
                  </h5>
                  <p className="text-red-700 text-sm font-inter mb-3">
                    You've blocked notifications for this site. To enable them:
                  </p>
                  <ol className="text-red-700 text-sm font-inter space-y-1 list-decimal list-inside">
                    <li>Click the lock icon in your browser's address bar</li>
                    <li>Set "Notifications" to "Allow"</li>
                    <li>Refresh this page</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* Test Notification */}
          {isSubscribed && (
            <div className="mt-4 pt-4 border-t border-accent">
              <button
                onClick={handleTestNotification}
                className="bg-secondary text-white px-4 py-2 rounded-lg font-semibold hover:bg-secondary-dark transition-colors inline-flex items-center space-x-2 font-inter"
              >
                <SafeIcon icon={FiSmartphone} className="h-4 w-4" />
                <span>Send Test Notification</span>
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Notification Preferences */}
      {isSupported && isSubscribed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border border-accent-dark rounded-lg p-6"
        >
          <h4 className="font-semibold text-text-primary mb-4 font-inter">
            Notification Preferences
          </h4>
          <div className="space-y-4">
            {notificationTypes.map((type) => (
              <div key={type.key} className="flex items-start justify-between">
                <div className="flex-1">
                  <h5 className="font-medium text-text-primary font-inter">
                    {type.title}
                  </h5>
                  <p className="text-sm text-text-light font-inter">
                    {type.description}
                  </p>
                </div>
                <button
                  onClick={() => handlePreferenceChange(type.key)}
                  className={`ml-4 w-12 h-6 rounded-full transition-colors relative ${
                    preferences[type.key] ? 'bg-primary' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform absolute top-0.5 ${
                      preferences[type.key] ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-blue-50 border border-blue-200 rounded-lg p-4"
      >
        <div className="flex items-start space-x-3">
          <SafeIcon icon={FiInfo} className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h5 className="font-semibold text-blue-800 mb-1 font-inter">
              About Push Notifications
            </h5>
            <p className="text-blue-700 text-sm font-inter">
              Push notifications will help you stay connected with important church updates, 
              event reminders, and emergency alerts. You can customize which types of 
              notifications you receive and disable them at any time.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NotificationSettings;