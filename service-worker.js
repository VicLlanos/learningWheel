/* learningWheel Service Worker
   - Pre-caches the app shell (HTML, CSS, JS, manifest, logo)
   - Runtime-caches CDN assets (Bootstrap, icons) with stale-while-revalidate
   - Falls back to offline.html when navigation requests fail
   - Cleans up old caches on activation
*/

const VERSION = 'lw-v1.0.1';
const APP_SHELL_CACHE = `lw-shell-${VERSION}`;
const RUNTIME_CACHE = `lw-runtime-${VERSION}`;

const APP_SHELL = [
  './',
  './index.html',
  './app.js',
  './styles.css',
  './manifest.json',
  './offline.html',
  './logolearningwheel.png'
];

const CDN_ORIGINS = [
  'https://cdn.jsdelivr.net',
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then(cache => {
      return Promise.all(
        APP_SHELL.map(url =>
          cache.add(url).catch(err => {
            console.warn('[SW] Pre-cache skipped:', url, err.message);
          })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== APP_SHELL_CACHE && k !== RUNTIME_CACHE)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isCDN = CDN_ORIGINS.some(o => url.href.startsWith(o));
  if (!isSameOrigin && !isCDN) return;
  if (!url.protocol.startsWith('http')) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(res => {
          const copy = res.clone();
          caches.open(APP_SHELL_CACHE).then(c => c.put(request, copy)).catch(() => {});
          return res;
        })
        .catch(() =>
          caches.match(request)
            .then(cached => cached || caches.match('./index.html'))
            .then(cached => cached || caches.match('./offline.html'))
        )
    );
    return;
  }

  if (isSameOrigin) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(res => {
          if (res && res.status === 200 && res.type === 'basic') {
            const copy = res.clone();
            caches.open(APP_SHELL_CACHE).then(c => c.put(request, copy)).catch(() => {});
          }
          return res;
        });
      })
    );
    return;
  }

  if (isCDN) {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then(cache =>
        cache.match(request).then(cached => {
          const fetchPromise = fetch(request)
            .then(res => {
              if (res && res.status === 200) {
                cache.put(request, res.clone()).catch(() => {});
              }
              return res;
            })
            .catch(() => cached);
          return cached || fetchPromise;
        })
      )
    );
  }
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});