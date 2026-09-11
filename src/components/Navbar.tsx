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
            {/* Main Menu Button (Always visible on mobile & desktop) */}
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

            {/* Logo */}
            <div
              onClick={() => onDesktopTabChange && onDesktopTabChange('dashboard')}
              className="flex items-center gap-2 cursor-pointer select-none"
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

          {/* Right Actions: Wallet Pill, Deposit, View Switcher */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Compact Wallet Pill */}
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

            {/* Quick Add Money Button */}
            <button
              id="btn-nav-deposit-quick"
              onClick={onOpenDeposit}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow cursor-pointer transition-all active:scale-95"
            >
              <PlusCircle className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">{isHi ? 'पैसे जोड़ें' : 'Add'}</span>
            </button>

            {/* User Profile / Bank Account Details Button */}
            {currentUser && onOpenProfile && (
              <button
                id="btn-nav-profile"
                onClick={onOpenProfile}
                className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 font-semibold text-xs transition-all cursor-pointer"
                title={isHi ? 'प्रोफ़ाइल एवं बैंक विवरण' : 'Profile & Bank Details'}
              >
                <div className="w-5 h-5 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-[10px]">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="hidden md:inline max-w-[100px] truncate">{currentUser.name}</span>
              </button>
            )}

            {/* Notifications Button */}
            {onOpenNotifications && (
              <button
                id="btn-nav-notifications"
                onClick={onOpenNotifications}
                className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-amber-400 transition-all cursor-pointer shadow-sm active:scale-95"
                title={isHi ? 'सूचनाएं एवं संदेश' : 'Notifications & Messages'}
              >
                <Bell className="w-4 h-4" />
                {unreadMessagesCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-amber-500 text-slate-950 rounded-full text-[10px] font-black flex items-center justify-center border-2 border-slate-900 shadow-sm animate-pulse">
                    {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                  </span>
                )}
              </button>
            )}

            {/* Language Switcher - Visible on ALL screens (Mobile & Desktop) */}
            <button
              id="btn-nav-lang"
              onClick={() => onLanguageChange(isHi ? 'en' : 'hi')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-amber-500/30 text-xs text-amber-300 font-bold transition-all cursor-pointer shadow-sm active:scale-95"
              title={isHi ? 'भाषा बदलें (Switch to English)' : 'Switch to Hindi'}
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>{isHi ? '🇮🇳 हिंदी' : '🇬🇧 English'}</span>
            </button>

            {/* View Mode Switcher (Desktop PC vs Mobile) */}
            <button
              id="btn-view-mode-toggle"
              onClick={() => onViewModeChange(viewMode === 'web' ? 'android' : 'web')}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                viewMode === 'android'
                  ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
              title={viewMode === 'web' ? 'Switch to Full-Screen Mobile App' : 'Switch to Web View'}
            >
              {viewMode === 'web' ? (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">{isHi ? 'मोबाइल' : 'Mobile'}</span>
                </>
              ) : (
                <>
                  <Monitor className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden sm:inline">{isHi ? 'कंप्यूटर' : 'PC'}</span>
                </>
              )}
            </button>

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
