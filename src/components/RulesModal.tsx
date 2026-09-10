import React, { useState } from 'react';
import {
  X,
  FileText,
  Sliders,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Clock,
  Users,
  AlertTriangle,
  RotateCcw,
  Save,
  Check,
  Coins,
} from 'lucide-react';
import { AppRules, Language, UserProfile } from '../types';
import { formatINR } from '../utils/storage';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  rules: AppRules;
  currentUser?: UserProfile | null;
  onSaveRules: (updatedRules: AppRules) => void;
  onResetRules: () => void;
  onOpenGuides?: (guide?: 'SHORT_TERM' | 'LONG_TERM' | 'TDS_REFUND') => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({
  isOpen,
  onClose,
  language,
  rules,
  currentUser,
  onSaveRules,
  onResetRules,
  onOpenGuides,
}) => {
  const isHi = language === 'hi';
  const isAdmin = currentUser?.role === 'ADMIN';
  const [activeTab, setActiveTab] = useState<'VIEW' | 'EDIT'>('VIEW');
  const [formData, setFormData] = useState<AppRules>(rules);
  const [savedNotice, setSavedNotice] = useState<boolean>(false);

  // Sync formData and default to EDIT tab for Admin whenever modal opens
  React.useEffect(() => {
    if (isOpen) {
      setFormData(rules);
      if (isAdmin) {
        setActiveTab('EDIT');
      }
    }
  }, [rules, isOpen, isAdmin]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveRules(formData);
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      setActiveTab('VIEW');
    }, 1200);
  };

  const handleReset = () => {
    if (window.confirm(isHi ? 'क्या आप नियमों को डिफ़ॉल्ट रीसेट करना चाहते हैं?' : 'Reset rules to default parameters?')) {
      onResetRules();
      setFormData(rules);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">
                  {isHi ? 'GCap नियम व शर्तें (Rules & Policies)' : 'GCap Rules & Policies'}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                  v2.4
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isHi ? 'पारदर्शी निवेश नीतियां और आपके अपने कस्टमाइज़ेबल नियम' : 'Transparent investment guidelines & custom rules configurator'}
              </p>
            </div>
          </div>

          <button
            id="btn-close-rules"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher (Edit Rules only visible to Admin) */}
        {isAdmin && (
          <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 pt-2">
            <button
              id="btn-tab-view-rules"
              onClick={() => setActiveTab('VIEW')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === 'VIEW'
                  ? 'border-emerald-400 text-emerald-400 bg-emerald-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              {isHi ? 'अधिकारिक नियम देखें' : 'View Official Rules'}
            </button>
            <button
              id="btn-tab-edit-rules"
              onClick={() => setActiveTab('EDIT')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === 'EDIT'
                  ? 'border-emerald-400 text-emerald-400 bg-emerald-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-4 h-4" />
              {isHi ? '⚙️ नियम व सीमाएं बदलें (Edit Rules)' : '⚙️ Customize Rules & Limits'}
            </button>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200 text-sm">
          {savedNotice && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl flex items-center gap-2.5 text-emerald-300 text-xs font-medium animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              {isHi
                ? 'आपके नियम सफलतापूर्वक सुरक्षित कर दिए गए हैं! ऐप अब नए नियमों के अनुसार कार्य करेगी।'
                : 'Rules saved successfully! The platform will now enforce your updated regulations.'}
            </div>
          )}

          {activeTab === 'VIEW' ? (
            <div className="space-y-5">
              {/* PRINTABLE GUIDES & OFFICIAL PDF CENTER BANNER */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-slate-950 to-blue-950/60 border-2 border-cyan-500/40 shadow-xl space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-cyan-300 font-bold">
                    <FileText className="w-5 h-5 text-cyan-400" />
                    <h4 className="text-sm font-bold text-white">
                      {isHi ? '📄 योजना विवरण व TDS रिफंड गाइड (Printable PDFs)' : '📄 Official Printable Guides & PDF Center'}
                    </h4>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold border border-cyan-500/30">
                    PRINT / DOWNLOAD PDF
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {isHi
                    ? 'नीचे दिए गए बटन पर क्लिक करके शॉर्ट टर्म, लॉन्ग टर्म प्लान और सरकारी TDS रिफंड की पूरी प्रक्रिया का दस्तावेज़ देखें या PDF डाउनलोड करें:'
                    : 'Click below to view or download full PDF documentation for Short Term, Long Term, and Govt TDS Return Filing:'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenGuides) onOpenGuides('SHORT_TERM');
                    }}
                    className="p-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>⚡ 641D शॉर्ट टर्म गाइड PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenGuides) onOpenGuides('LONG_TERM');
                    }}
                    className="p-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>📈 365D लॉन्ग टर्म गाइड PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenGuides) onOpenGuides('TDS_REFUND');
                    }}
                    className="p-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>🏛️ सरकारी TDS रिफंड गाइड PDF</span>
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <p className="text-[11px] text-slate-400 font-medium">
                    {isHi ? 'न्यूनतम डिपॉजिट' : 'Min Deposit'}
                  </p>
                  <p className="text-base font-bold font-mono text-emerald-400 mt-0.5">
                    {formatINR(rules.minDeposit)}
                  </p>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <p className="text-[11px] text-slate-400 font-medium">
                    {isHi ? 'न्यूनतम निकासी' : 'Min Withdrawal'}
                  </p>
                  <p className="text-base font-bold font-mono text-emerald-400 mt-0.5">
                    {formatINR(rules.minWithdrawal)}
                  </p>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <p className="text-[11px] text-slate-400 font-medium">
                    {isHi ? 'निकासी शुल्क (Fee)' : 'Withdrawal Fee'}
                  </p>
                  <p className="text-base font-bold font-mono text-emerald-400 mt-0.5">
                    {rules.withdrawalFeePercent === 0 ? (isHi ? '0% (मुफ़्त)' : '0% (Free)') : `${rules.withdrawalFeePercent}%`}
                  </p>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <p className="text-[11px] text-slate-400 font-medium">
                    {isHi ? 'रेफरल कमीशन' : 'Referral Tier'}
                  </p>
                  <p className="text-base font-bold font-mono text-emerald-400 mt-0.5">
                    L1: {rules.referralL1Percent}% | L2: {rules.referralL2Percent}%
                  </p>
                </div>
              </div>

              {/* OFFICIAL USER DEPOSIT & WALLET RULES (User Guidelines) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-950 to-slate-950 border-2 border-amber-500/40 shadow-xl space-y-3">
                <div className="flex items-center gap-2.5 text-amber-400 font-bold border-b border-amber-500/20 pb-2.5">
                  <ShieldCheck className="w-5 h-5" />
                  <h4 className="text-sm sm:text-base">
                    {isHi
                      ? 'अधिकारिक डिपॉजिट व वॉलेट नियम (Official Deposit Regulations)'
                      : 'Official Deposit & Wallet Regulations'}
                  </h4>
                  <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                    MANDATORY
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2.5 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <strong className="text-white block mb-0.5">
                        {isHi ? 'कंपनी खाते में सीधे बैंक ट्रांसफर एवं सुरक्षित फंड एलोकेशन:' : 'Direct Bank Deposit & Insured Fund Allocation:'}
                      </strong>
                      <p className="text-slate-300 leading-relaxed">
                        {isHi
                          ? 'कोई भी यूज़र अपने वॉलेट में राशि अपने बैंक/UPI खाते से सीधे कंपनी के आधिकारिक खाते में जोड़ सकता है। फंड प्राप्त होते ही यह 100% सुरक्षित रूप से आपके वॉलेट में क्रेडिट हो जाता है।'
                          : 'Any user can deposit funds from their bank/UPI directly to the official company account. Once received, funds are 100% securely credited to your wallet.'}
                      </p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <strong className="text-white block mb-0.5">
                        {isHi ? 'डिपॉजिट सत्यापन एवं "Wait for approval" स्टेटस:' : 'Deposit Verification & "Wait for approval" Status:'}
                      </strong>
                      <p className="text-slate-300 leading-relaxed">
                        {isHi
                          ? 'जब तक बैंक पावती व UTR नंबर का मिलान और सत्यापन पूरा नहीं होता, तब तक यूज़र की राशि के साथ "Wait for approval" का संदेश प्रदर्शित होगा। सत्यापन पूर्ण होते ही राशि तुरंत कैश बैलेंस में आ जाएगी।'
                          : 'Until bank UTR confirmation and receipt verification is complete, a "Wait for approval" status is displayed. Once verified, funds instantly reflect in your cash balance.'}
                      </p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      <strong className="text-white block mb-0.5">
                        {isHi
                          ? `GP स्वैप विकल्प (1 ₹ = ${rules.gpRatePerRupee ?? 1} GP) एवं प्लान खरीद:`
                          : `GP Swap (₹1 = ${rules.gpRatePerRupee ?? 1} GP) & Plan Purchase:`}
                      </strong>
                      <p className="text-slate-300 leading-relaxed">
                        {isHi
                          ? `सत्यापन के बाद यूज़र अपनी राशि को GP में स्वैप कर सकता है। वर्तमान दर अनुसार 1 रुपया = ${rules.gpRatePerRupee ?? 1} GP प्राप्त होता है। इसके बाद उस GP से यूज़र अपनी पसंद का निवेश प्लान सक्रिय कर सकता है।`
                          : `Once verified, users swap their cash balance into GP (current official exchange rate: ₹1 = ${rules.gpRatePerRupee ?? 1} GP). Users can then purchase and activate any investment plan using this GP.`}
                      </p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                      4
                    </span>
                    <div>
                      <strong className="text-white block mb-0.5">
                        {isHi ? 'मनचाही राशि का कभी भी GP बनाएं:' : 'Flexible GP Swap Anytime:'}
                      </strong>
                      <p className="text-slate-300 leading-relaxed">
                        {isHi
                          ? 'यूज़र अपने मन से जितना चाहे अपने वॉलेट कैश में से उतने का GP कभी भी बनाकर प्लान ले सकता है। बाकी का बचा हुआ अमाउंट वैसे ही वॉलेट में सुरक्षित पड़ा रहेगा।'
                          : 'Users can freely convert any desired portion of their cash balance into GP at any time. The remainder stays intact in their cash balance.'}
                      </p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                      5
                    </span>
                    <div>
                      <strong className="text-rose-300 block mb-0.5">
                        {isHi ? 'वॉलेट अमाउंट नॉन-विथड्रॉएबल (निकासी पर प्रतिबंध):' : 'Wallet Capital Non-Withdrawable Rule:'}
                      </strong>
                      <p className="text-slate-300 leading-relaxed">
                        {isHi
                          ? 'वॉलेट के मूल जमा अमाउंट को कभी भी विथड्रॉ नहीं किया जा सकता। इसे केवल GP बनाकर प्लान खरीदने में उपयोग किया जा सकता है। यूज़र केवल प्लान से मिला दैनिक मुनाफा/रिटर्न ही बैंक में विथड्रॉ कर सकते हैं।'
                          : 'Wallet cash cannot be withdrawn directly; it can only be converted to GP to purchase plans. Only accrued daily ROI and referral earnings can be withdrawn to bank/UPI.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Clause 1: Deposit */}
              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <h4>1. {isHi ? 'जमा एवं वॉलेट फंडिंग नियम (Deposit Regulations)' : 'Deposit & Wallet Funding Rules'}</h4>
                </div>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                  <li>
                    {isHi
                      ? `न्यूनतम जमा राशि ${formatINR(rules.minDeposit)} और अधिकतम ${formatINR(rules.maxDeposit)} प्रति लेनदेन है।`
                      : `Minimum deposit is ${formatINR(rules.minDeposit)} and maximum is ${formatINR(rules.maxDeposit)} per transaction.`}
                  </li>
                  <li>
                    {isHi
                      ? 'सभी जमा सीधे UPI, QR कोड, नेट बैंकिंग और डेबिट कार्ड के माध्यम से स्वीकार किए जाते हैं।'
                      : 'All deposits are accepted via instant UPI, QR code, Net Banking, and Cards.'}
                  </li>
                  <li>
                    {isHi
                      ? 'डिपॉजिट पर कोई भी अतिरिक्त सर्विस चार्ज या कमीशन नहीं काटा जाता (0% शुल्क)।'
                      : 'Zero deposit processing fees applied. 100% of deposited amount reflects in cash balance.'}
                  </li>
                </ul>
              </div>

              {/* Clause 2: Daily Return Accrual */}
              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <h4>2. {isHi ? 'दैनिक रिटर्न व लाभ गणना (Daily ROI Accrual & Payout)' : 'Daily ROI Accrual & Payout Rules'}</h4>
                </div>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                  <li>
                    {isHi
                      ? `दैनिक रिटर्न की गणना हर 24 घंटे के चक्र (${rules.dailyPayoutCycleHi}) के आधार पर की जाती है।`
                      : `Daily returns are calculated on a 24-hour cycle (${rules.dailyPayoutCycle}).`}
                  </li>
                  <li>
                    {isHi
                      ? 'यूज़र अपने संचित दैनिक लाभ को कभी भी "Claim Return" बटन दबाकर तुरंत वॉलेट में जोड़ सकते हैं।'
                      : 'Investors can claim accumulated daily earnings at any time with instant credit to cash wallet.'}
                  </li>
                  <li>
                    {isHi
                      ? 'प्लान की तय अवधि (Duration) तक हर दिन गारंटीकृत रिटर्न प्राप्त होता रहता है।'
                      : 'Returns continue to accrue reliably throughout the active plan duration.'}
                  </li>
                </ul>
              </div>

              {/* Clause 3: Capital Return */}
              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <h4>3. {isHi ? 'मूलधन सुरक्षा व परिपक्वता वापसी (Capital Refund Guarantee)' : 'Capital Refund & Maturity Guarantee'}</h4>
                </div>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                  <li>
                    {isHi
                      ? 'प्लान की अवधि पूरी होते ही आपका 100% मूलधन (Principal Capital) स्वतः वॉलेट में वापस क्रेडिट कर दिया जाता है।'
                      : '100% of the invested principal is automatically credited back to your wallet at plan completion.'}
                  </li>
                  <li>
                    {isHi
                      ? 'मूलधन वापस मिलने के बाद यूज़र उसे या तो निकाल सकते हैं या नए प्लान में दोबारा निवेश कर सकते हैं।'
                      : 'Once returned, principal can be withdrawn immediately or reinvested in any new plan.'}
                  </li>
                </ul>
              </div>

              {/* Clause 4: Withdrawals */}
              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <h4>4. {isHi ? 'निकासी एवं बैंक ट्रांसफर नियम (Withdrawal Regulations)' : 'Withdrawal & Bank Transfer Policy'}</h4>
                </div>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                  <li>
                    {isHi
                      ? `न्यूनतम निकासी राशि ${formatINR(rules.minWithdrawal)} है। अधिकतम दैनिक निकासी सीमा ${formatINR(rules.maxWithdrawalPerDay)} है।`
                      : `Minimum withdrawal is ${formatINR(rules.minWithdrawal)}. Daily maximum limit is ${formatINR(rules.maxWithdrawalPerDay)}.`}
                  </li>
                  <li>
                    {isHi
                      ? `निकासी समय: ${rules.withdrawalTimingHi}। राशि सीधे आपके दिए गए UPI आईडी या बैंक खाते में ट्रांसफर होती है।`
                      : `Withdrawal timing: ${rules.withdrawalTiming}. Transferred directly to designated UPI ID or Bank account.`}
                  </li>
                  <li>
                    {isHi
                      ? `निकासी शुल्क: ${rules.withdrawalFeePercent === 0 ? '0% (बिल्कुल मुफ़्त)' : `${rules.withdrawalFeePercent}% प्रोसेसिंग फीस`}।`
                      : `Withdrawal Fee: ${rules.withdrawalFeePercent === 0 ? '0% (Zero Fee)' : `${rules.withdrawalFeePercent}% processing charge`} deducted during payout.`}
                  </li>
                </ul>
              </div>

              {/* Clause 5: Referral */}
              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <h4>5. {isHi ? 'रेफरल एवं टीम कमीशन (Referral Program)' : 'Referral & Team Bonus System'}</h4>
                </div>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                  <li>
                    {isHi
                      ? `लेवल 1 (प्रत्यक्ष रेफरल): आपके लिंक से जुड़े व्यक्ति के निवेश पर ${rules.referralL1Percent}% तुरंत कमीशन।`
                      : `Level 1 (Direct): Earn instant ${rules.referralL1Percent}% commission on every plan activated by your direct referrals.`}
                  </li>
                  <li>
                    {isHi
                      ? `लेवल 2 (द्वितीयक टीम): आगे के रेफरल पर ${rules.referralL2Percent}% पैसिव कमीशन।`
                      : `Level 2 (Secondary): Earn ${rules.referralL2Percent}% commission on investments from your second-line network.`}
                  </li>
                </ul>
              </div>

              {/* Clause 6: Security and Disclaimer */}
              <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/20 space-y-1.5">
                <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{isHi ? 'सुरक्षा एवं अस्वीकरण (Security & Compliance)' : 'Security & Compliance Note'}</span>
                </div>
                <p className="text-[11px] text-amber-200/80 leading-relaxed">
                  {isHi
                    ? 'GCap पर हर लेनदेन 256-बिट SSL एन्क्रिप्शन के साथ सुरक्षित है। किसी भी सहायता के लिए संपर्क करें: ' + rules.supportEmail + ' | ' + rules.supportPhone
                    : 'All GCap transactions are protected via 256-bit SSL encryption. For assistance contact: ' + rules.supportEmail + ' | ' + rules.supportPhone}
                </p>
              </div>
            </div>
          ) : (
            /* EDIT RULES FORM */
            <form onSubmit={handleSave} className="space-y-4">
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-300">
                {isHi
                  ? 'नीचे दिए गए फ़ील्ड्स में अपनी आवश्यकतानुसार संख्याएं और नियम बदलें। यह तुरंत पूरी ऐप (डिपॉजिट, विथड्रॉल, प्लान्स) में लागू हो जाएगा।'
                  : 'Customize the numbers and policies below to match your requirements. Changes take effect across the entire portal immediately.'}
              </div>

              {/* GP Exchange Rate (Admin Controls) */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-amber-500/5 border border-amber-500/30 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <Coins className="w-4 h-4 text-amber-400" />
                      {isHi ? '🪙 GP एक्सचेंज रेट कंट्रोल (GP Rate Per ₹1 INR)' : '🪙 GP Exchange Rate Control (GP per ₹1 INR)'}
                    </label>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {isHi
                        ? 'यूज़र जब ₹1 कैश स्वैप करेगा तो उसे कितना GP मिलेगा? (डिफ़ॉल्ट 1 GP = ₹1)'
                        : 'Set how many G-Points (GP) a user receives for each ₹1 INR swapped (Default 1.0)'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                      ₹1 = {formData.gpRatePerRupee ?? 1} GP
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      {isHi ? 'GP रेट दर (1 रुपये के बदले GP):' : 'Exchange Rate (GP per ₹1):'}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={0.01}
                        max={1000}
                        step={0.01}
                        value={formData.gpRatePerRupee ?? 1}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setFormData({ ...formData, gpRatePerRupee: isNaN(val) ? 1 : Math.max(0.01, val) });
                        }}
                        className="w-full bg-slate-950 border border-amber-500/40 rounded-xl px-3 py-2 text-amber-300 font-mono text-sm font-bold focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col justify-end">
                    <div className="flex gap-1.5">
                      {[0.5, 1, 1.25, 2, 5].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setFormData({ ...formData, gpRatePerRupee: preset })}
                          className={`flex-1 py-2 px-1 text-[11px] font-mono font-semibold rounded-lg border transition-all cursor-pointer ${
                            (formData.gpRatePerRupee ?? 1) === preset
                              ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-sm'
                              : 'bg-slate-950 text-slate-300 border-slate-700 hover:border-amber-500/40 hover:text-amber-300'
                          }`}
                        >
                          {preset}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-amber-200/80 bg-amber-950/40 px-3 py-1.5 rounded-lg border border-amber-500/20">
                  {isHi
                    ? `💡 उदाहरण: यदि रेट ${formData.gpRatePerRupee ?? 1} है, तो ₹1,000 स्वैप करने पर यूज़र को ${(1000 * (formData.gpRatePerRupee ?? 1)).toLocaleString('en-IN')} GP मिलेंगे।`
                    : `💡 Example: At ${formData.gpRatePerRupee ?? 1}x, swapping ₹1,000 will grant the user ${(1000 * (formData.gpRatePerRupee ?? 1)).toLocaleString('en-IN')} GP.`}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Min Deposit */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isHi ? 'न्यूनतम डिपॉजिट राशि (Min Deposit ₹)' : 'Minimum Deposit Amount (₹)'}
                  </label>
                  <input
                    type="number"
                    min={100}
                    step={50}
                    value={formData.minDeposit}
                    onChange={(e) => setFormData({ ...formData, minDeposit: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Max Deposit */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isHi ? 'अधिकतम डिपॉजिट राशि (Max Deposit ₹)' : 'Maximum Deposit Amount (₹)'}
                  </label>
                  <input
                    type="number"
                    min={1000}
                    step={1000}
                    value={formData.maxDeposit}
                    onChange={(e) => setFormData({ ...formData, maxDeposit: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Min Withdrawal */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isHi ? 'न्यूनतम निकासी राशि (Min Withdrawal ₹)' : 'Minimum Withdrawal Amount (₹)'}
                  </label>
                  <input
                    type="number"
                    min={50}
                    step={50}
                    value={formData.minWithdrawal}
                    onChange={(e) => setFormData({ ...formData, minWithdrawal: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Withdrawal Fee % */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isHi ? 'निकासी शुल्क (Withdrawal Fee %)' : 'Withdrawal Fee (%)'}
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={25}
                    step={0.5}
                    value={formData.withdrawalFeePercent}
                    onChange={(e) => setFormData({ ...formData, withdrawalFeePercent: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Admin Charge % (Dynamic Admin Control) */}
                <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-purple-300 block">
                      {isHi ? '👑 एडमिन चार्ज (%) (Admin Service Charge)' : '👑 Admin Service Charge (%)'}
                    </label>
                    <span className="text-xs font-mono font-bold text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/30">
                      {formData.adminFeePercent ?? 2.0}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {isHi
                      ? 'कुल अर्निंग निकासी पर एडमिन शुल्क। बदलाव लागू (Save Rules) करने पर अगली सभी निकासी पर यह तुरंत लागू हो जाएगा।'
                      : 'Admin charge deducted on total earning withdrawal. Takes effect across all withdrawals immediately after saving.'}
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={0}
                      max={25}
                      step={0.1}
                      value={formData.adminFeePercent ?? 2.0}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setFormData({ ...formData, adminFeePercent: isNaN(val) ? 2.0 : val });
                      }}
                      className="w-full bg-slate-950 border border-purple-500/40 rounded-xl px-3 py-1.5 text-purple-300 font-mono text-xs font-bold focus:border-purple-400 focus:outline-none"
                    />
                    <div className="flex gap-1 shrink-0">
                      {[0.5, 1.0, 2.0, 3.0, 5.0].map((rate) => (
                        <button
                          key={rate}
                          type="button"
                          onClick={() => setFormData({ ...formData, adminFeePercent: rate })}
                          className={`px-2 py-1 text-[10px] font-mono font-bold rounded-lg border cursor-pointer ${
                            (formData.adminFeePercent ?? 2.0) === rate
                              ? 'bg-purple-500 text-white border-purple-400'
                              : 'bg-slate-950 text-slate-400 border-slate-700 hover:text-purple-300'
                          }`}
                        >
                          {rate}%
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Government Statutory TDS (Auto-Calculated by Income Tax Slabs) */}
                <div className="sm:col-span-2 p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/40 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <label className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-cyan-400" />
                      <span>{isHi ? '🏛️ सरकारी आयकर TDS दर (ऑटोमैटिक / Income Tax Act Slabs)' : '🏛️ Statutory Govt TDS (Auto-Calculated by Tax Slabs)'}</span>
                    </label>
                    <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded-full border border-cyan-500/30">
                      {isHi ? '⚡ भुगतान समय स्वतः लागू (Auto-Applied)' : '⚡ Auto-Calculated at Payout'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {isHi
                      ? 'भारतीय आयकर अधिनियम (Income Tax Act) के अनुसार निकासी राशि के आधार पर ऑटोमैटिक TDS कटता है:'
                      : 'Statutory TDS is automatically computed during payment disbursal based on Indian Income Tax Act slabs:'}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-cyan-500/30 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-white block">{isHi ? '₹10,000 तक निकासी' : 'Up to ₹10,000 Payout'}</span>
                        <span className="text-[10px] text-slate-400 font-mono">Sec 194A Income Tax Rule</span>
                      </div>
                      <span className="text-sm font-black text-cyan-400 font-mono">5.0% TDS</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-cyan-500/30 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-white block">{isHi ? '₹10,000 से अधिक निकासी' : 'Above ₹10,000 Payout'}</span>
                        <span className="text-[10px] text-slate-400 font-mono">Sec 194BA Online Earnings</span>
                      </div>
                      <span className="text-sm font-black text-cyan-400 font-mono">10.0% TDS</span>
                    </div>
                  </div>
                </div>

                {/* Referral Program Status Toggle */}
                <div className="sm:col-span-2 p-3.5 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-between gap-3">
                  <div>
                    <label className="text-xs font-bold text-white block">
                      {isHi ? '🎁 रेफरल प्रोग्राम चालू / बंद (Referral Program Toggle)' : '🎁 Referral Program On / Off Switch'}
                    </label>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {isHi
                        ? 'चालू करने पर यूजर शेयर करके कमीशन कमा सकते हैं। बंद करने पर रेफरल कमीशन बंद रहेगा।'
                        : 'Enable or disable referral code generation & commission distribution across the platform.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isReferralEnabled: formData.isReferralEnabled === false ? true : false })}
                    className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
                      formData.isReferralEnabled !== false
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}
                  >
                    {formData.isReferralEnabled !== false ? (isHi ? '🟢 चालू (Active)' : '🟢 ACTIVE') : (isHi ? '🔴 बंद (Disabled)' : '🔴 DISABLED')}
                  </button>
                </div>

                {/* Referral L1 % */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isHi ? 'लेवल 1 रेफरल कमीशन (%)' : 'Level 1 Direct Referral (%)'}
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={30}
                    step={0.1}
                    value={formData.referralL1Percent}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setFormData({ ...formData, referralL1Percent: isNaN(val) ? 0 : val });
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Referral L2 % */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isHi ? 'लेवल 2 रेफरल कमीशन (%)' : 'Level 2 Team Referral (%)'}
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={15}
                    step={0.1}
                    value={formData.referralL2Percent}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setFormData({ ...formData, referralL2Percent: isNaN(val) ? 0 : val });
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Withdrawal Timing Text */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isHi ? 'निकासी समय व विवरण (Withdrawal Timing Window)' : 'Withdrawal Processing Window'}
                  </label>
                  <input
                    type="text"
                    value={isHi ? formData.withdrawalTimingHi : formData.withdrawalTiming}
                    onChange={(e) =>
                      isHi
                        ? setFormData({ ...formData, withdrawalTimingHi: e.target.value })
                        : setFormData({ ...formData, withdrawalTiming: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:border-emerald-500 focus:outline-none"
                    placeholder="24x7 Instant via UPI & IMPS"
                  />
                </div>

                {/* Support Contact */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isHi ? 'सपोर्ट ईमेल (Support Email)' : 'Support Email'}
                  </label>
                  <input
                    type="email"
                    value={formData.supportEmail}
                    onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Support Phone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isHi ? 'हेल्पलाइन नंबर (Helpline Phone)' : 'Helpline Phone'}
                  </label>
                  <input
                    type="text"
                    value={formData.supportPhone}
                    onChange={(e) => setFormData({ ...formData, supportPhone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {isHi ? 'डिफ़ॉल्ट नियम रीसेट करें' : 'Reset to Default'}
                </button>

                <button
                  type="submit"
                  id="btn-submit-save-rules"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  {isHi ? 'नियम सुरक्षित करें (Save Rules)' : 'Save & Enforce Rules'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{isHi ? 'नियम सक्रिय व सुरक्षित हैं' : 'Rules enforced across all portals'}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
          >
            {isHi ? 'बंद करें' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
