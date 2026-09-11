import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Lock,
  Building2,
  Smartphone,
  CreditCard,
  Mail,
  MapPin,
  CheckCircle2,
  Shield,
  Save,
  AlertCircle,
  Key,
  Eye,
  EyeOff,
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
  onUpdateCurrentUser?: (updated: UserProfile) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  language,
  onUpdateCurrentUser,
}) => {
  const isHi = language === 'hi';

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
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser) {
      setEmail(currentUser.email || '');
      setNewPassword('');
      setConfirmPassword('');
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

    // If new password is provided, validate
    const trimmedPass = newPassword.trim();
    if (trimmedPass) {
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

    setStoredBankDetails(currentUser.id, bankDetails);
    apiSaveBankDetails(currentUser.id, bankDetails).catch(() => {});

    // Save user email & password
    const updates: { email?: string; password?: string } = {};
    let isPasswordChanged = false;

    if (email.trim() !== currentUser.email) {
      updates.email = email.trim();
    }
    if (trimmedPass) {
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
    }

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center border border-cyan-500/30 shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {isHi ? '👤 मेरी प्रोफ़ाइल एवं बैंक विवरण' : '👤 My Profile & Account Details'}
              </h3>
              <p className="text-xs text-slate-400">
                {isHi ? 'बैंक खाता, पासवर्ड एवं निजी जानकारी दर्ज करें' : 'Manage password, bank account & payout info'}
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-200 text-sm flex-1">
          {isSaved && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl flex items-center gap-2.5 text-emerald-300 text-xs font-medium animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              {isHi
                ? 'आपका विवरण और पासवर्ड सफलतापूर्वक सुरक्षित हो गए हैं!'
                : 'Profile details & password saved successfully!'}
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl flex items-center gap-2.5 text-rose-300 text-xs font-medium">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              {error}
            </div>
          )}

          {/* Security Banner regarding locked fields */}
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3">
            <Shield className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-200/90 leading-relaxed">
              <strong className="text-amber-300 block mb-0.5">
                {isHi ? '🔒 सुरक्षा सूचना (Locked Profile Fields):' : '🔒 Account Security Notice:'}
              </strong>
              {isHi
                ? 'खाता सुरक्षा कारणों से आपका नाम, पंजीकृत मोबाइल नंबर और यूज़र आईडी केवल एडमिन द्वारा ही बदले जा सकते हैं। आप अपना ईमेल, पता, बैंक डिटेल्स और पासवर्ड नीचे स्वयं बदल सकते हैं।'
                : 'For security reasons, your Full Name, Mobile Number, and User ID are locked by System Admin. You can manage your email, Bank Details, and Password below.'}
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            {/* LOCKED FIELDS SECTION */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-800">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>{isHi ? 'प्रशासन द्वारा लॉक की गई जानकारी (Non-Editable)' : 'Locked Account Identifier Details'}</span>
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
                    <span>{isHi ? 'यूज़र आईडी (Login ID):' : 'User Login ID:'}</span>
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
                <span>{isHi ? 'व्यक्तिगत विवरण (Personal Info)' : 'Personal Information'}</span>
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
                    {isHi ? 'पूरा पता व शहर (Residential Address):' : 'Address & Location:'}
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

            {/* PASSWORD CHANGE SECTION */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-amber-500/20">
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-amber-400" />
                  <span>{isHi ? '🔐 पासवर्ड बदलें (Change Password)' : '🔐 Change Account Password'}</span>
                </h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 font-mono">
                  {isHi ? 'वैकल्पिक' : 'Optional'}
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
                    {isHi ? 'पासवर्ड की पुष्टि (Confirm Password):' : 'Confirm New Password:'}
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-amber-400 focus:outline-none font-mono"
                    placeholder={isHi ? 'पुनः पासवर्ड दर्ज करें' : 'Re-enter password'}
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                {isHi
                  ? 'यदि आप पासवर्ड बदलना नहीं चाहते हैं तो इसे खाली छोड़ दें।'
                  : 'Leave blank if you do not wish to change your password.'}
              </p>
            </div>

            {/* EDITABLE BANK ACCOUNT DETAILS */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-cyan-500/30 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20">
                <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-cyan-400" />
                  <span>{isHi ? 'बैंक खाता व UPI भुगतान विवरण (Bank & UPI Details)' : 'Bank Account & UPI Payout Info'}</span>
                </h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                  SELF-ENTRY
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
                    placeholder="e.g. HDFC Bank, SBI, ICICI"
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
                    placeholder="e.g. 50100239481029"
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
                    placeholder="e.g. HDFC0001234"
                  />
                </div>

                {/* UPI ID */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isHi ? 'यूपीआई आईडी (UPI ID):' : 'UPI ID (Virtual Payment Address):'}
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-emerald-400 font-mono text-xs focus:border-cyan-400 focus:outline-none"
                    placeholder="e.g. 9876543210@paytm / user@okhdfc"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                {isHi ? 'रद्द करें' : 'Cancel'}
              </button>

              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-cyan-600/30 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                {isHi ? 'विवरण सुरक्षित करें (Save Details)' : 'Save Account Details'}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            {isHi ? 'विवरण विथड्रॉल के समय स्वतः भर जाएगा' : 'Details auto-populate during withdrawals'}
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
