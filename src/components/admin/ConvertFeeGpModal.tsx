import React, { useState } from 'react';
import { X, Coins, ArrowRight, CheckCircle2, Building2, Wallet, Sparkles } from 'lucide-react';
import { CompanyTreasury, Language } from '../../types';
import { formatINR } from '../../utils/storage';

interface ConvertFeeGpModalProps {
  isOpen: boolean;
  onClose: () => void;
  collectedFeeGpBalance?: number;
  treasury?: CompanyTreasury | null;
  language: Language;
  onConvert: (gpAmount: number, destination: 'TREASURY' | 'ADMIN_WALLET') => void;
}

export const ConvertFeeGpModal: React.FC<ConvertFeeGpModalProps> = ({
  isOpen,
  onClose,
  collectedFeeGpBalance,
  treasury,
  language,
  onConvert,
}) => {
  const isHi = language === 'hi';
  const effectiveFeeGpBalance = collectedFeeGpBalance ?? (treasury?.collectedFeeGpBalance || 0);
  const [gpAmountInput, setGpAmountInput] = useState<string>('');
  const [destination, setDestination] = useState<'TREASURY' | 'ADMIN_WALLET'>('TREASURY');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const numGp = parseFloat(gpAmountInput) || 0;
  const rupeeEquivalent = numGp * 1.0; // 1 GP = ₹1.00

  const handleMaxClick = () => {
    setGpAmountInput(effectiveFeeGpBalance.toString());
    setErrorMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (numGp <= 0) {
      setErrorMsg(isHi ? 'कृपया 0 से अधिक GP राशि दर्ज करें।' : 'Please enter a valid GP amount greater than zero.');
      return;
    }

    if (numGp > effectiveFeeGpBalance) {
      setErrorMsg(
        isHi
          ? `दर्ज GP (${numGp} GP) आपके उपलब्ध फीस GP रिज़र्व (${effectiveFeeGpBalance.toFixed(2)} GP) से अधिक है।`
          : `Entered GP (${numGp} GP) exceeds available collected Fee GP reserve (${effectiveFeeGpBalance.toFixed(2)} GP).`
      );
      return;
    }

    onConvert(numGp, destination);
    setGpAmountInput('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden">
        {/* Top Decorative Banner */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-500" />

        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                {isHi ? 'ट्रांजेक्शन चार्ज GP → रुपये कनवर्टर' : 'Convert Fee GP to Rupees'}
              </h3>
              <p className="text-xs text-slate-400">
                {isHi ? 'इकट्ठा हुए ट्रांजेक्शन चार्ज GP को रुपये में बदलें' : 'Convert collected fee GP into usable Rupees'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Balance Info Card */}
        <div className="my-4 p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-950 to-emerald-950/40 border border-amber-500/30 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400/90 block">
              {isHi ? 'उपलब्ध एडमिन ट्रांजेक्शन चार्ज GP' : 'Available Admin Fee GP'}
            </span>
            <span className="text-2xl font-black font-mono text-amber-300">
              {effectiveFeeGpBalance.toFixed(2)}{' '}
              <span className="text-xs font-semibold text-slate-400">GP</span>
            </span>
          </div>

          <button
            type="button"
            onClick={handleMaxClick}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md active:scale-95 cursor-pointer"
          >
            {isHi ? 'पूरा कनवर्ट करें (Max)' : 'Convert Max'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* GP Amount Input */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              {isHi ? 'कनवर्ट करने के लिए GP दर्ज करें:' : 'Enter GP Amount to Convert:'}
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={effectiveFeeGpBalance}
                value={gpAmountInput}
                onChange={(e) => {
                  setGpAmountInput(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder="0.00"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-mono text-lg focus:outline-none focus:border-amber-500 transition-all pr-16"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">
                GP
              </span>
            </div>
          </div>

          {/* Conversion Rate Output Preview */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span>{isHi ? 'कन्वर्ट रेट (1 GP):' : 'Conversion Rate (1 GP):'}</span>
              <span className="font-mono text-emerald-400 font-bold">₹1.00 INR</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-900 font-bold">
              <span className="text-slate-300">{isHi ? 'प्राप्त होने वाले रुपये (INR):' : 'Rupees to receive:'}</span>
              <span className="text-base font-mono text-emerald-400">
                {formatINR(rupeeEquivalent)}
              </span>
            </div>
          </div>

          {/* Destination Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">
              {isHi ? 'रुपये किस वॉलेट में जोड़ना चाहते हैं?' : 'Select Destination for Crediting Rupees:'}
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setDestination('TREASURY')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  destination === 'TREASURY'
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-950/40'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Building2 className="w-5 h-5 text-emerald-400" />
                <span className="text-center font-bold">
                  {isHi ? 'कंपनी मुख्य रिज़र्व' : 'Company Treasury'}
                </span>
                <span className="text-[10px] text-slate-400 font-normal">
                  ({isHi ? 'मुख्य बैलेंस' : 'Main Reserve'})
                </span>
              </button>

              <button
                type="button"
                onClick={() => setDestination('ADMIN_WALLET')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  destination === 'ADMIN_WALLET'
                    ? 'bg-amber-950/60 border-amber-500 text-amber-300 shadow-md shadow-amber-950/40'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Wallet className="w-5 h-5 text-amber-400" />
                <span className="text-center font-bold">
                  {isHi ? 'एडमिन पर्सनल वॉलेट' : 'Admin Cash Wallet'}
                </span>
                <span className="text-[10px] text-slate-400 font-normal">
                  ({isHi ? 'कैश बैलेंस' : 'Personal Wallet'})
                </span>
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
            >
              {isHi ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={numGp <= 0 || numGp > collectedFeeGpBalance}
              className="flex-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-amber-600 hover:from-emerald-500 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-black text-xs transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-slate-950 fill-slate-950" />
              <span>
                {isHi
                  ? `₹${rupeeEquivalent.toLocaleString('en-IN')} रुपये वॉलेट में जोड़ें`
                  : `Add ₹${rupeeEquivalent.toLocaleString('en-IN')} to Wallet`}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
