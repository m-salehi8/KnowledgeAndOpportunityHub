// Service Worker Push & Notification Click Handler for Knowledge & Opportunity Hub

self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data = { body: event.data.text() };
    }
  }

  const title = data.title || 'هاب دانش و فرصت‌ها';
  const options = {
    body: data.body || 'اعلان جدیدی از رادار یا دایجست روزانه دریافت شد.',
    icon: data.icon || '/pwa-192x192.png',
    badge: data.badge || '/pwa-192x192.png',
    tag: data.tag || 'hub-alert',
    renotify: true,
    data: {
      url: data.url || '/',
      tab: data.tab || 'inbox',
      timestamp: Date.now(),
    },
    dir: 'rtl',
    lang: 'fa',
    vibrate: [150, 50, 150],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';
  const targetTab = event.notification.data?.tab;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a tab is already open, focus it and post a message
      for (const client of clientList) {
        if ('focus' in client) {
          if (targetTab) {
            client.postMessage({
              type: 'NAVIGATE_TAB',
              tab: targetTab,
            });
          }
          return client.focus();
        }
      }
      // If no window is open, open a new window
      if (clients.openWindow) {
        const fullUrl = targetTab ? `${targetUrl}?tab=${targetTab}` : targetUrl;
        return clients.openWindow(fullUrl);
      }
    })
  );
});
