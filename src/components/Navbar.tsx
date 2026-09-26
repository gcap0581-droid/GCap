import React, { useState } from 'react';
import {
  Menu,
  Wallet as WalletIcon,
  PlusCircle,
  Globe,
  Smartphone,
  Monitor,
  Search,
  Zap,
  Award,
  LogOut,
  ChevronDown,
  Bell,
  RefreshCw,
} from 'lucide-react';
import {
  Language,
  UserProfile,
  ViewMode,
  Wallet,
  LiveInterfaceConfig,
  DesktopCategoryTab,
  CompanyTreasury,
  ActiveInvestment,
} from '../types';
import { formatINR } from '../utils/storage';

interface NavbarProps {
  wallet?: Wallet | null;
  treasury?: CompanyTreasury;
  investments?: ActiveInvestment[];
  language: Language;
  onLanguageChange: (lang: Language) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onOpenRules: () => void;
  onOpenReferral: () => void;
  onSimulateDay: () => void;
  isSimulating: boolean;
  currentUser?: UserProfile | null;
  onLogout?: () => void;
  isAdminHubActive?: boolean;
  onToggleAdminHub?: () => void;
  liveConfig?: LiveInterfaceConfig;
  desktopTab?: DesktopCategoryTab;
  onDesktopTabChange?: (tab: DesktopCategoryTab) => void;
  onSearchQuery?: (query: string) => void;
  onOpenMenuDrawer?: () => void;
  onOpenProfile?: () => void;
  unreadMessagesCount?: number;
  onOpenNotifications?: () => void;
  onSelectAdminSubTab?: (tab: 'OVERVIEW' | 'TRANSACTIONS' | 'USERS' | 'TREASURY' | 'INVESTMENTS' | 'PLANS') => void;
  onRefreshApp?: () => void;
  onGoHome?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  wallet,
  treasury,
  investments,
  language,
  onLanguageChange,
  viewMode,
  onViewModeChange,
  onOpenDeposit,
  onOpenWithdraw,
  onOpenRules,
  onOpenReferral,
  onSimulateDay,
  isSimulating,
  currentUser,
  onLogout,
  isAdminHubActive = false,
  onToggleAdminHub,
  desktopTab,
  onDesktopTabChange,
  onSearchQuery,
  onOpenMenuDrawer,
  onOpenProfile,
  unreadMessagesCount = 0,
  onOpenNotifications,
  onSelectAdminSubTab,
  onRefreshApp,
  onGoHome,
}) => {
  const isHi = language === 'hi';
  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'STAFF';
  const [searchVal, setSearchVal] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    if (onRefreshApp) {
      onRefreshApp();
    } else {
      window.location.reload();
    }
    setTimeout(() => setIsRefreshing(false), 1200);
  };

  const hasRoyaltyStarted = !isAdmin && (
    (wallet?.royaltyEarned !== undefined && wallet.royaltyEarned > 0) ||
    (investments && investments.some(i => i.status === 'ACTIVE' && i.royaltyStage === '1825D_ROYALTY'))
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchQuery) onSearchQuery(searchVal);
    if (onDesktopTabChange) onDesktopTabChange('plans');
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-900/60 text-white shadow-xl w-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-3">
          
          {/* Left: Menu Button (Drawer trigger) & Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Main Menu Button (Always visible on mobile & desktop if logged in) */}
            {currentUser && (
              <button
                id="btn-main-menu-drawer"
                onClick={onOpenMenuDrawer}
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
                title={isHi ? 'मुख्य मेन्यू खोलें' : 'Open Menu'}
              >
                <Menu className="w-5 h-5 text-amber-400" />
                <span className="hidden sm:inline text-xs font-bold text-slate-200">
                  {isHi ? 'मेन्यू' : 'Menu'}
                </span>
              </button>
            )}

            {/* GCap Brand - Click navigates to Home Page from any screen */}
            <button
              id="btn-nav-brand-home"
              onClick={() => {
                if (onGoHome) {
                  onGoHome();
                } else {
                  if (isAdminHubActive && onSelectAdminSubTab) {
                    onSelectAdminSubTab('OVERVIEW');
                  }
                  if (onDesktopTabChange) {
                    onDesktopTabChange('dashboard');
                  }
                }
              }}
              className="flex items-center gap-2.5 cursor-pointer select-none hover:opacity-80 transition-all active:scale-95 px-1 py-0.5 rounded-lg focus:outline-none"
              title={isHi ? 'मुख्य होम पेज पर जाएँ' : 'Go to Home Page'}
            >
              <span className="font-black text-xl sm:text-2xl tracking-tight text-white">
                GCap
              </span>
            </button>
          </div>

          {/* Center Search Bar Removed */}
          <div className="hidden md:flex flex-1 max-w-sm lg:max-w-md mx-2 relative items-center"></div>

          {/* Right Actions: Wallet Pill, Deposit, View Switcher */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Compact Wallet Pill (Total Royalty Earning or Total Earning) */}
            {currentUser && (
              <div
                onClick={() => {
                  if (isAdmin && onSelectAdminSubTab) {
                    onSelectAdminSubTab('TREASURY');
                  } else if (onDesktopTabChange) {
                    onDesktopTabChange('wallet');
                  }
                }}
                className={`flex items-center gap-1.5 sm:gap-2 bg-slate-950/80 border ${
                  hasRoyaltyStarted
                    ? 'border-amber-500/50 bg-amber-950/25 hover:border-amber-500/70'
                    : 'border-slate-800 hover:border-emerald-500/40'
                } rounded-xl px-2.5 py-1 sm:py-1.5 shadow-inner cursor-pointer transition-colors`}
                title={
                  isAdmin
                    ? (isHi ? 'कंपनी मुख्य बैलेंस' : 'Company Main Balance')
                    : hasRoyaltyStarted
                    ? (isHi ? 'कुल रॉयल्टी कमाई' : 'Total Royalty Earnings')
                    : (isHi ? 'कुल कमाई' : 'Total Earnings')
                }
              >
                {hasRoyaltyStarted && !isAdmin ? (
                  <span className="text-sm shrink-0 leading-none">👑</span>
                ) : (
                  <WalletIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                )}
                <div className="leading-none">
                  <span className="text-[9px] text-slate-400 block font-medium hidden sm:block">
                    {isAdmin
                      ? (isHi ? 'कंपनी बैलेंस' : 'Company Balance')
                      : hasRoyaltyStarted
                      ? (isHi ? 'कुल रॉयल्टी कमाई' : 'Total Royalty')
                      : (isHi ? 'कुल कमाई' : 'Total Earnings')}
                  </span>
                  <span className={`text-xs sm:text-sm font-bold font-mono ${hasRoyaltyStarted && !isAdmin ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {formatINR(
                      isAdmin
                        ? (treasury?.balance !== undefined ? treasury.balance : (wallet?.totalEarned || 0))
                        : hasRoyaltyStarted
                        ? (wallet?.royaltyEarned || 0)
                        : (wallet?.totalEarned || 0)
                    )}
                  </span>
                </div>
              </div>
            )}

            {/* Quick Add Money Button */}
            {currentUser && (
              <button
                id="btn-nav-deposit-quick"
                onClick={onOpenDeposit}
                className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow cursor-pointer transition-all active:scale-95"
              >
                <PlusCircle className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">{isHi ? 'पैसे जोड़ें' : 'Add'}</span>
              </button>
            )}

            {/* In-App 1-Tap Live Refresh / Sync Button Removed from Header */}
            {currentUser && (
              /* Refresh button is only inside Navigation Menu */
              null
            )}

            {/* User Profile Detail Button with integrated Notifications Bell */}
            {currentUser && (
              <button
                id="btn-nav-profile-notifications"
                onClick={onOpenProfile || onOpenNotifications}
                className="relative flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-500/40 text-cyan-300 font-semibold text-xs transition-all cursor-pointer shadow-sm active:scale-95"
                title={isHi ? 'प्रोफ़ाइल विवरण एवं सूचनाएं' : 'Profile Details & Notifications'}
              >
                <div className="w-5.5 h-5.5 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="hidden sm:inline max-w-[110px] truncate font-bold">{currentUser.name || (isHi ? 'प्रोफ़ाइल' : 'Profile')}</span>

                {/* Integrated Notification Bell */}
                <div 
                  onClick={(e) => {
                    if (onOpenNotifications) {
                      e.stopPropagation();
                      onOpenNotifications();
                    }
                  }}
                  className="relative flex items-center justify-center pl-1 border-l border-cyan-500/30 text-amber-400 hover:text-amber-300 cursor-pointer"
                  title={isHi ? 'सूचनाएं' : 'Notifications'}
                >
                  <Bell className="w-4 h-4 text-amber-400" />
                  {unreadMessagesCount > 0 && (
                    <span className="absolute -top-2 -right-2 min-w-[16px] h-[16px] px-1 bg-amber-500 text-slate-950 rounded-full text-[9px] font-black flex items-center justify-center border-2 border-slate-900 shadow-sm animate-pulse">
                      {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                    </span>
                  )}
                </div>
              </button>
            )}

            {/* Static Admin Indicator */}
            {isAdmin && (
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 shadow-md shadow-emerald-950/20"
              >
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isHi ? '👑 मुख्य एडमिन' : '👑 Master Admin'}</span>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
