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
  Scale
} from 'lucide-react';
import { CompanyProfile, InvestmentPlan, Language } from '../types';
import { DEFAULT_COMPANY_PROFILE } from '../utils/companyStorage';
import { PRIMARY_COMPANY_LOGO, OFFICIAL_SEAL_LOGO } from '../utils/logoAssets';
import { INVESTMENT_PLANS } from '../utils/plansStorage';
import { formatINR } from '../utils/storage';

export type WebTabId = 'home' | 'about' | 'plans' | 'calculator' | 'legal' | 'contact';

interface CorporateWebsiteProps {
  companyProfile?: CompanyProfile;
  plans?: InvestmentPlan[];
  language?: Language;
  onLaunchApp: () => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
}

export const CorporateWebsite: React.FC<CorporateWebsiteProps> = ({
  companyProfile = DEFAULT_COMPANY_PROFILE,
  plans = INVESTMENT_PLANS,
  language: initialLang = 'hi',
  onLaunchApp,
  onOpenLogin,
  onOpenRegister,
}) => {
  const [lang, setLang] = useState<Language>(initialLang);
  const isHi = lang === 'hi';

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

  const handleTabChange = (tab: WebTabId) => {
    setActiveTab(tab);
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

  const tabsConfig: { id: WebTabId; labelHi: string; labelEn: string; icon: any }[] = [
    { id: 'home', labelHi: '🏠 होम (Home)', labelEn: '🏠 Home', icon: Home },
    { id: 'about', labelHi: '🏛️ कंपनी परिचय', labelEn: '🏛️ About Us', icon: Building2 },
    { id: 'plans', labelHi: '📈 निवेश योजनाएं', labelEn: '📈 Investment Schemes', icon: TrendingUp },
    { id: 'calculator', labelHi: '🧮 रिटर्न कैलकुलेटर', labelEn: '🧮 Yield Calculator', icon: Calculator },
    { id: 'legal', labelHi: '📜 वैधानिक वॉल्ट (MCA)', labelEn: '📜 Legal & MCA', icon: ShieldCheck },
    { id: 'contact', labelHi: '📞 संपर्क व सहायता', labelEn: '📞 Contact Us', icon: Phone },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 antialiased flex flex-col justify-between">


      {/* 2. PRIMARY LOGO HEADER */}
      <header className="bg-slate-950/95 border-b border-amber-500/20 shrink-0 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-3 sm:px-8 py-3 flex items-center justify-between gap-2">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5 cursor-pointer min-w-0 flex-1" onClick={() => handleTabChange('home')}>
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl overflow-hidden border border-amber-500/50 bg-slate-900 shrink-0 shadow-md flex items-center justify-center">
              <img
                src={PRIMARY_COMPANY_LOGO}
                alt="GCap Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[13px] sm:text-xl font-black tracking-tight text-white font-mono leading-tight">
                  GCap OPC Private Limited
                </span>
                <span className="hidden sm:inline-block text-[9px] uppercase font-mono font-bold text-amber-300 bg-amber-500/20 border border-amber-500/40 px-1.5 py-0.5 rounded">
                  MCA REG
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium truncate">
                {isHi ? 'कॉरपोरेट परिसंपत्ति प्रबंधन' : 'Corporate Asset Management'}
              </p>
            </div>
          </div>

          {/* Language Toggle */}
          <div className="flex items-center shrink-0">
            <button
              onClick={() => setLang(isHi ? 'en' : 'hi')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-amber-300 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-md"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>{isHi ? 'English' : 'हिन्दी'}</span>
            </button>
          </div>

        </div>

        {/* 3. PROMINENT 6-TAB CONTROLLER BAR (STICKY & HORIZONTALLY SCROLLABLE ON MOBILE) */}
        <div className="bg-slate-900/90 border-t border-slate-800/80 px-2 sm:px-8 py-2 sticky top-0 z-30 shadow-lg backdrop-blur-md">
          <div className="max-w-7xl mx-auto flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar scroll-smooth">
            {tabsConfig.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`shrink-0 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 border ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 border-amber-300 shadow-md shadow-amber-500/20 scale-[1.02]'
                      : 'bg-slate-950/80 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-800'
                  }`}
                >
                  <span>{isHi ? tab.labelHi : tab.labelEn}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* 4. ISOLATED TAB CONTENT (ONLY ACTIVE TAB'S MATTER SHOWS) */}
      <main className="flex-1 w-full">
        {/* ========================================================================= */}
        {/* TAB 1: 🏠 होम (Home) - ONLY HOME MATTER */}
        {/* ========================================================================= */}
        {activeTab === 'home' && (
          <div className="py-10 sm:py-16 px-4 sm:px-8 max-w-7xl mx-auto space-y-12 animate-in fade-in-50 duration-200">
            {/* Hero Card */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-12 space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/30 text-xs text-emerald-300 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>{isHi ? 'भारत सरकार (MCA) पंजीकृत कॉरपोरेट वेल्थ संस्था' : 'Govt of India MCA Registered Corporate Entity'}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-3xl">
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

              <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                {isHi ? (
                  'हम भारत सरकार के कॉर्पोरेट मामलों के मंत्रालय (MCA) के अधीन पंजीकृत हैं। हमारे अत्याधुनिक सॉफ्टवेयर एल्गोरिदम द्वारा प्रत्येक 24 घंटे में 4 निश्चित चक्रों में बिना किसी मानवीय हस्तक्षेप के स्वचालित रिटर्न प्रदान किया जाता है।'
                ) : (
                  'Compliant with the Ministry of Corporate Affairs (MCA), Govt of India. Delivering automated 4-times-daily cycle payouts with full statutory transparency.'
                )}
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <button
                  onClick={onLaunchApp}
                  className="px-6 py-3.5 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition-all shadow-lg shadow-amber-500/20 text-sm flex items-center gap-2 cursor-pointer"
                >
                  <span>{isHi ? 'इन्वेस्टर सॉफ्टवेयर पोर्टल खोलें 🚀' : 'Launch Software Portal 🚀'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleTabChange('plans')}
                  className="px-6 py-3.5 rounded-xl font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-all text-sm cursor-pointer"
                >
                  {isHi ? 'इन्वेस्टमेंट स्कीम्स देखें →' : 'View Investment Schemes →'}
                </button>
                <button
                  onClick={() => handleTabChange('calculator')}
                  className="px-6 py-3.5 rounded-xl font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-all text-sm cursor-pointer"
                >
                  {isHi ? 'रिटर्न कैलकुलेटर खोलें →' : 'Open Yield Calculator →'}
                </button>
              </div>
            </div>

            {/* 4 Performance Tiles */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
                <span className="text-xs text-slate-400">{isHi ? 'अधिकृत पूंजी (Authorised)' : 'Authorised Capital'}</span>
                <div className="text-xl sm:text-2xl font-extrabold font-mono text-emerald-400">₹55,00,00,000</div>
                <span className="text-[10px] text-slate-500">{isHi ? '₹55 करोड़ MCA अनुमोदित' : '₹55 Cr MCA Approved'}</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
                <span className="text-xs text-slate-400">{isHi ? 'सक्रिय प्रबंधित पूंजी' : 'Active Assets Managed'}</span>
                <div className="text-xl sm:text-2xl font-extrabold font-mono text-amber-400">₹24.8 Cr+</div>
                <span className="text-[10px] text-slate-500">{isHi ? '14,850+ निवेशकों द्वारा' : '14,850+ Investors'}</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
                <span className="text-xs text-slate-400">{isHi ? 'दैनिक चक्र पेआउट्स' : 'Daily Payout Cycles'}</span>
                <div className="text-xl sm:text-2xl font-extrabold font-mono text-sky-400">4x Every 24h</div>
                <span className="text-[10px] text-slate-500">{isHi ? 'हर 6 घंटे में 0.040% GP' : '0.040% every 6 hours'}</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
                <span className="text-xs text-slate-400">{isHi ? 'GP विनिमय दर (Peg)' : 'GP Value Ratio'}</span>
                <div className="text-xl sm:text-2xl font-extrabold font-mono text-white">1 GP = ₹1.00</div>
                <span className="text-[10px] text-emerald-400">{isHi ? '100% भारतीय रुपये में निकासी' : '100% INR Direct Bank'}</span>
              </div>
            </div>

            {/* Quick Tab Jump Grid */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
              <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3">
                {isHi ? 'वेबसाइट के अन्य विभाग चुनें (Tab Selector):' : 'Explore Other Sections:'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/60 text-left transition-all cursor-pointer group space-y-1.5"
                  >
                    <div className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors flex justify-between items-center">
                      <span>{isHi ? s.titleHi : s.titleEn}</span>
                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-transform group-hover:translate-x-1" />
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{isHi ? s.descHi : s.titleEn}</p>
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
          <div className="py-10 sm:py-16 px-4 sm:px-8 max-w-7xl mx-auto space-y-12 animate-in fade-in-50 duration-200">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-block px-3 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-mono font-bold uppercase">
                TAB 2: CORPORATE PROFILE
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
                {isHi ? 'जीकैप (OPC) प्राइवेट लिमिटेड: कंपनी परिचय एवं प्रबंधन' : 'About GCAP (OPC) PRIVATE LIMITED'}
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed">
                {isHi ? (
                  'जीकैप भारत सरकार के कॉर्पोरेट मामलों के मंत्रालय (MCA), कंपनी अधिनियम 2013 के अधीन विधिवत निगमित संस्था है (ROC पटना, बिहार)।'
                ) : (
                  'Incorporated under the Companies Act 2013, Ministry of Corporate Affairs, ROC Patna, Bihar.'
                )}
              </p>
            </div>

            {/* Leadership Profile Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-6">
              <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-3">{isHi ? 'कंपनी निदेशक व अधिकृत हस्ताक्षरकर्ता:' : 'Director & Management:'}</h2>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <img
                  src={PRIMARY_COMPANY_LOGO}
                  alt="Director Logo"
                  className="w-28 h-28 rounded-2xl object-cover border-2 border-amber-500/50 shadow-xl shrink-0"
                />
                <div className="space-y-2 text-center sm:text-left">
                  <div className="inline-block px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-mono font-bold">
                    AUTHORIZED DIRECTOR
                  </div>
                  <h3 className="text-2xl font-bold text-white">{companyProfile.authorizedSignatory || 'Amit Kumar'}</h3>
                  <p className="text-xs text-amber-400 font-mono font-bold">{companyProfile.signatoryDesignation || 'Director & Authorized Signatory'}</p>
                  <p className="text-xs text-slate-300 font-mono">DIN: {companyProfile.signatoryDin || '11964641'}</p>
                  <p className="text-xs text-slate-400">{companyProfile.registeredAddress}</p>
                </div>
              </div>
            </div>

            {/* Banking Partner */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
              <h2 className="text-lg font-bold text-white">{isHi ? 'कंपनी का प्राथमिक बैंकिंग खाता विवरण:' : 'Official Banking Partner:'}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-sans block">{isHi ? 'बैंक का नाम:' : 'Bank Name:'}</span>
                  <span className="text-white font-bold text-sm mt-1 block">{companyProfile.bankName || 'Axis Bank Ltd.'}</span>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-sans block">{isHi ? 'खाता संख्या:' : 'Account Number:'}</span>
                  <span className="text-amber-400 font-bold text-sm mt-1 block">{companyProfile.bankAccountNumber || '924010008662307'}</span>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-sans block">IFSC Code:</span>
                  <span className="text-emerald-400 font-bold text-sm mt-1 block">{companyProfile.bankIfsc || 'UTIB0001219'}</span>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-sans block">{isHi ? 'शाखा (Branch):' : 'Branch:'}</span>
                  <span className="text-slate-200 mt-1 block">{companyProfile.bankBranch || 'Sasaram Branch'}</span>
                </div>
              </div>
            </div>

            {/* Mission & Vision */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="text-base font-bold text-white">{isHi ? 'हमारा विज़न (Our Vision)' : 'Our Vision'}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isHi ? (
                    'तकनीक और नियमों के समन्वय से भारत में परिसंपत्ति प्रबंधन को पारदर्शी बनाना, जिससे हर निवेशक को समय पर निश्चित चक्र लाभ प्राप्त हो सके।'
                  ) : (
                    'To democratize institutional wealth accumulation across India via transparent, automated fixed-cycle distribution.'
                  )}
                </p>
              </div>
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="text-base font-bold text-white">{isHi ? 'हमारा मिशन (Our Mission)' : 'Our Mission'}</h3>
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
          <div className="py-10 sm:py-16 px-4 sm:px-8 max-w-7xl mx-auto space-y-12 animate-in fade-in-50 duration-200">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-block px-3 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-mono font-bold uppercase">
                TAB 3: INVESTMENT SCHEMES
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
                {isHi ? 'जीकैप सक्रिय निवेश योजनाएं एवं नियम' : 'GCap Active Investment Schemes & Rules'}
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed">
                {isHi ? (
                  'सभी प्लान्स में 24 घंटे में 4 निश्चित चक्रों (00:00, 06:00, 12:00, 18:00) में लाभ वॉलेट में क्रेडिट होता है।'
                ) : (
                  'All schemes feature 4 automated daily cycles with guaranteed server-side distribution and monthly bank redemption.'
                )}
              </p>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {plans.map((p, idx) => {
                const isPopular = idx === 0 || p.id === 'short-term';
                return (
                  <div
                    key={p.id}
                    className={`rounded-3xl p-6 sm:p-8 flex flex-col justify-between border ${
                      isPopular
                        ? 'bg-slate-900 border-2 border-amber-500/60 shadow-2xl'
                        : 'bg-slate-900/80 border-slate-800'
                    }`}
                  >
                    <div className="space-y-4">
                      {isPopular && (
                        <span className="inline-block px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-bold text-[10px] uppercase">
                          {isHi ? 'सर्वाधिक लोकप्रिय' : 'MOST POPULAR'}
                        </span>
                      )}
                      <h3 className="text-lg font-bold text-white">{isHi ? p.nameHi || p.name : p.name}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">{isHi ? p.descriptionHi || p.description : p.description}</p>

                      <div className="py-4 border-y border-slate-800 space-y-1">
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-extrabold font-mono text-emerald-400">{p.dailyRoiPercent}%</span>
                          <span className="text-xs text-slate-400">/ {isHi ? 'दिन' : 'day'}</span>
                        </div>
                        <span className="text-xs text-amber-400 font-mono block">
                          {isHi ? p.payoutFrequencyHi || 'हर 6 घंटे में 0.040% GP' : `${(p.dailyRoiPercent / 4).toFixed(3)}% every 6 hours`}
                        </span>
                      </div>

                      <div className="space-y-2 text-xs text-slate-300 font-mono">
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

                      <div className="pt-2">
                        <span className="text-[11px] font-semibold uppercase text-slate-400 block mb-2">{isHi ? 'प्रमुख विशेषताएं:' : 'Key Terms:'}</span>
                        <ul className="space-y-1.5 text-xs text-slate-300">
                          {(p.featuresHi || p.features || []).map((feat, fidx) => (
                            <li key={fidx} className="flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-6 space-y-2">
                      <button
                        onClick={() => {
                          setSelectedPlanId(p.id);
                          handleTabChange('calculator');
                        }}
                        className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Calculator className="w-3.5 h-3.5 text-amber-400" />
                        <span>{isHi ? 'कैलकुलेटर में लाभ देखें' : 'Calculate Yield in Tab 4'}</span>
                      </button>

                      <button
                        onClick={onLaunchApp}
                        className="w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-amber-400 text-slate-950 hover:bg-amber-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
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
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
              <h2 className="text-lg font-bold text-white">{isHi ? 'विस्तृत योजना तुलना (Comparison Table):' : 'Detailed Comparison:'}</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-3 px-4 font-semibold">{isHi ? 'पैरामीटर' : 'Parameter'}</th>
                      <th className="py-3 px-4 font-semibold text-amber-400">Short Term (641-Day)</th>
                      <th className="py-3 px-4 font-semibold text-emerald-400">Long Term & Royalty (365-Day)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                    <tr>
                      <td className="py-3 px-4 font-sans text-slate-400">{isHi ? 'न्यूनतम निवेश' : 'Min Deposit'}</td>
                      <td className="py-3 px-4 text-white font-bold">₹1,00,000</td>
                      <td className="py-3 px-4 text-white font-bold">₹10,000</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-sans text-slate-400">{isHi ? 'प्रति 6-घंटे चक्र लाभ' : 'Per 6h Cycle'}</td>
                      <td className="py-3 px-4 text-amber-400 font-bold">0.040% GP</td>
                      <td className="py-3 px-4 text-amber-400 font-bold">0.033% GP</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-sans text-slate-400">{isHi ? 'दैनिक रिटर्न (24h)' : 'Daily ROI'}</td>
                      <td className="py-3 px-4 text-emerald-400 font-bold">0.160% / day</td>
                      <td className="py-3 px-4 text-emerald-400 font-bold">0.132% / day</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-sans text-slate-400">{isHi ? 'निकासी विंडो' : 'Withdrawal Window'}</td>
                      <td className="py-3 px-4 font-sans text-emerald-400">1st to 5th Monthly</td>
                      <td className="py-3 px-4 font-sans text-emerald-400">1st to 5th Monthly</td>
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
          <div className="py-10 sm:py-16 px-4 sm:px-8 max-w-7xl mx-auto space-y-12 animate-in fade-in-50 duration-200">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-block px-3 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-mono font-bold uppercase">
                TAB 4: YIELD & PROFIT CALCULATOR
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
                {isHi ? 'इंटरैक्टिव रिटर्न एवं साइकिल कैलकुलेटर' : 'Interactive Return & Yield Calculator'}
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed">
                {isHi ? (
                  'अपनी निवेश राशि और योजना चुनें। सिस्टम आपको 6-घंटे के चक्र, दैनिक और परिपक्वता का सटीक लाभ दिखाएगा।'
                ) : (
                  'Select your investment amount and scheme to see exact 6-hour cycle returns and total maturity payouts.'
                )}
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-7 space-y-6">
                  {/* Select Plan */}
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">
                      {isHi ? 'योजना (Scheme) चुनें:' : 'Select Scheme:'}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {plans.map((p) => {
                        const isSel = p.id === selectedPlanId;
                        return (
                          <button
                            key={p.id}
                            onClick={() => setSelectedPlanId(p.id)}
                            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                              isSel
                                ? 'bg-amber-500/10 border-amber-500 text-white shadow-md'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold">{isHi ? p.nameHi || p.name : p.name}</span>
                              {isSel && <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />}
                            </div>
                            <span className="text-xs font-mono text-emerald-400 block mt-1">
                              {p.dailyRoiPercent}% / {isHi ? 'दिन' : 'day'} · {p.durationDays} {isHi ? 'दिन' : 'days'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Slider */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-semibold uppercase text-slate-400">
                        {isHi ? 'निवेश राशि चुनें (INR):' : 'Select Amount (INR):'}
                      </label>
                      <span className="text-2xl font-bold font-mono text-emerald-400">{formatINR(calcAmount)}</span>
                    </div>

                    <input
                      type="range"
                      min="10000"
                      max="1000000"
                      step="5000"
                      value={calcAmount}
                      onChange={(e) => setCalcAmount(Number(e.target.value))}
                      className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                    />

                    <div className="flex flex-wrap gap-2 mt-4">
                      {[10000, 25000, 50000, 100000, 200000, 500000, 1000000].map((amt) => (
                        <button
                          key={amt}
                          onClick={() => setCalcAmount(amt)}
                          className={`text-xs px-3 py-1.5 rounded-lg border font-mono transition-colors cursor-pointer ${
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
                <div className="lg:col-span-5 bg-slate-950 border border-amber-500/40 rounded-2xl p-6 sm:p-8 space-y-5">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                    <span className="text-xs uppercase font-bold text-slate-400">{isHi ? 'प्रत्याशित रिटर्न विवरण' : 'Projected Yield'}</span>
                    <span className="text-xs font-mono font-bold text-amber-400">+{totalGainPercent}% ROI</span>
                  </div>

                  <div className="space-y-3 font-mono text-sm">
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

                    <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                      <div>
                        <span className="font-sans text-xs text-slate-400 block">{isHi ? 'कुल परिपक्वता लाभ:' : 'Maturity Profit:'}</span>
                        <span className="font-sans text-[11px] text-slate-500">({activePlan.durationDays} {isHi ? 'दिन' : 'days'})</span>
                      </div>
                      <span className="text-xl font-extrabold text-amber-400">+{formatINR(totalMaturityReturn)}</span>
                    </div>

                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                      <span className="font-sans text-xs text-slate-400">{isHi ? 'कुल देय राशि (मूलधन + लाभ):' : 'Total Payout:'}</span>
                      <span className="text-base font-bold text-white">{formatINR(totalGrossAmount)}</span>
                    </div>
                  </div>

                  <button
                    onClick={onLaunchApp}
                    className="w-full py-3.5 text-center font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-md text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
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
          <div className="py-10 sm:py-16 px-4 sm:px-8 max-w-7xl mx-auto space-y-12 animate-in fade-in-50 duration-200">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-block px-3 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-mono font-bold uppercase">
                TAB 5: STATUTORY & LEGAL VAULT
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
                {isHi ? 'कंपनी मामलों का मंत्रालय (MCA) एवं सरकारी रिकॉर्ड' : 'Official Ministry of Corporate Affairs & Legal Records'}
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed">
                {isHi ? (
                  'जीकैप के सभी सरकारी पंजीकरण नंबर, निगमन विवरण, पैन, टैन और निदेशक सील की आधिकारिक जानकारी।'
                ) : (
                  'Verifiable statutory credentials registered with MCA, DPIIT Startup India, and Income Tax Department.'
                )}
              </p>
            </div>

            {/* Sub Tabs */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-6">
              <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-4">
                <button
                  onClick={() => setActiveLegalSubTab('MCA')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeLegalSubTab === 'MCA' ? 'bg-amber-400 text-slate-950' : 'bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  {isHi ? 'एमसीए निगमन प्रमाण पत्र (MCA)' : 'MCA Incorporation'}
                </button>
                <button
                  onClick={() => setActiveLegalSubTab('STARTUP')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeLegalSubTab === 'STARTUP' ? 'bg-amber-400 text-slate-950' : 'bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  {isHi ? 'स्टार्टअप इंडिया मान्यता (DPIIT)' : 'Startup India (DPIIT)'}
                </button>
                <button
                  onClick={() => setActiveLegalSubTab('SEAL')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeLegalSubTab === 'SEAL' ? 'bg-amber-400 text-slate-950' : 'bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  {isHi ? 'आधिकारिक निदेशक सील व DIN' : 'Director DIN & Seal'}
                </button>
              </div>

              {activeLegalSubTab === 'MCA' && (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 font-mono text-xs">
                  <div className="text-amber-400 font-bold border-b border-slate-800 pb-2 text-sm font-sans">
                    GOVERNMENT OF INDIA · MINISTRY OF CORPORATE AFFAIRS · ROC PATNA
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="text-slate-400 font-sans block">Company Legal Name:</span>
                      <span className="text-white font-bold text-sm mt-1 block">{companyProfile.companyName}</span>
                    </div>
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="text-slate-400 font-sans block">Corporate Identification Number (CIN):</span>
                      <span className="text-amber-400 font-bold text-sm mt-1 block">{companyProfile.cin || 'U66190BR2026OPC088307'}</span>
                    </div>
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="text-slate-400 font-sans block">Incorporation Date:</span>
                      <span className="text-slate-200 mt-1 block">{companyProfile.incorporationDate || '2026-09-23'}</span>
                    </div>
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="text-slate-400 font-sans block">Authorised Capital:</span>
                      <span className="text-emerald-400 font-bold mt-1 block">{companyProfile.authorizedCapital || '₹55,00,00,000'}</span>
                    </div>
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="text-slate-400 font-sans block">Corporate PAN:</span>
                      <span className="text-white font-bold mt-1 block">{companyProfile.pan || 'AANCG4365Q'}</span>
                    </div>
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="text-slate-400 font-sans block">Corporate TAN:</span>
                      <span className="text-white font-bold mt-1 block">{companyProfile.tan || 'PTNG16977C'}</span>
                    </div>
                  </div>
                </div>
              )}

              {activeLegalSubTab === 'STARTUP' && (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 font-mono text-xs">
                  <div className="text-sky-400 font-bold border-b border-slate-800 pb-2 text-sm font-sans">
                    DPIIT · MINISTRY OF COMMERCE & INDUSTRY · GOVERNMENT OF INDIA
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="text-slate-400 font-sans block">Certificate No:</span>
                      <span className="text-amber-400 font-bold text-sm mt-1 block">{companyProfile.dippNumber || 'DIPP285976'}</span>
                    </div>
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="text-slate-400 font-sans block">Validity:</span>
                      <span className="text-emerald-400 font-bold mt-1 block">{companyProfile.startupIndiaCertValidUpto || '22-09-2036'} (10-Year Certificate)</span>
                    </div>
                  </div>
                </div>
              )}

              {activeLegalSubTab === 'SEAL' && (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-8 text-center space-y-4">
                  <img
                    src={PRIMARY_COMPANY_LOGO}
                    alt="Corporate Logo"
                    className="w-32 h-32 mx-auto rounded-2xl object-cover border-2 border-amber-500/50 shadow-2xl"
                  />
                  <div>
                    <h4 className="text-lg font-bold text-white">{companyProfile.authorizedSignatory || 'Amit Kumar'}</h4>
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
          <div className="py-10 sm:py-16 px-4 sm:px-8 max-w-7xl mx-auto space-y-12 animate-in fade-in-50 duration-200">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-block px-3 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-mono font-bold uppercase">
                TAB 6: CONTACT & SUPPORT DESK
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
                {isHi ? 'जीकैप कॉर्पोरेट ऑफिस व हेल्पलाइन केंद्र' : 'Contact Corporate Headquarters & Support'}
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed">
                {isHi ? (
                  'हमारे सासाराम (बिहार) स्थित पंजीकृत कार्यालय से सीधा संपर्क करें या नीचे दिए गए फॉर्म से अपनी पूछताछ भेजें।'
                ) : (
                  'Get in touch directly with our corporate desk or submit your inquiry online.'
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Details */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
                  <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3">{isHi ? 'कार्यालय विवरण:' : 'Office Channels:'}</h3>

                  <div className="space-y-4 text-xs sm:text-sm">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-white block">{isHi ? 'पंजीकृत कॉरपोरेट पता:' : 'Registered Office:'}</span>
                        <span className="text-slate-400 leading-relaxed">{companyProfile.registeredAddress}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-emerald-400 shrink-0" />
                      <div>
                        <span className="font-bold text-white block">{isHi ? 'हेल्पलाइन फोन:' : 'Phone Line:'}</span>
                        <a href={`tel:${companyProfile.supportPhone}`} className="text-slate-300 hover:text-amber-400 font-mono">
                          {companyProfile.supportPhone}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-sky-400 shrink-0" />
                      <div>
                        <span className="font-bold text-white block">{isHi ? 'आधिकारिक सपोर्ट ईमेल:' : 'Official Email:'}</span>
                        <a href={`mailto:${companyProfile.supportEmail}`} className="text-slate-300 hover:text-amber-400 font-mono">
                          {companyProfile.supportEmail}
                        </a>
                      </div>
                    </div>

                    <div className="pt-2">
                      <a
                        href={`https://wa.me/${(companyProfile.adminWhatsAppNumber || '918603504808').replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors w-full justify-center"
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
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
                  {contactSubmitted ? (
                    <div className="text-center py-12 space-y-4">
                      <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-bold text-white">{isHi ? 'संदेश सफलतापूर्वक दर्ज हुआ!' : 'Inquiry Submitted!'}</h3>
                      <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
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
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                      <h3 className="text-lg font-bold text-white">{isHi ? 'ऑनलाइन पूछताछ व परामर्श फॉर्म' : 'Online Consultation Form'}</h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1">{isHi ? 'पूरा नाम *' : 'Full Name *'}</label>
                          <input
                            type="text"
                            required
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                            placeholder={isHi ? 'उदा. राकेश कुमार' : 'e.g. Rakesh Kumar'}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
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
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">{isHi ? 'पूछताछ का विषय' : 'Subject'}</label>
                        <select
                          value={contactSubject}
                          onChange={(e) => setContactSubject(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
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
                          rows={3}
                          value={contactMessage}
                          onChange={(e) => setContactMessage(e.target.value)}
                          placeholder={isHi ? 'अपना सवाल या विवरण यहाँ लिखें...' : 'Type details here...'}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={contactSubmitting}
                        className="w-full py-3.5 rounded-xl font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-all shadow-md text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
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

            {/* FAQs */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
              <h3 className="text-lg font-bold text-white">{isHi ? 'सामान्य प्रश्न व उत्तर (FAQs):' : 'Frequently Asked Questions:'}</h3>
              <div className="space-y-3">
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
                    aHi: '1 GP का मूल्य ठीक ₹1.00 (एक भारतीय रुपया) के बराबर है।',
                    aEn: '1 GP is strictly equal to ₹1.00 INR.',
                  },
                ].map((faq, idx) => {
                  const isOpen = faqOpenIndex === idx;
                  return (
                    <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setFaqOpenIndex(isOpen ? null : idx)}
                        className="w-full p-4 text-left flex justify-between items-center text-sm font-semibold text-white hover:text-amber-400"
                      >
                        <span>{isHi ? faq.qHi : faq.qEn}</span>
                        {isOpen ? <ChevronUp className="w-4 h-4 text-amber-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />}
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800">
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
      <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-xs py-8 px-4 sm:px-8 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={PRIMARY_COMPANY_LOGO} alt="Logo" className="w-7 h-7 rounded-lg" />
            <span className="font-bold font-mono text-white text-xs">{companyProfile.tradeName || 'GCap OPC Private Limited'}</span>
            <span className="text-slate-600">·</span>
            <span>CIN: {companyProfile.cin || 'U66190BR2026OPC088307'}</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px]">
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

          <div className="text-[11px] text-slate-500">
            © 2026 {companyProfile.companyName}
          </div>
        </div>
      </footer>
    </div>
  );
};
