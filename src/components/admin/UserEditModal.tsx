import React, { useState, useEffect } from 'react';
import { X, User, Check, AlertCircle, Shield, Key, Calendar } from 'lucide-react';
import { Language, UserProfile, UserRole } from '../../types';

interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null; // null if adding new user
  onSave: (data: {
    userId?: string;
    name: string;
    loginId: string;
    phone: string;
    email: string;
    password?: string;
    role: UserRole;
    status: 'ACTIVE' | 'BLOCKED';
    joinedDate?: string;
    backdatedPlanId?: string;
    backdatedAmount?: number;
    backdatedWithdrawal?: number;
  }) => void;
  language: Language;
}

export const UserEditModal: React.FC<UserEditModalProps> = ({
  isOpen,
  onClose,
  user,
  onSave,
  language,
}) => {
  const isHi = language === 'hi';
  const isEditing = !!user;

  const [name, setName] = useState('');
  const [loginId, setLoginId] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('USER');
  const [status, setStatus] = useState<'ACTIVE' | 'BLOCKED'>('ACTIVE');
  const [joinedDate, setJoinedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [backdatedPlanId, setBackdatedPlanId] = useState('');
  const [backdatedAmount, setBackdatedAmount] = useState<number>(0);
  const [backdatedWithdrawal, setBackdatedWithdrawal] = useState<number>(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setLoginId(user.loginId);
      setPhone(user.phone);
      setEmail(user.email || '');
      setPassword(''); // keep blank unless admin wants to change password
      setRole(user.role);
      setStatus(user.status);
      setJoinedDate(user.joinedDate || new Date().toISOString().split('T')[0]);
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
      setBackdatedPlanId('');
      setBackdatedAmount(0);
      setBackdatedWithdrawal(0);
    }
    setError('');
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name.length < 2) {
      setError(isHi ? 'कृपया मान्य पूरा नाम दर्ज करें।' : 'Valid full name is required.');
      return;
    }
    if (!loginId.trim() || loginId.length < 3) {
      setError(isHi ? 'लॉगिन आईडी कम से कम 3 अक्षरों की होनी चाहिए।' : 'Login ID must be at least 3 characters.');
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

    onSave({
      userId: user?.id,
      name: name.trim(),
      loginId: loginId.trim().toLowerCase(),
      phone: phone.trim(),
      email: email.trim(),
      password: password ? password.trim() : undefined,
      role,
      status,
      joinedDate: joinedDate.trim(),
      backdatedPlanId,
      backdatedAmount,
      backdatedWithdrawal,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {isEditing
                  ? (isHi ? 'यूज़र प्रोफ़ाइल संपादित करें (Edit User)' : 'Edit User Profile')
                  : (isHi ? 'नया निवेशक/यूज़र जोड़ें (Add New User)' : 'Add New Investor Account')}
              </h3>
              <p className="text-xs text-slate-400">
                {isHi ? 'क्रेडेंशियल, अनुमतियां और स्थिति प्रबंधित करें' : 'Manage credentials, permissions, and status'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isHi ? 'लॉगिन आईडी (Login ID):' : 'Login ID / Username:'}
              </label>
              <input
                type="text"
                value={loginId}
                disabled={isEditing && loginId === 'admin'}
                onChange={(e) => setLoginId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white disabled:opacity-60 focus:border-cyan-400 focus:outline-none"
                placeholder="e.g. ramesh99"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isHi ? 'मोबाइल नंबर (Phone):' : 'Phone Number:'}
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
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {isHi ? 'ईमेल पता (Email):' : 'Email Address:'}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-cyan-400 focus:outline-none"
              placeholder="user@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {isEditing
                ? (isHi ? 'नया पासवर्ड सेट करें (खाली छोड़ें यदि नहीं बदलना):' : 'New Password (Leave blank to keep unchanged):')
                : (isHi ? 'लॉगिन पासवर्ड (Password):' : 'Login Password:')}
            </label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-amber-300 focus:border-cyan-400 focus:outline-none"
              placeholder={isEditing ? '••••••••' : 'Enter password'}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                <option value="ADMIN">ADMIN (प्रशासक / सुपर एडमिन)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isHi ? 'अकाउंट स्थिति (Account Status):' : 'Account Status:'}
              </label>
              <select
                value={status}
                disabled={isEditing && loginId === 'admin'}
                onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'BLOCKED')}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white disabled:opacity-60 focus:border-cyan-400 focus:outline-none"
              >
                <option value="ACTIVE">ACTIVE (सक्रिय)</option>
                <option value="BLOCKED">BLOCKED (निलंबित)</option>
              </select>
            </div>
          </div>

          {/* Back-Date Registration & Historical Investment / Withdrawal Setup */}
          <div className="p-3.5 bg-slate-950/80 border border-amber-500/30 rounded-xl space-y-3">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
              <Calendar className="w-4 h-4" />
              <span>{isHi ? 'बैक डेट रजिस्ट्रेशन व पूर्व प्लान सेटिंग्स (Admin Back-Date Permission)' : 'Back-Date Registration & Historical Auto-Calculations'}</span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                {isHi ? 'पंजीकरण तिथि (Registration / Joined Date):' : 'Registration / Joined Date:'}
              </label>
              <input
                type="date"
                value={joinedDate}
                onChange={(e) => setJoinedDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-amber-300 font-mono focus:border-amber-400 focus:outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                {isHi
                  ? 'पहले 24 घंटे की लॉक-इन अवधि काटकर वर्तमान तिथि तक प्रतिदिन की कमाई ऑटोमैटिक कैलकुलेट होकर जुड़ जाएगी।'
                  : 'Daily returns from joined date to today will be automatically calculated, deducting the initial 24h lock.'}
              </p>
            </div>

            {!isEditing && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    {isHi ? 'बैकडेटेड निवेश प्लान (Plan):' : 'Backdated Plan:'}
                  </label>
                  <select
                    value={backdatedPlanId}
                    onChange={(e) => setBackdatedPlanId(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:border-amber-400 focus:outline-none"
                  >
                    <option value="">{isHi ? '-- कोई प्लान नहीं --' : '-- No Initial Investment --'}</option>
                    <option value="SHORT_TERM_641D">641D Short Term (641 Days ROI)</option>
                    <option value="LONG_TERM_365D">365D Long Term (365 Days + 1825D Royalty)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    {isHi ? 'निवेश राशि (Invested Amount ₹):' : 'Invested Amount (₹):'}
                  </label>
                  <input
                    type="number"
                    value={backdatedAmount || ''}
                    onChange={(e) => setBackdatedAmount(Number(e.target.value))}
                    placeholder="e.g. 10000"
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-emerald-400 font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    {isHi ? 'पूर्व निकासी राशि (Prior Withdrawals Processed ₹):' : 'Prior Withdrawals Processed (₹):'}
                  </label>
                  <input
                    type="number"
                    value={backdatedWithdrawal || ''}
                    onChange={(e) => setBackdatedWithdrawal(Number(e.target.value))}
                    placeholder="e.g. 2000"
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-rose-400 font-mono focus:border-amber-400 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {isHi ? 'यदि यूज़र ने बैक-डेट अवधि में निकासी की है, तो वह यहाँ दर्ज करें।' : 'Record prior withdrawals processed during the backdated period.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              {isHi ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-md shadow-cyan-600/30 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{isEditing ? (isHi ? 'अपडेट करें' : 'Save Changes') : (isHi ? 'यूज़र जोड़ें' : 'Create User')}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
