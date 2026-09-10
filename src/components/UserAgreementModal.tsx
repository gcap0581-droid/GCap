import React, { useState } from 'react';
import {
  X,
  Printer,
  ShieldCheck,
  Building2,
  User,
  Calendar,
  Phone,
  Mail,
  Award,
  CheckCircle2,
  FileCheck,
  Lock,
  Percent,
  Coins,
  Scale,
  Sparkles,
  Download,
} from 'lucide-react';
import { Language, UserProfile, AppRules, InvestmentPlan, CompanyProfile } from '../types';
import { formatINR } from '../utils/storage';
import { printDocument, downloadDocumentAsHtml } from '../utils/printHelper';
import { getStoredCompanyProfile } from '../utils/companyStorage';

interface UserAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  allUsers?: UserProfile[];
  rules: AppRules;
  plans?: InvestmentPlan[];
  companyProfile?: CompanyProfile;
  language: Language;
}

export const UserAgreementModal: React.FC<UserAgreementModalProps> = ({
  isOpen,
  onClose,
  user: initialUser,
  allUsers = [],
  rules,
  plans = [],
  companyProfile: propCompanyProfile,
  language,
}) => {
  const [docLang, setDocLang] = useState<Language>(language);
  const [activeUser, setActiveUser] = useState<UserProfile | null>(initialUser);

  // Fallback to stored company profile if prop not provided
  const profile: CompanyProfile = propCompanyProfile || getStoredCompanyProfile();

  // Sync active user when initialUser prop changes
  React.useEffect(() => {
    if (initialUser) {
      setActiveUser(initialUser);
    } else if (allUsers.length > 0) {
      setActiveUser(allUsers.find((u) => u.role === 'USER') || allUsers[0]);
    }
  }, [initialUser, allUsers]);

  if (!isOpen) return null;

  const user = activeUser || initialUser || (allUsers.length > 0 ? allUsers[0] : null);
  if (!user) return null;

  const isHi = docLang === 'hi';
  const agreementId = `GCAP-AGR-${new Date().getFullYear()}-${user.id.slice(-6).toUpperCase()}`;
  const agreementDate = user.joinedDate || new Date().toISOString().split('T')[0];

  // Dynamic Short Term & Long Term plan references from live plans
  const shortTermPlan = plans.find(
    (p) => p.durationDays > 500 || p.name.toLowerCase().includes('short') || p.id.includes('stp')
  ) || {
    name: 'GCap 641-Day Prime Short Term Growth',
    nameHi: 'जीकैप 641-दिन शॉर्ट टर्म ग्रोथ प्लान',
    durationDays: 641,
    dailyRoiPercent: 0.16,
    minAmount: 1000,
    maxAmount: 500000,
  };

  const longTermPlan = plans.find(
    (p) => p.durationDays === 365 || p.name.toLowerCase().includes('long') || p.id.includes('ltp')
  ) || {
    name: 'GCap 365-Day Long Term Royalty Asset Plan',
    nameHi: 'जीकैप 365-दिन लॉन्ग टर्म रॉयल्टी प्लान',
    durationDays: 365,
    dailyRoiPercent: 0.12,
    minAmount: 5000,
    maxAmount: 1000000,
  };

  const handlePrint = () => {
    printDocument('user-agreement-document', `GCap-Agreement-${user.loginId}-${user.name}`);
  };

  const handleDownload = () => {
    downloadDocumentAsHtml('user-agreement-document', `GCap-Agreement-${user.loginId}-${user.name}.html`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] text-slate-100 print:max-w-none print:w-full print:h-auto print:border-none print:shadow-none print:bg-white print:text-black print:overflow-visible">
        
        {/* Header - Clean, Responsive Non-Printable Controls */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-800 bg-slate-950/95 print:hidden shrink-0 space-y-3">
          {/* Top Bar: Title, ID Badge & Close Button */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-600 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
                <FileCheck className="w-5 h-5 text-slate-950" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm sm:text-base font-black text-white truncate">
                    {isHi ? 'कानूनी अनुबंध पत्र' : 'Legal Agreement'}
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold whitespace-nowrap">
                    {agreementId}
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-400 truncate mt-0.5">
                  {isHi
                    ? `पार्टनर: ${user.name} (${user.loginId})`
                    : `Investor: ${user.name} (${user.loginId})`}
                </p>
              </div>
            </div>

            <button
              id="btn-close-user-agreement"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              title={isHi ? 'बंद करें' : 'Close'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action Toolbar: User Selector (Admin), Language Toggle & Action Buttons */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-900 flex-wrap sm:flex-nowrap">
            {/* Left: User Selector for Admin */}
            {allUsers.length > 1 ? (
              <div className="w-full sm:w-auto min-w-0">
                <select
                  value={user.id}
                  onChange={(e) => {
                    const target = allUsers.find((u) => u.id === e.target.value);
                    if (target) setActiveUser(target);
                  }}
                  className="w-full sm:w-auto max-w-full sm:max-w-xs bg-slate-900 border border-slate-700/80 text-amber-300 text-xs rounded-xl px-3 py-1.5 font-bold focus:outline-none focus:ring-1 focus:ring-amber-500 truncate cursor-pointer"
                >
                  {allUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      👤 {u.name} ({u.loginId})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="hidden sm:block text-[11px] text-slate-500">
                {isHi ? 'GCap एसेट मैनेजमेंट • कानूनी प्रमाणित' : 'GCap Asset Management • Verified'}
              </div>
            )}

            {/* Right: Language Switcher + Print & Download Action Buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end ml-auto">
              {/* Language Switcher */}
              <div className="flex rounded-xl bg-slate-900 p-0.5 border border-slate-800 text-xs shrink-0">
                <button
                  type="button"
                  onClick={() => setDocLang('hi')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    isHi ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  हिन्दी
                </button>
                <button
                  type="button"
                  onClick={() => setDocLang('en')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    !isHi ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  English
                </button>
              </div>

              {/* Print / Save PDF Button */}
              <button
                id="btn-print-user-agreement"
                onClick={handlePrint}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 cursor-pointer active:scale-95 whitespace-nowrap shrink-0"
                title="Print or Save Agreement as PDF"
              >
                <Printer className="w-4 h-4" />
                <span>{isHi ? 'प्रिंट / PDF' : 'Print / PDF'}</span>
              </button>

              {/* Download File Button */}
              <button
                id="btn-download-user-agreement"
                onClick={handleDownload}
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shrink-0"
                title={isHi ? 'दस्तावेज़ डाउनलोड करें' : 'Download Document'}
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span className="hidden md:inline">{isHi ? 'डाउनलोड' : 'Download'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* PRINTABLE AGREEMENT BODY */}
        <div id="user-agreement-document" className="p-6 sm:p-8 overflow-y-auto space-y-6 text-sm flex-1 bg-slate-900 text-slate-200 print:bg-white print:text-black print:p-8 print:space-y-5 print:overflow-visible">
          
          {/* Official Letterhead Header */}
          <div className="border-b-2 border-amber-500/50 print:border-black pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-black flex items-center justify-center text-base print:border print:border-black">
                  {profile.companyName ? profile.companyName.charAt(0).toUpperCase() : 'G'}
                </div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white print:text-black font-sans">
                  {profile.companyName || 'GCAP ASSET MANAGEMENT PVT. LTD.'}
                </h1>
              </div>

              {profile.companyNameHi && (
                <p className="text-xs text-amber-300 print:text-slate-800 font-medium">
                  {profile.companyNameHi}
                </p>
              )}

              {profile.registeredAddress && (
                <p className="text-xs text-slate-300 print:text-slate-700 font-medium">
                  Reg. Corporate Office: {profile.registeredAddress}
                </p>
              )}

              {/* Conditionally render only filled identifiers */}
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-400 print:text-slate-600 font-mono">
                {profile.cin && <span>CIN: {profile.cin}</span>}
                {profile.pan && <span>• PAN: {profile.pan}</span>}
                {profile.tan && <span>• Tax TAN: {profile.tan}</span>}
                {profile.gstin && <span>• GST: {profile.gstin}</span>}
                {(profile.supportEmail || rules.supportEmail) && (
                  <span>• Support: {profile.supportEmail || rules.supportEmail}</span>
                )}
                {(profile.supportPhone || rules.supportPhone) && (
                  <span>| {profile.supportPhone || rules.supportPhone}</span>
                )}
              </div>
            </div>

            <div className="text-left sm:text-right font-mono text-xs space-y-0.5 bg-slate-950/60 print:bg-slate-50 p-2.5 rounded-xl border border-slate-800 print:border-slate-300">
              <div className="text-amber-400 print:text-amber-900 font-bold">
                {isHi ? 'अनुबंध संदर्भ संख्या:' : 'Agreement Ref ID:'}
              </div>
              <div className="text-white print:text-black font-black text-sm">{agreementId}</div>
              <div className="text-slate-400 print:text-slate-600 text-[11px]">
                {isHi ? `पंजीकरण तिथि: ${agreementDate}` : `Execution Date: ${agreementDate}`}
              </div>
            </div>
          </div>

          {/* Agreement Title Banner */}
          <div className="text-center py-2 bg-amber-500/10 print:bg-amber-50 border border-amber-500/30 print:border-amber-300 rounded-xl">
            <h2 className="text-base sm:text-lg font-black text-amber-300 print:text-amber-900 uppercase tracking-wide">
              {isHi
                ? 'कानूनी निवेश, परिसंपत्ति प्रबंधन एवं सेवा अनुबंध पत्र'
                : 'LEGAL ASSET MANAGEMENT, INVESTMENT & SERVICE AGREEMENT'}
            </h2>
            <p className="text-[11px] text-slate-300 print:text-slate-700 mt-0.5">
              {isHi
                ? 'सूचना प्रौद्योगिकी अधिनियम 2000 एवं भारतीय अनुबंध अधिनियम 1872 के अंतर्गत डिजिटल निष्पादित'
                : 'Digitally Executed under Information Technology Act, 2000 & Indian Contract Act, 1872'}
            </p>
          </div>

          {/* Parties Involved Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Party: GCap (Dynamic from company profile) */}
            <div className="p-4 rounded-xl bg-slate-950/80 print:bg-slate-50 border border-slate-800 print:border-slate-300 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 print:text-amber-800 font-bold text-xs uppercase tracking-wider">
                <Building2 className="w-4 h-4" />
                <span>{isHi ? 'प्रथम पक्ष (कंपनी / प्लेटफॉर्म)' : 'FIRST PARTY (PLATFORM)'}</span>
              </div>
              <div className="space-y-1 text-xs text-slate-300 print:text-slate-800">
                <p><b>{isHi ? 'कंपनी नाम:' : 'Entity Name:'}</b> {profile.companyName}</p>
                {profile.companyType && (
                  <p><b>{isHi ? 'कंपनी प्रकार:' : 'Type:'}</b> {profile.companyType}</p>
                )}
                {profile.registeredAddress && (
                  <p><b>{isHi ? 'पंजीकृत पता:' : 'Address:'}</b> {profile.registeredAddress}</p>
                )}
                {profile.cin && (
                  <p><b>{isHi ? 'सीआईएन (CIN):' : 'CIN:'}</b> {profile.cin}</p>
                )}
                {profile.pan && (
                  <p><b>{isHi ? 'पैन (PAN):' : 'PAN:'}</b> {profile.pan}</p>
                )}
                {profile.gstin && (
                  <p><b>{isHi ? 'जीएसटी (GSTIN):' : 'GSTIN:'}</b> {profile.gstin}</p>
                )}
                {profile.rocJurisdiction && (
                  <p><b>{isHi ? 'आरओसी क्षेत्राधिकार:' : 'ROC Jurisdiction:'}</b> {profile.rocJurisdiction}</p>
                )}
                <p>
                  <b>{isHi ? 'अधिकृत प्रतिनिधि:' : 'Signatory:'}</b>{' '}
                  {profile.authorizedSignatory || 'Authorized Signatory'}{' '}
                  {profile.signatoryDesignation ? `(${profile.signatoryDesignation})` : ''}
                </p>
                {profile.signatoryDin && (
                  <p><b>{isHi ? 'निदेशक डिन:' : 'Director DIN:'}</b> {profile.signatoryDin}</p>
                )}
              </div>
            </div>

            {/* Second Party: User */}
            <div className="p-4 rounded-xl bg-slate-950/80 print:bg-slate-50 border border-slate-800 print:border-slate-300 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 print:text-cyan-800 font-bold text-xs uppercase tracking-wider">
                <User className="w-4 h-4" />
                <span>{isHi ? 'द्वितीय पक्ष (पंजीकृत निवेशक / यूज़र)' : 'SECOND PARTY (INVESTOR / USER)'}</span>
              </div>
              <div className="space-y-1 text-xs text-slate-300 print:text-slate-800">
                <p><b>{isHi ? 'निवेशक का नाम:' : 'Investor Name:'}</b> <span className="font-bold text-white print:text-black">{user.name}</span></p>
                <p><b>{isHi ? 'लॉगिन आईडी:' : 'Login ID:'}</b> <span className="font-mono font-bold text-amber-300 print:text-slate-900">{user.loginId}</span></p>
                <p><b>{isHi ? 'मोबाइल नंबर:' : 'Mobile Phone:'}</b> {user.phone}</p>
                <p><b>{isHi ? 'ईमेल आईडी:' : 'Email Address:'}</b> {user.email || 'Not Provided'}</p>
                <p><b>{isHi ? 'रेफरल कोड:' : 'Referral Code:'}</b> <span className="font-mono">{user.referralCode || 'GCAP-DIRECT'}</span></p>
              </div>
            </div>
          </div>

          {/* Recitals & Preamble */}
          <div className="text-xs text-slate-300 print:text-slate-800 leading-relaxed space-y-2 border-l-2 border-amber-500 pl-3">
            <p>
              {isHi
                ? `यह अनुबंध प्रथम पक्ष (GCap) एवं द्वितीय पक्ष (${user.name}) के मध्य परस्पर सहमति से तय किया गया है। द्वितीय पक्ष द्वारा प्लेटफॉर्म पर खाता पंजीकरण एवं वॉलेट सत्यापन के पश्चात सभी वर्तमान एवं भविष्य के निवेश लेनदेन इस अनुबंध पत्र के नियमों एवं शर्तों के अधीन होंगे।`
                : `This Agreement is entered into between First Party (GCap) and Second Party (${user.name}). Upon user account creation and wallet verification, all current and subsequent financial transactions, plan activations, and profit payouts are governed strictly under the terms detailed herein.`}
            </p>
          </div>

          {/* ARTICLE 1: PLATFORM OPERATIONAL RULES & POLICIES (Dynamic from live rules) */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-black text-amber-400 print:text-black uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 print:border-slate-300 pb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>{isHi ? 'अनुच्छेद 1: प्लेटफॉर्म संचालन एवं पूंजी सुरक्षा नियम (Platform Policies)' : 'ARTICLE 1: PLATFORM OPERATIONAL POLICIES & CAPITAL GUARANTEE'}</span>
            </h3>

            <div className="grid grid-cols-1 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950/60 print:bg-slate-50 border border-slate-800 print:border-slate-200">
                <b className="text-white print:text-black">1.1 {isHi ? 'मूलधन वापसी गारंटी (100% Capital Refund Guarantee):' : '100% Principal Capital Refund:'}</b>
                <p className="text-slate-300 print:text-slate-700 mt-0.5">
                  {isHi
                    ? `प्लान की निर्धारित अवधि (Duration) समाप्त होते ही निवेशक का 100% मूलधन (Principal Amount) बिना किसी कटौती के सीधे मुख्य वॉलेट में वापस क्रेडिट किया जाएगा (${rules.capitalReturnPolicyLabelHi})।`
                    : `Upon successful completion of the investment maturity period, 100% of the invested principal is unconditionally refunded into the investor's wallet (${rules.capitalReturnPolicyLabel}).`}
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/60 print:bg-slate-50 border border-slate-800 print:border-slate-200">
                <b className="text-white print:text-black">1.2 {isHi ? 'दैनिक रिटर्न एवं 6-घंटे का क्रेडिट चक्र (Accrual Cycle):' : 'Accrual & 6-Hour Return Cycle:'}</b>
                <p className="text-slate-300 print:text-slate-700 mt-0.5">
                  {isHi
                    ? `प्लान सक्रिय होने के 24 घंटे के प्रारंभिक सुरक्षा लॉक के बाद, हर 6 घंटे में 1 किस्त (प्रति 24 घंटे में कुल 4 किस्तें) स्वतः निवेशक के वॉलेट में संचित होती हैं (${rules.dailyPayoutCycleHi})।`
                    : `Following the initial 24-hour security activation lock, ROI accrues in 6-hour cycles (4 payouts per 24 hours) directly to investor's claimable earnings (${rules.dailyPayoutCycle}).`}
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/60 print:bg-slate-50 border border-slate-800 print:border-slate-200">
                <b className="text-white print:text-black">1.3 {isHi ? 'वॉलेट सुरक्षा एवं GP स्वैप प्रणाली (GP Token Economy):' : 'Wallet Security & GP Swap Mechanism:'}</b>
                <p className="text-slate-300 print:text-slate-700 mt-0.5">
                  {isHi
                    ? `वर्तमान विनिमय दर ₹1 INR = ${rules.gpRatePerRupee ?? 1.0} GP है। बैंक द्वारा जमा की गई कैश राशि का सत्यापन होने पर यूज़र इच्छानुसार GP में बदलकर कोई भी प्लान सक्रिय कर सकता है।`
                    : `The platform exchange rate is established at ₹1 INR = ${rules.gpRatePerRupee ?? 1.0} GP. Approved deposited cash balances are converted into GP to activate desired investment plans.`}
                </p>
              </div>
            </div>
          </div>

          {/* ARTICLE 2: INVESTMENT PLAN SCHEDULES (Dynamic from live plans) */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-black text-amber-400 print:text-black uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 print:border-slate-300 pb-1">
              <Percent className="w-4 h-4" />
              <span>{isHi ? 'अनुच्छेद 2: निवेश योजनाओं के विनिर्देश (Investment Plan Schedules)' : 'ARTICLE 2: INVESTMENT PLAN SCHEDULES & SPECIFICATIONS'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Short Term Plan Box */}
              <div className="p-3 rounded-xl bg-slate-950/80 print:bg-slate-50 border border-amber-500/30 print:border-slate-300 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300 print:text-amber-900">
                    {isHi ? 'योजना A: शॉर्ट टर्म ग्रोथ प्लान' : 'SCHEDULE A: SHORT TERM PLAN'}
                  </span>
                  <span className="font-mono text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">
                    {shortTermPlan.durationDays} DAYS
                  </span>
                </div>
                <ul className="text-[11px] text-slate-300 print:text-slate-700 space-y-1 list-disc list-inside">
                  <li><b>{isHi ? 'अवधि:' : 'Tenure:'}</b> {shortTermPlan.durationDays} {isHi ? 'दिन' : 'Days'}</li>
                  <li><b>{isHi ? 'दैनिक रिटर्न:' : 'Daily ROI:'}</b> {shortTermPlan.dailyRoiPercent}% {isHi ? 'प्रति दिन (0.04% प्रति 6 घंटे)' : 'per day (0.04% per 6h)'}</li>
                  <li><b>{isHi ? 'निकासी विंडो:' : 'Withdrawal:'}</b> {isHi ? 'हर माह 1 से 5 तारीख तक' : '1st to 5th of each month'}</li>
                  <li><b>{isHi ? 'परिपक्वता मूलधन:' : 'Maturity Capital:'}</b> {isHi ? '100% मूलधन पूर्ण वापसी' : '100% Principal Refund'}</li>
                </ul>
              </div>

              {/* Long Term Plan Box */}
              <div className="p-3 rounded-xl bg-slate-950/80 print:bg-slate-50 border border-emerald-500/30 print:border-slate-300 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-300 print:text-emerald-900">
                    {isHi ? 'योजना B: लॉन्ग टर्म रॉयल्टी प्लान' : 'SCHEDULE B: LONG TERM ROYALTY'}
                  </span>
                  <span className="font-mono text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">
                    {longTermPlan.durationDays} DAYS
                  </span>
                </div>
                <ul className="text-[11px] text-slate-300 print:text-slate-700 space-y-1 list-disc list-inside">
                  <li><b>{isHi ? 'अवधि:' : 'Tenure:'}</b> {longTermPlan.durationDays} {isHi ? 'दिन + रॉयल्टी सुरक्षा' : 'Days + Royalty Gateway'}</li>
                  <li><b>{isHi ? 'दैनिक रिटर्न:' : 'Daily ROI:'}</b> {longTermPlan.dailyRoiPercent}% {isHi ? 'प्रति दिन (0.03% प्रति 6 घंटे)' : 'per day (0.03% per 6h)'}</li>
                  <li><b>{isHi ? 'रॉयल्टी निकासी:' : 'Royalty Window:'}</b> {isHi ? 'हर माह 6 से 10 तारीख तक' : '6th to 10th of each month'}</li>
                  <li><b>{isHi ? 'रॉयल्टी पात्रता:' : 'Royalty Stage:'}</b> {isHi ? '1461D लॉक उपरांत आजीवन रॉयल्टी' : 'Eligible for long term royalty stream'}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* ARTICLE 3: STATUTORY TDS DEDUCTION & ADMIN FEE POLICY */}
          <div className="space-y-2">
            <h3 className="text-xs font-black text-amber-400 print:text-black uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 print:border-slate-300 pb-1">
              <Scale className="w-4 h-4" />
              <span>{isHi ? 'अनुच्छेद 3: सरकारी TDS कटौती एवं सेवा शुल्क नीति (Statutory Tax Terms)' : 'ARTICLE 3: STATUTORY TDS DEDUCTION & SERVICE CHARGE POLICY'}</span>
            </h3>

            <div className="p-3 rounded-xl bg-slate-950/80 print:bg-slate-50 border border-slate-800 print:border-slate-300 text-xs text-slate-300 print:text-slate-800 space-y-1.5">
              <p>
                <b>3.1 {isHi ? 'भारतीय आयकर अधिनियम TDS कटौती:' : 'Govt TDS Compliance (Section 194):'}</b>{' '}
                {isHi
                  ? `प्रत्येक अर्निंग एवं रॉयल्टी निकासी पर सरकारी नियमानुसार वर्तमान दर (${rules.tdsPercent}%) के तहत TDS की कटौती की जाएगी। काटी गई TDS राशि का आधिकारिक डिजिटल पेमेंट वाउचर और आयकर प्रमाणपत्र ऐप में तुरंत जारी किया जाएगा।`
                  : `All earning and royalty disbursements are subject to statutory Tax Deducted at Source (TDS) at the prevailing government rate (${rules.tdsPercent}%) pursuant to Indian Income Tax Act regulations, supported by instant digital voucher generation.`}
              </p>
              <p>
                <b>3.2 {isHi ? 'प्लेटफॉर्म सेवा शुल्क:' : 'Administrative Service Fee:'}</b>{' '}
                {isHi
                  ? `प्लेटफॉर्म द्वारा तकनीकी रखरखाव एवं त्वरित बैंक निकासी प्रक्रिया के लिए केवल ${rules.adminFeePercent ?? 2.0}% एडमिन सेवा शुल्क लागू है।`
                  : `A nominal administrative and processing service charge of ${rules.adminFeePercent ?? 2.0}% is applied to facilitate automated banking gateways.`}
              </p>
            </div>
          </div>

          {/* ARTICLE 4: DISPUTE RESOLUTION & JURISDICTION */}
          <div className="text-[11px] text-slate-400 print:text-slate-600 space-y-1">
            <p>
              <b>{isHi ? 'विवाद समाधान एवं अधिकार क्षेत्र:' : 'Dispute Resolution & Governing Law:'}</b>{' '}
              {isHi
                ? 'यह अनुबंध भारत के कानूनों द्वारा शासित होगा। किसी भी विवाद की स्थिति में मध्यस्थता एवं सुलह अधिनियम 1996 के तहत मुंबई न्यायक्षेत्र के न्यायालयों को अनन्य अधिकार होगा।'
                : 'This Agreement shall be governed by and construed in accordance with the laws of India. Courts situated at Mumbai shall have exclusive jurisdiction.'}
            </p>
          </div>

          {/* SIGNATURES & CORPORATE SEAL SECTION (Dual Signatures) */}
          <div className="pt-4 border-t-2 border-slate-700 print:border-black mt-6 space-y-4">
            <div className="text-center font-bold text-xs text-white print:text-black uppercase tracking-wider">
              {isHi ? '— दोनों पक्षों के अधिकृत हस्ताक्षर एवं डिजिटल मुहर —' : '— IN WITNESS WHEREOF, THE PARTIES HERETO HAVE EXECUTED THIS AGREEMENT —'}
            </div>

            <div className="grid grid-cols-2 gap-6 pt-2">
              {/* FIRST PARTY SIGNATURE (GCAP) */}
              <div className="p-4 rounded-xl bg-slate-950 print:bg-white border border-amber-500/40 print:border-black text-center flex flex-col items-center justify-between min-h-[160px]">
                <div className="w-full text-left">
                  <span className="text-[10px] font-bold text-amber-400 print:text-black uppercase">
                    {isHi ? 'प्रथम पक्ष / कंपनी की ओर से:' : 'FOR FIRST PARTY (GCAP):'}
                  </span>
                </div>

                {/* Digital Stamp & Sign */}
                <div className="my-2 flex flex-col items-center">
                  <div className="relative flex items-center justify-center">
                    {/* Seal Ring */}
                    <div className="w-20 h-20 rounded-full border-2 border-dashed border-amber-500 print:border-black flex flex-col items-center justify-center p-1 text-[8px] font-black uppercase text-amber-400 print:text-black text-center leading-tight">
                      <span>★ {profile.tradeName ? profile.tradeName.toUpperCase().slice(0, 15) : 'GCAP ASSET'} ★</span>
                      <span className="font-mono text-[7px] text-slate-400 print:text-black">SEAL & SIGN</span>
                      <span>{profile.sealCity || profile.city || 'MUMBAI'}</span>
                    </div>
                    {/* Simulated Signature */}
                    <div className="absolute text-amber-300 print:text-blue-900 font-serif italic text-base font-bold rotate-[-12deg] select-none">
                      {profile.authorizedSignatory ? profile.authorizedSignatory.split(' ')[0] : 'GCap Authorized'}
                    </div>
                  </div>
                </div>

                <div className="w-full text-center border-t border-slate-800 print:border-slate-400 pt-1.5 text-[10px] text-slate-300 print:text-black">
                  <p className="font-bold">{profile.authorizedSignatory || 'Authorized Signatory'}</p>
                  <p className="text-[9px] text-slate-500 print:text-slate-600 font-mono">
                    {profile.signatoryDesignation || 'Managing Director'}
                  </p>
                  <p className="text-[8px] text-slate-400 print:text-slate-700 truncate max-w-[180px] mx-auto font-mono">
                    {profile.companyName}
                  </p>
                </div>
              </div>

              {/* SECOND PARTY SIGNATURE (USER) */}
              <div className="p-4 rounded-xl bg-slate-950 print:bg-white border border-cyan-500/40 print:border-black text-center flex flex-col items-center justify-between min-h-[160px]">
                <div className="w-full text-left">
                  <span className="text-[10px] font-bold text-cyan-400 print:text-black uppercase">
                    {isHi ? 'द्वितीय पक्ष / निवेशक हस्ताक्षर:' : 'FOR SECOND PARTY (INVESTOR):'}
                  </span>
                </div>

                {/* User Signature Box */}
                <div className="my-3 w-full flex flex-col items-center justify-center">
                  <div className="w-full max-w-[200px] border-b-2 border-slate-700 print:border-black pb-1 text-center font-serif italic text-white print:text-black text-sm font-semibold">
                    {user.name}
                  </div>
                  <span className="text-[9px] text-slate-500 print:text-slate-600 mt-1">
                    {isHi ? '(हस्ताक्षर / Digital e-Sign)' : '(Investor Signature / e-Consent)'}
                  </span>
                </div>

                <div className="w-full text-center border-t border-slate-800 print:border-slate-400 pt-1.5 text-[10px] text-slate-300 print:text-black">
                  <p className="font-bold">{user.name}</p>
                  <p className="text-[9px] text-slate-500 print:text-slate-600 font-mono">Mobile: {user.phone}</p>
                </div>
              </div>
            </div>

            {/* Document Footer Hash */}
            <div className="pt-2 text-center text-[9px] font-mono text-slate-500 print:text-slate-600">
              SHA-256 Agreement Hash: {agreementId}-{user.id.slice(0, 8)}-DIGITAL-RECORD-VERIFIED
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
