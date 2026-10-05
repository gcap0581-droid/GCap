import { Wallet, ActiveInvestment, Transaction, BankAccountDetails, UserProfile } from '../types';
import { INVESTMENT_PLANS } from './plansStorage';
import { alignInvestmentCycleTimestamps } from './cycleTiming';
import { getStoredRules } from './rulesStorage';

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

export function getStoredWallet(userId?: string): Wallet {
  try {
    const userKey = userId ? `inv_portal_wallet_${userId}` : null;
    const raw = userKey ? localStorage.getItem(userKey) : localStorage.getItem(STORAGE_KEYS.WALLET);
    const invs = getStoredInvestments();
    const totalGenerated = Math.round(invs.reduce((sum, inv) => sum + (inv.earnedSoFar || inv.totalEarnedSoFar || 0), 0) * 100) / 100;

    if (!raw) {
      const w = {
        ...INITIAL_WALLET,
        totalEarned: totalGenerated > 0 ? totalGenerated : INITIAL_WALLET.totalEarned,
      };
      if (userId) {
        localStorage.setItem(`inv_portal_wallet_${userId}`, JSON.stringify(w));
      } else {
        localStorage.setItem(STORAGE_KEYS.WALLET, JSON.stringify(w));
      }
      return w;
    }
    const parsed = JSON.parse(raw);
    const totalWithdrawn = typeof parsed.totalWithdrawn === 'number' ? parsed.totalWithdrawn : 0;
    const totalEarned = Math.max(0, Math.round((totalGenerated - totalWithdrawn) * 100) / 100);

    return {
      cashBalance: typeof parsed.cashBalance === 'number' ? parsed.cashBalance : INITIAL_WALLET.cashBalance,
      gpBalance: typeof parsed.gpBalance === 'number' ? parsed.gpBalance : INITIAL_WALLET.gpBalance,
      totalInvested: typeof parsed.totalInvested === 'number' ? parsed.totalInvested : INITIAL_WALLET.totalInvested,
      totalEarned,
      royaltyEarned: typeof parsed.royaltyEarned === 'number' ? parsed.royaltyEarned : INITIAL_WALLET.royaltyEarned,
      pendingWithdrawals: typeof parsed.pendingWithdrawals === 'number' ? parsed.pendingWithdrawals : 0,
      pendingDeposits: typeof parsed.pendingDeposits === 'number' ? parsed.pendingDeposits : 0,
      totalWithdrawn,
    };
  } catch {
    return INITIAL_WALLET;
  }
}

export function setStoredWallet(wallet: Wallet, userId?: string) {
  try {
    let curUserId = '';
    const rawUser = localStorage.getItem('gcap_auth_user') || localStorage.getItem('inv_portal_auth_user');
    if (rawUser) {
      try {
        const parsed = JSON.parse(rawUser);
        curUserId = parsed?.id || '';
      } catch {
        // Ignore
      }
    }
    if (!userId || (curUserId && curUserId === userId)) {
      localStorage.setItem(STORAGE_KEYS.WALLET, JSON.stringify(wallet));
    }
    if (userId) {
      localStorage.setItem(`inv_portal_wallet_${userId}`, JSON.stringify(wallet));
    }
  } catch (err) {
    console.warn('Failed to save wallet:', err);
  }
}

