export function setupServiceWorker(): void {
  if (typeof window === 'undefined') return;

  // In development or when embedded in AI Studio preview iframe, Service Worker is not needed
  const isIframe = (() => {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  })();

  if (import.meta.env.DEV || isIframe) {
    return;
  }

  if ('serviceWorker' in navigator) {
    // Prevent reload loops: NEVER automatically reload the page on background service worker updates
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      // Background update only - do not force window.location.reload()
      console.log('[PWA] Service worker updated successfully in background.');
    });

    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New update available in background without interrupting user
                  console.log('[PWA] New service worker installed.');
                }
              });
            }
          });
        })
        .catch(() => {});
    });
  }
}
