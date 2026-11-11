/**
 * Hand-written Service Worker for Northside Discovery Centre.
 * No Workbox / Serwist dependencies.
 *
 * Strategies:
 * 1. Precache shell-{BUILD_ID}: root, offline fallback, manifest
 * 2. Cache-first for static content (static-v1)
 * 3. Network-first with 3s timeout for page navigations (pages-{BUILD_ID})
 * 4. Never touches /api/*, /p/*, or non-GET requests.
 */

const BUILD_ID = '__BUILD_ID__';
const SHELL_CACHE = `shell-${BUILD_ID}`;
const PAGES_CACHE = `pages-${BUILD_ID}`;
const STATIC_CACHE = 'static-v1';

const PRECACHE_URLS = [
  '/',
  '/offline',
  '/manifest.json',
  '/favicon.ico',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn('[SW] Precache partial error:', err);
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (
            key !== SHELL_CACHE &&
            key !== PAGES_CACHE &&
            key !== STATIC_CACHE
          ) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // 1. Only handle GET requests
  if (request.method !== 'GET') return;

  // 2. Never intercept API requests or short links
  if (url.pathname.startsWith('/api') || url.pathname.startsWith('/p/')) {
    return;
  }

  // 3. Skip cross-origin or chrome-extension requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // 4. Static assets (JS, CSS, fonts, SVG) -> Cache-first
  if (
    url.pathname.startsWith('/assets/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.svg')
  ) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        try {
          const response = await fetch(request);
          if (response.ok) {
            cache.put(request, response.clone());
          }
          return response;
        } catch {
          return new Response('', { status: 404 });
        }
      })
    );
    return;
  }

  // 5. HTML Page navigations -> Network-first with 3s timeout, then pages cache, then /offline
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Network timeout')), 3000)
          );
          const networkResponse = await Promise.race([
            fetch(request),
            timeoutPromise,
          ]);

          if (networkResponse && networkResponse.ok) {
            const cache = await caches.open(PAGES_CACHE);
            cache.put(request, networkResponse.clone());
            return networkResponse;
          }
        } catch (err) {
          // Network failed or timed out
        }

        // Try page cache
        const cachedPage = await caches.match(request);
        if (cachedPage) {
          return cachedPage;
        }

        // Fallback to offline shell
        const offlinePage = await caches.match('/offline');
        if (offlinePage) {
          return offlinePage;
        }

        return caches.match('/');
      })()
    );
  }
});
