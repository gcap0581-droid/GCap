import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Stable server deployment/build identifier (persists during the lifetime of this server process, updates when restarted by GitHub/AI Studio deploy)
let SERVER_BUILD_ID = process.env.BUILD_ID || process.env.VITE_BUILD_ID || `${Date.now()}`;
const SERVER_BOOT_TIME = new Date().toISOString();

interface StoredAccount {
  id: string;
  loginId: string;
  name: string;
  role: "ADMIN" | "USER";
  phone: string;
  email?: string;
  referralCode?: string;
  referredBy?: string;
  joinedDate?: string;
  status: "ACTIVE" | "BLOCKED";
  passwordHash: string;
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
  lastPayoutTimestamp: number;
  status: "ACTIVE" | "COMPLETED";
  autoReinvest: boolean;
  activationTimestamp: number;
  lockedUntilTimestamp: number;
  isInitialLockCompleted: boolean;
  cycleDurationHours: number;
  currentCycleStartTimestamp: number;
  currentCycleEndTimestamp: number;
  completedCyclesCount: number;
  cycleReturnAmount: number;
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
    passwordHash: "12345",
  },
  {
    id: "usr-user-01",
    loginId: "Demo",
    name: "Demo",
    role: "USER",
    phone: "+91 98765 43210",
    email: "demo@gcap.in",
    referralCode: "GCAP-DEMO",
    joinedDate: "2026-08-15",
    status: "ACTIVE",
    passwordHash: "demo123",
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
    name: "Short Term Plan",
    nameHi: "शॉर्ट टर्म प्लान (Short Term Plan)",
    dailyRoiPercent: 0.16,
    durationDays: 641,
    minAmount: 100000,
    maxAmount: 1000000000,
    payoutFrequency: "Daily",
    payoutFrequencyHi: "हर 6 घंटे में 0.04% GP",
    risk: "Low",
    tag: "641 Days Lock + 0.04%/6h GP",
    tagHi: "641 दिन लॉक + हर 6h में 0.04% GP",
    badge: "⚡ 641-Day Short Term Plan",
    description: "Special 641-day Short Term investment plan. Minimum deposit ₹1,00,000. Earn 0.04% every 6 hours automatically credited to earnings.",
    descriptionHi: "विशेष 641 दिवसीय शॉर्ट टर्म निवेश योजना। न्यूनतम निवेश ₹1,00,000। हर 6 घंटे में 0.04% GP स्वतः जमा।",
    features: [
      "न्यूनतम निवेश ₹1,00,000 (अधिकतम Unlimited)",
      "परिपक्वता अवधि 641 दिन",
      "हर 6 घंटे में 0.04% GP लाभ",
      "महीने की 1 से 5 तारीख तक निकासी",
    ],
    featuresHi: [
      "न्यूनतम निवेश ₹1,00,000 (अधिकतम Unlimited)",
      "परिपक्वता अवधि 641 दिन",
      "हर 6 घंटे में 0.04% GP लाभ",
      "महीने की 1 से 5 तारीख तक निकासी",
    ],
  },
  {
    id: "long-term",
    name: "Long Term Plan",
    nameHi: "लॉन्ग टर्म प्लान (Long Term Plan)",
    dailyRoiPercent: 0.12,
    durationDays: 365,
    minAmount: 50000,
    maxAmount: 100000,
    payoutFrequency: "Daily",
    payoutFrequencyHi: "हर 6 घंटे में 0.03% GP",
    risk: "Low",
    tag: "365 Days Lock + Royalty Pathway",
    tagHi: "365 दिन लॉक + 0.03%/6h GP + रॉयल्टी प्लान",
    badge: "👑 365-Day Long Term & Royalty Plan",
    description: "Premier 365-day Long Term Plan with Royalty pathway. Deposit ₹50,000 to ₹100,000. Earn 0.03% every 6 hours.",
    descriptionHi: "प्रीमियम 365-दिवसीय लॉन्ग टर्म निवेश एवं रॉयल्टी योजना। निवेश ₹50,000 से ₹1,00,000 तक।",
    features: [
      "न्यूनतम निवेश ₹50,000 एवं अधिकतम ₹1,00,000",
      "अवधि 365 दिन + 1461 दिन रॉयल्टी विकल्प",
      "हर 6 घंटे में 0.03% GP लाभ",
      "महीने की 1 से 5 तारीख तक निकासी",
    ],
    featuresHi: [
      "न्यूनतम निवेश ₹50,000 एवं अधिकतम ₹1,00,000",
      "अवधि 365 दिन + 1461 दिन रॉयल्टी विकल्प",
      "हर 6 घंटे में 0.03% GP लाभ",
      "महीने की 1 से 5 तारीख तक निकासी",
    ],
  },
];

