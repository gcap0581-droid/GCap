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
} from 'lucide-react';
import { Language, Transaction, TransactionType } from '../../types';
import { formatINR } from '../../utils/storage';

interface AdminTransactionsTabProps {
  transactions: Transaction[];
  language: Language;
  companyBalance?: number;
  onAddTransaction: () => void;
  onEditTransaction: (txn: Transaction) => void;
  onDeleteTransaction: (txnId: string) => void;
  onQuickApprove?: (txnId: string) => void;
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
  onRejectTransaction,
}) => {
  const isHi = language === 'hi';
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const pendingDeposits = transactions.filter((t) => t.type === 'DEPOSIT' && t.status === 'PENDING');

  const filtered = transactions.filter((t) => {
    const matchesSearch =
      (t.referenceId && t.referenceId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      t.note.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.method && t.method.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = filterType === 'ALL' || t.type === filterType;
    const matchesStatus = filterStatus === 'ALL' || t.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const txnToDelete = transactions.find((t) => t.id === deleteConfirmId);

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-purple-400" />
            <span>{isHi ? 'ग्लोबल लेन-देन एवं पेआउट्स ऑडिट' : 'Global Transactions & Payouts Audit'}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {isHi
              ? `कुल रिकॉर्ड: ${transactions.length} • मैन्युअल क्रेडिट/डेबिट जोड़ें, स्थिति बदलें या डिलीट करें`
              : `Total Records: ${transactions.length} • Manually record deposits, change status, or delete entries`}
          </p>
        </div>

        <button
          id="btn-admin-add-txn"
          onClick={onAddTransaction}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/30 cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{isHi ? '+ नया लेन-देन जोड़ें' : '+ Add Transaction'}</span>
        </button>
      </div>

      {/* SPECIAL RULE QUEUE: User Deposit Approval & Company Main Balance Deduction */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 p-5 rounded-2xl border border-amber-500/40 shadow-xl space-y-3">
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

        {pendingDeposits.length === 0 ? (
          <div className="py-3 px-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2.5 text-slate-400 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {isHi
                ? 'वर्तमान में कोई लंबित डिपॉजिट अनुरोध नहीं है। सभी यूज़र फंड सफलतापूर्वक सत्यापित हैं।'
                : 'No pending deposit requests. All user additions are verified.'}
            </span>
          </div>
        ) : (
          <div className="space-y-2.5">
            {pendingDeposits.map((dep) => {
              const postApprovalCompanyBalance = companyBalance !== undefined ? Math.max(0, companyBalance - dep.amount) : undefined;
              return (
                <div
                  key={dep.id}
                  className="bg-slate-950 p-3.5 rounded-xl border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 transition-all hover:border-amber-400/50"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
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
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isHi ? 'UTR, संदर्भ, विवरण से खोजें...' : 'Search by reference, UTR, note...'}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:border-purple-400 focus:outline-none"
          >
            <option value="ALL">{isHi ? 'सभी प्रकार (All Types)' : 'All Types'}</option>
            <option value="DEPOSIT">DEPOSIT (जमा)</option>
            <option value="WITHDRAWAL">WITHDRAWAL (निकासी)</option>
            <option value="INVEST">INVEST (निवेश)</option>
            <option value="RETURN_PAYOUT">RETURN_PAYOUT (रिटर्न)</option>
            <option value="CAPITAL_REFUND">CAPITAL_REFUND (मूलधन)</option>
            <option value="REFERRAL_BONUS">REFERRAL_BONUS (बोनस)</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:border-purple-400 focus:outline-none"
          >
            <option value="ALL">{isHi ? 'सभी स्थिति (All Status)' : 'All Status'}</option>
            <option value="SUCCESS">SUCCESS (सफल)</option>
            <option value="PENDING">PENDING (लंबित)</option>
            <option value="REJECTED">REJECTED (अस्वीकृत)</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">{isHi ? 'प्रकार / संदर्भ' : 'Type / Ref ID'}</th>
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
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    {isHi ? 'कोई लेन-देन रिकॉर्ड नहीं मिला।' : 'No transaction records found.'}
                  </td>
                </tr>
              ) : (
                filtered.map((t) => {
                  const isPositive =
                    t.type === 'DEPOSIT' ||
                    t.type === 'RETURN_PAYOUT' ||
                    t.type === 'CAPITAL_RETURN';

                  return (
                    <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Type & Ref */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`p-1.5 rounded-lg shrink-0 ${
                              isPositive
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-rose-500/10 text-rose-400'
                            }`}
                          >
                            {isPositive ? (
                              <ArrowDownLeft className="w-3.5 h-3.5" />
                            ) : (
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white block text-xs">
                                {t.type}
                              </span>
                              {t.type === 'WITHDRAWAL' && t.withdrawalSource && (
                                <span
                                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                                    t.withdrawalSource === 'ROYALTY'
                                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                      : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                  }`}
                                >
                                  {t.withdrawalSource === 'ROYALTY' ? 'Royalty (6-10th)' : 'Earning (1-5th)'}
                                </span>
                              )}
                            </div>
                            <span className="font-mono text-[10px] text-slate-400 block">
                              {t.referenceId || t.id}
                            </span>
                          </div>
                        </div>
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
                      <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate">
                        {isHi && t.noteHi ? t.noteHi : t.note}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            t.status === 'SUCCESS'
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : t.status === 'PENDING'
                              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                              : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          {t.status === 'SUCCESS' ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : t.status === 'PENDING' ? (
                            <Clock className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          <span>{t.status}</span>
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        {new Date(t.timestamp).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {t.status === 'PENDING' && onQuickApprove && (
                            <button
                              onClick={() => onQuickApprove(t.id)}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold transition-all cursor-pointer"
                              title="Approve immediately"
                            >
                              Approve
                            </button>
                          )}

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
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                {isHi ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  onDeleteTransaction(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30"
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
