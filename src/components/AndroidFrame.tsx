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
  LayoutDashboard,
  MessageSquare,
  Building2,
  Users,
  Activity,
  Globe,
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
  onLanguageChange?: (lang: Language) => void;
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
  onLanguageChange,
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
        paddingTop: 0,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)',
      }}
    >
      {/* 1. Mobile App Top Bar */}
      <header
        className="sticky top-0 z-30 bg-slate-900/98 backdrop-blur-md border-b border-slate-800 px-3.5 pb-2.5 flex items-center justify-between gap-2 shadow-md shrink-0 w-full"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 10px)',
        }}
      >
        
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

          {onLanguageChange && (
            <button
              onClick={() => onLanguageChange(language === 'hi' ? 'en' : 'hi')}
              className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
              title={isHi ? 'भाषा बदलें' : 'Change Language'}
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isHi ? 'English' : 'हिंदी'}</span>
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
      {currentUser && (
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
      )}

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
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 2rem)',
        }}
      >
        {children}
      </main>

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
              
              {isAdminHubActive ? (
                /* Admin Hub Navigation Options */
                <div className="space-y-1">
                  <div className="text-[10px] uppercase font-bold text-amber-400 px-2 flex items-center justify-between mb-2">
                    <span>{isHi ? 'एडमिन हब विकल्प' : 'Admin Hub Menu'}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">Admin</span>
                  </div>

                  {/* 1. OVERVIEW */}
                  <button
                    onClick={() => {
                      onTabChange('OVERVIEW');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                      activeTab === 'OVERVIEW' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40' : 'bg-slate-800/40 hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <LayoutDashboard className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isHi ? '• सिस्टम डैशबोर्ड (Overview)' : '• System Dashboard'}</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  </button>

                  {/* 2. MESSAGES */}
                  <button
                    onClick={() => {
                      onTabChange('MESSAGES');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                      activeTab === 'MESSAGES' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40' : 'bg-slate-800/40 hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isHi ? '• लाइव संदेश व अलर्ट्स' : '• Live Messages'}</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  </button>

                  {/* 3. TREASURY */}
                  <button
                    onClick={() => {
                      onTabChange('TREASURY');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                      activeTab === 'TREASURY' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40' : 'bg-slate-800/40 hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{isHi ? '• कंपनी ट्रेजरी रिज़र्व' : '• Company Treasury'}</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  </button>

                  {/* 4. INVESTMENTS */}
                  <button
                    onClick={() => {
                      onTabChange('INVESTMENTS');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                      activeTab === 'INVESTMENTS' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40' : 'bg-slate-800/40 hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                      <span>{isHi ? '• सक्रिय पोर्टफोलियो' : '• Active Portfolios'}</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  </button>

                  {/* 5. PLANS */}
                  <button
                    onClick={() => {
                      onTabChange('PLANS');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                      activeTab === 'PLANS' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40' : 'bg-slate-800/40 hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-teal-400" />
                      <span>{isHi ? '• प्लान्स प्रबंधन (CRUD)' : '• Plans CRUD Management'}</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  </button>

                  {/* 6. USERS */}
                  <button
                    onClick={() => {
                      onTabChange('USERS');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                      activeTab === 'USERS' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40' : 'bg-slate-800/40 hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-purple-400" />
                      <span>{isHi ? '• यूजर्स डेटाबेस' : '• Users DB & Profiles'}</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  </button>

                  {/* 7. TRANSACTIONS */}
                  <button
                    onClick={() => {
                      onTabChange('TRANSACTIONS');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                      activeTab === 'TRANSACTIONS' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40' : 'bg-slate-800/40 hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Receipt className="w-3.5 h-3.5 text-sky-400" />
                      <span>{isHi ? '• सभी लेन-देन सूची' : '• Transactions Ledger'}</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  </button>

                  {/* 8. BACKUP */}
                  <button
                    onClick={() => {
                      onTabChange('BACKUP');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                      activeTab === 'BACKUP' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40' : 'bg-slate-800/40 hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-pink-400" />
                      <span>{isHi ? '• डेटाबेस बैकअप' : '• System Backups'}</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  </button>

                  {/* 9. COMPANY_PROFILE */}
                  <button
                    onClick={() => {
                      onTabChange('COMPANY_PROFILE');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                      activeTab === 'COMPANY_PROFILE' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40' : 'bg-slate-800/40 hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-red-400" />
                      <span>{isHi ? '• लीगल कंपनी प्रोफाइल' : '• Company Legal Profile'}</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  </button>

                  {/* 10. OTA */}
                  <button
                    onClick={() => {
                      onTabChange('OTA');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                      activeTab === 'OTA' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40' : 'bg-slate-800/40 hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5 text-teal-400" />
                      <span>{isHi ? '• ओवर-द-एयर (OTA) सेटिंग' : '• Live OTA Config'}</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  </button>

                  {/* Switch to Investor Mode button inside Drawer for Admins */}
                  {onToggleAdminHub && (
                    <div className="pt-4 mt-4 border-t border-slate-800">
                      <button
                        onClick={() => {
                          onToggleAdminHub();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between bg-gradient-to-r from-teal-500/20 to-emerald-500/20 border border-teal-500/40 text-teal-300 font-bold"
                      >
                        <span className="flex items-center gap-2">
                          <Award className="w-3.5 h-3.5 text-teal-400" />
                          <span>{isHi ? '👤 इन्वेस्टर व्यू (User Panel)' : '👤 Investor View'}</span>
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-teal-400" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Regular Investor Navigation Options */
                <>
                  {/* Category 0: Main Navigation (Home, Plans, Portfolio, Wallet, Admin) */}
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase font-bold text-amber-400 px-2 flex items-center justify-between">
                      <span>{isHi ? 'मुख्य नेविगेशन' : 'Main Navigation'}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">Menu</span>
                    </div>
                    <button
                      onClick={() => {
                        onTabChange('dashboard');
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                        activeTab === 'dashboard' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40' : 'bg-slate-800/40 hover:bg-slate-800 text-slate-200'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Home className="w-3.5 h-3.5 text-amber-400" />
                        <span>{isHi ? '• होम (मुख्य पृष्ठ)' : '• Home Dashboard'}</span>
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                    <button
                      onClick={() => {
                        onTabChange('plans');
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                        activeTab === 'plans' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40' : 'bg-slate-800/40 hover:bg-slate-800 text-slate-200'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5 text-amber-400" />
                        <span>{isHi ? '• निवेश प्लान्स (Plans)' : '• Investment Plans'}</span>
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                    <button
                      onClick={() => {
                        onTabChange('investments');
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                        activeTab === 'investments' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40' : 'bg-slate-800/40 hover:bg-slate-800 text-slate-200'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-blue-400" />
                        <span>{isHi ? '• माई पोर्टफोलियो (Portfolio)' : '• My Active Portfolio'}</span>
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                    <button
                      onClick={() => {
                        onTabChange('wallet');
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                        activeTab === 'wallet' ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40' : 'bg-slate-800/40 hover:bg-slate-800 text-slate-200'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <WalletIcon className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{isHi ? '• वॉलेट (Wallet & Passbook)' : '• Wallet & Balance'}</span>
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    </button>

                    {isAdmin && onToggleAdminHub ? (
                      <button
                        onClick={() => {
                          onToggleAdminHub();
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                          isAdminHubActive ? 'bg-amber-500/30 text-amber-200 font-bold border border-amber-400/60' : 'bg-gradient-to-r from-amber-500/20 to-purple-500/20 hover:from-amber-500/30 hover:to-purple-500/30 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Award className="w-3.5 h-3.5 text-amber-400" />
                          <span>{isHi ? '👑 कंपनी एडमिन पैनल (Admin Hub)' : '👑 Company Admin Panel'}</span>
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          onTabChange('rules');
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                          activeTab === 'rules' ? 'bg-teal-500/20 text-teal-300 font-bold border border-teal-500/40' : 'bg-slate-800/40 hover:bg-slate-800 text-slate-200'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-teal-400" />
                          <span>{isHi ? '• नियम व शर्तें (Rules)' : '• Official Rules'}</span>
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                      </button>
                    )}
                  </div>

                  {/* Category 1: Plans */}
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase font-bold text-amber-400 px-2">
                      {isHi ? '投资菜单 (Investments)' : 'Investments'}
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
                </>
              )}

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
