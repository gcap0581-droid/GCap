import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Check,
  AlertCircle,
  Shield,
  Key,
  Calendar,
  Wallet as WalletIcon,
  PlusCircle,
  MinusCircle,
  DollarSign,
  Building2,
  TrendingUp,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRightLeft,
  Share2,
  ShieldCheck,
} from 'lucide-react';
import { Language, UserProfile, UserRole, Wallet, BankAccountDetails, StaffPermissions } from '../../types';

export interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null; // null if adding new user
  wallet?: Wallet;
  bankDetails?: BankAccountDetails | null;
  initialTab?: 'PROFILE' | 'WALLET' | 'BANK' | 'INVESTMENT';
  onSave: (data: {
    userId?: string;
    name: string;
    loginId?: string;
    phone: string;
    email: string;
    password?: string;
    role: UserRole;
    status: 'ACTIVE' | 'BLOCKED';
    joinedDate?: string;
    referralCode?: string;
    referredBy?: string;
    bankDetails?: BankAccountDetails;
    walletUpdates?: Partial<Wallet>;
    walletAdjustment?: {
      type: 'ADD' | 'DEDUCT' | 'SET';
      targetWallet: 'cashBalance' | 'gpBalance' | 'totalEarned' | 'royaltyEarned';
      amount: number;
      reason?: string;
    };
    isPasswordChanged?: boolean;
    backdatedPlanId?: string;
    backdatedAmount?: number;
    backdatedWithdrawal?: number;
    permissions?: StaffPermissions;
  }) => Promise<void> | void;
  language: Language;
}

