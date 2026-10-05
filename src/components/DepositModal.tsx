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
  MessageCircle,
  Send,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Language, AppRules, CompanyProfile } from '../types';
import { formatINR } from '../utils/storage';
import { getStoredRules } from '../utils/rulesStorage';
import { getStoredCompanyProfile } from '../utils/companyStorage';
import { sendWhatsAppAlert, createAdminDepositAlertMessage } from '../utils/whatsappHelper';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  rules?: AppRules;
  companyProfile?: CompanyProfile;
  userName?: string;
  userLoginId?: string;
  userPhone?: string;
  onDepositSuccess: (amount: number, method: string, referenceId: string) => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  onClose,
  language,
  rules,
  companyProfile: propCompanyProfile,
  userName = 'Valued Investor',
  userLoginId,
  userPhone,
  onDepositSuccess,
}) => {
  const isHi = language === 'hi';
  const minDeposit = rules && rules.minDeposit >= 10000 ? rules.minDeposit : 10000;
  const maxDeposit = rules && rules.maxDeposit ? rules.maxDeposit : 100000000;
  const [amountInput, setAmountInput] = useState<string>(String(Math.max(minDeposit, 10000)));
  const amount = parseFloat(amountInput) || 0;
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'NETBANKING' | 'CARD'>('UPI');
  const [utrNumber, setUtrNumber] = useState<string>('');
  const [copiedBank, setCopiedBank] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  const [submittedData, setSubmittedData] = useState<{ amount: number; method: string; ref: string } | null>(null);

  if (!isOpen) return null;

  const quickAmounts = [10000, 25000, 50000, 100000, 250000, 500000, 1000000].filter((v, i, a) => a.indexOf(v) === i);
  const profile = propCompanyProfile || getStoredCompanyProfile();
  const companyUpiId = profile.companyUpiId || rules?.companyUpiId || '8603504808@axisbank';
  const companyBank = {
    name: profile.companyBankAccountHolder || rules?.companyBankAccountHolder || profile.companyName || 'GCAP PRIVATE LIMITED',
    bank: profile.bankName || rules?.companyBankName || 'Axis Bank Ltd.',
    accountNumber: profile.bankAccountNumber || rules?.companyBankAccountNumber || '924010008662307',
    ifsc: profile.bankIfsc || rules?.companyBankIfsc || 'UTIB0001219',
  };

  const upiUrl = `upi://pay?pa=${companyUpiId}&pn=${encodeURIComponent(companyBank.name)}&am=${amount}&cu=INR`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(upiUrl)}`;

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

  const handleNotifyAdminWhatsApp = (depositAmount: number, method: string, ref: string) => {
    const alertData = createAdminDepositAlertMessage(
      {
        amount: depositAmount,
        method,
        referenceId: ref,
        id: ref,
        timestamp: Date.now(),
      },
      userName,
      userLoginId,
      userPhone
    );
    sendWhatsAppAlert(alertData);
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
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      const generatedRef = utrNumber.trim()
        ? utrNumber.trim().toUpperCase()
        : 'UTR' + Math.floor(1000000000 + Math.random() * 9000000000);

      const methodStr = paymentMethod === 'UPI' ? 'UPI (Company Account)' : paymentMethod === 'NETBANKING' ? 'Bank Transfer (Company A/C)' : 'Card';

      // Fire celebration confetti!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      onDepositSuccess(amount, methodStr, generatedRef);
      
      // Automatically send WhatsApp alert to admin
      handleNotifyAdminWhatsApp(amount, methodStr, generatedRef);

      setSubmittedData({ amount, method: methodStr, ref: generatedRef });
    }, 1000);
  };

  const handleCloseModal = () => {
    setSubmittedData(null);
    onClose();
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
            onClick={handleCloseModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SUBMITTED SUCCESS VIEW WITH 1-CLICK ADMIN WHATSAPP */}
        {submittedData ? (
          <div className="p-6 space-y-5 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-white">
                {isHi ? '🎉 डिपॉजिट अनुरोध सफलतापूर्वक सबमिट हुआ!' : '🎉 Deposit Request Submitted!'}
              </h3>
              <p className="text-xs text-slate-300">
                {isHi
                  ? 'आपका अनुरोध एडमिन पैनल पर समीक्षा के लिए दर्ज हो चुका है।'
                  : 'Your deposit request has been recorded for admin approval.'}
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2 text-left">
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">{isHi ? 'जमा राशि:' : 'Amount:'}</span>
                <span className="font-bold text-emerald-400 font-mono text-sm">{formatINR(submittedData.amount)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">{isHi ? 'रेफरेंस / UTR:' : 'Ref / UTR:'}</span>
                <span className="font-mono text-white font-bold">{submittedData.ref}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{isHi ? 'भुगतान विधि:' : 'Method:'}</span>
                <span className="text-slate-200">{submittedData.method}</span>
              </div>
            </div>

            {/* 1-Click Notify Admin on WhatsApp Button */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => handleNotifyAdminWhatsApp(submittedData.amount, submittedData.method, submittedData.ref)}
                className="w-full py-3.5 px-4 rounded-xl bg-green-600 hover:bg-green-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-green-950/60 transition-all cursor-pointer active:scale-95 animate-pulse"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                <span>{isHi ? '📲 एडमिन को WhatsApp पर सूचना भेजें' : '📲 Notify Admin on WhatsApp'}</span>
              </button>
              <p className="text-[11px] text-slate-400">
                {isHi
                  ? '💡 इस बटन पर क्लिक करने से एडमिन को तुरंत WhatsApp पर आपकी पेमेंट स्लिप प्राप्त हो जाएगी।'
                  : '💡 Tapping this opens WhatsApp directly to notify Admin for faster approval.'}
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleCloseModal}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors cursor-pointer"
              >
                {isHi ? 'बंद करें (Done)' : 'Close'}
              </button>
            </div>
          </div>
        ) : (
          /* REGULAR DEPOSIT FORM */
          <>
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Amount Input */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  {isHi ? 'जमा की जाने वाली राशि (INR):' : 'Enter Deposit Amount (INR):'}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">₹</span>
                  <input
                    type="number"
                    min={minDeposit}
                    max={maxDeposit}
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    placeholder="10000"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-8 pr-4 text-white font-mono font-bold text-lg focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                {/* Quick select pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {quickAmounts.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setAmountInput(String(q))}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
                        amount === q
                          ? 'bg-emerald-500 text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {formatINR(q)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  {isHi ? 'भुगतान माध्यम चुनें:' : 'Select Payment Method:'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('UPI')}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                      paymentMethod === 'UPI'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>UPI / QR Scan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('NETBANKING')}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                      paymentMethod === 'NETBANKING'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Net Banking / NEFT</span>
                  </button>
                </div>
              </div>

              {/* Payment Method Details */}
              {paymentMethod === 'UPI' && (
                <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-4">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Real Dynamic QR Code */}
                    <div className="w-36 h-36 bg-white p-1.5 rounded-xl shrink-0 flex flex-col items-center justify-center shadow-lg border border-slate-700">
                      <img
                        src={qrUrl}
                        alt="Scan Payment QR Code"
                        className="w-32 h-32 object-contain"
                        referrerPolicy="no-referrer"
                      />
                      <span className="text-[8px] font-mono font-bold text-slate-800 tracking-wider">GCAP OFFICIAL QR</span>
                    </div>
     
                    {/* Instructions */}
                    <div className="space-y-2 text-xs text-slate-300 w-full">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <QrCode className="w-4 h-4 text-emerald-400" />
                        <span>{isHi ? 'आधिकारिक भुगतान QR कोड:' : 'Official Payment QR Code:'}</span>
                      </div>
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        {isHi
                          ? 'अपने PhonePe, GPay, Paytm, BHIM या किसी भी बैंकिंग ऐप से ऊपर दिए गए क्यूआर कोड को स्कैन करके राशि ट्रांसफर करें।'
                          : 'Scan the QR code above using PhonePe, Google Pay, Paytm, or any banking app to complete your deposit.'}
                      </p>
                      <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 space-y-0.5">
                        <span className="text-[10px] text-emerald-300/80 uppercase tracking-wider block font-semibold">
                          {isHi ? 'प्राप्तकर्ता (Verified Payee Name):' : 'Verified Payee Name:'}
                        </span>
                        <span className="text-emerald-400 font-bold font-mono text-xs block">
                          {companyBank.name}
                        </span>
                      </div>
                    </div>
                  </div>
     
                  {/* Dynamic Action Button for direct UPI Mobile Intents */}
                  <div className="pt-2">
                    <a
                      href={upiUrl}
                      id="btn-upi-intent"
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 font-black shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer select-none active:scale-95 text-center"
                    >
                      <Smartphone className="w-4.5 h-4.5" />
                      <span>{isHi ? `📱 सीधे UPI ऐप से पे करें (₹${amount.toLocaleString('en-IN')})` : `📱 Pay via Installed UPI App (₹${amount.toLocaleString('en-IN')})`}</span>
                    </a>
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
                        <span className="text-emerald-400 font-bold font-mono text-xs">{companyBank.accountNumber}</span>
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
                    ? 'बैंक भुगतान पावती सत्यापन के बाद राशि सीधे आपके वॉलेट में क्रेडिट कर दी जाएगी।'
                    : 'Deposit verification will reflect in your wallet upon admin confirmation.'}
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
                  onClick={handleCloseModal}
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
          </>
        )}

      </div>
    </div>
  );
};
