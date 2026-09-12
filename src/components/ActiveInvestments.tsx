import React, { useState, useEffect } from 'react';
import { Clock, TrendingUp, CheckCircle, Sparkles, Lock, ArrowRight, Zap, RefreshCw, AlertCircle, ShieldCheck, Search, Award, FileText, ArrowUpRight, DollarSign } from 'lucide-react';
import { ActiveInvestment, Language } from '../types';
import { formatINR } from '../utils/storage';
import { formatFixedSlotTime, FIXED_SLAB_LABELS } from '../utils/cycleTiming';

interface ActiveInvestmentsProps {
  investments: ActiveInvestment[];
  language: Language;
  onClaimReturn?: (investmentId: string) => void;
  onNavigateToPlans: () => void;
  onSimulateComplete24hLock?: (investmentId: string) => void;
  onSimulateComplete6hCycle?: (investmentId: string) => void;
  onSimulateMaturity641Days?: (investmentId: string) => void;
  onRenewPlan?: (investmentId: string) => void;
  onClaimMaturityClose?: (investmentId: string) => void;
  onViewCertificate?: (investment: ActiveInvestment) => void;

  // Long Term Plan & Royalty Props
  onTransitionToRoyalty1461D?: (investmentId: string) => void;
  onClaim1461DAndEnterRoyalty1825D?: (investmentId: string) => void;
  onClaimFinalRoyaltyMasterClose?: (investmentId: string) => void;
  onSimulateMaturity365Days?: (investmentId: string) => void;
  onSimulateMaturity1461Days?: (investmentId: string) => void;
  onSimulateMaturity1825Days?: (investmentId: string) => void;
}

function formatCountdown(ms: number): { hours: string; minutes: string; seconds: string; isZero: boolean } {
  if (ms <= 0) {
    return { hours: '00', minutes: '00', seconds: '00', isZero: true };
  }
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
    isZero: false,
  };
}

