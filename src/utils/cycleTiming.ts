// Global Synchronized Fixed Time Slabs for 6-Hour Cycles in IST (02:00 AM, 08:00 AM, 02:00 PM, 08:00 PM IST)
export const FIXED_CYCLE_HOURS = [2, 8, 14, 20] as const;

export const FIXED_SLAB_LABELS = [
  '02:00 AM',
  '08:00 AM',
  '02:00 PM',
  '08:00 PM'
] as const;

// IST offset from UTC in milliseconds (+5:30)
const IST_OFFSET_MS = 5.5 * 3600 * 1000;

/**
 * Given any timestamp (e.g. after 24h lock period ends),
 * finds the next upcoming fixed time slab milestone (8:00 AM, 2:00 PM, 8:00 PM, 2:00 AM IST).
 */
export function getNextFixedCycleTimestamp(fromTimestamp: number = Date.now()): number {
  // Convert UTC timestamp to IST Date representation using UTC methods
  const istDate = new Date(fromTimestamp + IST_OFFSET_MS);
  const y = istDate.getUTCFullYear();
  const m = istDate.getUTCMonth();
  const d = istDate.getUTCDate();

  const candidates: number[] = [];

  // Candidates today (IST)
  for (const hour of FIXED_CYCLE_HOURS) {
    const slotUtc = Date.UTC(y, m, d, hour, 0, 0, 0) - IST_OFFSET_MS;
    if (slotUtc > fromTimestamp) {
      candidates.push(slotUtc);
    }
  }

  // Candidates tomorrow (IST)
  for (const hour of FIXED_CYCLE_HOURS) {
    const slotUtc = Date.UTC(y, m, d + 1, hour, 0, 0, 0) - IST_OFFSET_MS;
    candidates.push(slotUtc);
  }

  candidates.sort((a, b) => a - b);
  return candidates[0];
}

/**
 * Returns the previous fixed cycle milestone before or equal to target timestamp.
 */
export function getPreviousFixedCycleTimestamp(targetTimestamp: number = Date.now()): number {
  const next = getNextFixedCycleTimestamp(targetTimestamp);
  return next - 6 * 3600 * 1000;
}

/**
 * Format timestamp into standard readable 12-hour slot name (e.g. "08:00 AM", "02:00 PM")
 */
export function formatFixedSlotTime(timestamp: number): string {
  if (!timestamp) return '08:00 AM';
  const istDate = new Date(timestamp + IST_OFFSET_MS);
  let hours = istDate.getUTCHours();
  const minutes = istDate.getUTCMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // hour '0' should be '12'
  const strHours = hours < 10 ? '0' + hours : hours;
  const strMinutes = minutes < 10 ? '0' + minutes : minutes;
  return `${strHours}:${strMinutes} ${ampm}`;
}

/**
 * Check and align an investment's cycle timestamp to the fixed global time slabs.
 */
export function alignInvestmentCycleTimestamps(inv: {
  isInitialLockCompleted?: boolean;
  lockedUntilTimestamp?: number;
  currentCycleStartTimestamp?: number;
  currentCycleEndTimestamp?: number;
}): { currentCycleStartTimestamp: number; currentCycleEndTimestamp: number } {
  const now = Date.now();
  
  if (!inv.isInitialLockCompleted) {
    const lockEnd = inv.lockedUntilTimestamp || (now + 24 * 3600 * 1000);
    const nextSlot = getNextFixedCycleTimestamp(lockEnd);
    return {
      currentCycleStartTimestamp: lockEnd,
      currentCycleEndTimestamp: nextSlot,
    };
  }

  // Preserve existing unexpired cycle timestamp
  const currentEnd = inv.currentCycleEndTimestamp || 0;
  if (currentEnd > now) {
    return {
      currentCycleStartTimestamp: inv.currentCycleStartTimestamp || (currentEnd - 6 * 3600 * 1000),
      currentCycleEndTimestamp: currentEnd,
    };
  }

  const nextSlot = getNextFixedCycleTimestamp(now);
  return {
    currentCycleStartTimestamp: nextSlot - 6 * 3600 * 1000,
    currentCycleEndTimestamp: nextSlot,
  };
}

/**
 * Count how many fixed cycle slots occurred between two timestamps.
 */
export function countElapsedFixedSlots(fromTimestamp: number, toTimestamp: number): number {
  if (toTimestamp <= fromTimestamp) return 0;
  let count = 0;
  let cur = getNextFixedCycleTimestamp(fromTimestamp);
  while (cur <= toTimestamp) {
    count++;
    cur = getNextFixedCycleTimestamp(cur + 1000);
  }
  return count;
}

export interface ReconcileResult {
  updatedInvestments: any[];
  hasChanges: boolean;
  walletDeltas: Record<string, { totalEarnedDelta: number; royaltyEarnedDelta: number }>;
  newTransactions: any[];
}

/**
 * Universal mathematical self-healing cycle reconciler.
 * Guarantees that whether an app is offline, installed as PWA on mobile, closed for days,
 * or running on Vercel without a backend proxy, the exact number of 6-hour cycle returns
 * will ALWAYS be computed and credited based on IST fixed time slabs (02:00, 08:00, 14:00, 20:00).
 */
