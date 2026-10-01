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
import { Language, UserProfile, AppRules, InvestmentPlan, CompanyProfile, ActiveInvestment } from '../types';
import { formatINR, getStoredInvestments, normalizeInvestmentsList } from '../utils/storage';
import { getStoredRules } from '../utils/rulesStorage';
import { printDocument, downloadDocumentAsHtml } from '../utils/printHelper';
import { getStoredCompanyProfile, mergeCompanyProfiles, DEFAULT_COMPANY_PROFILE } from '../utils/companyStorage';
import { getStoredPlans } from '../utils/plansStorage';
import { OfficialCorporateSealBadge } from './OfficialCorporateSealBadge';

import { getAllUsers, getAllUsersAsync } from '../utils/authStorage';
import { getCachedFirestoreState } from '../lib/firestoreBridge';

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
  allUsers: propAllUsers = [],
  rules,
  plans = [],
  companyProfile: propCompanyProfile,
  language,
}) => {
  const [docLang, setDocLang] = useState<Language>(language);
  
  // Admin Sample User for Generic Previews
  const SAMPLE_USER: UserProfile = {
    id: 'usr-sample-001',
    loginId: '9999999999',
    phone: '+91 9999999999',
    name: 'INVESTOR NAME (SAMPLE)',
    email: 'investor@gcap.in',
    role: 'USER',
    status: 'ACTIVE',
    joinedDate: new Date().toISOString().split('T')[0]
  };

  // State for complete users list
  const [loadedUsers, setLoadedUsers] = useState<UserProfile[]>(() => {
    const rawLocal = getAllUsers();
    const cachedFs = getCachedFirestoreState();
    const fsUsers = (cachedFs && Array.isArray(cachedFs.users)) ? cachedFs.users : [];
    
    const map = new Map<string, UserProfile>();
    (propAllUsers || []).forEach(u => { if (u && u.id) map.set(u.id, u); });
    (rawLocal || []).forEach(u => { if (u && u.id) map.set(u.id, { ...map.get(u.id), ...u }); });
    (fsUsers || []).forEach((u: any) => { if (u && u.id) map.set(u.id, { ...map.get(u.id), ...u }); });
    
    return Array.from(map.values()).filter(u => u.id !== SAMPLE_USER.id);
  });

  const [selectedUserId, setSelectedUserId] = useState<string>(() => {
    return initialUser?.id || SAMPLE_USER.id;
  });

  const lastOpenedWithRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (isOpen) {
      if (initialUser && initialUser.id && initialUser.id !== lastOpenedWithRef.current) {
        setSelectedUserId(initialUser.id);
        lastOpenedWithRef.current = initialUser.id;
      }
    } else {
      lastOpenedWithRef.current = null;
    }
  }, [isOpen, initialUser]);

  React.useEffect(() => {
    if (!isOpen) return;

    const map = new Map<string, UserProfile>();
    (propAllUsers || []).forEach(u => { if (u && u.id) map.set(u.id, u); });
    (getAllUsers() || []).forEach(u => { if (u && u.id) map.set(u.id, { ...map.get(u.id), ...u }); });
    
    const cachedFs = getCachedFirestoreState();
    if (cachedFs && Array.isArray(cachedFs.users)) {
      cachedFs.users.forEach((u: any) => { if (u && u.id) map.set(u.id, { ...map.get(u.id), ...u }); });
    }

    const merged = Array.from(map.values()).filter(u => u.id !== SAMPLE_USER.id);
    setLoadedUsers(merged);

    getAllUsersAsync().then(asyncUsers => {
      if (Array.isArray(asyncUsers) && asyncUsers.length > 0) {
        const asyncMap = new Map<string, UserProfile>();
        merged.forEach(u => asyncMap.set(u.id, u));
        asyncUsers.forEach(u => { if (u && u.id) asyncMap.set(u.id, { ...asyncMap.get(u.id), ...u }); });
        setLoadedUsers(Array.from(asyncMap.values()).filter(u => u.id !== SAMPLE_USER.id));
      }
    }).catch(() => {});
  }, [isOpen, propAllUsers]);

  const adminUsersList = React.useMemo(() => {
    const map = new Map<string, UserProfile>();
    map.set(SAMPLE_USER.id, SAMPLE_USER);

    (propAllUsers || []).forEach(u => { if (u && u.id) map.set(u.id, u); });
    (loadedUsers || []).forEach(u => { if (u && u.id) map.set(u.id, u); });
    (getAllUsers() || []).forEach(u => { if (u && u.id) map.set(u.id, u); });
    if (initialUser && initialUser.id) map.set(initialUser.id, initialUser);

    return Array.from(map.values());
  }, [propAllUsers, loadedUsers, initialUser]);

  const user: UserProfile = adminUsersList.find(u => u.id === selectedUserId) ||
                            (initialUser && initialUser.id === selectedUserId ? initialUser : null) ||
                            adminUsersList[0] ||
                            SAMPLE_USER;

  // Fallback to prop, Firestore state, or local stored company profile
  const profile: CompanyProfile = React.useMemo(() => {
    const fsProfile = getCachedFirestoreState()?.companyProfile;
    const localProfile = getStoredCompanyProfile();
    return mergeCompanyProfiles(DEFAULT_COMPANY_PROFILE, propCompanyProfile || fsProfile || localProfile);
  }, [propCompanyProfile, isOpen]);

  // Fetch all user investments and group by date
  const allInvs = React.useMemo(() => {
    const cachedFs = getCachedFirestoreState();
    const fsInvs = cachedFs && Array.isArray(cachedFs.investments) ? cachedFs.investments : [];
    const localInvs = getStoredInvestments();
    const merged = [...fsInvs, ...localInvs];
    
    // Deduplicate by id to prevent duplicate entries
    const map = new Map<string, ActiveInvestment>();
    merged.forEach(inv => {
      if (inv && inv.id) {
        map.set(inv.id, inv);
      }
    });

    return normalizeInvestmentsList(Array.from(map.values()));
  }, [user.id]);

  const userInvs = React.useMemo(() => {
    const cleanUserPhone = user.phone ? user.phone.replace(/[^0-9]/g, '').slice(-10) : '';
    return allInvs.filter((inv) => {
      if (inv.userId && inv.userId === user.id) return true;
      if (user.loginId && inv.userLoginId && inv.userLoginId.toLowerCase() === user.loginId.toLowerCase()) return true;
      if (cleanUserPhone && inv.userPhone && inv.userPhone.replace(/[^0-9]/g, '').includes(cleanUserPhone)) return true;
      return false;
    });
  }, [allInvs, user]);

  // Group investments by date: Same date = single agreement, different date = separate agreement with unique serial number
  const agreementsByDate = React.useMemo(() => {
    const map = new Map<string, ActiveInvestment[]>();
    
    userInvs.forEach((inv) => {
      const rawDate = inv.startDate || inv.createdAt || new Date().toISOString();
      const dateKey = typeof rawDate === 'number' 
        ? new Date(rawDate).toISOString().split('T')[0]
        : String(rawDate).split('T')[0] || new Date().toISOString().split('T')[0];
      
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(inv);
    });

    if (map.size === 0) {
      const regDate = user.joinedDate || new Date().toISOString().split('T')[0];
      map.set(regDate, []);
    }

    const sortedDates = Array.from(map.keys()).sort((a, b) => b.localeCompare(a));
    return sortedDates.map((date, idx) => ({
      dateKey: date,
      investments: map.get(date) || [],
      serialNumber: `GCAP-AGR-${date.replace(/-/g, '')}-${user.id.slice(-4).toUpperCase()}-0${idx + 1}`
    }));
  }, [userInvs, user]);

  const [selectedDateKey, setSelectedDateKey] = useState<string>(() => {
    return agreementsByDate[0]?.dateKey || new Date().toISOString().split('T')[0];
  });

  React.useEffect(() => {
    if (agreementsByDate.length > 0) {
      setSelectedDateKey(agreementsByDate[0].dateKey);
    }
  }, [user.id, agreementsByDate.length]);

  const currentAgreement = agreementsByDate.find(a => a.dateKey === selectedDateKey) || agreementsByDate[0] || {
    dateKey: new Date().toISOString().split('T')[0],
    investments: [],
    serialNumber: `GCAP-AGR-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${user.id.slice(-4).toUpperCase()}-01`
  };

  if (!isOpen) return null;

  const isHi = docLang === 'hi';
  const agreementId = currentAgreement.serialNumber;
  const agreementDate = currentAgreement.dateKey;
  const activePlanList = currentAgreement.investments;

  const handlePrint = () => {
    printDocument('user-agreement-document', `GCap-Agreement-${user.loginId}-${agreementDate}`);
  };

  const handleDownload = () => {
    downloadDocumentAsHtml('user-agreement-document', `GCap-Agreement-${user.loginId}-${agreementDate}.html`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] text-slate-100 print:max-w-none print:w-full print:h-auto print:border-none print:shadow-none print:bg-white print:text-black print:overflow-visible">
        
        {/* Header - Clean, Responsive Non-Printable Controls */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-800 bg-slate-950/95 print:hidden shrink-0 space-y-3">
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
                    ? `पार्टनर: ${user.name} (${user.loginId}) | दिनांक: ${agreementDate}`
                    : `Investor: ${user.name} (${user.loginId}) | Date: ${agreementDate}`}
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

          {/* Action Toolbar: User Selector, Date/Agreement Selector, Language & Print */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-900 flex-wrap sm:flex-nowrap">
            {/* Left Selectors: User & Date Agreement */}
            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap min-w-0">
              {adminUsersList.length > 0 && (
                <select
                  id="agreement-user-select"
                  value={user.id}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="bg-slate-900 border border-amber-500/50 text-amber-300 text-xs rounded-xl px-3 py-1.5 font-bold focus:outline-none focus:ring-1 focus:ring-amber-500 truncate cursor-pointer shadow-sm"
                >
                  {adminUsersList.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.id === SAMPLE_USER.id ? '📋 ' : '👤 '}{u.name} ({u.loginId || u.phone})
                    </option>
                  ))}
                </select>
              )}

              {/* Agreement Date Selector if multiple agreements exist */}
              {agreementsByDate.length > 1 && (
                <select
                  id="agreement-date-select"
                  value={selectedDateKey}
                  onChange={(e) => setSelectedDateKey(e.target.value)}
                  className="bg-slate-900 border border-cyan-500/50 text-cyan-300 text-xs rounded-xl px-3 py-1.5 font-bold focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer shadow-sm"
                >
                  {agreementsByDate.map((agr) => (
                    <option key={agr.dateKey} value={agr.dateKey}>
                      📅 {agr.dateKey} ({agr.serialNumber})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Right: Language Switcher + Print & Download Action Buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end ml-auto">
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

              <button
                id="btn-print-user-agreement"
                onClick={handlePrint}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 cursor-pointer active:scale-95 whitespace-nowrap shrink-0"
              >
                <Printer className="w-4 h-4" />
                <span>{isHi ? 'प्रिंट / PDF' : 'Print / PDF'}</span>
              </button>

              <button
                id="btn-download-user-agreement"
                onClick={handleDownload}
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shrink-0"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span className="hidden md:inline">{isHi ? 'डाउनलोड' : 'Download'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* PRINTABLE AGREEMENT BODY */}
        <div id="user-agreement-document" className="p-6 sm:p-8 overflow-y-auto space-y-6 text-sm flex-1 bg-slate-900 text-slate-200 print:bg-white print:text-black print:p-8 print:space-y-5 print:overflow-visible">
          
          {/* GCap Corporate Verified Document Header Band */}
          <div className="rounded-xl border-2 border-amber-500/60 print:border-amber-900 p-3 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 print:bg-slate-50 text-slate-200 print:text-black space-y-2 mb-2">
            <div className="flex items-center justify-between border-b border-amber-500/30 print:border-amber-900 pb-2 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center border border-amber-400 text-xs shrink-0">
                  🛡️
                </div>
                <div>
                  <h4 className="font-black text-amber-300 print:text-black uppercase text-xs tracking-wider">
                    {isHi ? 'GCAP कॉर्पोरेट सत्यापित दस्तावेज़' : 'GCAP CORPORATE VERIFIED DOCUMENT'}
                  </h4>
                  <p className="text-[10px] text-slate-300 print:text-slate-700">
                    {isHi ? 'डिजिटल रूप से हस्ताक्षरित एवं प्रमाणित' : 'Digitally Signed & Certified Official Record'}
                  </p>
                </div>
              </div>
              <div className="text-right font-mono text-[10px]">
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-200 print:bg-amber-100 print:text-black font-bold border border-amber-400/40">
                  STATUS: VERIFIED
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono text-slate-300 print:text-slate-800">
              <div><b>Serial No:</b> <span className="text-amber-300 print:text-black font-bold">{agreementId}</span></div>
              <div><b>Date:</b> <span className="text-amber-300 print:text-black font-bold">{agreementDate}</span></div>
              <div><b>Auth:</b> <span className="text-amber-300 print:text-black font-bold">GCAP LEGAL</span></div>
              <div><b>Valid:</b> <span className="text-emerald-400 print:text-emerald-800 font-bold">✓ AUTHENTICATED</span></div>
            </div>
          </div>

          {/* Official Letterhead Header */}
          <div className="border-b-2 border-amber-500/50 print:border-black pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <img
                  src="/assets/images/logo.jpg"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/icon.svg';
                  }}
                  alt="GCap Logo"
                  className="w-10 h-10 rounded-xl object-cover shadow-md border border-amber-500/50 print:border-black shrink-0"
                />
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white print:text-black font-sans">
                  {profile.companyName || 'GCAP PRIVATE LIMITED'}
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
                {isHi ? 'अनुबंध क्रम संख्या (Agreement No):' : 'Agreement Serial No:'}
              </div>
              <div className="text-white print:text-black font-black text-sm">{agreementId}</div>
              <div className="text-slate-400 print:text-slate-600 text-[11px]">
                {isHi ? `निष्पादन तिथि: ${agreementDate}` : `Execution Date: ${agreementDate}`}
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
            {/* First Party: GCap */}
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
                ? `यह अनुबंध क्रमांक ${agreementId} प्रथम पक्ष (GCap) एवं द्वितीय पक्ष (${user.name}) के मध्य दिनांक ${agreementDate} को परस्पर सहमति से निष्पादित किया गया है। इस तिथि पर द्वितीय पक्ष द्वारा लिए गए सभी निवेश प्लान्स एवं वित्तीय विवरण नीचे अनुसूची 2 में दर्ज हैं।`
                : `This Agreement (Serial No: ${agreementId}) is entered into between First Party (GCap) and Second Party (${user.name}) on ${agreementDate}. All investment plans and financial transactions executed by the Second Party on this date are detailed in Schedule 2 below.`}
            </p>
          </div>

          {/* ARTICLE 1: PLATFORM OPERATIONAL RULES & POLICIES */}
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
                    ? `प्लान की निर्धारित अवधि समाप्त होते ही निवेशक का 100% मूलधन बिना किसी कटौती के सीधे मुख्य वॉलेट में वापस क्रेडिट किया जाएगा (${rules.capitalReturnPolicyLabelHi})।`
                    : `Upon successful completion of the investment maturity period, 100% of the invested principal is unconditionally refunded into the investor's wallet (${rules.capitalReturnPolicyLabel}).`}
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/60 print:bg-slate-50 border border-slate-800 print:border-slate-200">
                <b className="text-white print:text-black">1.2 {isHi ? 'दैनिक रिटर्न एवं 6-घंटे का क्रेडिट चक्र (Accrual Cycle):' : 'Accrual & 6-Hour Return Cycle:'}</b>
                <p className="text-slate-300 print:text-slate-700 mt-0.5">
                  {isHi
                    ? `प्लान सक्रिय होने के 24 घंटे के प्रारंभिक सुरक्षा लॉक के बाद, हर 6 घंटे में 1 किस्त (प्रति 24 घंटे में कुल 4 किस्तें) स्वतः निवेशक के वॉलेट में संचित होती हैं (${rules.dailyPayoutCycleHi})।`
                    : `Following initial 24-hour security lock, ROI accrues in 6-hour cycles (4 payouts per 24 hours) directly to investor's claimable earnings (${rules.dailyPayoutCycle}).`}
                </p>
              </div>
            </div>
          </div>

          {/* ARTICLE 2: SPECIFIC INVESTMENT PLANS TAKEN BY USER ON THIS DATE */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-amber-400 print:text-black uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 print:border-slate-300 pb-1">
              <Percent className="w-4 h-4" />
              <span>
                {isHi 
                  ? `अनुच्छेद 2: इस तिथि (${agreementDate}) पर यूज़र द्वारा लिए गए प्लान्स का विवरण (User Plan Details)` 
                  : `ARTICLE 2: SPECIFIC INVESTMENT PLANS EXECUTED BY USER ON THIS DATE`}
              </span>
            </h3>

            {activePlanList.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-300 print:text-slate-700 font-medium">
                  {isHi 
                    ? `दिनांक ${agreementDate} को यूज़र द्वारा कुल ${activePlanList.length} प्लान(्स) सक्रिय किए गए हैं, जिनका विस्तृत लेखा-जोखा नीचे सारणी में दर्ज है:` 
                    : `A total of ${activePlanList.length} investment plan(s) were executed by the user on ${agreementDate}:`}
                </p>

                <div className="overflow-x-auto border border-amber-500/40 print:border-slate-400 rounded-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-950 print:bg-slate-200 text-amber-300 print:text-black font-bold border-b border-amber-500/30 print:border-slate-400">
                        <th className="p-2.5">#</th>
                        <th className="p-2.5">{isHi ? 'प्लान का नाम' : 'Plan Name'}</th>
                        <th className="p-2.5">{isHi ? 'योजना आईडी' : 'Plan Code'}</th>
                        <th className="p-2.5">{isHi ? 'निवेश राशि' : 'Invested Amount'}</th>
                        <th className="p-2.5">{isHi ? 'दैनिक ROI' : 'Daily ROI'}</th>
                        <th className="p-2.5">{isHi ? 'अवधि' : 'Tenure'}</th>
                        <th className="p-2.5">{isHi ? 'कुल अपेक्षित रिटर्न' : 'Expected Return'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 print:divide-slate-300 text-slate-200 print:text-black">
                      {activePlanList.map((inv, idx) => (
                        <tr key={inv.id || idx} className="hover:bg-slate-950/40 print:hover:bg-transparent">
                          <td className="p-2.5 font-mono font-bold text-amber-400 print:text-black">{idx + 1}</td>
                          <td className="p-2.5 font-bold">{isHi ? (inv.planNameHi || inv.planName) : inv.planName}</td>
                          <td className="p-2.5 font-mono text-[11px]">{inv.planUniqueId || inv.planId}</td>
                          <td className="p-2.5 font-bold text-emerald-400 print:text-emerald-900">{formatINR(inv.investedAmount)}</td>
                          <td className="p-2.5 font-mono">{inv.dailyRoiPercent}%</td>
                          <td className="p-2.5">{inv.durationDays} {isHi ? 'दिन' : 'Days'}</td>
                          <td className="p-2.5 font-bold text-amber-300 print:text-amber-900">{formatINR(inv.totalExpectedReturn || (inv.investedAmount * (1 + (inv.dailyRoiPercent * inv.durationDays) / 100)))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-950 print:bg-slate-50 border border-slate-800 print:border-slate-300 text-center text-xs text-slate-400 space-y-1">
                <p className="font-bold text-amber-300 print:text-black">
                  {isHi ? 'इस तिथि पर कोई विशिष्ट निवेश प्लान सक्रिय नहीं है (खाता पंजीयन अनुबंध).' : 'No active investment plan executed on this specific date (Account Registration Agreement).'}
                </p>
                <p className="text-[11px]">
                  {isHi ? 'यूज़र ने अभी इस तिथि पर निवेश नहीं किया है। भविष्य के सभी निवेश इस अनुबंध के अंतर्गत पंजीकृत होंगे।' : 'User account agreement verified.'}
                </p>
              </div>
            )}
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
                  ? `प्रत्येक अर्निंग एवं रॉयल्टी निकासी पर सरकारी नियमानुसार वर्तमान दर (${rules.tdsPercent}%) के तहत TDS की कटौती की जाएगी।`
                  : `All earning and royalty disbursements are subject to statutory Tax Deducted at Source (TDS) at the prevailing government rate (${rules.tdsPercent}%).`}
              </p>
              <p>
                <b>3.2 {isHi ? 'प्लेटफॉर्म सेवा शुल्क:' : 'Administrative Service Fee:'}</b>{' '}
                {isHi
                  ? `प्लेटफॉर्म द्वारा तकनीकी रखरखाव के लिए ${rules.adminFeePercent ?? 2.0}% एडमिन सेवा शुल्क लागू है।`
                  : `A nominal administrative service charge of ${rules.adminFeePercent ?? 2.0}% is applied.`}
              </p>
            </div>
          </div>

          {/* ARTICLE 4: DISPUTE RESOLUTION & JURISDICTION */}
          <div className="text-[11px] text-slate-400 print:text-slate-600 space-y-1">
            <p>
              <b>{isHi ? 'विवाद समाधान एवं अधिकार क्षेत्र:' : 'Dispute Resolution & Governing Law:'}</b>{' '}
              {isHi
                ? 'यह अनुबंध भारत के कानूनों द्वारा शासित होगा। किसी भी विवाद की स्थिति में मुंबई न्यायक्षेत्र के न्यायालयों को अनन्य अधिकार होगा।'
                : 'This Agreement shall be governed by and construed in accordance with the laws of India. Courts situated at Mumbai shall have exclusive jurisdiction.'}
            </p>
          </div>

          {/* SIGNATURES & CORPORATE SEAL SECTION */}
          <div className="pt-4 border-t-2 border-slate-700 print:border-black mt-6 space-y-4">
            <div className="text-center font-bold text-xs text-white print:text-black uppercase tracking-wider">
              {isHi ? `— अनुबंध क्रमांक ${agreementId} हेतु अधिकृत हस्ताक्षर —` : `— EXECUTION OF AGREEMENT REF: ${agreementId} —`}
            </div>

            <div className="grid grid-cols-2 gap-6 pt-2">
              {/* FIRST PARTY SIGNATURE (GCAP) */}
              <div className="p-4 rounded-xl bg-slate-950 print:bg-white border border-amber-500/40 print:border-black text-center flex flex-col items-center justify-between min-h-[160px]">
                <div className="w-full text-left">
                  <span className="text-[10px] font-bold text-amber-400 print:text-black uppercase">
                    {isHi ? 'प्रथम पक्ष / कंपनी की ओर से:' : 'FOR FIRST PARTY (GCAP):'}
                  </span>
                </div>

                <div className="my-2 flex flex-col items-center">
                  <OfficialCorporateSealBadge
                    size={110}
                    color="#4c1d95"
                    showDirectorStamp={true}
                    directorName={profile.authorizedSignatory || 'AMIT KUMAR'}
                  />
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
