export function setupServiceWorker(): void {
  if (typeof window === 'undefined') return;

  if ('serviceWorker' in navigator) {
    // In production or when service worker script is available
    if ('serviceWorker' in navigator && typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('[PWA] ServiceWorker registered with scope:', registration.scope);
            registration.update().catch(() => {});
            setInterval(() => {
              registration.update().catch(() => {});
            }, 60000);
          })
          .catch((err) => {
            console.warn('[PWA] Registration notice:', err);
          });
      });
    }
  }
}
