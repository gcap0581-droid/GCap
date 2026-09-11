import React, { useState, useEffect } from 'react';
import {
  Menu,
  Home,
  TrendingUp,
  Clock,
  Wallet as WalletIcon,
  Receipt,
  FileText,
  Search,
  PlusCircle,
  ArrowDownToLine,
  RefreshCw,
  LogOut,
  Sliders,
  Shield,
  Layers,
  ChevronRight,
  Calculator,
  Gift,
  Award,
  ArrowLeft,
  Bell,
} from 'lucide-react';
import { Language, UserProfile, Wallet, DesktopCategoryTab } from '../types';
import { formatINR } from '../utils/storage';

interface AndroidFrameProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  language: Language;
  onExitMobile: () => void;
  currentUser?: UserProfile | null;
  onLogout?: () => void;
  onSearchQuery?: (query: string) => void;
  wallet?: Wallet;
  onOpenDeposit?: () => void;
  onOpenWithdraw?: () => void;
  onOpenSwap?: () => void;
  onOpenRules?: () => void;
  onOpenReferral?: () => void;
  isAdminHubActive?: boolean;
  onToggleAdminHub?: () => void;
  unreadMessagesCount?: number;
  onOpenNotifications?: () => void;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  activeTab,
  onTabChange,
  language,
  onExitMobile,
  currentUser,
  onLogout,
  onSearchQuery,
  wallet,
  onOpenDeposit,
  onOpenWithdraw,
  onOpenSwap,
  onOpenRules,
  onOpenReferral,
  isAdminHubActive = false,
  onToggleAdminHub,
  unreadMessagesCount = 0,
  onOpenNotifications,
}) => {
  const isHi = language === 'hi';
  const isAdmin = currentUser?.role === 'ADMIN';
  const [mobileSearch, setMobileSearch] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchQuery) onSearchQuery(mobileSearch);
    onTabChange('plans');
  };

  return (
    <div
      className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col overflow-x-hidden relative"
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)',
      }}
    >
      {/* 1. Mobile App Top Bar */}
      <header className="sticky top-0 z-30 bg-slate-900/98 backdrop-blur-md border-b border-slate-800 px-3.5 py-2.5 flex items-center justify-between gap-2 shadow-md shrink-0 w-full">
        
        {/* Left: Mobile Drawer / Menu Icon + Brand + Back button */}
        <div className="flex items-center gap-2">
          {activeTab !== 'dashboard' ? (
            <button
              onClick={() => onTabChange('dashboard')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all cursor-pointer active:scale-95 shadow-sm"
              title={isHi ? 'मुख्य स्क्रीन पर वापस जाएं' : 'Back to Home'}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{isHi ? 'वापस' : 'Back'}</span>
            </button>
          ) : (
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-1.5 rounded-lg bg-slate-800 text-amber-400 hover:bg-slate-700 transition-colors cursor-pointer"
              title={isHi ? 'मेन्यू खोलें' : 'Open Menu'}
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div
            onClick={() => onTabChange('dashboard')}
            className="flex items-center gap-1.5 cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-400 via-emerald-400 to-teal-400 flex items-center justify-center font-black text-slate-950 text-xs shadow-sm">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1">
              <span className="font-black text-base tracking-tight text-white">GCap</span>
              <span className="text-[8px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                APP
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quick Balance, Notification Bell & Exit Mobile Mode */}
        <div className="flex items-center gap-1.5">
          {wallet && (
            <div
              onClick={() => onTabChange('wallet')}
              className="flex items-center gap-1 bg-slate-950/80 border border-slate-800 rounded-lg px-2 py-1 cursor-pointer"
            >
              <WalletIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-mono font-bold text-emerald-400">
                {formatINR(wallet.cashBalance)}
              </span>
            </div>
          )}

          {/* Mobile Notifications Bell Button */}
          {onOpenNotifications && (
            <button
              id="btn-mobile-notifications"
              onClick={onOpenNotifications}
              className="relative p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 transition-all cursor-pointer"
              title={isHi ? 'सूचनाएं' : 'Notifications'}
            >
              <Bell className="w-4 h-4" />
              {unreadMessagesCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-0.5 bg-amber-500 text-slate-950 rounded-full text-[9px] font-black flex items-center justify-center border border-slate-900 animate-pulse">
                  {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                </span>
              )}
            </button>
          )}

          <button
            onClick={onExitMobile}
            className="text-[10px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer font-medium"
            title="Switch to PC View"
          >
            {isHi ? 'कंप्यूटर' : 'Web'}
          </button>
        </div>
      </header>

      {/* 2. Compact Search Strip */}
      <div className="bg-slate-900/80 px-3.5 py-2 border-b border-slate-800/80 shrink-0">
        <form onSubmit={handleMobileSearch} className="relative w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={mobileSearch}
            onChange={(e) => {
              setMobileSearch(e.target.value);
              if (onSearchQuery) onSearchQuery(e.target.value);
            }}
            placeholder={isHi ? 'प्लान्स या रिटर्न खोजें (उदा. 641D)...' : 'Search schemes, daily returns...'}
            className="w-full pl-8 pr-14 py-1.5 bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            className="absolute right-1 top-1/2 -translate-y-1/2 px-2.5 py-0.5 rounded-lg bg-amber-500 text-[11px] font-bold text-slate-950 cursor-pointer"
          >
            {isHi ? 'सर्च' : 'Find'}
          </button>
        </form>
      </div>

      {/* Sub-Header Back Navigation Bar for Mobile Sub-Screens */}
      {activeTab !== 'dashboard' && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-900 border-b border-amber-500/30 px-3.5 py-2 flex items-center justify-between shadow-sm shrink-0">
          <button
            onClick={() => onTabChange('dashboard')}
            className="flex items-center gap-1.5 text-xs font-black text-amber-400 hover:text-amber-300 transition-colors cursor-pointer active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isHi ? '← वापस मुख्य होम स्क्रीन (Back to Home)' : '← Back to Home Dashboard'}</span>
          </button>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700 uppercase tracking-wider">
            {activeTab}
          </span>
        </div>
      )}

      {/* 3. Main Full-Screen Vertical Scroll Container (Only Vertical Scroll, No Left-Right Overflow) */}
      <main
        className="flex-1 w-full max-w-full overflow-y-auto overflow-x-hidden px-3.5 py-3 space-y-4"
        style={{
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 6.5rem)',
        }}
      >
        {children}
      </main>

      {/* 4. Bottom Mobile App Floating Tab Bar (High Visibility, Floating Pill, Stays strictly above native nav bar) */}
      <div
        className="fixed left-3 right-3 z-50 max-w-md mx-auto pointer-events-auto"
        style={{
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.75rem)',
        }}
      >
        <nav className="bg-slate-900/98 backdrop-blur-xl border-2 border-amber-500/60 rounded-2xl p-2 shadow-2xl shadow-amber-500/30 flex items-center justify-around gap-1">
        {[
          { id: 'dashboard', label: isHi ? 'होम' : 'Home', icon: Home, isAction: false },
          { id: 'plans', label: isHi ? 'प्लान्स' : 'Plans', icon: Layers, isAction: false },
          { id: 'investments', label: isHi ? 'पोर्टफोलियो' : 'Portfolio', icon: Clock, isAction: false },
          { id: 'wallet', label: isHi ? 'वॉलेट' : 'Wallet', icon: WalletIcon, isAction: false },
          ...(isAdmin && onToggleAdminHub
            ? [{ id: 'admin_hub', label: isHi ? '👑 एडमिन' : '👑 Admin', icon: Award, isAction: true }]
            : [{ id: 'rules', label: isHi ? 'नियम' : 'Rules', icon: FileText, isAction: false }]),
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.isAction ? isAdminHubActive : activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.isAction && onToggleAdminHub) {
                  onToggleAdminHub();
                } else {
                  onTabChange(tab.id);
                }
              }}
              className={`flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-t from-amber-500/30 to-amber-500/10 text-amber-300 font-extrabold border border-amber-400/50 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5] text-amber-400 scale-110' : 'stroke-2 text-slate-300'}`} />
              <span className={`text-[10px] font-bold mt-1 whitespace-nowrap ${isActive ? 'text-amber-200 font-extrabold' : 'text-slate-300'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
      </div>

      {/* 5. Mobile Slide-Over Menu Drawer (Organized Menu & Submenu system) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex overflow-hidden animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div className="relative w-4/5 max-w-xs bg-slate-900 border-r border-slate-800 h-full flex flex-col z-10 shadow-2xl overflow-y-auto">
            
            {/* Drawer Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-400 to-emerald-400 flex items-center justify-center font-black text-slate-950 text-sm">
                  G
                </div>
                <div>
                  <div className="font-bold text-sm text-white">GCap Menu</div>
                  <div className="text-[10px] text-slate-400">
                    {isHi ? 'मेन्यू एवं विकल्प' : 'App Navigation'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* User Info */}
            {currentUser && (
              <div className="px-4 py-3 bg-slate-950/50 border-b border-slate-800/80 text-xs">
                <div className="font-bold text-white truncate">{currentUser.name}</div>
                <div className="text-[10px] text-slate-400 font-mono">ID: {currentUser.loginId}</div>
              </div>
            )}

            {/* Menu List */}
            <div className="p-3 space-y-3 flex-1 text-xs">
              
              {/* Category 1: Plans */}
              <div className="space-y-1">
                <div className="text-[10px] uppercase font-bold text-amber-400 px-2">
                  {isHi ? 'निवेश मेन्यू' : 'Investments'}
                </div>
                <button
                  onClick={() => {
                    onTabChange('plans');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg bg-slate-800/40 hover:bg-slate-800 text-slate-200 flex items-center justify-between"
                >
                  <span>{isHi ? '• उपलब्ध प्लान्स (641D / 365D)' : '• All Investment Plans'}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </button>
                <button
                  onClick={() => {
                    onTabChange('investments');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg bg-slate-800/40 hover:bg-slate-800 text-slate-200 flex items-center justify-between"
                >
                  <span>{isHi ? '• माई पोर्टफोलियो (सक्रिय निवेश)' : '• My Active Portfolio'}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </button>
              </div>

              {/* Category 2: Wallet */}
              <div className="space-y-1">
                <div className="text-[10px] uppercase font-bold text-emerald-400 px-2">
                  {isHi ? 'वॉलेट व लेनदेन' : 'Wallet Actions'}
                </div>
                {onOpenDeposit && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenDeposit();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg bg-slate-800/40 hover:bg-slate-800 text-slate-200 flex items-center justify-between"
                  >
                    <span>{isHi ? '• पैसे जोड़ें (Deposit via UPI/QR)' : '• Deposit Funds (UPI/QR)'}</span>
                    <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                  </button>
                )}
                {onOpenWithdraw && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenWithdraw();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg bg-slate-800/40 hover:bg-slate-800 text-slate-200 flex items-center justify-between"
                  >
                    <span>{isHi ? '• निकासी अनुरोध (Withdrawal)' : '• Withdrawal Request'}</span>
                    <ArrowDownToLine className="w-3.5 h-3.5 text-purple-400" />
                  </button>
                )}
                {onOpenSwap && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenSwap();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg bg-slate-800/40 hover:bg-slate-800 text-slate-200 flex items-center justify-between"
                  >
                    <span>{isHi ? '• फंड स्वैप (Cash ⇄ G-Points)' : '• Swap Cash ⇄ GP'}</span>
                    <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                  </button>
                )}
                <button
                  onClick={() => {
                    onTabChange('wallet');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg bg-slate-800/40 hover:bg-slate-800 text-slate-200 flex items-center justify-between"
                >
                  <span>{isHi ? '• पासबुक व स्टेटमेंट' : '• Wallet Passbook'}</span>
                  <Receipt className="w-3.5 h-3.5 text-slate-500" />
                </button>
              </div>

              {/* Category 3: Rules & Referral */}
              <div className="space-y-1">
                <div className="text-[10px] uppercase font-bold text-teal-400 px-2">
                  {isHi ? 'नीतियां व शेयर' : 'Rules & Rewards'}
                </div>
                {onOpenRules && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenRules();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg bg-slate-800/40 hover:bg-slate-800 text-slate-200 flex items-center justify-between"
                  >
                    <span>{isHi ? '• नियम व शर्तें (Rules)' : '• Official Rules'}</span>
                    <FileText className="w-3.5 h-3.5 text-teal-400" />
                  </button>
                )}
                {onOpenReferral && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenReferral();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg bg-slate-800/40 hover:bg-slate-800 text-slate-200 flex items-center justify-between"
                  >
                    <span>{isHi ? '• रेफरल लिंक व टीम बोनस' : '• Share & Earn Referral'}</span>
                    <Gift className="w-3.5 h-3.5 text-amber-400" />
                  </button>
                )}
              </div>

            </div>

            {/* Drawer Footer */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 space-y-2">
              {currentUser && onLogout && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full py-2 rounded-lg bg-rose-500/15 text-rose-300 font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{isHi ? 'लॉगआउट करें' : 'Sign Out'}</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
