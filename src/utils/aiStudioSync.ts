// AI Studio & GitHub Live Auto-Sync Engine
// Ensures: "Kuch bhi update ya change karne per admin ya GitHub me kuch bhi new ho wo sub kuch
// kisi dusre ke mobile me jo pahle se app install ho open hote hi sara change leker hi khule"
//
// Detects any updates deployed from GitHub or Google AI Studio and automatically updates the app
// on any user's installed mobile PWA or browser immediately upon launch without requiring reinstallation.

import { subscribeToRealtimeEvents } from './realtimeSync';

export interface BuildVersionInfo {
  buildId: string;
  buildTime: string;
  appVersion: string;
  source: string;
  message?: string;
  autoReloadEnabled?: boolean;
  lastDbUpdate?: string;
  serverTime?: number;
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

export const APP_VERSION = '2.5.3';

type UpdateCallback = (info: BuildVersionInfo) => void;
const updateListeners: Set<UpdateCallback> = new Set();

let isChecking = false;
let updateAvailable: BuildVersionInfo | null = null;
let isUpdatingNow = false;

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
 * Flushes all outdated service worker caches and performs a clean reload
 * preserving all user localStorage (wallet, session, tokens, settings).
 */
export async function applyAiStudioUpdateNow(targetBuildId?: string): Promise<void> {
  if (isUpdatingNow) return;
  isUpdatingNow = true;

  try {
    const buildIdToRecord = targetBuildId || updateAvailable?.buildId || Date.now().toString();

    // 1. Clear caches if Service Worker Cache Storage exists
    if ('caches' in window) {
      try {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map((key) => caches.delete(key)));
      } catch (e) {
        console.warn('[AutoSync] Cache clearing error:', e);
      }
    }

    // 2. Trigger Service Worker skipWaiting & update if active
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
        console.warn('[AutoSync] Service worker update error:', e);
      }
    }

    // 3. Save build acknowledgment in localStorage & sessionStorage
    localStorage.setItem('gcap_installed_build_id', buildIdToRecord);
    sessionStorage.setItem('gcap_last_auto_reload_build', buildIdToRecord);

    // 4. Force clean page reload bypassing all browser and proxy cache
    const cleanUrl = window.location.origin + window.location.pathname + `?_v=${encodeURIComponent(buildIdToRecord)}`;
    window.location.replace(cleanUrl);
  } catch {
    window.location.reload();
  }
}

/**
 * Checks the server /version.json to see if a new build from GitHub or AI Studio exists.
 * If autoApply=true and a new build is detected, it auto-applies immediately.
 */
export async function checkForAiStudioUpdate(autoApplyOnDetect: boolean = false): Promise<{
  hasUpdate: boolean;
  remoteInfo?: BuildVersionInfo;
  error?: string;
}> {
  if (isChecking || isUpdatingNow) return { hasUpdate: false };
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

    // Compare server build ID against the running JavaScript bundle's compile-time ID
    const isDifferentFromCurrent = remoteInfo.buildId && remoteInfo.buildId !== CURRENT_BUILD_ID;

    if (isDifferentFromCurrent) {
      updateAvailable = remoteInfo;
      updateListeners.forEach((fn) => fn(remoteInfo));

      // Check if we already reloaded for this build in this browser session to prevent infinite loop
      const lastSessionReload = sessionStorage.getItem('gcap_last_auto_reload_build');
      if (autoApplyOnDetect && lastSessionReload !== remoteInfo.buildId) {
        console.log(`[AutoSync] New GitHub/AI Studio build detected: ${remoteInfo.buildId}. Auto-applying now...`);
        await applyAiStudioUpdateNow(remoteInfo.buildId);
      }

      return { hasUpdate: true, remoteInfo };
    }

    // Matches current build, clear any pending update
    updateAvailable = null;
    return { hasUpdate: false, remoteInfo };
  } catch (err: unknown) {
    isChecking = false;
    const msg = err instanceof Error ? err.message : String(err);
    return { hasUpdate: false, error: msg };
  }
}

/**
 * CRITICAL: Immediate Auto-Update on App Launch
 * Runs at 0ms when any installed mobile opens the app.
 * If GitHub/AI Studio deployed new code, updates and reloads right away!
 */
export async function checkAndAutoApplyOnLaunch(): Promise<void> {
  try {
    // Only run in browser environment
    if (typeof window === 'undefined') return;

    // Immediately query server
    await checkForAiStudioUpdate(true);
  } catch (e) {
    console.warn('[AutoSync] Launch check error:', e);
  }
}

/**
 * Initializes continuous background polling and real-time triggers for AI Studio updates
 */
export function initAiStudioLiveSync(): () => void {
  // 1. Check immediately on app boot with auto-apply
  checkAndAutoApplyOnLaunch();

  // 2. Heartbeat check every 10 seconds
  const interval = setInterval(() => {
    checkForAiStudioUpdate(false);
  }, 10000);

  // 3. Whenever user opens/resumes the app on their mobile (visibilitychange)
  const onVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      // User just brought mobile app back to foreground - check and auto-apply!
      checkForAiStudioUpdate(true);
    }
  };
  document.addEventListener('visibilitychange', onVisibilityChange);

  // 4. Window focus check
  const onFocus = () => {
    checkForAiStudioUpdate(false);
  };
  window.addEventListener('focus', onFocus);

  // 5. SSE Real-Time Sync: Listen for SYSTEM_FORCE_UPDATE from Admin or Server
  const unsubscribeSse = subscribeToRealtimeEvents((event) => {
    if (event.type === 'SYSTEM_FORCE_UPDATE' || event.type === 'STATE_CHANGED') {
      console.log('[AutoSync] SSE System Update event received, verifying build...');
      checkForAiStudioUpdate(true);
    }
  });

  // 6. Broadcast channel for multi-tab sync or admin force-refresh
  let bc: BroadcastChannel | null = null;
  if ('BroadcastChannel' in window) {
    try {
      bc = new BroadcastChannel('aistudio_live_sync');
      bc.onmessage = (event) => {
        if (event.data?.type === 'FORCE_REFRESH_BROADCAST') {
          applyAiStudioUpdateNow(event.data?.buildId);
        } else if (event.data?.type === 'CHECK_BUILD') {
          checkForAiStudioUpdate(true);
        }
      };
    } catch {
      // ignore BroadcastChannel errors in restricted contexts
    }
  }

  return () => {
    clearInterval(interval);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    window.removeEventListener('focus', onFocus);
    unsubscribeSse();
    if (bc) {
      bc.close();
    }
  };
}

/**
 * Broadcasts a force-refresh command to all clients, tabs, and calls server endpoint
 */
export async function broadcastAiStudioForceUpdate(): Promise<void> {
  const newTimestamp = Date.now().toString();

  // 1. Post to BroadcastChannel
  if ('BroadcastChannel' in window) {
    try {
      const bc = new BroadcastChannel('aistudio_live_sync');
      bc.postMessage({ type: 'FORCE_REFRESH_BROADCAST', buildId: newTimestamp, timestamp: Date.now() });
      bc.close();
    } catch {
      // ignore
    }
  }

  // 2. Trigger local storage event for cross-tab notification
  localStorage.setItem('gcap_force_update_trigger', newTimestamp);

  // 3. Notify backend server to broadcast via SSE worldwide to all installed devices
  try {
    await fetch('/api/admin/force-refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.warn('[AutoSync] Server force-refresh broadcast error:', err);
  }
}
