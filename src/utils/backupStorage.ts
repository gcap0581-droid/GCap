import {
  BackupDataPayload,
  BackupRecord,
  BackupTriggerType,
  UserProfile,
  Wallet,
  ActiveInvestment,
  Transaction,
  InvestmentPlan,
  AppRules,
  CompanyTreasury,
  TreasuryLog,
} from '../types';
import {
  getStoredWallet,
  setStoredWallet,
  getStoredInvestments,
  setStoredInvestments,
  getStoredTransactions,
  setStoredTransactions,
} from './storage';
import { getStoredPlans, saveStoredPlans } from './plansStorage';
import { getStoredRules, saveStoredRules } from './rulesStorage';
import {
  getStoredTreasury,
  setStoredTreasury,
  getStoredTreasuryLogs,
  setStoredTreasuryLogs,
} from './treasuryStorage';
import { getAllUsers, restoreUsersDB } from './authStorage';

const BACKUPS_STORAGE_KEY = 'gcap_system_backups_registry_v1';
const LAST_MIDNIGHT_RUN_KEY = 'gcap_last_midnight_backup_date_v1';

/**
 * Helper to get formatted YYYY-MM-DD
 */
export function formatDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Helper to calculate time remaining until the next 12:00 AM midnight
 */
export function getTimeUntilNextMidnight(): {
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
} {
  const now = new Date();
  const nextMidnight = new Date(now);
  nextMidnight.setHours(24, 0, 0, 0); // Next 00:00:00
  const diffMs = Math.max(0, nextMidnight.getTime() - now.getTime());

  const totalSecs = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSecs / 3600);
  const minutes = Math.floor((totalSecs % 3600) / 60);
  const seconds = totalSecs % 60;

  const formatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  return { hours, minutes, seconds, formatted };
}

/**
 * Capture current application state into a payload
 */
export function captureCurrentPayload(): BackupDataPayload {
  return {
    users: getAllUsers(),
    wallet: getStoredWallet(),
    investments: getStoredInvestments(),
    transactions: getStoredTransactions(),
    plans: getStoredPlans(),
    rules: getStoredRules(),
    treasury: getStoredTreasury(),
    treasuryLogs: getStoredTreasuryLogs(),
  };
}

export const getCurrentSystemPayload = captureCurrentPayload;

/**
 * Build initial realistic seed backups for past dates so the admin has a full date history
 */
function buildSeedBackups(): BackupRecord[] {
  const current = captureCurrentPayload();
  const now = new Date();

  const seeds: BackupRecord[] = [];

  // Seed 3 days of past midnight backups
  for (let i = 1; i <= 3; i++) {
    const pastDate = new Date(now.getTime() - i * 86400000);
    pastDate.setHours(0, 0, 0, 0); // Exact 12:00 AM
    const dateKey = formatDateKey(pastDate);

    // Slightly vary numbers to reflect realistic history
    const seedTreasury: CompanyTreasury = {
      ...current.treasury,
      balance: Math.max(500000, current.treasury.balance + i * 250000),
      lastUpdated: pastDate.toISOString(),
    };

    const seedWallet: Wallet = {
      ...current.wallet,
      cashBalance: Math.max(2000, current.wallet.cashBalance - i * 1500),
      totalInvested: Math.max(5000, current.wallet.totalInvested - i * 1000),
      totalEarned: Math.max(100, current.wallet.totalEarned - i * 90),
    };

    seeds.push({
      id: `backup-${dateKey}-midnight-auto`,
      backupDate: dateKey,
      timestamp: pastDate.getTime(),
      triggerType: 'MIDNIGHT_AUTO',
      title: `${dateKey} - 12:00 AM Midnight Auto-Backup`,
      titleHi: `${dateKey} - रात 12:00 बजे का ऑटोमैटिक बैकअप`,
      summary: {
        totalUsers: current.users.length,
        totalInvested: seedWallet.totalInvested,
        totalCashBalance: seedWallet.cashBalance,
        companyTreasuryBalance: seedTreasury.balance,
        activeInvestmentsCount: current.investments.length,
        transactionsCount: Math.max(1, current.transactions.length - i),
        plansCount: current.plans.length,
      },
      payload: {
        ...current,
        wallet: seedWallet,
        treasury: seedTreasury,
      },
    });
  }

  return seeds;
}

/**
 * Load all stored backups from localStorage
 */
