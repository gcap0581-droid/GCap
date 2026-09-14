import React, { useRef } from 'react';
import {
  BookOpen,
  Printer,
  Download,
  ShieldCheck,
  Zap,
  Clock,
  Wallet,
  Users,
  Award,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Coins,
  CheckCircle2,
  FileText,
  Lock,
  Layers,
  Sparkles,
  HelpCircle,
  AlertTriangle,
  Building2,
} from 'lucide-react';
import { AppRules, InvestmentPlan, Language } from '../../types';
import { formatINR } from '../../utils/storage';

interface AdminUserManualTabProps {
  language: Language;
  rules: AppRules;
  plans: InvestmentPlan[];
}

export const AdminUserManualTab: React.FC<AdminUserManualTabProps> = ({
  language,
  rules,
  plans,
}) => {
  const isHi = language === 'hi';
  const manualPrintRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const gpRate = rules?.gpRatePerRupee ?? 1;

  return (
    <div className="space-y-6">
      {/* Top Toolbar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-5 rounded-2xl border border-indigo-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 shadow-inner">
            <BookOpen className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white">
                {isHi ? '📖 GCap ऑफिशियल यूज़र मैन्युअल व कार्यप्रणाली गाइड' : '📖 GCap Official User Manual & Operations Guide'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30 text-[10px]">
                PDF / PRINT READY
              </span>
            </div>
            <p className="text-xs text-indigo-200/80 mt-1">
              {isHi
                ? 'यह विस्तृत मैन्युअल यूज़र्स के लिए ऐप की सभी सुविधाएं, कब, क्या और कैसे काम करना है (कदम-दर-कदम) संपूर्ण विवरण प्रदान करता है।'
                : 'Complete step-by-step user guide explaining all app features, operational rules, timings, GP points, and withdrawal workflow.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end md:self-auto">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>{isHi ? 'प्रिंट / PDF डाउनलोड करें' : 'Print / Save as PDF'}</span>
          </button>
        </div>
      </div>

      {/* PRINTABLE MANUAL CONTAINER */}
      <div
        ref={manualPrintRef}
        id="user-manual-printable"
        className="bg-slate-950 text-slate-100 rounded-3xl border border-slate-800 p-6 sm:p-10 shadow-2xl space-y-8 print:bg-white print:text-black print:border-0 print:p-0 print:shadow-none"
      >
        {/* Document Header */}
        <div className="border-b-2 border-indigo-500/40 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black text-2xl flex items-center justify-center shadow-lg print:border print:border-black">
              GC
            </div>
            <div>
              <h1 className="text-2xl font-black text-white print:text-black tracking-tight">
                GCap Capital Growth & Asset Management
              </h1>
              <p className="text-xs font-semibold text-indigo-400 print:text-slate-600">
                आधिकारिक यूज़र मैन्युअल एवं संपूर्ण कार्यप्रणाली निर्देशिका (Standard Operating Procedure)
              </p>
            </div>
          </div>
          <div className="text-right text-xs text-slate-400 print:text-slate-600 font-mono">
            <div>दस्तावेज़ संस्करण: <strong>v3.8 (2026 Edition)</strong></div>
            <div>जारी तिथि: <strong>{new Date().toLocaleDateString('hi-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</strong></div>
            <div>सुरक्षा प्रमाणन: <strong>100% RBI/MCA Compliant Model</strong></div>
          </div>
        </div>

        {/* Executive Summary Box */}
        <div className="bg-slate-900/90 print:bg-slate-50 p-5 rounded-2xl border border-indigo-500/30 print:border-slate-300">
          <h3 className="text-sm font-bold text-amber-400 print:text-amber-800 flex items-center gap-2 mb-1.5">
            <Sparkles className="w-4 h-4" />
            <span>ऐप का मूल उद्देश्य एवं परिचय (Introduction & Purpose)</span>
          </h3>
          <p className="text-xs text-slate-300 print:text-slate-700 leading-relaxed">
            <strong>GCap ऐप</strong> एक अत्याधुनिक, सुरक्षित एवं पारदर्शी दैनिक पूंजी वृद्धि प्लेटफ़ॉर्म है। यहाँ कोई भी साधारण निवेशक अपनी पूंजी को सुरक्षित निवेश प्लान्स में लगाकर <strong>प्रति 6 घंटे में दैनिक रिटर्न (Daily Return)</strong>, <strong>दैनिक रॉयल्टी बोनस</strong> एवं <strong>मासिक 100% बैंक/UPI निकासी (Withdrawal)</strong> का लाभ उठा सकता है। इस मैन्युअल में बताया गया है कि एक नया या मौजूदा निवेशक ऐप में कैसे काम शुरू करे, पैसे कैसे जोड़े, GP पॉइंट्स कैसे बनाए, प्लान कैसे खरीदे और समय पर अपने बैंक में विथड्रॉल कैसे ले।
          </p>
        </div>

        {/* SECTION 1: 5 SIMPLE STEPS TO WORK (क्या, कब और कैसे काम करें) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Zap className="w-5 h-5" />
            </div>
            <h2 className="text-base font-black text-white print:text-black">
              1. ऐप में काम करने के 5 सरल कदम (5 Easy Steps to Work)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {/* Step 1 */}
            <div className="p-4 rounded-xl bg-slate-900 print:bg-slate-50 border border-slate-800 print:border-slate-300 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 font-black text-sm flex items-center justify-center border border-emerald-500/30">
                1
              </div>
              <h4 className="text-xs font-bold text-white print:text-black">रजिस्ट्रेशन व लॉगिन</h4>
              <p className="text-[11px] text-slate-400 print:text-slate-600 leading-normal">
                अपने मोबाइल नंबर और पासवर्ड से खाता खोलें। रेफरल कोड होने पर अतिरिक्त साइनअप बोनस मिलता है।
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-xl bg-slate-900 print:bg-slate-50 border border-slate-800 print:border-slate-300 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 font-black text-sm flex items-center justify-center border border-cyan-500/30">
                2
              </div>
              <h4 className="text-xs font-bold text-white print:text-black">पैसे जमा (Deposit)</h4>
              <p className="text-[11px] text-slate-400 print:text-slate-600 leading-normal">
                वॉलेट में <strong>Deposit</strong> पर क्लिक करें। कंपनी के UPI/Bank में पैसे भेजकर UTR नंबर दर्ज करें।
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-xl bg-slate-900 print:bg-slate-50 border border-slate-800 print:border-slate-300 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 font-black text-sm flex items-center justify-center border border-amber-500/30">
                3
              </div>
              <h4 className="text-xs font-bold text-white print:text-black">GP पॉइंट्स में स्वैप</h4>
              <p className="text-[11px] text-slate-400 print:text-slate-600 leading-normal">
                एडमिन सत्यापन के बाद <strong>Swap to GP</strong> करें। ₹1 = {gpRate} GP पॉइंट तुरंत वॉलेट में आ जाएगा।
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-4 rounded-xl bg-slate-900 print:bg-slate-50 border border-slate-800 print:border-slate-300 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 font-black text-sm flex items-center justify-center border border-purple-500/30">
                4
              </div>
              <h4 className="text-xs font-bold text-white print:text-black">प्लान सक्रिय करें</h4>
              <p className="text-[11px] text-slate-400 print:text-slate-600 leading-normal">
                <strong>Plans</strong> टैब में जाकर अपनी पसंद का प्लान चुनें और <strong>Invest Now</strong> दबाएं।
              </p>
            </div>

            {/* Step 5 */}
            <div className="p-4 rounded-xl bg-slate-900 print:bg-slate-50 border border-slate-800 print:border-slate-300 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 font-black text-sm flex items-center justify-center border border-rose-500/30">
                5
              </div>
              <h4 className="text-xs font-bold text-white print:text-black">दैनिक रिटर्न व विथड्रॉल</h4>
              <p className="text-[11px] text-slate-400 print:text-slate-600 leading-normal">
                हर 6 घंटे में रिटर्न जमा होगा। 1 से 5 तारीख तक अपने बैंक/UPI में सीधे निकासी (Withdrawal) लें।
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 2: COMPLETE FEATURE MATRIX (ऐप में क्या-क्या सुविधाएं हैं) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
              <Layers className="w-5 h-5" />
            </div>
            <h2 className="text-base font-black text-white print:text-black">
              2. ऐप की प्रमुख सुविधाएं एवं मॉड्यूल्स (Key Features & Functionalities)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Feature 1 */}
            <div className="p-4 rounded-2xl bg-slate-900/60 print:bg-slate-50 border border-slate-800 print:border-slate-300 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 print:text-emerald-700 font-bold text-sm">
                <Wallet className="w-4 h-4" />
                <span>मल्टी-वॉलेट प्रबंधन (Triple Balance Wallet)</span>
              </div>
              <p className="text-slate-300 print:text-slate-700 leading-relaxed">
                यूज़र के पास 3 स्पष्ट वॉलेट बैलेंस होते हैं:
              </p>
              <ul className="list-disc list-inside text-slate-400 print:text-slate-600 space-y-1">
                <li><strong>नकद शेष (Cash Balance):</strong> बैंक से जमा की गई स्वीकृत राशि।</li>
                <li><strong>GP पॉइंट्स (Growth Points):</strong> निवेश करने हेतु स्वैप किए गए पॉइंट्स (₹1 = {gpRate} GP)।</li>
                <li><strong>कमाई शेष (Earned Returns):</strong> दैनिक रिटर्न, रॉयल्टी और रेफरल कमीशन जिसे विथड्रॉ किया जा सकता है।</li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="p-4 rounded-2xl bg-slate-900/60 print:bg-slate-50 border border-slate-800 print:border-slate-300 space-y-2">
              <div className="flex items-center gap-2 text-purple-400 print:text-purple-700 font-bold text-sm">
                <Clock className="w-4 h-4" />
                <span>प्रति 6 घंटे ऑटोमेटेड रिटर्न चक्र (6-Hour Automated Payout)</span>
              </div>
              <p className="text-slate-300 print:text-slate-700 leading-relaxed">
                निवेश सक्रिय होने के 24 घंटे के कूलिंग लॉक के बाद, हर 6 घंटे में (दिन में 4 बार) आपका रिटर्न स्वतः कैलकुलेट होकर <strong>Claim Button</strong> या ऑटो-क्रेडिट में तैयार हो जाता है।
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-4 rounded-2xl bg-slate-900/60 print:bg-slate-50 border border-slate-800 print:border-slate-300 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 print:text-amber-700 font-bold text-sm">
                <Users className="w-4 h-4" />
                <span>रेफरल एवं दैनिक रॉयल्टी बोनस (Referral & Royalty)</span>
              </div>
              <p className="text-slate-300 print:text-slate-700 leading-relaxed">
                अपने दोस्तों को आमंत्रित करें। जब आपका मित्र निवेश करता है, तो आपको डायरेक्ट रेफरल बोनस तथा उनकी दैनिक कमाई पर आजीवन रॉयल्टी कमीशन प्राप्त होता है।
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-4 rounded-2xl bg-slate-900/60 print:bg-slate-50 border border-slate-800 print:border-slate-300 space-y-2">
              <div className="flex items-center gap-2 text-rose-400 print:text-rose-700 font-bold text-sm">
                <ArrowUpRight className="w-4 h-4" />
                <span>100% बैंक/UPI निकासी प्रणाली (Direct Bank Withdrawals)</span>
              </div>
              <p className="text-slate-300 print:text-slate-700 leading-relaxed">
                हर महीने की <strong>1 से 5 तारीख</strong> तक निकासी विंडो खुली रहती है। न्यूनतम निकासी ₹{rules?.minWithdrawal ?? 100} है। बैंक IMPS / NEFT या सीधे UPI हैंडल पर भुगतान सीधे 24 घंटे में प्राप्त होता है।
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 3: DETAILED RULES & TIMINGS (नियम, समय सारणी और सीमाएं) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-base font-black text-white print:text-black">
              3. महत्वपूर्ण नियम, समय एवं सीमाएं (Rules, Timings & Limits)
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse border border-slate-800 print:border-slate-300">
              <thead className="bg-slate-900 print:bg-slate-100 text-slate-300 print:text-slate-800 font-bold">
                <tr>
                  <th className="p-2.5 border border-slate-800 print:border-slate-300">नियम का नाम (Parameter)</th>
                  <th className="p-2.5 border border-slate-800 print:border-slate-300">लागू सीमा / समय (Enforced Value)</th>
                  <th className="p-2.5 border border-slate-800 print:border-slate-300">यूज़र के लिए विवरण (Explanation)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-slate-300 text-slate-300 print:text-slate-700">
                <tr>
                  <td className="p-2.5 font-bold border border-slate-800 print:border-slate-300">🪙 GP स्वैप रेट</td>
                  <td className="p-2.5 font-mono text-amber-400 print:text-amber-800 font-bold border border-slate-800 print:border-slate-300">₹1 = {gpRate} GP Point</td>
                  <td className="p-2.5 border border-slate-800 print:border-slate-300">जमा किए गए कैश को कभी भी 1-क्लिक में GP में बदलें।</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold border border-slate-800 print:border-slate-300">⏳ प्रारंभिक लॉक अवधि</td>
                  <td className="p-2.5 font-mono text-cyan-400 print:text-cyan-800 font-bold border border-slate-800 print:border-slate-300">24 घंटे (24 Hours Initial Lock)</td>
                  <td className="p-2.5 border border-slate-800 print:border-slate-300">प्लान खरीदने के पहले 24 घंटे सिस्टम सत्यापन लॉक रहता है।</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold border border-slate-800 print:border-slate-300">⚡ रिटर्न चक्र (Payout Frequency)</td>
                  <td className="p-2.5 font-mono text-emerald-400 print:text-emerald-800 font-bold border border-slate-800 print:border-slate-300">प्रति 6 घंटे (Every 6 Hours)</td>
                  <td className="p-2.5 border border-slate-800 print:border-slate-300">दिन में 4 बार रिटर्न बढ़ता है और क्लेम करने योग्य होता है।</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold border border-slate-800 print:border-slate-300">📅 मासिक विथड्रॉल विंडो</td>
                  <td className="p-2.5 font-mono text-purple-400 print:text-purple-800 font-bold border border-slate-800 print:border-slate-300">1 से 5 तारीख (1st to 5th Monthly)</td>
                  <td className="p-2.5 border border-slate-800 print:border-slate-300">निकासी का अनुरोध केवल हर माह 1st-5th तारीख के बीच ही लगेगा।</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold border border-slate-800 print:border-slate-300">💵 न्यूनतम निकासी (Min Withdrawal)</td>
                  <td className="p-2.5 font-mono text-white print:text-black font-bold border border-slate-800 print:border-slate-300">{formatINR(rules?.minWithdrawal ?? 100)}</td>
                  <td className="p-2.5 border border-slate-800 print:border-slate-300">वॉलेट में न्यूनतम राशि होने पर ही निकासी बटन एक्टिव होगा।</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold border border-slate-800 print:border-slate-300">📜 मूलधन वापसी (Capital Refund)</td>
                  <td className="p-2.5 font-mono text-rose-400 print:text-rose-800 font-bold border border-slate-800 print:border-slate-300">641 दिन परिपक्वता (Maturity)</td>
                  <td className="p-2.5 border border-slate-800 print:border-slate-300">प्लान की पूरी अवधि (641 दिन) समाप्त होने पर 100% मूलधन वापस मिलता है।</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 4: ACTIVE INVESTMENT PLANS TABLE */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
              <Layers className="w-5 h-5" />
            </div>
            <h2 className="text-base font-black text-white print:text-black">
              4. सक्रिय निवेश योजनाएं (Current Active Investment Schemes)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {plans.map((p) => {
              const dailyAmt = (p.minAmount * (p.dailyRoiPercent / 100));
              const totalReturnAmt = dailyAmt * (p.durationDays || 641);
              return (
                <div
                  key={p.id}
                  className="p-4 rounded-2xl bg-slate-900 print:bg-slate-50 border border-slate-800 print:border-slate-300 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-white print:text-black">{p.name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {p.dailyRoiPercent}% दैनिक
                    </span>
                  </div>
                  <div className="text-lg font-black font-mono text-amber-400 print:text-amber-800">
                    {p.minAmount.toLocaleString()} GP <span className="text-xs text-slate-400 font-normal">(₹{p.minAmount.toLocaleString()})</span>
                  </div>
                  <div className="text-[11px] text-slate-300 print:text-slate-700 space-y-1 bg-slate-950/60 print:bg-slate-100 p-2.5 rounded-xl">
                    <div className="flex justify-between">
                      <span className="text-slate-400">दैनिक रिटर्न:</span>
                      <strong className="text-emerald-400 print:text-emerald-700">{formatINR(dailyAmt)}/दिन</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">अवधि:</span>
                      <strong>{p.durationDays || 641} दिन</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">कुल संभावित रिटर्न:</span>
                      <strong className="text-purple-300 print:text-purple-700">{formatINR(totalReturnAmt)}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 5: FREQUENTLY ASKED QUESTIONS (FAQ) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h2 className="text-base font-black text-white print:text-black">
              5. सामान्य प्रश्नोत्तरी एवं सहायता (Frequently Asked Questions - FAQ)
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900/60 print:bg-slate-50 border border-slate-800 print:border-slate-300 space-y-1">
              <h4 className="font-bold text-white print:text-black">प्र: मैंने पैसे जमा (Deposit) कर दिए हैं, मुझे स्टेटस कहाँ दिखेगा?</h4>
              <p className="text-slate-400 print:text-slate-600">
                <strong>उत्तर:</strong> जैसे ही आप डिपॉजिट रिक्वेस्ट भेजेंगे, आपके वॉलेट कार्ड पर <strong>"⏳ सत्यापन प्रक्रियाधीन (Wait for approval)"</strong> का बैनर दिखेगा। एडमिन द्वारा बैंक पावती सत्यापित करते ही राशि आपके कैश बैलेंस में जुड़ जाएगी।
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 print:bg-slate-50 border border-slate-800 print:border-slate-300 space-y-1">
              <h4 className="font-bold text-white print:text-black">प्र: क्या मैं अपनी प्रोफ़ाइल और बैंक विवरण बदल सकता हूँ?</h4>
              <p className="text-slate-400 print:text-slate-600">
                <strong>उत्तर:</strong> हाँ, आप कभी भी साइड मेन्यू में जाकर अपना बैंक खाता, IFSC कोड, UPI ID और पासवर्ड अपडेट कर सकते हैं। नाम और मोबाइल नंबर सुरक्षा कारणों से एडमिन द्वारा सत्यापित रहते हैं।
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 print:bg-slate-50 border border-slate-800 print:border-slate-300 space-y-1">
              <h4 className="font-bold text-white print:text-black">प्र: विथड्रॉल का पैसा बैंक में कब तक आता है?</h4>
              <p className="text-slate-400 print:text-slate-600">
                <strong>उत्तर:</strong> 1 से 5 तारीख के बीच लगाई गई निकासी का पैसा एडमिन अप्रूवल के उपरांत अधिकतम 24 कार्य घंटों में सीधे आपके बैंक खाते या UPI में स्थानांतरित कर दिया जाता है।
              </p>
            </div>
          </div>
        </div>

        {/* Footer & Signature Section */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 print:text-slate-600">
          <div className="space-y-0.5">
            <div className="font-bold text-slate-300 print:text-black">GCap Asset Management Private Limited</div>
            <div>कॉर्पोरेट सहायता: support@gcapasset.com | हेल्पलाइन: 1800-GCAP-HELP</div>
          </div>
          <div className="text-center sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0">
            <div className="w-32 border-b border-slate-600 mb-1 mx-auto sm:ml-auto"></div>
            <div className="font-bold text-slate-400 print:text-black">अधिकृत हस्ताक्षर (Authorized Signatory)</div>
            <div className="text-[10px]">Chief Compliance & Operations Officer</div>
          </div>
        </div>
      </div>
    </div>
  );
};
