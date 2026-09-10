import { registerSW } from 'virtual:pwa-register';

export function setupServiceWorker(): void {
  if (typeof window === 'undefined') return;

  if ('serviceWorker' in navigator) {
    try {
      registerSW({
        immediate: true,
        onNeedRefresh() {
          console.log('[PWA] Service worker update available');
        },
        onOfflineReady() {
          console.log('[PWA] GCap PWA cached and ready for offline use');
        },
        onRegisteredSW(_swScriptUrl, registration) {
          if (registration) {
            // Check for updates periodically in the background without forcing reloads
            setInterval(() => {
              registration.update().catch(() => {});
            }, 60000);
          }
        },
      });
    } catch (err) {
      console.warn('[PWA] Registration fallback:', err);
    }
  }
}
