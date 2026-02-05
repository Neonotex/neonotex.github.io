const CACHE = 'neonote-v346';

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
    caches.open(CACHE).then(async cache => {

      const requests = ASSETS.map(url =>
        new Request(url, { cache: 'reload' })
      );
      await cache.addAll(requests);
    })
  );
});


self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  if (event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request);
    })
  );
});


self.addEventListener('message', event => {
  if (event.data?.action === 'SKIP_WAITING') {
    self.skipWaiting();

    event.waitUntil(
      caches.keys().then(keys =>
        Promise.all(
          keys.filter(k => k !== CACHE).map(k => caches.delete(k))
        )
      )
    );
  }
});


self.addEventListener('activate', event => {
  
});