export const UserEditModal: React.FC<UserEditModalProps> = ({
  isOpen,
  onClose,
  user,
  wallet,
  bankDetails,
  initialTab = 'PROFILE',
  onSave,
  language,
}) => {
  const isHi = language === 'hi';
  const isEditing = !!user;

  const [activeTab, setActiveTab] = useState<'PROFILE' | 'WALLET' | 'BANK' | 'INVESTMENT'>(initialTab);

  // Profile Fields
  const [name, setName] = useState('');
  const [loginId, setLoginId] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordDirty, setIsPasswordDirty] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>('USER');
  const [status, setStatus] = useState<'ACTIVE' | 'BLOCKED'>('ACTIVE');
  const [joinedDate, setJoinedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [referralCode, setReferralCode] = useState('');
  const [referredBy, setReferredBy] = useState('');

  // Staff Permission Toggles
  const [permManageUsers, setPermManageUsers] = useState<boolean>(false);
  const [permManageWallet, setPermManageWallet] = useState<boolean>(false);
  const [permManageTransactions, setPermManageTransactions] = useState<boolean>(false);
  const [permManageSchemes, setPermManageSchemes] = useState<boolean>(false);
  const [permManageTreasury, setPermManageTreasury] = useState<boolean>(false);
  const [permManageBroadcast, setPermManageBroadcast] = useState<boolean>(false);

  // Wallet Management Fields
  const [cashBalance, setCashBalance] = useState<number | string>(0);
  const [gpBalance, setGpBalance] = useState<number | string>(0);
  const [totalEarned, setTotalEarned] = useState<number | string>(0);
  const [royaltyEarned, setRoyaltyEarned] = useState<number | string>(0);

  // Quick Adjustment Fields
  const [adjType, setAdjType] = useState<'ADD' | 'DEDUCT' | 'SET'>('ADD');
  const [adjTarget, setAdjTarget] = useState<'cashBalance' | 'gpBalance' | 'totalEarned' | 'royaltyEarned'>('cashBalance');
  const [adjAmount, setAdjAmount] = useState<string>('');
  const [adjReason, setAdjReason] = useState<string>('');

  // Bank & UPI Details Fields
  const [accountHolder, setAccountHolder] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [bankName, setBankName] = useState('');
  const [upiId, setUpiId] = useState('');

  // Backdated Investment Fields
  const [backdatedPlanId, setBackdatedPlanId] = useState('');
  const [backdatedAmount, setBackdatedAmount] = useState<number | string>(0);
  const [backdatedWithdrawal, setBackdatedWithdrawal] = useState<number | string>(0);

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      if (user) {
        setName(user.name || '');
        setLoginId(user.loginId || '');
        setPhone(user.phone || '');
        
        // Clean email to remove any spaces or invalid characters from generated phone emails
        const rawEmail = user.email || '';
        let cleanEmailStr = rawEmail.trim().replace(/\s+/g, '');
        if (cleanEmailStr.includes('@gcap.user')) {
          const parts = cleanEmailStr.split('@gcap.user');
          const digits = parts[0].replace(/[^0-9]/g, '').slice(-10);
          cleanEmailStr = `${digits || 'user'}@gcap.user`;
        }
        setEmail(cleanEmailStr);
        
        setIsPasswordDirty(false);
        setPassword(user.password || '');
        setRole(user.role || 'USER');
        setStatus(user.status || 'ACTIVE');
        setJoinedDate(user.joinedDate || new Date().toISOString().split('T')[0]);
        setReferralCode(user.referralCode || '');
        setReferredBy(user.referredBy || '');

        setCashBalance(wallet?.cashBalance || 0);
        setGpBalance(wallet?.gpBalance || 0);
        setTotalEarned(wallet?.totalEarned || 0);
        setRoyaltyEarned(wallet?.royaltyEarned || 0);

        setPermManageUsers(user.permissions?.manageUsers ?? false);
        setPermManageWallet(user.permissions?.manageWallet ?? false);
        setPermManageTransactions(user.permissions?.manageTransactions ?? false);
        setPermManageSchemes(user.permissions?.manageSchemes ?? false);
        setPermManageTreasury(user.permissions?.manageTreasury ?? false);
        setPermManageBroadcast(user.permissions?.manageBroadcast ?? false);

        setAccountHolder(bankDetails?.accountHolder || user.name || '');
        setAccountNumber(bankDetails?.accountNumber || '');
        setIfscCode(bankDetails?.ifscCode || '');
        setBankName(bankDetails?.bankName || '');
        setUpiId(bankDetails?.upiId || '');

        setAdjAmount('');
        setAdjReason('');
        setBackdatedPlanId('');
        setBackdatedAmount(0);
        setBackdatedWithdrawal(0);
      } else {
        setName('');
        setLoginId('');
        setPhone('+91 ');
        setEmail('');
        setPassword('demo123');
        setRole('USER');
        setStatus('ACTIVE');
        setJoinedDate(new Date().toISOString().split('T')[0]);
        setReferralCode('');
        setReferredBy('');

        setCashBalance(0);
        setGpBalance(0);
        setTotalEarned(0);
        setRoyaltyEarned(0);

        setPermManageUsers(false);
        setPermManageWallet(false);
        setPermManageTransactions(false);
        setPermManageSchemes(false);
        setPermManageTreasury(false);
        setPermManageBroadcast(false);

        setAccountHolder('');
        setAccountNumber('');
        setIfscCode('');
        setBankName('');
        setUpiId('');

        setAdjAmount('');
        setAdjReason('');
        setBackdatedPlanId('');
        setBackdatedAmount(0);
        setBackdatedWithdrawal(0);
      }
      setError('');
      setIsSubmitting(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, user?.id]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name.length < 2) {
      setError(isHi ? 'कृपया मान्य पूरा नाम दर्ज करें।' : 'Valid full name is required.');
      return;
    }
    if (!phone.trim()) {
      setError(isHi ? 'कृपया मोबाइल नंबर दर्ज करें।' : 'Phone number is required.');
      return;
    }
    if (!isEditing && (!password || password.length < 4)) {
      setError(isHi ? 'पासवर्ड कम से कम 4 अक्षरों का होना चाहिए।' : 'Password must be at least 4 characters.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const safeAdjAmount = adjAmount.replace(/\s+/g, '').replace(/[−–—]/g, '-');
      const parsedAdjAmount = parseFloat(safeAdjAmount);
      const hasAdjustment = !isNaN(parsedAdjAmount) && parsedAdjAmount > 0;

      let finalCash = cashBalance;
      let finalGp = gpBalance;
      let finalTotalEarned = totalEarned;
      let finalRoyalty = royaltyEarned;

      // If user typed in adjustment box without pressing 'Apply' beforehand, calculate final value
      if (hasAdjustment) {
        if (adjTarget === 'cashBalance') {
          if (adjType === 'ADD') finalCash = Number(cashBalance) + parsedAdjAmount;
          else if (adjType === 'DEDUCT') finalCash = Math.max(0, Number(cashBalance) - parsedAdjAmount);
          else if (adjType === 'SET') finalCash = Math.max(0, parsedAdjAmount);
        } else if (adjTarget === 'gpBalance') {
          if (adjType === 'ADD') finalGp = Number(gpBalance) + parsedAdjAmount;
          else if (adjType === 'DEDUCT') finalGp = Math.max(0, Number(gpBalance) - parsedAdjAmount);
          else if (adjType === 'SET') finalGp = Math.max(0, parsedAdjAmount);
        } else if (adjTarget === 'totalEarned') {
          if (adjType === 'ADD') finalTotalEarned = Number(totalEarned) + parsedAdjAmount;
          else if (adjType === 'DEDUCT') finalTotalEarned = Math.max(0, Number(totalEarned) - parsedAdjAmount);
          else if (adjType === 'SET') finalTotalEarned = Math.max(0, parsedAdjAmount);
        } else if (adjTarget === 'royaltyEarned') {
          if (adjType === 'ADD') finalRoyalty = Number(royaltyEarned) + parsedAdjAmount;
          else if (adjType === 'DEDUCT') finalRoyalty = Math.max(0, Number(royaltyEarned) - parsedAdjAmount);
          else if (adjType === 'SET') finalRoyalty = Math.max(0, parsedAdjAmount);
        }
      }

      const walletUpdates: any = {};
      if (finalCash !== (wallet?.cashBalance || 0)) walletUpdates.cashBalance = finalCash;
      if (finalGp !== (wallet?.gpBalance || 0)) walletUpdates.gpBalance = finalGp;
      if (finalTotalEarned !== (wallet?.totalEarned || 0)) walletUpdates.totalEarned = finalTotalEarned;
      if (finalRoyalty !== (wallet?.royaltyEarned || 0)) walletUpdates.royaltyEarned = finalRoyalty;

      // Ensure walletAdjustment accurately reflects whether via Quick Tool or direct input
      let resolvedAdjustment: any = undefined;
      if (hasAdjustment) {
        resolvedAdjustment = {
          type: adjType,
          targetWallet: adjTarget,
          amount: parsedAdjAmount,
          reason: adjReason.trim() || (isHi ? 'एडमिन द्वारा मैनुअल समायोजन' : 'Admin manual balance adjustment'),
        };
      } else if (walletUpdates.cashBalance !== undefined) {
        const cashDiff = walletUpdates.cashBalance - (wallet?.cashBalance || 0);
        if (cashDiff !== 0) {
          resolvedAdjustment = {
            type: cashDiff > 0 ? 'ADD' : 'DEDUCT',
            targetWallet: 'cashBalance',
            amount: Math.abs(cashDiff),
            reason: isHi ? 'एडमिन द्वारा कैश बैलेंस अपडेट' : 'Admin manual cash balance update',
          };
        }
      } else if (walletUpdates.gpBalance !== undefined) {
        const gpDiff = walletUpdates.gpBalance - (wallet?.gpBalance || 0);
        if (gpDiff !== 0) {
          resolvedAdjustment = {
            type: gpDiff > 0 ? 'ADD' : 'DEDUCT',
            targetWallet: 'gpBalance',
            amount: Math.abs(gpDiff),
            reason: isHi ? 'एडमिन द्वारा GP पॉइंट्स अपडेट' : 'Admin manual GP balance update',
          };
        }
      }

      onClose();
      setIsSubmitting(false);

      await onSave({
        userId: user?.id,
        name: name.trim(),
        loginId: loginId.trim() || undefined,
        phone: phone.trim(),
        email: (() => {
          let clean = (email || '').trim().replace(/\s+/g, '');
          if (!clean || clean.includes('@gcap.user')) {
            const digits = phone.replace(/[^0-9]/g, '').slice(-10);
            clean = `${digits || 'user'}@gcap.user`;
          }
          return clean;
        })(),
        password: password ? password.trim() : undefined,
        role,
        status,
        joinedDate: joinedDate.trim(),
        referralCode: referralCode.trim() || undefined,
        referredBy: referredBy.trim() || undefined,
        bankDetails: (accountNumber.trim() || upiId.trim()) ? {
          accountHolder: accountHolder.trim() || name.trim(),
          accountNumber: accountNumber.trim(),
          ifscCode: ifscCode.trim().toUpperCase(),
          bankName: bankName.trim(),
          upiId: upiId.trim(),
        } : undefined,
        walletUpdates: Object.keys(walletUpdates).length > 0 ? walletUpdates : undefined,
        walletAdjustment: resolvedAdjustment,
        isPasswordChanged: isPasswordDirty && Boolean(password && password.trim() && (!user?.password || password.trim() !== user.password.trim())),
        backdatedPlanId: backdatedPlanId || undefined,
        backdatedAmount: Number(backdatedAmount) || 0,
        backdatedWithdrawal: Number(backdatedWithdrawal) || 0,
        permissions: role === 'STAFF' ? {
          manageUsers: permManageUsers,
          manageWallet: permManageWallet,
          manageTransactions: permManageTransactions,
          manageSchemes: permManageSchemes,
          manageTreasury: permManageTreasury,
          manageBroadcast: permManageBroadcast,
        } : undefined,
      });

      onClose();
    } catch (err: any) {
      setError(err?.message || (isHi ? 'डेटा सहेजने में विफल।' : 'Failed to save changes.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl max-h-[92vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl text-slate-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {isEditing
                    ? (isHi ? `${user?.name || 'यूज़र'} का खाता व वॉलेट संपादित करें` : `Edit Account & Wallet: ${user?.name || 'User'}`)
                    : (isHi ? 'नया निवेशक खाता जोड़ें (Add User)' : 'Add New Investor Account')}
                </h3>
                {isEditing && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    status === 'ACTIVE'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  }`}>
                    {status}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {isHi
                  ? 'एडमिन को यूज़र के वॉलेट, प्रोफ़ाइल, पासवर्ड, बैंक और हर विवरण को बदलने की पूर्ण अनुमति है'
                  : 'Full administrative control over user balance, credentials, profile, and bank details'}
              </p>
            </div>
          </div>
          <button
            id="btn-close-user-edit-modal"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 px-5 py-2.5 bg-slate-950/40 border-b border-slate-800/80 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('PROFILE')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'PROFILE'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>{isHi ? '👤 प्रोफ़ाइल व लॉगिन' : '👤 Profile & Login'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('WALLET')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'WALLET'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <WalletIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isHi ? '💰 वॉलेट राशि प्रबंधन' : '💰 Wallet & Balances'}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/30 text-[10px] text-emerald-200">
              ₹{(Number(cashBalance) + Number(totalEarned)).toLocaleString('en-IN')}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('BANK')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'BANK'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <span>{isHi ? '🏦 बैंक व UPI' : '🏦 Bank & UPI'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('INVESTMENT')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'INVESTMENT'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
            <span>{isHi ? '📈 निवेश / बैकडेट' : '📈 Investments'}</span>
          </button>
        </div>

        {error && (
          <div className="mx-5 mt-3 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* TAB 1: PROFILE & LOGIN */}
          {activeTab === 'PROFILE' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isHi ? 'पूरा नाम (Full Name):' : 'Full Name:'}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-cyan-400 focus:outline-none"
                    placeholder="e.g. Ramesh Kumar"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isHi ? 'लॉगिन आईडी (Login ID / Username):' : 'Login ID / Username:'}
                  </label>
                  <input
                    type="text"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-cyan-300 focus:border-cyan-400 focus:outline-none"
                    placeholder="e.g. 9876543210 or user123"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isHi ? 'मोबाइल नंबर (Phone Number):' : 'Mobile Phone Number:'}
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-cyan-400 focus:outline-none"
                    placeholder="+91 98765 00000"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isHi ? 'ईमेल पता (Email Address):' : 'Email Address:'}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.replace(/\s+/g, ''))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-cyan-400 focus:outline-none"
                    placeholder="user@example.com"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isHi ? 'लॉगिन पासवर्ड (Login Password):' : 'Login Password:'}
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
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setIsPasswordDirty(true);
                      }}
                      className="w-full pl-3 pr-10 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-amber-300 focus:border-cyan-400 focus:outline-none"
                      placeholder={isEditing ? 'नया पासवर्ड दर्ज करें (या पहले जैसा रहने दें)' : 'Enter initial password'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {isHi ? 'एडमिन किसी भी समय यूज़र का पासवर्ड सीधे बदल सकता है।' : 'Admin can reset or view the user password at any time.'}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isHi ? 'रोल (Role):' : 'User Role:'}
                  </label>
                  <select
                    value={role}
                    disabled={isEditing && loginId === 'admin'}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white disabled:opacity-60 focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="USER">USER (इन्वेस्टर / निवेशक)</option>
                    <option value="STAFF">STAFF (कंपनी स्टाफ - जैसे reception, cashier, computer assistant)</option>
                    <option value="ADMIN">ADMIN (प्रशासक / सुपर एडमिन)</option>
                  </select>
                </div>

                {role === 'STAFF' && (
                  <div className="col-span-1 sm:col-span-2 p-4 rounded-xl bg-slate-950 border border-amber-500/30 space-y-3">
                    <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                      <ShieldCheck className="w-4 h-4 text-amber-400 animate-pulse" />
                      <span className="text-xs font-black text-amber-300">
                        {isHi ? 'स्टाफ कार्य अनुमतियाँ (Staff Role Permissions)' : 'Staff Role Permissions Configuration'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      {isHi 
                        ? 'इस स्टाफ सदस्य को केवल वही काम करने की अनुमति होगी जिन्हें आप नीचे टिक करेंगे:' 
                        : 'This staff member will only be allowed to perform tasks you enable below:'}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1.5">
                      <label className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-800 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={permManageUsers}
                          onChange={(e) => setPermManageUsers(e.target.checked)}
                          className="rounded text-cyan-500 focus:ring-cyan-400 w-4 h-4 accent-cyan-500"
                        />
                        <div>
                          <p className="text-xs font-bold text-white">{isHi ? 'यूज़र मैनेजमेंट' : 'Manage Users'}</p>
                          <p className="text-[9px] text-slate-400">{isHi ? 'प्रोफाइल देखना, जोड़ना और संपादित करना' : 'View, add, edit profiles'}</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-800 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={permManageWallet}
                          onChange={(e) => setPermManageWallet(e.target.checked)}
                          className="rounded text-cyan-500 focus:ring-cyan-400 w-4 h-4 accent-cyan-500"
                        />
                        <div>
                          <p className="text-xs font-bold text-white">{isHi ? 'वॉलेट समायोजन' : 'Manage Wallet'}</p>
                          <p className="text-[9px] text-slate-400">{isHi ? 'यूज़र बैलेंस जोड़ना, घटाना या सेट करना' : 'Credit/debit/adjust balances'}</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-800 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={permManageTransactions}
                          onChange={(e) => setPermManageTransactions(e.target.checked)}
                          className="rounded text-cyan-500 focus:ring-cyan-400 w-4 h-4 accent-cyan-500"
                        />
                        <div>
                          <p className="text-xs font-bold text-white">{isHi ? 'लेनदेन मंज़ूरी (SOP)' : 'Manage Transactions'}</p>
                          <p className="text-[9px] text-slate-400">{isHi ? 'डिपॉज़िट व विड्रॉल अप्रूव/रिजेक्ट करना' : 'Approve/reject deposits & withdrawals'}</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-800 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={permManageSchemes}
                          onChange={(e) => setPermManageSchemes(e.target.checked)}
                          className="rounded text-cyan-500 focus:ring-cyan-400 w-4 h-4 accent-cyan-500"
                        />
                        <div>
                          <p className="text-xs font-bold text-white">{isHi ? 'स्कीम / प्लान्स' : 'Manage Schemes'}</p>
                          <p className="text-[9px] text-slate-400">{isHi ? 'निवेश प्लान्स व स्कीम जोड़ना व बदलना' : 'Create & modify investment schemes'}</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-800 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={permManageTreasury}
                          onChange={(e) => setPermManageTreasury(e.target.checked)}
                          className="rounded text-cyan-500 focus:ring-cyan-400 w-4 h-4 accent-cyan-500"
                        />
                        <div>
                          <p className="text-xs font-bold text-white">{isHi ? 'ट्रेजरी व बैकअप' : 'Manage Treasury'}</p>
                          <p className="text-[9px] text-slate-400">{isHi ? 'कंपनी खजाना देखना व डेटा बैकअप लेना' : 'Main balance and data backup operations'}</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-800 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={permManageBroadcast}
                          onChange={(e) => setPermManageBroadcast(e.target.checked)}
                          className="rounded text-cyan-500 focus:ring-cyan-400 w-4 h-4 accent-cyan-500"
                        />
                        <div>
                          <p className="text-xs font-bold text-white">{isHi ? 'ब्रॉडकास्ट व संदेश' : 'Manage Broadcast'}</p>
                          <p className="text-[9px] text-slate-400">{isHi ? 'ग्लोबल ब्रॉडकास्ट व शिकायत समाधान' : 'Broadcast notifications & helpdesk replies'}</p>
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isHi ? 'खाता स्थिति (Account Status):' : 'Account Status:'}
                  </label>
                  <select
                    value={status}
                    disabled={isEditing && loginId === 'admin'}
                    onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'BLOCKED')}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white disabled:opacity-60 focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="ACTIVE">ACTIVE (सक्रिय - सभी सेवाएं चालू)</option>
                    <option value="BLOCKED">BLOCKED (निलंबित - लॉगिन वर्जित)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isHi ? 'रेफरल कोड (User Referral Code):' : 'Referral Code:'}
                  </label>
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-cyan-300 focus:border-cyan-400 focus:outline-none"
                    placeholder="GCAP-XXXXXX"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isHi ? 'स्पॉन्सर कोड (Referred By / Sponsor):' : 'Referred By / Sponsor:'}
                  </label>
                  <input
                    type="text"
                    value={referredBy}
                    onChange={(e) => setReferredBy(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-purple-300 focus:border-cyan-400 focus:outline-none"
                    placeholder="e.g. GCAP-ADMIN"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isHi ? 'पंजीकरण तिथि (Joined Date):' : 'Joined Date:'}
                  </label>
                  <input
                    type="date"
                    value={joinedDate}
                    onChange={(e) => setJoinedDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-amber-300 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WALLET & BALANCES MANAGEMENT */}
          {activeTab === 'WALLET' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-slate-950 border border-emerald-500/30 rounded-2xl flex items-start gap-3 shadow-md">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="text-xs text-slate-300">
                  <div className="font-bold text-emerald-300 text-sm flex items-center gap-2 mb-0.5">
                    <span>{isHi ? 'एडमिन वॉलेट नियंत्रण एवं रीयल-टाइम क्रेडिट/डेबिट' : 'Admin Wallet Control & Live Payout Console'}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {isHi
                      ? 'आप यूज़र के किसी भी वॉलेट का लाइव बैलेंस सीधे संपादित कर सकते हैं या त्वरित ऑपरेटर से राशि जोड़/घटा सकते हैं।'
                      : 'Directly modify user balances or use the quick credit/debit operator with instant audit history.'}
                  </p>
                </div>
              </div>

              {/* Balances Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/30 rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-300 flex items-center gap-1">
                      <span>💵</span>
                      <span>{isHi ? 'नकद शेष' : 'Cash (₹)'}</span>
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                      LIVE
                    </span>
                  </div>
                  <div className="mt-2">
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-emerald-400 font-bold">₹</span>
                      <input
                        type="text" inputMode="decimal"
                        
                        step="any"
                        value={cashBalance}
                        onChange={(e) => setCashBalance(parseFloat(e.target.value) || 0)}
                        className="w-full pl-6 pr-2 py-1.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs font-bold text-emerald-400 font-mono focus:border-emerald-400 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-gradient-to-b from-slate-900 to-slate-950 border border-cyan-500/30 rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-cyan-300 flex items-center gap-1">
                      <span>🪙</span>
                      <span>{isHi ? 'GP पॉइंट्स' : 'GP Points'}</span>
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-400 font-mono font-bold">
                      POINTS
                    </span>
                  </div>
                  <div className="mt-2">
                    <input
                      type="text" inputMode="decimal"
                      
                      step="any"
                      value={gpBalance}
                      onChange={(e) => setGpBalance(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs font-bold text-cyan-300 font-mono focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="p-3 bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/30 rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                      <span>📈</span>
                      <span>{isHi ? 'कुल कमाई' : 'Earned (₹)'}</span>
                    </span>
                  </div>
                  <div className="mt-2">
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-amber-400 font-bold">₹</span>
                      <input
                        type="text" inputMode="decimal"
                        
                        step="any"
                        value={totalEarned}
                        onChange={(e) => setTotalEarned(parseFloat(e.target.value) || 0)}
                        className="w-full pl-6 pr-2 py-1.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs font-bold text-amber-400 font-mono focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-gradient-to-b from-slate-900 to-slate-950 border border-purple-500/30 rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-purple-300 flex items-center gap-1">
                      <span>👑</span>
                      <span>{isHi ? 'रॉयल्टी' : 'Royalty (₹)'}</span>
                    </span>
                  </div>
                  <div className="mt-2">
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-purple-300 font-bold">₹</span>
                      <input
                        type="text" inputMode="decimal"
                        
                        step="any"
                        value={royaltyEarned}
                        onChange={(e) => setRoyaltyEarned(parseFloat(e.target.value) || 0)}
                        className="w-full pl-6 pr-2 py-1.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs font-bold text-purple-300 font-mono focus:border-purple-400 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Add / Deduct Action Operator */}
              <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-2xl space-y-3.5 shadow-lg">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
                    <span>{isHi ? 'त्वरित ऑपरेटर (Quick Balance Adjustment)' : 'Quick Adjustment Tool'}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{isHi ? 'ऑटो पासबुक एंट्री' : 'Auto Passbook Log'}</span>
                </div>

                {/* Preset Chips */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <span className="text-[11px] text-slate-400 font-semibold shrink-0">{isHi ? 'त्वरित राशि:' : 'Quick Select:'}</span>
                  {[500, 1000, 2000, 5000, 10000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAdjAmount(String(amt))}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                        adjAmount === String(amt)
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      +₹{amt.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      {isHi ? 'कार्रवाई प्रकार:' : 'Action Type:'}
                    </label>
                    <select
                      value={adjType}
                      onChange={(e) => setAdjType(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-medium focus:border-cyan-400 focus:outline-none"
                    >
                      <option value="ADD">➕ {isHi ? 'राशि जोड़ें (Credit / Add)' : 'Add / Credit Amount'}</option>
                      <option value="DEDUCT">➖ {isHi ? 'राशि घटाएं (Debit / Deduct)' : 'Deduct / Debit Amount'}</option>
                      <option value="SET">✏️ {isHi ? 'सीधा बैलेंस सेट करें' : 'Set Exact Balance'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      {isHi ? 'लक्ष्य वॉलेट:' : 'Target Balance:'}
                    </label>
                    <select
                      value={adjTarget}
                      onChange={(e) => setAdjTarget(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-medium focus:border-cyan-400 focus:outline-none"
                    >
                      <option value="cashBalance">💵 {isHi ? 'नकद बैलेंस (Cash ₹)' : 'Cash Balance (₹)'}</option>
                      <option value="gpBalance">🪙 {isHi ? 'GP पॉइंट्स (GP)' : 'GP Balance (GP)'}</option>
                      <option value="totalEarned">📈 {isHi ? 'कुल कमाई (Total Earned ₹)' : 'Total Earnings (₹)'}</option>
                      <option value="royaltyEarned">👑 {isHi ? 'रॉयल्टी बैलेंस (Royalty ₹)' : 'Royalty Balance (₹)'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      {isHi ? 'राशि दर्ज करें:' : 'Amount:'}
                    </label>
                    <input
                      type="text" inputMode="decimal"
                      step="any"
                      value={adjAmount}
                      onChange={(e) => setAdjAmount(e.target.value)}
                      placeholder="e.g. 5000"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-emerald-400 font-bold focus:border-cyan-400 focus:outline-none"
                    />
                    <p className="text-[10px] text-cyan-400/90 mt-1">
                      {isHi ? '* (नीचे "परिवर्तन सहेजें" बटन दबाने पर यह राशि स्वतः लागू हो जाएगी)' : '* (Amount will apply automatically upon clicking Save Changes)'}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    {isHi ? 'समायोजन नोट (Audit Reason):' : 'Audit Reason / Note:'}
                  </label>
                  <input
                    type="text"
                    value={adjReason}
                    onChange={(e) => setAdjReason(e.target.value)}
                    placeholder={isHi ? 'e.g. एडमिन बोनस / जमा क्रेडिट' : 'e.g. Admin bonus or manual adjustment'}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BANK & UPI DETAILS */}
          {activeTab === 'BANK' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl flex items-start gap-2.5">
                <Building2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300">
                  <span className="font-bold text-amber-300 block mb-0.5">
                    {isHi ? 'यूज़र बैंक खाता व UPI विवरण (Bank & Payout Details)' : 'User Bank Account & UPI Settings'}
                  </span>
                  {isHi
                    ? 'एडमिन निकासी (Withdrawal) प्रोसेस करने हेतु यूज़र के बैंक विवरण को सीधे बदल व अपडेट कर सकता है।'
                    : 'Admin can view and update the user bank payout details anytime.'}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isHi ? 'खाताधारक का नाम (Account Holder Name):' : 'Account Holder Name:'}
                  </label>
                  <input
                    type="text"
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-amber-400 focus:outline-none"
                    placeholder="e.g. Ramesh Kumar"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isHi ? 'बैंक का नाम (Bank Name):' : 'Bank Name:'}
                  </label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-amber-400 focus:outline-none"
                    placeholder="e.g. State Bank of India"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isHi ? 'खाता संख्या (Account Number):' : 'Bank Account Number:'}
                  </label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-amber-300 focus:border-amber-400 focus:outline-none"
                    placeholder="e.g. 123456789012"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isHi ? 'IFSC कोड (IFSC Code):' : 'IFSC Code:'}
                  </label>
                  <input
                    type="text"
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-amber-300 uppercase focus:border-amber-400 focus:outline-none"
                    placeholder="e.g. SBIN0001234"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isHi ? 'UPI आईडी (UPI ID / VPA):' : 'UPI ID (e.g. GooglePay / PhonePe / Paytm):'}
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-cyan-300 focus:border-amber-400 focus:outline-none"
                    placeholder="e.g. 9876543210@paytm or user@okhdfcbank"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: INVESTMENTS & BACKDATED ALLOCATION */}
          {activeTab === 'INVESTMENT' && (
            <div className="space-y-4">
              <div className="p-3 bg-purple-950/20 border border-purple-500/30 rounded-xl flex items-start gap-2.5">
                <TrendingUp className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300">
                  <span className="font-bold text-purple-300 block mb-0.5">
                    {isHi ? 'बैकडेट व पूर्व निवेश आवंटन (Backdated Investment & Payout Setup)' : 'Backdated Plan Allocation'}
                  </span>
                  {isHi
                    ? 'यदि यूज़र पहले से ऑफलाइन निवेशित था, तो आप बैक-डेट निवेश और पूर्व में दी गई निकासी दर्ज कर सकते हैं।'
                    : 'Assign backdated investment plans and record prior historical returns or withdrawals.'}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isHi ? 'प्लान चुनें (Investment Plan):' : 'Assign Investment Plan:'}
                  </label>
                  <select
                    value={backdatedPlanId}
                    onChange={(e) => setBackdatedPlanId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-purple-400 focus:outline-none"
                  >
                    <option value="">{isHi ? '-- कोई नया प्लान नहीं जोड़ना --' : '-- No New Plan Allocation --'}</option>
                    <option value="SHORT_TERM_641D">641D Short Term Plan (0.041% / 6h, 641 Days Total)</option>
                    <option value="LONG_TERM_365D">365D Long Term Plan (0.032% / 6h + 1825D Royalty)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isHi ? 'निवेश राशि (Invested Amount ₹):' : 'Invested Amount (₹):'}
                  </label>
                  <input
                    type="text" inputMode="decimal"
                    
                    value={backdatedAmount || ''}
                    onChange={(e) => setBackdatedAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                    placeholder="e.g. 50000"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-emerald-400 font-bold focus:border-purple-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isHi ? 'पूर्व निकासी राशि (Prior Withdrawals Processed ₹):' : 'Prior Withdrawals (₹):'}
                  </label>
                  <input
                    type="text" inputMode="decimal"
                    
                    value={backdatedWithdrawal || ''}
                    onChange={(e) => setBackdatedWithdrawal(Math.max(0, parseFloat(e.target.value) || 0))}
                    placeholder="e.g. 5000"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-rose-400 font-bold focus:border-purple-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800 shrink-0">
            <div className="text-[11px] text-slate-400 hidden sm:block">
              {isHi ? '💡 सभी परिवर्तन रियल-टाइम में सुरक्षित रूप से लागू होंगे।' : '💡 All updates sync across client and server instantly.'}
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                {isHi ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-md shadow-cyan-600/30 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                <span>
                  {isSubmitting
                    ? (isHi ? 'सहेज रहे हैं...' : 'Saving...')
                    : isEditing
                    ? (isHi ? 'परिवर्तन सहेजें' : 'Save All Changes')
                    : (isHi ? 'नया खाता बनाएं' : 'Create Account')}
                </span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
