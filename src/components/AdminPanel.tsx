import React, { useState, useEffect } from 'react';
import {
  Award,
  TrendingUp,
  Users,
  Clock,
  Sliders,
  Eye,
  LogOut,
  ArrowDownLeft,
  ArrowUpRight,
  FileText,
  Layers,
  PlusCircle,
  ShieldCheck,
  RotateCcw,
  Building2,
  AlertTriangle,
  Zap,
  Database,
  FileSpreadsheet,
  Radio,
  ArrowLeft,
  FileCheck,
} from 'lucide-react';
import {
  AppRules,
  CompanyTreasury,
  InvestmentPlan,
  Language,
  Transaction,
  TreasuryLog,
  UserProfile,
  UserRole,
  Wallet,
  BackupRecord,
  BackupDataPayload,
  LiveInterfaceConfig,
} from '../types';
import { formatINR } from '../utils/storage';
import { DEFAULT_ALERT_THRESHOLD } from '../utils/treasuryStorage';
import {
  getAllUsers,
  adminAddUser,
  adminUpdateUser,
  adminDeleteUser,
  syncUsersWithServer,
  subscribeToUsersUpdates,
} from '../utils/authStorage';
import { exportAllDataToExcel } from '../utils/excelExport';
import { AdminPlansTab } from './admin/AdminPlansTab';
import { AdminUsersTab } from './admin/AdminUsersTab';
import { AdminTransactionsTab } from './admin/AdminTransactionsTab';
import { AdminTreasuryTab } from './admin/AdminTreasuryTab';
import { AdminBackupTab } from './admin/AdminBackupTab';
import { AdminOtaTab } from './admin/AdminOtaTab';
import { AdminInvestmentsTab } from './admin/AdminInvestmentsTab';
import { AdminCompanyProfileTab } from './admin/AdminCompanyProfileTab';
import { CompanyBalanceCard } from './admin/CompanyBalanceCard';
import { CompanyBalanceModal } from './admin/CompanyBalanceModal';
import { PlanEditModal } from './admin/PlanEditModal';
import { UserEditModal } from './admin/UserEditModal';
import { TransactionEditModal } from './admin/TransactionEditModal';
import { ProjectCertificateModal } from './admin/ProjectCertificateModal';
import { UserAgreementModal } from './UserAgreementModal';
import { ActiveInvestment } from '../types';

