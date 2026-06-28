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

// Fetch Event - Serve from Cache (Cache First Strategy for fast loading)
self.addEventListener('fetch', (event) => {
  // Hanya menerapkan cache-first pada GET request
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached response if found (Cache First)
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // If not in cache, fetch from network
      return fetch(event.request).then((networkResponse) => {
        // Cache the newly fetched response for future fast loading
        return caches.open(CACHE_NAME).then((cache) => {
          // Jangan cache jika request ke API eksternal atau tidak valid
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        });
      }).catch(() => {
        // Fallback jika offline dan tidak ada di cache (bisa diarahkan ke custom offline page)
        console.log('Offline dan resource tidak ada di cache:', event.request.url);
      });
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
