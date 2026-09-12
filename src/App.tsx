import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Wallet,
  ActiveInvestment,
  Transaction,
  Language,
  ViewMode,
  InvestmentPlan,
  AppRules,
  UserProfile,
  CompanyTreasury,
  TreasuryLog,
  BackupRecord,
  LiveInterfaceConfig,
  WithdrawalSource,
  DesktopCategoryTab,
  AdminMessage,
} from './types';
import {
  getStoredWallet,
  setStoredWallet,
  getStoredInvestments,
  setStoredInvestments,
  getStoredTransactions,
  setStoredTransactions,
  resetPortalData,
  formatINR,
} from './utils/storage';
import { getStoredRules, saveStoredRules, resetRulesToDefault } from './utils/rulesStorage';
import { getStoredCompanyProfile, saveStoredCompanyProfile } from './utils/companyStorage';
import { getCurrentUser, logoutUser, syncServerUsersToLocal, getAllUsers } from './utils/authStorage';
import {
  getStoredPlans,
  saveStoredPlans,
  addPlan,
  updatePlan,
  deletePlan,
  resetPlansToDefault,
} from './utils/plansStorage';
import {
  getStoredTreasury,
  setStoredTreasury,
  getStoredTreasuryLogs,
  setStoredTreasuryLogs,
  adminAddCompanyBalance,
  adminDeductCompanyBalance,
  deductForUserInvestment,
  deductForUserDepositApproval,
  deductForUserPayout,
  resetTreasuryToDefault,
  DEFAULT_ALERT_THRESHOLD,
} from './utils/treasuryStorage';
import {
  getStoredBackups,
  createBackupSnapshot,
  deleteBackup,
  restoreBackup,
  checkAndRunMidnightAutoBackup,
  getCurrentSystemPayload,
} from './utils/backupStorage';
import {
  getStoredLiveConfig,
  saveStoredLiveConfig,
  resetLiveConfigToDefault,
  subscribeToOtaUpdates,
} from './utils/liveConfigStorage';
import {
  fetchCentralState,
  apiCreateTransaction,
  apiUpdateTransaction,
  apiAddTransaction,
  apiDeleteTransaction,
  apiCreateInvestment,
  apiUpdateInvestment,
  apiSavePlans,
  apiSaveRules,
  apiSaveLiveConfig,
  apiUpdateTreasury,
  apiUpdateWallet,
  apiFetchMessages,
  apiSendAdminMessage,
  apiMarkMessageRead,
  apiDismissMessage,
  apiDeleteAdminMessage,
} from './utils/centralSync';
import { subscribeToRealtimeEvents, playRealtimeChime } from './utils/realtimeSync';
import { apiFetch } from './utils/apiConfig';
import { INVESTMENT_PLANS } from './data/plans';
import { Navbar } from './components/Navbar';
import { WalletCard } from './components/WalletCard';
import { RoiCalculator } from './components/RoiCalculator';
import { PlansList } from './components/PlansList';
import { ActiveInvestments } from './components/ActiveInvestments';
import { TransactionsTable } from './components/TransactionsTable';
import { DepositModal } from './components/DepositModal';
import { WithdrawModal } from './components/WithdrawModal';
import { SwapModal } from './components/SwapModal';
import { InvestModal } from './components/InvestModal';
import { RulesModal } from './components/RulesModal';
import { ReferralModal } from './components/ReferralModal';
import { AndroidFrame } from './components/AndroidFrame';
import { LoginPage } from './components/LoginPage';
import { GcapSplashIntro } from './components/GcapSplashIntro';
import { AdminPanel } from './components/AdminPanel';
import { LockCongratulationsModal } from './components/LockCongratulationsModal';
import { MaturityCertificateModal } from './components/MaturityCertificateModal';
import { PaymentVoucherModal } from './components/PaymentVoucherModal';
import { LiveAnnouncementBanner } from './components/LiveAnnouncementBanner';
import { UserMessagePopupModal } from './components/UserMessagePopupModal';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { DesktopCategoryNav } from './components/DesktopCategoryNav';
import { EcommerceBanner } from './components/EcommerceBanner';
import { NavigationDrawer } from './components/NavigationDrawer';
import { ProfileModal } from './components/ProfileModal';
import { GuidesModal } from './components/GuidesModal';
import { UserAgreementModal } from './components/UserAgreementModal';
import { audioAnnouncer } from './utils/audioAnnouncer';
import {
  TrendingUp,
  ShieldCheck,
  Zap,
  RotateCcw,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Database,
  CheckCircle2,
  FileText,
  Gift,
  Sliders,
  Award,
  Radio,
  ArrowLeft,
} from 'lucide-react';

