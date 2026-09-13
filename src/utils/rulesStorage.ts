import { AppRules } from '../types';
import { DEFAULT_GCAP_RULES } from '../data/defaultRules';
import { broadcastOtaUpdate } from './liveConfigStorage';
import { apiSaveRules } from './centralSync';

const RULES_STORAGE_KEY = 'gcap_platform_rules_v1';

export function getStoredRules(): AppRules {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(RULES_STORAGE_KEY) : null;
    if (!raw) {
      return DEFAULT_GCAP_RULES;
    }
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_GCAP_RULES, ...parsed };
  } catch {
    return DEFAULT_GCAP_RULES;
  }
}

export function saveStoredRules(rules: AppRules, broadcast = true) {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(RULES_STORAGE_KEY, JSON.stringify(rules));
    }
    apiSaveRules(rules).catch((err) => console.warn('Background apiSaveRules error:', err));
    if (broadcast) {
      broadcastOtaUpdate(
        'RULES',
        'Platform Rules Live Updated',
        'प्लेटफ़ॉर्म नियम लाइव अपडेट हुए',
        `Min Deposit: ₹${rules.minDeposit}, Min Withdrawal: ₹${rules.minWithdrawal}`,
        `न्यूनतम जमा: ₹${rules.minDeposit}, न्यूनतम निकासी: ₹${rules.minWithdrawal}`
      );
    }
  } catch (err) {
    console.error('Failed to save rules:', err);
  }
}

export function resetRulesToDefault(): AppRules {
  saveStoredRules(DEFAULT_GCAP_RULES, true);
  return DEFAULT_GCAP_RULES;
}
