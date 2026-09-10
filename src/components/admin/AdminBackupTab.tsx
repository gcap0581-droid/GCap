import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  RotateCcw,
  FileSpreadsheet,
  Download,
  Trash2,
  Eye,
  PlusCircle,
  Zap,
  Building2,
  Users,
  TrendingUp,
  Wallet,
  CheckCircle2,
  Search,
  Filter,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { BackupDataPayload, BackupRecord, Language } from '../../types';
import { formatINR } from '../../utils/storage';
import { getTimeUntilNextMidnight } from '../../utils/backupStorage';
import { exportAllDataToExcel, exportBackupRecordToExcel } from '../../utils/excelExport';
import { BackupDetailModal } from './BackupDetailModal';
import { RestoreConfirmModal } from './RestoreConfirmModal';

interface AdminBackupTabProps {
  backups: BackupRecord[];
  currentPayload: BackupDataPayload;
  language: Language;
  onRunMidnightBackupNow: () => void;
  onCreateManualSnapshot: (customDate?: string, note?: string) => void;
  onRestoreBackup: (backup: BackupRecord) => void;
  onDeleteBackup: (id: string) => void;
}

export const AdminBackupTab: React.FC<AdminBackupTabProps> = ({
  backups,
  currentPayload,
  language,
  onRunMidnightBackupNow,
  onCreateManualSnapshot,
  onRestoreBackup,
  onDeleteBackup,
}) => {
  const isHi = language === 'hi';

  // Modal states
  const [selectedBackupForDetail, setSelectedBackupForDetail] = useState<BackupRecord | null>(null);
  const [selectedBackupForRestore, setSelectedBackupForRestore] = useState<BackupRecord | null>(null);

  // Filter states
  const [dateFilter, setDateFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'MIDNIGHT_AUTO' | 'ADMIN_MANUAL'>('ALL');

  // Midnight countdown timer
  const [countdown, setCountdown] = useState(getTimeUntilNextMidnight().formatted);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getTimeUntilNextMidnight().formatted);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filtered backups
  const filteredBackups = backups.filter((b) => {
    if (dateFilter && b.backupDate !== dateFilter) return false;
    if (typeFilter !== 'ALL' && b.triggerType !== typeFilter) return false;
    return true;
  });

  const handleExportLiveToExcel = () => {
    exportAllDataToExcel(currentPayload, 'GCap_Live_System_State');
  };

  return (
    <div className="space-y-6">
      {/* 1. Midnight Daemon & Quick Action Hero Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/40 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                {isHi ? 'रात 12:00 बजे ऑटोमैटिक बैकअप: सक्रिय' : '12:00 AM Midnight Auto-Backup: Active'}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 text-xs font-mono font-bold">
                <Clock className="w-3.5 h-3.5" />
                {isHi ? `अगला बैकअप: ${countdown} में` : `Next Backup in: ${countdown}`}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white">
              {isHi ? 'प्रोजेक्ट डेटा बैकअप एवं रिस्टोर हब' : 'System Backup & Multi-Date Restore Hub'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              {isHi
                ? 'प्रत्येक रात 12:00 बजे प्रोजेक्ट का संपूर्ण डेटा (यूज़र्स, वॉलेट, निवेश, लेन-देन, कंपनी बैलेंस) स्वतः बैकअप होता है। आप जिस भी दिनांक से चाहें, पूरा डेटा एक क्लिक में रिस्टोर या Excel में एक्सपोर्ट कर सकते हैं।'
                : 'Every night at 12:00 AM midnight, all platform records are automatically archived. Restore from any date or export complete historical data to Excel anytime.'}
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="btn-export-live-excel"
              onClick={handleExportLiveToExcel}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-700/20 transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{isHi ? 'पूरा डेटा Excel में एक्सपोर्ट करें' : 'Export Full Data to Excel'}</span>
            </button>

            <button
              id="btn-run-midnight-now"
              onClick={onRunMidnightBackupNow}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-700/20 transition-all cursor-pointer"
              title={isHi ? 'रात 12 बजे का बैकअप अभी चलाएं' : 'Run Midnight Backup Now'}
            >
              <Zap className="w-4 h-4" />
              <span>{isHi ? '12:00 AM बैकअप अभी लें' : 'Run Midnight Backup'}</span>
            </button>

            <button
              id="btn-create-manual-backup"
              onClick={() => onCreateManualSnapshot()}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>{isHi ? 'नया स्नैपशॉट बनाएं' : 'Take Snapshot'}</span>
            </button>
          </div>
        </div>

        {/* Live System Stats Bar */}
        <div className="pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-slate-300">
            <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px]">{isHi ? 'वर्तमान मुख्य बैलेंस' : 'Current Treasury'}</span>
              <span className="font-mono font-bold text-white">{formatINR(currentPayload.treasury.balance)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5 text-slate-300">
            <Users className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px]">{isHi ? 'कुल यूज़र्स' : 'Total Users'}</span>
              <span className="font-mono font-bold text-white">{currentPayload.users.length}</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5 text-slate-300">
            <TrendingUp className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px]">{isHi ? 'सक्रिय निवेश राशि' : 'Invested Volume'}</span>
              <span className="font-mono font-bold text-white">{formatINR(currentPayload.wallet.totalInvested)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5 text-slate-300">
            <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px]">{isHi ? 'कुल उपलब्ध बैकअप' : 'Total Backups'}</span>
              <span className="font-mono font-bold text-emerald-400">{backups.length} Snapshots</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Filter & Date Selector Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Picker Filter */}
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-400">{isHi ? 'दिनांक चुनें:' : 'Filter Date:'}</span>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-transparent text-xs text-white outline-none cursor-pointer"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="text-[11px] text-slate-400 hover:text-white ml-1 cursor-pointer"
              >
                ✕ {isHi ? 'हटाएं' : 'Clear'}
              </button>
            )}
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            {(
              [
                { id: 'ALL', label: isHi ? 'सभी बैकअप' : 'All' },
                { id: 'MIDNIGHT_AUTO', label: isHi ? '🌙 12:00 AM ऑटो' : '🌙 Midnight' },
                { id: 'ADMIN_MANUAL', label: isHi ? '⚡ मैनुअल' : '⚡ Manual' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setTypeFilter(t.id)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  typeFilter === t.id
                    ? 'bg-slate-800 text-emerald-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-slate-400">
          {isHi
            ? `${filteredBackups.length} बैकअप रिकॉर्ड्स उपलब्ध हैं`
            : `Showing ${filteredBackups.length} of ${backups.length} backups`}
        </div>
      </div>

      {/* 3. Date-wise Backups Grid */}
      {filteredBackups.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
          <Calendar className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm font-semibold text-slate-300">
            {isHi ? 'इस दिनांक या फ़िल्टर का कोई बैकअप नहीं मिला' : 'No backups found matching your criteria'}
          </p>
          <button
            onClick={() => {
              setDateFilter('');
              setTypeFilter('ALL');
            }}
            className="text-xs text-emerald-400 hover:underline cursor-pointer"
          >
            {isHi ? 'सभी बैकअप देखें' : 'View all backups'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBackups.map((backup) => {
            const isMidnight = backup.triggerType === 'MIDNIGHT_AUTO';
            const dateObj = new Date(backup.timestamp);
            const timeFormatted = dateObj.toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            });

            return (
              <div
                key={backup.id}
                className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-md space-y-4"
              >
                {/* Card Top Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
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
                          ? '⚡ एडमिन मैनुअल स्नैपशॉट'
                          : '⚡ Admin Manual Snapshot'}
                      </span>
                      <span className="text-xs font-mono text-emerald-400 font-bold">
                        📅 {backup.backupDate}
                      </span>
                      <span className="text-xs text-slate-400">({timeFormatted})</span>
                    </div>

                    <h3 className="text-base font-bold text-white">
                      {isHi ? backup.titleHi : backup.title}
                    </h3>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* View Detail Button */}
                    <button
                      onClick={() => setSelectedBackupForDetail(backup)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
                      title={isHi ? 'डिटेल देखें' : 'View Detail'}
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{isHi ? 'डिटेल देखें' : 'View Detail'}</span>
                    </button>

                    {/* Export to Excel */}
                    <button
                      onClick={() => exportBackupRecordToExcel(backup)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 text-xs font-bold transition-all cursor-pointer"
                      title={isHi ? 'Excel में एक्सपोर्ट करें' : 'Export to Excel'}
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Excel</span>
                    </button>

                    {/* Restore Button */}
                    <button
                      onClick={() => setSelectedBackupForRestore(backup)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold shadow-md shadow-amber-600/30 transition-all cursor-pointer"
                      title={isHi ? 'इस डेट से रिस्टोर करें' : 'Restore Data from this Date'}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{isHi ? 'डेटा रिस्टोर करें' : 'Restore'}</span>
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            isHi
                              ? `क्या आप ${backup.backupDate} का यह बैकअप हटाना चाहते हैं?`
                              : `Delete backup record for ${backup.backupDate}?`
                          )
                        ) {
                          onDeleteBackup(backup.id);
                        }
                      }}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                      title={isHi ? 'डिलीट करें' : 'Delete'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Metrics Pill Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-3 border-t border-slate-800/80 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block">{isHi ? 'कंपनी बैलेंस' : 'Company Treasury'}</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {formatINR(backup.summary.companyTreasuryBalance)}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block">{isHi ? 'कुल यूज़र्स' : 'Total Users'}</span>
                    <span className="font-mono font-bold text-amber-300">
                      {backup.summary.totalUsers} {isHi ? 'खाते' : 'Accounts'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block">{isHi ? 'सक्रिय निवेश' : 'Active Volume'}</span>
                    <span className="font-mono font-bold text-purple-300">
                      {formatINR(backup.summary.totalInvested)}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block">{isHi ? 'वॉलेट कैश' : 'Wallet Cash'}</span>
                    <span className="font-mono font-bold text-blue-300">
                      {formatINR(backup.summary.totalCashBalance)}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-slate-400 block">{isHi ? 'लेन-देन दर्ज' : 'Transactions'}</span>
                    <span className="font-mono font-bold text-slate-200">
                      {backup.summary.transactionsCount} Txns
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <BackupDetailModal
        isOpen={!!selectedBackupForDetail}
        onClose={() => setSelectedBackupForDetail(null)}
        backup={selectedBackupForDetail}
        language={language}
        onRestoreRequest={(backup) => {
          setSelectedBackupForDetail(null);
          setSelectedBackupForRestore(backup);
        }}
      />

      <RestoreConfirmModal
        isOpen={!!selectedBackupForRestore}
        onClose={() => setSelectedBackupForRestore(null)}
        backup={selectedBackupForRestore}
        language={language}
        onConfirmRestore={(backup) => {
          onRestoreBackup(backup);
          setSelectedBackupForRestore(null);
        }}
      />
    </div>
  );
};
