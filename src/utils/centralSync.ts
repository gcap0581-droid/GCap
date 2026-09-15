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
  UserRole,
} from '../types';
import { apiFetch } from './apiConfig';
import {
  fetchFullFirestoreState,
  saveTransactionsToFirestore,
  saveInvestmentsToFirestore,
  saveWalletsToFirestore,
  savePlansToFirestore,
  saveRulesToFirestore,
  saveLiveConfigToFirestore,
  saveTreasuryToFirestore,
  saveBankDetailsToFirestore,
  saveMessagesToFirestore,
  updateFirestoreBridgeCache,
  FirestoreDatabaseState,
} from '../lib/firestoreBridge';

// Helper to resolve user from multiple identifiers and generate all alias keys
export function findUserAndAllAliases(userId: string, users: UserProfile[]): { user: UserProfile | null, aliases: string[] } {
  const cleanId = String(userId).trim();
  const cleanDigits = cleanId.replace(/[^0-9]/g, "");

  const user = (users || []).find(
    (u) =>
      u.id === cleanId ||
      (u.loginId && u.loginId.toLowerCase() === cleanId.toLowerCase()) ||
      (cleanDigits && u.phone && u.phone.replace(/[^0-9]/g, "") === cleanDigits)
  );

  const aliases = new Set<string>();
  if (cleanId) aliases.add(cleanId);
  if (user) {
    if (user.id) aliases.add(user.id);
    if (user.loginId) aliases.add(user.loginId);
    if (user.phone) {
      const cleanP = user.phone.replace(/[^0-9]/g, "");
      if (cleanP) aliases.add(cleanP);
      if (cleanP.length >= 10) aliases.add(cleanP.slice(-10));
    }
  }
  return { user: user || null, aliases: Array.from(aliases) };
}

// Helper to get a user's wallet with robust alias lookup
export function getWalletForUser(userId: string, wallets: Record<string, Wallet>, users: UserProfile[]): Wallet {
  const { aliases } = findUserAndAllAliases(userId, users);
  
  for (const alias of aliases) {
    if (wallets && wallets[alias]) {
      return { ...wallets[alias] };
    }
  }

  return {
    cashBalance: 0,
    gpBalance: 0,
    totalInvested: 0,
    totalEarned: 0,
    royaltyEarned: 0,
    pendingWithdrawals: 0,
    pendingDeposits: 0,
    totalWithdrawn: 0,
  };
}

