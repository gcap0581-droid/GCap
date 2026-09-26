import { AppRules } from '../types';
import { broadcastOtaUpdate } from './liveConfigStorage';
import { apiSaveRules } from './centralSync';
import { saveRulesToFirestore } from '../lib/firestoreBridge';

export const DEFAULT_GCAP_RULES: AppRules = {
  platformName: 'GCAP GLOBAL ASSET PORTAL',
  gpRatePerRupee: 1.0,
  minDeposit: 10000,
  maxDeposit: 1000000000,
  minWithdrawal: 500,
  maxWithdrawalPerDay: 5000000,
  withdrawalFeePercent: 0,
  withdrawalTiming: '1st to 5th of every month (9:00 AM - 6:00 PM IST)',
  withdrawalTimingHi: 'प्रत्येक माह की 1 से 5 तारीख तक (सुबह 9:00 से शाम 6:00 बजे तक)',
  dailyPayoutCycle: 'Every 6 Hours (0.040% STP / 0.033% LTP)',
  dailyPayoutCycleHi: 'हर 6 घंटे में (0.040% STP / 0.033% LTP)',
  capitalReturnPolicy: '100%_AT_MATURITY',
  capitalReturnPolicyLabel: '100% Capital Refund At Plan Maturity',
  capitalReturnPolicyLabelHi: 'योजना परिपक्वता पर 100% मूलधन सुरक्षित वापसी',
  referralL1Percent: 5.0,
  referralL2Percent: 2.0,
  referralL3Percent: 1.0,
  isReferralEnabled: true,
  tdsPercent: 5.0,
  adminFeePercent: 0.02,
  shortTerm6hRate: 0.040,
  longTerm6hRate: 0.033,
  supportEmail: 'support@gcap.com',
  supportPhone: '+91 9876543210',
  lastUpdated: '2026-03-24',
  companyUpiId: 'gcap@upi',
  companyBankAccountHolder: 'GCAP GLOBAL ASSET HOLDINGS',
  companyBankName: 'State Bank of India',
  companyBankAccountNumber: '39482910482',
  companyBankIfsc: 'SBIN0001234',
};

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
    console.warn('Failed to save rules:', err);
  }
}

export function resetRulesToDefault(): AppRules {
  saveStoredRules(DEFAULT_GCAP_RULES, true, true);
  return DEFAULT_GCAP_RULES;
}
