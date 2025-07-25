// public/firebase-messaging-sw.js
self.addEventListener('push', function(event) {
  const data = event.data.json();
  console.log('[Service Worker] Push Received.');

  const title = data.notification.title;
  const options = {
    body: data.notification.body,
    icon: '/favicon.ico',
  };

  event.waitUntil(self.registration.showNotification(title, options));
});
