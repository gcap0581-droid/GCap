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
import { apiFetch } from './apiConfig';

export interface CentralStateResponse {
  success: boolean;
  users?: UserProfile[];
  transactions: Transaction[];
  investments: ActiveInvestment[];
  wallet?: Wallet;
  wallets?: Record<string, Wallet>;
  plans?: InvestmentPlan[];
  rules?: AppRules;
  liveConfig?: LiveInterfaceConfig;
  treasury?: CompanyTreasury;
  treasuryLogs?: TreasuryLog[];
  bankDetails?: BankAccountDetails | null;
  messages?: AdminMessage[];
  lastUpdated: string;
  serverTime?: number;
}

const API_BASE = '/api';

/**
 * Fetch the latest real-time central database state.
 * If user is ADMIN, receives global platform state (all txns, all investments, all users, treasury).
 * If user is regular USER, receives user's transactions, investments, wallet, bank details, plus active plans & rules.
 */
export async function fetchCentralState(
  userId?: string,
  role: 'ADMIN' | 'USER' = 'USER'
): Promise<CentralStateResponse | null> {
  try {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    params.append('role', role);
    params.append('t', Date.now().toString());

    const res = await apiFetch(`${API_BASE}/central/state?${params.toString()}`, {
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
    });

    if (!res.ok) return null;
    const data: CentralStateResponse = await res.json();
    return data;
  } catch (err) {
    console.warn('[CentralSync] Failed to fetch state:', err);
    return null;
  }
}

/**
 * Post a new transaction (Deposit / Withdrawal / Investment) to central database
 */
