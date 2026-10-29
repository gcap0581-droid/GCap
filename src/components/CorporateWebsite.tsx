import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  TrendingUp,
  Award,
  Building2,
  CheckCircle2,
  ArrowRight,
  Calculator,
  ChevronDown,
  ChevronUp,
  FileText,
  Clock,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Lock,
  Zap,
  Users,
  Layers,
  Sparkles,
  HelpCircle,
  MessageSquare,
  Globe,
  LogIn,
  Send,
  RefreshCw,
  Coins,
  DollarSign,
  ChevronRight,
  Check,
  Home,
  FileCheck2,
  Scale,
  Video,
  Play,
  Menu,
  X,
  Youtube,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Share2
} from 'lucide-react';
import { CompanyProfile, InvestmentPlan, Language, AppRules } from '../types';
import { DEFAULT_COMPANY_PROFILE } from '../utils/companyStorage';
import { PRIMARY_COMPANY_LOGO, OFFICIAL_SEAL_LOGO } from '../utils/logoAssets';
import { INVESTMENT_PLANS } from '../utils/plansStorage';
import { formatINR } from '../utils/storage';
import { getStoredRules } from '../utils/rulesStorage';
import { YouTubeNativeActionBar } from './YouTubeNativeActionBar';

export type WebTabId = 'home' | 'about' | 'plans' | 'calculator' | 'legal' | 'contact';

interface CorporateWebsiteProps {
  companyProfile?: CompanyProfile;
  plans?: InvestmentPlan[];
  language?: Language;
  onLaunchApp: () => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onOpenYouTubeStudio?: () => void;
  onOpenSocialHub?: () => void;
}

