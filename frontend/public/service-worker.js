/* eslint-disable no-restricted-globals */

// Import Workbox from CDN
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');

if (workbox) {
  console.log('[Workbox] Yüklendi! 🎉');

  // ==========================================
  // CACHE CONFIGURATION
  // ==========================================

  workbox.core.setCacheNameDetails({
    prefix: 'randevu-sistemi',
    suffix: 'v1',
    precache: 'precache',
    runtime: 'runtime',
  });

  // ==========================================
  // PRECACHEING (App Shell)
  // ==========================================

  // Precache the app shell and critical assets
  workbox.precaching.precacheAndRoute([
    { url: '/', revision: '1' },
    { url: '/index.html', revision: '1' },
    // NOTE: manifest.json is NOT precached to avoid fetch errors in development
  ]);

  // ==========================================
  // RUNTIME CACHING STRATEGIES
  // ==========================================

  // 1. IMAGES - CacheFirst (very fast)
  workbox.routing.registerRoute(
    ({ request }) => request.destination === 'image',
    new workbox.strategies.CacheFirst({
      cacheName: 'image-cache',
      plugins: [
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        }),
      ],
    })
  );

  // 2. FONTS - CacheFirst (very fast, 1 year cache)
  workbox.routing.registerRoute(
    ({ url }) => url.origin === 'https://fonts.gstatic.com' ||
                url.origin === 'https://fonts.googleapis.com',
    new workbox.strategies.CacheFirst({
      cacheName: 'font-cache',
      plugins: [
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
        }),
      ],
    })
  );

  // 3. CSS & JS - StaleWhileRevalidate (always fast, updates in background)
  workbox.routing.registerRoute(
    ({ request }) => request.destination === 'style' ||
                     request.destination === 'script',
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'static-resources',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 30,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        }),
      ],
    })
  );

  // 4. API CALLS - NetworkFirst (fresh data, fallback to cache)
  workbox.routing.registerRoute(
    ({ url }) => url.pathname.startsWith('/api/'),
    new workbox.strategies.NetworkFirst({
      cacheName: 'api-cache',
      networkTimeoutSeconds: 3, // Wait 3 seconds for network
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 5 * 60, // 5 minutes
        }),
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
      ],
    })
  );

  // ==========================================
  // SKIP WAITING (Immediate updates)
  // ==========================================
  // Not: Workbox v7'de skipWaiting ve clientsClaim otomatik

  console.log('[Workbox] Service worker aktif!');

} else {
  console.log('[Workbox] Yüklenemedi 😬');
}

// ==========================================
// MESSAGE HANDLING
// ==========================================

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