export function normalizeInvestmentsList(list: ActiveInvestment[]): ActiveInvestment[] {
  if (!Array.isArray(list)) return [];
  return list.map((inv) => {
    let item = { ...inv };
    
    // Auto-migrate: convert any investments under 100,000 (1 Lakh) that are misclassified as short-term to the 365-day long-term plan
    if (item.investedAmount < 100000 && (item.planId === 'short-term' || item.durationDays === 641 || (item.planUniqueId && item.planUniqueId.startsWith('STP-641D')))) {
      const shortCode = item.planUniqueId?.split('-').pop() || item.id.replace(/[^0-9]/g, '').slice(-5) || '89421';
      item.planId = "long-term";
      item.planName = "365-Day Long Term Royalty Asset Plan";
      item.planNameHi = "365-दिवसीय लॉन्ग टर्म रॉयल्टी प्लान";
      item.planUniqueId = `LTP-365D-${shortCode}`;
      item.durationDays = 365;
      item.dailyRoiPercent = 0.132;
      item.dailyReturnAmount = item.investedAmount * 0.132 / 100;
      item.totalExpectedReturn = (item.investedAmount * 0.132 / 100) * 365;
    }

    const activation = item.activationTimestamp || (item.startDate ? new Date(item.startDate).getTime() : Date.now());
    const lockedUntil = item.lockedUntilTimestamp || (activation + 24 * 3600 * 1000);
    const isLockDone = item.isInitialLockCompleted ?? (Date.now() >= lockedUntil);
    const cycleHours = item.cycleDurationHours || 6;
    
    const isShortTerm = (item.planId === 'short-term' || item.planId === 'SHORT_TERM_641D') && item.investedAmount >= 100000;
    const duration = isShortTerm ? 641 : 365;
    const investedAmount = item.investedAmount;

    // Load dynamic rates from rules with safe fallbacks
    let shortRate = 0.040;
    let longRate = 0.033;
    try {
      const activeRules = getStoredRules();
      if (activeRules && typeof activeRules.shortTerm6hRate === 'number') {
        shortRate = activeRules.shortTerm6hRate;
      }
      if (activeRules && typeof activeRules.longTerm6hRate === 'number') {
        longRate = activeRules.longTerm6hRate;
      }
    } catch (e) {
      console.warn('Could not read dynamic rates inside normalizeInvestmentsList:', e);
    }

    // Dynamic rate calculation based on current Rules
    const cycleReturn = isShortTerm
      ? Math.round((investedAmount * shortRate) / 100 * 100) / 100
      : Math.round((investedAmount * longRate) / 100 * 100) / 100;

    let planUniqueId = item.planUniqueId || (isShortTerm 
      ? `STP-641D-${item.id.replace(/[^0-9]/g, '').slice(-5) || '89421'}`
      : `LTP-365D-${item.id.replace(/[^0-9]/g, '').slice(-5) || '72910'}`);

    if (!isShortTerm && planUniqueId.startsWith('STP-')) {
      planUniqueId = planUniqueId.replace(/^STP-\d+D-/, 'LTP-365D-').replace(/^STP-/, 'LTP-365D-');
    }

    if (!isShortTerm && planUniqueId.startsWith('LTP-375D-')) {
      planUniqueId = planUniqueId.replace(/^LTP-375D-/, 'LTP-365D-');
    }

    const alignedTiming = alignInvestmentCycleTimestamps({
      isInitialLockCompleted: isLockDone,
      lockedUntilTimestamp: lockedUntil,
      currentCycleStartTimestamp: item.currentCycleStartTimestamp,
      currentCycleEndTimestamp: item.currentCycleEndTimestamp,
    });

    const activeDailyRoi = isShortTerm ? (shortRate * 4) : (longRate * 4);

    const completedCycles = Math.max(
      item.completedCyclesCount || 0,
      item.cyclesCompleted || 0
    );

    // Single Authoritative Source of Truth:
    // If an authoritative earned amount is already saved on item (from Central Database), preserve it exactly.
    // Do not overwrite it with completedCycles * cycleReturn which can distort manual additions / exact amounts.
    const dbEarned = (typeof item.earnedSoFar === 'number' && item.earnedSoFar > 0)
      ? item.earnedSoFar
      : (typeof item.totalEarnedSoFar === 'number' && item.totalEarnedSoFar > 0)
      ? item.totalEarnedSoFar
      : (completedCycles > 0 ? (completedCycles * cycleReturn) : 0);
    const earnedSoFar = Math.round(dbEarned * 100) / 100;

    const unclaimedEarnings = (typeof item.unclaimedEarnings === 'number' && item.unclaimedEarnings > 0)
      ? Math.round(item.unclaimedEarnings * 100) / 100
      : Math.max(0, Math.round((earnedSoFar - (item.claimedSoFar || 0)) * 100) / 100);

    return {
      ...item,
      userLoginId: (item.userLoginId === '917808056040' ? '7808056040' : item.userLoginId),
      planUniqueId,
      investedAmount,
      durationDays: duration,
      dailyRoiPercent: activeDailyRoi,
      dailyReturnAmount: cycleReturn * 4,
      totalExpectedReturn: cycleReturn * 4 * duration,
      earnedSoFar,
      totalEarnedSoFar: earnedSoFar,
      unclaimedEarnings,
      totalWithdrawn: item.totalWithdrawn || 0,
      activationTimestamp: activation,
      lockedUntilTimestamp: lockedUntil,
      isInitialLockCompleted: isLockDone,
      lockCongratulationsShown: item.lockCongratulationsShown ?? isLockDone,
      cycleDurationHours: cycleHours,
      currentCycleStartTimestamp: alignedTiming.currentCycleStartTimestamp,
      currentCycleEndTimestamp: alignedTiming.currentCycleEndTimestamp,
      completedCyclesCount: completedCycles,
      cycleReturnAmount: item.cycleReturnAmount || cycleReturn,
      daysCompleted: item.daysCompleted || 0,
    };
  });
}