export const CorporateWebsite: React.FC<CorporateWebsiteProps> = ({
  companyProfile = DEFAULT_COMPANY_PROFILE,
  plans = INVESTMENT_PLANS,
  language: initialLang = 'hi',
  onLaunchApp,
  onOpenLogin,
  onOpenRegister,
  onOpenYouTubeStudio,
  onOpenSocialHub,
}) => {
  const [lang, setLang] = useState<Language>(initialLang);
  const isHi = lang === 'hi';
  const [activeProfile, setActiveProfile] = useState<CompanyProfile>(() => companyProfile || DEFAULT_COMPANY_PROFILE);
  const [activeRules, setActiveRules] = useState<AppRules>(() => getStoredRules());

  useEffect(() => {
    if (companyProfile) {
      setActiveProfile(companyProfile);
    }
  }, [companyProfile]);

  useEffect(() => {
    const handleProfileUpdated = (e: any) => {
      if (e?.detail) {
        setActiveProfile((prev) => ({
          ...e.detail,
          showYoutube: e.detail.showYoutube ?? prev.showYoutube,
          showTelegram: e.detail.showTelegram ?? prev.showTelegram,
          showWhatsapp: e.detail.showWhatsapp ?? prev.showWhatsapp,
          showFacebook: e.detail.showFacebook ?? prev.showFacebook,
          showInstagram: e.detail.showInstagram ?? prev.showInstagram,
          showTwitter: e.detail.showTwitter ?? prev.showTwitter,
          showLinkedin: e.detail.showLinkedin ?? prev.showLinkedin,
        }));
      }
    };
    const handleRulesUpdated = (e: any) => {
      if (e?.detail) setActiveRules(e.detail);
      else setActiveRules(getStoredRules());
    };
    const handleStorageChange = (e: StorageEvent) => {
      if ((e.key === 'gcap_corporate_company_profile_v2' || e.key === 'gcap_corporate_company_profile_v1') && e.newValue) {
        try {
          setActiveProfile(JSON.parse(e.newValue));
        } catch {}
      }
      if (e.key === 'gcap_platform_rules_v2' || e.key === 'gcap_platform_rules_v1') {
        setActiveRules(getStoredRules());
      }
    };
    const handleFirestoreUpdated = (e: any) => {
      if (e?.detail?.companyProfile) {
        setActiveProfile(e.detail.companyProfile);
      }
      if (e?.detail?.rules) {
        setActiveRules(e.detail.rules);
      } else {
        setActiveRules(getStoredRules());
      }
    };
    window.addEventListener('gcap_company_profile_updated', handleProfileUpdated);
    window.addEventListener('gcap_rules_updated', handleRulesUpdated);
    window.addEventListener('gcap_ota_config_updated', handleRulesUpdated);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('firestore_state_updated', handleFirestoreUpdated);
    return () => {
      window.removeEventListener('gcap_company_profile_updated', handleProfileUpdated);
      window.removeEventListener('gcap_rules_updated', handleRulesUpdated);
      window.removeEventListener('gcap_ota_config_updated', handleRulesUpdated);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('firestore_state_updated', handleFirestoreUpdated);
    };
  }, []);

  // Active Tab state: strictly renders ONLY the selected tab's content
  const [activeTab, setActiveTab] = useState<WebTabId>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab')?.toLowerCase() || params.get('page')?.toLowerCase();
      if (tab === 'about' || tab === 'plans' || tab === 'calculator' || tab === 'legal' || tab === 'contact') {
        return tab as WebTabId;
      }
    }
    return 'home';
  });

  const [isNavMenuOpen, setIsNavMenuOpen] = useState<boolean>(false);

  const handleTabChange = (tab: WebTabId) => {
    setActiveTab(tab);
    setIsNavMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('tab', tab);
        window.history.pushState({}, '', url.toString());
      } catch {}
    }
  };

  useEffect(() => {
    const handlePop = () => {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab')?.toLowerCase() || params.get('page')?.toLowerCase();
      if (tab === 'about' || tab === 'plans' || tab === 'calculator' || tab === 'legal' || tab === 'contact') {
        setActiveTab(tab as WebTabId);
      } else {
        setActiveTab('home');
      }
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  // Calculator State
  const [calcAmount, setCalcAmount] = useState<number>(50000);
  const [selectedPlanId, setSelectedPlanId] = useState<string>(plans[0]?.id || 'short-term');
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(0);
  const [activeLegalSubTab, setActiveLegalSubTab] = useState<'MCA' | 'STARTUP' | 'SEAL'>('MCA');

  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('New Investment');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Selected plan calculation
  const activePlan = useMemo(() => {
    return plans.find((p) => p.id === selectedPlanId) || plans[0] || {
      id: 'short-term',
      name: 'Short Term Plan (641-Day)',
      nameHi: 'शॉर्ट टर्म प्लान (641-दिन)',
      dailyRoiPercent: 0.16,
      durationDays: 641,
      minAmount: 100000,
      maxAmount: 1000000000,
    };
  }, [plans, selectedPlanId]);

  const perCycleRoiPercent = activePlan.dailyRoiPercent / 4;
  const perCycleReturn = Math.round((calcAmount * perCycleRoiPercent) / 100);
  const dailyReturn = perCycleReturn * 4;
  const weeklyReturn = dailyReturn * 7;
  const monthlyReturn = dailyReturn * 30;
  const totalMaturityReturn = Math.round(dailyReturn * (activePlan.durationDays || 365));
  const totalGrossAmount = calcAmount + totalMaturityReturn;
  const totalGainPercent = calcAmount > 0 ? ((totalMaturityReturn / calcAmount) * 100).toFixed(1) : '0';

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactPhone) return;
    setContactSubmitting(true);
    try {
      await fetch('/api/admin/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Website Inquiry [${contactSubject}]: ${contactName}`,
          titleHi: `वेबसाइट पूछताछ [${contactSubject}]: ${contactName}`,
          content: `Inquiry from website visitor.\nName: ${contactName}\nPhone: ${contactPhone}\nEmail: ${contactEmail || 'N/A'}\nSubject: ${contactSubject}\nMessage: ${contactMessage || 'No specific note'}`,
          contentHi: `वेबसाइट विज़िटर से पूछताछ।\nनाम: ${contactName}\nफ़ोन: ${contactPhone}\nईमेल: ${contactEmail || 'N/A'}\nविषय: ${contactSubject}\nसंदेश: ${contactMessage || 'कोई संदेश नहीं'}`,
          type: 'BROADCAST',
          priority: 'HIGH',
          sender: contactName,
        }),
      });
      setContactSubmitted(true);
      setContactName('');
      setContactPhone('');
      setContactEmail('');
      setContactMessage('');
    } catch {
      setContactSubmitted(true);
    } finally {
      setContactSubmitting(false);
    }
  };

  const tabsConfig: { id: WebTabId; labelHi: string; labelEn: string; icon: any; descHi?: string; descEn?: string }[] = [
    { id: 'home', labelHi: '🏠 होम', labelEn: '🏠 Home', icon: Home, descHi: 'मुख्य होम पेज', descEn: 'Main Homepage' },
    { id: 'about', labelHi: '🏛️ कंपनी परिचय', labelEn: '🏛️ About Us', icon: Building2, descHi: 'निदेशक व Axis बैंक', descEn: 'Governance & Bank' },
    { id: 'plans', labelHi: '📈 निवेश योजनाएं', labelEn: '📈 Investment Schemes', icon: TrendingUp, descHi: '641D व 365D स्कीम्स', descEn: '641D & 365D ROI' },
    { id: 'calculator', labelHi: '🧮 रिटर्न कैलकुलेटर', labelEn: '🧮 Yield Calculator', icon: Calculator, descHi: 'लाइव लाभ की गणना', descEn: 'Calculate Returns' },
    { id: 'legal', labelHi: '📜 वैधानिक वॉल्ट (MCA)', labelEn: '📜 Legal & MCA', icon: ShieldCheck, descHi: 'MCA व DPIIT सर्टिफिकेट', descEn: 'Govt Certificates' },
    { id: 'contact', labelHi: '📞 संपर्क व सहायता', labelEn: '📞 Contact Us', icon: Phone, descHi: 'सासाराम ऑफिस व हेल्प', descEn: 'Office & Helpline' },
  ];

  const socialMediaChannels = [
    {
      id: 'youtube',
      name: 'YouTube Channel',
      nameHi: 'यूट्यूब चैनल (YouTube)',
      icon: Youtube,
      url: (activeProfile.youtubeUrl || 'https://www.youtube.com/@GCapOfficial').includes('?')
        ? `${activeProfile.youtubeUrl || 'https://www.youtube.com/@GCapOfficial'}&sub_confirmation=1`
        : `${activeProfile.youtubeUrl || 'https://www.youtube.com/@GCapOfficial'}?sub_confirmation=1`,
      color: 'text-red-400 border-red-500/30 bg-red-950/40 hover:bg-red-900/50 hover:border-red-500/60',
      badgeHi: 'ऑफिशियल चैनल',
      badgeEn: 'Official Channel',
      btnBg: 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black',
      btnTextHi: '🔴 सब्सक्राइब व लाइक करें 🔔',
      btnTextEn: '🔴 Subscribe & Like 🔔',
    },
    {
      id: 'telegram',
      name: 'Telegram',
      nameHi: 'टेलीग्राम (Telegram)',
      icon: Send,
      url: activeProfile.telegramUrl || 'https://t.me/gcapofficial',
      color: 'text-sky-400 border-sky-500/30 bg-sky-950/40 hover:bg-sky-900/50 hover:border-sky-500/60',
      badgeHi: 'आधिकारिक अपडेट्स',
      badgeEn: 'Official Updates',
      btnBg: 'bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold',
      btnTextHi: 'चैनल ज्वाइन करें 🚀',
      btnTextEn: 'Join Channel 🚀',
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp Community',
      nameHi: 'व्हाट्सएप ग्रुप (WhatsApp)',
      icon: MessageSquare,
      url: activeProfile.whatsappGroupUrl || 'https://chat.whatsapp.com/GCapOfficialCommunity',
      color: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/40 hover:bg-emerald-900/50 hover:border-emerald-500/60',
      badgeHi: 'इन्वेस्टर कम्युनिटी',
      badgeEn: 'Investor Group',
      btnBg: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold',
      btnTextHi: 'ग्रुप ज्वाइन करें 💬',
      btnTextEn: 'Join Group 💬',
    },
    {
      id: 'facebook',
      name: 'Facebook',
      nameHi: 'फेसबुक (Facebook)',
      icon: Facebook,
      url: activeProfile.facebookUrl || 'https://facebook.com/gcapofficial',
      color: 'text-blue-400 border-blue-500/30 bg-blue-950/40 hover:bg-blue-900/50 hover:border-blue-500/60',
      badgeHi: 'ऑफिशियल पेज',
      badgeEn: 'Official Page',
      btnBg: 'bg-blue-600 hover:bg-blue-500 text-white',
      btnTextHi: 'फॉलो करें 👍',
      btnTextEn: 'Follow Page 👍',
    },
    {
      id: 'instagram',
      name: 'Instagram',
      nameHi: 'इंस्टाग्राम (Instagram)',
      icon: Instagram,
      url: activeProfile.instagramUrl || 'https://instagram.com/gcapofficial',
      color: 'text-pink-400 border-pink-500/30 bg-pink-950/40 hover:bg-pink-900/50 hover:border-pink-500/60',
      badgeHi: 'फोटो व अपडेट्स',
      badgeEn: 'Photos & Updates',
      btnBg: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white',
      btnTextHi: 'फॉलो करें 📸',
      btnTextEn: 'Follow 📸',
    },
    {
      id: 'twitter',
      name: 'Twitter / X',
      nameHi: 'ट्विटर (𝕏)',
      icon: Twitter,
      url: activeProfile.twitterUrl || 'https://twitter.com/gcapofficial',
      color: 'text-slate-200 border-slate-700 bg-slate-900/60 hover:bg-slate-800 hover:border-slate-500',
      badgeHi: 'आधिकारिक ट्वीट्स',
      badgeEn: 'Official Tweets',
      btnBg: 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-600',
      btnTextHi: 'फॉलो करें 𝕏',
      btnTextEn: 'Follow 𝕏',
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      nameHi: 'लिंक्डइन (LinkedIn)',
      icon: Linkedin,
      url: activeProfile.linkedinUrl || 'https://linkedin.com/company/gcapofficial',
      color: 'text-blue-300 border-blue-600/30 bg-blue-950/40 hover:bg-blue-900/50 hover:border-blue-500/60',
      badgeHi: 'कॉरपोरेट डेस्क',
      badgeEn: 'Corporate Desk',
      btnBg: 'bg-blue-700 hover:bg-blue-600 text-white',
      btnTextHi: 'कनेक्ट करें 💼',
      btnTextEn: 'Connect 💼',
    },
  ].filter((ch) => {
    if (ch.id === 'youtube') return activeProfile.showYoutube !== false;
    if (ch.id === 'telegram') return activeProfile.showTelegram === true;
    if (ch.id === 'whatsapp') return activeProfile.showWhatsapp === true;
    if (ch.id === 'facebook') return activeProfile.showFacebook === true;
    if (ch.id === 'instagram') return activeProfile.showInstagram === true;
    if (ch.id === 'twitter') return activeProfile.showTwitter === true;
    if (ch.id === 'linkedin') return activeProfile.showLinkedin === true;
    return true;
  });

  const currentTabObj = tabsConfig.find(t => t.id === activeTab) || tabsConfig[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 antialiased flex flex-col justify-between">


      {/* 2. PRIMARY LOGO HEADER */}
      <header className="bg-slate-950/95 border-b border-amber-500/20 shrink-0 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-8 py-3 flex items-center justify-between gap-2">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer min-w-0 flex-1" onClick={() => handleTabChange('home')}>
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-2 border-amber-400/70 bg-slate-900 shrink-0 shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center justify-center">
              <img
                src={PRIMARY_COMPANY_LOGO}
                alt="GCap Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm sm:text-xl md:text-2xl font-black tracking-tight text-white font-mono leading-tight">
                  GCap OPC Private Limited
                </span>
                <span className="inline-block text-[10px] uppercase font-mono font-black text-slate-950 bg-amber-400 border border-amber-300 px-2 py-0.5 rounded-full shadow-sm">
                  MCA REG
                </span>
              </div>
              <p className="text-xs sm:text-sm text-amber-300/90 font-bold truncate mt-0.5">
                {isHi ? 'कॉरपोरेट परिसंपत्ति प्रबंधन' : 'Corporate Asset Management'}
              </p>
            </div>
          </div>

          {/* Action Buttons in Header */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Navigation Menu Button - Icon Only (3-lines blinking icon) */}
            <button
              id="btn-website-main-menu-toggle"
              onClick={() => setIsNavMenuOpen(!isNavMenuOpen)}
              aria-label={isNavMenuOpen ? 'Close Menu' : 'Open Menu'}
              title={isNavMenuOpen ? (isHi ? 'मेन्यू बंद करें' : 'Close Menu') : (isHi ? 'मुख्य मेन्यू खोलें' : 'Open Main Menu')}
              className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-amber-500/40 text-amber-300 flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-95"
            >
              {isNavMenuOpen ? (
                <X className="w-5 h-5 text-amber-400" />
              ) : (
                <Menu className="w-5 h-5 text-amber-400 animate-pulse" />
              )}
            </button>
          </div>
        </div>

        {/* 3. COLLAPSIBLE NAVIGATION MENU DROPDOWN PANEL */}
        {isNavMenuOpen && (
          <div className="bg-slate-900/98 border-t border-b border-amber-500/30 px-3 sm:px-8 py-3 shadow-2xl animate-in slide-in-from-top-3 duration-200 backdrop-blur-2xl">
            <div className="max-w-7xl mx-auto space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 border-b border-slate-800 pb-2 flex-wrap gap-2">
                <span className="text-amber-400 flex items-center gap-1.5">
                  <Menu className="w-3.5 h-3.5" />
                  <span>{isHi ? 'वेबसाइट नेविगेशन मेन्यू (Navigation Menu)' : 'Website Navigation Menu'}</span>
                </span>
                
                {/* Language Toggle inside Menu Panel */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">{isHi ? 'भाषा (Language):' : 'Language:'}</span>
                  <button
                    id="btn-menu-language-toggle"
                    onClick={() => setLang(isHi ? 'en' : 'hi')}
                    className="px-2.5 py-0.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95"
                  >
                    <Globe className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isHi ? '🌐 English में बदलें' : '🌐 Switch to हिन्दी'}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {tabsConfig.map((tab) => {
                  const isActive = activeTab === tab.id;
                  const IconComp = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-[82px] group ${
                        isActive
                          ? 'bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500 text-slate-950 border-amber-300 shadow-xl shadow-amber-500/20 scale-[1.02]'
                          : 'bg-slate-950/90 text-slate-200 hover:text-white hover:bg-slate-800 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className={`p-1 rounded-lg ${isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-900 text-amber-400'}`}>
                          <IconComp className="w-3.5 h-3.5" />
                        </div>
                        {isActive && (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-slate-950 text-amber-400">
                            {isHi ? 'सक्रिय' : 'Active'}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-extrabold truncate">{isHi ? tab.labelHi : tab.labelEn}</div>
                        <div className={`text-[10px] truncate ${isActive ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>
                          {isHi ? tab.descHi : tab.descEn}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Quick Social Media Quick Bar inside Menu Dropdown */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-amber-400 font-bold flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{isHi ? 'आधिकारिक सोशल मीडिया चैनल:' : 'Official Social Media:'}</span>
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {socialMediaChannels.map((soc) => {
                    const SocIcon = soc.icon;
                    return (
                      <a
                        key={soc.id}
                        href={soc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`px-2 py-0.5 rounded-lg border text-[11px] font-medium flex items-center gap-1 transition-all ${soc.color}`}
                        title={isHi ? soc.nameHi : soc.name}
                      >
                        <SocIcon className="w-3.5 h-3.5" />
                        <span>{soc.name}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

      </header>

      {/* 4. ISOLATED TAB CONTENT (ONLY ACTIVE TAB'S MATTER SHOWS) */}
      <main className="flex-1 w-full">
        {/* ========================================================================= */}
        {/* TAB 1: 🏠 होम (Home) - ONLY HOME MATTER */}
        {/* ========================================================================= */}
        {activeTab === 'home' && (
          <div className="py-4 sm:py-6 px-3 sm:px-6 max-w-7xl mx-auto space-y-5 animate-in fade-in-50 duration-200">
            {/* Hero Card */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-2xl p-5 sm:p-8 space-y-4 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/30 text-xs text-emerald-300 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>{isHi ? 'भारत सरकार (MCA) पंजीकृत कॉरपोरेट वेल्थ संस्था' : 'Govt of India MCA Registered Corporate Entity'}</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight max-w-3xl">
                {isHi ? (
                  <>
                    जीकैप (OPC) प्राइवेट लिमिटेड: <span className="text-amber-400">सुरक्षित परिसंपत्ति प्रबंधन</span> एवं 6-घंटे चक्र रिटर्न
                  </>
                ) : (
                  <>
                    GCAP (OPC) PRIVATE LIMITED: <span className="text-amber-400">Institutional Asset Engine</span> & 6-Hour Cycles
                  </>
                )}
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                {isHi ? (
                  'हम भारत सरकार के कॉर्पोरेट मामलों के मंत्रालय (MCA) के अधीन पंजीकृत हैं। हमारे अत्याधुनिक सॉफ्टवेयर एल्गोरिदम द्वारा प्रत्येक 24 घंटे में 4 निश्चित चक्रों में बिना किसी मानवीय हस्तक्षेप के स्वचालित रिटर्न प्रदान किया जाता है।'
                ) : (
                  'Compliant with the Ministry of Corporate Affairs (MCA), Govt of India. Delivering automated 4-times-daily cycle payouts with full statutory transparency.'
                )}
              </p>

              <div className="flex flex-wrap gap-2.5 pt-1">
                <button
                  onClick={onLaunchApp}
                  className="px-5 py-2.5 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition-all shadow-md shadow-amber-500/20 text-xs sm:text-sm flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <span>{isHi ? 'इन्वेस्टर सॉफ्टवेयर पोर्टल खोलें 🚀' : 'Launch Software Portal 🚀'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleTabChange('plans')}
                  className="px-4 py-2.5 rounded-xl font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-all text-xs sm:text-sm cursor-pointer"
                >
                  {isHi ? 'इन्वेस्टमेंट स्कीम्स देखें →' : 'View Investment Schemes →'}
                </button>
                <button
                  onClick={() => handleTabChange('calculator')}
                  className="px-4 py-2.5 rounded-xl font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-all text-xs sm:text-sm cursor-pointer"
                >
                  {isHi ? 'रिटर्न कैलकुलेटर खोलें →' : 'Open Yield Calculator →'}
                </button>
              </div>
            </div>

            {/* 4 Performance Tiles */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3.5">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 sm:p-4 space-y-1">
                <span className="text-[11px] text-slate-400">{isHi ? 'अधिकृत पूंजी (Authorised)' : 'Authorised Capital'}</span>
                <div className="text-lg sm:text-xl font-extrabold font-mono text-emerald-400">₹55,00,00,000</div>
                <span className="text-[10px] text-slate-500">{isHi ? '₹55 करोड़ MCA अनुमोदित' : '₹55 Cr MCA Approved'}</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 sm:p-4 space-y-1">
                <span className="text-[11px] text-slate-400">{isHi ? 'सक्रिय प्रबंधित पूंजी' : 'Active Assets Managed'}</span>
                <div className="text-lg sm:text-xl font-extrabold font-mono text-amber-400">₹24.8 Cr+</div>
                <span className="text-[10px] text-slate-500">{isHi ? '14,850+ निवेशकों द्वारा' : '14,850+ Investors'}</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 sm:p-4 space-y-1">
                <span className="text-[11px] text-slate-400">{isHi ? 'दैनिक चक्र पेआउट्स' : 'Daily Payout Cycles'}</span>
                <div className="text-lg sm:text-xl font-extrabold font-mono text-sky-400">4x Every 24h</div>
                <span className="text-[10px] text-slate-500">{isHi ? 'हर 6 घंटे में 0.040% GP' : '0.040% every 6 hours'}</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 sm:p-4 space-y-1">
                <span className="text-[11px] text-slate-400">{isHi ? 'GP विनिमय दर (Peg)' : 'GP Value Ratio'}</span>
                <div className="text-lg sm:text-xl font-extrabold font-mono text-emerald-400">₹1 = {activeRules.gpRatePerRupee ?? 0.98} GP</div>
                <span className="text-[10px] text-emerald-400">{isHi ? '100% भारतीय रुपये में निकासी' : '100% INR Direct Bank'}</span>
              </div>
            </div>

            {/* Official YouTube Channel & Video Showcase Section */}
            <div className="bg-gradient-to-br from-red-950/60 via-slate-900 to-amber-950/40 border border-red-500/30 rounded-2xl p-4 sm:p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Youtube className="w-6 h-6 text-red-500 fill-red-500 animate-pulse" />
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-white">
                      {isHi ? 'जीकैप आधिकारिक यूट्यूब चैनल व वीडियो ट्यूटोरियल' : 'GCap Official YouTube Video Tutorial'}
                    </h2>
                    <p className="text-xs text-slate-400">
                      {isHi ? '1-क्लिक सब्सक्राइब करें, लाइक करें और अपने व्हाट्सएप ग्रुप में शेयर करें' : '1-Click Subscribe, Like, and Share directly to WhatsApp'}
                    </p>
                  </div>
                </div>

                {onOpenSocialHub && (
                  <button
                    onClick={onOpenSocialHub}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Globe className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isHi ? 'सोशल मीडिया हब खोलें →' : 'Open Social Hub →'}</span>
                  </button>
                )}
              </div>

              {/* Video Frame */}
              <div className="w-full aspect-video rounded-xl overflow-hidden border border-red-500/30 shadow-2xl bg-slate-950">
                <iframe
                  className="w-full h-full"
                  src={(activeProfile.featuredVideoUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ').replace('watch?v=', 'embed/')}
                  title="GCap Official Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>

              {/* Pixel-Accurate Native YouTube Action Bar (Subscribe, Like, Dislike, Share, Remix/Studio, More) */}
              <YouTubeNativeActionBar
                channelUrl={activeProfile.youtubeUrl || 'https://www.youtube.com/@GCapOfficial'}
                videoUrl={activeProfile.featuredVideoUrl || activeProfile.youtubeUrl || 'https://www.youtube.com/@GCapOfficial'}
                videoTitle={isHi ? `${activeProfile.companyName || 'GCap OPC Private Limited'} - 6-घंटे ऑटो-पेआउट व प्लान ट्यूटोरियल` : `${activeProfile.companyName || 'GCap OPC Private Limited'} - Official Video Tutorial`}
                channelName="GCap Official"
                subscribersCount="12.5K subscribers"
                initialLikes={3742}
                initialViews="6.6 lakh views"
                isHi={isHi}
                onOpenStudio={onOpenYouTubeStudio}
              />
            </div>

            {/* Quick Tab Jump Grid */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-3.5">
              <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2">
                {isHi ? 'वेबसाइट के अन्य विभाग चुनें (Tab Selector):' : 'Explore Other Sections:'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {[
                  { tab: 'about', titleHi: '🏛️ कंपनी परिचय व प्रबंधन', titleEn: 'About Us & Governance', descHi: 'डायरेक्टर अमित कुमार, DIN 11964641, विज़न एवं Axis Bank खाता विवरण।' },
                  { tab: 'plans', titleHi: '📈 641-दिन व 365-दिन स्कीम्स', titleEn: 'Investment Schemes', descHi: 'शॉर्ट-टर्म व लॉन्ग-टर्म रिटर्न, लॉक अवधि और निकासी नियमों की तालिका।' },
                  { tab: 'calculator', titleHi: '🧮 लाइव रिटर्न कैलकुलेटर', titleEn: 'Yield Calculator', descHi: 'अपनी राशि डालकर प्रति चक्र, दैनिक व मासिक लाभ का सीधा हिसाब देखें।' },
                  { tab: 'legal', titleHi: '📜 वैधानिक वॉल्ट व प्रमाण पत्र', titleEn: 'Legal & MCA Vault', descHi: 'MCA निगमन, DPIIT स्टार्टअप इंडिया 10-वर्षीय सर्टिफिकेट, पैन व टैन।' },
                  { tab: 'contact', titleHi: '📞 संपर्क व सहायता केंद्र', titleEn: 'Contact & Support', descHi: 'सासाराम ऑफिस का पता, कस्टमर केयर, व्हाट्सएप व ऑनलाइन इन्क्वायरी।' },
                ].map((s) => (
                  <button
                    key={s.tab}
                    onClick={() => handleTabChange(s.tab as WebTabId)}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/60 text-left transition-all cursor-pointer group space-y-1"
                  >
                    <div className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-400 transition-colors flex justify-between items-center">
                      <span>{isHi ? s.titleHi : s.titleEn}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-transform group-hover:translate-x-1" />
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">{isHi ? s.descHi : s.titleEn}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: 🏛️ कंपनी परिचय (About Us) - ONLY ABOUT MATTER */}
        {/* ========================================================================= */}
        {activeTab === 'about' && (
          <div className="py-4 sm:py-6 px-3 sm:px-6 max-w-7xl mx-auto space-y-5 animate-in fade-in-50 duration-200">
            <div className="space-y-1.5 max-w-3xl">
              <div className="inline-block px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-mono font-bold uppercase">
                TAB 2: CORPORATE PROFILE
              </div>
              <h1 className="text-xl sm:text-3xl font-extrabold text-white">
                {isHi ? 'जीकैप (OPC) प्राइवेट लिमिटेड: कंपनी परिचय एवं प्रबंधन' : 'About GCAP (OPC) PRIVATE LIMITED'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {isHi ? (
                  'जीकैप भारत सरकार के कॉर्पोरेट मामलों के मंत्रालय (MCA), कंपनी अधिनियम 2013 के अधीन विधिवत निगमित संस्था है (ROC पटना, बिहार)।'
                ) : (
                  'Incorporated under the Companies Act 2013, Ministry of Corporate Affairs, ROC Patna, Bihar.'
                )}
              </p>
            </div>

            {/* Leadership Profile Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4">
              <h2 className="text-base font-bold text-white border-b border-slate-800 pb-2">{isHi ? 'कंपनी निदेशक व अधिकृत हस्ताक्षरकर्ता:' : 'Director & Management:'}</h2>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <img
                  src={PRIMARY_COMPANY_LOGO}
                  alt="Director Logo"
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover border-2 border-amber-500/50 shadow-lg shrink-0"
                />
                <div className="space-y-1 text-center sm:text-left">
                  <div className="inline-block px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono font-bold">
                    AUTHORIZED DIRECTOR
                  </div>
                  <h3 className="text-xl font-bold text-white">{companyProfile.authorizedSignatory || 'Amit Kumar'}</h3>
                  <p className="text-xs text-amber-400 font-mono font-bold">{companyProfile.signatoryDesignation || 'Director & Authorized Signatory'}</p>
                  <p className="text-xs text-slate-300 font-mono">DIN: {companyProfile.signatoryDin || '11964641'}</p>
                  <p className="text-xs text-slate-400">{companyProfile.registeredAddress}</p>
                </div>
              </div>
            </div>

            {/* Banking Partner */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-3">
              <h2 className="text-base font-bold text-white">{isHi ? 'कंपनी का प्राथमिक बैंकिंग खाता विवरण:' : 'Official Banking Partner:'}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 font-mono text-xs">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-sans block">{isHi ? 'बैंक का नाम:' : 'Bank Name:'}</span>
                  <span className="text-white font-bold text-xs mt-0.5 block">{companyProfile.bankName || 'Axis Bank Ltd.'}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-sans block">{isHi ? 'खाता संख्या:' : 'Account Number:'}</span>
                  <span className="text-amber-400 font-bold text-xs mt-0.5 block">{companyProfile.bankAccountNumber || '924010008662307'}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-sans block">IFSC Code:</span>
                  <span className="text-emerald-400 font-bold text-xs mt-0.5 block">{companyProfile.bankIfsc || 'UTIB0001219'}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-sans block">{isHi ? 'शाखा (Branch):' : 'Branch:'}</span>
                  <span className="text-slate-200 mt-0.5 block">{companyProfile.bankBranch || 'Sasaram Branch'}</span>
                </div>
              </div>
            </div>

            {/* Mission & Vision */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="bg-slate-900 p-4.5 rounded-xl border border-slate-800 space-y-2">
                <h3 className="text-sm font-bold text-white">{isHi ? 'हमारा विज़न (Our Vision)' : 'Our Vision'}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isHi ? (
                    'तकनीक और नियमों के समन्वय से भारत में परिसंपत्ति प्रबंधन को पारदर्शी बनाना, जिससे हर निवेशक को समय पर निश्चित चक्र लाभ प्राप्त हो सके।'
                  ) : (
                    'To democratize institutional wealth accumulation across India via transparent, automated fixed-cycle distribution.'
                  )}
                </p>
              </div>
              <div className="bg-slate-900 p-4.5 rounded-xl border border-slate-800 space-y-2">
                <h3 className="text-sm font-bold text-white">{isHi ? 'हमारा मिशन (Our Mission)' : 'Our Mission'}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isHi ? (
                    'कंपनी अधिनियम और आयकर नियमों (TDS) के 100% अनुपालन के साथ बिना किसी मानवीय त्रुटि के सर्वर-आधारित पेआउट्स सुनिश्चित करना।'
                  ) : (
                    'Ensuring 100% regulatory compliance, verified tax reconciliation, and zero manual latency in investor disbursements.'
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: 📈 निवेश योजनाएं (Investment Schemes) - ONLY PLANS MATTER */}
        {/* ========================================================================= */}
        {activeTab === 'plans' && (
          <div className="py-4 sm:py-6 px-3 sm:px-6 max-w-7xl mx-auto space-y-5 animate-in fade-in-50 duration-200">
            <div className="space-y-1.5 max-w-3xl">
              <div className="inline-block px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-mono font-bold uppercase">
                TAB 3: INVESTMENT SCHEMES
              </div>
              <h1 className="text-xl sm:text-3xl font-extrabold text-white">
                {isHi ? 'जीकैप सक्रिय निवेश योजनाएं एवं नियम' : 'GCap Active Investment Schemes & Rules'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {isHi ? (
                  'सभी प्लान्स में 24 घंटे में 4 निश्चित चक्रों (00:00, 06:00, 12:00, 18:00) में लाभ वॉलेट में क्रेडिट होता है।'
                ) : (
                  'All schemes feature 4 automated daily cycles with guaranteed server-side distribution and monthly bank redemption.'
                )}
              </p>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plans.map((p, idx) => {
                const isPopular = idx === 0 || p.id === 'short-term';
                return (
                  <div
                    key={p.id}
                    className={`rounded-2xl p-4 sm:p-5 flex flex-col justify-between border ${
                      isPopular
                        ? 'bg-slate-900 border-2 border-amber-500/60 shadow-xl'
                        : 'bg-slate-900/80 border-slate-800'
                    }`}
                  >
                    <div className="space-y-3">
                      {isPopular && (
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-bold text-[9px] uppercase">
                          {isHi ? 'सर्वाधिक लोकप्रिय' : 'MOST POPULAR'}
                        </span>
                      )}
                      <h3 className="text-base font-bold text-white">{isHi ? p.nameHi || p.name : p.name}</h3>
                      <p className="text-[11px] text-slate-400 leading-normal">{isHi ? p.descriptionHi || p.description : p.description}</p>

                      <div className="py-2.5 border-y border-slate-800 space-y-0.5">
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-extrabold font-mono text-emerald-400">{p.dailyRoiPercent}%</span>
                          <span className="text-xs text-slate-400">/ {isHi ? 'दिन' : 'day'}</span>
                        </div>
                        <span className="text-xs text-amber-400 font-mono block">
                          {isHi ? p.payoutFrequencyHi || 'हर 6 घंटे में 0.040% GP' : `${(p.dailyRoiPercent / 4).toFixed(3)}% every 6 hours`}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-300 font-mono">
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-sans">{isHi ? 'न्यूनतम निवेश:' : 'Min Deposit:'}</span>
                          <span className="font-bold text-white">{formatINR(p.minAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-sans">{isHi ? 'अवधि:' : 'Duration:'}</span>
                          <span className="font-bold text-white">{p.durationDays} {isHi ? 'दिन' : 'Days'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-sans">{isHi ? 'शुरुआती लॉक:' : 'Lock Interval:'}</span>
                          <span className="font-bold text-amber-400">{isHi ? 'पहले 24 घंटे' : 'First 24 Hours'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-sans">{isHi ? 'निकासी विंडो:' : 'Withdrawal Window:'}</span>
                          <span className="font-bold text-emerald-400">{isHi ? '1 से 5 तारीख' : '1st to 5th Monthly'}</span>
                        </div>
                      </div>

                      <div className="pt-1">
                        <span className="text-[10px] font-semibold uppercase text-slate-400 block mb-1">{isHi ? 'प्रमुख विशेषताएं:' : 'Key Terms:'}</span>
                        <ul className="space-y-1 text-xs text-slate-300">
                          {(p.featuresHi || p.features || []).map((feat, fidx) => (
                            <li key={fidx} className="flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span className="text-[11px]">{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-4 space-y-2">
                      <button
                        onClick={() => {
                          setSelectedPlanId(p.id);
                          handleTabChange('calculator');
                        }}
                        className="w-full py-2 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Calculator className="w-3.5 h-3.5 text-amber-400" />
                        <span>{isHi ? 'कैलकुलेटर में लाभ देखें' : 'Calculate Yield in Tab 4'}</span>
                      </button>

                      <button
                        onClick={onLaunchApp}
                        className="w-full py-2 rounded-xl font-bold text-xs uppercase tracking-wider bg-amber-400 text-slate-950 hover:bg-amber-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>{isHi ? 'सॉफ्टवेयर में यह प्लान लें' : 'Invest in Portal App'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Comparison Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-3">
              <h2 className="text-base font-bold text-white">{isHi ? 'विस्तृत योजना तुलना (Comparison Table):' : 'Detailed Comparison:'}</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-2.5 px-3 font-semibold">{isHi ? 'पैरामीटर' : 'Parameter'}</th>
                      <th className="py-2.5 px-3 font-semibold text-amber-400">Short Term (641-Day)</th>
                      <th className="py-2.5 px-3 font-semibold text-emerald-400">Long Term & Royalty (365-Day)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                    <tr>
                      <td className="py-2.5 px-3 font-sans text-slate-400">{isHi ? 'न्यूनतम निवेश' : 'Min Deposit'}</td>
                      <td className="py-2.5 px-3 text-white font-bold">₹1,00,000</td>
                      <td className="py-2.5 px-3 text-white font-bold">₹10,000</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-sans text-slate-400">{isHi ? 'प्रति 6-घंटे चक्र लाभ' : 'Per 6h Cycle'}</td>
                      <td className="py-2.5 px-3 text-amber-400 font-bold">0.040% GP</td>
                      <td className="py-2.5 px-3 text-amber-400 font-bold">0.033% GP</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-sans text-slate-400">{isHi ? 'दैनिक रिटर्न (24h)' : 'Daily ROI'}</td>
                      <td className="py-2.5 px-3 text-emerald-400 font-bold">0.160% / day</td>
                      <td className="py-2.5 px-3 text-emerald-400 font-bold">0.132% / day</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-sans text-slate-400">{isHi ? 'निकासी विंडो' : 'Withdrawal Window'}</td>
                      <td className="py-2.5 px-3 font-sans text-emerald-400">1st to 5th Monthly</td>
                      <td className="py-2.5 px-3 font-sans text-emerald-400">1st to 5th Monthly</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: 🧮 रिटर्न कैलकुलेटर (Calculator) - ONLY CALCULATOR MATTER */}
        {/* ========================================================================= */}
        {activeTab === 'calculator' && (
          <div className="py-4 sm:py-6 px-3 sm:px-6 max-w-7xl mx-auto space-y-5 animate-in fade-in-50 duration-200">
            <div className="space-y-1.5 max-w-3xl">
              <div className="inline-block px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-mono font-bold uppercase">
                TAB 4: YIELD & PROFIT CALCULATOR
              </div>
              <h1 className="text-xl sm:text-3xl font-extrabold text-white">
                {isHi ? 'इंटरैक्टिव रिटर्न एवं साइकिल कैलकुलेटर' : 'Interactive Return & Yield Calculator'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {isHi ? (
                  'अपनी निवेश राशि और योजना चुनें। सिस्टम आपको 6-घंटे के चक्र, दैनिक और परिपक्वता का सटीक लाभ दिखाएगा।'
                ) : (
                  'Select your investment amount and scheme to see exact 6-hour cycle returns and total maturity payouts.'
                )}
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                <div className="lg:col-span-7 space-y-4">
                  {/* Select Plan */}
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                      {isHi ? 'योजना (Scheme) चुनें:' : 'Select Scheme:'}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {plans.map((p) => {
                        const isSel = p.id === selectedPlanId;
                        return (
                          <button
                            key={p.id}
                            onClick={() => setSelectedPlanId(p.id)}
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                              isSel
                                ? 'bg-amber-500/10 border-amber-500 text-white shadow-md'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold">{isHi ? p.nameHi || p.name : p.name}</span>
                              {isSel && <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />}
                            </div>
                            <span className="text-[11px] font-mono text-emerald-400 block mt-0.5">
                              {p.dailyRoiPercent}% / {isHi ? 'दिन' : 'day'} · {p.durationDays} {isHi ? 'दिन' : 'days'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Slider */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-semibold uppercase text-slate-400">
                        {isHi ? 'निवेश राशि चुनें (INR):' : 'Select Amount (INR):'}
                      </label>
                      <span className="text-xl font-bold font-mono text-emerald-400">{formatINR(calcAmount)}</span>
                    </div>

                    <input
                      type="range"
                      min="10000"
                      max="1000000"
                      step="5000"
                      value={calcAmount}
                      onChange={(e) => setCalcAmount(Number(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                    />

                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {[10000, 25000, 50000, 100000, 200000, 500000, 1000000].map((amt) => (
                        <button
                          key={amt}
                          onClick={() => setCalcAmount(amt)}
                          className={`text-xs px-2.5 py-1 rounded-lg border font-mono transition-colors cursor-pointer ${
                            calcAmount === amt
                              ? 'bg-amber-400 text-slate-950 font-bold border-amber-400'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          {formatINR(amt)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Calculation Output Box */}
                <div className="lg:col-span-5 bg-slate-950 border border-amber-500/40 rounded-xl p-4 sm:p-5 space-y-3.5">
                  <div className="flex justify-between items-center pb-2.5 border-b border-slate-800">
                    <span className="text-xs uppercase font-bold text-slate-400">{isHi ? 'प्रत्याशित रिटर्न विवरण' : 'Projected Yield'}</span>
                    <span className="text-xs font-mono font-bold text-amber-400">+{totalGainPercent}% ROI</span>
                  </div>

                  <div className="space-y-2 font-mono text-xs sm:text-sm">
                    <div className="flex justify-between text-slate-300">
                      <span className="font-sans text-xs text-slate-400">{isHi ? 'प्रति 6-घंटे चक्र लाभ:' : 'Per 6h Cycle:'}</span>
                      <span className="font-bold text-emerald-400">+{formatINR(perCycleReturn)}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="font-sans text-xs text-slate-400">{isHi ? 'दैनिक (24h) कुल लाभ:' : 'Daily (24h) Payout:'}</span>
                      <span className="font-bold text-emerald-400">+{formatINR(dailyReturn)}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="font-sans text-xs text-slate-400">{isHi ? 'साप्ताहिक लाभ (7 दिन):' : 'Weekly (7d):'}</span>
                      <span className="font-bold text-emerald-400">+{formatINR(weeklyReturn)}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="font-sans text-xs text-slate-400">{isHi ? 'मासिक लाभ (30 दिन):' : 'Monthly (30d):'}</span>
                      <span className="font-bold text-emerald-400">+{formatINR(monthlyReturn)}</span>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                      <div>
                        <span className="font-sans text-xs text-slate-400 block">{isHi ? 'कुल परिपक्वता लाभ:' : 'Maturity Profit:'}</span>
                        <span className="font-sans text-[10px] text-slate-500">({activePlan.durationDays} {isHi ? 'दिन' : 'days'})</span>
                      </div>
                      <span className="text-lg font-extrabold text-amber-400">+{formatINR(totalMaturityReturn)}</span>
                    </div>

                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
                      <span className="font-sans text-xs text-slate-400">{isHi ? 'कुल देय राशि (मूलधन + लाभ):' : 'Total Payout:'}</span>
                      <span className="text-sm font-bold text-white">{formatINR(totalGrossAmount)}</span>
                    </div>
                  </div>

                  <button
                    onClick={onLaunchApp}
                    className="w-full py-3 text-center font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-md text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{isHi ? 'सॉफ्टवेयर ऐप में निवेश शुरू करें 🚀' : 'Start Investing in App 🚀'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: 📜 वैधानिक वॉल्ट (Legal & MCA) - ONLY LEGAL MATTER */}
        {/* ========================================================================= */}
        {activeTab === 'legal' && (
          <div className="py-4 sm:py-6 px-3 sm:px-6 max-w-7xl mx-auto space-y-5 animate-in fade-in-50 duration-200">
            <div className="space-y-1.5 max-w-3xl">
              <div className="inline-block px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-mono font-bold uppercase">
                TAB 5: STATUTORY & LEGAL VAULT
              </div>
              <h1 className="text-xl sm:text-3xl font-extrabold text-white">
                {isHi ? 'कंपनी मामलों का मंत्रालय (MCA) एवं सरकारी रिकॉर्ड' : 'Official Ministry of Corporate Affairs & Legal Records'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {isHi ? (
                  'जीकैप के सभी सरकारी पंजीकरण नंबर, निगमन विवरण, पैन, टैन और निदेशक सील की आधिकारिक जानकारी।'
                ) : (
                  'Verifiable statutory credentials registered with MCA, DPIIT Startup India, and Income Tax Department.'
                )}
              </p>
            </div>

            {/* Sub Tabs */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4">
              <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
                <button
                  onClick={() => setActiveLegalSubTab('MCA')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeLegalSubTab === 'MCA' ? 'bg-amber-400 text-slate-950' : 'bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  {isHi ? 'एमसीए निगमन प्रमाण पत्र (MCA)' : 'MCA Incorporation'}
                </button>
                <button
                  onClick={() => setActiveLegalSubTab('STARTUP')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeLegalSubTab === 'STARTUP' ? 'bg-amber-400 text-slate-950' : 'bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  {isHi ? 'स्टार्टअप इंडिया मान्यता (DPIIT)' : 'Startup India (DPIIT)'}
                </button>
                <button
                  onClick={() => setActiveLegalSubTab('SEAL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeLegalSubTab === 'SEAL' ? 'bg-amber-400 text-slate-950' : 'bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  {isHi ? 'आधिकारिक निदेशक सील व DIN' : 'Director DIN & Seal'}
                </button>
              </div>

              {activeLegalSubTab === 'MCA' && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-6 space-y-3 font-mono text-xs">
                  <div className="text-amber-400 font-bold border-b border-slate-800 pb-2 text-xs font-sans">
                    GOVERNMENT OF INDIA · MINISTRY OF CORPORATE AFFAIRS · ROC PATNA
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                    <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="text-slate-400 font-sans block text-[11px]">Company Legal Name:</span>
                      <span className="text-white font-bold text-xs mt-0.5 block">{companyProfile.companyName}</span>
                    </div>
                    <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="text-slate-400 font-sans block text-[11px]">Corporate Identification Number (CIN):</span>
                      <span className="text-amber-400 font-bold text-xs mt-0.5 block">{companyProfile.cin || 'U66190BR2026OPC088307'}</span>
                    </div>
                    <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="text-slate-400 font-sans block text-[11px]">Incorporation Date:</span>
                      <span className="text-slate-200 text-xs mt-0.5 block">{companyProfile.incorporationDate || '2026-09-23'}</span>
                    </div>
                    <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="text-slate-400 font-sans block text-[11px]">Authorised Capital:</span>
                      <span className="text-emerald-400 font-bold text-xs mt-0.5 block">{companyProfile.authorizedCapital || '₹55,00,00,000'}</span>
                    </div>
                    <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="text-slate-400 font-sans block text-[11px]">Corporate PAN:</span>
                      <span className="text-white font-bold text-xs mt-0.5 block">{companyProfile.pan || 'AANCG4365Q'}</span>
                    </div>
                    <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="text-slate-400 font-sans block text-[11px]">Corporate TAN:</span>
                      <span className="text-white font-bold text-xs mt-0.5 block">{companyProfile.tan || 'PTNG16977C'}</span>
                    </div>
                  </div>
                </div>
              )}

              {activeLegalSubTab === 'STARTUP' && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-6 space-y-3 font-mono text-xs">
                  <div className="text-sky-400 font-bold border-b border-slate-800 pb-2 text-xs font-sans">
                    DPIIT · MINISTRY OF COMMERCE & INDUSTRY · GOVERNMENT OF INDIA
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                    <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="text-slate-400 font-sans block text-[11px]">Certificate No:</span>
                      <span className="text-amber-400 font-bold text-xs mt-0.5 block">{companyProfile.dippNumber || 'DIPP285976'}</span>
                    </div>
                    <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="text-slate-400 font-sans block text-[11px]">Validity:</span>
                      <span className="text-emerald-400 font-bold text-xs mt-0.5 block">{companyProfile.startupIndiaCertValidUpto || '22-09-2036'} (10-Year Certificate)</span>
                    </div>
                  </div>
                </div>
              )}

              {activeLegalSubTab === 'SEAL' && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 text-center space-y-3">
                  <img
                    src={PRIMARY_COMPANY_LOGO}
                    alt="Corporate Logo"
                    className="w-24 h-24 mx-auto rounded-xl object-cover border-2 border-amber-500/50 shadow-xl"
                  />
                  <div>
                    <h4 className="text-base font-bold text-white">{companyProfile.authorizedSignatory || 'Amit Kumar'}</h4>
                    <p className="text-xs text-amber-400 font-mono font-semibold">{companyProfile.signatoryDesignation || 'Director & Authorized Signatory'}</p>
                    <p className="text-xs text-slate-400 font-mono">DIN: {companyProfile.signatoryDin || '11964641'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: 📞 संपर्क व सहायता (Contact Us) - ONLY CONTACT MATTER */}
        {/* ========================================================================= */}
        {activeTab === 'contact' && (
          <div className="py-4 sm:py-6 px-3 sm:px-6 max-w-7xl mx-auto space-y-5 animate-in fade-in-50 duration-200">
            <div className="space-y-1.5 max-w-3xl">
              <div className="inline-block px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-mono font-bold uppercase">
                TAB 6: CONTACT & SUPPORT DESK
              </div>
              <h1 className="text-xl sm:text-3xl font-extrabold text-white">
                {isHi ? 'जीकैप कॉर्पोरेट ऑफिस व हेल्पलाइन केंद्र' : 'Contact Corporate Headquarters & Support'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {isHi ? (
                  'हमारे सासाराम (बिहार) स्थित पंजीकृत कार्यालय से सीधा संपर्क करें या नीचे दिए गए फॉर्म से अपनी पूछताछ भेजें।'
                ) : (
                  'Get in touch directly with our corporate desk or submit your inquiry online.'
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Details */}
              <div className="lg:col-span-5 space-y-3">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4">
                  <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2">{isHi ? 'कार्यालय विवरण:' : 'Office Channels:'}</h3>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-white block">{isHi ? 'पंजीकृत कॉरपोरेट पता:' : 'Registered Office:'}</span>
                        <span className="text-slate-400 leading-relaxed">{companyProfile.registeredAddress}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <span className="font-bold text-white block">{isHi ? 'हेल्पलाइन फोन:' : 'Phone Line:'}</span>
                        <a href={`tel:${companyProfile.supportPhone}`} className="text-slate-300 hover:text-amber-400 font-mono">
                          {companyProfile.supportPhone}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                      <div>
                        <span className="font-bold text-white block">{isHi ? 'आधिकारिक सपोर्ट ईमेल:' : 'Official Email:'}</span>
                        <a href={`mailto:${companyProfile.supportEmail}`} className="text-slate-300 hover:text-amber-400 font-mono">
                          {companyProfile.supportEmail}
                        </a>
                      </div>
                    </div>

                    <div className="pt-1">
                      <a
                        href={`https://wa.me/${(companyProfile.adminWhatsAppNumber || '918603504808').replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors w-full justify-center"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>{isHi ? 'सीधे व्हाट्सएप पर चैट करें' : 'Chat on WhatsApp (Desk)'}</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Form */}
              <div className="lg:col-span-7">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
                  {contactSubmitted ? (
                    <div className="text-center py-8 space-y-3">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-bold text-white">{isHi ? 'संदेश सफलतापूर्वक दर्ज हुआ!' : 'Inquiry Submitted!'}</h3>
                      <p className="text-xs text-slate-400 max-w-md mx-auto">
                        {isHi ? 'जीकैप टीम को आपकी पूछताछ प्राप्त हो गई है। हम जल्द ही आपसे संपर्क करेंगे।' : 'Our team has logged your inquiry and will reach out shortly.'}
                      </p>
                      <button
                        onClick={() => setContactSubmitted(false)}
                        className="text-xs font-semibold text-amber-400 hover:underline cursor-pointer"
                      >
                        {isHi ? 'अन्य संदेश भेजें' : 'Send another inquiry'}
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="space-y-3">
                      <h3 className="text-base font-bold text-white">{isHi ? 'ऑनलाइन पूछताछ व परामर्श फॉर्म' : 'Online Consultation Form'}</h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1">{isHi ? 'पूरा नाम *' : 'Full Name *'}</label>
                          <input
                            type="text"
                            required
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                            placeholder={isHi ? 'उदा. राकेश कुमार' : 'e.g. Rakesh Kumar'}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1">{isHi ? 'मोबाइल नंबर *' : 'Phone Number *'}</label>
                          <input
                            type="tel"
                            required
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                            placeholder="9876543210"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">{isHi ? 'पूछताछ का विषय' : 'Subject'}</label>
                        <select
                          value={contactSubject}
                          onChange={(e) => setContactSubject(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                        >
                          <option value="New Investment">{isHi ? 'नया निवेश (New Investment)' : 'New Investment'}</option>
                          <option value="Scheme Inquiry">{isHi ? 'स्कीम जानकारी (Scheme Inquiry)' : 'Scheme Inquiry'}</option>
                          <option value="Account Support">{isHi ? 'अकाउंट सहायता (Account Support)' : 'Account Support'}</option>
                          <option value="Legal & MCA">{isHi ? 'कानूनी व एमसीए पूछताछ' : 'Legal & MCA'}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">{isHi ? 'संदेश' : 'Message'}</label>
                        <textarea
                          rows={2.5}
                          value={contactMessage}
                          onChange={(e) => setContactMessage(e.target.value)}
                          placeholder={isHi ? 'अपना सवाल या विवरण यहाँ लिखें...' : 'Type details here...'}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400 resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={contactSubmitting}
                        className="w-full py-2.5 rounded-xl font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-all shadow-md text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {contactSubmitting ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                            <span>{isHi ? 'भेजा जा रहा है...' : 'Sending...'}</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 text-slate-950" />
                            <span>{isHi ? 'पूछताछ दर्ज करें' : 'Submit Priority Inquiry'}</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>

            {/* Dedicated Social Media Showcase Section */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-amber-400" />
                    <span>{isHi ? 'आधिकारिक सोशल मीडिया चैनल्स (Official Channels):' : 'Official Social Media Channels:'}</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {isHi ? 'जीकैप के आधिकारिक YouTube, Telegram, WhatsApp ग्रुप, Facebook, Instagram, Twitter/X एवं LinkedIn से सीधे जुड़ें।' : 'Connect directly with GCAP official handles across YouTube, Telegram, WhatsApp Group, Facebook, Instagram, Twitter/X & LinkedIn.'}
                  </p>
                </div>
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 font-bold shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isHi ? 'सत्यापित कॉर्पोरेट हैंडल' : 'Verified Handles'}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {socialMediaChannels.map((soc) => {
                  const SocIcon = soc.icon;
                  return (
                    <div
                      key={soc.id}
                      className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between space-y-3 group ${soc.color}`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 group-hover:scale-105 transition-transform">
                            <SocIcon className="w-4 h-4" />
                          </div>
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-slate-950 border border-slate-800">
                            {isHi ? soc.badgeHi : soc.badgeEn}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">{isHi ? soc.nameHi : soc.name}</h4>
                          <p className="text-[10px] font-mono text-slate-400 truncate mt-0.5">{soc.url}</p>
                        </div>
                      </div>

                      <a
                        href={soc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-full py-2 px-2.5 rounded-lg text-xs font-bold text-center transition-all flex items-center justify-center gap-1 shadow-md ${soc.btnBg}`}
                      >
                        <span>{isHi ? soc.btnTextHi : soc.btnTextEn}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* FAQs */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-3">
              <h3 className="text-base font-bold text-white">{isHi ? 'सामान्य प्रश्न व उत्तर (FAQs):' : 'Frequently Asked Questions:'}</h3>
              <div className="space-y-2">
                {[
                  {
                    qHi: 'क्या जीकैप भारत सरकार से पंजीकृत है?',
                    qEn: 'Is GCAP registered with Govt of India?',
                    aHi: 'हाँ। जीकैप (OPC) प्राइवेट लिमिटेड कंपनी मामलों के मंत्रालय (MCA), भारत सरकार के अधीन पंजीकृत है (CIN: U66190BR2026OPC088307)। साथ ही उद्योग संवर्धन और आंतरिक व्यापार विभाग (DPIIT) द्वारा स्टार्टअप इंडिया इकाई के रूप में मान्यता प्राप्त है (DIPP285976)।',
                    aEn: 'Yes. Incorporate under MCA, Govt of India (CIN: U66190BR2026OPC088307) and recognized by DPIIT Startup India (DIPP285976).',
                  },
                  {
                    qHi: '6-घंटे का चक्र (Cycle) कैसे काम करता है?',
                    qEn: 'How does the 6-hour cycle work?',
                    aHi: 'प्रतिदिन 4 चक्र होते हैं: 00:00, 06:00, 12:00, और 18:00। प्रत्येक चक्र में 0.040% GP आपके वॉलेट में स्वतः क्रेडिट होता है।',
                    aEn: 'There are four daily cycles: 00:00, 06:00, 12:00, and 18:00, with automated GP credits.',
                  },
                  {
                    qHi: '1 GP का मूल्य कितना है?',
                    qEn: 'What is 1 GP worth?',
                    aHi: `वर्तमान विनिमय दर ₹1 = ${activeRules.gpRatePerRupee ?? 0.98} GP है। 1 GP 100% भारतीय रुपये (INR) में सीधे बैंक में निकासी योग्य है।`,
                    aEn: `The official exchange rate is ₹1 = ${activeRules.gpRatePerRupee ?? 0.98} GP. 1 GP is 100% withdrawable to INR direct bank account.`,
                  },
                ].map((faq, idx) => {
                  const isOpen = faqOpenIndex === idx;
                  return (
                    <div key={idx} className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setFaqOpenIndex(isOpen ? null : idx)}
                        className="w-full p-3 text-left flex justify-between items-center text-xs font-semibold text-white hover:text-amber-400"
                      >
                        <span>{isHi ? faq.qHi : faq.qEn}</span>
                        {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-amber-400 shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
                      </button>
                      {isOpen && (
                        <div className="px-3 pb-3 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800">
                          {isHi ? faq.aHi : faq.aEn}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 5. MULTI-PAGE CORPORATE FOOTER */}
      <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-xs py-5 px-3 sm:px-6 shrink-0 space-y-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 items-center border-b border-slate-800/80 pb-4">
          <div className="md:col-span-4 flex items-center gap-2.5">
            <img src={PRIMARY_COMPANY_LOGO} alt="Logo" className="w-8 h-8 rounded-lg border border-amber-500/40" />
            <div>
              <span className="font-bold font-mono text-white text-xs block">{activeProfile.tradeName || 'GCap OPC Private Limited'}</span>
              <span className="text-[10px] text-slate-400 font-mono">CIN: {activeProfile.cin || 'U66190BR2026OPC088307'}</span>
            </div>
          </div>

          <div className="md:col-span-8 flex flex-wrap items-center justify-start md:justify-end gap-1.5">
            <span className="text-[11px] font-bold text-amber-400 mr-1 flex items-center gap-1">
              <Share2 className="w-3.5 h-3.5" />
              <span>{isHi ? 'सोशल लिंक:' : 'Social:'}</span>
            </span>
            {socialMediaChannels.map((soc) => {
              const SocIcon = soc.icon;
              return (
                <a
                  key={soc.id}
                  href={soc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`px-2 py-0.5 rounded-lg border text-[11px] font-medium flex items-center gap-1 transition-all ${soc.color}`}
                  title={isHi ? soc.nameHi : soc.name}
                >
                  <SocIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{soc.name}</span>
                </a>
              );
            })}
          </div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center justify-center gap-2.5 text-[11px]">
            {tabsConfig.map((t) => (
              <button
                key={t.id}
                onClick={() => handleTabChange(t.id)}
                className={`cursor-pointer hover:text-amber-400 transition-colors ${activeTab === t.id ? 'text-amber-400 font-bold' : 'text-slate-400'}`}
              >
                {isHi ? t.labelHi.split(' ')[1] : t.labelEn.split(' ')[1]}
              </button>
            ))}
          </div>

          <div className="text-[10px] text-slate-500">
            © 2026 {activeProfile.companyName}. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
