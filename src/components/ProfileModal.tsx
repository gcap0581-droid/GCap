import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Lock,
  Building2,
  CheckCircle2,
  Shield,
  Save,
  AlertCircle,
  Key,
  Eye,
  EyeOff,
  Globe,
  Languages,
  ArrowRight,
  BadgeCheck,
  FileCheck,
  CreditCard,
  Smartphone,
  Send,
  RefreshCw,
  KeyRound,
} from 'lucide-react';
import { Language, UserProfile, BankAccountDetails } from '../types';
import { getStoredBankDetails, setStoredBankDetails } from '../utils/storage';
import { adminUpdateUser, adminUpdateUserAsync } from '../utils/authStorage';
import { apiSaveBankDetails } from '../utils/centralSync';
import { audioAnnouncer } from '../utils/audioAnnouncer';
import {
  sendFirebasePhoneOtp,
  verifyFirebasePhoneOtp,
  verifyPanCardApi,
  sendAadhaarOtpApi,
  verifyAadhaarOtpApi,
  formatAadhaarNumber,
  validatePanStructure,
  updateUserKycApi,
} from '../utils/kycVerification';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  language: Language;
  onLanguageChange?: (lang: Language) => void;
  onUpdateCurrentUser?: (updated: UserProfile) => void;
}

