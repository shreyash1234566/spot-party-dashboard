// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// Initialize Firebase - Update these values to match your project
firebase.initializeApp({
  apiKey: "AIzaSyCIkj7tF81qD35As_FBDFtXriFP-0D0CU4",
  authDomain: "partyspot-a68fb.firebaseapp.com",
  projectId: "partyspot-a68fb",
  storageBucket: "partyspot-a68fb.firebasestorage.app",
  messagingSenderId: "351917712538",
  appId: "1:351917712538:web:f3c3278bf15849b479ab23"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function(payload) {
  console.log('Received background message:', payload);
  // Add detailed logging for notification field
  if (payload.notification) {
    console.log('Notification field:', payload.notification);
  } else {
    console.warn('No notification field in payload!');
  }

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: 'notification-tag',
    renotify: true,
    requireInteraction: false,
    actions: [
      {
        action: 'open',
        title: 'Open App'
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