// Helper to update a user's wallet across all aliases in the map
export function updateWalletForUserInMap(userId: string, wallets: Record<string, Wallet>, users: UserProfile[], updatedWallet: Wallet): Record<string, Wallet> {
  const { aliases } = findUserAndAllAliases(userId, users);
  const updated = { ...wallets };
  for (const alias of aliases) {
    if (alias) {
      updated[alias] = { ...updatedWallet };
    }
  }
  return updated;
}

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
  bankDetails?: BankAccountDetails | Record<string, BankAccountDetails> | null;
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
  role: UserRole = 'USER'
): Promise<CentralStateResponse | null> {
  // 1. Try Express Central API
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

    if (res.ok) {
      const data: CentralStateResponse = await res.json().catch(() => null);
      if (data && data.success) {
        if (data.users && Array.isArray(data.users)) {
          data.users = data.users.filter((u: any) => u && u.id);
        }

        // Sync to client-side FirestoreBridge cache
        if (role === 'ADMIN') {
          updateFirestoreBridgeCache({
            users: data.users || [],
            wallets: data.wallets || {},
            investments: data.investments || [],
            transactions: data.transactions || [],
            plans: data.plans || [],
            rules: data.rules || null,
            liveConfig: data.liveConfig || null,
            bankDetails: (data.bankDetails as Record<string, BankAccountDetails>) || {},
            treasury: data.treasury || null,
            treasuryLogs: data.treasuryLogs || [],
            messages: data.messages || [],
            lastUpdated: data.lastUpdated || new Date().toISOString(),
          });
        } else if (userId) {
          updateFirestoreBridgeCache({
            transactions: data.transactions || [],
            investments: data.investments || [],
            wallets: data.wallet ? { [userId]: data.wallet } : {},
            bankDetails: data.bankDetails ? { [userId]: data.bankDetails as BankAccountDetails } : {},
            plans: data.plans || [],
            rules: data.rules || null,
            liveConfig: data.liveConfig || null,
            messages: data.messages || [],
            lastUpdated: data.lastUpdated || new Date().toISOString(),
          });
        }

        return data;
      }
    }
  } catch (err) {
    console.warn('[CentralSync] API fetch failed, falling back to direct Firestore:', err);
  }

  // 2. Direct Firestore fallback (for Vercel or when Express server is unavailable)
  try {
    const fs = await fetchFullFirestoreState();
    if (!fs) return null;

    if (role === 'ADMIN') {
      return {
        success: true,
        users: (fs.users || []).filter((u: any) => u && u.id),
        transactions: fs.transactions || [],
        investments: fs.investments || [],
        wallets: fs.wallets || {},
        plans: fs.plans || [],
        rules: fs.rules || undefined,
        liveConfig: fs.liveConfig || undefined,
        treasury: fs.treasury || undefined,
        treasuryLogs: fs.treasuryLogs || [],
        bankDetails: fs.bankDetails || {},
        messages: fs.messages || [],
        lastUpdated: fs.lastUpdated,
        serverTime: Date.now(),
      };
    } else {
      const userTxns = (fs.transactions || []).filter(
        (t) => t.userId === userId || (t as any).userLoginId === userId
      );
      const userInvestments = (fs.investments || []).filter(
        (i) => i.userId === userId
      );
      const userWallet = userId ? getWalletForUser(userId, fs.wallets || {}, fs.users || []) : {
        cashBalance: 0,
        gpBalance: 0,
        totalInvested: 0,
        totalEarned: 0,
        royaltyEarned: 0,
        pendingWithdrawals: 0,
        pendingDeposits: 0,
        totalWithdrawn: 0,
      };
      const userBank = (userId && fs.bankDetails && fs.bankDetails[userId]) || null;
      const userMsgs = (fs.messages || []).filter(
        (m) => m.targetUserId === 'ALL' || m.targetUserId === userId
      );

      return {
        success: true,
        transactions: userTxns,
        investments: userInvestments,
        wallet: userWallet,
        plans: fs.plans || [],
        rules: fs.rules || undefined,
        liveConfig: fs.liveConfig || undefined,
        bankDetails: userBank,
        messages: userMsgs,
        lastUpdated: fs.lastUpdated,
        serverTime: Date.now(),
      };
    }
  } catch (fsErr) {
    console.error('[CentralSync] Firestore fallback failed:', fsErr);
  }

  return null;
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
    if (res.ok) {
      const result = await res.json().catch(() => null);
      if (result && result.success) return result;
    }
  } catch (err: any) {
    console.warn('[apiCreateTransaction] API fetch failed, using direct Firestore:', err);
  }

  // Direct Firestore write for Vercel
  try {
    const fs = await fetchFullFirestoreState();
    const currentTxns = fs?.transactions || [];
    const currentWallets = fs?.wallets || {};
    const userWallet: Wallet = getWalletForUser(userId, currentWallets, fs?.users || []);

    const newTxn: Transaction = {
      ...transaction,
      id: transaction.id || `txn-${Date.now()}`,
      userId,
      timestamp: transaction.timestamp || Date.now(),
      date: transaction.date || new Date().toISOString().split('T')[0],
    };

    if (newTxn.type === 'DEPOSIT') {
      userWallet.pendingDeposits = (userWallet.pendingDeposits || 0) + newTxn.amount;
    } else if (newTxn.type === 'WITHDRAWAL') {
      userWallet.pendingWithdrawals = (userWallet.pendingWithdrawals || 0) + newTxn.amount;
    }

    const updatedTxns = [newTxn, ...currentTxns.filter((t) => t.id !== newTxn.id)];
    const updatedWallets = updateWalletForUserInMap(userId, currentWallets, fs?.users || [], userWallet);

    await saveTransactionsToFirestore(updatedTxns);
    await saveWalletsToFirestore(updatedWallets);

    return { success: true, transaction: newTxn, wallet: userWallet };
  } catch (fsErr: any) {
    return { success: false, error: fsErr.message || 'Firestore write failed' };
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
    if (res.ok) {
      const result = await res.json().catch(() => null);
      if (result && result.success) return result;
    }
  } catch (err: any) {
    console.warn('[apiUpdateTransaction] API failed, using direct Firestore:', err);
  }

  // Direct Firestore fallback for Vercel
  try {
    const fs = await fetchFullFirestoreState();
    const currentTxns = fs?.transactions || [];
    const currentWallets = fs?.wallets || {};
    const currentTreasury: CompanyTreasury = fs?.treasury || {
      balance: 1000000,
      minAlertThreshold: 500000,
      totalInjected: 1000000,
      totalDeducted: 0,
      totalTransferredToUsers: 0,
      lastUpdated: new Date().toISOString(),
    };

    const targetUserId = transaction.userId || '';
    const userWallet: Wallet = targetUserId ? getWalletForUser(targetUserId, currentWallets, fs?.users || []) : {
      cashBalance: 0,
      gpBalance: 0,
      totalInvested: 0,
      totalEarned: 0,
      royaltyEarned: 0,
      pendingWithdrawals: 0,
      pendingDeposits: 0,
      totalWithdrawn: 0,
    };

    const isApproved = (transaction.status as string) === 'SUCCESS' || (transaction.status as string) === 'APPROVED';
    const isRejected = (transaction.status as string) === 'REJECTED' || (transaction.status as string) === 'FAILED';

    if (transaction.type === 'DEPOSIT' && isApproved) {
      userWallet.cashBalance += transaction.amount;
      userWallet.pendingDeposits = Math.max(0, (userWallet.pendingDeposits || 0) - transaction.amount);
      currentTreasury.balance += transaction.amount;
      currentTreasury.totalInjected = (currentTreasury.totalInjected || 0) + transaction.amount;
    } else if (transaction.type === 'DEPOSIT' && isRejected) {
      userWallet.pendingDeposits = Math.max(0, (userWallet.pendingDeposits || 0) - transaction.amount);
    } else if (transaction.type === 'WITHDRAWAL' && isApproved) {
      userWallet.pendingWithdrawals = Math.max(0, (userWallet.pendingWithdrawals || 0) - transaction.amount);
      userWallet.totalWithdrawn = (userWallet.totalWithdrawn || 0) + transaction.amount;
      currentTreasury.balance = Math.max(0, currentTreasury.balance - transaction.amount);
      currentTreasury.totalTransferredToUsers = (currentTreasury.totalTransferredToUsers || 0) + transaction.amount;
    } else if (transaction.type === 'WITHDRAWAL' && isRejected) {
      userWallet.pendingWithdrawals = Math.max(0, (userWallet.pendingWithdrawals || 0) - transaction.amount);
      if (transaction.withdrawalSource === 'ROYALTY') {
        userWallet.royaltyEarned += transaction.amount;
      } else {
        userWallet.totalEarned += transaction.amount;
      }
    }

    const updatedTxns = currentTxns.map((t) => (t.id === transaction.id ? { ...t, ...transaction } : t));
    if (targetUserId) {
      const updatedWallets = updateWalletForUserInMap(targetUserId, currentWallets, fs?.users || [], userWallet);
      await saveWalletsToFirestore(updatedWallets);
    }
    await saveTransactionsToFirestore(updatedTxns);
    await saveTreasuryToFirestore(currentTreasury);

    return { success: true, transaction, wallet: userWallet, treasury: currentTreasury };
  } catch (fsErr: any) {
    return { success: false, error: fsErr.message || 'Firestore write failed' };
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
    if (res.ok) {
      const result = await res.json().catch(() => null);
      if (result && result.success) return result;
    }
  } catch (err: any) {
    console.warn('[apiAddTransaction] API failed, using direct Firestore:', err);
  }

  try {
    const fs = await fetchFullFirestoreState();
    const currentTxns = fs?.transactions || [];
    const updated = [transaction, ...currentTxns.filter((t) => t.id !== transaction.id)];
    await saveTransactionsToFirestore(updated);
    return { success: true, transaction };
  } catch (fsErr: any) {
    return { success: false, error: fsErr.message };
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
    if (res.ok) {
      const result = await res.json().catch(() => null);
      if (result && result.success) return result;
    }
  } catch (err: any) {
    console.warn('[apiDeleteTransaction] API failed, using direct Firestore:', err);
  }

  try {
    const fs = await fetchFullFirestoreState();
    const currentTxns = fs?.transactions || [];
    const updated = currentTxns.filter((t) => t.id !== transactionId);
    await saveTransactionsToFirestore(updated);
    return { success: true };
  } catch (fsErr: any) {
    return { success: false, error: fsErr.message };
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
    if (res.ok) {
      const result = await res.json().catch(() => null);
      if (result && result.success) return result;
    }
  } catch (err: any) {
    console.warn('[apiCreateInvestment] API failed, using direct Firestore:', err);
  }

  try {
    const fs = await fetchFullFirestoreState();
    const currentInvestments = fs?.investments || [];
    const currentWallets = fs?.wallets || {};
    const userWallet = getWalletForUser(userId, currentWallets, fs?.users || []);

    userWallet.gpBalance = Math.max(0, (userWallet.gpBalance || 0) - investment.investedAmount);
    userWallet.totalInvested = (userWallet.totalInvested || 0) + investment.investedAmount;

    const updatedWallets = updateWalletForUserInMap(userId, currentWallets, fs?.users || [], userWallet);
    const updatedInvestments = [investment, ...currentInvestments.filter((i) => i.id !== investment.id)];

    await saveInvestmentsToFirestore(updatedInvestments);
    await saveWalletsToFirestore(updatedWallets);

    return { success: true, investment, wallet: userWallet };
  } catch (fsErr: any) {
    return { success: false, error: fsErr.message };
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
    if (res.ok) {
      const result = await res.json().catch(() => null);
      if (result && result.success) return result;
    }
  } catch (err: any) {
    console.warn('[apiUpdateInvestment] API failed, using direct Firestore:', err);
  }

  try {
    const fs = await fetchFullFirestoreState();
    const currentInvestments = fs?.investments || [];
    const updatedInvestments = currentInvestments.map((i) => (i.id === investment.id ? { ...i, ...investment } : i));
    await saveInvestmentsToFirestore(updatedInvestments);

    let updatedWallet: Wallet | undefined;
    if (resolvedUserId && resolvedWalletUpdates && fs?.wallets) {
      const currentWallets = fs.wallets;
      const cur = getWalletForUser(resolvedUserId, currentWallets, fs?.users || []);
      updatedWallet = { ...cur, ...resolvedWalletUpdates };
      const updatedWallets = updateWalletForUserInMap(resolvedUserId, currentWallets, fs?.users || [], updatedWallet);
      await saveWalletsToFirestore(updatedWallets);
    }

    return { success: true, investment, wallet: updatedWallet };
  } catch (fsErr: any) {
    return { success: false, error: fsErr.message };
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
    if (res.ok) {
      const result = await res.json().catch(() => null);
      if (result && result.success) return result;
    }
  } catch (err: any) {
    console.warn('[apiSavePlans] API failed, using direct Firestore:', err);
  }

  try {
    await savePlansToFirestore(plans);
    return { success: true, plans };
  } catch (fsErr: any) {
    return { success: false, error: fsErr.message };
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
    if (res.ok) {
      const result = await res.json().catch(() => null);
      if (result && result.success) return result;
    }
  } catch (err: any) {
    console.warn('[apiSaveRules] API failed, using direct Firestore:', err);
  }

  try {
    await saveRulesToFirestore(rules);
    return { success: true, rules };
  } catch (fsErr: any) {
    return { success: false, error: fsErr.message };
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
    if (res.ok) {
      const result = await res.json().catch(() => null);
      if (result && result.success) return result;
    }
  } catch (err: any) {
    console.warn('[apiSaveLiveConfig] API failed, using direct Firestore:', err);
  }

  try {
    await saveLiveConfigToFirestore(liveConfig);
    return { success: true, liveConfig };
  } catch (fsErr: any) {
    return { success: false, error: fsErr.message };
  }
}

