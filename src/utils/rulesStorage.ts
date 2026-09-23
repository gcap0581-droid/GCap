import { AppRules } from '../types';
import { DEFAULT_GCAP_RULES } from '../data/defaultRules';
import { broadcastOtaUpdate } from './liveConfigStorage';
import { apiSaveRules } from './centralSync';
import { saveRulesToFirestore } from '../lib/firestoreBridge';

const RULES_STORAGE_KEY = 'gcap_platform_rules_v2';

export function getStoredRules(): AppRules {
  try {
    let raw = typeof window !== 'undefined' ? localStorage.getItem(RULES_STORAGE_KEY) : null;
    if (!raw && typeof window !== 'undefined') {
      raw = localStorage.getItem('gcap_platform_rules_v1');
    }
    if (!raw) {
      return DEFAULT_GCAP_RULES;
    }
    const parsed = JSON.parse(raw);

    // If stale cached rules found (e.g. minDeposit 100 or HDFC bank), force override with DEFAULT_GCAP_RULES
    if (parsed.minDeposit === 100 || (parsed.companyBankName && parsed.companyBankName.includes('HDFC'))) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(RULES_STORAGE_KEY, JSON.stringify(DEFAULT_GCAP_RULES));
      }
      return DEFAULT_GCAP_RULES;
    }

    let shortRate = parsed.shortTerm6hRate !== undefined ? Number(parsed.shortTerm6hRate) : DEFAULT_GCAP_RULES.shortTerm6hRate;
    let longRate = parsed.longTerm6hRate !== undefined ? Number(parsed.longTerm6hRate) : DEFAULT_GCAP_RULES.longTerm6hRate;

    // Auto-migrate stale 0.041 / 0.032 percentages from older mobile app storage
    if (shortRate === 0.041 || shortRate === 0.04125 || !shortRate) {
      shortRate = 0.040;
    }
    if (longRate === 0.032 || longRate === 0.0328 || !longRate) {
      longRate = 0.033;
    }

    const rules: AppRules = {
      ...DEFAULT_GCAP_RULES,
      ...parsed,
      shortTerm6hRate: shortRate,
      longTerm6hRate: longRate,
    };
    if (rules.gpRatePerRupee === 1.0) {
      rules.gpRatePerRupee = 0.98;
    }

    // Save back to v2 storage key
    if (typeof window !== 'undefined') {
      localStorage.setItem(RULES_STORAGE_KEY, JSON.stringify(rules));
    }

    return rules;
  } catch {
    return DEFAULT_GCAP_RULES;
  }
}

export function saveStoredRules(rules: AppRules, broadcast = false, syncToServer = false) {
  try {
    let shortRate = rules.shortTerm6hRate !== undefined ? Number(rules.shortTerm6hRate) : DEFAULT_GCAP_RULES.shortTerm6hRate;
    let longRate = rules.longTerm6hRate !== undefined ? Number(rules.longTerm6hRate) : DEFAULT_GCAP_RULES.longTerm6hRate;

    if (shortRate === 0.041 || shortRate === 0.04125 || !shortRate) {
      shortRate = 0.040;
    }
    if (longRate === 0.032 || longRate === 0.0328 || !longRate) {
      longRate = 0.033;
    }

    const sanitizedRules: AppRules = {
      ...DEFAULT_GCAP_RULES,
      ...rules,
      shortTerm6hRate: shortRate,
      longTerm6hRate: longRate,
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(RULES_STORAGE_KEY, JSON.stringify(sanitizedRules));
      localStorage.setItem('gcap_platform_rules_v1', JSON.stringify(sanitizedRules));
    }
    if (syncToServer) {
      apiSaveRules(sanitizedRules).catch((err) => console.warn('Background apiSaveRules error:', err));
      saveRulesToFirestore(sanitizedRules).catch((err) => console.warn('Direct saveRulesToFirestore error:', err));
    }
    if (broadcast) {
      broadcastOtaUpdate(
        'RULES',
        'Platform Rules Live Updated',
        'प्लेटफ़ॉर्म नियम लाइव अपडेट हुए',
        `Min Deposit: ₹${sanitizedRules.minDeposit}, Min Withdrawal: ₹${sanitizedRules.minWithdrawal}`,
        `न्यूनतम जमा: ₹${sanitizedRules.minDeposit}, न्यूनतम निकासी: ₹${sanitizedRules.minWithdrawal}`
      );
    }
  } catch (err) {
    console.error('Failed to save rules:', err);
  }
}

export function resetRulesToDefault(): AppRules {
  saveStoredRules(DEFAULT_GCAP_RULES, true, true);
  return DEFAULT_GCAP_RULES;
}
