import { InvestmentPlan } from '../types';
import { INVESTMENT_PLANS as DEFAULT_PLANS } from '../data/plans';
import { broadcastOtaUpdate } from './liveConfigStorage';
import { apiSavePlans } from './centralSync';

const PLANS_STORAGE_KEY = 'gcap_investment_plans_v4_roi041_031';

export function sanitizePlans(plans: InvestmentPlan[]): { sanitized: InvestmentPlan[]; changed: boolean } {
  let changed = false;
  const sanitized = plans.map((plan) => {
    if (plan.id === 'long-term' && plan.minAmount !== 10000) {
      changed = true;
      const defaultLongTerm = DEFAULT_PLANS.find((p) => p.id === 'long-term') || plan;
      return { ...defaultLongTerm };
    }
    if (plan.id === 'short-term' && plan.minAmount !== 100000) {
      changed = true;
      const defaultShortTerm = DEFAULT_PLANS.find((p) => p.id === 'short-term') || plan;
      return { ...defaultShortTerm };
    }
    return plan;
  });

  const hasShort = sanitized.some((p) => p.id === 'short-term');
  const hasLong = sanitized.some((p) => p.id === 'long-term');
  if (!hasShort) {
    const defaultShort = DEFAULT_PLANS.find((p) => p.id === 'short-term');
    if (defaultShort) {
      sanitized.push({ ...defaultShort });
      changed = true;
    }
  }
  if (!hasLong) {
    const defaultLong = DEFAULT_PLANS.find((p) => p.id === 'long-term');
    if (defaultLong) {
      sanitized.push({ ...defaultLong });
      changed = true;
    }
  }

  return { sanitized, changed };
}

export function getStoredPlans(): InvestmentPlan[] {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(PLANS_STORAGE_KEY) : null;
    if (!raw) {
      return DEFAULT_PLANS;
    }
    const parsed: InvestmentPlan[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return DEFAULT_PLANS;
    }
    const { sanitized, changed } = sanitizePlans(parsed);
    if (changed) {
      saveStoredPlans(sanitized, true, true);
      return sanitized;
    }
    return parsed;
  } catch (err) {
    console.error('Failed to load plans from storage:', err);
    return DEFAULT_PLANS;
  }
}

export function saveStoredPlans(plans: InvestmentPlan[], broadcast = false, syncToServer = false): void {
  try {
    const { sanitized, changed } = sanitizePlans(plans);
    const finalPlans = sanitized;
    const finalSync = syncToServer || changed;

    if (typeof window !== 'undefined') {
      localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(finalPlans));
    }
    if (finalSync) {
      apiSavePlans(finalPlans).catch((err) => console.warn('Background apiSavePlans error:', err));
    }
    if (broadcast || changed) {
      broadcastOtaUpdate(
        'PLANS',
        'Investment Plans Updated Live',
        'निवेश प्लान लाइव अपडेट हुए',
        `Active plans list updated (${finalPlans.length} plans available). Instant sync complete.`,
        `सक्रिय प्लान्स सूची अपडेट हुई (${finalPlans.length} प्लान्स उपलब्ध)। तत्काल सिंक पूर्ण।`
      );
    }
  } catch (err) {
    console.error('Failed to save plans to storage:', err);
  }
}

export function addPlan(newPlan: InvestmentPlan): InvestmentPlan[] {
  const plans = getStoredPlans();
  const updated = [...plans, newPlan];
  saveStoredPlans(updated, true, true);
  return updated;
}

export function updatePlan(updatedPlan: InvestmentPlan): InvestmentPlan[] {
  const plans = getStoredPlans();
  const index = plans.findIndex((p) => p.id === updatedPlan.id);
  if (index !== -1) {
    plans[index] = updatedPlan;
    saveStoredPlans(plans, true, true);
  }
  return plans;
}

export function deletePlan(planId: string): InvestmentPlan[] {
  const plans = getStoredPlans();
  const filtered = plans.filter((p) => p.id !== planId);
  saveStoredPlans(filtered, true, true);
  return filtered;
}

export function resetPlansToDefault(): InvestmentPlan[] {
  saveStoredPlans(DEFAULT_PLANS, true, true);
  return DEFAULT_PLANS;
}

