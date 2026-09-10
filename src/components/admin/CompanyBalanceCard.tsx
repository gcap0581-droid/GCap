import React from 'react';
import {
  Building2,
  AlertTriangle,
  PlusCircle,
  MinusCircle,
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldAlert,
  ShieldCheck,
  Zap,
  History,
} from 'lucide-react';
import { CompanyTreasury, Language } from '../../types';
import { formatINR } from '../../utils/storage';
import { DEFAULT_ALERT_THRESHOLD } from '../../utils/treasuryStorage';

interface CompanyBalanceCardProps {
  treasury: CompanyTreasury;
  language: Language;
  onOpenAddModal: () => void;
  onOpenDeductModal: () => void;
  onQuickAdd: (amount: number) => void;
  onOpenHistory?: () => void;
}

export const CompanyBalanceCard: React.FC<CompanyBalanceCardProps> = ({
  treasury,
  language,
  onOpenAddModal,
  onOpenDeductModal,
  onQuickAdd,
  onOpenHistory,
}) => {
  const isHi = language === 'hi';
  const isLowBalance = treasury.balance <= DEFAULT_ALERT_THRESHOLD;

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 relative overflow-hidden shadow-xl ${
        isLowBalance
          ? 'bg-gradient-to-b from-rose-950/40 via-slate-900 to-slate-900 border-rose-500/60 shadow-rose-950/30 ring-2 ring-rose-500/20'
          : 'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-slate-800'
      }`}
    >
      {/* High-priority Low Balance Warning Banner (triggers when balance <= 500000) */}
      {isLowBalance && (
        <div className="bg-gradient-to-r from-rose-600 via-amber-600 to-rose-600 text-white px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg animate-pulse">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider">
                {isHi
                  ? '⚠️ तत्काल एडमिन चेतावनी: कंपनी मुख्य बैलेंस कम है!'
                  : '⚠️ HIGH-PRIORITY ALERT: COMPANY MAIN BALANCE CRITICAL!'}
              </p>
              <p className="text-[11px] text-white/90">
                {isHi
                  ? `बैलेंस ₹${treasury.balance.toLocaleString('en-IN')} हो गया है (सीमा: ₹5,00,000)। यूज़र्स के नए निवेश व पेआउट्स के लिए तुरंत बैलेंस बढ़ाएं!`
                  : `Balance is down to ₹${treasury.balance.toLocaleString('en-IN')} (Threshold: ₹5,00,000). Increase main balance now to ensure uninterrupted user transfers.`}
              </p>
            </div>
          </div>

          <button
            id="btn-alert-quick-increase"
            onClick={onOpenAddModal}
            className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-rose-900 hover:bg-rose-50 text-xs font-black transition-all shadow-md cursor-pointer hover:scale-105"
          >
            <Zap className="w-4 h-4 text-amber-600 fill-amber-500" />
            <span>{isHi ? '⚡ तुरंत मुख्य बैलेंस बढ़ाएं' : '⚡ Add Balance Now'}</span>
          </button>
        </div>
      )}

      <div className="p-5 sm:p-6 space-y-5">
        {/* Top Header info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-lg ${
                isLowBalance
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-rose-500/10'
                  : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-emerald-500/10'
              }`}
            >
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-white">
                  {isHi ? 'कंपनी मुख्य रिज़र्व बैलेंस (Company Main Balance)' : 'Company Main Treasury Balance'}
                </h3>
                {isLowBalance ? (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-black uppercase tracking-wider animate-pulse">
                    <AlertTriangle className="w-3 h-3" />
                    {isHi ? 'लो बैलेंस अलर्ट (<= ₹5 लाख)' : 'Low Balance (<= ₹5L)'}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold">
                    <ShieldCheck className="w-3 h-3" />
                    {isHi ? 'सक्रिय व पर्याप्त' : 'Healthy Reserve'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isHi
                  ? 'यूज़र जब भी इन्वेस्ट करता है, राशि इसी कंपनी बैलेंस से डिडक्ट होकर यूज़र को ट्रांसफर होती है।'
                  : 'Every user investment and payout transfers directly deducted from this central reserve.'}
              </p>
            </div>
          </div>

          {/* Action Buttons: Add Balance & Deduct Balance */}
          <div className="flex items-center gap-2.5">
            <button
              id="btn-admin-add-company-balance"
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/20 cursor-pointer hover:scale-102"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isHi ? '+ बैलेंस बढ़ाएं' : '+ Add Balance'}</span>
            </button>

            <button
              id="btn-admin-deduct-company-balance"
              onClick={onOpenDeductModal}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-950/50 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-500/40 text-xs font-semibold transition-all cursor-pointer"
            >
              <MinusCircle className="w-4 h-4" />
              <span>{isHi ? '- बैलेंस घटाएं' : '- Deduct Balance'}</span>
            </button>
          </div>
        </div>

        {/* Main Balance Display & Alert Threshold indicator */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {isHi ? 'वर्तमान कंपनी मुख्य बैलेंस' : 'Current Liquidity Balance'}
            </span>
            <div className="flex items-baseline gap-3 mt-1">
              <span
                className={`text-3xl sm:text-4xl font-black font-mono tracking-tight ${
                  isLowBalance ? 'text-rose-400 animate-pulse' : 'text-emerald-400'
                }`}
              >
                {formatINR(treasury.balance)}
              </span>
              <span className="text-xs text-slate-400 font-mono">INR</span>
            </div>
          </div>

          {/* Alert Threshold Pill */}
          <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {isHi ? 'अलर्ट थ्रेशोल्ड सीमा' : 'Alert Trigger Threshold'}
              </p>
              <p className="text-xs font-extrabold font-mono text-amber-300">
                ₹{DEFAULT_ALERT_THRESHOLD.toLocaleString('en-IN')}{' '}
                <span className="text-[10px] text-slate-400 font-normal">
                  ({isHi ? '5 लाख पर एडमिन अलर्ट' : '5 Lakhs Alert'})
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Quick Top-Up Presets */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">
              {isHi ? '⚡ त्वरित मुख्य बैलेंस टॉप-अप:' : '⚡ Quick Top-Up:'}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[100000, 200000, 500000, 1000000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => onQuickAdd(amt)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-emerald-950/60 text-slate-300 hover:text-emerald-300 border border-slate-700 hover:border-emerald-500/40 text-[11px] font-mono font-semibold transition-all cursor-pointer"
                >
                  +{formatINR(amt)}
                </button>
              ))}
            </div>
          </div>

          {onOpenHistory && (
            <button
              onClick={onOpenHistory}
              className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-semibold transition-colors cursor-pointer"
            >
              <History className="w-3.5 h-3.5" />
              <span>{isHi ? 'ट्रेजरी पासबुक व हिस्ट्री देखें' : 'View Treasury Ledger'}</span>
            </button>
          )}
        </div>

        {/* Sub-Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-slate-800/80">
          <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/60">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium mb-1">
              <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isHi ? 'कुल एडमिन द्वारा जोड़ा गया' : 'Total Injected by Admin'}</span>
            </div>
            <p className="text-base font-bold font-mono text-emerald-300">
              {formatINR(treasury.totalInjected)}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/60">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isHi ? 'यूज़र्स को डिडक्ट होकर ट्रांसफर' : 'Transferred to Users'}</span>
            </div>
            <p className="text-base font-bold font-mono text-cyan-300">
              {formatINR(treasury.totalTransferredToUsers)}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/60">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium mb-1">
              <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
              <span>{isHi ? 'कुल एडमिन कटौती' : 'Total Deducted'}</span>
            </div>
            <p className="text-base font-bold font-mono text-rose-300">
              {formatINR(treasury.totalDeducted)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