export function getStoredBackups(): BackupRecord[] {
  try {
    const raw = localStorage.getItem(BACKUPS_STORAGE_KEY);
    if (!raw) {
      const initial = buildSeedBackups();
      saveStoredBackups(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Sort descending by timestamp
    return parsed.sort((a, b) => b.timestamp - a.timestamp);
  } catch (err) {
    console.error('Failed to load backups registry:', err);
    return [];
  }
}

/**
 * Save backups array to localStorage
 */
export function saveStoredBackups(backups: BackupRecord[]): void {
  try {
    localStorage.setItem(BACKUPS_STORAGE_KEY, JSON.stringify(backups));
  } catch (err) {
    console.error('Failed to save backups registry:', err);
  }
}

/**
 * Create a new backup snapshot record
 */
export function createBackupSnapshot(
  payload?: BackupDataPayload,
  triggerType: BackupTriggerType = 'ADMIN_MANUAL',
  customDate?: string,
  customTitle?: string,
  customTitleHi?: string,
  note?: string
): BackupRecord {
  const actualPayload = payload || getCurrentSystemPayload();
  const now = new Date();
  const dateKey = customDate || formatDateKey(now);
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  const isMidnight = triggerType === 'MIDNIGHT_AUTO';
  const title = customTitle || (isMidnight ? `${dateKey} - 12:00 AM Midnight Auto-Backup` : `${dateKey} - Manual Backup (${timeStr})`);
  const titleHi = customTitleHi || (isMidnight ? `${dateKey} - रात 12:00 बजे का ऑटोमैटिक बैकअप` : `${dateKey} - मैनुअल एडमिन बैकअप (${timeStr})`);

  const record: BackupRecord = {
    id: `backup-${dateKey}-${Date.now()}-${triggerType.toLowerCase()}`,
    backupDate: dateKey,
    timestamp: now.getTime(),
    triggerType,
    title,
    titleHi,
    summary: {
      totalUsers: actualPayload.users.length,
      totalInvested: actualPayload.wallet.totalInvested,
      totalCashBalance: actualPayload.wallet.cashBalance,
      companyTreasuryBalance: actualPayload.treasury.balance,
      activeInvestmentsCount: actualPayload.investments.length,
      transactionsCount: actualPayload.transactions.length,
      plansCount: actualPayload.plans.length,
    },
    payload: JSON.parse(JSON.stringify(actualPayload)), // Deep clone
  };

  const backups = getStoredBackups();
  const updated = [record, ...backups];
  saveStoredBackups(updated);

  if (isMidnight) {
    localStorage.setItem(LAST_MIDNIGHT_RUN_KEY, dateKey);
  }

  return record;
}

/**
 * Check if the 12:00 AM Midnight auto-backup should run for today.
 * If not already run for today, create and store it.
 */
export function checkAndRunMidnightAutoBackup(
  currentPayload?: BackupDataPayload
): { ran: boolean; record?: BackupRecord } {
  const todayKey = formatDateKey();
  const lastRun = localStorage.getItem(LAST_MIDNIGHT_RUN_KEY);

  const existingBackups = getStoredBackups();
  const alreadyRanToday = existingBackups.some(
    (b) => b.backupDate === todayKey && b.triggerType === 'MIDNIGHT_AUTO'
  );

  if (alreadyRanToday || lastRun === todayKey) {
    return { ran: false };
  }

  // Create today's midnight auto-backup
  const payload = currentPayload || getCurrentSystemPayload();
  const newRecord = createBackupSnapshot(payload, 'MIDNIGHT_AUTO', todayKey);
  return { ran: true, record: newRecord };
}

/**
 * Restore an entire project state from a specific BackupRecord.
 * Updates all underlying localStorage stores and returns the payload for React state synchronization.
 */
export function restoreBackup(backup: BackupRecord): {
  success: boolean;
  restoredPayload: BackupDataPayload;
  error?: string;
} {
  try {
    const { payload } = backup;

    // 1. Restore Wallet
    setStoredWallet(payload.wallet);

    // 2. Restore Active Investments
    setStoredInvestments(payload.investments);

    // 3. Restore Transactions
    setStoredTransactions(payload.transactions);

    // 4. Restore Plans
    saveStoredPlans(payload.plans);

    // 5. Restore Rules
    saveStoredRules(payload.rules);

    // 6. Restore Treasury
    setStoredTreasury(payload.treasury);

    // 7. Restore Treasury Logs
    setStoredTreasuryLogs(payload.treasuryLogs);

    // 8. Restore Users Accounts
    restoreUsersDB(payload.users);

    return {
      success: true,
      restoredPayload: payload,
    };
  } catch (err: any) {
    console.error('Restore operation failed:', err);
    return {
      success: false,
      restoredPayload: backup.payload,
      error: err?.message || 'Restore failed',
    };
  }
}

/**
 * Delete a specific backup record from history
 */
export function deleteBackupRecord(id: string): BackupRecord[] {
  const backups = getStoredBackups();
  const filtered = backups.filter((b) => b.id !== id);
  saveStoredBackups(filtered);
  return filtered;
}

export const deleteBackup = deleteBackupRecord;

/**
 * Download raw JSON backup file to user's computer
 */
export function downloadBackupAsJSON(backup: BackupRecord): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `GCap_Backup_${backup.backupDate}_${backup.id}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  document.body.removeChild(downloadAnchor);
}