const DEFAULT_RULES: AppRules = {
  platformName: "GCap",
  gpRatePerRupee: 1.0,
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
      if (getApps().length === 0) {
        initializeApp({
          projectId: config.projectId,
        });
      }
      firestore = getFirestore(undefined, config.firestoreDatabaseId || "(default)");
      console.log("[Firebase] Successfully initialized Firestore with database:", config.firestoreDatabaseId || "(default)");
    }
  } else {
    console.warn("[Firebase] No firebase-applet-config.json found.");
  }
} catch (err) {
  console.error("[Firebase] Error initializing firebase-admin:", err);
}

// Function to save the DB to Firestore
async function saveToFirestore(db: ServerDB): Promise<void> {
  if (!firestore) return;
  try {
    const dbRef = firestore.collection("gcap_database");
    const batch = firestore.batch();

    batch.set(dbRef.doc("users"), { data: db.users || [] });
    batch.set(dbRef.doc("wallets"), { data: db.wallets || {} });
    batch.set(dbRef.doc("investments"), { data: db.investments || [] });
    batch.set(dbRef.doc("transactions"), { data: db.transactions || [] });
    batch.set(dbRef.doc("plans"), { data: db.plans || [] });
    if (db.rules) batch.set(dbRef.doc("rules"), { data: db.rules });
    if (db.liveConfig) batch.set(dbRef.doc("liveConfig"), { data: db.liveConfig });
    batch.set(dbRef.doc("bankDetails"), { data: db.bankDetails || {} });
    if (db.treasury) batch.set(dbRef.doc("treasury"), { data: db.treasury });
    batch.set(dbRef.doc("treasuryLogs"), { data: db.treasuryLogs || [] });
    batch.set(dbRef.doc("messages"), { data: db.messages || [] });
    batch.set(dbRef.doc("deletedUserIds"), { data: db.deletedUserIds || [] });
    batch.set(dbRef.doc("metadata"), { lastUpdated: db.lastUpdated || new Date().toISOString() });

    await batch.commit();
    console.log("[Firebase] Successfully batch-saved full DB state to Firestore!");
  } catch (err) {
    console.error("[Firebase] Error saving to Firestore:", err);
  }
}

