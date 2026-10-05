import React, { useState, useEffect } from 'react';
import {
  MessageCircle,
  Send,
  CheckCircle2,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  Phone,
  ShieldCheck,
  Sparkles,
  Search,
  Filter,
  Eye,
  Calendar,
  ExternalLink,
  Smartphone,
  Info,
  Clock,
  Download,
  ChevronDown,
  ChevronUp,
  Key,
  Globe,
  Award,
} from 'lucide-react';
import { Language, CompanyProfile, WhatsAppDispatchLog, WhatsAppAlertType, MetaCloudApiConfig } from '../../types';
import {
  WHATSAPP_TEST_SAMPLES,
  getStoredWhatsAppLogs,
  sendWhatsAppAlert,
  clearWhatsAppLogs,
  getAdminWhatsAppAlertNumber,
  formatPhoneNumberForWhatsApp,
  WhatsAppSampleDefinition,
  getMetaCloudApiConfig,
  saveMetaCloudApiConfig,
  DEFAULT_META_CONFIG,
} from '../../utils/whatsappHelper';
import { formatINR } from '../../utils/storage';
import { saveStoredCompanyProfile, getStoredCompanyProfile } from '../../utils/companyStorage';

interface AdminWhatsAppHubTabProps {
  language: Language;
  companyProfile?: CompanyProfile;
  onSaveCompanyProfile?: (profile: CompanyProfile) => void;
}