interface AdminPanelProps {
  adminUser: UserProfile;
  language: Language;
  rules: AppRules;
  wallet: Wallet;
  transactions: Transaction[];
  plans: InvestmentPlan[];
  investments: ActiveInvestment[];
  treasury: CompanyTreasury;
  treasuryLogs: TreasuryLog[];
  backups: BackupRecord[];
  currentPayload: BackupDataPayload;
  liveConfig: LiveInterfaceConfig;
  onUpdateLiveConfig: (config: LiveInterfaceConfig) => void;
  onResetLiveConfig: () => void;
  onOpenRules: () => void;
  onSwitchToInvestorView: () => void;
  onLogout: () => void;
  onAddPlan: (plan: InvestmentPlan) => void;
  onUpdatePlan: (plan: InvestmentPlan) => void;
  onDeletePlan: (planId: string) => void;
  onResetPlans: () => void;
  onAddTransaction: (txn: Transaction) => void;
  onUpdateTransaction: (txn: Transaction) => void;
  onDeleteTransaction: (txnId: string) => void;
  onSimulateComplete24hLock?: (investmentId: string) => void;
  onSimulateComplete6hCycle?: (investmentId: string) => void;
  onSimulateMaturity641Days?: (investmentId: string) => void;
  onAdminAddCompanyBalance: (amount: number, reason: string, reasonHi: string, refId?: string) => void;
  onAdminDeductCompanyBalance: (amount: number, reason: string, reasonHi: string, refId?: string) => void;
  onQuickAddCompanyBalance: (amount: number) => void;
  onResetTreasury: () => void;
  onRunMidnightBackupNow: () => void;
  onCreateManualSnapshot: (customDate?: string, note?: string) => void;
  onRestoreBackup: (backup: BackupRecord) => void;
  onDeleteBackup: (id: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  adminUser,
  language,
  rules,
  wallet,
  transactions,
  plans,
  investments = [],
  treasury,
  treasuryLogs,
  backups,
  currentPayload,
  liveConfig,
  onUpdateLiveConfig,
  onResetLiveConfig,
  onOpenRules,
  onSwitchToInvestorView,
  onLogout,
  onAddPlan,
  onUpdatePlan,
  onDeletePlan,
  onResetPlans,
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
  onSimulateComplete24hLock,
  onSimulateComplete6hCycle,
  onSimulateMaturity641Days,
  onAdminAddCompanyBalance,
  onAdminDeductCompanyBalance,
  onQuickAddCompanyBalance,
  onResetTreasury,
  onRunMidnightBackupNow,
  onCreateManualSnapshot,
  onRestoreBackup,
  onDeleteBackup,
}) => {
  const isHi = language === 'hi';
  const [activeSubTab, setActiveSubTab] = useState<
    'OVERVIEW' | 'INVESTMENTS' | 'TREASURY' | 'COMPANY_PROFILE' | 'BACKUP' | 'PLANS' | 'USERS' | 'TRANSACTIONS' | 'OTA'
  >('OVERVIEW');

  // Company Balance Modal state
  const [balanceModalOpen, setBalanceModalOpen] = useState(false);
  const [balanceModalMode, setBalanceModalMode] = useState<'ADD' | 'DEDUCT'>('ADD');

  const isLowBalance = treasury.balance <= DEFAULT_ALERT_THRESHOLD;

  // Users state from auth storage
  const [usersList, setUsersList] = useState<UserProfile[]>(getAllUsers);
  const [isSyncingUsers, setIsSyncingUsers] = useState(false);

  // Modals state
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null);

  const [userModalOpen, setUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  const [txnModalOpen, setTxnModalOpen] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);

  const [certModalOpen, setCertModalOpen] = useState(false);

  // User Legal Agreement Modal State
  const [agreementModalOpen, setAgreementModalOpen] = useState(false);
  const [agreementUser, setAgreementUser] = useState<UserProfile | null>(null);

  // Refresh and sync users list with centralized server
  const refreshUsers = async () => {
    setIsSyncingUsers(true);
    try {
      const updated = await syncUsersWithServer();
      setUsersList(updated);
    } catch {
      setUsersList(getAllUsers());
    } finally {
      setIsSyncingUsers(false);
    }
  };

  // Live subscription and heartbeat polling so any new registration appears immediately
  useEffect(() => {
    // 1. Initial sync on mount
    refreshUsers();

    // 2. Subscribe to custom event & cross-tab storage changes
    const unsubscribe = subscribeToUsersUpdates((updated) => {
      setUsersList(updated);
    });

    // 3. Heartbeat polling every 2 seconds
    const interval = setInterval(() => {
      syncUsersWithServer().then((updated) => {
        setUsersList(updated);
      }).catch(() => {});
    }, 2000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  // When switching to USERS or OVERVIEW subtabs, trigger immediate refresh
  useEffect(() => {
    if (activeSubTab === 'USERS' || activeSubTab === 'OVERVIEW') {
      refreshUsers();
    }
  }, [activeSubTab]);

  // User Actions
  const handleOpenAddUser = () => {
    setSelectedUser(null);
    setUserModalOpen(true);
  };

  const handleOpenEditUser = (user: UserProfile) => {
    setSelectedUser(user);
    setUserModalOpen(true);
  };

  const handleSaveUser = (data: {
    userId?: string;
    name: string;
    loginId: string;
    phone: string;
    email: string;
    password?: string;
    role: UserRole;
    status: 'ACTIVE' | 'BLOCKED';
    joinedDate?: string;
    backdatedPlanId?: string;
    backdatedAmount?: number;
    backdatedWithdrawal?: number;
  }) => {
    if (data.userId) {
      const res = adminUpdateUser(data.userId, {
        name: data.name,
        phone: data.phone,
        email: data.email,
        password: data.password,
        role: data.role,
        status: data.status,
        joinedDate: data.joinedDate,
      });
      if (!res.success) {
        alert(res.error || 'User update failed');
        return;
      }
    } else {
      const res = adminAddUser({
        name: data.name,
        loginId: data.loginId,
        phone: data.phone,
        email: data.email,
        password: data.password,
        role: data.role,
        status: data.status,
        joinedDate: data.joinedDate,
      });
      if (!res.success) {
        alert(res.error || 'User add failed');
        return;
      }
    }
    refreshUsers();
  };

  const handleToggleUserStatus = (userId: string, currentStatus: 'ACTIVE' | 'BLOCKED') => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    adminUpdateUser(userId, { status: nextStatus });
    refreshUsers();
  };

  const handleDeleteUser = (userId: string) => {
    adminDeleteUser(userId);
    refreshUsers();
  };

  // Plan Actions
  const handleOpenAddPlan = () => {
    setSelectedPlan(null);
    setPlanModalOpen(true);
  };

  const handleOpenEditPlan = (plan: InvestmentPlan) => {
    setSelectedPlan(plan);
    setPlanModalOpen(true);
  };

  const handleSavePlan = (plan: InvestmentPlan) => {
    if (selectedPlan) {
      onUpdatePlan(plan);
    } else {
      onAddPlan(plan);
    }
  };

  // Transaction Actions
  const handleOpenAddTxn = () => {
    setSelectedTxn(null);
    setTxnModalOpen(true);
  };

  const handleOpenEditTxn = (txn: Transaction) => {
    setSelectedTxn(txn);
    setTxnModalOpen(true);
  };

  const handleSaveTxn = (txn: Transaction) => {
    if (selectedTxn) {
      onUpdateTransaction(txn);
    } else {
      onAddTransaction(txn);
    }
  };

  const handleQuickApprove = (txnId: string) => {
    const target = transactions.find((t) => t.id === txnId);
    if (target) {
      onUpdateTransaction({ ...target, status: 'SUCCESS' });
    }
  };

  const handleRejectTransaction = (txnId: string) => {
    const target = transactions.find((t) => t.id === txnId);
    if (target) {
      onUpdateTransaction({ ...target, status: 'REJECTED' });
    }
  };

  // Platform Metrics
  const totalDeposits = transactions
    .filter((t) => t.type === 'DEPOSIT' && t.status === 'SUCCESS')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalWithdrawals = transactions
    .filter((t) => t.type === 'WITHDRAWAL' && t.status === 'SUCCESS')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalRoiPaid = transactions
    .filter((t) => t.type === 'RETURN_PAYOUT' && t.status === 'SUCCESS')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Persistent Back to User / Investor Screen Bar */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-2 border-emerald-500/50 rounded-2xl p-3.5 px-4 sm:px-5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-sm font-black text-white flex items-center gap-1.5">
              <span>{isHi ? '👑 एडमिन कंट्रोल हब (Admin Hub)' : '👑 Admin Control Hub'}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/40">
                ACTIVE
              </span>
            </span>
            <p className="text-xs text-slate-300">
              {isHi
                ? 'सामान्य यूजर/इन्वेस्टर स्क्रीन पर वापस लौटने के लिए यह बटन दबाएं:'
                : 'Return to regular investor user panel at any time:'}
            </p>
          </div>
        </div>

        <button
          id="btn-admin-top-back-investor"
          onClick={onSwitchToInvestorView}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs sm:text-sm font-black transition-all shadow-lg shadow-emerald-500/25 cursor-pointer active:scale-95 shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isHi ? '← वापस यूजर/इन्वेस्टर स्क्रीन (Back to User View)' : '← Back to User View'}</span>
        </button>
      </div>

      {/* Admin Welcome Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40 shrink-0 shadow-lg shadow-amber-500/10">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white">
                  {isHi ? 'GCap एडमिन कंट्रोल हब (Master Portal)' : 'GCap Admin Control Hub'}
                </h2>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  SUPER ADMIN
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isHi
                  ? `लॉगिन आईडी: ${adminUser.loginId} (${adminUser.name}) • सब कुछ जोड़ें, एडिट करें और हटाएं (CRUD)`
                  : `Logged in as: ${adminUser.loginId} (${adminUser.name}) • Full control to Add, Edit, and Delete everything`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="btn-admin-header-export-excel"
              onClick={() => exportAllDataToExcel(currentPayload, 'GCap_All_Data_Export')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-700/20 cursor-pointer"
              title={isHi ? 'पूरा डेटा Excel में एक्सपोर्ट करें' : 'Export all data to Excel (.xlsx)'}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{isHi ? 'Excel एक्सपोर्ट (.xlsx)' : 'Export to Excel'}</span>
            </button>

            <button
              id="btn-admin-certificate-sample"
              onClick={() => setCertModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold transition-all shadow-md shadow-amber-500/20 cursor-pointer"
              title={isHi ? 'प्रोजेक्ट समापन प्रमाण पत्र सैंपल देखें व प्रिंट करें' : 'View & Print Completion Certificate Sample'}
            >
              <Award className="w-3.5 h-3.5" />
              <span>{isHi ? '📜 प्रमाण पत्र सैंपल' : '📜 Certificate Sample'}</span>
            </button>

            <button
              id="btn-admin-agreement-view"
              onClick={() => {
                const firstInvestor = usersList.find((u) => u.role === 'USER') || usersList[0] || null;
                setAgreementUser(firstInvestor);
                setAgreementModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-black transition-all shadow-md shadow-cyan-600/20 cursor-pointer border border-cyan-400/40 active:scale-95"
              title={isHi ? 'यूजर कानूनी अनुबंध पत्र देखें व प्रिंट करें' : 'View & Print Legal Agreement PDF'}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>{isHi ? '📄 कानूनी अनुबंध (Agreement)' : '📄 Legal Agreement'}</span>
            </button>

            <button
              id="btn-admin-manage-rules"
              onClick={onOpenRules}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isHi ? '⚙️ नियम व सीमाएं बदलें' : '⚙️ Manage Rules'}</span>
            </button>

            <button
              id="btn-admin-switch-investor"
              onClick={onSwitchToInvestorView}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black transition-all shadow-lg shadow-emerald-600/30 cursor-pointer border border-emerald-400/40 active:scale-95"
            >
              <Eye className="w-4 h-4 text-emerald-200" />
              <span>{isHi ? '👈 इन्वेस्टर/यूजर मोड में जाएं (Investor View)' : '👈 Switch to Investor Mode'}</span>
            </button>

            <button
              id="btn-admin-logout"
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{isHi ? 'लॉगआउट' : 'Logout'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="space-y-2">
        {/* Mobile Dropdown Menu Selector */}
        <div className="block sm:hidden bg-slate-900 border border-slate-700 rounded-xl p-2.5">
          <label className="block text-[10px] text-slate-400 font-semibold mb-1 uppercase tracking-wider">
            {isHi ? '📑 एडमिन मेनू नेविगेशन (Select Section)' : '📑 Admin Menu Navigation'}
          </label>
          <select
            value={activeSubTab}
            onChange={(e) => setActiveSubTab(e.target.value as any)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-600 rounded-lg text-white text-xs font-bold focus:outline-none focus:border-amber-400"
          >
            <option value="OVERVIEW">📊 {isHi ? 'सिस्टम अवलोकन (Overview)' : 'System Overview'}</option>
            <option value="TREASURY">💰 {isHi ? 'कंपनी मुख्य बैलेंस (Company Treasury)' : 'Company Treasury'}</option>
            <option value="INVESTMENTS">⚡ {isHi ? 'निवेश व 6h चक्र (Portfolios)' : 'Portfolios & 6h Cycles'}</option>
            <option value="PLANS">📦 {isHi ? 'प्लान्स प्रबंधन (Plans Manager)' : 'Plans Manager'}</option>
            <option value="USERS">👥 {isHi ? 'यूज़र्स प्रबंधन (Users Manager)' : 'Users Manager'}</option>
            <option value="TRANSACTIONS">🕒 {isHi ? 'लेनदेन प्रबंधन (Transactions)' : 'Transactions'}</option>
            <option value="BACKUP">💾 {isHi ? 'डेटा बैकअप व रिस्टोर' : 'Backup & Restore'}</option>
            <option value="COMPANY_PROFILE">🏢 {isHi ? 'कंपनी प्रोफाइल व लीगल' : 'Company Profile & Legal'}</option>
            <option value="OTA">📡 {isHi ? 'OTA व लाइव कंट्रोल' : 'OTA & Live Control'}</option>
          </select>
        </div>

        <div className="hidden sm:flex flex-wrap items-center justify-between border-b border-slate-800 bg-slate-900/60 rounded-xl p-1 gap-1">
        <div className="flex flex-wrap items-center gap-1">
          {activeSubTab !== 'OVERVIEW' && (
            <button
              onClick={() => setActiveSubTab('OVERVIEW')}
              className="flex items-center gap-1 px-3 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer active:scale-95 mr-1"
              title={isHi ? 'मुख्य अवलोकन पर वापस लौटें' : 'Back to Overview'}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{isHi ? '← बैक (अवलोकन)' : '← Back (Overview)'}</span>
            </button>
          )}

          <button
            id="tab-admin-overview"
            onClick={() => setActiveSubTab('OVERVIEW')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'OVERVIEW'
                ? 'bg-slate-800 text-amber-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
          <TrendingUp className="w-4 h-4" />
          <span>{isHi ? 'सिस्टम अवलोकन' : 'Overview'}</span>
        </button>

        <button
          id="tab-admin-treasury"
          onClick={() => setActiveSubTab('TREASURY')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === 'TREASURY'
              ? 'bg-slate-800 text-emerald-400 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>{isHi ? 'कंपनी मुख्य बैलेंस' : 'Company Treasury'}</span>
          {isLowBalance ? (
            <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-mono text-[10px] font-black animate-pulse">
              ⚠️ {isHi ? 'कम' : 'LOW'}
            </span>
          ) : (
            <span className="px-1.5 py-0.5 rounded-full bg-slate-700 text-slate-300 font-mono text-[10px]">
              {formatINR(treasury.balance)}
            </span>
          )}
        </button>

        <button
          id="tab-admin-investments"
          onClick={() => setActiveSubTab('INVESTMENTS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === 'INVESTMENTS'
              ? 'bg-slate-800 text-emerald-400 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap className="w-4 h-4 text-emerald-400" />
          <span>{isHi ? 'निवेश व 6h चक्र (Portfolios)' : 'Portfolios & 6h Cycles'}</span>
          <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
            {investments.length}
          </span>
        </button>

        <button
          id="tab-admin-plans"
          onClick={() => setActiveSubTab('PLANS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === 'PLANS'
              ? 'bg-slate-800 text-emerald-400 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{isHi ? 'प्लान्स प्रबंधन (Plans CRUD)' : 'Plans Manager'} ({plans.length})</span>
        </button>

        <button
          id="tab-admin-users"
          onClick={() => setActiveSubTab('USERS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === 'USERS'
              ? 'bg-slate-800 text-cyan-400 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{isHi ? 'यूज़र्स प्रबंधन (Users CRUD)' : 'Users Manager'} ({usersList.length})</span>
        </button>

        <button
          id="tab-admin-txns"
          onClick={() => setActiveSubTab('TRANSACTIONS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === 'TRANSACTIONS'
              ? 'bg-slate-800 text-purple-400 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{isHi ? 'लेनदेन प्रबंधन (Txns CRUD)' : 'Transactions'} ({transactions.length})</span>
        </button>

        <button
          id="tab-admin-backup"
          onClick={() => setActiveSubTab('BACKUP')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === 'BACKUP'
              ? 'bg-slate-800 text-indigo-300 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database className="w-4 h-4 text-indigo-400" />
          <span>{isHi ? 'डेटा बैकअप व रिस्टोर' : 'Backup & Restore'}</span>
          <span className="px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[10px] font-bold">
            12 AM Auto ({backups.length})
          </span>
        </button>

        <button
          id="tab-admin-company-profile"
          onClick={() => setActiveSubTab('COMPANY_PROFILE')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === 'COMPANY_PROFILE'
              ? 'bg-slate-800 text-amber-400 shadow-sm border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4 text-amber-400" />
          <span>{isHi ? '🏢 GCap कंपनी प्रोफ़ाइल (Pvt Ltd)' : '🏢 GCap Company Profile'}</span>
          <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold">
            Pvt Ltd
          </span>
        </button>

        <button
          id="tab-admin-ota"
          onClick={() => setActiveSubTab('OTA')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === 'OTA'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>{isHi ? 'लाइव इन-ऐप OTA व इंटरफ़ेस' : 'Live OTA & UI Engine'}</span>
          <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 font-mono text-[10px] font-bold">
            {liveConfig.appVersion}
          </span>
        </button>
        </div>
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeSubTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* Company Main Treasury Card */}
          <CompanyBalanceCard
            treasury={treasury}
            language={language}
            onOpenAddModal={() => {
              setBalanceModalMode('ADD');
              setBalanceModalOpen(true);
            }}
            onOpenDeductModal={() => {
              setBalanceModalMode('DEDUCT');
              setBalanceModalOpen(true);
            }}
            onQuickAdd={(amt) => onQuickAddCompanyBalance(amt)}
            onOpenHistory={() => setActiveSubTab('TREASURY')}
          />

          {/* Key Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>{isHi ? 'कुल प्राप्त डिपॉजिट' : 'Total Deposits'}</span>
                <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-bold font-mono text-emerald-400">
                {formatINR(totalDeposits + 500000)}
              </p>
              <p className="text-[11px] text-slate-400">{isHi ? '100% वेरिफाइड फंड्स' : '100% Verified Bank/UPI'}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>{isHi ? 'वितरित दैनिक रिटर्न (ROI)' : 'Total ROI Paid'}</span>
                <TrendingUp className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-2xl font-bold font-mono text-purple-300">
                {formatINR(totalRoiPaid + 42350)}
              </p>
              <p className="text-[11px] text-slate-400">{isHi ? 'दैनिक ऑटोमेटेड पेआउट' : 'Daily Automated Cycles'}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>{isHi ? 'सफल कुल निकासी' : 'Total Withdrawals'}</span>
                <ArrowUpRight className="w-4 h-4 text-rose-400" />
              </div>
              <p className="text-2xl font-bold font-mono text-rose-300">
                {formatINR(totalWithdrawals + 18500)}
              </p>
              <p className="text-[11px] text-slate-400">{isHi ? '24x7 तत्काल UPI/IMPS' : 'Instant 24x7 Cleared'}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>{isHi ? 'सक्रिय पंजीकृत यूज़र्स' : 'Active Accounts'}</span>
                <Users className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-bold font-mono text-amber-300">
                {usersList.length}
              </p>
              <p className="text-[11px] text-slate-400">{isHi ? 'सुरक्षित केवाईसी डाटाबेस' : 'Secured User DB'}</p>
            </div>
          </div>

          {/* Quick Action Hub for Admin */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              onClick={() => setActiveSubTab('PLANS')}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">
                {isHi ? 'प्लान्स जोड़ें / एडिट करें' : 'Manage Investment Plans'}
              </h4>
              <p className="text-xs text-slate-400">
                {isHi
                  ? `वर्तमान में ${plans.length} प्लान्स सक्रिय हैं। नया जोड़ें या ROI/अवधि बदलें।`
                  : `Currently ${plans.length} schemes active. Add new or adjust returns.`}
              </p>
            </div>

            <div
              onClick={() => setActiveSubTab('USERS')}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">
                {isHi ? 'यूज़र्स जोड़ें / ब्लॉक करें' : 'Manage Investor Accounts'}
              </h4>
              <p className="text-xs text-slate-400">
                {isHi
                  ? `कुल ${usersList.length} निवेशक। नए खाते जोड़ें, पासवर्ड बदलें या ब्लॉक करें।`
                  : `Total ${usersList.length} accounts. Add users, reset passwords, or block.`}
              </p>
            </div>

            <div
              onClick={() => setActiveSubTab('TRANSACTIONS')}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">
                {isHi ? 'लेनदेन जोड़ें / ऑडिट करें' : 'Audit Transactions'}
              </h4>
              <p className="text-xs text-slate-400">
                {isHi
                  ? `कुल ${transactions.length} लेन-देन। मैन्युअल क्रेडिट/डेबिट जोड़ें या स्थिति बदलें।`
                  : `Total ${transactions.length} records. Manually credit, debit, or approve.`}
              </p>
            </div>
          </div>

          {/* Midnight Auto-Backup & Excel System Hub */}
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950/40 border border-slate-800 space-y-4 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 shrink-0">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">
                      {isHi ? 'रात 12:00 बजे ऑटोमैटिक बैकअप एवं Excel एक्सपोर्ट' : 'Midnight Auto-Backup & Full Excel Export'}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                      {isHi ? 'सक्रिय' : 'Active'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isHi
                      ? `कुल ${backups.length} दिनांकवार बैकअप उपलब्ध हैं। आप जिस भी दिनांक से चाहें पूरा डेटा रिस्टोर कर सकते हैं।`
                      : `${backups.length} dated snapshots available. Restore complete platform state from any date anytime.`}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  id="btn-overview-export-excel"
                  onClick={() => exportAllDataToExcel(currentPayload, 'GCap_All_Data_Export')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>{isHi ? 'पूरा डेटा Excel में लें' : 'Export to Excel (.xlsx)'}</span>
                </button>
                <button
                  id="btn-overview-go-backups"
                  onClick={() => setActiveSubTab('BACKUP')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-700/20 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{isHi ? 'दिनांकवार बैकअप देखें व रिस्टोर करें' : 'View Backups & Restore'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Current Rules Enforcement Summary */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">
                  {isHi ? 'लागू प्लेटफ़ॉर्म नियम एवं सीमाएं (Enforced System Rules)' : 'Enforced System Rules & Limits'}
                </h3>
              </div>
              <button
                onClick={onOpenRules}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
              >
                {isHi ? 'संपादित करें →' : 'Edit Rules →'}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-amber-500/30">
                <span className="text-amber-400 block text-[11px] font-semibold">{isHi ? '🪙 GP एक्सचेंज रेट' : '🪙 GP Rate'}</span>
                <span className="font-mono font-bold text-amber-300">₹1 = {rules.gpRatePerRupee ?? 1} GP</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[11px]">{isHi ? 'न्यूनतम डिपॉजिट' : 'Min Deposit'}</span>
                <span className="font-mono font-bold text-white">{formatINR(rules.minDeposit)}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[11px]">{isHi ? 'न्यूनतम निकासी' : 'Min Withdrawal'}</span>
                <span className="font-mono font-bold text-white">{formatINR(rules.minWithdrawal)}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[11px]">{isHi ? 'निकासी शुल्क' : 'Withdrawal Fee'}</span>
                <span className="font-mono font-bold text-emerald-400">{rules.withdrawalFeePercent}%</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[11px]">{isHi ? 'रेफरल कमीशन' : 'Referral Tier'}</span>
                <span className="font-mono font-bold text-amber-300">L1: {rules.referralL1Percent}% | L2: {rules.referralL2Percent}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: ACTIVE INVESTMENTS & 6H CYCLES */}
      {activeSubTab === 'INVESTMENTS' && (
        <AdminInvestmentsTab
          investments={investments}
          language={language}
          onSimulateComplete24hLock={onSimulateComplete24hLock}
          onSimulateComplete6hCycle={onSimulateComplete6hCycle}
          onSimulateMaturity641Days={onSimulateMaturity641Days}
        />
      )}

      {/* TAB: COMPANY PROFILE (PVT LTD DETAILS & LIVE OUTPUT) */}
      {activeSubTab === 'COMPANY_PROFILE' && (
        <AdminCompanyProfileTab language={language} />
      )}

      {/* TAB: TREASURY LEDGER & AUDIT */}
      {activeSubTab === 'TREASURY' && (
        <AdminTreasuryTab
          treasury={treasury}
          logs={treasuryLogs}
          language={language}
          onOpenAddModal={() => {
            setBalanceModalMode('ADD');
            setBalanceModalOpen(true);
          }}
          onOpenDeductModal={() => {
            setBalanceModalMode('DEDUCT');
            setBalanceModalOpen(true);
          }}
          onQuickAdd={(amt) => onQuickAddCompanyBalance(amt)}
          onResetTreasury={onResetTreasury}
        />
      )}

      {/* TAB 2: PLANS CRUD */}
      {activeSubTab === 'PLANS' && (
        <AdminPlansTab
          plans={plans}
          language={language}
          onAddPlan={handleOpenAddPlan}
          onEditPlan={handleOpenEditPlan}
          onDeletePlan={onDeletePlan}
          onResetPlans={onResetPlans}
        />
      )}

      {/* TAB 3: USERS CRUD */}
      {activeSubTab === 'USERS' && (
        <AdminUsersTab
          users={usersList}
          language={language}
          onAddUser={handleOpenAddUser}
          onEditUser={handleOpenEditUser}
          onToggleUserStatus={handleToggleUserStatus}
          onDeleteUser={handleDeleteUser}
          onViewAgreement={(user) => {
            setAgreementUser(user);
            setAgreementModalOpen(true);
          }}
          onRefresh={refreshUsers}
          isSyncing={isSyncingUsers}
        />
      )}

      {/* TAB 4: TRANSACTIONS CRUD */}
      {activeSubTab === 'TRANSACTIONS' && (
        <AdminTransactionsTab
          transactions={transactions}
          language={language}
          onAddTransaction={handleOpenAddTxn}
          onEditTransaction={handleOpenEditTxn}
          onDeleteTransaction={onDeleteTransaction}
          onQuickApprove={handleQuickApprove}
          onRejectTransaction={handleRejectTransaction}
        />
      )}

      {/* TAB 5: BACKUP & RESTORE */}
      {activeSubTab === 'BACKUP' && (
        <AdminBackupTab
          backups={backups}
          currentPayload={currentPayload}
          language={language}
          onRunMidnightBackupNow={onRunMidnightBackupNow}
          onCreateManualSnapshot={onCreateManualSnapshot}
          onRestoreBackup={onRestoreBackup}
          onDeleteBackup={onDeleteBackup}
        />
      )}

      {/* TAB 6: LIVE IN-APP OTA & REMOTE INTERFACE CONFIG */}
      {activeSubTab === 'OTA' && (
        <AdminOtaTab
          config={liveConfig}
          language={language}
          onUpdateConfig={onUpdateLiveConfig}
          onResetConfig={onResetLiveConfig}
        />
      )}

      {/* Modals */}
      <CompanyBalanceModal
        isOpen={balanceModalOpen}
        onClose={() => setBalanceModalOpen(false)}
        mode={balanceModalMode}
        treasury={treasury}
        language={language}
        onAdd={(amount, reason, reasonHi, referenceId) => {
          onAdminAddCompanyBalance(amount, reason, reasonHi, referenceId);
        }}
        onDeduct={(amount, reason, reasonHi, referenceId) => {
          onAdminDeductCompanyBalance(amount, reason, reasonHi, referenceId);
        }}
      />

      <PlanEditModal
        isOpen={planModalOpen}
        onClose={() => setPlanModalOpen(false)}
        plan={selectedPlan}
        onSave={handleSavePlan}
        language={language}
      />

      <UserEditModal
        isOpen={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        user={selectedUser}
        onSave={handleSaveUser}
        language={language}
      />

      <TransactionEditModal
        isOpen={txnModalOpen}
        onClose={() => setTxnModalOpen(false)}
        transaction={selectedTxn}
        onSave={handleSaveTxn}
        language={language}
      />

      <ProjectCertificateModal
        isOpen={certModalOpen}
        onClose={() => setCertModalOpen(false)}
        language={language}
      />

      <UserAgreementModal
        isOpen={agreementModalOpen}
        onClose={() => setAgreementModalOpen(false)}
        user={agreementUser}
        allUsers={usersList}
        rules={rules}
        plans={plans}
        language={language}
      />
    </div>
  );
};