/**
 * Admin updates company treasury balance and logs
 */
export async function apiUpdateTreasury(
  treasury: CompanyTreasury,
  log?: TreasuryLog | TreasuryLog[]
): Promise<{ success: boolean; treasury?: CompanyTreasury; logs?: TreasuryLog[]; error?: string }> {
  try {
    const res = await apiFetch(`${API_BASE}/treasury/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ treasury, log }),
    });
    if (res.ok) {
      const result = await res.json().catch(() => null);
      if (result && result.success) return result;
    }
  } catch (err: any) {
    console.warn('[apiUpdateTreasury] API failed, using direct Firestore:', err);
  }

  try {
    const logsArray = log ? (Array.isArray(log) ? log : [log]) : undefined;
    await saveTreasuryToFirestore(treasury, logsArray);
    return { success: true, treasury, logs: logsArray };
  } catch (fsErr: any) {
    return { success: false, error: fsErr.message };
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
    if (res.ok) {
      const result = await res.json().catch(() => null);
      if (result && result.success) return result;
    }
  } catch (err: any) {
    console.warn('[apiSaveBankDetails] API failed, using direct Firestore:', err);
  }

  try {
    const fs = await fetchFullFirestoreState();
    const currentBank = fs?.bankDetails || {};
    currentBank[userId] = details;
    await saveBankDetailsToFirestore(currentBank);
    return { success: true, details };
  } catch (fsErr: any) {
    return { success: false, error: fsErr.message };
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
    if (res.ok) {
      const result = await res.json().catch(() => null);
      if (result && result.success) {
        if (result.wallet) {
          updateFirestoreBridgeCache({
            wallets: {
              [userId]: result.wallet
            }
          });
        }
        return result;
      }
    }
  } catch (err: any) {
    console.warn('[apiAdminAdjustUserWallet] API failed, using direct Firestore:', err);
  }

  try {
    const fs = await fetchFullFirestoreState();
    const currentWallets = fs?.wallets || {};
    const existing = getWalletForUser(userId, currentWallets, fs?.users || []);

    const finalWallet: Wallet = { ...existing, ...wallet };
    
    // Apply adjustment directly to finalWallet if present
    if (adjustment && typeof adjustment.amount === 'number' && adjustment.amount !== 0) {
      const amount = Number(adjustment.amount);
      const adjType = adjustment.type || 'ADD';
      const targetWallet = adjustment.targetWallet || 'cashBalance';
      const currentVal = finalWallet[targetWallet] || 0;
      
      let calculatedVal = currentVal;
      if (adjType === 'ADD') {
        calculatedVal = currentVal + amount;
      } else if (adjType === 'DEDUCT') {
        calculatedVal = currentVal - amount;
      } else if (adjType === 'SET') {
        calculatedVal = amount;
      }
      finalWallet[targetWallet] = calculatedVal;
    }

    const updatedWallets = updateWalletForUserInMap(userId, currentWallets, fs?.users || [], finalWallet);
    await saveWalletsToFirestore(updatedWallets);

    return { success: true, wallet: finalWallet };
  } catch (fsErr: any) {
    return { success: false, error: fsErr.message };
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
    if (res.ok) {
      const result = await res.json().catch(() => null);
      if (result && result.success) {
        if (result.wallet) {
          updateFirestoreBridgeCache({
            wallets: {
              [userId]: result.wallet
            }
          });
        }
        return result;
      }
    }
  } catch (err: any) {
    console.warn('[apiUpdateWallet] API failed, using direct Firestore:', err);
  }

  try {
    const fs = await fetchFullFirestoreState();
    const currentWallets = fs?.wallets || {};
    const updatedWallets = updateWalletForUserInMap(userId, currentWallets, fs?.users || [], wallet);
    await saveWalletsToFirestore(updatedWallets);
    return { success: true, wallet };
  } catch (fsErr: any) {
    return { success: false, error: fsErr.message };
  }
}

/**
 * Fetch messages from central database
 */
export async function apiFetchMessages(
  userId?: string,
  role: UserRole = 'USER'
): Promise<{ success: boolean; messages: AdminMessage[] }> {
  try {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    params.append('role', role);
    params.append('t', Date.now().toString());

    const res = await apiFetch(`${API_BASE}/messages?${params.toString()}`);
    if (res.ok) {
      const data = await res.json().catch(() => null);
      if (data && data.messages) return { success: true, messages: data.messages };
    }
  } catch (err) {
    console.warn('[apiFetchMessages] API failed, using direct Firestore:', err);
  }

  try {
    const fs = await fetchFullFirestoreState();
    const allMsgs = fs?.messages || [];
    if (role === 'ADMIN') {
      return { success: true, messages: allMsgs };
    } else {
      const filtered = allMsgs.filter((m) => m.targetUserId === 'ALL' || m.targetUserId === userId);
      return { success: true, messages: filtered };
    }
  } catch {
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
    if (res.ok) {
      const result = await res.json().catch(() => null);
      if (result && result.success) return result;
    }
  } catch (err: any) {
    console.warn('[apiSendAdminMessage] API failed, using direct Firestore:', err);
  }

  try {
    const fs = await fetchFullFirestoreState();
    const currentMsgs = fs?.messages || [];
    const newMsg: AdminMessage = {
      id: message.id || `msg-${Date.now()}`,
      title: message.title || '',
      titleHi: message.titleHi || '',
      content: message.content || '',
      contentHi: message.contentHi || '',
      type: message.type || 'INFO',
      senderName: message.senderName || 'GCap Security & Risk Management',
      targetType: message.targetType || 'ALL',
      targetUserId: message.targetUserId || 'ALL',
      priority: message.priority || 'NORMAL',
      category: message.category || 'ANNOUNCEMENT',
      showPopup: !!(message.showPopup || message.showAsPopup),
      showAsPopup: !!(message.showPopup || message.showAsPopup),
      createdAt: message.createdAt || new Date().toISOString(),
      timestamp: message.timestamp || Date.now(),
      expiresAt: message.expiresAt,
      readByUserIds: message.readByUserIds || [],
      dismissedByUserIds: message.dismissedByUserIds || [],
      actionLabel: message.actionLabel,
      actionUrl: message.actionUrl,
    };
    const updated = [newMsg, ...currentMsgs];
    await saveMessagesToFirestore(updated);
    return { success: true, message: newMsg };
  } catch (fsErr: any) {
    return { success: false, error: fsErr.message };
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
    if (res.ok) return await res.json();
  } catch {
    // ignore
  }

  try {
    const fs = await fetchFullFirestoreState();
    const currentMsgs = fs?.messages || [];
    const updated = currentMsgs.map((m) => {
      if (m.id === messageId && !m.readByUserIds.includes(userId)) {
        return { ...m, readByUserIds: [...m.readByUserIds, userId] };
      }
      return m;
    });
    await saveMessagesToFirestore(updated);
    return { success: true };
  } catch {
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
    if (res.ok) return await res.json();
  } catch {
    // ignore
  }

  try {
    const fs = await fetchFullFirestoreState();
    const currentMsgs = fs?.messages || [];
    const updated = currentMsgs.map((m) => {
      if (m.id === messageId && !m.dismissedByUserIds.includes(userId)) {
        return { ...m, dismissedByUserIds: [...m.dismissedByUserIds, userId] };
      }
      return m;
    });
    await saveMessagesToFirestore(updated);
    return { success: true };
  } catch {
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
    if (res.ok) return await res.json();
  } catch {
    // ignore
  }

  try {
    const fs = await fetchFullFirestoreState();
    const currentMsgs = fs?.messages || [];
    const updated = currentMsgs.filter((m) => m.id !== messageId);
    await saveMessagesToFirestore(updated);
    return { success: true };
  } catch {
    return { success: false };
  }
}
