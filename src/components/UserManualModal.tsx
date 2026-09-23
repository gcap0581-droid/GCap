import React, { useRef, useState } from 'react';
import {
  X,
  Printer,
  Sparkles,
  Zap,
  ShieldCheck,
  AlertTriangle,
  Building2,
  FileCheck,
  Award,
  Download,
  BookOpen,
  Clock,
  Wallet,
  Users,
  CheckCircle2,
  Lock,
  Layers,
  HelpCircle,
  TrendingUp,
  Coins,
  ArrowUpRight,
} from 'lucide-react';
import { AppRules, InvestmentPlan, Language } from '../types';
import { formatINR } from '../utils/storage';
import { getStoredRules } from '../utils/rulesStorage';
import { printDocument, downloadDocumentAsHtml } from '../utils/printHelper';
import { getStoredPlans } from '../utils/plansStorage';

interface UserManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  rules: AppRules;
  plans?: InvestmentPlan[];
}

export const UserManualModal: React.FC<UserManualModalProps> = ({
  isOpen,
  onClose,
  language,
  rules,
  plans = [],
}) => {
  const isHi = language === 'hi';
  const manualPrintRef = useRef<HTMLDivElement>(null);
  const [docLang, setDocLang] = useState<Language>(language);

  if (!isOpen) return null;

  const activeRules = rules || getStoredRules();
  const activePlans = plans && plans.length > 0 ? plans : getStoredPlans();

  const handlePrint = () => {
    const content = manualPrintRef.current ? manualPrintRef.current.innerHTML : document.body.innerHTML;
    const printWindow = window.open('', '_blank', 'width=950,height=800');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>GCap Assets & Wealth Management - Official Operations SOP & User Manual</title>
            <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
            <style>
              @media print {
                @page { margin: 10mm; size: A4 portrait; }
                * {
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                  color-adjust: exact !important;
                }
                body {
                  background: #ffffff !important;
                  color: #000000 !important;
                  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
                  padding: 0 !important;
                  margin: 0 !important;
                }
                .print\\:hidden { display: none !important; }
                h1, h2, h3, h4, h5, h6, strong, b, th {
                  color: #000000 !important;
                  font-weight: 900 !important;
                }
                p, td, li, span, div {
                  color: #0f172a !important;
                }
                .text-white, .text-slate-100, .text-slate-200, .text-slate-300, .text-slate-400,
                .text-emerald-300, .text-emerald-400, .text-cyan-300, .text-cyan-400,
                .text-amber-300, .text-amber-400, .text-purple-300, .text-purple-400,
                .text-rose-300, .text-rose-400, .text-teal-300, .text-teal-400 {
                  color: #000000 !important;
                }
                .bg-slate-900, .bg-slate-950, .bg-slate-900\\/80, .bg-slate-950\\/80 {
                  background-color: #f8fafc !important;
                  border-color: #94a3b8 !important;
                }
                svg {
                  color: #0f172a !important;
                  stroke: #0f172a !important;
                }
              }
              body {
                background: #ffffff;
                color: #000000;
                font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                padding: 24px;
              }
            </style>
          </head>
          <body onload="setTimeout(() => { window.focus(); window.print(); window.close(); }, 600);">
            <div class="max-w-4xl mx-auto space-y-6 bg-white text-slate-900 p-8 shadow-2xl rounded-2xl border border-slate-300">
              <div class="flex items-center justify-center gap-4 pb-6 border-b-2 border-emerald-600 mb-6">
                <img src="/icon.svg" alt="GCap Logo" class="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500 shadow-md shrink-0" />
                <div class="text-left">
                  <h1 class="text-2xl font-black text-slate-900">GCAP ASSETS & WEALTH MANAGEMENT PRIVATE LIMITED</h1>
                  <p class="text-sm font-bold text-emerald-700 mt-0.5">OFFICIAL OPERATIONS SOP & USER MANUAL (DYNAMIC LIVE SYNC)</p>
                  <p class="text-xs text-slate-500 mt-0.5">Generated on: \${new Date().toLocaleString()} | Official Compliance Document</p>
                </div>
              </div>
              \${content}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      window.print();
    }
  };

  const handleDownload = () => {
    downloadDocumentAsHtml('user-manual-modal-printable', `GCap-Operations-SOP.html`);
  };

  const gpRate = activeRules?.gpRatePerRupee ?? 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-slate-950 flex items-center justify-center font-black shadow-md">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>{docLang === 'hi' ? 'GCap आधिकारिक यूज़र मैन्युअल और SOP' : 'GCap Official User Manual & Operations SOP'}</span>
              </h3>
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                {docLang === 'hi' ? 'लाइव सिंक और ऑटो-अपडेट सक्रिय' : 'Live Synced & Auto-Updates Active'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <div className="flex rounded-lg bg-slate-900 p-0.5 border border-slate-800 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setDocLang('hi')}
                className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                  docLang === 'hi' ? 'bg-emerald-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                हिन्दी
              </button>
              <button
                type="button"
                onClick={() => setDocLang('en')}
                className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                  docLang === 'en' ? 'bg-emerald-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                English
              </button>
            </div>

            {/* Print button */}
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700/50 transition-all cursor-pointer"
              title="Print Manual"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700/50 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content Container */}
        <div className="overflow-y-auto p-5 sm:p-8 space-y-8 flex-1 bg-slate-950" ref={manualPrintRef} id="user-manual-modal-printable">
          {/* Document Corporate Header */}
          <div className="border-b-2 border-emerald-500/40 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src="/icon.svg"
                alt="GCap Logo"
                className="w-16 h-16 rounded-2xl object-cover shadow-xl shadow-amber-500/20 border-2 border-amber-300 print:border-black shrink-0"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-white print:text-black tracking-tight">
                    GCap Assets & Wealth Management Private Limited
                  </h1>
                </div>
                <p className="text-xs sm:text-sm font-bold text-emerald-400 print:text-slate-700 mt-0.5">
                  {docLang === 'hi' 
                    ? 'आधिकारिक यूज़र मैन्युअल एवं संपूर्ण कार्यप्रणाली निर्देशिका (Standard Operating Procedure - SOP)'
                    : 'Official User Manual & Standard Operating Procedure (SOP)'}
                </p>
              </div>
            </div>
            <div className="text-right text-xs text-slate-400 print:text-slate-600 font-mono space-y-0.5 bg-slate-900/80 print:bg-slate-100 p-3 rounded-xl border border-slate-800 print:border-slate-300 shrink-0">
              <div>{docLang === 'hi' ? 'दस्तावेज़ संस्करण:' : 'Version:'} <strong className="text-emerald-300 print:text-black">v3.8 (2026 Edition)</strong></div>
              <div>{docLang === 'hi' ? 'जारी तिथि:' : 'Issue Date:'} <strong className="text-amber-300 print:text-black">{new Date().toLocaleDateString(docLang === 'hi' ? 'hi-IN' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong></div>
              <div>{docLang === 'hi' ? 'सुरक्षा प्रमाणन:' : 'Compliance:'} <strong className="text-emerald-400 print:text-black">100% RBI/MCA Compliant Model</strong></div>
            </div>
          </div>

          {/* Executive Summary Box */}
          <div className="bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 print:bg-emerald-50 p-5 rounded-2xl border border-emerald-500/30 print:border-emerald-300 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-amber-400 print:text-emerald-900 font-black text-base">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>{docLang === 'hi' ? '1. ऐप का मूल उद्देश्य एवं परिचय' : '1. Core Purpose & Introduction'}</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 print:text-slate-800 leading-relaxed">
              {docLang === 'hi' ? (
                <>
                  <strong>GCap (जी-कैप) प्लेटफ़ॉर्म</strong> एक अत्याधुनिक, पारदर्शी और 100% सुरक्षित दैनिक पूंजी वृद्धि (Daily Asset Growth) प्रणाली है। इस ऐप का मुख्य उद्देश्य आम एवं संस्थागत निवेशकों को उनके द्वारा जमा की गई पूंजी पर <strong>प्रति 6 घंटे में सुनिश्चित दैनिक लाभ (24-Hour Automated Return Payouts)</strong>, <strong>दैनिक टीम रॉयल्टी बोनस</strong> तथा <strong>प्लान अवधि समाप्ति पर 100% मूलधन वापसी (Full Capital Guarantee)</strong> प्रदान करना है।
                </>
              ) : (
                <>
                  <strong>GCap Platform</strong> is a cutting-edge, transparent, and 100% secure Daily Asset Growth system. The core objective of the platform is to provide retail and institutional investors with <strong>guaranteed 6-hour automated return payouts (4 times a day)</strong>, <strong>daily team royalty bonuses</strong>, and a <strong>100% principal refund guarantee (Full Capital Protection)</strong> upon scheme maturity.
                </>
              )}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-slate-950/80 print:bg-white p-3 rounded-xl border border-emerald-500/20 print:border-emerald-200">
                <span className="text-[10px] text-slate-400 print:text-slate-600 uppercase font-bold block">
                  {docLang === 'hi' ? 'पेआउट फ्रीक्वेंसी' : 'Payout Frequency'}
                </span>
                <strong className="text-emerald-400 print:text-emerald-800 text-xs sm:text-sm font-black">
                  {docLang === 'hi' ? 'प्रति 6 घंटे (दिन में 4 बार)' : 'Every 6 Hours (4x Daily)'}
                </strong>
              </div>
              <div className="bg-slate-950/80 print:bg-white p-3 rounded-xl border border-emerald-500/20 print:border-emerald-200">
                <span className="text-[10px] text-slate-400 print:text-slate-600 uppercase font-bold block">
                  {docLang === 'hi' ? 'निकासी समय (Withdrawal)' : 'Withdrawal Window'}
                </span>
                <strong className="text-purple-300 print:text-purple-800 text-xs sm:text-sm font-black">
                  {docLang === 'hi' ? 'हर माह 1 से 5 तारीख' : '1st to 5th of Every Month'}
                </strong>
              </div>
              <div className="bg-slate-950/80 print:bg-white p-3 rounded-xl border border-emerald-500/20 print:border-emerald-200">
                <span className="text-[10px] text-slate-400 print:text-slate-600 uppercase font-bold block">
                  {docLang === 'hi' ? 'मूलधन वापसी (Principal Refund)' : 'Capital Guarantee'}
                </span>
                <strong className="text-amber-400 print:text-amber-800 text-xs sm:text-sm font-black">
                  {docLang === 'hi' ? '100% पूर्ण मूलधन सुरक्षित' : '100% Full Capital Refunded'}
                </strong>
              </div>
            </div>
          </div>

          {/* Step-by-Step Operations Guide */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-white">
                  {docLang === 'hi' ? '2. कदम-दर-कदम संपूर्ण कार्यप्रणाली निर्देशिका' : '2. Step-by-Step Operational Instructions'}
                </h2>
                <p className="text-xs text-slate-400">
                  {docLang === 'hi' ? 'खाता शुरू करने से लेकर विथड्रॉल प्राप्त करने तक की सरल गाइड:' : 'Beginner guide from profile setup to securing your withdrawals:'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Step 1 */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-emerald-400">Step 1</span>
                <h4 className="font-extrabold text-sm text-white">
                  {docLang === 'hi' ? 'रजिस्ट्रेशन व सुरक्षित लॉगिन' : 'Registration & Secure Access'}
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed">
                  {docLang === 'hi' 
                    ? 'मोबाइल नंबर का उपयोग कर खाता खोलें। अपना मोबाइल नंबर ही आपकी यूज़र आईडी रहेगा। एक मजबूत अल्फा-न्यूमेरिक पासवर्ड निर्धारित करें।'
                    : 'Sign up using your 10-digit mobile number, which acts as your unique User ID. Set a strong, secure alphanumeric password.'}
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-emerald-400">Step 2</span>
                <h4 className="font-extrabold text-sm text-white">
                  {docLang === 'hi' ? 'वॉलेट में फंड जमा प्रक्रिया' : 'Cash Depositing Workflow'}
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed">
                  {docLang === 'hi' 
                    ? '"+ Deposit" बटन दबाएं। आधिकारिक कंपनी बैंक डिटेल्स या क्यूआर कोड पर भुगतान भेजें। 12 अंकों का यूटीआर नंबर (UTR ID) दर्ज करें।'
                    : 'Click "+ Deposit". Send payment to the company account or via UPI. Paste the 12-digit UTR verification ID to submit.'}
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-emerald-400">Step 3</span>
                <h4 className="font-extrabold text-sm text-white">
                  {docLang === 'hi' ? 'ग्रोथ पॉइंट्स (GP) में स्वैप दर' : 'GP Points Exchange (1:1)'}
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed">
                  {docLang === 'hi' 
                    ? `प्लान खरीदने हेतु नकद राशि को GP पॉइंट में बदलें। वर्तमान विनिमय दर ₹1 = ${gpRate} GP पॉइंट है। स्वैप पर कोई भी अतिरिक्त शुल्क नहीं है।`
                    : `Swap cash balance to Growth Points (GP). The exchange rate is strictly ₹1 = ${gpRate} GP. Zero hidden switching fees.`}
                </p>
              </div>

              {/* Step 4 */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-emerald-400">Step 4</span>
                <h4 className="font-extrabold text-sm text-white">
                  {docLang === 'hi' ? 'सुरक्षा सत्यापन लॉक (24 घंटे)' : '24-Hour Security Protection Lock'}
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed">
                  {docLang === 'hi' 
                    ? 'नया प्लान खरीदने पर प्रारंभिक 24 घंटे सुरक्षा ऑडिट चलता है। 24h काउंटडाउन समाप्त होते ही आपका रिटर्न चक्र सक्रिय हो जाता है।'
                    : 'Starting any plan triggers an initial 24-hour verification lock. Your 6-hour claim cycle is activated once this timer ends.'}
                </p>
              </div>
            </div>
          </div>

          {/* System Rules & Parameters Table */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-white">
                  {docLang === 'hi' ? '3. वित्तीय मापदंड, सीमाएं और नियम तालिका' : '3. Official System Rules & Financial Parameters'}
                </h2>
                <p className="text-xs text-slate-400">
                  {docLang === 'hi' ? 'कंपनी के वर्तमान संचालित नियम और निकासी लिमिट:' : 'Live verified transaction limits, tax guidelines, and schedules:'}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800 shadow-xl">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-900 text-slate-300 font-extrabold uppercase">
                  <tr>
                    <th className="p-3 border-b border-slate-800">{docLang === 'hi' ? 'विशेषता / मापदंड' : 'System Policy / Property'}</th>
                    <th className="p-3 border-b border-slate-800">{docLang === 'hi' ? 'लाइव सीमा / विवरण' : 'Enforced Limit / Dynamic Value'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  <tr>
                    <td className="p-3 font-semibold">{docLang === 'hi' ? 'GP स्वैप दर (Swap Exchange Rate)' : 'GP Swap Exchange Rate'}</td>
                    <td className="p-3 font-mono text-emerald-400 font-bold">₹1.00 = {gpRate} GP</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold">{docLang === 'hi' ? 'प्रारंभिक सत्यापन अवधि' : 'Initial Countdown Verification Lock'}</td>
                    <td className="p-3 font-mono text-cyan-400 font-bold">24 {docLang === 'hi' ? 'घंटे' : 'Hours'}</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold">{docLang === 'hi' ? 'न्यूनतम बैंक निकासी सीमा' : 'Minimum Bank Withdrawal Limit'}</td>
                    <td className="p-3 font-mono text-amber-400 font-bold">{formatINR(activeRules?.minWithdrawal ?? 100)}</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold">{docLang === 'hi' ? 'न्यूनतम निवेश राशि (Long Term)' : 'Minimum Investment (Long Term)'}</td>
                    <td className="p-3 font-mono text-white font-bold">{formatINR(10000)}</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold">{docLang === 'hi' ? 'रेफरल बोनस (स्तर L1)' : 'Direct Referral Reward (Level L1)'}</td>
                    <td className="p-3 font-mono text-teal-300 font-bold">{activeRules?.referralL1Percent ?? 5}%</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold">{docLang === 'hi' ? 'सरकारी टीडीएस कर दर' : 'Govt TDS Withholding Rate'}</td>
                    <td className="p-3 font-mono text-rose-300 font-bold">{activeRules?.tdsPercent ?? 5}%</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold">{docLang === 'hi' ? 'प्लेटफ़ॉर्म एडमिन चार्ज' : 'Standard Administration Charge'}</td>
                    <td className="p-3 font-mono text-rose-400 font-bold">{activeRules?.adminFeePercent ?? 2}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Plans Matrix */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-white">
                  {docLang === 'hi' ? '4. हमारे वर्तमान सक्रिय निवेश प्लान्स' : '4. Our Current Active Investment Schemes'}
                </h2>
                <p className="text-xs text-slate-400">
                  {docLang === 'hi' ? 'दैनिक रिटर्न, ब्याज गणना एवं कुल मेच्योरिटी अवधि:' : 'Standard daily ROI tiers, minimum values, and complete term breakups:'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {activePlans.map((p) => {
                const dailyAmt = p.minAmount * (p.dailyRoiPercent / 100);
                const totalReturnAmt = dailyAmt * (p.durationDays || 641);
                const cyclePayout = dailyAmt / 4;
                return (
                  <div
                    key={p.id}
                    className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 shadow-md relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="font-extrabold text-sm text-white">{p.name}</span>
                      <span className="text-[9px] font-black px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                        {p.dailyRoiPercent}% ROI
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[9px] text-slate-400 uppercase font-bold block">{docLang === 'hi' ? 'न्यूनतम निवेश सीमा' : 'Minimum Required Deposit'}</span>
                      <div className="text-base font-black font-mono text-amber-400">
                        {p.minAmount.toLocaleString('en-IN')} GP <span className="text-[10px] text-slate-500 font-normal">(₹{p.minAmount.toLocaleString('en-IN')})</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-300 space-y-1.5 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">{docLang === 'hi' ? 'प्रति 6h पेआउट:' : '6h Slot Return:'}</span>
                        <strong className="text-emerald-400 font-mono font-extrabold">{formatINR(cyclePayout)}</strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">{docLang === 'hi' ? 'दैनिक रिटर्न:' : 'Daily ROI Amt:'}</span>
                        <strong className="text-emerald-300 font-mono font-extrabold">{formatINR(dailyAmt)}</strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">{docLang === 'hi' ? 'कुल अवधि:' : 'Term Duration:'}</span>
                        <strong className="font-extrabold">{p.durationDays || 641} {docLang === 'hi' ? 'दिन' : 'Days'}</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Support Helpline Footer */}
          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
            <div className="space-y-0.5 text-center sm:text-left">
              <div className="font-black text-xs text-white">GCap Assets & Wealth Management Private Limited</div>
              <div>Email: support@gcapasset.com | Toll-Free: 1800-GCAP-HELP (1800-4227-4357)</div>
            </div>
            <div className="text-center sm:text-right">
              <div className="font-bold text-amber-400">Authorized Signatory</div>
              <div className="text-[10px] text-slate-500">Chief Compliance & Operations Officer</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