export async function apiCreateTransaction(
  transaction: Transaction,
  userId: string
): Promise<{ success: boolean; transaction?: Transaction; wallet?: Wallet; error?: string }> {
  try {
    const res = await apiFetch(`${API_BASE}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transaction, userId }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

/**
 * Admin updates transaction status (e.g. APPROVE / REJECT deposit or withdrawal)
 */
export async function apiUpdateTransaction(
  transaction: Transaction,
  adminId?: string
): Promise<{
  success: boolean;
  transaction?: Transaction;
  wallet?: Wallet;
  treasury?: CompanyTreasury;
  error?: string;
}> {
  try {
    const res = await apiFetch(`${API_BASE}/transactions/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transaction, adminId }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

/**
 * Admin adds a manual transaction
 */
export async function apiAddTransaction(
  transaction: Transaction
): Promise<{ success: boolean; transaction?: Transaction; error?: string }> {
  try {
    const res = await apiFetch(`${API_BASE}/transactions/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transaction }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

/**
 * Admin deletes a transaction
 */
export async function apiDeleteTransaction(
  transactionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await apiFetch(`${API_BASE}/transactions/${transactionId}`, {
      method: 'DELETE',
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

/**
 * User subscribes / creates a new ActiveInvestment
 */
export async function apiCreateInvestment(
  investment: ActiveInvestment,
  userId: string
): Promise<{ success: boolean; investment?: ActiveInvestment; wallet?: Wallet; error?: string }> {
  try {
    const res = await apiFetch(`${API_BASE}/investments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ investment, userId }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

/**
 * Updates an existing investment (earnings collection, cycle advance, renewal, completion)
 */
export async function apiUpdateInvestment(
  investment: ActiveInvestment,
  walletUpdatesOrUserId?: Partial<Wallet> | string,
  userId?: string
): Promise<{ success: boolean; investment?: ActiveInvestment; wallet?: Wallet; error?: string }> {
  let resolvedWalletUpdates: Partial<Wallet> | undefined;
  let resolvedUserId: string | undefined = userId;

  if (typeof walletUpdatesOrUserId === 'string') {
    resolvedUserId = walletUpdatesOrUserId;
  } else if (walletUpdatesOrUserId && typeof walletUpdatesOrUserId === 'object') {
    resolvedWalletUpdates = walletUpdatesOrUserId;
  }

  try {
    const res = await apiFetch(`${API_BASE}/investments/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ investment, walletUpdates: resolvedWalletUpdates, userId: resolvedUserId }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

/**
 * Admin saves updated investment plans to central database
 */
export async function apiSavePlans(
  plans: InvestmentPlan[]
): Promise<{ success: boolean; plans?: InvestmentPlan[]; error?: string }> {
  try {
    const res = await apiFetch(`${API_BASE}/plans/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plans }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

/**
 * Admin saves updated platform rules to central database
 */
export async function apiSaveRules(
  rules: AppRules
): Promise<{ success: boolean; rules?: AppRules; error?: string }> {
  try {
    const res = await apiFetch(`${API_BASE}/rules/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rules }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

/**
 * Admin saves live interface config (announcements, QR, UPI, etc.)
 */
export async function apiSaveLiveConfig(
  liveConfig: LiveInterfaceConfig
): Promise<{ success: boolean; liveConfig?: LiveInterfaceConfig; error?: string }> {
  try {
    const res = await apiFetch(`${API_BASE}/live-config/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ liveConfig }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

/**
 * Admin updates company treasury balance and logs
 */
export async function apiUpdateTreasury(
  treasury: CompanyTreasury,
  log?: TreasuryLog
): Promise<{ success: boolean; treasury?: CompanyTreasury; logs?: TreasuryLog[]; error?: string }> {
  try {
    const res = await apiFetch(`${API_BASE}/treasury/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ treasury, log }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

/**
 * User saves bank / UPI details
 */
export async function apiSaveBankDetails(
  userId: string,
  details: BankAccountDetails
): Promise<{ success: boolean; details?: BankAccountDetails; error?: string }> {
  try {
    const res = await apiFetch(`${API_BASE}/bank-details`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, details }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

/**
 * Admin adjusts a user's wallet (Add amount, Deduct amount, or Direct balance set)
 */
export async function apiAdminAdjustUserWallet(
  userId: string,
  wallet: Partial<Wallet>,
  adjustment?: {
    type: 'ADD' | 'DEDUCT' | 'SET';
    targetWallet: 'cashBalance' | 'gpBalance' | 'totalEarned' | 'royaltyEarned';
    amount: number;
    reason?: string;
  },
  adminName?: string
): Promise<{ success: boolean; wallet?: Wallet; error?: string }> {
  if (!userId) {
    return { success: false, error: 'User ID is required' };
  }

  try {
    const res = await apiFetch(`${API_BASE}/admin/user-wallet/adjust`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, wallet, adjustment, adminName }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

/**
 * Updates wallet on server (supports either (userId, wallet) or (wallet, userId))
 */
export async function apiUpdateWallet(
  arg1: string | Wallet,
  arg2?: string | Wallet
): Promise<{ success: boolean; wallet?: Wallet; error?: string }> {
  const userId = typeof arg1 === 'string' ? arg1 : (typeof arg2 === 'string' ? arg2 : '');
  const wallet = (typeof arg1 === 'object' ? arg1 : (typeof arg2 === 'object' ? arg2 : undefined)) as Wallet | undefined;

  if (!userId || !wallet) {
    return { success: false, error: 'Invalid wallet or userId' };
  }

  try {
    const res = await apiFetch(`${API_BASE}/wallet/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, wallet }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

/**
 * Fetch messages from central database
 */
export async function apiFetchMessages(
  userId?: string,
  role: 'ADMIN' | 'USER' = 'USER'
): Promise<{ success: boolean; messages: AdminMessage[] }> {
  try {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    params.append('role', role);
    params.append('t', Date.now().toString());

    const res = await apiFetch(`${API_BASE}/messages?${params.toString()}`);
    if (!res.ok) return { success: false, messages: [] };
    const data = await res.json();
    return { success: true, messages: data.messages || [] };
  } catch (err) {
    console.warn('[CentralSync] Failed to fetch messages:', err);
    return { success: false, messages: [] };
  }
}

/**
 * Admin broadcasts a message
 */
export async function apiSendAdminMessage(
  message: Partial<AdminMessage>
): Promise<{ success: boolean; message?: AdminMessage; error?: string }> {
  try {
    const res = await apiFetch(`${API_BASE}/admin/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

/**
 * Mark a message as read by user
 */
export async function apiMarkMessageRead(
  messageId: string,
  userId: string
): Promise<{ success: boolean }> {
  try {
    const res = await apiFetch(`${API_BASE}/messages/${messageId}/read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    return await res.json();
  } catch (err) {
    return { success: false };
  }
}

/**
 * Dismiss a message popup for a user
 */
export async function apiDismissMessagePopup(
  messageId: string,
  userId: string
): Promise<{ success: boolean }> {
  try {
    const res = await apiFetch(`${API_BASE}/messages/${messageId}/dismiss`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    return await res.json();
  } catch (err) {
    return { success: false };
  }
}

export const apiDismissMessage = apiDismissMessagePopup;

/**
 * Admin deletes a message
 */
export async function apiDeleteAdminMessage(
  messageId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await apiFetch(`${API_BASE}/admin/messages/${messageId}`, {
      method: 'DELETE',
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}
