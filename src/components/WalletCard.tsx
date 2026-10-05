import React from 'react';
import {
  Wallet as WalletIcon,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
  TrendingUp,
  Clock,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Language, Wallet, AppRules } from '../types';
import { formatINR } from '../utils/storage';

interface WalletCardProps {
  wallet?: Wallet | null;
  language: Language;
  rules?: AppRules;
  activeInvestmentsCount: number;
  unclaimedReturnsTotal: number;
  dailyProjectedTotal: number;
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onOpenSwap: () => void;
  onOpenGpTransfer?: () => void;
  onClaimAllReturns: () => void;
}

export const WalletCard: React.FC<WalletCardProps> = ({
  wallet: rawWallet,
  language,
  rules,
  activeInvestmentsCount,
  unclaimedReturnsTotal,
  dailyProjectedTotal,
  onOpenDeposit,
  onOpenWithdraw,
  onOpenSwap,
  onOpenGpTransfer,
  onClaimAllReturns,
}) => {
  const isHi = language === 'hi';
  const wallet: Wallet = rawWallet || {
    cashBalance: 0,
    gpBalance: 0,
    totalInvested: 0,
    totalEarned: 0,
    royaltyEarned: 0,
    pendingWithdrawals: 0,
    pendingDeposits: 0,
  };
  const gpRate = rules?.gpRatePerRupee && rules.gpRatePerRupee > 0 ? rules.gpRatePerRupee : 1.0;
  const hasPendingApproval = (wallet.pendingDeposits || 0) > 0;

  return (
    <div className="space-y-4">
      {/* Pending Deposit Verification Banner (Rule 2: Wait for approval) */}
      {hasPendingApproval && (
        <div className="bg-gradient-to-r from-amber-950/80 via-slate-900/90 to-amber-950/50 border border-amber-500/50 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl shadow-amber-950/30 backdrop-blur-xl animate-in fade-in">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/40 shadow-inner">
              <Clock className="w-6 h-6 animate-spin" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-300 text-sm sm:text-base">
                  {isHi ? '⏳ सत्यापन प्रक्रियाधीन (Wait for approval):' : '⏳ Verification Pending (Wait for approval):'}
                </span>
                <span className="font-mono font-black text-white text-base sm:text-lg">
                  {formatINR(wallet.pendingDeposits || 0)}
                </span>
              </div>
              <p className="text-xs text-amber-200/90 mt-0.5 leading-relaxed">
                {isHi
                  ? 'कंपनी खाते में भेजी गई जमा राशि सत्यापन की प्रतीक्षा में है। बैंक पावती कन्फर्म होते ही यह राशि आपके वॉलेट कैश में क्रेडिट हो जाएगी।'
                  : 'Your bank transfer deposit is awaiting verification. Once confirmed, funds will reflect directly in your cash balance.'}
              </p>
            </div>
          </div>

          <div className="px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black shrink-0 self-start sm:self-auto shadow-sm">
            {isHi ? 'सत्यापन जारी (Wait for approval)' : 'Wait for approval'}
          </div>
        </div>
      )}

      {/* Daily Engine Notice */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900/90 to-slate-950/90 border border-emerald-500/30 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm shadow-lg backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30 shadow-inner">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-white">
              {isHi ? 'डिपॉजिट एवं GP निवेश प्रणाली सक्रिय:' : 'Deposit & GP Investment System Active:'}
            </span>{' '}
            <span className="text-slate-300">
              {isHi
                ? 'कंपनी खाते में राशि जमा करें, एडमिन अप्रूवल के बाद कभी भी GP बनाएं और प्लान एक्टिवेट करें।'
                : 'Deposit to company account, swap approved balance to GP, and purchase plans anytime.'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-emerald-300 font-mono text-xs shrink-0 self-end sm:self-auto bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-700/50 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="font-bold">{isHi ? 'सिस्टम सुरक्षित' : 'Auto-Payout: Active'}</span>
        </div>
      </div>

      {/* Main Grid Metrics: 4 Bento Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Available Cash Balance */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900/95 via-slate-900/85 to-slate-950/95 border border-emerald-500/30 p-5 shadow-xl shadow-black/50 flex flex-col justify-between hover:border-emerald-500/50 transition-all duration-300 group">
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/25 transition-all"></div>
          
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2 text-slate-300 text-xs font-semibold">
                <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 shadow-inner">
                  <WalletIcon className="w-4 h-4" />
                </div>
                <span>{isHi ? 'वॉलेट कैश बैलेंस' : 'Cash Balance'}</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30 shadow-sm">
                {isHi ? 'GP स्वैप योग्य' : 'For GP Swap'}
              </span>
            </div>

            <div className="mb-4">
              <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
                {formatINR(wallet.cashBalance)}
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                {isHi
                  ? 'कंपनी खाते से अप्रूव्ड राशि। इसे GP में बदलकर कभी भी प्लान खरीद सकते हैं।'
                  : 'Approved funds. Swap into GP anytime to purchase investment plans.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800/80">
            <button
              id="btn-card-deposit"
              onClick={onOpenDeposit}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-extrabold text-xs shadow-lg shadow-emerald-900/40 active:scale-95 transition-all cursor-pointer"
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>{isHi ? '+ पैसे जोड़ें' : 'Add Cash'}</span>
            </button>
            <button
              id="btn-card-swap"
              onClick={onOpenSwap}
              disabled={wallet.cashBalance <= 0}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-900/40 active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>🔄 {isHi ? 'GP बनाएं' : 'Swap GP'}</span>
            </button>
          </div>
        </div>

        {/* Card 2: GP Balance (G-Points) */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900/95 via-slate-900/85 to-slate-950/95 border border-amber-500/40 p-5 shadow-xl shadow-black/50 flex flex-col justify-between hover:border-amber-400/60 transition-all duration-300 group">
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-500/20 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/30 transition-all"></div>

          <div>
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2 text-slate-300 text-xs font-semibold">
                <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-inner">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span>{isHi ? 'उपलब्ध GP बैलेंस' : 'G-Points (GP)'}</span>
              </div>
              <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/40 shadow-sm">
                ₹1 = {gpRate} GP
              </span>
            </div>

            <div className="mb-4">
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 tracking-tight font-display flex items-center gap-2">
                <span>{(wallet.gpBalance || 0).toLocaleString('en-IN')}</span>
                <span className="text-xs font-black text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-500/30">GP</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                {isHi
                  ? 'प्लान खरीदने के लिए तैयार। आप इच्छानुसार किसी भी प्लान में निवेश कर सकते हैं।'
                  : 'Ready to activate plans. Use GP to purchase any available investment tier.'}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] gap-2">
            <span className="text-slate-400 font-medium">{isHi ? 'P2P ट्रांसफर:' : 'P2P Transfer:'}</span>
            {onOpenGpTransfer && (
              <button
                id="btn-card-gp-transfer"
                onClick={onOpenGpTransfer}
                className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 text-amber-300 border border-amber-500/40 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <span>⇄ GP QR / Send</span>
              </button>
            )}
          </div>
        </div>

        {/* Card 3: Active Capital Invested */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900/95 via-slate-900/85 to-slate-950/95 border border-cyan-500/30 p-5 shadow-xl shadow-black/50 flex flex-col justify-between hover:border-cyan-400/50 transition-all duration-300 group">
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/25 transition-all"></div>

          <div>
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2 text-slate-300 text-xs font-semibold">
                <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-inner">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <span>{isHi ? 'सक्रिय निवेश राशि' : 'Active Invested'}</span>
              </div>
              <span className="text-[10px] font-bold text-cyan-300 bg-cyan-500/15 px-2.5 py-0.5 rounded-full border border-cyan-500/30 shadow-sm">
                {activeInvestmentsCount} {isHi ? 'प्लान' : 'Plans'}
              </span>
            </div>

            <div className="mb-4">
              <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
                {formatINR(wallet.totalInvested)}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-cyan-300/90 mt-1">
                <Zap className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>
                  {isHi ? 'दैनिक रिटर्न:' : 'Daily Payout:'}{' '}
                  <strong className="text-white font-mono font-black">{formatINR(dailyProjectedTotal)}/दिन</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>{isHi ? 'रिटर्न आवृत्ति:' : 'Payout:'}</span>
            <span className="text-cyan-300 font-bold bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">{isHi ? 'प्रति 24 घंटे' : 'Every 24 Hours'}</span>
          </div>
        </div>

        {/* Card 4: Withdrawable Earnings & Royalty (Rules 1, 2, 3) */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900/95 via-slate-900/85 to-slate-950/95 border border-purple-500/30 p-5 shadow-xl shadow-black/50 flex flex-col justify-between hover:border-purple-400/50 transition-all duration-300 group">
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-purple-500/15 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-500/25 transition-all"></div>

          <div>
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2 text-slate-300 text-xs font-semibold">
                <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30 shadow-inner">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span>{isHi ? 'निकासी योग्य बैलेंस' : 'Withdrawable Balances'}</span>
              </div>
              <span className="text-[10px] font-bold text-purple-300 bg-purple-500/15 px-2.5 py-0.5 rounded-full border border-purple-500/30 shadow-sm">
                {isHi ? 'नियम 1-3' : 'Rules 1-3'}
              </span>
            </div>

            <div className="mb-3 space-y-2">
              <div className="flex items-center justify-between bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/90 shadow-inner">
                <div>
                  <span className="text-[11px] text-slate-400 block">{isHi ? 'अर्निंग (1 से 5 तारीख):' : 'Earnings (1st - 5th):'}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-lg font-black font-display text-purple-300">{formatINR(wallet.totalEarned || 0)}</span>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                  1-5th
                </span>
              </div>

              {(wallet.royaltyEarned !== undefined && wallet.royaltyEarned > 0) && (
                <div className="flex items-center justify-between bg-slate-950/70 p-2.5 rounded-xl border border-amber-500/30 shadow-inner">
                  <div>
                    <span className="text-[11px] text-slate-400 block">{isHi ? 'रॉयल्टी (6 से 10 तारीख):' : 'Royalty (6th - 10th):'}</span>
                    <span className="text-lg font-black font-display text-amber-400">{formatINR(wallet.royaltyEarned || 0)}</span>
                  </div>
                  <span className="text-[10px] px-2 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                    6-10th
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
            <p className="text-[10px] text-slate-400 w-full text-center font-medium">
              {isHi ? 'निकासी केवल निकासी पृष्ठ से संभव है।' : 'Withdrawals only possible from withdrawal page.'}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
