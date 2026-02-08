const CACHE = 'neonote-v406';

self.addEventListener('install', event => {
  
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

  await cache.addAll([
    new Request('./', { cache: 'reload' }),
    new Request('./index.html', { cache: 'reload' }),
    new Request('./style.css', { cache: 'reload' }),
    new Request('./app.js', { cache: 'reload' }),
    new Request('./manifest.json', { cache: 'reload' }),
    new Request('./icons/icon-192.png', { cache: 'reload' }),
    new Request('./icons/icon-512.png', { cache: 'reload' })
  ]);
}

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

  

