export function setupServiceWorker(): void {
  if (typeof window === 'undefined') return;

  // In development, Service Worker is not generated or needed
  if (import.meta.env.DEV) {
    return;
  }

  if ('serviceWorker' in navigator) {
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });

    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }

          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  newWorker.postMessage({ type: 'SKIP_WAITING' });
                }
              });
            }
          });

          // Check for updates periodically and on visibility change
          registration.update().catch(() => {});
          setInterval(() => {
            registration.update().catch(() => {});
          }, 30000);
        })
        .catch(() => {});
    });
  }
}
