import {
  doc,
  getDoc,
  setDoc,
  collection,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import {
  Wallet,
  ActiveInvestment,
  Transaction,
  InvestmentPlan,
  AppRules,
  LiveInterfaceConfig,
  CompanyTreasury,
  TreasuryLog,
  BankAccountDetails,
  UserProfile,
  AdminMessage,
} from '../types';

export interface FirestoreDatabaseState {
  users: UserProfile[];
  wallets: Record<string, Wallet>;
  investments: ActiveInvestment[];
  transactions: Transaction[];
  plans: InvestmentPlan[];
  rules: AppRules | null;
  liveConfig: LiveInterfaceConfig | null;
  bankDetails: Record<string, BankAccountDetails>;
  treasury: CompanyTreasury | null;
  treasuryLogs: TreasuryLog[];
  messages: AdminMessage[];
  deletedUserIds: string[];
  lastUpdated: string;
}

// Memory cache of latest Firestore data for zero-latency lookups
let cachedFirestoreDb: FirestoreDatabaseState | null = null;
let activeFirestoreListenersCount = 0;
let unsubscribeFirestoreSnapshot: (() => void) | null = null;
const stateChangeListeners: Set<(state: FirestoreDatabaseState) => void> = new Set();

/**
 * Sanitizes and flattens data before writing to Firestore.
 * Strips undefined values and flattens unsupported nested arrays.
 */
export function cleanForFirestore<T>(input: T): any {
  if (input === null || input === undefined) return input;

  function sanitize(val: any): any {
    if (val === null || val === undefined) return null;
    if (Array.isArray(val)) {
      const flattened: any[] = [];
      for (const item of val) {
        if (Array.isArray(item)) {
          const subItems = sanitize(item);
          if (Array.isArray(subItems)) {
            flattened.push(...subItems);
          } else {
            flattened.push(subItems);
          }
        } else {
          flattened.push(sanitize(item));
        }
      }
      return flattened;
    }
    if (typeof val === 'object') {
      const obj: Record<string, any> = {};
      for (const [k, v] of Object.entries(val)) {
        if (v !== undefined) {
          obj[k] = sanitize(v);
        }
      }
      return obj;
    }
    return val;
  }

  return sanitize(JSON.parse(JSON.stringify(input)));
}

/**
 * Parses snapshot documents into structured state
 */
function parseSnapshotDocs(docs: any[]): FirestoreDatabaseState {
  const map: Record<string, any> = {};
  docs.forEach((d) => {
    map[d.id] = d.data()?.data;
  });

  const state: FirestoreDatabaseState = {
    users: Array.isArray(map['users']) ? map['users'].filter((u: any) => u && u.id) : [],
    wallets: (typeof map['wallets'] === 'object' && map['wallets']) ? map['wallets'] : {},
    investments: Array.isArray(map['investments']) ? map['investments'] : [],
    transactions: Array.isArray(map['transactions']) ? map['transactions'] : [],
    plans: Array.isArray(map['plans']) ? map['plans'] : [],
    rules: map['rules'] || null,
    liveConfig: map['liveConfig'] || null,
    bankDetails: (typeof map['bankDetails'] === 'object' && map['bankDetails']) ? map['bankDetails'] : {},
    treasury: map['treasury'] || null,
    treasuryLogs: Array.isArray(map['treasuryLogs']) ? map['treasuryLogs'] : [],
    messages: Array.isArray(map['messages']) ? map['messages'] : [],
    deletedUserIds: Array.isArray(map['deletedUserIds']) ? map['deletedUserIds'] : [],
    lastUpdated: (map['metadata'] && map['metadata'].lastUpdated) || new Date().toISOString(),
  };

  return state;
}

/**
 * Returns current in-memory cached state from Firestore
 */
export function getCachedFirestoreState(): FirestoreDatabaseState | null {
  return cachedFirestoreDb;
}

/**
 * Starts global real-time snapshot listener on Firestore collection 'gcap_database'
 */
export function initFirestoreRealtimeListener(): () => void {
  activeFirestoreListenersCount++;

  if (!unsubscribeFirestoreSnapshot) {
    try {
      const colRef = collection(db, 'gcap_database');
      unsubscribeFirestoreSnapshot = onSnapshot(
        colRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const parsed = parseSnapshotDocs(snapshot.docs);
            cachedFirestoreDb = parsed;

            // Notify all registered listeners
            stateChangeListeners.forEach((listener) => {
              try {
                listener(parsed);
              } catch (e) {
                console.error('[FirestoreBridge] Listener callback error:', e);
              }
            });

            // Dispatch global browser event for cross-component re-renders
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('firestore_state_updated', { detail: parsed }));
            }
          }
        },
        (error) => {
          console.warn('[FirestoreBridge] Realtime listener error:', error);
        }
      );
    } catch (err) {
      console.warn('[FirestoreBridge] Failed to initialize snapshot listener:', err);
    }
  }

  return () => {
    activeFirestoreListenersCount--;
    if (activeFirestoreListenersCount <= 0 && unsubscribeFirestoreSnapshot) {
      unsubscribeFirestoreSnapshot();
      unsubscribeFirestoreSnapshot = null;
    }
  };
}

/**
 * Subscribes a callback to Firestore real-time state changes
 */
