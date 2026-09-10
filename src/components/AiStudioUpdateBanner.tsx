import React, { useEffect, useState } from 'react';
import {
  checkForAiStudioUpdate,
  applyAiStudioUpdateNow,
  subscribeToAiStudioUpdates,
  BuildVersionInfo,
  CURRENT_BUILD_ID,
} from '../utils/aiStudioSync';
import { Sparkles, RefreshCw, CheckCircle2, ArrowRight, X } from 'lucide-react';
import { Language } from '../types';

interface AiStudioUpdateBannerProps {
  language: Language;
}

export const AiStudioUpdateBanner: React.FC<AiStudioUpdateBannerProps> = ({ language }) => {
  const [updateInfo, setUpdateInfo] = useState<BuildVersionInfo | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isUpdated, setIsUpdated] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const isHi = language === 'hi';

  useEffect(() => {
    const unsubscribe = subscribeToAiStudioUpdates((info) => {
      // Check if build was already installed or dismissed
      const installedId = localStorage.getItem('gcap_installed_build_id');
      const ignoredId = localStorage.getItem('gcap_last_ignored_build');
      if (info.buildId && (info.buildId === installedId || info.buildId === ignoredId)) {
        return;
      }
      setUpdateInfo(info);
      setIsDismissed(false);
      setIsUpdated(false);
    });
    return () => unsubscribe();
  }, []);

  // Auto-dismiss banner after 8 seconds if user does not interact, preventing screen clutter
  useEffect(() => {
    if (!updateInfo || isDismissed || isUpdating) return;
    const timer = setTimeout(() => {
      setIsDismissed(true);
      if (updateInfo?.buildId) {
        localStorage.setItem('gcap_last_ignored_build', updateInfo.buildId);
      }
    }, 8000);

    return () => clearTimeout(timer);
  }, [updateInfo, isDismissed, isUpdating]);

  const handleApplyUpdate = async () => {
    setIsUpdating(true);
    if (updateInfo?.buildId) {
      localStorage.setItem('gcap_installed_build_id', updateInfo.buildId);
    }
    setIsUpdated(true);
    setTimeout(async () => {
      await applyAiStudioUpdateNow();
      setIsDismissed(true);
      setUpdateInfo(null);
    }, 1200);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    if (updateInfo?.buildId) {
      localStorage.setItem('gcap_last_ignored_build', updateInfo.buildId);
    }
    setUpdateInfo(null);
  };

  if (!updateInfo || isDismissed) return null;

  return (
    <div
      id="aistudio-live-update-modal"
      className="fixed bottom-4 right-4 left-4 sm:left-auto sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 border-2 border-emerald-400/80 rounded-2xl p-4 sm:p-5 shadow-2xl shadow-emerald-950/80 text-white backdrop-blur-md relative overflow-hidden">
        {/* Glowing top line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-300 to-emerald-400 animate-pulse" />

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0">
              {isUpdated ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <Sparkles className="w-5 h-5 text-emerald-400 animate-spin" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md bg-emerald-500/30 text-emerald-300 border border-emerald-400/30">
                  AI Studio Live Sync
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  v{updateInfo.appVersion || '2.5.1'}
                </span>
              </div>
              <h4 className="text-sm font-bold text-white pt-1">
                {isUpdated
                  ? isHi
                    ? '✅ अपडेट सफलतापूर्वक लागू हुआ!'
                    : '✅ Update Applied Successfully!'
                  : isHi
                  ? 'AI Studio से नया अपडेट उपलब्ध है!'
                  : 'New Update Live from AI Studio!'}
              </h4>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            aria-label="Dismiss update"
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
          {isUpdated
            ? isHi
              ? 'सिस्टम नवीनतम वर्ज़न पर रीलोड हो रहा है। आपका संपूर्ण डेटा सुरक्षित है।'
              : 'System is running on the latest build. Your data and wallet are secure.'
            : isHi
            ? 'प्रोजेक्ट को दोबारा इंस्टॉल किए बिना आपके सभी नए बदलाव तुरंत लागू हो रहे हैं। आपका वॉलेट व डेटा सुरक्षित है।'
            : 'Zero reinstall required! All latest code changes are syncing seamlessly. Your wallet & active plans are completely safe.'}
        </p>

        {!isUpdated && (
          <div className="mt-3.5 flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
            <span className="text-[11px] text-emerald-300/90 font-medium">
              {isUpdating
                ? isHi
                  ? 'अपडेट लोड हो रहा है...'
                  : 'Applying update...'
                : isHi
                ? 'क्लाउड सिंक तैयार'
                : 'Cloud sync ready'}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDismiss}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors cursor-pointer"
              >
                {isHi ? 'बंद करें (Close)' : 'Dismiss'}
              </button>
              <button
                id="btn-apply-aistudio-update"
                onClick={handleApplyUpdate}
                disabled={isUpdating}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
                <span>{isHi ? 'तुरंत लागू करें' : 'Apply Now'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Compact inline button for user / admin to manually check AI Studio updates anytime
 */
export const AiStudioCheckButton: React.FC<{
  language: Language;
  variant?: 'navbar' | 'compact' | 'admin';
}> = ({ language, variant = 'navbar' }) => {
  const [checking, setChecking] = useState<boolean>(false);
  const [status, setStatus] = useState<'idle' | 'updated' | 'up-to-date'>('idle');
  const isHi = language === 'hi';

  const handleCheck = async () => {
    setChecking(true);
    setStatus('idle');
    const res = await checkForAiStudioUpdate();
    setChecking(false);

    if (res.hasUpdate) {
      setStatus('updated');
      await applyAiStudioUpdateNow();
    } else {
      setStatus('up-to-date');
      setTimeout(() => setStatus('idle'), 3500);
    }
  };

  if (variant === 'admin') {
    return (
      <button
        id="btn-admin-check-aistudio"
        onClick={handleCheck}
        disabled={checking}
        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-60"
      >
        <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
        <span>
          {checking
            ? isHi
              ? 'AI Studio बिल्ड जांच रहे हैं...'
              : 'Checking AI Studio build...'
            : status === 'up-to-date'
            ? isHi
              ? '✅ पूर्णतः अप-टू-डेट है'
              : '✅ Up to Date'
            : isHi
            ? 'AI Studio ऑटो-अपडेट चेक करें'
            : 'Check AI Studio Updates'}
        </span>
      </button>
    );
  }

  if (variant === 'compact') {
    return (
      <button
        id="btn-check-aistudio-compact"
        onClick={handleCheck}
        disabled={checking}
        title={
          isHi
            ? 'AI Studio से नवीनतम कोड अपडेट चेक करें (बिना री-इन्स्टॉल)'
            : 'Check latest AI Studio code build (Zero reinstall)'
        }
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/50 hover:bg-emerald-900/50 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold transition-all cursor-pointer disabled:opacity-50"
      >
        <RefreshCw className={`w-3 h-3 text-emerald-400 ${checking ? 'animate-spin' : ''}`} />
        <span>
          {checking
            ? isHi
              ? 'जांच रहे हैं...'
              : 'Checking...'
            : status === 'up-to-date'
            ? isHi
              ? 'नवीनतम'
              : 'Latest'
            : isHi
            ? 'अपडेट चेक'
            : 'Check Update'}
        </span>
      </button>
    );
  }

  // Default navbar badge button
  return (
    <button
      id="btn-check-aistudio-navbar"
      onClick={handleCheck}
      disabled={checking}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] font-medium transition-all cursor-pointer"
      title={
        isHi
          ? 'AI Studio ऑटो-सिंक: कोई भी कोड बदलने पर बिना रीइन्स्टॉल अपने आप अपडेट होगा। अभी चेक करने के लिए क्लिक करें।'
          : 'AI Studio Auto-Sync: Updates automatically without reinstalling. Click to check now.'
      }
    >
      <RefreshCw className={`w-3 h-3 text-emerald-400 ${checking ? 'animate-spin' : ''}`} />
      <span>
        {status === 'up-to-date'
          ? isHi
            ? 'नवीनतम AI बिल्ड'
            : 'Latest AI Build'
          : isHi
          ? 'AI Studio सिंक'
          : 'AI Studio Sync'}
      </span>
      {status === 'up-to-date' ? (
        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
      ) : (
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      )}
    </button>
  );
};
