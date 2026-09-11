import express from "express";
import fs from "fs";
import path from "path";

// Vercel Serverless Function entry point for GCap API routes
const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// CORS middleware
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

// Database path fallback for Vercel serverless environment (/tmp)
const DATA_DIR = process.env.VERCEL ? path.join("/tmp", "data") : path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "server-db.json");

function ensureVercelDb() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initial = {
        users: [
          {
            id: "usr-admin-01",
            loginId: "admin",
            name: "Super Administrator",
            role: "ADMIN",
            phone: "9876543210",
            email: "admin@gcap.in",
            status: "ACTIVE",
            passwordHash: "admin123"
          }
        ],
        wallets: { "usr-admin-01": { cashBalance: 500000, gpBalance: 10000, totalInvested: 0, totalEarned: 0, royaltyEarned: 0, pendingWithdrawals: 0, pendingDeposits: 0 } },
        investments: [],
        transactions: [],
        plans: [],
        rules: {},
        liveConfig: {},
        bankDetails: {},
        treasury: { balance: 1000000 },
        treasuryLogs: []
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), "utf-8");
      return initial;
    }
    return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
  } catch (e) {
    return { users: [], wallets: {}, investments: [], transactions: [], plans: [], rules: {}, liveConfig: {}, bankDetails: {}, treasury: { balance: 1000000 }, treasuryLogs: [] };
  }
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "GCap Vercel API", timestamp: Date.now() });
});

// Get users endpoint
app.get("/api/users", (req, res) => {
  const db = ensureVercelDb();
  res.json({ success: true, users: db.users.map(({ passwordHash: _, ...u }: any) => u) });
});

// Sync endpoint
app.post("/api/users/sync", (req, res) => {
  try {
    const { users } = req.body || {};
    const db = ensureVercelDb();
    if (Array.isArray(users)) {
      for (const u of users) {
        const existingIdx = db.users.findIndex((x: any) => x.id === u.id || x.phone === u.phone || (u.loginId && x.loginId?.toLowerCase() === u.loginId.toLowerCase()));
        if (existingIdx >= 0) {
          db.users[existingIdx] = { ...db.users[existingIdx], ...u };
        } else {
          db.users.push(u);
        }
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
    }
    res.json({ success: true, users: db.users.map(({ passwordHash: _, ...u }: any) => u) });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Catch-all API fallback
app.all("/api/*all", (req, res) => {
  const db = ensureVercelDb();
  res.json({ success: true, message: "GCap API endpoint active on Vercel", path: req.path, dataCount: db.users?.length || 0 });
});

export default app;
