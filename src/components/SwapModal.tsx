import React, { useState } from 'react';
import {
  X,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Coins,
  TrendingUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Language, Wallet, AppRules } from '../types';
import { formatINR } from '../utils/storage';

interface SwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: Wallet;
  language: Language;
  rules?: AppRules;
  onSwapSuccess: (cashAmount: number, gpEarned: number) => void;
}

export const SwapModal: React.FC<SwapModalProps> = ({
  isOpen,
  onClose,
  wallet,
  language,
  rules,
  onSwapSuccess,
}) => {
  const isHi = language === 'hi';
  const gpRate = rules?.gpRatePerRupee && rules.gpRatePerRupee > 0 ? rules.gpRatePerRupee : 1.0;
  const [amount, setAmount] = useState<number>(Math.min(wallet.cashBalance, 1000));
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const quickAmounts = [500, 1000, 2000, 5000, 10000].filter((a) => a <= wallet.cashBalance);

  // Exact GP received based on current admin-configured GP rate
  const calculatedGp = Math.round((amount || 0) * gpRate * 100) / 100;
  const remainingCash = Math.max(0, wallet.cashBalance - (amount || 0));
  const newGpBalance = (wallet.gpBalance || 0) + calculatedGp;

  const handleSwap = () => {
    setError('');
    if (amount <= 0) {
      setError(isHi ? 'कृपया मान्य स्वैप राशि दर्ज करें।' : 'Please enter a valid swap amount.');
      return;
    }
    if (amount > wallet.cashBalance) {
      setError(
        isHi
          ? `अपर्याप्त कैश बैलेंस। आपके पास केवल ${formatINR(wallet.cashBalance)} उपलब्ध है।`
          : `Insufficient cash balance. You have ${formatINR(wallet.cashBalance)} available.`
      );
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
      });
      onSwapSuccess(amount, calculatedGp);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isHi ? 'कैश को GP में स्वैप करें' : 'Swap Cash to G-Points (GP)'}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  ₹1 = {gpRate} GP
                </span>
                <span className="text-[10px] text-slate-400">
                  (0% Fee • Instant)
                </span>
              </div>
            </div>
          </div>

          <button
            id="btn-close-swap"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Live Official Exchange Rate Card */}
          <div className="p-3.5 bg-gradient-to-r from-amber-500/15 via-slate-950 to-emerald-500/15 border border-amber-500/30 rounded-xl flex items-center justify-between gap-3 shadow-md shadow-amber-950/20">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/40 shrink-0">
                <Coins className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300 block">
                  {isHi ? 'आधिकारिक लाइव GP एक्सचेंज रेट' : 'Official Live GP Exchange Rate'}
                </span>
                <div className="text-sm font-black font-mono text-white flex items-center gap-1.5">
                  <span>1 INR (₹1)</span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-amber-400">{gpRate} GP</span>
                </div>
              </div>
            </div>

            <span className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {isHi ? 'लाइव दर' : 'Active Rate'}
            </span>
          </div>

          {/* Current Balance Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block font-medium">
                {isHi ? 'उपलब्ध कैश बैलेंस' : 'Current Cash Balance'}
              </span>
              <span className="text-lg font-bold font-mono text-white mt-1 block">
                {formatINR(wallet.cashBalance)}
              </span>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block font-medium">
                {isHi ? 'वर्तमान GP बैलेंस' : 'Current GP Balance'}
              </span>
              <span className="text-lg font-bold font-mono text-amber-400 mt-1 block flex items-center gap-1">
                <Coins className="w-4 h-4 text-amber-400" />
                {(wallet.gpBalance || 0).toLocaleString('en-IN')} GP
              </span>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-300">
                {isHi ? 'स्वैप की जाने वाली राशि (₹)' : 'Amount to Swap (₹)'}
              </label>
              <button
                type="button"
                onClick={() => setAmount(wallet.cashBalance)}
                className="text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
              >
                {isHi ? 'अधिकतम (Max)' : 'Max Balance'}
              </button>
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">
                ₹
              </span>
              <input
                type="number"
                min={1}
                max={wallet.cashBalance}
                value={amount || ''}
                onChange={(e) => {
                  setAmount(Number(e.target.value));
                  setError('');
                }}
                placeholder={isHi ? 'राशि दर्ज करें' : 'Enter amount'}
                className="w-full pl-8 pr-4 py-3 bg-slate-950 border border-slate-700/80 rounded-xl text-white font-mono font-bold text-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Quick Amount Chips */}
            {quickAmounts.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {quickAmounts.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => {
                      setAmount(q);
                      setError('');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                      amount === q
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    ₹{q.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Visual Swap Breakdown with Live Rate Multiplier */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span>{isHi ? 'कैश से कटेगा:' : 'Deducted from Cash:'}</span>
              <span className="font-mono font-bold text-rose-400">-{formatINR(amount || 0)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <div className="flex items-center gap-1.5">
                <span>{isHi ? 'GP प्राप्त होगा:' : 'GP Credited:'}</span>
                <span className="text-[10px] text-amber-400/80 font-mono">(@ ₹1={gpRate} GP)</span>
              </div>
              <span className="font-mono font-bold text-amber-400">+{calculatedGp.toLocaleString('en-IN')} GP</span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between font-semibold">
              <span className="text-slate-400">{isHi ? 'शेष कैश बैलेंस रहेगा:' : 'Remaining Cash Balance:'}</span>
              <span className="font-mono text-white">{formatINR(remainingCash)}</span>
            </div>
            <div className="flex items-center justify-between font-semibold">
              <span className="text-slate-400">{isHi ? 'नया कुल GP बैलेंस:' : 'New Total GP Balance:'}</span>
              <span className="font-mono text-emerald-400">{newGpBalance.toLocaleString('en-IN')} GP</span>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Swap Button */}
          <button
            type="button"
            onClick={handleSwap}
            disabled={isProcessing || amount <= 0 || amount > wallet.cashBalance}
            className="w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>
                  {isHi
                    ? `🔄 ${calculatedGp.toLocaleString('en-IN')} GP में स्वैप करें`
                    : `Swap to ${calculatedGp.toLocaleString('en-IN')} GP`}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

