/**
 * Real-Time Cross-Device Synchronization Engine
 * Connects to Server-Sent Events (SSE) stream and BroadcastChannel
 * Ensures ANY user registration or ANY user activity anywhere in the world
 * is instantly reflected in the Admin Panel without manual refresh.
 */

import { UserProfile, Transaction, ActiveInvestment, Wallet, BankAccountDetails, AdminMessage } from '../types';

export type RealtimeEventType =
  | 'USER_REGISTERED'
  | 'USER_ADDED'
  | 'USER_UPDATED'
  | 'USER_DELETED'
  | 'TRANSACTION_CREATED'
  | 'TRANSACTION_UPDATED'
  | 'TRANSACTION_DELETED'
  | 'INVESTMENT_CREATED'
  | 'INVESTMENT_UPDATED'
  | 'WALLET_UPDATED'
  | 'BANK_DETAILS_UPDATED'
  | 'TREASURY_UPDATED'
  | 'PLANS_UPDATED'
  | 'RULES_UPDATED'
  | 'LIVE_CONFIG_UPDATED'
  | 'ADMIN_MESSAGE'
  | 'SYSTEM_FORCE_UPDATE'
  | 'STATE_CHANGED';

export interface RealtimeEventPayload {
  type: RealtimeEventType;
  user?: UserProfile;
  userId?: string;
  transaction?: Transaction;
  investment?: ActiveInvestment;
  wallet?: Wallet;
  details?: BankAccountDetails;
  adminMessage?: AdminMessage;
  timestamp: number;
  message?: string;
  buildId?: string;
}

type RealtimeListener = (event: RealtimeEventPayload) => void;

class RealtimeSyncManager {
  private static instance: RealtimeSyncManager;
  private listeners: Set<RealtimeListener> = new Set();
  private eventSource: EventSource | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private isConnected: boolean = false;
  private reconnectTimer: any = null;
  private lastEventTimestamp: number = Date.now();
  private audioContext: AudioContext | null = null;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.initBroadcastChannel();
      this.connectSSE();

