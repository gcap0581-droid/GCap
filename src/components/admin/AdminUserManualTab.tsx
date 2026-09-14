import React, { useRef } from 'react';
import {
  BookOpen,
  Printer,
  ShieldCheck,
  Zap,
  Clock,
  Wallet,
  Users,
  Award,
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  FileText,
  Lock,
  Layers,
  Sparkles,
  HelpCircle,
  Building2,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  FileCheck,
  Smartphone,
  Check,
  CreditCard,
  Gift,
  Coins,
} from 'lucide-react';
import { AppRules, InvestmentPlan, Language } from '../../types';
import { formatINR } from '../../utils/storage';

interface AdminUserManualTabProps {
  language: Language;
  rules: AppRules;
  plans: InvestmentPlan[];
  onBackToHub?: () => void;
}

export const AdminUserManualTab: React.FC<AdminUserManualTabProps> = ({
  language,
  rules,
  plans,
  onBackToHub,
}) => {
  const isHi = language === 'hi';
  const manualPrintRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const content = manualPrintRef.current ? manualPrintRef.current.innerHTML : document.body.innerHTML;
    const printWindow = window.open('', '_blank', 'width=950,height=800');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>GCap Official Operations SOP & User Manual</title>
            <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
            <style>
              body { background: #ffffff !important; color: #000000 !important; font-family: sans-serif; padding: 32px; }
              @media print {
                body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
                .print\\:hidden { display: none !important; }
              }
            </style>
          </head>
          <body onload="setTimeout(() => { window.focus(); window.print(); window.close(); }, 500);">
            <div class="max-w-4xl mx-auto space-y-6 bg-white text-slate-900 p-8 shadow-2xl rounded-2xl border border-slate-200">
              <div class="text-center pb-6 border-b-2 border-emerald-600 mb-6">
                <h1 class="text-2xl font-black text-slate-900">GCAP ASSET MANAGEMENT PRIVATE LIMITED</h1>
                <p class="text-sm font-bold text-emerald-700 mt-1">OFFICIAL OPERATIONS SOP & USER MANUAL (DYNAMIC LIVE SYNC)</p>
                <p class="text-xs text-slate-500 mt-0.5">Generated on: ${new Date().toLocaleString()} | Official Compliance Document</p>
              </div>
              ${content}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      window.print();
    }
  };

  const gpRate = rules?.gpRatePerRupee ?? 1;

  return (
    <div className="space-y-6" ref={manualPrintRef}>
      {/* Sleek Top Navigation & Toolbar (Screen Only) */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 p-4 rounded-2xl border border-emerald-500/30 shadow-xl flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-3">
          {onBackToHub && (
            <button
              onClick={onBackToHub}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs border border-emerald-500/30 transition-all cursor-pointer shadow-md active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{isHi ? '← वापस मुख्य एडमिन हब' : '← Back to Admin Hub'}</span>
            </button>
          )}

          <div className="hidden sm:flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-sm font-black text-white">
              {isHi ? '📖 GCap आधिकारिक मैन्युअल' : '📖 GCap Official Operations SOP'}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30 text-[10px]">
              v3.8 PRINT / PDF READY
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-600/30 transition-all cursor-pointer active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>{isHi ? '🖨️ प्रिंट / PDF सेव करें' : '🖨️ Print / Save as PDF'}</span>
          </button>
        </div>
      </div>

      {/* PRINTABLE MANUAL CONTAINER */}
      <div
        ref={manualPrintRef}
        id="user-manual-printable"
        className="bg-slate-950 text-slate-100 rounded-3xl border border-slate-800 p-6 sm:p-10 shadow-2xl space-y-10 print:bg-white print:text-black print:border-0 print:p-0 print:shadow-none"
      >
        {/* Document Corporate Header */}
        <div className="border-b-2 border-emerald-500/40 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-black text-3xl flex items-center justify-center shadow-xl shadow-amber-500/20 border-2 border-amber-300 print:border-black">
              GC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white print:text-black tracking-tight">
                  GCap Capital Growth & Asset Management
                </h1>
              </div>
              <p className="text-xs sm:text-sm font-bold text-emerald-400 print:text-slate-700 mt-0.5">
                आधिकारिक यूज़र मैन्युअल एवं संपूर्ण कार्यप्रणाली निर्देशिका (Standard Operating Procedure - SOP)
              </p>
            </div>
          </div>
          <div className="text-right text-xs text-slate-400 print:text-slate-600 font-mono space-y-0.5 bg-slate-900/80 print:bg-slate-100 p-3 rounded-xl border border-slate-800 print:border-slate-300">
            <div>दस्तावेज़ संस्करण: <strong className="text-emerald-300 print:text-black">v3.8 (2026 Edition)</strong></div>
            <div>जारी तिथि: <strong className="text-amber-300 print:text-black">{new Date().toLocaleDateString('hi-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</strong></div>
            <div>सुरक्षा प्रमाणन: <strong className="text-emerald-400 print:text-black">100% RBI/MCA Compliant Model</strong></div>
          </div>
        </div>

        {/* Executive Summary Box */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 print:bg-emerald-50 p-6 rounded-2xl border-2 border-emerald-500/30 print:border-emerald-300 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-amber-400 print:text-emerald-900 font-black text-base">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>1. ऐप का मूल उद्देश्य एवं परिचय (Executive Summary & Platform Purpose)</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 print:text-slate-800 leading-relaxed">
            <strong>GCap (जी-कैप) प्लेटफ़ॉर्म</strong> एक अत्याधुनिक, पारदर्शी और 100% सुरक्षित दैनिक पूंजी वृद्धि (Daily Asset Growth) प्रणाली है। इस ऐप का मुख्य उद्देश्य आम एवं संस्थागत निवेशकों को उनके द्वारा जमा की गई पूंजी पर <strong>प्रति 6 घंटे में सुनिश्चित दैनिक लाभ (24-Hour Automated Return Payouts)</strong>, <strong>दैनिक टीम रॉयल्टी बोनस</strong> तथा <strong>641 दिन की परिपक्वता पर 100% मूलधन वापसी (Full Capital Guarantee)</strong> प्रदान करना है। 
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="bg-slate-950/80 print:bg-white p-3 rounded-xl border border-emerald-500/20 print:border-emerald-200">
              <span className="text-[10px] text-slate-400 print:text-slate-600 uppercase font-bold block">पayout फ्रीक्वेंसी</span>
              <strong className="text-emerald-400 print:text-emerald-800 text-xs sm:text-sm font-black">प्रति 6 घंटे (दिन में 4 बार)</strong>
            </div>
            <div className="bg-slate-950/80 print:bg-white p-3 rounded-xl border border-emerald-500/20 print:border-emerald-200">
              <span className="text-[10px] text-slate-400 print:text-slate-600 uppercase font-bold block">निकासी समय (Withdrawal)</span>
              <strong className="text-purple-300 print:text-purple-800 text-xs sm:text-sm font-black">हर माह 1 से 5 तारीख</strong>
            </div>
            <div className="bg-slate-950/80 print:bg-white p-3 rounded-xl border border-emerald-500/20 print:border-emerald-200">
              <span className="text-[10px] text-slate-400 print:text-slate-600 uppercase font-bold block">मूलधन वापसी (Principal Refund)</span>
              <strong className="text-amber-400 print:text-amber-800 text-xs sm:text-sm font-black">100% वापसी (641 दिन)</strong>
            </div>
          </div>
        </div>

        {/* DETAILED STEP-BY-STEP OPERATIONAL GUIDE */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b-2 border-emerald-500/30 pb-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white print:text-black">
                2. कदम-दर-कदम संपूर्ण कार्यप्रणाली निर्देशिका (8 Easy Steps to Use GCap)
              </h2>
              <p className="text-xs text-slate-400 print:text-slate-600">
                नया खाता खोलने से लेकर विथड्रॉल प्राप्त करने तक की संपूर्ण प्रक्रिया:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Step 1 */}
            <div className="p-5 rounded-2xl bg-slate-900/80 print:bg-slate-50 border border-slate-800 print:border-slate-300 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-black text-sm flex items-center justify-center border border-emerald-500/40">
                    01
                  </div>
                  <h3 className="font-black text-sm sm:text-base text-white print:text-black">
                    रजिस्ट्रेशन एवं लॉगिन (Registration & Login)
                  </h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  Step 1
                </span>
              </div>
              <p className="text-xs text-slate-300 print:text-slate-700 leading-relaxed">
                1.1 ऐप में <strong>"रजिस्टर करें"</strong> बटन पर क्लिक करें। अपना नाम, 10-अंकों का मोबाइल नंबर और एक सुरक्षित पासवर्ड दर्ज करें।<br />
                1.2 यदि आपके पास किसी मित्र का <strong>Referral Code</strong> है, तो उसे दर्ज करें ताकि अतिरिक्त बोनस प्राप्त हो सके।<br />
                1.3 खाता बनने के उपरांत अपने मोबाइल नंबर व पासवर्ड का उपयोग कर लॉगिन करें।
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-2xl bg-slate-900/80 print:bg-slate-50 border border-slate-800 print:border-slate-300 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 font-black text-sm flex items-center justify-center border border-cyan-500/40">
                    02
                  </div>
                  <h3 className="font-black text-sm sm:text-base text-white print:text-black">
                    वॉलेट में फंड जमा (Deposit & Verification)
                  </h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  Step 2
                </span>
              </div>
              <p className="text-xs text-slate-300 print:text-slate-700 leading-relaxed">
                2.1 डैशबोर्ड पर <strong>"+ Deposit (जमा करें)"</strong> बटन पर क्लिक करें।<br />
                2.2 स्क्रीन पर दिख रहे कंपनी के <strong>आधिकारिक बैंक खाते या UPI QR कोड</strong> पर इच्छित राशि भेजें।<br />
                2.3 बैंक रसीद से 12-अंकों का <strong>UTR / UPI Transaction Ref ID</strong> दर्ज करके सबमिट करें। एडमिन द्वारा 10-15 मिनट में सत्यापन के बाद राशि आपके <strong>Cash Balance (नकद शेष)</strong> में क्रेडिट कर दी जाती है।
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-2xl bg-slate-900/80 print:bg-slate-50 border border-slate-800 print:border-slate-300 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 font-black text-sm flex items-center justify-center border border-amber-500/40">
                    03
                  </div>
                  <h3 className="font-black text-sm sm:text-base text-white print:text-black">
                    GP पॉइंट्स में स्वैप (Swap Cash to GP Points)
                  </h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  Step 3
                </span>
              </div>
              <p className="text-xs text-slate-300 print:text-slate-700 leading-relaxed">
                3.1 किसी भी प्लान को खरीदने के लिए आपके पास <strong>GP (Growth Points)</strong> होने आवश्यक हैं।<br />
                3.2 <strong>"Swap to GP"</strong> बटन दबाएं और स्वैप करने हेतु राशि दर्ज करें।<br />
                3.3 <strong>वर्तमान स्वैप दर ₹1 = {gpRate} GP Point</strong> है। स्वैप करते ही राशि नकद शेष से घटकर तुरंत आपके GP Points वॉलेट में स्थानांतरित हो जाती है।
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-5 rounded-2xl bg-slate-900/80 print:bg-slate-50 border border-slate-800 print:border-slate-300 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 font-black text-sm flex items-center justify-center border border-purple-500/40">
                    04
                  </div>
                  <h3 className="font-black text-sm sm:text-base text-white print:text-black">
                    निवेश प्लान खरीदना व 24h सुरक्षा लॉक (Buy Plan & 24h Lock)
                  </h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  Step 4
                </span>
              </div>
              <p className="text-xs text-slate-300 print:text-slate-700 leading-relaxed">
                4.1 <strong>Plans</strong> मेन्यू में जाकर अपनी रुचि का प्लान चुनें (उदा. 641-Day Yield Scheme)।<br />
                4.2 <strong>"Invest Now"</strong> पर क्लिक करें। प्लान शुरू होते ही पहले <strong>24 घंटे का सुरक्षा सत्यापन लॉक (Countdown Clock)</strong> लागू होता है।<br />
                4.3 24 घंटे की लॉक अवधि समाप्त होते ही "बधाई" संदेश प्रदर्शित होता है और आपका नियमित 6-घंटे का रिटर्न चक्र सक्रिय हो जाता है।
              </p>
            </div>

            {/* Step 5 */}
            <div className="p-5 rounded-2xl bg-slate-900/80 print:bg-slate-50 border border-slate-800 print:border-slate-300 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-black text-sm flex items-center justify-center border border-emerald-500/40">
                    05
                  </div>
                  <h3 className="font-black text-sm sm:text-base text-white print:text-black">
                    प्रति 6 घंटे रिटर्न क्लेम चक्र (6-Hour Payout Engine)
                  </h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  Step 5
                </span>
              </div>
              <p className="text-xs text-slate-300 print:text-slate-700 leading-relaxed">
                5.1 आपका दैनिक रिटर्न दिन में 4 बार (प्रति 6 घंटे: 06:00, 12:00, 18:00, 00:00) स्वतः तैयार होता है।<br />
                5.2 निवेश कार्ड पर <strong>"Claim Return"</strong> बटन दबाकर अपनी 6-घंटे की कमाई तुरंत <strong>Total Earning (कुल कमाई)</strong> में जोड़ें।<br />
                5.3 यदि आप बटन नहीं दबाते हैं, तो भी सिस्टम हर चक्र के अंत में आपका रिटर्न सुरक्षित संचित करता रहता है।
              </p>
            </div>

            {/* Step 6 */}
            <div className="p-5 rounded-2xl bg-slate-900/80 print:bg-slate-50 border border-slate-800 print:border-slate-300 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 font-black text-sm flex items-center justify-center border border-rose-500/40">
                    06
                  </div>
                  <h3 className="font-black text-sm sm:text-base text-white print:text-black">
                    100% बैंक/UPI विथड्रॉल प्रक्रिया (Monthly Withdrawals)
                  </h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
                  Step 6
                </span>
              </div>
              <p className="text-xs text-slate-300 print:text-slate-700 leading-relaxed">
                6.1 हर महीने की <strong>1 तारीख से 5 तारीख</strong> तक विथड्रॉल विंडो खुली रहती है।<br />
                6.2 प्रोफ़ाइल में अपना <strong>बैंक खाता संख्या, IFSC कोड या UPI ID</strong> दर्ज करके रखें।<br />
                6.3 <strong>"Withdraw (निकासी)"</strong> पर क्लिक करें और राशि दर्ज करें (न्यूनतम ₹{rules?.minWithdrawal ?? 100})। एडमिन अप्रूवल के बाद राशि सीधे 24 घंटों में आपके बैंक खाते में स्थानांतरित हो जाती है।
              </p>
            </div>

            {/* Step 7 */}
            <div className="p-5 rounded-2xl bg-slate-900/80 print:bg-slate-50 border border-slate-800 print:border-slate-300 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 font-black text-sm flex items-center justify-center border border-teal-500/40">
                    07
                  </div>
                  <h3 className="font-black text-sm sm:text-base text-white print:text-black">
                    रेफरल व दैनिक रॉयल्टी बोनस (Referral & Royalty Bonus)
                  </h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20">
                  Step 7
                </span>
              </div>
              <p className="text-xs text-slate-300 print:text-slate-700 leading-relaxed">
                7.1 अपना रेफरल लिंक या कोड मित्रों के साथ साझा करें।<br />
                7.2 <strong>Level 1 (डायरेक्ट मित्र):</strong> उनके निवेश पर {rules?.referralL1Percent ?? 5}% तुरंत बोनस एवं दैनिक रिटर्न पर रॉयल्टी commission प्राप्त होता है।<br />
                7.3 <strong>Level 2:</strong> {rules?.referralL2Percent ?? 3}% बोनस | <strong>Level 3:</strong> {rules?.referralL3Percent ?? 1}% बोनस टीम वर्क पर दिया जाता है।
              </p>
            </div>

            {/* Step 8 */}
            <div className="p-5 rounded-2xl bg-slate-900/80 print:bg-slate-50 border border-slate-800 print:border-slate-300 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 font-black text-sm flex items-center justify-center border border-amber-500/40">
                    08
                  </div>
                  <h3 className="font-black text-sm sm:text-base text-white print:text-black">
                    641 दिन परिपक्वता व मूलधन वापसी (Maturity & Capital Refund)
                  </h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  Step 8
                </span>
              </div>
              <p className="text-xs text-slate-300 print:text-slate-700 leading-relaxed">
                8.1 641 दिनों का प्लान कार्यकाल पूरा होने पर आपका निवेश परिपक्व (Mature) हो जाता है।<br />
                8.2 यूज़र के पास दो विकल्प होते हैं: <strong>(A) प्लान रिन्यू करें</strong> ताकि अगला 641-दिनों का चक्र शुरू हो सके, अथवा <strong>(B) 100% मूलधन + संचित अर्निंग वापस निकालें</strong>।<br />
                8.3 सफलता पूर्वक समाप्त हुए निवेश का <strong>आधिकारिक डिजिटल परिपक्वता प्रमाण पत्र (Certificate)</strong> डाउनलोड किया जा सकता है।
              </p>
            </div>

          </div>
        </div>

        {/* RULES, TIMINGS & SYSTEM LIMITS REFERENCE TABLE */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 border-b-2 border-emerald-500/30 pb-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white print:text-black">
                3. महत्वपूर्ण नियम, सीमाएं एवं समय सारणी (System Policy & Enforced Limits)
              </h2>
              <p className="text-xs text-slate-400 print:text-slate-600">
                ऐप के सभी वित्तीय मापदंडों की विस्तृत तालिका:
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 print:border-slate-300 shadow-xl">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-900 print:bg-slate-200 text-slate-200 print:text-black font-black uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="p-3.5 border-b border-slate-800 print:border-slate-300">मापदंड (Policy Parameter)</th>
                  <th className="p-3.5 border-b border-slate-800 print:border-slate-300">निर्धारित सीमा / वैल्यू</th>
                  <th className="p-3.5 border-b border-slate-800 print:border-slate-300">विवरण व यूज़र के लिए निर्देश</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 print:divide-slate-300 text-slate-300 print:text-slate-800">
                <tr className="hover:bg-slate-900/50">
                  <td className="p-3.5 font-bold flex items-center gap-2">
                    <Coins className="w-4 h-4 text-amber-400" />
                    <span>GP स्वैप दर (Swap Rate)</span>
                  </td>
                  <td className="p-3.5 font-mono text-amber-400 print:text-amber-800 font-black">₹1 = {gpRate} GP Point</td>
                  <td className="p-3.5">कैश जमा स्वीकृत होने के उपरांत बिना किसी अतिरिक्त चार्ज के तुरंत 1:1 दर से GP में बदलें।</td>
                </tr>
                <tr className="hover:bg-slate-900/50">
                  <td className="p-3.5 font-bold flex items-center gap-2">
                    <Lock className="w-4 h-4 text-cyan-400" />
                    <span>प्रारंभिक सुरक्षा लॉक (Initial Lock)</span>
                  </td>
                  <td className="p-3.5 font-mono text-cyan-400 print:text-cyan-800 font-black">24 घंटे (Strict 24 Hours)</td>
                  <td className="p-3.5">नया प्लान शुरू करने के पहले 24 घंटे सुरक्षा जांच चलती है। 24 घंटे बाद ही पहला 6h रिटर्न बनता है।</td>
                </tr>
                <tr className="hover:bg-slate-900/50">
                  <td className="p-3.5 font-bold flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    <span>रिटर्न पेआउट चक्र (Payout Slot)</span>
                  </td>
                  <td className="p-3.5 font-mono text-emerald-400 print:text-emerald-800 font-black">प्रति 6 घंटे (Every 6 Hours)</td>
                  <td className="p-3.5">06:00, 12:00, 18:00, 24:00 के निश्चित स्लॉट्स पर रिटर्न क्लेम हेतु तैयार होता है।</td>
                </tr>
                <tr className="hover:bg-slate-900/50">
                  <td className="p-3.5 font-bold flex items-center gap-2">
                    <ArrowUpRight className="w-4 h-4 text-purple-400" />
                    <span>मासिक विथड्रॉल विंडो (Withdrawal Window)</span>
                  </td>
                  <td className="p-3.5 font-mono text-purple-400 print:text-purple-800 font-black">1st से 5th तारीख (Monthly)</td>
                  <td className="p-3.5">बैंक निकासी के आवेदन केवल माह की पहली 5 तारीखों में ही स्वीकार किए जाते हैं।</td>
                </tr>
                <tr className="hover:bg-slate-900/50">
                  <td className="p-3.5 font-bold flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-rose-400" />
                    <span>न्यूनतम निकासी राशि (Min Withdraw)</span>
                  </td>
                  <td className="p-3.5 font-mono text-white print:text-black font-black">{formatINR(rules?.minWithdrawal ?? 100)}</td>
                  <td className="p-3.5">वॉलेट में न्यूनतम निर्धारित राशि उपलब्ध होने पर विथड्रॉल बटन सक्रिय होगा।</td>
                </tr>
                <tr className="hover:bg-slate-900/50">
                  <td className="p-3.5 font-bold flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>मूलधन गारंटी (Capital Refund)</span>
                  </td>
                  <td className="p-3.5 font-mono text-amber-300 print:text-amber-800 font-black">100% वापसी (641 दिन)</td>
                  <td className="p-3.5">641 दिन परिपक्वता पर आपका पूरा निवेशित मूलधन कैश बैलेंस में 100% वापस क्रेडिट होता है।</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ACTIVE INVESTMENT SCHEMES MATRIX */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 border-b-2 border-emerald-500/30 pb-3">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white print:text-black">
                4. वर्तमान सक्रिय निवेश योजनाएं (Active Investment Schemes & Returns)
              </h2>
              <p className="text-xs text-slate-400 print:text-slate-600">
                ऐप में उपलब्ध सभी एक्टिव प्लान्स का विस्तृत रिटर्न ब्रेकअप:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {plans.map((p) => {
              const dailyAmt = p.minAmount * (p.dailyRoiPercent / 100);
              const totalReturnAmt = dailyAmt * (p.durationDays || 641);
              const cyclePayout = dailyAmt / 4;
              return (
                <div
                  key={p.id}
                  className="p-5 rounded-2xl bg-slate-900 print:bg-slate-50 border-2 border-slate-800 print:border-slate-300 space-y-3 shadow-xl relative overflow-hidden"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 print:border-slate-300 pb-2.5">
                    <span className="font-black text-base text-white print:text-black">{p.name}</span>
                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {p.dailyRoiPercent}% दैनिक ROI
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">न्यूनतम निवेश (Min Deposit)</span>
                    <div className="text-xl font-black font-mono text-amber-400 print:text-amber-800">
                      {p.minAmount.toLocaleString('en-IN')} GP <span className="text-xs text-slate-400 font-normal">(₹{p.minAmount.toLocaleString('en-IN')})</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-200 print:text-slate-800 space-y-2 bg-slate-950/80 print:bg-slate-100 p-3 rounded-xl border border-slate-800 print:border-slate-300">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">प्रति 6h पेआउट:</span>
                      <strong className="text-emerald-400 print:text-emerald-700 font-mono font-bold">{formatINR(cyclePayout)} / चक्र</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">कुल दैनिक अर्निंग:</span>
                      <strong className="text-emerald-300 print:text-emerald-800 font-mono font-bold">{formatINR(dailyAmt)} / दिन</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">अवधि (Term):</span>
                      <strong className="font-bold">{p.durationDays || 641} दिन</strong>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-slate-800 print:border-slate-300">
                      <span className="text-slate-400 font-bold">कुल संभावित रिटर्न:</span>
                      <strong className="text-purple-300 print:text-purple-800 font-mono font-black">{formatINR(totalReturnAmt)}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FREQUENTLY ASKED QUESTIONS & SUPPORT (FAQ) */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 border-b-2 border-emerald-500/30 pb-3">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white print:text-black">
                5. सामान्य प्रश्नोत्तरी एवं समाधान (Frequently Asked Questions - FAQ)
              </h2>
              <p className="text-xs text-slate-400 print:text-slate-600">
                उपयोगकर्ताओं के मुख्य प्रश्नों का त्वरित उत्तर:
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs sm:text-sm">
            <div className="p-4 rounded-xl bg-slate-900/80 print:bg-slate-50 border border-slate-800 print:border-slate-300 space-y-1.5 shadow">
              <h4 className="font-bold text-white print:text-black flex items-center gap-2">
                <span className="text-emerald-400 font-black">Q1.</span> मैंने पैसे जमा (Deposit) कर दिए हैं, लेकिन वॉलेट में नहीं दिख रहे?
              </h4>
              <p className="text-slate-300 print:text-slate-700 leading-relaxed text-xs">
                <strong>उत्तर:</strong> डिपॉजिट रिक्वेस्ट सबमिट करने पर वह तुरंत एडमिन अप्रूवल कतार में जाती है। आपके वॉलेट कार्ड पर <strong>"⏳ सत्यापन प्रक्रियाधीन (Wait for approval)"</strong> का मैसेज दिखेगा। जैसे ही एडमिन आपके UTR नंबर का बैंक स्टेटमेंट से मिलान करके अप्रूव करेंगे, राशि तुरंत आपके नकद शेष (Cash Balance) में जुड़ जाएगी।
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 print:bg-slate-50 border border-slate-800 print:border-slate-300 space-y-1.5 shadow">
              <h4 className="font-bold text-white print:text-black flex items-center gap-2">
                <span className="text-emerald-400 font-black">Q2.</span> विथड्रॉल का पैसा बैंक में कब तक आता है?
              </h4>
              <p className="text-slate-300 print:text-slate-700 leading-relaxed text-xs">
                <strong>उत्तर:</strong> हर माह 1 से 5 तारीख के बीच लगाए गए विथड्रॉल अनुरोध एडमिन द्वारा 24 कार्य घंटों के भीतर स्वीकृत कर IMPS/NEFT या UPI द्वारा आपके बैंक खाते में भेज दिए जाते हैं।
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 print:bg-slate-50 border border-slate-800 print:border-slate-300 space-y-1.5 shadow">
              <h4 className="font-bold text-white print:text-black flex items-center gap-2">
                <span className="text-emerald-400 font-black">Q3.</span> क्या मैं अपना बैंक खाता या पासवर्ड बदल सकता हूँ?
              </h4>
              <p className="text-slate-300 print:text-slate-700 leading-relaxed text-xs">
                <strong>उत्तर:</strong> हाँ, आप अपने प्रोफाइल सेक्शन में जाकर अपना अकाउंट नंबर, IFSC, UPI ID और पासवर्ड कभी भी बदल सकते हैं। सुरक्षा कारणों से नाम व मोबाइल नंबर बदलने के लिए एडमिन सपोर्ट से संपर्क करना होता है।
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 print:bg-slate-50 border border-slate-800 print:border-slate-300 space-y-1.5 shadow">
              <h4 className="font-bold text-white print:text-black flex items-center gap-2">
                <span className="text-emerald-400 font-black">Q4.</span> 641 दिन बाद मूलधन वापस कैसे प्राप्त करें?
              </h4>
              <p className="text-slate-300 print:text-slate-700 leading-relaxed text-xs">
                <strong>उत्तर:</strong> 641 दिन पूर्ण होने पर निवेश कार्ड पर <strong>"Claim Capital & Close"</strong> का बटन आ जाएगा। इसे दबाते ही आपका 100% मूलधन वापस वॉलेट में आ जाएगा और आप इसे सीधे विथड्रॉ कर सकते हैं या नया प्लान ले सकते हैं।
              </p>
            </div>
          </div>
        </div>

        {/* Corporate Signatory & Official Footer */}
        <div className="pt-8 border-t-2 border-slate-800 print:border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-400 print:text-slate-700">
          <div className="space-y-1 text-center sm:text-left">
            <div className="font-black text-sm text-white print:text-black">GCap Asset Management Private Limited</div>
            <div>कॉर्पोरेट ईमेल: <span className="text-emerald-400 print:text-black font-mono">support@gcapasset.com</span></div>
            <div>हेल्पलाइन टोल-फ्री: <span className="text-amber-300 print:text-black font-mono">1800-GCAP-HELP (1800-4227-4357)</span></div>
            <div className="text-[10px] text-slate-500">पंजीकृत कार्यालय: Corporate Tower, Financial District, Cyberabad</div>
          </div>

          <div className="text-center sm:text-right border-t sm:border-t-0 pt-4 sm:pt-0">
            <div className="w-40 border-b border-slate-600 print:border-black mb-2 mx-auto sm:ml-auto" />
            <div className="font-black text-sm text-amber-400 print:text-black">अधिकृत हस्ताक्षरकर्ता (Authorized Signatory)</div>
            <div className="text-[11px] text-slate-300 print:text-slate-800 font-semibold">Chief Compliance & Operations Officer</div>
            <div className="text-[10px] text-emerald-400 print:text-slate-600 font-mono">GCap Official System Seal Verified</div>
          </div>
        </div>

      </div>
    </div>
  );
};
