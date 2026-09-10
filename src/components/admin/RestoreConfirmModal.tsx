import React from 'react';
import { AlertTriangle, RotateCcw, X, Calendar, CheckCircle2 } from 'lucide-react';
import { BackupRecord, Language } from '../../types';
import { formatINR } from '../../utils/storage';

interface RestoreConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  backup: BackupRecord | null;
  language: Language;
  onConfirmRestore: (backup: BackupRecord) => void;
}

export const RestoreConfirmModal: React.FC<RestoreConfirmModalProps> = ({
  isOpen,
  onClose,
  backup,
  language,
  onConfirmRestore,
}) => {
  const isHi = language === 'hi';

  if (!isOpen || !backup) return null;

  const dateFormatted = new Date(backup.timestamp).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="modal-restore-confirm"
        className="relative w-full max-w-lg bg-slate-900 border-2 border-amber-500/50 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-amber-500/10 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white">
              {isHi ? 'प्रोजेक्ट डेटा रिस्टोर की पुष्टि' : 'Confirm System Restore'}
            </h2>
            <p className="text-xs text-amber-300/80 mt-1">
              {isHi
                ? `क्या आप वाकई ${backup.backupDate} का बैकअप रिस्टोर करना चाहते हैं?`
                : `Are you sure you want to restore the system state from ${backup.backupDate}?`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs">
          {/* Target Snapshot Box */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <Calendar className="w-4 h-4" />
              <span>{dateFormatted}</span>
            </div>
            <p className="text-slate-300 font-semibold">{isHi ? backup.titleHi : backup.title}</p>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
              <div>
                <span>{isHi ? 'कंपनी मुख्य बैलेंस:' : 'Company Treasury:'}</span>{' '}
                <span className="text-emerald-400 font-bold font-mono">
                  {formatINR(backup.payload.treasury.balance)}
                </span>
              </div>
              <div>
                <span>{isHi ? 'सक्रिय यूज़र्स:' : 'Total Users:'}</span>{' '}
                <span className="text-white font-bold font-mono">{backup.payload.users.length}</span>
              </div>
              <div>
                <span>{isHi ? 'वॉलेट कैश:' : 'Wallet Cash:'}</span>{' '}
                <span className="text-blue-400 font-bold font-mono">
                  {formatINR(backup.payload.wallet.cashBalance)}
                </span>
              </div>
              <div>
                <span>{isHi ? 'सक्रिय निवेश:' : 'Investments:'}</span>{' '}
                <span className="text-purple-400 font-bold font-mono">
                  {backup.payload.investments.length}
                </span>
              </div>
            </div>
          </div>

          {/* Warning Points */}
          <div className="space-y-2 text-slate-300">
            <p className="font-semibold text-white">
              {isHi ? 'रिस्टोर करने पर निम्न प्रभाव होंगे:' : 'The following will happen upon restore:'}
            </p>
            <ul className="space-y-1.5 list-disc pl-4 text-slate-400">
              <li>
                {isHi
                  ? 'वर्तमान डेटा इस चयनित दिनांक की स्थिति से प्रतिस्थापित (overwrite) हो जाएगा।'
                  : 'Current application state will be replaced with this snapshot state.'}
              </li>
              <li>
                {isHi
                  ? 'कंपनी का मुख्य रिज़र्व बैलेंस ठीक उस दिनांक के बैलेंस पर सेट हो जाएगा।'
                  : 'Company treasury balance will reset to the balance captured on this date.'}
              </li>
              <li>
                {isHi
                  ? 'सभी यूज़र्स, सक्रिय निवेश और ट्रांजेक्शन लेजर उस दिनांक के अनुसार सिंक्रनाइज़ हो जाएंगे।'
                  : 'All users, investments, and transaction ledgers will sync to this snapshot.'}
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
          >
            {isHi ? 'रद्द करें' : 'Cancel'}
          </button>
          <button
            type="button"
            id="btn-confirm-restore-action"
            onClick={() => {
              onConfirmRestore(backup);
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{isHi ? 'हाँ, तुरंत रिस्टोर करें' : 'Yes, Restore Now'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
