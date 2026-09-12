import { AppRules } from '../types';

export const DEFAULT_GCAP_RULES: AppRules = {
  platformName: 'GCap',
  gpRatePerRupee: 1.0, // 1 INR = 1.0 GP (Adjustable by Admin anytime)
  minDeposit: 100,
  maxDeposit: 100000000, // Unlimited upper deposit limit
  minWithdrawal: 200,
  maxWithdrawalPerDay: 100000,
  withdrawalFeePercent: 0, // 0% fee (100% payout)
  withdrawalTiming: 'Earning: 1st - 5th of Month | Royalty: 6th - 10th of Month',
  withdrawalTimingHi: 'अर्निंग निकासी: हर महीने 1 से 5 तारीख | रॉयल्टी निकासी: 6 से 10 तारीख',
  dailyPayoutCycle: 'Every 24 Hours (Midnight 12:00 AM)',
  dailyPayoutCycleHi: 'प्रत्येक 24 घंटे में (दैनिक ऑटो-कैलकुलेशन)',
  capitalReturnPolicy: '100%_AT_MATURITY',
  capitalReturnPolicyLabel: '100% Capital Refund at Plan Maturity',
  capitalReturnPolicyLabelHi: 'प्लान समाप्ति पर 100% मूलधन सीधे वॉलेट में वापस',
  referralL1Percent: 1.0, // Direct referral 1.0%
  referralL2Percent: 0.5, // Secondary referral 0.5%
  isReferralEnabled: true, // Referral program enabled by default
  tdsPercent: 5.0, // 5% Govt TDS (Sec 194 / 194J)
  adminFeePercent: 2.0, // 2.0% Admin Charge on earnings withdrawal
  supportEmail: 'support@gcap.in',
  supportPhone: '+91 98000 12345',
  lastUpdated: '2026-09-07',
  companyUpiId: '8603504808@axisbank',
  companyBankAccountHolder: 'GCap Asset Management (India) Pvt. Ltd.',
  companyBankName: 'Axis Bank Ltd.',
  companyBankAccountNumber: '924010008662307',
  companyBankIfsc: 'UTIB0001219',
};
