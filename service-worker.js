const CACHE = 'neonote-v413';

const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  if (
    event.request.method !== 'GET' ||
    !event.request.url.startsWith(self.location.origin)
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request);
    })
  );
});

self.addEventListener('message', event => {
  if (event.data?.action === 'APPLY_UPDATE') {
    event.waitUntil(applyLatestUpdate());
    self.skipWaiting();
  }
});

async function applyLatestUpdate() {
  const keys = await caches.keys();
  await Promise.all(keys.map(k => caches.delete(k)));

  const cache = await caches.open(CACHE);
  await cache.addAll(ASSETS);
}
