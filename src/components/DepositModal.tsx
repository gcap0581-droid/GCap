import React, { useState } from 'react';
import {
  X,
  PlusCircle,
  QrCode,
  Smartphone,
  Building2,
  CreditCard,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Language, AppRules } from '../types';
import { formatINR } from '../utils/storage';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  rules?: AppRules;
  onDepositSuccess: (amount: number, method: string, referenceId: string) => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  onClose,
  language,
  rules,
  onDepositSuccess,
}) => {
  const isHi = language === 'hi';
  const minDeposit = rules ? rules.minDeposit : 500;
  const maxDeposit = rules ? rules.maxDeposit : 500000;
  const [amount, setAmount] = useState<number>(Math.max(minDeposit, 1000));
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'NETBANKING' | 'CARD'>('UPI');
  const [utrNumber, setUtrNumber] = useState<string>('');
  const [copiedBank, setCopiedBank] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const quickAmounts = [minDeposit, 1000, 2000, 5000, 10000, 25000].filter((v, i, a) => a.indexOf(v) === i);
  const companyUpiId = 'gcap.pay@hdfcbank';
  const companyBank = {
    name: 'GCap Capital Ventures Pvt Ltd',
    bank: 'HDFC Bank',
    accountNumber: '50200098234123',
    ifsc: 'HDFC0001234',
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(companyUpiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleCopyBank = () => {
    navigator.clipboard.writeText(companyBank.accountNumber);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
  };

  const handleConfirmDeposit = () => {
    setError('');
    if (amount < minDeposit) {
      setError(
        isHi
          ? `न्यूनतम जमा राशि ${formatINR(minDeposit)} है।`
          : `Minimum deposit amount is ${formatINR(minDeposit)}.`
      );
      return;
    }
    if (amount > maxDeposit) {
      setError(
        isHi
          ? `अधिकतम जमा राशि ${formatINR(maxDeposit)} है।`
          : `Maximum deposit amount is ${formatINR(maxDeposit)}.`
      );
      return;
    }
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      const generatedRef = utrNumber.trim()
        ? utrNumber.trim().toUpperCase()
        : 'UTR' + Math.floor(1000000000 + Math.random() * 9000000000);

      // Fire celebration confetti!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      onDepositSuccess(
        amount,
        paymentMethod === 'UPI' ? 'UPI (Company Account)' : paymentMethod === 'NETBANKING' ? 'Bank Transfer (Company A/C)' : 'Card',
        generatedRef
      );
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isHi ? 'वॉलेट में राशि जोड़ें (Add Cash)' : 'Deposit Funds to Wallet'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isHi ? 'सुरक्षित भुगतान गेटवे एवं तुरंत क्रेडिट' : 'Instant deposit via UPI, QR, or Net Banking'}
              </p>
            </div>
          </div>

          <button
            id="btn-close-deposit"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Rules Banner (Rule 1 & 2) */}
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{isHi ? 'डिपॉजिट नियम व प्रक्रिया (Deposit Rules):' : 'Official Deposit Rules & Flow:'}</span>
            </div>
            <ul className="text-[11px] text-amber-200/90 leading-relaxed list-disc list-inside space-y-1">
              <li>
                {isHi
                  ? 'आप अपने बैंक/UPI खाते से कंपनी के खाते (नीचे दिए गए UPI/बैंक विवरण) में राशि ट्रांसफर करें।'
                  : 'Transfer funds from your bank/UPI to company bank account or UPI.'}
              </li>
              <li>
                {isHi
                  ? 'बैंक ट्रांजेक्शन सत्यापन के बाद राशि सीधे वॉलेट में क्रेडिट होगी, तब तक "Wait for approval" का स्टेटस राशि के साथ शो होगा।'
                  : 'Shows "Wait for approval" until bank transaction verification is complete. Once verified, funds reflect in cash balance.'}
              </li>
              <li>
                {isHi
                  ? 'सत्यापन के बाद आप अपनी इच्छानुसार जितना चाहें उतना कैश GP में स्वैप कर (1 GP = ₹1) प्लान खरीद सकते हैं। शेष कैश वॉलेट में सुरक्षित रहेगा।'
                  : 'After verification, swap any desired cash into GP (1 GP = ₹1) to purchase plans. Remaining cash stays intact.'}
              </li>
            </ul>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              {isHi ? 'जमा राशि (रुपये में):' : 'Enter Deposit Amount (₹):'}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-lg font-bold text-emerald-400">
                ₹
              </span>
              <input
                id="input-deposit-amount"
                type="number"
                min={100}
                max={1000000}
                step={100}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-9 pr-4 text-white font-mono text-xl font-bold focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="5000"
              />
            </div>

            {/* Quick Amount Chips */}
            <div className="flex flex-wrap gap-2 mt-3">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  id={`btn-deposit-chip-${amt}`}
                  onClick={() => setAmount(amt)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                    amount === amt
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  }`}
                >
                  +{formatINR(amt)}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method Tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              {isHi ? 'कंपनी को भुगतान विधि चुनें:' : 'Select Company Payment Method:'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'UPI', label: isHi ? 'कंपनी UPI / QR' : 'Company UPI / QR', icon: Smartphone },
                { id: 'NETBANKING', label: isHi ? 'कंपनी बैंक खाता' : 'Company Bank A/C', icon: Building2 },
              ].map((m) => {
                const Icon = m.icon;
                const isSel = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    id={`btn-paymethod-${m.id}`}
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isSel
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment Method Details */}
          {paymentMethod === 'UPI' && (
            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Simulated QR Code SVG */}
                <div className="w-28 h-28 bg-white p-2 rounded-xl shrink-0 flex items-center justify-center shadow-md">
                  <div className="w-full h-full border-2 border-slate-900 p-1 flex flex-col justify-between">
                    <div className="flex justify-between">
                      <div className="w-6 h-6 bg-slate-900"></div>
                      <div className="w-6 h-6 bg-slate-900"></div>
                    </div>
                    <div className="flex items-center justify-center">
                      <span className="text-[9px] font-mono font-bold text-slate-900">GCap UPI</span>
                    </div>
                    <div className="flex justify-between">
                      <div className="w-6 h-6 bg-slate-900"></div>
                      <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="space-y-2 text-xs text-slate-300 w-full">
                  <div className="font-semibold text-white">
                    {isHi ? 'कंपनी की आधिकारिक UPI ID:' : 'Official Company UPI ID:'}
                  </div>
                  <div className="flex items-center gap-2 bg-slate-900 p-2.5 rounded-lg border border-slate-700">
                    <span className="font-mono text-emerald-400 text-xs truncate font-bold">{companyUpiId}</span>
                    <button
                      type="button"
                      id="btn-copy-upi"
                      onClick={handleCopyUpi}
                      className="ml-auto p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 hover:text-white cursor-pointer flex items-center gap-1 text-[11px]"
                      title="Copy UPI ID"
                    >
                      {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedUpi ? 'कॉपी हुआ' : 'कॉपी करें'}</span>
                    </button>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    {isHi
                      ? 'अपने PhonePe, GPay, Paytm से इस UPI ID पर राशि भेजें।'
                      : 'Transfer from your PhonePe, Google Pay, or Paytm to this verified company ID.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'NETBANKING' && (
            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 text-xs space-y-2.5">
              <div className="text-white font-bold flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>{isHi ? 'कंपनी का आधिकारिक बैंक खाता (Company Bank Details):' : 'Official Company Bank Account:'}</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block">{isHi ? 'खाताधारक का नाम:' : 'Account Name:'}</span>
                  <span className="text-white font-semibold font-mono">{companyBank.name}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block">{isHi ? 'बैंक का नाम:' : 'Bank:'}</span>
                  <span className="text-white font-semibold">{companyBank.bank}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 block">{isHi ? 'खाता संख्या:' : 'Account Number:'}</span>
                    <span className="text-emerald-400 font-bold font-mono">{companyBank.accountNumber}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyBank}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    {copiedBank ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block">{isHi ? 'IFSC कोड:' : 'IFSC Code:'}</span>
                  <span className="text-white font-bold font-mono">{companyBank.ifsc}</span>
                </div>
              </div>
            </div>
          )}

          {/* User Transaction Reference / UTR Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              {isHi ? 'ट्रांसफर का UTR / रेफरेंस नंबर दर्ज करें (अनिवार्य):' : 'Enter Transfer UTR / Transaction Reference (Required):'}
            </label>
            <input
              type="text"
              value={utrNumber}
              onChange={(e) => setUtrNumber(e.target.value)}
              placeholder={isHi ? 'उदा. 423981029381 या UPI Ref ID' : 'e.g. 423981029381 or UTR'}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3.5 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
            />
            <p className="text-[11px] text-slate-500">
              {isHi
                ? 'अपने पेमेंट ऐप की रसीद से 12 अंकों का UTR या Ref No यहाँ डालें ताकि सिस्टम इसे तुरंत सत्यापित कर सके।'
                : 'Enter the 12-digit UTR from your payment receipt for instant automated verification.'}
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {isHi
                ? 'बैंक भुगतान पावती सत्यापन के बाद राशि सीधे वॉलेट में दिखाई देगी। तब तक "Wait for approval" रहेगा।'
                : 'Deposit verification will reflect in your wallet upon confirmation. Status: Wait for approval.'}
            </span>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              {isHi ? 'जमा राशि:' : 'Deposit Amount:'}
            </span>
            <span className="text-lg font-mono font-bold text-white">
              {formatINR(amount)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-cancel-deposit"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              {isHi ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              type="button"
              id="btn-submit-deposit"
              onClick={handleConfirmDeposit}
              disabled={amount < minDeposit || isProcessing}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-700/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>{isHi ? 'अनुरोध भेजा जा रहा है...' : 'Submitting...'}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isHi ? 'डिपॉजिट अनुरोध भेजें' : 'Submit Deposit Request'}</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
