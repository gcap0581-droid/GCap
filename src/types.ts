export type Language = 'en' | 'hi';

export type ViewMode = 'web' | 'android';

export interface Wallet {
  cashBalance: number; // Deposited INR balance (from company account transfer, approved by admin)
  gpBalance: number; // G-Points (GP) swapped from cashBalance (1 INR = 1 GP), used to purchase plans
  totalInvested: number;
  totalEarned: number; // Total Earning Amount (withdrawable 1st - 5th of month)
  royaltyEarned: number; // Total Royalty Earning Amount (withdrawable 6th - 10th of month)
  pendingWithdrawals: number;
  pendingDeposits: number; // Deposits waiting for admin approval (Wait for approval)
  totalWithdrawn?: number;
}

export type RiskLevel = 'Low' | 'Moderate' | 'High';

export interface InvestmentPlan {
  id: string;
  name: string;
  nameHi: string;
  dailyRoiPercent: number; // e.g. 1.8 means 1.8% daily
  durationDays: number;
  minAmount: number;
  maxAmount: number;
  payoutFrequency: 'Daily' | 'Hourly' | 'At Maturity';
  payoutFrequencyHi: string;
  risk: RiskLevel;
  tag: string;
  tagHi: string;
  badge?: string;
  description: string;
  descriptionHi: string;
  features: string[];
  featuresHi: string[];
}

export interface ActiveInvestment {
  id: string;
  userId?: string;
  userLoginId?: string;
  planUniqueId?: string; // Unique human-readable searchable plan ID (e.g., STP-641D-89421)
  planId: string;
  planName: string;
  investedAmount: number;
  dailyRoiPercent: number;
  dailyReturnAmount: number;
  totalExpectedReturn: number;
  earnedSoFar: number;
  claimedSoFar: number;
  totalWithdrawn?: number; // Total amount user has withdrawn from this investment
  unclaimedEarnings: number;
  startDate: string;
  endDate: string;
  durationDays: number;
  daysCompleted: number;
  lastPayoutTimestamp: number;
  status: 'ACTIVE' | 'COMPLETED';
  autoReinvest: boolean;
  // 641 Days Maturity and Renewal properties
  isMatured?: boolean; // True when 641 days are reached
  renewedCount?: number; // Times this plan ID has been renewed
  certificateIssued?: boolean; // Whether maturity certificate was generated
  certificateNumber?: string; // Unique certificate serial number
  // 24-Hour Initial Lock & 6-Hour Earning Cycle Properties
  activationTimestamp: number; // Timestamp when plan was started
  lockedUntilTimestamp: number; // 24 hours lock deadline (activationTimestamp + 24*3600*1000)
  isInitialLockCompleted: boolean; // True once 24 hours have elapsed
  lockCongratulationsShown?: boolean; // Whether 24h completion modal was displayed
  cycleDurationHours: number; // 6 hours
  currentCycleStartTimestamp: number; // Start timestamp of current 6h cycle
  currentCycleEndTimestamp: number; // Target timestamp of current 6h cycle (start + 6*3600*1000)
  completedCyclesCount: number; // Total number of 6h cycles completed
  cycleReturnAmount: number; // Return amount per 6h cycle = 0.04% or 0.03% of invested amount
  // Long Term Plan & Royalty properties
  royaltyStage?: '365D_INITIAL' | '1461D_LOCK' | '1825D_ROYALTY' | 'COMPLETED';
  royaltyDaysCompleted?: number;
  principalWithdrawnAt1461D?: boolean;
  certificateType?: 'STP_641D' | 'LTP_365D' | 'LTP_ROYALTY_MASTER';
}

export type TransactionType =
  | 'DEPOSIT'
  | 'SWAP_GP'
  | 'INVEST'
  | 'RETURN_PAYOUT'
  | 'WITHDRAWAL'
  | 'CAPITAL_RETURN'
  | 'REFERRAL_BONUS';

export type WithdrawalSource = 'EARNING' | 'ROYALTY';

