import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, CheckCircle2, AlertCircle, Ban, RefreshCw, PhoneCall, Mail } from 'lucide-react';
import { Language, UserProfile } from '../../types';

interface AdminSuspendModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  language: Language;
  onConfirmSuspend: (userId: string, status: 'SUSPENDED' | 'ACTIVE', reason?: string) => Promise<void> | void;
}

export const AdminSuspendModal: React.FC<AdminSuspendModalProps> = ({
  isOpen,
  onClose,
  user,
  language,
  onConfirmSuspend,
}) => {
  const isHi = language === 'hi';
  const isCurrentlySuspended = user?.status === 'SUSPENDED';

  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && user) {
      setReason(user.suspendedReason || user.suspendedReasonHi || '');
      setError('');
      setIsSubmitting(false);
    }
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const handleSuspendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanReason = reason.trim();
    if (!cleanReason) {
      setError(isHi ? '❌ कृपया खाता निलंबित करने का स्पष्ट कारण दर्ज करें।' : '❌ Please enter a clear reason for suspension.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onConfirmSuspend(user.id, 'SUSPENDED', cleanReason);
      onClose();
    } catch (err: any) {
      setError(err?.message || (isHi ? 'निलंबन अद्यतन विफल हुआ' : 'Failed to update suspension status'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReactivateSubmit = async () => {
    try {
      setIsSubmitting(true);
      await onConfirmSuspend(user.id, 'ACTIVE');
      onClose();
    } catch (err: any) {
      setError(err?.message || (isHi ? 'सक्रियण विफल हुआ' : 'Failed to reactivate user'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-purple-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-500/30 bg-gradient-to-r from-purple-950/80 via-slate-950 to-slate-950">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${
              isCurrentlySuspended 
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' 
                : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
            }`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>
                  {isCurrentlySuspended 
                    ? (isHi ? '🚫 निलंबन स्थिति अद्यतन करें' : '🚫 Suspension Details & Management')
                    : (isHi ? '🚫 यूज़र को निलंबित (Suspend) मोड में डालें' : '🚫 Put User in Suspended Mode')
                  }
                </span>
              </h3>
              <p className="text-[11px] text-purple-300/80">
                {isHi 
                  ? 'निलंबित यूज़र पोर्टल में लॉगिन कर देख सकता है परंतु कोई ट्रांजेक्शन नहीं कर सकता' 
                  : 'Suspended users can view dashboard but cannot make any transactions'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSuspendSubmit} className="p-6 space-y-4">

          {/* User Info Card */}
          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white text-sm">{user.name}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                user.status === 'SUSPENDED' 
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' 
                  : user.status === 'BLOCKED' 
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}>
                {user.status === 'SUSPENDED' ? 'SUSPENDED (निलंबित)' : user.status}
              </span>
            </div>
            <div className="text-xs text-slate-400 font-mono flex items-center gap-3">
              <span>Login ID: <strong className="text-cyan-300">{user.loginId}</strong></span>
              <span>Phone: <strong className="text-slate-200">{user.phone}</strong></span>
            </div>
          </div>

          {/* Mode Explanation Notice */}
          <div className="p-3 bg-purple-950/40 border border-purple-500/30 rounded-xl text-purple-200 text-xs leading-relaxed space-y-1">
            <div className="font-bold text-purple-300 flex items-center gap-1.5">
              <span>💡 निलंबित (Suspended) मोड नियम:</span>
            </div>
            <p className="text-[11px] text-purple-200/90">
              {isHi
                ? 'यूज़र अपने खाते में लॉगिन करके सिर्फ देख (View-Only) सकेगा। जैसे ही वह डिपॉजिट, विथड्रॉल या इन्वेस्ट करने का बटन दबाएगा, उसे नीचे लिखा आपका कारण (Reason) दिखाई देगा।'
                : 'The user can log in and view their account in View-Only mode. When they attempt any transaction, they will see the reason entered below.'}
            </p>
          </div>

          {/* Reason Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300">
              {isHi ? 'कारण दर्ज करें (Reason for Suspension):' : 'Reason for Suspension (Visible to User):'}
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder={
                isHi
                  ? 'उदा: केवाईसी सत्यापन लंबित होने के कारण आपका खाता निलंबित किया गया है। कृपया सहायता टीम से संपर्क करें।'
                  : 'e.g., Your account is suspended due to pending KYC verification. Please contact support.'
              }
              className="w-full bg-slate-950 border border-slate-800 focus:border-purple-400 rounded-xl p-3 text-white text-xs focus:outline-none transition-all leading-relaxed"
              required
            />
            <p className="text-[10px] text-slate-400">
              {isHi 
                ? 'यह संदेश यूज़र को किसी भी ट्रांजेक्शन बटन को दबाते ही स्क्रीन पर दिखाया जाएगा।' 
                : 'This message will be shown to the user whenever they click any transaction button.'}
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800 gap-2 flex-wrap">
            {isCurrentlySuspended && (
              <button
                type="button"
                onClick={handleReactivateSubmit}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isHi ? '✅ खाता पुनः सक्रिय करें (Unsuspend)' : '✅ Reactivate Account'}</span>
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                {isHi ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-900/40 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <Ban className="w-4 h-4" />
                <span>
                  {isCurrentlySuspended 
                    ? (isHi ? 'कारण अपडेट करें' : 'Update Reason') 
                    : (isHi ? '🚫 निलंबित करें' : '🚫 Confirm Suspend')}
                </span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
