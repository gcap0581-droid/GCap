import { InvestmentPlan } from '../types';
import { broadcastOtaUpdate } from './liveConfigStorage';
import { apiSavePlans } from './centralSync';
import { getStoredRules } from './rulesStorage';
import { savePlansToFirestore } from '../lib/firestoreBridge';

export const FALLBACK_INVESTMENT_PLANS: InvestmentPlan[] = [
  {
    id: 'short-term',
    name: 'Short Term Plan (641-Day Plan)',
    nameHi: 'शॉर्ट टर्म प्लान (641-Day Plan)',
    dailyRoiPercent: 0.160,
    durationDays: 641,
    minAmount: 100000,
    maxAmount: 1000000000,
    payoutFrequency: 'Daily',
    payoutFrequencyHi: 'हर 6 घंटे में 0.040% GP',
    risk: 'Low',
    tag: '641 Days • First 24h Lock • 0.040%/6h GP',
    tagHi: '641 दिन • पहले 24 घंटे का लॉक • हर 6h में 0.040% GP',
    badge: '⚡ 641-Day Short Term Plan (Min ₹1 Lakh)',
    description: 'Special 641-day Short Term investment plan. Deposit ₹10,000 to Unlimited. First 24 hours lock. Earn 0.040% of your investment amount every 6 hours as GP (1 GP = ₹1) automatically credited.',
    descriptionHi: 'विशेष 641 दिवसीय शॉर्ट टर्म निवेश योजना। निवेश सीमा ₹10,000 से असीमित (Unlimited)। पहले 24 घंटे का लॉक। हर 6 घंटे में 0.040% GP स्वतः जमा।',
    features: [
      'न्यूनतम निवेश ₹1,00,000 से अधिकतम असीमित (Unlimited)',
      'परिपक्वता अवधि 641 दिन (पहले 24 घंटे का लॉक)',
      'हर 6 घंटे में 0.040% GP लाभ',
      'महीने की 1 से 5 तारीख तक निकासी',
    ],
    featuresHi: [
      'न्यूनतम निवेश ₹1,00,000 से अधिकतम असीमित (Unlimited)',
      'परिपक्वता अवधि 641 दिन (पहले 24 घंटे का लॉक)',
      'हर 6 घंटे में 0.040% GP लाभ',
      'महीने की 1 से 5 तारीख तक निकासी',
    ],
  },
  {
    id: 'long-term',
    name: 'Long Term Plan (365-Day & Royalty Plan)',
    nameHi: 'लॉन्ग टर्म प्लान (365-Day & Royalty Plan)',
    dailyRoiPercent: 0.132,
    durationDays: 365,
    minAmount: 10000,
    maxAmount: 100000,
    payoutFrequency: 'Daily',
    payoutFrequencyHi: 'हर 6 घंटे में 0.033% GP',
    risk: 'Low',
    tag: '365 Days • First 24h Lock • 0.033%/6h GP + Royalty',
    tagHi: '365 दिन • पहले 24 घंटे का लॉक • 0.033%/6h GP + रॉयल्टी पाथवे',
    badge: '👑 365-Day Long Term & Royalty Plan',
    description: 'Premier 365-day Long Term Plan with Royalty pathway. Deposit ₹10,000 to ₹100,000. First 24 hours lock. Earn 0.033% every 6 hours.',
    descriptionHi: 'प्रीमियम 365-दिवसीय लॉन्ग टर्म निवेश एवं रॉयल्टी योजना। निवेश ₹10,000 से ₹1,00,000 तक। पहले 24 घंटे का लॉक। हर 6 घंटे में 0.033% GP लाभ + रॉयल्टी पाथवे।',
    features: [
      'न्यूनतम निवेश ₹10,000 एवं अधिकतम ₹1,00,000',
      'अवधि 365 दिन (पहले 24 घंटे का लॉक) + 1461 दिन रॉयल्टी विकल्प',
      'हर 6 घंटे में 0.033% GP लाभ',
      'महीने की 1 से 5 तारीख तक निकासी',
    ],
    featuresHi: [
      'न्यूनतम निवेश ₹10,000 एवं अधिकतम ₹1,00,000',
      'अवधि 365 दिन (पहले 24 घंटे का लॉक) + 1461 दिन रॉयल्टी विकल्प',
      'हर 6 घंटे में 0.033% GP लाभ',
      'महीने की 1 से 5 तारीख तक निकासी',
    ],
  }
];

const DEFAULT_PLANS = FALLBACK_INVESTMENT_PLANS;

const PLANS_STORAGE_KEY = 'gcap_investment_plans_v5_roi040_033';

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
    // Check if description or features still contain stale 0.041% or 0.032%
    if (
      plan.id === 'short-term' &&
      (plan.description?.includes('0.041%') || plan.featuresHi?.some((f) => f.includes('0.041%')))
    ) {
      changed = true;
      const defaultShort = DEFAULT_PLANS.find((p) => p.id === 'short-term') || plan;
      return { ...defaultShort };
    }
    if (
      plan.id === 'long-term' &&
      (plan.description?.includes('0.032%') || plan.featuresHi?.some((f) => f.includes('0.032%')))
    ) {
      changed = true;
      const defaultLong = DEFAULT_PLANS.find((p) => p.id === 'long-term') || plan;
      return { ...defaultLong };
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
    let parsed: InvestmentPlan[];
    if (!raw) {
      parsed = [...DEFAULT_PLANS];
    } else {
      parsed = JSON.parse(raw);
    }
    if (!Array.isArray(parsed) || parsed.length === 0) {
      parsed = [...DEFAULT_PLANS];
    }
    const { sanitized, changed } = sanitizePlans(parsed);
    const finalPlans = changed ? sanitized : parsed;

    if (changed) {
      saveStoredPlans(sanitized, true, true);
    }

    // Dynamic override based on active rules set by Admin
    try {
      const activeRules = getStoredRules();
      if (activeRules) {
        return finalPlans.map((plan) => {
          if (plan.id === 'short-term' && activeRules.shortTerm6hRate !== undefined) {
            const shortRate = activeRules.shortTerm6hRate;
            return {
              ...plan,
              dailyRoiPercent: shortRate * 4,
              tag: `${plan.durationDays} Days • First 24h Lock • ${shortRate.toFixed(3)}%/6h GP`,
              tagHi: `${plan.durationDays} दिन • पहले 24 घंटे का लॉक • हर 6h में ${shortRate.toFixed(3)}% GP`,
              payoutFrequencyHi: `हर 6 घंटे में ${shortRate.toFixed(3)}% GP`,
            };
          }
          if (plan.id === 'long-term' && activeRules.longTerm6hRate !== undefined) {
            const longRate = activeRules.longTerm6hRate;
            return {
              ...plan,
              dailyRoiPercent: longRate * 4,
              tag: `${plan.durationDays} Days • First 24h Lock • ${longRate.toFixed(3)}%/6h GP + Royalty`,
              tagHi: `${plan.durationDays} दिन • पहले 24 घंटे का लॉक • ${longRate.toFixed(3)}%/6h GP + रॉयल्टी पाथवे`,
              payoutFrequencyHi: `हर 6 घंटे में ${longRate.toFixed(3)}% GP`,
            };
          }
          return plan;
        });
      }
    } catch (e) {
      console.warn('Dynamic plans ROI override failed:', e);
    }

    return finalPlans;
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
      savePlansToFirestore(finalPlans).catch((err) => console.warn('Background savePlansToFirestore error:', err));
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

