const CACHE_NAME = 'tzu-chi-absen-v1';

self.addEventListener('install', e => { 
    e.waitUntil(self.skipWaiting()); 
});

self.addEventListener('activate', e => { 
    e.waitUntil(self.clients.claim()); 
});

self.addEventListener('fetch', e => {
    e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});