export function subscribeToFirestoreState(
  callback: (state: FirestoreDatabaseState) => void
): () => void {
  stateChangeListeners.add(callback);
  const unsubListener = initFirestoreRealtimeListener();

  // If we already have cached data, trigger immediately
  if (cachedFirestoreDb) {
    try {
      callback(cachedFirestoreDb);
    } catch (e) {
      console.error('[FirestoreBridge] Initial callback error:', e);
    }
  }

  return () => {
    stateChangeListeners.delete(callback);
    unsubListener();
  };
}

/**
 * Direct fetch of all documents from Firestore 'gcap_database' collection
 */
export async function fetchFullFirestoreState(): Promise<FirestoreDatabaseState | null> {
  try {
    const docKeys = [
      'users',
      'wallets',
      'investments',
      'transactions',
      'plans',
      'rules',
      'liveConfig',
      'bankDetails',
      'treasury',
      'treasuryLogs',
      'messages',
      'deletedUserIds',
      'metadata',
    ];

    const promises = docKeys.map((key) => getDoc(doc(db, 'gcap_database', key)));
    const snaps = await Promise.all(promises);

    const docMap: Record<string, any> = {};
    docKeys.forEach((key, index) => {
      if (snaps[index].exists()) {
        docMap[key] = snaps[index].data()?.data;
      }
    });

    const state: FirestoreDatabaseState = {
      users: Array.isArray(docMap['users']) ? docMap['users'].filter((u: any) => u && u.id) : [],
      wallets: (typeof docMap['wallets'] === 'object' && docMap['wallets']) ? docMap['wallets'] : {},
      investments: Array.isArray(docMap['investments']) ? docMap['investments'] : [],
      transactions: Array.isArray(docMap['transactions']) ? docMap['transactions'] : [],
      plans: Array.isArray(docMap['plans']) ? docMap['plans'] : [],
      rules: docMap['rules'] || null,
      liveConfig: docMap['liveConfig'] || null,
      bankDetails: (typeof docMap['bankDetails'] === 'object' && docMap['bankDetails']) ? docMap['bankDetails'] : {},
      treasury: docMap['treasury'] || null,
      treasuryLogs: Array.isArray(docMap['treasuryLogs']) ? docMap['treasuryLogs'] : [],
      messages: Array.isArray(docMap['messages']) ? docMap['messages'] : [],
      deletedUserIds: Array.isArray(docMap['deletedUserIds']) ? docMap['deletedUserIds'] : [],
      lastUpdated: (docMap['metadata'] && docMap['metadata'].lastUpdated) || new Date().toISOString(),
    };

    cachedFirestoreDb = state;
    return state;
  } catch (err) {
    console.error('[FirestoreBridge] Error fetching full state:', err);
    return cachedFirestoreDb;
  }
}

/**
 * Direct Firestore save helpers
 */
export async function saveDocToFirestore(docId: string, data: any): Promise<boolean> {
  try {
    const ref = doc(db, 'gcap_database', docId);
    await setDoc(ref, { data: cleanForFirestore(data) });

    // Update metadata timestamp
    const metaRef = doc(db, 'gcap_database', 'metadata');
    await setDoc(metaRef, { lastUpdated: new Date().toISOString() }, { merge: true });

    // Update memory cache
    if (cachedFirestoreDb) {
      (cachedFirestoreDb as any)[docId] = data;
      cachedFirestoreDb.lastUpdated = new Date().toISOString();
    }
    return true;
  } catch (err) {
    console.error(`[FirestoreBridge] Error saving doc ${docId}:`, err);
    return false;
  }
}

export async function saveUsersToFirestore(users: UserProfile[]): Promise<boolean> {
  const filtered = users.filter((u) => u && u.id);
  return await saveDocToFirestore('users', filtered);
}

export async function saveWalletsToFirestore(wallets: Record<string, Wallet>): Promise<boolean> {
  return await saveDocToFirestore('wallets', wallets);
}

export async function saveInvestmentsToFirestore(investments: ActiveInvestment[]): Promise<boolean> {
  return await saveDocToFirestore('investments', investments);
}

export async function saveTransactionsToFirestore(transactions: Transaction[]): Promise<boolean> {
  return await saveDocToFirestore('transactions', transactions);
}

export async function savePlansToFirestore(plans: InvestmentPlan[]): Promise<boolean> {
  return await saveDocToFirestore('plans', plans);
}

export async function saveRulesToFirestore(rules: AppRules): Promise<boolean> {
  return await saveDocToFirestore('rules', rules);
}

export async function saveLiveConfigToFirestore(liveConfig: LiveInterfaceConfig): Promise<boolean> {
  return await saveDocToFirestore('liveConfig', liveConfig);
}

export async function saveTreasuryToFirestore(
  treasury: CompanyTreasury,
  logs?: TreasuryLog[]
): Promise<boolean> {
  const s1 = await saveDocToFirestore('treasury', treasury);
  if (logs) {
    await saveDocToFirestore('treasuryLogs', logs);
  }
  return s1;
}

export async function saveBankDetailsToFirestore(
  bankDetails: Record<string, BankAccountDetails>
): Promise<boolean> {
  return await saveDocToFirestore('bankDetails', bankDetails);
}

export async function saveMessagesToFirestore(messages: AdminMessage[]): Promise<boolean> {
  return await saveDocToFirestore('messages', messages);
}

export async function saveDeletedUserIdsToFirestore(deletedIds: string[]): Promise<boolean> {
  return await saveDocToFirestore('deletedUserIds', deletedIds);
}
