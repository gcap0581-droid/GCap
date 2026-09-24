export function setupServiceWorker(): void {
  if (typeof window === 'undefined') return;

  // In development, Service Worker is not generated or needed
  if (import.meta.env.DEV) {
    return;
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          registration.update().catch(() => {});
          setInterval(() => {
            registration.update().catch(() => {});
          }, 60000);
        })
        .catch(() => {});
    });
  }
}
