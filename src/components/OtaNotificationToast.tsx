import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, X, RefreshCw, Radio, Bell } from 'lucide-react';
import { OtaEventPayload, Language } from '../types';
import { subscribeToOtaUpdates } from '../utils/liveConfigStorage';

interface OtaNotificationToastProps {
  language: Language;
}

export const OtaNotificationToast: React.FC<OtaNotificationToastProps> = ({ language }) => {
  const isHi = language === 'hi';
  const [activeEvent, setActiveEvent] = useState<OtaEventPayload | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToOtaUpdates((event) => {
      setActiveEvent(event);
      setVisible(true);

      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setVisible(false);
      }, 5000);

      return () => clearTimeout(timer);
    });

    return () => unsubscribe();
  }, []);

  if (!visible || !activeEvent) return null;

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'RULES':
        return isHi ? 'नियम अपडेट' : 'Rules Updated';
      case 'PLANS':
        return isHi ? 'प्लान्स अपडेट' : 'Plans Updated';
      case 'INTERFACE':
        return isHi ? 'इंटरफ़ेस अपडेट' : 'UI Updated';
      case 'TREASURY':
        return isHi ? 'ट्रेजरी अपडेट' : 'Treasury Updated';
      default:
        return isHi ? 'सिस्टम अपडेट' : 'System Sync';
    }
  };

  return (
    <div
      id="ota-notification-toast"
      className="fixed bottom-5 right-5 z-50 max-w-sm w-[calc(100vw-2.5rem)] sm:w-96 bg-gray-900/95 text-white p-4 rounded-2xl shadow-2xl border border-emerald-500/40 backdrop-blur-md animate-in slide-in-from-bottom-5 duration-300"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
          <Radio className="w-5 h-5 animate-pulse" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-gray-950 uppercase tracking-wider">
              {getTypeBadge(activeEvent.type)}
            </span>
            <span className="text-xs text-gray-400 font-mono">
              {activeEvent.version || 'Live OTA'}
            </span>
          </div>

          <h4 className="text-sm font-semibold text-white leading-tight">
            {isHi ? activeEvent.titleHi : activeEvent.title}
          </h4>
          <p className="text-xs text-gray-300 mt-1 leading-relaxed">
            {isHi ? activeEvent.descriptionHi : activeEvent.description}
          </p>

          <div className="mt-2.5 flex items-center justify-between text-[11px] text-emerald-400/90 font-medium pt-2 border-t border-gray-800">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isHi ? 'बिना रीइन्स्टॉल किए तुरंत लागू हुआ' : 'Applied live without reinstall'}
            </span>
          </div>
        </div>

        <button
          onClick={() => setVisible(false)}
          className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors"
          title={isHi ? 'बंद करें' : 'Dismiss'}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