type ProfileSubMenu = 'BANK' | 'KYC' | 'PERSONAL' | 'SECURITY' | 'LANGUAGE';

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  language,
  onLanguageChange,
  onUpdateCurrentUser,
}) => {
  const isHi = language === 'hi';

  const [activeMenu, setActiveMenu] = useState<ProfileSubMenu>('BANK');

  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  // Bank Account State
  const [accountHolder, setAccountHolder] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [upiId, setUpiId] = useState('');

  // Password Change State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // KYC State
  const [panNumber, setPanNumber] = useState('');
  const [isPanVerified, setIsPanVerified] = useState(false);
  const [panHolderName, setPanHolderName] = useState('');
  const [isPanVerifying, setIsPanVerifying] = useState(false);

  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [isAadhaarVerified, setIsAadhaarVerified] = useState(false);
  const [maskedAadhaar, setMaskedAadhaar] = useState('');
  const [aadhaarOtp, setAadhaarOtp] = useState('');
  const [isAadhaarOtpSent, setIsAadhaarOtpSent] = useState(false);
  const [aadhaarClientId, setAadhaarClientId] = useState('');
  const [isAadhaarOtpSending, setIsAadhaarOtpSending] = useState(false);
  const [isAadhaarVerifying, setIsAadhaarVerifying] = useState(false);
  const [aadhaarTestOtpHint, setAadhaarTestOtpHint] = useState<string | null>(null);

  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState('');
  const [isPhoneOtpSent, setIsPhoneOtpSent] = useState(false);
  const [phoneOtpSending, setPhoneOtpSending] = useState(false);
  const [phoneOtpVerifying, setPhoneOtpVerifying] = useState(false);
  const [phoneTestOtpHint, setPhoneTestOtpHint] = useState<string | null>(null);
  const [phoneResendTimer, setPhoneResendTimer] = useState(0);

  const [isSaved, setIsSaved] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  // Countdown timer for Phone OTP Resend
  useEffect(() => {
    if (phoneResendTimer <= 0) return;
    const timer = setInterval(() => {
      setPhoneResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [phoneResendTimer]);

  useEffect(() => {
    if (currentUser) {
      setEmail(currentUser.email || '');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      setSuccessMessage('');

      // Load KYC fields
      setPanNumber(currentUser.panNumber || '');
      setIsPanVerified(currentUser.isPanVerified || false);
      setPanHolderName(currentUser.panHolderName || currentUser.name || '');
      
      setAadhaarNumber(currentUser.aadhaarNumber || '');
      setIsAadhaarVerified(currentUser.isAadhaarVerified || false);
      setMaskedAadhaar(currentUser.aadhaarNumber || '');
      setIsAadhaarOtpSent(false);

      setIsPhoneVerified(currentUser.isPhoneVerified || false);
      setIsPhoneOtpSent(false);

      // Load saved bank details
      const stored = currentUser.bankDetails || getStoredBankDetails(currentUser.id);
      if (stored) {
        setAccountHolder(stored.accountHolder || currentUser.name || '');
        setBankName(stored.bankName || '');
        setAccountNumber(stored.accountNumber || '');
        setIfscCode(stored.ifscCode || '');
        setUpiId(stored.upiId || '');
      } else {
        setAccountHolder(currentUser.name || '');
      }
    }
  }, [currentUser, isOpen]);

  if (!isOpen || !currentUser) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (currentUser.status === 'SUSPENDED') {
      setError(
        isHi
          ? `❌ खाता निलंबित (Suspended Mode)! ${currentUser.suspendedReason || 'सुरक्षा हेतु जानकारी अपडेट करने की अनुमति नहीं है।'}`
          : `❌ Account Suspended! ${currentUser.suspendedReason || 'You cannot update information while suspended.'}`
      );
      return;
    }

    // If new password is provided, validate
    const trimmedPass = newPassword.trim();
    if (activeMenu === 'SECURITY') {
      if (!trimmedPass) {
        setError(isHi ? 'कृपया नया पासवर्ड दर्ज करें।' : 'Please enter a new password.');
        return;
      }
      if (trimmedPass.length < 4) {
        setError(isHi ? 'पासवर्ड कम से कम 4 अक्षरों का होना चाहिए।' : 'Password must be at least 4 characters.');
        return;
      }
      if (trimmedPass !== confirmPassword.trim()) {
        setError(isHi ? 'दोनों पासवर्ड मेल नहीं खा रहे हैं।' : 'Passwords do not match.');
        return;
      }
    }

    // Save Bank Details
    const bankDetails: BankAccountDetails = {
      accountHolder: accountHolder.trim() || currentUser.name,
      accountNumber: accountNumber.trim(),
      ifscCode: ifscCode.trim().toUpperCase(),
      bankName: bankName.trim(),
      upiId: upiId.trim(),
    };

    // Build user profile updates object
    const updates: {
      email?: string;
      address?: string;
      password?: string;
      passwordHash?: string;
      bankDetails?: BankAccountDetails;
    } = {};
    let isPasswordChanged = false;

    if (activeMenu === 'BANK') {
      setStoredBankDetails(currentUser.id, bankDetails);
      apiSaveBankDetails(currentUser.id, bankDetails).catch(() => {});
      updates.bankDetails = bankDetails;
    }

    if (activeMenu === 'KYC') {
      const kycStatus = (isPanVerified && isAadhaarVerified)
        ? 'VERIFIED'
        : (isPhoneVerified || isPanVerified || isAadhaarVerified)
        ? 'PENDING'
        : 'NOT_SUBMITTED';

      const cleanPan = panNumber ? panNumber.toUpperCase().trim() : undefined;
      const cleanAadhaar = isAadhaarVerified ? (maskedAadhaar || aadhaarNumber) : (aadhaarNumber ? formatAadhaarNumber(aadhaarNumber) : undefined);

      (updates as any).panNumber = cleanPan;
      (updates as any).panHolderName = panHolderName || (isPanVerified ? currentUser.name : undefined);
      (updates as any).isPanVerified = isPanVerified;
      (updates as any).panVerifiedAt = isPanVerified ? (currentUser.panVerifiedAt || new Date().toISOString()) : undefined;
      (updates as any).aadhaarNumber = cleanAadhaar;
      (updates as any).isAadhaarVerified = isAadhaarVerified;
      (updates as any).aadhaarVerifiedAt = isAadhaarVerified ? (currentUser.aadhaarVerifiedAt || new Date().toISOString()) : undefined;
      (updates as any).isPhoneVerified = isPhoneVerified;
      (updates as any).phoneVerifiedAt = isPhoneVerified ? (currentUser.phoneVerifiedAt || new Date().toISOString()) : undefined;
      (updates as any).kycStatus = kycStatus;

      updateUserKycApi({
        userId: currentUser.id,
        panNumber: cleanPan,
        panHolderName: panHolderName || currentUser.name,
        aadhaarNumber: cleanAadhaar,
        isPanVerified,
        isAadhaarVerified,
        isPhoneVerified,
      }).catch(() => {});
    }

    if (activeMenu === 'PERSONAL') {
      if (email.trim() !== (currentUser.email || '')) {
        updates.email = email.trim();
      }
      if (address.trim() !== (currentUser.address || '')) {
        updates.address = address.trim();
      }
    }

    if (activeMenu === 'SECURITY' && trimmedPass) {
      updates.password = trimmedPass;
      updates.passwordHash = trimmedPass;
      isPasswordChanged = true;
    }

    if (Object.keys(updates).length > 0) {
      const res = adminUpdateUser(currentUser.id, updates);
      if (res.success && res.user && onUpdateCurrentUser) {
        onUpdateCurrentUser(res.user);
      }
      adminUpdateUserAsync(currentUser.id, updates).then((asyncRes) => {
        if (asyncRes && asyncRes.success && asyncRes.user && onUpdateCurrentUser) {
          onUpdateCurrentUser(asyncRes.user);
        }
      }).catch(() => {});
    }

    if (isPasswordChanged) {
      // Trigger background audio announcement
      audioAnnouncer.announcePasswordChange({
        userName: currentUser.name,
        language: isHi ? 'hi' : 'en',
      });
      setNewPassword('');
      setConfirmPassword('');
      setSuccessMessage(
        isHi
          ? '✅ नया पासवर्ड सफलतापूर्वक बदल दिया गया है और एडमिन पैनल में तुरंत अपडेट हो गया है!'
          : '✅ Password changed successfully and updated in Admin panel instantly!'
      );
    } else if (activeMenu === 'BANK') {
      setSuccessMessage(isHi ? '✅ बैंक विवरण सफलतापूर्वक सुरक्षित हो गया!' : '✅ Bank details saved successfully!');
    } else if (activeMenu === 'KYC') {
      setSuccessMessage(isHi ? '✅ केवाईसी विवरण सफलतापूर्वक सुरक्षित एवं सत्यापित हो गया!' : '✅ KYC details saved & updated successfully!');
    } else if (activeMenu === 'PERSONAL') {
      setSuccessMessage(isHi ? '✅ व्यक्तिगत जानकारी अपडेट हो गई!' : '✅ Personal details updated successfully!');
    } else {
      setSuccessMessage(isHi ? '✅ सेटिंग्स सफलतापूर्वक सुरक्षित हो गई!' : '✅ Settings saved successfully!');
    }

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      setSuccessMessage('');
    }, 4000);
  };

  const handleKycSendPhoneOtp = async () => {
    const rawPhone = currentUser?.phone || '';
    const cleanDigits = rawPhone.replace(/[^0-9]/g, '');
    if (!cleanDigits || cleanDigits.length < 10) {
      setError(isHi ? 'कृपया 10 अंकों का मान्य मोबाइल नंबर जांचें।' : 'Valid 10-digit mobile number required.');
      return;
    }
    setError('');
    setPhoneOtpSending(true);
    try {
      const res = await sendFirebasePhoneOtp(cleanDigits, 'profile-recaptcha-phone-container');
      setPhoneOtpSending(false);
      if (res.success) {
        setIsPhoneOtpSent(true);
        setPhoneResendTimer(30);
        if (res.testOtp) setPhoneTestOtpHint(res.testOtp);
      } else {
        setError(res.error || (isHi ? 'OTP भेजने में त्रुटि हुई।' : 'Error sending phone OTP.'));
      }
    } catch {
      setPhoneOtpSending(false);
      setError(isHi ? 'OTP भेजने में विफल।' : 'Failed to send phone OTP.');
    }
  };

  const handleKycVerifyPhoneOtp = async () => {
    if (!phoneOtp || phoneOtp.trim().length < 4) {
      setError(isHi ? 'कृपया 6-अंकीय मान्य OTP कोड दर्ज करें।' : 'Please enter 6-digit OTP code.');
      return;
    }
    setError('');
    setPhoneOtpVerifying(true);
    try {
      const res = await verifyFirebasePhoneOtp(phoneOtp, phoneTestOtpHint || undefined);
      setPhoneOtpVerifying(false);
      if (res.success) {
        setIsPhoneVerified(true);
        setIsPhoneOtpSent(false);
        setSuccessMessage(isHi ? '✅ मोबाइल नंबर सफलतापूर्वक सत्यापित हुआ!' : '✅ Mobile number verified!');
        setIsSaved(true);
      } else {
        setError(res.error || (isHi ? 'गलत OTP कोड दर्ज किया गया है।' : 'Invalid OTP entered.'));
      }
    } catch {
      setPhoneOtpVerifying(false);
      setError(isHi ? 'OTP सत्यापन विफल रहा।' : 'OTP verification failed.');
    }
  };

  const handleKycVerifyPan = async () => {
    const cleanPan = panNumber.trim().toUpperCase();
    if (!validatePanStructure(cleanPan)) {
      setError(isHi ? 'कृपया 10-अक्षरों का मान्य पैन नंबर दर्ज करें (उदा. ABCDE1234F)' : 'Please enter valid 10-digit PAN (e.g. ABCDE1234F)');
      return;
    }
    setError('');
    setIsPanVerifying(true);
    try {
      const res = await verifyPanCardApi(cleanPan, currentUser?.name);
      setIsPanVerifying(false);
      if (res.success) {
        setIsPanVerified(true);
        setPanHolderName(res.holderName || currentUser?.name || '');
        setSuccessMessage(isHi ? '✅ पैन कार्ड सरकारी रिकॉर्ड (NSDL/ITD) से सत्यापित हुआ!' : '✅ PAN Card verified successfully!');
        setIsSaved(true);
      } else {
        setError(res.error || (isHi ? 'पैन सत्यापन विफल रहा।' : 'PAN verification failed.'));
      }
    } catch {
      setIsPanVerifying(false);
      setError(isHi ? 'पैन सत्यापन में त्रुटि हुई।' : 'Error verifying PAN.');
    }
  };

  const handleKycSendAadhaarOtp = async () => {
    const cleanAadhaar = aadhaarNumber.replace(/[^0-9]/g, '');
    if (cleanAadhaar.length !== 12) {
      setError(isHi ? 'कृपया 12-अंकीय आधार कार्ड नंबर दर्ज करें।' : 'Please enter 12-digit Aadhaar number.');
      return;
    }
    setError('');
    setIsAadhaarOtpSending(true);
    try {
      const res = await sendAadhaarOtpApi(cleanAadhaar);
      setIsAadhaarOtpSending(false);
      if (res.success && res.clientId) {
        setIsAadhaarOtpSent(true);
        setAadhaarClientId(res.clientId);
        if (res.testOtp) setAadhaarTestOtpHint(res.testOtp);
      } else {
        setError(res.error || (isHi ? 'आधार OTP भेजने में त्रुटि हुई।' : 'Error sending Aadhaar OTP.'));
      }
    } catch {
      setIsAadhaarOtpSending(false);
      setError(isHi ? 'आधार OTP भेजने में असमर्थ।' : 'Unable to send Aadhaar OTP.');
    }
  };

  const handleKycVerifyAadhaarOtp = async () => {
    if (!aadhaarOtp || aadhaarOtp.trim().length < 4) {
      setError(isHi ? 'कृपया 6-अंकीय आधार OTP कोड दर्ज करें।' : 'Please enter 6-digit Aadhaar OTP.');
      return;
    }
    setError('');
    setIsAadhaarVerifying(true);
    try {
      const res = await verifyAadhaarOtpApi(aadhaarClientId, aadhaarOtp, aadhaarNumber);
      setIsAadhaarVerifying(false);
      if (res.success) {
        setIsAadhaarVerified(true);
        setIsAadhaarOtpSent(false);
        const masked = res.maskedAadhaar || `XXXX XXXX ${aadhaarNumber.replace(/[^0-9]/g, '').slice(-4)}`;
        setMaskedAadhaar(masked);
        setSuccessMessage(isHi ? '✅ आधार ई-केवाईसी UIDAI रिकॉर्ड से सत्यापित हुआ!' : '✅ Aadhaar e-KYC verified successfully!');
        setIsSaved(true);
      } else {
        setError(res.error || (isHi ? 'आधार OTP सत्यापन विफल रहा।' : 'Aadhaar OTP verification failed.'));
      }
    } catch {
      setIsAadhaarVerifying(false);
      setError(isHi ? 'आधार सत्यापन में त्रुटि हुई।' : 'Aadhaar verification error.');
    }
  };

  const menuItems: { id: ProfileSubMenu; labelHi: string; labelEn: string; icon: any }[] = [
    { id: 'BANK', labelHi: 'बैंक विवरण', labelEn: 'Bank Details', icon: Building2 },
    { id: 'KYC', labelHi: 'केवाईसी सत्यापन', labelEn: 'Identity KYC', icon: Shield },
    { id: 'PERSONAL', labelHi: 'व्यक्तिगत जानकारी', labelEn: 'Personal Info', icon: User },
    { id: 'SECURITY', labelHi: 'पासवर्ड व सुरक्षा', labelEn: 'Security & Password', icon: Key },
    { id: 'LANGUAGE', labelHi: 'भाषा सेटिंग', labelEn: 'App Language', icon: Globe },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center border border-cyan-500/30 shrink-0 font-bold">
              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                {currentUser.name}
              </h3>
              <p className="text-[11px] text-cyan-400 font-mono">
                ID: {currentUser.loginId} • {currentUser.phone}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-Menu Navigation Tabs */}
        <div className="flex items-center gap-1 px-3 py-2 bg-slate-950 border-b border-slate-800 overflow-x-auto scrollbar-none">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveMenu(item.id);
                  setError('');
                  setIsSaved(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{isHi ? item.labelHi : item.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body - Shows ONLY selected detail section */}
        <div className="p-5 overflow-y-auto space-y-4 text-slate-200 text-sm flex-1">
          {isSaved && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl flex items-center gap-2.5 text-emerald-300 text-xs font-medium animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                {successMessage || (isHi ? 'आपका विवरण सफलतापूर्वक अपडेट हो गया है!' : 'Details updated successfully!')}
              </span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl flex items-center gap-2.5 text-rose-300 text-xs font-medium">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSave}>
            {/* 1. BANK DETAILS MENU VIEW */}
            {activeMenu === 'BANK' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="p-4 rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-cyan-500/30 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20">
                    <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-cyan-400" />
                      <span>{isHi ? '🏦 बैंक खाता व UPI विवरण (Bank & UPI Details)' : '🏦 Bank Account & UPI Payout Info'}</span>
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold">
                      {isHi ? 'विथड्रॉल हेतु' : 'For Payouts'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Account Holder Name */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        {isHi ? 'खाताधारक का नाम (Account Holder Name):' : 'Bank Account Holder Name:'}
                      </label>
                      <input
                        type="text"
                        value={accountHolder}
                        onChange={(e) => setAccountHolder(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-cyan-400 focus:outline-none font-semibold"
                        placeholder="e.g. Ramesh Kumar"
                      />
                    </div>

                    {/* Bank Name */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        {isHi ? 'बैंक का नाम (Bank Name):' : 'Bank Name:'}
                      </label>
                      <input
                        type="text"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-cyan-400 focus:outline-none"
                        placeholder="e.g. Axis Bank, HDFC, SBI"
                      />
                    </div>

                    {/* Account Number */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        {isHi ? 'बैंक खाता संख्या (Account Number):' : 'Account Number:'}
                      </label>
                      <input
                        type="text"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-cyan-400 focus:outline-none"
                        placeholder="e.g. 924010008662307"
                      />
                    </div>

                    {/* IFSC Code */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        {isHi ? 'आईएफएससी कोड (IFSC Code):' : 'IFSC Code:'}
                      </label>
                      <input
                        type="text"
                        value={ifscCode}
                        onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-amber-300 font-mono text-xs uppercase focus:border-cyan-400 focus:outline-none"
                        placeholder="e.g. UTIB0001219"
                      />
                    </div>

                    {/* UPI ID */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        {isHi ? 'यूपीआई आईडी (UPI ID):' : 'UPI ID (Virtual Address):'}
                      </label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-emerald-400 font-mono text-xs focus:border-cyan-400 focus:outline-none"
                        placeholder="e.g. 9876543210@paytm"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-cyan-600/30 transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    {isHi ? 'बैंक विवरण सुरक्षित करें' : 'Save Bank Details'}
                  </button>
                </div>
              </div>
            )}

            {/* 2. KYC IDENTITY & E-KYC VIEW */}
            {activeMenu === 'KYC' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                {/* Top KYC Status Overview Card */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-emerald-500/30 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                          {isHi ? 'सरकारी पहचान एवं ई-केवाईसी सत्यापन (Govt KYC)' : 'Govt Identity & e-KYC Verification'}
                        </h4>
                        <p className="text-[10px] text-slate-400">
                          {isHi ? 'आधार, पैन एवं मोबाइल OTP आधारित 100% सुरक्षित फिनटेक पहचान' : '100% Safe Fintech Identity & Compliance'}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isPanVerified && isAadhaarVerified
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                        : isPanVerified || isAadhaarVerified
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}>
                      {isPanVerified && isAadhaarVerified
                        ? (isHi ? '✓ पूर्ण सत्यापित' : '✓ Fully Verified')
                        : isPanVerified || isAadhaarVerified
                        ? (isHi ? '⚠️ आंशिक' : '⚠️ Partial KYC')
                        : (isHi ? 'सत्यापन बाकी' : 'Pending KYC')}
                    </span>
                  </div>

                  {/* 3 Verification Status Badges */}
                  <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                    <div className={`p-2 rounded-xl border text-[11px] ${
                      isPhoneVerified
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 font-bold'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400'
                    }`}>
                      <div className="text-[10px] uppercase font-mono">1. Mobile OTP</div>
                      <div className="text-xs mt-0.5">{isPhoneVerified ? '✓ सत्यापित' : 'बाकी'}</div>
                    </div>
                    <div className={`p-2 rounded-xl border text-[11px] ${
                      isPanVerified
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 font-bold'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400'
                    }`}>
                      <div className="text-[10px] uppercase font-mono">2. PAN Card</div>
                      <div className="text-xs mt-0.5">{isPanVerified ? '✓ सत्यापित' : 'बाकी'}</div>
                    </div>
                    <div className={`p-2 rounded-xl border text-[11px] ${
                      isAadhaarVerified
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 font-bold'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400'
                    }`}>
                      <div className="text-[10px] uppercase font-mono">3. Aadhaar eKYC</div>
                      <div className="text-xs mt-0.5">{isAadhaarVerified ? '✓ सत्यापित' : 'बाकी'}</div>
                    </div>
                  </div>
                </div>

                {/* Card 1: Mobile Phone Verification via Firebase */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-white">
                        {isHi ? '1. मोबाइल नंबर सत्यापन (Firebase Phone Auth)' : '1. Mobile Verification (Firebase Phone Auth)'}
                      </span>
                    </div>
                    {isPhoneVerified ? (
                      <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                        <BadgeCheck className="w-3.5 h-3.5" />
                        {isHi ? 'सत्यापित' : 'Verified'}
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-400 font-medium">
                        {isHi ? 'SMS OTP बाकी' : 'OTP Pending'}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-2.5 text-xs font-mono font-bold text-slate-400 select-none">
                        +91
                      </span>
                      <input
                        type="text"
                        readOnly
                        value={currentUser.phone ? currentUser.phone.replace(/[^0-9]/g, '').slice(-10) : ''}
                        className={`w-full pl-11 pr-3 py-2 bg-slate-900 border rounded-xl font-mono text-xs text-white focus:outline-none ${
                          isPhoneVerified ? 'border-emerald-500/50 bg-emerald-950/20 text-emerald-300 font-bold' : 'border-slate-700'
                        }`}
                      />
                    </div>

                    {!isPhoneVerified && (
                      <button
                        type="button"
                        onClick={handleKycSendPhoneOtp}
                        disabled={phoneOtpSending || phoneResendTimer > 0}
                        className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md shrink-0 active:scale-95"
                      >
                        {phoneOtpSending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        <span>
                          {phoneResendTimer > 0 ? `${phoneResendTimer}s` : isPhoneOtpSent ? (isHi ? 'दोबारा भेजें' : 'Resend') : (isHi ? 'OTP भेजें' : 'Send OTP')}
                        </span>
                      </button>
                    )}
                  </div>

                  {/* Phone OTP Input Box */}
                  {isPhoneOtpSent && !isPhoneVerified && (
                    <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-2 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                          <KeyRound className="w-3.5 h-3.5" />
                          {isHi ? 'मोबाइल पर आया 6-अंकीय OTP कोड डालें:' : 'Enter 6-digit SMS OTP:'}
                        </span>
                        {phoneTestOtpHint && (
                          <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                            टेस्ट OTP: {phoneTestOtpHint}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={phoneOtp}
                          onChange={(e) => setPhoneOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                          placeholder="••••••"
                          className="flex-1 px-3 py-1.5 bg-slate-950 border border-emerald-500/50 rounded-xl text-white text-center font-mono font-bold tracking-widest text-base focus:outline-none focus:border-emerald-400"
                        />
                        <button
                          type="button"
                          onClick={handleKycVerifyPhoneOtp}
                          disabled={phoneOtpVerifying || phoneOtp.length < 4}
                          className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md shrink-0 active:scale-95"
                        >
                          {phoneOtpVerifying ? (isHi ? 'जांच जारी...' : 'Verifying...') : (isHi ? 'वेरिफाई करें' : 'Verify')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card 2: PAN Card Verification */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold text-white">
                        {isHi ? '2. पैन कार्ड सत्यापन (PAN Card - 10 अक्षर)' : '2. PAN Card Verification'}
                      </span>
                    </div>
                    {isPanVerified ? (
                      <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                        <BadgeCheck className="w-3.5 h-3.5" />
                        {isHi ? 'NSDL सत्यापित' : 'NSDL Verified'}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">
                        {isHi ? 'ITD/NSDL रिकॉर्ड' : 'ITD/NSDL Record'}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={10}
                      disabled={isPanVerified}
                      value={panNumber}
                      onChange={(e) => {
                        setPanNumber(e.target.value.toUpperCase().slice(0, 10));
                        setIsPanVerified(false);
                      }}
                      placeholder="ABCDE1234F"
                      className={`flex-1 px-3 py-2 bg-slate-900 border rounded-xl font-mono text-xs uppercase tracking-wider focus:outline-none ${
                        isPanVerified ? 'border-emerald-500/50 bg-emerald-950/20 text-emerald-300 font-bold' : 'border-slate-700 text-white focus:border-amber-400'
                      }`}
                    />
                    {!isPanVerified && (
                      <button
                        type="button"
                        onClick={handleKycVerifyPan}
                        disabled={isPanVerifying || panNumber.trim().length !== 10}
                        className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 hover:text-white font-bold text-xs rounded-xl border border-slate-700 transition-all cursor-pointer shrink-0 active:scale-95"
                      >
                        {isPanVerifying ? (isHi ? 'जांच जारी...' : 'Checking...') : (isHi ? 'पैन जांचें' : 'Verify PAN')}
                      </button>
                    )}
                  </div>

                  {isPanVerified && panHolderName && (
                    <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>{isHi ? `पैन धारक: ${panHolderName}` : `Holder: ${panHolderName}`}</span>
                    </p>
                  )}
                </div>

                {/* Card 3: Aadhaar Card (UIDAI e-KYC) */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-bold text-white">
                        {isHi ? '3. आधार कार्ड ई-केवाईसी (Aadhaar 12-अंक)' : '3. Aadhaar Card e-KYC (12 Digits)'}
                      </span>
                    </div>
                    {isAadhaarVerified ? (
                      <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                        <BadgeCheck className="w-3.5 h-3.5" />
                        {isHi ? 'UIDAI सत्यापित' : 'UIDAI Verified'}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">
                        {isHi ? 'UIDAI OTP सत्यापन' : 'UIDAI OTP Verify'}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={14}
                      disabled={isAadhaarVerified}
                      value={aadhaarNumber}
                      onChange={(e) => {
                        const formatted = formatAadhaarNumber(e.target.value);
                        setAadhaarNumber(formatted);
                        setIsAadhaarVerified(false);
                        setIsAadhaarOtpSent(false);
                      }}
                      placeholder="XXXX XXXX XXXX"
                      className={`flex-1 px-3 py-2 bg-slate-900 border rounded-xl font-mono text-xs tracking-wider focus:outline-none ${
                        isAadhaarVerified ? 'border-emerald-500/50 bg-emerald-950/20 text-emerald-300 font-bold' : 'border-slate-700 text-white focus:border-blue-400'
                      }`}
                    />
                    {!isAadhaarVerified && (
                      <button
                        type="button"
                        onClick={handleKycSendAadhaarOtp}
                        disabled={isAadhaarOtpSending || aadhaarNumber.replace(/[^0-9]/g, '').length !== 12}
                        className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 hover:text-white font-bold text-xs rounded-xl border border-slate-700 transition-all cursor-pointer shrink-0 active:scale-95"
                      >
                        {isAadhaarOtpSending ? (isHi ? 'भेजा जा रहा...' : 'Sending...') : (isHi ? 'OTP भेजें' : 'Send OTP')}
                      </button>
                    )}
                  </div>

                  {/* Aadhaar OTP Input Box */}
                  {isAadhaarOtpSent && !isAadhaarVerified && (
                    <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/40 space-y-2 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-blue-300">
                          {isHi ? 'आधार e-KYC OTP (6-अंक) दर्ज करें:' : 'Enter 6-digit Aadhaar OTP:'}
                        </span>
                        {aadhaarTestOtpHint && (
                          <span className="text-[10px] text-blue-300 font-mono bg-blue-500/20 px-2 py-0.5 rounded border border-blue-500/30">
                            टेस्ट OTP: {aadhaarTestOtpHint}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          value={aadhaarOtp}
                          onChange={(e) => setAadhaarOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                          placeholder="••••••"
                          className="flex-1 px-3 py-1.5 bg-slate-950 border border-blue-500/50 rounded-xl text-white text-center font-mono font-bold tracking-widest text-sm focus:outline-none focus:border-blue-400"
                        />
                        <button
                          type="button"
                          onClick={handleKycVerifyAadhaarOtp}
                          disabled={isAadhaarVerifying || aadhaarOtp.length < 4}
                          className="px-3.5 py-1.5 bg-blue-500 hover:bg-blue-400 disabled:opacity-40 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer shrink-0 active:scale-95"
                        >
                          {isAadhaarVerifying ? (isHi ? 'जांच जारी...' : 'Verifying...') : (isHi ? 'वेरिफाई' : 'Verify')}
                        </button>
                      </div>
                    </div>
                  )}

                  {isAadhaarVerified && (
                    <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>{isHi ? `आधार ई-केवाईसी सत्यापित: ${maskedAadhaar}` : `Aadhaar Verified: ${maskedAadhaar}`}</span>
                    </p>
                  )}
                </div>

                {/* Invisible Recaptcha Container for Profile */}
                <div
                  id="profile-recaptcha-phone-container"
                  style={{ position: 'fixed', bottom: 0, right: 0, width: 1, height: 1, opacity: 0, pointerEvents: 'none', zIndex: -1 }}
                />

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    {isHi ? 'केवाईसी विवरण सुरक्षित करें' : 'Save & Update KYC'}
                  </button>
                </div>
              </div>
            )}

            {/* 3. PERSONAL INFO MENU VIEW */}
            {activeMenu === 'PERSONAL' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                {/* Security Banner regarding locked fields */}
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2.5">
                  <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-200/90 leading-relaxed">
                    <strong className="text-amber-300 block mb-0.5">
                      {isHi ? '🔒 सुरक्षा सूचना (Locked Profile Fields):' : '🔒 Account Security Notice:'}
                    </strong>
                    {isHi
                      ? 'खाता सुरक्षा कारणों से नाम, मोबाइल नंबर और यूज़र आईडी केवल एडमिन बदल सकते हैं। आप ईमेल व पता नीचे बदल सकते हैं।'
                      : 'Full Name, Mobile Number, and Login ID are locked by System Admin. You can manage your email & address below.'}
                  </div>
                </div>

                {/* LOCKED FIELDS */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-800">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isHi ? 'सिस्टम द्वारा सुरक्षित खाता आईडी (Non-Editable)' : 'Locked Account Identifier Details'}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Full Name - LOCKED */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center justify-between">
                        <span>{isHi ? 'पूरा नाम:' : 'Full Name:'}</span>
                        <Lock className="w-3 h-3 text-amber-400" />
                      </label>
                      <input
                        type="text"
                        value={currentUser.name}
                        disabled
                        readOnly
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-400 text-xs font-medium cursor-not-allowed"
                      />
                    </div>

                    {/* Mobile Phone - LOCKED */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center justify-between">
                        <span>{isHi ? 'मोबाइल नंबर:' : 'Mobile Number:'}</span>
                        <Lock className="w-3 h-3 text-amber-400" />
                      </label>
                      <input
                        type="text"
                        value={currentUser.phone}
                        disabled
                        readOnly
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-400 text-xs font-mono cursor-not-allowed"
                      />
                    </div>

                    {/* User ID - LOCKED */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center justify-between">
                        <span>{isHi ? 'यूज़र आईडी:' : 'User Login ID:'}</span>
                        <Lock className="w-3 h-3 text-amber-400" />
                      </label>
                      <input
                        type="text"
                        value={currentUser.loginId}
                        disabled
                        readOnly
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-emerald-400 text-xs font-bold font-mono cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                {/* EDITABLE PERSONAL DETAILS */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-800">
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{isHi ? 'व्यक्तिगत जानकारी (Personal Info)' : 'Personal Information'}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Email */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        {isHi ? 'ईमेल पता (Email Address):' : 'Email Address:'}
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-cyan-400 focus:outline-none"
                        placeholder="user@example.com"
                      />
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        {isHi ? 'पूरा पता व शहर (Address):' : 'Address & Location:'}
                      </label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-cyan-400 focus:outline-none"
                        placeholder="e.g. City, State"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-cyan-600/30 transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    {isHi ? 'जानकारी सुरक्षित करें' : 'Save Personal Info'}
                  </button>
                </div>
              </div>
            )}

            {/* 3. SECURITY & PASSWORD MENU VIEW */}
            {activeMenu === 'SECURITY' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-amber-500/30 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-amber-500/20">
                    <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Key className="w-4 h-4 text-amber-400" />
                      <span>{isHi ? '🔐 नया पासवर्ड बदलें (Change Password)' : '🔐 Change Account Password'}</span>
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 font-mono">
                      SECURITY
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* New Password */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        {isHi ? 'नया पासवर्ड (New Password):' : 'New Password:'}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="text"
                          style={!showPassword ? { WebkitTextSecurity: 'disc' } as React.CSSProperties : undefined}
                          autoComplete="one-time-code"
                          data-lpignore="true"
                          data-1p-ignore="true"
                          data-form-type="other"
                          autoCorrect="off"
                          autoCapitalize="none"
                          spellCheck={false}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 pr-9 text-white text-xs focus:border-amber-400 focus:outline-none font-mono"
                          placeholder={isHi ? 'नया पासवर्ड दर्ज करें' : 'Enter new password'}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        {isHi ? 'पासवर्ड की पुष्टि (Confirm Password):' : 'Confirm Password:'}
                      </label>
                      <input
                        type="text"
                        inputMode="text"
                        style={!showPassword ? { WebkitTextSecurity: 'disc' } as React.CSSProperties : undefined}
                        autoComplete="one-time-code"
                        data-lpignore="true"
                        data-1p-ignore="true"
                        data-form-type="other"
                        autoCorrect="off"
                        autoCapitalize="none"
                        spellCheck={false}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-amber-400 focus:outline-none font-mono"
                        placeholder={isHi ? 'पुनः नया पासवर्ड दर्ज करें' : 'Re-enter new password'}
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {isHi
                      ? 'सुरक्षा हेतु मजबूत पासवर्ड दर्ज करें (कम से कम 4 अक्षर)।'
                      : 'Choose a strong password (at least 4 characters).'}
                  </p>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-amber-600/30 transition-all cursor-pointer"
                  >
                    <Key className="w-4 h-4" />
                    {isHi ? 'नया पासवर्ड अपडेट करें' : 'Update Password'}
                  </button>
                </div>
              </div>
            )}

            {/* 4. LANGUAGE SETTINGS MENU VIEW */}
            {activeMenu === 'LANGUAGE' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 uppercase tracking-wider pb-2 border-b border-slate-800">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    <span>{isHi ? '🌐 ऐप भाषा चुनें (App Language Preference)' : '🌐 Select App Display Language'}</span>
                  </div>

                  <p className="text-xs text-slate-300">
                    {isHi
                      ? 'GCap ऐप की भाषा तुरंत बदलें। आपका चयन पूरे ऐप में लागू रहेगा:'
                      : 'Switch GCap app language instantly across all screens:'}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {/* HINDI OPTION */}
                    <button
                      type="button"
                      onClick={() => {
                        if (onLanguageChange) onLanguageChange('hi');
                      }}
                      className={`p-4 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                        language === 'hi'
                          ? 'bg-amber-500/15 border-amber-500/50 text-amber-200 ring-2 ring-amber-500/30 shadow-md'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🇮🇳</span>
                        <div className="text-left">
                          <h5 className="font-bold text-sm text-white">हिंदी (Hindi)</h5>
                          <p className="text-[11px] text-slate-400">भारतीय भाषा इंटरफ़ेस</p>
                        </div>
                      </div>
                      {language === 'hi' && <CheckCircle2 className="w-5 h-5 text-amber-400" />}
                    </button>

                    {/* ENGLISH OPTION */}
                    <button
                      type="button"
                      onClick={() => {
                        if (onLanguageChange) onLanguageChange('en');
                      }}
                      className={`p-4 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                        language === 'en'
                          ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-200 ring-2 ring-cyan-500/30 shadow-md'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🇬🇧</span>
                        <div className="text-left">
                          <h5 className="font-bold text-sm text-white">English</h5>
                          <p className="text-[11px] text-slate-400">Standard English Interface</p>
                        </div>
                      </div>
                      {language === 'en' && <CheckCircle2 className="w-5 h-5 text-cyan-400" />}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            {isHi ? 'सुरक्षित 256-बिट एन्क्रिप्टेड प्रोफाइल' : '256-Bit Encrypted Secure Profile'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
          >
            {isHi ? 'बंद करें' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

