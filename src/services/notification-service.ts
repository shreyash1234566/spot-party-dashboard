export class NotificationService {
  private static instance: NotificationService;
  private messaging: any;
  // Removed vapidKey as per new configuration

  private constructor() {
    this.initializeMessaging();
  }

  private async initializeMessaging() {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        const { messaging } = await import('../firebase-config');
        this.messaging = messaging;
      } catch (error) {
        console.error('Error importing Firebase messaging:', error);
      }
    }
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Check if notifications are supported
  isSupported(): boolean {
    return typeof window !== 'undefined' && 
           'serviceWorker' in navigator && 
           'Notification' in window;
  }

  // Request notification permission
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      throw new Error('Notifications are not supported in this browser');
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  // Register service worker
  async registerServiceWorker(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service workers are not supported');
    }

    try {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('Service Worker registered successfully:', registration);
      
      // Wait a bit for service worker to be ready
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error;
    }
  }

  // Get FCM token
  async getToken(): Promise<string | null> {
    // Ensure messaging is initialized
    if (!this.messaging) {
      await this.initializeMessaging();
    }

    if (!this.messaging) {
      throw new Error('Firebase messaging not initialized');
    }

    try {
      // First ensure service worker is registered
      await this.registerServiceWorker();
      
      // Request permission
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        throw new Error('Notification permission denied');
      }

      // Get token
      const { getToken } = await import('../firebase-config');
      // Removed vapidKey from getToken options
      const token = await getToken(this.messaging);

      if (token) {
        // Store token locally
        localStorage.setItem('fcm_token', token);
        console.log('FCM Token:', token);
        return token;
      } else {
        throw new Error('No registration token available');
      }
    } catch (error) {
      console.error('Error getting token:', error);
      throw error;
    }
  }

  // Get stored token
  getStoredToken(): string | null {
    return localStorage.getItem('fcm_token');
  }

  // Listen for foreground messages
  onMessage(callback: (payload: any) => void): void {
    if (!this.messaging) return;

    import('../firebase-config').then(({ onMessage }) => {
      onMessage(this.messaging, (payload) => {
        console.log('Message received in foreground:', payload);
        callback(payload);
      });
    });
  }

  // Removed direct notification sending logic; now handled by Cloud Function
}