export const AdminWhatsAppHubTab: React.FC<AdminWhatsAppHubTabProps> = ({
  language,
  companyProfile: propCompanyProfile,
  onSaveCompanyProfile,
}) => {
  const isHi = language === 'hi';
  const profile = propCompanyProfile || getStoredCompanyProfile();

  const [adminPhone, setAdminPhone] = useState<string>(
    profile.adminWhatsAppNumber || profile.supportPhone || '+91 8603504808'
  );
  const [customTestPhone, setCustomTestPhone] = useState<string>('');
  const [logs, setLogs] = useState<WhatsAppDispatchLog[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedPreview, setSelectedPreview] = useState<WhatsAppSampleDefinition | null>(WHATSAPP_TEST_SAMPLES[0]);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  
  // Meta Cloud API State
  const [metaConfig, setMetaConfig] = useState<MetaCloudApiConfig>(getMetaCloudApiConfig());
  const [isMetaGuideOpen, setIsMetaGuideOpen] = useState<boolean>(true);
  const [isMetaConfigOpen, setIsMetaConfigOpen] = useState<boolean>(false);
  const [metaSaved, setMetaSaved] = useState<boolean>(false);

  useEffect(() => {
    setLogs(getStoredWhatsAppLogs());
    setMetaConfig(getMetaCloudApiConfig());
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleSaveMetaConfig = () => {
    saveMetaCloudApiConfig(metaConfig);
    setMetaSaved(true);
    showToast(isHi ? '✅ Meta Cloud API सेटिंग्स सुरक्षित हो गईं!' : '✅ Meta Cloud API settings saved!');
    setTimeout(() => setMetaSaved(false), 2500);
  };

  const handleSaveAdminNumber = () => {
    const updated: CompanyProfile = {
      ...profile,
      adminWhatsAppNumber: adminPhone.trim(),
      lastUpdated: new Date().toISOString(),
    };
    saveStoredCompanyProfile(updated);
    if (onSaveCompanyProfile) {
      onSaveCompanyProfile(updated);
    }
    setSavedSuccess(true);
    showToast(isHi ? '✅ एडमिन WhatsApp नंबर सफलतापूर्वक सेव हुआ!' : '✅ Admin WhatsApp Number saved!');
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleSendSample = (sample: WhatsAppSampleDefinition) => {
    const target = customTestPhone.trim() || adminPhone.trim();
    const alertData = sample.generateAlert(target);
    const success = sendWhatsAppAlert(alertData);
    if (success) {
      setLogs(getStoredWhatsAppLogs());
      showToast(
        isHi
          ? `🚀 WhatsApp खुल रहा है: "${sample.nameHi}" (${target})`
          : `🚀 WhatsApp opening: "${sample.nameEn}" (${target})`
      );
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast(isHi ? '📋 मैसेज टेक्स्ट कॉपी हो गया!' : '📋 Message text copied!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearLogs = () => {
    if (window.confirm(isHi ? 'क्या आप सभी WhatsApp लॉग्स साफ़ करना चाहते हैं?' : 'Clear all WhatsApp dispatch logs?')) {
      clearWhatsAppLogs();
      setLogs([]);
      showToast(isHi ? '🗑️ सभी लॉग्स साफ़ कर दिए गए।' : '🗑️ All logs cleared.');
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.recipientPhone.includes(searchQuery) ||
      (log.recipientName && log.recipientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.referenceId && log.referenceId.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFilter = filterType === 'ALL' || log.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 p-3.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-2xl flex items-center gap-2 border border-emerald-400 animate-in slide-in-from-top duration-200">
          <MessageCircle className="w-4 h-4 fill-current" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-green-600/20 via-emerald-600/10 to-teal-500/20 border border-green-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-green-500/20 border border-green-500/40 flex items-center justify-center text-green-400 shadow-inner shrink-0">
            <MessageCircle className="w-6 h-6 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white">
                {isHi ? '📲 WhatsApp अलर्ट, टेस्ट सिमुलेटर एवं ऑडिट रिकॉर्ड केंद्र' : 'WhatsApp Alerts, Test Simulator & Audit Ledger'}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-green-500/20 text-green-300 border border-green-500/30">
                100% Free / Zero Cost
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              {isHi
                ? 'सभी 7 प्रकार के पेमेंट, निकासी, वाउचर, सर्टिफिकेट व ब्रॉडकास्ट संदेशों का लाइव टेस्ट भेजें और संपूर्ण रिकॉर्ड सुरक्षित रखें।'
                : 'Send 1-click live test samples for all 7 alert types and maintain persistent audit records.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setLogs(getStoredWhatsAppLogs())}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5 text-green-400" />
            <span>{isHi ? 'रीफ़्रेश रिकॉर्ड्स' : 'Refresh Ledger'}</span>
          </button>
        </div>
      </div>

      {/* 2. Admin Phone Config & Quick Target Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Admin Phone Target */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <Phone className="w-4 h-4" />
              <span>{isHi ? 'एडमिन अलर्ट WhatsApp नंबर (स्थाई कॉन्फ़िगरेशन):' : 'Admin Alert WhatsApp Number (Live):'}</span>
            </div>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-mono">
              {isHi ? 'सक्रिय' : 'Active'}
            </span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={adminPhone}
              onChange={(e) => setAdminPhone(e.target.value)}
              placeholder="+91 8603504808"
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-emerald-300 font-bold font-mono text-xs focus:outline-none focus:border-emerald-400"
            />
            <button
              type="button"
              onClick={handleSaveAdminNumber}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{savedSuccess ? (isHi ? 'सेव हुआ!' : 'Saved!') : isHi ? 'सेव करें' : 'Save'}</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            {isHi
              ? '💡 जब भी कोई यूजर नया डिपॉजिट या विथड्रॉल करेगा, इसी नंबर के WhatsApp पर अलर्ट जाएगा।'
              : '💡 Instant payment and withdrawal requests will be sent to this WhatsApp number.'}
          </p>
        </div>

        {/* Custom Test Number Input */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
              <Smartphone className="w-4 h-4" />
              <span>{isHi ? 'कस्टम टेस्ट नंबर (वैकल्पिक - Optional Test Mobile):' : 'Custom Test Number (Optional):'}</span>
            </div>
            <span className="text-[10px] text-slate-400">
              {isHi ? 'खाली रखने पर एडमिन नंबर पर जाएगा' : 'Defaults to Admin'}
            </span>
          </div>

          <input
            type="text"
            value={customTestPhone}
            onChange={(e) => setCustomTestPhone(e.target.value)}
            placeholder={isHi ? 'उदा. 9876543210 (किसी अन्य नंबर पर टेस्ट करने हेतु)' : 'e.g. 9876543210 (for testing on other phone)'}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-blue-300 font-mono text-xs focus:outline-none focus:border-blue-400"
          />
          <p className="text-[11px] text-slate-400">
            {isHi
              ? '🎯 यहाँ आप कोई भी 10 अंकों का नंबर डालकर उसपर टेस्ट मैसेज भेजकर देख सकते हैं।'
              : '🎯 You can test on any specific mobile number by entering it here.'}
          </p>
        </div>
      </div>

      {/* 2.5 SENDER NAME BRANDING EXPLANATION CARD & META CLOUD API MASTER GUIDE */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-teal-950/70 border border-emerald-500/40 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-emerald-500/20 pb-3">
          <div className="flex items-center gap-2.5 text-emerald-300 font-black text-sm sm:text-base">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{isHi ? '🏢 Meta WhatsApp Cloud API (Official Business Account) सेटअप गाइड' : '🏢 Meta WhatsApp Cloud API (Official Business Account) Setup Guide'}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMetaConfigOpen(!isMetaConfigOpen)}
              className="px-3 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 border border-emerald-500/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Key className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isHi ? (isMetaConfigOpen ? 'API सेटिंग्स छिपाएं' : '⚙️ API क्रेडेंशियल्स दर्ज करें') : (isMetaConfigOpen ? 'Hide API Config' : '⚙️ Enter API Credentials')}</span>
            </button>
            <button
              type="button"
              onClick={() => setIsMetaGuideOpen(!isMetaGuideOpen)}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              {isMetaGuideOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* 3 Methods Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-[10px]">1</span>
              <span className="font-bold text-amber-300">मैसेज हेडर ब्रांडिंग (सक्रिय)</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              हर मैसेज के शीर्ष पर <strong>*🏛️ GCAP PRIVATE LIMITED*</strong> और नीचे कंपनी का CIN व आधिकारिक सील पहले से ही मौजूद है।
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-[10px]">2</span>
              <span className="font-bold text-emerald-300">WhatsApp Business प्रोफाइल (फ्री)</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              फ़ोन में <strong>WhatsApp Business</strong> ऐप डाउनलोड करके बिज़नेस नाम <strong>"GCAP PRIVATE LIMITED"</strong> और GCAP लोगो सेट करें।
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/90 border border-emerald-500/30 space-y-1.5 bg-emerald-950/20">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold text-[10px]">3</span>
              <span className="font-bold text-teal-300">Meta Verified Cloud API (ग्रीन टिक)</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              बिना नंबर सेव किए भी सीधे <strong>"GCAP PRIVATE LIMITED ✅"</strong> नाम से मैसेज भेजने का आधिकारिक Meta सिस्टम।
            </p>
          </div>
        </div>

        {/* DETAILED 5-STEP META CLOUD API & GREEN TICK BLUEPRINT */}
        {isMetaGuideOpen && (
          <div className="p-4 rounded-xl bg-slate-950/95 border border-slate-800 space-y-3.5 text-xs text-slate-300">
            <h4 className="font-extrabold text-sm text-emerald-400 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>{isHi ? 'Meta WhatsApp Cloud API व Green Tick प्राप्त करने की 5 आसान स्टेप्स:' : '5 Steps to Get Meta Cloud API & Green Tick Badge:'}</span>
            </h4>

            <div className="space-y-3">
              {/* Step 1 */}
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <div className="font-bold text-white flex items-center justify-between">
                  <span>स्टेप 1: Meta for Developers पर अकाउंट बनाएं</span>
                  <a
                    href="https://developers.facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <span>developers.facebook.com</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-slate-400 text-[11px]">
                  • अपने Facebook ID से लॉगिन करें और <strong>"Create App"</strong> पर क्लिक करें।<br />
                  • App Type में <strong>"Business"</strong> चुनें और App का नाम <strong>"GCAP Alerts"</strong> रखें।
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <div className="font-bold text-white flex items-center justify-between">
                  <span>स्टेप 2: WhatsApp प्रोडक्ट जोड़ें व Meta Business Portfolio लिंक करें</span>
                  <a
                    href="https://business.facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <span>business.facebook.com</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-slate-400 text-[11px]">
                  • डैशबोर्ड में <strong>"WhatsApp"</strong> के आगे <strong>"Set Up"</strong> दबाएं।<br />
                  • अपना Meta Business Portfolio (<strong>GCAP PRIVATE LIMITED</strong>) चुनें या नया बनाएं।
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <div className="font-bold text-white">स्टेप 3: मोबाइल नंबर जोड़ें और Display Name "GCAP PRIVATE LIMITED" रखें</div>
                <p className="text-slate-400 text-[11px]">
                  • <strong>API Setup &gt; Step 5 (Add Phone Number)</strong> में जाएँ।<br />
                  • <strong>Display Name:</strong> <code className="bg-slate-950 px-1 py-0.5 rounded text-emerald-300 font-mono">GCAP PRIVATE LIMITED</code> दर्ज करें (यह MCA सर्टिफिकेट से मेल खाना चाहिए)।<br />
                  • <strong>Category:</strong> Financial Services / Investment चुनें और OTP से नंबर वेरिफाई करें।
                </p>
              </div>

              {/* Step 4 */}
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <div className="font-bold text-white">स्टेप 4: Meta Business Verification (कंपनी दस्तावेज़ अपलोड करें)</div>
                <p className="text-slate-400 text-[11px]">
                  • <strong>Business Settings &gt; Security Center</strong> में <strong>"Start Verification"</strong> पर क्लिक करें।<br />
                  • <strong>GCAP PRIVATE LIMITED</strong> का MCA सर्टिफिकेट (CIN: <strong>U66190BR2026OPC088307</strong>), PAN व बैंक स्टेटमेंट अपलोड करें। Meta 24-48 घंटों में वेरिफाई कर देता है।
                </p>
              </div>

              {/* Step 5 */}
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <div className="font-bold text-white">स्टेप 5: Official Business Account (ग्रीन टिक ✅) हेतु आवेदन</div>
                <p className="text-slate-400 text-[11px]">
                  • WhatsApp Manager &gt; Phone Numbers &gt; Profile में <strong>"Submit Request for Official Business Account"</strong> दबाएं।<br />
                  • सत्यापन होने के बाद आपका सेंडर नाम बिना नंबर सेव किए भी सीधे <strong>"GCAP PRIVATE LIMITED ✅"</strong> दिखेगा।
                </p>
              </div>
            </div>
          </div>
        )}

        {/* OPTIONAL META CLOUD API CREDENTIALS FORM */}
        {isMetaConfigOpen && (
          <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/40 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <Key className="w-4 h-4" />
                <span>{isHi ? 'Meta Cloud API क्रेडेंशियल्स (Direct Cloud Server Dispatch):' : 'Meta Cloud API Configuration:'}</span>
              </div>
              <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={metaConfig.enabled}
                  onChange={(e) => setMetaConfig({ ...metaConfig, enabled: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <span className={metaConfig.enabled ? 'text-emerald-400' : 'text-slate-400'}>
                  {metaConfig.enabled ? (isHi ? 'क्लाउड API सक्रिय' : 'API Enabled') : (isHi ? 'निष्क्रिय (Default 1-Click)' : 'Disabled')}
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Phone Number ID:
                </label>
                <input
                  type="text"
                  value={metaConfig.phoneNumberId}
                  onChange={(e) => setMetaConfig({ ...metaConfig, phoneNumberId: e.target.value })}
                  placeholder="e.g. 109840291823901"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  WhatsApp Business Account ID (WABA ID):
                </label>
                <input
                  type="text"
                  value={metaConfig.wabaId}
                  onChange={(e) => setMetaConfig({ ...metaConfig, wabaId: e.target.value })}
                  placeholder="e.g. 291039401928301"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Permanent Access Token (System User Token):
                </label>
                <input
                  type="password"
                  value={metaConfig.accessToken}
                  onChange={(e) => setMetaConfig({ ...metaConfig, accessToken: e.target.value })}
                  placeholder="EAAG..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSaveMetaConfig}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{metaSaved ? (isHi ? 'सेव हो गया!' : 'Saved!') : isHi ? 'Meta क्रेडेंशियल्स सेव करें' : 'Save Meta Config'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. All 7 WhatsApp Message Samples Hub */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm sm:text-base text-white">
              {isHi ? 'सभी 7 प्रकार के WhatsApp संदेश सैंपल (Live 1-Click Test Hub)' : 'All 7 WhatsApp Alert Samples (Live 1-Click Test)'}
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {WHATSAPP_TEST_SAMPLES.length} {isHi ? 'सैंपल्स तैयार' : 'Samples Ready'}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: Samples List */}
          <div className="lg:col-span-7 space-y-3">
            {WHATSAPP_TEST_SAMPLES.map((sample) => {
              const isSelected = selectedPreview?.id === sample.id;
              return (
                <div
                  key={sample.id}
                  onClick={() => setSelectedPreview(sample)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-green-950/30 border-green-500/60 shadow-lg shadow-green-950/20'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl shrink-0 p-1.5 rounded-xl bg-slate-900 border border-slate-800">
                      {sample.icon}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-2">
                        <span>{isHi ? sample.nameHi : sample.nameEn}</span>
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                        {sample.description}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSendSample(sample);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-green-950/50 transition-all cursor-pointer active:scale-95"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-current" />
                      <span>{isHi ? 'टेस्ट भेजें' : 'Send Test'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Live Message Preview Screen */}
          <div className="lg:col-span-5">
            {selectedPreview ? (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 sticky top-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2 text-green-400 font-bold text-xs">
                    <Eye className="w-4 h-4" />
                    <span>{isHi ? 'लाइव WhatsApp मैसेज प्रीव्यू' : 'Live WhatsApp Message Preview'}</span>
                  </div>
                  <span className="text-xs">{selectedPreview.icon}</span>
                </div>

                {/* Speech Bubble Simulator */}
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 text-xs text-slate-100 font-sans whitespace-pre-line leading-relaxed shadow-inner">
                  {selectedPreview.generateAlert(customTestPhone || adminPhone).message}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyText(
                        selectedPreview.generateAlert(customTestPhone || adminPhone).message,
                        selectedPreview.id
                      )
                    }
                    className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedId === selectedPreview.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-400" />
                        <span>{isHi ? 'कॉपी हुआ!' : 'Copied!'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>{isHi ? 'टेक्स्ट कॉपी करें' : 'Copy Text'}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSendSample(selectedPreview)}
                    className="flex-1 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer active:scale-95"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>{isHi ? '1-क्लिक टेस्ट भेजें' : 'Send Test Now'}</span>
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* 4. WhatsApp Dispatch History & Audit Records */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-teal-400" />
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">
                {isHi ? 'WhatsApp डिस्पैच एवं ऑडिट इतिहास (Sent Records)' : 'WhatsApp Dispatch Audit History'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isHi ? 'सिस्टम द्वारा भेजे गए सभी WhatsApp अलर्ट व टेस्ट संदेशों का संपूर्ण रिकॉर्ड' : 'Comprehensive ledger of all dispatched WhatsApp alerts and receipts'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">
              {isHi ? 'कुल रिकॉर्ड्स:' : 'Total Logs:'} <strong className="text-white">{logs.length}</strong>
            </span>
            {logs.length > 0 && (
              <button
                type="button"
                onClick={handleClearLogs}
                className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer border border-rose-500/30"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isHi ? 'साफ़ करें' : 'Clear'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isHi ? 'फोन नंबर, नाम या रेफ़रेंस आईडी से खोजें...' : 'Search by phone, name, ref...'}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-green-500 text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-green-500"
            >
              <option value="ALL">{isHi ? 'सभी प्रकार (All Types)' : 'All Types'}</option>
              <option value="DEPOSIT_ALERT">{isHi ? 'डिपॉजिट अलर्ट' : 'Deposit Alerts'}</option>
              <option value="WITHDRAWAL_ALERT">{isHi ? 'निकासी अलर्ट' : 'Withdrawal Alerts'}</option>
              <option value="PAYMENT_VOUCHER">{isHi ? 'भुगतान वाउचर' : 'Payment Vouchers'}</option>
              <option value="MATURITY_CERTIFICATE">{isHi ? 'सर्टिफिकेट' : 'Maturity Certificates'}</option>
              <option value="BROADCAST_NOTICE">{isHi ? 'ब्रॉडकास्ट' : 'Broadcasts'}</option>
              <option value="ROYALTY_REWARD">{isHi ? 'रॉयल्टी रिवॉर्ड' : 'Royalty Rewards'}</option>
            </select>
          </div>
        </div>

        {/* Logs Table / Cards */}
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <MessageCircle className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400">
              {isHi ? 'कोई WhatsApp डिस्पैच रिकॉर्ड नहीं मिला।' : 'No WhatsApp dispatch records found.'}
            </p>
            <p className="text-[11px] text-slate-500">
              {isHi ? 'ऊपर दिए गए सैंपल्स में से किसी भी टेस्ट बटन पर क्लिक करके पहला टेस्ट मैसेज भेजें।' : 'Click any test sample button above to dispatch your first message.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white text-xs">{log.title}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.status === 'TEST_SAMPLE'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-green-500/20 text-green-300 border border-green-500/30'
                      }`}
                    >
                      {log.status === 'TEST_SAMPLE' ? 'TEST' : 'DISPATCHED'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      📅 {log.dateStr}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-[11px] text-slate-400 flex-wrap">
                    <span>
                      👤 {isHi ? 'प्राप्तकर्ता:' : 'To:'}{' '}
                      <strong className="text-slate-200">{log.recipientName || 'User'}</strong>
                    </span>
                    <span>
                      📱 {isHi ? 'नंबर:' : 'Phone:'}{' '}
                      <strong className="text-emerald-400 font-mono">{log.recipientPhone}</strong>
                    </span>
                    {log.amount && (
                      <span>
                        💰 {isHi ? 'राशि:' : 'Amount:'}{' '}
                        <strong className="text-amber-300 font-mono">{formatINR(log.amount)}</strong>
                      </span>
                    )}
                    {log.referenceId && (
                      <span>
                        🏷️ {isHi ? 'रेफ़:' : 'Ref:'}{' '}
                        <strong className="text-slate-300 font-mono">{log.referenceId}</strong>
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    type="button"
                    onClick={() => handleCopyText(log.messageBody, log.id)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                    title={isHi ? 'मैसेज कॉपी करें' : 'Copy Message'}
                  >
                    {copiedId === log.id ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      sendWhatsAppAlert({
                        phone: log.recipientPhone,
                        message: log.messageBody,
                        type: log.type,
                        title: log.title,
                        recipientName: log.recipientName,
                        recipientRole: log.recipientRole,
                        amount: log.amount,
                        referenceId: log.referenceId,
                      })
                    }
                    className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                  >
                    <Send className="w-3 h-3" />
                    <span>{isHi ? 'पुनः भेजें' : 'Re-send'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
