// ST POS v28 — Service Worker
const CACHE = 'st-pos-v28-v5';
const OFFLINE_URL = 'offline.html';
const PRECACHE_URLS = [
  'index.html',
  'offline.html',
  'icons/icon-192.png',
  'icons/icon-512.png'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE_URLS)).catch(() => {})
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  var url = e.request.url;
  // Skip non-http(s) requests
  if (!url.startsWith('http')) return;
  // Skip external APIs and CDN resources
  if (url.includes('firebase') || url.includes('googleapis') ||
      url.includes('cdnjs') || url.includes('unpkg') || url.includes('gstatic')) return;

  // Navigation requests: network-first with offline fallback
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(r => {
          if (r && r.ok) {
            var clone = r.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return r;
        })
        .catch(() => caches.match(e.request).then(cached => cached || caches.match(OFFLINE_URL)))
    );
    return;
  }

  // Other requests: stale-while-revalidate
  e.respondWith(
    caches.open(CACHE).then(c =>
      c.match(e.request).then(cached => {
        var net = fetch(e.request).then(r => {
          if (r && r.ok && e.request.method === 'GET') c.put(e.request, r.clone());
          return r;
        }).catch(() => cached);
        return cached || net;
      })
    )
  );
});
