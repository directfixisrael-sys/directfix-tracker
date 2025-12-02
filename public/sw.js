// Service Worker for Push Notifications
self.addEventListener('push', function(event) {
  console.log('Push event received:', event);
  
  let data = { title: 'DirectFix', body: 'הודעה חדשה!' };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    vibrate: [200, 100, 200],
    tag: 'directfix-notification',
    renotify: true,
    data: {
      url: data.url || '/admin'
    },
    dir: 'rtl',
    lang: 'he',
    actions: [
      { action: 'open', title: 'פתח' },
      { action: 'close', title: 'סגור' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  console.log('Notification click:', event);
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/admin';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        // Check if there's already an open window
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes('/admin') && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise open a new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Handle subscription change
self.addEventListener('pushsubscriptionchange', function(event) {
  console.log('Push subscription changed');
});
