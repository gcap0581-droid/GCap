import React, { useState } from 'react';
import { X, Users, Copy, Check, Gift, Share2, Award, ArrowUpRight, Lock, UserCheck, ShieldCheck, DollarSign } from 'lucide-react';
import { AppRules, Language, UserProfile } from '../types';
import { formatINR } from '../utils/storage';

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  rules: AppRules;
  initialTab?: 'SHARE' | 'TEAM';
  currentUser?: UserProfile | null;
}

export const ReferralModal: React.FC<ReferralModalProps> = ({
  isOpen,
  onClose,
  language,
  rules,
  initialTab = 'SHARE',
  currentUser,
}) => {
  const isHi = language === 'hi';
  const [activeTab, setActiveTab] = useState<'SHARE' | 'TEAM'>(initialTab);
  const [teamLevelTab, setTeamLevelTab] = useState<'L1' | 'L2'>('L1');
  const [copied, setCopied] = useState(false);

  const referralCode = currentUser?.referralCode || (currentUser?.id ? `GCAP-${currentUser.id.toUpperCase().slice(-6)}` : 'GCAP-INV992');
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://g-cap.vercel.app';
  const apkDownloadUrl = 'https://drive.google.com/file/d/117Tn84m7yVG6-FWu8chung/view?pli=1';
  const referralLink = `${baseUrl}?ref=${referralCode}`;

  // Sample Team Data (Direct Level 1 & Level 2)
  const level1Team = [
    { id: '1', name: 'Rajesh Sharma', phone: '98****1234', date: '02 Sep 2026', investment: 25000, status: 'ACTIVE', comm: 1250 },
    { id: '2', name: 'Sunita Verma', phone: '97****5678', date: '04 Sep 2026', investment: 50000, status: 'ACTIVE', comm: 2500 },
    { id: '3', name: 'Vikram Patel', phone: '99****9012', date: '06 Sep 2026', investment: 0, status: 'REGISTERED', comm: 0 },
    { id: '4', name: 'Anita Roy', phone: '96****3456', date: '07 Sep 2026', investment: 10000, status: 'ACTIVE', comm: 500 },
    { id: '5', name: 'Manoj Kumar', phone: '95****7890', date: '08 Sep 2026', investment: 100000, status: 'ACTIVE', comm: 5000 },
  ];

  const level2Team = [
    { id: '101', name: 'Sanjay Gupta', sponsor: 'Rajesh Sharma', date: '03 Sep 2026', investment: 10000, status: 'ACTIVE', comm: 200 },
    { id: '102', name: 'Pooja Singh', sponsor: 'Sunita Verma', date: '05 Sep 2026', investment: 25000, status: 'ACTIVE', comm: 500 },
    { id: '103', name: 'Amitabh Sen', sponsor: 'Sunita Verma', date: '07 Sep 2026', investment: 15000, status: 'ACTIVE', comm: 300 },
  ];

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalTeamMembers = level1Team.length + level2Team.length;
  const activeMembersCount = level1Team.filter(m => m.status === 'ACTIVE').length + level2Team.filter(m => m.status === 'ACTIVE').length;
  const totalTeamBusiness = level1Team.reduce((acc, m) => acc + m.investment, 0) + level2Team.reduce((acc, m) => acc + m.investment, 0);
  const totalCommEarned = level1Team.reduce((acc, m) => acc + m.comm, 0) + level2Team.reduce((acc, m) => acc + m.comm, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isHi ? 'रेफरल नेटवर्क एवं मेरी टीम (My Team Network)' : 'GCap Referral & Team Network'}
              </h3>
              <p className="text-xs text-slate-400">
                {isHi ? 'टीम बनाएं, रेफरल लिंक शेयर करें और असीमित दैनिक कमीशन पाएं' : 'Share link, build multi-tier team, and track earnings'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-6 pt-2">
          <button
            onClick={() => setActiveTab('SHARE')}
            className={`flex items-center gap-2 px-4 py-3 font-bold text-xs border-b-2 transition-all cursor-pointer ${
              activeTab === 'SHARE'
                ? 'border-amber-400 text-amber-300 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>{isHi ? '📢 शेयर एवं लिंक (Share Link)' : '📢 Invite & Share Link'}</span>
          </button>

          <button
            onClick={() => setActiveTab('TEAM')}
            className={`flex items-center gap-2 px-4 py-3 font-bold text-xs border-b-2 transition-all cursor-pointer ${
              activeTab === 'TEAM'
                ? 'border-emerald-400 text-emerald-300 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{isHi ? '👥 मेरी टीम नेटवर्क (My Team)' : '👥 My Team Panel'}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">
              {totalTeamMembers}
            </span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {rules.isReferralEnabled === false ? (
            <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto text-xl">
                🚫
              </div>
              <h4 className="text-base font-bold text-white">
                {isHi ? 'रेफरल प्रोग्राम अस्थाई रूप से बंद है' : 'Referral Program Currently Inactive'}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isHi
                  ? 'रेफरल एवं कमीशन प्रोग्राम में वर्तमान में तकनीकी रखरखाव चल रहा है। जल्द ही पुनः सक्रिय होने पर आप अपने रेफरल लिंक से कमीशन कमा सकेंगे।'
                  : 'The referral reward program is currently under routine maintenance. It will be available shortly.'}
              </p>
            </div>
          ) : activeTab === 'SHARE' ? (
            /* TAB 1: SHARE & LINK */
            <>
              {/* Commission Tiers Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 text-center">
                  <span className="text-[11px] uppercase font-bold text-emerald-400 tracking-wider">
                    {isHi ? 'लेवल 1 (डायरेक्ट)' : 'Level 1 (Direct)'}
                  </span>
                  <p className="text-2xl font-extrabold text-white mt-1 font-mono">
                    {rules.referralL1Percent}%
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {isHi ? 'प्रत्यक्ष निवेशक के हर निवेश पर' : 'On every direct referral investment'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/5 border border-blue-500/20 text-center">
                  <span className="text-[11px] uppercase font-bold text-blue-400 tracking-wider">
                    {isHi ? 'लेवल 2 (टीम)' : 'Level 2 (Team)'}
                  </span>
                  <p className="text-2xl font-extrabold text-white mt-1 font-mono">
                    {rules.referralL2Percent}%
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {isHi ? 'उनकी टीम द्वारा किए गए निवेश पर' : 'On secondary network investments'}
                  </p>
                </div>
              </div>

              {/* Referral Link & Instant Share Buttons Box */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 block">
                    {isHi ? 'आपका ऐप शेयर व रेफरल लिंक:' : 'Your Unique App Share Link:'}
                  </label>
                  <span className="text-[10px] text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1 font-mono font-semibold">
                    <Lock className="w-3 h-3" />
                    {isHi ? 'ऑटो-लॉक रजिस्ट्रेशन सुरक्षा' : 'Auto-Lock Registration Enabled'}
                  </span>
                </div>

                <div className="flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-xl p-2">
                  <input
                    type="text"
                    readOnly
                    value={referralLink}
                    className="bg-transparent text-xs text-emerald-400 font-mono flex-1 outline-none px-2 select-all"
                  />
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? (isHi ? 'कॉपी हुआ!' : 'Copied!') : (isHi ? 'कॉपी' : 'Copy')}
                  </button>
                </div>

                {/* Fixed Referral Security Note */}
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-2">
                  <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="leading-snug">
                    {isHi
                      ? '🔒 जब कोई नया यूजर आपके लिंक से ऐप खोलेगा, तो आपका रेफरल कोड फॉर्म में स्वतः लॉक हो जाएगा और वह उसे बदल नहीं सकेगा।'
                      : '🔒 When a new user opens this link, your referral code is permanently locked in their registration form.'}
                  </p>
                </div>

                {/* Quick Share Buttons: WhatsApp + Native Share */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                      `🚀 GCap ऐप में शामिल हों और इंस्टेंट ${rules.referralL1Percent}% रेफरल कमीशन + दैनिक रिटर्न कमाएं!\n\nवेबसाइट ज्वाइन लिंक: ${referralLink}\n\n📱 एंड्रॉइड APK ऐप डाउनलोड लिंक: ${apkDownloadUrl}\n\nमेरा रेफरल कोड: ${referralCode}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer transition-all"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>{isHi ? 'WhatsApp पर शेयर करें' : 'Share on WhatsApp'}</span>
                  </a>

                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: 'GCap Daily Returns App',
                          text: `GCap में शामिल हों और इंस्टेंट ${rules.referralL1Percent}% कमीशन पाएं!\nवेबसाइट: ${referralLink}\nAndroid APK: ${apkDownloadUrl}\nकोड: ${referralCode}`,
                        }).catch(() => {});
                      } else {
                        handleCopy();
                      }
                    }}
                    className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 cursor-pointer transition-all"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>{isHi ? 'अन्य ऐप्स पर शेयर' : 'Share to Other Apps'}</span>
                  </button>
                </div>

                {/* Direct Android APK Download Banner */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/80 to-slate-950 border border-emerald-500/30 flex items-center justify-between gap-2 mt-2">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                      <span>📱</span> {isHi ? 'डायरेक्ट Android APK फाइल डाउनलोड' : 'Direct Android APK Download'}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {isHi ? 'गूगल ड्राइव से सीधे .apk फाइल डाउनलोड करें:' : 'Download .apk file from Google Drive:'}
                    </p>
                  </div>
                  <a
                    href={apkDownloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shrink-0 flex items-center gap-1 transition-all cursor-pointer shadow-sm shadow-emerald-500/20"
                  >
                    <span>.APK Download</span>
                  </a>
                </div>
              </div>

              {/* Sample Earnings Example */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-amber-300 font-semibold">
                  <Award className="w-4 h-4" />
                  <span>{isHi ? 'कमाई का उदाहरण (Earning Example):' : 'Commission Calculation Example:'}</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {isHi
                    ? `यदि आपका दोस्त ${formatINR(10000)} का निवेश करता है, तो आपको तुरंत ${rules.referralL1Percent}% यानी ${formatINR(
                        (10000 * rules.referralL1Percent) / 100
                      )} का तत्काल कमीशन सीधे आपके वॉलेट में प्राप्त होगा, जिसे आप कभी भी निकाल सकते हैं!`
                    : `If your direct friend invests ${formatINR(10000)}, you immediately earn ${rules.referralL1Percent}% (${formatINR(
                        (10000 * rules.referralL1Percent) / 100
                      )}) credited instantly into your cash balance with instant withdrawal capability!`}
                </p>
              </div>
            </>
          ) : (
            /* TAB 2: MY TEAM PANEL */
            <>
              {/* Overview Team Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                    {isHi ? 'कुल टीम सदस्य' : 'Total Team'}
                  </span>
                  <span className="text-xl font-bold font-mono text-white">
                    {totalTeamMembers} {isHi ? 'लोग' : 'users'}
                  </span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                    {isHi ? 'सक्रिय निवेशक' : 'Active Investors'}
                  </span>
                  <span className="text-xl font-bold font-mono text-emerald-400">
                    {activeMembersCount}
                  </span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                    {isHi ? 'टीम कुल व्यापार' : 'Team Business'}
                  </span>
                  <span className="text-sm font-extrabold font-mono text-blue-400">
                    {formatINR(totalTeamBusiness)}
                  </span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-amber-500/30 bg-amber-500/5">
                  <span className="text-[10px] text-amber-400 block uppercase font-semibold">
                    {isHi ? 'कुल कमीशन कमाया' : 'Total Comm. Earned'}
                  </span>
                  <span className="text-sm font-extrabold font-mono text-amber-300">
                    {formatINR(totalCommEarned)}
                  </span>
                </div>
              </div>

              {/* Sub-level switch (L1 vs L2) */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => setTeamLevelTab('L1')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      teamLevelTab === 'L1'
                        ? 'bg-emerald-500 text-slate-950 shadow-sm'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {isHi ? `डायरेक्ट टीम (Level 1 - ${rules.referralL1Percent}%)` : `Direct Team (Level 1 - ${rules.referralL1Percent}%)`}
                  </button>

                  <button
                    onClick={() => setTeamLevelTab('L2')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      teamLevelTab === 'L2'
                        ? 'bg-blue-500 text-white shadow-sm'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {isHi ? `परोक्ष टीम (Level 2 - ${rules.referralL2Percent}%)` : `Secondary Team (Level 2 - ${rules.referralL2Percent}%)`}
                  </button>
                </div>

                <span className="text-[11px] font-mono text-slate-400">
                  {teamLevelTab === 'L1' ? `${level1Team.length} Members` : `${level2Team.length} Members`}
                </span>
              </div>

              {/* Team Members List */}
              <div className="space-y-2">
                {teamLevelTab === 'L1' ? (
                  level1Team.map((m) => (
                    <div key={m.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold flex items-center justify-center shrink-0">
                          {m.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{m.name}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              m.status === 'ACTIVE'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}>
                              {m.status === 'ACTIVE' ? (isHi ? 'एक्टिव निवेशक' : 'Active Investor') : (isHi ? 'पंजीकृत' : 'Registered')}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                            Join: {m.date} • {m.phone}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">{isHi ? 'निवेश / कमीशन' : 'Invest / Comm.'}</span>
                        <span className="font-bold font-mono text-white block">
                          {formatINR(m.investment)}
                        </span>
                        <span className="text-emerald-400 font-mono font-bold text-[11px]">
                          +{formatINR(m.comm)} {isHi ? 'कमाई' : 'earned'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  level2Team.map((m) => (
                    <div key={m.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold flex items-center justify-center shrink-0">
                          {m.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{m.name}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                              Level 2
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Sponsor: <span className="text-slate-300 font-semibold">{m.sponsor}</span> • {m.date}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">{isHi ? 'निवेश / L2 कमीशन' : 'Invest / L2 Comm.'}</span>
                        <span className="font-bold font-mono text-white block">
                          {formatINR(m.investment)}
                        </span>
                        <span className="text-blue-400 font-mono font-bold text-[11px]">
                          +{formatINR(m.comm)} (2%)
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            {isHi ? 'सभी रेफरल कमीशन सीधे वॉलेट में तुरंत प्राप्त होते हैं।' : 'All referral earnings credit instantly to wallet.'}
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            {isHi ? 'बंद करें' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
