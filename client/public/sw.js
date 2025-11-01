/**
 * Helium Mesh Network Service Worker
 * Enables offline functionality and mesh network connectivity
 * Author: Jonathan Sherman
 */

const CACHE_NAME = 'helium-mesh-v1';
const OFFLINE_URL = '/offline.html';

// Assets to cache for offline use
const CACHE_ASSETS = [
  '/',
  '/offline.html',
  '/assets/index.css',
  '/assets/index.js',
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching assets');
      return cache.addAll(CACHE_ASSETS).catch((err) => {
        console.warn('[Service Worker] Cache failed for some assets:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response
        const responseClone = response.clone();

        // Cache successful responses
        if (response.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }

        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          // If no cache, return offline page for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
          }

          // Return a basic offline response
          return new Response('Offline - Helium Mesh Network', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain',
            }),
          });
        });
      })
  );
});

// Background sync for mesh network connectivity
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);
  
  if (event.tag === 'mesh-network-sync') {
    event.waitUntil(syncMeshNetwork());
  }
});

async function syncMeshNetwork() {
  try {
    console.log('[Service Worker] Syncing with mesh network...');
    
    // Attempt to connect to mesh network
    const response = await fetch('/api/trpc/mesh.checkAvailability');
    
    if (response.ok) {
      const data = await response.json();
      console.log('[Service Worker] Mesh network available:', data);
      
      // Notify all clients
      const clients = await self.clients.matchAll();
      clients.forEach((client) => {
        client.postMessage({
          type: 'MESH_NETWORK_AVAILABLE',
          data: data,
        });
      });
    }
  } catch (error) {
    console.log('[Service Worker] Mesh network sync failed:', error);
  }
}

// Push notifications for mesh network status
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  
  const options = {
    body: data.body || 'Helium mesh network status update',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    data: data,
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Helium Network', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});

console.log('[Service Worker] Loaded - Author: Jonathan Sherman');
