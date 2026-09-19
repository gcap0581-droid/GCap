import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Check, X, ShieldCheck, Sparkles, HelpCircle } from 'lucide-react';
import { Language } from '../types';

interface PwaInstallPromptProps {
  language: Language;
}

export const PwaInstallPrompt: React.FC<PwaInstallPromptProps> = ({ language }) => {
  const isHi = language === 'hi';
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);

  useEffect(() => {
    // Check if already running as standalone app
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      setShowGuideModal(true);
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled || isDismissed) return null;

  return (
    <>
      <div className="bg-gradient-to-r from-emerald-900/90 via-teal-900/90 to-slate-900 border-b border-emerald-500/40 text-white px-4 py-2.5 shadow-lg relative z-30">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-sm shrink-0 shadow-md">
              G
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-white text-sm">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>{isHi ? 'GCap एंड्रॉयड ऐप इंस्टॉल करें' : 'Install GCap Android App'}</span>
              </div>
              <p className="text-[11px] text-slate-300">
                {isHi
                  ? 'बिना ब्राउज़र खोले 1-क्लिक में सीधे मोबाइल होम स्क्रीन पर ऐप चलाएं'
                  : 'Install as standalone mobile app for faster 1-click home screen access'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/20 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>{isHi ? '📲 अभी इंस्टॉल करें' : '📲 Install App Now'}</span>
            </button>

            <button
              onClick={() => setIsDismissed(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-emerald-500/40 rounded-2xl p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-sm">
                  G
                </div>
                <h3 className="font-bold text-base text-white">
                  {isHi ? 'Chrome में ऐप कैसे इंस्टॉल करें?' : 'How to Install in Chrome'}
                </h3>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</span>
                <div>
                  <p className="font-semibold text-white">{isHi ? 'Chrome ब्राउज़र में 3 डॉट्स (⋮) पर टैप करें' : 'Tap 3 Dots (⋮) menu in Chrome'}</p>
                  <p className="text-slate-400 text-[11px]">{isHi ? 'स्क्रीन के ऊपर दाईं ओर 3 बिंदु दिखेंगे।' : 'Located at top-right corner of Chrome.'}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</span>
                <div>
                  <p className="font-semibold text-white">{isHi ? '"Install app" या "Add to Home screen" चुनें' : 'Select "Install app" or "Add to Home screen"'}</p>
                  <p className="text-slate-400 text-[11px]">{isHi ? 'मेनू लिस्ट में "ऐप इंस्टॉल करें" या "होम स्क्रीन में जोड़ें" पर क्लिक करें।' : 'Click Install or Add to Home Screen in the list.'}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</span>
                <div>
                  <p className="font-semibold text-white">{isHi ? '"Install" या "Add" पर क्लिक करें' : 'Confirm "Install" or "Add"'}</p>
                  <p className="text-slate-400 text-[11px]">{isHi ? 'GCap ऐप सीधे आपके मोबाइल स्क्रीन पर बिना ब्राउज़र के ऐप की तरह आ जाएगी!' : 'GCap app will appear on your phone home screen like a native app!'}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs cursor-pointer shadow-lg hover:brightness-110 transition-all"
            >
              {isHi ? 'समझ गया (OK)' : 'Got it (OK)'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
