const CACHE_NAME = 'github-cdn-v2-no-root-cache';

// Resources that should be precached (excluding root page to prevent caching)
const PRECACHE_URLS = [
  '/favicon.ico',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  // Clean up old caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => caches.delete(cacheName))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Never cache the root page
  if (url.pathname === '/') {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // GitHub and Gist CDN routes
  if (url.pathname.startsWith('/github/') || url.pathname.startsWith('/gist/')) {
    event.respondWith(networkFirstWithCache(event.request));
    return;
  }
  
  // For API routes, don't use cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // For everything else, try the cache first, then network
  event.respondWith(cacheFirstWithNetwork(event.request));
});

// Cache-first strategy with network fallback
async function cacheFirstWithNetwork(request) {
  const cache = await caches.open(CACHE_NAME);
  
  // Try the cache first
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // If not in cache, try the network
  try {
    const networkResponse = await fetch(request);
    
    // Save the response in the cache if it's successful
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Fetch failed:', error);
    // You could return a custom offline page here
    return new Response('Network request failed', { status: 408 });
  }
}

// Network-first strategy with cache fallback
async function networkFirstWithCache(request) {
  const cache = await caches.open(CACHE_NAME);
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Save successful responses in the cache
    if (networkResponse.ok) {
      // Clone the response before putting it in the cache
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Fetch failed, using cache:', error);
    
    // If network fails, try the cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If not in cache either, return an error response
    return new Response('Failed to fetch content', { 
      status: 503,
      headers: {
        'Content-Type': 'text/plain'
      }
    });
  }
} 