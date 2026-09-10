import React, { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  Receipt,
  CheckCircle2,
  Clock,
  Filter,
} from 'lucide-react';
import { Transaction, TransactionType, Language } from '../types';
import { formatINR } from '../utils/storage';

interface TransactionsTableProps {
  transactions: Transaction[];
  language: Language;
  onViewVoucher?: (tx: Transaction) => void;
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({
  transactions,
  language,
  onViewVoucher,
}) => {
  const isHi = language === 'hi';
  const [filter, setFilter] = useState<string>('ALL');

  const filteredTransactions = transactions.filter((t) => {
    if (filter === 'ALL') return true;
    return t.type === filter;
  });

  const getTypeIcon = (type: TransactionType) => {
    switch (type) {
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
    }
  };

  const getTypeLabel = (type: TransactionType) => {
    switch (type) {
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
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-800">
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

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'ALL', label: isHi ? 'सभी' : 'All' },
            { id: 'DEPOSIT', label: isHi ? 'जमा' : 'Deposits' },
            { id: 'RETURN_PAYOUT', label: isHi ? 'रिटर्न' : 'Returns' },
            { id: 'INVEST', label: isHi ? 'निवेश' : 'Investments' },
            { id: 'WITHDRAWAL', label: isHi ? 'निकासी' : 'Withdrawals' },
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
                const isPositive = tx.type === 'DEPOSIT' || tx.type === 'RETURN_PAYOUT' || tx.type === 'CAPITAL_RETURN';
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
                          {getTypeIcon(tx.type)}
                        </div>
                        <div>
                          <div className="font-semibold text-white flex items-center gap-1.5">
                            <span>{getTypeLabel(tx.type)}</span>
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
                          </div>
                          <div className="text-[11px] text-slate-400 line-clamp-1">
                            {isHi ? tx.noteHi : tx.note}
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
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{tx.status}</span>
                      </span>
                    </td>

                    <td className="py-3.5 pr-2 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={`font-mono font-bold text-sm ${
                            isPositive ? 'text-emerald-400' : 'text-slate-200'
                          }`}
                        >
                          {isPositive ? '+' : '-'}
                          {formatINR(tx.amount)}
                        </span>

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
    </div>
  );
};
