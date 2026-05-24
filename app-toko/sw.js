const CACHE_NAME = 'toko-barang-v6';

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

  // Network-first for API calls (Don't cache if not JSON/Success)
  if (url.pathname.includes('/api-toko/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Hanya cache jika response sukses dan bertipe JSON
          const contentType = response.headers.get('content-type');
          if (response.ok && contentType && contentType.includes('application/json')) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request, { ignoreSearch: true }))
    );
    return;
  }

  // Cache-first for everything else
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true })
      .then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          // Dynamic Cache untuk eksternal script/CSS (Tailwind, Fonts, dll)
          if (event.request.method === 'GET' && (response.ok || response.type === 'opaque')) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        });
      })
  );
});
