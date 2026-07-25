const CACHE_NAME = 'financeku-v2';
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
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened fresh cache v2');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate Event - Clean up ALL old caches
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

// Fetch Event - Network First Strategy for JS/CSS so latest code is always fetched fresh!
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Network First for fresh logic & data
  event.respondWith(
    fetch(event.request).then((networkResponse) => {
      if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
      }
      return networkResponse;
    }).catch(() => {
      // Fallback to cache if offline
      return caches.match(event.request);
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

// PWA Widget Events
self.addEventListener('widgetinstall', (event) => {
  console.log('Widget installed:', event.widget.name);
});

self.addEventListener('widgetresume', (event) => {
  console.log('Widget resumed:', event.widget.name);
});

self.addEventListener('widgetclick', (event) => {
  console.log('Widget clicked', event);
  event.waitUntil(
    clients.openWindow('/?from_widget=true')
  );
});

self.addEventListener('widgetuninstall', (event) => {
  console.log('Widget uninstalled:', event.widget.name);
});
