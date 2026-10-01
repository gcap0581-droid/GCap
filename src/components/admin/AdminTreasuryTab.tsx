import React, { useState } from 'react';
import {
  Building2,
  PlusCircle,
  MinusCircle,
  AlertTriangle,
  RotateCcw,
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingDown,
  ShieldAlert,
  Zap,
  Coins,
  Sparkles,
  ShieldCheck,
  Activity,
  ArrowUpRightFromCircle,
  RefreshCw,
  WalletCards as WalletIcon,
  Copy,
  Check,
  FileText,
  ArrowRight,
  LayoutGrid,
  Table as TableIcon,
  X,
} from 'lucide-react';
import { CompanyTreasury, Language, TreasuryLog } from '../../types';
import { formatINR } from '../../utils/storage';
import { DEFAULT_ALERT_THRESHOLD } from '../../utils/treasuryStorage';

interface AdminTreasuryTabProps {
  treasury?: CompanyTreasury | null;
  logs: TreasuryLog[];
  language: Language;
  onOpenAddModal: () => void;
  onOpenDeductModal: () => void;
  onQuickAdd: (amount: number) => void;
  onResetTreasury: () => void;
  onOpenConvertFeeGpModal?: () => void;
}

export const AdminTreasuryTab: React.FC<AdminTreasuryTabProps> = ({
  treasury: rawTreasury,
  logs,
  language,
  onOpenAddModal,
  onOpenDeductModal,
  onQuickAdd,
  onResetTreasury,
  onOpenConvertFeeGpModal,
}) => {
  const isHi = language === 'hi';
  const treasury: CompanyTreasury = rawTreasury || {
    balance: 0,
    totalInjected: 0,
    totalDeducted: 0,
    lastUpdated: new Date().toISOString(),
    minAlertThreshold: 500000,
    totalTransferredToUsers: 0,
    collectedFeeGpBalance: 0,
    totalFeeGpConverted: 0,
  };
  const isLowBalance = treasury.balance < (treasury.minAlertThreshold || DEFAULT_ALERT_THRESHOLD);
  const collectedFeeGp = treasury.collectedFeeGpBalance || 0;
  const totalConvertedFeeGp = treasury.totalFeeGpConverted || 0;
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'CARDS' | 'TABLE'>('CARDS');
  const [selectedReceiptLog, setSelectedReceiptLog] = useState<TreasuryLog | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyRef = (refId: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(refId);
      setCopiedId(refId);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const getLogTypeBadge = (log: TreasuryLog) => {
    switch (log.type) {
      case 'ADMIN_ADD':
        return {
          label: isHi ? '+ एडमिन टॉप-अप' : 'ADMIN ADD',
          bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          icon: '🟢',
        };
      case 'ADMIN_DEDUCT':
        return {
          label: isHi ? '- एडमिन कटौती' : 'ADMIN DEDUCT',
          bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          icon: '🔻',
        };
      case 'USER_INVESTMENT_DEDUCT':
        return {
          label: isHi ? 'यूज़र निवेश ट्रांसफर' : 'USER INVEST TRF',
          bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          icon: '⚡',
        };
      case 'USER_PAYOUT_DEDUCT':
        return {
          label: isHi ? 'पेआउट ट्रांसफर' : 'PAYOUT TRF',
          bg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          icon: '💸',
        };
      case 'USER_FUND_ADD_DEDUCT':
        return {
          label: isHi ? 'यूज़र डिपॉजिट डिडक्शन' : 'USER DEPOSIT DEDUCT',
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          icon: '🏦',
        };
      case 'ADMIN_FEE_GP_COLLECT':
        return {
          label: isHi ? '+ शुल्क GP जमा' : 'FEE GP COLLECT',
          bg: 'bg-amber-500/30 text-amber-200 border-amber-500/50',
          icon: '🪙',
        };
      case 'ADMIN_FEE_GP_CONVERT':
        return {
          label: isHi ? 'GP ➔ ₹ कनवर्टेड' : 'FEE GP CONVERT',
          bg: 'bg-emerald-500/30 text-emerald-200 border-emerald-500/50',
          icon: '💸',
        };
      default:
        return {
          label: log.type,
          bg: 'bg-slate-800 text-slate-300 border-slate-700',
          icon: '📝',
        };
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesFilter =
      filterType === 'ALL' ||
      (filterType === 'ADMIN' && (log.type === 'ADMIN_ADD' || log.type === 'ADMIN_DEDUCT')) ||
      (filterType === 'USER' && (log.type === 'USER_INVESTMENT_DEDUCT' || log.type === 'USER_PAYOUT_DEDUCT' || log.type === 'USER_FUND_ADD_DEDUCT')) ||
      (filterType === 'FEE_GP' && (log.type === 'ADMIN_FEE_GP_COLLECT' || log.type === 'ADMIN_FEE_GP_CONVERT'));

    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      log.reason.toLowerCase().includes(searchLower) ||
      (log.reasonHi && log.reasonHi.toLowerCase().includes(searchLower)) ||
      (log.referenceId && log.referenceId.toLowerCase().includes(searchLower)) ||
      log.actor.toLowerCase().includes(searchLower);

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* High priority Low Balance Warning Banner (triggers when balance <= 500000) */}
      {isLowBalance && (
        <div className="relative overflow-hidden p-5 rounded-3xl bg-gradient-to-r from-rose-950 via-slate-900 to-amber-950 border-2 border-rose-500/80 shadow-2xl shadow-rose-950/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-pulse">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-3.5 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center shrink-0 shadow-inner">
              <ShieldAlert className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <h4 className="text-sm font-black text-rose-300 uppercase tracking-wide">
                {isHi
                  ? '⚠️ कंपनी मुख्य रिज़र्व बैलेंस लो अलर्ट (<= ₹5,00,000)!'
                  : '⚠️ CRITICAL: Company Main Reserve Balance is <= ₹5,00,000!'}
              </h4>
              <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
                {isHi
                  ? `वर्तमान बैलेंस: ₹${treasury.balance.toLocaleString('en-IN')}। इन्वेस्टर्स के निवेश व पेआउट्स सुचारू रखने के लिए बैलेंस तुरंत बढ़ाएं।`
                  : `Current balance: ₹${treasury.balance.toLocaleString('en-IN')}. Please add balance to ensure continuous automated investor payouts.`}
              </p>
            </div>
          </div>

          <button
            onClick={onOpenAddModal}
            className="relative z-10 shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-black text-xs shadow-lg shadow-rose-600/30 cursor-pointer hover:scale-105 active:scale-95 transition-all"
          >
            <Zap className="w-4 h-4 fill-slate-950 text-slate-950" />
            <span>{isHi ? '⚡ मुख्य बैलेंस बढ़ाएं' : '⚡ Add Balance Now'}</span>
          </button>
        </div>
      )}

      {/* Main Treasury Control Executive Card */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800/80 shadow-2xl backdrop-blur-xl space-y-6">
        {/* Subtle Background Glow */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Row */}
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-slate-800/80 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-amber-500/10 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-950/30 shrink-0">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {isHi ? 'कंपनी ट्रेजरी एवं मुख्य लिक्विडिटी फंड' : 'Company Treasury & Master Liquidity'}
                </h3>
                {isLowBalance ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-black uppercase font-mono tracking-wider animate-pulse">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    {isHi ? 'लो बैलेंस' : 'Low Balance'}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-black uppercase font-mono tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    {isHi ? 'सुरक्षित रिज़र्व' : 'Healthy Reserve'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                {isHi
                  ? 'निवेशकों के निवेश और पेआउट्स इसी मुख्य बैलेंस से सीधे प्रबंधित व कनेक्टेड हैं'
                  : 'Central reserve pool backing all user investment cycles, payouts, and ecosystem liquidity.'}
              </p>
            </div>
          </div>

          {/* Controls Button Group */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-lg shadow-emerald-600/20 hover:scale-102 active:scale-98 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isHi ? '+ बैलेंस बढ़ाएं' : '+ Increase Balance'}</span>
            </button>

            <button
              onClick={onOpenDeductModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800/90 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-500/40 text-xs font-bold transition-all cursor-pointer"
            >
              <MinusCircle className="w-4 h-4" />
              <span>{isHi ? '- कटौती' : '- Deduct'}</span>
            </button>

            <button
              onClick={onResetTreasury}
              title={isHi ? 'रीसेट करें' : 'Reset Treasury'}
              className="p-2.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Big Balance Callout & Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
          {/* Main Balance Highlight Card */}
          <div className="md:col-span-2 p-6 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800/90 shadow-xl space-y-2 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider font-mono">
                {isHi ? 'कंपनी का वर्तमान मुख्य बैलेंस' : 'Master Reserve Balance'}
              </span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                INR (₹)
              </span>
            </div>
            <p
              className={`text-3xl sm:text-4xl lg:text-5xl font-black font-mono tracking-tight ${
                isLowBalance ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {formatINR(treasury.balance)}
            </p>
            <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
              <span>{isHi ? 'अलर्ट सीमा: ₹5,00,000' : 'Alert Limit: ₹5,00,000'}</span>
              <span className="text-slate-500 font-mono">Realtime Updated</span>
            </div>
          </div>

          {/* Total Injected */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/90 shadow-xl space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span className="font-semibold">{isHi ? 'कुल एडमिन फंड्स इंजेक्शन' : 'Total Injected'}</span>
              <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ArrowDownLeft className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-black font-mono text-emerald-300">
                {formatINR(treasury.totalInjected)}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">{isHi ? 'बैंक रिज़र्व टॉप-अप' : 'Capital Top-ups'}</p>
            </div>
          </div>

          {/* Transferred to Users */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/90 shadow-xl space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span className="font-semibold">{isHi ? 'निवेशकों को ट्रांसफर' : 'Transferred to Users'}</span>
              <div className="p-1.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-black font-mono text-cyan-300">
                {formatINR(treasury.totalTransferredToUsers)}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">{isHi ? 'निवेश व पेआउट्स' : 'User Deductions'}</p>
            </div>
          </div>
        </div>

        {/* Quick Top-up Chips */}
        <div className="relative z-10 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider font-mono mr-1">
              {isHi ? '⚡ त्वरित टॉप-अप:' : '⚡ Quick Top-up:'}
            </span>
            {[100000, 200000, 500000, 1000000, 2500000].map((amt) => (
              <button
                key={amt}
                onClick={() => onQuickAdd(amt)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-950 hover:bg-emerald-950/80 text-slate-300 hover:text-emerald-300 border border-slate-800 hover:border-emerald-500/50 text-xs font-mono font-bold transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-sm"
              >
                +{formatINR(amt)}
              </button>
            ))}
          </div>
        </div>

        {/* Separated Admin Fee GP Reserve Card */}
        <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-r from-amber-950/50 via-slate-950 to-emerald-950/40 border border-amber-500/40 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0 shadow-lg shadow-amber-950/50">
              <Coins className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm sm:text-base font-black text-amber-300">
                  {isHi ? 'एडमिन ट्रांजेक्शन चार्ज GP रिज़र्व' : 'Admin Collected Transaction Fee GP Balance'}
                </h4>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold font-mono">
                  {isHi ? 'पृथक GP खजाना' : 'Separated Fee GP'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
                {isHi
                  ? 'यूज़र P2P GP ट्रांसफर (2% फीस) से प्राप्त शुल्क GP यहाँ अलग जमा होता है। इसे कभी भी ₹ रुपये में कनवर्ट करके वॉलेट या ट्रेजरी में ट्रांसफर कर सकते हैं।'
                  : 'Accrued 2% P2P GP transfer fees sit separately here. Convert GP to Rupees anytime.'}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0 w-full lg:w-auto justify-between lg:justify-end relative z-10">
            <div className="text-left sm:text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono block">
                {isHi ? 'उपलब्ध शुल्क GP' : 'Available Fee GP'}
              </span>
              <span className="text-2xl font-black font-mono text-amber-400">
                {collectedFeeGp.toFixed(2)} <span className="text-xs font-bold text-slate-300">GP</span>
              </span>
              {totalConvertedFeeGp > 0 && (
                <span className="text-[10px] text-emerald-400 font-mono block">
                  ({isHi ? `कुल कनवर्टेड: ${totalConvertedFeeGp.toFixed(2)} GP` : `Converted: ${totalConvertedFeeGp.toFixed(2)} GP`})
                </span>
              )}
            </div>

            {onOpenConvertFeeGpModal && (
              <button
                id="btn-treasury-convert-fee-gp"
                onClick={onOpenConvertFeeGpModal}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-500 hover:from-amber-400 hover:to-teal-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer hover:scale-102 active:scale-98"
              >
                <Sparkles className="w-4 h-4 fill-slate-950 text-slate-950" />
                <span>{isHi ? '💸 GP ➔ ₹ रुपये कनवर्ट करें' : '💸 Convert GP to Rupees'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Audit Logs / Ledger Passbook Section */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800/80 shadow-2xl backdrop-blur-xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <h4 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              <span>{isHi ? 'कंपनी ट्रेजरी पासबुक व विस्तृत ऑडिट लॉग्स' : 'Company Treasury Passbook & Audit Trail'}</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              {isHi
                ? 'प्रत्येक टॉप-अप, यूज़र ट्रांसफर, फीस कलेक्शन तथा डिडक्शन का समयवार ब्यौरा'
                : 'Realtime cryptographic audit ledger of every treasury balance change and user payout'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Switcher: Cards vs Table */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
              <button
                onClick={() => setViewMode('CARDS')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'CARDS'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>{isHi ? '📱 कार्ड्स' : 'Cards'}</span>
              </button>
              <button
                onClick={() => setViewMode('TABLE')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'TABLE'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>{isHi ? '💻 टेबल' : 'Table'}</span>
              </button>
            </div>

            {/* Filter Pill Buttons */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
              <button
                onClick={() => setFilterType('ALL')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filterType === 'ALL' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                {isHi ? 'सभी' : 'All'}
              </button>
              <button
                onClick={() => setFilterType('ADMIN')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filterType === 'ADMIN' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                {isHi ? 'एडमिन' : 'Admin'}
              </button>
              <button
                onClick={() => setFilterType('USER')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filterType === 'USER' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                {isHi ? 'यूज़र ट्रांसफर' : 'User Transfer'}
              </button>
              <button
                onClick={() => setFilterType('FEE_GP')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filterType === 'FEE_GP' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-amber-400 hover:text-white'
                }`}
              >
                {isHi ? 'शुल्क GP' : 'Fee GP'}
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={isHi ? 'लॉग्स खोजें...' : 'Search passbook...'}
                className="pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500/80 w-40 font-medium transition-colors"
              />
            </div>
          </div>
        </div>

        {/* LOGS RENDERING */}
        {filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-slate-500 bg-slate-950/60 rounded-2xl border border-slate-800">
            {isHi ? 'कोई ऑडिट लॉग रिकॉर्ड नहीं मिला।' : 'No passbook records found.'}
          </div>
        ) : viewMode === 'CARDS' ? (
          /* STYLISH MOBILE-FIRST FINANCIAL CARDS VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredLogs.map((log, idx) => {
              const isCredit =
                log.type === 'ADMIN_ADD' ||
                log.type === 'ADMIN_FEE_GP_COLLECT' ||
                log.type === 'ADMIN_FEE_GP_CONVERT';
              const badge = getLogTypeBadge(log);

              return (
                <div
                  key={`${log.id || 'log'}-${idx}`}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-slate-800/90 hover:border-slate-700 transition-all shadow-xl space-y-3.5 relative overflow-hidden group"
                >
                  {/* Top Bar: Badge & Time */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-black border font-mono flex items-center gap-1.5 ${badge.bg}`}>
                      <span>{badge.icon}</span>
                      <span>{badge.label}</span>
                    </span>

                    <span className="text-[11px] font-mono text-slate-400 font-semibold">
                      {new Date(log.timestamp).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Amount & Balance Shift Box */}
                  <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                        {isHi ? 'लेनदेन की राशि' : 'Transaction Amount'}
                      </span>
                      <span className={`text-xl font-black font-mono tracking-tight block ${isCredit ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isCredit ? '+' : '-'}{formatINR(log.amount)}
                      </span>
                    </div>

                    <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800/80 font-mono text-[11px] text-slate-300">
                      <span className="text-slate-400 text-[10px] block">{isHi ? 'बैलेंस (पहले ➔ बाद)' : 'Shift Progression'}</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-slate-400">{formatINR(log.balanceBefore)}</span>
                        <ArrowRight className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="font-extrabold text-white">{formatINR(log.balanceAfter)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Reason / Details Text */}
                  <div className="space-y-1.5 text-xs text-slate-200">
                    <p className="break-words leading-relaxed font-medium bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/60">
                      {isHi && log.reasonHi ? log.reasonHi : log.reason}
                    </p>

                    <div className="flex items-center justify-between gap-2 text-[11px] font-mono pt-1 text-slate-400">
                      {log.referenceId ? (
                        <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                          <span>Ref: <strong className="text-slate-200">{log.referenceId}</strong></span>
                          <button
                            onClick={() => handleCopyRef(log.referenceId || '')}
                            className="text-slate-400 hover:text-white p-0.5 transition-colors cursor-pointer"
                            title="Copy Ref ID"
                          >
                            {copiedId === log.referenceId ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      ) : <div />}

                      <span className="text-slate-400 text-[10px]">
                        By: <strong className="text-slate-300">{log.actor}</strong>
                      </span>
                    </div>
                  </div>

                  {/* View Full Receipt Button */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-end">
                    <button
                      onClick={() => setSelectedReceiptLog(log)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-teal-300 hover:text-teal-200 border border-slate-700/80 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      <FileText className="w-3.5 h-3.5 text-teal-400" />
                      <span>{isHi ? 'डिजिटल रसीद देखें' : 'View Full Receipt'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* CLASSIC DESKTOP TABLE VIEW */
          <div className="overflow-x-auto rounded-2xl border border-slate-800/80 shadow-inner">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-black text-[10px] tracking-wider border-b border-slate-800/80 font-mono">
                <tr>
                  <th className="py-3.5 px-4">{isHi ? 'दिनांक व समय' : 'Timestamp'}</th>
                  <th className="py-3.5 px-4">{isHi ? 'प्रकार (Action)' : 'Action Type'}</th>
                  <th className="py-3.5 px-4">{isHi ? 'राशि (Amount)' : 'Amount'}</th>
                  <th className="py-3.5 px-4">{isHi ? 'बैलेंस (पहले ➔ बाद)' : 'Balance (Before ➔ After)'}</th>
                  <th className="py-3.5 px-4">{isHi ? 'विवरण (Reason)' : 'Details'}</th>
                  <th className="py-3.5 px-4">{isHi ? 'कर्ता (Actor)' : 'Actor'}</th>
                  <th className="py-3.5 px-4">{isHi ? 'ऑप्शन' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 bg-slate-950/40 font-medium">
                {filteredLogs.map((log, idx) => {
                  const isCredit =
                    log.type === 'ADMIN_ADD' ||
                    log.type === 'ADMIN_FEE_GP_COLLECT' ||
                    log.type === 'ADMIN_FEE_GP_CONVERT';
                  const badge = getLogTypeBadge(log);

                  return (
                    <tr key={`${log.id || 'log'}-${idx}`} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                        {new Date(log.timestamp).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border font-mono ${badge.bg}`}>
                          {badge.icon} {badge.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap font-mono font-bold text-sm">
                        <span className={isCredit ? 'text-emerald-400' : 'text-rose-400'}>
                          {isCredit ? '+' : '-'}
                          {formatINR(log.amount)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-slate-400">
                        <span>{formatINR(log.balanceBefore)}</span>
                        <span className="mx-1.5 text-slate-600">➔</span>
                        <span className="font-bold text-slate-200">{formatINR(log.balanceAfter)}</span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-300 max-w-sm">
                        <p className="text-xs font-medium text-slate-200 break-words leading-relaxed">
                          {isHi && log.reasonHi ? log.reasonHi : log.reason}
                        </p>
                        {log.referenceId && (
                          <span className="text-[10px] font-mono text-slate-500 block mt-0.5">
                            Ref: {log.referenceId}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 text-xs font-mono">
                        {log.actor}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedReceiptLog(log)}
                          className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-teal-300 border border-slate-700 text-[11px] font-bold cursor-pointer transition-colors"
                        >
                          {isHi ? 'रसीद' : 'Receipt'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FULL DIGITAL AUDIT RECEIPT MODAL */}
      {selectedReceiptLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-slate-900 border-2 border-teal-500/50 rounded-3xl shadow-2xl overflow-hidden text-slate-100 space-y-4 p-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/40 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    {isHi ? 'कंपनी ट्रेजरी डिजिटल ऑडिट रसीद' : 'Official Treasury Audit Receipt'}
                  </h3>
                  <p className="text-[10px] font-mono text-slate-400">GCap Reserves Verification</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedReceiptLog(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Receipt Body */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-3.5 text-xs font-mono">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">{isHi ? 'लेनदेन प्रकार:' : 'Action Type:'}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${getLogTypeBadge(selectedReceiptLog).bg}`}>
                  {getLogTypeBadge(selectedReceiptLog).label}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">{isHi ? 'दिनांक व समय:' : 'Timestamp:'}</span>
                <span className="text-white font-bold">
                  {new Date(selectedReceiptLog.timestamp).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'medium',
                  })}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">{isHi ? 'लेनदेन राशि:' : 'Amount:'}</span>
                <span className={`text-base font-black ${
                  selectedReceiptLog.type === 'ADMIN_ADD' || selectedReceiptLog.type === 'ADMIN_FEE_GP_COLLECT' || selectedReceiptLog.type === 'ADMIN_FEE_GP_CONVERT'
                    ? 'text-emerald-400'
                    : 'text-rose-400'
                }`}>
                  {formatINR(selectedReceiptLog.amount)}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">{isHi ? 'बैलेंस बदलाव:' : 'Balance Shift:'}</span>
                <span className="text-slate-200">
                  {formatINR(selectedReceiptLog.balanceBefore)} ➔ <strong className="text-emerald-400">{formatINR(selectedReceiptLog.balanceAfter)}</strong>
                </span>
              </div>

              {selectedReceiptLog.referenceId && (
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">{isHi ? 'रेफरेंस आईडी:' : 'Reference ID:'}</span>
                  <div className="flex items-center gap-1.5 text-white font-bold">
                    <span>{selectedReceiptLog.referenceId}</span>
                    <button
                      onClick={() => handleCopyRef(selectedReceiptLog.referenceId || '')}
                      className="text-teal-400 hover:text-teal-300 transition-colors cursor-pointer"
                    >
                      {copiedId === selectedReceiptLog.referenceId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">{isHi ? 'कार्रवाई कर्ता:' : 'Executed By:'}</span>
                <span className="text-slate-200">{selectedReceiptLog.actor}</span>
              </div>

              <div className="pt-1">
                <span className="text-slate-400 text-[11px] block mb-1">{isHi ? 'पूरा विवरण व नोट:' : 'Audit Remark:'}</span>
                <p className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-sans text-xs break-words leading-relaxed">
                  {isHi && selectedReceiptLog.reasonHi ? selectedReceiptLog.reasonHi : selectedReceiptLog.reason}
                </p>
              </div>
            </div>

            {/* Official System Stamp */}
            <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300 font-bold">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>{isHi ? 'GCap मुख्य रिज़र्व द्वारा सत्यापित' : 'Verified by GCap Treasury'}</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">AUTHENTIC</span>
            </div>

            <button
              onClick={() => setSelectedReceiptLog(null)}
              className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-black text-xs transition-all shadow-lg cursor-pointer"
            >
              {isHi ? 'बंद करें' : 'Close Receipt'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
