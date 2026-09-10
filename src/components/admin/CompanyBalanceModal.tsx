import React, { useState } from 'react';
import { X, PlusCircle, MinusCircle, AlertTriangle, ArrowRight, Building2, CheckCircle2 } from 'lucide-react';
import { CompanyTreasury, Language } from '../../types';
import { formatINR } from '../../utils/storage';
import { DEFAULT_ALERT_THRESHOLD } from '../../utils/treasuryStorage';

interface CompanyBalanceModalProps {
  isOpen: boolean;
  mode: 'ADD' | 'DEDUCT';
  treasury: CompanyTreasury;
  language: Language;
  onClose: () => void;
  onAdd: (amount: number, reason: string, reasonHi: string, referenceId?: string) => void;
  onDeduct: (amount: number, reason: string, reasonHi: string, referenceId?: string) => void;
}

const PRESET_AMOUNTS = [50000, 100000, 200000, 500000, 1000000, 2500000];

export const CompanyBalanceModal: React.FC<CompanyBalanceModalProps> = ({
  isOpen,
  mode,
  treasury,
  language,
  onClose,
  onAdd,
  onDeduct,
}) => {
  const isHi = language === 'hi';
  const isAdd = mode === 'ADD';

  const [amount, setAmount] = useState<number>(isAdd ? 500000 : 100000);
  const [customAmount, setCustomAmount] = useState<string>(isAdd ? '500000' : '100000');
  const [sourceRef, setSourceRef] = useState<string>(
    isAdd ? 'HDFC Bank - Liquidity Reserve (RTGS)' : 'Reserve Sweep'
  );
  const [reason, setReason] = useState<string>(
    isAdd
      ? 'Infusion into company main balance for investor payouts and investment liquidity'
      : 'Capital rebalancing to external corporate escrow'
  );
  const [reasonHi, setReasonHi] = useState<string>(
    isAdd
      ? 'निवेशकों के पेआउट्स व लिक्विडिटी के लिए मुख्य बैलेंस में वृद्धि'
      : 'एस्क्रो खाते में ट्रांसफर हेतु मुख्य बैलेंस से कटौती'
  );
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAmountChange = (valStr: string) => {
    setCustomAmount(valStr);
    const num = parseFloat(valStr) || 0;
    setAmount(num);
    setError(null);
  };

  const handleSelectPreset = (preset: number) => {
    setAmount(preset);
    setCustomAmount(preset.toString());
    setError(null);
  };

  const newBalance = isAdd
    ? treasury.balance + (amount || 0)
    : Math.max(0, treasury.balance - (amount || 0));

  const willBeLow = newBalance <= DEFAULT_ALERT_THRESHOLD;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      setError(isHi ? 'कृपया मान्य राशि दर्ज करें।' : 'Please enter a valid amount.');
      return;
    }

    if (!isAdd && amount > treasury.balance) {
      setError(
        isHi
          ? `कटौती राशि (₹${amount.toLocaleString('en-IN')}) वर्तमान बैलेंस (₹${treasury.balance.toLocaleString('en-IN')}) से अधिक नहीं हो सकती।`
          : `Deduction cannot exceed current balance of ₹${treasury.balance.toLocaleString('en-IN')}.`
      );
      return;
    }

    if (isAdd) {
      onAdd(amount, reason, reasonHi, sourceRef);
    } else {
      onDeduct(amount, reason, reasonHi, sourceRef);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between ${
            isAdd
              ? 'bg-gradient-to-r from-emerald-950/70 to-slate-900 border-emerald-500/30'
              : 'bg-gradient-to-r from-rose-950/70 to-slate-900 border-rose-500/30'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isAdd
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}
            >
              {isAdd ? <PlusCircle className="w-5 h-5" /> : <MinusCircle className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isAdd
                  ? isHi
                    ? 'कंपनी का मुख्य बैलेंस बढ़ाएं (Add Balance)'
                    : 'Increase Company Main Balance'
                  : isHi
                  ? 'कंपनी के मुख्य बैलेंस से घटाएं (Deduct Balance)'
                  : 'Deduct from Company Main Balance'}
              </h3>
              <p className="text-xs text-slate-400">
                {isHi
                  ? 'कंपनी सेंट्रल ट्रेजरी व लिक्विडिटी रिज़र्व'
                  : 'Central Company Treasury & Liquidity Pool'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Balance Preview Card */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
            <div>
              <p className="text-[11px] text-slate-400 font-medium">
                {isHi ? 'वर्तमान मुख्य बैलेंस' : 'Current Balance'}
              </p>
              <p className="text-lg font-bold font-mono text-slate-200">
                {formatINR(treasury.balance)}
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-500" />
            <div className="text-right">
              <p className="text-[11px] text-slate-400 font-medium">
                {isHi ? 'अपडेट के बाद बैलेंस' : 'Updated Balance'}
              </p>
              <p
                className={`text-lg font-bold font-mono ${
                  isAdd ? 'text-emerald-400' : willBeLow ? 'text-amber-400' : 'text-slate-100'
                }`}
              >
                {formatINR(newBalance)}
              </p>
            </div>
          </div>

          {/* Low Balance Warning if deduction results in <= 5,00,000 */}
          {willBeLow && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-amber-300 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <div>
                <span className="font-bold">
                  {isHi ? '⚠️ 5,00,000 लो बैलेंस अलर्ट:' : '⚠️ 5,00,000 Low Balance Alert:'}
                </span>{' '}
                {isHi
                  ? 'बैलेंस ₹5,00,000 या उससे कम होने पर एडमिन को तुरंत चेतावनी जारी होगी और यूज़र निवेश प्रभावित हो सकते हैं।'
                  : 'Company balance will be at or below ₹5,00,000 triggering high-priority admin alert.'}
              </div>
            </div>
          )}

          {/* Amount input */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              {isAdd
                ? isHi
                  ? 'जोड़ने की राशि (₹ Enter Amount to Add)'
                  : 'Amount to Add (₹)'
                : isHi
                ? 'घटाने की राशि (₹ Enter Amount to Deduct)'
                : 'Amount to Deduct (₹)'}
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold font-mono">
                ₹
              </span>
              <input
                id="input-company-balance-amt"
                type="number"
                min="100"
                step="100"
                value={customAmount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="e.g. 500000"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white font-mono font-bold text-lg focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            {/* Quick preset chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {PRESET_AMOUNTS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border font-mono transition-colors cursor-pointer ${
                    amount === preset
                      ? isAdd
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/50 font-bold'
                      : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
                  }`}
                >
                  +{formatINR(preset)}
                </button>
              ))}
            </div>
          </div>

          {/* Source / Reference input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              {isHi ? 'स्रोत / बैंक रेफरेंस / UTR' : 'Funding Source / Reference'}
            </label>
            <input
              id="input-company-balance-ref"
              type="text"
              value={sourceRef}
              onChange={(e) => setSourceRef(e.target.value)}
              placeholder="e.g. HDFC Escrow / RTGS-928131"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Reason / Notes */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              {isHi ? 'विवरण / कारण (Reason / Purpose)' : 'Reason / Note'}
            </label>
            <input
              id="input-company-balance-reason"
              type="text"
              value={isHi ? reasonHi : reason}
              onChange={(e) => {
                if (isHi) {
                  setReasonHi(e.target.value);
                  setReason(e.target.value);
                } else {
                  setReason(e.target.value);
                  setReasonHi(e.target.value);
                }
              }}
              placeholder={isHi ? 'बैलेंस परिवर्तन का कारण' : 'Purpose of adjustment'}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          {error && (
            <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg">
              {error}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
            >
              {isHi ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              id="btn-confirm-company-balance-update"
              type="submit"
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-lg cursor-pointer ${
                isAdd
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                  : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
              }`}
            >
              {isAdd ? <PlusCircle className="w-4 h-4" /> : <MinusCircle className="w-4 h-4" />}
              <span>
                {isAdd
                  ? isHi
                    ? `+${formatINR(amount)} मुख्य बैलेंस में जोड़ें`
                    : `Add +${formatINR(amount)} to Main Balance`
                  : isHi
                  ? `-${formatINR(amount)} मुख्य बैलेंस से घटाएं`
                  : `Deduct -${formatINR(amount)} from Main Balance`}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