// Function to load the DB from Firestore
async function loadFromFirestore(): Promise<ServerDB | null> {
  if (!firestore) return null;
  try {
    const dbRef = firestore.collection("gcap_database");
    const docs = [
      "users", "wallets", "investments", "transactions", "plans", "rules", 
      "liveConfig", "bankDetails", "treasury", "treasuryLogs", "messages", 
      "deletedUserIds", "metadata"
    ];
    
    const snaps = await Promise.all(docs.map(docId => dbRef.doc(docId).get()));
    const snapMap: Record<string, any> = {};
    docs.forEach((docId, index) => {
      snapMap[docId] = snaps[index];
    });

    if (!snapMap["users"].exists) {
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

    return loadedDb as ServerDB;
  } catch (err) {
    console.error("[Firebase] Error loading from Firestore:", err);
    return null;
  }
}

function ensureDb(): ServerDB {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initial: ServerDB = {
        users: DEFAULT_ACCOUNTS,
        wallets: {
          "usr-user-01": { ...DEFAULT_WALLET },
        },
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
    if (!parsed.users || !Array.isArray(parsed.users)) parsed.users = DEFAULT_ACCOUNTS;
    if (!parsed.deletedUserIds || !Array.isArray(parsed.deletedUserIds)) parsed.deletedUserIds = [];
    if (!parsed.wallets || typeof parsed.wallets !== "object") parsed.wallets = {};
    if (!parsed.investments || !Array.isArray(parsed.investments)) parsed.investments = [];
    if (!parsed.transactions || !Array.isArray(parsed.transactions)) parsed.transactions = [];
    if (!parsed.plans || !Array.isArray(parsed.plans) || parsed.plans.length === 0) parsed.plans = DEFAULT_PLANS;
    if (!parsed.rules || typeof parsed.rules !== "object") parsed.rules = DEFAULT_RULES;
    if (!parsed.liveConfig || typeof parsed.liveConfig !== "object") parsed.liveConfig = DEFAULT_LIVE_CONFIG;
    if (!parsed.bankDetails || typeof parsed.bankDetails !== "object") parsed.bankDetails = {};
    if (!parsed.treasury || typeof parsed.treasury !== "object") parsed.treasury = INITIAL_TREASURY;
    if (!parsed.treasuryLogs || !Array.isArray(parsed.treasuryLogs)) parsed.treasuryLogs = INITIAL_LOGS;
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

    // Ensure Admin account exists and has 12345 password
    const admin = parsed.users.find(
      (u: StoredAccount) => u.loginId.toLowerCase() === "admin" || u.role === "ADMIN"
    );
    if (admin) {
      if (admin.passwordHash === "admin123" || !admin.passwordHash) {
        admin.passwordHash = "12345";
      }
      admin.loginId = "Admin";
    } else {
      parsed.users.unshift(DEFAULT_ACCOUNTS[0]);
    }

    // Ensure each user has a wallet record
    let needsSave = false;
    parsed.users.forEach((u: StoredAccount) => {
      if (!parsed.wallets[u.id]) {
        parsed.wallets[u.id] = { ...DEFAULT_WALLET };
        needsSave = true;
      }
    });

    if (needsSave || !parsed.plans || !parsed.treasury || !parsed.rules) {
      saveDb(parsed);
    }

    return parsed as ServerDB;
  } catch (err) {
    console.error("Error reading server DB:", err);
    return {
      users: DEFAULT_ACCOUNTS,
      wallets: { "usr-user-01": { ...DEFAULT_WALLET } },
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

function saveDb(db: ServerDB): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    db.lastUpdated = new Date().toISOString();
    
    // Save locally
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
    
    // Set local tracking timestamp to avoid redundant self-loading triggers
    lastSyncedTimestamp = db.lastUpdated;
    
    // Write asynchronously to Firestore
    if (firestore) {
      saveToFirestore(db).catch(err => {
        console.error("[Firebase] Async save to Firestore failed:", err);
      });
    }
  } catch (err) {
    console.error("Error saving server DB:", err);
  }
}

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

  // Server-Side Master Database Proxy for GCap Cloud Run Multi-Container Sync
  // If request hits the Shared/Preview App container (host contains "ais-pre-"),
  // proxy the database request server-side directly to the Master Dev App container.
  // This bypasses browser-side CORS blocks, sandboxing, and session isolation.
  app.use((req, res, next) => {
    const host = req.headers.host || "";
    if (
      host.includes("ais-pre-") &&
      req.path.startsWith("/api") &&
      req.path !== "/api/health" &&
      req.path !== "/api/realtime/stream"
    ) {
      const devHost = host.replace("ais-pre-", "ais-dev-");
      const protocol = req.secure || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
      const devOrigin = `${protocol}://${devHost}`;
      const targetUrl = `${devOrigin}${req.originalUrl}`;
      const method = req.method;
      
      const headers: Record<string, string> = {};
      for (const [key, val] of Object.entries(req.headers)) {
        if (typeof val === "string" && key.toLowerCase() !== "host") {
          headers[key] = val;
        }
      }

      fetch(targetUrl, {
        method,
        headers,
        body: ["GET", "HEAD"].includes(method) ? undefined : JSON.stringify(req.body),
      })
        .then(async (proxyRes) => {
          res.status(proxyRes.status);
          proxyRes.headers.forEach((val, key) => {
            res.setHeader(key, val);
          });
          const text = await proxyRes.text();
          res.send(text);
        })
        .catch((err) => {
          console.error("[Master Proxy] Error proxying API request:", err);
          next();
        });
      return;
    }
    next();
  });

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      app: "GCap Main Real-Time Database Server",
      timestamp: new Date().toISOString(),
    });
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
      loadFromFirestore().then(async (remoteDb) => {
        if (remoteDb) {
          // Remote Firestore has data! Seed the local file with it.
          lastSyncedTimestamp = remoteDb.lastUpdated || new Date().toISOString();
          fs.writeFileSync(DB_FILE, JSON.stringify(remoteDb, null, 2), "utf-8");
          console.log(`[Firebase] Initial sync complete. Synced database state updated to timestamp: ${lastSyncedTimestamp}`);
        } else {
          // Firestore is empty. Seed Firestore with whatever we have in DB_FILE.
          console.log("[Firebase] Firestore is empty. Seeding Firestore with local database state...");
          const localDb = ensureDb();
          lastSyncedTimestamp = localDb.lastUpdated;
          await saveToFirestore(localDb);
          console.log("[Firebase] Seeded Firestore successfully.");
        }

        // Setup real-time listener to keep everything synchronized 100% in real-time worldwide
        console.log("[Firebase] Setting up worldwide real-time snapshot listener...");
        firestore.collection("gcap_database").doc("metadata").onSnapshot(async (docSnap: any) => {
          if (docSnap.exists) {
            const data = docSnap.data();
            const firestoreLastUpdated = data?.lastUpdated;
            if (firestoreLastUpdated && firestoreLastUpdated !== lastSyncedTimestamp) {
              console.log(`[Firebase Realtime] Remote database update detected (${firestoreLastUpdated}). Syncing...`);
              const updatedDb = await loadFromFirestore();
              if (updatedDb) {
                lastSyncedTimestamp = updatedDb.lastUpdated;
                fs.writeFileSync(DB_FILE, JSON.stringify(updatedDb, null, 2), "utf-8");
                console.log("[Firebase Realtime] Synchronized database successfully in real-time.");
                
                // Broadcast change to all connected SSE clients so they refresh instantly!
                broadcastRealtimeEvent("state_changed", { type: "FIRESTORE_SYNC", timestamp: Date.now() });
              }
            }
          }
        }, (err: any) => {
          console.error("[Firebase Realtime] Snapshot listener error:", err);
        });
      }).catch(err => {
        console.error("[Firebase] Error during initial database load:", err);
      });
    } catch (err) {
      console.error("[Firebase] Error setting up initial startup synchronization:", err);
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
        wallet: userId && typeof userId === "string" ? db.wallets[userId] || DEFAULT_WALLET : undefined,
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
    const userWallet = (userId && typeof userId === "string" ? db.wallets[userId] : null) || DEFAULT_WALLET;
    const userTxns = (userId && typeof userId === "string")
      ? db.transactions.filter((t) => t.userId === userId || !t.userId)
      : db.transactions;
    const userInvs = (userId && typeof userId === "string")
      ? db.investments.filter((i) => i.userId === userId || !i.userId)
      : db.investments;
    const userBank = userId && typeof userId === "string" ? db.bankDetails[userId] || null : null;

    res.json({
      success: true,
      transactions: userTxns,
      investments: userInvs,
      wallet: userWallet,
      plans: db.plans,
      rules: db.rules,
      liveConfig: db.liveConfig,
      bankDetails: userBank,
      lastUpdated: db.lastUpdated,
      serverTime: Date.now(),
    });
  });

  // POST: Create transaction (Deposit request, Withdrawal request, etc.)
  app.post("/api/transactions", (req, res) => {
    const { transaction, userId } = req.body || {};
    if (!transaction || !transaction.id) {
      return res.status(400).json({ success: false, error: "Invalid transaction payload" });
    }

    const db = ensureDb();
    const effectiveUserId = userId || transaction.userId || "usr-user-01";
    transaction.userId = effectiveUserId;

    // Attach user information if available
    const user = db.users.find((u) => u.id === effectiveUserId);
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

    // Update wallet pending amounts
    if (!db.wallets[effectiveUserId]) {
      db.wallets[effectiveUserId] = { ...DEFAULT_WALLET };
    }
    const wallet = db.wallets[effectiveUserId];

    if (transaction.type === "DEPOSIT" && transaction.status === "PENDING") {
      wallet.pendingDeposits = (wallet.pendingDeposits || 0) + Number(transaction.amount || 0);
    } else if (transaction.type === "WITHDRAWAL" && transaction.status === "PENDING") {
      wallet.pendingWithdrawals = (wallet.pendingWithdrawals || 0) + Number(transaction.amount || 0);
    }

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
    broadcastRealtimeEvent("wallet_updated", { userId: effectiveUserId, wallet, timestamp: Date.now() });
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
        db.treasury.balance = (db.treasury.balance || 0) + amount;
        console.log(`[GCap DB] Deposit Approved: ₹${amount} credited to user ${effectiveUserId}`);
      } else if (transaction.status === "REJECTED" && prevTxn?.status === "PENDING") {
        wallet.pendingDeposits = Math.max(0, (wallet.pendingDeposits || 0) - amount);
      }
    } else if (transaction.type === "WITHDRAWAL") {
      if (transaction.status === "SUCCESS" && prevTxn?.status !== "SUCCESS") {
        // Admin approves withdrawal!
        wallet.pendingWithdrawals = Math.max(0, (wallet.pendingWithdrawals || 0) - amount);
        wallet.totalWithdrawn = (wallet.totalWithdrawn || 0) + amount;
        db.treasury.balance = Math.max(0, (db.treasury.balance || 0) - amount);
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
    saveDb(db);

    broadcastRealtimeEvent("transaction_created", { transaction, timestamp: Date.now() });
    broadcastRealtimeEvent("state_changed", { type: "TRANSACTION_ADD", timestamp: Date.now() });

    res.json({ success: true, transaction });
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
    const { investment, userId } = req.body || {};
    if (!investment || !investment.id) {
      return res.status(400).json({ success: false, error: "Invalid investment payload" });
    }

    const db = ensureDb();
    const effectiveUserId = userId || investment.userId || "usr-user-01";
    investment.userId = effectiveUserId;

    // Deduct investedAmount from wallet cashBalance and add to totalInvested
    if (!db.wallets[effectiveUserId]) {
      db.wallets[effectiveUserId] = { ...DEFAULT_WALLET };
    }
    const wallet = db.wallets[effectiveUserId];
    const amount = Number(investment.investedAmount || 0);

    wallet.cashBalance = Math.max(0, (wallet.cashBalance || 0) - amount);
    wallet.totalInvested = (wallet.totalInvested || 0) + amount;

    db.investments.unshift(investment);
    saveDb(db);

    console.log(`[GCap DB] Investment created: ${investment.planName} (₹${amount}) by ${effectiveUserId}`);

    broadcastRealtimeEvent("investment_created", {
      investment,
      userId: effectiveUserId,
      wallet,
      timestamp: Date.now(),
      message: `New investment: ${investment.planName} (₹${amount}) by ${effectiveUserId}`,
    });
    broadcastRealtimeEvent("wallet_updated", { userId: effectiveUserId, wallet, timestamp: Date.now() });
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
      db.treasuryLogs.unshift(log);
    }
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

  // POST: Update Wallet directly
  app.post("/api/wallet/update", (req, res) => {
    const { userId, wallet } = req.body || {};
    if (!userId || !wallet) return res.status(400).json({ success: false, error: "User ID and wallet required" });

    const db = ensureDb();
    db.wallets[userId] = { ...DEFAULT_WALLET, ...wallet };
    saveDb(db);

    broadcastRealtimeEvent("wallet_updated", { userId, wallet: db.wallets[userId], timestamp: Date.now() });
    broadcastRealtimeEvent("state_changed", { type: "WALLET_UPDATE", timestamp: Date.now() });

    res.json({ success: true, wallet: db.wallets[userId] });
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
    const includeHash = req.query.internal === "true";
    if (includeHash) {
      res.json({ success: true, users: db.users });
    } else {
      const publicUsers = db.users.map(({ passwordHash: _, ...p }) => p);
      res.json({ success: true, users: publicUsers });
    }
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
    const cleanPhone = trimmedId.replace(/[^0-9]/g, "");

    const account = db.users.find(
      (acc) =>
        acc.loginId.toLowerCase() === trimmedId ||
        (acc.email && acc.email.toLowerCase() === trimmedId) ||
        (cleanPhone && acc.phone.replace(/[^0-9]/g, "") === cleanPhone)
    );

    if (!account) {
      return res.status(404).json({
        success: false,
        error: "खाता नहीं मिला। कृपया अपनी आईडी जांचें या नया खाता बनाएं।",
      });
    }

    const isAdmin =
      account.role === "ADMIN" ||
      account.loginId.toLowerCase() === "admin" ||
      trimmedId === "admin";

    if (isAdmin) {
      // Default 12345, legacy admin123, or custom updated password
      if (
        trimmedPass === "12345" ||
        trimmedPass === "admin123" ||
        account.passwordHash === trimmedPass
      ) {
        if (trimmedPass === "12345" || trimmedPass === "admin123") {
          account.passwordHash = "12345";
          saveDb(db);
        }
      } else {
        return res.status(401).json({
          success: false,
          error: "गलत पासवर्ड। एडमिन का डिफ़ॉल्ट पासवर्ड 12345 है।",
        });
      }
    } else {
      if (account.passwordHash !== trimmedPass) {
        return res.status(401).json({
          success: false,
          error: "गलत पासवर्ड। कृपया पुनः प्रयास करें।",
        });
      }
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
      account: account, // Returns account with passwordHash so client local storage is synchronously updated
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
    const cleanPhone = String(phone || "").trim().replace(/[^0-9]/g, "");
    const cleanLoginId = String(loginId || cleanPhone).trim().toLowerCase();
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
    const existing = db.users.find(
      (acc) =>
        acc.loginId.toLowerCase() === cleanLoginId ||
        acc.phone.replace(/[^0-9]/g, "") === cleanPhone
    );

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
      phone: String(phone || "").trim(),
      email: String(email || "").trim() || `${cleanPhone}@gcap.user`,
      referralCode: `GCAP-${cleanPhone.slice(-6).toUpperCase()}`,
      referredBy: referralCode ? String(referralCode).trim().toUpperCase() : undefined,
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
    broadcastRealtimeEvent("user_registered", {
      user: profile,
      timestamp: Date.now(),
      message: `नया यूज़र रजिस्टर हुआ: ${cleanName} (${cleanPhone})`,
    });
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
          passwordHash: String(rawAcc.passwordHash || (rawAcc.role === "ADMIN" ? "12345" : "demo123")).trim(),
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
    const { name, loginId, phone, email, password, role, status, joinedDate } = req.body || {};

    const cleanName = String(name || "").trim();
    const cleanLoginId = String(loginId || "").trim().toLowerCase();
    const cleanPhone = String(phone || "").trim();
    const cleanPassword = String(password || "demo123").trim();

    if (!cleanName || cleanName.length < 2) {
      return res.status(400).json({ success: false, error: "कृपया पूरा नाम दर्ज करें" });
    }
    if (!cleanLoginId || cleanLoginId.length < 3) {
      return res.status(400).json({ success: false, error: "लॉगिन आईडी कम से कम 3 अक्षरों की होनी चाहिए" });
    }
    if (!cleanPhone) {
      return res.status(400).json({ success: false, error: "कृपया फ़ोन नंबर दर्ज करें" });
    }

    const db = ensureDb();
    const existing = db.users.find(
      (acc) =>
        acc.loginId.toLowerCase() === cleanLoginId ||
        acc.phone.replace(/[^0-9]/g, "") === cleanPhone.replace(/[^0-9]/g, "")
    );

    if (existing) {
      return res.status(400).json({
        success: false,
        error: "यह लॉगिन आईडी या फ़ोन नंबर पहले से मौजूद है।",
      });
    }

    const newAccount: StoredAccount = {
      id: `usr-${Date.now()}`,
      loginId: cleanLoginId,
      name: cleanName,
      role: role === "ADMIN" ? "ADMIN" : "USER",
      phone: cleanPhone,
      email: String(email || "").trim() || `${cleanLoginId}@gcap.in`,
      referralCode: `GCAP-${cleanLoginId.toUpperCase()}`,
      joinedDate: String(joinedDate || "").trim() || new Date().toISOString().split("T")[0],
      status: status === "BLOCKED" ? "BLOCKED" : "ACTIVE",
      passwordHash: cleanPassword,
    };

    db.users.push(newAccount);
    db.wallets[newAccount.id] = { ...DEFAULT_WALLET };
    saveDb(db);

    const { passwordHash: _, ...profile } = newAccount;

    broadcastRealtimeEvent("user_added", { user: profile, timestamp: Date.now() });
    broadcastRealtimeEvent("users_updated", {
      users: db.users.map(({ passwordHash: _, ...p }) => p),
      timestamp: Date.now(),
    });
    broadcastRealtimeEvent("state_changed", { type: "USER_ADD", timestamp: Date.now() });

    res.json({ success: true, user: profile, account: newAccount });
  });

  // POST: Admin Update User
  app.post("/api/users/update", (req, res) => {
    const { userId, updates } = req.body || {};
    if (!userId) {
      return res.status(400).json({ success: false, error: "User ID is required" });
    }

    const db = ensureDb();
    const targetIdx = db.users.findIndex((u) => u.id === userId);
    if (targetIdx === -1) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const current = db.users[targetIdx];
    if (updates.name) current.name = updates.name.trim();
    if (updates.phone) current.phone = updates.phone.trim();
    if (updates.email) current.email = updates.email.trim();
    if (updates.password && updates.password.trim()) current.passwordHash = updates.password.trim();
    if (updates.role) current.role = updates.role;
    if (updates.status) current.status = updates.status;
    if (updates.joinedDate) current.joinedDate = updates.joinedDate;

    saveDb(db);

    const { passwordHash: _, ...profile } = current;

    broadcastRealtimeEvent("user_updated", { user: profile, timestamp: Date.now() });
    broadcastRealtimeEvent("users_updated", {
      users: db.users.map(({ passwordHash: _, ...p }) => p),
      timestamp: Date.now(),
    });
    broadcastRealtimeEvent("state_changed", { type: "USER_UPDATE", timestamp: Date.now() });

    res.json({ success: true, user: profile, account: current });
  });

  // DELETE: Admin Delete User
  app.delete("/api/users/:id", (req, res) => {
    const userId = req.params.id;
    const db = ensureDb();

    const target = db.users.find((u) => u.id === userId);
    if (!target) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    if (target.loginId.toLowerCase() === "admin" || target.role === "ADMIN") {
      return res.status(400).json({ success: false, error: "मुख्य एडमिन खाते को हटाया नहीं जा सकता।" });
    }

    db.users = db.users.filter((u) => u.id !== userId);
    if (!db.deletedUserIds) db.deletedUserIds = [];
    if (!db.deletedUserIds.includes(userId)) {
      db.deletedUserIds.push(userId);
    }
    if (target.phone && !db.deletedUserIds.includes(target.phone)) {
      db.deletedUserIds.push(target.phone);
    }
    if (target.loginId && !db.deletedUserIds.includes(target.loginId.toLowerCase())) {
      db.deletedUserIds.push(target.loginId.toLowerCase());
    }

    delete db.wallets[userId];
    delete db.bankDetails[userId];
    saveDb(db);

    broadcastRealtimeEvent("user_deleted", { userId, timestamp: Date.now() });
    broadcastRealtimeEvent("users_updated", {
      users: db.users.map(({ passwordHash: _, ...p }) => p),
      timestamp: Date.now(),
    });
    broadcastRealtimeEvent("state_changed", { type: "USER_DELETE", timestamp: Date.now() });

    res.json({ success: true, message: "User deleted successfully", remaining: db.users.length });
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
