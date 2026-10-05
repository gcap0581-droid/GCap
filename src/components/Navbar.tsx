import React, { useState } from 'react';
import {
  Menu,
  Wallet as WalletIcon,
  PlusCircle,
  Award,
  Bell,
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
import { PRIMARY_COMPANY_LOGO } from '../utils/logoAssets';

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
  onOpenAssistant?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  wallet,
  treasury,
  language,
  currentUser,
  isAdminHubActive = false,
  onDesktopTabChange,
  onOpenMenuDrawer,
  onOpenProfile,
  unreadMessagesCount = 0,
  onOpenNotifications,
  onSelectAdminSubTab,
  onOpenDeposit,
  onGoHome,
}) => {
  const isHi = language === 'hi';
  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'STAFF';
  const isCompanyView = isAdminHubActive && isAdmin;

  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-2xl border-b border-white/[0.08] text-white shadow-2xl shadow-black/60 w-full transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-3">
          
          {/* Left: Menu Button (Drawer trigger) & Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Main Menu Button */}
            {currentUser && (
              <button
                id="btn-main-menu-drawer"
                onClick={onOpenMenuDrawer}
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-amber-400 border border-amber-500/30 flex items-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-amber-500/20 active:scale-95"
                title={isHi ? 'मुख्य मेन्यू खोलें' : 'Open Menu'}
              >
                <Menu className="w-5 h-5 text-amber-400" />
                <span className="hidden sm:inline text-xs font-bold text-slate-200">
                  {isHi ? 'मेन्यू' : 'Menu'}
                </span>
              </button>
            )}

            {/* GCap Brand */}
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
              className="flex items-center gap-2 sm:gap-2.5 cursor-pointer select-none hover:opacity-90 transition-all active:scale-95 px-1 py-0.5 rounded-xl focus:outline-none"
              title={isHi ? 'मुख्य होम पेज पर जाएँ' : 'Go to Home Page'}
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden border border-amber-400/60 bg-slate-950 shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.35)] flex items-center justify-center">
                <img
                  src={PRIMARY_COMPANY_LOGO}
                  onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement;
                    if (!img.dataset.triedFallback1) {
                      img.dataset.triedFallback1 = 'true';
                      img.src = '/assets/images/gcap-luxury-gold-3d.jpg';
                    } else if (!img.dataset.triedFallback2) {
                      img.dataset.triedFallback2 = 'true';
                      img.src = '/assets/images/logo.jpg';
                    } else if (!img.dataset.triedFallback3) {
                      img.dataset.triedFallback3 = 'true';
                      img.src = '/logo.jpg';
                    }
                  }}
                  alt="GCap Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-black text-xl sm:text-2xl tracking-tight text-white font-display">
                GCap
              </span>
            </button>
          </div>

          <div className="hidden md:flex flex-1 max-w-sm lg:max-w-md mx-2 relative items-center"></div>

          {/* Right Actions: Wallet Pill, Deposit, Profile & Notifications */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Compact Wallet Pill */}
            {currentUser && (
              <div
                onClick={() => {
                  if (isCompanyView && onSelectAdminSubTab) {
                    onSelectAdminSubTab('TREASURY');
                  } else if (onDesktopTabChange) {
                    onDesktopTabChange('wallet');
                  }
                }}
                className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-slate-900/95 to-slate-950/95 border border-emerald-500/30 hover:border-amber-400/50 rounded-xl px-2.5 py-1 sm:py-1.5 shadow-md shadow-black/40 cursor-pointer transition-all active:scale-95"
                title={
                  isCompanyView
                    ? (isHi ? 'कंपनी मुख्य बैलेंस' : 'Company Main Balance')
                    : (isHi ? 'कुल कमाई (Total Earnings)' : 'Total Earnings')
                }
              >
                {!isCompanyView ? (
                  <span className="text-sm shrink-0 leading-none">💰</span>
                ) : (
                  <WalletIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                )}
                <div className="leading-none">
                  <span className="text-[9px] text-slate-400 block font-semibold hidden sm:block">
                    {isCompanyView
                      ? (isHi ? 'कंपनी बैलेंस' : 'Company Balance')
                      : (isHi ? 'कुल कमाई' : 'Total Earnings')}
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold font-mono text-emerald-300">
                    {formatINR(
                      (() => {
                        if (isCompanyView) {
                          return treasury?.balance !== undefined ? treasury.balance : 0;
                        }
                        const grossEarned = (wallet?.totalEarned || 0) + (wallet?.royaltyEarned || 0);
                        const withdrawn = wallet?.totalWithdrawn || 0;
                        if (withdrawn > 0 && grossEarned >= withdrawn) {
                          return Math.max(0, grossEarned - withdrawn);
                        }
                        return Math.max(0, grossEarned);
                      })()
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
                className="flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-extrabold text-xs shadow-lg shadow-emerald-900/40 cursor-pointer transition-all active:scale-95"
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
                className="relative flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-950/80 to-slate-900/80 hover:from-cyan-900/80 hover:to-slate-800/80 border border-cyan-500/40 text-cyan-300 font-semibold text-xs transition-all cursor-pointer shadow-md shadow-black/40 active:scale-95"
                title={isHi ? 'प्रोफ़ाइल विवरण एवं सूचनाएं' : 'Profile Details & Notifications'}
              >
                <div className="w-5.5 h-5.5 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-extrabold text-xs shrink-0 border border-cyan-500/30">
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black border border-amber-500/40 bg-gradient-to-r from-amber-500/15 to-yellow-500/15 text-amber-300 shadow-md shadow-amber-950/30"
              >
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>{isHi ? '👑 मुख्य एडमिन' : '👑 Master Admin'}</span>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
