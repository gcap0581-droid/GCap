import { registerSW } from 'virtual:pwa-register';

export function setupServiceWorker(): void {
  if (typeof window === 'undefined') return;

  if ('serviceWorker' in navigator) {
    try {
      const updateSW = registerSW({
        immediate: true,
        onNeedRefresh() {
          console.log('[PWA] New build deployed on GitHub/Server - auto-updating PWA...');
          // Automatically activate new service worker and refresh to load the latest code
          updateSW(true);
        },
        onOfflineReady() {
          console.log('[PWA] GCap PWA cached and ready for offline use');
        },
        onRegisteredSW(_swScriptUrl, registration) {
          if (registration) {
            // Check immediately on app boot
            registration.update().catch(() => {});

            // Check every 15 seconds in the background
            setInterval(() => {
              registration.update().catch(() => {});
            }, 15000);

            // Also check whenever user brings the installed app to foreground
            document.addEventListener('visibilitychange', () => {
              if (document.visibilityState === 'visible') {
                registration.update().catch(() => {});
              }
            });
          }
        },
      });
    } catch (err) {
      console.warn('[PWA] Registration fallback:', err);
    }
  }
}
