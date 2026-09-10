import React, { useState } from 'react';
import {
  TrendingUp,
  CheckCircle2,
  Shield,
  Sparkles,
  ArrowRight,
  Zap,
  Tag,
  Star,
  Flame,
  Clock,
  Award,
  Filter,
  Check,
} from 'lucide-react';
import { InvestmentPlan, Language } from '../types';
import { INVESTMENT_PLANS } from '../data/plans';
import { formatINR } from '../utils/storage';

interface PlansListProps {
  language: Language;
  onSelectPlan: (plan: InvestmentPlan) => void;
  plans?: InvestmentPlan[];
  searchFilter?: string;
  onOpenGuides?: (guide?: 'SHORT_TERM' | 'LONG_TERM' | 'TDS_REFUND') => void;
}

export const PlansList: React.FC<PlansListProps> = ({
  language,
  onSelectPlan,
  plans,
  searchFilter = '',
  onOpenGuides,
}) => {
  const isHi = language === 'hi';
  const allPlans = plans && plans.length > 0 ? plans : INVESTMENT_PLANS;
  const [selectedDurationFilter, setSelectedDurationFilter] = useState<'all' | '641' | '365' | 'lifetime'>('all');

  // Filter based on search or duration filter
  const filteredPlans = allPlans.filter((plan) => {
    const matchesSearch =
      !searchFilter ||
      plan.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      plan.nameHi.toLowerCase().includes(searchFilter.toLowerCase()) ||
      plan.tag.toLowerCase().includes(searchFilter.toLowerCase()) ||
      plan.tagHi.toLowerCase().includes(searchFilter.toLowerCase()) ||
      plan.durationDays.toString().includes(searchFilter);

    if (!matchesSearch) return false;

    if (selectedDurationFilter === '641') return plan.durationDays === 641;
    if (selectedDurationFilter === '365') return plan.durationDays >= 365 && plan.durationDays < 641;
    if (selectedDurationFilter === 'lifetime') return plan.durationDays > 641 || plan.name.includes('Royalty');
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Amazon / Flipkart Style Category Banner & Filter Ribbon */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                {isHi ? 'सर्वश्रेष्ठ डील्स' : 'BEST DEALS'}
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400" />
                <span>{isHi ? 'दैनिक रिटर्न प्लान्स मार्केट' : 'Daily ROI Plan Showcase'}</span>
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isHi
                ? 'ई-कॉमर्स स्टाइल सुरक्षित निवेश • हर 6 घंटे में स्वचालित रिटर्न क्रेडिट • 100% मूलधन सुरक्षा गारंटी'
                : 'Flipkart & Amazon style shopping experience • Auto payout every 6 hours • 100% principal safe'}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-mono">
              <Shield className="w-3.5 h-3.5" />
              <span>{isHi ? '100% वेरिफाइड' : '100% Verified'}</span>
            </div>
          </div>
        </div>

        {/* Flipkart style Quick Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-2 border-t border-slate-800/80">
          <span className="text-[11px] text-slate-400 font-semibold mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-amber-400" />
            {isHi ? 'फ़िल्टर:' : 'Filter:'}
          </span>
          {[
            { id: 'all', label: isHi ? 'सभी दोनों प्लान्स' : 'All Plans' },
            { id: '641', label: isHi ? '⚡ शॉर्ट टर्म (641D)' : '⚡ Short Term (641D)' },
            { id: '365', label: isHi ? '👑 लॉन्ग टर्म (365D & रॉयल्टी)' : '👑 Long Term (365D & Royalty)' },
          ].map((filt) => (
            <button
              key={filt.id}
              onClick={() => setSelectedDurationFilter(filt.id as any)}
              className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedDurationFilter === filt.id
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700'
              }`}
            >
              {filt.label}
            </button>
          ))}

          <div className="h-4 w-px bg-slate-800 mx-1 shrink-0" />

          {/* PDF Guide Quick Buttons */}
          <button
            type="button"
            onClick={() => onOpenGuides && onOpenGuides('SHORT_TERM')}
            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1"
          >
            <span>📄 {isHi ? '641D गाइड PDF' : '641D Guide PDF'}</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenGuides && onOpenGuides('TDS_REFUND')}
            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/25 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1"
          >
            <span>🏛️ {isHi ? 'TDS रिफंड PDF' : 'TDS Refund PDF'}</span>
          </button>
        </div>
      </div>

      {/* Grid of E-Commerce Style Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {filteredPlans.map((plan) => {
          const isFeatured = plan.id === 'long-term';
          const totalRoi = plan.dailyRoiPercent * plan.durationDays;
          const cycleRoi = (plan.dailyRoiPercent / 4).toFixed(3);

          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 border group hover:-translate-y-1 ${
                isFeatured
                  ? 'bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-amber-500/50 shadow-xl shadow-amber-950/20 ring-1 ring-amber-500/30'
                  : 'bg-slate-900/90 border-slate-800 hover:border-amber-400/50 shadow-lg'
              }`}
            >
              {/* Flipkart / Amazon style Discount / Special Offer Ribbon */}
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 rounded bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[10px] sm:text-[11px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                  <Star className="w-3 h-3 fill-slate-950" />
                  {isHi ? plan.badge || 'लोकप्रिय डील' : plan.badge || 'BESTSELLER'}
                </span>

                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" />
                  {isHi ? 'हर 6h में रिटर्न' : '6h Auto Payout'}
                </span>
              </div>

              <div>
                {/* Plan Title & Subtag */}
                <div className="mb-3">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                    {isHi ? plan.tagHi : plan.tag}
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-white mt-0.5 group-hover:text-amber-300 transition-colors">
                    {isHi ? plan.nameHi : plan.name}
                  </h3>
                </div>

                {/* E-Commerce Price / ROI Showcase Box */}
                <div className="bg-slate-950/90 rounded-xl p-3.5 border border-slate-800 mb-4 shadow-inner">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                        {isHi ? 'दैनिक ब्याज (ROI):' : 'Daily Earnings:'}
                      </div>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-3xl font-black text-emerald-400 font-mono tracking-tight">
                          {plan.dailyRoiPercent}%
                        </span>
                        <span className="text-xs text-slate-400 font-bold">
                          {isHi ? '/ प्रतिदिन' : '/ Day'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                        {isHi ? 'कुल संचयी लाभ:' : 'Total Growth:'}
                      </div>
                      <span className="text-base font-black text-amber-400 font-mono">
                        +{totalRoi.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Amazon style bullet details */}
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-xs">
                    <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-medium">
                        {isHi ? 'अवधि (Duration):' : 'Duration:'}
                      </span>
                      <span className="font-extrabold text-white font-mono text-xs sm:text-sm">
                        {plan.durationDays} {isHi ? 'दिन' : 'Days'}
                      </span>
                    </div>

                    <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-medium">
                        {isHi ? '6 घंटे का चक्र:' : '6-Hour Return:'}
                      </span>
                      <span className="font-extrabold text-emerald-400 font-mono text-xs sm:text-sm">
                        +{cycleRoi}% / 6h
                      </span>
                    </div>
                  </div>
                </div>

                {/* Investment Price Range Bar (Flipkart Price tag) */}
                <div className="space-y-1.5 text-xs mb-4 bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/60">
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="font-medium">{isHi ? 'न्यूनतम निवेश (Min):' : 'Min Deposit:'}</span>
                    <span className="font-mono font-black text-white text-sm">
                      {formatINR(plan.minAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="font-medium">{isHi ? 'अधिकतम निवेश (Max):' : 'Max Deposit:'}</span>
                    <span className="font-mono font-black text-white text-sm">
                      {formatINR(plan.maxAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400 pt-1 border-t border-slate-800/50">
                    <span className="font-medium">{isHi ? 'रिफंड सुरक्षा:' : 'Security:'}</span>
                    <span className="font-bold text-emerald-400 flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      {isHi ? '100% मूलधन सुरक्षित' : '100% Principal Safe'}
                    </span>
                  </div>
                </div>

                {/* Key Benefits List */}
                <ul className="space-y-1.5 text-xs text-slate-300 border-t border-slate-800/80 pt-3 mb-5">
                  {(isHi ? plan.featuresHi : plan.features).map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-snug">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Flipkart / Amazon Instant Buy Button */}
              <button
                id={`btn-plan-invest-${plan.id}`}
                onClick={() => onSelectPlan(plan)}
                className={`w-full py-3 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg hover:scale-[1.02] active:scale-98 ${
                  isFeatured
                    ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-amber-500/20'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/20'
                }`}
              >
                <span>{isHi ? '⚡ अभी निवेश करें (Buy Deal)' : '⚡ Invest Now (Buy Deal)'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
