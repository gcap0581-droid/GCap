import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Tag,
  ShieldCheck,
  ChevronRight,
  Flame,
  ArrowDownToLine,
  PlusCircle,
  Clock,
  Sparkles,
  Percent,
} from 'lucide-react';
import { Language, Wallet } from '../types';
import { formatINR } from '../utils/storage';

interface EcommerceBannerProps {
  language: Language;
  wallet?: Wallet | null;
  onNavigateTab: (tab: 'dashboard' | 'plans' | 'investments' | 'wallet' | 'calculator' | 'rules') => void;
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onSelectPlanByName?: (planName: string) => void;
}

export const EcommerceBanner: React.FC<EcommerceBannerProps> = ({
  language,
  wallet,
  onNavigateTab,
  onOpenDeposit,
  onOpenWithdraw,
}) => {
  const isHi = language === 'hi';
  const [activeSlide, setActiveSlide] = useState(0);

  const deals = [
    {
      id: 'deal-short-term',
      tag: isHi ? '⚡ शॉर्ट टर्म निवेश प्लान (641 दिन)' : '⚡ SHORT TERM INVESTMENT PLAN (641 DAYS)',
      tagColor: 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black',
      title: isHi ? 'शॉर्ट टर्म प्लान (641D लॉक) • हर 6 घंटे 0.040% GP' : 'Short Term Plan (641D Lock) • 0.040% GP Every 6h',
      desc: isHi
        ? 'न्यूनतम ₹1,00,000 • हर 6h में 0.040% GP ऑटो-क्रेडिट • परिपक्वता पर पूरा मूलधन वापसी'
        : 'Min ₹1,00,000 • 0.040% GP auto-credited every 6h • Full Principal return at maturity',
      badgeText: '0.160%/DAY',
      badgeSub: isHi ? '641 दिन लॉक' : '641-Day Maturity',
      ctaText: isHi ? 'शॉर्ट टर्म प्लान चुनें' : 'View Short Term Plan',
      targetTab: 'plans' as const,
      gradient: 'from-amber-600/30 via-slate-900/90 to-emerald-950/40 border-amber-500/40',
    },
    {
      id: 'deal-long-term',
      tag: isHi ? '👑 लॉन्ग टर्म निवेश व रॉयल्टी प्लान (365 दिन)' : '👑 LONG TERM & ROYALTY PLAN (365 DAYS)',
      tagColor: 'bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-black',
      title: isHi ? 'लॉन्ग टर्म प्लान (365D लॉक) • हर 6 घंटे 0.033% GP' : 'Long Term Plan (365D Lock) • 0.033% GP Every 6h',
      desc: isHi
        ? 'सीमा ₹10,000 - ₹1,00,000 • 365D पर मूलधन वापसी या 1461D रॉयल्टी पाथवे विकल्प'
        : 'Limit ₹10k - ₹1L • 365-day exit or 1461-day Royalty Pathway options',
      badgeText: '0.132%/DAY',
      badgeSub: isHi ? '365 दिन + रॉयल्टी' : '365D + Royalty',
      ctaText: isHi ? 'लॉन्ग टर्म प्लान चुनें' : 'View Long Term Plan',
      targetTab: 'plans' as const,
      gradient: 'from-emerald-600/30 via-slate-900/90 to-teal-950/40 border-emerald-500/40',
    },
    {
      id: 'deal-deposit',
      tag: isHi ? '⚡ इंस्टेंट UPI (केवल 2% शुल्क)' : '⚡ INSTANT UPI 2% FEE ONLY',
      tagColor: 'bg-gradient-to-r from-cyan-400 to-blue-400 text-slate-950 font-black',
      title: isHi ? 'केवल 2% शुल्क पर मिनटों में पैसे जोड़ें' : 'Instant UPI & QR Deposit (2% Fee Only)',
      desc: isHi
        ? 'PhonePe, Google Pay, Paytm व सभी UPI ऐप्स से डायरेक्ट जमा • 100% सुरक्षित'
        : 'Instant deposit via PhonePe, GPay, Paytm & UPI with 100% security',
      badgeText: '2% FEE ONLY',
      badgeSub: isHi ? 'तत्काल क्रेडिट' : 'Instant Credit',
      ctaText: isHi ? 'पैसे जोड़ें (Deposit)' : 'Add Funds Now',
      targetTab: 'wallet' as const,
      action: onOpenDeposit,
      gradient: 'from-cyan-600/30 via-slate-900/90 to-blue-950/40 border-cyan-500/40',
    },
  ];

  const [isPaused, setIsPaused] = useState(false);

  // Auto-scroll banner every 4 seconds continuously, pausing on touch/hover
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % deals.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [deals.length, isPaused]);

  const currentDeal = deals[activeSlide];

  return (
    <div className="space-y-3.5">
      {/* Hero Showcase Banner Slider with Fixed Frame Height and No Clipping */}
      <div 
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        className={`relative overflow-hidden rounded-3xl border bg-gradient-to-r ${currentDeal.gradient} p-3.5 sm:p-5 shadow-2xl shadow-black/50 backdrop-blur-2xl h-[245px] sm:h-[215px] flex flex-col justify-between select-none`}
      >
        {/* Background glow orbs */}
        <div className="absolute -right-10 -bottom-10 w-52 h-52 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/3 -top-10 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2.5 relative z-10 h-full overflow-hidden">
          <div className="space-y-1.5 max-w-2xl flex-1 overflow-hidden">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={`text-[10px] sm:text-xs uppercase px-2.5 py-0.5 rounded-full shadow-md font-extrabold ${currentDeal.tagColor}`}>
                {currentDeal.tag}
              </span>
              <span className="text-[10px] text-slate-300 bg-slate-950/80 px-2 py-0.5 rounded-full border border-slate-800 flex items-center gap-1 font-mono shadow-sm">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                {isHi ? 'सीमित समय ऑफर' : 'Limited Period Offer'}
              </span>
            </div>

            <h2 className="text-sm sm:text-base md:text-lg font-black text-white tracking-tight leading-snug line-clamp-1 font-display">
              {currentDeal.title}
            </h2>

            <p className="text-[11px] sm:text-xs text-slate-300 leading-snug line-clamp-2 h-[32px] sm:h-[36px] overflow-hidden">
              {currentDeal.desc}
            </p>

            {/* Micro action tags - Horizontal Scrollable Row without Clipping */}
            <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none w-full pt-0.5 text-[10px] sm:text-[11px] text-slate-300">
              <span className="flex items-center gap-1 bg-slate-950/70 px-2 py-0.5 rounded-lg border border-slate-800 shadow-sm font-medium shrink-0">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                {isHi ? '100% मूलधन सुरक्षित' : '100% Safe'}
              </span>
              <span className="flex items-center gap-1 bg-slate-950/70 px-2 py-0.5 rounded-lg border border-slate-800 shadow-sm font-medium shrink-0">
                <Flame className="w-3 h-3 text-amber-400" />
                {isHi ? 'हर 6h में रिटर्न' : 'Every 6h'}
              </span>
              <span className="flex items-center gap-1 bg-slate-950/70 px-2 py-0.5 rounded-lg border border-slate-800 shadow-sm font-medium shrink-0">
                <Percent className="w-3 h-3 text-cyan-400" />
                {isHi ? '0% निकासी शुल्क' : '0% Fee'}
              </span>
            </div>
          </div>

          {/* Right side Deal Badge & Button */}
          <div className="flex items-center md:flex-col md:items-end justify-between w-full md:w-auto gap-2.5 shrink-0 pt-1.5 md:pt-0 border-t md:border-t-0 border-slate-800/80">
            <div className="text-left md:text-right">
              <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono tracking-tight leading-none">
                {currentDeal.badgeText}
              </div>
              <div className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                {currentDeal.badgeSub}
              </div>
            </div>

            <button
              onClick={() => {
                if (currentDeal.action) {
                  currentDeal.action();
                } else {
                  onNavigateTab(currentDeal.targetTab);
                }
              }}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-amber-950/30 transition-all cursor-pointer active:scale-95"
            >
              <span>{currentDeal.ctaText}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Carousel Dots */}
        <div className="flex items-center justify-center gap-2 pt-1.5 shrink-0 border-t border-slate-800/50">
          {deals.map((deal, idx) => (
            <button
              key={deal.id}
              onClick={() => setActiveSlide(idx)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                activeSlide === idx ? 'w-8 bg-gradient-to-r from-amber-400 to-yellow-400 shadow-sm' : 'w-2 bg-slate-700 hover:bg-slate-500'
              }`}
              title={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Category Quick Tiles Bar */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-2.5">
        {[
          {
            id: 'plans',
            title: isHi ? 'सुपर प्लान्स' : 'Super Plans',
            sub: isHi ? '641D / 365D' : 'Daily ROI',
            icon: Flame,
            badge: 'HOT',
            color: 'from-amber-500/20 via-slate-900/90 to-slate-950/90 border-amber-500/40 text-amber-400',
            badgeBg: 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950',
            action: () => onNavigateTab('plans'),
          },
          {
            id: 'investments',
            title: isHi ? 'माई पोर्टफोलियो' : 'My Portfolio',
            sub: isHi ? 'सक्रिय निवेश' : 'Active Growth',
            icon: TrendingUp,
            badge: 'LIVE',
            color: 'from-emerald-500/20 via-slate-900/90 to-slate-950/90 border-emerald-500/40 text-emerald-400',
            badgeBg: 'bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950',
            action: () => onNavigateTab('investments'),
          },
          {
            id: 'deposit',
            title: isHi ? 'पैसे जोड़ें' : 'Add Funds',
            sub: isHi ? 'Instant UPI' : '0% Charge',
            icon: PlusCircle,
            badge: '0% FEE',
            color: 'from-cyan-500/20 via-slate-900/90 to-slate-950/90 border-cyan-500/40 text-cyan-400',
            badgeBg: 'bg-gradient-to-r from-cyan-400 to-blue-400 text-slate-950',
            action: onOpenDeposit,
          },
          {
            id: 'withdraw',
            title: isHi ? 'निकासी' : 'Withdraw',
            sub: isHi ? 'सीधे बैंक / UPI' : 'Instant Payout',
            icon: ArrowDownToLine,
            badge: 'FAST',
            color: 'from-purple-500/20 via-slate-900/90 to-slate-950/90 border-purple-500/40 text-purple-300',
            badgeBg: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
            action: onOpenWithdraw,
          },
          {
            id: 'calculator',
            title: isHi ? 'कैलकुलेटर' : 'Calculator',
            sub: isHi ? 'मुनाफा गिनें' : 'Check Returns',
            icon: Sparkles,
            badge: 'ROI',
            color: 'from-teal-500/20 via-slate-900/90 to-slate-950/90 border-teal-500/40 text-teal-400',
            badgeBg: 'bg-teal-500/20 text-teal-300 border border-teal-500/40',
            action: () => onNavigateTab('calculator'),
          },
          {
            id: 'wallet',
            title: isHi ? 'वॉलेट लेजर' : 'Passbook',
            sub: formatINR(wallet?.cashBalance || 0),
            icon: Tag,
            badge: 'LEDGER',
            color: 'from-indigo-500/20 via-slate-900/90 to-slate-950/90 border-indigo-500/40 text-indigo-400',
            badgeBg: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40',
            action: () => onNavigateTab('wallet'),
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={item.action}
              className={`p-3 rounded-2xl bg-gradient-to-b ${item.color} border shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer text-left flex flex-col justify-between group relative overflow-hidden active:scale-95`}
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-white group-hover:scale-105 transition-transform shadow-inner">
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`text-[8px] sm:text-[9px] font-black px-2 py-0.5 rounded-full font-mono shadow-sm ${item.badgeBg}`}>
                  {item.badge}
                </span>
              </div>
              <div>
                <div className="font-extrabold text-white text-xs sm:text-sm tracking-tight truncate font-display">
                  {item.title}
                </div>
                <div className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                  {item.sub}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
