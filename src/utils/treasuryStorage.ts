import { CompanyTreasury, TreasuryLog } from '../types';

const TREASURY_STORAGE_KEY = 'gcap_company_treasury_v1';
const TREASURY_LOGS_STORAGE_KEY = 'gcap_treasury_logs_v1';

export const DEFAULT_ALERT_THRESHOLD = 500000; // ₹5,00,000 threshold for low balance alert

const INITIAL_TREASURY: CompanyTreasury = {
  balance: 600000, // ₹6,00,000 initial fresh company balance
  minAlertThreshold: DEFAULT_ALERT_THRESHOLD,
  totalInjected: 600000,
  totalDeducted: 0,
  totalTransferredToUsers: 0,
  lastUpdated: new Date().toISOString(),
};

const INITIAL_LOGS: TreasuryLog[] = [
  {
    id: 'tr-log-1',
    type: 'ADMIN_ADD',
    amount: 600000,
    balanceBefore: 0,
    balanceAfter: 600000,
    date: new Date().toISOString(),
    timestamp: Date.now(),
    reason: 'Initial Company Liquidity Injection into Main Reserve',
    reasonHi: 'कंपनी के मुख्य रिज़र्व में प्रारंभ में ₹6,00,000 फंड जोड़ा गया',
    actor: 'Super Admin (admin)',
    referenceId: 'INJ-600000',
  }
];

export function getStoredTreasury(): CompanyTreasury {
  try {
    const raw = localStorage.getItem(TREASURY_STORAGE_KEY);
    if (!raw) {
      setStoredTreasury(INITIAL_TREASURY);
      return INITIAL_TREASURY;
    }
    const parsed = JSON.parse(raw);
    // Ensure minAlertThreshold is always set
    if (!parsed.minAlertThreshold) {
      parsed.minAlertThreshold = DEFAULT_ALERT_THRESHOLD;
    }
    return parsed;
  } catch {
    return INITIAL_TREASURY;
  }
}

export function setStoredTreasury(treasury: CompanyTreasury) {
  try {
    localStorage.setItem(TREASURY_STORAGE_KEY, JSON.stringify(treasury));
  } catch (err) {
    console.error('Failed to save company treasury:', err);
  }
}

