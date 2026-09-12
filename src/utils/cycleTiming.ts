// Global Synchronized Fixed Time Slabs for 6-Hour Cycles (8 AM, 2 PM, 8 PM, 2 AM)
export const FIXED_CYCLE_HOURS = [2, 8, 14, 20] as const;

export const FIXED_SLAB_LABELS = [
  '02:00 AM',
  '08:00 AM',
  '02:00 PM',
  '08:00 PM'
] as const;

/**
 * Given any timestamp (e.g. after 24h lock period ends),
 * finds the next upcoming fixed time slab milestone (8:00 AM, 2:00 PM, 8:00 PM, 2:00 AM).
 */
export function getNextFixedCycleTimestamp(fromTimestamp: number = Date.now()): number {
  const d = new Date(fromTimestamp);
  
  // Candidates today
  const candidates: number[] = [];
  
  for (const hour of FIXED_CYCLE_HOURS) {
    const slot = new Date(d.getFullYear(), d.getMonth(), d.getDate(), hour, 0, 0, 0).getTime();
    if (slot > fromTimestamp) {
      candidates.push(slot);
    }
  }
  
  // Candidates tomorrow
  for (const hour of FIXED_CYCLE_HOURS) {
    const slot = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, hour, 0, 0, 0).getTime();
    candidates.push(slot);
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
  const d = new Date(timestamp);
  let hours = d.getHours();
  const minutes = d.getMinutes();
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

  // If already in active cycle, align end timestamp to the next fixed slot if not aligned
  const currentEnd = inv.currentCycleEndTimestamp || 0;
  if (currentEnd <= now) {
    const nextSlot = getNextFixedCycleTimestamp(now);
    return {
      currentCycleStartTimestamp: nextSlot - 6 * 3600 * 1000,
      currentCycleEndTimestamp: nextSlot,
    };
  }

  // Validate if currentEnd is aligned to one of the fixed slots
  const d = new Date(currentEnd);
  const hour = d.getHours();
  const minutes = d.getMinutes();
  const seconds = d.getSeconds();

  const isAligned = FIXED_CYCLE_HOURS.includes(hour as any) && minutes === 0 && seconds === 0;
  if (!isAligned) {
    const nextSlot = getNextFixedCycleTimestamp(now);
    return {
      currentCycleStartTimestamp: nextSlot - 6 * 3600 * 1000,
      currentCycleEndTimestamp: nextSlot,
    };
  }

  return {
    currentCycleStartTimestamp: inv.currentCycleStartTimestamp || (currentEnd - 6 * 3600 * 1000),
    currentCycleEndTimestamp: currentEnd,
  };
}
