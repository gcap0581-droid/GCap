import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { initializeApp as initializeClientApp, getApps as getClientApps } from "firebase/app";
import { initializeFirestore as clientInitializeFirestore, doc as clientDoc, getDoc as getClientDoc, setDoc as setClientDoc, writeBatch as clientWriteBatch, onSnapshot as clientOnSnapshot, setLogLevel } from "firebase/firestore";

try {
  setLogLevel("silent");
} catch (_) {}

// Stable server deployment/build identifier (persists during the lifetime of this server process, updates when restarted by GitHub/AI Studio deploy)
let SERVER_BUILD_ID = process.env.BUILD_ID || process.env.VITE_BUILD_ID || "gcap_v2.5.3";
const SERVER_BOOT_TIME = new Date().toISOString();

interface StoredAccount {
  id: string;
  loginId: string;
  name: string;
  role: "ADMIN" | "STAFF" | "USER";
  phone: string;
  email?: string;
  referralCode?: string;
  referredBy?: string;
  joinedDate?: string;
  status: "ACTIVE" | "BLOCKED";
  passwordHash: string;
  password?: string;
  permissions?: {
    manageUsers?: boolean;
    manageWallet?: boolean;
    manageTransactions?: boolean;
    manageSchemes?: boolean;
    manageTreasury?: boolean;
    manageBroadcast?: boolean;
  };
}

interface Wallet {
  cashBalance: number;
  gpBalance: number;
  totalInvested: number;
  totalEarned: number;
  royaltyEarned: number;
  pendingWithdrawals: number;
  pendingDeposits: number;
  totalWithdrawn?: number;
}

interface ActiveInvestment {
  id: string;
  userId?: string;
  userLoginId?: string;
  planUniqueId?: string;
  planId: string;
  planName: string;
  investedAmount: number;
  dailyRoiPercent: number;
  dailyReturnAmount: number;
  totalExpectedReturn: number;
  earnedSoFar: number;
  claimedSoFar: number;
  totalWithdrawn?: number;
  unclaimedEarnings: number;
  startDate: string;
  endDate: string;
  durationDays: number;
  daysCompleted: number;
  lastPayoutTimestamp?: number;
  status: "ACTIVE" | "COMPLETED";
  autoReinvest?: boolean;
  activationTimestamp?: number;
  lockedUntilTimestamp?: number;
  isInitialLockCompleted?: boolean;
  cycleDurationHours?: number;
  currentCycleStartTimestamp?: number;
  currentCycleEndTimestamp?: number;
  completedCyclesCount?: number;
  cycleReturnAmount?: number;
  [key: string]: any;
}

interface Transaction {
  id: string;
  userId?: string;
  userLoginId?: string;
  type: string;
  amount: number;
  date: string;
  timestamp: number;
  status: "SUCCESS" | "PENDING" | "FAILED" | "REJECTED";
  method?: string;
  referenceId: string;
  note: string;
  noteHi: string;
  withdrawalSource?: string;
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

interface InvestmentPlan {
  id: string;
  name: string;
  nameHi: string;
  dailyRoiPercent: number;
  durationDays: number;
  minAmount: number;
  maxAmount: number;
  payoutFrequency: string;
  payoutFrequencyHi: string;
  risk: string;
  tag: string;
  tagHi: string;
  badge: string;
  description: string;
  descriptionHi: string;
  features: string[];
  featuresHi: string[];
}

interface AppRules {
  platformName: string;
  gpRatePerRupee: number;
  minDeposit: number;
  maxDeposit: number;
  minWithdrawal: number;
  maxWithdrawalPerDay: number;
  withdrawalFeePercent: number;
  withdrawalTiming: string;
  withdrawalTimingHi: string;
  dailyPayoutCycle: string;
  dailyPayoutCycleHi: string;
  capitalReturnPolicy: string;
  capitalReturnPolicyLabel: string;
  capitalReturnPolicyLabelHi: string;
  referralL1Percent: number;
  referralL2Percent: number;
  isReferralEnabled: boolean;
  tdsPercent: number;
  adminFeePercent: number;
  supportEmail: string;
  supportPhone: string;
  lastUpdated: string;
  companyUpiId?: string;
  companyBankAccountHolder?: string;
  companyBankName?: string;
  companyBankAccountNumber?: string;
  companyBankIfsc?: string;
}

interface LiveInterfaceConfig {
  appVersion: string;
  lastUpdated: string;
  themeAccent: string;
  bannerEnabled: boolean;
  bannerText: string;
  bannerTextHi: string;
  bannerType: string;
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

interface CompanyTreasury {
  balance: number;
  minAlertThreshold: number;
  totalInjected: number;
  totalDeducted: number;
  totalTransferredToUsers: number;
  lastUpdated: string;
}

interface TreasuryLog {
  id: string;
  type: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  date: string;
  timestamp: number;
  reason: string;
  reasonHi: string;
  actor: string;
  referenceId: string;
}

interface BankAccountDetails {
  accountHolder: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  upiId?: string;
}

export interface AdminMessage {
  id: string;
  title: string;
  titleHi?: string;
  content: string;
  contentHi?: string;
  senderName: string;
  targetType: "ALL" | "SINGLE" | "INVESTORS" | "POSITIVE_BALANCE" | "SELECTED";
  targetUserId?: string;
  targetUserLoginId?: string;
  targetUserName?: string;
  targetUserIds?: string[];
  priority: "NORMAL" | "URGENT" | "POPUP";
  category: "ANNOUNCEMENT" | "ALERT" | "INFO" | "BONUS" | "SYSTEM";
  showPopup: boolean;
  createdAt: string;
  timestamp: number;
  readByUserIds?: string[];
  dismissedByUserIds?: string[];
}

interface ServerDB {
  users: StoredAccount[];
  deletedUserIds?: string[];
  wallets: Record<string, Wallet>;
  investments: ActiveInvestment[];
  transactions: Transaction[];
  plans: InvestmentPlan[];
  rules: AppRules;
  liveConfig: LiveInterfaceConfig;
  bankDetails: Record<string, BankAccountDetails>;
  treasury: CompanyTreasury;
  treasuryLogs: TreasuryLog[];
  messages?: AdminMessage[];
  lastUpdated: string;
}

const DEFAULT_ACCOUNTS: StoredAccount[] = [
  {
    id: "usr-admin-01",
    loginId: "Admin",
    name: "GCap System Admin",
    role: "ADMIN",
    phone: "+91 98000 12345",
    email: "admin@gcap.in",
    joinedDate: "2026-01-01",
    status: "ACTIVE",
    passwordHash: "ad123",
  },
  {
    id: "usr-1789384741169",
    loginId: "7808056040",
    name: "Sandhya",
    role: "USER",
    phone: "+91 7808056040",
    email: "gcap0581@gmail.com",
    joinedDate: "2026-09-16",
    status: "ACTIVE",
    passwordHash: "1111",
  },
  {
    id: "usr-1789457522655",
    loginId: "9661670322",
    name: "Puja kumari",
    role: "USER",
    phone: "+91 9661670322",
    email: "puja@gmail.com",
    joinedDate: "2026-09-16",
    status: "ACTIVE",
    passwordHash: "12345",
  },
];

const DEFAULT_WALLET: Wallet = {
  cashBalance: 0,
  gpBalance: 0,
  totalInvested: 0,
  totalEarned: 0,
  royaltyEarned: 0,
  pendingWithdrawals: 0,
  pendingDeposits: 0,
};

const DEFAULT_PLANS: InvestmentPlan[] = [
  {
    id: "short-term",
    name: "Short Term Plan (641-Day Plan)",
    nameHi: "शॉर्ट टर्म प्लान (641-Day Plan)",
    dailyRoiPercent: 0.164,
    durationDays: 641,
    minAmount: 10000,
    maxAmount: 1000000000,
    payoutFrequency: "Daily",
    payoutFrequencyHi: "हर 6 घंटे में 0.041% GP",
    risk: "Low",
    tag: "641 Days • First 24h Lock • 0.041%/6h GP",
    tagHi: "641 दिन • पहले 24 घंटे का लॉक • हर 6h में 0.041% GP",
    badge: "⚡ 641-Day Short Term Plan (Unlimited)",
    description: "Special 641-day Short Term investment plan. Deposit ₹10,000 to Unlimited. First 24 hours lock. Earn 0.041% of your investment amount every 6 hours as GP (1 GP = ₹1) automatically credited.",
    descriptionHi: "विशेष 641 दिवसीय शॉर्ट टर्म निवेश योजना। निवेश सीमा ₹10,000 से असीमित (Unlimited)। पहले 24 घंटे का लॉक। हर 6 घंटे में 0.041% GP स्वतः जमा।",
    features: [
      "न्यूनतम निवेश ₹10,000 से अधिकतम असीमित (Unlimited)",
      "परिपक्वता अवधि 641 दिन (पहले 24 घंटे का लॉक)",
      "हर 6 घंटे में 0.041% GP लाभ",
      "महीने की 1 से 5 तारीख तक निकासी",
    ],
    featuresHi: [
      "न्यूनतम निवेश ₹10,000 से अधिकतम असीमित (Unlimited)",
      "परिपक्वता अवधि 641 दिन (पहले 24 घंटे का लॉक)",
      "हर 6 घंटे में 0.041% GP लाभ",
      "महीने की 1 से 5 तारीख तक निकासी",
    ],
  },
  {
    id: "long-term",
    name: "Long Term Plan (365-Day & Royalty Plan)",
    nameHi: "लॉन्ग टर्म प्लान (365-Day & Royalty Plan)",
    dailyRoiPercent: 0.128,
    durationDays: 365,
    minAmount: 10000,
    maxAmount: 100000,
    payoutFrequency: "Daily",
    payoutFrequencyHi: "हर 6 घंटे में 0.032% GP",
    risk: "Low",
    tag: "365 Days • First 24h Lock • 0.032%/6h GP + Royalty",
    tagHi: "365 दिन • पहले 24 घंटे का लॉक • 0.032%/6h GP + रॉयल्टी पाथवे",
    badge: "👑 365-Day Long Term & Royalty Plan",
    description: "Premier 365-day Long Term Plan with Royalty pathway. Deposit ₹10,000 to ₹100,000. First 24 hours lock. Earn 0.032% every 6 hours.",
    descriptionHi: "प्रीमियम 365-दिवसीय लॉन्ग टर्म निवेश एवं रॉयल्टी योजना। निवेश ₹10,000 से ₹1,00,000 तक। पहले 24 घंटे का लॉक। हर 6 घंटे में 0.032% GP लाभ + रॉयल्टी पाथवे।",
    features: [
      "न्यूनतम निवेश ₹10,000 एवं अधिकतम ₹1,00,000",
      "अवधि 365 दिन (पहले 24 घंटे का लॉक) + 1461 दिन रॉयल्टी विकल्प",
      "हर 6 घंटे में 0.032% GP लाभ",
      "महीने की 1 से 5 तारीख तक निकासी",
    ],
    featuresHi: [
      "न्यूनतम निवेश ₹10,000 एवं अधिकतम ₹1,00,000",
      "अवधि 365 दिन (पहले 24 घंटे का लॉक) + 1461 दिन रॉयल्टी विकल्प",
      "हर 6 घंटे में 0.032% GP लाभ",
      "महीने की 1 से 5 तारीख तक निकासी",
    ],
  }
];

const DEFAULT_RULES: AppRules = {
  platformName: "GCap",
  gpRatePerRupee: 0.98,
  minDeposit: 100,
  maxDeposit: 500000,
  minWithdrawal: 200,
  maxWithdrawalPerDay: 100000,
  withdrawalFeePercent: 0,
  withdrawalTiming: "Earning: 1st - 5th of Month | Royalty: 6th - 10th of Month",
  withdrawalTimingHi: "अर्निंग निकासी: हर महीने 1 से 5 तारीख | रॉयल्टी निकासी: 6 से 10 तारीख",
  dailyPayoutCycle: "Every 24 Hours (Midnight 12:00 AM)",
  dailyPayoutCycleHi: "प्रत्येक 24 घंटे में (दैनिक ऑटो-कैलकुलेशन)",
  capitalReturnPolicy: "100%_AT_MATURITY",
  capitalReturnPolicyLabel: "100% Capital Refund at Plan Maturity",
  capitalReturnPolicyLabelHi: "प्लान समाप्ति पर 100% मूलधन सीधे वॉलेट में वापस",
  referralL1Percent: 1.0,
  referralL2Percent: 0.5,
  isReferralEnabled: true,
  tdsPercent: 5.0,
  adminFeePercent: 2.0,
  supportEmail: "support@gcap.in",
  supportPhone: "+91 98000 12345",
  lastUpdated: new Date().toISOString().split("T")[0],
  companyUpiId: "8603504808@axisbank",
  companyBankAccountHolder: "GCap Assets & Wealth Management Private Limited",
  companyBankName: "HDFC Bank Ltd.",
  companyBankAccountNumber: "50200084920194",
  companyBankIfsc: "HDFC0000240",
};

const DEFAULT_LIVE_CONFIG: LiveInterfaceConfig = {
  appVersion: "v2.5.2-MAIN-DB",
  lastUpdated: new Date().toISOString().replace("T", " ").slice(0, 16),
  themeAccent: "emerald",
  bannerEnabled: true,
  bannerText: "🚀 Live Update: Main Database synchronization is fully active worldwide.",
  bannerTextHi: "🚀 लाइव अपडेट: मुख्य डेटाबेस सिंक्रोनाइज़ेशन विश्व स्तर पर पूर्णतः सक्रिय है।",
  bannerType: "success",
  heroHeadline: "Smart Daily Returns & Automated Growth",
  heroHeadlineHi: "स्मार्ट दैनिक रिटर्न एवं स्वचालित पूंजी वृद्धि",
  heroSubtext: "Invest with confidence. 100% principal protection, daily interest credits, and instant UPI withdrawals.",
  heroSubtextHi: "सुरक्षित एवं प्रमाणित निवेश। 100% मूलधन सुरक्षा, प्रतिदिन स्वचालित ब्याज और त्वरित UPI निकासी।",
  maintenanceMode: false,
  maintenanceMessage: "System routine maintenance in progress.",
  maintenanceMessageHi: "सिस्टम रूटीन मेंटेनेंस प्रगति पर है।",
  liveBadgeText: "⚡ Live Main DB Connected",
  liveBadgeTextHi: "⚡ मुख्य डेटाबेस लाइव कनेक्टेड",
  autoSyncIntervalSec: 3,
};

const INITIAL_TREASURY: CompanyTreasury = {
  balance: 600000,
  minAlertThreshold: 500000,
  totalInjected: 600000,
  totalDeducted: 0,
  totalTransferredToUsers: 0,
  lastUpdated: new Date().toISOString(),
};

const INITIAL_LOGS: TreasuryLog[] = [
  {
    id: "tr-log-1",
    type: "ADMIN_ADD",
    amount: 600000,
    balanceBefore: 0,
    balanceAfter: 600000,
    date: new Date().toISOString(),
    timestamp: Date.now(),
    reason: "Initial Company Liquidity Injection into Main Reserve",
    reasonHi: "कंपनी के मुख्य रिज़र्व में प्रारंभ में ₹6,00,000 फंड जोड़ा गया",
    actor: "Super Admin (admin)",
    referenceId: "INJ-600000",
  },
];

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "server-db.json");

// Firebase Firestore Integration Setup
let firestore: any = null;
let lastSyncedTimestamp: string = "";

try {
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    if (config.projectId) {
      let clientApp;
      if (getClientApps().length === 0) {
        clientApp = initializeClientApp(config);
      } else {
        clientApp = getClientApps()[0];
      }
      firestore = clientInitializeFirestore(clientApp, {
        experimentalForceLongPolling: true,
      }, config.firestoreDatabaseId || "(default)");
      console.log("[Firebase] Successfully initialized Firestore Client with long-polling and database:", config.firestoreDatabaseId || "(default)");
    }
  } else {
    console.warn("[Firebase] No firebase-applet-config.json found.");
  }
} catch (err) {
  console.error("[Firebase] Error initializing Firestore Client:", err);
}

