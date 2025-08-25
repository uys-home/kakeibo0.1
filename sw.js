const VERSION = 'v1.0.3';
const APP_SHELL = [
  './',
  './index.html',
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/recharts/umd/Recharts.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    await cache.addAll(APP_SHELL.map(u => new Request(u, { mode: 'no-cors' })));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)));
    self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  e.respondWith((async () => {
    const cache = await caches.open(VERSION);
    const cached = await cache.match(req, { ignoreVary: true });
    if (cached) return cached;
    try {
      const net = await fetch(req);
      const isGET = req.method === 'GET';
      const isSame = req.url.startsWith(self.location.origin);
      const isCDN = req.url.includes('unpkg.com');
      if (isGET && (isSame || isCDN)) cache.put(req, net.clone());
      return net;
    } catch (err) {
      if (req.mode === 'navigate') return cache.match('./index.html');
      throw err;
    }
  })());
});
