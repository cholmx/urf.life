// Service Worker for Push Notifications
const CACHE_NAME = 'church-portal-v1';

// Install event
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Push event - handles incoming push notifications
self.addEventListener('push', (event) => {
  console.log('Push received:', event);
  
  let notificationData = {
    title: 'Upper Room Fellowship',
    body: 'You have a new update!',
    icon: '/logo.png',
    badge: '/logo.png',
    data: {
      url: '/'
    }
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        title: data.title || notificationData.title,
        body: data.body || notificationData.body,
        icon: data.icon || notificationData.icon,
        badge: data.badge || notificationData.badge,
        image: data.image,
        data: {
          url: data.url || '/',
          type: data.type || 'general'
        },
        actions: data.actions || [
          {
            action: 'open',
            title: 'View',
            icon: '/logo.png'
          },
          {
            action: 'close',
            title: 'Dismiss'
          }
        ]
      };
    } catch (error) {
      console.error('Error parsing push data:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      image: notificationData.image,
      data: notificationData.data,
      actions: notificationData.actions,
      requireInteraction: true,
      vibrate: [200, 100, 200],
      tag: notificationData.data.type
    })
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    // eslint-disable-next-line no-undef
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // Check if there's already a window/tab open with the target URL
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If no existing window/tab, open a new one
      // eslint-disable-next-line no-undef
      if (clients.openWindow) {
        // eslint-disable-next-line no-undef
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Background sync for offline functionality
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle background sync tasks
      console.log('Background sync triggered')
    );
  }
});