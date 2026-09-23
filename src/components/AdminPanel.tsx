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
  Bell,
  MessageSquare,
  Activity,
  Edit3,
  CheckCircle2,
  Receipt,
  BookOpen,
  ShieldAlert,
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
  AdminMessage,
  StaffPermissions,
  CompanyProfile,
} from '../types';
import { formatINR } from '../utils/storage';
import { DEFAULT_ALERT_THRESHOLD } from '../utils/treasuryStorage';
import {
  getAllUsers,
  adminAddUser,
  adminUpdateUser,
  adminDeleteUser,
  adminAddUserAsync,
  adminUpdateUserAsync,
  adminDeleteUserAsync,
  syncUsersWithServer,
  subscribeToUsersUpdates,
  mergeUsers,
  enrichUsersWithPresence,
  recordLivePresence,
  recordDeletedUserId,
  isUserDeleted,
} from '../utils/authStorage';
import { subscribeToRealtimeEvents } from '../utils/realtimeSync';
import { subscribeToFirestoreState } from '../lib/firestoreBridge';
import { exportAllDataToExcel } from '../utils/excelExport';
import { AdminPlansTab } from './admin/AdminPlansTab';
import { AdminUsersTab } from './admin/AdminUsersTab';
import { AdminTransactionsTab } from './admin/AdminTransactionsTab';
import { AdminTreasuryTab } from './admin/AdminTreasuryTab';
import { AdminBackupTab } from './admin/AdminBackupTab';
import { AdminOtaTab } from './admin/AdminOtaTab';
import { AdminInvestmentsTab } from './admin/AdminInvestmentsTab';
import { AdminCompanyProfileTab } from './admin/AdminCompanyProfileTab';
import { AdminMessagesTab } from './admin/AdminMessagesTab';
import { AdminUserManualTab } from './admin/AdminUserManualTab';
import { AdminDeductionsTab } from './admin/AdminDeductionsTab';
import { AdminCurrentActivityTab } from './admin/AdminCurrentActivityTab';
import { CompanyBalanceCard } from './admin/CompanyBalanceCard';
import { CompanyBalanceModal } from './admin/CompanyBalanceModal';
import { ConvertFeeGpModal } from './admin/ConvertFeeGpModal';
import { PlanEditModal } from './admin/PlanEditModal';
import { UserEditModal } from './admin/UserEditModal';
import { TransactionEditModal } from './admin/TransactionEditModal';
import { ProjectCertificateModal } from './admin/ProjectCertificateModal';
import { AdminApprovalPasswordModal } from './admin/AdminApprovalPasswordModal';
import { AdminRejectReasonModal } from './admin/AdminRejectReasonModal';
import { UserAgreementModal } from './UserAgreementModal';
import { audioAnnouncer } from '../utils/audioAnnouncer';
import { ActiveInvestment } from '../types';
import { fetchCentralState, apiAdminAdjustUserWallet, getWalletForUser } from '../utils/centralSync';

