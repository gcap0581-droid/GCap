import React from 'react';
import { Sparkles, CheckCircle2, Clock, ArrowRight, PartyPopper } from 'lucide-react';
import { ActiveInvestment, Language } from '../types';
import { formatINR } from '../utils/storage';

interface LockCongratulationsModalProps {
  investment: ActiveInvestment | null;
  language: Language;
  onClose: () => void;
  onViewInvestments: () => void;
}

export const LockCongratulationsModal: React.FC<LockCongratulationsModalProps> = ({
  investment,
  language,
  onClose,
  onViewInvestments,
}) => {
  if (!investment) return null;

  const isHi = language === 'hi';
  const cycleReturn = investment.cycleReturnAmount || (investment.dailyReturnAmount / 4);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-950/60 overflow-hidden text-center">
        {/* Glow ambient decoration */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Celebration Icon */}
        <div className="relative mx-auto w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/30 mb-5">
          <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-emerald-400">
            <PartyPopper className="w-10 h-10 animate-bounce text-emerald-400" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
          </span>
        </div>

        {/* Header Title */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold tracking-wide uppercase mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isHi ? '24 घंटे लॉक पूर्ण' : '24h Lock Completed'}</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
          {isHi ? '🎉 बधाई हो! एक्टिवेशन लॉक समाप्त!' : '🎉 Congratulations! Lock Completed!'}
        </h2>

        <p className="text-sm text-slate-300 max-w-md mx-auto mb-6 leading-relaxed">
          {isHi ? (
            <>
              आपके <span className="text-white font-bold">{investment.planName}</span> ({formatINR(investment.investedAmount)}) का प्रारंभिक 24 घंटे का लॉक समाप्त हो गया है।
              अब आपकी <span className="text-emerald-400 font-bold">6 घंटे की अर्निंग साइकिल</span> शुरू हो चुकी है!
            </>
          ) : (
            <>
              Your <span className="text-white font-bold">{investment.planName}</span> ({formatINR(investment.investedAmount)}) has finished its initial 24-hour lock period.
              Your <span className="text-emerald-400 font-bold">6-hour automated earning cycle</span> is now live!
            </>
          )}
        </p>

        {/* What happens next box */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-left space-y-3 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">
                {isHi ? 'हर 6 घंटे में ऑटो-क्रेडिट (Auto Payout)' : 'Automatic Credit Every 6 Hours'}
              </span>
              <span className="text-xs text-slate-400 leading-snug block">
                {isHi
                  ? `हर 6 घंटे पूरे होने पर +${formatINR(cycleReturn)} सीधे आपकी "Total Earning" में जुड़ेंगे।`
                  : `+${formatINR(cycleReturn)} will automatically credit directly into your "Total Earning" every 6 hours.`}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">
                {isHi ? 'निरंतर 6-घंटे का चक्र (Continuous Cycles)' : 'Continuous 6-Hour Decreasing Timer'}
              </span>
              <span className="text-xs text-slate-400 leading-snug block">
                {isHi
                  ? 'एक चक्र समाप्त होते ही अगला 6 घंटे का टाइमर स्वतः पुनः चालू हो जाएगा।'
                  : 'As soon as 6 hours elapse, earnings are added and the 6-hour countdown restarts immediately.'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            id="btn-congrats-view"
            onClick={() => {
              onClose();
              onViewInvestments();
            }}
            className="w-full sm:flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/50 transition-all"
          >
            <span>{isHi ? 'अर्निंग साइकिल देखें' : 'View Earning Cycle'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            id="btn-congrats-dismiss"
            onClick={onClose}
            className="w-full sm:w-auto py-3 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm cursor-pointer border border-slate-700 transition-all"
          >
            {isHi ? 'ठीक है (Got It)' : 'Dismiss'}
          </button>
        </div>
      </div>
    </div>
  );
};
