import React, { useState, useEffect } from 'react';
import { X, Lock, ShieldCheck, Building2, ArrowDown, UserCheck, AlertCircle, CheckCircle2, Zap } from 'lucide-react';
import { Language, Transaction, AppRules } from '../../types';
import { formatINR } from '../../utils/storage';

interface AdminApprovalPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onConfirmApprove: (transaction: Transaction) => void;
  language: Language;
  rules?: AppRules;
}

export const REQUIRED_ADMIN_TRANSACTION_PASSWORD = 'gcap@tra1978';

export const AdminApprovalPasswordModal: React.FC<AdminApprovalPasswordModalProps> = ({
  isOpen,
  onClose,
  transaction,
  onConfirmApprove,
  language,
  rules,
}) => {
  const isHi = language === 'hi';
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError('');
      setIsSubmitting(false);
    }
  }, [isOpen, transaction]);

  if (!isOpen || !transaction) return null;

  const companyBank = {
    name: rules?.companyBankAccountHolder || 'GCap Asset Management (India) Pvt. Ltd.',
    bank: rules?.companyBankName || 'Axis Bank Ltd.',
    accountNumber: rules?.companyBankAccountNumber || '924010008662307',
    ifsc: rules?.companyBankIfsc || 'UTIB0001219',
  };

  const recipientName = transaction.userName || transaction.userLoginId || 'Investor User Account';
  const recipientDestination = transaction.destinationDetails || transaction.method || 'User Bank Account / UPI';
  const displayAmount = transaction.netAmount || transaction.amount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.trim() !== REQUIRED_ADMIN_TRANSACTION_PASSWORD) {
      setError(
        isHi
          ? '❌ गलत ट्रांजेक्शन पासवर्ड! कृपया सही पासवर्ड (gcap@tra1978) दर्ज करें।'
          : '❌ Incorrect Transaction Password! Required: gcap@tra1978'
      );
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onConfirmApprove(transaction);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-500/30 bg-gradient-to-r from-amber-950/60 via-slate-950 to-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>{isHi ? '🔒 ट्रांजेक्शन सुरक्षा स्वीकृति' : '🔒 Authorization & Transfer Verification'}</span>
              </h3>
              <p className="text-[11px] text-amber-300/80">
                {isHi ? 'कंपनी बैंक खाता → यूज़र खाते में ट्रांसफर स्वीकृति' : 'Company Bank Reserve → User Account Transfer Authorization'}
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

        {/* Modal Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Automated Payout API Banner */}
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2 font-medium">
            <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {isHi
                ? '⚡ 100% स्वचालित डायरेक्ट बैंकिंग ट्रांसफर (Auto IMPS API): पासवर्ड डालते ही कंपनी Axis Bank खाते (924010008662307) से पैसे डिडक्ट होकर यूज़र के बैंक खाते में स्वतः क्रेडिट हो जाएँगे। कंपनी को बैंक में जाकर कुछ भी मैन्युअल नहीं करना पड़ेगा।'
                : '⚡ 100% Automated Corporate Payout: Funds auto-deduct from Company Axis Bank Reserve (924010008662307) & credit directly to User Account via API. Zero manual work required!'}
            </span>
          </div>

          {/* Transfer Flow Box */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            
            {/* Sender: Company Bank */}
            <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold mb-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                <span>{isHi ? 'भेजने वाला कंपनी बैंक खाता (Debited Account):' : 'From Company Bank Account (Source):'}</span>
              </span>
              <div className="font-mono text-xs space-y-0.5">
                <div className="text-white font-bold">{companyBank.name}</div>
                <div className="text-slate-300 flex items-center gap-3 text-[11px]">
                  <span>{companyBank.bank}</span>
                  <span>A/C: <strong className="text-amber-300">{companyBank.accountNumber}</strong></span>
                  <span>IFSC: <strong className="text-slate-200">{companyBank.ifsc}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="p-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400">
                <ArrowDown className="w-4 h-4" />
              </div>
            </div>

            {/* Recipient: User Bank */}
            <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold mb-1 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isHi ? 'प्राप्तकर्ता यूज़र खाता (Recipient Account):' : 'To User Registered Account:'}</span>
              </span>
              <div className="font-mono text-xs space-y-0.5">
                <div className="text-white font-bold">{recipientName}</div>
                <div className="text-emerald-400 text-[11px] font-semibold">{recipientDestination}</div>
                <div className="text-[10px] text-slate-400">Ref/UTR: {transaction.referenceId || transaction.id}</div>
              </div>
            </div>

            {/* Transfer Amount Highlight */}
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-200">
                {isHi ? 'स्वीकृत ट्रांसफर राशि:' : 'Authorized Amount:'}
              </span>
              <span className="text-lg font-mono font-extrabold text-emerald-400">
                {formatINR(displayAmount)}
              </span>
            </div>

          </div>

          {/* Password Prompt */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>{isHi ? 'एडमिन ट्रांजेक्शन पासवर्ड दर्ज करें:' : 'Enter Admin Transaction Password:'}</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="gcap@tra1978"
              autoFocus
              className="w-full bg-slate-950 border border-amber-500/50 rounded-xl py-2.5 px-3.5 text-white font-mono text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
              required
            />
            <p className="text-[11px] text-slate-400">
              {isHi
                ? 'सुरक्षा नियम: अप्रूवल के लिए ट्रांजेक्शन पासवर्ड (gcap@tra1978) अनिवार्य है।'
                : 'Security Rule: Transaction password (gcap@tra1978) is required for approval.'}
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
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
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>{isHi ? 'सत्यापित हो रहा है...' : 'Verifying...'}</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isHi ? 'स्वीकृत करें और फंड ट्रांसफर करें' : 'Approve & Transfer Funds'}</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
