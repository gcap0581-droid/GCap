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
} from 'lucide-react';
import { Language, UserProfile, BankAccountDetails } from '../types';
import { getStoredBankDetails, setStoredBankDetails } from '../utils/storage';
import { adminUpdateUser, adminUpdateUserAsync } from '../utils/authStorage';
import { apiSaveBankDetails } from '../utils/centralSync';
import { audioAnnouncer } from '../utils/audioAnnouncer';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  language: Language;
  onLanguageChange?: (lang: Language) => void;
  onUpdateCurrentUser?: (updated: UserProfile) => void;
}

type ProfileSubMenu = 'BANK' | 'PERSONAL' | 'SECURITY' | 'LANGUAGE';

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

  const [isSaved, setIsSaved] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser) {
      setEmail(currentUser.email || '');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      setSuccessMessage('');
      // Load saved bank details
      const stored = getStoredBankDetails(currentUser.id);
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

    if (activeMenu === 'BANK') {
      setStoredBankDetails(currentUser.id, bankDetails);
      apiSaveBankDetails(currentUser.id, bankDetails).catch(() => {});
    }

    // Save user email & password
    const updates: { email?: string; password?: string } = {};
    let isPasswordChanged = false;

    if (email.trim() !== currentUser.email && activeMenu === 'PERSONAL') {
      updates.email = email.trim();
    }
    if (trimmedPass && activeMenu === 'SECURITY') {
      updates.password = trimmedPass;
      isPasswordChanged = true;
    }

    if (Object.keys(updates).length > 0) {
      const res = adminUpdateUser(currentUser.id, updates);
      if (res.success && res.user && onUpdateCurrentUser) {
        onUpdateCurrentUser(res.user);
      }
      adminUpdateUserAsync(currentUser.id, updates).catch(() => {});
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

  const menuItems: { id: ProfileSubMenu; labelHi: string; labelEn: string; icon: any }[] = [
    { id: 'BANK', labelHi: 'बैंक विवरण', labelEn: 'Bank Details', icon: Building2 },
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

            {/* 2. PERSONAL INFO MENU VIEW */}
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
                          type={showPassword ? 'text' : 'password'}
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
                        type={showPassword ? 'text' : 'password'}
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