export interface Transaction {
  id: string;
  userId?: string;
  userLoginId?: string;
  type: TransactionType;
  amount: number;
  date: string;
  timestamp: number;
  status: 'SUCCESS' | 'PENDING' | 'FAILED' | 'REJECTED';
  method?: string;
  referenceId: string;
  note: string;
  noteHi: string;
  withdrawalSource?: WithdrawalSource;
  // Payment voucher breakdown fields
  grossAmount?: number;
  tdsPercent?: number;
  tdsAmount?: number;
  adminFeePercent?: number;
  adminFeeAmount?: number;
  netAmount?: number;
  destinationDetails?: string;
  userName?: string;
  userPhone?: string;
  panNumber?: string;
}

export interface BankAccountDetails {
  accountHolder: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  upiId?: string;
}

export interface AppRules {
  platformName: string;
  gpRatePerRupee?: number; // 1 Rupee = X GP (Default 1.0, e.g. 1 INR = 1 GP or 1 INR = 1.25 GP or 0.8 GP)
  minDeposit: number;
  maxDeposit: number;
  minWithdrawal: number;
  maxWithdrawalPerDay: number;
  withdrawalFeePercent: number;
  withdrawalTiming: string;
  withdrawalTimingHi: string;
  dailyPayoutCycle: string;
  dailyPayoutCycleHi: string;
  capitalReturnPolicy: '100%_AT_MATURITY' | 'AMORTIZED_DAILY';
  capitalReturnPolicyLabel: string;
  capitalReturnPolicyLabelHi: string;
  referralL1Percent: number;
  referralL2Percent: number;
  isReferralEnabled?: boolean; // Toggle referral program on/off
  tdsPercent: number; // Government TDS percent (Default 5.0%)
  adminFeePercent?: number; // Admin charge percent on earnings withdrawal (Default 0.02%)
  supportEmail: string;
  supportPhone: string;
  lastUpdated: string;
}

export type UserRole = 'ADMIN' | 'USER';

export interface UserProfile {
  id: string;
  loginId: string; // username, email or mobile
  name: string;
  role: UserRole;
  phone: string;
  email?: string;
  referralCode?: string;
  referredBy?: string;
  joinedDate: string;
  status: 'ACTIVE' | 'BLOCKED';
}

export type TreasuryLogType =
  | 'ADMIN_ADD'
  | 'ADMIN_DEDUCT'
  | 'USER_INVESTMENT_DEDUCT'
  | 'USER_PAYOUT_DEDUCT'
  | 'USER_FUND_ADD_DEDUCT';

export interface TreasuryLog {
  id: string;
  type: TreasuryLogType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  date: string;
  timestamp: number;
  reason: string;
  reasonHi: string;
  actor: string;
  referenceId?: string;
}

export interface CompanyTreasury {
  balance: number;
  minAlertThreshold: number; // 500000 by requirement
  totalInjected: number;
  totalDeducted: number;
  totalTransferredToUsers: number;
  lastUpdated: string;
}

export type BackupTriggerType = 'MIDNIGHT_AUTO' | 'ADMIN_MANUAL';

export interface CompanyProfile {
  companyName: string; // e.g. "GCAP ASSET MANAGEMENT (INDIA) PVT. LTD."
  companyNameHi?: string; // e.g. "जीकैप एसेट मैनेजमेंट (इंडिया) प्राइवेट लिमिटेड"
  tradeName?: string; // e.g. "GCap Trust & Asset Management"
  cin?: string; // Corporate Identification Number e.g. "U65999MH2024PTC398102"
  pan?: string; // Company PAN e.g. "AABCG1234F"
  tan?: string; // Tax Deduction TAN e.g. "MUMB10293E"
  gstin?: string; // GSTIN e.g. "27AABCG1234F1Z5"
  incorporationDate?: string; // e.g. "2024-01-15"
  rocJurisdiction?: string; // e.g. "ROC Mumbai, Maharashtra"
  companyType?: string; // e.g. "Private Limited Company (Non-Govt Company)"
  authorizedCapital?: string; // e.g. "₹5,00,00,000"
  paidUpCapital?: string; // e.g. "₹1,00,00,000"
  registeredAddress?: string; // e.g. "GCap Financial Towers, Bandra-Kurla Complex (BKC), Mumbai, MH - 400051"
  corporateAddress?: string; // e.g. "BKC East, Mumbai, Maharashtra - 400051"
  city?: string; // e.g. "Mumbai"
  state?: string; // e.g. "Maharashtra"
  pincode?: string; // e.g. "400051"
  supportEmail?: string; // e.g. "support@gcap.in"
  legalEmail?: string; // e.g. "legal@gcap.in"
  supportPhone?: string; // e.g. "+91 98000 12345"
  altPhone?: string; // e.g. "+91 22 6800 1234"
  websiteUrl?: string; // e.g. "https://gcap.in"
  authorizedSignatory?: string; // e.g. "Vikramaditya Singhania"
  signatoryDesignation?: string; // e.g. "Managing Director & CEO"
  signatoryDin?: string; // e.g. "DIN: 08924192"
  sealCity?: string; // e.g. "MUMBAI"
  bankName?: string; // e.g. "HDFC Bank Ltd."
  bankAccountNumber?: string; // e.g. "50200084920194"
  bankIfsc?: string; // e.g. "HDFC0000240"
  bankBranch?: string; // e.g. "BKC Mumbai Branch"
  bankAccountType?: string; // e.g. "Current Account"
  tagline?: string; // e.g. "Guaranteed Principal Security & Wealth Growth"
  taglineHi?: string; // e.g. "100% मूलधन सुरक्षा एवं पूंजी विकास"
  lastUpdated?: string;
}

