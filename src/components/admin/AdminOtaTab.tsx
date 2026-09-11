import React, { useState } from 'react';
import {
  Radio,
  Sparkles,
  Send,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Palette,
  Bell,
  Smartphone,
  ShieldCheck,
  Zap,
  Clock,
  Layers,
  RefreshCw,
  Cpu,
} from 'lucide-react';
import {
  LiveInterfaceConfig,
  Language,
  ThemeAccent,
  OtaEventPayload,
  OtaUpdateType,
} from '../../types';
import {
  saveStoredLiveConfig,
  resetLiveConfigToDefault,
  broadcastOtaUpdate,
  getOtaHistory,
} from '../../utils/liveConfigStorage';
import {
  broadcastAiStudioForceUpdate,
  CURRENT_BUILD_ID,
  CURRENT_BUILD_TIME,
} from '../../utils/aiStudioSync';
import { AiStudioCheckButton } from '../AiStudioUpdateBanner';

interface AdminOtaTabProps {
  config: LiveInterfaceConfig;
  language: Language;
  onUpdateConfig: (newConfig: LiveInterfaceConfig) => void;
  onResetConfig: () => void;
}

export const AdminOtaTab: React.FC<AdminOtaTabProps> = ({
  config,
  language,
  onUpdateConfig,
  onResetConfig,
}) => {
  const isHi = language === 'hi';

  const [formData, setFormData] = useState<LiveInterfaceConfig>(config);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);
  const [forceRefreshSuccess, setForceRefreshSuccess] = useState(false);
  const [history, setHistory] = useState<OtaEventPayload[]>(() => getOtaHistory());

  const handleForceRefreshAll = async () => {
    await broadcastAiStudioForceUpdate();
    setForceRefreshSuccess(true);
    setTimeout(() => setForceRefreshSuccess(false), 4000);
  };

  // Custom Quick Broadcast State
  const [quickType, setQuickType] = useState<OtaUpdateType>('INTERFACE');
  const [quickTitleHi, setQuickTitleHi] = useState('इंटरफ़ेस एवं नियम अपडेट');
  const [quickTitleEn, setQuickTitleEn] = useState('Interface & Rules Updated');
  const [quickDescHi, setQuickDescHi] = useState('एडमिन द्वारा नए नियम व ₹100 प्लान तुरंत लाइव अपडेट कर दिए गए हैं।');
  const [quickDescEn, setQuickDescEn] = useState('Admin updated platform rules and the ₹100 starter plan live.');

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...formData,
      lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    saveStoredLiveConfig(updated);
    onUpdateConfig(updated);

    // Broadcast instant OTA update
    broadcastOtaUpdate(
      'INTERFACE',
      'Live Interface Configuration Updated',
      'इंटरफ़ेस एवं प्लेटफ़ॉर्म सेटिंग्स लाइव अपडेट हुईं',
      `Version: ${updated.appVersion}, Theme: ${updated.themeAccent}, Banner: ${updated.bannerEnabled ? 'Active' : 'Disabled'}`,
      `वर्ज़न: ${updated.appVersion}, थीम: ${updated.themeAccent}, बैनर: ${updated.bannerEnabled ? 'सक्रिय' : 'निष्क्रिय'}`
    );

    setHistory(getOtaHistory());
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const handleSendQuickBroadcast = () => {
    if (!quickTitleHi.trim()) return;

    broadcastOtaUpdate(
      quickType,
      quickTitleEn,
      quickTitleHi,
      quickDescEn,
      quickDescHi,
      'Admin (Instant Push)'
    );

    setHistory(getOtaHistory());
    setBroadcastSuccess(true);
    setTimeout(() => setBroadcastSuccess(false), 3500);
  };

  const handleResetToDefault = () => {
    if (
      window.confirm(
        isHi
          ? 'क्या आप इंटरफ़ेस सेटिंग्स को डिफ़ॉल्ट पर रीसेट करना चाहते हैं?'
          : 'Are you sure you want to reset remote config to default?'
      )
    ) {
      const def = resetLiveConfigToDefault();
      setFormData(def);
      onResetConfig();
      broadcastOtaUpdate(
        'INTERFACE',
        'Remote Config Reset to Default',
        'रिमोट कॉन्फ़िग डिफ़ॉल्ट पर रीसेट किया गया',
        'Standard theme and banner settings restored live.',
        'मानक थीम और बैनर सेटिंग्स लाइव पुनर्स्थापित की गईं।'
      );
      setHistory(getOtaHistory());
    }
  };

  return (
    <div id="admin-ota-tab" className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-emerald-950/70 via-gray-900 to-gray-900 border border-emerald-500/30 rounded-2xl p-5 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">
                  {isHi ? 'लाइव इन-ऐप रिमोट अपडेट इंजन (OTA)' : 'Live In-App Remote Update Engine (OTA)'}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500 text-gray-950 uppercase">
                  Zero Reinstall
                </span>
              </div>
              <p className="text-xs text-gray-300 mt-0.5">
                {isHi
                  ? 'एडमिन द्वारा बदले गए कोई भी नियम, नए प्लान्स (जैसे ₹100), नोटिस या थीम बिना ऐप रीइन्स्टॉल किए सभी यूज़र्स को तुरंत मिल जाते हैं।'
                  : 'Any rule changes, ₹100 starter plans, notice banners or theme updates reach all active users live with zero app reinstallation.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleResetToDefault}
              className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {isHi ? 'डिफ़ॉल्ट सेटिंग्स' : 'Reset Defaults'}
            </button>
          </div>
        </div>

        {/* Live Architecture Status Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-gray-800/80 text-xs">
          <div className="bg-gray-950/60 p-3 rounded-xl border border-gray-800">
            <span className="text-gray-400 block text-[11px]">{isHi ? 'डिलीवरी मोड' : 'Delivery Mode'}</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              {isHi ? 'रियल-टाइम ब्रॉडकास्ट' : 'Real-time Broadcast'}
            </span>
          </div>

          <div className="bg-gray-950/60 p-3 rounded-xl border border-gray-800">
            <span className="text-gray-400 block text-[11px]">{isHi ? 'रीइन्स्टॉल की आवश्यकता' : 'Reinstall Required'}</span>
            <span className="text-emerald-300 font-bold mt-0.5 block">0% (कभी नहीं)</span>
          </div>

          <div className="bg-gray-950/60 p-3 rounded-xl border border-gray-800">
            <span className="text-gray-400 block text-[11px]">{isHi ? 'वर्तमान वर्ज़न' : 'Current Version'}</span>
            <span className="text-gray-200 font-mono font-semibold mt-0.5 block">{formData.appVersion}</span>
          </div>

          <div className="bg-gray-950/60 p-3 rounded-xl border border-gray-800">
            <span className="text-gray-400 block text-[11px]">{isHi ? 'सिंक चैनल' : 'Sync Channel'}</span>
            <span className="text-emerald-400 font-mono font-medium mt-0.5 block">BroadcastChannel &amp; LocalBus</span>
          </div>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl text-emerald-300 text-sm flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          <span>
            {isHi
              ? 'सफलतापूर्वक सेव किया गया! नया रिमोट कॉन्फ़िग और इंटरफ़ेस बदलाव तुरंत सभी यूज़र्स के ऐप में अपडेट हो चुका है।'
              : 'Successfully saved! New live configuration and interface changes have broadcast instantly to all user apps.'}
          </span>
        </div>
      )}

      {broadcastSuccess && (
        <div className="p-4 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl text-emerald-300 text-sm flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          <span>
            {isHi
              ? 'लाइव OTA नोटिफिकेशन सफलतापूर्वक ब्रॉडकास्ट हो गया! सभी यूज़र्स की स्क्रीन पर यह तुरंत दिखेगा।'
              : 'Live OTA notification broadcasted successfully! Visible instantly across all active screens.'}
          </span>
        </div>
      )}

      {/* AI Studio Cloud Build Live Synchronizer Card */}
      <div className="bg-gradient-to-br from-slate-900 via-emerald-950/40 to-slate-900 border-2 border-emerald-500/30 rounded-2xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                {isHi ? 'GitHub & AI Studio ऑटो-लॉन्च सिंक' : 'GitHub & AI Studio Auto-Launch Sync'}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono text-xs">
                Build: {CURRENT_BUILD_ID.slice(-8)}
              </span>
              <span className="text-xs text-emerald-400 font-semibold">
                ● {isHi ? 'ऐप खुलते ही तुरंत नया वर्ज़न लोड होगा' : 'Instant Launch Auto-Update Active'}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {isHi
                ? 'GitHub या Admin में कुछ भी अपडेट होने पर, पहले से इंस्टॉल्ड मोबाइलों में ऐप खुलते ही सारा बदलाव लोड हो जाएगा'
                : 'Any updates in GitHub or Admin are instantly applied the second any user opens their installed mobile app'}
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              {isHi
                ? 'सिस्टम में ज़ीरो-रीइन्स्टॉल ऑटो-लॉन्च सिंक सक्रिय है। यदि किसी यूज़र के मोबाइल में ऐप पहले से इंस्टॉल है, तो ऐप खोलते ही 0ms पर सर्वर से नया कोड व डेटा फेच होकर तुरंत रीफ्रेश हो जाता है और हमेशा नवीनतम वर्ज़न खुलता है।'
                : 'Zero-reinstall launch sync is active. Whenever a user opens their installed PWA/mobile app, the engine verifies the server build in the background and immediately refreshes to the latest code with full data preservation.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <AiStudioCheckButton language={language} variant="admin" />
            <button
              type="button"
              id="btn-broadcast-force-refresh"
              onClick={handleForceRefreshAll}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isHi ? 'सभी डिवाइसों पर रीलोड भेजें' : 'Force Refresh All Devices'}</span>
            </button>
          </div>
        </div>

        {forceRefreshSuccess && (
          <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {isHi
                ? '⚡ रीलोड ब्रॉडकास्ट जारी! सभी ओपन टैब व एक्टिव डिवाइस नए कोड बिल्ड पर स्वतः रिफ्रेश हो जाएंगे।'
                : '⚡ Refresh command broadcasted! All open tabs and installed devices are reloading the freshest AI Studio build.'}
            </span>
          </div>
        )}
      </div>

      {/* Main Configuration Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form */}
        <form onSubmit={handleSaveConfig} className="lg:col-span-2 space-y-5">
          {/* Card 1: Version & Theme */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 text-white">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-4 pb-2 border-b border-gray-800">
              <Palette className="w-4 h-4 text-emerald-400" />
              {isHi ? 'वर्ज़न एवं इंटरफ़ेस थीम स्टाइल' : 'Version & Interface Theme Style'}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-300 font-medium mb-1.5">
                  {isHi ? 'ऐप रिलीज़ वर्ज़न टैग' : 'App Release Version Tag'}
                </label>
                <input
                  type="text"
                  value={formData.appVersion}
                  onChange={(e) => setFormData({ ...formData, appVersion: e.target.value })}
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                  placeholder="e.g. v2.5.0-OTA"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-300 font-medium mb-1.5">
                  {isHi ? 'लाइव सिंक बैज टेक्स्ट' : 'Live Sync Badge Text'}
                </label>
                <input
                  type="text"
                  value={isHi ? formData.liveBadgeTextHi : formData.liveBadgeText}
                  onChange={(e) =>
                    isHi
                      ? setFormData({ ...formData, liveBadgeTextHi: e.target.value })
                      : setFormData({ ...formData, liveBadgeText: e.target.value })
                  }
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Theme Accent Picker */}
            <div className="mt-4">
              <label className="block text-xs text-gray-300 font-medium mb-2">
                {isHi ? 'प्लेटफ़ॉर्म एक्सेंट थीम कलर' : 'Platform Accent Theme Color'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'emerald', label: 'Emerald Wealth', color: 'bg-emerald-500 border-emerald-400' },
                  { id: 'indigo', label: 'Sapphire Trust', color: 'bg-indigo-500 border-indigo-400' },
                  { id: 'amber', label: 'Amber Gold', color: 'bg-amber-500 border-amber-400' },
                  { id: 'cyan', label: 'Cyber Tech', color: 'bg-cyan-500 border-cyan-400' },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setFormData({ ...formData, themeAccent: item.id as ThemeAccent })}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-medium cursor-pointer transition-all ${
                      formData.themeAccent === item.id
                        ? 'bg-gray-800 border-white text-white shadow-md'
                        : 'bg-gray-950/60 border-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full ${item.color}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: Top Live Announcement Banner */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 text-white">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-800">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-400" />
                {isHi ? 'लाइव टॉप अनाउंसमेंट टिकर / बैनर' : 'Live Top Announcement Ticker / Banner'}
              </h4>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.bannerEnabled}
                  onChange={(e) => setFormData({ ...formData, bannerEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                <span className="ml-2 text-xs text-gray-300 font-medium">
                  {formData.bannerEnabled ? (isHi ? 'चालू (ON)' : 'ON') : isHi ? 'बंद (OFF)' : 'OFF'}
                </span>
              </label>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-300 font-medium mb-1.5">
                  {isHi ? 'बैनर का प्रकार (शैली)' : 'Banner Type (Style)'}
                </label>
                <div className="flex gap-3">
                  {[
                    { id: 'success', label: isHi ? 'सफलता / नया ऑफर (हरा)' : 'Success / Offer (Green)' },
                    { id: 'info', label: isHi ? 'सूचना (नीला)' : 'Info (Blue)' },
                    { id: 'alert', label: isHi ? 'महत्वपूर्ण चेतावनी (नारंगी)' : 'Alert / Notice (Amber)' },
                  ].map((t) => (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => setFormData({ ...formData, bannerType: t.id as any })}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                        formData.bannerType === t.id
                          ? 'bg-gray-800 border-emerald-400 text-emerald-300'
                          : 'bg-gray-950 border-gray-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-300 font-medium mb-1.5">
                  {isHi ? 'बैनर संदेश (हिंदी में)' : 'Banner Message (Hindi)'}
                </label>
                <input
                  type="text"
                  value={formData.bannerTextHi}
                  onChange={(e) => setFormData({ ...formData, bannerTextHi: e.target.value })}
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  placeholder="🚀 लाइव अपडेट: ₹100 माइक्रो कैपिटल स्टार्टर प्लान सक्रिय है!"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-300 font-medium mb-1.5">
                  {isHi ? 'बैनर संदेश (अंग्रेजी में)' : 'Banner Message (English)'}
                </label>
                <input
                  type="text"
                  value={formData.bannerText}
                  onChange={(e) => setFormData({ ...formData, bannerText: e.target.value })}
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  placeholder="🚀 Live Update: Micro Capital Starter Plan (₹100) is now live!"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Dashboard Headline & Tagline Customizer */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 text-white">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-4 pb-2 border-b border-gray-800">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              {isHi ? 'डैशबोर्ड हेडिंग एवं टैगलाइन (लाइव बदलाव)' : 'Dashboard Headline & Slogan'}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-300 font-medium mb-1.5">
                  {isHi ? 'मुख्य हेडिंग (हिंदी)' : 'Headline (Hindi)'}
                </label>
                <input
                  type="text"
                  value={formData.heroHeadlineHi}
                  onChange={(e) => setFormData({ ...formData, heroHeadlineHi: e.target.value })}
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-300 font-medium mb-1.5">
                  {isHi ? 'मुख्य हेडिंग (अंग्रेजी)' : 'Headline (English)'}
                </label>
                <input
                  type="text"
                  value={formData.heroHeadline}
                  onChange={(e) => setFormData({ ...formData, heroHeadline: e.target.value })}
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-300 font-medium mb-1.5">
                  {isHi ? 'सबटेक्स्ट / स्लोगन (हिंदी)' : 'Subtext (Hindi)'}
                </label>
                <textarea
                  rows={2}
                  value={formData.heroSubtextHi}
                  onChange={(e) => setFormData({ ...formData, heroSubtextHi: e.target.value })}
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-300 font-medium mb-1.5">
                  {isHi ? 'सबटेक्स्ट / स्लोगन (अंग्रेजी)' : 'Subtext (English)'}
                </label>
                <textarea
                  rows={2}
                  value={formData.heroSubtext}
                  onChange={(e) => setFormData({ ...formData, heroSubtext: e.target.value })}
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Card 4: Maintenance Mode Notice */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 text-white">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-800">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                {isHi ? 'आपातकालीन मेंटेनेंस / सूचना मोड' : 'Emergency Maintenance Notice Mode'}
              </h4>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.maintenanceMode}
                  onChange={(e) => setFormData({ ...formData, maintenanceMode: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                <span className="ml-2 text-xs text-gray-300 font-medium">
                  {formData.maintenanceMode ? (isHi ? 'सक्रिय' : 'Active') : isHi ? 'बंद' : 'Off'}
                </span>
              </label>
            </div>

            {formData.maintenanceMode && (
              <div className="space-y-3 animate-in fade-in">
                <div>
                  <label className="block text-xs text-gray-300 font-medium mb-1.5">
                    {isHi ? 'यूज़र्स को दिखने वाला मेंटेनेंस संदेश (हिंदी)' : 'Maintenance Message (Hindi)'}
                  </label>
                  <input
                    type="text"
                    value={formData.maintenanceMessageHi}
                    onChange={(e) => setFormData({ ...formData, maintenanceMessageHi: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-300 font-medium mb-1.5">
                    {isHi ? 'यूज़र्स को दिखने वाला मेंटेनेंस संदेश (अंग्रेजी)' : 'Maintenance Message (English)'}
                  </label>
                  <input
                    type="text"
                    value={formData.maintenanceMessage}
                    onChange={(e) => setFormData({ ...formData, maintenanceMessage: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Submit Button */}
          <button
            type="submit"
            className="w-full py-3 px-5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 cursor-pointer transition-all"
          >
            <Save className="w-4 h-4" />
            {isHi
              ? 'सेव करें एवं तुरंत सभी यूज़र्स को लाइव OTA अपडेट भेजें'
              : 'Save & Broadcast Live OTA Updates Instantly'}
          </button>
        </form>

        {/* Right 1 Col: Quick Push Trigger & History */}
        <div className="space-y-5">
          {/* Quick Broadcast Push Trigger */}
          <div className="bg-gray-900 border border-emerald-500/40 rounded-2xl p-5 text-white shadow-lg">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <Send className="w-4 h-4 text-emerald-400" />
              {isHi ? 'त्वरित लाइव पुश ब्रॉडकास्ट' : 'Instant Live Push Broadcast'}
            </h4>
            <p className="text-xs text-gray-400 mb-4">
              {isHi
                ? 'यहाँ से कोई भी आवश्यक सूचना या घोषणा सीधे सभी यूज़र्स की स्क्रीन पर लाइव पॉपअप के रूप में भेजें।'
                : 'Send any immediate notice or announcement directly to all active user screens.'}
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-300 font-medium mb-1">
                  {isHi ? 'अपडेट श्रेणी' : 'Update Category'}
                </label>
                <select
                  value={quickType}
                  onChange={(e) => setQuickType(e.target.value as any)}
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="RULES">{isHi ? 'नियम अपडेट (Rules)' : 'Rules Updated'}</option>
                  <option value="PLANS">{isHi ? 'निवेश प्लान्स (Plans - e.g. ₹100)' : 'Investment Plans'}</option>
                  <option value="INTERFACE">{isHi ? 'इंटरफ़ेस / थीम (UI)' : 'Interface / UI'}</option>
                  <option value="TREASURY">{isHi ? 'ट्रेजरी एवं फंड्स' : 'Treasury & Funds'}</option>
                  <option value="SYSTEM">{isHi ? 'सिस्टम सामान्य सूचना' : 'System Sync'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-300 font-medium mb-1">
                  {isHi ? 'शीर्षक (Hindi)' : 'Title (Hindi)'}
                </label>
                <input
                  type="text"
                  value={quickTitleHi}
                  onChange={(e) => setQuickTitleHi(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-300 font-medium mb-1">
                  {isHi ? 'संदेश (Hindi)' : 'Message (Hindi)'}
                </label>
                <textarea
                  rows={2}
                  value={quickDescHi}
                  onChange={(e) => setQuickDescHi(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <button
                type="button"
                onClick={handleSendQuickBroadcast}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-600/20 transition-all"
              >
                <Radio className="w-3.5 h-3.5" />
                {isHi ? 'अभी लाइव ब्रॉडकास्ट करें' : 'Broadcast Live Now'}
              </button>
            </div>
          </div>

          {/* Broadcast History Ledger */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 text-white">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-emerald-400" />
              {isHi ? 'हालिया लाइव OTA इतिहास' : 'Recent OTA Broadcast History'}
            </h4>

            {history.length === 0 ? (
              <p className="text-xs text-gray-400 py-3 text-center">
                {isHi ? 'कोई पिछला ब्रॉडकास्ट नहीं मिला।' : 'No broadcast history found.'}
              </p>
            ) : (
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {history.slice(0, 10).map((h) => (
                  <div
                    key={h.id}
                    className="p-2.5 rounded-xl bg-gray-950/70 border border-gray-800 text-xs"
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                        {h.type}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="font-semibold text-white text-[11px] truncate">
                      {isHi ? h.titleHi : h.title}
                    </div>
                    <div className="text-gray-400 text-[10px] truncate mt-0.5">
                      {isHi ? h.descriptionHi : h.description}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
