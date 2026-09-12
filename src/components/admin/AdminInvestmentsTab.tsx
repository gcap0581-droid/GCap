import React, { useState, useEffect } from 'react';
import { Clock, TrendingUp, Zap, Lock, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { ActiveInvestment, Language } from '../../types';
import { formatINR } from '../../utils/storage';
import { formatFixedSlotTime } from '../../utils/cycleTiming';

interface AdminInvestmentsTabProps {
  investments: ActiveInvestment[];
  language: Language;
  onSimulateComplete24hLock?: (investmentId: string) => void;
  onSimulateComplete6hCycle?: (investmentId: string) => void;
  onSimulateMaturity641Days?: (investmentId: string) => void;
}

function formatCountdown(ms: number) {
  if (ms <= 0) return '00:00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export const AdminInvestmentsTab: React.FC<AdminInvestmentsTabProps> = ({
  investments,
  language,
  onSimulateComplete24hLock,
  onSimulateComplete6hCycle,
  onSimulateMaturity641Days,
}) => {
  const isHi = language === 'hi';
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const totalInvested = investments.reduce((sum, i) => sum + i.investedAmount, 0);
  const totalAccrued = investments.reduce((sum, i) => sum + (i.earnedSoFar || 0), 0);
  const inLockCount = investments.filter(i => !i.isInitialLockCompleted && now < (i.lockedUntilTimestamp || 0)).length;
  const inCycleCount = investments.length - inLockCount;

  return (
    <div className="space-y-6">
      {/* Metrics Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 block mb-1">
            {isHi ? 'कुल सक्रिय पोर्टफोलियो' : 'Total Active Portfolios'}
          </span>
          <span className="text-xl font-mono font-black text-white">
            {investments.length}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 block mb-1">
            {isHi ? 'कुल निवेशित राशि' : 'Total Invested Capital'}
          </span>
          <span className="text-xl font-mono font-black text-emerald-400">
            {formatINR(totalInvested)}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-amber-400 block mb-1">
            {isHi ? '24h लॉक में' : 'In 24h Lock Phase'}
          </span>
          <span className="text-xl font-mono font-black text-amber-300">
            {inLockCount} {isHi ? 'पोर्टफोलियो' : 'Plans'}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-teal-400 block mb-1">
            {isHi ? '6h चक्र में सक्रिय' : 'In 6h Cycle Phase'}
          </span>
          <span className="text-xl font-mono font-black text-teal-300">
            {inCycleCount} {isHi ? 'पोर्टफोलियो' : 'Plans'}
          </span>
        </div>
      </div>

      {/* Rules Notice */}
      <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div className="text-xs space-y-1">
          <div className="font-bold text-white">
            {isHi ? 'व्यवस्थापक 24h लॉक एवं 6h अर्निंग चक्र ऑडिट' : 'Admin 24h Lock & 6h Earning Cycle Auditor'}
          </div>
          <p className="text-slate-300 leading-relaxed">
            {isHi
              ? 'प्रत्येक निवेश में पहले 24 घंटे का अनिवार्य लॉक टाइमर चलता है। लॉक समाप्त होते ही यूज़र को बधाई संदेश प्रदर्शित होता है और 6 घंटे का चक्र शुरू होता है। हर 6 घंटे में रिटर्न स्वतः Total Earning में क्रेडिट होता है और टाइमर रीस्टार्ट होता है।'
              : 'Every portfolio runs a mandatory 24h activation lock. Upon completion, a congratulations modal is shown and the 6h cycle starts. Returns credit automatically to Total Earning every 6 hours and the clock resets.'}
          </p>
        </div>
      </div>

      {/* Investments List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">
              {isHi ? 'पोर्टफोलियो रिकॉर्ड एवं लाइव क्लॉक्स' : 'Portfolios Record & Live Decreasing Clocks'}
            </h3>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400">
            {isHi ? 'लाइव सिंक' : 'Live Sync'} (1s ticker)
          </span>
        </div>

        {investments.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            {isHi ? 'वर्तमान में कोई सक्रिय निवेश नहीं है।' : 'No active investments currently recorded.'}
          </div>
        ) : (
          <div className="space-y-4">
            {investments.map((inv) => {
              const isLock = !inv.isInitialLockCompleted && now < (inv.lockedUntilTimestamp || 0);
              const lockLeft = Math.max(0, (inv.lockedUntilTimestamp || 0) - now);
              const cycleLeft = Math.max(0, (inv.currentCycleEndTimestamp || 0) - now);
              const cycleReturn = inv.cycleReturnAmount || (inv.dailyReturnAmount / 4);

              return (
                <div
                  key={inv.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isLock
                      ? 'bg-slate-950/80 border-amber-500/30'
                      : 'bg-slate-950/80 border-emerald-500/30'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Info */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          {inv.planName}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30 font-bold">
                          {inv.planUniqueId || inv.id}
                        </span>
                        {isLock ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" />
                            {isHi ? '24h लॉक' : '24h Lock'}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                            <Zap className="w-2.5 h-2.5" />
                            {isHi ? `चक्र #${(inv.completedCyclesCount || 0) + 1}` : `Cycle #${(inv.completedCyclesCount || 0) + 1}`}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">
                        {isHi ? 'निवेशित पूंजी:' : 'Capital:'}{' '}
                        <span className="font-mono font-bold text-white">{formatINR(inv.investedAmount)}</span>
                        {' | '}
                        {isHi ? 'दैनिक ROI:' : 'Daily ROI:'}{' '}
                        <span className="font-mono font-bold text-emerald-400">+{inv.dailyRoiPercent}%/दिन</span>
                        {' | '}
                        {isHi ? 'हर 6h रिटर्न:' : '6h Return:'}{' '}
                        <span className="font-mono font-bold text-teal-300">+{formatINR(cycleReturn)}</span>
                      </div>
                    </div>

                    {/* Middle: Live Decreasing Clocks */}
                    <div className="flex flex-wrap items-center gap-3">
                      {isLock ? (
                        <div className="bg-amber-950/40 border border-amber-500/40 px-3 py-1.5 rounded-xl text-center">
                          <span className="text-[9px] uppercase font-bold text-amber-300 block">
                            {isHi ? '24h लॉक टाइमर' : '24h Lock Countdown'}
                          </span>
                          <span className="font-mono font-black text-amber-400 text-base tracking-wider">
                            {formatCountdown(lockLeft)}
                          </span>
                        </div>
                      ) : (
                        <div className="bg-emerald-950/40 border border-emerald-500/40 px-3 py-1.5 rounded-xl text-center">
                          <span className="text-[9px] uppercase font-bold text-emerald-300 block">
                            {isHi ? `6h चक्र (${formatFixedSlotTime(inv.currentCycleEndTimestamp)})` : `6h Cycle (${formatFixedSlotTime(inv.currentCycleEndTimestamp)})`}
                          </span>
                          <span className="font-mono font-black text-emerald-400 text-base tracking-wider">
                            {formatCountdown(cycleLeft)}
                          </span>
                        </div>
                      )}

                      <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-center">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">
                          {isHi ? 'पूर्ण चक्र / क्रेडिट' : 'Cycles / Earned'}
                        </span>
                        <span className="font-mono font-bold text-white text-xs">
                          {inv.completedCyclesCount || 0} {isHi ? 'चक्र' : 'cyc'} (+{formatINR(inv.earnedSoFar)})
                        </span>
                      </div>
                    </div>

                    {/* Right: Quick Simulation Triggers for Admin */}
                    <div className="flex items-center gap-2">
                      {isLock && onSimulateComplete24hLock && (
                        <button
                          id={`admin-btn-unlock-${inv.id}`}
                          onClick={() => onSimulateComplete24hLock(inv.id)}
                          className="py-1.5 px-2.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-bold border border-amber-500/40 cursor-pointer flex items-center gap-1 transition-all"
                        >
                          <Zap className="w-3 h-3" />
                          <span>{isHi ? '24h अनलॉक करें' : 'Simulate Unlock'}</span>
                        </button>
                      )}

                      {!isLock && onSimulateComplete6hCycle && (
                        <button
                          id={`admin-btn-cycle-${inv.id}`}
                          onClick={() => onSimulateComplete6hCycle(inv.id)}
                          className="py-1.5 px-2.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-bold border border-emerald-500/40 cursor-pointer flex items-center gap-1 transition-all"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>{isHi ? '6h अर्निंग क्रेडिट' : 'Credit 6h'}</span>
                        </button>
                      )}

                      {onSimulateMaturity641Days && !inv.isMatured && (
                        <button
                          id={`admin-btn-maturity-${inv.id}`}
                          onClick={() => onSimulateMaturity641Days(inv.id)}
                          className="py-1.5 px-2.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-[11px] font-bold border border-purple-500/40 cursor-pointer flex items-center gap-1 transition-all"
                        >
                          <TrendingUp className="w-3 h-3" />
                          <span>{isHi ? '641 दिन परिपक्वता' : '641D Maturity'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
