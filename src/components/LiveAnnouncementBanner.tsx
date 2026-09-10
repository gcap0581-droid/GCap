import React, { useState } from 'react';
import { Sparkles, Radio, ShieldCheck, AlertCircle, X, CheckCircle2, RefreshCw } from 'lucide-react';
import { LiveInterfaceConfig, Language } from '../types';

interface LiveAnnouncementBannerProps {
  config: LiveInterfaceConfig;
  language: Language;
  onCheckUpdates?: () => void;
}

export const LiveAnnouncementBanner: React.FC<LiveAnnouncementBannerProps> = ({
  config,
  language,
  onCheckUpdates,
}) => {
  const isHi = language === 'hi';
  const [dismissed, setDismissed] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [checking, setChecking] = useState(false);
  const [justChecked, setJustChecked] = useState(false);

  const handleManualCheck = () => {
    setChecking(true);
    setJustChecked(false);
    setTimeout(() => {
      setChecking(false);
      setJustChecked(true);
      if (onCheckUpdates) onCheckUpdates();
    }, 600);
  };

  const getBannerColorClasses = () => {
    switch (config.bannerType) {
      case 'alert':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-300';
      case 'info':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-300';
      case 'success':
      default:
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300';
    }
  };

  return (
    <>
      {/* Maintenance Mode Emergency Alert Banner if Active */}
      {config.maintenanceMode && (
        <div
          id="live-maintenance-banner"
          className="bg-amber-500 text-gray-950 px-4 py-2.5 font-medium text-xs sm:text-sm text-center flex items-center justify-center gap-2 shadow-md sticky top-0 z-40"
        >
          <AlertCircle className="w-4 h-4 shrink-0 animate-bounce" />
          <span>{isHi ? config.maintenanceMessageHi : config.maintenanceMessage}</span>
          <span className="bg-gray-950 text-amber-400 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ml-2">
            {isHi ? 'लाइव सूचना' : 'Live Notice'}
          </span>
        </div>
      )}

      {/* Top Announcement Ticker */}
      {config.bannerEnabled && !dismissed && (
        <div
          id="live-announcement-ticker"
          className={`border-b transition-all px-3 sm:px-4 py-2 flex items-center justify-between gap-3 text-xs sm:text-sm ${getBannerColorClasses()}`}
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold text-[11px] shrink-0 border border-emerald-500/30">
              <Radio className="w-3 h-3 animate-pulse" />
              {isHi ? config.liveBadgeTextHi : config.liveBadgeText}
            </span>
            <span className="truncate font-medium">
              {isHi ? config.bannerTextHi : config.bannerText}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowStatusModal(true)}
              className="text-[11px] underline hover:text-white transition-colors cursor-pointer font-medium"
            >
              {isHi ? 'लाइव स्टेटस' : 'Live Status'}
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="opacity-70 hover:opacity-100 p-0.5 rounded transition-opacity"
              title={isHi ? 'हटाएं' : 'Dismiss'}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* OTA Status & Zero-Reinstall Verification Modal */}
      {showStatusModal && (
        <div
          id="ota-status-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowStatusModal(false)}
        >
          <div
            className="bg-gray-900 border border-emerald-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl text-white relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowStatusModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
                <Radio className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  {isHi ? 'जीकैप लाइव ऑटो-अपडेट इंजन' : 'GCap Live OTA Sync Engine'}
                </h3>
                <p className="text-xs text-emerald-400 font-mono">
                  {config.appVersion} • {isHi ? 'रीइन्स्टॉल-मुक्त तकनीक' : 'Zero-Reinstall Architecture'}
                </p>
              </div>
            </div>

            <div className="space-y-3 my-4 text-xs bg-gray-950/80 p-4 rounded-xl border border-gray-800">
              <div className="flex items-center justify-between pb-2 border-b border-gray-800/80">
                <span className="text-gray-400">{isHi ? 'सिस्टम स्टेटस' : 'System Status'}:</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  {isHi ? '100% ऑनलाइन एवं कनेक्टेड' : '100% Online & Synced'}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-gray-800/80">
                <span className="text-gray-400">{isHi ? 'अपडेट डिलीवरी विधि' : 'Update Delivery'}:</span>
                <span className="text-gray-200 font-medium">
                  {isHi ? 'तत्काल इन-ऐप हॉट रिलोड (OTA)' : 'Instant In-App Hot-Reload'}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-gray-800/80">
                <span className="text-gray-400">{isHi ? 'ऐप रीइन्स्टॉल की आवश्यकता' : 'App Reinstallation Required'}:</span>
                <span className="text-emerald-400 font-bold">
                  {isHi ? 'कभी नहीं (0% ज़रूरत)' : 'Never (0% Required)'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">{isHi ? 'अंतिम रिमोट सिंक' : 'Last Remote Sync'}:</span>
                <span className="text-gray-300 font-mono">{config.lastUpdated}</span>
              </div>
            </div>

            <div className="bg-emerald-950/40 border border-emerald-500/20 p-3 rounded-xl text-xs text-emerald-300 flex items-start gap-2 mb-5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p>
                {isHi
                  ? 'एडमिन द्वारा बदले गए सभी नियम, नए ₹100 आदि प्लान्स और इंटरफ़ेस बदलाव आपके ऐप में तुरंत बिना किसी रुकावट के अपने आप अपडेट हो जाते हैं।'
                  : 'All platform rules, ₹100 starter plans, and interface updates pushed by the Admin update instantly in your app with zero downtime or reinstall.'}
              </p>
            </div>

            {justChecked && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                  {isHi
                    ? 'सफलतापूर्वक चेक किया गया! आपका ऐप नवीनतम वर्ज़न पर सक्रिय है।'
                    : 'Check complete! You are already on the latest live version.'}
                </span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={handleManualCheck}
                disabled={checking}
                className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-600/20"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
                {checking
                  ? isHi ? 'चेक किया जा रहा है...' : 'Checking...'
                  : isHi ? 'अभी लाइव अपडेट्स चेक करें' : 'Check for Live Updates'}
              </button>
              <button
                onClick={() => setShowStatusModal(false)}
                className="py-2.5 px-4 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-medium cursor-pointer"
              >
                {isHi ? 'बंद करें' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
