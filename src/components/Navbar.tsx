import React, { useState } from 'react';
import {
  Menu,
  TrendingUp,
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
} from 'lucide-react';
import {
  Language,
  UserProfile,
  ViewMode,
  Wallet,
  LiveInterfaceConfig,
  DesktopCategoryTab,
} from '../types';
import { formatINR } from '../utils/storage';

interface NavbarProps {
  wallet: Wallet;
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
}

export const Navbar: React.FC<NavbarProps> = ({
  wallet,
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
}) => {
  const isHi = language === 'hi';
  const isAdmin = currentUser?.role === 'ADMIN';
  const [searchVal, setSearchVal] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchQuery) onSearchQuery(searchVal);
    if (onDesktopTabChange) onDesktopTabChange('plans');
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/98 backdrop-blur-md border-b border-slate-800 text-white shadow-xl w-full">
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

            {/* Logo - Click navigates to Home Page */}
            <div
              onClick={() => {
                if (isAdminHubActive && onSelectAdminSubTab) {
                  onSelectAdminSubTab('OVERVIEW');
                } else if (onDesktopTabChange) {
                  onDesktopTabChange('dashboard');
                }
              }}
              className="flex items-center gap-2 cursor-pointer select-none hover:opacity-90 transition-all active:scale-95"
              title={isHi ? 'मुख्य होम पेज पर जाएँ' : 'Go to Home Page'}
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-amber-400 via-emerald-400 to-teal-400 flex items-center justify-center shadow-md text-slate-950 font-black">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="flex items-center gap-1">
                <span className="font-black text-lg sm:text-xl tracking-tight text-white">
                  GCap
                </span>
                <span className="text-[9px] uppercase font-black px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {isHi ? 'प्लस ⚡' : 'PLUS'}
                </span>
              </div>
            </div>
          </div>

          {/* Center Search Bar (Hidden on very small screens, responsive) */}
          {currentUser && (
            <form
              onSubmit={handleSearch}
              className="hidden md:flex flex-1 max-w-sm lg:max-w-md mx-2 relative items-center"
            >
              <div className="relative w-full flex items-center">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  value={searchVal}
                  onChange={(e) => {
                    setSearchVal(e.target.value);
                    if (onSearchQuery) onSearchQuery(e.target.value);
                  }}
                  placeholder={
                    isHi
                      ? 'प्लान्स, रिटर्न खोजें (641D, 365D)...'
                      : 'Search plans, daily ROI (641D, 365D)...'
                  }
                  className="w-full pl-8 pr-16 py-1.5 bg-slate-950/80 border border-slate-800 hover:border-slate-700 focus:border-amber-400 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="absolute right-1 px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs cursor-pointer"
                >
                  {isHi ? 'सर्च' : 'Find'}
                </button>
              </div>
            </form>
          )}

          {/* Right Actions: Wallet Pill, Deposit, View Switcher */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Compact Wallet Pill */}
            {currentUser && (
              <div
                onClick={() => onDesktopTabChange && onDesktopTabChange('wallet')}
                className="flex items-center gap-1.5 sm:gap-2 bg-slate-950/80 border border-slate-800 hover:border-emerald-500/40 rounded-xl px-2.5 py-1 sm:py-1.5 shadow-inner cursor-pointer transition-colors"
              >
                <WalletIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <div className="leading-none">
                  <span className="text-[9px] text-slate-400 block font-medium hidden sm:block">
                    {isHi ? 'बैलेंस' : 'Balance'}
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-emerald-400 font-mono">
                    {formatINR(wallet.cashBalance)}
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

            {/* Admin Hub Toggle (if Admin) */}
            {isAdmin && onToggleAdminHub && (
              <button
                id="btn-nav-admin-toggle"
                onClick={onToggleAdminHub}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer shadow-md active:scale-95 ${
                  isAdminHubActive
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 border-amber-300 shadow-amber-500/20'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30'
                }`}
                title="Admin Control Hub"
              >
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>{isAdminHubActive ? (isHi ? 'यूज़र व्यू' : 'User') : (isHi ? '👑 एडमिन' : '👑 Admin')}</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
