import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Check, X, ShieldCheck } from 'lucide-react';
import { Language } from '../types';

interface PwaInstallPromptProps {
  language: Language;
}

export const PwaInstallPrompt: React.FC<PwaInstallPromptProps> = ({ language }) => {
  const isHi = language === 'hi';
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

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
      // Fallback instruction if browser event hasn't fired yet
      alert(
        isHi
          ? 'इंस्टॉल करने के लिए ब्राउज़र के 3 डॉट्स (⋮ Menu) पर क्लिक करके "Add to Home Screen" या "Install App" चुनें।'
          : 'To install, tap browser menu (⋮) and select "Add to Home Screen" or "Install App".'
      );
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
                ? 'बिना ब्राउज़र खोले 1-क्लिक में सीधे मोबाइल स्क्रीन पर ऐप इंस्टॉल करें'
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
  );
};
