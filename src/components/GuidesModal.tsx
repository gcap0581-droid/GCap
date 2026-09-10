import React, { useState } from 'react';
import {
  X,
  FileText,
  Printer,
  Download,
  Check,
  ShieldCheck,
  Clock,
  HelpCircle,
  Zap,
  TrendingUp,
  Building2,
  Lock,
  Percent,
  Calculator,
  ExternalLink,
  Award,
  ChevronRight,
  Share2,
} from 'lucide-react';
import { Language, AppRules, InvestmentPlan } from '../types';
import { formatINR } from '../utils/storage';
import { printDocument, downloadDocumentAsHtml } from '../utils/printHelper';

interface GuidesModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  rules: AppRules;
  plans?: InvestmentPlan[];
  initialGuide?: 'SHORT_TERM' | 'LONG_TERM' | 'TDS_REFUND';
}

export const GuidesModal: React.FC<GuidesModalProps> = ({
  isOpen,
  onClose,
  language,
  rules,
  plans = [],
  initialGuide = 'SHORT_TERM',
}) => {
  const isHi = language === 'hi';
  const [activeGuide, setActiveGuide] = useState<'SHORT_TERM' | 'LONG_TERM' | 'TDS_REFUND'>(initialGuide);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    printDocument('guide-print-content', `GCap-${activeGuide}-Guide`);
  };

  const handleDownload = () => {
    downloadDocumentAsHtml('guide-print-content', `GCap-${activeGuide}-Guide.html`);
  };

  const adminCharge = rules?.adminFeePercent ?? 2.0;
  const currentTdsRate = rules?.tdsPercent !== undefined && rules.tdsPercent > 0 ? rules.tdsPercent : 5.0;

  // Dynamic Short Term Plan (e.g. 641D)
  const shortPlan = plans.find(
    (p) => p.durationDays > 500 || p.name.toLowerCase().includes('short') || p.id.includes('stp')
  ) || {
    name: 'GCap 641-Day Prime Short Term',
    nameHi: 'GCap 641-दिन शॉर्ट टर्म योजना',
    durationDays: 641,
    dailyRoiPercent: 0.16,
    minAmount: 1000,
    maxAmount: 500000,
  };

  // Dynamic Long Term Plan (e.g. 365D)
  const longPlan = plans.find(
    (p) => p.durationDays === 365 || p.name.toLowerCase().includes('long') || p.id.includes('ltp')
  ) || {
    name: 'GCap 365-Day Long Term Asset Plan',
    nameHi: 'GCap 365-दिन लॉन्ग टर्म एसेट प्लान',
    durationDays: 365,
    dailyRoiPercent: 0.35,
    minAmount: 5000,
    maxAmount: 1000000,
  };

  // Calculation for ₹1,00,000 example
  const sampleCapital = 100000;
  
  // Short term calculations
  const shortDailyPayout = (sampleCapital * shortPlan.dailyRoiPercent) / 100;
  const short6hPayout = shortDailyPayout / 4;
  const shortTotalRoi = shortDailyPayout * shortPlan.durationDays;
  const shortTotalMaturity = sampleCapital + shortTotalRoi;

  // Long term calculations
  const longDailyPayout = (sampleCapital * longPlan.dailyRoiPercent) / 100;
  const longTotalRoi = longDailyPayout * longPlan.durationDays;
  const longTotalMaturity = sampleCapital + longTotalRoi;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100">
        
        {/* Header - Non-printable controls + Print button */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/90 print:hidden shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 flex items-center justify-center font-black shadow-md">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>{isHi ? 'GCap आधिकारिक गाइड एवं पीडीएफ दस्तावेज़' : 'GCap Official Guides & Printable PDF Center'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30 font-bold">
                  PDF READY
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {isHi ? 'शॉर्ट टर्म, लॉन्ग टर्म और सरकारी TDS रिफंड की संपूर्ण जानकारी यहाँ उपलब्ध है' : 'Comprehensive guide for Short Term, Long Term & Govt TDS Return filing'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer active:scale-95"
              title="Print or Save as PDF"
            >
              <Printer className="w-4 h-4" />
              <span>{isHi ? 'प्रिंट / PDF' : 'Print / PDF'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              title="Download Document"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">{isHi ? 'डाउनलोड' : 'Download'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selection Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-4 pt-2 overflow-x-auto print:hidden shrink-0">
          <button
            onClick={() => setActiveGuide('SHORT_TERM')}
            className={`flex items-center gap-2 px-4 py-3 font-bold text-xs border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeGuide === 'SHORT_TERM'
                ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>{isHi ? '1. 641D शॉर्ट टर्म गाइड' : '1. 641D Short Term Guide'}</span>
          </button>

          <button
            onClick={() => setActiveGuide('LONG_TERM')}
            className={`flex items-center gap-2 px-4 py-3 font-bold text-xs border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeGuide === 'LONG_TERM'
                ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>{isHi ? '2. 365D लॉन्ग टर्म गाइड' : '2. 365D Long Term Guide'}</span>
          </button>

          <button
            onClick={() => setActiveGuide('TDS_REFUND')}
            className={`flex items-center gap-2 px-4 py-3 font-bold text-xs border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeGuide === 'TDS_REFUND'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4 text-cyan-400" />
            <span>{isHi ? '3. सरकारी TDS रिफंड प्रक्रिया' : '3. Govt TDS Refund Process'}</span>
          </button>
        </div>

        {/* Modal Printable Body Content */}
        <div id="guide-print-content" className="p-6 overflow-y-auto space-y-6 text-sm flex-1 bg-slate-900 text-slate-100 print:bg-white print:text-black print:p-0">
          
          {/* ==========================================
              GUIDE 1: SHORT TERM PLAN DETAILS
             ========================================== */}
          {activeGuide === 'SHORT_TERM' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Document Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60 border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-black text-xs">
                      DOC #GCAP-641D
                    </span>
                    <h2 className="text-lg font-black text-white">
                      {isHi ? 'GCap 641-दिन शॉर्ट टर्म निवेश योजना (संपूर्ण विवरण)' : 'GCap 641-Day Short Term Plan Guide'}
                    </h2>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/20 px-2.5 py-1 rounded-full border border-amber-500/30">
                    {isHi ? '100% मूलधन सुरक्षित' : '100% Capital Principal Guaranteed'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isHi
                    ? 'यह योजना 641 दिनों (लगभग 21 महीने) की अवधि के लिए निश्चित दैनिक रिटर्न और 100% मूलधन वापसी की गारंटी प्रदान करती है।'
                    : 'A 641-day fixed short term asset management plan providing daily compounded returns and 100% principal return at maturity.'}
                </p>
              </div>

              {/* Core Specifications Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>{isHi ? '1. परिपक्वता व चक्र (Duration & Cycle)' : '1. Tenure & Return Cycle'}</span>
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                    <li><b>कुल अवधि:</b> {shortPlan.durationDays} दिन ({shortPlan.durationDays} Days)</li>
                    <li><b>शुरुआती लॉक:</b> पहला 24 घंटा (Day 1 Activation)</li>
                    <li><b>क्रेडिट चक्र:</b> हर 6 घंटे में {(shortPlan.dailyRoiPercent / 4).toFixed(3)}% GP ऑटो-क्रेडिट</li>
                    <li><b>दैनिक आवृत्ति:</b> 24 घंटे में कुल 4 किस्तें</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Percent className="w-4 h-4" />
                    <span>{isHi ? '2. रिटर्न दर व मूलधन (ROI & Capital)' : '2. ROI Rates & Principal'}</span>
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                    <li><b>दैनिक रिटर्न:</b> {shortPlan.dailyRoiPercent}% प्रति दिन</li>
                    <li><b>6 घंटे का पेआउट:</b> {(shortPlan.dailyRoiPercent / 4).toFixed(3)}% प्रति चक्र</li>
                    <li><b>मूलधन वापसी:</b> {shortPlan.durationDays}वें दिन 100% मूलधन वापस</li>
                    <li><b>सर्टिफिकेट:</b> डिजिटल परिपक्वता प्रमाण-पत्र</li>
                  </ul>
                </div>
              </div>

              {/* Mathematical Example Table */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-amber-400" />
                  <span>{isHi ? `निवेश एवं रिटर्न गणना उदाहरण (${formatINR(sampleCapital)} निवेश पर):` : `Mathematical Example (For ${formatINR(sampleCapital)} Investment):`}</span>
                </h4>
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-xs text-left text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase">
                      <tr>
                        <th className="p-3">विवरण (Description)</th>
                        <th className="p-3">कैलकुलेशन (Formula)</th>
                        <th className="p-3 text-right">राशि (Amount)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 bg-slate-900 font-mono">
                      <tr>
                        <td className="p-3 font-sans font-bold text-white">मूलधन निवेश (Initial Investment)</td>
                        <td className="p-3">100% Capital Deposit</td>
                        <td className="p-3 text-right text-emerald-400 font-bold">{formatINR(sampleCapital)}</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-sans">हर 6 घंटे में क्रेडिट (Per 6-Hour Return)</td>
                        <td className="p-3">{formatINR(sampleCapital)} × {(shortPlan.dailyRoiPercent / 4).toFixed(3)}%</td>
                        <td className="p-3 text-right text-amber-300">{formatINR(short6hPayout)} / चक्र</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-sans font-semibold text-white">कुल दैनिक रिटर्न (Daily Return 24h)</td>
                        <td className="p-3">{formatINR(short6hPayout)} × 4 Times</td>
                        <td className="p-3 text-right text-amber-400 font-bold">{formatINR(shortDailyPayout)} / दिन</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-sans">{shortPlan.durationDays} दिनों का कुल मुनाफा ({shortPlan.durationDays} Days Total ROI)</td>
                        <td className="p-3">{formatINR(shortDailyPayout)} × {shortPlan.durationDays} Days</td>
                        <td className="p-3 text-right text-cyan-300 font-bold">{formatINR(shortTotalRoi)}</td>
                      </tr>
                      <tr className="bg-slate-950">
                        <td className="p-3 font-sans font-extrabold text-white">{shortPlan.durationDays}वें दिन कुल प्राप्त राशि (Total Maturity Payout)</td>
                        <td className="p-3 font-sans text-slate-400">ROI + 100% Capital Principal</td>
                        <td className="p-3 text-right text-emerald-400 font-extrabold text-sm">{formatINR(shortTotalMaturity)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Deductions at Payout Section */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider">
                  {isHi ? '💸 निकास (Payment/Withdrawal) के समय कटौतियां:' : '💸 Deductions at Time of Withdrawal:'}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="font-bold text-cyan-300 block mb-1">🏛️ 1. सरकारी TDS (Sec 194A / Sec 194BA)</span>
                    <p className="text-slate-400">
                      - ₹10,000 तक की निकासी पर: <b>5.0% TDS</b><br />
                      - ₹10,000 से अधिक की निकासी पर: <b>10.0% TDS</b><br />
                      <i>(यह राशि सीधे आपके पैन कार्ड पर आयकर विभाग में जमा होती है और ITR में रिफंड योग्य है।)</i>
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="font-bold text-purple-300 block mb-1">⚙️ 2. एडमिन सर्विस चार्ज ({adminCharge}%)</span>
                    <p className="text-slate-400">
                      - विड्रॉल राशि का <b>{adminCharge}%</b> एडमिन व बैंकिंग गेटवे प्रोसेसिंग चार्ज के रूप में कटता है।<br />
                      - यह वाउचर में पारदर्शी रूप से दर्ज होता है।
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              GUIDE 2: LONG TERM PLAN DETAILS
             ========================================== */}
          {activeGuide === 'LONG_TERM' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Document Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-black text-xs">
                      DOC #GCAP-365D
                    </span>
                    <h2 className="text-lg font-black text-white">
                      {isHi ? 'GCap 365-दिन लॉन्ग टर्म एसेट ग्रोथ प्लान' : 'GCap 365-Day Long Term Asset Plan Guide'}
                    </h2>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-500/30">
                    {isHi ? 'उच्चतम वार्षिक चक्रवृद्धि रिटर्न' : 'High Annual Compounded Yield'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isHi
                    ? '365 दिनों की वार्षिक लॉक-इन अवधि का प्रीमियम एसेट मैनेजमेंट प्लान, जिसमें आपको दैनिक उच्च रिटर्न प्राप्त होता है।'
                    : 'A 365-day annual growth plan designed for compounding high-yield returns with full maturity payout.'}
                </p>
              </div>

              {/* Core Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>{isHi ? '1. समय-सीमा एवं चक्र' : '1. Tenure & Return Frequency'}</span>
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                    <li><b>कुल अवधि:</b> {longPlan.durationDays} दिन ({longPlan.durationDays} Days)</li>
                    <li><b>शुरुआती लॉक:</b> पहला 24 घंटा (Activation Lock)</li>
                    <li><b>रिटर्न फ्रीक्वेंसी:</b> प्रतिदिन ऑटो-क्रेडिट</li>
                    <li><b>विड्रॉल विंडो:</b> हर महीने की 1 से 5 तारीख</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-teal-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>{isHi ? '2. रिटर्न एवं सुरक्षा' : '2. Return Yield & Capital Refund'}</span>
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                    <li><b>दैनिक रिटर्न:</b> {longPlan.dailyRoiPercent}% प्रति दिन</li>
                    <li><b>वार्षिक रिटर्न:</b> {(longPlan.dailyRoiPercent * longPlan.durationDays).toFixed(1)}% कुल रिटर्न</li>
                    <li><b>मूलधन वापसी:</b> {longPlan.durationDays}वें दिन 100% वापस</li>
                    <li><b>सर्टिफिकेट:</b> डिजिटल परिपक्वता प्रमाणपत्र</li>
                  </ul>
                </div>
              </div>

              {/* Long Term Table Example */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-emerald-400" />
                  <span>{isHi ? `${longPlan.durationDays}D रिटर्न गणना उदाहरण (${formatINR(sampleCapital)} निवेश पर):` : `${longPlan.durationDays}D Return Example (For ${formatINR(sampleCapital)} Investment):`}</span>
                </h4>
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-xs text-left text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase">
                      <tr>
                        <th className="p-3">विवरण</th>
                        <th className="p-3">गणना</th>
                        <th className="p-3 text-right">राशि (Amount)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 bg-slate-900 font-mono">
                      <tr>
                        <td className="p-3 font-sans font-bold text-white">मूलधन जमा (Initial Capital)</td>
                        <td className="p-3">Deposit</td>
                        <td className="p-3 text-right text-emerald-400 font-bold">{formatINR(sampleCapital)}</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-sans">दैनिक औसत रिटर्न (Daily Average Return)</td>
                        <td className="p-3">{formatINR(sampleCapital)} × {longPlan.dailyRoiPercent}%</td>
                        <td className="p-3 text-right text-emerald-300 font-bold">{formatINR(longDailyPayout)} / दिन</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-sans">{longPlan.durationDays} दिनों का कुल शुद्ध मुनाफा (Total ROI {longPlan.durationDays} Days)</td>
                        <td className="p-3">{formatINR(longDailyPayout)} × {longPlan.durationDays} Days</td>
                        <td className="p-3 text-right text-cyan-300 font-bold">{formatINR(longTotalRoi)}</td>
                      </tr>
                      <tr className="bg-slate-950">
                        <td className="p-3 font-sans font-extrabold text-white">{longPlan.durationDays}वें दिन कुल प्राप्त राशि (Total Maturity Payout)</td>
                        <td className="p-3 font-sans text-slate-400">ROI + 100% Capital Refund</td>
                        <td className="p-3 text-right text-emerald-400 font-extrabold text-sm">{formatINR(longTotalMaturity)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              GUIDE 3: GOVT TDS REFUND PROCESS
             ========================================== */}
          {activeGuide === 'TDS_REFUND' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Document Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-blue-950/60 border border-cyan-500/30 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-cyan-500 text-slate-950 font-black text-xs">
                      DOC #GOVT-TDS-REFUND
                    </span>
                    <h2 className="text-lg font-black text-white">
                      {isHi ? 'सरकारी TDS रिफंड व ITR फाइलिंग संपूर्ण मार्गदर्शिका' : 'Government Statutory TDS Filing & Refund Step-by-Step Guide'}
                    </h2>
                  </div>
                  <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-500/20 px-2.5 py-1 rounded-full border border-cyan-500/30">
                    {isHi ? '100% वैधानिक प्रक्रिया' : '100% Statutory Income Tax Law'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isHi
                    ? 'ऐप द्वारा काटा गया सरकारी TDS आपके पैन कार्ड पर भारत सरकार के आयकर विभाग में जमा होता है। इसे आप ITR फाइल करके अपने बैंक खाते में पूरा वापस पा सकते हैं।'
                    : 'All TDS deducted on payouts is deposited under your PAN Card with the Income Tax Department of India. You can claim a 100% refund into your bank account by filing an ITR.'}
                </p>
              </div>

              {/* Tax Slab Explanation Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-300">धारा 194A (Sec 194A Income Tax)</span>
                    <span className="text-xs font-bold font-mono text-cyan-400 bg-cyan-500/20 px-2 py-0.5 rounded">
                      5.0% TDS
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    <b>निकासी सीमा:</b> ₹10,000 तक की पेआउट राशि पर 5% की दर से सरकारी TDS कटता है।
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-300">धारा 194BA (Sec 194BA Online Payouts)</span>
                    <span className="text-xs font-bold font-mono text-cyan-400 bg-cyan-500/20 px-2 py-0.5 rounded">
                      10.0% TDS
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    <b>निकासी सीमा:</b> ₹10,000 से अधिक की पेआउट राशि पर 10% की दर से सरकारी TDS कटता है।
                  </p>
                </div>
              </div>

              {/* 4 Step Refund Filing Guide */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-cyan-400" />
                  <span>{isHi ? 'रिफंड प्राप्त करने के 4 आसान चरण (4 Steps to Claim TDS Refund):' : '4 Easy Steps to Get Your TDS Refund:'}</span>
                </h4>

                <div className="space-y-2.5">
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 font-bold text-xs flex items-center justify-center shrink-0">
                      1
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white">{isHi ? 'पेमेंट वाउचर एवं Form 26AS चेक करें' : '1. Check Payment Vouchers & Form 26AS'}</h5>
                      <p className="text-xs text-slate-400 mt-0.5">
                        ऐप में डाउनलोड किए गए विड्रॉल पेमेंट वाउचर सुरक्षित रखें। वित्तीय वर्ष पूरा होने पर अपने पैन कार्ड से लॉगिन करके आयकर पोर्टल पर <b>Form 26AS</b> और <b>AIS Statement</b> डाउनलोड करें।
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 font-bold text-xs flex items-center justify-center shrink-0">
                      2
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white">{isHi ? 'आयकर पोर्टल पर लॉगिन करें (incometax.gov.in)' : '2. Login to Income Tax Portal'}</h5>
                      <p className="text-xs text-slate-400 mt-0.5">
                        भारत सरकार के आधिकारिक ई-फाइलिंग पोर्टल <b>incometax.gov.in</b> पर जाएं और अपने <b>PAN Card</b> एवं पासवर्ड से लॉगिन करें।
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 font-bold text-xs flex items-center justify-center shrink-0">
                      3
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white">{isHi ? 'ITR (Income Tax Return) दाखिल करें' : '3. File Your ITR-1 or ITR-2'}</h5>
                      <p className="text-xs text-slate-400 mt-0.5">
                        31 जुलाई से पहले अपना ऑनलाइन <b>ITR Return</b> दाखिल करें। फॉर्म में अपनी आय दर्ज करें और ऐप द्वारा काटा गया कुल TDS क्लेम करें।
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0">
                      4
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-emerald-300">{isHi ? 'बैंक खाते में रिफंड जमा (Direct Bank Refund Credit)' : '4. Direct Bank Account Refund Credit'}</h5>
                      <p className="text-xs text-slate-400 mt-0.5">
                        यदि आपकी कुल वार्षिक आय ₹7,00,000 तक है, तो आपकी टैक्स देनदारी शून्य हो जाती है और आयकर विभाग काटा गया <b>100% TDS ब्याज सहित आपके बैंक खाते में जमा</b> कर देता है।
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Download / Print CTA Box */}
              <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-white block">📄 इस दस्तावेज़ को प्रिंट या PDF में सुरक्षित करें</span>
                  <span className="text-slate-400">आप कभी भी इस गाइड को प्रिंटर से प्रिंट करा सकते हैं या मोबाइल/कंप्यूटर में Save as PDF कर सकते हैं।</span>
                </div>
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-2 cursor-pointer shrink-0 transition-all shadow-lg shadow-cyan-500/20"
                >
                  <Printer className="w-4 h-4" />
                  <span>{isHi ? 'प्रिंट / PDF डाउनलोड करें' : 'Print / Save as PDF'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Footer Official Stamp on Printed PDF */}
          <div className="pt-6 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono flex-wrap gap-2 print:border-black print:text-black">
            <div>
              <b>GCap Asset Management Official Document</b> • Synchronized System Guidelines
            </div>
            <div>
              Date: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
