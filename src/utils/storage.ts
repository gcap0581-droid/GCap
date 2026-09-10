import { Wallet, ActiveInvestment, Transaction, BankAccountDetails } from '../types';
import { INVESTMENT_PLANS } from '../data/plans';

const STORAGE_KEYS = {
  WALLET: 'inv_portal_wallet_v1',
  INVESTMENTS: 'inv_portal_investments_v1',
  TRANSACTIONS: 'inv_portal_transactions_v1',
  LAST_SIM_DATE: 'inv_portal_sim_date_v1',
};

const INITIAL_WALLET: Wallet = {
  cashBalance: 0, // Fresh zero cash balance
  gpBalance: 0, // Fresh zero GP balance
  totalInvested: 0, // No active investments
  totalEarned: 0, // Zero earnings
  royaltyEarned: 0, // Zero royalty
  pendingWithdrawals: 0,
  pendingDeposits: 0,
};

const INITIAL_INVESTMENTS: ActiveInvestment[] = [];

const INITIAL_TRANSACTIONS: Transaction[] = [];

export function getStoredWallet(): Wallet {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WALLET);
    if (!raw) {
      setStoredWallet(INITIAL_WALLET);
      return INITIAL_WALLET;
    }
    const parsed = JSON.parse(raw);
    return {
      cashBalance: typeof parsed.cashBalance === 'number' ? parsed.cashBalance : INITIAL_WALLET.cashBalance,
      gpBalance: typeof parsed.gpBalance === 'number' ? parsed.gpBalance : INITIAL_WALLET.gpBalance,
      totalInvested: typeof parsed.totalInvested === 'number' ? parsed.totalInvested : INITIAL_WALLET.totalInvested,
      totalEarned: typeof parsed.totalEarned === 'number' ? parsed.totalEarned : INITIAL_WALLET.totalEarned,
      royaltyEarned: typeof parsed.royaltyEarned === 'number' ? parsed.royaltyEarned : INITIAL_WALLET.royaltyEarned,
      pendingWithdrawals: typeof parsed.pendingWithdrawals === 'number' ? parsed.pendingWithdrawals : 0,
      pendingDeposits: typeof parsed.pendingDeposits === 'number' ? parsed.pendingDeposits : 0,
    };
  } catch {
    return INITIAL_WALLET;
  }
}

export function setStoredWallet(wallet: Wallet) {
  try {
    localStorage.setItem(STORAGE_KEYS.WALLET, JSON.stringify(wallet));
  } catch (err) {
    console.error('Failed to save wallet:', err);
  }
}

export function getStoredInvestments(): ActiveInvestment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INVESTMENTS);
    if (!raw) {
      setStoredInvestments(INITIAL_INVESTMENTS);
      return INITIAL_INVESTMENTS;
    }
    const parsed: ActiveInvestment[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      setStoredInvestments(INITIAL_INVESTMENTS);
      return INITIAL_INVESTMENTS;
    }
    // Normalize properties for all investments
    return parsed.map((inv) => {
      const activation = inv.activationTimestamp || (inv.startDate ? new Date(inv.startDate).getTime() : Date.now());
      const lockedUntil = inv.lockedUntilTimestamp || (activation + 24 * 3600 * 1000);
      const isLockDone = inv.isInitialLockCompleted ?? (Date.now() >= lockedUntil);
      const cycleHours = inv.cycleDurationHours || 6;
      
      const isShortTerm = inv.planId === 'short-term';
      const duration = isShortTerm ? 641 : (inv.durationDays || 641);
      const investedAmount = isShortTerm && inv.investedAmount < 100000 ? 100000 : inv.investedAmount;
      // 0.04% of invested amount per 6 hours
      const cycleReturn = isShortTerm
        ? Math.round((investedAmount * 0.04) / 100)
        : (inv.cycleReturnAmount || (inv.dailyReturnAmount ? inv.dailyReturnAmount / 4 : (investedAmount * (inv.dailyRoiPercent / 4)) / 100));

      const planUniqueId = inv.planUniqueId || (isShortTerm 
        ? `STP-641D-${inv.id.replace(/[^0-9]/g, '').slice(-5) || '89421'}`
        : `LTP-1282D-${inv.id.replace(/[^0-9]/g, '').slice(-5) || '72910'}`);

      const cycleStart = inv.currentCycleStartTimestamp || (isLockDone ? lockedUntil : activation);
      const cycleEnd = inv.currentCycleEndTimestamp || (cycleStart + cycleHours * 3600 * 1000);

      return {
        ...inv,
        planUniqueId,
        investedAmount,
        durationDays: duration,
        dailyRoiPercent: isShortTerm ? 0.16 : inv.dailyRoiPercent,
        dailyReturnAmount: cycleReturn * 4,
        totalExpectedReturn: cycleReturn * 4 * duration,
        totalWithdrawn: inv.totalWithdrawn || 0,
        activationTimestamp: activation,
        lockedUntilTimestamp: lockedUntil,
        isInitialLockCompleted: isLockDone,
        lockCongratulationsShown: inv.lockCongratulationsShown ?? isLockDone,
        cycleDurationHours: cycleHours,
        currentCycleStartTimestamp: cycleStart,
        currentCycleEndTimestamp: cycleEnd,
        completedCyclesCount: inv.completedCyclesCount || 0,
        cycleReturnAmount: cycleReturn,
      };
    });
  } catch {
    return INITIAL_INVESTMENTS;
  }
}

export function setStoredInvestments(investments: ActiveInvestment[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.INVESTMENTS, JSON.stringify(investments));
  } catch (err) {
    console.error('Failed to save investments:', err);
  }
}

export function getStoredTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) {
      setStoredTransactions(INITIAL_TRANSACTIONS);
      return INITIAL_TRANSACTIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_TRANSACTIONS;
  }
}

export function setStoredTransactions(txns: Transaction[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txns));
  } catch (err) {
    console.error('Failed to save txns:', err);
  }
}

export function resetPortalData(): { wallet: Wallet; investments: ActiveInvestment[]; transactions: Transaction[] } {
  setStoredWallet(INITIAL_WALLET);
  setStoredInvestments(INITIAL_INVESTMENTS);
  setStoredTransactions(INITIAL_TRANSACTIONS);
  return {
    wallet: INITIAL_WALLET,
    investments: INITIAL_INVESTMENTS,
    transactions: INITIAL_TRANSACTIONS,
  };
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(amount);
}

const BANK_DETAILS_KEY_PREFIX = 'gcap_bank_details_v1_';

export function getStoredBankDetails(userId: string): BankAccountDetails | null {
  try {
    const raw = localStorage.getItem(BANK_DETAILS_KEY_PREFIX + userId);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredBankDetails(userId: string, details: BankAccountDetails): void {
  try {
    localStorage.setItem(BANK_DETAILS_KEY_PREFIX + userId, JSON.stringify(details));
  } catch (err) {
    console.error('Failed to save bank details:', err);
  }
}
