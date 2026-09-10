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
  wallet: Wallet;
  language: Language;
  rules?: AppRules;
  activeInvestmentsCount: number;
  unclaimedReturnsTotal: number;
  dailyProjectedTotal: number;
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onOpenSwap: () => void;
  onClaimAllReturns: () => void;
}

export const WalletCard: React.FC<WalletCardProps> = ({
  wallet,
  language,
  rules,
  activeInvestmentsCount,
  unclaimedReturnsTotal,
  dailyProjectedTotal,
  onOpenDeposit,
  onOpenWithdraw,
  onOpenSwap,
  onClaimAllReturns,
}) => {
  const isHi = language === 'hi';
  const gpRate = rules?.gpRatePerRupee && rules.gpRatePerRupee > 0 ? rules.gpRatePerRupee : 1.0;
  const hasPendingApproval = (wallet.pendingDeposits || 0) > 0;

  return (
    <div className="space-y-4">
      {/* Pending Deposit Verification Banner (Rule 2: Wait for approval) */}
      {hasPendingApproval && (
        <div className="bg-gradient-to-r from-amber-950/70 via-slate-900 to-amber-950/40 border border-amber-500/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-amber-950/30 animate-in fade-in">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
              <Clock className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-300 text-sm sm:text-base">
                  {isHi ? '⏳ सत्यापन प्रक्रियाधीन (Wait for approval):' : '⏳ Verification Pending (Wait for approval):'}
                </span>
                <span className="font-mono font-extrabold text-white text-base sm:text-lg">
                  {formatINR(wallet.pendingDeposits || 0)}
                </span>
              </div>
              <p className="text-xs text-amber-200/80 mt-0.5">
                {isHi
                  ? 'कंपनी खाते में भेजी गई जमा राशि सत्यापन की प्रतीक्षा में है। बैंक पावती कन्फर्म होते ही यह राशि आपके वॉलेट कैश में क्रेडिट हो जाएगी।'
                  : 'Your bank transfer deposit is awaiting verification. Once confirmed, funds will reflect directly in your cash balance.'}
              </p>
            </div>
          </div>

          <div className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold shrink-0 self-start sm:self-auto">
            {isHi ? 'सत्यापन जारी (Wait for approval)' : 'Wait for approval'}
          </div>
        </div>
      )}

      {/* Daily Engine Notice */}
      <div className="bg-gradient-to-r from-emerald-950/50 via-slate-900 to-slate-900 border border-emerald-500/20 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-white">
              {isHi ? 'डिपॉजिट एवं GP निवेश प्रणाली सक्रिय:' : 'Deposit & GP Investment System Active:'}
            </span>{' '}
            <span className="text-slate-300">
              {isHi
                ? 'कंपनी खाते में राशि जमा करें, एडमिन अप्रूवल के बाद कभी भी GP बनाएं और प्लान एक्टिवेट करें।'
                : 'Deposit to company account, swap approved balance to GP, and purchase plans anytime.'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs shrink-0 self-end sm:self-auto bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-800/40">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>{isHi ? 'सिस्टम सुरक्षित' : 'Auto-Payout: Active'}</span>
        </div>
      </div>

      {/* Main Grid Metrics: 4 Bento Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Available Cash Balance */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-5 shadow-xl shadow-black/40 flex flex-col justify-between">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300">
                  <WalletIcon className="w-4 h-4" />
                </div>
                <span>{isHi ? 'वॉलेट कैश बैलेंस' : 'Cash Balance'}</span>
              </div>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                {isHi ? 'GP स्वैप योग्य' : 'For GP Swap'}
              </span>
            </div>

            <div className="mb-4">
              <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
                {formatINR(wallet.cashBalance)}
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                {isHi
                  ? 'कंपनी खाते से अप्रूव्ड राशि। इसे GP में बदलकर कभी भी प्लान खरीद सकते हैं।'
                  : 'Approved funds. Swap into GP anytime to purchase investment plans.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
            <button
              id="btn-card-deposit"
              onClick={onOpenDeposit}
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>{isHi ? '+ पैसे जोड़ें' : 'Add Cash'}</span>
            </button>
            <button
              id="btn-card-swap"
              onClick={onOpenSwap}
              disabled={wallet.cashBalance <= 0}
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>🔄 {isHi ? 'GP बनाएं' : 'Swap GP'}</span>
            </button>
          </div>
        </div>

        {/* Card 2: GP Balance (G-Points) */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/30 p-5 shadow-xl shadow-black/40 flex flex-col justify-between">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span>{isHi ? 'उपलब्ध GP बैलेंस' : 'G-Points (GP)'}</span>
              </div>
              <span className="text-[10px] font-semibold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30">
                ₹1 = {gpRate} GP
              </span>
            </div>

            <div className="mb-4">
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 tracking-tight font-mono flex items-center gap-1.5">
                <span>{(wallet.gpBalance || 0).toLocaleString('en-IN')}</span>
                <span className="text-sm font-bold text-amber-200">GP</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                {isHi
                  ? 'प्लान खरीदने के लिए तैयार। आप इच्छानुसार किसी भी प्लान में निवेश कर सकते हैं।'
                  : 'Ready to activate plans. Use GP to purchase any available investment tier.'}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">{isHi ? 'प्लान खरीद माध्यम:' : 'Plan Purchasing:'}</span>
            <span className="text-emerald-400 font-bold font-mono">{isHi ? 'केवल GP द्वारा' : 'GP Enabled'}</span>
          </div>
        </div>

        {/* Card 3: Active Capital Invested */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-5 shadow-xl shadow-black/40 flex flex-col justify-between">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <span>{isHi ? 'सक्रिय निवेश राशि' : 'Active Invested'}</span>
              </div>
              <span className="text-[10px] font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                {activeInvestmentsCount} {isHi ? 'प्लान' : 'Plans'}
              </span>
            </div>

            <div className="mb-4">
              <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
                {formatINR(wallet.totalInvested)}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-blue-300/90 mt-1">
                <Zap className="w-3 h-3 text-blue-400 shrink-0" />
                <span>
                  {isHi ? 'दैनिक रिटर्न:' : 'Daily Payout:'}{' '}
                  <strong className="text-white font-mono">{formatINR(dailyProjectedTotal)}/दिन</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>{isHi ? 'रिटर्न आवृत्ति:' : 'Payout:'}</span>
            <span className="text-slate-200 font-medium">{isHi ? 'प्रति 24 घंटे' : 'Every 24 Hours'}</span>
          </div>
        </div>

        {/* Card 4: Withdrawable Earnings & Royalty (Rules 1, 2, 3) */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-5 shadow-xl shadow-black/40 flex flex-col justify-between">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span>{isHi ? 'निकासी योग्य बैलेंस' : 'Withdrawable Balances'}</span>
              </div>
              <span className="text-[10px] font-semibold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                {isHi ? 'निकासी नियम 1-3' : 'Rules 1-3'}
              </span>
            </div>

            <div className="mb-3 space-y-2">
              <div className="flex items-center justify-between bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                <div>
                  <span className="text-[11px] text-slate-400 block">{isHi ? 'अर्निंग (1 से 5 तारीख):' : 'Earnings (1st - 5th):'}</span>
                  <span className="text-lg font-bold font-mono text-purple-400">{formatINR(wallet.totalEarned || 0)}</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 font-mono">
                  1-5th
                </span>
              </div>

              {(wallet.royaltyEarned !== undefined && wallet.royaltyEarned > 0) && (
                <div className="flex items-center justify-between bg-slate-950/60 p-2 rounded-lg border border-amber-500/20">
                  <div>
                    <span className="text-[11px] text-slate-400 block">{isHi ? 'रॉयल्टी (6 से 10 तारीख):' : 'Royalty (6th - 10th):'}</span>
                    <span className="text-lg font-bold font-mono text-amber-400">{formatINR(wallet.royaltyEarned || 0)}</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
                    6-10th
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
            {unclaimedReturnsTotal > 0 ? (
              <button
                id="btn-claim-all-returns"
                onClick={onClaimAllReturns}
                className="w-full py-2 px-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm text-center"
              >
                {isHi ? `मुनाफा लें (${formatINR(unclaimedReturnsTotal)})` : `Claim (${formatINR(unclaimedReturnsTotal)})`}
              </button>
            ) : (
              <button
                id="btn-card-withdraw"
                onClick={onOpenWithdraw}
                disabled={(wallet.totalEarned || 0) <= 0 && (wallet.royaltyEarned || 0) <= 0}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-bold text-xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ArrowUpRight className="w-3.5 h-3.5 text-purple-400" />
                <span>{isHi ? 'फंड निकालें (Withdraw)' : 'Withdraw Funds'}</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
