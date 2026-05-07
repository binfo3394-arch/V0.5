// ST POS v28 — Service Worker
const CACHE = 'st-pos-v28-v4';

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(['/V0.5/', '/V0.5/index.html'])).catch(() => {})
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
  // Skip non-http(s) requests (chrome-extension://, blob:, etc.)
  if (!url.startsWith('http')) return;
  // Skip external APIs
  if (url.includes('firebase') || url.includes('googleapis') ||
      url.includes('cdnjs') || url.includes('unpkg') || url.includes('gstatic')) return;

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
