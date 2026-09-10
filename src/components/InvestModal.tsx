import React, { useState, useEffect } from 'react';
import {
  X,
  TrendingUp,
  CheckCircle2,
  Calendar,
  AlertCircle,
  PlusCircle,
  ShieldCheck,
  Zap,
  Building2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { InvestmentPlan, Language, Wallet } from '../types';
import { formatINR } from '../utils/storage';

interface InvestModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: InvestmentPlan | null;
  wallet: Wallet;
  companyBalance?: number;
  language: Language;
  onInvestSuccess: (plan: InvestmentPlan, amount: number, autoSwappedCash?: number) => void;
  onOpenDeposit: () => void;
  onOpenSwap?: () => void;
  initialAmount?: number;
}

export const InvestModal: React.FC<InvestModalProps> = ({
  isOpen,
  onClose,
  plan,
  wallet,
  companyBalance,
  language,
  onInvestSuccess,
  onOpenDeposit,
  onOpenSwap,
  initialAmount,
}) => {
  const isHi = language === 'hi';
  const [amount, setAmount] = useState<number>(5000);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (plan) {
      if (initialAmount && initialAmount >= plan.minAmount && initialAmount <= plan.maxAmount) {
        setAmount(initialAmount);
      } else {
        setAmount(plan.minAmount);
      }
    }
  }, [plan, initialAmount, isOpen]);

  if (!isOpen || !plan) return null;

  const dailyReturn = (amount * plan.dailyRoiPercent) / 100;
  const totalProfit = dailyReturn * plan.durationDays;
  const totalPayout = amount + totalProfit;

  const userGp = wallet.gpBalance || 0;
  const userCash = wallet.cashBalance || 0;
  const hasSufficientGp = userGp >= amount;
  const gpShortfall = Math.max(0, amount - userGp);
  const canAutoSwap = !hasSufficientGp && userCash >= gpShortfall;
  const totalShortfall = Math.max(0, amount - (userGp + userCash));
  const hasSufficientTreasury = companyBalance === undefined || companyBalance >= amount;

  const handleConfirmInvestment = (shouldAutoSwap: boolean = false) => {
    setError('');
    if (amount < plan.minAmount) {
      setError(
        isHi
          ? `इस योजना के लिए न्यूनतम निवेश ${formatINR(plan.minAmount)} है।`
          : `Minimum investment for this plan is ${formatINR(plan.minAmount)}.`
      );
      return;
    }
    if (amount > plan.maxAmount) {
      setError(
        isHi
          ? `अधिकतम स्वीकार्य निवेश ${formatINR(plan.maxAmount)} है।`
          : `Maximum allowed investment is ${formatINR(plan.maxAmount)}.`
      );
      return;
    }

    if (!hasSufficientGp && !shouldAutoSwap) {
      setError(
        isHi
          ? `अपर्याप्त GP बैलेंस। आपके पास ${userGp} GP है। योजना के लिए ${amount} GP चाहिए।`
          : `Insufficient GP balance. You have ${userGp} GP. Required: ${amount} GP.`
      );
      return;
    }

    if (shouldAutoSwap && userCash < gpShortfall) {
      setError(
        isHi
          ? `कैश बैलेंस भी अपर्याप्त है। कृपया पहले ₹${totalShortfall} कंपनी खाते में जमा करें।`
          : `Insufficient cash balance to swap. Please deposit ₹${totalShortfall} first.`
      );
      return;
    }

    if (companyBalance !== undefined && companyBalance < amount) {
      setError(
        isHi
          ? `वर्तमान में इस स्लॉट के लिए दैनिक लिक्विडिटी सीमा पूरी हो चुकी है। कृपया थोड़ी देर बाद पुनः प्रयास करें या कम राशि चुनें।`
          : `Plan allocation capacity currently filled for this window. Please try a different amount or retry shortly.`
      );
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
      });

      onInvestSuccess(plan, amount, shouldAutoSwap ? gpShortfall : 0);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isHi ? 'योजना में निवेश करें' : 'Confirm Plan Allocation'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isHi ? plan.nameHi : plan.name}
              </p>
            </div>
          </div>

          <button
            id="btn-close-invest"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {/* Plan Highlights */}
          <div className="bg-gradient-to-r from-emerald-950/40 via-slate-950 to-slate-950 p-4 rounded-xl border border-emerald-500/30 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-emerald-400 font-semibold block uppercase tracking-wider">
                {isHi ? 'दैनिक रिटर्न दर' : 'Daily ROI Rate'}
              </span>
              <span className="text-2xl font-extrabold text-white font-mono">
                {plan.dailyRoiPercent}% <span className="text-xs text-slate-400 font-normal">/दिन</span>
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 font-medium block">
                {isHi ? 'अवधि' : 'Duration'}
              </span>
              <span className="text-base font-bold text-slate-200 font-mono">
                {plan.durationDays} {isHi ? 'दिन' : 'Days'}
              </span>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                {isHi ? 'निवेश राशि चुनें:' : 'Select Investment Capital:'}
              </label>
              <div className="text-xs text-slate-400 font-mono">
                {isHi ? 'सीमा:' : 'Limits:'} {formatINR(plan.minAmount)} - {formatINR(plan.maxAmount)}
              </div>
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-lg font-bold text-emerald-400">
                ₹
              </span>
              <input
                id="input-invest-modal-amount"
                type="number"
                min={plan.minAmount}
                max={plan.maxAmount}
                step={500}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-9 pr-4 text-white font-mono text-xl font-bold focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-2 mt-3">
              {Array.from(new Set([plan.minAmount, 50000, 75000, 100000, 200000, 500000, 1000000])).map((preset) => {
                if (preset < plan.minAmount || preset > plan.maxAmount) return null;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                      amount === preset
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {formatINR(preset)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Return Breakdown Calculations */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>{isHi ? 'दैनिक रिटर्न (हर 24 घंटे):' : 'Daily Return Credited:'}</span>
              <span className="font-mono font-bold text-emerald-400">
                +{formatINR(dailyReturn)} / दिन
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>{isHi ? 'कुल शुद्ध मुनाफ़ा:' : 'Total Net Profit:'}</span>
              <span className="font-mono font-bold text-amber-400">
                +{formatINR(totalProfit)}
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>{isHi ? 'मूलधन वापसी:' : 'Principal Return:'}</span>
              <span className="font-mono text-slate-200">
                100% {isHi ? 'अवधि समाप्ति पर' : 'At Maturity'}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-white text-sm">
              <span>{isHi ? 'कुल परिपक्वता राशि:' : 'Total Maturity Payout:'}</span>
              <span className="font-mono text-emerald-400">
                {formatINR(totalPayout)}
              </span>
            </div>
          </div>

          {/* GP & Cash Balance Checker (Rule 3 & 4) */}
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/80 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">
                {isHi ? 'आपका उपलब्ध GP बैलेंस:' : 'Your GP Balance:'}
              </span>
              <span className="font-mono font-bold text-amber-400 text-sm">
                {userGp.toLocaleString('en-IN')} GP
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">
                {isHi ? 'वॉलेट कैश बैलेंस (स्वैप योग्य):' : 'Cash Balance (Available for Swap):'}
              </span>
              <span className="font-mono font-bold text-white text-sm">
                {formatINR(userCash)}
              </span>
            </div>

            {!hasSufficientGp && canAutoSwap && (
              <div className="pt-2 border-t border-slate-800 text-[11px] text-amber-300 flex items-center justify-between">
                <span>
                  {isHi
                    ? `⚠️ ${gpShortfall} GP की कमी है। आप कैश से स्वैप कर सकते हैं।`
                    : `⚠️ Need ${gpShortfall} more GP. Auto-swap available from cash.`}
                </span>
                {onOpenSwap && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenSwap();
                    }}
                    className="text-emerald-400 hover:text-emerald-300 underline font-semibold ml-2 cursor-pointer"
                  >
                    {isHi ? 'स्वैप विंडो खोलें' : 'Open Swap'}
                  </button>
                )}
              </div>
            )}

            {!hasSufficientGp && !canAutoSwap && (
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-rose-300">
                <span>
                  {isHi
                    ? `अपर्याप्त फंड। कुल कमी: ₹${totalShortfall}`
                    : `Insufficient funds. Total shortfall: ₹${totalShortfall}`}
                </span>
                <button
                  type="button"
                  id="btn-invest-quick-deposit"
                  onClick={() => {
                    onClose();
                    onOpenDeposit();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-sm"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>{isHi ? '+ पैसे जोड़ें' : '+ Deposit'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Investment Protection Assurance Notice */}
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-slate-400 text-[11px] font-medium">
                  {isHi ? 'मूलधन सुरक्षा स्थिति:' : 'Capital Protection Status:'}
                </span>
                <span className="font-bold text-emerald-400 text-xs">
                  {isHi ? '100% बीमित एवं सुरक्षित' : '100% Insured & Secured'}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                <Zap className="w-3 h-3" />
                {isHi ? 'स्वचालित 6h रिटर्न' : 'Auto 6h Returns'}
              </span>
              <span className="block text-[10px] text-slate-400 mt-0.5">
                {isHi ? 'आधिकारिक अनुबंध' : 'Official Smart Contract'}
              </span>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {isHi
                ? 'नियम 3 व 4: प्लान केवल GP से एक्टिव होते हैं। दैनिक रिटर्न हर 24 घंटे में क्रेडिट होता है।'
                : 'Rules 3 & 4: Plans activate via GP. Daily returns credit every 24 hours automatically.'}
            </span>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              {isHi ? 'प्लान मूल्य (GP):' : 'Plan Cost (GP):'}
            </span>
            <span className="text-lg font-mono font-bold text-amber-400 flex items-center gap-1">
              <span>{amount.toLocaleString('en-IN')}</span>
              <span className="text-xs text-slate-400">GP (₹{amount.toLocaleString('en-IN')})</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-cancel-invest"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              {isHi ? 'रद्द करें' : 'Cancel'}
            </button>

            {hasSufficientGp ? (
              <button
                type="button"
                id="btn-confirm-invest-gp"
                onClick={() => handleConfirmInvestment(false)}
                disabled={
                  amount < plan.minAmount ||
                  amount > plan.maxAmount ||
                  !hasSufficientTreasury ||
                  isProcessing
                }
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold shadow-md shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {isProcessing ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                    <span>{isHi ? 'सक्रिय हो रहा है...' : 'Activating...'}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isHi ? '⭐ GP से प्लान लें' : 'Activate with GP'}</span>
                  </>
                )}
              </button>
            ) : canAutoSwap ? (
              <button
                type="button"
                id="btn-confirm-autoswap-invest"
                onClick={() => handleConfirmInvestment(true)}
                disabled={!hasSufficientTreasury || isProcessing}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-extrabold shadow-md shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {isProcessing ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                    <span>{isHi ? 'स्वैप व एक्टिवेशन...' : 'Swapping & Activating...'}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isHi ? '🔄 स्वैप करें व प्लान खरीदें' : 'Swap & Invest'}</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                id="btn-deposit-fallback"
                onClick={() => {
                  onClose();
                  onOpenDeposit();
                }}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-700/20 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{isHi ? 'पैसे जोड़ें (Deposit)' : 'Add Funds'}</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
