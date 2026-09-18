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
  wallet?: Wallet | null;
  language: Language;
  rules?: AppRules;
  onSwapSuccess: (cashAmount: number, gpEarned: number, direction?: 'CASH_TO_GP' | 'GP_TO_CASH') => void;
}

export const SwapModal: React.FC<SwapModalProps> = ({
  isOpen,
  onClose,
  wallet: rawWallet,
  language,
  rules,
  onSwapSuccess,
}) => {
  const wallet: Wallet = rawWallet || {
    cashBalance: 0,
    gpBalance: 0,
    totalInvested: 0,
    totalEarned: 0,
    royaltyEarned: 0,
    pendingWithdrawals: 0,
    pendingDeposits: 0,
  };
  const isHi = language === 'hi';
  const gpRate = rules?.gpRatePerRupee && rules.gpRatePerRupee > 0 ? rules.gpRatePerRupee : 1.0;
  
  // Dual Swap Direction Mode State
  const [direction, setDirection] = useState<'CASH_TO_GP' | 'GP_TO_CASH'>('CASH_TO_GP');
  
  const maxAvailable = direction === 'CASH_TO_GP' ? wallet.cashBalance : (wallet.gpBalance || 0);
  
  const [amount, setAmount] = useState<number>(Math.min(maxAvailable, 1000));
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  React.useEffect(() => {
    // Reset amount when direction or wallet changes
    const maxVal = direction === 'CASH_TO_GP' ? wallet.cashBalance : (wallet.gpBalance || 0);
    setAmount(Math.min(maxVal, 1000));
    setError('');
  }, [direction, wallet.cashBalance, wallet.gpBalance, isOpen]);

  if (!isOpen) return null;

  const quickAmounts = direction === 'CASH_TO_GP' 
    ? [500, 1000, 2000, 5000, 10000].filter((a) => a <= wallet.cashBalance)
    : [500, 1000, 5000, 10000, 50000].filter((a) => a <= (wallet.gpBalance || 0));

  // Exact calculations based on direction
  const calculatedOutput = direction === 'CASH_TO_GP'
    ? Math.round((amount || 0) * gpRate * 100) / 100 // Cash to GP
    : Math.round((amount || 0) * gpRate * 100) / 100; // GP to Cash (1 GP = gpRate Rupees)

  const remainingInput = Math.max(0, maxAvailable - (amount || 0));
  
  const newCashBalance = direction === 'CASH_TO_GP'
    ? Math.max(0, wallet.cashBalance - (amount || 0))
    : wallet.cashBalance + calculatedOutput;

  const newGpBalance = direction === 'CASH_TO_GP'
    ? (wallet.gpBalance || 0) + calculatedOutput
    : Math.max(0, (wallet.gpBalance || 0) - (amount || 0));

  const handleSwap = () => {
    setError('');
    if (amount <= 0) {
      setError(isHi ? 'कृपया मान्य स्वैप राशि दर्ज करें।' : 'Please enter a valid swap amount.');
      return;
    }
    if (amount > maxAvailable) {
      setError(
        isHi
          ? `अपर्याप्त बैलेंस। आपके पास केवल ${direction === 'CASH_TO_GP' ? formatINR(maxAvailable) : maxAvailable.toLocaleString() + ' GP'} उपलब्ध है।`
          : `Insufficient balance. You only have ${direction === 'CASH_TO_GP' ? formatINR(maxAvailable) : maxAvailable.toLocaleString() + ' GP'} available.`
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
      
      // If GP to Cash: swapAmount is the calculated Rupees output, and gpAmount is the entered GP input.
      // If Cash to GP: swapAmount is the entered Rupees input, and gpAmount is the calculated GP output.
      if (direction === 'GP_TO_CASH') {
        onSwapSuccess(calculatedOutput, amount, 'GP_TO_CASH');
      } else {
        onSwapSuccess(amount, calculatedOutput, 'CASH_TO_GP');
      }
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
                {isHi ? 'एक्सचेंज / कन्वर्ट केंद्र (GP Swap)' : 'GP Exchange Center'}
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

        {/* Direction Switch Tabs */}
        <div className="grid grid-cols-2 bg-slate-950 p-1 border-b border-slate-800/80">
          <button
            type="button"
            onClick={() => setDirection('CASH_TO_GP')}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              direction === 'CASH_TO_GP'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isHi ? '₹ से GP बनाएं (Buy GP)' : 'Rupees to GP (Buy GP)'}
          </button>
          <button
            type="button"
            onClick={() => setDirection('GP_TO_CASH')}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              direction === 'GP_TO_CASH'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isHi ? 'GP से ₹ बनाएं (Sell GP)' : 'GP to Rupees (Sell)'}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Live Exchange Rate Info Card */}
          <div className="p-3.5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 shrink-0">
                <Coins className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300 block">
                  {isHi ? 'आधिकारिक एक्सचेंज दर (Conversion Rate)' : 'Official Conversion Rate'}
                </span>
                <div className="text-sm font-black font-mono text-white flex items-center gap-1.5">
                  {direction === 'CASH_TO_GP' ? (
                    <>
                      <span>1 INR (₹1)</span>
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">{gpRate} GP</span>
                    </>
                  ) : (
                    <>
                      <span>1 GP</span>
                      <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-amber-400">₹{gpRate} Rupees</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <span className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 shrink-0 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {isHi ? 'लाइव' : 'Live'}
            </span>
          </div>

          {/* Balance overview */}
          <div className="grid grid-cols-2 gap-3">
            <div className={`p-3 bg-slate-950/60 rounded-xl border ${direction === 'CASH_TO_GP' ? 'border-emerald-500/30' : 'border-slate-800'}`}>
              <span className="text-[11px] text-slate-400 block font-medium">
                {isHi ? 'वॉलेट कैश बैलेंस (Rupees)' : 'Cash Balance'}
              </span>
              <span className="text-lg font-bold font-mono text-white mt-1 block">
                {formatINR(wallet.cashBalance)}
              </span>
            </div>
            <div className={`p-3 bg-slate-950/60 rounded-xl border ${direction === 'GP_TO_CASH' ? 'border-amber-500/30' : 'border-slate-800'}`}>
              <span className="text-[11px] text-slate-400 block font-medium">
                {isHi ? 'उपलब्ध GP बैलेंस' : 'G-Points Balance'}
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
                {direction === 'CASH_TO_GP' 
                  ? (isHi ? 'बदले जाने वाले रुपए (₹)' : 'Convert Rupees (₹)')
                  : (isHi ? 'बेचे जाने वाले G-Points (GP)' : 'Sell G-Points (GP)')
                }
              </label>
              <button
                type="button"
                onClick={() => setAmount(maxAvailable)}
                className="text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
              >
                {isHi ? 'अधिकतम (Max)' : 'Max Balance'}
              </button>
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">
                {direction === 'CASH_TO_GP' ? '₹' : 'GP'}
              </span>
              <input
                type="number"
                min={1}
                max={maxAvailable}
                value={amount || ''}
                onChange={(e) => {
                  setAmount(Number(e.target.value));
                  setError('');
                }}
                placeholder={isHi ? 'संख्या दर्ज करें' : 'Enter value'}
                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700/80 rounded-xl text-white font-mono font-bold text-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Quick Chips */}
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
                        ? (direction === 'CASH_TO_GP' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-amber-500 text-slate-950 font-bold')
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {direction === 'CASH_TO_GP' ? `₹${q.toLocaleString('en-IN')}` : `${q.toLocaleString('en-IN')} GP`}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Swap Breakdown */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span>{direction === 'CASH_TO_GP' ? (isHi ? 'वॉलेट कैश से कटेगा:' : 'Deduct Cash:') : (isHi ? 'बेचे जाने वाले GP:' : 'Sell GP:')}</span>
              <span className="font-mono font-bold text-rose-400">
                {direction === 'CASH_TO_GP' ? `-${formatINR(amount || 0)}` : `-${(amount || 0).toLocaleString()} GP`}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <div className="flex items-center gap-1.5">
                <span>{direction === 'CASH_TO_GP' ? (isHi ? 'GP प्राप्त होगा:' : 'Receive GP:') : (isHi ? 'रुपए प्राप्त होंगे:' : 'Receive Cash:')}</span>
                <span className="text-[10px] text-amber-400/80 font-mono">(@ {direction === 'CASH_TO_GP' ? `₹1 = ${gpRate} GP` : `1 GP = ₹${gpRate}`})</span>
              </div>
              <span className="font-mono font-bold text-emerald-400">
                {direction === 'CASH_TO_GP' ? `+${calculatedOutput.toLocaleString()} GP` : `+${formatINR(calculatedOutput)}`}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between font-semibold">
              <span className="text-slate-400">{isHi ? 'बचा हुआ मूल बैलेंस:' : 'Remaining Input Balance:'}</span>
              <span className="font-mono text-white">
                {direction === 'CASH_TO_GP' ? formatINR(remainingInput) : `${remainingInput.toLocaleString()} GP`}
              </span>
            </div>
            <div className="flex items-center justify-between font-semibold">
              <span className="text-slate-400">{isHi ? 'नया वॉलेट कैश बैलेंस:' : 'New Wallet Cash:'}</span>
              <span className="font-mono text-emerald-400">{formatINR(newCashBalance)}</span>
            </div>
            <div className="flex items-center justify-between font-semibold">
              <span className="text-slate-400">{isHi ? 'नया कुल GP बैलेंस:' : 'New GP Balance:'}</span>
              <span className="font-mono text-amber-400">{newGpBalance.toLocaleString()} GP</span>
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
            disabled={isProcessing || amount <= 0 || amount > maxAvailable}
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 shadow-lg ${
              direction === 'CASH_TO_GP'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 shadow-emerald-500/20'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 shadow-amber-500/20'
            }`}
          >
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>
                  {direction === 'CASH_TO_GP'
                    ? (isHi ? `🔄 ${calculatedOutput.toLocaleString()} GP प्राप्त करें` : `Convert to ${calculatedOutput.toLocaleString()} GP`)
                    : (isHi ? `🔄 ${formatINR(calculatedOutput)} प्राप्त करें` : `Convert to ${formatINR(calculatedOutput)}`)
                  }
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
