import { AppRules } from '../types';
import { DEFAULT_GCAP_RULES } from '../data/defaultRules';
import { broadcastOtaUpdate } from './liveConfigStorage';

const RULES_STORAGE_KEY = 'gcap_platform_rules_v1';

export function getStoredRules(): AppRules {
  try {
    const raw = localStorage.getItem(RULES_STORAGE_KEY);
    if (!raw) {
      saveStoredRules(DEFAULT_GCAP_RULES, false);
      return DEFAULT_GCAP_RULES;
    }
    const parsed = JSON.parse(raw);
    const merged = { ...DEFAULT_GCAP_RULES, ...parsed };
    return merged;
  } catch {
    return DEFAULT_GCAP_RULES;
  }
}

export function saveStoredRules(rules: AppRules, broadcast = true) {
  try {
    localStorage.setItem(RULES_STORAGE_KEY, JSON.stringify(rules));
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
    console.error('Failed to save rules to localStorage:', err);
  }
}

export function resetRulesToDefault(): AppRules {
  saveStoredRules(DEFAULT_GCAP_RULES, true);
  return DEFAULT_GCAP_RULES;
}
