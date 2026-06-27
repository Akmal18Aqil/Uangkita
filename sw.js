const CACHE_NAME = 'financeku-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/index.css',
  './css/animations.css',
  './css/components.css',
  './css/pages.css',
  './js/app.js',
  './js/utils.js',
  './js/store.js',
  './js/api.js',
  './js/router.js',
  './manifest.json'
];

// Install Event - Caching Assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - Serve from Cache or Network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// Push Notification Event
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Anda memiliki pengingat/tugas baru!',
    icon: 'https://cdn-icons-png.flaticon.com/512/3135/3135679.png',
    badge: 'https://cdn-icons-png.flaticon.com/512/3135/3135679.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '2'
    }
  };

  event.waitUntil(
    self.registration.showNotification('FinanceKu Notifikasi', options)
  );
});

// Notification Click Event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
