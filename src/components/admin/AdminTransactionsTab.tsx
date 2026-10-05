import React, { useState } from 'react';
import {
  Receipt,
  PlusCircle,
  Search,
  Edit3,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowUpRight,
  ArrowDownLeft,
  AlertTriangle,
  Building2,
  Zap,
  MessageCircle,
  Copy,
  Check,
  Filter,
  TrendingUp,
  Sparkles,
  RefreshCw,
  X,
  User,
  Calendar,
} from 'lucide-react';
import { Language, Transaction, TransactionType } from '../../types';
import { formatINR } from '../../utils/storage';
import { sendWhatsAppAlert, createDepositWhatsAppAlert, createWithdrawalWhatsAppAlert } from '../../utils/whatsappHelper';

interface AdminTransactionsTabProps {
  transactions: Transaction[];
  language: Language;
  companyBalance?: number;
  onAddTransaction: () => void;
  onEditTransaction: (txn: Transaction) => void;
  onDeleteTransaction: (txnId: string) => void;
  onQuickApprove?: (txnId: string) => void;
  onApproveDepositPayment?: (txnId: string) => void;
  onTransferDepositToUser?: (txnId: string) => void;
  onRejectTransaction?: (txnId: string) => void;
}

export const AdminTransactionsTab: React.FC<AdminTransactionsTabProps> = ({
  transactions,
  language,
  companyBalance,
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
  onQuickApprove,
  onApproveDepositPayment,
  onTransferDepositToUser,
  onRejectTransaction,
}) => {
  const isHi = language === 'hi';
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const pendingDeposits = transactions.filter((t) => t.type === 'DEPOSIT' && t.status === 'PENDING');
  const pendingWithdrawals = transactions.filter((t) => (t.type === 'WITHDRAWAL' || (t.type as string) === 'WITHDRAW') && t.status === 'PENDING');

  const filtered = transactions.filter((t) => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (t.referenceId && t.referenceId.toLowerCase().includes(q)) ||
      (t.id && t.id.toLowerCase().includes(q)) ||
      (t.userName && t.userName.toLowerCase().includes(q)) ||
      (t.userPhone && t.userPhone.toLowerCase().includes(q)) ||
      (t.userLoginId && t.userLoginId.toLowerCase().includes(q)) ||
      (t.note && t.note.toLowerCase().includes(q)) ||
      (t.noteHi && t.noteHi.toLowerCase().includes(q)) ||
      (t.method && t.method.toLowerCase().includes(q)) ||
      String(t.amount).includes(q);

    const matchesType = filterType === 'ALL' || t.type === filterType;
    const matchesStatus = filterStatus === 'ALL' || t.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const txnToDelete = transactions.find((t) => t.id === deleteConfirmId);

  const getTypeIcon = (t: Transaction) => {
    switch (t.type) {
      case 'DEPOSIT':
        return <ArrowDownLeft className="w-4 h-4 text-emerald-400" />;
      case 'WITHDRAWAL':
        return <ArrowUpRight className="w-4 h-4 text-purple-400" />;
      case 'INVEST':
        return <TrendingUp className="w-4 h-4 text-blue-400" />;
      case 'RETURN_PAYOUT':
        return <Sparkles className="w-4 h-4 text-amber-400" />;
      case 'SWAP_GP':
        return <RefreshCw className="w-4 h-4 text-teal-400" />;
      case 'CAPITAL_RETURN':
        return <CheckCircle2 className="w-4 h-4 text-cyan-400" />;
      case 'REFERRAL_BONUS':
        return <Sparkles className="w-4 h-4 text-pink-400" />;
      default:
        return <Receipt className="w-4 h-4 text-slate-400" />;
    }
  };

  const getTypeLabel = (t: Transaction) => {
    switch (t.type) {
      case 'DEPOSIT':
        return isHi ? 'डिपॉजिट (Deposit)' : 'Deposit';
      case 'WITHDRAWAL':
        return isHi ? 'निकासी (Withdrawal)' : 'Withdrawal';
      case 'INVEST':
        return isHi ? 'निवेश प्लान (Invest)' : 'Investment';
      case 'RETURN_PAYOUT':
        return isHi ? 'दैनिक रिटर्न (ROI)' : 'Daily ROI';
      case 'SWAP_GP':
        return isHi ? 'GP स्वैप (GP Swap)' : 'GP Swap';
      case 'CAPITAL_RETURN':
        return isHi ? 'मूलधन वापसी' : 'Capital Refund';
      case 'REFERRAL_BONUS':
        return isHi ? 'रेफरल बोनस' : 'Referral Bonus';
      case 'TRANSFER':
        return isHi ? 'GP ट्रांसफर' : 'GP Transfer';
      default:
        return t.type;
    }
  };

  return (
    <div className="space-y-4 max-w-full">
      {/* Top Header */}
      <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-purple-400" />
            <span>{isHi ? 'ग्लोबल लेन-देन एवं पेआउट्स ऑडिट' : 'Global Transactions & Payouts Audit'}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {isHi
              ? `कुल रिकॉर्ड: ${transactions.length} • रीयल-टाइम अप्रूवल, WhatsApp अलर्ट व ऑडिट ट्रेल`
              : `Total Records: ${transactions.length} • Realtime approval, WhatsApp alerts & ledger audit`}
          </p>
        </div>

        <button
          id="btn-admin-add-txn"
          onClick={onAddTransaction}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/30 cursor-pointer self-start sm:self-auto active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{isHi ? '+ नया लेन-देन जोड़ें' : '+ Add Transaction'}</span>
        </button>
      </div>

      {/* SPECIAL RULE QUEUE: User Deposit Approval & Company Main Balance Deduction */}
      {pendingDeposits.length > 0 && (
        <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 p-4 sm:p-5 rounded-2xl border border-amber-500/40 shadow-xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
                <Clock className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">
                    {isHi
                      ? 'यूज़र फंड डिपॉजिट सत्यापन कतार (Wait for Approval)'
                      : 'User Deposit Approval Queue (Wait for Approval)'}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                    {pendingDeposits.length} {isHi ? 'लंबित अनुरोध' : 'Pending'}
                  </span>
                </div>
                <p className="text-xs text-amber-200/80 mt-0.5">
                  {isHi
                    ? 'नियम: अप्रूव करने पर राशि कंपनी के मुख्य बैलेंस से डिडक्ट होकर यूज़र वॉलेट कैश में जुड़ेगी।'
                    : 'Rule: Approving deducts funds from Company Main Balance & credits user cash balance for GP swap.'}
                </p>
              </div>
            </div>

            {companyBalance !== undefined && (
              <div className="bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center gap-2 self-start sm:self-auto text-xs">
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-400">{isHi ? 'कंपनी मुख्य बैलेंस:' : 'Company Treasury:'}</span>
                <span className="font-mono font-bold text-white">{formatINR(companyBalance)}</span>
              </div>
            )}
          </div>

          <div className="space-y-2.5">
            {pendingDeposits.map((dep) => {
              const postApprovalCompanyBalance = companyBalance !== undefined ? Math.max(0, companyBalance - dep.amount) : undefined;
              return (
                <div
                  key={dep.id}
                  className="bg-slate-950 p-3.5 rounded-xl border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 transition-all hover:border-amber-400/50"
                >
                  <div className="space-y-1 w-full md:w-auto">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-bold font-mono text-emerald-400">
                        +{formatINR(dep.amount)}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                        ⏳ Wait for approval
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        UTR / Ref: <strong className="text-slate-200">{dep.referenceId || dep.id}</strong>
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                      <span>{isHi ? 'यूज़र:' : 'User:'} <strong className="text-white">{dep.userName || 'Investor'}</strong></span>
                      <span>{isHi ? 'विधि:' : 'Method:'} <strong className="text-slate-300">{dep.method || 'Company UPI'}</strong></span>
                      <span>{isHi ? 'विवरण:' : 'Note:'} {isHi && dep.noteHi ? dep.noteHi : dep.note}</span>
                      <span className="font-mono text-[11px] text-slate-500">{new Date(dep.timestamp).toLocaleString()}</span>
                    </div>
                    {companyBalance !== undefined && (
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-0.5">
                        <Zap className="w-3 h-3 text-amber-400 shrink-0" />
                        <span>
                          {isHi ? 'कंपनी बैलेंस प्रभाव:' : 'Treasury Impact:'}{' '}
                          <span className="font-mono text-slate-300">{formatINR(companyBalance)}</span> →{' '}
                          <span className="font-mono font-bold text-amber-300">
                            {postApprovalCompanyBalance !== undefined ? formatINR(postApprovalCompanyBalance) : ''}
                          </span>
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                    {onRejectTransaction && (
                      <button
                        onClick={() => onRejectTransaction(dep.id)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
                      >
                        {isHi ? 'अस्वीकार करें' : 'Reject'}
                      </button>
                    )}
                    {onQuickApprove && (
                      <button
                        id={`btn-approve-deposit-${dep.id}`}
                        onClick={() => onQuickApprove(dep.id)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isHi ? 'कंपनी बैलेंस से डिडक्ट कर अप्रूव करें' : 'Approve & Deduct Treasury'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* QUICK FILTER CHIPS */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'ALL', label: isHi ? 'सभी' : 'All', count: transactions.length },
          { id: 'PENDING', label: isHi ? '⏳ लंबित (Pending)' : '⏳ Pending', count: transactions.filter(t => t.status === 'PENDING').length },
          { id: 'DEPOSIT', label: isHi ? '📥 डिपॉजिट' : '📥 Deposits', count: transactions.filter(t => t.type === 'DEPOSIT').length },
          { id: 'WITHDRAWAL', label: isHi ? '📤 निकासी' : '📤 Withdrawals', count: transactions.filter(t => t.type === 'WITHDRAWAL' || (t.type as string) === 'WITHDRAW').length },
          { id: 'RETURN_PAYOUT', label: isHi ? '📈 रिटर्न' : '📈 ROI', count: transactions.filter(t => t.type === 'RETURN_PAYOUT').length },
          { id: 'INVEST', label: isHi ? '💎 निवेश' : '💎 Invest', count: transactions.filter(t => t.type === 'INVEST').length },
        ].map((chip) => {
          const isActive = chip.id === 'PENDING' ? filterStatus === 'PENDING' : chip.id === 'ALL' ? (filterType === 'ALL' && filterStatus === 'ALL') : filterType === chip.id;
          return (
            <button
              key={chip.id}
              onClick={() => {
                if (chip.id === 'ALL') {
                  setFilterType('ALL');
                  setFilterStatus('ALL');
                } else if (chip.id === 'PENDING') {
                  setFilterStatus(filterStatus === 'PENDING' ? 'ALL' : 'PENDING');
                } else {
                  setFilterType(filterType === chip.id ? 'ALL' : chip.id);
                }
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                isActive
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <span>{chip.label}</span>
              {chip.count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'}`}>
                  {chip.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shadow-md">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isHi ? 'यूज़र, UTR, संदर्भ, विवरण से खोजें...' : 'Search by user, reference, UTR, note...'}
            className="w-full pl-9 pr-8 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-400 transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-purple-400 focus:outline-none cursor-pointer"
          >
            <option value="ALL">{isHi ? 'सभी प्रकार (All Types)' : 'All Types'}</option>
            <option value="DEPOSIT">DEPOSIT (जमा)</option>
            <option value="WITHDRAWAL">WITHDRAWAL (निकासी)</option>
            <option value="INVEST">INVEST (निवेश)</option>
            <option value="RETURN_PAYOUT">RETURN_PAYOUT (रिटर्न)</option>
            <option value="CAPITAL_REFUND">CAPITAL_REFUND (मूलधन)</option>
            <option value="REFERRAL_BONUS">REFERRAL_BONUS (बोनस)</option>
            <option value="SWAP_GP">SWAP_GP (स्वैप)</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-purple-400 focus:outline-none cursor-pointer"
          >
            <option value="ALL">{isHi ? 'सभी स्थिति (All Status)' : 'All Status'}</option>
            <option value="SUCCESS">SUCCESS (सफल)</option>
            <option value="PENDING">PENDING (लंबित)</option>
            <option value="APPROVED">APPROVED (स्वीकृत)</option>
            <option value="REJECTED">REJECTED (अस्वीकृत)</option>
          </select>
        </div>
      </div>

      {/* Results summary count badge */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          {isHi
            ? `दिखाए जा रहे हैं: ${filtered.length} लेन-देन`
            : `Showing ${filtered.length} of ${transactions.length} records`}
        </span>
        {(searchTerm || filterType !== 'ALL' || filterStatus !== 'ALL') && (
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterType('ALL');
              setFilterStatus('ALL');
            }}
            className="text-purple-400 hover:text-purple-300 font-semibold cursor-pointer underline text-[11px]"
          >
            {isHi ? 'फ़िल्टर हटाएं' : 'Clear Filters'}
          </button>
        )}
      </div>

      {/* ======================================================== */}
      {/* 1. MOBILE CARD VIEW (< md screens) - Sleek Responsive UI */}
      {/* ======================================================== */}
      <div className="block md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-500 space-y-2">
            <Receipt className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="font-semibold text-slate-400">
              {isHi ? 'कोई लेन-देन रिकॉर्ड नहीं मिला।' : 'No transaction records found.'}
            </p>
          </div>
        ) : (
          filtered.map((t) => {
            const isPositive =
              t.type === 'DEPOSIT' ||
              t.type === 'RETURN_PAYOUT' ||
              t.type === 'CAPITAL_RETURN' ||
              t.type === 'REFERRAL_BONUS';

            return (
              <div
                key={t.id}
                className="bg-slate-900 border border-slate-800/90 hover:border-slate-700/80 rounded-2xl p-4 shadow-lg space-y-3 transition-all"
              >
                {/* Header Row: Type Badge + Amount */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-800/60 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                        isPositive ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                      }`}
                    >
                      {getTypeIcon(t)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-extrabold text-white text-xs">
                          {getTypeLabel(t)}
                        </span>
                        {t.type === 'WITHDRAWAL' && t.withdrawalSource && (
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-black ${
                              t.withdrawalSource === 'ROYALTY'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            }`}
                          >
                            {t.withdrawalSource === 'ROYALTY' ? 'Royalty (6-10th)' : 'Earning (1-5th)'}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono block">
                        {t.method || 'UPI / Portal'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-base font-black font-mono block ${
                        isPositive ? 'text-emerald-400' : 'text-slate-100'
                      }`}
                    >
                      {isPositive ? '+' : '-'}
                      {formatINR(t.amount)}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(t.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Details Section */}
                <div className="space-y-1.5 text-xs">
                  {/* User info if available */}
                  {(t.userName || t.userLoginId || t.userPhone) && (
                    <div className="flex items-center justify-between text-slate-300 bg-slate-950/60 px-2.5 py-1.5 rounded-lg border border-slate-800/80">
                      <span className="text-slate-400 text-[11px] flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        {isHi ? 'यूज़र:' : 'User:'}
                      </span>
                      <div className="font-semibold text-right">
                        <span className="text-white">{t.userName || 'Investor'}</span>
                        {t.userLoginId && (
                          <span className="text-[10px] text-purple-400 font-mono ml-1.5 bg-purple-500/10 px-1 py-0.2 rounded">
                            {t.userLoginId}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Ref ID & Copy */}
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px]">{isHi ? 'रेफरेंस / ID:' : 'Ref ID:'}</span>
                    <button
                      onClick={() => handleCopy(t.referenceId || t.id, t.id)}
                      className="font-mono text-slate-200 text-[11px] font-bold flex items-center gap-1 hover:text-purple-400 cursor-pointer"
                      title="Copy Reference ID"
                    >
                      <span>{t.referenceId || t.id}</span>
                      {copiedId === t.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3 text-slate-500" />
                      )}
                    </button>
                  </div>

                  {/* Notes / Description */}
                  {(t.note || t.noteHi) && (
                    <div className="text-[11px] text-slate-300 bg-slate-950/40 p-2 rounded-lg border border-slate-800/50 leading-relaxed">
                      {isHi && t.noteHi ? t.noteHi : t.note}
                    </div>
                  )}

                  {/* Status & Date */}
                  <div className="flex items-center justify-between pt-1">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        t.status === 'SUCCESS'
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : (t.status === 'APPROVED' || t.status === 'APPROVED_PENDING_TRANSFER')
                          ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30 font-extrabold animate-pulse'
                          : t.status === 'PENDING'
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {t.status === 'SUCCESS' ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (t.status === 'APPROVED' || t.status === 'APPROVED_PENDING_TRANSFER') ? (
                        <Zap className="w-3 h-3 text-cyan-400" />
                      ) : t.status === 'PENDING' ? (
                        <Clock className="w-3 h-3" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                      <span>
                        {(t.status === 'APPROVED' || t.status === 'APPROVED_PENDING_TRANSFER')
                          ? (isHi ? 'स्वीकृत (ट्रांसफर बाकी)' : 'APPROVED (TRANSFER PENDING)')
                          : t.status}
                      </span>
                    </span>

                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Mobile Action Buttons Bar */}
                <div className="pt-2 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* 2-Step Actions for BOTH DEPOSIT and WITHDRAWAL */}
                    {(t.type === 'DEPOSIT' || t.type === 'WITHDRAWAL' || (t.type as string) === 'WITHDRAW') ? (
                      <>
                        {/* Step 1: Approve Request */}
                        {t.status === 'PENDING' ? (
                          <button
                            onClick={() => onApproveDepositPayment ? onApproveDepositPayment(t.id) : (onQuickApprove && onQuickApprove(t.id))}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{isHi ? '1. अप्रूव' : '1. Approve'}</span>
                          </button>
                        ) : (t.status === 'APPROVED' || t.status === 'APPROVED_PENDING_TRANSFER') ? (
                          <span className="px-2.5 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800/80 rounded-lg text-xs font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{isHi ? 'स्वीकृत' : 'Approved'}</span>
                          </span>
                        ) : null}

                        {/* Step 2: Transfer Funds */}
                        {(t.status === 'APPROVED' || t.status === 'APPROVED_PENDING_TRANSFER') && (
                          <button
                            onClick={() => onQuickApprove ? onQuickApprove(t.id) : (onTransferDepositToUser && onTransferDepositToUser(t.id))}
                            className="px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-black transition-all cursor-pointer shadow-md flex items-center gap-1 animate-bounce"
                          >
                            <Zap className="w-3.5 h-3.5" />
                            <span>🚀 {isHi ? '2. ट्रांसफर करें' : '2. Transfer'}</span>
                          </button>
                        )}
                      </>
                    ) : (
                      t.status === 'PENDING' && onQuickApprove && (
                        <button
                          onClick={() => onQuickApprove(t.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                        >
                          {isHi ? 'अप्रूव' : 'Approve'}
                        </button>
                      )
                    )}

                    {/* Reject Button for PENDING or APPROVED */}
                    {(t.status === 'PENDING' || t.status === 'APPROVED' || t.status === 'APPROVED_PENDING_TRANSFER') && onRejectTransaction && (
                      <button
                        onClick={() => onRejectTransaction(t.id)}
                        className="px-2.5 py-1.5 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-lg text-xs font-bold transition-all cursor-pointer"
                      >
                        {isHi ? 'रिजेक्ट' : 'Reject'}
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* 1-Click WhatsApp Alert Button */}
                    <button
                      onClick={() => {
                        if (t.type === 'DEPOSIT') {
                          sendWhatsAppAlert(createDepositWhatsAppAlert(t, t.userName, t.userPhone));
                        } else {
                          sendWhatsAppAlert(createWithdrawalWhatsAppAlert(t, t.userName, t.userPhone));
                        }
                      }}
                      className="p-2 rounded-lg bg-green-950/90 hover:bg-green-900 text-green-400 border border-green-700/80 text-xs transition-all cursor-pointer active:scale-95"
                      title={isHi ? '1-क्लिक व्हाट्सएप रसीद / अलर्ट भेजें' : 'Send 1-Click WhatsApp Alert'}
                    >
                      <MessageCircle className="w-4 h-4 fill-current" />
                    </button>

                    <button
                      onClick={() => onEditTransaction(t)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-all cursor-pointer"
                      title={isHi ? 'एडिट करें' : 'Edit'}
                    >
                      <Edit3 className="w-4 h-4 text-purple-400" />
                    </button>

                    <button
                      onClick={() => setDeleteConfirmId(t.id)}
                      className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs transition-all cursor-pointer"
                      title={isHi ? 'डिलीट करें' : 'Delete'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ======================================================== */}
      {/* 2. DESKTOP TABLE VIEW (>= md screens) - Clean Wide Grid */}
      {/* ======================================================== */}
      <div className="hidden md:block bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">{isHi ? 'प्रकार / संदर्भ' : 'Type / Ref ID'}</th>
                <th className="py-3 px-4">{isHi ? 'यूज़र / नाम' : 'User / Account'}</th>
                <th className="py-3 px-4">{isHi ? 'राशि' : 'Amount'}</th>
                <th className="py-3 px-4">{isHi ? 'विधि / चैनल' : 'Method'}</th>
                <th className="py-3 px-4">{isHi ? 'विवरण' : 'Notes'}</th>
                <th className="py-3 px-4">{isHi ? 'स्थिति' : 'Status'}</th>
                <th className="py-3 px-4">{isHi ? 'समय' : 'Date / Time'}</th>
                <th className="py-3 px-4 text-right">{isHi ? 'कार्रवाई' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    {isHi ? 'कोई लेन-देन रिकॉर्ड नहीं मिला।' : 'No transaction records found.'}
                  </td>
                </tr>
              ) : (
                filtered.map((t) => {
                  const isPositive =
                    t.type === 'DEPOSIT' ||
                    t.type === 'RETURN_PAYOUT' ||
                    t.type === 'CAPITAL_RETURN' ||
                    t.type === 'REFERRAL_BONUS';

                  return (
                    <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Type & Ref */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`p-1.5 rounded-lg shrink-0 ${
                              isPositive
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-purple-500/10 text-purple-400'
                            }`}
                          >
                            {getTypeIcon(t)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white block text-xs">
                                {getTypeLabel(t)}
                              </span>
                              {t.type === 'WITHDRAWAL' && t.withdrawalSource && (
                                <span
                                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                                    t.withdrawalSource === 'ROYALTY'
                                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                      : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                  }`}
                                >
                                  {t.withdrawalSource === 'ROYALTY' ? 'Royalty' : 'Earning'}
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => handleCopy(t.referenceId || t.id, t.id)}
                              className="font-mono text-[10px] text-slate-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
                              title="Click to copy ID"
                            >
                              <span>{t.referenceId || t.id}</span>
                              {copiedId === t.id ? (
                                <Check className="w-2.5 h-2.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-2.5 h-2.5 opacity-60" />
                              )}
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* User details */}
                      <td className="py-3.5 px-4 text-slate-300">
                        <div className="font-bold text-white text-xs">{t.userName || 'Investor'}</div>
                        <div className="font-mono text-[10px] text-slate-400">{t.userLoginId || t.userPhone || '-'}</div>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 font-mono font-bold text-sm">
                        <span className={isPositive ? 'text-emerald-400' : 'text-slate-200'}>
                          {isPositive ? '+' : '-'}
                          {formatINR(t.amount)}
                        </span>
                      </td>

                      {/* Method */}
                      <td className="py-3.5 px-4 text-slate-300 font-medium">
                        {t.method || 'UPI / Portal'}
                      </td>

                      {/* Notes */}
                      <td className="py-3.5 px-4 text-slate-200 text-xs break-words leading-relaxed max-w-xs">
                        {isHi && t.noteHi ? t.noteHi : t.note}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            t.status === 'SUCCESS'
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : (t.status === 'APPROVED' || t.status === 'APPROVED_PENDING_TRANSFER')
                              ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30 font-extrabold animate-pulse'
                              : t.status === 'PENDING'
                              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                              : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          {t.status === 'SUCCESS' ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (t.status === 'APPROVED' || t.status === 'APPROVED_PENDING_TRANSFER') ? (
                            <Zap className="w-3 h-3 text-cyan-400" />
                          ) : t.status === 'PENDING' ? (
                            <Clock className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          <span>
                            {(t.status === 'APPROVED' || t.status === 'APPROVED_PENDING_TRANSFER')
                              ? (isHi ? 'स्वीकृत (ट्रांसफर बाकी)' : 'APPROVED (TRANSFER PENDING)')
                              : t.status}
                          </span>
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        <div>{new Date(t.timestamp).toLocaleDateString()}</div>
                        <div className="text-[10px] text-slate-500">{new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Reject Button for PENDING or APPROVED stage */}
                          {(t.status === 'PENDING' || t.status === 'APPROVED' || t.status === 'APPROVED_PENDING_TRANSFER') && onRejectTransaction && (
                            <button
                              onClick={() => onRejectTransaction(t.id)}
                              className="px-2 py-1 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded text-[10px] font-bold transition-all cursor-pointer"
                              title={isHi ? 'अस्वीकार करें' : 'Reject'}
                            >
                              {isHi ? 'रिजेक्ट' : 'Reject'}
                            </button>
                          )}

                          {/* 2-Step Actions for BOTH DEPOSIT and WITHDRAWAL */}
                          {(t.type === 'DEPOSIT' || t.type === 'WITHDRAWAL' || (t.type as string) === 'WITHDRAW') ? (
                            <>
                              {/* Step 1: Approve Request */}
                              {t.status === 'PENDING' ? (
                                <button
                                  onClick={() => onApproveDepositPayment ? onApproveDepositPayment(t.id) : (onQuickApprove && onQuickApprove(t.id))}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold transition-all cursor-pointer shadow-sm shadow-emerald-900/50 flex items-center gap-1"
                                  title={isHi ? '1. अनुरोध स्वीकार करें (ट्रांसफर बटन चालू होगा)' : '1. Approve Request (Activates Transfer button)'}
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>{isHi ? '1. अप्रूव' : '1. Approve'}</span>
                                </button>
                              ) : (t.status === 'APPROVED' || t.status === 'APPROVED_PENDING_TRANSFER') ? (
                                <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800/80 rounded text-[10px] font-bold flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>{isHi ? 'स्वीकृत' : 'Approved'}</span>
                                </span>
                              ) : null}

                              {/* Step 2: Transfer Funds (Prompts for Password) */}
                              {t.status === 'PENDING' ? (
                                <button
                                  disabled
                                  className="px-2.5 py-1 bg-slate-800 text-slate-500 border border-slate-700/60 rounded text-[10px] font-bold cursor-not-allowed opacity-60 flex items-center gap-1"
                                  title={isHi ? 'पहले 1. अप्रूव करें (यह बटन तब चालू होगा)' : 'First Approve to activate Transfer'}
                                >
                                  <span>🔒 {isHi ? '2. ट्रांसफर' : '2. Transfer'}</span>
                                </button>
                              ) : (t.status === 'APPROVED' || t.status === 'APPROVED_PENDING_TRANSFER') ? (
                                <button
                                  onClick={() => onQuickApprove ? onQuickApprove(t.id) : (onTransferDepositToUser && onTransferDepositToUser(t.id))}
                                  className="px-2.5 py-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded text-[10px] font-black transition-all cursor-pointer shadow-md shadow-cyan-900/50 flex items-center gap-1 animate-bounce"
                                  title={isHi ? '2. पासवर्ड दर्ज कर फंड ट्रांसफर करें' : '2. Enter password to Transfer Funds'}
                                >
                                  <Zap className="w-3 h-3" />
                                  <span>🚀 {isHi ? '2. ट्रांसफर करें' : '2. Transfer'}</span>
                                </button>
                              ) : null}
                            </>
                          ) : (
                            /* Fallback for other transaction types */
                            t.status === 'PENDING' && onQuickApprove && (
                              <button
                                onClick={() => onQuickApprove(t.id)}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold transition-all cursor-pointer"
                                title="Approve immediately"
                              >
                                {isHi ? 'अप्रूव' : 'Approve'}
                              </button>
                            )
                          )}

                          {/* 1-Click WhatsApp Alert Button */}
                          <button
                            onClick={() => {
                              if (t.type === 'DEPOSIT') {
                                sendWhatsAppAlert(createDepositWhatsAppAlert(t, t.userName, t.userPhone));
                              } else {
                                sendWhatsAppAlert(createWithdrawalWhatsAppAlert(t, t.userName, t.userPhone));
                              }
                            }}
                            className="p-1.5 rounded-lg bg-green-950/80 hover:bg-green-900/90 text-green-400 border border-green-700/60 text-xs transition-all cursor-pointer active:scale-95 shadow-sm"
                            title={isHi ? '1-क्लिक व्हाट्सएप रसीद / अलर्ट भेजें' : 'Send 1-Click WhatsApp Alert'}
                          >
                            <MessageCircle className="w-3.5 h-3.5 fill-current" />
                          </button>

                          <button
                            onClick={() => onEditTransaction(t)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-all cursor-pointer"
                            title={isHi ? 'लेनदेन एडिट करें' : 'Edit Record'}
                          >
                            <Edit3 className="w-3.5 h-3.5 text-purple-400" />
                          </button>

                          <button
                            onClick={() => setDeleteConfirmId(t.id)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs transition-all cursor-pointer"
                            title={isHi ? 'रिकॉर्ड हटाएं' : 'Delete Record'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && txnToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-rose-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">
                  {isHi ? 'लेन-देन रिकॉर्ड हटाएं?' : 'Delete Transaction Record?'}
                </h4>
                <p className="text-xs text-slate-400">
                  {isHi ? 'यह रिकॉर्ड इतिहास से हटा दिया जाएगा।' : 'This record will be permanently deleted.'}
                </p>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
              <div className="font-bold text-white">
                {txnToDelete.type} — {formatINR(txnToDelete.amount)}
              </div>
              <div className="text-slate-400 font-mono">Ref: {txnToDelete.referenceId}</div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                {isHi ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  onDeleteTransaction(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 cursor-pointer"
              >
                {isHi ? 'हां, रिकॉर्ड हटाएं' : 'Yes, Delete Record'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