export function getStoredTreasuryLogs(): TreasuryLog[] {
  try {
    const raw = localStorage.getItem(TREASURY_LOGS_STORAGE_KEY);
    if (!raw) {
      setStoredTreasuryLogs(INITIAL_LOGS);
      return INITIAL_LOGS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_LOGS;
  }
}

export function setStoredTreasuryLogs(logs: TreasuryLog[]) {
  try {
    localStorage.setItem(TREASURY_LOGS_STORAGE_KEY, JSON.stringify(logs));
  } catch (err) {
    console.error('Failed to save treasury logs:', err);
  }
}

/**
 * Admin adds funds to Company Main Balance
 */
export function adminAddCompanyBalance(
  amount: number,
  reason: string,
  reasonHi: string,
  actor: string = 'Super Admin',
  referenceId?: string
): { treasury: CompanyTreasury; log: TreasuryLog } {
  const current = getStoredTreasury();
  const balanceBefore = current.balance;
  const balanceAfter = balanceBefore + amount;

  const updatedTreasury: CompanyTreasury = {
    ...current,
    balance: balanceAfter,
    totalInjected: current.totalInjected + amount,
    lastUpdated: new Date().toISOString(),
  };

  const newLog: TreasuryLog = {
    id: `tr-add-${Date.now()}`,
    type: 'ADMIN_ADD',
    amount,
    balanceBefore,
    balanceAfter,
    date: new Date().toISOString(),
    timestamp: Date.now(),
    reason: reason || `Admin manual balance top-up (+₹${amount})`,
    reasonHi: reasonHi || `एडमिन द्वारा मुख्य बैलेंस में वृद्धि (+₹${amount})`,
    actor,
    referenceId: referenceId || `INJ-${Math.floor(100000 + Math.random() * 900000)}`,
  };

  const logs = [newLog, ...getStoredTreasuryLogs()];

  setStoredTreasury(updatedTreasury);
  setStoredTreasuryLogs(logs);

  return { treasury: updatedTreasury, log: newLog };
}

/**
 * Admin deducts funds from Company Main Balance
 */
export function adminDeductCompanyBalance(
  amount: number,
  reason: string,
  reasonHi: string,
  actor: string = 'Super Admin',
  referenceId?: string
): { treasury: CompanyTreasury; log: TreasuryLog; error?: string } {
  const current = getStoredTreasury();
  if (amount <= 0) {
    return { treasury: current, log: {} as TreasuryLog, error: 'Amount must be greater than zero' };
  }
  if (amount > current.balance) {
    return {
      treasury: current,
      log: {} as TreasuryLog,
      error: `Deduction amount (₹${amount}) exceeds current balance (₹${current.balance})`,
    };
  }

  const balanceBefore = current.balance;
  const balanceAfter = Math.max(0, balanceBefore - amount);

  const updatedTreasury: CompanyTreasury = {
    ...current,
    balance: balanceAfter,
    totalDeducted: current.totalDeducted + amount,
    lastUpdated: new Date().toISOString(),
  };

  const newLog: TreasuryLog = {
    id: `tr-dec-${Date.now()}`,
    type: 'ADMIN_DEDUCT',
    amount,
    balanceBefore,
    balanceAfter,
    date: new Date().toISOString(),
    timestamp: Date.now(),
    reason: reason || `Admin balance deduction (-₹${amount})`,
    reasonHi: reasonHi || `एडमिन द्वारा मुख्य बैलेंस से कटौती (-₹${amount})`,
    actor,
    referenceId: referenceId || `DEC-${Math.floor(100000 + Math.random() * 900000)}`,
  };

  const logs = [newLog, ...getStoredTreasuryLogs()];

  setStoredTreasury(updatedTreasury);
  setStoredTreasuryLogs(logs);

  return { treasury: updatedTreasury, log: newLog };
}

/**
 * Deduct from Company Main Balance when user invests:
 * "User job hi invest kare wo campany ke main balance se deduct hoker hi user ko transfer ho"
 */
export function deductForUserInvestment(
  amount: number,
  planName: string,
  userName: string = 'Investor'
): { success: boolean; treasury: CompanyTreasury; log?: TreasuryLog; error?: string } {
  const current = getStoredTreasury();

  if (current.balance < amount) {
    return {
      success: false,
      treasury: current,
      error: `कंपनी के मुख्य बैलेंस में पर्याप्त राशि नहीं है (वर्तमान: ₹${current.balance}, आवश्यक: ₹${amount})। कृपया एडमिन से संपर्क करें।`,
    };
  }

  const balanceBefore = current.balance;
  const balanceAfter = balanceBefore - amount;

  const updatedTreasury: CompanyTreasury = {
    ...current,
    balance: balanceAfter,
    totalTransferredToUsers: current.totalTransferredToUsers + amount,
    lastUpdated: new Date().toISOString(),
  };

  const newLog: TreasuryLog = {
    id: `tr-inv-${Date.now()}`,
    type: 'USER_INVESTMENT_DEDUCT',
    amount,
    balanceBefore,
    balanceAfter,
    date: new Date().toISOString(),
    timestamp: Date.now(),
    reason: `Deducted from Company Main Balance -> Transferred to ${userName} for plan ${planName}`,
    reasonHi: `कंपनी मुख्य बैलेंस से कटौती -> ${userName} को '${planName}' प्लान में निवेश हेतु ट्रांसफर`,
    actor: userName,
    referenceId: `TRF-${Math.floor(100000 + Math.random() * 900000)}`,
  };

  const logs = [newLog, ...getStoredTreasuryLogs()];

  setStoredTreasury(updatedTreasury);
  setStoredTreasuryLogs(logs);

  return {
    success: true,
    treasury: updatedTreasury,
    log: newLog,
  };
}

/**
 * Deduct from Company Main Balance when admin approves a user's fund deposit:
 * "Koi bhi user jub fund add karega to uske balance company ke main balance wallet se deduct hoker hi melega aur uska record admin ke pass rahna chaiye."
 */
export function deductForUserDepositApproval(
  amount: number,
  userName: string = 'User',
  referenceId: string = 'DEP-REF'
): { success: boolean; treasury: CompanyTreasury; log: TreasuryLog } {
  const current = getStoredTreasury();
  const balanceBefore = current.balance;
  const balanceAfter = Math.max(0, balanceBefore - amount);

  const updatedTreasury: CompanyTreasury = {
    ...current,
    balance: balanceAfter,
    totalTransferredToUsers: current.totalTransferredToUsers + amount,
    totalDeducted: current.totalDeducted + amount,
    lastUpdated: new Date().toISOString(),
  };

  const newLog: TreasuryLog = {
    id: `tr-dep-appr-${Date.now()}`,
    type: 'USER_FUND_ADD_DEDUCT',
    amount,
    balanceBefore,
    balanceAfter,
    date: new Date().toISOString(),
    timestamp: Date.now(),
    reason: `User fund deposit approved: ₹${amount.toLocaleString('en-IN')} deducted from Company Main Balance -> Credited to ${userName} wallet (UTR: ${referenceId})`,
    reasonHi: `यूज़र फंड डिपॉजिट अप्रूव: कंपनी मुख्य बैलेंस से ₹${amount.toLocaleString('en-IN')} डिडक्ट होकर ${userName} के वॉलेट में क्रेडिट हुआ (UTR: ${referenceId})`,
    actor: 'Admin Approval',
    referenceId,
  };

  const logs = [newLog, ...getStoredTreasuryLogs()];

  setStoredTreasury(updatedTreasury);
  setStoredTreasuryLogs(logs);

  return {
    success: true,
    treasury: updatedTreasury,
    log: newLog,
  };
}

/**
 * Deduct from Company Main Balance when return payout is claimed
 */
export function deductForUserPayout(
  amount: number,
  reason: string,
  reasonHi: string,
  userName: string = 'Investor'
): { success: boolean; treasury: CompanyTreasury; log?: TreasuryLog } {
  const current = getStoredTreasury();

  // If company balance has funds, deduct it
  const balanceBefore = current.balance;
  const balanceAfter = Math.max(0, balanceBefore - amount);

  const updatedTreasury: CompanyTreasury = {
    ...current,
    balance: balanceAfter,
    totalTransferredToUsers: current.totalTransferredToUsers + amount,
    lastUpdated: new Date().toISOString(),
  };

  const newLog: TreasuryLog = {
    id: `tr-pay-${Date.now()}`,
    type: 'USER_PAYOUT_DEDUCT',
    amount,
    balanceBefore,
    balanceAfter,
    date: new Date().toISOString(),
    timestamp: Date.now(),
    reason,
    reasonHi,
    actor: userName,
    referenceId: `RET-${Math.floor(100000 + Math.random() * 900000)}`,
  };

  const logs = [newLog, ...getStoredTreasuryLogs()];

  setStoredTreasury(updatedTreasury);
  setStoredTreasuryLogs(logs);

  return {
    success: true,
    treasury: updatedTreasury,
    log: newLog,
  };
}

/**
 * Check if company main balance is at or below threshold (₹5,00,000)
 */
export function isLowCompanyBalance(balance: number, threshold = DEFAULT_ALERT_THRESHOLD): boolean {
  return balance <= threshold;
}

export function resetTreasuryToDefault(): { treasury: CompanyTreasury; logs: TreasuryLog[] } {
  setStoredTreasury(INITIAL_TREASURY);
  setStoredTreasuryLogs(INITIAL_LOGS);
  return {
    treasury: INITIAL_TREASURY,
    logs: INITIAL_LOGS,
  };
}