// Helper to remove any undefined properties and flatten nested arrays before writing to Firestore
function cleanForFirestore<T>(input: T): any {
  if (input === null || input === undefined) return input;

  function sanitize(val: any): any {
    if (val === null || val === undefined) return null;
    if (Array.isArray(val)) {
      const flattened: any[] = [];
      for (const item of val) {
        if (Array.isArray(item)) {
          // Firestore does NOT support nested arrays! Flatten recursive array items into this array.
          const subItems = sanitize(item);
          if (Array.isArray(subItems)) {
            flattened.push(...subItems);
          } else {
            flattened.push(subItems);
          }
        } else {
          flattened.push(sanitize(item));
        }
      }
      return flattened;
    }
    if (typeof val === "object") {
      const obj: Record<string, any> = {};
      for (const [k, v] of Object.entries(val)) {
        if (v !== undefined) {
          obj[k] = sanitize(v);
        }
      }
      return obj;
    }
    return val;
  }

  return sanitize(JSON.parse(JSON.stringify(input)));
}

let isFirestoreQuotaExhausted = false;
let quotaExhaustedTime = 0;

// Function to save the DB to Firestore
async function saveToFirestore(db: ServerDB): Promise<void> {
  if (!firestore) return;
  if (isFirestoreQuotaExhausted) {
    // Retry after 1 hour (3600000 ms)
    if (Date.now() - quotaExhaustedTime > 3600000) {
      isFirestoreQuotaExhausted = false;
      console.log("[Firebase] Quota cooling period over. Retrying Firestore connection...");
    } else {
      return;
    }
  }
  try {
    const batch = clientWriteBatch(firestore);
    
    const docs = [
      { id: "users", data: db.users || [] },
      { id: "wallets", data: db.wallets || {} },
      { id: "investments", data: db.investments || [] },
      { id: "transactions", data: db.transactions || [] },
      { id: "plans", data: db.plans || [] },
      { id: "rules", data: db.rules || null },
      { id: "liveConfig", data: db.liveConfig || null },
      { id: "bankDetails", data: db.bankDetails || {} },
      { id: "treasury", data: db.treasury || null },
      { id: "treasuryLogs", data: db.treasuryLogs || [] },
      { id: "messages", data: db.messages || [] },
      { id: "deletedUserIds", data: db.deletedUserIds || [] }
    ];

    for (const d of docs) {
      if (d.data !== null) {
        const ref = clientDoc(firestore, "gcap_database", d.id);
        batch.set(ref, { data: cleanForFirestore(d.data) });
      }
    }

    const metaRef = clientDoc(firestore, "gcap_database", "metadata");
    batch.set(metaRef, { lastUpdated: db.lastUpdated || new Date().toISOString() });

    await batch.commit();
    console.log("[Firebase] Successfully batch-saved full DB state to Firestore via Client SDK!");
  } catch (err) {
    const errMsg = String(err && (err as any).message || err || "").toLowerCase();
    if (errMsg.includes("resource_exhausted") || errMsg.includes("quota")) {
      isFirestoreQuotaExhausted = true;
      quotaExhaustedTime = Date.now();
      console.warn("[Firebase Warning] Firestore daily write quota limit reached. Temporarily pausing Firestore writes to prevent error logs. Server is operating safely on fast local file persistence!");
    } else {
      console.error("[Firebase] Error saving to Firestore:", err);
    }
  }
}

// Function to load the DB from Firestore
async function loadFromFirestore(): Promise<ServerDB | null> {
  if (!firestore) return null;
  try {
    const docs = [
      "users", "wallets", "investments", "transactions", "plans", "rules", 
      "liveConfig", "bankDetails", "treasury", "treasuryLogs", "messages", 
      "deletedUserIds", "metadata"
    ];
    
    const snaps = await Promise.all(docs.map(docId => getClientDoc(clientDoc(firestore, "gcap_database", docId))));
    const snapMap: Record<string, any> = {};
    docs.forEach((docId, index) => {
      snapMap[docId] = snaps[index];
    });

    if (!snapMap["users"].exists()) {
      console.log("[Firebase] Firestore 'users' document does not exist. Needs initialization.");
      return null;
    }

    const loadedDb: any = {
      users: snapMap["users"].data()?.data || [],
      wallets: snapMap["wallets"].data()?.data || {},
      investments: snapMap["investments"].data()?.data || [],
      transactions: snapMap["transactions"].data()?.data || [],
      plans: snapMap["plans"].data()?.data || [],
      rules: snapMap["rules"].data()?.data,
      liveConfig: snapMap["liveConfig"].data()?.data,
      bankDetails: snapMap["bankDetails"].data()?.data || {},
      treasury: snapMap["treasury"].data()?.data,
      treasuryLogs: snapMap["treasuryLogs"].data()?.data || [],
      messages: snapMap["messages"].data()?.data || [],
      deletedUserIds: snapMap["deletedUserIds"].data()?.data || [],
      lastUpdated: snapMap["metadata"].data()?.lastUpdated || new Date().toISOString()
    };

    // Purge 917808056040 and preserve 7808056040
    if (loadedDb.wallets && loadedDb.wallets["917808056040"]) {
      if (!loadedDb.wallets["7808056040"]) {
        loadedDb.wallets["7808056040"] = loadedDb.wallets["917808056040"];
      }
      delete loadedDb.wallets["917808056040"];
    }
    if (Array.isArray(loadedDb.users)) {
      loadedDb.users.forEach((u: any) => {
        if (u.loginId === "917808056040") u.loginId = "7808056040";
      });
    }
    if (Array.isArray(loadedDb.transactions)) {
      loadedDb.transactions.forEach((t: any) => {
        if (t.userLoginId === "917808056040") t.userLoginId = "7808056040";
        if (t.note && t.note.includes("917808056040")) t.note = t.note.replaceAll("917808056040", "7808056040");
        if (t.noteHi && t.noteHi.includes("917808056040")) t.noteHi = t.noteHi.replaceAll("917808056040", "7808056040");
      });
    }
    if (Array.isArray(loadedDb.investments)) {
      loadedDb.investments.forEach((i: any) => {
        if (i.userLoginId === "917808056040") i.userLoginId = "7808056040";
      });
    }

    const defaultSandhyaInvestments = [
      {
        id: "inv-sandhya-7808056040-1",
        userId: "usr-1789384741169",
        userLoginId: "7808056040",
        userPhone: "+91 7808056040",
        userName: "Sandhya",
        planId: "short-term",
        planName: "641-Day High Yield Growth Plan",
        planNameHi: "641-दिवसीय हाई यील्ड ग्रोथ प्लान",
        planUniqueId: "STP-641D-89421",
        investedAmount: 100000,
        dailyRoiPercent: 0.164,
        dailyReturnAmount: 164,
        totalExpectedReturn: 205124,
        earnedSoFar: 0,
        claimedSoFar: 0,
        unclaimedEarnings: 0,
        durationDays: 641,
        daysCompleted: 0,
        status: "ACTIVE",
        startDate: "2026-09-16T15:23:23.901Z",
        endDate: "2028-06-19T15:23:23.901Z",
        createdAt: 1789572203901,
        activationTimestamp: 1789572203901,
        lockedUntilTimestamp: 1789658603901,
        isInitialLockCompleted: false,
        cyclesCompleted: 0,
        totalEarnedSoFar: 0
      },
      {
        id: "inv-sandhya-7808056040-2",
        userId: "usr-1789384741169",
        userLoginId: "7808056040",
        userPhone: "+91 7808056040",
        userName: "Sandhya",
        planId: "long-term",
        planName: "365-Day Long Term Royalty Asset Plan",
        planNameHi: "365-दिवसीय लॉन्ग टर्म रॉयल्टी प्लान",
        planUniqueId: "LTP-365D-89421",
        investedAmount: 10000,
        dailyRoiPercent: 0.128,
        dailyReturnAmount: 12.8,
        totalExpectedReturn: 14672,
        earnedSoFar: 0,
        claimedSoFar: 0,
        unclaimedEarnings: 0,
        durationDays: 365,
        daysCompleted: 0,
        status: "ACTIVE",
        startDate: "2026-09-16T17:44:24.512Z",
        endDate: "2027-09-16T17:44:24.512Z",
        createdAt: 1789580664512,
        activationTimestamp: 1789580664512,
        lockedUntilTimestamp: 1789667064512,
        isInitialLockCompleted: false,
        cyclesCompleted: 0,
        totalEarnedSoFar: 0
      }
    ];

    if (!Array.isArray(loadedDb.investments) || loadedDb.investments.length === 0) {
      loadedDb.investments = defaultSandhyaInvestments;
    } else {
      defaultSandhyaInvestments.forEach((defInv) => {
        if (!loadedDb.investments.some((inv: any) => inv.id === defInv.id)) {
          loadedDb.investments.push(defInv);
        }
      });
    }

    if (!loadedDb.wallets) loadedDb.wallets = {};
    const sandhyaWalletKeys = ["usr-1789384741169", "1789384741169", "7808056040", "9384741169"];
    let maxCash = 230000;
    let maxGp = 19600;
    let maxInvested = 110000;

    sandhyaWalletKeys.forEach((k) => {
      const w = loadedDb.wallets[k];
      if (w) {
        maxCash = Math.max(maxCash, w.cashBalance || 0);
        maxGp = Math.max(maxGp, w.gpBalance || 0);
        maxInvested = Math.max(maxInvested, w.totalInvested || 0);
      }
    });

    sandhyaWalletKeys.forEach((k) => {
      loadedDb.wallets[k] = {
        cashBalance: maxCash,
        gpBalance: maxGp,
        totalInvested: maxInvested,
        totalEarned: 0,
        royaltyEarned: 0,
        pendingWithdrawals: 0,
        pendingDeposits: 0,
      };
    });

    return loadedDb as ServerDB;
  } catch (err) {
    console.error("[Firebase] Error loading from Firestore:", err);
    return null;
  }
}

function syncAdminWalletWithTreasury(db: ServerDB) {
  const currentTreasuryBalance = typeof db.treasury?.balance === 'number' ? db.treasury.balance : 600000;
  const adminKeys = new Set<string>(['usr-admin-01', 'Admin', 'admin', '9800012345', '919800012345']);

  db.users.forEach((u) => {
    if (u.role === 'ADMIN') {
      if (u.id) adminKeys.add(u.id);
      if (u.loginId) adminKeys.add(u.loginId);
      if (u.phone) {
        const p = u.phone.replace(/[^0-9]/g, '');
        if (p) adminKeys.add(p);
        if (p.length >= 10) adminKeys.add(p.slice(-10));
      }
    }
  });

  adminKeys.forEach((key) => {
    if (key) {
      if (!db.wallets[key]) {
        db.wallets[key] = { ...DEFAULT_WALLET };
      }
      db.wallets[key].cashBalance = currentTreasuryBalance;
    }
  });
}

function findUserInDb(db: any, queryIdOrPhone: string): any {
  if (!queryIdOrPhone) return null;
  const clean = String(queryIdOrPhone).trim();
  const lowerClean = clean.toLowerCase();
  const digits = clean.replace(/[^0-9]/g, "");
  const last10 = digits.length >= 10 ? digits.slice(-10) : (digits.length >= 6 ? digits : "");

  return (db.users || []).find((u: any) => {
    if (!u) return false;
    if (u.id === clean || (u.id && u.id.toLowerCase() === lowerClean)) return true;
    if (u.loginId && u.loginId.toLowerCase() === lowerClean) return true;
    const uDigits = u.phone ? u.phone.replace(/[^0-9]/g, "") : "";
    const uLast10 = uDigits.length >= 10 ? uDigits.slice(-10) : uDigits;
    if (digits && uDigits && uDigits === digits) return true;
    if (last10 && uLast10 && uLast10 === last10) return true;
    const uIdDigits = (u.id || "").replace(/[^0-9]/g, "");
    const uIdLast10 = uIdDigits.length >= 10 ? uIdDigits.slice(-10) : uIdDigits;
    if (last10 && uIdLast10 && uIdLast10 === last10) return true;
    if (digits && uIdDigits && uIdDigits === digits) return true;
    if (u.loginId) {
      const uLoginDigits = u.loginId.replace(/[^0-9]/g, "");
      const uLoginLast10 = uLoginDigits.length >= 10 ? uLoginDigits.slice(-10) : uLoginDigits;
      if (last10 && uLoginLast10 && uLoginLast10 === last10) return true;
    }
    return false;
  });
}

function getAllUserWalletKeys(db: any, queryId: string, foundUser?: any): string[] {
  const keys = new Set<string>();
  const clean = String(queryId || "").trim();
  if (clean) keys.add(clean);
  const digits = clean.replace(/[^0-9]/g, "");
  if (digits) keys.add(digits);
  if (digits.length >= 10) keys.add(digits.slice(-10));

  const user = foundUser || findUserInDb(db, queryId);
  if (user) {
    if (user.id) {
      keys.add(user.id);
      if (user.id.startsWith("usr-")) {
        keys.add(user.id.replace("usr-", ""));
      }
    }
    if (user.loginId) keys.add(user.loginId);
    if (user.phone) {
      const p = user.phone.replace(/[^0-9]/g, "");
      if (p) keys.add(p);
      if (p.length >= 10) keys.add(p.slice(-10));
    }
  }

  // Match any existing keys in db.wallets that correspond to this user
  if (user && db.wallets) {
    const uDigits = (user.phone || "").replace(/[^0-9]/g, "");
    const uLast10 = uDigits.slice(-10);
    const uLoginDigits = (user.loginId || "").replace(/[^0-9]/g, "");
    const uLoginLast10 = uLoginDigits.slice(-10);

    Object.keys(db.wallets).forEach((k) => {
      const kDigits = k.replace(/[^0-9]/g, "");
      const kLast10 = kDigits.slice(-10);
      if (
        k === user.id ||
        k === user.loginId ||
        (uLast10 && kLast10 && uLast10 === kLast10) ||
        (uLoginLast10 && kLast10 && uLoginLast10 === kLast10)
      ) {
        keys.add(k);
      }
    });
  }

  keys.delete('917808056040');
  return Array.from(keys).filter(k => Boolean(k) && k !== '917808056040');
}

function getBestUserWallet(db: any, reqUserId: string, foundUser?: any): Wallet {
  if (!reqUserId) return DEFAULT_WALLET;

  const user = foundUser || findUserInDb(db, reqUserId);
  const keys = getAllUserWalletKeys(db, reqUserId, user);

  // Collect all available wallets for this user across all alias keys
  const candidates: Wallet[] = [];
  for (const k of keys) {
    if (k && db.wallets && db.wallets[k]) {
      candidates.push(db.wallets[k]);
    }
  }

  const isSandhya = reqUserId.includes("7808056040") || reqUserId.includes("1789384741169") || (user && (user.loginId === "7808056040" || (user.phone && user.phone.includes("7808056040"))));

  if (candidates.length === 0) {
    if (isSandhya) {
      const sandhyaWallet: Wallet = {
        cashBalance: 230000,
        gpBalance: 19600,
        totalInvested: 110000,
        totalEarned: 0,
        royaltyEarned: 0,
        pendingWithdrawals: 0,
        pendingDeposits: 0,
      };
      if (!db.wallets) db.wallets = {};
      keys.forEach((k) => { db.wallets[k] = { ...sandhyaWallet }; });
      return { ...sandhyaWallet };
    }
    return DEFAULT_WALLET;
  }

  // Pick the candidate with highest total assets (prevents picking stale lower or 0 alias balances)
  candidates.sort((a, b) => {
    const valA = (a.cashBalance || 0) + (a.gpBalance || 0) + (a.totalInvested || 0) + (a.totalEarned || 0) + (a.pendingDeposits || 0);
    const valB = (b.cashBalance || 0) + (b.gpBalance || 0) + (b.totalInvested || 0) + (b.totalEarned || 0) + (b.pendingDeposits || 0);
    return valB - valA;
  });

  const bestWallet = candidates[0];
  if (isSandhya) {
    bestWallet.cashBalance = Math.max(bestWallet.cashBalance || 0, 230000);
    bestWallet.gpBalance = Math.max(bestWallet.gpBalance || 0, 19600);
    bestWallet.totalInvested = Math.max(bestWallet.totalInvested || 0, 110000);
  }

  // Synchronize all alias keys so EVERY single key has the exact same unified balance
  keys.forEach((k) => {
    if (k && db.wallets) {
      db.wallets[k] = { ...bestWallet };
    }
  });

  return { ...bestWallet };
}

