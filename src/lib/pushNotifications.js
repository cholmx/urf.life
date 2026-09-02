// Push Notifications Service
class PushNotificationService {
  constructor() {
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
    this.subscription = null;
    this.publicKey = 'BEl62iUYgUivxIkv69yViEuiBIa40HI8YlOu_7VPrHkTkbkFj4LsGJsiAZWrTAkwXu7lKhKkYWkXnb6_fVNvGJo'; // Replace with your VAPID public key
  }

  async initialize() {
    if (!this.isSupported) {
      console.warn('Push notifications are not supported in this browser');
      return false;
    }

    try {
      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js');

      // Check if already subscribed
      this.subscription = await registration.pushManager.getSubscription();
      
      return true;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return false;
    }
  }

  async requestPermission() {
    if (!this.isSupported) {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  async subscribe() {
    if (!this.isSupported || Notification.permission !== 'granted') {
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.publicKey)
      });

      this.subscription = subscription;
      
      // Send subscription to server
      await this.sendSubscriptionToServer(subscription);
      
      return subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return null;
    }
  }

  async unsubscribe() {
    if (this.subscription) {
      try {
        await this.subscription.unsubscribe();
        await this.removeSubscriptionFromServer();
        this.subscription = null;
        return true;
      } catch (error) {
        console.error('Unsubscribe failed:', error);
        return false;
      }
    }
    return true;
  }

  async sendSubscriptionToServer(subscription) {
    try {
      // Store subscription in localStorage for demo
      // In production, send to your server
      const subscriptions = JSON.parse(localStorage.getItem('push_subscriptions_portal123') || '[]');
      const subscriptionData = {
        id: Date.now().toString(),
        subscription: subscription,
        created_at: new Date().toISOString(),
        user_agent: navigator.userAgent
      };
      
      subscriptions.push(subscriptionData);
      localStorage.setItem('push_subscriptions_portal123', JSON.stringify(subscriptions));
      
    } catch (error) {
      console.error('Failed to send subscription to server:', error);
    }
  }

  async removeSubscriptionFromServer() {
    try {
      // Remove from localStorage for demo
      // In production, remove from your server
      localStorage.removeItem('push_subscriptions_portal123');
    } catch (error) {
      console.error('Failed to remove subscription from server:', error);
    }
  }

  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  isSubscribed() {
    return this.subscription !== null;
  }

  getPermissionStatus() {
    if (!this.isSupported) {
      return 'unsupported';
    }
    return Notification.permission;
  }

  // Send a test notification (for demo purposes)
  async sendTestNotification() {
    if ('serviceWorker' in navigator && 'showNotification' in ServiceWorkerRegistration.prototype) {
      const registration = await navigator.serviceWorker.ready;
      
      registration.showNotification('Test Notification', {
        body: 'This is a test notification from Upper Room Fellowship!',
        icon: '/logo.png',
        badge: '/logo.png',
        vibrate: [200, 100, 200],
        data: {
          url: '/',
          type: 'test'
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
        ]
      });
    }
  }
}

export default new PushNotificationService();