import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

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

interface ServerDB {
  users: StoredAccount[];
  wallets: Record<string, Wallet>;
  investments: ActiveInvestment[];
  transactions: Transaction[];
  plans: InvestmentPlan[];
  rules: AppRules;
  liveConfig: LiveInterfaceConfig;
  bankDetails: Record<string, BankAccountDetails>;
  treasury: CompanyTreasury;
  treasuryLogs: TreasuryLog[];
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
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    const parsed: any = JSON.parse(raw);

    // Reconcile and ensure all fields exist
    if (!parsed.users || !Array.isArray(parsed.users)) parsed.users = DEFAULT_ACCOUNTS;
    if (!parsed.wallets || typeof parsed.wallets !== "object") parsed.wallets = {};
    if (!parsed.investments || !Array.isArray(parsed.investments)) parsed.investments = [];
    if (!parsed.transactions || !Array.isArray(parsed.transactions)) parsed.transactions = [];
    if (!parsed.plans || !Array.isArray(parsed.plans) || parsed.plans.length === 0) parsed.plans = DEFAULT_PLANS;
    if (!parsed.rules || typeof parsed.rules !== "object") parsed.rules = DEFAULT_RULES;
    if (!parsed.liveConfig || typeof parsed.liveConfig !== "object") parsed.liveConfig = DEFAULT_LIVE_CONFIG;
    if (!parsed.bankDetails || typeof parsed.bankDetails !== "object") parsed.bankDetails = {};
    if (!parsed.treasury || typeof parsed.treasury !== "object") parsed.treasury = INITIAL_TREASURY;
    if (!parsed.treasuryLogs || !Array.isArray(parsed.treasuryLogs)) parsed.treasuryLogs = INITIAL_LOGS;

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
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
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

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      app: "GCap Main Real-Time Database Server",
      timestamp: new Date().toISOString(),
    });
  });

  // Version for OTA Auto-Sync
  app.get("/version.json", (_req, res) => {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.json({
      buildId: String(Date.now()),
      buildTime: new Date().toISOString(),
      appVersion: "2.5.2",
      source: "gcap-central-server",
      message: "Main Worldwide Real-Time Sync Active",
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

    res.json({
      success: true,
      transaction: idx !== -1 ? db.transactions[idx] : transaction,
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

    res.json({ success: true, transaction });
  });

  // DELETE: Admin deletes transaction
  app.delete("/api/transactions/:id", (req, res) => {
    const db = ensureDb();
    db.transactions = db.transactions.filter((t) => t.id !== req.params.id);
    saveDb(db);
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
    res.json({
      success: true,
      investment: idx !== -1 ? db.investments[idx] : investment,
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
    res.json({ success: true, treasury: db.treasury, logs: db.treasuryLogs });
  });

  // POST: Save Bank Details for a user
  app.post("/api/bank-details", (req, res) => {
    const { userId, details } = req.body || {};
    if (!userId) return res.status(400).json({ success: false, error: "User ID required" });

    const db = ensureDb();
    db.bankDetails[userId] = details;
    saveDb(db);
    res.json({ success: true, details });
  });

  // POST: Update Wallet directly
  app.post("/api/wallet/update", (req, res) => {
    const { userId, wallet } = req.body || {};
    if (!userId || !wallet) return res.status(400).json({ success: false, error: "User ID and wallet required" });

    const db = ensureDb();
    db.wallets[userId] = { ...DEFAULT_WALLET, ...wallet };
    saveDb(db);
    res.json({ success: true, wallet: db.wallets[userId] });
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
    res.json({ success: true, user: profile, account: newAccount });
  });

  // POST: Users Sync
  app.post("/api/users/sync", (req, res) => {
    const { accounts } = req.body || {};
    const db = ensureDb();

    if (Array.isArray(accounts)) {
      let changed = false;

      // Add or update from client accounts
      accounts.forEach((clientAcc: StoredAccount) => {
        if (!clientAcc || !clientAcc.id) return;
        const existing = db.users.find((u) => u.id === clientAcc.id || (clientAcc.phone && u.phone === clientAcc.phone));
        if (!existing) {
          db.users.push({
            ...clientAcc,
            passwordHash: clientAcc.passwordHash || "demo123",
          });
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
        }
      });

      if (changed) {
        saveDb(db);
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
    res.json({ success: true, user: profile });
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
    res.json({ success: true, user: profile });
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
    delete db.wallets[userId];
    delete db.bankDetails[userId];
    saveDb(db);

    res.json({ success: true, message: "User deleted successfully" });
  });

  // Vite middleware for development vs static production serve
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`GCap Full-Stack Main Database Server running on port ${PORT}`);
  });
}

startServer();
