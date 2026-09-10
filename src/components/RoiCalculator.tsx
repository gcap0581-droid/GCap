import React, { useState } from 'react';
import { Calculator, ArrowRight, CheckCircle2, TrendingUp } from 'lucide-react';
import { InvestmentPlan, Language } from '../types';
import { INVESTMENT_PLANS } from '../data/plans';
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

  const currentPlan = availablePlans.find(p => p.id === selectedPlanId) || availablePlans[0] || INVESTMENT_PLANS[0];

  // Calculations
  const safeAmount = Math.max(currentPlan.minAmount, Math.min(amount, currentPlan.maxAmount));
  const dailyReturn = (safeAmount * currentPlan.dailyRoiPercent) / 100;
  const cycleReturn = dailyReturn / 4;
  const totalProfit = dailyReturn * currentPlan.durationDays;
  const totalMaturity = safeAmount + totalProfit;
  const totalRoiPercent = currentPlan.dailyRoiPercent * currentPlan.durationDays;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
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
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
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
                      if (amount < plan.minAmount) setAmount(plan.minAmount);
                      if (amount > plan.maxAmount) setAmount(plan.maxAmount);
                    }}
                    className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-sm'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:border-slate-600'
                    }`}
                  >
                    <div className="text-xs font-bold truncate">
                      {isHi ? plan.nameHi : plan.name}
                    </div>
                    <div className="text-sm font-extrabold text-emerald-400 font-mono mt-0.5">
                      {plan.dailyRoiPercent}% /दिन ({(plan.dailyRoiPercent / 4).toFixed(3)}%/6h)
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
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
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                {isHi ? '2. निवेश राशि दर्ज करें:' : '2. Investment Amount:'}
              </label>
              <div className="text-sm font-extrabold text-white font-mono bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
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
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />

            <div className="flex justify-between text-[11px] text-slate-500 font-mono mt-1.5">
              <span>{formatINR(currentPlan.minAmount)}</span>
              <span>{formatINR(currentPlan.maxAmount)}</span>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-2 mt-3">
              {Array.from(new Set([currentPlan.minAmount, 50000, 75000, 100000, 200000, 500000, 1000000])).map((preset) => {
                if (preset < currentPlan.minAmount || preset > currentPlan.maxAmount) return null;
                return (
                  <button
                    key={preset}
                    id={`btn-calc-preset-${preset}`}
                    onClick={() => setAmount(preset)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-mono transition-all cursor-pointer ${
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

        </div>

        {/* Right column: Result Output Card */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-950 to-slate-900 border border-emerald-500/30 rounded-xl p-5 flex flex-col justify-between shadow-inner">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs text-slate-400 font-medium">
                {isHi ? 'चयनित योजना:' : 'Selected Plan:'}
              </span>
              <span className="text-xs font-bold text-emerald-400">
                {isHi ? currentPlan.nameHi : currentPlan.name}
              </span>
            </div>

            <div className="space-y-3.5 my-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{isHi ? 'दैनिक रिटर्न दर:' : 'Daily Return Rate:'}</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  +{formatINR(dailyReturn)} / दिन
                </span>
              </div>

              <div className="flex items-center justify-between text-xs bg-emerald-950/40 p-2 rounded-lg border border-emerald-500/20">
                <span className="text-emerald-300 font-semibold">{isHi ? 'हर 6 घंटे का रिटर्न (Total Earning):' : 'Every 6h Return (Total Earning):'}</span>
                <span className="font-mono font-bold text-white text-sm">
                  +{formatINR(cycleReturn)} / 6h
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{isHi ? 'निवेश अवधि:' : 'Duration Term:'}</span>
                <span className="font-mono font-medium text-slate-200">
                  {currentPlan.durationDays} {isHi ? 'दिन' : 'Days'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{isHi ? 'कुल शुद्ध मुनाफ़ा:' : 'Net Profit Earned:'}</span>
                <span className="font-mono font-bold text-amber-400 text-sm">
                  +{formatINR(totalProfit)} ({totalRoiPercent.toFixed(1)}%)
                </span>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-300 font-semibold block">
                    {isHi ? 'कुल परिपक्वता राशि (Maturity):' : 'Total Maturity Payout:'}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {isHi ? 'मूलधन + कुल दैनिक रिटर्न' : 'Principal returned + all returns'}
                  </span>
                </div>
                <div className="text-xl font-extrabold text-white font-mono">
                  {formatINR(totalMaturity)}
                </div>
              </div>
            </div>
          </div>

          <button
            id="btn-calc-invest-now"
            onClick={() => onSelectPlanAndAmount(currentPlan, safeAmount)}
            className="w-full mt-3 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
          >
            <span>{isHi ? `अभी ₹${safeAmount} निवेश करें` : `Invest ${formatINR(safeAmount)} Now`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
