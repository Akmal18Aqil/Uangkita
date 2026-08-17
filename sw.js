const CACHE_NAME = 'financeku-v5';

// Semua aset shell, termasuk komponen & halaman yang dimuat lewat import() dinamis.
// Kalau file di bawah ini tidak lengkap, halaman gagal dibuka saat offline.
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/index.css',
  './css/animations.css',
  './css/components.css',
  './css/pages.css',
  './js/app.js',
  './js/api.js',
  './js/router.js',
  './js/store.js',
  './js/utils.js',
  './js/components/chart.js',
  './js/components/fab.js',
  './js/components/modal.js',
  './js/components/navbar.js',
  './js/components/skeleton.js',
  './js/components/taskForm.js',
  './js/components/toast.js',
  './js/components/transactionForm.js',
  './js/pages/analytics.js',
  './js/pages/dashboard.js',
  './js/pages/settings.js',
  './js/pages/tasks.js',
  './js/pages/transactions.js'
];

// Install Event - Caching Assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    // cache:'reload' melewati HTTP cache browser. Tanpa ini, install versi baru
    // bisa mengisi cache dengan file lama yang masih tersimpan di HTTP cache,
    // sehingga hasil deploy baru tidak pernah sampai ke pengguna.
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(ASSETS_TO_CACHE.map((url) => new Request(url, { cache: 'reload' })))
    )
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

// Data Apps Script tidak boleh masuk cache: selalu ambil dari jaringan.
function isApiRequest(url) {
  return url.hostname.endsWith('script.google.com') ||
         url.hostname.endsWith('script.googleusercontent.com');
}

// Respons cross-origin sering bertipe 'cors' atau 'opaque' (status 0),
// jadi pengecekan status === 200 saja akan membuang font & ikon CDN dari cache.
function isCacheable(response) {
  return !!response && (response.ok || response.type === 'opaque');
}

// Aset statis: pakai versi cache dulu (render instan), lalu perbarui di latar belakang.
// Efeknya kode baru terpakai pada kunjungan berikutnya, bukan menunggu jaringan tiap buka.
async function staleWhileRevalidate(request, event) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request, { ignoreSearch: true });

  const fromNetwork = fetch(request).then((response) => {
    if (isCacheable(response)) {
      cache.put(request, response.clone());
    }
    return response;
  });

  if (cached) {
    // Perbarui cache tanpa menahan respons ke halaman.
    event.waitUntil(fromNetwork.catch(() => {}));
    return cached;
  }

  return fromNetwork;
}

// Font & ikon CDN memakai URL ber-versi, isinya tidak pernah berubah.
async function cacheFirst(request, event) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (isCacheable(response)) {
    event.waitUntil(cache.put(request, response.clone()));
  }
  return response;
}

// Dokumen HTML tetap network-first supaya shell aplikasi selalu yang terbaru.
async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (isCacheable(response)) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) return cached;
    const shell = await cache.match('./index.html');
    if (shell) return shell;
    throw err;
  }
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  if (isApiRequest(url)) return; // biarkan browser menanganinya langsung

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(staleWhileRevalidate(request, event));
    return;
  }

  event.respondWith(cacheFirst(request, event));
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
