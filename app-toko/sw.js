const CACHE_NAME = 'toko-barang-v3';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './app.js',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  './manifest.json'
];

// ===== INSTALL: Pre-cache app shell =====
self.addEventListener('install', (event) => {
  console.log('[SW] Install — caching app shell');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// ===== ACTIVATE: Clean up old caches =====
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate — cleaning old caches');
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ===== FETCH: Cache-first for assets, network-first for API =====
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Network-first for API calls
  if (url.pathname.includes('/api-toko/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first for everything else
  event.respondWith(
    caches.match(event.request)
      .then((cached) => cached || fetch(event.request))
  );
});
