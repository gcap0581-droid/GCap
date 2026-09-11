import React, { useState } from 'react';
import {
  TrendingUp,
  Wallet as WalletIcon,
  Layers,
  FileText,
  Gift,
  Award,
  LogOut,
  ChevronDown,
  ChevronRight,
  PlusCircle,
  ArrowDownToLine,
  RefreshCw,
  Calculator,
  ShieldCheck,
  Zap,
  Building2,
  Globe,
  Monitor,
  Smartphone,
  X,
  User,
  Sliders,
  Clock,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import {
  Language,
  UserProfile,
  Wallet,
  DesktopCategoryTab,
  ViewMode,
} from '../types';
import { formatINR } from '../utils/storage';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  wallet: Wallet;
  currentUser?: UserProfile | null;
  onLogout?: () => void;
  activeTab: DesktopCategoryTab;
  onSelectTab: (tab: DesktopCategoryTab) => void;
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onOpenSwap: () => void;
  onOpenRules: () => void;
  onOpenReferral: () => void;
  onOpenGuides?: (guide?: 'SHORT_TERM' | 'LONG_TERM' | 'TDS_REFUND') => void;
  onOpenAgreement?: () => void;
  onSimulateDay: () => void;
  isSimulating: boolean;
  isAdminHubActive?: boolean;
  onToggleAdminHub?: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onOpenProfile?: () => void;
  onOpenSplashIntro?: () => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  language,
  onLanguageChange,
  wallet,
  currentUser,
  onLogout,
  activeTab,
  onSelectTab,
  onOpenDeposit,
  onOpenWithdraw,
  onOpenSwap,
  onOpenRules,
  onOpenReferral,
  onOpenGuides,
  onOpenAgreement,
  onSimulateDay,
  isSimulating,
  isAdminHubActive,
  onToggleAdminHub,
  viewMode,
  onViewModeChange,
  onOpenProfile,
  onOpenSplashIntro,
}) => {
  const isHi = language === 'hi';
  const isAdmin = currentUser?.role === 'ADMIN';

  // State to expand/collapse each menu section
  const [expandedMenu, setExpandedMenu] = useState<string | null>('investments');

  const toggleSection = (section: string) => {
    setExpandedMenu((prev) => (prev === section ? null : section));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-xs sm:max-w-sm bg-slate-900 border-r border-slate-800 h-full flex flex-col shadow-2xl z-10 overflow-hidden text-slate-100">
        
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 via-emerald-400 to-teal-400 flex items-center justify-center font-black text-slate-950 shadow-md">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg tracking-tight text-white">GCap</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  MENU
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                {isHi ? 'मुख्य मेन्यू व उप-विकल्प' : 'Main Menu & Options'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Summary Pill */}
        {currentUser && (
          <div
            onClick={() => {
              if (onOpenProfile) {
                onClose();
                onOpenProfile();
              }
            }}
            className="px-4 py-3 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between cursor-pointer hover:bg-slate-800/50 transition-colors group"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-cyan-500/30 transition-colors">
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate group-hover:text-cyan-300 transition-colors flex items-center gap-1">
                  <span>{currentUser.name}</span>
                  <span className="text-[10px] text-cyan-400">⚙️</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate font-mono">
                  ID: {currentUser.loginId} • {isHi ? 'प्रोफ़ाइल/बैंक डिटेल्स' : 'Edit Profile'}
                </div>
              </div>
            </div>
            <span
              className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                isAdmin ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {isAdmin ? 'ADMIN' : (isHi ? 'सत्यापित निवेशक' : 'Investor')}
            </span>
          </div>
        )}

        {/* Quick Balance Banner in Drawer */}
        <div className="px-4 py-3 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 font-medium">
              {isHi ? 'कुल उपलब्ध बैलेंस:' : 'Cash Balance:'}
            </div>
            <div className="text-base font-black text-emerald-400 font-mono">
              {formatINR(wallet.cashBalance)}
            </div>
          </div>
          <button
            onClick={() => {
              onClose();
              onOpenDeposit();
            }}
            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{isHi ? 'जोड़ें' : 'Add'}</span>
          </button>
        </div>

        {/* Accordion Menus & Submenus */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-slate-800">
          
          {/* MENU 1: निवेश योजनाएँ (Investments) */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/50 overflow-hidden">
            <button
              onClick={() => toggleSection('investments')}
              className="w-full px-3.5 py-2.5 flex items-center justify-between text-left font-bold text-xs text-white hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                  <Layers className="w-4 h-4" />
                </div>
                <span>{isHi ? '1. निवेश योजनाएँ (Plans)' : '1. Investment Schemes'}</span>
              </div>
              {expandedMenu === 'investments' ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {expandedMenu === 'investments' && (
              <div className="px-3 pb-2.5 pt-1 space-y-1 bg-slate-950/80 border-t border-slate-800/80">
                <button
                  onClick={() => {
                    onSelectTab('plans');
                    onClose();
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                    activeTab === 'plans'
                      ? 'bg-amber-500/20 text-amber-300 font-bold'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>{isHi ? 'उपलब्ध सभी प्लान्स (641D / 365D)' : 'All Investment Plans'}</span>
                  </div>
                  <span className="text-[10px] text-amber-400 font-mono">1.8% - 3.5%</span>
                </button>

                <button
                  onClick={() => {
                    onSelectTab('investments');
                    onClose();
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                    activeTab === 'investments'
                      ? 'bg-amber-500/20 text-amber-300 font-bold'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>{isHi ? 'माई पोर्टफोलियो (सक्रिय निवेश)' : 'My Active Portfolio'}</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold">Live</span>
                </button>

                <button
                  onClick={() => {
                    onSelectTab('calculator');
                    onClose();
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                    activeTab === 'calculator'
                      ? 'bg-amber-500/20 text-amber-300 font-bold'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span>{isHi ? 'दैनिक ROI मुनाफा कैलकुलेटर' : 'Daily ROI Calculator'}</span>
                  </div>
                  <Calculator className="w-3.5 h-3.5 text-cyan-400" />
                </button>
              </div>
            )}
          </div>

          {/* MENU 2: वॉलेट व बैंकिंग (Wallet & Banking) */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/50 overflow-hidden">
            <button
              onClick={() => toggleSection('wallet')}
              className="w-full px-3.5 py-2.5 flex items-center justify-between text-left font-bold text-xs text-white hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <WalletIcon className="w-4 h-4" />
                </div>
                <span>{isHi ? '2. वॉलेट व बैंकिंग (Wallet)' : '2. Wallet & Banking'}</span>
              </div>
              {expandedMenu === 'wallet' ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {expandedMenu === 'wallet' && (
              <div className="px-3 pb-2.5 pt-1 space-y-1 bg-slate-950/80 border-t border-slate-800/80">
                <button
                  onClick={() => {
                    onClose();
                    onOpenDeposit();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between text-slate-300 hover:bg-slate-800/60 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isHi ? 'पैसे जोड़ें (Deposit via UPI/QR)' : 'Deposit Funds (UPI/QR)'}</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold">0% Fee</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onOpenWithdraw();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between text-slate-300 hover:bg-slate-800/60 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <ArrowDownToLine className="w-3.5 h-3.5 text-purple-400" />
                    <span>{isHi ? 'निकासी अनुरोध (Withdrawal)' : 'Instant Withdrawal'}</span>
                  </div>
                  <span className="text-[10px] text-purple-300 font-bold">24x7</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onOpenSwap();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between text-slate-300 hover:bg-slate-800/60 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isHi ? 'फंड स्वैप (Cash ⇄ G-Points)' : 'Swap Cash ⇄ GP'}</span>
                  </div>
                  <span className="text-[10px] text-amber-400 font-mono">1:1</span>
                </button>

                <button
                  onClick={() => {
                    onSelectTab('wallet');
                    onClose();
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                    activeTab === 'wallet'
                      ? 'bg-amber-500/20 text-amber-300 font-bold'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    <span>{isHi ? 'पासबुक व लेनदेन इतिहास' : 'Passbook & Ledger'}</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* MENU 3: नीतियां व सुरक्षा (Rules & Security) */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/50 overflow-hidden">
            <button
              onClick={() => toggleSection('rules')}
              className="w-full px-3.5 py-2.5 flex items-center justify-between text-left font-bold text-xs text-white hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span>{isHi ? '3. नीतियां व सुरक्षा (Rules)' : '3. Rules & Assured'}</span>
              </div>
              {expandedMenu === 'rules' ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {expandedMenu === 'rules' && (
              <div className="px-3 pb-2.5 pt-1 space-y-1 bg-slate-950/80 border-t border-slate-800/80">
                <button
                  onClick={() => {
                    onClose();
                    onOpenRules();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between text-slate-300 hover:bg-slate-800/60 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isHi ? 'आधिकारिक नियम व शर्तें' : 'Official Rules & Policies'}</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold">100% Safe</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    if (onOpenGuides) onOpenGuides('SHORT_TERM');
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between text-slate-300 hover:bg-slate-800/60 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isHi ? '⚡ 641D शॉर्ट टर्म योजना विवरण PDF' : '⚡ 641D Short Term Guide PDF'}</span>
                  </div>
                  <span className="text-[10px] text-amber-400 font-mono">PDF</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    if (onOpenGuides) onOpenGuides('LONG_TERM');
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between text-slate-300 hover:bg-slate-800/60 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isHi ? '📈 365D लॉन्ग टर्म योजना विवरण PDF' : '📈 365D Long Term Guide PDF'}</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono">PDF</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    if (onOpenGuides) onOpenGuides('TDS_REFUND');
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between text-cyan-300 hover:bg-slate-800/60 transition-colors font-semibold"
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{isHi ? '🏛️ सरकारी TDS रिफंड प्रक्रिया गाइड PDF' : '🏛️ Govt TDS Refund Process PDF'}</span>
                  </div>
                  <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-mono px-1.5 py-0.5 rounded border border-cyan-500/30">
                    ITR
                  </span>
                </button>

                <button
                  id="btn-drawer-legal-agreement"
                  onClick={() => {
                    onClose();
                    if (onOpenAgreement) onOpenAgreement();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors font-bold"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isHi ? '📜 GCap & निवेशक कानूनी अनुबंध (PDF)' : '📜 GCap & Investor Agreement (PDF)'}</span>
                  </div>
                  <span className="text-[10px] bg-amber-500 text-slate-950 font-bold px-1.5 py-0.5 rounded">
                    LEGAL
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* MENU 4: रेफरल व रिवार्ड्स (Referral & Rewards) */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/50 overflow-hidden">
            <button
              onClick={() => toggleSection('rewards')}
              className="w-full px-3.5 py-2.5 flex items-center justify-between text-left font-bold text-xs text-white hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                  <Gift className="w-4 h-4" />
                </div>
                <span>{isHi ? '4. रेफरल व रिवार्ड्स (Rewards)' : '4. Referral & Rewards'}</span>
              </div>
              {expandedMenu === 'rewards' ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {expandedMenu === 'rewards' && (
              <div className="px-3 pb-2.5 pt-1 space-y-1 bg-slate-950/80 border-t border-slate-800/80">
                <button
                  onClick={() => {
                    onClose();
                    onOpenReferral();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between text-slate-300 hover:bg-slate-800/60 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Gift className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isHi ? 'ऐप शेयर करें (Referral Link)' : 'Share App & Earn'}</span>
                  </div>
                  <span className="text-[10px] text-amber-400 font-bold">5% + 2%</span>
                </button>

                <a
                  href="https://drive.google.com/file/d/117Tn84m7yVG6-FWu8CHFHC3PX1YbrRsf/view?pli=1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between text-emerald-300 hover:bg-emerald-500/10 transition-colors font-bold border border-emerald-500/30 bg-emerald-500/5 mt-1"
                >
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isHi ? '📲 एंड्रॉइड APK डायरेक्ट डाउनलोड (.apk)' : '📲 Download Android APK (.apk)'}</span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono">APK</span>
                </a>
              </div>
            )}
          </div>

          {/* MENU 5: एडमिन हब (यदि एडमिन हो) */}
          {isAdmin && onToggleAdminHub && (
            <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 overflow-hidden">
              <button
                onClick={() => {
                  onClose();
                  onToggleAdminHub();
                }}
                className="w-full px-3.5 py-2.5 flex items-center justify-between text-left font-bold text-xs text-amber-300 hover:bg-amber-500/20 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>{isAdminHubActive ? (isHi ? 'इन्वेस्टर व्यू पर जाएं' : 'Switch to User View') : (isHi ? '👑 एडमिन कंट्रोल पैनल' : '👑 Admin Control Hub')}</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              </button>
            </div>
          )}

        </div>

        {/* Drawer Bottom Controls (Language, View Mode, Logout) */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950 space-y-2.5">
          
          {/* Quick Actions Row */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onLanguageChange(isHi ? 'en' : 'hi')}
              className="py-2 px-2.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>{isHi ? '🇬🇧 English' : '🇮🇳 हिंदी'}</span>
            </button>

            <button
              onClick={() => onViewModeChange(viewMode === 'web' ? 'android' : 'web')}
              className="py-2 px-2.5 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {viewMode === 'web' ? (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isHi ? 'मोबाइल व्यू' : 'Mobile View'}</span>
                </>
              ) : (
                <>
                  <Monitor className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isHi ? 'कंप्यूटर व्यू' : 'Web View'}</span>
                </>
              )}
            </button>
          </div>

          {/* GCap Intro Animation & Music Replay */}
          {onOpenSplashIntro && (
            <button
              onClick={() => {
                onClose();
                onOpenSplashIntro();
              }}
              className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-emerald-500/15 via-amber-500/15 to-emerald-500/15 hover:from-emerald-500/25 hover:to-amber-500/25 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>{isHi ? '✨ GCap ओपनिंग एनीमेशन व म्यूजिक' : '✨ Replay Startup Music & Intro'}</span>
            </button>
          )}

          {/* Test Day Advance Button */}
          <button
            onClick={() => {
              onClose();
              onSimulateDay();
            }}
            disabled={isSimulating}
            className="w-full py-2 px-3 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Zap className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : 'text-amber-400 fill-amber-400'}`} />
            <span>{isSimulating ? (isHi ? 'प्रोसेसिंग...' : 'Simulating...') : (isHi ? '+1 दिन रिटर्न टेस्ट सिमुलेशन' : '+1 Day Yield Test')}</span>
          </button>

          {/* Logout Button */}
          {currentUser && onLogout && (
            <button
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="w-full py-2 px-3 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>{isHi ? 'लॉगआउट करें (Sign Out)' : 'Sign Out'}</span>
            </button>
          )}

        </div>

      </div>
    </div>
  );
};
