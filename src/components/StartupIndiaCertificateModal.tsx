import React from 'react';
import { X, Printer, Download, ExternalLink, ShieldCheck, Award, CheckCircle2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { printDocument, downloadDocumentAsHtml } from '../utils/printHelper';
import { Language } from '../types';

interface StartupIndiaCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const StartupIndiaCertificateModal: React.FC<StartupIndiaCertificateModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  if (!isOpen) return null;
  const isHi = language === 'hi';

  const certNumber = 'DIPP285976';
  const companyName = 'GCAP (OPC) PRIVATE LIMITED';
  const incDate = '23-09-2026';
  const issueDate = '30-09-2026';
  const validUpto = '22-09-2036';
  const industry = 'Finance Technology';
  const sector = 'Business Finance';
  const verifyUrl = `https://www.startupindia.gov.in/content/sih/en/startupgov/search.html?cert=${certNumber}`;

  const handlePrint = () => {
    printDocument('printable-startup-india-certificate', `StartupIndia-Certificate-${certNumber}`);
  };

  const handleDownload = () => {
    downloadDocumentAsHtml('printable-startup-india-certificate', `StartupIndia-Certificate-${certNumber}.html`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] text-slate-100">
        
        {/* Modal Controls Header */}
        <div className="px-4 py-3 sm:px-6 sm:py-3.5 border-b border-slate-800 bg-slate-950 flex items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center font-black shadow-md">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{isHi ? 'स्टार्टअप इंडिया मान्यता प्रमाण पत्र' : 'Startup India Certificate of Recognition'}</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-500/40">
                  {certNumber}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                {isHi
                  ? 'भारत सरकार (DPIIT), वाणिज्य एवं उद्योग मंत्रालय द्वारा मान्यता प्राप्त'
                  : 'Recognized by DPIIT, Ministry of Commerce & Industry, Govt of India'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>{isHi ? 'प्रिंट / PDF' : 'Print / PDF'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white font-medium text-xs flex items-center gap-1 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">{isHi ? 'डाउनलोड' : 'Download'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Container with Printable Certificate Canvas */}
        <div className="p-3 sm:p-6 overflow-y-auto flex-1 bg-slate-950/80 flex justify-center">
          
          <div
            id="printable-startup-india-certificate"
            className="w-full max-w-[850px] bg-white text-slate-900 rounded-lg shadow-2xl relative p-6 sm:p-10 font-serif border-[12px] border-[#1a2b49] print:border-[#1a2b49] print:p-8 print:shadow-none print:max-w-none print:w-full select-none"
            style={{
              backgroundImage: 'radial-gradient(circle at center, #ffffff 0%, #fbfbfc 100%)',
            }}
          >
            {/* Inner Ornate Thin Border */}
            <div className="border border-[#1a2b49]/40 p-4 sm:p-6 relative">
              
              {/* Corner Medallions / Circles */}
              <div className="absolute -top-3.5 -left-3.5 w-7 h-7 rounded-full border-2 border-[#1a2b49] bg-white flex items-center justify-center">
                <div className="w-3.5 h-3.5 rounded-full bg-[#1a2b49]" />
              </div>
              <div className="absolute -top-3.5 -right-3.5 w-7 h-7 rounded-full border-2 border-[#1a2b49] bg-white flex items-center justify-center">
                <div className="w-3.5 h-3.5 rounded-full bg-[#1a2b49]" />
              </div>
              <div className="absolute -bottom-3.5 -left-3.5 w-7 h-7 rounded-full border-2 border-[#1a2b49] bg-white flex items-center justify-center">
                <div className="w-3.5 h-3.5 rounded-full bg-[#1a2b49]" />
              </div>
              <div className="absolute -bottom-3.5 -right-3.5 w-7 h-7 rounded-full border-2 border-[#1a2b49] bg-white flex items-center justify-center">
                <div className="w-3.5 h-3.5 rounded-full bg-[#1a2b49]" />
              </div>

              {/* Certificate Top Header Row */}
              <div className="flex items-start justify-between gap-4 mb-4">
                {/* Left: Certificate No */}
                <div className="text-left font-sans">
                  <div className="text-xs sm:text-sm font-black text-[#1a2b49] tracking-wider">
                    CERTIFICATE NO:
                  </div>
                  <div className="text-sm sm:text-base font-bold italic text-slate-700 font-mono">
                    {certNumber}
                  </div>
                </div>

                {/* Center: Ashok Stambh Emblem & Ministry */}
                <div className="text-center flex flex-col items-center">
                  <div className="w-12 h-14 sm:w-14 sm:h-16 flex items-center justify-center mb-1">
                    {/* SVG representation of Ashoka Lion Capital Stambh */}
                    <svg viewBox="0 0 100 120" className="w-full h-full text-[#1a2b49] fill-current">
                      <path d="M50 5 C45 5 40 10 40 16 C35 15 30 18 30 25 C30 32 35 37 40 38 C38 42 38 48 40 52 C35 55 35 62 40 66 C42 70 45 74 50 75 C55 74 58 70 60 66 C65 62 65 55 60 52 C62 48 62 42 60 38 C65 37 70 32 70 25 C70 18 65 15 60 16 C60 10 55 5 50 5 Z M35 80 L65 80 L68 95 L32 95 Z M25 100 L75 100 L78 110 L22 110 Z" />
                      <circle cx="50" cy="88" r="4" fill="#ffffff" />
                    </svg>
                  </div>
                  <div className="text-[9px] sm:text-[10px] font-sans font-bold tracking-widest uppercase text-slate-600">
                    सत्यमेव जयते
                  </div>
                  <div className="text-[11px] sm:text-xs font-serif font-bold text-slate-800 mt-0.5">
                    Government of India
                  </div>
                  <div className="text-[10px] sm:text-[11px] font-sans text-slate-700">
                    Ministry of Commerce & Industry
                  </div>
                  <div className="text-[9px] sm:text-[10px] font-sans text-slate-600">
                    Department for Promotion of Industry and Internal Trade
                  </div>
                </div>

                {/* Right: DPIIT #startupindia Logo */}
                <div className="text-right flex flex-col items-end">
                  <div className="flex items-center gap-1.5">
                    <div className="text-right">
                      <div className="text-base sm:text-xl font-black font-sans tracking-tight text-[#1a2b49] leading-none">
                        DPIIT
                      </div>
                      <div className="text-[11px] sm:text-xs font-sans font-bold text-orange-600 flex items-center justify-end gap-0.5">
                        <span className="text-slate-700">#</span>startup<span className="text-orange-500">india</span>
                      </div>
                    </div>
                    {/* Startup India Winglet Logo */}
                    <div className="w-5 h-7 sm:w-6 sm:h-8 flex flex-col justify-between items-center py-0.5">
                      <div className="w-2.5 h-2 bg-orange-500 rounded-sm" />
                      <div className="w-2.5 h-2 bg-blue-700 rounded-sm" />
                      <div className="w-2.5 h-2 bg-emerald-600 rounded-sm" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Ornamental Filigree Divider */}
              <div className="flex items-center justify-center my-3 text-amber-700/60">
                <div className="h-[1px] bg-gradient-to-r from-transparent via-amber-600 to-transparent flex-1" />
                <span className="px-3 text-sm">❧ ❦ ☙</span>
                <div className="h-[1px] bg-gradient-to-r from-transparent via-amber-600 to-transparent flex-1" />
              </div>

              {/* Main Title: CERTIFICATE OF RECOGNITION */}
              <div className="text-center my-3 sm:my-4">
                <h1 className="text-2xl sm:text-4xl font-serif font-black tracking-wider text-[#1a3a68] uppercase drop-shadow-sm">
                  CERTIFICATE OF RECOGNITION
                </h1>
                <div className="flex items-center justify-center my-1 text-amber-700/60">
                  <span className="text-xs">❦ ❧</span>
                </div>
              </div>

              {/* Legal Certificate Body Paragraphs */}
              <div className="text-center px-2 sm:px-6 space-y-3 sm:space-y-4 text-xs sm:text-sm text-slate-800 leading-relaxed font-serif">
                <p>
                  This is to certify that{' '}
                  <strong className="font-bold text-slate-950 font-serif italic text-sm sm:text-base underline decoration-slate-400 underline-offset-4">
                    {companyName}
                  </strong>{' '}
                  incorporated as a <em>Private Limited Company</em> on{' '}
                  <strong className="font-sans font-bold text-slate-900">{incDate}</strong>, is recognized as a
                  startup by the <strong>Department for Promotion of Industry and Internal Trade</strong>. The
                  startup is working in{' '}
                  <strong className="font-sans font-bold text-slate-900">'{industry}'</strong> Industry and{' '}
                  <strong className="font-sans font-bold text-slate-900">'{sector}'</strong> sector as
                  self-certified by them.
                </p>

                <p className="text-[11px] sm:text-xs text-slate-600 font-sans italic max-w-2xl mx-auto pt-1">
                  This certificate shall only be valid for the Entity up to Ten years from the date of its
                  incorporation only if its turnover for any of the financial years has not extended ₹ 200 Cr.
                </p>
              </div>

              {/* Bottom Meta & Verification Row */}
              <div className="mt-8 sm:mt-10 pt-4 border-t border-slate-200 flex items-center justify-between gap-4">
                {/* Date of Issue */}
                <div className="text-center flex-1">
                  <div className="text-sm sm:text-base font-bold font-sans text-slate-900 border-b border-slate-300 pb-0.5 inline-block">
                    {issueDate}
                  </div>
                  <div className="text-[10px] sm:text-xs font-sans font-black tracking-wider text-slate-500 uppercase mt-1">
                    DATE OF ISSUE
                  </div>
                </div>

                {/* Center: QR Code with Laurel Wreath */}
                <div className="text-center flex flex-col items-center flex-1">
                  <div className="p-1.5 bg-white border border-slate-300 rounded shadow-sm">
                    <QRCodeSVG
                      value={verifyUrl}
                      size={68}
                      level="M"
                      includeMargin={false}
                    />
                  </div>
                  <div className="text-[9px] font-sans font-bold text-slate-600 uppercase tracking-wider mt-1">
                    Scan to Verify
                  </div>
                </div>

                {/* Valid Upto */}
                <div className="text-center flex-1">
                  <div className="text-sm sm:text-base font-bold font-sans text-slate-900 border-b border-slate-300 pb-0.5 inline-block">
                    {validUpto}
                  </div>
                  <div className="text-[10px] sm:text-xs font-sans font-black tracking-wider text-slate-500 uppercase mt-1">
                    VALID UPTO
                  </div>
                </div>
              </div>

              {/* Official Seal Watermark Stamp */}
              <div className="mt-4 pt-2 text-center text-[9px] font-sans text-slate-500 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>
                  Official Recognition under Startup India Initiative • Department for Promotion of Industry and Internal Trade (DPIIT)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between text-xs text-slate-400 print:hidden">
          <div className="flex items-center gap-2 text-emerald-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-[11px] font-medium">
              {isHi
                ? 'प्रमाणित सरकारी मान्यता • आयकर छूट (80-IAC) व एंजेल टैक्स छूट हेतु मान्य'
                : 'Certified Govt Recognition • Eligible for 80-IAC Tax Exemption & Govt Schemes'}
            </span>
          </div>

          <a
            href="https://www.startupindia.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 underline"
          >
            <span>StartupIndia.gov.in</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
