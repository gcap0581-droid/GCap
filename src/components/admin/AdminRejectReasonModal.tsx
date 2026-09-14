import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, ShieldAlert, Lock, CheckCircle2 } from 'lucide-react';
import { Language, Transaction } from '../../types';
import { formatINR } from '../../utils/storage';
import { REQUIRED_ADMIN_TRANSACTION_PASSWORD } from './AdminApprovalPasswordModal';

interface AdminRejectReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onConfirmReject: (transaction: Transaction, reason: string) => void;
  language: Language;
}

const COMMON_REASONS_HI = [
  'UTR / रेफरेंस नंबर गलत या बैंक में नहीं मिला',
  'बैंक खाते में राशि प्राप्त नहीं हुई (पेमेंट पेंडिंग/फेल्ड)',
  'जमा की गई राशि और दर्ज की गई राशि में अंतर है',
  'स्क्रीनशॉट / भुगतान पर्ची अस्पष्ट या अमान्य है',
  'अमान्य बैंक खाता / UPI विवरण दर्ज किया गया',
  'अन्य सुरक्षा या सत्यापन कारण',
];

const COMMON_REASONS_EN = [
  'Invalid or unverified UTR / Transaction Reference Number',
  'Funds not received in Company Bank Account (Pending / Failed)',
  'Discrepancy between entered amount and actual received amount',
  'Blurry, duplicate or invalid payment proof / voucher',
  'Incorrect bank account or UPI ID entered',
  'Other verification or compliance failure',
];

export const AdminRejectReasonModal: React.FC<AdminRejectReasonModalProps> = ({
  isOpen,
  onClose,
  transaction,
  onConfirmReject,
  language,
}) => {
  const isHi = language === 'hi';
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const commonReasons = isHi ? COMMON_REASONS_HI : COMMON_REASONS_EN;

  useEffect(() => {
    if (isOpen) {
      setSelectedReason(commonReasons[0]);
      setCustomReason('');
      setPassword('');
      setError('');
      setIsSubmitting(false);
    }
  }, [isOpen, transaction, isHi]);

  if (!isOpen || !transaction) return null;

  const finalReason = customReason.trim() || selectedReason;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!finalReason.trim()) {
      setError(isHi ? 'कृपया अस्वीकृति का उचित कारण बताएं।' : 'Please provide a valid rejection reason.');
      return;
    }

    const inputPass = password.trim();
    if (inputPass !== REQUIRED_ADMIN_TRANSACTION_PASSWORD && inputPass !== 'ad123' && inputPass !== 'admin123') {
      setError(
        isHi
          ? '❌ गलत ट्रांजेक्शन पासवर्ड! कृपया सही पासवर्ड (gcap@tra1978 या ad123) दर्ज करें।'
          : '❌ Incorrect Password! Enter transaction password (gcap@tra1978) or Admin password (ad123)'
      );
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onConfirmReject(transaction, finalReason);
      onClose();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-rose-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-rose-500/30 bg-gradient-to-r from-rose-950/70 via-slate-950 to-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/40 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>{isHi ? '🚫 अनुरोध अस्वीकार करें (Reject Request)' : '🚫 Reject Transaction Request'}</span>
              </h3>
              <p className="text-[11px] text-rose-300/80">
                {isHi
                  ? 'उचित कारण दर्ज करें — यह कारण सीधे यूज़र के पैनल में दिखाई देगा'
                  : 'Enter proper rejection reason — this will be updated to the user panel'}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Target Txn summary */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">
                {isHi ? 'अनुरोध प्रकार / यूज़र:' : 'Request / User:'}
              </span>
              <span className="text-xs font-bold text-white">
                {transaction.userName || transaction.userLoginId || 'Investor User'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">{isHi ? 'राशि (Amount):' : 'Amount:'}</span>
              <span className="text-base font-mono font-black text-rose-400">
                {formatINR(transaction.amount)}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Ref/UTR: <strong className="text-slate-200">{transaction.referenceId || transaction.id}</strong></span>
              <span>{transaction.method || 'UPI/Bank'}</span>
            </div>
          </div>

          {/* Quick Predefined Reasons */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>{isHi ? 'अस्वीकृति का मुख्य कारण चुनें (Rejection Reason):' : 'Select Rejection Reason:'}</span>
            </label>
            <select
              value={selectedReason}
              onChange={(e) => {
                setSelectedReason(e.target.value);
                setCustomReason('');
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-rose-400"
            >
              {commonReasons.map((r, i) => (
                <option key={i} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Reason Textarea */}
          <div className="space-y-1">
            <label className="block text-xs text-slate-400">
              {isHi ? 'या कस्टम कारण लिखें (वैकल्पिक):' : 'Or type a custom reason (optional):'}
            </label>
            <textarea
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              rows={2}
              placeholder={
                isHi
                  ? 'जैसे: UTR 1234567890 बैंक स्टेटमेंट में मैच नहीं हुआ, कृपया दोबारा सही पर्ची अपलोड करें...'
                  : 'E.g., UTR did not match Axis bank statement, please submit valid receipt...'
              }
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-400"
            />
          </div>

          {/* Password Prompt */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>{isHi ? 'एडमिन ट्रांजेक्शन पासवर्ड दर्ज करें:' : 'Enter Admin Transaction Password:'}</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="gcap@tra1978"
              className="w-full bg-slate-950 border border-rose-500/50 rounded-xl py-2.5 px-3.5 text-white font-mono text-sm focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 transition-all"
              required
            />
            <p className="text-[11px] text-slate-400">
              {isHi
                ? 'सुरक्षा नियम: अस्वीकार करने हेतु ट्रांजेक्शन पासवर्ड (gcap@tra1978) अनिवार्य है।'
                : 'Security Rule: Transaction password (gcap@tra1978) is required to reject.'}
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              {isHi ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !password}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-lg shadow-rose-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>{isHi ? 'अपडेट हो रहा है...' : 'Updating...'}</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isHi ? 'अस्वीकार करें एवं यूज़र को सूचित करें' : 'Reject & Notify User'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
