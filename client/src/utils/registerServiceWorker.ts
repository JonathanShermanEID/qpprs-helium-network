/**
 * Service Worker Registration Utility
 * Registers the service worker for offline mesh network functionality
 * Author: Jonathan Sherman
 */

export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      console.log('[SW] Service Worker registered successfully:', registration.scope);

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        console.log('[SW] New service worker found, installing...');

        newWorker?.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('[SW] New service worker installed, reload to activate');
            // Optionally show update notification to user
          }
        });
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('[SW] Message from service worker:', event.data);

        if (event.data.type === 'MESH_NETWORK_AVAILABLE') {
          console.log('[SW] Mesh network is available!', event.data.data);
          // Trigger UI update or notification
        }
      });

      // Request background sync permission
      if ('sync' in registration) {
        try {
          await (registration as any).sync.register('mesh-network-sync');
          console.log('[SW] Background sync registered');
        } catch (error) {
          console.warn('[SW] Background sync registration failed:', error);
        }
      }

      return registration;
    } catch (error) {
      console.error('[SW] Service Worker registration failed:', error);
      return null;
    }
  } else {
    console.warn('[SW] Service Workers not supported in this browser');
    return null;
  }
}

export async function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.unregister();
      console.log('[SW] Service Worker unregistered');
    }
  }
}
