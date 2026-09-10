import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  RotateCcw,
  FileSpreadsheet,
  Download,
  Users,
  Building2,
  Wallet,
  TrendingUp,
  Receipt,
  Layers,
  CheckCircle2,
  Copy,
  Check,
} from 'lucide-react';
import { BackupRecord, Language } from '../../types';
import { formatINR } from '../../utils/storage';
import { exportBackupRecordToExcel } from '../../utils/excelExport';
import { downloadBackupAsJSON } from '../../utils/backupStorage';

interface BackupDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  backup: BackupRecord | null;
  language: Language;
  onRestoreRequest: (backup: BackupRecord) => void;
}

type DetailTab = 'OVERVIEW' | 'USERS' | 'INVESTMENTS' | 'TRANSACTIONS' | 'PLANS' | 'TREASURY' | 'JSON';

export const BackupDetailModal: React.FC<BackupDetailModalProps> = ({
  isOpen,
  onClose,
  backup,
  language,
  onRestoreRequest,
}) => {
  const isHi = language === 'hi';
  const [activeTab, setActiveTab] = useState<DetailTab>('OVERVIEW');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !backup) return null;

  const isMidnight = backup.triggerType === 'MIDNIGHT_AUTO';
  const dateFormatted = new Date(backup.timestamp).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const timeFormatted = new Date(backup.timestamp).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(backup, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportExcel = () => {
    exportBackupRecordToExcel(backup);
  };

  const handleDownloadJson = () => {
    downloadBackupAsJSON(backup);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        id="modal-backup-detail"
        className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between p-4 sm:p-6 border-b border-slate-800 bg-slate-950/60">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  isMidnight
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                {isMidnight
                  ? isHi
                    ? '🌙 रात 12:00 बजे का ऑटो बैकअप'
                    : '🌙 12:00 AM Midnight Auto-Backup'
                  : isHi
                  ? '⚡ एडमिन मैनुअल बैकअप'
                  : '⚡ Admin Manual Snapshot'}
              </span>
              <span className="text-xs text-slate-400 font-mono">ID: {backup.id}</span>
            </div>

            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              <span>{isHi ? backup.titleHi : backup.title}</span>
            </h2>

            <p className="text-xs text-slate-400">
              {dateFormatted} • {timeFormatted}
            </p>
          </div>

          <button
            id="btn-close-backup-detail"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Action Bar */}
        <div className="px-4 sm:px-6 py-3 bg-slate-950/90 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5">
          {/* Subtabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {(
              [
                { id: 'OVERVIEW', label: isHi ? 'संक्षिप्त विवरण' : 'Overview', icon: CheckCircle2 },
                { id: 'USERS', label: `${isHi ? 'यूज़र्स' : 'Users'} (${backup.payload.users.length})`, icon: Users },
                {
                  id: 'INVESTMENTS',
                  label: `${isHi ? 'सक्रिय निवेश' : 'Investments'} (${backup.payload.investments.length})`,
                  icon: TrendingUp,
                },
                {
                  id: 'TRANSACTIONS',
                  label: `${isHi ? 'लेन-देन' : 'Txns'} (${backup.payload.transactions.length})`,
                  icon: Receipt,
                },
                { id: 'PLANS', label: `${isHi ? 'प्लान्स' : 'Plans'} (${backup.payload.plans.length})`, icon: Layers },
                { id: 'TREASURY', label: isHi ? 'कंपनी लेजर' : 'Treasury', icon: Building2 },
                { id: 'JSON', label: 'Raw JSON', icon: Copy },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 text-xs font-bold transition-all cursor-pointer"
              title={isHi ? 'Excel (.xlsx) में डाउनलोड करें' : 'Export to Excel (.xlsx)'}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{isHi ? 'Excel डाउनलोड' : 'Export Excel'}</span>
            </button>

            <button
              onClick={handleDownloadJson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
              title="Download JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>

            <button
              id="btn-modal-restore-date"
              onClick={() => onRestoreRequest(backup)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 text-xs font-extrabold shadow-md shadow-amber-900/30 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isHi ? 'इस डेट से रिस्टोर करें' : 'Restore from This Date'}</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-5">
              {/* Top Key Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span>{isHi ? 'कंपनी मुख्य बैलेंस' : 'Company Treasury'}</span>
                    <Building2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-lg font-bold font-mono text-emerald-300">
                    {formatINR(backup.payload.treasury.balance)}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {isHi ? 'उस दिन का रिज़र्व बैलेंस' : 'Reserve balance at date'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span>{isHi ? 'कुल यूज़र्स' : 'Registered Users'}</span>
                    <Users className="w-4 h-4 text-amber-400" />
                  </div>
                  <p className="text-lg font-bold font-mono text-amber-300">
                    {backup.payload.users.length}
                  </p>
                  <p className="text-[10px] text-slate-400">{isHi ? 'सक्रिय खाते' : 'Total accounts'}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span>{isHi ? 'सक्रिय निवेश' : 'Invested Volume'}</span>
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                  </div>
                  <p className="text-lg font-bold font-mono text-purple-300">
                    {formatINR(backup.payload.wallet.totalInvested)}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {backup.payload.investments.length} {isHi ? 'सक्रिय होल्डिंग्स' : 'Active holdings'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span>{isHi ? 'वॉलेट कैश' : 'Wallet Cash'}</span>
                    <Wallet className="w-4 h-4 text-blue-400" />
                  </div>
                  <p className="text-lg font-bold font-mono text-blue-300">
                    {formatINR(backup.payload.wallet.cashBalance)}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {backup.payload.transactions.length} {isHi ? 'लेन-देन दर्ज' : 'txns recorded'}
                  </p>
                </div>
              </div>

              {/* Snapshot Metadata Box */}
              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  {isHi ? 'बैकअप स्नैपशॉट विवरण' : 'Backup Snapshot Metadata'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block">{isHi ? 'बैकअप दिनांक:' : 'Backup Date:'}</span>
                    <span className="font-semibold text-white font-mono">{backup.backupDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{isHi ? 'सटीक समय:' : 'Exact Timestamp:'}</span>
                    <span className="font-semibold text-white font-mono">{timeFormatted}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{isHi ? 'बैकअप ट्रिगर:' : 'Trigger Source:'}</span>
                    <span className="font-semibold text-emerald-400">
                      {isMidnight ? 'Scheduled Midnight Daemon (00:00:00)' : 'Manual Admin Snapshot'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{isHi ? 'इन्वेस्टमेंट प्लान्स:' : 'Active Plans:'}</span>
                    <span className="font-semibold text-white">{backup.payload.plans.length} Plans</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{isHi ? 'कंपनी ट्रेजरी लॉग्स:' : 'Treasury Logs:'}</span>
                    <span className="font-semibold text-white">{backup.payload.treasuryLogs.length} Records</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{isHi ? 'प्लेटफॉर्म नाम:' : 'Platform:'}</span>
                    <span className="font-semibold text-white">{backup.payload.rules.platformName}</span>
                  </div>
                </div>
              </div>

              {/* Restore Info Banner */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-xs text-amber-200">
                <RotateCcw className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-amber-300">
                    {isHi
                      ? 'इस दिनांक (' + backup.backupDate + ') से पूरा प्रोजेक्ट रिस्टोर करें:'
                      : 'Restore Entire Project from ' + backup.backupDate + ':'}
                  </p>
                  <p className="text-slate-300">
                    {isHi
                      ? 'जब आप इस बैकअप को रिस्टोर करेंगे, तो वर्तमान वॉलेट, यूज़र्स, सक्रिय निवेश, लेन-देन और कंपनी बैलेंस ठीक उसी स्थिति में बदल जाएंगे जैसा इस डेट को थे।'
                      : 'Restoring this backup replaces all current application data with the exact state captured on this date and time.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USERS */}
          {activeTab === 'USERS' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-400" />
                  <span>
                    {isHi ? 'इस बैकअप में दर्ज यूज़र्स' : 'Registered Users in this Snapshot'} (
                    {backup.payload.users.length})
                  </span>
                </h3>
              </div>
              <div className="overflow-x-auto border border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 text-[11px] uppercase">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">{isHi ? 'नाम' : 'Name'}</th>
                      <th className="p-3">{isHi ? 'लॉगिन आईडी' : 'Login ID'}</th>
                      <th className="p-3">{isHi ? 'रोल' : 'Role'}</th>
                      <th className="p-3">{isHi ? 'फ़ोन नंबर' : 'Phone'}</th>
                      <th className="p-3">{isHi ? 'शामिल तिथि' : 'Joined Date'}</th>
                      <th className="p-3">{isHi ? 'स्थिति' : 'Status'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {backup.payload.users.map((u, i) => (
                      <tr key={u.id} className="hover:bg-slate-800/30">
                        <td className="p-3 text-slate-400 font-mono">{i + 1}</td>
                        <td className="p-3 font-semibold text-white">{u.name}</td>
                        <td className="p-3 font-mono text-emerald-400">{u.loginId}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              u.role === 'ADMIN'
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-slate-300">{u.phone}</td>
                        <td className="p-3 text-slate-400 font-mono">{u.joinedDate}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300">
                            {u.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: INVESTMENTS */}
          {activeTab === 'INVESTMENTS' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <span>
                  {isHi ? 'सक्रिय निवेश पोर्टफोलियो' : 'Active Investments in Snapshot'} (
                  {backup.payload.investments.length})
                </span>
              </h3>
              {backup.payload.investments.length === 0 ? (
                <div className="p-6 text-center text-slate-400 bg-slate-950/40 rounded-xl border border-slate-800">
                  {isHi ? 'इस बैकअप में कोई सक्रिय निवेश नहीं था' : 'No active investments captured in this backup'}
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-800 rounded-xl">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 text-[11px] uppercase">
                      <tr>
                        <th className="p-3">#</th>
                        <th className="p-3">{isHi ? 'प्लान का नाम' : 'Plan Name'}</th>
                        <th className="p-3">{isHi ? 'निवेश राशि' : 'Invested Amount'}</th>
                        <th className="p-3">{isHi ? 'दैनिक रिटर्न' : 'Daily ROI'}</th>
                        <th className="p-3">{isHi ? 'कुल अर्जित' : 'Earned So Far'}</th>
                        <th className="p-3">{isHi ? 'अवधि' : 'Duration'}</th>
                        <th className="p-3">{isHi ? 'स्थिति' : 'Status'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {backup.payload.investments.map((inv, i) => (
                        <tr key={inv.id} className="hover:bg-slate-800/30">
                          <td className="p-3 text-slate-400 font-mono">{i + 1}</td>
                          <td className="p-3 font-semibold text-white">{inv.planName}</td>
                          <td className="p-3 font-mono font-bold text-emerald-400">
                            {formatINR(inv.investedAmount)}
                          </td>
                          <td className="p-3 font-mono text-purple-300">
                            {inv.dailyRoiPercent}% (+{formatINR(inv.dailyReturnAmount)}/day)
                          </td>
                          <td className="p-3 font-mono text-blue-300">{formatINR(inv.earnedSoFar)}</td>
                          <td className="p-3 text-slate-400">
                            {inv.daysCompleted} / {inv.durationDays} Days
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                              {inv.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: TRANSACTIONS */}
          {activeTab === 'TRANSACTIONS' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-blue-400" />
                <span>
                  {isHi ? 'लेन-देन का इतिहास' : 'Transactions in Snapshot'} ({backup.payload.transactions.length})
                </span>
              </h3>
              <div className="overflow-x-auto border border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 text-[11px] uppercase">
                    <tr>
                      <th className="p-3">{isHi ? 'दिनांक व समय' : 'Date & Time'}</th>
                      <th className="p-3">{isHi ? 'प्रकार' : 'Type'}</th>
                      <th className="p-3">{isHi ? 'राशि' : 'Amount'}</th>
                      <th className="p-3">{isHi ? 'स्थिति' : 'Status'}</th>
                      <th className="p-3">{isHi ? 'विवरण' : 'Note'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {backup.payload.transactions.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-800/30">
                        <td className="p-3 text-slate-400 font-mono">
                          {new Date(t.timestamp || t.date).toLocaleString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-200">
                            {t.type}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-bold text-white">{formatINR(t.amount)}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400">
                            {t.status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-300 max-w-xs truncate">{isHi ? t.noteHi : t.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: PLANS */}
          {activeTab === 'PLANS' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>
                  {isHi ? 'इन्वेस्टमेंट प्लान्स' : 'Investment Plans in Snapshot'} ({backup.payload.plans.length})
                </span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {backup.payload.plans.map((p) => (
                  <div key={p.id} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">{isHi ? p.nameHi : p.name}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                        {p.dailyRoiPercent}% / {isHi ? 'दिन' : 'day'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 flex items-center justify-between font-mono">
                      <span>
                        {formatINR(p.minAmount)} - {formatINR(p.maxAmount)}
                      </span>
                      <span>{p.durationDays} Days</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: TREASURY */}
          {activeTab === 'TREASURY' && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">{isHi ? 'कंपनी मुख्य बैलेंस:' : 'Company Treasury Balance:'}</span>
                  <span className="text-xl font-bold font-mono text-emerald-400">
                    {formatINR(backup.payload.treasury.balance)}
                  </span>
                </div>
                <div className="text-right text-xs text-slate-400 font-mono">
                  <span>{backup.payload.treasuryLogs.length} Audit Logs</span>
                </div>
              </div>
              <div className="overflow-x-auto border border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 text-[11px] uppercase">
                    <tr>
                      <th className="p-3">{isHi ? 'दिनांक' : 'Date'}</th>
                      <th className="p-3">{isHi ? 'एक्शन' : 'Action'}</th>
                      <th className="p-3">{isHi ? 'राशि' : 'Amount'}</th>
                      <th className="p-3">{isHi ? 'नया बैलेंस' : 'Balance After'}</th>
                      <th className="p-3">{isHi ? 'कारण' : 'Reason'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {backup.payload.treasuryLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/30">
                        <td className="p-3 font-mono text-slate-400">
                          {new Date(log.timestamp || log.date).toLocaleDateString('en-IN')}
                        </td>
                        <td className="p-3 font-semibold text-slate-200">{log.type}</td>
                        <td className="p-3 font-mono font-bold text-emerald-400">{formatINR(log.amount)}</td>
                        <td className="p-3 font-mono text-slate-300">{formatINR(log.balanceAfter)}</td>
                        <td className="p-3 text-slate-400 max-w-xs truncate">{isHi ? log.reasonHi : log.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: RAW JSON */}
          {activeTab === 'JSON' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {isHi ? 'संपूर्ण बैकअप पेलोड (JSON प्रारूप):' : 'Complete snapshot payload (JSON format):'}
                </span>
                <button
                  onClick={handleCopyJson}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? (isHi ? 'कॉपी हो गया!' : 'Copied!') : isHi ? 'कॉपी करें' : 'Copy JSON'}</span>
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400 max-h-96 overflow-y-auto leading-relaxed">
                {JSON.stringify(backup, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
          >
            {isHi ? 'बंद करें' : 'Close'}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{isHi ? 'पूरा डेटा Excel में एक्सपोर्ट करें' : 'Export Full Data to Excel'}</span>
            </button>

            <button
              onClick={() => onRestoreRequest(backup)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold shadow-md shadow-amber-600/30 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{isHi ? 'इस डेट का डेटा रिस्टोर करें' : 'Restore from This Date'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
