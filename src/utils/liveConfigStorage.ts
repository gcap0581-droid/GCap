import { LiveInterfaceConfig, OtaEventPayload, OtaUpdateType, ThemeAccent } from '../types';
import { apiSaveLiveConfig } from './centralSync';

const LIVE_CONFIG_STORAGE_KEY = 'gcap_live_interface_config_v1';
const OTA_HISTORY_STORAGE_KEY = 'gcap_ota_history_v1';
const OTA_CHANNEL_NAME = 'gcap_live_ota_channel';

export const DEFAULT_LIVE_CONFIG: LiveInterfaceConfig = {
  appVersion: 'v2.5.0-OTA',
  lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 16),
  themeAccent: 'emerald',
  bannerEnabled: true,
  bannerText: '🚀 Live Update: Short Term (641D) & Long Term (365D + Royalty) plans are active with guaranteed principal security.',
  bannerTextHi: '🚀 लाइव अपडेट: शॉर्ट टर्म (641D) एवं लॉन्ग टर्म (365D + रॉयल्टी) प्लान्स 100% मूलधन सुरक्षा के साथ सक्रिय हैं।',
  bannerType: 'success',
  heroHeadline: 'Smart Daily Returns & Automated Growth',
  heroHeadlineHi: 'स्मार्ट दैनिक रिटर्न एवं स्वचालित पूंजी वृद्धि',
  heroSubtext: 'Invest with confidence. 100% principal protection, daily interest credits, and instant UPI withdrawals.',
  heroSubtextHi: 'सुरक्षित एवं प्रमाणित निवेश। 100% मूलधन सुरक्षा, प्रतिदिन स्वचालित ब्याज और त्वरित UPI निकासी।',
  maintenanceMode: false,
  maintenanceMessage: 'System routine maintenance in progress. Active investments and payouts continue as normal.',
  maintenanceMessageHi: 'सिस्टम रूटीन मेंटेनेंस प्रगति पर है। आपके सक्रिय निवेश और दैनिक रिटर्न यथावत जारी हैं।',
  liveBadgeText: '⚡ Live OTA Connected',
  liveBadgeTextHi: '⚡ लाइव OTA कनेक्टेड',
  autoSyncIntervalSec: 15,
};

export function getStoredLiveConfig(): LiveInterfaceConfig {
  try {
    const raw = localStorage.getItem(LIVE_CONFIG_STORAGE_KEY);
    if (!raw) {
      saveStoredLiveConfig(DEFAULT_LIVE_CONFIG);
      return DEFAULT_LIVE_CONFIG;
    }
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_LIVE_CONFIG, ...parsed };
  } catch (err) {
    console.error('Failed to parse live config:', err);
    return DEFAULT_LIVE_CONFIG;
  }
}

export function saveStoredLiveConfig(config: LiveInterfaceConfig): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LIVE_CONFIG_STORAGE_KEY, JSON.stringify(config));
    }
    apiSaveLiveConfig(config).catch((err) => console.warn('Background apiSaveLiveConfig error:', err));
  } catch (err) {
    console.error('Failed to save live config:', err);
  }
}

export function resetLiveConfigToDefault(): LiveInterfaceConfig {
  saveStoredLiveConfig(DEFAULT_LIVE_CONFIG);
  return DEFAULT_LIVE_CONFIG;
}

export function getOtaHistory(): OtaEventPayload[] {
  try {
    const raw = localStorage.getItem(OTA_HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function recordOtaHistory(event: OtaEventPayload): void {
  try {
    const history = getOtaHistory();
    const updated = [event, ...history.slice(0, 49)]; // keep latest 50
    localStorage.setItem(OTA_HISTORY_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save OTA history:', err);
  }
}

// Global In-Memory Listeners
const listeners = new Set<(event: OtaEventPayload) => void>();

// Browser Broadcast Channel (Safe with fallback)
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(OTA_CHANNEL_NAME);
    broadcastChannel.onmessage = (e) => {
      if (e.data && e.data.type) {
        listeners.forEach((fn) => fn(e.data));
      }
    };
  }
} catch (err) {
  console.warn('BroadcastChannel not supported or restricted:', err);
}

// Window Storage Event Listener (Fallback across tabs/windows)
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'gcap_ota_trigger_event' && e.newValue) {
      try {
        const payload: OtaEventPayload = JSON.parse(e.newValue);
        listeners.forEach((fn) => fn(payload));
      } catch (err) {
        console.error('Failed to parse storage OTA event:', err);
      }
    }
  });
}

/**
 * Broadcast an OTA Update event immediately to all active screens/listeners
 * without requiring the user to refresh, reinstall, or clear data.
 */
export function broadcastOtaUpdate(
  type: OtaUpdateType,
  title: string,
  titleHi: string,
  description: string,
  descriptionHi: string,
  updatedBy = 'Admin'
): OtaEventPayload {
  const config = getStoredLiveConfig();
  const event: OtaEventPayload = {
    id: `ota_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    type,
    title,
    titleHi,
    description,
    descriptionHi,
    timestamp: Date.now(),
    version: config.appVersion,
    updatedBy,
  };

  // Record history
  recordOtaHistory(event);

  // Dispatch to local in-memory listeners
  listeners.forEach((fn) => {
    try {
      fn(event);
    } catch (err) {
      console.error('Error executing OTA subscriber:', err);
    }
  });

  // Dispatch via BroadcastChannel
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage(event);
    } catch (err) {
      console.warn('BroadcastChannel postMessage failed:', err);
    }
  }

  // Dispatch via storage event for multi-tab/subframe sync
  try {
    localStorage.setItem('gcap_ota_trigger_event', JSON.stringify(event));
  } catch (err) {
    console.warn('Storage event trigger failed:', err);
  }

  return event;
}

/**
 * Subscribe to real-time OTA updates in any component.
 * Returns unsubscribe function.
 */
export function subscribeToOtaUpdates(callback: (event: OtaEventPayload) => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}
