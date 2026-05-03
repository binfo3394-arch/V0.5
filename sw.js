// ST POS v28 — Service Worker
// Place this file at: /V0.5/sw.js in your GitHub repo

const CACHE = 'st-pos-v28-sw-v1';
const URLS_TO_CACHE = [
  '/V0.5/',
  '/V0.5/index.html'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(URLS_TO_CACHE)).catch(() => {})
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  var url = e.request.url;
  // Skip external APIs
  if (url.includes('firebase') || url.includes('googleapis') ||
      url.includes('cdnjs') || url.includes('unpkg') || url.includes('gstatic')) return;

  e.respondWith(
    caches.open(CACHE).then(c =>
      c.match(e.request).then(cached => {
        var net = fetch(e.request).then(r => {
          if (r && r.ok && e.request.method === 'GET') {
            c.put(e.request, r.clone());
          }
          return r;
        }).catch(() => cached);
        return cached || net;
      })
    )
  );
});