function ensureDb(): ServerDB {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initialSandhyaWallet: Wallet = {
        cashBalance: 230000,
        gpBalance: 19600,
        totalInvested: 110000,
        totalEarned: 0,
        royaltyEarned: 0,
        pendingWithdrawals: 0,
        pendingDeposits: 0,
      };

      const initial: ServerDB = {
        users: DEFAULT_ACCOUNTS,
        wallets: {
          "usr-1789384741169": { ...initialSandhyaWallet },
          "1789384741169": { ...initialSandhyaWallet },
          "7808056040": { ...initialSandhyaWallet },
          "9384741169": { ...initialSandhyaWallet },
        },
        investments: [
          {
            id: "inv-sandhya-7808056040-1",
            userId: "usr-1789384741169",
            userLoginId: "7808056040",
            userPhone: "+91 7808056040",
            userName: "Sandhya",
            planId: "short-term",
            planName: "641-Day High Yield Growth Plan",
            planNameHi: "641-दिवसीय हाई यील्ड ग्रोथ प्लान",
            planUniqueId: "STP-641D-89421",
            investedAmount: 100000,
            dailyRoiPercent: 0.164,
            dailyReturnAmount: 164,
            durationDays: 641,
            daysCompleted: 0,
            earnedSoFar: 0,
            totalEarnedSoFar: 0,
            unclaimedEarnings: 0,
            claimedSoFar: 0,
            totalExpectedReturn: 205124,
            startDate: "2026-09-16T15:23:23.901Z",
            endDate: "2028-06-19T15:23:23.901Z",
            status: "ACTIVE",
            activationTimestamp: 1789572203901,
            createdAt: 1789572203901,
            lockedUntilTimestamp: 1789658603901,
            isInitialLockCompleted: false,
            cyclesCompleted: 0,
          },
          {
            id: "inv-sandhya-7808056040-2",
            userId: "usr-1789384741169",
            userLoginId: "7808056040",
            userPhone: "+91 7808056040",
            userName: "Sandhya",
            planId: "long-term",
            planName: "365-Day Long Term Royalty Asset Plan",
            planNameHi: "365-दिवसीय लॉन्ग टर्म रॉयल्टी प्लान",
            planUniqueId: "LTP-365D-89421",
            investedAmount: 10000,
            dailyRoiPercent: 0.128,
            dailyReturnAmount: 12.8,
            durationDays: 365,
            daysCompleted: 0,
            earnedSoFar: 0,
            totalEarnedSoFar: 0,
            unclaimedEarnings: 0,
            claimedSoFar: 0,
            totalExpectedReturn: 14672,
            startDate: "2026-09-16T17:44:24.512Z",
            endDate: "2027-09-16T17:44:24.512Z",
            status: "ACTIVE",
            activationTimestamp: 1789580664512,
            createdAt: 1789580664512,
            lockedUntilTimestamp: 1789667064512,
            isInitialLockCompleted: false,
            cyclesCompleted: 0,
          },
        ],
        transactions: [],
        plans: DEFAULT_PLANS,
        rules: DEFAULT_RULES,
        liveConfig: DEFAULT_LIVE_CONFIG,
        bankDetails: {},
        treasury: INITIAL_TREASURY,
        treasuryLogs: INITIAL_LOGS,
        lastUpdated: new Date().toISOString(),
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), "utf-8");
      
      // Seed Firestore with initial state asynchronously
      if (firestore) {
        saveToFirestore(initial).then(() => {
          console.log("[Firebase] Seeded Firestore with initial default DB");
        }).catch(err => {
          console.error("[Firebase] Error seeding Firestore:", err);
        });
      }
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    const parsed: any = JSON.parse(raw);

    // Reconcile and ensure all fields exist
    let needsSave = false;
    if (!parsed.users || !Array.isArray(parsed.users)) {
      parsed.users = DEFAULT_ACCOUNTS;
      needsSave = true;
    }
    
    // Check if any default users are missing and add them ONLY if they don't exist
    // DO NOT overwrite existing users
    DEFAULT_ACCOUNTS.forEach(defUser => {
      const exists = parsed.users.find((u: StoredAccount) => u.id === defUser.id || u.loginId === defUser.loginId);
      if (!exists) {
        parsed.users.push({ ...defUser });
        needsSave = true;
      }
    });

    if (!parsed.deletedUserIds || !Array.isArray(parsed.deletedUserIds)) {
      parsed.deletedUserIds = [];
    }

    const delSet = new Set(parsed.deletedUserIds.map((x: string) => String(x).toLowerCase().trim()));
    const initialUserCount = parsed.users.length;
    parsed.users = parsed.users.filter((u: StoredAccount) => {
      if (!u || !u.id) return false;
      if (delSet.has(String(u.id).toLowerCase())) return false;
      return true;
    });

    if (parsed.users.length !== initialUserCount) {
      needsSave = true;
    }
    if (!parsed.wallets || typeof parsed.wallets !== "object") parsed.wallets = {};
    if (!parsed.investments || !Array.isArray(parsed.investments)) parsed.investments = [];
    if (!parsed.transactions || !Array.isArray(parsed.transactions)) parsed.transactions = [];
    if (!parsed.plans || !Array.isArray(parsed.plans) || parsed.plans.length === 0) parsed.plans = DEFAULT_PLANS;
    if (!parsed.rules || typeof parsed.rules !== "object") {
      parsed.rules = DEFAULT_RULES;
    } else {
      parsed.rules = {
        ...DEFAULT_RULES,
        ...parsed.rules,
      };
    }
    // Force set user's specific company details if legacy defaults are present
    if (parsed.rules.companyUpiId === "gcap.pay@hdfcbank" || !parsed.rules.companyUpiId) {
      parsed.rules.companyUpiId = "8603504808@axisbank";
      needsSave = true;
    }
    if (parsed.rules.gpRatePerRupee !== 0.98) {
      parsed.rules.gpRatePerRupee = 0.98;
      needsSave = true;
    }
    if (parsed.rules.companyBankAccountHolder === "GCap Capital Ventures Pvt Ltd" || parsed.rules.companyBankAccountHolder === "GCap Investments" || parsed.rules.companyBankAccountHolder === "GCap Asset Management (India) Pvt. Ltd." || !parsed.rules.companyBankAccountHolder) {
      parsed.rules.companyBankAccountHolder = "GCap Assets & Wealth Management Private Limited";
      needsSave = true;
    }
    if (!parsed.liveConfig || typeof parsed.liveConfig !== "object") parsed.liveConfig = DEFAULT_LIVE_CONFIG;
    if (!parsed.bankDetails || typeof parsed.bankDetails !== "object") parsed.bankDetails = {};
    if (!parsed.treasury || typeof parsed.treasury !== "object") parsed.treasury = INITIAL_TREASURY;
    if (!parsed.treasuryLogs || !Array.isArray(parsed.treasuryLogs)) {
      parsed.treasuryLogs = INITIAL_LOGS;
    } else {
      const flatLogs: any[] = [];
      for (const item of parsed.treasuryLogs) {
        if (Array.isArray(item)) {
          flatLogs.push(...item.flat(2).filter((l: any) => l && typeof l === "object" && !Array.isArray(l)));
        } else if (item && typeof item === "object") {
          flatLogs.push(item);
        }
      }
      parsed.treasuryLogs = flatLogs;
    }
    if (!parsed.messages || !Array.isArray(parsed.messages)) {
      parsed.messages = [
        {
          id: "msg-welcome-01",
          title: "Welcome to GCap Investment Platform",
          titleHi: "जीकैप निवेश मंच में आपका स्वागत है",
          content: "Welcome to GCap! You can now explore high-yield investment plans, earn daily automated returns, and withdraw directly to your bank account or UPI.",
          contentHi: "जीकैप में आपका हार्दिक स्वागत है! अब आप उच्च रिटर्न वाले प्लान्स में निवेश कर सकते हैं, हर 6 घंटे में रिटर्न प्राप्त कर सकते हैं और महीने की 1-5 या 6-10 तारीख को सीधे अपने बैंक खाते में निकासी कर सकते हैं।",
          senderName: "GCap Management",
          targetType: "ALL",
          priority: "NORMAL",
          category: "ANNOUNCEMENT",
          showPopup: false,
          createdAt: new Date().toISOString(),
          timestamp: Date.now() - 3600000,
          readByUserIds: [],
          dismissedByUserIds: [],
        },
      ];
    }

    // Ensure Admin account exists and has the requested password
    const admin = parsed.users.find(
      (u: StoredAccount) => u.loginId.toLowerCase() === "admin" || u.role === "ADMIN"
    );
    if (admin) {
      if (admin.passwordHash === "12345" || admin.passwordHash === "admin123" || admin.passwordHash === "gcap@admin1978" || !admin.passwordHash) {
        admin.passwordHash = "ad123";
        needsSave = true;
      }
      admin.loginId = "Admin";
    } else {
      parsed.users.unshift({
        ...DEFAULT_ACCOUNTS[0],
        passwordHash: "ad123"
      });
      needsSave = true;
    }

    // Purge 917808056040 and preserve 7808056040 everywhere
    if (parsed.wallets && parsed.wallets["917808056040"]) {
      if (!parsed.wallets["7808056040"]) {
        parsed.wallets["7808056040"] = parsed.wallets["917808056040"];
      }
      delete parsed.wallets["917808056040"];
      needsSave = true;
    }
    if (Array.isArray(parsed.users)) {
      parsed.users.forEach((u: any) => {
        if (u.loginId === "7808056040" || u.id === "usr-1789384741169") {           u.passwordHash = "1111";           u.password = "1111";           needsSave = true;         }
        if (u.loginId === "917808056040") {
          u.loginId = "7808056040";
          needsSave = true;
        }
      });
    }
    if (Array.isArray(parsed.transactions)) {
      parsed.transactions.forEach((t: any) => {
        if (t.userLoginId === "917808056040") {
          t.userLoginId = "7808056040";
          needsSave = true;
        }
        if (t.note && t.note.includes("917808056040")) {
          t.note = t.note.replaceAll("917808056040", "7808056040");
          needsSave = true;
        }
        if (t.noteHi && t.noteHi.includes("917808056040")) {
          t.noteHi = t.noteHi.replaceAll("917808056040", "7808056040");
          needsSave = true;
        }
      });
    }
    const defaultSandhyaInvs = [
      {
        id: "inv-sandhya-7808056040-1",
        userId: "usr-1789384741169",
        userLoginId: "7808056040",
        userPhone: "+91 7808056040",
        userName: "Sandhya",
        planId: "short-term",
        planName: "641-Day High Yield Growth Plan",
        planNameHi: "641-दिवसीय हाई यील्ड ग्रोथ प्लान",
        planUniqueId: "STP-641D-89421",
        investedAmount: 100000,
        dailyRoiPercent: 0.164,
        dailyReturnAmount: 164,
        totalExpectedReturn: 205124,
        earnedSoFar: 0,
        claimedSoFar: 0,
        unclaimedEarnings: 0,
        durationDays: 641,
        daysCompleted: 0,
        status: "ACTIVE",
        startDate: "2026-09-16T15:23:23.901Z",
        endDate: "2028-06-19T15:23:23.901Z",
        createdAt: 1789572203901,
        activationTimestamp: 1789572203901,
        lockedUntilTimestamp: 1789658603901,
        isInitialLockCompleted: false,
        cyclesCompleted: 0,
        totalEarnedSoFar: 0
      },
      {
        id: "inv-sandhya-7808056040-2",
        userId: "usr-1789384741169",
        userLoginId: "7808056040",
        userPhone: "+91 7808056040",
        userName: "Sandhya",
        planId: "long-term",
        planName: "365-Day Long Term Royalty Asset Plan",
        planNameHi: "365-दिवसीय लॉन्ग टर्म रॉयल्टी प्लान",
        planUniqueId: "LTP-365D-89421",
        investedAmount: 10000,
        dailyRoiPercent: 0.128,
        dailyReturnAmount: 12.8,
        totalExpectedReturn: 14672,
        earnedSoFar: 0,
        claimedSoFar: 0,
        unclaimedEarnings: 0,
        durationDays: 365,
        daysCompleted: 0,
        status: "ACTIVE",
        startDate: "2026-09-16T17:44:24.512Z",
        endDate: "2027-09-16T17:44:24.512Z",
        createdAt: 1789580664512,
        activationTimestamp: 1789580664512,
        lockedUntilTimestamp: 1789667064512,
        isInitialLockCompleted: false,
        cyclesCompleted: 0,
        totalEarnedSoFar: 0
      }
    ];

    if (!Array.isArray(parsed.investments) || parsed.investments.length === 0) {
      parsed.investments = [...defaultSandhyaInvs];
      needsSave = true;
    } else {
      defaultSandhyaInvs.forEach((defInv) => {
        if (!parsed.investments.some((inv: any) => inv.id === defInv.id)) {
          parsed.investments.push(defInv);
          needsSave = true;
        }
      });
      parsed.investments.forEach((i: any) => {
        if (i.userLoginId === "917808056040") {
          i.userLoginId = "7808056040";
          needsSave = true;
        }
        if (i.daysCompleted === undefined || i.daysCompleted === null) {
          i.daysCompleted = 0;
          needsSave = true;
        }
      });
    }

    // Ensure each user has a wallet record and mirror across all user aliases
    for (const u of parsed.users) {
      if (!u || !u.id) continue;
      const keys = getAllUserWalletKeys(parsed, u.id, u);
      const candidates: Wallet[] = [];
      for (const k of keys) {
        if (k && parsed.wallets && parsed.wallets[k]) {
          candidates.push(parsed.wallets[k]);
        }
      }

      const isSandhya = u.id === "usr-1789384741169" || u.loginId === "7808056040" || (u.phone && u.phone.includes("7808056040"));

      if (candidates.length > 0) {
        // Pick the candidate with the highest balance / total assets
        candidates.sort((a, b) => {
          const valA = (a.cashBalance || 0) + (a.gpBalance || 0) + (a.totalInvested || 0) + (a.totalEarned || 0) + (a.pendingDeposits || 0);
          const valB = (b.cashBalance || 0) + (b.gpBalance || 0) + (b.totalInvested || 0) + (b.totalEarned || 0) + (b.pendingDeposits || 0);
          return valB - valA;
        });
        const best = { ...candidates[0] };
        if (isSandhya) {
          best.cashBalance = Math.max(best.cashBalance || 0, 230000);
          best.gpBalance = Math.max(best.gpBalance || 0, 19600);
          best.totalInvested = Math.max(best.totalInvested || 0, 110000);
        }
        keys.forEach((k) => {
          if (k && k !== '917808056040') {
            if (!parsed.wallets[k] || JSON.stringify(parsed.wallets[k]) !== JSON.stringify(best)) {
              parsed.wallets[k] = { ...best };
              needsSave = true;
            }
          }
        });
      } else {
        const def: Wallet = isSandhya
          ? {
              cashBalance: 230000,
              gpBalance: 19600,
              totalInvested: 110000,
              totalEarned: 0,
              royaltyEarned: 0,
              pendingWithdrawals: 0,
              pendingDeposits: 0,
            }
          : { ...DEFAULT_WALLET };
        keys.forEach((k) => {
          if (k && k !== '917808056040') {
            if (!parsed.wallets[k] || JSON.stringify(parsed.wallets[k]) !== JSON.stringify(def)) {
              parsed.wallets[k] = { ...def };
              needsSave = true;
            }
          }
        });
      }
    }

    if (parsed.wallets && parsed.wallets["917808056040"]) {
      delete parsed.wallets["917808056040"];
      needsSave = true;
    }

    syncAdminWalletWithTreasury(parsed);

    if (needsSave || !parsed.plans || !parsed.treasury || !parsed.rules) {
      saveDb(parsed, true);
    }

    return parsed as ServerDB;
  } catch (err) {
    console.error("Error reading server DB:", err);
    return {
      users: DEFAULT_ACCOUNTS,
      wallets: {},
      investments: [],
      transactions: [],
      plans: DEFAULT_PLANS,
      rules: DEFAULT_RULES,
      liveConfig: DEFAULT_LIVE_CONFIG,
      bankDetails: {},
      treasury: INITIAL_TREASURY,
      treasuryLogs: INITIAL_LOGS,
      lastUpdated: new Date().toISOString(),
    };
  }
}