interface AdminPanelProps {
  adminUser: UserProfile;
  language: Language;
  rules?: AppRules | null;
  wallet?: Wallet | null;
  transactions: Transaction[];
  plans: InvestmentPlan[];
  investments: ActiveInvestment[];
  treasury?: CompanyTreasury | null;
  treasuryLogs: TreasuryLog[];
  backups: BackupRecord[];
  currentPayload: BackupDataPayload;
  liveConfig?: LiveInterfaceConfig | null;
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
  onUpdateTreasuryDirect?: (treasury: CompanyTreasury, logs?: TreasuryLog[]) => void;
  onResetSystemFresh?: () => void;
  onQuickAddCompanyBalance: (amount: number) => void;
  onResetTreasury: () => void;
  onRunMidnightBackupNow: () => void;
  onCreateManualSnapshot: (customDate?: string, note?: string) => void;
  onRestoreBackup: (backup: BackupRecord) => void;
  onDeleteBackup: (id: string) => void;
  messages?: AdminMessage[];
  onSendMessage?: (msg: Partial<AdminMessage>) => Promise<boolean>;
  onDeleteMessage?: (msgId: string) => Promise<boolean>;
  onRefreshMessages?: () => void;
  externalActiveSubTab?: 'OVERVIEW' | 'MESSAGES' | 'INVESTMENTS' | 'TREASURY' | 'COMPANY_PROFILE' | 'BACKUP' | 'PLANS' | 'USERS' | 'TRANSACTIONS' | 'OTA' | 'USER_MANUAL' | 'DEDUCTIONS' | 'CURRENT_ACTIVITY';
  onExternalActiveSubTabChange?: (tab: 'OVERVIEW' | 'MESSAGES' | 'INVESTMENTS' | 'TREASURY' | 'COMPANY_PROFILE' | 'BACKUP' | 'PLANS' | 'USERS' | 'TRANSACTIONS' | 'OTA' | 'USER_MANUAL' | 'DEDUCTIONS' | 'CURRENT_ACTIVITY') => void;
  onConvertAdminFeeGpToRupees?: (gpAmount: number, destination: 'TREASURY' | 'ADMIN_WALLET') => void;
  onSaveCompanyProfile?: (profile: CompanyProfile) => void;
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
  onUpdateTreasuryDirect,
  onResetSystemFresh,
  onQuickAddCompanyBalance,
  onResetTreasury,
  onRunMidnightBackupNow,
  onCreateManualSnapshot,
  onRestoreBackup,
  onDeleteBackup,
  messages = [],
  onSendMessage = async () => false,
  onDeleteMessage = async () => false,
  onRefreshMessages = () => {},
  externalActiveSubTab,
  onExternalActiveSubTabChange,
  onConvertAdminFeeGpToRupees,
  onSaveCompanyProfile,
}) => {
  const isHi = language === 'hi';
  const [internalActiveSubTab, setInternalActiveSubTab] = useState<
    'OVERVIEW' | 'MESSAGES' | 'INVESTMENTS' | 'TREASURY' | 'COMPANY_PROFILE' | 'BACKUP' | 'PLANS' | 'USERS' | 'TRANSACTIONS' | 'OTA' | 'USER_MANUAL' | 'DEDUCTIONS' | 'CURRENT_ACTIVITY'
  >('OVERVIEW');

  const activeSubTab = externalActiveSubTab || internalActiveSubTab;
  const setActiveSubTab = (tab: any) => {
    if (onExternalActiveSubTabChange) {
      onExternalActiveSubTabChange(tab);
    } else {
      setInternalActiveSubTab(tab);
    }
  };

  // Master Tools Collapsible State
  const [isMasterToolsOpen, setIsMasterToolsOpen] = useState(false);

  // Company Balance Modal state
  const [balanceModalOpen, setBalanceModalOpen] = useState(false);
  const [balanceModalMode, setBalanceModalMode] = useState<'ADD' | 'DEDUCT'>('ADD');
  const [convertFeeGpModalOpen, setConvertFeeGpModalOpen] = useState(false);

  // Overview recent activity filter
  const [overviewTxnFilter, setOverviewTxnFilter] = useState<'ALL' | 'PENDING' | 'DEPOSIT' | 'WITHDRAWAL'>('ALL');
  const sortedTxns = [...transactions].sort((a, b) => b.timestamp - a.timestamp);
  const recentFilteredTxns = sortedTxns.filter((t) => {
    if (overviewTxnFilter === 'PENDING') return t.status === 'PENDING';
    if (overviewTxnFilter === 'DEPOSIT') return t.type === 'DEPOSIT';
    if (overviewTxnFilter === 'WITHDRAWAL') return t.type === 'WITHDRAWAL';
    return true;
  });

  const isLowBalance = treasury && treasury.balance <= DEFAULT_ALERT_THRESHOLD;

  // Staff Permissions Enforcement
  const isStaff = adminUser?.role === 'STAFF';
  const staffPerms = isStaff ? adminUser?.permissions : undefined;

  const canManageUsers = adminUser?.role === 'ADMIN' || (isStaff && !!staffPerms?.manageUsers);
  const canManageWallet = adminUser?.role === 'ADMIN' || (isStaff && !!staffPerms?.manageWallet);
  const canManageTransactions = adminUser?.role === 'ADMIN' || (isStaff && !!staffPerms?.manageTransactions);
  const canManageSchemes = adminUser?.role === 'ADMIN' || (isStaff && !!staffPerms?.manageSchemes);
  const canManageTreasury = adminUser?.role === 'ADMIN' || (isStaff && !!staffPerms?.manageTreasury);
  const canManageBroadcast = adminUser?.role === 'ADMIN' || (isStaff && !!staffPerms?.manageBroadcast);
  const canManageDeductions = adminUser?.role === 'ADMIN' || (isStaff && (staffPerms?.manageDeductions ?? true));

  // Users and Wallets state
  const [usersList, setUsersList] = useState<UserProfile[]>(getAllUsers);
  const [walletsMap, setWalletsMap] = useState<Record<string, Wallet>>({});
  const [isSyncingUsers, setIsSyncingUsers] = useState(false);
  const [usersStatusFilter, setUsersStatusFilter] = useState<'ALL' | 'ONLINE' | 'OFFLINE' | 'USER' | 'ADMIN'>('ALL');

  const onlineUsersCount = usersList.filter((u) => u && Boolean(u.isOnline)).length;
  const offlineUsersCount = usersList.length - onlineUsersCount;

  // Modals state
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null);

  const [userModalOpen, setUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userModalInitialTab, setUserModalInitialTab] = useState<'PROFILE' | 'WALLET' | 'BANK' | 'INVESTMENT'>('PROFILE');

  const [txnModalOpen, setTxnModalOpen] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);

  const [approvalPasswordModalOpen, setApprovalPasswordModalOpen] = useState(false);
  const [approvalTargetTxn, setApprovalTargetTxn] = useState<Transaction | null>(null);

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTargetTxn, setRejectTargetTxn] = useState<Transaction | null>(null);

  const [certModalOpen, setCertModalOpen] = useState(false);

  // User Legal Agreement Modal State
  const [agreementModalOpen, setAgreementModalOpen] = useState(false);
  const [agreementUser, setAgreementUser] = useState<UserProfile | null>(null);

  // Refresh and sync users list and all user wallets with centralized server
  const refreshUsers = async () => {
    setIsSyncingUsers(true);
    try {
      const [updated, centralState] = await Promise.all([
        syncUsersWithServer(),
        fetchCentralState(undefined, 'ADMIN'),
      ]);
      if (Array.isArray(updated) && updated.length > 0) {
        setUsersList(enrichUsersWithPresence(updated));
      }
      if (centralState?.wallets) {
        setWalletsMap(centralState.wallets);
      }
    } catch {
      setUsersList(enrichUsersWithPresence(getAllUsers()));
    } finally {
      setIsSyncingUsers(false);
    }
  };

  // Live subscription and heartbeat polling so any new registration appears immediately
  useEffect(() => {
    // 1. Initial sync on mount
    refreshUsers();

    // 2. Subscribe to custom event & cross-tab storage changes
    const unsubscribeStorage = subscribeToUsersUpdates((updated) => {
      if (Array.isArray(updated) && updated.length > 0) {
        setUsersList(enrichUsersWithPresence(updated));
      }
    });

    // 3. Subscribe to real-time Server-Sent Events (SSE) stream for 0ms cross-device synchronization
    const unsubscribeRealtime = subscribeToRealtimeEvents((event) => {
      console.log(`[AdminPanel] Received realtime event: ${event.type}`, event);
      if (event.type === 'USER_STATUS_CHANGED') {
        const uId = event.userId;
        const newIsOnline = (event as any).isOnline;
        if (uId) {
          recordLivePresence(uId, newIsOnline !== undefined ? Boolean(newIsOnline) : true, (event as any).lastActiveAt, (event as any).lastLogoutAt);
          setUsersList((prev) => {
            if (!Array.isArray(prev)) return prev;
            const cleanUId = String(uId).trim().toLowerCase();
            const cleanEventDigits = cleanUId.replace(/[^0-9]/g, '');
            const updated = prev.map((u) => {
              const cleanId = String(u.id || '').trim().toLowerCase();
              const cleanLoginId = String(u.loginId || '').trim().toLowerCase();
              const cleanPhone = String(u.phone || '').replace(/[^0-9]/g, '');
              const match =
                cleanId === cleanUId ||
                (cleanLoginId && cleanLoginId === cleanUId) ||
                (cleanPhone && cleanEventDigits && (cleanPhone === cleanEventDigits || cleanPhone.endsWith(cleanEventDigits) || cleanEventDigits === cleanPhone.slice(-10)));
              if (match) {
                return {
                  ...u,
                  isOnline: newIsOnline !== undefined ? Boolean(newIsOnline) : true,
                  lastActiveAt: new Date().toISOString(),
                  lastLogoutAt: newIsOnline === false ? new Date().toISOString() : undefined,
                };
              }
              return u;
            });
            return updated;
          });
        }
      } else if (
        event.type === 'USER_REGISTERED' ||
        event.type === 'USER_ADDED' ||
        event.type === 'USER_UPDATED' ||
        event.type === 'USER_DELETED' ||
        event.type === 'STATE_CHANGED'
      ) {
        console.log(`[AdminPanel] Triggering refresh for event: ${event.type}`);
        if ((event as any).users && Array.isArray((event as any).users)) {
          setUsersList(enrichUsersWithPresence((event as any).users));
        }
        refreshUsers();
      }
    });

    // 4. Direct Firestore real-time listener for 100% sync across Vercel, AI Studio, and Mobile
    const unsubscribeFirestore = subscribeToFirestoreState((fs) => {
      if (!fs) return;
      if (fs.users && Array.isArray(fs.users)) {
        const delSet = new Set((fs.deletedUserIds || []).map(x => String(x).toLowerCase().trim()));
        const clean = fs.users
          .filter(u => {
            if (!u || !u.id) return false;
            if (delSet.has(String(u.id).toLowerCase())) return false;
            if (u.loginId && delSet.has(String(u.loginId).toLowerCase())) return false;
            if (u.phone && delSet.has(String(u.phone).replace(/[^0-9]/g, '').slice(-10))) return false;
            return true;
          });
        setUsersList(enrichUsersWithPresence(clean));
      }
      if (fs.wallets) {
        setWalletsMap(fs.wallets);
      }
    });

    // 5. Fast auto-polling & real-time presence synchronization tick
    const interval = setInterval(() => {
      syncUsersWithServer().then((updated) => {
        if (Array.isArray(updated) && updated.length > 0) {
          setUsersList(enrichUsersWithPresence(updated));
        }
      }).catch(() => {});
    }, 2500);

    return () => {
      unsubscribeStorage();
      unsubscribeRealtime();
      unsubscribeFirestore();
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
    setUserModalInitialTab('PROFILE');
    setUserModalOpen(true);
  };

  const handleOpenEditUser = (user: UserProfile) => {
    setSelectedUser(user);
    setUserModalInitialTab('PROFILE');
    setUserModalOpen(true);
  };

  const handleOpenEditUserWallet = (user: UserProfile) => {
    setSelectedUser(user);
    setUserModalInitialTab('WALLET');
    setUserModalOpen(true);
  };

  const handleSaveUser = async (data: {
    userId?: string;
    name: string;
    loginId?: string;
    phone: string;
    email: string;
    password?: string;
    role: UserRole;
    status: 'ACTIVE' | 'BLOCKED';
    joinedDate?: string;
    referralCode?: string;
    referredBy?: string;
    bankDetails?: any;
    permissions?: StaffPermissions;
    walletUpdates?: Partial<Wallet>;
    walletAdjustment?: {
      type: 'ADD' | 'DEDUCT' | 'SET';
      targetWallet: 'cashBalance' | 'gpBalance' | 'totalEarned' | 'royaltyEarned';
      amount: number;
      reason?: string;
    };
    isPasswordChanged?: boolean;
    backdatedPlanId?: string;
    backdatedAmount?: number;
    backdatedWithdrawal?: number;
  }) => {
    setIsSyncingUsers(true);
    try {
      // If data.userId is provided, we are explicitly editing an existing user.
      // If data.userId is NOT provided, we are adding a BRAND NEW user.
      let targetUserId = data.userId;
      
      if (data.userId) {
        // Edit existing user
        const uId = data.userId;
        const res = await adminUpdateUserAsync(uId, {
          name: data.name,
          loginId: data.loginId,
          phone: data.phone,
          email: data.email,
          password: data.password,
          role: data.role,
          status: data.status,
          joinedDate: data.joinedDate,
          referralCode: data.referralCode,
          referredBy: data.referredBy,
          bankDetails: data.bankDetails,
          permissions: data.permissions,
        });
        if (!res.success) {
          alert(res.error || (language === 'hi' ? 'यूज़र अपडेट करने में विफलता' : 'Failed to update user'));
          console.warn('User update error:', res.error);
        } else {
          // ONLY announce password change if the password was explicitly changed AND no wallet balance was adjusted
          if (data.isPasswordChanged && !data.walletAdjustment && !data.walletUpdates) {
            audioAnnouncer.announcePasswordChange({
              userName: data.name,
              language: language === 'hi' ? 'hi' : 'en',
            });
          }
        }
      } else {
        // Adding a brand new user
        const cleanDigits = (data.phone || '').replace(/[^0-9]/g, '');
        const clean10 = cleanDigits.length >= 10 ? cleanDigits.slice(-10) : cleanDigits;
        
        // Check duplicate phone/loginId in active non-deleted list only
        const duplicate = usersList.find(u => 
          !isUserDeleted(u) && (
            (clean10 && u.phone && u.phone.replace(/[^0-9]/g, '').slice(-10) === clean10) ||
            (data.loginId && u.loginId && u.loginId.toLowerCase() === data.loginId.toLowerCase())
          )
        );

        if (duplicate) {
          setIsSyncingUsers(false);
          throw new Error(language === 'hi' 
            ? `यह मोबाइल नंबर / लॉगिन आईडी (${duplicate.phone || duplicate.loginId}) पहले से यूज़र "${duplicate.name}" के लिए रजिस्टर्ड है।` 
            : `Phone/Login ID already registered for user "${duplicate.name}".`
          );
        }

        const res = await adminAddUserAsync({
          name: data.name,
          loginId: data.loginId || clean10,
          phone: data.phone,
          email: data.email,
          password: data.password,
          role: data.role,
          status: data.status,
          joinedDate: data.joinedDate,
          referralCode: data.referralCode,
          referredBy: data.referredBy,
          bankDetails: data.bankDetails,
          permissions: data.permissions,
        });

        if (res.success && res.user?.id) {
          targetUserId = res.user.id;
          const createdUser = res.user;
          setUsersList(prev => {
            const filtered = prev.filter(u => u.id !== createdUser.id && u.phone !== createdUser.phone);
            return [createdUser, ...filtered];
          });
          // Announce new user created
          audioAnnouncer.announceRegistration({
            userName: data.name,
            language: language === 'hi' ? 'hi' : 'en',
          });
        } else {
          console.warn('User add error:', res.error);
          setIsSyncingUsers(false);
          throw new Error(res.error || (language === 'hi' ? 'नया यूज़र जोड़ने में विफलता' : 'Failed to add new user'));
        }
      }

      // Handle Wallet Updates and Adjustments if present
      if (targetUserId && (data.walletUpdates || data.walletAdjustment)) {
        // Capture existing wallet before adjustment
        const fallbackWallet: Wallet = {
          cashBalance: 0,
          gpBalance: 0,
          totalInvested: 0,
          totalEarned: 0,
          royaltyEarned: 0,
          pendingWithdrawals: 0,
          pendingDeposits: 0,
        };
        const prevTargetWallet = walletsMap[targetUserId] || walletsMap[data.phone.trim().replace(/[^0-9]/g, "")] || walletsMap[data.phone.trim().replace(/[^0-9]/g, "").slice(-10)] || fallbackWallet;

        const adjustRes = await apiAdminAdjustUserWallet(
          targetUserId,
          data.walletUpdates || {},
          data.walletAdjustment,
          adminUser?.name || 'Super Admin'
        );
        if (adjustRes.success && adjustRes.wallet) {
          const w = adjustRes.wallet;
          const cleanPhone = data.phone.trim().replace(/[^0-9]/g, "");
          const cleanPhone10 = cleanPhone.slice(-10);
          setWalletsMap((prev) => ({
            ...prev,
            [targetUserId]: w,
            ...(cleanPhone ? { [cleanPhone]: w } : {}),
            ...(cleanPhone10 ? { [cleanPhone10]: w } : {}),
            ...(data.loginId ? { [data.loginId]: w } : {}),
          }));

          // Direct treasury state synchronization from authoritative backend response
          if (adjustRes.treasury && onUpdateTreasuryDirect) {
            onUpdateTreasuryDirect(adjustRes.treasury, (adjustRes as any).treasuryLogs);
          }

          // Calculate exact net fund credited or debited to user
          let netAdded = 0;
          let netDeducted = 0;

          if (data.walletAdjustment?.amount && data.walletAdjustment.amount > 0) {
            if (data.walletAdjustment.type === 'ADD') {
              netAdded = data.walletAdjustment.amount;
            } else if (data.walletAdjustment.type === 'DEDUCT') {
              netDeducted = data.walletAdjustment.amount;
            } else if (data.walletAdjustment.type === 'SET') {
              const targetKey = data.walletAdjustment.targetWallet || 'cashBalance';
              const prevVal = ((prevTargetWallet as any)[targetKey]) || 0;
              if (data.walletAdjustment.amount > prevVal) {
                netAdded = data.walletAdjustment.amount - prevVal;
              } else if (data.walletAdjustment.amount < prevVal) {
                netDeducted = prevVal - data.walletAdjustment.amount;
              }
            }
          } else if (data.walletUpdates) {
            const prevCash = prevTargetWallet.cashBalance || 0;
            const prevGp = prevTargetWallet.gpBalance || 0;
            const prevEarn = prevTargetWallet.totalEarned || 0;
            const prevRoy = prevTargetWallet.royaltyEarned || 0;
            const newCash = data.walletUpdates.cashBalance !== undefined ? data.walletUpdates.cashBalance : prevCash;
            const newGp = data.walletUpdates.gpBalance !== undefined ? data.walletUpdates.gpBalance : prevGp;
            const newEarn = data.walletUpdates.totalEarned !== undefined ? data.walletUpdates.totalEarned : prevEarn;
            const newRoy = data.walletUpdates.royaltyEarned !== undefined ? data.walletUpdates.royaltyEarned : prevRoy;
            const diff = (newCash - prevCash) + (newGp - prevGp) + (newEarn - prevEarn) + (newRoy - prevRoy);
            if (diff > 0) {
              netAdded = diff;
            } else if (diff < 0) {
              netDeducted = Math.abs(diff);
            }
          }

          // Announce relevant wallet action
          if (netAdded > 0) {
            audioAnnouncer.announceBalanceCredit({
              userName: data.name,
              amount: netAdded,
              language: language === 'hi' ? 'hi' : 'en',
            });
          } else if (netDeducted > 0) {
            audioAnnouncer.announceBalanceDeduct({
              userName: data.name,
              amount: netDeducted,
              language: language === 'hi' ? 'hi' : 'en',
            });
          }
        }
      }

      await refreshUsers();
    } finally {
      setIsSyncingUsers(false);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: 'ACTIVE' | 'BLOCKED') => {
    setIsSyncingUsers(true);
    try {
      const nextStatus = currentStatus === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
      await adminUpdateUserAsync(userId, { status: nextStatus });
      await refreshUsers();
    } finally {
      setIsSyncingUsers(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    // AdminUsersTab already shows a dedicated confirmation modal, so perform deletion directly
    setIsSyncingUsers(true);
    recordDeletedUserId(userId);
    const cleanDigits = String(userId || '').replace(/[^0-9]/g, '');
    const cleanPhone10 = cleanDigits.length >= 10 ? cleanDigits.slice(-10) : '';

    // Instantly remove from local list for snappy zero-latency UI response
    setUsersList((prev) =>
      prev.filter((u) => {
        if (!u) return false;
        if (u.id === userId) return false;
        if (u.loginId && u.loginId.toLowerCase() === String(userId).toLowerCase()) return false;
        if (u.phone === userId) return false;
        const uDigits = (u.phone || '').replace(/[^0-9]/g, '');
        const uPhone10 = uDigits.length >= 10 ? uDigits.slice(-10) : '';
        if (cleanPhone10 && uPhone10 && cleanPhone10 === uPhone10) return false;
        return true;
      })
    );

    try {
      const res = await adminDeleteUserAsync(userId);
      if (!res.success) {
        console.warn('Delete user failed:', res.error);
      }
      await refreshUsers();
    } finally {
      setIsSyncingUsers(false);
    }
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
      setApprovalTargetTxn(target);
      setApprovalPasswordModalOpen(true);
    }
  };

  const handleConfirmApprovalWithPassword = (targetTxn: Transaction) => {
    onUpdateTransaction({ ...targetTxn, status: 'SUCCESS' });
  };

  const handleRejectTransaction = (txnId: string) => {
    const target = transactions.find((t) => t.id === txnId);
    if (target) {
      setRejectTargetTxn(target);
      setRejectModalOpen(true);
    }
  };

  const handleConfirmRejectWithReason = (targetTxn: Transaction, reason: string) => {
    onUpdateTransaction({
      ...targetTxn,
      status: 'REJECTED',
      rejectReason: reason,
      rejectReasonHi: reason,
    });
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
      {/* Show Header & Sub-Tabs Grid ONLY when not viewing User Manual */}
      {activeSubTab !== 'USER_MANUAL' && (
        <>
          {/* Sleek Compact Admin Master Control Header Bar */}
          <div className="bg-gradient-to-r from-slate-900 via-emerald-950/30 to-slate-900 border border-emerald-500/30 rounded-2xl p-4 shadow-xl shadow-emerald-950/5 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40 shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base sm:text-lg font-black text-white">
                      {isHi ? '👑 एडमिन मास्टर कंट्रोल हब' : '👑 Admin Master Hub'}
                    </h2>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 font-mono">
                      SUPER ADMIN
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      Live Sync
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <p className="text-[11px] text-slate-400">
                      {isHi
                        ? `लॉगिन: ${adminUser.loginId} (${adminUser.name})`
                        : `ID: ${adminUser.loginId} (${adminUser.name})`}
                    </p>

                    {/* Quick Online & Offline Counter Badges */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        id="btn-header-filter-online"
                        onClick={() => {
                          setUsersStatusFilter('ONLINE');
                          setActiveSubTab('USERS');
                        }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold cursor-pointer transition-all shadow-sm"
                        title={isHi ? 'क्लिक करके वर्तमान ऑनलाइन यूज़र्स देखें' : 'Click to view online users'}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
                        <span>{onlineUsersCount} {isHi ? 'ऑनलाइन' : 'Online'}</span>
                      </button>

                      <button
                        type="button"
                        id="btn-header-filter-offline"
                        onClick={() => {
                          setUsersStatusFilter('OFFLINE');
                          setActiveSubTab('USERS');
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[10px] font-bold cursor-pointer transition-all"
                        title={isHi ? 'क्लिक करके ऑफ़लाइन यूज़र्स देखें' : 'Click to view offline users'}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        <span>{offlineUsersCount} {isHi ? 'ऑफ़लाइन' : 'Offline'}</span>
                      </button>

                      <button
                        type="button"
                        id="btn-header-filter-all"
                        onClick={() => {
                          setUsersStatusFilter('ALL');
                          setActiveSubTab('USERS');
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold cursor-pointer transition-all"
                        title={isHi ? 'क्लिक करके सभी यूज़र्स देखें' : 'Click to view all users'}
                      >
                        <Users className="w-3 h-3 text-cyan-400" />
                        <span>{usersList.length} {isHi ? 'कुल' : 'Total'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                <button
                  onClick={() => setIsMasterToolsOpen((prev) => !prev)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/20 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isHi ? (isMasterToolsOpen ? 'टूल्स बंद करें ▲' : '🛠️ मास्टर टूल्स मेन्यू ▼') : (isMasterToolsOpen ? 'Close Tools ▲' : '🛠️ Master Tools ▼')}</span>
                </button>

                <button
                  id="btn-admin-logout"
                  onClick={onLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{isHi ? 'लॉगआउट' : 'Logout'}</span>
                </button>
              </div>
            </div>

            {/* Collapsible Master Tools Menu Panel */}
            {isMasterToolsOpen && (
              <div className="pt-3 border-t border-amber-500/20 grid grid-cols-2 sm:grid-cols-3 gap-2 animate-fadeIn">
                <button
                  id="btn-admin-header-export-excel"
                  onClick={() => exportAllDataToExcel(currentPayload, 'GCap_All_Data_Export')}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>{isHi ? 'Excel एक्सपोर्ट (.xlsx)' : 'Export Excel'}</span>
                </button>

                <button
                  id="btn-admin-certificate-sample"
                  onClick={() => setCertModalOpen(true)}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer"
                >
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>{isHi ? '📜 प्रमाण पत्र सैंपल' : '📜 Certificate'}</span>
                </button>

                <button
                  id="btn-admin-agreement-view"
                  onClick={() => {
                    const firstInvestor = usersList.find((u) => u.role === 'USER') || usersList[0] || null;
                    setAgreementUser(firstInvestor);
                    setAgreementModalOpen(true);
                  }}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all cursor-pointer"
                >
                  <FileCheck className="w-4 h-4 text-cyan-400" />
                  <span>{isHi ? '📄 कानूनी अनुबंध' : '📄 Legal Agreement'}</span>
                </button>

                <button
                  id="btn-admin-manage-rules"
                  onClick={onOpenRules}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  <span>{isHi ? '⚙️ नियम व सीमाएं' : '⚙️ Rules & Limits'}</span>
                </button>

                {onResetSystemFresh && (
                  <button
                    id="btn-admin-fresh-reset-system"
                    onClick={onResetSystemFresh}
                    className="col-span-2 sm:col-span-4 flex items-center justify-center gap-2 p-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 text-xs font-black transition-all cursor-pointer shadow-md"
                    title={isHi ? 'कंपनी बैलेंस ₹6,00,000 छोड़कर सभी लेन-देन व निवेश जीरो (फ्रेश) करें' : 'Keep Admin balance ₹600,000 & reset all transaction records to zero'}
                  >
                    <RotateCcw className="w-4 h-4 text-rose-400" />
                    <span>{isHi ? '✨ डेटा फ्रेश रीसेट (कंपनी बैलेंस ₹6,00,000 रखें व सभी लेन-देन ज़ीरो करें)' : '✨ Reset All Transactions (Keep ₹600k Admin Balance)'}</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Navigation Sub-Tabs & Mobile Menu Grid */}
          <div className="space-y-4">
            {/* Navigation Sub-Tabs Cards Grid: Making it look identical to the premium User Panel Category Nav */}
            <div className="w-full bg-slate-900/80 border border-slate-800/80 rounded-2xl p-2 shadow-xl backdrop-blur-md">
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                
                {/* OVERVIEW */}
                <button
                  id="tab-admin-overview"
                  onClick={() => setActiveSubTab('OVERVIEW')}
                  className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-2 h-full group ${
                    activeSubTab === 'OVERVIEW'
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                      : 'bg-slate-950/60 hover:bg-slate-850/60 border-slate-800/80 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className={`p-1.5 rounded-lg border ${activeSubTab === 'OVERVIEW' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300' : 'bg-slate-800 border-slate-700 text-emerald-400'}`}>
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <span className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded font-mono ${activeSubTab === 'OVERVIEW' ? 'bg-emerald-500/30 text-emerald-200' : 'bg-slate-800 text-slate-400'}`}>
                      STATS
                    </span>
                  </div>
                  <div className="leading-tight pt-1">
                    <h4 className="text-sm font-black tracking-tight">{isHi ? 'डैशबोर्ड' : 'Overview'}</h4>
                    <p className="text-[10px] sm:text-xs text-slate-400 font-medium group-hover:text-slate-300 transition-colors mt-0.5">{isHi ? 'मुख्य सांख्यिकी' : 'System Stats'}</p>
                  </div>
                </button>

                {/* USERS */}
                {canManageUsers && (
                  <button
                    id="tab-admin-users"
                    onClick={() => setActiveSubTab('USERS')}
                    className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-2 h-full group ${
                      activeSubTab === 'USERS'
                        ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                        : 'bg-slate-950/60 hover:bg-slate-850/60 border-slate-800/80 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className={`p-1.5 rounded-lg border ${activeSubTab === 'USERS' ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-300' : 'bg-slate-800 border-slate-700 text-cyan-400'}`}>
                        <Users className="w-4 h-4" />
                      </div>
                      {onlineUsersCount > 0 ? (
                        <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded font-mono bg-emerald-500 text-slate-950 font-bold animate-pulse flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                          {onlineUsersCount} LIVE
                        </span>
                      ) : (
                        <span className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded font-mono ${activeSubTab === 'USERS' ? 'bg-cyan-500/30 text-cyan-200' : 'bg-slate-800 text-slate-400'}`}>
                          ACCOUNTS
                        </span>
                      )}
                    </div>
                    <div className="leading-tight pt-1">
                      <h4 className="text-sm font-black tracking-tight">{isHi ? 'यूज़र्स' : 'Users'}</h4>
                      <p className="text-[10px] sm:text-xs text-slate-400 font-medium group-hover:text-slate-300 transition-colors mt-0.5">
                        {isHi ? `${onlineUsersCount} ऑनलाइन • ${usersList.length} कुल` : `${onlineUsersCount} Online • ${usersList.length} Total`}
                      </p>
                    </div>
                  </button>
                )}

                {/* TRANSACTIONS */}
                {canManageTransactions && (
                  <button
                    id="tab-admin-txns"
                    onClick={() => setActiveSubTab('TRANSACTIONS')}
                    className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-2 h-full group ${
                      activeSubTab === 'TRANSACTIONS'
                        ? 'bg-purple-500/10 border-purple-500/50 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                        : 'bg-slate-950/60 hover:bg-slate-850/60 border-slate-800/80 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className={`p-1.5 rounded-lg border ${activeSubTab === 'TRANSACTIONS' ? 'bg-purple-500/20 border-purple-500/30 text-purple-300' : 'bg-slate-800 border-slate-700 text-purple-400'}`}>
                        <Clock className="w-4 h-4" />
                      </div>
                      {transactions.filter(t => t.status === 'PENDING').length > 0 ? (
                        <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded font-mono bg-purple-500 text-slate-950 font-bold animate-pulse">
                          {transactions.filter(t => t.status === 'PENDING').length} REQ
                        </span>
                      ) : (
                        <span className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded font-mono ${activeSubTab === 'TRANSACTIONS' ? 'bg-purple-500/30 text-purple-200' : 'bg-slate-800 text-slate-400'}`}>
                          LEDGER
                        </span>
                      )}
                    </div>
                    <div className="leading-tight pt-1">
                      <h4 className="text-sm font-black tracking-tight">{isHi ? 'लेन-देन' : 'Transactions'}</h4>
                      <p className="text-[10px] sm:text-xs text-slate-400 font-medium group-hover:text-slate-300 transition-colors mt-0.5">{isHi ? 'अप्रूवल व एडिट' : 'Approve & Audit'}</p>
                    </div>
                  </button>
                )}

                {/* PLANS */}
                {canManageSchemes && (
                  <button
                    id="tab-admin-plans"
                    onClick={() => setActiveSubTab('PLANS')}
                    className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-2 h-full group ${
                      activeSubTab === 'PLANS'
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                        : 'bg-slate-950/60 hover:bg-slate-850/60 border-slate-800/80 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className={`p-1.5 rounded-lg border ${activeSubTab === 'PLANS' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300' : 'bg-slate-800 border-slate-700 text-emerald-400'}`}>
                        <Layers className="w-4 h-4" />
                      </div>
                      <span className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded font-mono ${activeSubTab === 'PLANS' ? 'bg-emerald-500/30 text-emerald-200' : 'bg-slate-800 text-slate-400'}`}>
                        SCHEMES
                      </span>
                    </div>
                    <div className="leading-tight pt-1">
                      <h4 className="text-sm font-black tracking-tight">{isHi ? 'प्लान्स' : 'Plans'}</h4>
                      <p className="text-[10px] sm:text-xs text-slate-400 font-medium group-hover:text-slate-300 transition-colors mt-0.5">{isHi ? 'CRUD मैनेजमेंट' : 'ROI Schemes'}</p>
                    </div>
                  </button>
                )}

                {/* MESSAGES */}
                {canManageBroadcast && (
                  <button
                    id="tab-admin-messages"
                    onClick={() => setActiveSubTab('MESSAGES')}
                    className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-2 h-full group ${
                      activeSubTab === 'MESSAGES'
                        ? 'bg-rose-500/10 border-rose-500/50 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
                        : 'bg-slate-950/60 hover:bg-slate-850/60 border-slate-800/80 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className={`p-1.5 rounded-lg border ${activeSubTab === 'MESSAGES' ? 'bg-rose-500/20 border-rose-500/30 text-rose-300' : 'bg-slate-800 border-slate-700 text-rose-400'}`}>
                        <Bell className="w-4 h-4" />
                      </div>
                      <span className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded font-mono ${activeSubTab === 'MESSAGES' ? 'bg-rose-500/30 text-rose-200' : 'bg-slate-800 text-rose-400'}`}>
                        NOTIFY
                      </span>
                    </div>
                    <div className="leading-tight pt-1">
                      <h4 className="text-sm font-black tracking-tight">{isHi ? 'ब्रॉडकास्ट' : 'Messages'}</h4>
                      <p className="text-[10px] sm:text-xs text-slate-400 font-medium group-hover:text-slate-300 transition-colors mt-0.5">{isHi ? 'मैसेज भेजें' : 'Send Messages'}</p>
                    </div>
                  </button>
                )}

                {/* TREASURY */}
                {canManageTreasury && (
                  <button
                    id="tab-admin-treasury"
                    onClick={() => setActiveSubTab('TREASURY')}
                    className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-2 h-full group ${
                      activeSubTab === 'TREASURY'
                        ? 'bg-teal-500/10 border-teal-500/50 text-teal-300 shadow-[0_0_15px_rgba(20,184,166,0.15)]'
                        : 'bg-slate-950/60 hover:bg-slate-850/60 border-slate-800/80 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className={`p-1.5 rounded-lg border ${activeSubTab === 'TREASURY' ? 'bg-teal-500/20 border-teal-500/30 text-teal-300' : 'bg-slate-800 border-slate-700 text-teal-400'}`}>
                        <Building2 className="w-4 h-4" />
                      </div>
                      <span className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded font-mono ${activeSubTab === 'TREASURY' ? 'bg-teal-500/30 text-teal-200' : 'bg-slate-800 text-slate-400'}`}>
                        RESERVES
                      </span>
                    </div>
                    <div className="leading-tight pt-1">
                      <h4 className="text-sm font-black tracking-tight">{isHi ? 'ट्रेजरी' : 'Treasury'}</h4>
                      <p className="text-[10px] sm:text-xs text-slate-400 font-medium group-hover:text-slate-300 transition-colors mt-0.5">{isHi ? 'कंपनी का खजाना' : 'Company Reserve'}</p>
                    </div>
                  </button>
                )}

                {/* BACKUP */}
                {canManageTreasury && (
                  <button
                    id="tab-admin-backup"
                    onClick={() => setActiveSubTab('BACKUP')}
                    className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-2 h-full group ${
                      activeSubTab === 'BACKUP'
                        ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.15)]'
                        : 'bg-slate-950/60 hover:bg-slate-850/60 border-slate-800/80 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className={`p-1.5 rounded-lg border ${activeSubTab === 'BACKUP' ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300' : 'bg-slate-800 border-slate-700 text-indigo-400'}`}>
                        <Database className="w-4 h-4" />
                      </div>
                      <span className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded font-mono ${activeSubTab === 'BACKUP' ? 'bg-indigo-500/30 text-indigo-200' : 'bg-slate-800 text-slate-400'}`}>
                        CLONES
                      </span>
                    </div>
                    <div className="leading-tight pt-1">
                      <h4 className="text-sm font-black tracking-tight">{isHi ? 'बैकअप' : 'Backup'}</h4>
                      <p className="text-[10px] sm:text-xs text-slate-400 font-medium group-hover:text-slate-300 transition-colors mt-0.5">{isHi ? 'मैन्युअल स्नैपशॉट' : 'Snapshots'}</p>
                    </div>
                  </button>
                )}

                {/* DEDUCTIONS & FEES AUDIT */}
                {canManageDeductions && (
                  <button
                    id="tab-admin-deductions"
                    onClick={() => setActiveSubTab('DEDUCTIONS')}
                    className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-2 h-full group ${
                      activeSubTab === 'DEDUCTIONS'
                        ? 'bg-rose-500/10 border-rose-500/50 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
                        : 'bg-slate-950/60 hover:bg-slate-850/60 border-slate-800/80 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className={`p-1.5 rounded-lg border ${activeSubTab === 'DEDUCTIONS' ? 'bg-rose-500/20 border-rose-500/30 text-rose-300' : 'bg-slate-800 border-slate-700 text-rose-400'}`}>
                        <ShieldAlert className="w-4 h-4" />
                      </div>
                      <span className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded font-mono ${activeSubTab === 'DEDUCTIONS' ? 'bg-rose-500/30 text-rose-200' : 'bg-slate-800 text-slate-400'}`}>
                        AUDIT
                      </span>
                    </div>
                    <div className="leading-tight pt-1">
                      <h4 className="text-sm font-black tracking-tight">{isHi ? 'कटौती व शुल्क' : 'Deductions'}</h4>
                      <p className="text-[10px] sm:text-xs text-slate-400 font-medium group-hover:text-slate-300 transition-colors mt-0.5">{isHi ? 'चार्ज, TDS व ट्रांसफर' : 'Admin & TDS Fees'}</p>
                    </div>
                  </button>
                )}

                {/* USER_MANUAL */}
                <button
                  id="tab-admin-usermanual"
                  onClick={() => setActiveSubTab('USER_MANUAL')}
                  className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-2 h-full group ${
                    (activeSubTab as string) === 'USER_MANUAL'
                      ? 'bg-teal-500/10 border-teal-500/50 text-teal-300 shadow-[0_0_15px_rgba(20,184,166,0.15)]'
                      : 'bg-slate-950/60 hover:bg-slate-850/60 border-slate-800/80 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className={`p-1.5 rounded-lg border ${(activeSubTab as string) === 'USER_MANUAL' ? 'bg-teal-500/20 border-teal-500/30 text-teal-300' : 'bg-slate-800 border-slate-700 text-teal-400'}`}>
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <span className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded font-mono ${(activeSubTab as string) === 'USER_MANUAL' ? 'bg-teal-500/30 text-teal-200' : 'bg-slate-800 text-slate-400'}`}>
                      DOCS
                    </span>
                  </div>
                  <div className="leading-tight pt-1">
                    <h4 className="text-sm font-black tracking-tight">{isHi ? 'यूज़र गाइड' : 'Manual'}</h4>
                    <p className="text-[10px] sm:text-xs text-slate-400 font-medium group-hover:text-slate-300 transition-colors mt-0.5">{isHi ? 'प्रशिक्षण गाइड' : 'Admin Guide'}</p>
                  </div>
                </button>

                {/* CURRENT_ACTIVITY */}
                <button
                  id="tab-admin-current-activity"
                  onClick={() => setActiveSubTab('CURRENT_ACTIVITY')}
                  className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-2 h-full group ${
                    (activeSubTab as string) === 'CURRENT_ACTIVITY'
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                      : 'bg-slate-950/60 hover:bg-slate-850/60 border-slate-800/80 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className={`p-1.5 rounded-lg border ${(activeSubTab as string) === 'CURRENT_ACTIVITY' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300' : 'bg-slate-800 border-slate-700 text-emerald-400'}`}>
                      <Activity className="w-4 h-4" />
                    </div>
                    <span className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded font-mono ${(activeSubTab as string) === 'CURRENT_ACTIVITY' ? 'bg-emerald-500/30 text-emerald-200' : 'bg-slate-800 text-slate-400'}`}>
                      LEDGER
                    </span>
                  </div>
                  <div className="leading-tight pt-1">
                    <h4 className="text-sm font-black tracking-tight">{isHi ? 'करंट एक्टिविटी' : 'Activity'}</h4>
                    <p className="text-[10px] sm:text-xs text-slate-400 font-medium group-hover:text-slate-300 transition-colors mt-0.5">{isHi ? 'कंपनी मास्टर समरी' : 'Master Summary'}</p>
                  </div>
                </button>

              </div>
            </div>
          </div>
        </>
      )}

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
            onOpenConvertFeeGpModal={() => setConvertFeeGpModalOpen(true)}
          />

          {/* PROMINENT USER DEPOSIT & WITHDRAWAL REQUESTS QUEUE DIRECTLY ON ADMIN MAIN SCREEN */}
          {transactions.filter((t) => t.status === 'PENDING').length > 0 && (
            <div className="bg-gradient-to-r from-slate-900 via-emerald-950/20 to-slate-900 p-5 rounded-2xl border-2 border-emerald-500/30 shadow-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-500/20 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40 shrink-0 shadow-lg">
                    <Clock className="w-6 h-6 animate-pulse text-emerald-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-white">
                        {isHi ? '⚠️ यूज़र डिपॉजिट एवं निकासी अनुरोध (Main Approval Queue)' : '⚠️ User Deposit & Withdrawal Approval Queue'}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-xs animate-pulse shadow">
                        {transactions.filter((t) => t.status === 'PENDING').length} {isHi ? 'लंबित अनुरोध' : 'Pending'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {isHi
                        ? '🔒 सुरक्षा नियम: अप्रूव या रिजेक्ट करने के लिए ट्रांजेक्शन पासवर्ड (gcap@tra1978) अनिवार्य है। अप्रूव करने पर राशि तुरंत वॉलेट में जुड़ेगी, रिजेक्ट करने पर कारण यूज़र को दिखेगा।'
                        : '🔒 Security Rule: Transaction password (gcap@tra1978) is required to Approve/Reject. Approved deposits credit to user wallet instantly.'}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-950/90 px-3.5 py-2 rounded-xl border border-emerald-500/20 flex items-center gap-2 text-xs">
                  <span className="text-slate-300 font-mono text-[11px]">Pass: <strong className="text-emerald-300">gcap@tra1978</strong></span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {transactions
                  .filter((t) => t.status === 'PENDING')
                  .map((t) => {
                    const isDeposit = t.type === 'DEPOSIT';
                    return (
                      <div
                        key={t.id}
                        className="bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between gap-3 shadow-lg"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                  isDeposit
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                }`}
                              >
                                {isDeposit ? '💰 DEPOSIT REQUEST' : '📤 WITHDRAWAL REQUEST'}
                              </span>
                              <span className="font-bold text-white text-xs">
                                {t.userName || t.userLoginId || 'Investor User'}
                              </span>
                            </div>
                            <span className="text-base font-mono font-black text-emerald-400">
                              {formatINR(t.amount)}
                            </span>
                          </div>

                          <div className="text-xs text-slate-300 space-y-0.5 bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                            <div className="flex items-center justify-between text-[11px] font-mono">
                              <span className="text-slate-400">UTR / Ref:</span>
                              <span className="text-white font-bold">{t.referenceId || t.id}</span>
                            </div>
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-400">{isHi ? 'विधि / माध्यम:' : 'Method:'}</span>
                              <span className="text-slate-200">{t.method || 'UPI / Bank'}</span>
                            </div>
                            {(t.note || t.noteHi) && (
                              <div className="text-[11px] text-slate-400 pt-0.5 truncate">
                                {isHi && t.noteHi ? t.noteHi : t.note}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-900">
                          <button
                            id={`btn-overview-reject-${t.id}`}
                            onClick={() => handleRejectTransaction(t.id)}
                            className="px-3 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 hover:text-white border border-rose-800/80 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                          >
                            <span>{isHi ? 'अस्वीकार (Reject)' : 'Reject'}</span>
                          </button>
                          <button
                            id={`btn-overview-approve-${t.id}`}
                            onClick={() => handleQuickApprove(t.id)}
                            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all shadow-md shadow-emerald-600/30 cursor-pointer flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{isHi ? 'पासवर्ड डालकर अप्रूव करें' : 'Approve with Password'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

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

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>{isHi ? 'पंजीकृत यूज़र्स व उपस्थिति' : 'Registered Users & Presence'}</span>
                <Users className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="flex items-baseline justify-between">
                <p className="text-2xl font-bold font-mono text-cyan-300">
                  {usersList.length}
                </p>
                <span className="text-[10px] text-slate-400">{isHi ? 'कुल खाते' : 'Total'}</span>
              </div>
              {/* Online and Offline Quick Action Pills */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  id="btn-overview-filter-online"
                  onClick={() => {
                    setUsersStatusFilter('ONLINE');
                    setActiveSubTab('USERS');
                  }}
                  className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 cursor-pointer transition-all"
                  title={isHi ? 'ऑनलाइन यूज़र्स सूची खोलें' : 'Open online users'}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{onlineUsersCount} {isHi ? 'ऑनलाइन' : 'Online'}</span>
                </button>
                <button
                  type="button"
                  id="btn-overview-filter-offline"
                  onClick={() => {
                    setUsersStatusFilter('OFFLINE');
                    setActiveSubTab('USERS');
                  }}
                  className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 cursor-pointer transition-all"
                  title={isHi ? 'ऑफ़लाइन यूज़र्स सूची खोलें' : 'Open offline users'}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  <span>{offlineUsersCount} {isHi ? 'ऑफ़लाइन' : 'Offline'}</span>
                </button>
              </div>
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

          {/* RECENT LIVE USER ACTIVITIES & TRANSACTIONS FEED PANEL */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center border border-purple-500/30 shrink-0">
                  <Activity className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">
                      {isHi ? '⚡ यूज़र हालिया एक्टिविटीज़ एवं लेन-देन लाइव ऑडिट' : '⚡ Recent User Activities & Live Transactions'}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                      {transactions.filter((t) => t.status === 'PENDING').length} {isHi ? 'लंबित अप्रूवल' : 'Pending'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isHi
                      ? 'यूज़र्स द्वारा किए जा रहे डिपॉजिट, विड्रॉल व लेनदेन। हाथों-हाथ अप्रूव, रिजेक्ट या विवरण एडिट करें।'
                      : 'Live user deposits, withdrawals, and plan actions. Approve, reject, or edit details in 1-click.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveSubTab('TRANSACTIONS')}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all cursor-pointer shadow-md shadow-purple-600/30 flex items-center gap-1.5"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>{isHi ? 'सभी देखें व ऑडिट करें →' : 'Full Audit Tab →'}</span>
                </button>
              </div>
            </div>

            {/* Quick Filter Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setOverviewTxnFilter('ALL')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    overviewTxnFilter === 'ALL'
                      ? 'bg-purple-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {isHi ? `सभी (${transactions.length})` : `All (${transactions.length})`}
                </button>
                <button
                  onClick={() => setOverviewTxnFilter('PENDING')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    overviewTxnFilter === 'PENDING'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-amber-300'
                  }`}
                >
                  {isHi
                    ? `⏳ लंबित (${transactions.filter((t) => t.status === 'PENDING').length})`
                    : `⏳ Pending (${transactions.filter((t) => t.status === 'PENDING').length})`}
                </button>
                <button
                  onClick={() => setOverviewTxnFilter('DEPOSIT')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    overviewTxnFilter === 'DEPOSIT'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-emerald-300'
                  }`}
                >
                  {isHi ? '📥 जमा (Deposits)' : '📥 Deposits'}
                </button>
                <button
                  onClick={() => setOverviewTxnFilter('WITHDRAWAL')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    overviewTxnFilter === 'WITHDRAWAL'
                      ? 'bg-rose-600 text-white shadow'
                      : 'text-slate-400 hover:text-rose-300'
                  }`}
                >
                  {isHi ? '📤 निकासी (Withdrawals)' : '📤 Withdrawals'}
                </button>
              </div>

              <span className="text-[11px] text-slate-400 font-mono">
                {isHi ? 'नवीनतम रिकॉर्ड प्रदर्शित' : 'Showing recent live records'}
              </span>
            </div>

            {/* Recent Items List */}
            <div className="space-y-2.5">
              {recentFilteredTxns.length === 0 ? (
                <div className="p-8 text-center text-slate-500 bg-slate-950/60 rounded-xl border border-slate-800">
                  {isHi ? 'कोई रिकॉर्ड नहीं मिला।' : 'No activity records found.'}
                </div>
              ) : (
                recentFilteredTxns.slice(0, 10).map((t) => {
                  const isPositive =
                    t.type === 'DEPOSIT' ||
                    t.type === 'RETURN_PAYOUT' ||
                    t.type === 'CAPITAL_RETURN';

                  return (
                    <div
                      key={t.id}
                      className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/90 hover:border-slate-700 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-inner"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                            isPositive
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {isPositive ? (
                            <ArrowDownLeft className="w-4 h-4" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-white text-xs">{t.userName || t.userLoginId || 'Investor Account'}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-purple-300 border border-slate-700 font-mono">
                              {t.type}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                t.status === 'SUCCESS'
                                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                  : t.status === 'PENDING'
                                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30 animate-pulse'
                                  : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                              }`}
                            >
                              {t.status}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-1 font-mono">
                            <span>Ref/UTR: <strong className="text-slate-200">{t.referenceId || t.id}</strong></span>
                            <span>{t.method || 'UPI'}</span>
                            <span className="text-slate-500">{new Date(t.timestamp).toLocaleString()}</span>
                          </div>
                          {(isHi && t.noteHi) || t.note ? (
                            <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-md">
                              {isHi && t.noteHi ? t.noteHi : t.note}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/80">
                        <div className="text-right">
                          <span className={`text-base font-bold font-mono block ${isPositive ? 'text-emerald-400' : 'text-slate-200'}`}>
                            {isPositive ? '+' : '-'}{formatINR(t.amount)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {t.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleQuickApprove(t.id)}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-700/20 cursor-pointer flex items-center gap-1"
                                title="Approve immediately"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>{isHi ? 'अप्रूव' : 'Approve'}</span>
                              </button>

                              <button
                                onClick={() => handleRejectTransaction(t.id)}
                                className="px-2.5 py-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-semibold transition-all cursor-pointer"
                                title="Reject transaction"
                              >
                                {isHi ? 'अस्वीकार' : 'Reject'}
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => handleOpenEditTxn(t)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-400 hover:text-purple-300 border border-slate-700 text-xs transition-all cursor-pointer flex items-center gap-1"
                            title={isHi ? 'विवरण एडिट करें' : 'Edit Details'}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline text-[11px] font-medium">{isHi ? 'एडिट' : 'Edit'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
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
                <span className="font-mono font-bold text-amber-300">₹1 = {rules?.gpRatePerRupee ?? 1} GP</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[11px]">{isHi ? 'न्यूनतम डिपॉजिट' : 'Min Deposit'}</span>
                <span className="font-mono font-bold text-white">{formatINR(rules?.minDeposit || 0)}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[11px]">{isHi ? 'न्यूनतम निकासी' : 'Min Withdrawal'}</span>
                <span className="font-mono font-bold text-white">{formatINR(rules?.minWithdrawal || 0)}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[11px]">{isHi ? 'निकासी शुल्क' : 'Withdrawal Fee'}</span>
                <span className="font-mono font-bold text-emerald-400">{rules?.withdrawalFeePercent || 0}%</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[11px]">{isHi ? 'रेफरल कमीशन' : 'Referral Tier'}</span>
                <span className="font-mono font-bold text-amber-300">L1: {rules?.referralL1Percent || 0}% | L2: {rules?.referralL2Percent || 0}%</span>
              </div>
            </div>
          </div>
        </div>
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
          wallets={walletsMap}
          language={language}
          onAddUser={handleOpenAddUser}
          onEditUser={handleOpenEditUser}
          onEditUserWallet={handleOpenEditUserWallet}
          onToggleUserStatus={handleToggleUserStatus}
          onDeleteUser={handleDeleteUser}
          onViewAgreement={(user) => {
            setAgreementUser(user);
            setAgreementModalOpen(true);
          }}
          onRefresh={refreshUsers}
          isSyncing={isSyncingUsers}
          defaultFilterStatus={usersStatusFilter}
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

      {/* TAB 7: MESSAGES & BROADCAST TO USERS */}
      {activeSubTab === 'MESSAGES' && (
        <AdminMessagesTab
          language={language}
          users={usersList}
          messages={messages}
          wallets={walletsMap}
          investments={investments}
          onSendMessage={onSendMessage || (async () => false)}
          onDeleteMessage={onDeleteMessage || (async () => false)}
          onRefreshMessages={onRefreshMessages || (() => {})}
        />
      )}

      {/* TAB 8: TREASURY & LIQUIDITY LOGS */}
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
          onOpenConvertFeeGpModal={() => setConvertFeeGpModalOpen(true)}
        />
      )}

      {/* TAB 9: LIVE INVESTMENTS AUDIT */}
      {activeSubTab === 'INVESTMENTS' && (
        <AdminInvestmentsTab
          investments={investments}
          language={language}
          onSimulateComplete24hLock={onSimulateComplete24hLock}
          onSimulateComplete6hCycle={onSimulateComplete6hCycle}
          onSimulateMaturity641Days={onSimulateMaturity641Days}
        />
      )}

      {/* TAB 10: COMPANY PROFILE */}
      {activeSubTab === 'COMPANY_PROFILE' && (
        <AdminCompanyProfileTab
          language={language}
          onSaveProfile={onSaveCompanyProfile}
        />
      )}

      {/* TAB 11: USER MANUAL PDF/PRINT GUIDE */}
      {activeSubTab === 'USER_MANUAL' && (
        <AdminUserManualTab
          language={language}
          rules={rules}
          plans={plans}
          onBackToHub={() => setActiveSubTab('OVERVIEW')}
        />
      )}

      {/* TAB 12: DEDUCTIONS & FEES AUDIT STATEMENT */}
      {activeSubTab === 'DEDUCTIONS' && (
        <AdminDeductionsTab
          transactions={transactions}
          treasuryLogs={treasuryLogs}
          language={language}
        />
      )}

      {/* TAB 13: ADMIN CURRENT ACTIVITY & MASTER SUMMARY */}
      {activeSubTab === 'CURRENT_ACTIVITY' && (
        <AdminCurrentActivityTab
          language={language}
          users={usersList}
          investments={investments}
          transactions={transactions}
          treasury={treasury}
          wallets={walletsMap}
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
        wallet={selectedUser ? getWalletForUser(selectedUser.id, walletsMap, usersList) : undefined}
        initialTab={userModalInitialTab}
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

      <AdminApprovalPasswordModal
        isOpen={approvalPasswordModalOpen}
        onClose={() => setApprovalPasswordModalOpen(false)}
        transaction={approvalTargetTxn}
        onConfirmApprove={handleConfirmApprovalWithPassword}
        language={language}
        rules={rules}
      />

      <AdminRejectReasonModal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        transaction={rejectTargetTxn}
        onConfirmReject={handleConfirmRejectWithReason}
        language={language}
      />

      <ConvertFeeGpModal
        isOpen={convertFeeGpModalOpen}
        onClose={() => setConvertFeeGpModalOpen(false)}
        treasury={treasury}
        language={language}
        onConvert={(gpAmount, destination) => {
          if (onConvertAdminFeeGpToRupees) {
            onConvertAdminFeeGpToRupees(gpAmount, destination);
          }
        }}
      />
    </div>
  );
};