export interface BackupDataPayload {
  users: UserProfile[];
  wallet: Wallet;
  investments: ActiveInvestment[];
  transactions: Transaction[];
  plans: InvestmentPlan[];
  rules: AppRules;
  treasury: CompanyTreasury;
  treasuryLogs: TreasuryLog[];
  interfaceConfig?: LiveInterfaceConfig;
  companyProfile?: CompanyProfile;
}

export type ThemeAccent = 'emerald' | 'indigo' | 'amber' | 'cyan';

export type DesktopCategoryTab = 'dashboard' | 'plans' | 'investments' | 'wallet' | 'calculator' | 'rules';

export interface LiveInterfaceConfig {
  appVersion: string; // e.g. "v2.5.0-OTA"
  lastUpdated: string;
  themeAccent: ThemeAccent;
  bannerEnabled: boolean;
  bannerText: string;
  bannerTextHi: string;
  bannerType: 'info' | 'success' | 'alert';
  heroHeadline: string;
  heroHeadlineHi: string;
  heroSubtext: string;
  heroSubtextHi: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  maintenanceMessageHi: string;
  liveBadgeText: string;
  liveBadgeTextHi: string;
  autoSyncIntervalSec: number;
}

export type OtaUpdateType = 'RULES' | 'PLANS' | 'INTERFACE' | 'TREASURY' | 'SYSTEM';

export interface OtaEventPayload {
  id: string;
  type: OtaUpdateType;
  title: string;
  titleHi: string;
  description: string;
  descriptionHi: string;
  timestamp: number;
  version: string;
  updatedBy: string;
}

export interface BackupRecord {
  id: string;
  backupDate: string; // YYYY-MM-DD
  timestamp: number; // epoch ms
  triggerType: BackupTriggerType;
  title: string;
  titleHi: string;
  summary: {
    totalUsers: number;
    totalInvested: number;
    totalCashBalance: number;
    companyTreasuryBalance: number;
    activeInvestmentsCount: number;
    transactionsCount: number;
    plansCount: number;
  };
  payload: BackupDataPayload;
}

export type MessageTarget = 'ALL' | 'SINGLE' | 'INVESTORS' | 'POSITIVE_BALANCE' | 'SELECTED';
export type MessagePriority = 'NORMAL' | 'URGENT' | 'POPUP';
export type MessageCategory = 'ANNOUNCEMENT' | 'ALERT' | 'INFO' | 'BONUS' | 'SYSTEM';

export interface AdminMessage {
  id: string;
  title: string;
  titleHi?: string;
  content: string;
  contentHi?: string;
  senderName: string;
  targetType: MessageTarget;
  targetUserId?: string; // Single user ID or loginId
  targetUserLoginId?: string;
  targetUserName?: string;
  targetUserIds?: string[]; // Selected user IDs
  priority: MessagePriority;
  category: MessageCategory;
  showPopup: boolean; // Triggers instant modal on user screen
  createdAt: string; // ISO / display string
  timestamp: number;
  readByUserIds?: string[]; // user IDs who have read the message
  dismissedByUserIds?: string[]; // user IDs who dismissed the popup
}
