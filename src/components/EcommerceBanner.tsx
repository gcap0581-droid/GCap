import React, { useState } from 'react';
import {
  Search,
  ShoppingCart,
  Zap,
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
  wallet: Wallet;
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
      tagColor: 'bg-amber-400 text-slate-950 font-black',
      title: isHi ? 'शॉर्ट टर्म प्लान — 641 दिन लॉक • हर 6 घंटे में 0.04% GP' : 'Short Term Plan — 641-Day Lock • 0.04% GP Every 6 Hours',
      desc: isHi
        ? 'न्यूनतम ₹1,00,000 निवेश (नो मैक्स लिमिट) • हर 6h में 0.04% GP ऑटो-क्रेडिट • 641 दिन परिपक्वता पर पूरा मूलधन + रिटर्न प्रमाण पत्र'
        : 'Min ₹1,00,000 Deposit (No Max Limit) • 0.04% GP auto-credited every 6 hours • Full Principal + Certificate at 641 days',
      badgeText: '0.16%/DAY',
      badgeSub: isHi ? '641 दिन लॉक' : '641-Day Maturity',
      ctaText: isHi ? 'शॉर्ट टर्म प्लान चुनें' : 'View Short Term Plan',
      targetTab: 'plans' as const,
      gradient: 'from-amber-600/30 via-slate-900 to-emerald-950/40 border-amber-500/40',
    },
    {
      id: 'deal-long-term',
      tag: isHi ? '👑 लॉन्ग टर्म निवेश व रॉयल्टी प्लान (365 दिन)' : '👑 LONG TERM & ROYALTY PLAN (365 DAYS)',
      tagColor: 'bg-emerald-400 text-slate-950 font-black',
      title: isHi ? 'लॉन्ग टर्म प्लान — 365 दिन लॉक • हर 6 घंटे में 0.03% GP + 5-वर्ष रॉयल्टी' : 'Long Term Plan — 365-Day Lock • 0.03% GP Every 6 Hours + Royalty',
      desc: isHi
        ? 'निवेश सीमा ₹50,000 - ₹1,00,000 • 365 दिन पर मूलधन वापसी या 1461 दिन रॉयल्टी विकल्प (1825 दिन तक लगातार रॉयल्टी अर्निंग)'
        : 'Deposit ₹50,000 - ₹1,00,000 • 365-day exit or 1461-day Royalty Pathway (earn continuous royalty for 1825 days)',
      badgeText: '0.12%/DAY',
      badgeSub: isHi ? '365 दिन + रॉयल्टी' : '365D + Royalty',
      ctaText: isHi ? 'लॉन्ग टर्म प्लान चुनें' : 'View Long Term Plan',
      targetTab: 'plans' as const,
      gradient: 'from-emerald-600/30 via-slate-900 to-teal-950/40 border-emerald-500/40',
    },
    {
      id: 'deal-deposit',
      tag: isHi ? '⚡ इंस्टेंट UPI डिपॉजिट' : '⚡ INSTANT UPI 0% FEE',
      tagColor: 'bg-cyan-400 text-slate-950 font-black',
      title: isHi ? '0% शुल्क पर मिनटों में पैसे जोड़ें' : 'Zero Fee Instant UPI & QR Deposit',
      desc: isHi
        ? 'PhonePe, Google Pay, Paytm व सभी UPI ऐप्स से डायरेक्ट जमा • 100% सुरक्षित गेटवे'
        : 'Instant deposit via PhonePe, GPay, Paytm & bank transfer with 100% security',
      badgeText: '0% FEE',
      badgeSub: isHi ? 'तत्काल क्रेडिट' : 'Instant Credit',
      ctaText: isHi ? 'पैसे जोड़ें (Deposit)' : 'Add Funds Now',
      targetTab: 'wallet' as const,
      action: onOpenDeposit,
      gradient: 'from-cyan-600/30 via-slate-900 to-blue-950/40 border-cyan-500/40',
    },
  ];

  const currentDeal = deals[activeSlide];

  return (
    <div className="space-y-3">
      {/* Flipkart / Amazon Style Hero Banner Slider */}
      <div className={`relative overflow-hidden rounded-2xl border bg-gradient-to-r ${currentDeal.gradient} p-4 sm:p-6 shadow-xl transition-all duration-300`}>
        {/* Background glow orbs */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/3 -top-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-[10px] sm:text-xs uppercase px-2.5 py-0.5 rounded-md shadow-sm ${currentDeal.tagColor}`}>
                {currentDeal.tag}
              </span>
              <span className="text-[10px] text-slate-300 bg-slate-950/60 px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3 text-amber-400" />
                {isHi ? 'सीमित समय ऑफर' : 'Limited Period Offer'}
              </span>
            </div>

            <h2 className="text-base sm:text-xl md:text-2xl font-black text-white tracking-tight leading-snug">
              {currentDeal.title}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {currentDeal.desc}
            </p>

            {/* Micro action tags */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-300">
              <span className="flex items-center gap-1 bg-slate-950/50 px-2 py-1 rounded border border-slate-800">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                {isHi ? '100% मूलधन सुरक्षित' : '100% Principal Safe'}
              </span>
              <span className="flex items-center gap-1 bg-slate-950/50 px-2 py-1 rounded border border-slate-800">
                <Zap className="w-3 h-3 text-amber-400" />
                {isHi ? 'हर 6 घंटे में रिटर्न' : 'Payout Every 6h'}
              </span>
              <span className="flex items-center gap-1 bg-slate-950/50 px-2 py-1 rounded border border-slate-800">
                <Percent className="w-3 h-3 text-cyan-400" />
                {isHi ? '0% निकासी चार्ज' : '0% Withdrawal Charge'}
              </span>
            </div>
          </div>

          {/* Right side Deal Badge & Button */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between w-full md:w-auto gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/80">
            <div className="text-left sm:text-right">
              <div className="text-xl sm:text-3xl font-black text-emerald-400 font-mono tracking-tight">
                {currentDeal.badgeText}
              </div>
              <div className="text-[10px] sm:text-xs text-slate-400 uppercase font-bold tracking-wider">
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
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <span>{currentDeal.ctaText}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Carousel Dots */}
        <div className="flex items-center justify-center gap-1.5 pt-3 mt-3 border-t border-slate-800/50">
          {deals.map((deal, idx) => (
            <button
              key={deal.id}
              onClick={() => setActiveSlide(idx)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                activeSlide === idx ? 'w-6 bg-amber-400' : 'w-2 bg-slate-700 hover:bg-slate-500'
              }`}
              title={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Amazon / Flipkart Style Category Quick Tiles Bar */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {[
          {
            id: 'plans',
            title: isHi ? 'सुपर प्लान्स' : 'Super Plans',
            sub: isHi ? '641D / 365D' : 'Daily ROI',
            icon: Flame,
            badge: 'HOT',
            color: 'from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400',
            badgeBg: 'bg-amber-500 text-slate-950',
            action: () => onNavigateTab('plans'),
          },
          {
            id: 'investments',
            title: isHi ? 'माई पोर्टफोलियो' : 'My Portfolio',
            sub: isHi ? 'सक्रिय निवेश' : 'Active Growth',
            icon: TrendingUp,
            badge: 'LIVE',
            color: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400',
            badgeBg: 'bg-emerald-500 text-slate-950',
            action: () => onNavigateTab('investments'),
          },
          {
            id: 'deposit',
            title: isHi ? 'पैसे जोड़ें' : 'Add Funds',
            sub: isHi ? 'Instant UPI' : '0% Charge',
            icon: PlusCircle,
            badge: '0% FEE',
            color: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 text-cyan-400',
            badgeBg: 'bg-cyan-500 text-slate-950',
            action: onOpenDeposit,
          },
          {
            id: 'withdraw',
            title: isHi ? 'निकासी' : 'Withdraw',
            sub: isHi ? 'सीधे बैंक / UPI' : 'Instant Payout',
            icon: ArrowDownToLine,
            badge: 'FAST',
            color: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400',
            badgeBg: 'bg-purple-500 text-white',
            action: onOpenWithdraw,
          },
          {
            id: 'calculator',
            title: isHi ? 'कैलकुलेटर' : 'Calculator',
            sub: isHi ? 'मुनाफा गिनें' : 'Check Returns',
            icon: Sparkles,
            badge: 'ROI',
            color: 'from-teal-500/20 to-teal-600/10 border-teal-500/30 text-teal-400',
            badgeBg: 'bg-teal-500 text-slate-950',
            action: () => onNavigateTab('calculator'),
          },
          {
            id: 'wallet',
            title: isHi ? 'वॉलेट लेजर' : 'Passbook',
            sub: formatINR(wallet.cashBalance),
            icon: Tag,
            badge: 'LEDGER',
            color: 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/30 text-indigo-400',
            badgeBg: 'bg-indigo-500 text-white',
            action: () => onNavigateTab('wallet'),
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={item.action}
              className={`p-2.5 sm:p-3 rounded-xl bg-gradient-to-b ${item.color} border hover:border-slate-600 transition-all cursor-pointer text-left flex flex-col justify-between group relative overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <div className="p-1.5 rounded-lg bg-slate-950/70 border border-slate-800 text-white group-hover:scale-110 transition-transform">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className={`text-[8px] sm:text-[9px] font-black px-1.5 py-0.2 rounded font-mono ${item.badgeBg}`}>
                  {item.badge}
                </span>
              </div>
              <div>
                <div className="font-bold text-white text-xs sm:text-sm tracking-tight truncate">
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
