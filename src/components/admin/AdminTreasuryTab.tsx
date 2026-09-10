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
} from 'lucide-react';
import { CompanyTreasury, Language, TreasuryLog } from '../../types';
import { formatINR } from '../../utils/storage';
import { DEFAULT_ALERT_THRESHOLD } from '../../utils/treasuryStorage';

interface AdminTreasuryTabProps {
  treasury: CompanyTreasury;
  logs: TreasuryLog[];
  language: Language;
  onOpenAddModal: () => void;
  onOpenDeductModal: () => void;
  onQuickAdd: (amount: number) => void;
  onResetTreasury: () => void;
}

export const AdminTreasuryTab: React.FC<AdminTreasuryTabProps> = ({
  treasury,
  logs,
  language,
  onOpenAddModal,
  onOpenDeductModal,
  onQuickAdd,
  onResetTreasury,
}) => {
  const isHi = language === 'hi';
  const isLowBalance = treasury.balance <= DEFAULT_ALERT_THRESHOLD;
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredLogs = logs.filter((log) => {
    const matchesFilter =
      filterType === 'ALL' ||
      (filterType === 'ADMIN' && (log.type === 'ADMIN_ADD' || log.type === 'ADMIN_DEDUCT')) ||
      (filterType === 'USER' && (log.type === 'USER_INVESTMENT_DEDUCT' || log.type === 'USER_PAYOUT_DEDUCT' || log.type === 'USER_FUND_ADD_DEDUCT'));

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
      {/* Alert Banner if <= 500000 */}
      {isLowBalance && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950 via-amber-950/60 to-rose-950 border-2 border-rose-500/80 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-black text-rose-300 uppercase tracking-wide">
                {isHi
                  ? '⚠️ कंपनी का मुख्य बैलेंस ₹5,00,000 या उससे कम हो गया है!'
                  : '⚠️ CRITICAL: Company Main Balance is <= ₹5,00,000!'}
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                {isHi
                  ? `वर्तमान बैलेंस: ₹${treasury.balance.toLocaleString('en-IN')}। जब भी कोई यूज़र इन्वेस्ट करता है, राशि यहीं से ट्रांसफर होती है। इसलिए तुरंत बैलेंस बढ़ाएं!`
                  : `Current balance: ₹${treasury.balance.toLocaleString('en-IN')}. Every user investment requires sufficient treasury balance. Please top up now!`}
              </p>
            </div>
          </div>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 cursor-pointer hover:scale-105 transition-all"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>{isHi ? '⚡ मुख्य बैलेंस बढ़ाएं (+ Add Balance)' : '⚡ Add Balance Now'}</span>
          </button>
        </div>
      )}

      {/* Main Treasury Control Card */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {isHi ? 'कंपनी ट्रेजरी एवं मुख्य लिक्विडिटी फंड' : 'Company Treasury & Master Liquidity'}
              </h3>
              <p className="text-xs text-slate-400">
                {isHi
                  ? 'निवेशकों के निवेश और पेआउट्स इसी मुख्य बैलेंस से लिंक हैं'
                  : 'All user investments and return payouts deduct directly from this central pool'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isHi ? '+ बैलेंस बढ़ाएं' : '+ Increase Balance'}</span>
            </button>

            <button
              onClick={onOpenDeductModal}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
            >
              <MinusCircle className="w-4 h-4" />
              <span>{isHi ? '- बैलेंस घटाएं' : '- Deduct Balance'}</span>
            </button>

            <button
              onClick={onResetTreasury}
              title={isHi ? 'डिफ़ॉल्ट पर रीसेट करें' : 'Reset to Default'}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Big Balance Callout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                {isHi ? 'कंपनी का वर्तमान मुख्य बैलेंस' : 'Current Company Balance'}
              </span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  isLowBalance
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                {isLowBalance ? (isHi ? '⚠️ 5 लाख अलर्ट' : '⚠️ <= ₹5L Alert') : isHi ? 'पर्याप्त' : 'Healthy'}
              </span>
            </div>
            <p
              className={`text-3xl sm:text-4xl font-black font-mono tracking-tight ${
                isLowBalance ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {formatINR(treasury.balance)}
            </p>
            <p className="text-[11px] text-slate-400">
              {isHi
                ? `अलर्ट सीमा: ₹${DEFAULT_ALERT_THRESHOLD.toLocaleString('en-IN')} (बैलेंस ₹5 लाख आते ही एडमिन को अलर्ट)`
                : `Alert Threshold: ₹${DEFAULT_ALERT_THRESHOLD.toLocaleString('en-IN')} (Instant Admin Alert)`}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
              <span>{isHi ? 'कुल एडमिन इंजेक्शन' : 'Total Injected'}</span>
            </div>
            <p className="text-2xl font-bold font-mono text-emerald-300">
              {formatINR(treasury.totalInjected)}
            </p>
            <p className="text-[11px] text-slate-400">{isHi ? 'बैंक रिज़र्व / फंड्स' : 'Bank Escrow Injections'}</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <ArrowUpRight className="w-4 h-4 text-cyan-400" />
              <span>{isHi ? 'यूज़र्स को ट्रांसफर' : 'Transferred to Users'}</span>
            </div>
            <p className="text-2xl font-bold font-mono text-cyan-300">
              {formatINR(treasury.totalTransferredToUsers)}
            </p>
            <p className="text-[11px] text-slate-400">
              {isHi ? 'निवेश डिडक्शन व पेआउट्स' : 'User Investment Deductions'}
            </p>
          </div>
        </div>

        {/* Quick Top-up Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-slate-400 font-medium">
            {isHi ? '⚡ त्वरित टॉप-अप जोड़ें:' : '⚡ Instant Add Balance:'}
          </span>
          {[100000, 200000, 500000, 1000000, 2500000].map((amt) => (
            <button
              key={amt}
              onClick={() => onQuickAdd(amt)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-950/60 text-slate-300 hover:text-emerald-300 border border-slate-700 hover:border-emerald-500/40 text-xs font-mono font-semibold transition-all cursor-pointer"
            >
              +{formatINR(amt)}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Logs / Ledger Table */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-base font-bold text-white">
              {isHi ? 'कंपनी ट्रेजरी पासबुक व ऑडिट लॉग्स' : 'Company Treasury Passbook & Ledger'}
            </h4>
            <p className="text-xs text-slate-400">
              {isHi
                ? 'प्रत्येक डिडक्शन, निवेश ट्रांसफर और एडमिन टॉप-अप का समयवार ब्यौरा'
                : 'Complete audit trail of every deduction, user investment transfer, and admin adjustment'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Buttons */}
            <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
              <button
                onClick={() => setFilterType('ALL')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  filterType === 'ALL' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {isHi ? 'सभी' : 'All'}
              </button>
              <button
                onClick={() => setFilterType('ADMIN')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  filterType === 'ADMIN' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {isHi ? 'एडमिन' : 'Admin'}
              </button>
              <button
                onClick={() => setFilterType('USER')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  filterType === 'USER' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {isHi ? 'यूज़र निवेश' : 'User Transfer'}
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={isHi ? 'खोजें...' : 'Search logs...'}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500 w-44"
              />
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">{isHi ? 'समय / दिनांक' : 'Date & Time'}</th>
                <th className="py-3 px-4">{isHi ? 'प्रकार (Action)' : 'Type'}</th>
                <th className="py-3 px-4">{isHi ? 'राशि (Amount)' : 'Amount'}</th>
                <th className="py-3 px-4">{isHi ? 'बैलेंस (पहले -> बाद)' : 'Balance (Before -> After)'}</th>
                <th className="py-3 px-4">{isHi ? 'विवरण (Reason)' : 'Details'}</th>
                <th className="py-3 px-4">{isHi ? 'कर्ता (Actor)' : 'Actor'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    {isHi ? 'कोई रिकॉर्ड नहीं मिला।' : 'No records found.'}
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isCredit = log.type === 'ADMIN_ADD';
                  return (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                        {new Date(log.timestamp).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {log.type === 'ADMIN_ADD' && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/30">
                            + {isHi ? 'एडमिन टॉप-अप' : 'ADMIN ADD'}
                          </span>
                        )}
                        {log.type === 'ADMIN_DEDUCT' && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold text-[10px] border border-rose-500/30">
                            - {isHi ? 'एडमिन कटौती' : 'ADMIN DEDUCT'}
                          </span>
                        )}
                        {log.type === 'USER_INVESTMENT_DEDUCT' && (
                          <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-[10px] border border-cyan-500/30">
                            🔻 {isHi ? 'यूज़र निवेश ट्रांसफर' : 'USER INVEST TRF'}
                          </span>
                        )}
                        {log.type === 'USER_PAYOUT_DEDUCT' && (
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold text-[10px] border border-purple-500/30">
                            🔻 {isHi ? 'पेआउट ट्रांसफर' : 'PAYOUT TRF'}
                          </span>
                        )}
                        {log.type === 'USER_FUND_ADD_DEDUCT' && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/30">
                            🏦 {isHi ? 'यूज़र डिपॉजिट डिडक्शन' : 'USER DEPOSIT DEDUCT'}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap font-mono font-bold">
                        <span className={isCredit ? 'text-emerald-400' : 'text-rose-400'}>
                          {isCredit ? '+' : '-'}
                          {formatINR(log.amount)}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-slate-400">
                        <span>{formatINR(log.balanceBefore)}</span>
                        <span className="mx-1 text-slate-600">→</span>
                        <span className="font-bold text-slate-200">{formatINR(log.balanceAfter)}</span>
                      </td>

                      <td className="py-3 px-4 text-slate-300 max-w-xs">
                        <p className="truncate text-xs">{isHi && log.reasonHi ? log.reasonHi : log.reason}</p>
                        {log.referenceId && (
                          <span className="text-[10px] font-mono text-slate-500 block">
                            Ref: {log.referenceId}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-slate-400 text-xs">
                        {log.actor}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