      // Ensure AudioContext is primed on first interaction
      const primeAudio = () => {
        try {
          if (!this.audioContext && (window.AudioContext || (window as any).webkitAudioContext)) {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            this.audioContext = new AudioCtx();
          }
        } catch (_) {}
        window.removeEventListener('click', primeAudio);
        window.removeEventListener('touchstart', primeAudio);
      };
      window.addEventListener('click', primeAudio);
      window.addEventListener('touchstart', primeAudio);
    }
  }

  public static getInstance(): RealtimeSyncManager {
    if (!RealtimeSyncManager.instance) {
      RealtimeSyncManager.instance = new RealtimeSyncManager();
    }
    return RealtimeSyncManager.instance;
  }

  private initBroadcastChannel() {
    try {
      if ('BroadcastChannel' in window) {
        this.broadcastChannel = new BroadcastChannel('gcap_realtime_channel');
        this.broadcastChannel.onmessage = (msgEvent) => {
          if (msgEvent.data && msgEvent.data.type) {
            this.notifyListeners(msgEvent.data, false);
          }
        };
      }
    } catch (e) {
      console.warn('[RealtimeSync] BroadcastChannel not supported:', e);
    }
  }

  private connectSSE() {
    if (typeof window === 'undefined' || typeof EventSource === 'undefined') return;

    if (this.eventSource) {
      try {
        this.eventSource.close();
      } catch (_) {}
    }

    try {
      const streamUrl = `/api/realtime/stream?t=${Date.now()}`;
      this.eventSource = new EventSource(streamUrl);

      this.eventSource.onopen = () => {
        this.isConnected = true;
        this.lastEventTimestamp = Date.now();
      };

      const handleIncoming = (type: RealtimeEventType) => (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data || '{}');
          const payload: RealtimeEventPayload = {
            type,
            ...data,
            timestamp: data.timestamp || Date.now(),
          };
          this.notifyListeners(payload, true);
        } catch (parseErr) {
          console.warn('[RealtimeSync] Parse error for', type, parseErr);
        }
      };

      this.eventSource.addEventListener('user_registered', handleIncoming('USER_REGISTERED'));
      this.eventSource.addEventListener('user_added', handleIncoming('USER_ADDED'));
      this.eventSource.addEventListener('user_updated', handleIncoming('USER_UPDATED'));
      this.eventSource.addEventListener('user_deleted', handleIncoming('USER_DELETED'));
      this.eventSource.addEventListener('users_updated', handleIncoming('USER_UPDATED'));
      this.eventSource.addEventListener('transaction_created', handleIncoming('TRANSACTION_CREATED'));
      this.eventSource.addEventListener('transaction_updated', handleIncoming('TRANSACTION_UPDATED'));
      this.eventSource.addEventListener('transaction_deleted', handleIncoming('TRANSACTION_DELETED'));
      this.eventSource.addEventListener('investment_created', handleIncoming('INVESTMENT_CREATED'));
      this.eventSource.addEventListener('investment_updated', handleIncoming('INVESTMENT_UPDATED'));
      this.eventSource.addEventListener('wallet_updated', handleIncoming('WALLET_UPDATED'));
      this.eventSource.addEventListener('bank_details_updated', handleIncoming('BANK_DETAILS_UPDATED'));
      this.eventSource.addEventListener('treasury_updated', handleIncoming('TREASURY_UPDATED'));
      this.eventSource.addEventListener('plans_updated', handleIncoming('PLANS_UPDATED'));
      this.eventSource.addEventListener('rules_updated', handleIncoming('RULES_UPDATED'));
      this.eventSource.addEventListener('live_config_updated', handleIncoming('LIVE_CONFIG_UPDATED'));
      this.eventSource.addEventListener('admin_message', handleIncoming('ADMIN_MESSAGE'));
      this.eventSource.addEventListener('system_force_update', handleIncoming('SYSTEM_FORCE_UPDATE'));
      this.eventSource.addEventListener('state_changed', handleIncoming('STATE_CHANGED'));

      this.eventSource.onerror = () => {
        this.isConnected = false;
        if (this.eventSource) {
          try {
            this.eventSource.close();
          } catch (_) {}
          this.eventSource = null;
        }

        // Auto-reconnect after 2.5s
        if (!this.reconnectTimer) {
          this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.connectSSE();
          }, 2500);
        }
      };
    } catch (err) {
      console.warn('[RealtimeSync] SSE setup failed, falling back to polling:', err);
      this.isConnected = false;
    }
  }

  private notifyListeners(payload: RealtimeEventPayload, broadcastToChannel: boolean = true) {
    this.lastEventTimestamp = Date.now();

    // 1. Send to local memory subscribers
    this.listeners.forEach((listener) => {
      try {
        listener(payload);
      } catch (err) {
        console.error('[RealtimeSync] Error in listener:', err);
      }
    });

    // 2. Dispatch global window event for backward compatibility
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('gcap_realtime_event', { detail: payload }));
    }

    // 3. Broadcast to cross-tab channel
    if (broadcastToChannel && this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(payload);
      } catch (_) {}
    }
  }

  public subscribe(listener: RealtimeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public emitLocal(payload: RealtimeEventPayload) {
    this.notifyListeners(payload, true);
  }

  public getStatus(): { connected: boolean; lastEventTimestamp: number } {
    return {
      connected: this.isConnected,
      lastEventTimestamp: this.lastEventTimestamp,
    };
  }

  /**
   * Plays a pleasant two-tone audio chime for instant Admin awareness.
   */
  public playChime(type: 'success' | 'alert' | 'info' = 'success') {
    try {
      if (typeof window === 'undefined') return;
      if (!this.audioContext) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        this.audioContext = new AudioCtx();
      }

      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume().catch(() => {});
      }

      const now = this.audioContext.currentTime;
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.connect(gain);
      gain.connect(this.audioContext.destination);

      if (type === 'success') {
        // High pleasant chime (E5 -> G#5)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(659.25, now);
        osc.frequency.exponentialRampToValueAtTime(830.61, now + 0.12);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.46);
      } else if (type === 'alert') {
        // Warning chime (A4 -> C#5)
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(554.37, now + 0.1);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.51);
      } else {
        // Simple ding (G5)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(783.99, now);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.36);
      }
    } catch (_) {
      // Audio playback failed or blocked by policy
    }
  }
}

export const realtimeSync = RealtimeSyncManager.getInstance();

export function subscribeToRealtimeEvents(listener: RealtimeListener): () => void {
  return realtimeSync.subscribe(listener);
}

export function playRealtimeChime(type: 'success' | 'alert' | 'info' = 'success'): void {
  realtimeSync.playChime(type);
}
