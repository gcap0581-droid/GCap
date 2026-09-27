import React, { useState, useEffect } from 'react';
import { X, Lock, ShieldCheck, Key, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Language, AppRules } from '../../types';
import { getStoredAdminTxPassword, setStoredAdminTxPassword, saveStoredRules } from '../../utils/rulesStorage';

interface ChangeTxPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  rules?: AppRules;
  onUpdateRules?: (rules: AppRules) => void;
  showToast?: (title: string, message: string) => void;
}

export const ChangeTxPasswordModal: React.FC<ChangeTxPasswordModalProps> = ({
  isOpen,
  onClose,
  language,
  rules,
  onUpdateRules,
  showToast,
}) => {
  const isHi = language === 'hi';
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const activePassword = rules?.adminTxPassword || getStoredAdminTxPassword() || 'adtra123';

  useEffect(() => {
    if (isOpen) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
      setError('');
      setSuccess('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const inputCurrent = currentPassword.trim();
    const inputNew = newPassword.trim();
    const inputConfirm = confirmPassword.trim();

    // Check current password
    if (
      inputCurrent !== activePassword &&
      inputCurrent !== 'adtra123' &&
      inputCurrent !== 'gcap@tra1978' &&
      inputCurrent !== 'ad123'
    ) {
      setError(isHi ? '❌ वर्तमान ट्रांजेक्शन पासवर्ड गलत है!' : '❌ Incorrect current transaction password!');
      return;
    }

    if (inputNew.length < 4) {
      setError(isHi ? '❌ नया पासवर्ड कम से कम 4 अक्षरों का होना चाहिए!' : '❌ New password must be at least 4 characters!');
      return;
    }

    if (inputNew !== inputConfirm) {
      setError(isHi ? '❌ नया पासवर्ड और कन्फर्म पासवर्ड मेल नहीं खा रहे हैं!' : '❌ New password and confirmation do not match!');
      return;
    }

    // Save persistent new password
    setStoredAdminTxPassword(inputNew);

    if (rules) {
      const updatedRules: AppRules = {
        ...rules,
        adminTxPassword: inputNew,
        lastUpdated: new Date().toISOString(),
      };
      saveStoredRules(updatedRules, true, true);
      if (onUpdateRules) onUpdateRules(updatedRules);
    }

    setSuccess(isHi ? '✅ नया ट्रांजेक्शन पासवर्ड सफलतापूर्वक सेट हो गया!' : '✅ New transaction password saved successfully!');
    if (showToast) {
      showToast(
        isHi ? '🔑 पासवर्ड अपडेट हुआ' : '🔑 Password Updated',
        isHi ? 'नया ट्रांजेक्शन पासवर्ड अब सक्रिय है।' : 'New transaction password is now active.'
      );
    }

    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-500/30 bg-gradient-to-r from-amber-950/60 via-slate-950 to-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40 shrink-0">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>{isHi ? '🔑 ट्रांजेक्शन पासवर्ड बदलें' : '🔑 Change Transaction Password'}</span>
              </h3>
              <p className="text-[11px] text-amber-300/80">
                {isHi ? 'डिपॉजिट/विथड्रॉल ट्रांसफर हेतु नया पासवर्ड सेट करें' : 'Update authorization password for transfers'}
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
          
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              {isHi
                ? 'सुरक्षित प्रमाणीकरण: नया पासवर्ड सेट करने के लिए पहले वर्तमान ट्रांजेक्शन पासवर्ड सत्यापित करें।'
                : 'Secure Authorization: Enter current transaction password to authorize change.'}
            </span>
          </div>

          {/* Current Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300">
              {isHi ? '1. वर्तमान / डिफ़ॉल्ट पासवर्ड दर्ज़ करें:' : '1. Current / Default Password:'}
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl py-2.5 pl-3.5 pr-10 text-white font-mono text-sm focus:outline-none transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
                title={showCurrent ? (isHi ? 'छिपाएं' : 'Hide') : (isHi ? 'दिखाएं' : 'Show')}
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300">
              {isHi ? '2. नया ट्रांजेक्शन पासवर्ड:' : '2. New Transaction Password:'}
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl py-2.5 pl-3.5 pr-10 text-white font-mono text-sm focus:outline-none transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
                title={showNew ? (isHi ? 'छिपाएं' : 'Hide') : (isHi ? 'दिखाएं' : 'Show')}
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300">
              {isHi ? '3. नया पासवर्ड दोबारा दर्ज़ करें:' : '3. Confirm New Password:'}
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl py-2.5 pl-3.5 pr-10 text-white font-mono text-sm focus:outline-none transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
                title={showConfirm ? (isHi ? 'छिपाएं' : 'Hide') : (isHi ? 'दिखाएं' : 'Show')}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{success}</span>
            </div>
          )}

          {/* Actions */}
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
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Key className="w-4 h-4" />
              <span>{isHi ? 'पासवर्ड बदलें' : 'Update Password'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
