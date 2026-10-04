import React, { useState } from 'react';
import { X, Printer, Award, ShieldCheck, CheckCircle2, Sparkles, Building2, Download, MessageCircle } from 'lucide-react';
import { Language } from '../../types';
import { formatINR } from '../../utils/storage';
import { getStoredCompanyProfile } from '../../utils/companyStorage';
import { OfficialCorporateSealBadge } from '../OfficialCorporateSealBadge';
import { printDocument, downloadDocumentAsHtml } from '../../utils/printHelper';
import { sendWhatsAppAlert } from '../../utils/whatsappHelper';

interface ProjectCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const ProjectCertificateModal: React.FC<ProjectCertificateModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  if (!isOpen) return null;

  const profile = getStoredCompanyProfile();
  const isHi = language === 'hi';

  // Sample data states for admin testing
  const [investorName, setInvestorName] = useState('SAMPLE INVESTOR NAME');
  const [investorId, setInvestorId] = useState('GCAP-SMP-99412');
  const [projectName, setProjectName] = useState('GCAP 641-DAY PRIME GROWTH SCHEME');
  const [principalAmount, setPrincipalAmount] = useState(100000);
  const [totalRoiPaid, setTotalRoiPaid] = useState(102560); 
  const [maturityDate, setMaturityDate] = useState(new Date().toLocaleDateString('hi-IN'));
  const [certId, setCertId] = useState('GCAP-CERT-SAMPLE-001');

  const handlePrint = () => {
    printDocument('printable-project-certificate', `GCap-Certificate-${certId}`);
  };

  const handleDownload = () => {
    downloadDocumentAsHtml('printable-project-certificate', `GCap-Certificate-${certId}.html`);
  };

  const handleWhatsAppShare = () => {
    const message = `*👑 ${profile.companyName || 'GCAP CAPITAL'} — आधिकारिक प्रोजेक्ट समापन प्रमाण पत्र*\n\n` +
      `बधाई हो *${investorName}*! 🎉\n\n` +
      `आपके निवेश प्रोजेक्ट की अवधि शत-प्रतिशत पूर्ण हो गई है:\n\n` +
      `📋 *प्रोजेक्ट:* ${projectName}\n` +
      `💵 *मूलधन निवेश:* ${formatINR(principalAmount)}\n` +
      `📈 *कुल प्राप्त रिटर्न:* +${formatINR(totalRoiPaid)}\n` +
      `💎 *100% वापस मूलधन:* ${formatINR(principalAmount)} (सुरक्षित वापस)\n` +
      `📅 *समापन तिथि:* ${maturityDate}\n` +
      `📜 *सत्यापित प्रमाणपत्र संख्या:* ${certId}\n\n` +
      `🏛️ CIN: ${profile.cin || 'U67190MH2023PTC109824'}\n\n` +
      `धन्यवाद,\n*GCAP Executive Board*`;

    sendWhatsAppAlert({ message });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] print:max-w-none print:w-full print:h-auto print:border-none print:shadow-none print:bg-white print:text-black">
        
        {/* Modal Top Bar (Hidden on Print) */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800 bg-slate-950/90 print:hidden gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                {isHi ? 'प्रोजेक्ट समापन प्रमाण पत्र नमूना (Certificate Sample)' : 'Project Completion Certificate Sample'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isHi ? 'एडमिन पैनल व्यू एवं प्रिंट सैंपल ऑप्शंस' : 'Admin View & Print Official Investment Maturity Certificate'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={handleWhatsAppShare}
              className="px-3 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-green-950/40 active:scale-95"
              title={isHi ? 'व्हाट्सएप पर प्रमाण पत्र शेयर करें' : 'Share Certificate on WhatsApp'}
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span className="hidden sm:inline">{isHi ? 'WhatsApp शेयर' : 'WhatsApp'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 sm:px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>{isHi ? 'प्रिंट करें' : 'Print'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-900/30 active:scale-95"
              title={isHi ? 'HTML / PDF फ़ाइल डाउनलोड करें' : 'Download Document'}
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">{isHi ? 'डाउनलोड' : 'Download'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Customizable Sample Bar for Admin (Hidden on Print) */}
        <div className="bg-slate-950 border-b border-slate-800 p-3.5 print:hidden space-y-2 text-xs">
          <span className="font-bold text-amber-400 text-[11px] uppercase tracking-wider block">
            {isHi ? '⚙️ एडमिन टेस्ट सैंपल डेटा (Admin Test Sample Data):' : '⚙️ Admin Sample Data Customizer:'}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">{isHi ? 'निवेशक का नाम:' : 'Investor Name:'}</label>
              <input
                type="text"
                value={investorName}
                onChange={(e) => setInvestorName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">{isHi ? 'प्रोजेक्ट का नाम:' : 'Project Name:'}</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">{isHi ? 'मूलधन निवेश (INR):' : 'Principal (INR):'}</label>
              <input
                type="number"
                value={principalAmount}
                onChange={(e) => setPrincipalAmount(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">{isHi ? 'कुल ROI ब्याज:' : 'Total Interest Paid:'}</label>
              <input
                type="number"
                value={totalRoiPaid}
                onChange={(e) => setTotalRoiPaid(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-xs"
              />
            </div>
          </div>
        </div>

        {/* CERTIFICATE PRINTABLE CONTENT */}
        <div id="printable-project-certificate" className="p-4 sm:p-6 overflow-y-auto bg-slate-950 text-slate-100 print:bg-white print:text-black print:p-10">
          
          {/* Certificate Outer Gold Border Frame */}
          <div className="relative p-5 sm:p-10 border-4 border-amber-500/60 print:border-amber-600 rounded-3xl bg-slate-900/90 print:bg-white shadow-2xl space-y-6 text-center">
            
            {/* Corner Decorative Ornaments */}
            <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-amber-400 print:border-amber-600"></div>
            <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-amber-400 print:border-amber-600"></div>
            <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-amber-400 print:border-amber-600"></div>
            <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-amber-400 print:border-amber-600"></div>

            {/* GCap Corporate Verified Certificate Band */}
            <div className="w-full max-w-2xl mx-auto rounded-xl border border-amber-500/50 print:border-amber-900 p-2.5 bg-slate-950/40 print:bg-slate-50 text-slate-200 print:text-black flex items-center justify-between text-[10px] font-mono gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="text-xs">🛡️</span>
                <span className="font-bold text-amber-300 print:text-black">GCAP CORPORATE VERIFIED CERTIFICATE</span>
              </div>
              <div className="text-right text-emerald-400 print:text-emerald-800 font-bold">
                CERT ID: GCAP-{certId.slice(-8).toUpperCase()}
              </div>
            </div>

            {/* Certificate Brand Header */}
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-3">
                <img
                  src="/assets/images/logo.jpg"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/icon.svg';
                  }}
                  alt="GCap Logo"
                  className="w-10 h-10 rounded-xl object-cover shadow-md border border-amber-400 print:border-black shrink-0"
                />
                <span className="text-2xl sm:text-3xl font-black tracking-tight text-white print:text-black font-sans">
                  {profile.companyName || 'GCAP PRIVATE LIMITED'}
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-x-2 text-[11px] text-amber-300 print:text-amber-800 uppercase tracking-widest font-mono">
                {profile.cin && <span>CIN: {profile.cin}</span>}
                {profile.pan && <span>• PAN: {profile.pan}</span>}
                {profile.gstin && <span>• GST: {profile.gstin}</span>}
                {profile.registeredAddress && <span>• {profile.registeredAddress}</span>}
              </div>
            </div>

            {/* Main Title Badge */}
            <div className="py-2 px-6 rounded-full bg-gradient-to-r from-amber-500/20 via-amber-500/40 to-amber-500/20 print:bg-amber-100 border border-amber-500/50 inline-block">
              <h2 className="text-lg sm:text-2xl font-black text-amber-300 print:text-amber-900 uppercase tracking-wide">
                {isHi ? '📜 प्रोजेक्ट समापन एवं 100% मूलधन वापसी प्रमाण पत्र' : 'OFFICIAL CERTIFICATE OF PROJECT COMPLETION'}
              </h2>
            </div>

            {/* Certification Statement */}
            <div className="space-y-3 max-w-2xl mx-auto text-sm text-slate-300 print:text-slate-800 leading-relaxed">
              <p className="text-xs text-slate-400 print:text-slate-600">
                This official certificate confirms that
              </p>
              
              <h3 className="text-xl sm:text-3xl font-extrabold text-white print:text-black tracking-tight border-b-2 border-amber-500/40 print:border-amber-600 pb-1 inline-block">
                {investorName}
              </h3>
              
              <p className="text-xs text-slate-400 print:text-slate-600">
                (Investor ID: <span className="font-mono font-bold text-amber-300 print:text-black">{investorId}</span>)
              </p>

              <p className="text-xs sm:text-sm">
                has successfully fulfilled and completed all investment terms for the project
              </p>

              <p className="font-bold text-emerald-400 print:text-emerald-800 text-base">
                {projectName}
              </p>

              <p className="text-xs text-slate-300 print:text-slate-700">
                All scheduled daily returns were 100% paid out, and the full 100% capital principal has been returned back to the investor&apos;s wallet upon plan maturity.
              </p>
            </div>

            {/* Financial Summary Table Box */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-950/80 print:bg-slate-50 border border-amber-500/30 print:border-slate-300 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 print:text-slate-600 block uppercase font-semibold">
                  {isHi ? 'मूलधन निवेश (Principal)' : 'Principal Capital'}
                </span>
                <span className="text-sm font-extrabold font-mono text-white print:text-black">
                  {formatINR(principalAmount)}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 print:text-slate-600 block uppercase font-semibold">
                  {isHi ? 'कुल प्राप्त ब्याज (ROI Paid)' : 'Total Interest Paid'}
                </span>
                <span className="text-sm font-extrabold font-mono text-emerald-400 print:text-emerald-800">
                  +{formatINR(totalRoiPaid)}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 print:text-slate-600 block uppercase font-semibold">
                  {isHi ? '100% वापस मूलधन (Refunded)' : 'Capital Refunded'}
                </span>
                <span className="text-sm font-extrabold font-mono text-blue-400 print:text-blue-800">
                  {formatINR(principalAmount)}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 print:text-slate-600 block uppercase font-semibold">
                  {isHi ? 'समापन तिथि (Maturity Date)' : 'Maturity Date'}
                </span>
                <span className="text-xs font-bold font-mono text-amber-300 print:text-slate-900">
                  {maturityDate}
                </span>
              </div>
            </div>

            {/* Official Seal & Signature Row */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-slate-800 print:border-slate-300 text-xs">
              
              {/* Security QR Code */}
              <div className="flex items-center gap-3 text-left">
                <div className="w-16 h-16 bg-white p-1 rounded-xl border border-amber-500/40 shrink-0 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full text-slate-950">
                    <rect width="100" height="100" fill="white" />
                    <rect x="10" y="10" width="25" height="25" fill="black" />
                    <rect x="65" y="10" width="25" height="25" fill="black" />
                    <rect x="10" y="65" width="25" height="25" fill="black" />
                    <rect x="15" y="15" width="15" height="15" fill="white" />
                    <rect x="70" y="15" width="15" height="15" fill="white" />
                    <rect x="15" y="70" width="15" height="15" fill="white" />
                    <rect x="40" y="40" width="20" height="20" fill="black" />
                    <rect x="65" y="65" width="25" height="25" fill="black" />
                  </svg>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-400 print:text-slate-600 block">
                    Verification QR & ID
                  </span>
                  <span className="font-mono font-bold text-amber-300 print:text-black text-xs">
                    {certId}
                  </span>
                  <span className="text-[9px] text-emerald-400 print:text-emerald-700 block font-semibold">
                    ✓ Verified on GCap Blockchain Ledger
                  </span>
                </div>
              </div>

              {/* Official Corporate Seal & Stamp Badge */}
              <div className="shrink-0 flex items-center justify-center">
                <OfficialCorporateSealBadge
                  size={110}
                  color="#4c1d95"
                  showDirectorStamp={true}
                  directorName={profile.authorizedSignatory || 'AMIT KUMAR'}
                />
              </div>

              <div className="text-right sm:text-right w-full sm:w-auto">
                <div className="h-8 font-serif italic text-amber-300 print:text-slate-900 font-bold text-base">
                  {profile.authorizedSignatory || 'Authorized Signatory'}
                </div>
                <div className="w-36 border-b border-slate-700 print:border-slate-400 my-1 mx-auto sm:ml-auto"></div>
                <span className="text-[11px] font-bold text-white print:text-black block">
                  {profile.signatoryDesignation || 'Chief Executive Officer (CEO)'}
                </span>
                <span className="text-[10px] text-slate-400 print:text-slate-600 block">
                  {profile.companyName || 'GCAP PRIVATE LIMITED'}
                </span>
              </div>

            </div>

          </div>

        </div>

        {/* Modal Bottom Actions (Hidden on Print) */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
          <p className="text-xs text-slate-400 text-center sm:text-left">
            💡 {isHi ? 'एडमिन किसी भी प्रोजेक्ट पूर्णता प्रमाण पत्र का प्रिंट, PDF या 1-क्लिक WhatsApp शेयर कर सकता है।' : 'Admin can view, print, download PDF or 1-Click WhatsApp share official certificates.'}
          </p>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
            <button
              onClick={handleWhatsAppShare}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-green-950/50 active:scale-95"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>{isHi ? '📲 WhatsApp शेयर' : '📲 Share WhatsApp'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-500/20 active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>{isHi ? 'प्रमाण पत्र प्रिंट करें' : 'Print Certificate'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-900/30 active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>{isHi ? 'PDF / डाउनलोड' : 'Download'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer active:scale-95"
            >
              {isHi ? 'बंद करें' : 'Close'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
