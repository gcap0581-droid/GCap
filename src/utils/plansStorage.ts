import { InvestmentPlan } from '../types';
import { INVESTMENT_PLANS as DEFAULT_PLANS } from '../data/plans';
import { broadcastOtaUpdate } from './liveConfigStorage';
import { apiSavePlans } from './centralSync';

const PLANS_STORAGE_KEY = 'gcap_investment_plans_v4_roi041_031';

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
    // Auto-migrate: ensure the 641-day short-term plan (0.164%) and 365-day long-term plan (0.124%) are active
    const shortTermPlan = parsed.find((p) => p.id === 'short-term');
    const longTermPlan = parsed.find((p) => p.id === 'long-term');
    if (!shortTermPlan || shortTermPlan.dailyRoiPercent !== 0.164 || !longTermPlan || longTermPlan.dailyRoiPercent !== 0.124) {
      return DEFAULT_PLANS;
    }
    return parsed;
  } catch (err) {
    console.error('Failed to load plans from storage:', err);
    return DEFAULT_PLANS;
  }
}

export function saveStoredPlans(plans: InvestmentPlan[], broadcast = true): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(plans));
    }
    apiSavePlans(plans).catch((err) => console.warn('Background apiSavePlans error:', err));
    if (broadcast) {
      broadcastOtaUpdate(
        'PLANS',
        'Investment Plans Updated Live',
        'निवेश प्लान लाइव अपडेट हुए',
        `Active plans list updated (${plans.length} plans available). Instant sync complete.`,
        `सक्रिय प्लान्स सूची अपडेट हुई (${plans.length} प्लान्स उपलब्ध)। तत्काल सिंक पूर्ण।`
      );
    }
  } catch (err) {
    console.error('Failed to save plans to storage:', err);
  }
}

export function addPlan(newPlan: InvestmentPlan): InvestmentPlan[] {
  const plans = getStoredPlans();
  const updated = [...plans, newPlan];
  saveStoredPlans(updated, true);
  return updated;
}

export function updatePlan(updatedPlan: InvestmentPlan): InvestmentPlan[] {
  const plans = getStoredPlans();
  const index = plans.findIndex((p) => p.id === updatedPlan.id);
  if (index !== -1) {
    plans[index] = updatedPlan;
    saveStoredPlans(plans, true);
  }
  return plans;
}

export function deletePlan(planId: string): InvestmentPlan[] {
  const plans = getStoredPlans();
  const filtered = plans.filter((p) => p.id !== planId);
  saveStoredPlans(filtered, true);
  return filtered;
}

export function resetPlansToDefault(): InvestmentPlan[] {
  saveStoredPlans(DEFAULT_PLANS, true);
  return DEFAULT_PLANS;
}

