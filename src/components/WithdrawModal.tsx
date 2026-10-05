import React, { useState } from 'react';
import {
  X,
  ArrowUpRight,
  Building2,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Calendar,
  Lock,
  Sparkles,
  Award,
  Wallet as WalletIcon,
  MessageCircle,
  Send,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Language, Wallet, AppRules, WithdrawalSource, UserProfile, Transaction } from '../types';
import { formatINR, getStoredBankDetails, setStoredBankDetails } from '../utils/storage';
import { apiSaveBankDetails } from '../utils/centralSync';
import { BankAccountDetails } from '../types';
import { sendWhatsAppAlert, createAdminWithdrawalAlertMessage, createWithdrawalWhatsAppAlert } from '../utils/whatsappHelper';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet?: Wallet | null;
  language: Language;
  rules?: AppRules;
  currentUser?: UserProfile | null;
  onWithdrawSuccess: (
    amount: number,
    destination: string,
    referenceId: string,
    withdrawalSource: WithdrawalSource,
    voucherDetails?: Partial<Transaction>
  ) => void;
  onOpenSwap?: () => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  isOpen,
  onClose,
  wallet: rawWallet,
  language,
  rules,
  currentUser,
  onWithdrawSuccess,
  onOpenSwap,
}) => {
  const wallet: Wallet = rawWallet || {
    cashBalance: 0,
    gpBalance: 0,
    totalInvested: 0,
    totalEarned: 0,
    royaltyEarned: 0,
    pendingWithdrawals: 0,
    pendingDeposits: 0,
  };
  const isHi = language === 'hi';
  const minWithdrawal = rules ? rules.minWithdrawal : 200;
  const feePercent = rules ? rules.withdrawalFeePercent : 0;

  // Real calendar day of the month
  const realDate = new Date();
  const realDay = realDate.getDate();

  // Date Simulation / Testing mode state (default null = real date)
  const [simulatedDay, setSimulatedDay] = useState<number | null>(null);
  const currentDay = simulatedDay !== null ? simulatedDay : realDay;

  // Rule 1: Earning withdrawal window is active ONLY on 1st to 5th of every month
  const isEarningWindowActive = currentDay >= 1 && currentDay <= 5;

  // Rule 2: Royalty withdrawal window is active ONLY on 6th to 10th of every month
  const isRoyaltyWindowActive = currentDay >= 6 && currentDay <= 10;

  // Rule 3: Only Total Earning Amount and Royalty Earning Amount are shown
  const totalEarning = wallet.totalEarned || 0;
  const royaltyEarning = wallet.royaltyEarned || 0;
  const cashEarning = wallet.cashBalance || 0;
  const hasRoyalty = (wallet.royaltyEarned !== undefined && wallet.royaltyEarned > 0) || royaltyEarning > 0;

  // Default active tab based on which window is active or default to EARNING
  const [withdrawalSource, setWithdrawalSource] = useState<WithdrawalSource>(
    isRoyaltyWindowActive && hasRoyalty ? 'ROYALTY' : 'EARNING'
  );

  const activeWindowValid =
    withdrawalSource === 'CASH'
      ? true
      : withdrawalSource === 'EARNING'
      ? isEarningWindowActive
      : isRoyaltyWindowActive;

  const maxWithdrawable =
    withdrawalSource === 'EARNING'
      ? totalEarning
      : withdrawalSource === 'ROYALTY'
      ? royaltyEarning
      : cashEarning;

  const [amountInput, setAmountInput] = useState<string>('');
  const amount = parseFloat(amountInput) || 0;

  const [destinationType, setDestinationType] = useState<'UPI' | 'BANK'>('UPI');
  const [upiId, setUpiId] = useState<string>('');
  const [accountNo, setAccountNo] = useState<string>('');
  const [ifsc, setIfsc] = useState<string>('');
  const [bankName, setBankName] = useState<string>('');
  const [accountName, setAccountName] = useState<string>('');
  const [bankSavedSuccess, setBankSavedSuccess] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [submittedData, setSubmittedData] = useState<{
    amount: number;
    netAmount: number;
    destination: string;
    ref: string;
    source: WithdrawalSource;
  } | null>(null);

  const handleNotifyAdminWhatsApp = (
    withdrawGross: number,
    withdrawNet: number,
    destination: string,
    ref: string
  ) => {
    const alertData = createAdminWithdrawalAlertMessage(
      {
        amount: withdrawGross,
        grossAmount: withdrawGross,
        tdsAmount: Math.round(((withdrawGross * tdsPercent) / 100) * 100) / 100,
        netAmount: withdrawNet,
        destinationDetails: destination,
        id: ref,
        referenceId: ref,
        timestamp: Date.now(),
      },
      accountName || currentUser?.name || 'निवेशक',
      currentUser?.id,
      currentUser?.phone
    );
    sendWhatsAppAlert(alertData);
  };

  const handleNotifyUserWhatsApp = (
    withdrawGross: number,
    withdrawNet: number,
    destination: string,
    ref: string
  ) => {
    const alertData = createWithdrawalWhatsAppAlert(
      {
        id: ref,
        referenceId: ref,
        grossAmount: withdrawGross,
        amount: withdrawNet,
        tdsAmount: Math.round(((withdrawGross * tdsPercent) / 100) * 100) / 100,
        adminFeeAmount: Math.round(((withdrawGross * adminFeePercent) / 100) * 100) / 100,
        netAmount: withdrawNet,
        destinationDetails: destination,
        status: 'PENDING',
        timestamp: Date.now(),
        userPhone: currentUser?.phone,
        userName: accountName || currentUser?.name,
      } as any,
      accountName || currentUser?.name,
      currentUser?.phone
    );
    sendWhatsAppAlert(alertData);
  };

  const handleSaveBankDetailsDirect = async () => {
    setError('');
    setBankSavedSuccess('');
    if (!currentUser?.id) return;

    if (destinationType === 'BANK') {
      if (!accountName.trim()) {
        setError(isHi ? 'कृपया खाताधारक का नाम दर्ज करें।' : 'Please enter account holder name.');
        return;
      }
      if (!bankName.trim()) {
        setError(isHi ? 'कृपया बैंक का नाम (उदा. SBI, HDFC, Axis Bank) दर्ज करें।' : 'Please enter bank name.');
        return;
      }
      if (!accountNo.trim() || accountNo.trim().length < 8) {
        setError(isHi ? 'कृपया मान्य बैंक खाता संख्या दर्ज करें (कम से कम 8 अंक)।' : 'Please enter valid account number (min 8 digits).');
        return;
      }
      if (!ifsc.trim() || ifsc.trim().length < 8) {
        setError(isHi ? 'कृपया मान्य IFSC कोड दर्ज करें (उदा. SBIN0001234)।' : 'Please enter valid IFSC code.');
        return;
      }
    } else {
      if (!upiId.trim().includes('@') || upiId.trim().length < 5) {
        setError(isHi ? 'कृपया मान्य UPI ID दर्ज करें (उदा. user@upi)।' : 'Please enter valid UPI ID (e.g. user@upi).');
        return;
      }
    }

    const currentSaved: Partial<BankAccountDetails> = getStoredBankDetails(currentUser.id) || {};
    const updatedDetails: BankAccountDetails = {
      accountHolder: accountName.trim() || currentSaved.accountHolder || currentUser.name || '',
      accountNumber: destinationType === 'BANK' ? accountNo.trim() : (currentSaved.accountNumber || ''),
      ifscCode: destinationType === 'BANK' ? ifsc.trim().toUpperCase() : (currentSaved.ifscCode || ''),
      bankName: destinationType === 'BANK' ? bankName.trim() : (currentSaved.bankName || ''),
      upiId: destinationType === 'UPI' ? upiId.trim() : (currentSaved.upiId || ''),
    };

    setStoredBankDetails(currentUser.id, updatedDetails);
    currentUser.bankDetails = updatedDetails;
    await apiSaveBankDetails(currentUser.id, updatedDetails).catch(() => {});

    setBankSavedSuccess(
      isHi
        ? '✅ बैंक विवरण आपके खाते के रिकॉर्ड में स्थायी रूप से सुरक्षित हो गया है!'
        : '✅ Bank details permanently saved to your account record!'
    );
    setTimeout(() => setBankSavedSuccess(''), 4500);
  };

  const prevIsOpenRef = React.useRef<boolean>(false);
  const prevSourceRef = React.useRef<WithdrawalSource>(withdrawalSource);

  React.useEffect(() => {
    const justOpened = isOpen && !prevIsOpenRef.current;
    const sourceChanged = withdrawalSource !== prevSourceRef.current;
    prevIsOpenRef.current = isOpen;
    prevSourceRef.current = withdrawalSource;

    if (isOpen) {
      if (justOpened || sourceChanged) {
        const newMax =
          withdrawalSource === 'EARNING'
            ? totalEarning
            : withdrawalSource === 'ROYALTY'
            ? royaltyEarning
            : cashEarning;
        setAmountInput(newMax > 0 ? String(newMax) : '0');
      }

      if (currentUser) {
        const saved =
          currentUser.bankDetails ||
          getStoredBankDetails(currentUser.id) ||
          (currentUser.loginId ? getStoredBankDetails(currentUser.loginId) : null) ||
          (currentUser.phone ? getStoredBankDetails(currentUser.phone) : null);

        if (saved) {
          setUpiId(saved.upiId || '');
          setAccountNo(saved.accountNumber || '');
          setIfsc(saved.ifscCode || '');
          setBankName(saved.bankName || '');
          setAccountName(saved.accountHolder || currentUser.name || '');
        } else {
          setUpiId('');
          setAccountNo('');
          setIfsc('');
          setBankName('');
          setAccountName(currentUser.name || '');
        }
      }
    }
  }, [isOpen, withdrawalSource, currentUser, totalEarning, royaltyEarning, cashEarning]);


  const isBankConfigured = destinationType === "BANK"
    ? Boolean(accountName.trim() && bankName.trim() && accountNo.trim().length >= 8 && ifsc.trim().length >= 8)
    : Boolean(upiId.trim().includes("@") && upiId.trim().length >= 5);

  if (!isOpen) return null;

  // Auto-calculated Government Statutory TDS rate according to Income Tax Slabs or Admin Configuration:
  // If admin specifically sets rules.tdsPercent, it applies dynamically; otherwise statutory slab: <= ₹10,000 = 5%, > ₹10,000 = 10%
  const govtSlabTds = amount > 10000 ? 10.0 : 5.0;
  const tdsPercent =
    rules?.tdsPercent !== undefined && rules.tdsPercent > 0
      ? rules.tdsPercent
      : govtSlabTds;
  const adminFeePercent = (rules?.adminFeePercent ?? 2.0) < 0.1 ? 2.0 : (rules?.adminFeePercent ?? 2.0);

  const tdsAmount = Math.round(((amount * tdsPercent) / 100) * 100) / 100;
  const adminFeeAmount = Math.round(((amount * adminFeePercent) / 100) * 100) / 100;
  const totalDeductions = tdsAmount + adminFeeAmount;
  const netPayable = Math.max(0, amount - totalDeductions);

  // Switch tabs
  const handleSelectSource = (src: WithdrawalSource) => {
    setWithdrawalSource(src);
    setError('');
    const newMax = src === 'EARNING' ? totalEarning : src === 'ROYALTY' ? royaltyEarning : cashEarning;
    setAmountInput(newMax > 0 ? String(newMax) : '0');
  };

  const handleWithdraw = () => {
    setError('');

    // Rule 1 check
    if (withdrawalSource === 'EARNING' && !isEarningWindowActive) {
      setError(
        isHi
          ? `नियम #1: अर्निंग निकासी केवल हर महीने की 1 से 5 तारीख तक ही की जा सकती है। आज ${currentDay} तारीख है, इसलिए यह विकल्प अभी बंद है।`
          : `Rule #1: Earning withdrawals can strictly be requested from the 1st to the 5th of each month. Today is the ${currentDay}th.`
      );
      return;
    }

    // Rule 2 check
    if (withdrawalSource === 'ROYALTY' && !isRoyaltyWindowActive) {
      setError(
        isHi
          ? `नियम #2: रॉयल्टी निकासी केवल हर महीने की 6 से 10 तारीख तक ही की जा सकती है। आज ${currentDay} तारीख है, इसलिए यह विकल्प अभी बंद है।`
          : `Rule #2: Royalty withdrawals can strictly be requested from the 6th to the 10th of each month. Today is the ${currentDay}th.`
      );
      return;
    }

    if (maxWithdrawable <= 0) {
      setError(
        isHi
          ? `आपके पास निकासी हेतु उपलब्ध ${withdrawalSource === 'EARNING' ? 'अर्निंग' : 'रॉयल्टी'} बैलेंस ₹0 है।`
          : `You have ₹0 available in your ${withdrawalSource === 'EARNING' ? 'Earning' : 'Royalty'} balance.`
      );
      return;
    }

    if (amount < minWithdrawal) {
      setError(
        isHi
          ? `न्यूनतम निकासी राशि ${formatINR(minWithdrawal)} है।`
          : `Minimum withdrawal amount is ${formatINR(minWithdrawal)}.`
      );
      return;
    }

    if (amount > maxWithdrawable) {
      setError(
        isHi
          ? `आप उपलब्ध राशि (${formatINR(maxWithdrawable)}) से अधिक नहीं निकाल सकते।`
          : `You cannot withdraw more than the available balance (${formatINR(maxWithdrawable)}).`
      );
      return;
    }

    if (destinationType === 'BANK') {
      if (!accountName.trim() || !bankName.trim() || accountNo.trim().length < 8 || ifsc.trim().length < 8) {
        setError(
          isHi
            ? '❌ निकासी अनुरोध नहीं लग सकता! कृपया पहले अपना पूरा बैंक विवरण (खाताधारक का नाम, बैंक का नाम, खाता संख्या, IFSC कोड) भरें और "बैंक विवरण स्थायी सुरक्षित करें" दबाएँ।'
            : '❌ Cannot submit withdrawal! Please enter complete bank details (Holder Name, Bank Name, Account No, IFSC) and save before withdrawing.'
        );
        return;
      }
    } else {
      if (!upiId.trim().includes('@') || upiId.trim().length < 5) {
        setError(
          isHi
            ? '❌ निकासी अनुरोध नहीं लग सकता! कृपया मान्य UPI ID दर्ज करें (उदा. user@upi) और सुरक्षित करें।'
            : '❌ Cannot submit withdrawal! Please enter a valid UPI ID (e.g. user@upi) and save.'
        );
        return;
      }
    }

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      const randomRef = 'WTH' + Math.floor(1000000000 + Math.random() * 9000000000);
      const destinationStr = destinationType === 'UPI'
        ? `UPI: ${upiId.trim()}`
        : `Bank A/C: ${accountNo.trim()} (${ifsc.trim().toUpperCase()}) [${bankName.trim()}]`;

      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
      });

      const voucherDetails: Partial<Transaction> = {
        grossAmount: amount,
        tdsPercent,
        tdsAmount,
        adminFeePercent,
        adminFeeAmount,
        netAmount: netPayable,
        destinationDetails: destinationStr,
        userName: accountName.trim() || currentUser?.name || 'निवेशक',
        userPhone: currentUser?.phone || '',
        panNumber: 'ABCDE1234F',
      };

      onWithdrawSuccess(amount, destinationStr, randomRef, withdrawalSource, voucherDetails);
      
      // Automatically save entered bank details to user profile permanently
      if (currentUser?.id) {
        const currentSaved: Partial<BankAccountDetails> = getStoredBankDetails(currentUser.id) || {};
        const updatedDetails: BankAccountDetails = {
          accountHolder: accountName.trim() || currentSaved.accountHolder || currentUser.name || '',
          accountNumber: destinationType === 'BANK' ? accountNo.trim() : (currentSaved.accountNumber || ''),
          ifscCode: destinationType === 'BANK' ? ifsc.trim().toUpperCase() : (currentSaved.ifscCode || ''),
          bankName: destinationType === 'BANK' ? bankName.trim() : (currentSaved.bankName || ''),
          upiId: destinationType === 'UPI' ? upiId.trim() : (currentSaved.upiId || ''),
        };
        setStoredBankDetails(currentUser.id, updatedDetails);
        currentUser.bankDetails = updatedDetails;
        apiSaveBankDetails(currentUser.id, updatedDetails).catch(() => {});
      }

      // Automatically send WhatsApp alert to admin
      handleNotifyAdminWhatsApp(amount, netPayable, destinationStr, randomRef);

      setSubmittedData({
        amount,
        netAmount: netPayable,
        destination: destinationStr,
        ref: randomRef,
        source: withdrawalSource,
      });
    }, 1200);
  };

  const handleCloseModal = () => {
    setSubmittedData(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/30 shrink-0">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  {isHi ? 'फंड निकासी (Withdrawal Center)' : 'Withdrawal Center (Earnings & Royalty)'}
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold font-mono">
                  {isHi ? `आज: ${currentDay} तारीख` : `Today: Day ${currentDay}`}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isHi
                  ? 'अर्निंग (1-5 तारीख) | रॉयल्टी (6-10 तारीख) — सटीक तारीख नियम'
                  : 'Earnings: 1st - 5th | Royalty: 6th - 10th of every month'}
              </p>
            </div>
          </div>

          <button
            id="btn-close-withdraw"
            onClick={handleCloseModal}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SUBMITTED SUCCESS VIEW WITH 1-CLICK ADMIN WHATSAPP */}
        {submittedData ? (
          <div className="p-6 space-y-5 text-center">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center mx-auto shadow-lg animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-white">
                {isHi ? '🎉 निकासी अनुरोध सफलतापूर्वक दर्ज हुआ!' : '🎉 Withdrawal Request Submitted!'}
              </h3>
              <p className="text-xs text-slate-300">
                {isHi
                  ? 'आपका निकासी अनुरोध एडमिन सत्यापन एवं बैंक ट्रांसफर हेतु दर्ज हो गया है।'
                  : 'Your withdrawal request has been submitted for admin verification and payout.'}
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2 text-left">
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">{isHi ? 'कुल निकासी (Gross):' : 'Gross Amount:'}</span>
                <span className="font-mono text-white font-bold">{formatINR(submittedData.amount)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">{isHi ? 'नेट भुगतेय (Net Payout):' : 'Net Payout:'}</span>
                <span className="font-bold text-emerald-400 font-mono text-sm">{formatINR(submittedData.netAmount)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">{isHi ? 'भुगतान खाता / UPI:' : 'Destination:'}</span>
                <span className="font-mono text-slate-200">{submittedData.destination}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{isHi ? 'अनुरोध आईडी:' : 'Ref ID:'}</span>
                <span className="font-mono text-amber-300 font-bold">{submittedData.ref}</span>
              </div>
            </div>

            {/* 1-Click WhatsApp Buttons for BOTH Admin & User */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => handleNotifyAdminWhatsApp(submittedData.amount, submittedData.netAmount, submittedData.destination, submittedData.ref)}
                className="w-full py-3 px-4 rounded-xl bg-green-600 hover:bg-green-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-green-950/60 transition-all cursor-pointer active:scale-95 animate-pulse"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>{isHi ? '📲 1. एडमिन को WhatsApp सूचना भेजें (Admin Alert)' : '📲 1. Send Alert to Admin WhatsApp'}</span>
              </button>
              <button
                type="button"
                onClick={() => handleNotifyUserWhatsApp(submittedData.amount, submittedData.netAmount, submittedData.destination, submittedData.ref)}
                className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 transition-all cursor-pointer active:scale-95"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>{isHi ? '📄 2. अपनी WhatsApp निकासी रसीद प्राप्त करें' : '📄 2. Get Your WhatsApp Receipt'}</span>
              </button>
              <p className="text-[11px] text-slate-400">
                {isHi
                  ? '💡 निकासी दर्ज होते ही एडमिन पैनल में ट्रांसफर बटन चालू हो गया है। एडमिन द्वारा अप्रूव करते ही आपको भुगतान का संपूर्ण विवरण WhatsApp पर भी प्राप्त होगा।'
                  : '💡 Admin panel shows your request for instant approval & payout.'}
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
          /* REGULAR WITHDRAWAL FORM */
          <>
            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5">

          {/* Quick Date Simulator Switch for Seamless Verification */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <Calendar className="w-4 h-4 text-purple-400 shrink-0" />
              <span className="font-semibold text-slate-300">
                {isHi ? 'तारीख परीक्षण मोड (Simulator):' : 'Date Window Simulator:'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setSimulatedDay(null)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  simulatedDay === null
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {isHi ? `वास्तविक (${realDay} तारीख)` : `Real (${realDay}th)`}
              </button>
              <button
                type="button"
                onClick={() => setSimulatedDay(3)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  simulatedDay === 3
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {isHi ? '1-5 तारीख (अर्निंग ON)' : 'Day 1-5 (Earning ON)'}
              </button>
              <button
                type="button"
                onClick={() => setSimulatedDay(8)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  simulatedDay === 8
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {isHi ? '6-10 तारीख (रॉयल्टी ON)' : 'Day 6-10 (Royalty ON)'}
              </button>
              <button
                type="button"
                onClick={() => setSimulatedDay(15)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  simulatedDay === 15
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {isHi ? '11-31 तारीख (सभी OFF)' : 'Day 11-31 (OFF)'}
              </button>
            </div>
          </div>

          {/* RULE 3: ONLY Total Earning Amount and Royalty Earning Amount are displayed */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {isHi ? 'निकासी योग्य बैलेंस (Withdrawable Balances):' : 'Available Withdrawable Balances:'}
              </span>
              <span className="text-[11px] text-amber-400/90 font-medium">
                {isHi ? 'केवल अर्निंग व रॉयल्टी मान्य' : 'Rule 3: Pure Earnings & Royalty Only'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Option A: Total Earning Amount */}
              <div
                onClick={() => handleSelectSource('EARNING')}
                className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  withdrawalSource === 'EARNING'
                    ? 'bg-purple-950/30 border-purple-500 shadow-md shadow-purple-950/30'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">
                        {isHi ? 'कुल अर्निंग' : 'Total Earning'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {isHi ? '1 से 5 तारीख' : '1st - 5th'}
                      </span>
                    </div>
                  </div>
                  {isEarningWindowActive ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                      🟢 {isHi ? 'सक्रिय' : 'Active'}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-semibold flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" />
                      <span>{isHi ? '1-5 को' : 'Locked'}</span>
                    </span>
                  )}
                </div>

                <div className="mt-2">
                  <span className="text-2xl font-extrabold font-mono text-purple-400">
                    {formatINR(totalEarning)}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {isHi
                      ? 'दैनिक निवेश रिटर्न व मुनाफा'
                      : 'Accrued daily ROI returns'}
                  </p>
                </div>
              </div>

              {/* Option B: Royalty Earning Amount */}
              {hasRoyalty ? (
                <div
                  onClick={() => handleSelectSource('ROYALTY')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                    withdrawalSource === 'ROYALTY'
                      ? 'bg-amber-950/30 border-amber-500 shadow-md shadow-amber-950/30'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">
                          {isHi ? 'रॉयल्टी अर्निंग' : 'Royalty Earning'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {isHi ? '6 से 10 तारीख' : '6th - 10th'}
                        </span>
                      </div>
                    </div>
                    {isRoyaltyWindowActive ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                        🟢 {isHi ? 'सक्रिय' : 'Active'}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-semibold flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" />
                        <span>{isHi ? '6-10 को' : 'Locked'}</span>
                      </span>
                    )}
                  </div>

                  <div className="mt-2">
                    <span className="text-2xl font-extrabold font-mono text-amber-400">
                      {formatINR(royaltyEarning)}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {isHi
                        ? 'रेफरल रॉयल्टी रिवॉर्ड'
                        : 'Leadership/referral royalty'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/40 flex flex-col justify-center text-slate-500 text-xs">
                  <div className="flex items-center gap-2 mb-1 text-slate-400 font-semibold">
                    <Award className="w-4 h-4 text-slate-500" />
                    <span>{isHi ? 'रॉयल्टी अर्निंग' : 'Royalty Earning'}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {isHi
                      ? 'वर्तमान में कोई रॉयल्टी अर्निंग नहीं है।'
                      : 'No royalty bonuses generated.'}
                  </p>
                </div>
              )}

              {/* Option C: Wallet Cash Balance */}
              <div
                onClick={() => handleSelectSource('CASH')}
                className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  withdrawalSource === 'CASH'
                    ? 'bg-emerald-950/30 border-emerald-500 shadow-md shadow-emerald-950/30'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                      <WalletIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">
                        {isHi ? 'वॉलेट कैश बैलेंस' : 'Wallet Cash'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {isHi ? 'कभी भी निकासी' : 'Anytime Withdrawal'}
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                    🟢 {isHi ? 'सक्रिय' : 'Active'}
                  </span>
                </div>

                <div className="mt-2">
                  <span className="text-2xl font-extrabold font-mono text-emerald-400">
                    {formatINR(cashEarning)}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {isHi
                      ? 'GP से परिवर्तित रुपए'
                      : 'Rupees converted from GP'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* DATE WINDOW NOTICES (Rule 1 & Rule 2 Enforcement) */}
          {withdrawalSource === 'EARNING' && !isEarningWindowActive && (
            <div className="bg-rose-950/30 border border-rose-500/40 rounded-xl p-3.5 flex items-start gap-3 text-xs text-rose-200 animate-in fade-in">
              <Lock className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-white block">
                  {isHi ? '🔒 नियम #1: अर्निंग निकासी विंडो अभी बंद है' : '🔒 Rule #1: Earning Withdrawal Window Closed'}
                </span>
                <p className="text-[11px] text-rose-200/90 leading-relaxed">
                  {isHi
                    ? `अर्निंग अमाउंट की निकासी केवल हर महीने की 1 से 5 तारीख तक ही की जा सकती है। आज ${currentDay} तारीख है, इसलिए यह विकल्प निष्क्रिय है। आप 1 तारीख से 5 तारीख के बीच कभी भी विथड्रॉ कर सकते हैं।`
                    : `Earning withdrawals are strictly permitted from the 1st to the 5th of every month. Today is the ${currentDay}th. Requests submitted outside this date range are locked.`}
                </p>
              </div>
            </div>
          )}

          {withdrawalSource === 'ROYALTY' && !isRoyaltyWindowActive && (
            <div className="bg-rose-950/30 border border-rose-500/40 rounded-xl p-3.5 flex items-start gap-3 text-xs text-rose-200 animate-in fade-in">
              <Lock className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-white block">
                  {isHi ? '🔒 नियम #2: रॉयल्टी निकासी विंडो अभी बंद है' : '🔒 Rule #2: Royalty Withdrawal Window Closed'}
                </span>
                <p className="text-[11px] text-rose-200/90 leading-relaxed">
                  {isHi
                    ? `रॉयल्टी अमाउंट की निकासी केवल हर महीने की 6 से 10 तारीख तक ही की जा सकती है। आज ${currentDay} तारीख है, इसलिए यह विकल्प निष्क्रिय है। आप 6 तारीख से 10 तारीख के बीच कभी भी विथड्रॉ कर सकते हैं।`
                    : `Royalty withdrawals are strictly permitted from the 6th to the 10th of every month. Today is the ${currentDay}th. Requests submitted outside this date range are locked.`}
                </p>
              </div>
            </div>
          )}

          {/* Amount Input */}
          <div className={!activeWindowValid ? 'opacity-40 pointer-events-none' : ''}>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                {isHi
                  ? `${withdrawalSource === 'EARNING' ? 'अर्निंग' : withdrawalSource === 'ROYALTY' ? 'रॉयल्टी' : 'कैश'} निकासी राशि (Amount):`
                  : `${withdrawalSource === 'EARNING' ? 'Earning' : withdrawalSource === 'ROYALTY' ? 'Royalty' : 'Cash'} Withdrawal Amount:`}
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                {isHi ? 'अधिकतम:' : 'Max:'} {formatINR(maxWithdrawable)}
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-lg font-bold text-purple-400">
                ₹
              </span>
              <input
                id="input-withdraw-amount"
                type="number"
                step="any"
                value={amountInput}
                disabled={!activeWindowValid}
                onChange={(e) => {
                  setAmountInput(e.target.value);
                  setError('');
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-9 pr-4 text-white font-mono text-xl font-bold focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="0"
              />
            </div>

            {/* Quick Percentage Chips */}
            <div className="flex gap-2 mt-2.5">
              {[
                { label: '25%', factor: 0.25 },
                { label: '50%', factor: 0.5 },
                { label: '75%', factor: 0.75 },
                { label: isHi ? 'पूरा 100%' : 'All 100%', factor: 1.0 },
              ].map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={!activeWindowValid || maxWithdrawable <= 0}
                  onClick={() => {
                    const calc = Math.round((maxWithdrawable * p.factor) * 100) / 100;
                    setAmountInput(String(calc));
                    setError('');
                  }}
                  className="flex-1 py-1.5 rounded-lg text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:bg-purple-600 active:text-white"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bank Details Status Alert */}
          {(!isBankConfigured) && (
            <div className="p-3.5 bg-amber-500/15 border border-amber-500/40 rounded-xl text-xs space-y-1.5 animate-pulse">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{isHi ? '⚠️ बैंक विवरण अधूरा है (Bank Details Required)!' : '⚠️ Bank Details Incomplete!'}</span>
              </div>
              <p className="text-amber-200/90 text-[11px] leading-relaxed">
                {isHi
                  ? 'निकासी अनुरोध लगाने से पहले अपना पूरा बैंक विवरण (खाताधारक का नाम, बैंक का नाम, खाता संख्या, IFSC कोड) या मान्य UPI ID भरना अनिवार्य है। नीचे विवरण भरकर "बैंक विवरण सुरक्षित करें" बटन दबाएँ।'
                  : 'Complete bank account details (Holder name, Bank name, Account number, IFSC code) or valid UPI ID are mandatory before requesting withdrawal. Please fill and save below.'}
              </p>
            </div>
          )}

          {bankSavedSuccess && (
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold">{bankSavedSuccess}</span>
            </div>
          )}

          {/* Destination Type Toggle */}
          <div className={!activeWindowValid ? 'opacity-40 pointer-events-none' : ''}>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              {isHi ? 'भुगतान गंतव्य (Payout Destination):' : 'Payout Destination:'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                id="btn-withdraw-type-upi"
                onClick={() => setDestinationType('UPI')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  destinationType === 'UPI'
                    ? 'bg-purple-500/10 border-purple-500 text-purple-300 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>{isHi ? 'UPI ID (तत्काल ट्रांसफर)' : 'Instant UPI ID'}</span>
              </button>

              <button
                type="button"
                id="btn-withdraw-type-bank"
                onClick={() => setDestinationType('BANK')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  destinationType === 'BANK'
                    ? 'bg-purple-500/10 border-purple-500 text-purple-300 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>{isHi ? 'बैंक खाता (IMPS/NEFT)' : 'Bank Account (IMPS)'}</span>
              </button>
            </div>
          </div>

          {/* Payout Input Fields */}
          {destinationType === 'UPI' ? (
            <div className={`space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800 ${!activeWindowValid ? 'opacity-40' : ''}`}>
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">
                  {isHi ? 'अपनी UPI ID दर्ज करें:' : 'Your Virtual Payment Address (UPI ID):'}
                </label>
                <input
                  id="input-withdraw-upi"
                  type="text"
                  value={upiId}
                  disabled={!activeWindowValid}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. 7564841400@upi या name@okhdfcbank"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-mono text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="pt-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-t border-slate-800/80">
                <p className="text-[11px] text-slate-400">
                  {isHi ? 'खाताधारक नाम: ' : 'Registered Name: '}
                  <span className="text-slate-300 font-semibold">{accountName || currentUser?.name}</span>
                </p>
                <button
                  type="button"
                  onClick={handleSaveBankDetailsDirect}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-amber-950/40"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isHi ? '💾 UPI स्थायी सुरक्षित करें' : '💾 Save UPI Permanently'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className={`space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs ${!activeWindowValid ? 'opacity-40' : ''}`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">{isHi ? 'खाताधारक का नाम:' : 'Account Holder Name:'}</label>
                  <input
                    type="text"
                    value={accountName}
                    disabled={!activeWindowValid}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">{isHi ? 'बैंक का नाम (Bank Name):' : 'Bank Name:'}</label>
                  <input
                    type="text"
                    value={bankName}
                    disabled={!activeWindowValid}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. State Bank of India, HDFC, Axis"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">{isHi ? 'बैंक खाता संख्या (Account Number):' : 'Account Number:'}</label>
                  <input
                    type="text"
                    value={accountNo}
                    disabled={!activeWindowValid}
                    onChange={(e) => setAccountNo(e.target.value)}
                    placeholder="e.g. 924010008662307"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">{isHi ? 'IFSC कोड:' : 'IFSC Code:'}</label>
                  <input
                    type="text"
                    value={ifsc}
                    disabled={!activeWindowValid}
                    onChange={(e) => setIfsc(e.target.value)}
                    placeholder="e.g. SBIN0001234"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono uppercase"
                  />
                </div>
              </div>

              {/* Dedicated Save Bank Details Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-t border-slate-800/80">
                <span className="text-[11px] text-slate-400">
                  {isHi ? '🔒 विवरण आपके प्रोफ़ाइल रिकॉर्ड में स्थायी सुरक्षित होगा' : '🔒 Details saved permanently to your profile record'}
                </span>
                <button
                  type="button"
                  onClick={handleSaveBankDetailsDirect}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-amber-950/40"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isHi ? '💾 बैंक विवरण स्थायी सुरक्षित करें' : '💾 Save Bank Details Permanently'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Deduction Breakdown Box */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
            <span className="font-bold text-slate-300 block text-[11px] uppercase tracking-wider">
              {isHi ? '📊 निकासी कटौती विवरण (Payout Breakdown):' : '📊 Deductions & Payout Summary:'}
            </span>
            <div className="space-y-1.5 font-mono text-[11px]">
              <div className="flex items-center justify-between text-slate-300">
                <span>{isHi ? 'अनुरोधित कुल निकासी' : 'Requested Gross Amount'}:</span>
                <span className="font-bold text-white">{formatINR(amount)}</span>
              </div>
              <div className="flex items-center justify-between text-rose-400">
                <span className="flex items-center gap-1">
                  <span>{isHi ? `🏛️ सरकारी TDS (${tdsPercent}%)` : `🏛️ Statutory Govt TDS (${tdsPercent}%)`}</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-300 font-mono border border-rose-500/20">
                    {amount > 10000 ? (isHi ? 'Sec 194BA' : 'Sec 194BA') : (isHi ? 'Sec 194A' : 'Sec 194A')}
                  </span>
                </span>
                <span>-{formatINR(tdsAmount)}</span>
              </div>
              <div className="flex items-center justify-between text-amber-400">
                <span>{isHi ? `एडमिन शुल्क (${adminFeePercent}%)` : `Admin Charge (${adminFeePercent}%)`}:</span>
                <span>-{formatINR(adminFeeAmount)}</span>
              </div>
              <div className="border-t border-slate-800 pt-1.5 flex items-center justify-between font-bold text-emerald-400 text-xs">
                <span>{isHi ? 'बैंक/UPI में हस्तांतरित नेट राशि' : 'Net Disbursed to Bank/UPI'}:</span>
                <span className="text-sm font-extrabold">{formatINR(netPayable)}</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {isHi
                ? 'कटौती के पश्चात आधिकारिक भुगतान वाउचर जेनरेट होगा जिसे आप कभी भी प्रिंट / डाउनलोड कर सकते हैं।'
                : 'Official payment voucher with TDS & Admin receipt will be issued immediately upon payout.'}
            </span>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                {isHi ? 'सटीक प्राप्त राशि (Net):' : 'Net to Receive:'}
              </span>
            </div>
            <span className="text-lg font-mono font-bold text-emerald-400">
              {formatINR(netPayable)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-cancel-withdraw"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              {isHi ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              type="button"
              id="btn-confirm-withdraw"
              onClick={handleWithdraw}
              disabled={
                !activeWindowValid ||
                amount < minWithdrawal ||
                amount > maxWithdrawable ||
                isProcessing
              }
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md ${
                !activeWindowValid
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-700/20 cursor-pointer'
              }`}
            >
              {isProcessing ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>{isHi ? 'भेज रहे हैं...' : 'Dispatching...'}</span>
                </>
              ) : !activeWindowValid ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {isHi
                      ? `${withdrawalSource === 'EARNING' ? 'अर्निंग (1-5 तारीख)' : 'रॉयल्टी (6-10 तारीख)'} विंडो बंद है`
                      : 'Window Currently Inactive'}
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isHi ? 'निकासी की पुष्टि करें' : 'Confirm Withdrawal'}</span>
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