export function getStoredInvestments(): ActiveInvestment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INVESTMENTS);
    if (!raw) {
      setStoredInvestments(INITIAL_INVESTMENTS);
      return normalizeInvestmentsList(INITIAL_INVESTMENTS);
    }
    const parsed: ActiveInvestment[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      setStoredInvestments(INITIAL_INVESTMENTS);
      return normalizeInvestmentsList(INITIAL_INVESTMENTS);
    }
    
    const normalized = normalizeInvestmentsList(parsed);
    if (JSON.stringify(parsed) !== JSON.stringify(normalized)) {
      setStoredInvestments(normalized);
    }
    return normalized;
  } catch {
    return normalizeInvestmentsList(INITIAL_INVESTMENTS);
  }
}

export function setStoredInvestments(investments: ActiveInvestment[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.INVESTMENTS, JSON.stringify(investments));
  } catch (err) {
    console.warn('Failed to save investments:', err);
  }
}

export function filterUserInvestments(allInvestments: ActiveInvestment[], user: UserProfile | null): ActiveInvestment[] {
  const sourceList = (Array.isArray(allInvestments) && allInvestments.length > 0)
    ? allInvestments
    : getStoredInvestments();

  if (!user) return sourceList;
  if (user.role === 'ADMIN') return sourceList;

  const userIdLower = (user.id || '').toLowerCase().trim();
  const loginIdLower = (user.loginId || '').toLowerCase().trim();
  const phoneClean = (user.phone || '').replace(/[^0-9]/g, "");
  const phone10 = phoneClean.length >= 10 ? phoneClean.slice(-10) : phoneClean;

  return sourceList.filter(i => {
    if (!i) return false;
    const iUserId = (i.userId || '').toLowerCase().trim();
    const iLoginId = (i.userLoginId || '').toLowerCase().trim();
    const iPhone = (i.userPhone || '').replace(/[^0-9]/g, "");
    const iPhone10 = iPhone.length >= 10 ? iPhone.slice(-10) : iPhone;

    return (
      (userIdLower && iUserId === userIdLower) ||
      (loginIdLower && iLoginId === loginIdLower) ||
      (phone10 && iPhone10 === phone10) ||
      (userIdLower && phone10 && iUserId.includes(phone10)) ||
      (phone10 && iUserId.includes(phone10)) ||
      !i.userId
    );
  });
}

export function getStoredTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) {
      setStoredTransactions(INITIAL_TRANSACTIONS);
      return INITIAL_TRANSACTIONS;
    }
    const parsed: Transaction[] = JSON.parse(raw);
    if (!Array.isArray(parsed)) return INITIAL_TRANSACTIONS;
    let modified = false;
    const sanitized = parsed.map(t => {
      let uLogin = t.userLoginId;
      let note = t.note;
      let noteHi = t.noteHi;
      if (uLogin === '917808056040') {
        uLogin = '7808056040';
        modified = true;
      }
      if (note && note.includes('917808056040')) {
        note = note.replaceAll('917808056040', '7808056040');
        modified = true;
      }
      if (noteHi && noteHi.includes('917808056040')) {
        noteHi = noteHi.replaceAll('917808056040', '7808056040');
        modified = true;
      }
      return { ...t, userLoginId: uLogin, note, noteHi };
    });
    if (modified) {
      setStoredTransactions(sanitized);
    }
    return sanitized;
  } catch {
    return INITIAL_TRANSACTIONS;
  }
}

export function setStoredTransactions(txns: Transaction[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txns));
  } catch (err) {
    console.warn('Failed to save txns:', err);
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
    minimumFractionDigits: 2,
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
    console.warn('Failed to save bank details:', err);
  }
}