export const ActiveInvestments: React.FC<ActiveInvestmentsProps> = ({
  investments,
  language,
  onClaimReturn,
  onNavigateToPlans,
  onSimulateComplete24hLock,
  onSimulateComplete6hCycle,
  onSimulateMaturity641Days,
  onRenewPlan,
  onClaimMaturityClose,
  onViewCertificate,
  onTransitionToRoyalty1461D,
  onClaim1461DAndEnterRoyalty1825D,
  onClaimFinalRoyaltyMasterClose,
  onSimulateMaturity365Days,
  onSimulateMaturity1461Days,
  onSimulateMaturity1825Days,
}) => {
  const isHi = language === 'hi';
  const [now, setNow] = useState<number>(Date.now());
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Second-by-second decreasing clock ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute grand financial summary
  const totalActivePrincipal = investments
    .filter((inv) => inv.status === 'ACTIVE')
    .reduce((sum, inv) => sum + inv.investedAmount, 0);

  const totalEarnedSoFar = investments.reduce((sum, inv) => sum + inv.earnedSoFar, 0);
  const totalWithdrawnSoFar = investments.reduce((sum, inv) => sum + (inv.totalWithdrawn || 0), 0);
  const netAvailableEarning = Math.max(0, totalEarnedSoFar - totalWithdrawnSoFar);

  // Filter investments by Plan ID search query
  const filteredInvestments = investments.filter((inv) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const planIdCode = (inv.planUniqueId || inv.id).toLowerCase();
    const planName = inv.planName.toLowerCase();
    const amountStr = inv.investedAmount.toString();
    return planIdCode.includes(q) || planName.includes(q) || amountStr.includes(q);
  });

  if (investments.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 mx-auto flex items-center justify-center mb-3">
          <Clock className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white mb-1">
          {isHi ? 'कोई सक्रिय निवेश नहीं है' : 'No Active Investments Yet'}
        </h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5">
          {isHi
            ? '641-दिनों के शॉर्ट टर्म प्लान में निवेश करें। पहले 24 घंटे का लॉक रहेगा और उसके बाद हर 6 घंटे में 0.041% GP अर्निंग स्वतः Total Earning में जमा होगी।'
            : 'Invest in 641-Day Short Term Plan. Locked for first 24 hours, followed by recurring 6-hour 0.041% GP earnings added to Total Earning.'}
        </p>
        <button
          id="btn-empty-invest-start"
          onClick={onNavigateToPlans}
          className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs inline-flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-700/20"
        >
          <TrendingUp className="w-4 h-4" />
          <span>{isHi ? 'योजनाएँ देखें और निवेश करें' : 'Explore Plans & Invest'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header & Plan ID Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            <span>{isHi ? 'सक्रिय पोर्टफोलियो एवं यूनिक प्लान सर्च' : 'Active Portfolios & Unique Plan Search'}</span>
          </h2>
          <p className="text-xs text-slate-400">
            {isHi
              ? '641 दिवसीय शॉर्ट टर्म प्लान, 24h लॉक, 6h चक्र और परिपक्वता प्रमाणपत्र की सम्पूर्ण स्थिति।'
              : '641-Day Short Term Plan status, 24h activation lock, 6h cycles and maturity certificates.'}
          </p>
        </div>

        {/* Plan ID Realtime Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-plan-id"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isHi ? 'यूनिक प्लान ID (STP-641D-...) से खोजें' : 'Search by Unique Plan ID...'}
            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none transition-all font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* COMPREHENSIVE FINANCIAL SUMMARY CARD (Req #7) */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              {isHi ? 'पोर्टफोलियो एवं अर्निंग समरी (Unified Financial Summary)' : 'Portfolio & Earning Ledger Summary'}
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-700">
            {investments.length} {isHi ? 'सक्रिय प्लान' : 'Plans Active'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 font-semibold block mb-0.5">
              {isHi ? 'सक्रिय मूलधन (Active Principal):' : 'Active Principal:'}
            </span>
            <span className="text-base font-black font-mono text-white">
              {formatINR(totalActivePrincipal)}
            </span>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-emerald-500/30">
            <span className="text-[10px] text-emerald-400 font-semibold block mb-0.5">
              {isHi ? 'कुल अर्जित लाभ (Total Earned):' : 'Total Earned:'}
            </span>
            <span className="text-base font-black font-mono text-emerald-400">
              +{formatINR(totalEarnedSoFar)}
            </span>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-rose-500/30">
            <span className="text-[10px] text-rose-400 font-semibold block mb-0.5">
              {isHi ? 'कुल निकाला गया (Total Withdrawn):' : 'Total Withdrawn:'}
            </span>
            <span className="text-base font-black font-mono text-rose-400">
              -{formatINR(totalWithdrawnSoFar)}
            </span>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-amber-500/30">
            <span className="text-[10px] text-amber-400 font-semibold block mb-0.5">
              {isHi ? 'शेष उपलब्ध अर्निंग (Net Balance):' : 'Net Available Earning:'}
            </span>
            <span className="text-base font-black font-mono text-amber-300">
              {formatINR(netAvailableEarning)}
            </span>
          </div>
        </div>
      </div>

      {/* PORTFOLIO CARDS GRID */}
      {filteredInvestments.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-slate-400 text-xs">
          {isHi ? `कोई प्लान ID "${searchQuery}" से मेल नहीं खाता।` : `No plans match "${searchQuery}".`}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredInvestments.map((inv) => {
            const isLockPhase = !inv.isInitialLockCompleted && now < (inv.lockedUntilTimestamp || 0);
            const lockRemainingMs = Math.max(0, (inv.lockedUntilTimestamp || 0) - now);
            const lockClock = formatCountdown(lockRemainingMs);

            const cycleRemainingMs = Math.max(0, (inv.currentCycleEndTimestamp || 0) - now);
            const cycleClock = formatCountdown(cycleRemainingMs);

            const isLongTerm = inv.planId === 'long-term' || !!inv.royaltyStage;
            const cyclePercentStr = isLongTerm ? '0.031%' : '0.041%';
            const cycleReturn = inv.cycleReturnAmount || (inv.investedAmount * (isLongTerm ? 0.031 : 0.041) / 100);
            const planUniqueCode = inv.planUniqueId || (isLongTerm ? `LTP-365D-${inv.id.slice(-5)}` : `STP-641D-${inv.id.slice(-5)}`);
            const isMatured = (inv.royaltyStage === '1825D_ROYALTY' ? (inv.royaltyDaysCompleted || 0) >= 1825 : inv.daysCompleted >= inv.durationDays) || inv.isMatured;
            const isCompleted = inv.status === 'COMPLETED';

            const planEarned = inv.earnedSoFar || 0;
            const planWithdrawn = inv.totalWithdrawn || 0;
            const planNetEarnings = Math.max(0, planEarned - planWithdrawn);

            return (
              <div
                key={inv.id}
                className={`rounded-2xl p-5 shadow-xl relative overflow-hidden flex flex-col justify-between border transition-all ${
                  isCompleted
                    ? 'bg-slate-950 border-slate-800 opacity-80'
                    : isMatured
                    ? 'bg-gradient-to-br from-amber-950/40 via-slate-900 to-amber-950/20 border-amber-500/60 shadow-amber-950/30'
                    : inv.royaltyStage === '1825D_ROYALTY'
                    ? 'bg-gradient-to-br from-purple-950/30 via-slate-900 to-amber-950/20 border-amber-400/60 shadow-amber-950/30'
                    : isLockPhase
                    ? 'bg-slate-900 border-amber-500/40 shadow-amber-950/20'
                    : 'bg-slate-900 border-emerald-500/40 shadow-emerald-950/20'
                }`}
              >
                <div>
                  {/* Status & Plan Unique ID Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] uppercase font-mono font-extrabold tracking-wider px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          {planUniqueCode}
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {inv.planName}
                        </span>
                        {inv.royaltyStage === '1825D_ROYALTY' && (
                          <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                            👑 1825D Royalty Reward Active
                          </span>
                        )}
                        {inv.royaltyStage === '1461D_LOCK' && (
                          <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                            👑 1461D Royalty Lock
                          </span>
                        )}
                        {inv.renewedCount && inv.renewedCount > 0 && (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            🔄 Renewed x{inv.renewedCount}
                          </span>
                        )}
                      </div>
                      <div className="text-2xl font-black text-white font-mono mt-1.5">
                        {formatINR(inv.investedAmount)}
                        {inv.principalWithdrawnAt1461D && (
                          <span className="text-xs font-sans text-emerald-400 font-semibold block">
                            ({isHi ? 'मूलधन वापसी पूर्ण - केवल 5-वर्षीय अर्निंग चालू' : 'Principal Returned - 5Y Royalty Active'})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      {isCompleted ? (
                        <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full inline-flex items-center gap-1 bg-slate-800 text-slate-400 border border-slate-700">
                          <CheckCircle className="w-3 h-3 text-slate-400" />
                          <span>{isHi ? 'सफलतापूर्वक बंद (Closed)' : 'Completed & Closed'}</span>
                        </span>
                      ) : isMatured ? (
                        <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/50 animate-pulse">
                          <Award className="w-3.5 h-3.5 text-amber-400" />
                          <span>{isHi ? 'परिपक्वता पूर्ण (Matured)' : 'Matured'}</span>
                        </span>
                      ) : isLockPhase ? (
                        <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                          <Lock className="w-3 h-3" />
                          <span>{isHi ? '24h लॉक सक्रिय' : '24h Lock Active'}</span>
                        </span>
                      ) : (
                        <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          <Zap className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                          <span>{isHi ? '6h चक्र सक्रिय' : '6h Cycle Active'}</span>
                        </span>
                      )}

                      <div className="text-xs font-mono font-bold text-emerald-400 mt-1">
                        +{cyclePercentStr} GP/6h (+{formatINR(cycleReturn)})
                      </div>
                    </div>
                  </div>

                  {/* MATURITY & ROYALTY SPECIAL ACTION PANELS */}
                  {isMatured && !isCompleted && (
                    <div className="my-3.5 p-4 rounded-2xl bg-gradient-to-r from-amber-950/60 via-amber-900/40 to-slate-900 border-2 border-amber-500/60 text-center space-y-3">
                      <div className="flex items-center justify-center gap-2 text-amber-300 font-black text-sm">
                        <Award className="w-5 h-5 text-amber-400" />
                        <span>
                          {inv.royaltyStage === '1825D_ROYALTY'
                            ? (isHi ? '👑 1825-दिवसीय लाइफटाइम रॉयल्टी मास्टर पूर्ण!' : '👑 1825-Day Royalty Master Completed!')
                            : inv.royaltyStage === '1461D_LOCK'
                            ? (isHi ? '🎉 1461 दिन रॉयल्टी लॉक पूर्ण!' : '🎉 1461 Days Royalty Lock Matured!')
                            : isLongTerm
                            ? (isHi ? '🎉 365 दिन पूर्ण! विकल्प चुनें' : '🎉 365 Days Matured! Select Option')
                            : (isHi ? '🎉 641 दिन पूर्ण! परिपक्वता विकल्प चुनें' : '🎉 641 Days Matured! Select Action')}
                        </span>
                      </div>

                      <p className="text-xs text-slate-200">
                        {inv.royaltyStage === '1825D_ROYALTY'
                          ? (isHi
                              ? 'आपकी 5-वर्षीय रॉयल्टी अवधि पूर्ण हो चुकी है। अब आप शेष अर्निंग निकालकर प्लान क्लोज करें और ग्रैंड रॉयल्टी मास्टर सर्टिफिकेट प्राप्त करें।'
                              : 'Your 5-Year Royalty Reward period is complete. Claim final earnings and get Grand Royalty Master Certificate.')
                          : inv.royaltyStage === '1461D_LOCK'
                          ? (isHi
                              ? `आपका 1461-दिवसीय कार्यकाल पूर्ण हो गया है! आप अपना पूरा मूलधन (${formatINR(inv.investedAmount)}) + अर्निंग निकालकर 1825-दिवसीय लाइफटाइम रॉयल्टी में प्रवेश कर सकते हैं।`
                              : `1461 days lock complete! Claim full principal (${formatINR(inv.investedAmount)}) + yield and enter 1825-Day Lifetime Royalty Reward phase.`)
                          : isLongTerm
                          ? (isHi
                              ? `365 दिन की अवधि पूर्ण हो चुकी है। आप पूरा मूलधन + लाभ निकालकर क्लोज कर सकते हैं अथवा 1461-दिवसीय रॉयल्टी प्लान में स्थानांतरित हो सकते हैं।`
                              : `365 days term complete. Claim full principal & yield or transition into 1461-Day Royalty Plan.`)
                          : (isHi
                              ? `आपका ${inv.durationDays} दिनों का कार्यकाल पूर्ण हो गया है। आप उसी ID (${planUniqueCode}) से रिन्यू कर सकते हैं या पूरा मूलधन + शेष लाभ निकालकर क्लोज कर सकते हैं।`
                              : `Your ${inv.durationDays}-day term is complete. You may renew under the same Plan ID (${planUniqueCode}) or claim full maturity and close.`)}
                      </p>

                      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                        {/* 1825D Royalty Master Final Claim */}
                        {inv.royaltyStage === '1825D_ROYALTY' && onClaimFinalRoyaltyMasterClose && (
                          <button
                            id={`btn-royal-master-close-${inv.id}`}
                            onClick={() => onClaimFinalRoyaltyMasterClose(inv.id)}
                            className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs inline-flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/30"
                          >
                            <Award className="w-4 h-4" />
                            <span>{isHi ? '🏆 अर्निंग निकालें & रॉयल मास्टर प्रमाणपत्र पाएं' : '🏆 Claim Yield & Get Royal Master Certificate'}</span>
                          </button>
                        )}

                        {/* 1461D Royalty Lock Claim & Enter 1825D Royalty */}
                        {inv.royaltyStage === '1461D_LOCK' && onClaim1461DAndEnterRoyalty1825D && (
                          <button
                            id={`btn-royal-1461d-claim-${inv.id}`}
                            onClick={() => onClaim1461DAndEnterRoyalty1825D(inv.id)}
                            className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-black text-xs inline-flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-600/30"
                          >
                            <Award className="w-4 h-4 text-amber-300" />
                            <span>{isHi ? '👑 मूलधन निकालें & 1825-दिवसीय रॉयल्टी शुरू करें' : '👑 Claim Principal & Start 1825-Day Royalty'}</span>
                          </button>
                        )}

                        {/* 365D Long Term Plan Maturity Options */}
                        {isLongTerm && (inv.royaltyStage === '365D_INITIAL' || !inv.royaltyStage) && (
                          <>
                            {onTransitionToRoyalty1461D && (
                              <button
                                id={`btn-goto-royalty-1461d-${inv.id}`}
                                onClick={() => onTransitionToRoyalty1461D(inv.id)}
                                className="w-full sm:w-auto py-2 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs inline-flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md shadow-purple-600/30"
                              >
                                <Sparkles className="w-4 h-4 text-amber-300" />
                                <span>{isHi ? '👑 1461-दिवसीय रॉयल्टी प्लान में जाएं' : '👑 Enter 1461-Day Royalty Plan'}</span>
                              </button>
                            )}

                            {onClaimMaturityClose && (
                              <button
                                id={`btn-close-claim-365d-${inv.id}`}
                                onClick={() => onClaimMaturityClose(inv.id)}
                                className="w-full sm:w-auto py-2 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs inline-flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md shadow-emerald-600/30"
                              >
                                <Award className="w-4 h-4 text-amber-300" />
                                <span>{isHi ? '🎁 पूरा मूलधन निकालें व प्रमाणपत्र पाएं' : '🎁 Claim & Get Certificate'}</span>
                              </button>
                            )}
                          </>
                        )}

                        {/* 641D Short Term Plan Options */}
                        {!isLongTerm && (
                          <>
                            {onRenewPlan && (
                              <button
                                id={`btn-renew-plan-${inv.id}`}
                                onClick={() => onRenewPlan(inv.id)}
                                className="w-full sm:w-auto py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs inline-flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md shadow-indigo-600/30"
                              >
                                <RefreshCw className="w-4 h-4" />
                                <span>{isHi ? '🔄 इसी ID पर पुनः 641 दिन रिन्यू करें' : '🔄 Renew Plan (Same ID)'}</span>
                              </button>
                            )}

                            {onClaimMaturityClose && (
                              <button
                                id={`btn-close-claim-${inv.id}`}
                                onClick={() => onClaimMaturityClose(inv.id)}
                                className="w-full sm:w-auto py-2 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs inline-flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md shadow-emerald-600/30"
                              >
                                <Award className="w-4 h-4 text-amber-300" />
                                <span>{isHi ? '🎁 पूरा मूलधन निकालें व प्रमाणपत्र पाएं' : '🎁 Claim & Get Certificate'}</span>
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* COUNTDOWN CLOCK SECTION FOR ACTIVE PLANS */}
                  {!isMatured && !isCompleted && (
                    <>
                      {isLockPhase ? (
                        /* PHASE 1: 24-HOUR ACTIVATION LOCK COUNTDOWN CLOCK */
                        <div className="my-3.5 p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-center">
                          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-300 mb-2">
                            <Lock className="w-3.5 h-3.5" />
                            <span>{isHi ? 'प्रारंभिक 24 घंटे का एक्टिवेशन लॉक टाइमर' : 'Initial 24-Hour Activation Lock'}</span>
                          </div>

                          <div className="flex items-center justify-center gap-2 font-mono text-2xl sm:text-3xl font-black text-amber-400 tracking-wider my-2">
                            <div className="bg-slate-950/90 border border-amber-500/30 px-3 py-1.5 rounded-xl shadow-inner">
                              {lockClock.hours}
                              <span className="block text-[9px] font-sans text-slate-400 font-normal mt-0.5">
                                {isHi ? 'घंटे' : 'HRS'}
                              </span>
                            </div>
                            <span className="text-amber-500 animate-pulse">:</span>
                            <div className="bg-slate-950/90 border border-amber-500/30 px-3 py-1.5 rounded-xl shadow-inner">
                              {lockClock.minutes}
                              <span className="block text-[9px] font-sans text-slate-400 font-normal mt-0.5">
                                {isHi ? 'मिनट' : 'MIN'}
                              </span>
                            </div>
                            <span className="text-amber-500 animate-pulse">:</span>
                            <div className="bg-slate-950/90 border border-amber-500/30 px-3 py-1.5 rounded-xl shadow-inner">
                              {lockClock.seconds}
                              <span className="block text-[9px] font-sans text-slate-400 font-normal mt-0.5">
                                {isHi ? 'सेकंड' : 'SEC'}
                              </span>
                            </div>
                          </div>

                          <p className="text-[11px] text-amber-200/80 mt-2">
                            {isHi
                              ? `⏳ 24h लॉक पूर्ण होने पर निकटतम फिक्स्ड स्लॉट (${formatFixedSlotTime(inv.currentCycleEndTimestamp)}) पर ${cyclePercentStr} GP चक्र शुरू होगा।`
                              : `⏳ Next cycle syncs at nearest fixed slab (${formatFixedSlotTime(inv.currentCycleEndTimestamp)}) after 24h lock.`}
                          </p>
                          <div className="mt-2 text-[10px] text-amber-300/80 font-mono bg-amber-950/40 py-1 px-2 rounded-md border border-amber-500/20">
                            {isHi ? '🕒 4 दैनिक फिक्स्ड स्लॉट: 08:00 AM • 02:00 PM • 08:00 PM • 02:00 AM' : '🕒 4 Daily Fixed Slots: 08:00 AM • 02:00 PM • 08:00 PM • 02:00 AM'}
                          </div>

                          {onSimulateComplete24hLock && (
                            <div className="mt-3 pt-2.5 border-t border-amber-500/20 flex justify-center">
                              <button
                                id={`btn-sim-lock-${inv.id}`}
                                onClick={() => onSimulateComplete24hLock(inv.id)}
                                className="py-1.5 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-bold border border-amber-500/40 inline-flex items-center gap-1.5 cursor-pointer transition-all"
                              >
                                <Zap className="w-3 h-3 text-amber-400" />
                                <span>{isHi ? '⚡ टेस्ट: 24 घंटे लॉक अभी पूरा करें' : '⚡ Test: Fast-Forward 24h Lock'}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* PHASE 2: 6-HOUR EARNING CYCLE COUNTDOWN CLOCK */
                        <div className="my-3.5 p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-center">
                          <div className="flex items-center justify-between text-xs font-bold text-emerald-300 mb-2">
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                              <span>{isHi ? '6 घंटे का अर्निंग चक्र टाइमर' : '6-Hour Earning Cycle Timer'}</span>
                            </span>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              {isHi ? `चक्र #${(inv.completedCyclesCount || 0) + 1}` : `Cycle #${(inv.completedCyclesCount || 0) + 1}`}
                            </span>
                          </div>

                          <div className="flex items-center justify-center gap-2 font-mono text-2xl sm:text-3xl font-black text-emerald-400 tracking-wider my-2">
                            <div className="bg-slate-950/90 border border-emerald-500/30 px-3 py-1.5 rounded-xl shadow-inner">
                              {cycleClock.hours}
                              <span className="block text-[9px] font-sans text-slate-400 font-normal mt-0.5">
                                {isHi ? 'घंटे' : 'HRS'}
                              </span>
                            </div>
                            <span className="text-emerald-500 animate-pulse">:</span>
                            <div className="bg-slate-950/90 border border-emerald-500/30 px-3 py-1.5 rounded-xl shadow-inner">
                              {cycleClock.minutes}
                              <span className="block text-[9px] font-sans text-slate-400 font-normal mt-0.5">
                                {isHi ? 'मिनट' : 'MIN'}
                              </span>
                            </div>
                            <span className="text-emerald-500 animate-pulse">:</span>
                            <div className="bg-slate-950/90 border border-emerald-500/30 px-3 py-1.5 rounded-xl shadow-inner">
                              {cycleClock.seconds}
                              <span className="block text-[9px] font-sans text-slate-400 font-normal mt-0.5">
                                {isHi ? 'सेकंड' : 'SEC'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-emerald-300/90 mt-2.5 px-2.5 bg-emerald-900/30 py-2 rounded-lg border border-emerald-500/20">
                            <div>
                              <span>{isHi ? `अगला ऑटो-क्रेडिट (${formatFixedSlotTime(inv.currentCycleEndTimestamp)} स्लॉट):` : `Next Auto Credit (${formatFixedSlotTime(inv.currentCycleEndTimestamp)} Slot):`}</span>
                              <div className="text-[10px] text-emerald-400/80 font-mono">
                                {isHi ? 'सभी यूज़र्स के लिए सिंक्रनाइज़्ड' : 'Synchronized for all users'}
                              </div>
                            </div>
                            <span className="font-mono font-extrabold text-white text-sm">+{formatINR(cycleReturn)} GP</span>
                          </div>

                          <div className="mt-2.5 grid grid-cols-4 gap-1 text-[9px] font-mono font-bold text-center">
                            {FIXED_SLAB_LABELS.map((slab) => {
                              const isCurrentTarget = formatFixedSlotTime(inv.currentCycleEndTimestamp) === slab;
                              return (
                                <div
                                  key={slab}
                                  className={`py-1 px-1 rounded border transition-all ${
                                    isCurrentTarget
                                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black shadow-md shadow-emerald-500/40 animate-pulse'
                                      : 'bg-slate-950/60 text-slate-400 border-slate-800'
                                  }`}
                                >
                                  {slab}
                                </div>
                              );
                            })}
                          </div>

                          {/* Fast-Forward simulator buttons */}
                          <div className="mt-3 pt-2.5 border-t border-emerald-500/20 flex flex-wrap items-center justify-center gap-2">
                            {onSimulateComplete6hCycle && (
                              <button
                                id={`btn-sim-cycle-${inv.id}`}
                                onClick={() => onSimulateComplete6hCycle(inv.id)}
                                className="py-1 px-2.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10px] font-bold border border-emerald-500/40 inline-flex items-center gap-1 cursor-pointer transition-all"
                              >
                                <Zap className="w-3 h-3 text-emerald-400" />
                                <span>{isHi ? '⚡ टेस्ट 6h चक्र' : '⚡ Test 6h Cycle'}</span>
                              </button>
                            )}

                            {!isLongTerm && onSimulateMaturity641Days && (
                              <button
                                id={`btn-sim-641d-${inv.id}`}
                                onClick={() => onSimulateMaturity641Days(inv.id)}
                                className="py-1 px-2.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-bold border border-amber-500/40 inline-flex items-center gap-1 cursor-pointer transition-all"
                              >
                                <Award className="w-3 h-3 text-amber-400" />
                                <span>{isHi ? '⚡ टेस्ट 641 दिन परिपक्वता' : '⚡ Fast-Forward 641 Days'}</span>
                              </button>
                            )}

                            {isLongTerm && (inv.royaltyStage === '365D_INITIAL' || !inv.royaltyStage) && onSimulateMaturity365Days && (
                              <button
                                id={`btn-sim-365d-${inv.id}`}
                                onClick={() => onSimulateMaturity365Days(inv.id)}
                                className="py-1 px-2.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-bold border border-amber-500/40 inline-flex items-center gap-1 cursor-pointer transition-all"
                              >
                                <Award className="w-3 h-3 text-amber-400" />
                                <span>{isHi ? '⚡ टेस्ट 365 दिन परिपक्वता' : '⚡ Fast-Forward 365 Days'}</span>
                              </button>
                            )}

                            {inv.royaltyStage === '1461D_LOCK' && onSimulateMaturity1461Days && (
                              <button
                                id={`btn-sim-1461d-${inv.id}`}
                                onClick={() => onSimulateMaturity1461Days(inv.id)}
                                className="py-1 px-2.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-[10px] font-bold border border-purple-500/40 inline-flex items-center gap-1 cursor-pointer transition-all"
                              >
                                <Sparkles className="w-3 h-3 text-purple-400" />
                                <span>{isHi ? '⚡ टेस्ट 1461 दिन रॉयल्टी' : '⚡ Fast-Forward 1461 Days'}</span>
                              </button>
                            )}

                            {inv.royaltyStage === '1825D_ROYALTY' && onSimulateMaturity1825Days && (
                              <button
                                id={`btn-sim-1825d-${inv.id}`}
                                onClick={() => onSimulateMaturity1825Days(inv.id)}
                                className="py-1 px-2.5 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 text-[10px] font-bold border border-yellow-500/40 inline-flex items-center gap-1 cursor-pointer transition-all"
                              >
                                <Award className="w-3 h-3 text-yellow-400" />
                                <span>{isHi ? '⚡ टेस्ट 1825 दिन रॉयल मास्टर' : '⚡ Fast-Forward 1825 Days'}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* FINANCIAL METRICS BREAKDOWN (Req #7) */}
                  <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                    <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block mb-0.5">
                        {isHi ? 'कुल अर्जित लाभ:' : 'Total Earned:'}
                      </span>
                      <span className="font-mono font-bold text-emerald-400 text-xs sm:text-sm">
                        +{formatINR(planEarned)}
                      </span>
                    </div>

                    <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block mb-0.5">
                        {isHi ? 'कुल निकाला गया:' : 'Total Withdrawn:'}
                      </span>
                      <span className="font-mono font-bold text-rose-400 text-xs sm:text-sm">
                        -{formatINR(planWithdrawn)}
                      </span>
                    </div>

                    <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block mb-0.5">
                        {isHi ? 'शेष लाभ बैलेंस:' : 'Net Remaining:'}
                      </span>
                      <span className="font-mono font-bold text-amber-300 text-xs sm:text-sm">
                        {formatINR(planNetEarnings)}
                      </span>
                    </div>
                  </div>

                  {/* Term Progress Bar */}
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between items-center text-slate-400">
                      <span>{isHi ? `कार्यकाल स्थिति (${inv.daysCompleted}/${inv.durationDays} दिन):` : `Term Progress (${inv.daysCompleted}/${inv.durationDays} Days):`}</span>
                      <span className="font-mono font-bold text-emerald-400">{Math.min(100, Math.round((inv.daysCompleted / inv.durationDays) * 100))}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.round((inv.daysCompleted / inv.durationDays) * 100))}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono pt-1">
                      <span>{isHi ? 'शुरू:' : 'Start:'} {inv.startDate}</span>
                      <span>{isHi ? 'परिपक्वता:' : 'Maturity:'} {inv.endDate}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Certificate & View Action */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>641D Lock Security</span>
                  </span>

                  {onViewCertificate && (
                    <button
                      id={`btn-cert-${inv.id}`}
                      onClick={() => onViewCertificate(inv)}
                      className="py-1 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/40 inline-flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Award className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isHi ? '📜 परिपक्वता प्रमाणपत्र देखें' : '📜 View Certificate'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
