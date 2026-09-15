import React, { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  Receipt,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Filter,
  Printer,
  Download,
  FileText,
  RefreshCw,
  ArrowRightLeft,
  Send,
} from 'lucide-react';
import { Transaction, TransactionType, Language, UserProfile } from '../types';
import { formatINR } from '../utils/storage';
import { getStoredCompanyProfile } from '../utils/companyStorage';
import { printDocument } from '../utils/printHelper';

interface TransactionsTableProps {
  transactions: Transaction[];
  language: Language;
  user?: UserProfile | null;
  onViewVoucher?: (tx: Transaction) => void;
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({
  transactions,
  language,
  user,
  onViewVoucher,
}) => {
  const isHi = language === 'hi';
  const [filter, setFilter] = useState<string>('ALL');

  const companyProfile = getStoredCompanyProfile();

  // Stats for statement PDF
  const successDeposits = transactions
    .filter((t) => t.type === 'DEPOSIT' && t.status === 'SUCCESS')
    .reduce((sum, t) => sum + t.amount, 0);

  const successWithdrawals = transactions
    .filter((t) => t.type === 'WITHDRAWAL' && t.status === 'SUCCESS')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalInvestments = transactions
    .filter((t) => t.type === 'INVEST')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalReturnsPaid = transactions
    .filter((t) => t.type === 'RETURN_PAYOUT' && t.status === 'SUCCESS')
    .reduce((sum, t) => sum + t.amount, 0);

  const handleExportPDF = () => {
    printDocument('statement-print-canvas', `GCap-Statement-${user?.loginId || 'Investor'}`);
  };

  const userName = user?.name || 'Valued Investor';
  const userLoginId = user?.loginId || 'N/A';
  const userPhone = user?.phone || 'N/A';

  const filteredTransactions = transactions.filter((t) => {
    if (filter === 'ALL') return true;
    if (filter === 'PENDING') return t.status === 'PENDING';
    return t.type === filter;
  });

  const getTypeIcon = (tx: Transaction) => {
    switch (tx.type) {
      case 'DEPOSIT':
        return <ArrowDownLeft className="w-4 h-4 text-emerald-400" />;
      case 'INVEST':
        return <TrendingUp className="w-4 h-4 text-blue-400" />;
      case 'RETURN_PAYOUT':
        return <Sparkles className="w-4 h-4 text-amber-400" />;
      case 'WITHDRAWAL':
        return <ArrowUpRight className="w-4 h-4 text-purple-400" />;
      case 'CAPITAL_RETURN':
        return <CheckCircle2 className="w-4 h-4 text-cyan-400" />;
      case 'SWAP_GP':
        return <RefreshCw className="w-4 h-4 text-teal-400" />;
      case 'TRANSFER':
        if (tx.id.includes('-recv-') || (tx.note || '').toLowerCase().includes('received') || (tx.noteHi || '').includes('प्राप्त')) {
          return <ArrowDownLeft className="w-4 h-4 text-emerald-400" />;
        }
        return <ArrowUpRight className="w-4 h-4 text-indigo-400" />;
      case 'REFERRAL_BONUS':
        return <Sparkles className="w-4 h-4 text-pink-400" />;
      default:
        return <Receipt className="w-4 h-4 text-slate-400" />;
    }
  };

  const getTypeLabel = (tx: Transaction) => {
    switch (tx.type) {
      case 'DEPOSIT':
        return isHi ? 'फंड जमा (Deposit)' : 'Funds Added';
      case 'INVEST':
        return isHi ? 'निवेश आवंटन (Invest)' : 'Plan Investment';
      case 'RETURN_PAYOUT':
        return isHi ? 'दैनिक रिटर्न (Return Payout)' : 'Daily Return Paid';
      case 'WITHDRAWAL':
        return isHi ? 'बैंक/UPI निकासी (Withdrawal)' : 'Withdrawal';
      case 'CAPITAL_RETURN':
        return isHi ? 'मूलधन वापसी (Capital Return)' : 'Capital Returned';
      case 'SWAP_GP':
        return isHi ? 'GP कनवर्ट/स्वैप (GP Swap)' : 'GP Swap';
      case 'TRANSFER':
        if (tx.id.includes('-recv-') || (tx.note || '').toLowerCase().includes('received') || (tx.noteHi || '').includes('प्राप्त')) {
          return isHi ? 'GP प्राप्त हुआ (Received GP)' : 'GP Received';
        }
        return isHi ? 'GP ट्रांसफर (Sent GP)' : 'P2P GP Sent';
      case 'REFERRAL_BONUS':
        return isHi ? 'रेफरल बोनस (Referral Bonus)' : 'Referral Bonus';
      default:
        return isHi ? 'लेनदेन (Transaction)' : 'Transaction';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between flex-1 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                {isHi ? 'लेनदेन का इतिहास (Transactions)' : 'Transaction Ledger & History'}
              </h3>
              <p className="text-xs text-slate-400">
                {isHi
                  ? 'जमा, रिटर्न भुगतान और निकासी का संपूर्ण ब्योरा'
                  : 'Complete audit trail of all deposits, return payouts, and withdrawals'}
              </p>
            </div>
          </div>

          <button
            id="btn-export-statement"
            onClick={handleExportPDF}
            className="self-start sm:self-center py-1.5 px-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs inline-flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-500/10 active:scale-95"
            title={isHi ? 'लेनदेन विवरण PDF में सहेजें' : 'Save transaction history as PDF'}
          >
            <Printer className="w-4 h-4 text-slate-950 font-bold" />
            <span>{isHi ? 'खाता विवरण (PDF)' : 'Export Statement (PDF)'}</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'ALL', label: isHi ? 'सभी' : 'All' },
            { id: 'PENDING', label: isHi ? '⏳ लंबित' : '⏳ Pending' },
            { id: 'DEPOSIT', label: isHi ? 'जमा' : 'Deposits' },
            { id: 'RETURN_PAYOUT', label: isHi ? 'रिटर्न' : 'Returns' },
            { id: 'INVEST', label: isHi ? 'निवेश' : 'Investments' },
            { id: 'WITHDRAWAL', label: isHi ? 'निकासी' : 'Withdrawals' },
            { id: 'TRANSFER', label: isHi ? 'GP ट्रांसफर' : 'GP Transfers' },
            { id: 'SWAP_GP', label: isHi ? 'GP स्वैप' : 'GP Swaps' },
          ].map((item) => (
            <button
              key={item.id}
              id={`btn-tx-filter-${item.id}`}
              onClick={() => setFilter(item.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                filter === item.id
                  ? 'bg-emerald-600 text-white font-bold shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="text-center py-8 text-slate-500 text-xs">
          {isHi ? 'इस श्रेणी में कोई लेनदेन नहीं मिला।' : 'No transactions found under this filter.'}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider">
                <th className="pb-3 pl-2 font-medium">{isHi ? 'प्रकार / विवरण' : 'Type & Description'}</th>
                <th className="pb-3 px-3 font-medium">{isHi ? 'रेफरेंस / विधि' : 'Ref / Method'}</th>
                <th className="pb-3 px-3 font-medium">{isHi ? 'तारीख' : 'Date & Time'}</th>
                <th className="pb-3 px-3 font-medium">{isHi ? 'स्थिति' : 'Status'}</th>
                <th className="pb-3 pr-2 text-right font-medium">{isHi ? 'राशि (Amount)' : 'Amount'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredTransactions.map((tx) => {
                const isReceivedTransfer = tx.type === 'TRANSFER' && (tx.id.includes('-recv-') || (tx.note || '').toLowerCase().includes('received') || (tx.noteHi || '').includes('प्राप्त'));
                const isPositive = tx.type === 'DEPOSIT' || tx.type === 'RETURN_PAYOUT' || tx.type === 'CAPITAL_RETURN' || tx.type === 'REFERRAL_BONUS' || isReceivedTransfer;
                const formattedDate = new Date(tx.timestamp || tx.date).toLocaleString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 pl-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                          {getTypeIcon(tx)}
                        </div>
                        <div>
                          <div className="font-semibold text-white flex items-center gap-1.5">
                            <span>{getTypeLabel(tx)}</span>
                            {tx.type === 'WITHDRAWAL' && tx.withdrawalSource && (
                              <span
                                className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                                  tx.withdrawalSource === 'ROYALTY'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                }`}
                              >
                                {tx.withdrawalSource === 'ROYALTY'
                                  ? (isHi ? 'रॉयल्टी (6-10 तारीख)' : 'Royalty (6th-10th)')
                                  : (isHi ? 'अर्निंग (1-5 तारीख)' : 'Earning (1st-5th)')}
                              </span>
                            )}
                            {tx.type === 'TRANSFER' && (
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                GP
                              </span>
                            )}
                            {tx.type === 'SWAP_GP' && (
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                                CASH ➔ GP
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 line-clamp-1">
                            {isHi ? (tx.noteHi || tx.note) : (tx.note || tx.noteHi)}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="font-mono text-slate-300">{tx.referenceId}</div>
                      {tx.method && (
                        <div className="text-[10px] text-slate-500">{tx.method}</div>
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-slate-400 font-mono whitespace-nowrap">
                      {formattedDate}
                    </td>

                    <td className="py-3.5 px-3">
                      {tx.status === 'SUCCESS' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/15 px-2.5 py-1 rounded-full border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>{isHi ? 'सत्यापित (Success)' : 'Success'}</span>
                        </span>
                      )}
                      {tx.status === 'PENDING' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-500/15 px-2.5 py-1 rounded-full border border-amber-500/30 animate-pulse">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>{isHi ? 'सत्यापन जारी (Pending)' : 'Pending'}</span>
                        </span>
                      )}
                      {tx.status === 'REJECTED' && (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/15 px-2.5 py-1 rounded-full border border-rose-500/30">
                            <XCircle className="w-3 h-3 text-rose-400" />
                            <span>{isHi ? 'अस्वीकृत (Rejected)' : 'Rejected'}</span>
                          </span>
                          {(tx.rejectReason || tx.rejectReasonHi) && (
                            <div className="flex items-start gap-1 text-[10px] text-rose-300/90 max-w-[200px] leading-tight bg-rose-950/40 p-1 rounded border border-rose-900/40">
                              <AlertCircle className="w-3 h-3 text-rose-400 shrink-0 mt-0.5" />
                              <span>{isHi && tx.rejectReasonHi ? tx.rejectReasonHi : (tx.rejectReason || tx.rejectReasonHi)}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 pr-2 text-right">
                      <div className="flex flex-col items-end gap-1">
                        {tx.type === 'TRANSFER' ? (
                          <span className={`font-mono font-bold text-sm ${isReceivedTransfer ? 'text-emerald-400' : 'text-indigo-300'}`}>
                            {isReceivedTransfer ? '+' : '-'}{tx.gpEarned || tx.amount} GP
                          </span>
                        ) : tx.type === 'SWAP_GP' ? (
                          <span className="font-mono font-bold text-sm text-teal-300">
                            +{tx.gpEarned || tx.amount} GP
                          </span>
                        ) : (
                          <span className={`font-mono font-bold text-sm ${isPositive ? 'text-emerald-400' : 'text-slate-200'}`}>
                            {isPositive ? '+' : '-'}{formatINR(tx.amount)}
                          </span>
                        )}

                        {tx.type === 'WITHDRAWAL' && onViewVoucher && (
                          <button
                            onClick={() => onViewVoucher(tx)}
                            className="px-2 py-0.5 rounded bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 font-bold text-[10px] flex items-center gap-1 transition-all cursor-pointer"
                            title={isHi ? 'TDS वाउचर देखें व प्रिंट करें' : 'View & Print Payment Voucher'}
                          >
                            <Receipt className="w-3 h-3 text-purple-400" />
                            <span>{isHi ? '🧾 वाउचर' : 'Receipt'}</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* HIDDEN PRINT STATEMENT CANVAS */}
      <div id="statement-print-canvas" className="hidden">
        <div className="p-8 bg-white text-slate-900 font-sans" style={{ color: '#0f172a' }}>
          {/* Header */}
          <div className="text-center pb-6 border-b-2 border-slate-900">
            <h1 className="text-2xl font-black tracking-wider text-slate-950 uppercase font-serif">
              {companyProfile.companyName}
            </h1>
            {companyProfile.companyNameHi && (
              <p className="text-xs font-bold text-slate-700 mt-1 font-sans">
                {companyProfile.companyNameHi}
              </p>
            )}
            <div className="mt-2 text-[10px] text-slate-600 font-mono space-y-0.5">
              <p>CIN: {companyProfile.cin} | PAN: {companyProfile.pan} | GSTIN: {companyProfile.gstin}</p>
              <p>Registered Office: {companyProfile.registeredAddress}</p>
              <p>Website: {companyProfile.websiteUrl} | Email: {companyProfile.supportEmail}</p>
            </div>
          </div>

          {/* Statement Title & Timestamp */}
          <div className="my-6 flex justify-between items-end border-b pb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 uppercase">
                Official Account Statement & Ledger
              </h2>
              <p className="text-[11px] text-slate-600 font-bold font-sans">
                आधिकारिक लेनदेन खाता विवरण एवं खाता बही
              </p>
            </div>
            <div className="text-right text-[10px] text-slate-600 font-mono">
              <p><strong>Generated On:</strong> {new Date().toLocaleString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
              })}</p>
              <p><strong>Statement Period:</strong> All Time / लाइफटाइम</p>
            </div>
          </div>

          {/* User Details Block */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl mb-6 text-xs font-sans">
            <div>
              <span className="text-slate-500 uppercase block text-[9px] font-bold tracking-wider">Account Holder Name</span>
              <span className="font-extrabold text-slate-900 text-sm">{userName}</span>
            </div>
            <div>
              <span className="text-slate-500 uppercase block text-[9px] font-bold tracking-wider">Login / Investor ID</span>
              <span className="font-mono font-bold text-slate-900">{userLoginId}</span>
            </div>
            <div>
              <span className="text-slate-500 uppercase block text-[9px] font-bold tracking-wider">Registered Mobile</span>
              <span className="font-mono font-bold text-slate-900">{userPhone}</span>
            </div>
            <div>
              <span className="text-slate-500 uppercase block text-[9px] font-bold tracking-wider">Document Status</span>
              <span className="text-emerald-700 font-extrabold uppercase">Officially Verified Ledger</span>
            </div>
          </div>

          {/* Summary Statistics */}
          <div className="grid grid-cols-4 gap-3 mb-6 font-sans">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <span className="text-[9px] text-slate-500 uppercase block font-bold">Total Deposited</span>
              <span className="text-sm font-black text-slate-900 font-mono">{formatINR(successDeposits)}</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <span className="text-[9px] text-slate-500 uppercase block font-bold">Total Investments</span>
              <span className="text-sm font-black text-slate-900 font-mono">{formatINR(totalInvestments)}</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <span className="text-[9px] text-slate-500 uppercase block font-bold">Total Returns Paid</span>
              <span className="text-sm font-black text-slate-900 font-mono">{formatINR(totalReturnsPaid)}</span>
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
              <span className="text-[9px] text-emerald-800 uppercase block font-bold">Net Outflows</span>
              <span className="text-sm font-black text-emerald-900 font-mono">{formatINR(successWithdrawals)}</span>
            </div>
          </div>

          {/* Transaction Ledger Table */}
          <div className="mb-8 font-sans">
            <table className="w-full text-left text-[11px] border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-900 bg-slate-100 text-slate-800 font-bold uppercase tracking-wider text-[9px]">
                  <th className="py-2 px-2">Date & Time</th>
                  <th className="py-2 px-2">Type / Description</th>
                  <th className="py-2 px-2">Reference ID</th>
                  <th className="py-2 px-2">Method</th>
                  <th className="py-2 px-2">Status</th>
                  <th className="py-2 px-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono text-xs">
                {transactions.map((tx) => {
                  const isPositive = tx.type === 'DEPOSIT' || tx.type === 'RETURN_PAYOUT' || tx.type === 'CAPITAL_RETURN';
                  const formattedDate = new Date(tx.timestamp || tx.date).toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  return (
                    <tr key={tx.id} className="text-slate-800">
                      <td className="py-2 px-2 whitespace-nowrap">{formattedDate}</td>
                      <td className="py-2 px-2">
                        <div className="font-bold">{getTypeLabel(tx)}</div>
                        <div className="text-[9px] text-slate-500 font-sans">{isHi ? tx.noteHi : tx.note}</div>
                      </td>
                      <td className="py-2 px-2 text-[11px] font-mono">{tx.referenceId}</td>
                      <td className="py-2 px-2 capitalize">{tx.method || 'Internal Transfer'}</td>
                      <td className="py-2 px-2">
                        <span className={`font-bold text-[9px] px-1.5 py-0.5 rounded ${
                          tx.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                          tx.status === 'PENDING' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 
                          'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className={`py-2 px-2 text-right font-bold text-sm ${isPositive ? 'text-emerald-700' : 'text-slate-900'}`}>
                        {isPositive ? '+' : '-'}{formatINR(tx.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Signatory Section */}
          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-300 text-center text-xs mt-12 font-sans">
            <div>
              <div className="relative inline-block">
                <span className="font-serif italic font-bold text-slate-800 text-sm">
                  {companyProfile.authorizedSignatory}
                </span>
                {/* Seal overlay */}
                <div className="absolute -top-6 -left-12 w-20 h-20 rounded-full border border-dashed border-emerald-600/30 flex flex-col items-center justify-center p-1 text-[8px] font-black uppercase text-emerald-700/40 text-center leading-tight rotate-12 select-none pointer-events-none">
                  <span>GCAP TRUST</span>
                  <span className="font-mono text-[6px] text-slate-400">SEAL & SIGN</span>
                  <span>MUMBAI</span>
                </div>
              </div>
              <div className="w-36 h-0.5 bg-slate-400 mx-auto mb-1 mt-2"></div>
              <span className="text-[9px] text-slate-500 uppercase font-semibold block">
                Authorized Signatory
              </span>
              <span className="text-[8px] text-slate-400 block font-mono">
                {companyProfile.signatoryDesignation}
              </span>
            </div>
            <div>
              <div className="h-8 flex items-center justify-center text-slate-600 font-bold font-sans">
                [ AUTOMATED COMPTROLLER VERIFICATION ]
              </div>
              <div className="w-36 h-0.5 bg-slate-400 mx-auto mb-1"></div>
              <span className="text-[9px] text-slate-500 uppercase font-semibold block">
                GCap Financial Comptroller
              </span>
              <span className="text-[8px] text-slate-400 block font-mono">
                System Audited Ledgers
              </span>
            </div>
          </div>

          {/* Legal Footnote */}
          <div className="mt-8 text-center text-[8px] text-slate-400 border-t pt-4 font-mono leading-relaxed">
            <p>This is a computer-generated, officially sealed account statement requiring no physical signatures for validity. All balances are subject to trust terms.</p>
            <p className="mt-0.5">यह एक कंप्यूटर जनित खाता विवरण है जिस पर हस्ताक्षर की आवश्यकता नहीं है। सभी विसंगतियाँ 7 दिनों में सूचित की जानी चाहिए।</p>
          </div>
        </div>
      </div>
    </div>
  );
};
