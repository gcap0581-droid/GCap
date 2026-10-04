import React, { useState } from 'react';
import { Calculator, ArrowRight, TrendingUp } from 'lucide-react';
import { InvestmentPlan, Language } from '../types';
import { INVESTMENT_PLANS } from '../utils/plansStorage';
import { formatINR } from '../utils/storage';

interface RoiCalculatorProps {
  language: Language;
  onSelectPlanAndAmount: (plan: InvestmentPlan, amount: number) => void;
  plans?: InvestmentPlan[];
}

export const RoiCalculator: React.FC<RoiCalculatorProps> = ({
  language,
  onSelectPlanAndAmount,
  plans,
}) => {
  const isHi = language === 'hi';
  const availablePlans = plans && plans.length > 0 ? plans : INVESTMENT_PLANS;
  const [selectedPlanId, setSelectedPlanId] = useState<string>(availablePlans[0]?.id || 'short-term');
  const [amount, setAmount] = useState<number>(availablePlans[0]?.minAmount || 100000);
  const [customDays, setCustomDays] = useState<number>(availablePlans[0]?.durationDays || 365);
  const [royaltyDays, setRoyaltyDays] = useState<number>(365);

  const currentPlan = availablePlans.find(p => p.id === selectedPlanId) || availablePlans[0] || INVESTMENT_PLANS[0];

  const isShortTerm = currentPlan.id === 'short-term';
  const minDays = 30;
  const maxDays = isShortTerm ? 641 : 1825;

  const safeCustomDays = Math.max(minDays, Math.min(customDays, maxDays));
  const showRoyalty = !isShortTerm && safeCustomDays >= 1825;
  const safeRoyaltyDays = showRoyalty ? Math.max(30, Math.min(royaltyDays, 1825)) : 0;

  const safeAmount = Math.max(currentPlan.minAmount, Math.min(amount, currentPlan.maxAmount));
  const dailyReturn = (safeAmount * currentPlan.dailyRoiPercent) / 100;
  const cycleReturn = dailyReturn / 4;
  const totalDays = safeCustomDays + safeRoyaltyDays;
  const totalProfit = dailyReturn * totalDays;
  const totalMaturity = safeAmount + totalProfit;
  const totalRoiPercent = currentPlan.dailyRoiPercent * totalDays;

  const royaltyProfit = dailyReturn * safeRoyaltyDays;

  return (
    <div className="bg-gradient-to-b from-slate-900/95 via-slate-950/90 to-slate-900/95 border border-blue-500/25 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-black/50 backdrop-blur-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-blue-500/15 text-blue-400 flex items-center justify-center border border-blue-500/30 shadow-inner">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-white font-display">
              {isHi ? 'रिटर्न कैलकुलेटर (ROI Calculator)' : 'Interactive ROI & Return Calculator'}
            </h3>
            <p className="text-xs text-slate-400">
              {isHi
                ? 'राशि और समय चुनकर देखें कि आपको रोज़ कितना रिटर्न और अंत में कितना कुल मुनाफ़ा मिलेगा'
                : 'Estimate your exact daily payout and total maturity returns before depositing'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column: Input controls */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Plan Selector Buttons */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
              {isHi ? '1. निवेश योजना चुनें:' : '1. Select Investment Plan:'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {availablePlans.map((plan) => {
                const isSelected = plan.id === currentPlan.id;
                return (
                  <button
                    key={plan.id}
                    id={`btn-calc-plan-${plan.id}`}
                    onClick={() => {
                      setSelectedPlanId(plan.id);
                      setCustomDays(plan.durationDays);
                      if (amount < plan.minAmount) setAmount(plan.minAmount);
                      if (amount > plan.maxAmount) setAmount(plan.maxAmount);
                    }}
                    className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer active:scale-95 ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border-amber-500/60 text-white shadow-md shadow-amber-950/30'
                        : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-black truncate font-display">
                      {isHi ? plan.nameHi : plan.name}
                    </div>
                    <div className="text-sm font-black text-emerald-400 font-mono mt-1">
                      {plan.dailyRoiPercent}% /दिन ({(plan.dailyRoiPercent / 4).toFixed(3)}%/6h)
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 font-medium">
                      {plan.durationDays} {isHi ? 'दिन (24h लॉक + 6h चक्र)' : 'Days (24h Lock + 6h)'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount Slider & Presets */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                {isHi ? '2. निवेश राशि दर्ज करें:' : '2. Investment Amount:'}
              </label>
              <div className="text-sm font-black text-white font-mono bg-slate-950/80 px-3.5 py-1 rounded-xl border border-slate-800 shadow-inner">
                {formatINR(safeAmount)}
              </div>
            </div>

            <input
              type="range"
              min={currentPlan.minAmount}
              max={currentPlan.maxAmount}
              step={500}
              value={safeAmount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500 border border-slate-800"
            />

            <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1.5">
              <span>{formatINR(currentPlan.minAmount)}</span>
              <span>{formatINR(currentPlan.maxAmount)}</span>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-2 mt-3">
              {Array.from(new Set([currentPlan.minAmount, 10000, 25000, 50000, 75000, 100000, 200000, 500000, 1000000])).map((preset) => {
                if (preset < currentPlan.minAmount || preset > currentPlan.maxAmount) return null;
                return (
                  <button
                    key={preset}
                    id={`btn-calc-preset-${preset}`}
                    onClick={() => setAmount(preset)}
                    className={`px-3 py-1 text-xs rounded-xl font-mono font-bold transition-all cursor-pointer active:scale-95 ${
                      amount === preset
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/25 font-black'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                    }`}
                  >
                    {formatINR(preset)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time / Duration Slider & Presets */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                {isHi ? '3. समय / अवधि चुनें (दिन):' : '3. Select Duration (Days):'}
              </label>
              <div className="text-sm font-black text-amber-400 font-mono bg-slate-950/80 px-3.5 py-1 rounded-xl border border-slate-800 shadow-inner">
                {safeCustomDays} {isHi ? 'दिन' : 'Days'} {safeCustomDays > 1825 ? `(${(safeCustomDays/365).toFixed(1)} वर्ष)` : ''}
              </div>
            </div>

            <input
              type="range"
              min={minDays}
              max={maxDays}
              step={1}
              value={safeCustomDays}
              onChange={(e) => setCustomDays(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500 border border-slate-800"
            />

            <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1.5">
              <span>{minDays} {isHi ? 'दिन' : 'Days'}</span>
              <span>{maxDays} {isHi ? `दिन (${maxDays/365} साल)` : `Days (${maxDays/365}Y)`}</span>
            </div>

            {/* Quick Duration Presets */}
            <div className="flex flex-wrap gap-2 mt-3">
              {(isShortTerm ? [30, 90, 180, 365, 641] : [30, 90, 180, 365, 730, 1461, 1825]).map((days) => {
                if (isShortTerm && days > 641) return null;
                return (
                  <button
                    key={days}
                    id={`btn-calc-days-${days}`}
                    onClick={() => setCustomDays(days)}
                    className={`px-3 py-1 text-xs rounded-xl font-mono font-bold transition-all cursor-pointer active:scale-95 ${
                      safeCustomDays === days
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black shadow-md shadow-amber-500/25'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                    }`}
                  >
                    {days === 30 ? (isHi ? '30 दिन' : '30D') :
                     days === 365 ? (isHi ? '1 साल' : '1Y') :
                     days === 730 ? (isHi ? '2 साल' : '2Y') :
                     days === 1461 ? (isHi ? '4 साल' : '4Y') :
                     days === 1825 ? (isHi ? '5 साल (मैक्स)' : '5Y (Max)') :
                     (isHi ? `${days} दिन` : `${days}D`)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conditional Royalty Program Slider */}
          {showRoyalty && (
            <div className="bg-gradient-to-r from-amber-950/40 via-slate-900/90 to-amber-950/30 border border-amber-500/40 rounded-2xl p-4 space-y-3 animate-fadeIn shadow-lg">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span>👑</span> {isHi ? 'रॉयल्टी प्रोग्राम अवधि (30 दिन - 5 साल):' : 'Royalty Program Duration (30D - 5Y):'}
                </label>
                <div className="text-xs font-black text-amber-400 font-mono bg-amber-900/50 px-3 py-1 rounded-xl border border-amber-500/40 shadow-inner">
                  {safeRoyaltyDays} {isHi ? 'दिन' : 'Days'} (~{(safeRoyaltyDays/365).toFixed(1)} {isHi ? 'वर्ष' : 'Yr'})
                </div>
              </div>

              <input
                type="range"
                min={30}
                max={1825}
                step={1}
                value={safeRoyaltyDays}
                onChange={(e) => setRoyaltyDays(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500 border border-slate-800"
              />

              <div className="flex justify-between text-[10px] text-amber-400/80 font-mono">
                <span>30 {isHi ? 'दिन' : 'Days'}</span>
                <span>1825 {isHi ? 'दिन (5 साल)' : 'Days (5Y)'}</span>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {[90, 180, 365, 730, 1095, 1461, 1825].map((rd) => (
                  <button
                    key={rd}
                    id={`btn-royalty-days-${rd}`}
                    onClick={() => setRoyaltyDays(rd)}
                    className={`px-2.5 py-1 text-[11px] rounded-xl font-mono font-bold transition-all cursor-pointer ${
                      safeRoyaltyDays === rd
                        ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                        : 'bg-slate-900 hover:bg-slate-800 text-amber-200/90 border border-amber-500/30'
                    }`}
                  >
                    {rd === 365 ? '1Y' : rd === 730 ? '2Y' : rd === 1095 ? '3Y' : rd === 1461 ? '4Y' : rd === 1825 ? '5Y' : `${rd}D`}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right column: Result Output Card */}
        <div className="lg:col-span-5 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-amber-500/40 rounded-3xl p-5 sm:p-6 flex flex-col justify-between shadow-2xl shadow-black/60 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>

          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
              <span className="text-xs text-slate-400 font-semibold">
                {isHi ? 'चयनित योजना:' : 'Selected Plan:'}
              </span>
              <span className="text-xs font-black text-amber-400 font-display">
                {isHi ? currentPlan.nameHi : currentPlan.name}
              </span>
            </div>

            <div className="space-y-3.5 my-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">{isHi ? 'दैनिक रिटर्न दर:' : 'Daily Return Rate:'}</span>
                <span className="font-mono font-black text-emerald-400 text-sm">
                  +{formatINR(dailyReturn)} / दिन
                </span>
              </div>

              <div className="flex items-center justify-between text-xs bg-emerald-950/50 p-2.5 rounded-2xl border border-emerald-500/30 shadow-inner">
                <span className="text-emerald-300 font-bold">{isHi ? 'हर 6 घंटे का रिटर्न (Total Earning):' : 'Every 6h Return (Total Earning):'}</span>
                <span className="font-mono font-black text-white text-sm">
                  +{formatINR(cycleReturn)} / 6h
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">{isHi ? 'निवेश अवधि:' : 'Duration Term:'}</span>
                <span className="font-mono font-bold text-slate-200">
                  {safeCustomDays} {isHi ? 'दिन' : 'Days'} {safeCustomDays > 1825 ? `(${(safeCustomDays/365).toFixed(1)} Yrs)` : ''}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">{isHi ? 'कुल शुद्ध मुनाफ़ा:' : 'Net Profit Earned:'}</span>
                <span className="font-mono font-black text-amber-400 text-sm">
                  +{formatINR(totalProfit)} ({totalRoiPercent.toFixed(1)}%)
                </span>
              </div>

              {showRoyalty && (
                <div className="flex items-center justify-between text-xs bg-amber-950/40 p-2.5 rounded-2xl border border-amber-500/40 shadow-inner">
                  <span className="text-amber-300 font-bold flex items-center gap-1">
                    <span>👑</span> {isHi ? `रॉयल्टी (${safeRoyaltyDays} दिन) मुनाफ़ा:` : `Royalty (${safeRoyaltyDays}D) Profit:`}
                  </span>
                  <span className="font-mono font-black text-amber-400 text-sm">
                    +{formatINR(royaltyProfit)}
                  </span>
                </div>
              )}

              <div className="pt-3.5 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-200 font-bold block">
                    {isHi ? 'कुल परिपक्वता राशि (Maturity):' : 'Total Maturity Payout:'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {isHi ? 'मूलधन + कुल दैनिक रिटर्न' : 'Principal returned + all returns'}
                  </span>
                </div>
                <div className="text-2xl font-black text-white font-mono">
                  {formatINR(totalMaturity)}
                </div>
              </div>
            </div>
          </div>

          <button
            id="btn-calc-invest-now"
            onClick={() => onSelectPlanAndAmount(currentPlan, safeAmount)}
            className="w-full mt-3 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-950/40 transition-all cursor-pointer active:scale-95"
          >
            <span>{isHi ? `अभी ₹${safeAmount} निवेश करें` : `Invest ${formatINR(safeAmount)} Now`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
