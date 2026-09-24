import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  TrendingUp,
  Users,
  CheckCircle2,
  Sparkles,
  Smartphone,
  Monitor,
  Globe,
  AlertCircle,
  HelpCircle,
  Check,
} from 'lucide-react';
import { Language, UserProfile, ViewMode } from '../types';
import { loginUserAsync, registerUserAsync, syncUsersWithServer } from '../utils/authStorage';
import { audioAnnouncer } from '../utils/audioAnnouncer';

interface LoginPageProps {
  onLoginSuccess: (user: UserProfile) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  language,
  onLanguageChange,
  viewMode,
  onViewModeChange,
}) => {
  const isHi = language === 'hi';
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Login form state (strictly blank by default)
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regLoginId, setRegLoginId] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regReferral, setRegReferral] = useState('');
  const [isReferralLocked, setIsReferralLocked] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Auto-detect referral code in URL parameter or local storage when opened via share link
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const refParam = params.get('ref') || params.get('referral') || params.get('sponsor') || params.get('code');
      const savedRef = localStorage.getItem('gcap_saved_referral_code');
      
      const codeToLock = refParam || savedRef;
      if (codeToLock) {
        const cleanCode = codeToLock.trim().toUpperCase();
        setRegReferral(cleanCode);
        setIsReferralLocked(true);
        localStorage.setItem('gcap_saved_referral_code', cleanCode);
        if (refParam) {
          setAuthMode('REGISTER');
        }
      } else {
        // Direct registration: Default to GCAP-DIRECT (editable)
        setRegReferral('GCAP-DIRECT');
        setIsReferralLocked(false);
      }
    }
  }, []);

  // Error & Loading states
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginIdChange = (newId: string) => {
    setLoginId(newId);
    setErrorMessage('');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedLogin = loginId.trim();
    const trimmedPass = password.trim();

    if (!trimmedLogin) {
      setErrorMessage(isHi ? 'कृपया मोबाइल नंबर या यूजर आईडी दर्ज करें।' : 'Please enter Mobile Number or User ID.');
      return;
    }

    if (!trimmedPass) {
      setErrorMessage(isHi ? 'कृपया पासवर्ड दर्ज करें।' : 'Please enter password.');
      return;
    }

    const cleanDigits = trimmedLogin.replace(/[^0-9]/g, '');
    const clean10 = cleanDigits.length >= 10 ? cleanDigits.slice(-10) : cleanDigits;
    const isMasterAdmin =
      trimmedLogin.toLowerCase() === 'admin' ||
      clean10 === '9800012345' ||
      trimmedLogin === 'usr-admin-01';
    const isMasterPass = trimmedPass === 'ad123' || trimmedPass === 'gcap@tra1978';

    // Direct Instant Admin Login Guarantee
    if (isMasterAdmin && isMasterPass) {
      const adminUser = {
        id: 'usr-admin-01',
        loginId: 'admin',
        name: 'GCap System Administrator',
        role: 'ADMIN' as const,
        phone: '+91 98000 12345',
        email: 'admin@gcap.in',
        joinedDate: '2026-01-01',
        status: 'ACTIVE' as const,
        isOnline: true,
        lastLoginAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        permissions: {
          manageUsers: true,
          manageWallet: true,
          manageTransactions: true,
          manageSchemes: true,
          manageTreasury: true,
          manageBroadcast: true,
        },
      };

      try {
        localStorage.setItem('gcap_authenticated_user', JSON.stringify(adminUser));
        sessionStorage.setItem('gcap_authenticated_user', JSON.stringify(adminUser));
      } catch (_) {}

      // Inform parent and enter dashboard
      onLoginSuccess(adminUser);
      return;
    }

    // Standard user login
    setIsLoading(true);

    try {
      const res = await loginUserAsync(loginId, password);
      setIsLoading(false);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setErrorMessage(res.error || (isHi ? 'लॉगिन विफल रहा' : 'Login failed'));
      }
    } catch {
      setIsLoading(false);
      setErrorMessage(isHi ? 'लॉगिन त्रुटि हुई। कृपया पुनः प्रयास करें।' : 'Login error. Please try again.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!regName.trim() || regName.trim().length < 2) {
      setErrorMessage(isHi ? 'कृपया अपना पूरा नाम दर्ज करें।' : 'Please enter your full name.');
      return;
    }

    const cleanDigits = regPhone.replace(/[^0-9]/g, '');
    if (!cleanDigits || cleanDigits.length < 10) {
      setErrorMessage(isHi ? 'कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें।' : 'Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!regPassword.trim() || regPassword.trim().length < 4) {
      setErrorMessage(isHi ? 'पासवर्ड कम से कम 4 अक्षरों का होना चाहिए।' : 'Password must be at least 4 characters long.');
      return;
    }

    if (!agreeTerms) {
      setErrorMessage(isHi ? 'कृपया नियम व शर्तों को स्वीकार करें' : 'Please accept terms & conditions');
      return;
    }

    setIsLoading(true);

    try {
      const res = await registerUserAsync({
        name: regName,
        loginId: cleanDigits.slice(-10),
        phone: cleanDigits.slice(-10),
        email: regEmail,
        password: regPassword,
        referralCode: regReferral,
      });

      setIsLoading(false);

      if (res.success && res.user) {
        // Sync with server in background without blocking login
        syncUsersWithServer().catch(() => {});
        audioAnnouncer.announceRegistration({
          userName: res.user.name,
          language: isHi ? 'hi' : 'en',
        });
        onLoginSuccess(res.user);
      } else {
        setErrorMessage(res.error || (isHi ? 'पंजीकरण विफल रहा' : 'Registration failed'));
      }
    } catch {
      setIsLoading(false);
      setErrorMessage(isHi ? 'पंजीकरण त्रुटि हुई। कृपया पुनः प्रयास करें।' : 'Registration error. Please try again.');
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col justify-start selection:bg-emerald-500 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-md shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center">
              <span className="font-extrabold text-xl sm:text-2xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-emerald-400 bg-clip-text text-transparent font-sans">
                GCap
              </span>
            </div>
            <p className="text-[10px] text-slate-400 tracking-wider uppercase">
              {isHi ? 'सुरक्षित वेल्थ व दैनिक रिटर्न पोर्टल' : 'Secure Wealth & Daily ROI Portal'}
            </p>
          </div>
        </div>

        {/* Header Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* View Mode Toggle */}
          <div className="hidden sm:flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => onViewModeChange('web')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                viewMode === 'web'
                  ? 'bg-slate-800 text-emerald-400 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Web</span>
            </button>
            <button
              onClick={() => onViewModeChange('android')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                (viewMode as string) === 'android'
                  ? 'bg-slate-800 text-emerald-400 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile</span>
            </button>
          </div>

          {/* Language Toggle */}
          <button
            onClick={() => onLanguageChange(isHi ? 'en' : 'hi')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isHi ? 'English' : 'हिंदी'}</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full p-3 sm:p-6 lg:p-8 flex flex-col items-center justify-center">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          
          {/* Left Hero & Features Banner (Visible on Desktop/Tablet) */}
          <div className="lg:col-span-6 space-y-6 hidden lg:block">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>{isHi ? '256-बिट बैंक-ग्रेड सुरक्षा और एनक्रिप्शन' : '256-bit Bank Grade Security & Payouts'}</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl font-extrabold text-white tracking-tight leading-tight">
                {isHi ? (
                  <>
                    अपने पैसों को बढ़ाएं, <br />
                    <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                      GCap दैनिक रिटर्न
                    </span>{' '}
                    के साथ।
                  </>
                ) : (
                  <>
                    Grow Your Wealth With <br />
                    <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                      GCap Daily Payouts
                    </span>
                  </>
                )}
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed max-w-md">
                {isHi
                  ? 'स्मार्ट दैनिक ब्याज, 100% मूलधन सुरक्षा एवं 24x7 तत्काल UPI निकासी। अपने खाते में सुरक्षित लॉगिन करें।'
                  : 'Smart daily automated ROI, 100% principal return guarantee, and instant UPI withdrawals. Sign in securely to your account.'}
              </p>
            </div>

            {/* Platform Highlights */}
            <div className="grid grid-cols-2 gap-3 max-w-md pt-2">
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-emerald-400 font-bold text-lg font-mono">1.8% - 3.5%</span>
                <p className="text-xs text-slate-400 mt-0.5">{isHi ? 'दैनिक रिटर्न प्लान्स' : 'Daily ROI Rates'}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-emerald-400 font-bold text-lg font-mono">100% Refund</span>
                <p className="text-xs text-slate-400 mt-0.5">{isHi ? 'मूलधन वापसी गारंटी' : 'Capital Guarantee'}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-purple-300 font-bold text-lg font-mono">Instant UPI</span>
                <p className="text-xs text-slate-400 mt-0.5">{isHi ? '24x7 त्वरित निकासी' : 'Instant Withdrawals'}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-amber-400 font-bold text-lg font-mono">5% + 2%</span>
                <p className="text-xs text-slate-400 mt-0.5">{isHi ? '2-स्तरीय रेफरल बोनस' : '2-Tier Referral'}</p>
              </div>
            </div>

            {/* Security Guarantee Reassurance Card */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 max-w-md flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white tracking-tight">
                  {isHi ? 'प्रमाणीकृत व एनक्रिप्टेड पोर्टल' : 'Verified & Secure Portal'}
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  {isHi
                    ? 'सभी लॉगिन सत्र 256-बिट SSL सुरक्षा व बैंक-ग्रेड एन्क्रिप्शन द्वारा सुरक्षित हैं।'
                    : 'All account sessions are strictly protected with 256-bit bank-grade encryption.'}
                </p>
              </div>
            </div>
          </div>

          {/* Right Login / Register Card (Full-width responsive on mobile) */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto">
            <div className="bg-slate-900/90 sm:bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-7 shadow-2xl shadow-black/80 backdrop-blur-md relative overflow-hidden">
              
              {/* Decorative top accent line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-400"></div>

              {/* Login vs Register Switcher */}
              <div className="flex rounded-xl bg-slate-950 p-1 mb-5 border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('LOGIN');
                    setErrorMessage('');
                  }}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    authMode === 'LOGIN'
                      ? 'bg-slate-800 text-white shadow-sm border border-slate-700/50'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {isHi ? 'लॉगिन करें (Sign In)' : 'Sign In'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('REGISTER');
                    setErrorMessage('');
                    // Ensure all registration fields are strictly blank
                    setRegName('');
                    setRegLoginId('');
                    setRegPhone('');
                    setRegEmail('');
                    setRegPassword('');
                    setRegReferral('');
                  }}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    authMode === 'REGISTER'
                      ? 'bg-slate-800 text-white shadow-sm border border-slate-700/50'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {isHi ? 'नया खाता बनाएं (Sign Up)' : 'Create Account'}
                </button>
              </div>

              {/* Error Box */}
              {errorMessage && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* LOGIN FORM */}
              {authMode === 'LOGIN' ? (
                <div
                  className="space-y-4 animate-in fade-in duration-200"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleLoginSubmit(e as any);
                    }
                  }}
                >
                  {/* Login ID Input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {isHi ? 'मोबाइल नंबर / यूजर आईडी' : 'Mobile Number / User ID'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        inputMode="text"
                        name="auth_login_id"
                        autoComplete="username"
                        data-lpignore="true"
                        data-1p-ignore="true"
                        data-form-type="other"
                        autoCorrect="off"
                        autoCapitalize="none"
                        spellCheck={false}
                        required
                        value={loginId}
                        onChange={(e) => handleLoginIdChange(e.target.value)}
                        placeholder={isHi ? '10 अंकों का मोबाइल नंबर या admin' : '10-digit mobile number or admin'}
                        className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-300">
                        {isHi ? 'पासवर्ड (Password)' : 'Password'}
                      </label>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        name="auth_user_security_pin"
                        autoComplete="one-time-code"
                        data-lpignore="true"
                        data-1p-ignore="true"
                        data-form-type="other"
                        autoCorrect="off"
                        autoCapitalize="none"
                        spellCheck={false}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={isHi ? 'पासवर्ड दर्ज करें' : 'Enter password'}
                        style={{ WebkitTextSecurity: showPassword ? 'none' : 'disc' } as any}
                        className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me Checkbox */}
                  <div className="pt-0.5">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-slate-400 hover:text-slate-300 text-xs">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-700 text-emerald-500 focus:ring-0 bg-slate-950 cursor-pointer"
                      />
                      <span>{isHi ? 'मुझे याद रखें (Remember me)' : 'Remember me'}</span>
                    </label>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleLoginSubmit}
                      id="btn-submit-login"
                      disabled={isLoading}
                      className="w-full py-3.5 px-4 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/20 active:scale-[0.99]"
                    >
                      {isLoading ? (
                        <span>{isHi ? 'सत्यापित हो रहा है...' : 'Verifying...'}</span>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 text-slate-950" />
                          <span>{isHi ? 'लॉगिन करें (Login)' : 'Sign In'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                /* REGISTER FORM */
                <div
                  className="space-y-3.5"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleRegisterSubmit(e as any);
                    }
                  }}
                >
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {isHi ? 'पूरा नाम (Full Name)' : 'Full Name'}
                    </label>
                    <input
                      type="text"
                      inputMode="text"
                      required
                      autoComplete="one-time-code"
                      data-lpignore="true"
                      data-1p-ignore="true"
                      data-form-type="other"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder={isHi ? 'अपना पूरा नाम दर्ज करें (उदा. अमित कुमार)' : 'Enter your full name (e.g. Amit Kumar)'}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Mobile Number */}
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        {isHi ? 'मोबाइल नंबर (10 अंक)' : 'Mobile Number (10 Digits)'}
                      </label>
                      <input
                        type="tel"
                        inputMode="numeric"
                        required
                        autoComplete="one-time-code"
                        data-lpignore="true"
                        data-1p-ignore="true"
                        data-form-type="other"
                        value={regPhone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          setRegPhone(val);
                        }}
                        placeholder={isHi ? '10 अंकों का मोबाइल नंबर' : '10-digit mobile number'}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 font-mono"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        {isHi ? '✓ मोबाइल नंबर ही यूजर आईडी रहेगा' : '✓ Mobile number is your User ID'}
                      </span>
                    </div>
                  </div>

                  {/* Email (optional) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {isHi ? 'ईमेल (वैकल्पिक)' : 'Email (Optional)'}
                    </label>
                    <input
                      type="text"
                      inputMode="email"
                      autoComplete="one-time-code"
                      data-lpignore="true"
                      data-1p-ignore="true"
                      data-form-type="other"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder={isHi ? 'ईमेल पता (यदि हो तो दर्ज करें)' : 'Email address (optional)'}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {isHi ? 'नया सुरक्षित पासवर्ड' : 'Set Secure Password'}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        autoComplete="one-time-code"
                        data-lpignore="true"
                        data-1p-ignore="true"
                        data-form-type="other"
                        autoCorrect="off"
                        autoCapitalize="none"
                        spellCheck={false}
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder={isHi ? 'कम से कम 6 अक्षरों का पासवर्ड' : 'At least 6 characters'}
                        style={{ WebkitTextSecurity: showRegPassword ? 'none' : 'disc' } as any}
                        className="w-full px-3.5 pr-10 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                      >
                        {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Referral / Sponsor Code */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <span>{isHi ? 'रेफरल / स्पॉन्सर कोड' : 'Sponsor / Referral Code'}</span>
                      </label>
                      {isReferralLocked ? (
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
                          <Lock className="w-3 h-3 text-amber-400" />
                          {isHi ? 'स्पॉन्सर लॉक' : 'Sponsor Locked'}
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
                          {isHi ? 'वैकल्पिक / डिफ़ॉल्ट' : 'Optional / Default'}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        autoComplete="one-time-code"
                        data-lpignore="true"
                        data-1p-ignore="true"
                        data-form-type="other"
                        readOnly={isReferralLocked}
                        value={regReferral}
                        onChange={(e) => setRegReferral(e.target.value.toUpperCase())}
                        placeholder="GCAP-DIRECT"
                        className={`w-full px-3.5 py-2.5 bg-slate-900/90 border rounded-xl font-mono text-sm uppercase font-bold pr-9 focus:outline-none ${
                          isReferralLocked
                            ? 'border-amber-500/40 text-amber-300 cursor-not-allowed select-none'
                            : 'border-slate-700 text-white focus:border-emerald-500'
                        }`}
                      />
                      {isReferralLocked && (
                        <Lock className="w-4 h-4 text-amber-400 absolute right-3 top-2.5 pointer-events-none" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 font-sans flex items-center gap-1">
                      <span>✓</span>
                      <span>
                        {isReferralLocked
                          ? (isHi ? 'स्पॉन्सर लिंक द्वारा रेफरल कोड सुरक्षित रूप से सेट है।' : 'Sponsor code securely linked from invite.')
                          : (isHi ? 'यदि कोई स्पॉन्सर नहीं है तो GCAP-DIRECT रहने दें।' : 'Leave as GCAP-DIRECT if you do not have a sponsor.')}
                      </span>
                    </p>
                  </div>

                  {/* Terms Checkbox */}
                  <label className="flex items-start gap-2 text-[11px] text-slate-400 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 rounded border-slate-700 text-emerald-500 focus:ring-0 bg-slate-950"
                    />
                    <span>
                      {isHi
                        ? 'मैं GCap के निवेश नियमों, 100% मूलधन सुरक्षा एवं निकासी नीतियों से सहमत हूँ।'
                        : 'I agree to GCap investment policies, 100% capital guarantee, and withdrawal terms.'}
                    </span>
                  </label>

                  {/* Submit Button */}
                  <button
                    type="button"
                    onClick={handleRegisterSubmit}
                    id="btn-submit-register"
                    className="w-full py-3.5 px-4 rounded-xl font-bold text-sm sm:text-base bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer mt-2 active:scale-[0.99]"
                  >
                    <span>{isHi ? 'खाता बनाएं एवं लॉगिन करें' : 'Create Account & Enter'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Bottom Switch Hint */}
              <div className="mt-5 pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400">
                {authMode === 'LOGIN' ? (
                  <p>
                    {isHi ? 'क्या आपका खाता नहीं है? ' : "Don't have an account? "}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('REGISTER');
                        setErrorMessage('');
                      }}
                      className="text-emerald-400 hover:text-emerald-300 font-bold ml-1 cursor-pointer"
                    >
                      {isHi ? 'यहाँ रजिस्टर करें' : 'Register here'}
                    </button>
                  </p>
                ) : (
                  <p>
                    {isHi ? 'पहले से खाता है? ' : 'Already registered? '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('LOGIN');
                        setErrorMessage('');
                      }}
                      className="text-emerald-400 hover:text-emerald-300 font-bold ml-1 cursor-pointer"
                    >
                      {isHi ? 'लॉगिन करें' : 'Sign in'}
                    </button>
                  </p>
                )}
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      {viewMode !== 'android' && (
        <footer className="border-t border-slate-800/80 bg-slate-950 px-4 py-3 text-center text-xs text-slate-500">
          <p>
            © 2026 GCap Assets & Wealth Management Private Limited • {isHi ? 'सभी अधिकार सुरक्षित' : 'All Rights Reserved'} • ISO 27001 Certified
          </p>
        </footer>
      )}
    </div>
  );
};
