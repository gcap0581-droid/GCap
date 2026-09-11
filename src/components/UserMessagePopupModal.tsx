import React from 'react';
import {
  Bell,
  X,
  CheckCircle2,
  AlertTriangle,
  Info,
  Gift,
  ShieldAlert,
  Calendar,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { AdminMessage, Language } from '../types';

interface UserMessagePopupModalProps {
  message: AdminMessage | null;
  language: Language;
  onDismiss: () => void;
  onMarkAsReadAndClose: () => void;
}

export const UserMessagePopupModal: React.FC<UserMessagePopupModalProps> = ({
  message,
  language,
  onDismiss,
  onMarkAsReadAndClose,
}) => {
  if (!message) return null;

  const isHi = language === 'hi';
  const title = isHi && message.titleHi ? message.titleHi : message.title;
  const content = isHi && message.contentHi ? message.contentHi : message.content;

  const getCategoryTheme = (category: string) => {
    switch (category) {
      case 'ALERT':
        return {
          icon: ShieldAlert,
          bg: 'from-rose-500/20 via-rose-500/10 to-transparent',
          border: 'border-rose-500/40',
          badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
          iconColor: 'text-rose-400',
          label: isHi ? '⚠️ महत्वपूर्ण चेतावनी' : '⚠️ Alert / Notice',
        };
      case 'BONUS':
        return {
          icon: Gift,
          bg: 'from-amber-500/20 via-amber-500/10 to-transparent',
          border: 'border-amber-500/40',
          badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          iconColor: 'text-amber-400',
          label: isHi ? '🎁 विशेष रिवॉर्ड / बोनस' : '🎁 Bonus & Rewards',
        };
      case 'INFO':
        return {
          icon: Info,
          bg: 'from-cyan-500/20 via-cyan-500/10 to-transparent',
          border: 'border-cyan-500/40',
          badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
          iconColor: 'text-cyan-400',
          label: isHi ? 'ℹ️ महत्वपूर्ण जानकारी' : 'ℹ️ Information',
        };
      case 'SYSTEM':
        return {
          icon: AlertTriangle,
          bg: 'from-purple-500/20 via-purple-500/10 to-transparent',
          border: 'border-purple-500/40',
          badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
          iconColor: 'text-purple-400',
          label: isHi ? '⚙️ सिस्टम अपडेट' : '⚙️ System Update',
        };
      default:
        return {
          icon: Sparkles,
          bg: 'from-emerald-500/20 via-emerald-500/10 to-transparent',
          border: 'border-emerald-500/40',
          badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          iconColor: 'text-emerald-400',
          label: isHi ? '📢 आधिकारिक घोषणा' : '📢 Official Announcement',
        };
    }
  };

  const theme = getCategoryTheme(message.category);
  const Icon = theme.icon;

  const formattedDate = new Date(message.timestamp || Date.now()).toLocaleString(
    isHi ? 'hi-IN' : 'en-IN',
    {
      dateStyle: 'medium',
      timeStyle: 'short',
    }
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-lg bg-slate-900 border ${theme.border} rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-slate-100 flex flex-col max-h-[90vh]`}
        id="user-message-popup-modal"
      >
        {/* Top Glow & Category Accent */}
        <div className={`p-4 sm:p-6 bg-gradient-to-b ${theme.bg} border-b border-slate-800/80`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-2xl bg-slate-950/80 border ${theme.border} flex items-center justify-center shadow-lg shrink-0`}
              >
                <Icon className={`w-6 h-6 ${theme.iconColor}`} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${theme.badgeBg}`}
                  >
                    {theme.label}
                  </span>
                  {message.priority === 'URGENT' && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-500 text-white animate-pulse">
                      {isHi ? 'तत्काल' : 'URGENT'}
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-1 font-mono">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  <span>{formattedDate}</span>
                  <span>•</span>
                  <span className="text-slate-300">{message.senderName || 'GCap Admin'}</span>
                </div>
              </div>
            </div>

            {/* Quick Cross / Dismiss button */}
            <button
              onClick={onDismiss}
              id="btn-close-message-popup"
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
              title={isHi ? 'बंद करें और बाद में पढ़ें' : 'Close and read later'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-white mt-3 leading-snug">
            {title}
          </h3>
        </div>

        {/* Message Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 text-sm leading-relaxed whitespace-pre-line select-text">
            {content}
          </div>

          {/* Reassurance Notice */}
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center gap-2.5 text-xs text-slate-400">
            <Bell className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              {isHi
                ? 'यह संदेश आपके नोटिफिकेशन बॉक्स (🔔) में सुरक्षित है, आप इसे कभी भी दोबारा पढ़ सकते हैं।'
                : 'This message is saved in your Notification Box (🔔). You can review it anytime later.'}
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 sm:p-4 bg-slate-950 border-t border-slate-800/80 flex flex-col sm:flex-row items-center gap-2.5 justify-end">
          <button
            onClick={onDismiss}
            id="btn-popup-dismiss-continue"
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs sm:text-sm transition-all cursor-pointer text-center"
          >
            {isHi ? '✕ बंद करें (जारी रखें)' : '✕ Dismiss & Continue'}
          </button>
          <button
            onClick={onMarkAsReadAndClose}
            id="btn-popup-mark-read"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isHi ? '✓ समझ गया (पढ़ा हुआ मार्क करें)' : '✓ Got it (Mark as Read)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
