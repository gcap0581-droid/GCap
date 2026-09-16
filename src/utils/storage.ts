import { Wallet, ActiveInvestment, Transaction, BankAccountDetails, UserProfile } from '../types';
import { INVESTMENT_PLANS } from '../data/plans';
import { alignInvestmentCycleTimestamps } from './cycleTiming';

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

const INITIAL_INVESTMENTS: ActiveInvestment[] = [
  {
    id: "inv-sandhya-7808056040-1",
    userId: "usr-1789384741169",
    userLoginId: "917808056040",
    userPhone: "+91 7808056040",
    userName: "Sandhya",
    planId: "short-term",
    planName: "641-Day High Yield Growth Plan",
    planNameHi: "641-दिवसीय हाई यील्ड ग्रोथ प्लान",
    planUniqueId: "STP-641D-86172",
    investedAmount: 100000,
    dailyRoiPercent: 0.164,
    dailyReturnAmount: 164,
    totalExpectedReturn: 205124,
    earnedSoFar: 0,
    claimedSoFar: 0,
    unclaimedEarnings: 0,
    durationDays: 641,
    status: "ACTIVE",
    startDate: new Date().toISOString(),
    createdAt: Date.now(),
    activationTimestamp: Date.now(),
    lockedUntilTimestamp: Date.now() + 24 * 3600 * 1000,
    isInitialLockCompleted: false,
    cyclesCompleted: 0,
    totalEarnedSoFar: 0
  },
  {
    id: "inv-sandhya-7808056040-2",
    userId: "usr-1789384741169",
    userLoginId: "917808056040",
    userPhone: "+91 7808056040",
    userName: "Sandhya",
    planId: "long-term",
    planName: "365-Day Long Term Royalty Asset Plan",
    planNameHi: "365-दिवसीय लॉन्ग टर्म रॉयल्टी प्लान",
    planUniqueId: "LTP-365D-89421",
    investedAmount: 10000,
    dailyRoiPercent: 0.128,
    dailyReturnAmount: 12.8,
    totalExpectedReturn: 14680,
    earnedSoFar: 0,
    claimedSoFar: 0,
    unclaimedEarnings: 0,
    durationDays: 365,
    status: "ACTIVE",
    startDate: new Date().toISOString(),
    createdAt: Date.now() - 3600000,
    activationTimestamp: Date.now() - 3600000,
    lockedUntilTimestamp: Date.now() + 23 * 3600 * 1000,
    isInitialLockCompleted: false,
    cyclesCompleted: 0,
    totalEarnedSoFar: 0
  }
];

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
      item.dailyRoiPercent = 0.128;
      item.dailyReturnAmount = item.investedAmount * 0.128 / 100;
      item.totalExpectedReturn = (item.investedAmount * 0.128 / 100) * 365;
    }

    const activation = item.activationTimestamp || (item.startDate ? new Date(item.startDate).getTime() : Date.now());
    const lockedUntil = item.lockedUntilTimestamp || (activation + 24 * 3600 * 1000);
    const isLockDone = item.isInitialLockCompleted ?? (Date.now() >= lockedUntil);
    const cycleHours = item.cycleDurationHours || 6;
    
    const isShortTerm = (item.planId === 'short-term' || item.planId === 'SHORT_TERM_641D') && item.investedAmount >= 100000;
    const duration = isShortTerm ? 641 : 365;
    const investedAmount = item.investedAmount;
    // 0.041% per 6h for short term (0.164% daily), 0.032% per 6h for long term (0.128% daily)
    const cycleReturn = isShortTerm
      ? Math.round((investedAmount * 0.041) / 100 * 100) / 100
      : Math.round((investedAmount * 0.032) / 100 * 100) / 100;

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

    return {
      ...item,
      planUniqueId,
      investedAmount,
      durationDays: duration,
      dailyRoiPercent: isShortTerm ? 0.164 : 0.128,
      dailyReturnAmount: cycleReturn * 4,
      totalExpectedReturn: cycleReturn * 4 * duration,
      totalWithdrawn: item.totalWithdrawn || 0,
      activationTimestamp: activation,
      lockedUntilTimestamp: lockedUntil,
      isInitialLockCompleted: isLockDone,
      lockCongratulationsShown: item.lockCongratulationsShown ?? isLockDone,
      cycleDurationHours: cycleHours,
      currentCycleStartTimestamp: alignedTiming.currentCycleStartTimestamp,
      currentCycleEndTimestamp: alignedTiming.currentCycleEndTimestamp,
      completedCyclesCount: item.completedCyclesCount || 0,
      cycleReturnAmount: cycleReturn,
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
    // Ensure both Sandhya plans exist
    const hasSandhya1 = parsed.some(i => i.id === 'inv-sandhya-7808056040-1' || (i.userPhone?.includes('7808056040') && i.investedAmount === 100000));
    const hasSandhya2 = parsed.some(i => i.id === 'inv-sandhya-7808056040-2' || (i.userPhone?.includes('7808056040') && i.investedAmount === 10000));
    let workingList = parsed;
    if (!hasSandhya1 || !hasSandhya2) {
      workingList = [...parsed, ...INITIAL_INVESTMENTS.filter(init => !parsed.some(p => p.id === init.id))];
    }

    const normalized = normalizeInvestmentsList(workingList);
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
    console.error('Failed to save investments:', err);
  }
}

export function filterUserInvestments(allInvestments: ActiveInvestment[], user: UserProfile | null): ActiveInvestment[] {
  if (!user) return getStoredInvestments();
  const localStoredInvs = getStoredInvestments();
  const merged = [...(allInvestments || []), ...localStoredInvs];
  const uniqueMap = new Map();
  merged.forEach(inv => {
    if (inv && inv.id) uniqueMap.set(inv.id, inv);
  });
  const allInvs = Array.from(uniqueMap.values());

  if (user.role === 'ADMIN') return allInvs;

  const userIdLower = (user.id || '').toLowerCase().trim();
  const loginIdLower = (user.loginId || '').toLowerCase().trim();
  const phoneClean = (user.phone || '').replace(/[^0-9]/g, "");
  const phone10 = phoneClean.length >= 10 ? phoneClean.slice(-10) : phoneClean;

  return allInvs.filter(i => {
    if (!i) return false;
    const iUserId = (i.userId || '').toLowerCase().trim();
    const iLoginId = (i.userLoginId || '').toLowerCase().trim();
    const iPhone = (i.userPhone || '').replace(/[^0-9]/g, "");
    const iPhone10 = iPhone.length >= 10 ? iPhone.slice(-10) : iPhone;

    return (
      (userIdLower && iUserId === userIdLower) ||
      (loginIdLower && iLoginId === loginIdLower) ||
      (phone10 && iPhone10 === phone10) ||
      (userIdLower && iUserId.includes(phone10)) ||
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
