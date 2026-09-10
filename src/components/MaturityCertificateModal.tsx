import React from 'react';
import { X, Printer, Award, ShieldCheck, CheckCircle2, Download, Building2, User, Calendar, DollarSign, RefreshCw } from 'lucide-react';
import { ActiveInvestment, Language, UserProfile, CompanyProfile } from '../types';
import { formatINR } from '../utils/storage';
import { printDocument, downloadDocumentAsHtml } from '../utils/printHelper';
import { getStoredCompanyProfile } from '../utils/companyStorage';

interface MaturityCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  investment: ActiveInvestment;
  user: UserProfile | null;
  companyProfile?: CompanyProfile;
  language: Language;
}

export const MaturityCertificateModal: React.FC<MaturityCertificateModalProps> = ({
  isOpen,
  onClose,
  investment,
  user,
  companyProfile: propCompanyProfile,
  language,
}) => {
  if (!isOpen || !investment) return null;

  const profile = propCompanyProfile || getStoredCompanyProfile();
  const isHi = language === 'hi';
  const isRoyaltyMaster = investment.certificateType === 'LTP_ROYALTY_MASTER' || investment.royaltyStage === 'COMPLETED';
  const isLtp365 = investment.certificateType === 'LTP_365D' || investment.planId === 'long-term';

  const defaultCertPrefix = isRoyaltyMaster ? 'GCAP-ROYAL-1825' : isLtp365 ? 'GCAP-LTP-365' : 'GCAP-STP-641';
  const certNumber = investment.certificateNumber || `${defaultCertPrefix}-${investment.id.slice(-6).toUpperCase()}`;
  const planCode = investment.planUniqueId || (isLtp365 ? `LTP-365D-${investment.id.slice(-5)}` : `STP-641D-${investment.id.slice(-5)}`);
  const userName = user?.name || user?.email?.split('@')[0] || 'Valued Investor';

  const totalCycles = investment.completedCyclesCount || (investment.durationDays * 4);
  const totalEarned = investment.earnedSoFar || 0;
  const totalWithdrawn = investment.totalWithdrawn || 0;
  const netEarningsRemaining = Math.max(0, totalEarned - totalWithdrawn);
  const netMaturityPayout = isRoyaltyMaster ? netEarningsRemaining : (investment.investedAmount + netEarningsRemaining);

  const certBadgeText = isRoyaltyMaster
    ? (isHi ? '👑 ग्रैंड रॉयल्टी मास्टर प्रमाण पत्र' : '👑 GRAND ROYALTY MASTER CERTIFICATE')
    : isLtp365
    ? (isHi ? '👑 365-दिवसीय लॉन्ग टर्म परिपक्वता प्रमाण पत्र' : '👑 365-DAY LONG TERM MATURITY CERTIFICATE')
    : (isHi ? '⚡ 641-दिवसीय परिपक्वता प्रमाण पत्र' : '⚡ 641-DAY SHORT TERM MATURITY CERTIFICATE');

  const certTitleText = isRoyaltyMaster
    ? (isHi ? '5-वर्षीय लाइफटाइम रॉयल्टी पूर्णता प्रमाण पत्र' : '5-YEAR LIFETIME ROYALTY COMPLETION CERTIFICATE')
    : (isHi ? 'निवेश परिपक्वता एवं सम्मान प्रमाण पत्र' : 'CERTIFICATE OF INVESTMENT COMPLETION');

  const certDescriptionText = isRoyaltyMaster
    ? (isHi
        ? `यह प्रमाणित किया जाता है कि निवेशक ${userName} ने ${profile.tradeName || profile.companyName} की 5-वर्षीय (1825-दिवसीय) लाइफटाइम रॉयल्टी योजना को शत-प्रतिशत सफलता के साथ पूर्ण कर लिया है।`
        : `This is to officially certify that ${userName} has successfully completed the 5-Year (1825-Day) Lifetime Royalty Master Term with full distinction.`)
    : isLtp365
    ? (isHi
        ? `यह प्रमाणित किया जाता है कि निवेशक ${userName} ने ${profile.tradeName || profile.companyName} की 365-दिवसीय लॉन्ग टर्म निवेश योजना को पूर्ण निष्ठा के साथ संपन्न किया है।`
        : `This is to officially certify that ${userName} has successfully completed the 365-Day Long Term Investment Term.`)
    : (isHi
        ? `यह प्रमाणित किया जाता है कि निवेशक ${userName} ने ${profile.tradeName || profile.companyName} की 641-दिवसीय शॉर्ट टर्म योजना को सफलतापूर्वक पूर्ण कर लिया है।`
        : `This is to officially certify that ${userName} has successfully completed the 641-Day Short Term Investment Term with full compliance.`);

  const handlePrint = () => {
    printDocument('certificate-print-canvas', `GCap-Certificate-${certNumber}`);
  };

  const handleDownload = () => {
    downloadDocumentAsHtml('certificate-print-canvas', `GCap-Certificate-${certNumber}.html`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white print:fixed print:inset-0">
      <div className="relative w-full max-w-3xl bg-slate-900 border-2 border-amber-500/60 rounded-3xl shadow-2xl overflow-hidden print:border-4 print:border-amber-700 print:bg-white print:text-black print:shadow-none print:w-full print:max-w-none print:rounded-none">
        
        {/* Modal Controls (Hidden in Print) */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              {isHi ? 'आधिकारिक परिपक्वता प्रमाण पत्र' : 'Official Maturity Certificate'}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="btn-print-cert"
              onClick={handlePrint}
              className="py-1.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs inline-flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>{isHi ? 'प्रिंट / PDF' : 'Print Certificate / PDF'}</span>
            </button>

            <button
              id="btn-download-cert"
              onClick={handleDownload}
              className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer"
              title="Download Certificate"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">{isHi ? 'डाउनलोड' : 'Download'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINT-READY CERTIFICATE CANVAS */}
        <div id="certificate-print-canvas" className="p-8 sm:p-12 relative bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-slate-100 print:bg-white print:text-slate-900 print:from-white print:to-white print:p-10">
          
          {/* Gold Decorative Corner Frames */}
          <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-amber-500/80 pointer-events-none print:border-amber-700"></div>
          <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-amber-500/80 pointer-events-none print:border-amber-700"></div>
          <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-amber-500/80 pointer-events-none print:border-amber-700"></div>
          <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-amber-500/80 pointer-events-none print:border-amber-700"></div>

          {/* Background Watermark Stamp */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none print:opacity-10">
            <ShieldCheck className="w-96 h-96 text-amber-400" />
          </div>

          {/* Header & Logo */}
          <div className="text-center mb-8 relative">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 text-amber-400 mb-3 shadow-inner print:bg-amber-100 print:text-amber-800">
              <Award className="w-9 h-9" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-amber-400 tracking-wider uppercase font-serif print:text-amber-800">
              {profile.companyName || 'GCAP ASSET MANAGEMENT & TRUST'}
            </h1>
            {profile.companyNameHi && (
              <p className="text-xs font-semibold text-amber-300 print:text-amber-900 mt-0.5">
                {profile.companyNameHi}
              </p>
            )}
            <div className="flex flex-wrap items-center justify-center gap-x-2 text-[11px] font-semibold text-slate-400 mt-1 uppercase tracking-wider print:text-slate-600 font-mono">
              {profile.cin && <span>CIN: {profile.cin}</span>}
              {profile.pan && <span>• PAN: {profile.pan}</span>}
              {profile.gstin && <span>• GST: {profile.gstin}</span>}
              {profile.registeredAddress && <span>• Regd: {profile.registeredAddress}</span>}
            </div>
            <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mt-3 print:bg-amber-700"></div>
          </div>

          {/* Certificate Main Title */}
          <div className="text-center my-6">
            <span className="text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 print:bg-amber-50 print:text-amber-900 print:border-amber-300">
              {certBadgeText}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-2 font-serif print:text-slate-900">
              {certTitleText}
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl mx-auto italic print:text-slate-700">
              {certDescriptionText}
            </p>
          </div>

          {/* Investor & Certificate Meta Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/70 p-4 rounded-2xl border border-amber-500/30 my-6 text-xs print:bg-amber-50/50 print:border-amber-200 print:text-slate-900">
            <div>
              <span className="text-[10px] text-slate-400 uppercase block font-semibold print:text-slate-500">
                {isHi ? 'प्रमाण पत्र संख्या:' : 'Certificate No:'}
              </span>
              <span className="font-mono font-bold text-amber-300 print:text-amber-900">{certNumber}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block font-semibold print:text-slate-500">
                {isHi ? 'यूनिक प्लान कोड:' : 'Unique Plan ID:'}
              </span>
              <span className="font-mono font-bold text-white print:text-slate-900">{planCode}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block font-semibold print:text-slate-500">
                {isHi ? 'निवेशक नाम:' : 'Investor Name:'}
              </span>
              <span className="font-bold text-white capitalize print:text-slate-900">{userName}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block font-semibold print:text-slate-500">
                {isHi ? 'जारी दिनांक:' : 'Issue Date:'}
              </span>
              <span className="font-mono font-bold text-slate-200 print:text-slate-800">
                {new Date().toISOString().split('T')[0]}
              </span>
            </div>
          </div>

          {/* Financial Breakdown Table */}
          <div className="my-6 border border-slate-800 rounded-2xl overflow-hidden print:border-slate-300">
            <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex justify-between items-center text-xs font-bold text-amber-400 print:bg-slate-100 print:text-slate-900 print:border-slate-300">
              <span>{isHi ? 'निवेश एवं परिपक्वता विवरण (Financial Statement)' : 'Investment & Payout Statement'}</span>
              <span className="font-mono text-[10px] text-slate-400 print:text-slate-600">1 GP = ₹1 INR</span>
            </div>
            <div className="p-4 bg-slate-900/90 space-y-2.5 text-xs print:bg-white print:text-slate-900">
              <div className="flex justify-between py-1 border-b border-slate-800/60 print:border-slate-200">
                <span className="text-slate-300 print:text-slate-700">{isHi ? 'योजना का नाम (Plan Name):' : 'Plan Name:'}</span>
                <span className="font-bold text-white print:text-slate-900">{investment.planName} ({investment.durationDays} Days)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60 print:border-slate-200">
                <span className="text-slate-300 print:text-slate-700">{isHi ? 'मूलधन निवेश (Invested Principal):' : 'Invested Principal:'}</span>
                <span className="font-mono font-bold text-emerald-400 print:text-emerald-800">{formatINR(investment.investedAmount)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60 print:border-slate-200">
                <span className="text-slate-300 print:text-slate-700">{isHi ? 'कुल पूर्ण चक्र (6h Cycles Completed):' : 'Total 6h Cycles:'}</span>
                <span className="font-mono font-bold text-slate-200 print:text-slate-900">{totalCycles} {isHi ? 'चक्र (0.04% GP/चक्र)' : 'Cycles'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60 print:border-slate-200">
                <span className="text-slate-300 print:text-slate-700">{isHi ? 'कुल संचित लाभ (Total Earning Generated):' : 'Total Earnings Generated:'}</span>
                <span className="font-mono font-bold text-amber-300 print:text-amber-800">+{formatINR(totalEarned)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60 print:border-slate-200">
                <span className="text-slate-300 print:text-slate-700">{isHi ? 'पूर्व में निकाला गया लाभ (Total Withdrawn):' : 'Total Earnings Withdrawn:'}</span>
                <span className="font-mono font-bold text-rose-400 print:text-rose-800">-{formatINR(totalWithdrawn)}</span>
              </div>
              <div className="flex justify-between py-2.5 bg-emerald-950/40 px-3 rounded-xl border border-emerald-500/30 text-sm font-extrabold print:bg-emerald-50 print:border-emerald-300">
                <span className="text-emerald-300 print:text-emerald-900">{isHi ? 'अंतिम परिपक्वता कुल भुगतेय (Net Maturity Payout):' : 'Net Maturity Payout:'}</span>
                <span className="font-mono text-emerald-400 print:text-emerald-800 text-base">{formatINR(netMaturityPayout)}</span>
              </div>
            </div>
          </div>

          {/* Signatures & Seal Section */}
          <div className="grid grid-cols-2 gap-6 mt-8 pt-6 border-t border-amber-500/30 text-center text-xs print:border-amber-300">
            <div>
              <div className="h-10 flex items-center justify-center">
                <span className="font-serif italic font-bold text-amber-300 text-base print:text-slate-800">
                  {profile.authorizedSignatory ? profile.authorizedSignatory : 'GCap Authorized'}
                </span>
              </div>
              <div className="w-36 h-0.5 bg-slate-700 mx-auto mb-1 print:bg-slate-400"></div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block print:text-slate-600">
                {profile.signatoryDesignation || (isHi ? 'अधिकृत हस्ताक्षरकर्ता' : 'Authorised Signatory')}
              </span>
              <span className="text-[9px] text-slate-500 block print:text-slate-500 truncate max-w-[200px] mx-auto">
                {profile.companyName}
              </span>
            </div>

            <div>
              <div className="h-10 flex items-center justify-center gap-1 text-emerald-400 font-bold print:text-emerald-800">
                <ShieldCheck className="w-5 h-5" />
                <span className="font-mono text-xs">{profile.sealCity || 'MUMBAI'} SEAL</span>
              </div>
              <div className="w-36 h-0.5 bg-slate-700 mx-auto mb-1 print:bg-slate-400"></div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block print:text-slate-600">
                {isHi ? 'प्रबंध निदेशक एवं कॉर्पोरेट मुहर' : 'Managing Director & Corporate Seal'}
              </span>
              <span className="text-[9px] text-slate-500 block print:text-slate-500">
                {profile.cin ? `CIN: ${profile.cin}` : 'Digital Seal Verified'}
              </span>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-6 text-center text-[10px] text-slate-400 print:text-slate-600">
            {isHi
              ? 'यह एक कंप्यूटर जनरेटेड आधिकारिक डिजिटल प्रमाण पत्र है। GCAP नियमों एवं शर्तों के अनुसार मान्य।'
              : 'This is a computer-generated official maturity certificate issued under GCAP Asset Management rules.'}
          </div>

        </div>

      </div>
    </div>
  );
};
