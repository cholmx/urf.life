import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import supabase from '../lib/supabase';
import { toTitleCase } from '../utils/textFormat';

const { FiBell, FiSend, FiUsers, FiCalendar, FiAlertTriangle, FiCheck, FiX } = FiIcons;

const AdminNotifications = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    type: 'general',
    url: '/',
    schedule: 'now'
  });

  useEffect(() => {
    loadSubscribers();
  }, []);

  const loadSubscribers = () => {
    try {
      const saved = localStorage.getItem('push_subscriptions_portal123');
      if (saved) {
        setSubscribers(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading subscribers:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    setSending(true);
    setError('');
    setSuccess('');

    try {
      // In a real app, you would send this to your backend server
      // which would then send the push notification via web push protocol
      
      // For demo purposes, we'll simulate sending and show a local notification
      if ('serviceWorker' in navigator && 'showNotification' in ServiceWorkerRegistration.prototype) {
        const registration = await navigator.serviceWorker.ready;
        
        await registration.showNotification(toTitleCase(formData.title), {
          body: formData.body,
          icon: '/logo.png',
          badge: '/logo.png',
          data: {
            url: formData.url,
            type: formData.type
          },
          actions: [
            {
              action: 'open',
              title: 'View'
            },
            {
              action: 'close',
              title: 'Dismiss'
            }
          ],
          vibrate: [200, 100, 200],
          tag: formData.type
        });

        // Store notification in history
        const notifications = JSON.parse(localStorage.getItem('sent_notifications_portal123') || '[]');
        notifications.unshift({
          id: Date.now().toString(),
          ...formData,
          sent_at: new Date().toISOString(),
          subscriber_count: subscribers.length
        });
        localStorage.setItem('sent_notifications_portal123', JSON.stringify(notifications.slice(0, 50))); // Keep last 50

        setSuccess(`Notification sent to ${subscribers.length} subscribers!`);
        setFormData({
          title: '',
          body: '',
          type: 'general',
          url: '/',
          schedule: 'now'
        });
      } else {
        throw new Error('Push notifications not supported');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      setError('Failed to send notification: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  const notificationTypes = [
    { value: 'general', label: 'General Update', color: 'bg-blue-100 text-blue-800' },
    { value: 'announcement', label: 'Announcement', color: 'bg-primary text-white' },
    { value: 'event', label: 'Event Reminder', color: 'bg-green-100 text-green-800' },
    { value: 'sermon', label: 'New Sermon', color: 'bg-purple-100 text-purple-800' },
    { value: 'emergency', label: 'Emergency Alert', color: 'bg-red-100 text-red-800' }
  ];

  const quickMessages = [
    {
      title: 'Service Reminder',
      body: 'Sunday service starts in 1 hour. Join us for worship!',
      type: 'event',
      url: '/services'
    },
    {
      title: 'New Announcement',
      body: 'Check out our latest church announcement.',
      type: 'announcement',
      url: '/announcements'
    },
    {
      title: 'Prayer Meeting Tonight',
      body: 'Join us for prayer meeting at 7:00 PM tonight.',
      type: 'event',
      url: '/events'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-lg p-4"
        >
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiCheck} className="h-5 w-5 text-green-600" />
            <p className="text-green-700 font-inter">{success}</p>
          </div>
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4"
        >
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiX} className="h-5 w-5 text-red-600" />
            <p className="text-red-700 font-inter">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-text-primary font-inter">
          Send Push Notifications
        </h2>
        <div className="flex items-center space-x-2 text-text-light">
          <SafeIcon icon={FiUsers} className="h-5 w-5" />
          <span className="font-inter">{subscribers.length} Subscribers</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4 font-inter">
          Quick Messages
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickMessages.map((message, index) => (
            <button
              key={index}
              onClick={() => setFormData(prev => ({ ...prev, ...message }))}
              className="p-4 border-2 border-accent-dark rounded-lg hover:border-primary transition-colors text-left"
            >
              <h4 className="font-semibold text-text-primary mb-2 font-inter">
                {message.title}
              </h4>
              <p className="text-sm text-text-light font-inter">
                {message.body}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Send Notification Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSendNotification} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2 font-inter">
                Notification Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-accent-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-inter"
                placeholder="e.g., Service Reminder"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2 font-inter">
                Notification Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full p-3 border border-accent-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-inter"
              >
                {notificationTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2 font-inter">
              Message *
            </label>
            <textarea
              name="body"
              value={formData.body}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full p-3 border border-accent-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none font-inter"
              placeholder="Enter your notification message..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2 font-inter">
                Destination URL
              </label>
              <input
                type="text"
                name="url"
                value={formData.url}
                onChange={handleInputChange}
                className="w-full p-3 border border-accent-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-inter"
                placeholder="/"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2 font-inter">
                Send Time
              </label>
              <select
                name="schedule"
                value={formData.schedule}
                onChange={handleInputChange}
                className="w-full p-3 border border-accent-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-inter"
              >
                <option value="now">Send Now</option>
                <option value="schedule">Schedule for Later</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={sending || !formData.title || !formData.body}
            className="w-full bg-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center space-x-2 font-inter"
          >
            <SafeIcon icon={FiSend} className="h-4 w-4" />
            <span>{sending ? 'Sending...' : `Send to ${subscribers.length} Subscribers`}</span>
          </button>
        </form>
      </div>

      {/* Subscriber Info */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4 font-inter">
          Subscription Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary font-inter">{subscribers.length}</div>
            <div className="text-sm text-text-light font-inter">Total Subscribers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 font-inter">
              {subscribers.filter(s => new Date(s.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
            </div>
            <div className="text-sm text-text-light font-inter">New This Week</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-text-primary font-inter">
              {JSON.parse(localStorage.getItem('sent_notifications_portal123') || '[]').length}
            </div>
            <div className="text-sm text-text-light font-inter">Total Sent</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;