export function reconcileAllInvestmentsWithTime(
  investments: any[],
  rules: any | null,
  now: number = Date.now()
): ReconcileResult {
  if (!Array.isArray(investments) || investments.length === 0) {
    return { updatedInvestments: [], hasChanges: false, walletDeltas: {}, newTransactions: [] };
  }

  let hasChanges = false;
  const walletDeltas: Record<string, { totalEarnedDelta: number; royaltyEarnedDelta: number }> = {};
  const newTransactions: any[] = [];

  const updatedInvestments = investments.map((inv) => {
    if (!inv || inv.status !== 'ACTIVE') return inv;

    let current6hRate = 0.040;
    if (inv.planId === 'long-term') {
      current6hRate = rules?.longTerm6hRate !== undefined ? rules.longTerm6hRate : 0.033;
    } else {
      current6hRate = rules?.shortTerm6hRate !== undefined ? rules.shortTerm6hRate : 0.040;
    }
    const cyclePayout = Math.round(((inv.investedAmount * current6hRate) / 100) * 100) / 100;
    const isRoyaltyPlan = inv.royaltyStage === '1825D_ROYALTY';

    const lockEnd = inv.lockedUntilTimestamp || ((inv.activationTimestamp || new Date(inv.startDate).getTime()) + 24 * 3600 * 1000);

    if (now >= lockEnd) {
      const totalEligibleCycles = countElapsedFixedSlots(lockEnd, now);
      const currentCompleted = inv.completedCyclesCount || inv.cyclesCompleted || 0;
      const expectedEarned = Math.round(totalEligibleCycles * cyclePayout * 100) / 100;
      const actualEarned = inv.earnedSoFar || 0;

      const nextEnd = getNextFixedCycleTimestamp(now);
      const nextStart = nextEnd - 6 * 3600 * 1000;

      const needsCycleUpdate = totalEligibleCycles > currentCompleted;
      const needsEarningsUpdate = actualEarned < expectedEarned;
      const needsTimestampFix = !inv.currentCycleEndTimestamp || inv.currentCycleEndTimestamp <= now || inv.currentCycleEndTimestamp !== nextEnd;

      if (needsCycleUpdate || needsEarningsUpdate || needsTimestampFix || !inv.isInitialLockCompleted) {
        hasChanges = true;
        const missingCycles = Math.max(0, totalEligibleCycles - currentCompleted);
        const earningsDelta = Math.max(0, Math.round((expectedEarned - actualEarned) * 100) / 100);

        const updatedInv = {
          ...inv,
          isInitialLockCompleted: true,
          lockCongratulationsShown: true,
          completedCyclesCount: totalEligibleCycles,
          cyclesCompleted: totalEligibleCycles,
          cycleReturnAmount: cyclePayout,
          earnedSoFar: expectedEarned,
          totalEarnedSoFar: expectedEarned,
          unclaimedEarnings: Math.round(((inv.unclaimedEarnings || 0) + earningsDelta) * 100) / 100,
          currentCycleStartTimestamp: nextStart,
          currentCycleEndTimestamp: nextEnd,
        };

        if (earningsDelta > 0) {
          const userKey = inv.userId || inv.userLoginId;
          if (userKey) {
            if (!walletDeltas[userKey]) {
              walletDeltas[userKey] = { totalEarnedDelta: 0, royaltyEarnedDelta: 0 };
            }
            if (isRoyaltyPlan) {
              walletDeltas[userKey].royaltyEarnedDelta += earningsDelta;
            } else {
              walletDeltas[userKey].totalEarnedDelta += earningsDelta;
            }
          }

          // Generate transactions for newly credited cycles
          for (let c = 1; c <= missingCycles; c++) {
            const cycleNum = currentCompleted + c;
            const txnId = `txn-cyc-auto-${inv.id}-${cycleNum}`;
            newTransactions.push({
              id: txnId,
              userId: inv.userId,
              userLoginId: inv.userLoginId,
              userName: inv.userName,
              userPhone: inv.userPhone,
              type: 'RETURN_PAYOUT',
              amount: cyclePayout,
              date: new Date().toISOString(),
              timestamp: now,
              status: 'SUCCESS',
              referenceId: 'CYC' + Math.floor(10000000 + Math.random() * 90000000),
              note: isRoyaltyPlan
                ? `6-Hour Cycle #${cycleNum} return of ₹${cyclePayout} credited to Royalty Earning (${inv.planName})`
                : `6-Hour Cycle #${cycleNum} return of ₹${cyclePayout} credited to Total Earning (${inv.planName})`,
              noteHi: isRoyaltyPlan
                ? `6 घंटे के चक्र #${cycleNum} का रिटर्न ₹${cyclePayout} स्वतः कुल रॉयल्टी अर्निंग में जमा हुआ (${inv.planName})`
                : `6 घंटे के चक्र #${cycleNum} का रिटर्न ₹${cyclePayout} स्वतः कुल अर्निंग में जमा हुआ (${inv.planName})`,
            });
          }
        }

        return updatedInv;
      }
    } else {
      // In 24h initial lock phase
      const nextEnd = getNextFixedCycleTimestamp(lockEnd);
      if (inv.currentCycleEndTimestamp !== nextEnd) {
        hasChanges = true;
        return {
          ...inv,
          isInitialLockCompleted: false,
          currentCycleStartTimestamp: lockEnd,
          currentCycleEndTimestamp: nextEnd,
        };
      }
    }

    return inv;
  });

  return { updatedInvestments, hasChanges, walletDeltas, newTransactions };
}