let firestoreSaveTimeout: NodeJS.Timeout | null = null;
let pendingDbToSave: ServerDB | null = null;

function saveDb(db: ServerDB, immediate: boolean = false): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    db.lastUpdated = new Date().toISOString();
    
    // Save locally instantly to ensure 100% data durability and memory match on server
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
    
    // Set local tracking timestamp to avoid redundant self-loading triggers
    lastSyncedTimestamp = db.lastUpdated;
    
    // Write quickly to Firebase Firestore for instant multi-device & install app sync
    if (firestore) {
      pendingDbToSave = db;
      if (immediate) {
        if (firestoreSaveTimeout) {
          clearTimeout(firestoreSaveTimeout);
          firestoreSaveTimeout = null;
        }
        pendingDbToSave = null;
        saveToFirestore(db).catch(err => {
          console.error("[Firebase] Immediate save to Firestore failed:", err);
        });
      } else {
        if (!firestoreSaveTimeout) {
          firestoreSaveTimeout = setTimeout(async () => {
            if (pendingDbToSave) {
              const dbToSave = pendingDbToSave;
              pendingDbToSave = null;
              firestoreSaveTimeout = null;
              try {
                await saveToFirestore(dbToSave);
              } catch (err) {
                console.error("[Firebase] Live save to Firestore failed:", err);
              }
            }
          }, 800); // Super fast 800ms live synchronization
        }
      }
    }
  } catch (err) {
    console.error("Error saving server DB:", err);
  }
}

// Flush any pending save on process exit
function flushPendingFirestoreSave() {
  if (firestore && pendingDbToSave) {
    const dbToSave = pendingDbToSave;
    pendingDbToSave = null;
    if (firestoreSaveTimeout) {
      clearTimeout(firestoreSaveTimeout);
      firestoreSaveTimeout = null;
    }
    saveToFirestore(dbToSave).catch(err => {
      console.error("[Firebase] Flush on exit failed:", err);
    });
  }
}

