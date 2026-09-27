import React from 'react';
import { X, ShieldAlert, PhoneCall, Mail, AlertTriangle, Eye } from 'lucide-react';
import { Language, UserProfile, AppRules } from '../types';

interface SuspendedUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  language: Language;
  rules?: AppRules;
  actionTitle?: string;
}

export const SuspendedUserModal: React.FC<SuspendedUserModalProps> = ({
  isOpen,
  onClose,
  user,
  language,
  rules,
  actionTitle,
}) => {
  const isHi = language === 'hi';

  if (!isOpen || !user) return null;

  const displayReason =
    user.suspendedReason ||
    user.suspendedReasonHi ||
    (isHi
      ? 'प्रशासन द्वारा आपके खाते को सुरक्षा या सत्यापन कारणों से अस्थायी रूप से निलंबित (Suspended) किया गया है।'
      : 'Your account has been temporarily suspended by administration for security or verification purposes.');

  const supportPhone = rules?.supportPhone || '+91 98000 12345';
  const supportEmail = rules?.supportEmail || 'support@gcap.in';

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-purple-500/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-500/30 bg-gradient-to-r from-purple-950/90 via-slate-950 to-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-500/40 shrink-0">
              <ShieldAlert className="w-6 h-6 text-purple-400 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>{isHi ? '🚫 खाता निलंबित (Account Suspended)' : '🚫 Account Suspended'}</span>
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.2 rounded bg-purple-500/30 text-purple-200 border border-purple-500/40 flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>VIEW-ONLY MODE</span>
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">

          {/* Action Attempted Banner if available */}
          {actionTitle && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2 font-medium">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                {isHi
                  ? `आप "${actionTitle}" करने की कोशिश कर रहे थे, परंतु आपका खाता निलंबित है।`
                  : `You attempted "${actionTitle}", but your account is suspended.`}
              </span>
            </div>
          )}

          {/* User Details */}
          <div className="text-xs text-slate-300 space-y-0.5 bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono">
            <div><span className="text-slate-400 font-sans">Name:</span> <strong className="text-white">{user.name}</strong></div>
            <div><span className="text-slate-400 font-sans">Login ID:</span> <strong className="text-cyan-300">{user.loginId}</strong></div>
          </div>

          {/* Suspension Reason Highlight Box */}
          <div className="p-4 rounded-xl bg-purple-950/60 border border-purple-500/40 space-y-1.5 text-left shadow-inner">
            <div className="text-[11px] uppercase tracking-wider font-bold text-purple-300 flex items-center gap-1.5">
              <span>📌 निलंबन का कारण (Reason for Suspension):</span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-white leading-relaxed bg-slate-950/70 p-3 rounded-lg border border-purple-500/30 font-sans">
              "{displayReason}"
            </p>
          </div>

          {/* View-Only & Deposit Explanation */}
          <p className="text-xs text-slate-300 leading-relaxed text-left">
            {isHi
              ? 'आप अपने डैशबोर्ड, वॉलेट बैलेंस व प्लान देख सकते हैं तथा पैसा/फंड जमा (Deposit) कर सकते हैं। परंतु निकासी (Withdrawal), इन्वेस्ट व ट्रांसफर हेतु सस्पेंशन हटने की प्रतीक्षा करें।'
              : 'You can view your dashboard, wallet balance, active plans, and deposit funds normally. However, withdrawals, investments, and transfers are paused until suspension is removed.'}
          </p>

          {/* Support Contact Box */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs">
            <div className="font-bold text-amber-300 text-[11px] uppercase tracking-wider">
              📞 सहायता / सपोर्ट से संपर्क करें:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
              <a
                href={`tel:${supportPhone}`}
                className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-cyan-300 transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate font-mono">{supportPhone}</span>
              </a>
              <a
                href={`mailto:${supportEmail}`}
                className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-cyan-300 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate font-mono">{supportEmail}</span>
              </a>
            </div>
          </div>

          {/* Understand Button */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-900/40 transition-all cursor-pointer"
            >
              {isHi ? 'ठीक है, समझ गया' : 'I Understand'}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