export default function App() {
  // Project hamesha login screen se start ho (Always start from the Login Screen on project boot/refresh)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    logoutUser();
    return null;
  });
  const [adminViewMode, setAdminViewMode] = useState<'ADMIN_HUB' | 'INVESTOR_VIEW'>('ADMIN_HUB');

  const [wallet, setWallet] = useState<Wallet>(getStoredWallet);
  const [investments, setInvestments] = useState<ActiveInvestment[]>(getStoredInvestments);
  const [transactions, setTransactions] = useState<Transaction[]>(getStoredTransactions);
  const [plans, setPlans] = useState<InvestmentPlan[]>(getStoredPlans);
  const [rules, setRules] = useState<AppRules>(getStoredRules);
  const [treasury, setTreasury] = useState<CompanyTreasury>(getStoredTreasury);
  const [treasuryLogs, setTreasuryLogs] = useState<TreasuryLog[]>(getStoredTreasuryLogs);
  const [backups, setBackups] = useState<BackupRecord[]>(getStoredBackups);
  const [liveConfig, setLiveConfig] = useState<LiveInterfaceConfig>(getStoredLiveConfig);
  const [congratulationsInvestment, setCongratulationsInvestment] = useState<ActiveInvestment | null>(null);
  const [selectedCertificateInvestment, setSelectedCertificateInvestment] = useState<ActiveInvestment | null>(null);
  const [language, setLanguage] = useState<Language>('hi'); // Default Hindi for user's prompt
  const [viewMode, setViewMode] = useState<ViewMode>('web');
  const [mobileTab, setMobileTab] = useState<string>('dashboard');
  const [adminMobileTab, setAdminMobileTab] = useState<
    'OVERVIEW' | 'MESSAGES' | 'INVESTMENTS' | 'TREASURY' | 'COMPANY_PROFILE' | 'BACKUP' | 'PLANS' | 'USERS' | 'TRANSACTIONS' | 'OTA'
  >('OVERVIEW');
  const [desktopTab, setDesktopTab] = useState<DesktopCategoryTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isAgreementOpen, setIsAgreementOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [activePopupMessage, setActivePopupMessage] = useState<AdminMessage | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);

  // Auto-adapt mobile/web interface according to screen width automatically
  useEffect(() => {
    const handleAutoLayoutResize = () => {
      if (window.innerWidth < 768) {
        setViewMode('android');
      } else {
        setViewMode('web');
      }
    };
    handleAutoLayoutResize();
    window.addEventListener('resize', handleAutoLayoutResize);
    return () => window.removeEventListener('resize', handleAutoLayoutResize);
  }, []);

  const isHi = language === 'hi';

  // Midnight Auto-Backup Lifecycle
  useEffect(() => {
    // Check if 12:00 AM midnight backup needs to run right now
    const initialBackup = checkAndRunMidnightAutoBackup();
    if (initialBackup) {
      setBackups(getStoredBackups());
    }

    // Interval to check every 30 seconds if midnight is reached
    const timer = setInterval(() => {
      const autoSnapshot = checkAndRunMidnightAutoBackup();
      if (autoSnapshot.ran && autoSnapshot.record) {
        setBackups(getStoredBackups());
        showToast(
          isHi ? '🌙 12:00 AM ऑटोमैटिक बैकअप सफल!' : '🌙 Midnight Auto-Backup Completed!',
          isHi
            ? `दिनांक ${autoSnapshot.record.backupDate} का संपूर्ण डेटा बैकअप सुरक्षित कर लिया गया है।`
            : `Snapshot for ${autoSnapshot.record.backupDate} has been safely archived.`
        );
      }
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  // Real-time Live In-App OTA & Remote Config Synchronizer
  useEffect(() => {
    const unsubscribe = subscribeToOtaUpdates((payload) => {
      setLiveConfig(getStoredLiveConfig());
      if (payload.type === 'RULES') {
        setRules(getStoredRules());
      } else if (payload.type === 'PLANS') {
        setPlans(getStoredPlans());
      } else if (payload.type === 'TREASURY') {
        setTreasury(getStoredTreasury());
        setTreasuryLogs(getStoredTreasuryLogs());
      } else if (payload.type === 'INTERFACE') {
        setLiveConfig(getStoredLiveConfig());
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Immediate Public State Sync on App Launch & Foreground Resume:
  // Ensures: "Kuch bhi update ya change karne per admin ya GitHub me kuch bhi new ho wo sub kuch kisi dusre ke mobile me jo pahle se app install ho open hote hi sara change leker hi khule"
  useEffect(() => {
    let isCancelled = false;

    const syncPublicState = async () => {
      try {
        const state = await fetchCentralState(undefined, 'USER');
        if (isCancelled || !state || !state.success) return;

        if (state.plans && state.plans.length > 0) {
          setPlans((prev) => (JSON.stringify(prev) !== JSON.stringify(state.plans) ? state.plans : prev));
          saveStoredPlans(state.plans);
        }
        if (state.rules) {
          setRules((prev) => (JSON.stringify(prev) !== JSON.stringify(state.rules) ? state.rules : prev));
          saveStoredRules(state.rules);
        }
        if (state.liveConfig) {
          setLiveConfig((prev) => (JSON.stringify(prev) !== JSON.stringify(state.liveConfig) ? state.liveConfig : prev));
          saveStoredLiveConfig(state.liveConfig);
        }
      } catch (err) {
        console.warn('[PublicSync] Launch sync error:', err);
      }
    };

    // Run at 0ms on launch
    syncPublicState();

    // Re-check whenever the user brings the mobile app to foreground
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        syncPublicState();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    const unsubscribeRealtime = subscribeToRealtimeEvents((event) => {
      if (
        event.type === 'PLANS_UPDATED' ||
        event.type === 'RULES_UPDATED' ||
        event.type === 'LIVE_CONFIG_UPDATED' ||
        event.type === 'STATE_CHANGED'
      ) {
        syncPublicState();
      }
    });

    return () => {
      isCancelled = true;
      document.removeEventListener('visibilitychange', handleVisibility);
      unsubscribeRealtime();
    };
  }, []);

  // Global Real-Time Central Database Synchronizer for Logged-In User & Admin
  // Ensures: "Duniya me kahi bhi kuch koi user ya admin kare wo sab kuch turant main database me update ho aur panel per change show ho"
  useEffect(() => {
    if (!currentUser) return;
    let isCancelled = false;

    const syncWithCentralDb = async () => {
      try {
        const state = await fetchCentralState(currentUser.id, currentUser.role);
        if (isCancelled || !state || !state.success) return;

        // Sync Global Plans, Rules, LiveConfig
        if (state.plans && state.plans.length > 0) {
          setPlans((prev) => (JSON.stringify(prev) !== JSON.stringify(state.plans) ? state.plans : prev));
          saveStoredPlans(state.plans);
        }
        if (state.rules) {
          setRules((prev) => (JSON.stringify(prev) !== JSON.stringify(state.rules) ? state.rules : prev));
          saveStoredRules(state.rules);
        }
        if (state.liveConfig) {
          setLiveConfig((prev) => (JSON.stringify(prev) !== JSON.stringify(state.liveConfig) ? state.liveConfig : prev));
          saveStoredLiveConfig(state.liveConfig);
        }

        // Sync Role-Specific State
        if (currentUser.role === 'ADMIN') {
          if (state.users && Array.isArray(state.users)) {
            syncServerUsersToLocal(state.users);
          }
          if (state.transactions) {
            setTransactions((prev) => (JSON.stringify(prev) !== JSON.stringify(state.transactions) ? state.transactions : prev));
            setStoredTransactions(state.transactions);
          }
          if (state.investments) {
            setInvestments((prev) => (JSON.stringify(prev) !== JSON.stringify(state.investments) ? state.investments : prev));
            setStoredInvestments(state.investments);
          }
          if (state.treasury) {
            setTreasury((prev) => (JSON.stringify(prev) !== JSON.stringify(state.treasury) ? state.treasury : prev));
            setStoredTreasury(state.treasury);
          }
          if (state.treasuryLogs) {
            setTreasuryLogs((prev) => (JSON.stringify(prev) !== JSON.stringify(state.treasuryLogs) ? state.treasuryLogs : prev));
          }
        } else {
          // Regular User
          if (state.wallet) {
            setWallet((prev) => (JSON.stringify(prev) !== JSON.stringify(state.wallet) ? state.wallet : prev));
            setStoredWallet(state.wallet);
          }
          if (state.transactions) {
            setTransactions((prev) => (JSON.stringify(prev) !== JSON.stringify(state.transactions) ? state.transactions : prev));
            setStoredTransactions(state.transactions);
          }
          if (state.investments) {
            setInvestments((prev) => (JSON.stringify(prev) !== JSON.stringify(state.investments) ? state.investments : prev));
            setStoredInvestments(state.investments);
          }
        }
      } catch {
        // Smooth error recovery
      }
    };

    // Run immediately, then poll every 1500ms as fallback
    syncWithCentralDb();
    const interval = setInterval(syncWithCentralDb, 1500);

    const handleResume = () => {
      if (document.visibilityState === 'visible') {
        syncWithCentralDb();
      }
    };
    document.addEventListener('visibilitychange', handleResume);

    // Instant SSE Real-Time Sync on any activity anywhere
    const unsubscribeRealtime = subscribeToRealtimeEvents(() => {
      syncWithCentralDb();
    });

    return () => {
      isCancelled = true;
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleResume);
      unsubscribeRealtime();
    };
  }, [currentUser?.id, currentUser?.role]);

  // Message Helper: Check if a message matches current user
  const isMessageForCurrentUser = useCallback((msg: AdminMessage) => {
    if (!currentUser) return false;
    if (msg.targetType === 'ALL') return true;
    if (msg.targetType === 'SINGLE') {
      return (
        msg.targetUserId === currentUser.id ||
        (msg.targetUserLoginId && msg.targetUserLoginId.toLowerCase() === currentUser.loginId?.toLowerCase())
      );
    }
    if (msg.targetType === 'SELECTED') {
      return Array.isArray(msg.targetUserIds) && msg.targetUserIds.includes(currentUser.id);
    }
    if (msg.targetType === 'INVESTORS') {
      return investments.length > 0;
    }
    if (msg.targetType === 'POSITIVE_BALANCE') {
      return wallet.cashBalance > 0;
    }
    return true;
  }, [currentUser, investments.length, wallet.cashBalance]);

  // Real-time messages fetch and synchronization
  const refreshMessages = useCallback(async () => {
    try {
      const res = await apiFetchMessages(currentUser?.id, currentUser?.role || 'USER');
      if (res && Array.isArray(res.messages)) {
        setMessages(res.messages);
      }
    } catch (err) {
      console.warn('[Messages] Fetch error:', err);
    }
  }, [currentUser?.id, currentUser?.role]);

  useEffect(() => {
    refreshMessages();
  }, [refreshMessages]);

  // Real-time SSE listener for instant admin messages to reflect on ANY screen
  useEffect(() => {
    const unsub = subscribeToRealtimeEvents((event) => {
      if (event.type === 'ADMIN_MESSAGE') {
        const payloadMsg = event.adminMessage || (event as any).message;
        if (payloadMsg) {
          setMessages((prev) => {
            const exists = prev.some((m) => m.id === payloadMsg.id);
            return exists ? prev.map((m) => (m.id === payloadMsg.id ? payloadMsg : m)) : [payloadMsg, ...prev];
          });

          // Show immediate popup modal if message is targeted to current user and not dismissed
          if (currentUser && isMessageForCurrentUser(payloadMsg)) {
            const isDismissed = Array.isArray(payloadMsg.dismissedByUserIds) && payloadMsg.dismissedByUserIds.includes(currentUser.id);
            if (!isDismissed && (payloadMsg.showPopup || payloadMsg.priority === 'POPUP' || payloadMsg.priority === 'URGENT')) {
              setActivePopupMessage(payloadMsg);
              playRealtimeChime();
            }
          }
        }
      }
    });

    return () => {
      unsub();
    };
  }, [currentUser, isMessageForCurrentUser]);

  // User-facing visible messages
  const userVisibleMessages = messages.filter((m) => {
    if (!currentUser) return false;
    if (currentUser.role === 'ADMIN') return true;
    return isMessageForCurrentUser(m);
  });

  const unreadMessagesCount = userVisibleMessages.filter((m) => {
    if (!currentUser) return false;
    return !(Array.isArray(m.readByUserIds) && m.readByUserIds.includes(currentUser.id));
  }).length;

  const handleSendAdminMessage = async (msg: Partial<AdminMessage>): Promise<boolean> => {
    try {
      const res = await apiSendAdminMessage({
        ...msg,
        senderName: currentUser?.name || 'GCap Master Admin',
      });
      if (res.success && res.message) {
        setMessages((prev) => [res.message!, ...prev]);
        showToast(
          isHi ? '📢 संदेश सफलतापूर्वक भेजा गया!' : '📢 Message Broadcasted!',
          isHi ? 'यूज़र्स की स्क्रीन पर तुरंत पॉपअप व नोटिफिकेशन में दिखेगा।' : 'Delivered live to user screens and notification centers.'
        );
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleDeleteAdminMessage = async (msgId: string): Promise<boolean> => {
    const res = await apiDeleteAdminMessage(msgId);
    const success = !!res?.success;
    if (success) {
      setMessages((prev) => prev.filter((m) => m.id !== msgId));
      if (activePopupMessage?.id === msgId) {
        setActivePopupMessage(null);
      }
      showToast(
        isHi ? '🗑️ संदेश हटाया गया' : '🗑️ Message Deleted',
        isHi ? 'संदेश सूची से हटा दिया गया है।' : 'Removed from system.'
      );
    }
    return success;
  };

  const handleMarkMessageAsRead = async (msgId: string) => {
    if (currentUser) {
      await apiMarkMessageRead(msgId, currentUser.id);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId
            ? {
                ...m,
                readByUserIds: Array.isArray(m.readByUserIds)
                  ? m.readByUserIds.includes(currentUser.id)
                    ? m.readByUserIds
                    : [...m.readByUserIds, currentUser.id]
                  : [currentUser.id],
              }
            : m
        )
      );
    }
  };

  const handleDismissPopupMessage = async () => {
    if (activePopupMessage && currentUser) {
      const msgId = activePopupMessage.id;
      await apiDismissMessage(msgId, currentUser.id);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId
            ? {
                ...m,
                dismissedByUserIds: Array.isArray(m.dismissedByUserIds)
                  ? m.dismissedByUserIds.includes(currentUser.id)
                    ? m.dismissedByUserIds
                    : [...m.dismissedByUserIds, currentUser.id]
                  : [currentUser.id],
              }
            : m
        )
      );
    }
    setActivePopupMessage(null);
  };

  const handleMarkAsReadAndClosePopup = async () => {
    if (activePopupMessage) {
      await handleMarkMessageAsRead(activePopupMessage.id);
      await handleDismissPopupMessage();
    }
  };

  const handleMarkAllMessagesAsRead = async () => {
    if (currentUser) {
      for (const msg of userVisibleMessages) {
        if (!msg.readByUserIds?.includes(currentUser.id)) {
          apiMarkMessageRead(msg.id, currentUser.id).catch(console.error);
        }
      }
      setMessages((prev) =>
        prev.map((m) => ({
          ...m,
          readByUserIds: Array.isArray(m.readByUserIds)
            ? m.readByUserIds.includes(currentUser.id)
              ? m.readByUserIds
              : [...m.readByUserIds, currentUser.id]
            : [currentUser.id],
        }))
      );
    }
  };

  const handleUpdateLiveConfig = (newConfig: LiveInterfaceConfig) => {
    saveStoredLiveConfig(newConfig);
    setLiveConfig(newConfig);
    apiSaveLiveConfig(newConfig).catch(console.error);
    showToast(
      isHi ? 'लाइव इन-ऐप OTA अपडेट्स ब्रॉडकास्ट किए गए!' : 'Live In-App OTA Broadcast Sent!',
      isHi
        ? `वर्ज़न ${newConfig.appVersion} के नए इंटरफ़ेस नियम सभी यूज़र्स के पास तुरंत लाइव हो चुके हैं।`
        : `Version ${newConfig.appVersion} changes are now live across all active devices without reinstall.`
    );
  };

  const handleResetLiveConfig = () => {
    const def = resetLiveConfigToDefault();
    setLiveConfig(def);
    apiSaveLiveConfig(def).catch(console.error);
    showToast(
      isHi ? 'डिफ़ॉल्ट लाइव कॉन्फ़िग बहाल हुई' : 'Default Live Config Restored',
      isHi ? 'मूल इंटरफ़ेस व ब्रॉडकास्ट सेटिंग्स रीसेट हो गईं।' : 'Standard live settings restored.'
    );
  };

  // Admin Company Treasury Balance Actions
  const handleAdminAddCompanyBalance = (
    amount: number,
    reason: string,
    reasonHi: string,
    refId?: string
  ) => {
    const { treasury: newTreasury, log } = adminAddCompanyBalance(
      amount,
      currentUser?.id || 'adm-master',
      reason,
      reasonHi,
      refId
    );
    setTreasury(newTreasury);
    setTreasuryLogs((prev) => [log, ...prev]);
    apiUpdateTreasury(newTreasury, log).catch(console.error);
    showToast(
      isHi ? 'कंपनी मुख्य बैलेंस बढ़ाया गया!' : 'Company Treasury Credited!',
      isHi
        ? `+${formatINR(amount)} जोड़े गए। वर्तमान मुख्य बैलेंस: ${formatINR(newTreasury.balance)}`
        : `+${formatINR(amount)} added. Current reserve balance: ${formatINR(newTreasury.balance)}`
    );
  };

  const handleAdminDeductCompanyBalance = (
    amount: number,
    reason: string,
    reasonHi: string,
    refId?: string
  ) => {
    const { treasury: newTreasury, log } = adminDeductCompanyBalance(
      amount,
      currentUser?.id || 'adm-master',
      reason,
      reasonHi,
      refId
    );
    setTreasury(newTreasury);
    setTreasuryLogs((prev) => [log, ...prev]);
    apiUpdateTreasury(newTreasury, log).catch(console.error);

    if (newTreasury.balance <= DEFAULT_ALERT_THRESHOLD) {
      showToast(
        isHi ? '⚠️ क्रिटिकल अलर्ट: कंपनी बैलेंस कम!' : '⚠️ Critical Alert: Low Treasury Balance!',
        isHi
          ? `कंपनी का बैलेंस ₹${newTreasury.balance.toLocaleString('en-IN')} पर आ गया है (सीमा: ₹5,00,000)। कृपया तुरंत मुख्य बैलेंस बढ़ाएं!`
          : `Treasury dropped to ₹${newTreasury.balance.toLocaleString('en-IN')} (Threshold: ₹500,000). Please replenish immediately!`,
        'info'
      );
    } else {
      showToast(
        isHi ? 'कंपनी मुख्य बैलेंस घटाया गया!' : 'Company Treasury Debited!',
        isHi
          ? `-${formatINR(amount)} घटाए गए। शेष बैलेंस: ${formatINR(newTreasury.balance)}`
          : `-${formatINR(amount)} deducted. Remaining reserve balance: ${formatINR(newTreasury.balance)}`
      );
    }
  };

  const handleQuickAddCompanyBalance = (amount: number) => {
    handleAdminAddCompanyBalance(
      amount,
      'Quick Reserve Top-up by Super Admin',
      'सुपर एडमिन द्वारा त्वरित रिज़र्व टॉप-अप'
    );
  };

  const handleResetTreasury = () => {
    const { treasury: def } = resetTreasuryToDefault();
    setTreasury(def);
    setTreasuryLogs(getStoredTreasuryLogs());
    apiUpdateTreasury(def).catch(console.error);
    showToast(
      isHi ? 'कंपनी ट्रेजरी रीसेट हुई' : 'Treasury Reset',
      isHi ? 'कंपनी मुख्य बैलेंस ₹50,00,000 पर बहाल कर दिया गया है।' : 'Company balance reset to ₹5,000,000.'
    );
  };

  // Admin Plan Actions
  const handleAdminAddPlan = (newPlan: InvestmentPlan) => {
    const updated = addPlan(newPlan);
    setPlans(updated);
    apiSavePlans(updated).catch(console.error);
    showToast(
      isHi ? 'नया प्लान सफलतापूर्वक जोड़ा गया!' : 'New plan created successfully!',
      isHi ? `${newPlan.name} अब निवेशकों के लिए सक्रिय है।` : `${newPlan.name} is now live.`
    );
  };

  const handleAdminUpdatePlan = (updatedPlan: InvestmentPlan) => {
    const updated = updatePlan(updatedPlan);
    setPlans(updated);
    apiSavePlans(updated).catch(console.error);
    showToast(
      isHi ? 'प्लान अपडेट हो गया!' : 'Plan updated successfully!',
      isHi ? `${updatedPlan.name} का डेटा अपडेट कर दिया गया है।` : `${updatedPlan.name} has been updated.`
    );
  };

  const handleAdminDeletePlan = (planId: string) => {
    const updated = deletePlan(planId);
    setPlans(updated);
    apiSavePlans(updated).catch(console.error);
    showToast(
      isHi ? 'प्लान हटा दिया गया!' : 'Plan deleted!',
      isHi ? 'प्लान को सफलतापूर्वक हटाया गया।' : 'The plan was successfully deleted.'
    );
  };

  const handleAdminResetPlans = () => {
    const defaults = resetPlansToDefault();
    setPlans(defaults);
    apiSavePlans(defaults).catch(console.error);
    showToast(
      isHi ? 'डिफ़ॉल्ट प्लान्स बहाल हुए' : 'Default plans restored',
      isHi ? 'सभी मूल निवेश योजनाएं रीसेट हो गई हैं।' : 'Standard schemes restored.'
    );
  };

  // Admin Transaction Actions
  const handleAdminAddTransaction = (newTxn: Transaction) => {
    const updated = [newTxn, ...transactions];
    setTransactions(updated);
    setStoredTransactions(updated);
    apiAddTransaction(newTxn).catch(console.error);
    if (newTxn.status === 'SUCCESS') {
      if (newTxn.type === 'DEPOSIT') {
        const updatedWallet = {
          ...wallet,
          cashBalance: wallet.cashBalance + newTxn.amount,
        };
        setWallet(updatedWallet);
        setStoredWallet(updatedWallet);
      } else if (newTxn.type === 'WITHDRAWAL') {
        const updatedWallet = {
          ...wallet,
          cashBalance: Math.max(0, wallet.cashBalance - newTxn.amount),
        };
        setWallet(updatedWallet);
        setStoredWallet(updatedWallet);
      }
    }
    showToast(
      isHi ? 'लेन-देन रिकॉर्ड दर्ज हुआ' : 'Transaction recorded',
      isHi ? `₹${newTxn.amount} का नया रिकॉर्ड जोड़ा गया।` : `Transaction for ₹${newTxn.amount} added.`
    );
  };

  const handleAdminUpdateTransaction = (updatedTxn: Transaction) => {
    const prevTxn = transactions.find((t) => t.id === updatedTxn.id);
    const updated = transactions.map((t) => (t.id === updatedTxn.id ? updatedTxn : t));
    setTransactions(updated);
    setStoredTransactions(updated);

    // Update central database immediately
    apiUpdateTransaction(updatedTxn, currentUser?.id)
      .then((res) => {
        if (res && res.treasury) {
          setTreasury(res.treasury);
          setStoredTreasury(res.treasury);
        }
      })
      .catch(console.error);

    // Rule 2: Admin Approval moves deposit funds to wallet cash balance
    // MANDATORY RULE: Koi bhi user jub fund add karega to uske balance company ke main balance wallet se deduct hoker hi melega aur uska record admin ke pass rahna chaiye.
    if (prevTxn && prevTxn.type === 'DEPOSIT' && prevTxn.status === 'PENDING' && updatedTxn.status === 'SUCCESS') {
      // 1. Deduct from Company Main Balance and create audit record in treasury logs
      const deductRes = deductForUserDepositApproval(
        updatedTxn.amount,
        currentUser?.name || 'Investor User',
        updatedTxn.referenceId || updatedTxn.id
      );
      setTreasury(deductRes.treasury);
      setTreasuryLogs(getStoredTreasuryLogs());

      // 2. Credit to user's wallet cash balance and remove from pending
      const updatedWallet: Wallet = {
        ...wallet,
        cashBalance: wallet.cashBalance + updatedTxn.amount,
        pendingDeposits: Math.max(0, (wallet.pendingDeposits || 0) - updatedTxn.amount),
      };
      setWallet(updatedWallet);
      setStoredWallet(updatedWallet);

      showToast(
        isHi ? '✅ डिपॉजिट अप्रूव हुआ (कंपनी बैलेंस से डिडक्ट)!' : '✅ Deposit Approved (Deducted from Company Balance)!',
        isHi
          ? `कंपनी मुख्य बैलेंस से ₹${updatedTxn.amount.toLocaleString('en-IN')} डिडक्ट होकर यूज़र वॉलेट में ₹${updatedTxn.amount.toLocaleString('en-IN')} कैश क्रेडिट हुआ (कंपनी शेष: ₹${deductRes.treasury.balance.toLocaleString('en-IN')})। अब यूज़र इसका GP बनाकर प्लान ले सकते हैं।`
          : `₹${updatedTxn.amount.toLocaleString('en-IN')} deducted from Company Main Balance & credited to user wallet (Company Balance: ₹${deductRes.treasury.balance.toLocaleString('en-IN')}).`
      );
      return;
    } else if (prevTxn && prevTxn.type === 'DEPOSIT' && prevTxn.status === 'PENDING' && updatedTxn.status === 'REJECTED') {
      const updatedWallet: Wallet = {
        ...wallet,
        pendingDeposits: Math.max(0, (wallet.pendingDeposits || 0) - updatedTxn.amount),
      };
      setWallet(updatedWallet);
      setStoredWallet(updatedWallet);
      showToast(
        isHi ? '❌ डिपॉजिट अस्वीकृत' : '❌ Deposit Rejected',
        isHi ? 'डिपॉजिट अनुरोध अस्वीकृत किया गया।' : 'Deposit request has been marked rejected.',
        'info'
      );
      return;
    }

    showToast(
      isHi ? 'लेन-देन रिकॉर्ड अपडेट हुआ' : 'Transaction record updated',
      isHi ? `स्थिति: ${updatedTxn.status}` : `Status: ${updatedTxn.status}`
    );
  };

  const handleAdminDeleteTransaction = (txnId: string) => {
    const updated = transactions.filter((t) => t.id !== txnId);
    setTransactions(updated);
    setStoredTransactions(updated);
    apiDeleteTransaction(txnId).catch(console.error);
    showToast(
      isHi ? 'लेन-देन रिकॉर्ड हटाया गया' : 'Record deleted',
      isHi ? 'लेन-देन इतिहास से हटाया गया।' : 'Transaction removed from ledger.'
    );
  };

  // Backup & Restore Handlers
  const handleRunMidnightBackupNow = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newSnapshot = createBackupSnapshot(
      getCurrentSystemPayload(),
      'MIDNIGHT_AUTO',
      todayStr,
      `12:00 AM Midnight Auto-Backup (${todayStr})`,
      `रात 12:00 बजे का ऑटोमैटिक बैकअप (${todayStr})`,
      'Admin triggered 12:00 AM Midnight Auto-Backup engine manually.'
    );
    setBackups(getStoredBackups());
    showToast(
      isHi ? '🌙 12:00 AM बैकअप तुरंत निष्पादित हुआ!' : '🌙 Midnight Auto-Backup Executed!',
      isHi
        ? `दिनांक ${newSnapshot.backupDate} का संपूर्ण डेटा स्नैपशॉट सुरक्षित कर लिया गया है।`
        : `Complete platform state snapshot for ${newSnapshot.backupDate} has been saved.`
    );
  };

  const handleCreateManualSnapshot = (customDate?: string, note?: string) => {
    const targetDate = customDate || new Date().toISOString().split('T')[0];
    const newSnapshot = createBackupSnapshot(
      getCurrentSystemPayload(),
      'ADMIN_MANUAL',
      targetDate,
      `Admin Manual Snapshot (${targetDate})`,
      `एडमिन मैनुअल स्नैपशॉट (${targetDate})`,
      note || 'Manual dated checkpoint created by Super Admin.'
    );
    setBackups(getStoredBackups());
    showToast(
      isHi ? 'नया स्नैपशॉट सफलतापूर्वक दर्ज!' : 'Snapshot Created Successfully!',
      isHi
        ? `दिनांक ${newSnapshot.backupDate} का बैकअप सुरक्षित हो गया।`
        : `Snapshot for ${newSnapshot.backupDate} saved.`
    );
  };

  const handleRestoreBackup = (backupToRestore: BackupRecord) => {
    const success = restoreBackup(backupToRestore);
    if (success) {
      // Synchronize all live React states with the restored payload
      const p = backupToRestore.payload;
      setWallet(p.wallet);
      setInvestments(p.investments);
      setTransactions(p.transactions);
      setPlans(p.plans);
      setRules(p.rules);
      setTreasury(p.treasury);
      setTreasuryLogs(p.treasuryLogs);

      showToast(
        isHi ? 'प्रोजेक्ट डेटा सफलतापूर्वक रिस्टोर हुआ!' : 'System Restored Successfully!',
        isHi
          ? `दिनांक ${backupToRestore.backupDate} की स्थिति बहाल कर दी गई है (कंपनी मुख्य बैलेंस: ${formatINR(p.treasury.balance)})`
          : `System restored to snapshot of ${backupToRestore.backupDate} (Company Treasury: ${formatINR(p.treasury.balance)})`
      );
    } else {
      showToast(
        isHi ? 'रिस्टोर विफल रहा' : 'Restore Failed',
        isHi ? 'डेटा पार्सिंग में त्रुटि हुई।' : 'An error occurred while parsing the backup payload.',
        'info'
      );
    }
  };

  const handleDeleteBackup = (backupId: string) => {
    const updated = deleteBackup(backupId);
    setBackups(updated);
    showToast(
      isHi ? 'बैकअप रिकॉर्ड हटाया गया' : 'Backup Deleted',
      isHi ? 'चयनित बैकअप स्नैपशॉट हटा दिया गया।' : 'The selected backup snapshot has been removed.'
    );
  };

  // Modals state
  const [isDepositOpen, setIsDepositOpen] = useState<boolean>(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState<boolean>(false);
  const [isSwapOpen, setIsSwapOpen] = useState<boolean>(false);
  const [isInvestOpen, setIsInvestOpen] = useState<boolean>(false);
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);
  const [isReferralOpen, setIsReferralOpen] = useState<boolean>(false);
  const [isGuidesOpen, setIsGuidesOpen] = useState<boolean>(false);
  const [initialGuide, setInitialGuide] = useState<'SHORT_TERM' | 'LONG_TERM' | 'TDS_REFUND'>('SHORT_TERM');

  const handleOpenGuides = (guide: 'SHORT_TERM' | 'LONG_TERM' | 'TDS_REFUND' = 'SHORT_TERM') => {
    setInitialGuide(guide);
    setIsGuidesOpen(true);
  };
  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null);
  const [initialInvestAmount, setInitialInvestAmount] = useState<number>(5000);

  // Voucher Modal state
  const [selectedVoucherTxn, setSelectedVoucherTxn] = useState<Transaction | null>(null);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState<boolean>(false);

  // Simulation & Splash Intro state
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [showSplashIntro, setShowSplashIntro] = useState<boolean>(false);
  const handleSplashComplete = useCallback(() => setShowSplashIntro(false), []);
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string; type: 'success' | 'info' } | null>(null);

  const showToast = (title: string, desc: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ title, desc, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Real-time Event Listener for instant Audio Chime & Admin Live Notifications
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = subscribeToRealtimeEvents((event) => {
      if (currentUser.role === 'ADMIN') {
        if (event.type === 'USER_REGISTERED' && event.user) {
          playRealtimeChime('success');
          showToast(
            '🔔 नया यूज़र रजिस्टर हुआ!',
            `${event.user.name} (${event.user.phone || event.user.loginId}) ने अभी रजिस्टर किया। एडमिन पैनल में तुरंत जुड़ गया!`
          );
        } else if (event.type === 'TRANSACTION_CREATED' && event.transaction) {
          const t = event.transaction;
          playRealtimeChime('info');
          const title =
            t.type === 'DEPOSIT'
              ? '💰 नया डिपॉजिट अनुरोध!'
              : t.type === 'WITHDRAWAL'
              ? '💸 नया निकासी अनुरोध!'
              : '📝 नया ट्रांजेक्शन';
          showToast(
            title,
            `₹${Number(t.amount || 0).toLocaleString('en-IN')} - ${t.userName || t.userLoginId || t.userId || 'यूज़र'} (तुरंत अपडेट)`
          );
        } else if (event.type === 'INVESTMENT_CREATED' && event.investment) {
          playRealtimeChime('info');
          showToast(
            '📈 नया निवेश प्लान सक्रिय!',
            `₹${Number(event.investment.investedAmount || 0).toLocaleString('en-IN')} - ${event.investment.planName}`
          );
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [currentUser?.id, currentUser?.role]);

  const handleLoginSuccess = async (user: UserProfile) => {
    setCurrentUser(user);
    setShowSplashIntro(true);
    setAdminViewMode('INVESTOR_VIEW');
    showToast(
      isHi ? `स्वागत है, ${user.name}!` : `Welcome, ${user.name}!`,
      user.role === 'ADMIN'
        ? (isHi ? 'एडमिन अकाउंट सक्रिय है। नीचे "👑 एडमिन हब" टैब से कंट्रोल पैनल खोलें।' : 'Admin Account active. Tap "👑 Admin Hub" tab below.')
        : (isHi ? 'आपका निवेशक डैशबोर्ड सक्रिय है।' : 'Your investor dashboard is ready.')
    );

    // Immediately synchronize user/admin state from central database
    try {
      const state = await fetchCentralState(user.id, user.role);
      if (state && state.success) {
        if (state.plans && state.plans.length > 0) {
          setPlans(state.plans);
          saveStoredPlans(state.plans);
        }
        if (state.rules) {
          setRules(state.rules);
          saveStoredRules(state.rules);
        }
        if (state.liveConfig) {
          setLiveConfig(state.liveConfig);
          saveStoredLiveConfig(state.liveConfig);
        }
        if (user.role === 'ADMIN') {
          if (state.transactions) {
            setTransactions(state.transactions);
            setStoredTransactions(state.transactions);
          }
          if (state.investments) {
            setInvestments(state.investments);
            setStoredInvestments(state.investments);
          }
          if (state.treasury) {
            setTreasury(state.treasury);
            setStoredTreasury(state.treasury);
          }
          if (state.treasuryLogs) {
            setTreasuryLogs(state.treasuryLogs);
          }
        } else {
          if (state.wallet) {
            setWallet(state.wallet);
            setStoredWallet(state.wallet);
          }
          if (state.transactions) {
            setTransactions(state.transactions);
            setStoredTransactions(state.transactions);
          }
          if (state.investments) {
            setInvestments(state.investments);
            setStoredInvestments(state.investments);
          }
        }
      }
    } catch {
      // Offline fallback
    }
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    showToast(
      isHi ? 'सफलतापूर्वक लॉगआउट हुआ' : 'Logged out',
      isHi ? 'आप सुरक्षित रूप से लॉगआउट हो चुके हैं।' : 'Session ended safely.'
    );
  };

  // Save changes to localStorage
  useEffect(() => {
    setStoredWallet(wallet);
  }, [wallet]);

  useEffect(() => {
    setStoredInvestments(investments);
  }, [investments]);

  useEffect(() => {
    setStoredTransactions(transactions);
  }, [transactions]);

  // Derived metrics
  const activeInvestmentsList = investments.filter((i) => i.status === 'ACTIVE');
  const unclaimedReturnsTotal = investments.reduce((acc, curr) => acc + (curr.unclaimedEarnings || 0), 0);
  const dailyProjectedTotal = activeInvestmentsList.reduce((acc, curr) => acc + curr.dailyReturnAmount, 0);

  // Handlers
  const handleDepositSuccess = (amount: number, method: string, referenceId: string) => {
    // Deposit Rule 1 & 2:
    // Amount is submitted to company account and held in pending state until admin approves
    const updatedWallet: Wallet = {
      ...wallet,
      pendingDeposits: (wallet.pendingDeposits || 0) + amount,
    };
    const newTx: Transaction = {
      id: `txn-${Date.now()}`,
      userId: currentUser?.id,
      userLoginId: currentUser?.loginId,
      userName: currentUser?.name || 'Investor User',
      userPhone: currentUser?.phone || '',
      type: 'DEPOSIT',
      amount,
      date: new Date().toISOString(),
      timestamp: Date.now(),
      status: 'PENDING',
      method,
      referenceId,
      note: `Deposit of ${formatINR(amount)} to Company A/C (UTR: ${referenceId}) [Wait for approval]`,
      noteHi: `कंपनी खाते में ${formatINR(amount)} जमा (UTR: ${referenceId}) [एडमिन अप्रूवल की प्रतीक्षा]`,
    };

    setWallet(updatedWallet);
    setTransactions([newTx, ...transactions]);

    if (currentUser?.id) {
      apiCreateTransaction(newTx, currentUser.id).catch(console.error);
      apiUpdateWallet(updatedWallet, currentUser.id).catch(console.error);
    }

    // Trigger Personalized Audio Voice Announcement (plays in background)
    audioAnnouncer.announceDeposit({
      userName: currentUser?.name || 'Investor',
      amount: amount,
      language: isHi ? 'hi' : 'en',
    });

    showToast(
      isHi ? '⏳ जमा अनुरोध दर्ज (Wait for approval)' : '⏳ Deposit Submitted for Approval',
      isHi
        ? `₹${amount.toLocaleString('en-IN')} का अनुरोध दर्ज हुआ (UTR: ${referenceId})। एडमिन अप्रूवल के बाद यह राशि वॉलेट कैश में क्रेडिट होगी।`
        : `Deposit of ₹${amount.toLocaleString('en-IN')} (UTR: ${referenceId}) is awaiting admin verification. Funds will credit upon approval.`
    );
  };

  // Deposit Rule 3 & 4:
  // User can swap any portion of approved cash to GP to buy plans; rest stays intact
  const handleSwapSuccess = (swapAmount: number, gpEarned?: number) => {
    if (swapAmount <= 0 || swapAmount > wallet.cashBalance) return;
    const gpRate = rules?.gpRatePerRupee && rules.gpRatePerRupee > 0 ? rules.gpRatePerRupee : 1.0;
    const finalGpAmount = typeof gpEarned === 'number' && gpEarned > 0 ? gpEarned : Math.round(swapAmount * gpRate * 100) / 100;
    
    const updatedWallet: Wallet = {
      ...wallet,
      cashBalance: wallet.cashBalance - swapAmount,
      gpBalance: (wallet.gpBalance || 0) + finalGpAmount,
    };
    const newTx: Transaction = {
      id: `txn-swap-${Date.now()}`,
      userId: currentUser?.id,
      userLoginId: currentUser?.loginId,
      userName: currentUser?.name || 'Investor User',
      userPhone: currentUser?.phone || '',
      type: 'SWAP_GP',
      amount: swapAmount,
      date: new Date().toISOString(),
      timestamp: Date.now(),
      status: 'SUCCESS',
      method: 'Cash to GP Swap',
      referenceId: 'GP' + Math.floor(10000000 + Math.random() * 90000000),
      note: `Swapped ₹${swapAmount} to ${finalGpAmount} GP (@ ₹1 = ${gpRate} GP) for plan purchase`,
      noteHi: `₹${swapAmount} कैश को ${finalGpAmount} GP में बदला (दर: ₹1 = ${gpRate} GP)`,
    };

    setWallet(updatedWallet);
    setTransactions([newTx, ...transactions]);

    if (currentUser?.id) {
      apiCreateTransaction(newTx, currentUser.id).catch(console.error);
      apiUpdateWallet(updatedWallet, currentUser.id).catch(console.error);
    }

    // Trigger Audio Voice Announcement
    audioAnnouncer.announceGpSwap({
      userName: currentUser?.name || 'Investor',
      amount: swapAmount,
      gpAmount: finalGpAmount,
      language: isHi ? 'hi' : 'en',
    });

    showToast(
      isHi ? '🔄 GP स्वैप सफल!' : '🔄 GP Swap Successful!',
      isHi
        ? `${finalGpAmount.toLocaleString('en-IN')} GP वॉलेट में जोड़े गए (दर: ₹1 = ${gpRate} GP)। शेष कैश बैलेंस: ${formatINR(updatedWallet.cashBalance)}। अब आप इच्छानुसार प्लान ले सकते हैं।`
        : `Converted ₹${swapAmount.toLocaleString('en-IN')} to ${finalGpAmount.toLocaleString('en-IN')} GP (@ ₹1 = ${gpRate} GP). Remaining Cash: ${formatINR(updatedWallet.cashBalance)}.`
    );
  };

  const handleWithdrawSuccess = (
    amount: number,
    destination: string,
    referenceId: string,
    withdrawalSource: WithdrawalSource = 'EARNING',
    voucherDetails?: Partial<Transaction>
  ) => {
    // Rule 1, 2, 3: Deduct only from the selected source (totalEarned or royaltyEarned)
    const isRoyalty = withdrawalSource === 'ROYALTY';
    const updatedWallet: Wallet = {
      ...wallet,
      totalEarned: !isRoyalty ? Math.max(0, (wallet.totalEarned || 0) - amount) : wallet.totalEarned,
      royaltyEarned: isRoyalty ? Math.max(0, (wallet.royaltyEarned || 0) - amount) : (wallet.royaltyEarned || 0),
    };

    const tdsPercent = voucherDetails?.tdsPercent ?? rules?.tdsPercent ?? 5.0;
    const adminFeePercent = voucherDetails?.adminFeePercent ?? rules?.adminFeePercent ?? 0.02;
    const grossAmount = voucherDetails?.grossAmount ?? amount;
    const tdsAmount = voucherDetails?.tdsAmount ?? Math.round(((grossAmount * tdsPercent) / 100) * 100) / 100;
    const adminFeeAmount = voucherDetails?.adminFeeAmount ?? Math.round(((grossAmount * adminFeePercent) / 100) * 100) / 100;
    const netAmount = voucherDetails?.netAmount ?? Math.max(0, grossAmount - tdsAmount - adminFeeAmount);

    const newTx: Transaction = {
      id: `txn-${Date.now()}`,
      userId: currentUser?.id,
      userLoginId: currentUser?.loginId,
      userName: currentUser?.name || 'Investor User',
      userPhone: currentUser?.phone || '',
      type: 'WITHDRAWAL',
      amount: netAmount,
      grossAmount,
      tdsPercent,
      tdsAmount,
      adminFeePercent,
      adminFeeAmount,
      netAmount,
      date: new Date().toISOString(),
      timestamp: Date.now(),
      status: 'SUCCESS',
      method: destination,
      referenceId,
      withdrawalSource,
      destinationDetails: destination,
      panNumber: 'ABCDE1234F',
      note: isRoyalty
        ? `Royalty Withdrawal (Net: ${formatINR(netAmount)}, TDS: -${formatINR(tdsAmount)}, Admin: -${formatINR(adminFeeAmount)})`
        : `Earning Withdrawal (Net: ${formatINR(netAmount)}, TDS: -${formatINR(tdsAmount)}, Admin: -${formatINR(adminFeeAmount)})`,
      noteHi: isRoyalty
        ? `रॉयल्टी निकासी (शुद्ध: ${formatINR(netAmount)}, TDS: -${formatINR(tdsAmount)}, एडमिन: -${formatINR(adminFeeAmount)})`
        : `अर्निंग निकासी (शुद्ध: ${formatINR(netAmount)}, TDS: -${formatINR(tdsAmount)}, एडमिन: -${formatINR(adminFeeAmount)})`,
    };

    // Deduct from Company Treasury and update audit log
    const payoutResult = deductForUserPayout(
      amount,
      isRoyalty
        ? `User Royalty Withdrawal: ₹${amount.toLocaleString('en-IN')} -> ${destination} (Ref: ${referenceId})`
        : `User Earning Withdrawal: ₹${amount.toLocaleString('en-IN')} -> ${destination} (Ref: ${referenceId})`,
      isRoyalty
        ? `यूज़र रॉयल्टी निकासी: ₹${amount.toLocaleString('en-IN')} -> ${destination} (Ref: ${referenceId})`
        : `यूज़र अर्निंग निकासी: ₹${amount.toLocaleString('en-IN')} -> ${destination} (Ref: ${referenceId})`,
      currentUser?.name || 'Investor User'
    );
    setTreasury(payoutResult.treasury);
    setTreasuryLogs(getStoredTreasuryLogs());
    apiUpdateTreasury(payoutResult.treasury).catch(console.error);

    setWallet(updatedWallet);
    setStoredWallet(updatedWallet);
    const updatedTxns = [newTx, ...transactions];
    setTransactions(updatedTxns);
    setStoredTransactions(updatedTxns);

    if (currentUser?.id) {
      apiCreateTransaction(newTx, currentUser.id).catch(console.error);
      apiUpdateWallet(updatedWallet, currentUser.id).catch(console.error);
    }

    // Trigger Personalized Audio Voice Announcement
    audioAnnouncer.announceWithdrawal({
      userName: currentUser?.name || 'Investor',
      amount: netAmount,
      method: destination,
      language: isHi ? 'hi' : 'en',
    });

    // Trigger Payment Voucher view
    setSelectedVoucherTxn(newTx);
    setIsVoucherModalOpen(true);

    showToast(
      isHi ? '🧾 निकासी भुगतान वाउचर जारी!' : '🧾 Payment Voucher Generated!',
      isHi
        ? `TDS (${tdsPercent}%) एवं एडमिन चार्ज (${adminFeePercent}%) काटकर ${formatINR(netAmount)} का वाउचर जारी हुआ। आप इसे प्रिंट भी कर सकते हैं।`
        : `Net ${formatINR(netAmount)} disbursed after TDS (${tdsPercent}%) & Admin charge (${adminFeePercent}%). Voucher issued.`
    );
  };

  const handleInvestSuccess = (plan: InvestmentPlan, amount: number, autoSwappedCash: number = 0) => {
    // 1. Deduct amount from Company's Main Balance and transfer to user's allocated plan
    const result = deductForUserInvestment(
      amount,
      plan.name,
      currentUser?.name || 'Investor User'
    );
    const updatedTreasury = result.treasury;
    setTreasury(updatedTreasury);
    if (result.log) {
      setTreasuryLogs((prev) => [result.log!, ...prev]);
    }
    apiUpdateTreasury(updatedTreasury, result.log).catch(console.error);

    const dailyReturn = (amount * plan.dailyRoiPercent) / 100;
    const totalExpected = dailyReturn * plan.durationDays;

    let newCashBalance = wallet.cashBalance;
    let newGpBalance = wallet.gpBalance || 0;
    const newTxns: Transaction[] = [];

    // If auto-swap was needed from cash to GP
    if (autoSwappedCash > 0) {
      newCashBalance -= autoSwappedCash;
      newGpBalance += autoSwappedCash;
      newTxns.push({
        id: `txn-swap-${Date.now()}`,
        userId: currentUser?.id,
        userLoginId: currentUser?.loginId,
        userName: currentUser?.name || 'Investor User',
        userPhone: currentUser?.phone || '',
        type: 'SWAP_GP',
        amount: autoSwappedCash,
        date: new Date().toISOString(),
        timestamp: Date.now(),
        status: 'SUCCESS',
        method: 'Instant Auto-Swap',
        referenceId: 'GP' + Math.floor(10000000 + Math.random() * 90000000),
        note: `Instant auto-swapped ₹${autoSwappedCash} to GP for plan activation`,
        noteHi: `प्लान खरीद हेतु ₹${autoSwappedCash} तुरंत GP में स्वैप किया`,
      });
    }

    // Deduct GP for plan purchase (Rule 3)
    newGpBalance = Math.max(0, newGpBalance - amount);

    const updatedWallet: Wallet = {
      ...wallet,
      cashBalance: newCashBalance,
      gpBalance: newGpBalance,
      totalInvested: wallet.totalInvested + amount,
    };

    const now = Date.now();
    const lockedUntil = now + 24 * 3600 * 1000;
    const cycleReturn = (amount * (plan.dailyRoiPercent / 4)) / 100;

    const uniqueCode = plan.id === 'long-term' 
      ? `LTP-365D-${Math.floor(10000 + Math.random() * 90000)}`
      : `STP-641D-${Math.floor(10000 + Math.random() * 90000)}`;

    const newInvestment: ActiveInvestment = {
      id: `inv-${now}`,
      userId: currentUser?.id,
      userLoginId: currentUser?.loginId,
      planUniqueId: uniqueCode,
      planId: plan.id,
      planName: isHi ? plan.nameHi : plan.name,
      investedAmount: amount,
      dailyRoiPercent: plan.dailyRoiPercent,
      dailyReturnAmount: dailyReturn,
      totalExpectedReturn: totalExpected,
      earnedSoFar: 0,
      claimedSoFar: 0,
      unclaimedEarnings: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(now + plan.durationDays * 86400000).toISOString().split('T')[0],
      durationDays: plan.durationDays,
      daysCompleted: 0,
      lastPayoutTimestamp: now,
      status: 'ACTIVE',
      autoReinvest: false,
      activationTimestamp: now,
      lockedUntilTimestamp: lockedUntil,
      isInitialLockCompleted: false,
      lockCongratulationsShown: false,
      cycleDurationHours: 6,
      currentCycleStartTimestamp: lockedUntil,
      currentCycleEndTimestamp: lockedUntil + 6 * 3600 * 1000,
      completedCyclesCount: 0,
      cycleReturnAmount: cycleReturn,
      royaltyStage: plan.id === 'long-term' ? '365D_INITIAL' : undefined,
      certificateType: plan.id === 'long-term' ? 'LTP_365D' : 'STP_641D',
    };

    const newTx: Transaction = {
      id: `txn-${now}`,
      userId: currentUser?.id,
      userLoginId: currentUser?.loginId,
      userName: currentUser?.name || 'Investor User',
      userPhone: currentUser?.phone || '',
      type: 'INVEST',
      amount,
      date: new Date().toISOString(),
      timestamp: now,
      status: 'SUCCESS',
      referenceId: 'INV' + Math.floor(10000000 + Math.random() * 90000000),
      note: `Allocated ${amount} GP to ${plan.name} (${plan.durationDays} Days, 24h Lock + 6h Cycles)`,
      noteHi: `${amount} GP से ${plan.nameHi} (${plan.durationDays} दिन, 24h लॉक + 6h चक्र) में निवेश आवंटित`,
    };

     newTxns.push(newTx);

     setWallet(updatedWallet);
    setInvestments([newInvestment, ...investments]);
    setTransactions([...newTxns, ...transactions]);

    if (currentUser?.id) {
      apiCreateInvestment(newInvestment, currentUser.id).catch(console.error);
      newTxns.forEach((tx) => apiCreateTransaction(tx, currentUser.id).catch(console.error));
      apiUpdateWallet(updatedWallet, currentUser.id).catch(console.error);
    }

    // Trigger Personalized Audio Voice Announcement
    audioAnnouncer.announceInvestment({
      userName: currentUser?.name || 'Investor',
      planName: isHi ? plan.nameHi : plan.name,
      amount: amount,
      language: isHi ? 'hi' : 'en',
    });

    showToast(
      isHi ? '⭐ निवेश सक्रिय (24 घंटे का लॉक शुरू)!' : '⭐ Investment Activated (24h Lock Started)!',
      isHi
        ? `${amount.toLocaleString('en-IN')} GP से ${plan.nameHi} सक्रिय हुआ। पहले 24 घंटे का लॉक टाइमर शुरू हुआ, जिसके बाद हर 6 घंटे में +${formatINR(cycleReturn)} स्वतः Total Earning में जमा होंगे।`
        : `Allocated ${amount.toLocaleString('en-IN')} GP to ${plan.name}. Initial 24h lock timer started, followed by +${formatINR(cycleReturn)} automatically added to Total Earning every 6 hours.`
    );

    // CRITICAL USER REQUIREMENT:
    // "Balane jaise hi 500000 ho jay to admin ko alert diya jay main balance barane ka"
    if (updatedTreasury.balance <= DEFAULT_ALERT_THRESHOLD) {
      setTimeout(() => {
        showToast(
          isHi
            ? '🚨 एडमिन चेतावनी: कंपनी मुख्य बैलेंस कम (≤ ₹5,00,000)!'
            : '🚨 Admin Alert: Company Treasury Low (<= ₹500,000)!',
          isHi
            ? `कंपनी का मुख्य बैलेंस घटकर ₹${updatedTreasury.balance.toLocaleString('en-IN')} रह गया है। कृपया तुरंत मुख्य बैलेंस बढ़ाएं!`
            : `Company reserve balance has dropped to ₹${updatedTreasury.balance.toLocaleString('en-IN')}! Please replenish the main balance immediately!`,
          'info'
        );
      }, 1500);
    }
  };

  const handleOpenInvest = (plan: InvestmentPlan, prefilledAmount?: number) => {
    setSelectedPlan(plan);
    if (prefilledAmount) {
      setInitialInvestAmount(prefilledAmount);
    } else {
      setInitialInvestAmount(plan.minAmount);
    }
    setIsInvestOpen(true);
  };

  const handleClaimSingleReturn = (investmentId: string) => {
    const inv = investments.find((i) => i.id === investmentId);
    if (!inv || inv.unclaimedEarnings <= 0) return;

    const claimAmt = inv.unclaimedEarnings;

    const updatedInvestments = investments.map((i) => {
      if (i.id === investmentId) {
        return {
          ...i,
          claimedSoFar: i.claimedSoFar + claimAmt,
          unclaimedEarnings: 0,
        };
      }
      return i;
    });

    const updatedWallet: Wallet = {
      ...wallet,
      cashBalance: wallet.cashBalance + claimAmt,
    };

    const newTx: Transaction = {
      id: `txn-${Date.now()}`,
      userId: currentUser?.id,
      userLoginId: currentUser?.loginId,
      userName: currentUser?.name || 'Investor User',
      userPhone: currentUser?.phone || '',
      type: 'RETURN_PAYOUT',
      amount: claimAmt,
      date: new Date().toISOString(),
      timestamp: Date.now(),
      status: 'SUCCESS',
      referenceId: 'RET' + Math.floor(10000000 + Math.random() * 90000000),
      note: `Daily return claimed for ${inv.planName}`,
      noteHi: `${inv.planName} का दैनिक रिटर्न वॉलेट में जोड़ा गया`,
    };

    setInvestments(updatedInvestments);
    setWallet(updatedWallet);
    setTransactions([newTx, ...transactions]);

    if (currentUser?.id) {
      apiUpdateWallet(updatedWallet, currentUser.id).catch(console.error);
      apiCreateTransaction(newTx, currentUser.id).catch(console.error);
      const updatedInv = updatedInvestments.find((i) => i.id === investmentId);
      if (updatedInv) {
        apiUpdateInvestment(updatedInv, currentUser.id).catch(console.error);
      }
    }

    confetti({ particleCount: 50, spread: 60 });
    showToast(
      isHi ? 'रिटर्न वॉलेट में जोड़ा गया!' : 'Return Claimed!',
      isHi
        ? `+${formatINR(claimAmt)} आपके उपलब्ध कैश बैलेंस में ट्रांसफर कर दिए गए हैं।`
        : `+${formatINR(claimAmt)} has been transferred to your available balance.`
    );
  };

  const handleClaimAllReturns = () => {
    if (unclaimedReturnsTotal <= 0) return;

    const claimTotal = unclaimedReturnsTotal;
    const updatedInvestments = investments.map((i) => ({
      ...i,
      claimedSoFar: i.claimedSoFar + i.unclaimedEarnings,
      unclaimedEarnings: 0,
    }));

    const updatedWallet: Wallet = {
      ...wallet,
      cashBalance: wallet.cashBalance + claimTotal,
    };

    const newTx: Transaction = {
      id: `txn-${Date.now()}`,
      userId: currentUser?.id,
      userLoginId: currentUser?.loginId,
      userName: currentUser?.name || 'Investor User',
      userPhone: currentUser?.phone || '',
      type: 'RETURN_PAYOUT',
      amount: claimTotal,
      date: new Date().toISOString(),
      timestamp: Date.now(),
      status: 'SUCCESS',
      referenceId: 'RET' + Math.floor(10000000 + Math.random() * 90000000),
      note: `All accrued daily returns claimed (${formatINR(claimTotal)})`,
      noteHi: `सभी संचित दैनिक रिटर्न वॉलेट में क्रेडिट किए गए (${formatINR(claimTotal)})`,
    };

    setInvestments(updatedInvestments);
    setWallet(updatedWallet);
    setTransactions([newTx, ...transactions]);

    if (currentUser?.id) {
      apiUpdateWallet(updatedWallet, currentUser.id).catch(console.error);
      apiCreateTransaction(newTx, currentUser.id).catch(console.error);
      updatedInvestments.forEach((inv) => apiUpdateInvestment(inv, currentUser.id).catch(console.error));
    }

    confetti({ particleCount: 70, spread: 70 });
    showToast(
      isHi ? 'सभी रिटर्न सफलतापूर्वक प्राप्त!' : 'All Returns Claimed!',
      isHi
        ? `+${formatINR(claimTotal)} आपके वॉलेट में जोड़ दिए गए हैं।`
        : `+${formatINR(claimTotal)} credited to your wallet.`
    );
  };

  // Simulate 1 Day Progress / Return Payout
  const handleSimulateDay = () => {
    setIsSimulating(true);

    setTimeout(() => {
      let totalDailyYieldAdded = 0;
      let capitalReturnedTotal = 0;
      const newTransactions: Transaction[] = [];

      const updatedInvestments = investments.map((inv) => {
        if (inv.status !== 'ACTIVE') return inv;

        const nextDay = inv.daysCompleted + 1;
        const dailyYield = inv.dailyReturnAmount;
        totalDailyYieldAdded += dailyYield;

        const newEarned = inv.earnedSoFar + dailyYield;
        const newUnclaimed = inv.unclaimedEarnings + dailyYield;

        const isNowCompleted = nextDay >= inv.durationDays;

        if (isNowCompleted) {
          capitalReturnedTotal += inv.investedAmount;
          newTransactions.push({
            id: `txn-cap-${Date.now()}-${inv.id}`,
            type: 'CAPITAL_RETURN',
            amount: inv.investedAmount,
            date: new Date().toISOString(),
            timestamp: Date.now(),
            status: 'SUCCESS',
            referenceId: 'CAP' + Math.floor(10000000 + Math.random() * 90000000),
            note: `Maturity Capital returned for ${inv.planName}`,
            noteHi: `${inv.planName} की परिपक्वता पर मूलधन वापस हुआ`,
          });
        }

        return {
          ...inv,
          daysCompleted: nextDay,
          earnedSoFar: newEarned,
          unclaimedEarnings: newUnclaimed,
          status: isNowCompleted ? ('COMPLETED' as const) : ('ACTIVE' as const),
        };
      });

      if (totalDailyYieldAdded > 0) {
        newTransactions.push({
          id: `txn-sim-${Date.now()}`,
          type: 'RETURN_PAYOUT',
          amount: totalDailyYieldAdded,
          date: new Date().toISOString(),
          timestamp: Date.now(),
          status: 'SUCCESS',
          referenceId: 'SIM' + Math.floor(10000000 + Math.random() * 90000000),
          note: `Day 24-hr cycle: +${formatINR(totalDailyYieldAdded)} return accrued`,
          noteHi: `24-घंटे का रिटर्न चक्र: +${formatINR(totalDailyYieldAdded)} संचित हुआ`,
        });
      }

      const updatedWallet: Wallet = {
        ...wallet,
        cashBalance: wallet.cashBalance + capitalReturnedTotal,
        totalInvested: Math.max(0, wallet.totalInvested - capitalReturnedTotal),
        totalEarned: wallet.totalEarned + totalDailyYieldAdded,
      };

      setInvestments(updatedInvestments);
      setWallet(updatedWallet);
      if (newTransactions.length > 0) {
        setTransactions([...newTransactions, ...transactions]);
      }

      setIsSimulating(false);

      confetti({ particleCount: 60, spread: 70, origin: { y: 0.5 } });

      if (capitalReturnedTotal > 0) {
        showToast(
          isHi ? 'योजना परिपक्व! मूलधन + रिटर्न प्राप्त' : 'Plan Matured! Capital & Yield Paid',
          isHi
            ? `+${formatINR(totalDailyYieldAdded)} दैनिक रिटर्न एवं मूलधन ${formatINR(capitalReturnedTotal)} वापस मिला!`
            : `+${formatINR(totalDailyYieldAdded)} daily yield & principal ${formatINR(capitalReturnedTotal)} returned!`
        );
      } else {
        showToast(
          isHi ? 'दैनिक रिटर्न सफलतापूर्वक संचित हुआ!' : 'Daily Returns Accrued!',
          isHi
            ? `सक्रिय योजनाओं से +${formatINR(totalDailyYieldAdded)} का दैनिक लाभ तैयार है।`
            : `Accrued +${formatINR(totalDailyYieldAdded)} daily return across active plans.`
        );
      }
    }, 600);
  };

  const handleResetData = async () => {
    if (
      window.confirm(
        isHi
          ? 'क्या आप एडमिन बैलेंस ₹6,00,000 रखकर बाकी सभी पुराने लेन-देन और निवेश डेटा को बिल्कुल ज़ीरो (फ्रेश) करना चाहते हैं?'
          : 'Are you sure you want to reset all transaction and investment records to fresh state while keeping Admin balance at ₹600,000?'
      )
    ) {
      const freshWallet: Wallet = {
        cashBalance: 0,
        gpBalance: 0,
        totalInvested: 0,
        totalEarned: 0,
        royaltyEarned: 0,
        pendingWithdrawals: 0,
        pendingDeposits: 0,
      };

      const freshTreasury: CompanyTreasury = {
        balance: 600000,
        minAlertThreshold: 500000,
        totalInjected: 600000,
        totalDeducted: 0,
        totalTransferredToUsers: 0,
        lastUpdated: new Date().toISOString(),
      };

      const freshLogs: TreasuryLog[] = [
        {
          id: 'tr-log-1',
          type: 'ADMIN_ADD',
          amount: 600000,
          balanceBefore: 0,
          balanceAfter: 600000,
          date: new Date().toISOString(),
          timestamp: Date.now(),
          reason: 'Initial Company Liquidity Injection into Main Reserve',
          reasonHi: 'कंपनी के मुख्य रिज़र्व में प्रारंभ में ₹6,00,000 फंड जोड़ा गया',
          actor: 'Super Admin (admin)',
          referenceId: 'INJ-600000',
        },
      ];

      setTransactions([]);
      setInvestments([]);
      setWallet(freshWallet);
      setTreasury(freshTreasury);
      setTreasuryLogs(freshLogs);

      setStoredTransactions([]);
      setStoredInvestments([]);
      setStoredWallet(freshWallet);
      setStoredTreasury(freshTreasury);
      setStoredTreasuryLogs(freshLogs);

      try {
        await apiFetch('/api/admin/reset-fresh', { method: 'POST' });
      } catch (err) {
        console.warn('Backend reset call failed, local state reset successfully:', err);
      }

      showToast(
        isHi ? '✨ डेटा पूर्णतः फ्रेश हुआ!' : '✨ Data Reset Successful!',
        isHi
          ? 'कंपनी एडमिन बैलेंस ₹6,00,000 सुरक्षित है। सभी पुराने लेन-देन और निवेश रिकॉर्ड्स ज़ीरो (फ्रेश) कर दिए गए हैं।'
          : 'Admin balance retained at ₹6,00,000. All past transactions and investments have been cleared.'
      );
    }
  };

  const handleSaveRules = (updatedRules: AppRules) => {
    setRules(updatedRules);
    saveStoredRules(updatedRules);

    // Sync bank details to company profile
    try {
      const profile = getStoredCompanyProfile();
      const updatedProfile = {
        ...profile,
        bankName: updatedRules.companyBankName || profile.bankName,
        bankAccountNumber: updatedRules.companyBankAccountNumber || profile.bankAccountNumber,
        bankIfsc: updatedRules.companyBankIfsc || profile.bankIfsc,
        companyName: updatedRules.companyBankAccountHolder || profile.companyName,
      };
      saveStoredCompanyProfile(updatedProfile);
    } catch (e) {
      console.error('Failed to sync company profile:', e);
    }

    showToast(
      isHi ? 'नियम व शर्तें अपडेट हुईं' : 'Rules Updated',
      isHi
        ? 'आपके द्वारा निर्धारित नए नियम, बैंक विवरण और सीमाएं पूरी ऐप में तुरंत लागू हो चुकी हैं।'
        : 'Your updated regulations, bank details and limits are now active across GCap.'
    );
  };

  const handleResetRules = () => {
    const def = resetRulesToDefault();
    setRules(def);
    showToast(
      isHi ? 'डिफ़ॉल्ट नियम बहाल' : 'Rules Reset to Default',
      isHi ? 'नियम डिफ़ॉल्ट सेटिंग्स पर रीसेट हो चुके हैं।' : 'Default parameters restored.'
    );
  };

  // =========================================================================
  // 24-HOUR LOCK & 6-HOUR EARNING CYCLE ENGINE
  // User Requirements:
  // 1. Both plans locked for first 24 hours with decreasing countdown clock.
  // 2. When 24 hours finish: show congratulations modal & start 6-hour decreasing timer.
  // 3. When 6 hours complete: add earning amount to Total Earning & restart 6h timer.
  // 4. Complete records available to both user and admin panels.
  // =========================================================================
  useEffect(() => {
    const cycleInterval = setInterval(() => {
      const now = Date.now();
      let hasChanges = false;
      let totalCycleEarningsToAdd = 0;
      const newTransactions: Transaction[] = [];

      const updated = investments.map((inv) => {
        if (inv.status !== 'ACTIVE') return inv;

        // Phase 1: 24h Lock Expiry Check
        if (!inv.isInitialLockCompleted && now >= (inv.lockedUntilTimestamp || 0)) {
          hasChanges = true;
          const cycleDurationMs = (inv.cycleDurationHours || 6) * 3600 * 1000;
          const currentStart = now;
          const currentEnd = now + cycleDurationMs;

          // Trigger Congratulations Modal if not already shown
          if (!inv.lockCongratulationsShown) {
            setCongratulationsInvestment({
              ...inv,
              isInitialLockCompleted: true,
              currentCycleStartTimestamp: currentStart,
              currentCycleEndTimestamp: currentEnd,
            });
            confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
          }

          return {
            ...inv,
            isInitialLockCompleted: true,
            lockCongratulationsShown: true,
            currentCycleStartTimestamp: currentStart,
            currentCycleEndTimestamp: currentEnd,
          };
        }

        // Phase 2: 6-Hour Cycle Completion Check
        if (inv.isInitialLockCompleted && now >= (inv.currentCycleEndTimestamp || 0)) {
          hasChanges = true;
          const cycleDurationMs = (inv.cycleDurationHours || 6) * 3600 * 1000;
          const cyclePayout = inv.cycleReturnAmount || (inv.dailyReturnAmount / 4);
          const nextCycleNum = (inv.completedCyclesCount || 0) + 1;

          totalCycleEarningsToAdd += cyclePayout;

          newTransactions.push({
            id: `txn-cyc-${Date.now()}-${inv.id}`,
            type: 'RETURN_PAYOUT',
            amount: cyclePayout,
            date: new Date().toISOString(),
            timestamp: now,
            status: 'SUCCESS',
            referenceId: 'CYC' + Math.floor(10000000 + Math.random() * 90000000),
            note: `6-Hour Cycle #${nextCycleNum} return of ₹${cyclePayout} credited to Total Earning (${inv.planName})`,
            noteHi: `6 घंटे के चक्र #${nextCycleNum} का रिटर्न ₹${cyclePayout} स्वतः कुल अर्निंग (Total Earning) में जमा हुआ (${inv.planName})`,
          });

          return {
            ...inv,
            completedCyclesCount: nextCycleNum,
            earnedSoFar: (inv.earnedSoFar || 0) + cyclePayout,
            currentCycleStartTimestamp: now,
            currentCycleEndTimestamp: now + cycleDurationMs, // restarts 6h timer!
          };
        }

        return inv;
      });

      if (hasChanges) {
        setInvestments(updated);
        if (totalCycleEarningsToAdd > 0) {
          setWallet((prev) => ({
            ...prev,
            totalEarned: (prev.totalEarned || 0) + totalCycleEarningsToAdd,
          }));

          // Credit Team Earning Referral Bonus (Level 1 & Level 2 based on earning, not invest amount)
          if (rules.isReferralEnabled !== false && currentUser) {
            const allUsers = getAllUsers();
            const l1SponsorCode = currentUser.referredBy?.trim().toUpperCase();
            if (l1SponsorCode) {
              const l1User = allUsers.find(u => u.referralCode?.toUpperCase() === l1SponsorCode || u.loginId.toUpperCase() === l1SponsorCode);
              if (l1User && l1User.id !== currentUser.id && rules.referralL1Percent > 0) {
                const l1Bonus = Math.round(((totalCycleEarningsToAdd * rules.referralL1Percent) / 100) * 100) / 100;
                if (l1Bonus > 0) {
                  newTransactions.push({
                    id: `txn-ref-l1-${Date.now()}`,
                    userId: l1User.id,
                    userLoginId: l1User.loginId,
                    userName: l1User.name,
                    userPhone: l1User.phone,
                    type: 'REFERRAL_BONUS',
                    amount: l1Bonus,
                    date: new Date().toISOString(),
                    timestamp: now,
                    status: 'SUCCESS',
                    referenceId: 'REF' + Math.floor(10000000 + Math.random() * 90000000),
                    note: `Level 1 Team Earning Bonus (${rules.referralL1Percent}%) from ${currentUser.name}`,
                    noteHi: `टीम सदस्य ${currentUser.name} की अर्निंग पर लेवल 1 रेफरल बोनस (${rules.referralL1Percent}%) मिला`,
                  });
                }

                const l2SponsorCode = l1User.referredBy?.trim().toUpperCase();
                if (l2SponsorCode) {
                  const l2User = allUsers.find(u => u.referralCode?.toUpperCase() === l2SponsorCode || u.loginId.toUpperCase() === l2SponsorCode);
                  if (l2User && l2User.id !== currentUser.id && l2User.id !== l1User.id && rules.referralL2Percent > 0) {
                    const l2Bonus = Math.round(((totalCycleEarningsToAdd * rules.referralL2Percent) / 100) * 100) / 100;
                    if (l2Bonus > 0) {
                      newTransactions.push({
                        id: `txn-ref-l2-${Date.now()}`,
                        userId: l2User.id,
                        userLoginId: l2User.loginId,
                        userName: l2User.name,
                        userPhone: l2User.phone,
                        type: 'REFERRAL_BONUS',
                        amount: l2Bonus,
                        date: new Date().toISOString(),
                        timestamp: now,
                        status: 'SUCCESS',
                        referenceId: 'REF' + Math.floor(10000000 + Math.random() * 90000000),
                        note: `Level 2 Team Earning Bonus (${rules.referralL2Percent}%) from ${currentUser.name}`,
                        noteHi: `टीम सदस्य ${currentUser.name} की अर्निंग पर लेवल 2 रेफरल बोनस (${rules.referralL2Percent}%) मिला`,
                      });
                    }
                  }
                }
              }
            }
          }

          setTransactions((prev) => [...newTransactions, ...prev]);
          showToast(
            isHi ? '💰 6 घंटे की अर्निंग जमा हुई!' : '💰 6-Hour Earning Auto-Credited!',
            isHi
              ? `+${formatINR(totalCycleEarningsToAdd)} स्वतः आपकी 'Total Earning' में जमा हो गए हैं और अगला 6 घंटे का टाइमर शुरू हो गया है।`
              : `+${formatINR(totalCycleEarningsToAdd)} automatically credited to Total Earning. Next 6h cycle countdown restarted.`
          );
        }
      }
    }, 2000);

    return () => clearInterval(cycleInterval);
  }, [investments, isHi]);

  // Fast-Forward / Simulation Handlers for 24h Lock and 6h Cycle
  const handleSimulateComplete24hLock = (investmentId: string) => {
    const inv = investments.find((i) => i.id === investmentId);
    if (!inv) return;
    const now = Date.now();
    const cycleDurationMs = (inv.cycleDurationHours || 6) * 3600 * 1000;
    const currentStart = now;
    const currentEnd = now + cycleDurationMs;

    const updated = investments.map((i) => {
      if (i.id === investmentId) {
        return {
          ...i,
          lockedUntilTimestamp: now - 1000,
          isInitialLockCompleted: true,
          lockCongratulationsShown: true,
          currentCycleStartTimestamp: currentStart,
          currentCycleEndTimestamp: currentEnd,
        };
      }
      return i;
    });

    setInvestments(updated);
    setCongratulationsInvestment({
      ...inv,
      isInitialLockCompleted: true,
      currentCycleStartTimestamp: currentStart,
      currentCycleEndTimestamp: currentEnd,
    });
    confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
    showToast(
      isHi ? '🎉 24 घंटे का लॉक समाप्त!' : '🎉 24-Hour Lock Completed!',
      isHi
        ? 'प्रारंभिक लॉक पूर्ण हुआ! बधाई संदेश प्रदर्शित और 6 घंटे का अर्निंग टाइमर सक्रिय।'
        : 'Initial lock completed! Congratulations shown and 6h earning cycle countdown is active.'
    );
  };

  const handleSimulateComplete6hCycle = (investmentId: string) => {
    const inv = investments.find((i) => i.id === investmentId);
    if (!inv) return;
    const now = Date.now();
    const cyclePayout = inv.cycleReturnAmount || (inv.dailyReturnAmount / 4);
    const nextCycleNum = (inv.completedCyclesCount || 0) + 1;
    const cycleDurationMs = (inv.cycleDurationHours || 6) * 3600 * 1000;

    const cycleTx: Transaction = {
      id: `txn-sim-cyc-${Date.now()}`,
      type: 'RETURN_PAYOUT',
      amount: cyclePayout,
      date: new Date().toISOString(),
      timestamp: now,
      status: 'SUCCESS',
      referenceId: 'CYC' + Math.floor(10000000 + Math.random() * 90000000),
      note: `6-Hour Cycle #${nextCycleNum} return of ₹${cyclePayout} credited to Total Earning (${inv.planName})`,
      noteHi: `6 घंटे के चक्र #${nextCycleNum} का रिटर्न ₹${cyclePayout} स्वतः कुल अर्निंग (Total Earning) में जमा हुआ (${inv.planName})`,
    };

    const updated = investments.map((i) => {
      if (i.id === investmentId) {
        return {
          ...i,
          isInitialLockCompleted: true,
          completedCyclesCount: nextCycleNum,
          earnedSoFar: (i.earnedSoFar || 0) + cyclePayout,
          currentCycleStartTimestamp: now,
          currentCycleEndTimestamp: now + cycleDurationMs, // timer restarts!
        };
      }
      return i;
    });

    setInvestments(updated);
    setWallet((prev) => ({
      ...prev,
      totalEarned: (prev.totalEarned || 0) + cyclePayout,
    }));
    setTransactions((prev) => [cycleTx, ...prev]);

    confetti({ particleCount: 60, spread: 70, origin: { y: 0.5 } });
    showToast(
      isHi ? '💰 6 घंटे की अर्निंग जमा हुई!' : '💰 6-Hour Earning Credited!',
      isHi
        ? `+${formatINR(cyclePayout)} सीधे आपकी "Total Earning" में जुड़ गए हैं और अगला 6 घंटे का टाइमर पुनः चालू हो गया है।`
        : `+${formatINR(cyclePayout)} credited directly into Total Earning and 6h timer restarted.`
    );
  };

  // Fast-Forward to 641-Day Maturity (Req #9)
  const handleSimulateMaturity641Days = (investmentId: string) => {
    const updated = investments.map((inv) => {
      if (inv.id === investmentId) {
        return {
          ...inv,
          daysCompleted: inv.durationDays || 641,
          isMatured: true,
          isInitialLockCompleted: true,
        };
      }
      return inv;
    });

    setInvestments(updated);
    confetti({ particleCount: 100, spread: 90, origin: { y: 0.5 } });
    showToast(
      isHi ? '🎉 641 दिन की परिपक्वता पूर्ण हुई!' : '🎉 641 Days Maturity Reached!',
      isHi
        ? 'प्लान 641 दिन पूरे कर चुका है। अब आप उसी ID से रिन्यू कर सकते हैं अथवा पूरा मूलधन व अर्निंग निकालकर प्रमाणपत्र प्राप्त कर सकते हैं।'
        : '641 days completed! You can now renew under the same Plan ID or withdraw principal + earnings with official certificate.'
    );
  };

  // Option 1: Renew Plan (Req #9)
  const handleRenewPlan = (investmentId: string) => {
    const inv = investments.find((i) => i.id === investmentId);
    if (!inv) return;

    const now = Date.now();
    const lockedUntil = now + 24 * 3600 * 1000;
    const cycleDurationMs = 6 * 3600 * 1000;

    const updated = investments.map((i) => {
      if (i.id === investmentId) {
        return {
          ...i,
          daysCompleted: 0,
          isMatured: false,
          renewedCount: (i.renewedCount || 0) + 1,
          activationTimestamp: now,
          lockedUntilTimestamp: lockedUntil,
          isInitialLockCompleted: false,
          lockCongratulationsShown: false,
          currentCycleStartTimestamp: lockedUntil,
          currentCycleEndTimestamp: lockedUntil + cycleDurationMs,
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(now + (i.durationDays || 641) * 86400000).toISOString().split('T')[0],
        };
      }
      return i;
    });

    setInvestments(updated);

    const renewTx: Transaction = {
      id: `txn-renew-${now}`,
      type: 'INVEST',
      amount: inv.investedAmount,
      date: new Date().toISOString(),
      timestamp: now,
      status: 'SUCCESS',
      referenceId: 'RNW' + Math.floor(10000000 + Math.random() * 90000000),
      note: `Plan ${inv.planUniqueId || inv.id} renewed for another ${inv.durationDays || 641} days (Term #${(inv.renewedCount || 0) + 2})`,
      noteHi: `प्लान ID ${inv.planUniqueId || inv.id} को पुनः ${inv.durationDays || 641} दिनों के लिए रिन्यू किया गया`,
    };

    setTransactions((prev) => [renewTx, ...prev]);

    confetti({ particleCount: 90, spread: 80 });
    showToast(
      isHi ? '🔄 प्लान सफलतापूर्वक रिन्यू हुआ!' : '🔄 Plan Successfully Renewed!',
      isHi
        ? `यूनिक प्लान ID (${inv.planUniqueId || inv.id}) के तहत ${inv.durationDays || 641} दिनों का नया कार्यकाल प्रारंभ हो गया है।`
        : `Plan ID (${inv.planUniqueId || inv.id}) has been renewed for another term.`
    );
  };

  // Option 2: Claim Principal & Rest Earning + Close Plan + Certificate (Req #9)
  const handleClaimMaturityClose = (investmentId: string) => {
    const inv = investments.find((i) => i.id === investmentId);
    if (!inv) return;

    const totalEarned = inv.earnedSoFar || 0;
    const totalWithdrawn = inv.totalWithdrawn || 0;
    const remainingEarnings = Math.max(0, totalEarned - totalWithdrawn);
    const totalPayoutAmount = inv.investedAmount + remainingEarnings;

    const certNum = `GCAP-CERT-641-${Math.floor(100000 + Math.random() * 900000)}`;

    const updatedInv: ActiveInvestment = {
      ...inv,
      status: 'COMPLETED',
      isMatured: true,
      certificateIssued: true,
      certificateNumber: certNum,
      claimedSoFar: inv.claimedSoFar + remainingEarnings,
      unclaimedEarnings: 0,
    };

    const updatedInvestments = investments.map((i) => (i.id === investmentId ? updatedInv : i));

    const updatedWallet: Wallet = {
      ...wallet,
      cashBalance: wallet.cashBalance + totalPayoutAmount,
      totalInvested: Math.max(0, wallet.totalInvested - inv.investedAmount),
    };

    const now = Date.now();
    const payoutTx: Transaction = {
      id: `txn-maturity-${now}`,
      type: 'CAPITAL_RETURN',
      amount: totalPayoutAmount,
      date: new Date().toISOString(),
      timestamp: now,
      status: 'SUCCESS',
      referenceId: 'MAT' + Math.floor(10000000 + Math.random() * 90000000),
      note: `641-Day Maturity payout of ₹${totalPayoutAmount} (Principal: ₹${inv.investedAmount} + Rest Yield: ₹${remainingEarnings}) for ${inv.planUniqueId || inv.id}`,
      noteHi: `641-दिवसीय परिपक्वता भुगतान ₹${totalPayoutAmount} (मूलधन: ₹${inv.investedAmount} + शेष लाभ: ₹${remainingEarnings}) प्राप्त हुआ`,
    };

    setInvestments(updatedInvestments);
    setWallet(updatedWallet);
    setTransactions((prev) => [payoutTx, ...prev]);

    // Open Certificate Modal automatically!
    setSelectedCertificateInvestment(updatedInv);

    confetti({ particleCount: 120, spread: 100 });
    showToast(
      isHi ? '🏆 परिपक्वता भुगतान सफल!' : '🏆 Maturity Payout Success!',
      isHi
        ? `+${formatINR(totalPayoutAmount)} (मूलधन + अर्निंग) आपके बैलेंस में जोड़ दिए गए हैं और परिपक्वता प्रमाण पत्र जारी कर दिया गया है!`
        : `+${formatINR(totalPayoutAmount)} credited to balance and official maturity certificate issued!`
    );
  };

  // LONG TERM PLAN (365-DAY) -> Transition to 1461-Day Royalty Lock (Req #10)
  const handleTransitionToRoyalty1461D = (investmentId: string) => {
    const inv = investments.find((i) => i.id === investmentId);
    if (!inv) return;

    const now = Date.now();
    const updated = investments.map((i) => {
      if (i.id === investmentId) {
        return {
          ...i,
          royaltyStage: '1461D_LOCK' as const,
          durationDays: 1461,
          daysCompleted: 0,
          isMatured: false,
          endDate: new Date(now + 1461 * 86400000).toISOString().split('T')[0],
        };
      }
      return i;
    });

    setInvestments(updated);

    const tx: Transaction = {
      id: `txn-royalty-lock-${now}`,
      type: 'INVEST',
      amount: inv.investedAmount,
      date: new Date().toISOString(),
      timestamp: now,
      status: 'SUCCESS',
      referenceId: 'ROY' + Math.floor(10000000 + Math.random() * 90000000),
      note: `Plan ${inv.planUniqueId || inv.id} transitioned into 1461-Day Royalty Lock Path`,
      noteHi: `प्लान ID ${inv.planUniqueId || inv.id} 1461-दिवसीय रॉयल्टी लॉक योजना में स्थानांतरित हुआ`,
    };

    setTransactions((prev) => [tx, ...prev]);

    confetti({ particleCount: 100, spread: 90 });
    showToast(
      isHi ? '👑 1461-दिवसीय रॉयल्टी लॉक सक्रिय!' : '👑 1461-Day Royalty Lock Activated!',
      isHi
        ? `आपका प्लान (${inv.planUniqueId || inv.id}) 1461 दिनों के लिए लॉक हो गया है। हर 6 घंटे में 0.03% GP प्राप्त होता रहेगा।`
        : `Plan (${inv.planUniqueId || inv.id}) locked for 1461 days with 0.03% GP credited every 6 hours.`
    );
  };

  // LONG TERM PLAN (1461-DAY MATURITY) -> Claim Principal + Enter 1825-Day Royalty Phase (Req #11 & #12)
  const handleClaim1461DAndEnterRoyalty1825D = (investmentId: string) => {
    const inv = investments.find((i) => i.id === investmentId);
    if (!inv) return;

    const totalEarned = inv.earnedSoFar || 0;
    const totalWithdrawn = inv.totalWithdrawn || 0;
    const remainingEarnings = Math.max(0, totalEarned - totalWithdrawn);
    // Return Principal + Rest Earnings at Day 1461
    const payoutAmount = inv.investedAmount + remainingEarnings;

    const now = Date.now();
    const updatedInv: ActiveInvestment = {
      ...inv,
      royaltyStage: '1825D_ROYALTY' as const,
      principalWithdrawnAt1461D: true,
      durationDays: 1825,
      daysCompleted: 0,
      royaltyDaysCompleted: 0,
      isMatured: false,
      claimedSoFar: inv.claimedSoFar + remainingEarnings,
      unclaimedEarnings: 0,
    };

    const updatedInvestments = investments.map((i) => (i.id === investmentId ? updatedInv : i));

    const updatedWallet: Wallet = {
      ...wallet,
      cashBalance: wallet.cashBalance + payoutAmount,
      totalInvested: Math.max(0, wallet.totalInvested - inv.investedAmount),
    };

    const tx: Transaction = {
      id: `txn-royalty-claim-${now}`,
      type: 'CAPITAL_RETURN',
      amount: payoutAmount,
      date: new Date().toISOString(),
      timestamp: now,
      status: 'SUCCESS',
      referenceId: 'ROY' + Math.floor(10000000 + Math.random() * 90000000),
      note: `1461-Day Royalty Maturity: Principal ₹${inv.investedAmount} returned + Rest Yield ₹${remainingEarnings}. Entered 1825-Day Lifetime Royalty!`,
      noteHi: `1461-दिवसीय रॉयल्टी परिपक्वता: मूलधन ₹${inv.investedAmount} वापस + शेष लाभ ₹${remainingEarnings} क्रेडिट। 1825-दिवसीय लाइफटाइम रॉयल्टी में प्रवेश!`,
    };

    setInvestments(updatedInvestments);
    setWallet(updatedWallet);
    setTransactions((prev) => [tx, ...prev]);

    confetti({ particleCount: 140, spread: 110 });
    showToast(
      isHi ? '👑 मूलधन वापस प्राप्त & 1825-दिवसीय रॉयल्टी रिवॉर्ड प्रारंभ!' : '👑 Principal Returned & 1825-Day Royalty Started!',
      isHi
        ? `+${formatINR(payoutAmount)} (मूलधन + अर्निंग) आपके वॉलेट में ट्रांसफर कर दिए गए हैं! मूलधन वापसी के बाद भी अगले 1825 दिनों (5 वर्ष) तक लगातार अर्निंग मिलती रहेगी।`
        : `+${formatINR(payoutAmount)} credited to wallet! Even after principal return, you will receive 0.03% GP every 6 hours for 1825 days.`
    );
  };

  // LONG TERM PLAN (1825-DAY ROYALTY MATURITY) -> Close Plan & Issue Grand Royalty Certificate (Req #13)
  const handleClaimFinalRoyaltyMasterClose = (investmentId: string) => {
    const inv = investments.find((i) => i.id === investmentId);
    if (!inv) return;

    const totalEarned = inv.earnedSoFar || 0;
    const totalWithdrawn = inv.totalWithdrawn || 0;
    const remainingEarnings = Math.max(0, totalEarned - totalWithdrawn);

    const certNum = `GCAP-ROYAL-1825-${Math.floor(100000 + Math.random() * 900000)}`;

    const updatedInv: ActiveInvestment = {
      ...inv,
      status: 'COMPLETED',
      isMatured: true,
      certificateIssued: true,
      certificateNumber: certNum,
      certificateType: 'LTP_ROYALTY_MASTER',
      claimedSoFar: inv.claimedSoFar + remainingEarnings,
      unclaimedEarnings: 0,
      royaltyStage: 'COMPLETED' as const,
    };

    const updatedInvestments = investments.map((i) => (i.id === investmentId ? updatedInv : i));

    const updatedWallet: Wallet = {
      ...wallet,
      cashBalance: wallet.cashBalance + remainingEarnings,
    };

    const now = Date.now();
    const tx: Transaction = {
      id: `txn-royalty-master-${now}`,
      type: 'RETURN_PAYOUT',
      amount: remainingEarnings,
      date: new Date().toISOString(),
      timestamp: now,
      status: 'SUCCESS',
      referenceId: 'MST' + Math.floor(10000000 + Math.random() * 90000000),
      note: `Final 1825-Day Lifetime Royalty Master Completion payout of ₹${remainingEarnings} for ${inv.planUniqueId || inv.id}`,
      noteHi: `1825-दिवसीय लाइफटाइम रॉयल्टी मास्टर परिपक्वता भुगतान ₹${remainingEarnings} प्राप्त हुआ`,
    };

    setInvestments(updatedInvestments);
    setWallet(updatedWallet);
    setTransactions((prev) => [tx, ...prev]);

    setSelectedCertificateInvestment(updatedInv);

    confetti({ particleCount: 160, spread: 120 });
    showToast(
      isHi ? '🏆 1825-दिवसीय लाइफटाइम रॉयल्टी मास्टर पूर्ण!' : '🏆 1825-Day Lifetime Royalty Master Completed!',
      isHi
        ? `बधाई हो! आपकी 5-वर्षीय रॉयल्टी योजना पूर्ण हो चुकी है और ग्रैंड रॉयल मास्टर प्रमाणपत्र जारी कर दिया गया है!`
        : `Congratulations! Your 5-Year Royalty Plan is completed and Grand Royalty Master Certificate is issued!`
    );
  };

  // Simulation Triggers for Long Term Plan
  const handleSimulateMaturity365Days = (investmentId: string) => {
    const updated = investments.map((inv) => {
      if (inv.id === investmentId) {
        return {
          ...inv,
          daysCompleted: 365,
          isMatured: true,
          isInitialLockCompleted: true,
        };
      }
      return inv;
    });
    setInvestments(updated);
    confetti({ particleCount: 90, spread: 80 });
    showToast(
      isHi ? '⚡ टेस्ट: 365 दिन परिपक्वता पूर्ण' : '⚡ Test: Fast-Forward 365 Days',
      isHi
        ? '365 दिन की परिपक्वता पूर्ण! अब आप क्लोज अथवा 1461-दिवसीय रॉयल्टी प्लान में जाने का विकल्प चुन सकते हैं।'
        : '365 days completed! You can now choose to exit with Certificate or enter 1461-Day Royalty Path.'
    );
  };

  const handleSimulateMaturity1461Days = (investmentId: string) => {
    const updated = investments.map((inv) => {
      if (inv.id === investmentId) {
        return {
          ...inv,
          daysCompleted: 1461,
          isMatured: true,
          isInitialLockCompleted: true,
        };
      }
      return inv;
    });
    setInvestments(updated);
    confetti({ particleCount: 100, spread: 90 });
    showToast(
      isHi ? '⚡ टेस्ट: 1461 दिन रॉयल्टी परिपक्वता पूर्ण' : '⚡ Test: Fast-Forward 1461 Days',
      isHi
        ? '1461 दिन की परिपक्वता पूर्ण! अब आप मूलधन निकालकर 1825-दिवसीय रॉयल्टी अर्निंग चरण में प्रवेश कर सकते हैं।'
        : '1461 days completed! You can now withdraw principal and activate 1825-Day Royalty Phase.'
    );
  };

  const handleSimulateMaturity1825Days = (investmentId: string) => {
    const updated = investments.map((inv) => {
      if (inv.id === investmentId) {
        return {
          ...inv,
          royaltyDaysCompleted: 1825,
          isMatured: true,
          isInitialLockCompleted: true,
        };
      }
      return inv;
    });
    setInvestments(updated);
    confetti({ particleCount: 120, spread: 100 });
    showToast(
      isHi ? '⚡ टेस्ट: 1825 दिन रॉयल्टी मास्टर पूर्ण' : '⚡ Test: Fast-Forward 1825 Days',
      isHi
        ? '1825-दिवसीय रॉयल्टी मास्टर पूर्ण! अब आप फाइनल क्लोज करके ग्रैंड रॉयल्टी मास्टर सर्टिफिकेट प्राप्त कर सकते हैं।'
        : '1825 days royalty master complete! Final close with Grand Royalty Master Certificate available.'
    );
  };

  // Render main dashboard content
  const renderDashboardContent = () => (
    <div className="space-y-6">
      {/* Dynamic Live Header / Welcome Notice from OTA Remote Config */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900/90 border border-emerald-500/20 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30 flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                {isHi ? 'लाइव इन-ऐप सिंक एक्टिव' : 'Live In-App OTA Active'}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Ver {liveConfig.appVersion}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                {isHi ? 'बिना री-इन्स्टॉल ऑटो-अपडेट' : 'Zero Reinstall Updates'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight pt-1">
              {isHi ? (liveConfig.heroHeadlineHi || 'स्मार्ट निवेश, दैनिक रिटर्न') : (liveConfig.heroHeadline || 'Smart Investment & Daily Returns')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              {isHi
                ? (liveConfig.heroSubtextHi || 'शॉर्ट टर्म (641D) एवं लॉन्ग टर्म (365D) में सुरक्षित निवेश करें। 100% मूलधन सुरक्षा एवं स्वचालित 6-घंटे रिटर्न।')
                : (liveConfig.heroSubtext || 'Invest safely in Short Term (641D) and Long Term (365D) plans with 100% capital guarantee and 6-hour automated payouts.')}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setDesktopTab('plans')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
            >
              <span>{isHi ? 'सभी प्लान्स देखें' : 'View Plans'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Modern Desktop Category Tabs Navigation (Category-Wise Menu) */}
      <DesktopCategoryNav
        activeTab={desktopTab}
        onTabChange={setDesktopTab}
        language={language}
        activeInvestmentsCount={activeInvestmentsList.length}
      />

      {/* Back Navigation Bar (When viewing any sub-screen on desktop) */}
      {desktopTab !== 'dashboard' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 px-4 flex items-center justify-between shadow-lg">
          <button
            onClick={() => setDesktopTab('dashboard')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isHi ? '← वापस मुख्य स्क्रीन पर जाएं (Back to Home)' : '← Back to Main Dashboard'}</span>
          </button>
          <div className="text-xs text-slate-400 hidden sm:flex items-center gap-2">
            <span>{isHi ? 'वर्तमान दृश्य:' : 'Current Screen:'}</span>
            <span className="text-amber-400 font-bold uppercase tracking-wider">{desktopTab}</span>
          </div>
        </div>
      )}

      {/* Category 1: Overview / Dashboard (Amazon & Flipkart Style Deals & Showcase) */}
      {desktopTab === 'dashboard' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Flipkart / Amazon Style Hero Banner & Deal Sliders */}
          <EcommerceBanner
            language={language}
            wallet={wallet}
            onNavigateTab={(tab) => setDesktopTab(tab as DesktopCategoryTab)}
            onOpenDeposit={() => setIsDepositOpen(true)}
            onOpenWithdraw={() => setIsWithdrawOpen(true)}
          />

          <WalletCard
            wallet={wallet}
            language={language}
            rules={rules}
            activeInvestmentsCount={activeInvestmentsList.length}
            unclaimedReturnsTotal={unclaimedReturnsTotal}
            dailyProjectedTotal={dailyProjectedTotal}
            onOpenDeposit={() => setIsDepositOpen(true)}
            onOpenWithdraw={() => setIsWithdrawOpen(true)}
            onOpenSwap={() => setIsSwapOpen(true)}
            onClaimAllReturns={handleClaimAllReturns}
          />

          <div id="investments-section">
            <ActiveInvestments
              investments={investments}
              language={language}
              onClaimReturn={handleClaimSingleReturn}
              onSimulateComplete24hLock={handleSimulateComplete24hLock}
              onSimulateComplete6hCycle={handleSimulateComplete6hCycle}
              onSimulateMaturity641Days={handleSimulateMaturity641Days}
              onRenewPlan={handleRenewPlan}
              onClaimMaturityClose={handleClaimMaturityClose}
              onViewCertificate={(inv) => setSelectedCertificateInvestment(inv)}
              onTransitionToRoyalty1461D={handleTransitionToRoyalty1461D}
              onClaim1461DAndEnterRoyalty1825D={handleClaim1461DAndEnterRoyalty1825D}
              onClaimFinalRoyaltyMasterClose={handleClaimFinalRoyaltyMasterClose}
              onSimulateMaturity365Days={handleSimulateMaturity365Days}
              onSimulateMaturity1461Days={handleSimulateMaturity1461Days}
              onSimulateMaturity1825Days={handleSimulateMaturity1825Days}
              onNavigateToPlans={() => setDesktopTab('plans')}
            />
          </div>

          <div id="plans-section">
            <PlansList
              language={language}
              onSelectPlan={(plan) => handleOpenInvest(plan)}
              plans={plans}
              searchFilter={searchQuery}
              onOpenGuides={handleOpenGuides}
            />
          </div>

          <div id="transactions-section">
            <TransactionsTable
              transactions={transactions}
              language={language}
              onViewVoucher={(tx) => {
                setSelectedVoucherTxn(tx);
                setIsVoucherModalOpen(true);
              }}
            />
          </div>
        </div>
      )}

      {/* Category 2: Investment Plans */}
      {desktopTab === 'plans' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <PlansList
            language={language}
            onSelectPlan={(plan) => handleOpenInvest(plan)}
            plans={plans}
            searchFilter={searchQuery}
            onOpenGuides={handleOpenGuides}
          />
          <RoiCalculator
            language={language}
            onSelectPlanAndAmount={(plan, amt) => handleOpenInvest(plan, amt)}
            plans={plans}
          />
        </div>
      )}

      {/* Category 3: Active Portfolio / Investments */}
      {desktopTab === 'investments' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <ActiveInvestments
            investments={investments}
            language={language}
            onClaimReturn={handleClaimSingleReturn}
            onSimulateComplete24hLock={handleSimulateComplete24hLock}
            onSimulateComplete6hCycle={handleSimulateComplete6hCycle}
            onSimulateMaturity641Days={handleSimulateMaturity641Days}
            onRenewPlan={handleRenewPlan}
            onClaimMaturityClose={handleClaimMaturityClose}
            onViewCertificate={(inv) => setSelectedCertificateInvestment(inv)}
            onTransitionToRoyalty1461D={handleTransitionToRoyalty1461D}
            onClaim1461DAndEnterRoyalty1825D={handleClaim1461DAndEnterRoyalty1825D}
            onClaimFinalRoyaltyMasterClose={handleClaimFinalRoyaltyMasterClose}
            onSimulateMaturity365Days={handleSimulateMaturity365Days}
            onSimulateMaturity1461Days={handleSimulateMaturity1461Days}
            onSimulateMaturity1825Days={handleSimulateMaturity1825Days}
            onNavigateToPlans={() => setDesktopTab('plans')}
          />
        </div>
      )}

      {/* Category 4: Wallet & Transaction Ledger */}
      {desktopTab === 'wallet' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <WalletCard
            wallet={wallet}
            language={language}
            rules={rules}
            activeInvestmentsCount={activeInvestmentsList.length}
            unclaimedReturnsTotal={unclaimedReturnsTotal}
            dailyProjectedTotal={dailyProjectedTotal}
            onOpenDeposit={() => setIsDepositOpen(true)}
            onOpenWithdraw={() => setIsWithdrawOpen(true)}
            onOpenSwap={() => setIsSwapOpen(true)}
            onClaimAllReturns={handleClaimAllReturns}
          />
          <TransactionsTable
            transactions={transactions}
            language={language}
            onViewVoucher={(tx) => {
              setSelectedVoucherTxn(tx);
              setIsVoucherModalOpen(true);
            }}
          />
        </div>
      )}

      {/* Category 5: Interactive Calculator */}
      {desktopTab === 'calculator' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <RoiCalculator
            language={language}
            onSelectPlanAndAmount={(plan, amt) => handleOpenInvest(plan, amt)}
            plans={plans}
          />
        </div>
      )}

      {/* Category 6: Official Rules & Policies */}
      {desktopTab === 'rules' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">
                      {isHi ? 'GCap आधिकारिक नियम व नीतियां (Rules & Regulations)' : 'GCap Official Rules & Regulations'}
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono border border-emerald-500/30">
                      {isHi ? 'सक्रिय नीतियां' : 'Active Rules'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {isHi
                      ? 'पारदर्शी निवेश शर्तें, 100% मूलधन सुरक्षा और त्वरित 24x7 निकासी नीति।'
                      : 'Transparent terms, 100% capital guarantee, and instant withdrawal rules.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="btn-open-rules-full"
                  onClick={() => setIsRulesOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all cursor-pointer shadow-md shadow-emerald-700/20"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{isHi ? 'पूरे नियम पढ़ें' : 'View Full Rules'}</span>
                </button>
                <button
                  id="btn-edit-rules-quick"
                  onClick={() => setIsRulesOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs transition-all cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isHi ? '⚙️ नियम कस्टमाइज़ करें' : '⚙️ Edit Rules'}</span>
                </button>
                <button
                  id="btn-open-referral-quick"
                  onClick={() => setIsReferralOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium text-xs transition-all cursor-pointer"
                >
                  <Gift className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isHi ? 'रेफरल लिंक' : 'Referral'}</span>
                </button>
              </div>
            </div>

            {/* 4 Core Rule Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                  1. {isHi ? 'डिपॉजिट सीमा' : 'Deposit Limit'}
                </span>
                <p className="text-sm font-bold font-mono text-emerald-400 mt-1">
                  Min: {formatINR(rules.minDeposit)}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {isHi ? '0% शुल्क • तत्काल UPI / QR' : 'Zero fee • Instant UPI / QR'}
                </p>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                  2. {isHi ? 'दैनिक रिटर्न चक्र' : 'Daily ROI Engine'}
                </span>
                <p className="text-sm font-bold text-white mt-1">
                  24-Hr Cycle
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {isHi ? 'कभी भी Claim करें या वॉलेट में जोड़ें' : 'Claim to wallet anytime'}
                </p>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                  3. {isHi ? 'मूलधन वापसी गारंटी' : 'Capital Guarantee'}
                </span>
                <p className="text-sm font-bold text-emerald-400 mt-1">
                  100% Refund
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {isHi ? 'प्लान समाप्ति पर पूरा मूलधन वापस' : 'Principal returned on maturity'}
                </p>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                  4. {isHi ? 'निकासी व ट्रांसफर' : 'Withdrawal Policy'}
                </span>
                <p className="text-sm font-bold font-mono text-purple-300 mt-1">
                  Min: {formatINR(rules.minWithdrawal)}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {rules.withdrawalFeePercent === 0 ? (isHi ? '0% मुफ़्त' : '0% Fee') : `${rules.withdrawalFeePercent}% Fee`} • {rules.withdrawalTiming}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Architecture Explainer Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-xs text-slate-400">
        <div className="flex items-center gap-2.5 text-slate-200 font-bold text-sm mb-2">
          <Database className="w-4 h-4 text-emerald-400" />
          <span>
            {isHi
              ? 'वेबसाइट + Android ऐप एक ही डेटाबेस पर कैसे काम करते हैं?'
              : 'How Web + Android App Share the Same Database:'}
          </span>
        </div>
        <p className="leading-relaxed mb-3">
          {isHi
            ? 'जब भी कोई यूज़र वेबसाइट या Android मोबाइल ऐप में पैसे जोड़ता है (Deposit) या निवेश करता है, वह सीधे एक ही केंद्रीय डेटाबेस (जैसे Firebase Firestore या PostgreSQL API) में दर्ज होता है। ऊपर दिए गए "📱 मोबाइल व्यू" बटन को दबाकर आप देख सकते हैं कि वही डेटा दोनों जगह एक साथ कैसे सिंक रहता है।'
            : 'Whenever a user deposits funds or starts an investment via the website or Android app, all actions update the same centralized database (e.g. Firebase Firestore or REST API). Use the "📱 Mobile View" button in the top navbar to experience the seamless live sync.'}
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-[11px]">
          <div className="flex items-center gap-4 text-slate-500">
            <span>• Firestore / REST API Ready</span>
            <span>• Real-time Daily Accrual Engine</span>
            <span>• Multi-Device Synchronized</span>
          </div>
          <button
            id="btn-reset-demo"
            onClick={handleResetData}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isHi ? 'डेमो डेटा रीसेट करें' : 'Reset Demo State'}</span>
          </button>
        </div>
      </div>

    </div>
  );

  // Check if user is logged in. If not, project starts from Login Page!
  if (!currentUser) {
    const loginComponent = (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        language={language}
        onLanguageChange={setLanguage}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
    );

    if (viewMode === 'android') {
      return (
        <AndroidFrame
          activeTab="dashboard"
          onTabChange={() => {}}
          language={language}
          onLanguageChange={setLanguage}
          onExitMobile={() => setViewMode('web')}
          currentUser={null}
        >
          {loginComponent}
        </AndroidFrame>
      );
    }
    return loginComponent;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950 overflow-x-hidden w-full max-w-full">
      {/* Full-Screen GCap Intro Animation Overlay */}
      {showSplashIntro && (
        <GcapSplashIntro
          user={currentUser}
          language={language}
          onComplete={handleSplashComplete}
        />
      )}

      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 max-w-sm w-full bg-slate-900/95 border border-emerald-500/40 shadow-2xl shadow-emerald-950/50 rounded-2xl p-4 flex items-start gap-3 animate-in slide-in-from-top-5 duration-300 backdrop-blur-md">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-white tracking-tight">{toastMessage.title}</h4>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">{toastMessage.desc}</p>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-500 hover:text-slate-300 text-xs p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Emergency Maintenance Mode Banner Only (Regular live updates run quietly in background without screen clutter) */}
      {viewMode === 'web' && liveConfig.maintenanceMode && (
        <LiveAnnouncementBanner
          config={liveConfig}
          language={language}
          onCheckUpdates={() =>
            showToast(
              isHi ? '✅ ऐप पूर्णतः अप-टू-डेट है!' : '✅ System is on latest live version!',
              isHi
                ? `वर्ज़न ${liveConfig.appVersion} के सभी नियम व प्लान्स तुरंत सिंक हैं। रीइन्स्टॉल की आवश्यकता नहीं है।`
                : `Version ${liveConfig.appVersion} is synchronized across all clients with zero reinstall.`
            )
          }
        />
      )}

      {/* Top Navigation Bar (Web Mode Only) */}
      {viewMode === 'web' && (
        <Navbar
          wallet={wallet}
          language={language}
          onLanguageChange={setLanguage}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onOpenDeposit={() => setIsDepositOpen(true)}
          onOpenWithdraw={() => setIsWithdrawOpen(true)}
          onOpenRules={() => setIsRulesOpen(true)}
          onOpenReferral={() => setIsReferralOpen(true)}
          onSimulateDay={handleSimulateDay}
          isSimulating={isSimulating}
          currentUser={currentUser}
          onLogout={handleLogout}
          isAdminHubActive={adminViewMode === 'ADMIN_HUB'}
          onToggleAdminHub={() =>
            setAdminViewMode((prev) => (prev === 'ADMIN_HUB' ? 'INVESTOR_VIEW' : 'ADMIN_HUB'))
          }
          liveConfig={liveConfig}
          desktopTab={desktopTab}
          onDesktopTabChange={setDesktopTab}
          onSearchQuery={(q) => {
            setSearchQuery(q);
            setDesktopTab('plans');
          }}
          onOpenMenuDrawer={() => setIsMenuDrawerOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
          unreadMessagesCount={unreadMessagesCount}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onSelectAdminSubTab={setAdminMobileTab}
        />
      )}

      {/* Global Slide-Over Navigation Drawer with Categorized Menus & Submenus */}
      <NavigationDrawer
        isOpen={isMenuDrawerOpen}
        onClose={() => setIsMenuDrawerOpen(false)}
        language={language}
        onLanguageChange={setLanguage}
        wallet={wallet}
        currentUser={currentUser}
        onLogout={handleLogout}
        activeTab={desktopTab}
        onSelectTab={(tab) => {
          setDesktopTab(tab);
          setMobileTab(tab);
        }}
        onOpenDeposit={() => setIsDepositOpen(true)}
        onOpenWithdraw={() => setIsWithdrawOpen(true)}
        onOpenSwap={() => setIsSwapOpen(true)}
        onOpenRules={() => setIsRulesOpen(true)}
        onOpenReferral={() => setIsReferralOpen(true)}
        onOpenAgreement={() => setIsAgreementOpen(true)}
        onOpenGuides={handleOpenGuides}
        onSimulateDay={handleSimulateDay}
        isSimulating={isSimulating}
        isAdminHubActive={adminViewMode === 'ADMIN_HUB'}
        onToggleAdminHub={() =>
          setAdminViewMode((prev) => (prev === 'ADMIN_HUB' ? 'INVESTOR_VIEW' : 'ADMIN_HUB'))
        }
        onSelectAdminSubTab={(subTab) => {
          setAdminViewMode('ADMIN_HUB');
          setAdminMobileTab(subTab);
          setIsMenuDrawerOpen(false);
        }}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenSplashIntro={() => setShowSplashIntro(true)}
      />

      {/* Main Viewport */}
      <main className={viewMode === 'web' ? "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8" : "w-full max-w-full p-0 overflow-x-hidden"}>
        {/* Global Admin Treasury Low Alert Banner (if balance <= 500,000) */}
        {currentUser.role === 'ADMIN' && treasury.balance <= DEFAULT_ALERT_THRESHOLD && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-rose-950/80 via-slate-900 to-rose-950/80 border-2 border-rose-500/80 shadow-2xl shadow-rose-950/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-lg shadow-rose-500/40">
                🚨
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-rose-300 uppercase tracking-wide">
                    {isHi ? '⚠️ क्रिटिकल एडमिन अलर्ट: कंपनी बैलेंस कम!' : '⚠️ Critical Admin Alert: Low Treasury Balance!'}
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500 text-white font-mono font-black">
                    ≤ ₹5,00,000
                  </span>
                </div>
                <p className="text-xs text-slate-200 mt-0.5">
                  {isHi
                    ? `कंपनी का मुख्य बैलेंस घटकर केवल ₹${treasury.balance.toLocaleString('en-IN')} रह गया है। यूज़र्स के निवेश के लिए तुरंत मुख्य बैलेंस बढ़ाएं!`
                    : `Company treasury reserve is down to ₹${treasury.balance.toLocaleString('en-IN')}. Replenish immediately to ensure smooth user investments!`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <button
                onClick={() => {
                  setAdminViewMode('ADMIN_HUB');
                  handleQuickAddCompanyBalance(1000000);
                }}
                className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
              >
                + {isHi ? '₹10 लाख तुरंत जोड़ें' : 'Add ₹10L Now'}
              </button>
              {adminViewMode !== 'ADMIN_HUB' && (
                <button
                  onClick={() => setAdminViewMode('ADMIN_HUB')}
                  className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all cursor-pointer"
                >
                  {isHi ? 'एडमिन हब जाएं →' : 'Go to Admin Hub →'}
                </button>
              )}
            </div>
          </div>
        )}

        {currentUser.role === 'ADMIN' && adminViewMode === 'ADMIN_HUB' && viewMode === 'web' ? (
          <div>
            <AdminPanel
              adminUser={currentUser}
              language={language}
              externalActiveSubTab={adminMobileTab}
              onExternalActiveSubTabChange={setAdminMobileTab}
              rules={rules}
              wallet={wallet}
              transactions={transactions}
              plans={plans}
              investments={investments}
              treasury={treasury}
              treasuryLogs={treasuryLogs}
              backups={backups}
              currentPayload={getCurrentSystemPayload()}
              liveConfig={liveConfig}
              onUpdateLiveConfig={handleUpdateLiveConfig}
              onResetLiveConfig={handleResetLiveConfig}
              onOpenRules={() => setIsRulesOpen(true)}
              onSwitchToInvestorView={() => setAdminViewMode('INVESTOR_VIEW')}
              onLogout={handleLogout}
              onAddPlan={handleAdminAddPlan}
              onUpdatePlan={handleAdminUpdatePlan}
              onDeletePlan={handleAdminDeletePlan}
              onResetPlans={handleAdminResetPlans}
              onAddTransaction={handleAdminAddTransaction}
              onUpdateTransaction={handleAdminUpdateTransaction}
              onDeleteTransaction={handleAdminDeleteTransaction}
              onSimulateComplete24hLock={handleSimulateComplete24hLock}
              onSimulateComplete6hCycle={handleSimulateComplete6hCycle}
              onSimulateMaturity641Days={handleSimulateMaturity641Days}
              onAdminAddCompanyBalance={handleAdminAddCompanyBalance}
              onAdminDeductCompanyBalance={handleAdminDeductCompanyBalance}
              onResetSystemFresh={handleResetData}
              onQuickAddCompanyBalance={handleQuickAddCompanyBalance}
              onResetTreasury={handleResetTreasury}
              onRunMidnightBackupNow={handleRunMidnightBackupNow}
              onCreateManualSnapshot={handleCreateManualSnapshot}
              onRestoreBackup={handleRestoreBackup}
              onDeleteBackup={handleDeleteBackup}
              messages={messages}
              onSendMessage={handleSendAdminMessage}
              onDeleteMessage={handleDeleteAdminMessage}
              onRefreshMessages={refreshMessages}
            />
          </div>
        ) : viewMode === 'web' ? (
          <>
            {currentUser.role === 'ADMIN' && (
              <div className="mb-5 p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between shadow-lg shadow-amber-950/20">
                <div className="flex items-center gap-2.5">
                  <Award className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    {isHi
                      ? '👑 आप वर्तमान में निवेशक ऐप (User View) का पूर्वावलोकन कर रहे हैं।'
                      : '👑 Admin Preview Mode — You are previewing the Investor Experience.'}
                  </span>
                </div>
                <button
                  onClick={() => setAdminViewMode('ADMIN_HUB')}
                  className="px-3 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-amber-400 transition-all cursor-pointer shadow"
                >
                  {isHi ? 'एडमिन हब पर लौटें' : 'Back to Admin Hub'}
                </button>
              </div>
            )}
            {renderDashboardContent()}
          </>
        ) : (
          <AndroidFrame
            activeTab={adminViewMode === 'ADMIN_HUB' ? adminMobileTab : mobileTab}
            onTabChange={adminViewMode === 'ADMIN_HUB' ? (tab) => setAdminMobileTab(tab as any) : setMobileTab}
            language={language}
            onLanguageChange={setLanguage}
            onExitMobile={() => setViewMode('web')}
            currentUser={currentUser}
            onLogout={handleLogout}
            onSearchQuery={(q) => {
              if (adminViewMode !== 'ADMIN_HUB') {
                setSearchQuery(q);
                setMobileTab('plans');
              }
            }}
            wallet={wallet}
            onOpenDeposit={() => setIsDepositOpen(true)}
            onOpenWithdraw={() => setIsWithdrawOpen(true)}
            onOpenSwap={() => setIsSwapOpen(true)}
            onOpenRules={() => setIsRulesOpen(true)}
            onOpenReferral={() => setIsReferralOpen(true)}
            isAdminHubActive={adminViewMode === 'ADMIN_HUB'}
            onToggleAdminHub={() => setAdminViewMode((prev) => (prev === 'ADMIN_HUB' ? 'INVESTOR_VIEW' : 'ADMIN_HUB'))}
            unreadMessagesCount={unreadMessagesCount}
            onOpenNotifications={() => setIsNotificationsOpen(true)}
            onOpenProfile={() => setIsProfileOpen(true)}
          >
            {adminViewMode === 'ADMIN_HUB' ? (
              <AdminPanel
                adminUser={currentUser}
                language={language}
                rules={rules}
                wallet={wallet}
                transactions={transactions}
                plans={plans}
                investments={investments}
                treasury={treasury}
                treasuryLogs={treasuryLogs}
                backups={backups}
                currentPayload={getCurrentSystemPayload()}
                liveConfig={liveConfig}
                onUpdateLiveConfig={handleUpdateLiveConfig}
                onResetLiveConfig={handleResetLiveConfig}
                onOpenRules={() => setIsRulesOpen(true)}
                onSwitchToInvestorView={() => setAdminViewMode('INVESTOR_VIEW')}
                onLogout={handleLogout}
                onAddPlan={handleAdminAddPlan}
                onUpdatePlan={handleAdminUpdatePlan}
                onDeletePlan={handleAdminDeletePlan}
                onResetPlans={handleAdminResetPlans}
                onAddTransaction={handleAdminAddTransaction}
                onUpdateTransaction={handleAdminUpdateTransaction}
                onDeleteTransaction={handleAdminDeleteTransaction}
                onSimulateComplete24hLock={handleSimulateComplete24hLock}
                onSimulateComplete6hCycle={handleSimulateComplete6hCycle}
                onSimulateMaturity641Days={handleSimulateMaturity641Days}
                onAdminAddCompanyBalance={handleAdminAddCompanyBalance}
                onAdminDeductCompanyBalance={handleAdminDeductCompanyBalance}
                onResetSystemFresh={handleResetData}
                onQuickAddCompanyBalance={handleQuickAddCompanyBalance}
                onResetTreasury={handleResetTreasury}
                onRunMidnightBackupNow={handleRunMidnightBackupNow}
                onCreateManualSnapshot={handleCreateManualSnapshot}
                onRestoreBackup={handleRestoreBackup}
                onDeleteBackup={handleDeleteBackup}
                messages={messages}
                onSendMessage={handleSendAdminMessage}
                onDeleteMessage={handleDeleteAdminMessage}
                onRefreshMessages={refreshMessages}
                externalActiveSubTab={adminMobileTab}
                onExternalActiveSubTabChange={(tab) => setAdminMobileTab(tab)}
              />
            ) : (
              <>
                {mobileTab === 'dashboard' && (
                  <div className="space-y-4">
                    {/* Flipkart / Amazon Mobile Hero Carousel Banner */}
                    <EcommerceBanner
                      language={language}
                      wallet={wallet}
                      onNavigateTab={(tab) => setMobileTab(tab)}
                      onOpenDeposit={() => setIsDepositOpen(true)}
                      onOpenWithdraw={() => setIsWithdrawOpen(true)}
                    />

                    <WalletCard
                      wallet={wallet}
                      language={language}
                      rules={rules}
                      activeInvestmentsCount={activeInvestmentsList.length}
                      unclaimedReturnsTotal={unclaimedReturnsTotal}
                      dailyProjectedTotal={dailyProjectedTotal}
                      onOpenDeposit={() => setIsDepositOpen(true)}
                      onOpenWithdraw={() => setIsWithdrawOpen(true)}
                      onOpenSwap={() => setIsSwapOpen(true)}
                      onClaimAllReturns={handleClaimAllReturns}
                    />
                    <RoiCalculator
                      language={language}
                      onSelectPlanAndAmount={(plan, amt) => handleOpenInvest(plan, amt)}
                      plans={plans}
                    />
                  </div>
                )}

                {mobileTab === 'plans' && (
                  <PlansList
                    language={language}
                    onSelectPlan={(plan) => handleOpenInvest(plan)}
                    plans={plans}
                    searchFilter={searchQuery}
                  />
                )}

                {mobileTab === 'investments' && (
                  <ActiveInvestments
                    investments={investments}
                    language={language}
                    onClaimReturn={handleClaimSingleReturn}
                    onSimulateComplete24hLock={handleSimulateComplete24hLock}
                    onSimulateComplete6hCycle={handleSimulateComplete6hCycle}
                    onSimulateMaturity641Days={handleSimulateMaturity641Days}
                    onRenewPlan={handleRenewPlan}
                    onClaimMaturityClose={handleClaimMaturityClose}
                    onViewCertificate={(inv) => setSelectedCertificateInvestment(inv)}
                    onTransitionToRoyalty1461D={handleTransitionToRoyalty1461D}
                    onClaim1461DAndEnterRoyalty1825D={handleClaim1461DAndEnterRoyalty1825D}
                    onClaimFinalRoyaltyMasterClose={handleClaimFinalRoyaltyMasterClose}
                    onSimulateMaturity365Days={handleSimulateMaturity365Days}
                    onSimulateMaturity1461Days={handleSimulateMaturity1461Days}
                    onSimulateMaturity1825Days={handleSimulateMaturity1825Days}
                    onNavigateToPlans={() => setMobileTab('plans')}
                  />
                )}

                {mobileTab === 'wallet' && (
                  <div className="space-y-4">
                    <WalletCard
                      wallet={wallet}
                      language={language}
                      rules={rules}
                      activeInvestmentsCount={activeInvestmentsList.length}
                      unclaimedReturnsTotal={unclaimedReturnsTotal}
                      dailyProjectedTotal={dailyProjectedTotal}
                      onOpenDeposit={() => setIsDepositOpen(true)}
                      onOpenWithdraw={() => setIsWithdrawOpen(true)}
                      onOpenSwap={() => setIsSwapOpen(true)}
                      onClaimAllReturns={handleClaimAllReturns}
                    />
                    <TransactionsTable
                      transactions={transactions}
                      language={language}
                      onViewVoucher={(tx) => {
                        setSelectedVoucherTxn(tx);
                        setIsVoucherModalOpen(true);
                      }}
                    />
                  </div>
                )}

                {mobileTab === 'rules' && (
                  <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-emerald-400" />
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                            {isHi ? 'GCap आधिकारिक नियम' : 'GCap Rules'}
                          </h4>
                        </div>
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          {isHi ? 'लागू नीतियां' : 'Active'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">{isHi ? 'कम से कम डिपॉजिट' : 'Min Deposit'}</span>
                          <span className="font-mono font-bold text-emerald-400">{formatINR(rules.minDeposit)}</span>
                        </div>
                        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">{isHi ? 'कम से कम निकासी' : 'Min Withdraw'}</span>
                          <span className="font-mono font-bold text-purple-300">{formatINR(rules.minWithdrawal)}</span>
                        </div>
                        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">{isHi ? 'निकासी शुल्क' : 'Withdrawal Fee'}</span>
                          <span className="font-mono font-bold text-white">{rules.withdrawalFeePercent}%</span>
                        </div>
                        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">{isHi ? 'मूलधन वापसी' : 'Capital Return'}</span>
                          <span className="font-bold text-emerald-400 text-[11px]">100% Refund</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => setIsRulesOpen(true)}
                          className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer text-center"
                        >
                          {isHi ? 'संपूर्ण नियम व नीतियां' : 'Full Policy'}
                        </button>
                        <button
                          onClick={() => setIsRulesOpen(true)}
                          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition-colors cursor-pointer"
                        >
                          ⚙️ {isHi ? 'एडिट' : 'Edit'}
                        </button>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-center justify-between">
                      <div>
                        <span className="font-bold block text-amber-300">{isHi ? 'रेफरल कमीशन प्रोग्राम' : 'Referral Bonus'}</span>
                        <span className="text-[11px] text-amber-200/80">L1: {rules.referralL1Percent}% | L2: {rules.referralL2Percent}%</span>
                      </div>
                      <button
                        onClick={() => setIsReferralOpen(true)}
                        className="px-2.5 py-1 rounded bg-amber-500 text-slate-950 font-bold text-[11px] cursor-pointer"
                      >
                        {isHi ? 'लिंक देखें' : 'Get Link'}
                      </button>
                    </div>
                  </div>
                )}

                {mobileTab === 'transactions' && (
                  <TransactionsTable
                    transactions={transactions}
                    language={language}
                  />
                )}
              </>
            )}
          </AndroidFrame>
        )}
      </main>

      {/* Deposit Funds Modal */}
      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        language={language}
        rules={rules}
        onDepositSuccess={handleDepositSuccess}
      />

      {/* Withdraw Funds Modal */}
      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        wallet={wallet}
        language={language}
        rules={rules}
        currentUser={currentUser}
        onWithdrawSuccess={handleWithdrawSuccess}
        onOpenSwap={() => setIsSwapOpen(true)}
      />

      {/* User Profile & Bank Details Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        currentUser={currentUser}
        language={language}
        onLanguageChange={setLanguage}
        onUpdateCurrentUser={setCurrentUser}
      />

      {/* Swap Cash to GP Modal (Rule 3 & 4) */}
      <SwapModal
        isOpen={isSwapOpen}
        onClose={() => setIsSwapOpen(false)}
        wallet={wallet}
        language={language}
        rules={rules}
        onSwapSuccess={handleSwapSuccess}
      />

      {/* Invest in Plan Modal */}
      <InvestModal
        isOpen={isInvestOpen}
        onClose={() => setIsInvestOpen(false)}
        plan={selectedPlan}
        wallet={wallet}
        companyBalance={treasury.balance}
        language={language}
        initialAmount={initialInvestAmount}
        onInvestSuccess={handleInvestSuccess}
        onOpenDeposit={() => setIsDepositOpen(true)}
        onOpenSwap={() => setIsSwapOpen(true)}
      />

      {/* Rules & Policy Manager Modal */}
      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
        language={language}
        rules={rules}
        currentUser={currentUser}
        onSaveRules={handleSaveRules}
        onResetRules={handleResetRules}
        onOpenGuides={handleOpenGuides}
      />

      {/* Referral Program Modal */}
      <ReferralModal
        isOpen={isReferralOpen}
        onClose={() => setIsReferralOpen(false)}
        language={language}
        rules={rules}
        currentUser={currentUser}
      />

      {/* Payment Voucher Modal (TDS & Admin Charge Receipt) */}
      <PaymentVoucherModal
        isOpen={isVoucherModalOpen}
        onClose={() => setIsVoucherModalOpen(false)}
        transaction={selectedVoucherTxn}
        language={language}
      />

      {/* Official Investment Plans & Govt TDS Refund Guides Modal */}
      <GuidesModal
        isOpen={isGuidesOpen}
        onClose={() => setIsGuidesOpen(false)}
        language={language}
        rules={rules}
        plans={plans}
        initialGuide={initialGuide}
      />

      {/* Official GCap User Legal Agreement & Contract Modal */}
      <UserAgreementModal
        isOpen={isAgreementOpen}
        onClose={() => setIsAgreementOpen(false)}
        user={currentUser}
        rules={rules}
        plans={plans}
        language={language}
      />

      {/* 24-Hour Lock Completed Congratulations Modal */}
      {congratulationsInvestment && (
        <LockCongratulationsModal
          onClose={() => setCongratulationsInvestment(null)}
          onViewInvestments={() => {
            setCongratulationsInvestment(null);
            setDesktopTab('investments');
            setMobileTab('investments');
          }}
          investment={congratulationsInvestment}
          language={language}
        />
      )}

      {/* Official 641-Day Maturity Certificate Modal */}
      {selectedCertificateInvestment && (
        <MaturityCertificateModal
          isOpen={!!selectedCertificateInvestment}
          onClose={() => setSelectedCertificateInvestment(null)}
          investment={selectedCertificateInvestment}
          user={currentUser}
          language={language}
        />
      )}

      {/* Instant Real-Time User Message Popup Modal */}
      {activePopupMessage && (
        <UserMessagePopupModal
          message={activePopupMessage}
          language={language}
          onDismiss={handleDismissPopupMessage}
          onMarkAsReadAndClose={handleMarkAsReadAndClosePopup}
        />
      )}

      {/* Notification Center Modal (History of all announcements & personal messages) */}
      <NotificationCenterModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        messages={userVisibleMessages}
        currentUserId={currentUser?.id}
        language={language}
        onMarkAsRead={handleMarkMessageAsRead}
        onMarkAllAsRead={handleMarkAllMessagesAsRead}
      />

    </div>
  );
}