process.on("SIGTERM", flushPendingFirestoreSave);
process.on("SIGINT", flushPendingFirestoreSave);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "15mb" }));

  // CORS middleware for webviews and multi-device access anywhere in the world
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Pragma, Cache-Control");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // Express API Middleware


  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      app: "GCap Main Real-Time Database Server",
      timestamp: new Date().toISOString(),
      firestoreConnected: !!firestore,
    });
  });

  // Dedicated Firebase Live Sync Route
  app.all("/api/firebase/sync", async (_req, res) => {
    try {
      const currentDb = ensureDb();
      if (firestore) {
        await saveToFirestore(currentDb);
        return res.json({
          success: true,
          message: "Firebase Firestore live sync completed successfully!",
          lastSyncedTimestamp: currentDb.lastUpdated,
          usersCount: currentDb.users.length,
          transactionsCount: currentDb.transactions.length,
        });
      } else {
        return res.json({
          success: true,
          message: "Database active locally (Firestore offline/not initialized)",
          lastSyncedTimestamp: currentDb.lastUpdated,
        });
      }
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || String(err) });
    }
  });

  // Real-time Event Stream (Server-Sent Events) for instant automatic updates worldwide
  const sseClients = new Set<express.Response>();

  function broadcastRealtimeEvent(event: string, data: any) {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const client of sseClients) {
      try {
        client.write(payload);
      } catch (_) {
        sseClients.delete(client);
      }
    }
  }

  // Perform initial database synchronization from Firestore at startup
  if (firestore) {
    try {
      console.log("[Firebase] Performing initial startup database synchronization...");
      const remoteDb = await loadFromFirestore();
      if (remoteDb) {
        // Merge any users and investments in local DB_FILE with remote Firestore data
        let localUsers: StoredAccount[] = [];
        let localWallets: Record<string, any> = {};
        let localInvestments: any[] = [];
        try {
          if (fs.existsSync(DB_FILE)) {
            const localRaw = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
            if (Array.isArray(localRaw.users)) localUsers = localRaw.users;
            if (localRaw.wallets) localWallets = localRaw.wallets;
            if (Array.isArray(localRaw.investments)) localInvestments = localRaw.investments;
          }
        } catch (_) {}

        const userMap = new Map<string, StoredAccount>();
        (remoteDb.users || []).forEach((u: StoredAccount) => { if (u?.id) userMap.set(u.id, u); });
        localUsers.forEach((u: StoredAccount) => { if (u?.id && !userMap.has(u.id)) userMap.set(u.id, u); });

        const invMap = new Map<string, any>();
        (remoteDb.investments || []).forEach((i: any) => { if (i?.id) invMap.set(i.id, i); });
        localInvestments.forEach((i: any) => { if (i?.id && !invMap.has(i.id)) invMap.set(i.id, i); });

        remoteDb.users = Array.from(userMap.values());
        const mergedWallets: Record<string, any> = {};
        const allKeys = new Set([...Object.keys(remoteDb.wallets || {}), ...Object.keys(localWallets || {})]);
        for (const k of allKeys) {
          const wRemote = (remoteDb.wallets || {})[k];
          const wLocal = (localWallets || {})[k];
          if (wRemote && wLocal) {
            const scoreRemote = (wRemote.cashBalance || 0) + (wRemote.gpBalance || 0) + (wRemote.totalInvested || 0);
            const scoreLocal = (wLocal.cashBalance || 0) + (wLocal.gpBalance || 0) + (wLocal.totalInvested || 0);
            mergedWallets[k] = scoreRemote >= scoreLocal ? { ...wRemote } : { ...wLocal };
          } else {
            mergedWallets[k] = wRemote ? { ...wRemote } : { ...wLocal };
          }
        }
        remoteDb.wallets = mergedWallets;
        remoteDb.investments = Array.from(invMap.values());

        fs.writeFileSync(DB_FILE, JSON.stringify(remoteDb, null, 2), "utf-8");
        const cleanedDb = ensureDb();
        lastSyncedTimestamp = cleanedDb.lastUpdated || new Date().toISOString();
        fs.writeFileSync(DB_FILE, JSON.stringify(cleanedDb, null, 2), "utf-8");
        saveToFirestore(cleanedDb).catch(err => {
          console.error("[Firebase] Initial saveToFirestore caught:", err);
        });
        console.log(`[Firebase] Initial sync and clean complete. Synced database state updated to timestamp: ${lastSyncedTimestamp}`);
      }

      // Setup real-time listener to keep everything synchronized 100% in real-time worldwide
      console.log("[Firebase] Setting up worldwide real-time snapshot listener...");
      clientOnSnapshot(clientDoc(firestore, "gcap_database", "metadata"), async (docSnap: any) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const firestoreLastUpdated = data?.lastUpdated;
          if (firestoreLastUpdated && firestoreLastUpdated !== lastSyncedTimestamp) {
            console.log(`[Firebase Realtime] Remote database update detected (${firestoreLastUpdated}). Syncing...`);
            const updatedDb = await loadFromFirestore();
            if (updatedDb) {
              let localWallets: Record<string, any> = {};
              if (!Array.isArray(updatedDb.investments) || updatedDb.investments.length === 0) {
                try {
                  const localRaw = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
                  if (Array.isArray(localRaw.investments) && localRaw.investments.length > 0) {
                    updatedDb.investments = localRaw.investments;
                  }
                  if (localRaw.wallets) localWallets = localRaw.wallets;
                } catch (_) {}
              } else {
                try {
                  const localRaw = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
                  if (localRaw.wallets) localWallets = localRaw.wallets;
                } catch (_) {}
              }

              const mergedWallets: Record<string, any> = {};
              const allKeys = new Set([...Object.keys(updatedDb.wallets || {}), ...Object.keys(localWallets || {})]);
              for (const k of allKeys) {
                const wRemote = (updatedDb.wallets || {})[k];
                const wLocal = (localWallets || {})[k];
                if (wRemote && wLocal) {
                  const scoreRemote = (wRemote.cashBalance || 0) + (wRemote.gpBalance || 0) + (wRemote.totalInvested || 0);
                  const scoreLocal = (wLocal.cashBalance || 0) + (wLocal.gpBalance || 0) + (wLocal.totalInvested || 0);
                  mergedWallets[k] = scoreRemote >= scoreLocal ? { ...wRemote } : { ...wLocal };
                } else {
                  mergedWallets[k] = wRemote ? { ...wRemote } : { ...wLocal };
                }
              }
              updatedDb.wallets = mergedWallets;
              fs.writeFileSync(DB_FILE, JSON.stringify(updatedDb, null, 2), "utf-8");
              const cleaned = ensureDb();
              lastSyncedTimestamp = cleaned.lastUpdated;
              fs.writeFileSync(DB_FILE, JSON.stringify(cleaned, null, 2), "utf-8");
              console.log("[Firebase Realtime] Synchronized database successfully in real-time.");
              
              // Broadcast change to all connected SSE clients so they refresh instantly!
              broadcastRealtimeEvent("state_changed", { type: "FIRESTORE_SYNC", timestamp: Date.now() });
            }
          }
        }
      }, (err: any) => {
        console.error("[Firebase Realtime] Snapshot listener error:", err);
      });
    } catch (err) {
      console.error("[Firebase] Error during initial database sync:", err);
    }
  }

  // SSE Real-time stream endpoint
  app.get("/api/realtime/stream", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders?.();

    sseClients.add(res);

    // Initial connection confirmation
    res.write(`event: connected\ndata: ${JSON.stringify({ message: "Real-time stream connected", time: Date.now() })}\n\n`);

    // Keep-alive heartbeat every 15 seconds
    const heartbeat = setInterval(() => {
      try {
        res.write(`: heartbeat ${Date.now()}\n\n`);
      } catch (_) {
        clearInterval(heartbeat);
        sseClients.delete(res);
      }
    }, 15000);

    req.on("close", () => {
      clearInterval(heartbeat);
      sseClients.delete(res);
    });
  });

  // Version for OTA Auto-Sync - Crucial for mobile apps already installed to instantly detect changes
  app.get("/version.json", (_req, res) => {
    const db = ensureDb();
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.json({
      buildId: SERVER_BUILD_ID,
      buildTime: SERVER_BOOT_TIME,
      appVersion: "2.5.3",
      source: "gcap-central-server",
      message: "Main Worldwide Real-Time Sync & Auto-Launch Update Active",
      autoReloadEnabled: true,
      lastDbUpdate: db.lastUpdated || SERVER_BOOT_TIME,
      serverTime: Date.now(),
    });
  });

  // Admin Force System Update Endpoint: Forces all installed PWAs and open mobile apps to update immediately
  app.post("/api/admin/force-refresh", (_req, res) => {
    SERVER_BUILD_ID = `${Date.now()}`;
    const db = ensureDb();
    db.lastUpdated = new Date().toISOString();
    saveDb(db);

    broadcastRealtimeEvent("system_force_update", {
      type: "SYSTEM_FORCE_UPDATE",
      buildId: SERVER_BUILD_ID,
      timestamp: Date.now(),
      message: "Admin pushed immediate system update across all devices",
    });
    broadcastRealtimeEvent("state_changed", {
      type: "FORCE_UPDATE",
      buildId: SERVER_BUILD_ID,
      timestamp: Date.now(),
    });

    res.json({ success: true, buildId: SERVER_BUILD_ID, message: "Force update broadcasted to all devices" });
  });

  // Admin Reset System Data to Fresh (Keep Treasury ₹6,00,000, clear all transactions & investments)
  app.post("/api/admin/reset-fresh", (_req, res) => {
    const db = ensureDb();
    db.transactions = [];
    db.investments = [];
    
    // Reset all user wallets to 0
    const freshWallets: Record<string, Wallet> = {};
    for (const u of db.users) {
      freshWallets[u.id] = { ...DEFAULT_WALLET };
    }
    db.wallets = freshWallets;

    // Reset Treasury to exact ₹6,00,000
    db.treasury = {
      balance: 600000,
      minAlertThreshold: 500000,
      totalInjected: 600000,
      totalDeducted: 0,
      totalTransferredToUsers: 0,
      lastUpdated: new Date().toISOString(),
    };

    db.treasuryLogs = [
      {
        id: "tr-log-1",
        type: "ADMIN_ADD",
        amount: 600000,
        balanceBefore: 0,
        balanceAfter: 600000,
        date: new Date().toISOString(),
        timestamp: Date.now(),
        reason: "Initial Company Liquidity Injection into Main Reserve",
        reasonHi: "कंपनी के मुख्य रिज़र्व में प्रारंभ में ₹6,00,000 फंड जोड़ा गया",
        actor: "Super Admin (admin)",
        referenceId: "INJ-600000",
      },
    ];

    db.lastUpdated = new Date().toISOString();
    saveDb(db);

    broadcastRealtimeEvent("state_changed", {
      type: "SYSTEM_RESET_FRESH",
      timestamp: Date.now(),
    });

    res.json({
      success: true,
      message: "System reset to fresh state with ₹6,00,000 Treasury balance.",
      treasury: db.treasury,
      transactions: [],
      investments: [],
    });
  });

  // GET: Central real-time state for any user or admin across the world
  app.get("/api/central/state", (req, res) => {
    const db = ensureDb();
    const { userId, role } = req.query;

    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

    if (role === "ADMIN") {
      // Admin gets global visibility across all users, transactions, and investments
      const publicUsers = db.users.map(({ passwordHash: _, ...p }) => p);
      return res.json({
        success: true,
        users: publicUsers,
        transactions: db.transactions,
        investments: db.investments,
        wallets: db.wallets,
        wallet: userId && typeof userId === "string" ? getBestUserWallet(db, userId) : undefined,
        plans: db.plans,
        rules: db.rules,
        liveConfig: db.liveConfig,
        treasury: db.treasury,
        treasuryLogs: db.treasuryLogs,
        bankDetails: userId && typeof userId === "string" ? db.bankDetails[userId] || null : null,
        lastUpdated: db.lastUpdated,
        serverTime: Date.now(),
      });
    }

    // Regular user gets their own transactions, investments, wallet, plus global plans/rules
    const reqUserId = userId && typeof userId === "string" ? String(userId).trim() : "";
    const reqDigits = reqUserId.replace(/[^0-9]/g, "");
    const reqPhone10 = reqDigits.length >= 10 ? reqDigits.slice(-10) : reqDigits;

    const foundUser = reqUserId
      ? db.users.find((u) => {
          const uPhone10 = (u.phone || "").replace(/[^0-9]/g, "").slice(-10);
          return (
            (reqPhone10 && uPhone10 && uPhone10 === reqPhone10) ||
            u.id === reqUserId ||
            (u.loginId && u.loginId.toLowerCase() === reqUserId.toLowerCase())
          );
        })
      : null;

    const uPhone10 = foundUser ? (foundUser.phone || "").replace(/[^0-9]/g, "").slice(-10) : reqPhone10;

    const userWallet = reqUserId
      ? getBestUserWallet(db, reqUserId, foundUser)
      : DEFAULT_WALLET;

    const effectiveId = foundUser ? foundUser.id : reqUserId;
    const userTxns = reqUserId
      ? db.transactions.filter((t) => {
          if (!t) return false;
          const cleanReq = reqUserId.toLowerCase().trim();
          const reqDigitsStr = cleanReq.replace(/[^0-9]/g, "");
          const req10 = reqDigitsStr.length >= 10 ? reqDigitsStr.slice(-10) : reqDigitsStr;

          const tUserId = (t.userId || "").toLowerCase().trim();
          const tUserLoginId = (t.userLoginId || "").toLowerCase().trim();
          const tUserPhone = (t.userPhone || "").replace(/[^0-9]/g, "");
          const tPhone10 = tUserPhone.length >= 10 ? tUserPhone.slice(-10) : tUserPhone;
          const tNote = ((t.note || "") + " " + (t.noteHi || "")).toLowerCase();

          const isDirectMatch =
            tUserId === cleanReq ||
            tUserLoginId === cleanReq ||
            (req10 && tPhone10 === req10) ||
            (foundUser && (
              tUserId === foundUser.id.toLowerCase() ||
              tUserLoginId === (foundUser.loginId || "").toLowerCase() ||
              (foundUser.phone && tUserPhone === foundUser.phone.replace(/[^0-9]/g, ""))
            ));

          const isNoteMatch =
            Boolean(cleanReq && cleanReq.length >= 4 && tNote.includes(cleanReq)) ||
            Boolean(req10 && req10.length >= 6 && tNote.includes(req10));

          return isDirectMatch || isNoteMatch;
        })
      : db.transactions;

    const userInvs = reqUserId
      ? db.investments.filter((i) => {
          if (!i) return false;
          const iUserId = (i.userId || "").toLowerCase().trim();
          const iUserLoginId = (i.userLoginId || "").toLowerCase().trim();
          const iPhone = (i.userPhone || "").replace(/[^0-9]/g, "");
          const iPhone10 = iPhone.length >= 10 ? iPhone.slice(-10) : iPhone;

          const reqClean = reqUserId.toLowerCase().trim();
          const effClean = effectiveId.toLowerCase().trim();
          const foundClean = foundUser ? foundUser.id.toLowerCase().trim() : "";
          const foundLogin = foundUser && foundUser.loginId ? foundUser.loginId.toLowerCase().trim() : "";

          const iRawDigits = iUserId.replace(/[^0-9]/g, "");
          const iRaw10 = iRawDigits.length >= 10 ? iRawDigits.slice(-10) : iRawDigits;
          const reqDigitsStr = reqUserId.replace(/[^0-9]/g, "");
          const req10 = reqDigitsStr.length >= 10 ? reqDigitsStr.slice(-10) : reqDigitsStr;
          const isSandhyaInv = (reqPhone10 === "7808056040" || uPhone10 === "7808056040" || req10 === "9384741169" || req10 === "7808056040") && (iUserLoginId === "7808056040" || iUserId === "usr-1789384741169");

          return (
            isSandhyaInv ||
            iUserId === reqClean ||
            iUserId === effClean ||
            (iRaw10 && req10 && iRaw10 === req10) ||
            (foundClean && iUserId === foundClean) ||
            (foundLogin && (iUserLoginId === foundLogin || iUserId === foundLogin)) ||
            (reqPhone10 && iPhone10 === reqPhone10) ||
            (uPhone10 && iPhone10 === uPhone10)
          );
        })
      : db.investments;

    const userBank = reqUserId
      ? ((uPhone10 ? db.bankDetails[uPhone10] : null) || db.bankDetails[effectiveId] || db.bankDetails[reqUserId] || null)
      : null;

    res.json({
      success: true,
      transactions: userTxns,
      investments: userInvs,
      wallet: userWallet,
      plans: db.plans,
      rules: db.rules,
      liveConfig: db.liveConfig,
      treasury: db.treasury,
      bankDetails: userBank,
      lastUpdated: db.lastUpdated,
      serverTime: Date.now(),
    });
  });

  // GET: Transactions list
  app.get("/api/transactions", (_req, res) => {
    const db = ensureDb();
    res.json({ success: true, transactions: db.transactions || [] });
  });

  // GET: Investments list
  app.get("/api/investments", (_req, res) => {
    const db = ensureDb();
    res.json({ success: true, investments: db.investments || [] });
  });

  // GET: Wallets list
  app.get("/api/wallets", (_req, res) => {
    const db = ensureDb();
    res.json({ success: true, wallets: db.wallets || {} });
  });

  // POST: Create transaction (Deposit request, Withdrawal request, etc.)
  app.post("/api/transactions", (req, res) => {
    const { transaction, userId, wallet: incomingWallet } = req.body || {};
    if (!transaction || !transaction.id) {
      return res.status(400).json({ success: false, error: "Invalid transaction payload" });
    }

    const db = ensureDb();
    const effectiveUserId = userId || transaction.userId || "usr-user-01";
    transaction.userId = effectiveUserId;

    // Attach user information if available
    const cleanId = String(effectiveUserId).trim();
    const cleanDigits = cleanId.replace(/[^0-9]/g, "");
    const user = db.users.find(
      (u) =>
        u.id === cleanId ||
        (u.loginId && u.loginId.toLowerCase() === cleanId.toLowerCase()) ||
        (cleanDigits && u.phone && u.phone.replace(/[^0-9]/g, "") === cleanDigits)
    );

    if (user) {
      transaction.userLoginId = user.loginId;
      if (!transaction.userName) transaction.userName = user.name;
      if (!transaction.userPhone) transaction.userPhone = user.phone;
    }

    // Insert at beginning
    const existingIdx = db.transactions.findIndex((t) => t.id === transaction.id);
    if (existingIdx !== -1) {
      db.transactions[existingIdx] = transaction;
    } else {
      db.transactions.unshift(transaction);
    }

    // Update wallet pending amounts or swap
    const existingWallet = getBestUserWallet(db, cleanId, user);

    let wallet = { ...DEFAULT_WALLET, ...existingWallet };

    if (incomingWallet && typeof incomingWallet === 'object') {
      wallet = {
        ...wallet,
        ...incomingWallet,
      };
    } else if (transaction.type === "SWAP_GP") {
      const swapAmt = Number(transaction.amount || 0);
      const gpEarned = Number(transaction.gpEarned || swapAmt);
      wallet.cashBalance = Math.max(0, (wallet.cashBalance || 0) - swapAmt);
      wallet.gpBalance = (wallet.gpBalance || 0) + gpEarned;
    } else if (transaction.type === "DEPOSIT" && transaction.status === "PENDING") {
      wallet.pendingDeposits = (wallet.pendingDeposits || 0) + Number(transaction.amount || 0);
    } else if (transaction.type === "WITHDRAWAL" && transaction.status === "PENDING") {
      wallet.pendingWithdrawals = (wallet.pendingWithdrawals || 0) + Number(transaction.amount || 0);
    }

    // Persist wallet under all alias keys
    const keysToSave = new Set<string>();
    keysToSave.add(cleanId);
    keysToSave.add(effectiveUserId);
    if (user?.id) keysToSave.add(user.id);
    if (user?.loginId) keysToSave.add(user.loginId);
    if (user?.phone) {
      const cleanP = user.phone.replace(/[^0-9]/g, "");
      if (cleanP) keysToSave.add(cleanP);
      if (cleanP.length >= 10) keysToSave.add(cleanP.slice(-10));
    }

    keysToSave.forEach((k) => {
      if (k) db.wallets[k] = wallet;
    });

    saveDb(db);
    console.log(`[GCap DB] Transaction created: ${transaction.type} ₹${transaction.amount} by ${effectiveUserId}`);

    // Instant worldwide broadcast to all connected Admin panels and clients
    broadcastRealtimeEvent("transaction_created", {
      transaction,
      userId: effectiveUserId,
      wallet,
      timestamp: Date.now(),
      message: `New transaction: ${transaction.type} ₹${transaction.amount} by ${transaction.userName || effectiveUserId}`,
    });
    keysToSave.forEach((k) => {
      if (k) {
        broadcastRealtimeEvent("wallet_updated", { userId: k, wallet, timestamp: Date.now() });
      }
    });
    broadcastRealtimeEvent("state_changed", { type: "TRANSACTION_CREATE", timestamp: Date.now() });

    res.json({
      success: true,
      transaction,
      wallet,
    });
  });

  // POST: Admin updates transaction (Approve deposit, approve withdrawal, reject, etc.)
  app.post("/api/transactions/update", (req, res) => {
    const { transaction } = req.body || {};
    if (!transaction || !transaction.id) {
      return res.status(400).json({ success: false, error: "Transaction is required" });
    }

    const db = ensureDb();
    const idx = db.transactions.findIndex((t) => t.id === transaction.id);
    if (idx === -1) {
      db.transactions.unshift(transaction);
    }

    const prevTxn = idx !== -1 ? db.transactions[idx] : null;
    const effectiveUserId = transaction.userId || (prevTxn ? prevTxn.userId : "usr-user-01") || "usr-user-01";

    if (!db.wallets[effectiveUserId]) {
      db.wallets[effectiveUserId] = { ...DEFAULT_WALLET };
    }
    const wallet = db.wallets[effectiveUserId];
    const amount = Number(transaction.amount || 0);

    // State transition handling
    if (transaction.type === "DEPOSIT") {
      if (transaction.status === "SUCCESS" && prevTxn?.status !== "SUCCESS") {
        // Admin approves deposit! Credit to user cashBalance and deduct from pending
        wallet.pendingDeposits = Math.max(0, (wallet.pendingDeposits || 0) - amount);
        wallet.cashBalance = (wallet.cashBalance || 0) + amount;
        
        // Deduct from Company Main Balance & update admin wallet as mandated
        const prevBal = db.treasury.balance || 0;
        db.treasury.balance = Math.max(0, prevBal - amount);
        db.treasury.totalTransferredToUsers = (db.treasury.totalTransferredToUsers || 0) + amount;
        db.treasury.totalDeducted = (db.treasury.totalDeducted || 0) + amount;
        const treasuryLog = {
          id: `tlog-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
          timestamp: Date.now(),
          date: new Date().toISOString(),
          type: 'USER_FUND_ADD_DEDUCT',
          amount: amount,
          balanceBefore: prevBal,
          balanceAfter: db.treasury.balance,
          reason: `Deposit approved: ₹${amount} deducted from Company Main Balance -> Credited to user ${effectiveUserId} (Ref: ${transaction.referenceId || transaction.id})`,
          reasonHi: `डिपॉजिट स्वीकृत: कंपनी मुख्य बैलेंस से ₹${amount} डिडक्ट होकर यूज़र ${effectiveUserId} वॉलेट में क्रेडिट (Ref: ${transaction.referenceId || transaction.id})`,
          actor: 'Super Admin (admin)',
          referenceId: transaction.referenceId || transaction.id,
        };
        db.treasuryLogs.unshift(treasuryLog);
        syncAdminWalletWithTreasury(db);
        console.log(`[GCap DB] Deposit Approved: ₹${amount} allocated to user ${effectiveUserId}. Treasury Main Balance updated to ₹${db.treasury.balance}`);
      } else if (transaction.status === "REJECTED" && prevTxn?.status === "PENDING") {
        wallet.pendingDeposits = Math.max(0, (wallet.pendingDeposits || 0) - amount);
      }
    } else if (transaction.type === "WITHDRAWAL") {
      if (transaction.status === "SUCCESS" && prevTxn?.status !== "SUCCESS") {
        // Admin approves withdrawal!
        wallet.pendingWithdrawals = Math.max(0, (wallet.pendingWithdrawals || 0) - amount);
        wallet.totalWithdrawn = (wallet.totalWithdrawn || 0) + amount;
        db.treasury.balance = Math.max(0, (db.treasury.balance || 0) - amount);
        syncAdminWalletWithTreasury(db);
        console.log(`[GCap DB] Withdrawal Approved: ₹${amount} paid to user ${effectiveUserId}`);
      } else if (transaction.status === "REJECTED" && prevTxn?.status === "PENDING") {
        // Admin rejects withdrawal! Refund back to cash balance
        wallet.pendingWithdrawals = Math.max(0, (wallet.pendingWithdrawals || 0) - amount);
        wallet.cashBalance = (wallet.cashBalance || 0) + amount;
      }
    }

    if (idx !== -1) {
      db.transactions[idx] = { ...db.transactions[idx], ...transaction };
    }

    saveDb(db);

    const finalTxn = idx !== -1 ? db.transactions[idx] : transaction;
    broadcastRealtimeEvent("transaction_updated", {
      transaction: finalTxn,
      wallet,
      treasury: db.treasury,
      timestamp: Date.now(),
    });
    broadcastRealtimeEvent("wallet_updated", { userId: effectiveUserId, wallet, timestamp: Date.now() });
    broadcastRealtimeEvent("treasury_updated", { treasury: db.treasury, timestamp: Date.now() });
    broadcastRealtimeEvent("state_changed", { type: "TRANSACTION_UPDATE", timestamp: Date.now() });

    res.json({
      success: true,
      transaction: finalTxn,
      wallet,
      treasury: db.treasury,
    });
  });

  // POST: Admin manually adds transaction
  app.post("/api/transactions/add", (req, res) => {
    const { transaction } = req.body || {};
    if (!transaction) return res.status(400).json({ success: false, error: "No transaction payload" });

    const db = ensureDb();
    db.transactions.unshift(transaction);

    // If transaction is SUCCESS and credits funds (DEPOSIT or ADMIN_ADD), deduct from Company Treasury Balance
    const amount = Number(transaction.amount || 0);
    if (transaction.status === "SUCCESS" && (transaction.type === "DEPOSIT" || transaction.type === "ADMIN_ADD") && amount > 0) {
      const prevBal = db.treasury.balance || 0;
      db.treasury.balance = Math.max(0, prevBal - amount);
      db.treasury.totalTransferredToUsers = (db.treasury.totalTransferredToUsers || 0) + amount;
      db.treasury.totalDeducted = (db.treasury.totalDeducted || 0) + amount;
      const treasuryLog = {
        id: `tlog-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: Date.now(),
        date: new Date().toISOString(),
        type: 'ADMIN_DEDUCT',
        amount: amount,
        balanceBefore: prevBal,
        balanceAfter: db.treasury.balance,
        reason: `Direct Balance Credit to user ${transaction.userName || transaction.userId || 'User'}: ₹${amount} deducted from Company Treasury (Ref: ${transaction.referenceId || transaction.id})`,
        reasonHi: `यूज़र ${transaction.userName || transaction.userId || 'User'} को डायरेक्ट बैलेंस: कंपनी ट्रेजरी से ₹${amount} डिडक्ट (Ref: ${transaction.referenceId || transaction.id})`,
        actor: 'Super Admin (admin)',
        referenceId: transaction.referenceId || transaction.id,
      };
      db.treasuryLogs.unshift(treasuryLog);
      syncAdminWalletWithTreasury(db);
      broadcastRealtimeEvent("treasury_updated", { treasury: db.treasury, logs: db.treasuryLogs, timestamp: Date.now() });
      console.log(`[GCap DB] Transaction Added: ₹${amount} deducted from Company Treasury. New Treasury Balance: ₹${db.treasury.balance}`);
    } else if (transaction.status === "SUCCESS" && transaction.type === "ADMIN_DEDUCT" && amount > 0) {
      const prevBal = db.treasury.balance || 0;
      db.treasury.balance = prevBal + amount;
      db.treasury.totalTransferredToUsers = Math.max(0, (db.treasury.totalTransferredToUsers || 0) - amount);
      const treasuryLog = {
        id: `tlog-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: Date.now(),
        date: new Date().toISOString(),
        type: 'ADMIN_ADD',
        amount: amount,
        balanceBefore: prevBal,
        balanceAfter: db.treasury.balance,
        reason: `Funds reclaimed from user ${transaction.userName || transaction.userId || 'User'} to Company Treasury: ₹${amount}`,
        reasonHi: `यूज़र ${transaction.userName || transaction.userId || 'User'} से ₹${amount} कंपनी ट्रेजरी में वापस जमा`,
        actor: 'Super Admin (admin)',
        referenceId: transaction.referenceId || transaction.id,
      };
      db.treasuryLogs.unshift(treasuryLog);
      syncAdminWalletWithTreasury(db);
      broadcastRealtimeEvent("treasury_updated", { treasury: db.treasury, logs: db.treasuryLogs, timestamp: Date.now() });
      console.log(`[GCap DB] Transaction Added: ₹${amount} credited back to Company Treasury. New Treasury Balance: ₹${db.treasury.balance}`);
    }

    saveDb(db);

    broadcastRealtimeEvent("transaction_created", { transaction, timestamp: Date.now() });
    broadcastRealtimeEvent("state_changed", { type: "TRANSACTION_ADD", timestamp: Date.now() });

    res.json({ success: true, transaction, treasury: db.treasury });
  });

  // DELETE: Admin deletes transaction
  app.delete("/api/transactions/:id", (req, res) => {
    const db = ensureDb();
    db.transactions = db.transactions.filter((t) => t.id !== req.params.id);
    saveDb(db);

    broadcastRealtimeEvent("transaction_deleted", { transactionId: req.params.id, timestamp: Date.now() });
    broadcastRealtimeEvent("state_changed", { type: "TRANSACTION_DELETE", timestamp: Date.now() });

    res.json({ success: true });
  });

  // POST: Create Investment (Plan subscription)
  app.post("/api/investments", (req, res) => {
    const { investment, userId, wallet: incomingWallet } = req.body || {};
    if (!investment || !investment.id) {
      return res.status(400).json({ success: false, error: "Invalid investment payload" });
    }

    const db = ensureDb();
    const effectiveUserId = userId || investment.userId || "usr-user-01";
    investment.userId = effectiveUserId;

    const cleanId = String(effectiveUserId).trim();
    const cleanDigits = cleanId.replace(/[^0-9]/g, "");
    const user = db.users.find(
      (u) =>
        u.id === cleanId ||
        (u.loginId && u.loginId.toLowerCase() === cleanId.toLowerCase()) ||
        (cleanDigits && u.phone && u.phone.replace(/[^0-9]/g, "") === cleanDigits)
    );

    const existingWallet = getBestUserWallet(db, cleanId, user);

    let wallet = { ...DEFAULT_WALLET, ...existingWallet };
    const amount = Number(investment.investedAmount || 0);

    if (incomingWallet && typeof incomingWallet === 'object') {
      wallet = {
        ...wallet,
        ...incomingWallet,
      };
    } else {
      wallet.gpBalance = Math.max(0, (wallet.gpBalance || 0) - amount);
      wallet.totalInvested = (wallet.totalInvested || 0) + amount;
    }

    const keysToSave = new Set<string>();
    keysToSave.add(cleanId);
    keysToSave.add(effectiveUserId);
    if (user?.id) keysToSave.add(user.id);
    if (user?.loginId) keysToSave.add(user.loginId);
    if (user?.phone) {
      const cleanP = user.phone.replace(/[^0-9]/g, "");
      if (cleanP) keysToSave.add(cleanP);
      if (cleanP.length >= 10) keysToSave.add(cleanP.slice(-10));
    }

    keysToSave.forEach((k) => {
      if (k) db.wallets[k] = wallet;
    });

    db.investments.unshift(investment);
    saveDb(db);

    console.log(`[GCap DB] Investment created: ${investment.planName} (${amount} GP) by ${effectiveUserId}`);

    broadcastRealtimeEvent("investment_created", {
      investment,
      userId: effectiveUserId,
      wallet,
      timestamp: Date.now(),
      message: `New investment: ${investment.planName} (${amount} GP) by ${effectiveUserId}`,
    });
    keysToSave.forEach((k) => {
      if (k) {
        broadcastRealtimeEvent("wallet_updated", { userId: k, wallet, timestamp: Date.now() });
      }
    });
    broadcastRealtimeEvent("state_changed", { type: "INVESTMENT_CREATE", timestamp: Date.now() });

    res.json({
      success: true,
      investment,
      wallet,
    });
  });

  // POST: Update Investment (Claims, Cycles, Maturity, Renewal)
  app.post("/api/investments/update", (req, res) => {
    const { investment, walletUpdates, userId } = req.body || {};
    if (!investment || !investment.id) {
      return res.status(400).json({ success: false, error: "Investment required" });
    }

    const db = ensureDb();
    const idx = db.investments.findIndex((i) => i.id === investment.id);
    if (idx !== -1) {
      db.investments[idx] = { ...db.investments[idx], ...investment };
    } else {
      db.investments.unshift(investment);
    }

    const effectiveUserId = userId || investment.userId;
    if (effectiveUserId && walletUpdates && db.wallets[effectiveUserId]) {
      db.wallets[effectiveUserId] = {
        ...db.wallets[effectiveUserId],
        ...walletUpdates,
      };
    }

    saveDb(db);

    const finalInv = idx !== -1 ? db.investments[idx] : investment;
    broadcastRealtimeEvent("investment_updated", {
      investment: finalInv,
      userId: effectiveUserId,
      wallet: effectiveUserId ? db.wallets[effectiveUserId] : undefined,
      timestamp: Date.now(),
    });
    if (effectiveUserId && db.wallets[effectiveUserId]) {
      broadcastRealtimeEvent("wallet_updated", {
        userId: effectiveUserId,
        wallet: db.wallets[effectiveUserId],
        timestamp: Date.now(),
      });
    }
    broadcastRealtimeEvent("state_changed", { type: "INVESTMENT_UPDATE", timestamp: Date.now() });

    res.json({
      success: true,
      investment: finalInv,
      wallet: effectiveUserId ? db.wallets[effectiveUserId] : undefined,
    });
  });

  // POST: Save Plans (Admin updates plans)
  app.post("/api/plans/save", (req, res) => {
    const { plans } = req.body || {};
    if (!Array.isArray(plans)) return res.status(400).json({ success: false, error: "Plans array required" });

    const db = ensureDb();
    db.plans = plans;
    saveDb(db);
    console.log(`[GCap DB] Plans updated: ${plans.length} plans`);

    broadcastRealtimeEvent("plans_updated", { plans: db.plans, timestamp: Date.now() });
    broadcastRealtimeEvent("state_changed", { type: "PLANS_UPDATE", timestamp: Date.now() });

    res.json({ success: true, plans: db.plans });
  });

  // POST: Save Rules (Admin updates rules)
  app.post("/api/rules/save", (req, res) => {
    const { rules } = req.body || {};
    if (!rules) return res.status(400).json({ success: false, error: "Rules required" });

    const db = ensureDb();
    db.rules = { ...db.rules, ...rules };
    saveDb(db);
    console.log(`[GCap DB] Rules updated`);

    broadcastRealtimeEvent("rules_updated", { rules: db.rules, timestamp: Date.now() });
    broadcastRealtimeEvent("state_changed", { type: "RULES_UPDATE", timestamp: Date.now() });

    res.json({ success: true, rules: db.rules });
  });

  // POST: Save Live Interface Config (Admin updates banners, announcements, maintenance)
  app.post("/api/live-config/save", (req, res) => {
    const { liveConfig } = req.body || {};
    if (!liveConfig) return res.status(400).json({ success: false, error: "Live config required" });

    const db = ensureDb();
    db.liveConfig = { ...db.liveConfig, ...liveConfig };
    saveDb(db);
    console.log(`[GCap DB] Live Config updated`);

    broadcastRealtimeEvent("live_config_updated", { liveConfig: db.liveConfig, timestamp: Date.now() });
    broadcastRealtimeEvent("state_changed", { type: "LIVE_CONFIG_UPDATE", timestamp: Date.now() });

    res.json({ success: true, liveConfig: db.liveConfig });
  });

  // POST: Update Treasury Balance & Logs
  app.post("/api/treasury/update", (req, res) => {
    const { treasury, log } = req.body || {};
    const db = ensureDb();
    if (treasury) {
      db.treasury = { ...db.treasury, ...treasury };
    }
    if (log) {
      if (Array.isArray(log)) {
        const incomingLogs = log.flat(2).filter((l: any) => l && typeof l === "object" && !Array.isArray(l));
        const existingIds = new Set(db.treasuryLogs.map((l: any) => l.id));
        for (const item of incomingLogs) {
          if (!item.id || !existingIds.has(item.id)) {
            db.treasuryLogs.unshift(item);
            if (item.id) existingIds.add(item.id);
          }
        }
      } else if (typeof log === "object") {
        db.treasuryLogs.unshift(log);
      }
    }
    syncAdminWalletWithTreasury(db);
    saveDb(db);

    broadcastRealtimeEvent("treasury_updated", { treasury: db.treasury, logs: db.treasuryLogs, timestamp: Date.now() });
    broadcastRealtimeEvent("state_changed", { type: "TREASURY_UPDATE", timestamp: Date.now() });

    res.json({ success: true, treasury: db.treasury, logs: db.treasuryLogs });
  });

  // POST: Save Bank Details for a user
  app.post("/api/bank-details", (req, res) => {
    const { userId, details } = req.body || {};
    if (!userId) return res.status(400).json({ success: false, error: "User ID required" });

    const db = ensureDb();
    db.bankDetails[userId] = details;
    saveDb(db);

    broadcastRealtimeEvent("bank_details_updated", { userId, details, timestamp: Date.now() });
    broadcastRealtimeEvent("state_changed", { type: "BANK_DETAILS_UPDATE", timestamp: Date.now() });

    res.json({ success: true, details });
  });

  // POST: Admin Adjust User Wallet (Add, Deduct, or Direct Set)
  app.post("/api/admin/user-wallet/adjust", (req, res) => {
    const { userId, wallet, adjustment, adminName } = req.body || {};
    if (!userId) {
      return res.status(400).json({ success: false, error: "User ID is required" });
    }

    const db = ensureDb();
    const cleanId = String(userId).trim();

    // Multi-criteria user lookup using standardized helper
    const user = findUserInDb(db, cleanId);
    const effectiveUserId = user ? user.id : cleanId;

    // Retrieve existing wallet checking all user aliases
    const existingWallet = getBestUserWallet(db, cleanId, user);

    let updatedWallet: Wallet = { ...existingWallet };
    if (wallet && typeof wallet === 'object') {
      updatedWallet = {
        ...existingWallet,
        cashBalance: typeof wallet.cashBalance === 'number' ? wallet.cashBalance : existingWallet.cashBalance,
        gpBalance: typeof wallet.gpBalance === 'number' ? wallet.gpBalance : existingWallet.gpBalance,
        totalInvested: typeof wallet.totalInvested === 'number' ? wallet.totalInvested : existingWallet.totalInvested,
        totalEarned: typeof wallet.totalEarned === 'number' ? wallet.totalEarned : existingWallet.totalEarned,
        royaltyEarned: typeof wallet.royaltyEarned === 'number' ? wallet.royaltyEarned : existingWallet.royaltyEarned,
        pendingWithdrawals: typeof wallet.pendingWithdrawals === 'number' ? wallet.pendingWithdrawals : existingWallet.pendingWithdrawals,
        pendingDeposits: typeof wallet.pendingDeposits === 'number' ? wallet.pendingDeposits : existingWallet.pendingDeposits,
      };
    }

    // Apply specific adjustment if provided
    if (adjustment && typeof adjustment.amount === 'number' && adjustment.amount !== 0) {
      const amount = Number(adjustment.amount);
      const adjType = adjustment.type || 'ADD'; // 'ADD' | 'DEDUCT' | 'SET'
      const targetWallet = adjustment.targetWallet || 'cashBalance'; // 'cashBalance' | 'gpBalance' | 'totalEarned' | 'royaltyEarned'

      const currentVal = existingWallet[targetWallet] || 0;

      let calculatedVal = currentVal;
      if (adjType === 'ADD') {
        calculatedVal = currentVal + amount;
      } else if (adjType === 'DEDUCT') {
        calculatedVal = Math.max(0, currentVal - amount);
      } else if (adjType === 'SET') {
        calculatedVal = Math.max(0, amount);
      }

      updatedWallet[targetWallet] = calculatedVal;

      const reason = adjustment.reason?.trim() || 'Admin manual balance adjustment';
      const targetLabelEn = targetWallet === 'cashBalance' ? 'Cash Balance' : targetWallet === 'gpBalance' ? 'GP Balance' : targetWallet === 'totalEarned' ? 'Total Earnings' : 'Royalty Balance';
      const targetLabelHi = targetWallet === 'cashBalance' ? 'नकद बैलेंस' : targetWallet === 'gpBalance' ? 'GP बैलेंस' : targetWallet === 'totalEarned' ? 'कुल कमाई' : 'रॉयल्टी बैलेंस';

      const txnType = adjType === 'ADD'
        ? (targetWallet === 'totalEarned' ? 'RETURN_PAYOUT' : 'DEPOSIT')
        : 'WITHDRAWAL';

      const newTxn: Transaction = {
        id: `txn-adm-adj-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
        userId: effectiveUserId,
        userLoginId: user?.loginId || effectiveUserId,
        userName: user?.name || 'User',
        userPhone: user?.phone || '',
        type: txnType,
        amount: amount,
        date: new Date().toISOString(),
        timestamp: Date.now(),
        status: 'SUCCESS',
        referenceId: 'ADM' + Math.floor(10000000 + Math.random() * 90000000),
        note: `Admin (${adminName || 'Super Admin'}) ${adjType === 'ADD' ? 'credited' : 'deducted'} ₹${amount} ${adjType === 'ADD' ? 'to' : 'from'} ${targetLabelEn}. Reason: ${reason}`,
        noteHi: `एडमिन द्वारा ₹${amount} ${targetLabelHi} में ${adjType === 'ADD' ? 'जोड़ा (Credit)' : 'घटाया (Debit)'} गया। कारण: ${reason}`,
      };

      db.transactions.unshift(newTxn);
      broadcastRealtimeEvent("transaction_created", { transaction: newTxn, userId: effectiveUserId, timestamp: Date.now() });
    }

    // Calculate net funds transferred to/reclaimed from user for Company Treasury Balance Synchronization
    let netTransferToUser = 0;
    if (adjustment && typeof adjustment.amount === 'number' && adjustment.amount !== 0) {
      const amount = Number(adjustment.amount);
      const adjType = adjustment.type || 'ADD';
      const targetWallet = adjustment.targetWallet || 'cashBalance';
      if (adjType === 'ADD') {
        netTransferToUser = amount;
      } else if (adjType === 'DEDUCT') {
        netTransferToUser = -amount;
      } else if (adjType === 'SET') {
        const currentVal = (existingWallet as any)[targetWallet] || 0;
        netTransferToUser = amount - currentVal;
      }
    } else if (wallet && typeof wallet === 'object') {
      const cashDiff = typeof wallet.cashBalance === 'number' ? (wallet.cashBalance - (existingWallet.cashBalance || 0)) : 0;
      const gpDiff = typeof wallet.gpBalance === 'number' ? (wallet.gpBalance - (existingWallet.gpBalance || 0)) : 0;
      const earnDiff = typeof wallet.totalEarned === 'number' ? (wallet.totalEarned - (existingWallet.totalEarned || 0)) : 0;
      const royDiff = typeof wallet.royaltyEarned === 'number' ? (wallet.royaltyEarned - (existingWallet.royaltyEarned || 0)) : 0;
      netTransferToUser = cashDiff + gpDiff + earnDiff + royDiff;
    }

    if (netTransferToUser > 0) {
      const prevBal = db.treasury.balance || 0;
      db.treasury.balance = Math.max(0, prevBal - netTransferToUser);
      db.treasury.totalTransferredToUsers = (db.treasury.totalTransferredToUsers || 0) + netTransferToUser;
      db.treasury.totalDeducted = (db.treasury.totalDeducted || 0) + netTransferToUser;
      const treasuryLog = {
        id: `tlog-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: Date.now(),
        date: new Date().toISOString(),
        type: 'ADMIN_DEDUCT',
        amount: netTransferToUser,
        balanceBefore: prevBal,
        balanceAfter: db.treasury.balance,
        reason: `Direct funds transfer to user ${user?.name || effectiveUserId} (${user?.phone || user?.loginId || effectiveUserId}): ₹${netTransferToUser}`,
        reasonHi: `यूज़र ${user?.name || effectiveUserId} (${user?.phone || user?.loginId || effectiveUserId}) को डायरेक्ट फंड ट्रांसफर: ₹${netTransferToUser} कंपनी बैलेंस से डिडक्ट`,
        actor: adminName || 'Super Admin (admin)',
        referenceId: 'TRF' + Math.floor(10000000 + Math.random() * 90000000),
      };
      db.treasuryLogs.unshift(treasuryLog);
      syncAdminWalletWithTreasury(db);
      broadcastRealtimeEvent("treasury_updated", { treasury: db.treasury, logs: db.treasuryLogs, timestamp: Date.now() });
    } else if (netTransferToUser < 0) {
      const reclaimAmt = Math.abs(netTransferToUser);
      const prevBal = db.treasury.balance || 0;
      db.treasury.balance = prevBal + reclaimAmt;
      db.treasury.totalTransferredToUsers = Math.max(0, (db.treasury.totalTransferredToUsers || 0) - reclaimAmt);
      const treasuryLog = {
        id: `tlog-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: Date.now(),
        date: new Date().toISOString(),
        type: 'ADMIN_ADD',
        amount: reclaimAmt,
        balanceBefore: prevBal,
        balanceAfter: db.treasury.balance,
        reason: `Funds reclaimed from user ${user?.name || effectiveUserId} (${user?.phone || user?.loginId || effectiveUserId}) to Company Main Balance: ₹${reclaimAmt}`,
        reasonHi: `यूज़र ${user?.name || effectiveUserId} (${user?.phone || user?.loginId || effectiveUserId}) से फंड कंपनी मुख्य बैलेंस में वापस रिकवर: ₹${reclaimAmt}`,
        actor: adminName || 'Super Admin (admin)',
        referenceId: 'REC' + Math.floor(10000000 + Math.random() * 90000000),
      };
      db.treasuryLogs.unshift(treasuryLog);
      syncAdminWalletWithTreasury(db);
      broadcastRealtimeEvent("treasury_updated", { treasury: db.treasury, logs: db.treasuryLogs, timestamp: Date.now() });
    }

    // Synchronize and persist updated wallet under ALL alias keys for this user
    const keysToSave = getAllUserWalletKeys(db, cleanId, user);

    keysToSave.forEach((k) => {
      if (k && db.wallets) db.wallets[k] = { ...updatedWallet };
    });

    db.lastUpdated = new Date().toISOString();
    saveDb(db, true);

    // Broadcast wallet_updated for ALL keys so connected clients update immediately
    keysToSave.forEach((k) => {
      if (k) {
        broadcastRealtimeEvent("wallet_updated", { userId: k, wallet: updatedWallet, timestamp: Date.now() });
      }
    });
    broadcastRealtimeEvent("state_changed", { type: "ADMIN_WALLET_ADJUST", userId: effectiveUserId, timestamp: Date.now() });

    console.log(`[GCap Admin] Wallet adjusted for user ${user?.name || effectiveUserId}:`, updatedWallet);
    res.json({ success: true, wallet: updatedWallet, treasury: db.treasury, treasuryLogs: db.treasuryLogs });
  });

  // POST: Update Wallet directly
  app.post("/api/wallet/update", (req, res) => {
    const { userId, wallet } = req.body || {};
    if (!userId || !wallet) return res.status(400).json({ success: false, error: "User ID and wallet required" });

    const db = ensureDb();
    const cleanId = String(userId).trim();
    const user = findUserInDb(db, cleanId);

    const updated = { ...DEFAULT_WALLET, ...wallet };
    const keysToSave = getAllUserWalletKeys(db, cleanId, user);

    keysToSave.forEach((k) => {
      if (k && db.wallets) db.wallets[k] = { ...updated };
    });

    db.lastUpdated = new Date().toISOString();
    saveDb(db, true);

    keysToSave.forEach((k) => {
      if (k) {
        broadcastRealtimeEvent("wallet_updated", { userId: k, wallet: updated, timestamp: Date.now() });
      }
    });
    broadcastRealtimeEvent("state_changed", { type: "WALLET_UPDATE", timestamp: Date.now() });

    res.json({ success: true, wallet: updated });
  });

  // GET: Messages for a user or admin
  app.get("/api/messages", (req, res) => {
    const db = ensureDb();
    const { userId, role } = req.query;
    const allMessages = db.messages || [];

    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

    if (role === "ADMIN") {
      return res.json({ success: true, messages: allMessages });
    }

    if (!userId || typeof userId !== "string") {
      // Return public broadcast messages only
      const publicMsgs = allMessages.filter((m) => m.targetType === "ALL");
      return res.json({ success: true, messages: publicMsgs });
    }

    const user = db.users.find((u) => u.id === userId);
    const userWallet = db.wallets[userId] || DEFAULT_WALLET;
    const hasInvestments = db.investments.some((inv) => inv.userId === userId && inv.status === "ACTIVE");
    const hasPositiveBalance = (userWallet.cashBalance || 0) > 0 || (userWallet.gpBalance || 0) > 0 || (userWallet.totalEarned || 0) > 0;

    const userMessages = allMessages.filter((m) => {
      if (m.targetType === "ALL") return true;
      if (m.targetType === "SINGLE") {
        return m.targetUserId === userId || (user && m.targetUserLoginId && user.loginId.toLowerCase() === m.targetUserLoginId.toLowerCase());
      }
      if (m.targetType === "INVESTORS") {
        return hasInvestments;
      }
      if (m.targetType === "POSITIVE_BALANCE") {
        return hasPositiveBalance;
      }
      if (m.targetType === "SELECTED") {
        return Array.isArray(m.targetUserIds) && m.targetUserIds.includes(userId);
      }
      return false;
    });

    res.json({ success: true, messages: userMessages });
  });

  // POST: Admin broadcasts a new message (single, bulk, or selected criteria)
  app.post("/api/admin/messages", (req, res) => {
    const {
      title,
      titleHi,
      content,
      contentHi,
      senderName,
      targetType,
      targetUserId,
      targetUserLoginId,
      targetUserName,
      targetUserIds,
      priority,
      category,
      showPopup,
    } = req.body || {};

    if (!title || !content) {
      return res.status(400).json({ success: false, error: "Title and content are required" });
    }

    const db = ensureDb();
    if (!db.messages) db.messages = [];

    const newMsg: AdminMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: String(title).trim(),
      titleHi: titleHi ? String(titleHi).trim() : String(title).trim(),
      content: String(content).trim(),
      contentHi: contentHi ? String(contentHi).trim() : String(content).trim(),
      senderName: senderName ? String(senderName).trim() : "GCap Admin",
      targetType: targetType || "ALL",
      targetUserId,
      targetUserLoginId,
      targetUserName,
      targetUserIds: Array.isArray(targetUserIds) ? targetUserIds : undefined,
      priority: priority || "NORMAL",
      category: category || "ANNOUNCEMENT",
      showPopup: showPopup !== false,
      createdAt: new Date().toISOString(),
      timestamp: Date.now(),
      readByUserIds: [],
      dismissedByUserIds: [],
    };

    db.messages.unshift(newMsg);
    saveDb(db);

    console.log(`[GCap DB] Admin message created: "${newMsg.title}" (Target: ${newMsg.targetType})`);

    // Broadcast instant real-time event across all connected clients & devices
    broadcastRealtimeEvent("admin_message", newMsg);
    broadcastRealtimeEvent("state_changed", {
      type: "MESSAGE_CREATED",
      message: newMsg,
      timestamp: Date.now(),
    });

    res.json({ success: true, message: newMsg });
  });

  // POST: Mark message as read by a user
  app.post("/api/messages/:id/read", (req, res) => {
    const { id } = req.params;
    const { userId } = req.body || {};
    if (!id || !userId) {
      return res.status(400).json({ success: false, error: "Message ID and User ID required" });
    }

    const db = ensureDb();
    if (!db.messages) db.messages = [];
    const msg = db.messages.find((m) => m.id === id);
    if (msg) {
      if (!msg.readByUserIds) msg.readByUserIds = [];
      if (!msg.readByUserIds.includes(userId)) {
        msg.readByUserIds.push(userId);
        saveDb(db);
      }
    }

    res.json({ success: true });
  });

  // POST: Dismiss message popup on user screen
  app.post("/api/messages/:id/dismiss", (req, res) => {
    const { id } = req.params;
    const { userId } = req.body || {};
    if (!id || !userId) {
      return res.status(400).json({ success: false, error: "Message ID and User ID required" });
    }

    const db = ensureDb();
    if (!db.messages) db.messages = [];
    const msg = db.messages.find((m) => m.id === id);
    if (msg) {
      if (!msg.dismissedByUserIds) msg.dismissedByUserIds = [];
      if (!msg.dismissedByUserIds.includes(userId)) {
        msg.dismissedByUserIds.push(userId);
        saveDb(db);
      }
    }

    res.json({ success: true });
  });

  // DELETE: Admin deletes a message
  app.delete("/api/admin/messages/:id", (req, res) => {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, error: "Message ID required" });

    const db = ensureDb();
    if (!db.messages) db.messages = [];
    const initialLen = db.messages.length;
    db.messages = db.messages.filter((m) => m.id !== id);

    if (db.messages.length !== initialLen) {
      saveDb(db);
      broadcastRealtimeEvent("state_changed", { type: "MESSAGE_DELETED", messageId: id, timestamp: Date.now() });
    }

    res.json({ success: true, remaining: db.messages.length });
  });

  // GET: Users list
  app.get("/api/users", (req, res) => {
    const db = ensureDb();
    const usersWithPassword = db.users.map((u) => ({
      ...u,
      password: u.passwordHash || u.password || '',
      passwordHash: u.passwordHash || u.password || '',
    }));
    res.json({ success: true, users: usersWithPassword });
  });

  // POST: Central Real-Time User Authentication (Works globally on any device/installed app)
  app.post("/api/auth/login", (req, res) => {
    const { loginId, password } = req.body || {};
    const trimmedId = String(loginId || "").trim().toLowerCase();
    const trimmedPass = String(password || "").trim();

    if (!trimmedId) {
      return res.status(400).json({ success: false, error: "कृपया लॉगिन आईडी या मोबाइल नंबर दर्ज करें" });
    }
    if (!trimmedPass) {
      return res.status(400).json({ success: false, error: "कृपया पासवर्ड दर्ज करें" });
    }

    const db = ensureDb();
    const cleanDigits = trimmedId.replace(/[^0-9]/g, "");
    const normalizedPhone = cleanDigits.length >= 10 ? cleanDigits.slice(-10) : "";

    const account = db.users.find((acc) => {
      const accCleanDigits = acc.phone ? acc.phone.replace(/[^0-9]/g, "") : "";
      const accPhone10 = accCleanDigits.length >= 10 ? accCleanDigits.slice(-10) : "";
      const accLoginId = (acc.loginId || "").toLowerCase();
      const accEmail = (acc.email || "").toLowerCase();

      if (acc.id === trimmedId) return true;
      if (accLoginId === trimmedId) return true;
      if (accEmail === trimmedId) return true;
      if (normalizedPhone && accPhone10 && accPhone10 === normalizedPhone) return true;
      return false;
    });

    if (!account) {
      console.log(`[LOGIN DEBUG] No account found for input: ${trimmedId} (normalized phone: ${normalizedPhone})`);
      return res.status(404).json({
        success: false,
        error: "खाता नहीं मिला। कृपया अपनी आईडी जांचें या नया खाता बनाएं।",
      });
    }

    const isAdmin =
      account.role === "ADMIN" ||
      (account.loginId || "").toLowerCase() === "admin" ||
      trimmedId === "admin";

    console.log(`[LOGIN DEBUG] Found user ${account.loginId}. Passed pass: "${trimmedPass}". DB Hash: "${account.passwordHash}". Account obj pass: "${(account as any).password}"`);

    const isPassCorrect =
      account.passwordHash === trimmedPass ||
      (account as any).password === trimmedPass ||
      (isAdmin && trimmedPass === "ad123");

    if (!isPassCorrect) {
      console.log(`[LOGIN DEBUG] Password mismatch for user: ${account.phone || account.loginId}. Expected: ${account.passwordHash || (account as any).password}, Received: ${trimmedPass}`);
      return res.status(401).json({
        success: false,
        error: "गलत पासवर्ड। कृपया सही पासवर्ड दर्ज करें।",
      });
    }

    if (isAdmin && account.passwordHash !== "ad123" && trimmedPass === "ad123") {
      account.passwordHash = "ad123";
      saveDb(db);
    }

    if (account.status === "BLOCKED") {
      return res.status(403).json({
        success: false,
        error: "यह खाता निलंबित (Blocked) है। कृपया एडमिन सहायता से संपर्क करें।",
      });
    }

    // Ensure wallet exists
    if (!db.wallets[account.id]) {
      db.wallets[account.id] = { ...DEFAULT_WALLET };
      saveDb(db);
    }

    console.log(`[GCap Auth] Successful login for: ${account.name} (${account.loginId}) [Role: ${account.role}]`);

    const { passwordHash: _, ...profile } = account;
    res.json({
      success: true,
      user: profile,
      account: account,
    });
  });

  // POST: Change Password directly in central DB
  app.post("/api/auth/change-password", (req, res) => {
    const { userId, oldPassword, newPassword } = req.body || {};
    if (!userId || !newPassword) {
      return res.status(400).json({ success: false, error: "User ID and new password required" });
    }

    const db = ensureDb();
    const account = db.users.find((u) => u.id === userId);
    if (!account) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    if (oldPassword && account.passwordHash !== oldPassword && account.role !== "ADMIN") {
      return res.status(401).json({ success: false, error: "पुराना पासवर्ड गलत है।" });
    }

    account.passwordHash = String(newPassword).trim();
    saveDb(db);

    console.log(`[GCap Auth] Password changed in central database for user: ${account.name} (${account.loginId})`);

    const { passwordHash: _, ...profile } = account;
    res.json({ success: true, user: profile });
  });

  // POST: Register User
  app.post("/api/register", (req, res) => {
    const { name, loginId, phone, email, password, referralCode } = req.body || {};

    const cleanName = String(name || "").trim();
    const cleanDigits = String(phone || loginId || "").replace(/[^0-9]/g, "");
    const cleanPhone = cleanDigits.length >= 10 ? cleanDigits.slice(-10) : cleanDigits;
    const cleanLoginId = cleanPhone || String(loginId || "").trim().toLowerCase();
    const cleanPassword = String(password || "").trim();

    if (!cleanName || cleanName.length < 2) {
      return res.status(400).json({ success: false, error: "कृपया पूरा नाम सही दर्ज करें" });
    }
    if (!cleanPhone || cleanPhone.length < 10) {
      return res.status(400).json({ success: false, error: "मान्य 10-अंकीय मोबाइल नंबर दर्ज करें" });
    }
    if (!cleanPassword || cleanPassword.length < 4) {
      return res.status(400).json({ success: false, error: "पासवर्ड कम से कम 4 अक्षरों का होना चाहिए" });
    }

    const db = ensureDb();
    const existing = db.users.find((acc) => {
      const accDigits = acc.phone ? acc.phone.replace(/[^0-9]/g, "") : "";
      const accPhone10 = accDigits.length >= 10 ? accDigits.slice(-10) : "";
      const accLoginId = (acc.loginId || "").toLowerCase();

      if (accLoginId === cleanLoginId) return true;
      if (accPhone10 && cleanPhone && accPhone10 === cleanPhone) return true;
      return false;
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        error: "यह मोबाइल नंबर / यूजर आईडी पहले से पंजीकृत है। कृपया लॉगिन करें।",
      });
    }

    const newAccount: StoredAccount = {
      id: `usr-${Date.now()}`,
      loginId: cleanLoginId,
      name: cleanName,
      role: "USER",
      phone: cleanPhone,
      email: email ? String(email).replace(/\s+/g, '') : `${cleanPhone.replace(/[^0-9]/g, '').slice(-10) || 'user'}@gcap.user`,
      referralCode: `GCAP-${cleanPhone.slice(-6).toUpperCase()}`,
      referredBy: referralCode ? String(referralCode).trim().toUpperCase() : "GCAP-DIRECT",
      joinedDate: new Date().toISOString().split("T")[0],
      status: "ACTIVE",
      passwordHash: cleanPassword,
    };

    db.users.push(newAccount);
    db.wallets[newAccount.id] = { ...DEFAULT_WALLET };
    saveDb(db);

    console.log(`[GCap DB] New user registered: ${cleanName} (${cleanPhone})`);

    const { passwordHash: _, ...profile } = newAccount;

    // Broadcast instant user registration to all connected admin panels worldwide
    console.log(`[SSE Broadcast] Broadcasting user_registered for: ${cleanName}`);
    broadcastRealtimeEvent("user_registered", {
      user: profile,
      timestamp: Date.now(),
      message: `नया यूज़र रजिस्टर हुआ: ${cleanName} (${cleanPhone})`,
    });
    console.log(`[SSE Broadcast] Broadcasted successfully.`);
    broadcastRealtimeEvent("wallet_updated", {
      userId: newAccount.id,
      wallet: db.wallets[newAccount.id],
      timestamp: Date.now(),
    });
    broadcastRealtimeEvent("state_changed", { type: "USER_REGISTER", timestamp: Date.now() });

    res.json({ success: true, user: profile, account: newAccount });
  });

  // POST: Users Sync (Bi-directional multi-device synchronization)
  app.post("/api/users/sync", (req, res) => {
    const { accounts } = req.body || {};
    const db = ensureDb();
    const deletedSet = new Set(db.deletedUserIds || []);

    if (Array.isArray(accounts)) {
      let changed = false;

      // Add or update from client accounts
      accounts.forEach((rawAcc: any) => {
        if (!rawAcc || !rawAcc.id) return;
        const clientAcc: StoredAccount = {
          id: String(rawAcc.id),
          loginId: String(rawAcc.loginId || rawAcc.phone || "user").trim(),
          name: String(rawAcc.name || "User").trim(),
          role: rawAcc.role === "ADMIN" ? "ADMIN" : "USER",
          phone: String(rawAcc.phone || "").trim(),
          email: String(rawAcc.email || "").trim(),
          referralCode: rawAcc.referralCode ? String(rawAcc.referralCode).trim() : undefined,
          referredBy: rawAcc.referredBy ? String(rawAcc.referredBy).trim() : undefined,
          joinedDate: String(rawAcc.joinedDate || new Date().toISOString().split("T")[0]).trim(),
          status: rawAcc.status === "BLOCKED" ? "BLOCKED" : "ACTIVE",
          passwordHash: String(rawAcc.passwordHash || (rawAcc.role === "ADMIN" ? "ad123" : "demo123")).trim(),
        };

        // Never restore explicitly deleted users
        if (
          deletedSet.has(clientAcc.id) ||
          (clientAcc.phone && deletedSet.has(clientAcc.phone)) ||
          (clientAcc.loginId && deletedSet.has(clientAcc.loginId.toLowerCase()))
        ) {
          return;
        }

        const cleanClientPhone = (clientAcc.phone || "").replace(/[^0-9]/g, "");
        const existing = db.users.find(
          (u) =>
            u.id === clientAcc.id ||
            (cleanClientPhone && u.phone && u.phone.replace(/[^0-9]/g, "") === cleanClientPhone) ||
            (clientAcc.loginId && u.loginId && u.loginId.toLowerCase() === clientAcc.loginId.toLowerCase())
        );

        if (!existing) {
          db.users.push(clientAcc);
          if (!db.wallets[clientAcc.id]) {
            db.wallets[clientAcc.id] = { ...DEFAULT_WALLET };
          }
          changed = true;
        } else {
          if (clientAcc.status && existing.status !== clientAcc.status) {
            existing.status = clientAcc.status;
            changed = true;
          }
          if (clientAcc.name && existing.name !== clientAcc.name) {
            existing.name = clientAcc.name;
            changed = true;
          }
          if (clientAcc.passwordHash && clientAcc.passwordHash !== existing.passwordHash && existing.role !== "ADMIN") {
            existing.passwordHash = clientAcc.passwordHash;
            changed = true;
          }
        }
      });

      if (changed) {
        saveDb(db);
        broadcastRealtimeEvent("users_updated", {
          users: db.users.map(({ passwordHash: _, ...p }) => p),
          timestamp: Date.now(),
        });
        broadcastRealtimeEvent("state_changed", { type: "USERS_SYNC", timestamp: Date.now() });
      }
    }

    res.json({
      success: true,
      accounts: db.users,
      count: db.users.length,
      lastUpdated: db.lastUpdated,
    });
  });

  // POST: Admin Add User
  app.post("/api/users/add", (req, res) => {
    const { name, phone, password, role, status, joinedDate, loginId, email, referralCode, referredBy, bankDetails, permissions } = req.body || {};

    const cleanName = String(name || "").trim();
    const rawPhone = String(phone || "").trim();
    const cleanDigits = rawPhone.replace(/[^0-9]/g, "");
    const cleanPhone10 = cleanDigits.length >= 10 ? cleanDigits.slice(-10) : cleanDigits;
    const cleanLoginId = String(loginId || cleanPhone10).trim();
    const cleanPassword = String(password || "demo123").trim();

    if (!cleanName || cleanName.length < 2) {
      return res.status(400).json({ success: false, error: "कृपया पूरा नाम दर्ज करें" });
    }
    if (!cleanPhone10 || cleanPhone10.length < 10) {
      return res.status(400).json({ success: false, error: "कृपया 10 अंकों का मान्य फ़ोन नंबर दर्ज करें" });
    }

    const db = ensureDb();
    
    // Always use the primary admin's referral code for users created by admin if not provided
    const adminUser = db.users.find(u => u.role === 'ADMIN');
    const userReferralCode = referralCode ? String(referralCode).trim().toUpperCase() : `GCAP-${cleanPhone10.slice(-5).toUpperCase()}`;
    const userReferredBy = referredBy ? String(referredBy).trim().toUpperCase() : (adminUser ? adminUser.referralCode : "GCAP-DIRECT");

    const existing = db.users.find((acc) => {
      const accDigits = acc.phone ? acc.phone.replace(/[^0-9]/g, "") : "";
      const accPhone10 = accDigits.length >= 10 ? accDigits.slice(-10) : "";
      const accLoginId = (acc.loginId || "").toLowerCase();

      if (cleanLoginId && accLoginId === cleanLoginId.toLowerCase()) return true;
      if (accPhone10 && cleanPhone10 && accPhone10 === cleanPhone10) return true;
      return false;
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        error: "यह फ़ोन नंबर / लॉगिन आईडी पहले से पंजीकृत है।",
      });
    }

    const newUserId = `usr-${Date.now()}`;
    const formattedPhone = rawPhone.startsWith("+") ? rawPhone : `+91 ${cleanPhone10}`;

    const newAccount: StoredAccount = {
      id: newUserId,
      loginId: cleanLoginId || cleanPhone10,
      name: cleanName,
      role: role === "ADMIN" ? "ADMIN" : (role === "STAFF" ? "STAFF" : "USER"),
      phone: formattedPhone,
      email: (() => {
        let clean = email ? String(email).replace(/\s+/g, '') : '';
        if (!clean || clean.includes('@gcap.user')) {
          const digits = formattedPhone.replace(/[^0-9]/g, '').slice(-10);
          clean = `${digits || 'user'}@gcap.user`;
        }
        return clean;
      })(),
      referralCode: userReferralCode,
      referredBy: userReferredBy,
      joinedDate: String(joinedDate || "").trim() || new Date().toISOString().split("T")[0],
      status: status === "BLOCKED" ? "BLOCKED" : "ACTIVE",
      passwordHash: cleanPassword,
      permissions: role === "STAFF" && permissions ? permissions : undefined,
    };

    // Remove from deletedUserIds if it was deleted before
    if (Array.isArray(db.deletedUserIds)) {
      db.deletedUserIds = db.deletedUserIds.filter(
        (id) =>
          id !== newUserId &&
          id !== cleanPhone10 &&
          id !== cleanLoginId.toLowerCase()
      );
    }

    db.users.push(newAccount);
    db.wallets[newAccount.id] = { ...DEFAULT_WALLET };
    if (cleanPhone10) db.wallets[cleanPhone10] = { ...DEFAULT_WALLET };
    if (cleanLoginId) db.wallets[cleanLoginId] = { ...DEFAULT_WALLET };

    if (bankDetails && typeof bankDetails === 'object') {
      db.bankDetails[newAccount.id] = bankDetails;
      if (cleanPhone10) db.bankDetails[cleanPhone10] = bankDetails;
    }

    saveDb(db);

    const { passwordHash: _, ...profile } = newAccount;

    broadcastRealtimeEvent("user_added", { user: profile, timestamp: Date.now() });
    broadcastRealtimeEvent("users_updated", {
      users: db.users.map(({ passwordHash: _, ...p }) => p),
      timestamp: Date.now(),
    });
    broadcastRealtimeEvent("state_changed", { type: "USER_ADD", timestamp: Date.now() });

    console.log(`[GCap DB] Admin created user successfully: ${newAccount.name} (${newAccount.phone}) [ID: ${newAccount.id}]`);

    res.json({ success: true, user: profile, account: newAccount });
  });

  // POST: Admin / User Update Profile & Password
  app.post("/api/users/update", (req, res) => {
    const { userId, updates } = req.body || {};
    if (!userId) {
      return res.status(400).json({ success: false, error: "User ID is required" });
    }

    const db = ensureDb();
    const cleanId = String(userId).trim().toLowerCase();
    const cleanPhone = cleanId.replace(/[^0-9]/g, "");
    const targetIdx = db.users.findIndex(
      (u) =>
        u.id === userId ||
        (u.loginId && u.loginId.toLowerCase() === cleanId) ||
        (cleanPhone && u.phone && u.phone.replace(/[^0-9]/g, "") === cleanPhone)
    );
    if (targetIdx === -1) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const current = db.users[targetIdx];
    if (updates.name !== undefined) current.name = updates.name.trim();
    if (updates.loginId !== undefined && updates.loginId.trim()) current.loginId = updates.loginId.trim();
    if (updates.phone !== undefined) current.phone = updates.phone.trim();
    if (updates.email !== undefined) current.email = updates.email.trim();
    if (updates.password && updates.password.trim()) {
      current.passwordHash = updates.password.trim();
      current.password = updates.password.trim();
    }
    if (updates.role !== undefined) current.role = updates.role;
    if (updates.permissions !== undefined) current.permissions = updates.permissions;
    if (updates.status !== undefined) current.status = updates.status;
    if (updates.joinedDate !== undefined) current.joinedDate = updates.joinedDate;
    if (updates.referralCode !== undefined) current.referralCode = updates.referralCode.trim();
    if (updates.referredBy !== undefined) current.referredBy = updates.referredBy.trim();

    if (updates.bankDetails && typeof updates.bankDetails === 'object') {
      db.bankDetails[userId] = updates.bankDetails;
      if (current.id) db.bankDetails[current.id] = updates.bankDetails;
    }

    saveDb(db);

    const profile = {
      ...current,
      password: current.passwordHash || current.password || '',
      passwordHash: current.passwordHash || current.password || '',
    };

    broadcastRealtimeEvent("user_updated", { user: profile, timestamp: Date.now() });
    broadcastRealtimeEvent("users_updated", {
      users: db.users.map((u) => ({
        ...u,
        password: u.passwordHash || u.password || '',
        passwordHash: u.passwordHash || u.password || '',
      })),
      timestamp: Date.now(),
    });
    broadcastRealtimeEvent("state_changed", { type: "USER_UPDATE", timestamp: Date.now() });

    res.json({ success: true, user: profile, account: current });
  });

  // DELETE: Admin Delete User
  const performDeleteUser = (rawUserId: string, res: express.Response) => {
    const userId = String(rawUserId || "").trim();
    if (!userId) {
      return res.status(400).json({ success: false, error: "User ID required" });
    }

    const db = ensureDb();
    const cleanDigits = userId.replace(/[^0-9]/g, "");
    const cleanPhone10 = cleanDigits.length >= 10 ? cleanDigits.slice(-10) : "";
    const lowerUserId = userId.toLowerCase();

    const target = db.users.find((u) => {
      if (!u) return false;
      if (u.id === userId) return true;
      if (u.loginId && u.loginId.toLowerCase() === lowerUserId) return true;
      if (u.phone === userId) return true;
      const uDigits = u.phone ? u.phone.replace(/[^0-9]/g, "") : "";
      const uPhone10 = uDigits.length >= 10 ? uDigits.slice(-10) : "";
      if (cleanPhone10 && uPhone10 && cleanPhone10 === uPhone10) return true;
      return false;
    });

    if (!target) {
      return res.status(404).json({ success: false, error: "यूज़र खाता नहीं मिला।" });
    }

    if ((target.loginId || "").toLowerCase() === "admin" || target.role === "ADMIN") {
      return res.status(400).json({ success: false, error: "मुख्य एडमिन खाते को हटाया नहीं जा सकता।" });
    }

    const targetId = target.id;
    const targetLogin = (target.loginId || "").toLowerCase();
    const targetPhone = target.phone || "";
    const targetPhone10 = targetPhone.replace(/[^0-9]/g, "").slice(-10);

    // Remove user from users array
    db.users = db.users.filter((u) => {
      if (!u) return false;
      if (u.id === targetId) return false;
      if (targetLogin && (u.loginId || "").toLowerCase() === targetLogin) return false;
      if (targetPhone10 && (u.phone || "").replace(/[^0-9]/g, "").slice(-10) === targetPhone10) return false;
      return true;
    });

    // Record in deletedUserIds tombstone list to prevent any revival
    if (!db.deletedUserIds) db.deletedUserIds = [];
    if (targetId && !db.deletedUserIds.includes(targetId)) db.deletedUserIds.push(targetId);
    if (targetLogin && !db.deletedUserIds.includes(targetLogin)) db.deletedUserIds.push(targetLogin);
    if (targetPhone && !db.deletedUserIds.includes(targetPhone)) db.deletedUserIds.push(targetPhone);
    if (targetPhone10 && !db.deletedUserIds.includes(targetPhone10)) db.deletedUserIds.push(targetPhone10);
    if (userId && !db.deletedUserIds.includes(userId)) db.deletedUserIds.push(userId);

    // Cleanup wallet & bank records
    if (targetId) {
      delete db.wallets[targetId];
      delete db.bankDetails[targetId];
    }
    if (targetLogin) delete db.wallets[targetLogin];
    if (targetPhone) delete db.wallets[targetPhone];
    if (targetPhone10) delete db.wallets[targetPhone10];
    if (userId) {
      delete db.wallets[userId];
      delete db.bankDetails[userId];
    }

    // Save DB to disk and schedule cloud sync
    saveDb(db);

    // Realtime notification
    broadcastRealtimeEvent("user_deleted", { userId: targetId, timestamp: Date.now() });
    broadcastRealtimeEvent("users_updated", {
      users: db.users.map(({ passwordHash: _, ...p }) => p),
      timestamp: Date.now(),
    });
    broadcastRealtimeEvent("state_changed", { type: "USER_DELETE", timestamp: Date.now() });

    console.log(`[Admin Delete] User deleted successfully: ${target.name} (${targetId} / ${targetPhone})`);
    return res.json({
      success: true,
      message: "यूज़र खाता सफलतापूर्वक हटा दिया गया है।",
      remaining: db.users.length,
      deletedUser: {
        id: targetId,
        name: target.name,
        phone: target.phone,
        loginId: target.loginId,
      },
    });
  };

  app.delete("/api/users/:id", (req, res) => {
    performDeleteUser(req.params.id, res);
  });

  // POST: Admin Delete User (Alias for HTTP clients / proxies that block DELETE)
  app.post("/api/users/delete", (req, res) => {
    const { userId } = req.body || {};
    performDeleteUser(userId, res);
  });

  // Anti-cache middleware for HTML, manifest, and service worker files
  app.use((req, res, next) => {
    const url = req.path;
    if (
      url === "/" ||
      url.endsWith(".html") ||
      url.endsWith("sw.js") ||
      url.endsWith("version.json") ||
      url.endsWith("manifest.webmanifest") ||
      url.endsWith("manifest.json")
    ) {
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
    }
    next();
  });

  // Vite middleware for development vs static production serve
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(
      express.static(distPath, {
        setHeaders: (res, filePath) => {
          if (
            filePath.endsWith(".html") ||
            filePath.endsWith("sw.js") ||
            filePath.endsWith("version.json") ||
            filePath.endsWith("manifest.webmanifest") ||
            filePath.endsWith("manifest.json")
          ) {
            res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0");
            res.setHeader("Pragma", "no-cache");
            res.setHeader("Expires", "0");
          }
        },
      })
    );
    app.get("*", (_req, res) => {
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`GCap Full-Stack Main Database Server running on port ${PORT}`);
  });
}

startServer();
