// AI Studio Live Auto-Sync Engine
// Detects any updates made from Google AI Studio and automatically updates the app
// on all user devices and browsers WITHOUT requiring project reinstallation.

export interface BuildVersionInfo {
  buildId: string;
  buildTime: string;
  appVersion: string;
  source: string;
  message?: string;
  autoReloadEnabled?: boolean;
}

// Injected during build by Vite `define`, or fallback to build timestamp
declare const __APP_BUILD_ID__: string | undefined;
declare const __APP_BUILD_TIME__: string | undefined;

export const CURRENT_BUILD_ID: string =
  typeof __APP_BUILD_ID__ !== 'undefined' && __APP_BUILD_ID__
    ? __APP_BUILD_ID__
    : '1773059500000';

export const CURRENT_BUILD_TIME: string =
  typeof __APP_BUILD_TIME__ !== 'undefined' && __APP_BUILD_TIME__
    ? __APP_BUILD_TIME__
    : new Date().toISOString();

export const APP_VERSION = '2.5.1';

type UpdateCallback = (info: BuildVersionInfo) => void;
const updateListeners: Set<UpdateCallback> = new Set();

let isChecking = false;
let updateAvailable: BuildVersionInfo | null = null;

export function subscribeToAiStudioUpdates(callback: UpdateCallback): () => void {
  updateListeners.add(callback);
  if (updateAvailable) {
    callback(updateAvailable);
  }
  return () => {
    updateListeners.delete(callback);
  };
}

/**
 * Checks the server /version.json to see if AI Studio has published a new build
 */
export async function checkForAiStudioUpdate(): Promise<{
  hasUpdate: boolean;
  remoteInfo?: BuildVersionInfo;
  error?: string;
}> {
  if (isChecking) return { hasUpdate: false };
  isChecking = true;

  try {
    const response = await fetch(`/version.json?_nocache=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
      },
    });

    if (!response.ok) {
      isChecking = false;
      return { hasUpdate: false, error: `HTTP ${response.status}` };
    }

    const remoteInfo: BuildVersionInfo = await response.json();
    isChecking = false;

    // Compare build ID or timestamp against both compile-time ID and stored installed ID
    const installedBuildId = localStorage.getItem('gcap_installed_build_id');
    const ignoredBuildId = localStorage.getItem('gcap_last_ignored_build');

    if (
      remoteInfo.buildId &&
      remoteInfo.buildId !== CURRENT_BUILD_ID &&
      remoteInfo.buildId !== installedBuildId &&
      remoteInfo.buildId !== ignoredBuildId
    ) {
      updateAvailable = remoteInfo;
      updateListeners.forEach((fn) => fn(remoteInfo));
      return { hasUpdate: true, remoteInfo };
    }

    // If matches current build or installed build, clear any stale update
    updateAvailable = null;
    return { hasUpdate: false, remoteInfo };
  } catch (err: unknown) {
    isChecking = false;
    const msg = err instanceof Error ? err.message : String(err);
    return { hasUpdate: false, error: msg };
  }
}

/**
 * Flushes all outdated service worker caches and performs a clean reload
 * preserving all user localStorage (wallet, plans, tokens, rules).
 */
export async function applyAiStudioUpdateNow(): Promise<void> {
  try {
    // 1. Clear caches if Service Worker Cache Storage exists
    if ('caches' in window) {
      try {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map((key) => caches.delete(key)));
      } catch (e) {
        console.warn('Cache clearing error:', e);
      }
    }

    // 2. Trigger Service Worker skipWaiting if active
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          if (reg.waiting) {
            reg.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
          await reg.update().catch(() => {});
        }
      } catch (e) {
        console.warn('Service worker update error:', e);
      }
    }

    // 3. Save build acknowledgment
    if (updateAvailable?.buildId) {
      localStorage.setItem('gcap_installed_build_id', updateAvailable.buildId);
    }

    // 4. Force browser reload bypassing cache
    window.location.reload();
  } catch {
    window.location.reload();
  }
}

/**
 * Initializes continuous background polling and event triggers for AI Studio updates
 */
export function initAiStudioLiveSync(): () => void {
  // 1. Initial check after 3 seconds of app boot
  const initialTimer = setTimeout(() => {
    checkForAiStudioUpdate();
  }, 3000);

  // 2. Heartbeat check every 15 seconds
  const interval = setInterval(() => {
    checkForAiStudioUpdate();
  }, 15000);

  // 3. Check whenever the user switches back to the tab/PWA
  const onVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      checkForAiStudioUpdate();
    }
  };
  document.addEventListener('visibilitychange', onVisibilityChange);

  // 4. Check when window receives focus
  const onFocus = () => {
    checkForAiStudioUpdate();
  };
  window.addEventListener('focus', onFocus);

  // 5. Broadcast channel for multi-tab sync or admin force-refresh
  let bc: BroadcastChannel | null = null;
  if ('BroadcastChannel' in window) {
    try {
      bc = new BroadcastChannel('aistudio_live_sync');
      bc.onmessage = (event) => {
        if (event.data?.type === 'FORCE_REFRESH_BROADCAST') {
          applyAiStudioUpdateNow();
        } else if (event.data?.type === 'CHECK_BUILD') {
          checkForAiStudioUpdate();
        }
      };
    } catch {
      // ignore BroadcastChannel errors in restricted contexts
    }
  }

  return () => {
    clearTimeout(initialTimer);
    clearInterval(interval);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    window.removeEventListener('focus', onFocus);
    if (bc) {
      bc.close();
    }
  };
}

/**
 * Broadcasts a force-refresh command to all clients and tabs
 */
export function broadcastAiStudioForceUpdate(): void {
  if ('BroadcastChannel' in window) {
    try {
      const bc = new BroadcastChannel('aistudio_live_sync');
      bc.postMessage({ type: 'FORCE_REFRESH_BROADCAST', timestamp: Date.now() });
      bc.close();
    } catch {
      // ignore
    }
  }
  localStorage.setItem('gcap_force_update_trigger', Date.now().toString());
}
