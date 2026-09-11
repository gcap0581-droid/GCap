import React, { useState } from 'react';
import {
  Send,
  Users,
  User,
  AlertTriangle,
  Bell,
  Sparkles,
  Gift,
  Info,
  ShieldAlert,
  Trash2,
  CheckCircle2,
  Search,
  Filter,
  Flame,
  Clock,
  CheckCheck,
  RefreshCw,
} from 'lucide-react';
import { AdminMessage, Language, UserProfile, Wallet, ActiveInvestment } from '../../types';

interface AdminMessagesTabProps {
  language: Language;
  users: UserProfile[];
  messages: AdminMessage[];
  wallets?: Record<string, Wallet>;
  investments?: ActiveInvestment[];
  onSendMessage: (msg: Partial<AdminMessage>) => Promise<boolean>;
  onDeleteMessage: (msgId: string) => Promise<boolean>;
  onRefreshMessages: () => void;
}

export const AdminMessagesTab: React.FC<AdminMessagesTabProps> = ({
  language,
  users = [],
  messages = [],
  wallets = {},
  investments = [],
  onSendMessage,
  onDeleteMessage,
  onRefreshMessages,
}) => {
  const isHi = language === 'hi';

  // Form State
  const [targetType, setTargetType] = useState<
    'ALL' | 'SINGLE' | 'INVESTORS' | 'POSITIVE_BALANCE' | 'SELECTED'
  >('ALL');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [category, setCategory] = useState<'ANNOUNCEMENT' | 'ALERT' | 'INFO' | 'BONUS' | 'SYSTEM'>(
    'ANNOUNCEMENT'
  );
  const [priority, setPriority] = useState<'NORMAL' | 'URGENT'>('NORMAL');
  const [showPopup, setShowPopup] = useState(true);
  const [title, setTitle] = useState('');
  const [titleHi, setTitleHi] = useState('');
  const [content, setContent] = useState('');
  const [contentHi, setContentHi] = useState('');
  const [senderName, setSenderName] = useState('GCap Official Admin');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  // Active regular users (excluding admin)
  const regularUsers = users.filter((u) => u.role !== 'ADMIN');

  // Filtered users for search in single/multi-user select
  const filteredUsersList = regularUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      u.loginId.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      (u.phone && u.phone.includes(userSearchTerm))
  );

  // Quick preset templates
  const applyTemplate = (type: string) => {
    switch (type) {
      case 'WITHDRAWAL_REMINDER':
        setTitle('Monthly Withdrawal Window Open (1st - 5th)');
        setTitleHi('मासिक निकासी विंडो खुली है (1 से 5 तारीख)');
        setContent(
          'Dear Investor, the monthly withdrawal window for regular daily earnings is open from 1st to 5th of the month. Please submit your withdrawal requests directly to your registered bank account or UPI.'
        );
        setContentHi(
          'प्रिय निवेशक, दैनिक अर्निंग्स की निकासी के लिए मासिक विंडो 1 से 5 तारीख तक सक्रिय है। कृपया अपने पंजीकृत बैंक खाते या यूपीआई में अपनी निकासी का अनुरोध सबमिट करें।'
        );
        setCategory('ANNOUNCEMENT');
        setPriority('NORMAL');
        setShowPopup(true);
        break;

      case 'BANK_DETAILS_UPDATE':
        setTitle('Action Required: Please Update Bank / UPI Details');
        setTitleHi('आवश्यक सूचना: कृपया अपना बैंक व यूपीआई विवरण अपडेट करें');
        setContent(
          'To ensure 100% instant withdrawal processing without delay, please complete your Bank Account / UPI details in the Wallet section under Bank Details.'
        );
        setContentHi(
          'अपनी निकासी बिना किसी रुकावट व तत्काल प्राप्त करने के लिए कृपया अपने वॉलेट सेक्शन में जाकर अपना बैंक खाता या UPI विवरण अपडेट कर लें।'
        );
        setCategory('INFO');
        setPriority('URGENT');
        setShowPopup(true);
        break;

      case 'REFERRAL_BONUS':
        setTitle('Refer & Earn: Level 1 (8%) + Level 2 (4%) Commission Active');
        setTitleHi('रेफर करें और कमाएं: लेवल 1 (8%) + लेवल 2 (4%) डायरेक्ट कमीशन');
        setContent(
          'Share your unique referral link with your network and earn 8% direct Level-1 commission and 4% Level-2 commission on every plan investment made by your referrals.'
        );
        setContentHi(
          'अपना व्यक्तिगत रेफरल लिंक अपने मित्रों व नेटवर्क के साथ साझा करें और उनके प्रत्येक निवेश पर तुरंत 8% डायरेक्ट (L1) और 4% (L2) कमीशन प्राप्त करें।'
        );
        setCategory('BONUS');
        setPriority('NORMAL');
        setShowPopup(false);
        break;

      case 'SYSTEM_MAINTENANCE':
        setTitle('Important: Scheduled Platform Upgrade Complete');
        setTitleHi('महत्वपूर्ण: सिस्टम अपग्रेड सफलतापूर्वक पूर्ण');
        setContent(
          'Our core ROI calculation and real-time synchronization engine has been updated with enhanced security and zero-latency transaction confirmation.'
        );
        setContentHi(
          'हमारा कोर ROI कैलकुलेशन और रीयल-टाइम सिंक इंजन नए सुरक्षा मानकों के साथ अपडेट हो गया है। सभी सेवाएं सुचारू रूप से कार्यरत हैं।'
        );
        setCategory('SYSTEM');
        setPriority('NORMAL');
        setShowPopup(true);
        break;

      case 'URGENT_NOTICE':
        setTitle('Urgent Notice from GCap Management');
        setTitleHi('जीकैप प्रबंधन से अति-महत्वपूर्ण सूचना');
        setContent(
          'Please verify all deposit transaction reference IDs carefully before submitting. Ensure correct UTR numbers for rapid approval.'
        );
        setContentHi(
          'डिपॉजिट अनुरोध भेजते समय कृपया 12-अंकों का सही UTR / संदर्भ संख्या दर्ज करें ताकि एडमिन द्वारा आपका फंड तुरंत अप्रूव किया जा सके।'
        );
        setCategory('ALERT');
        setPriority('URGENT');
        setShowPopup(true);
        break;
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert(isHi ? 'कृपया शीर्षक और संदेश दोनों दर्ज करें।' : 'Please enter both Title and Message content.');
      return;
    }

    if (targetType === 'SINGLE' && !selectedUserId) {
      alert(isHi ? 'कृपया वह यूज़र चुनें जिसे संदेश भेजना है।' : 'Please select a recipient user.');
      return;
    }

    if (targetType === 'SELECTED' && selectedUserIds.length === 0) {
      alert(isHi ? 'कृपया कम से कम एक यूज़र चुनें।' : 'Please select at least one user.');
      return;
    }

    const targetUser = regularUsers.find((u) => u.id === selectedUserId);

    setIsSubmitting(true);
    const success = await onSendMessage({
      title: title.trim(),
      titleHi: titleHi.trim() || title.trim(),
      content: content.trim(),
      contentHi: contentHi.trim() || content.trim(),
      senderName: senderName.trim() || 'GCap Official Admin',
      targetType,
      targetUserId: targetType === 'SINGLE' ? selectedUserId : undefined,
      targetUserLoginId: targetType === 'SINGLE' ? targetUser?.loginId : undefined,
      targetUserName: targetType === 'SINGLE' ? targetUser?.name : undefined,
      targetUserIds: targetType === 'SELECTED' ? selectedUserIds : undefined,
      priority,
      category,
      showPopup,
    });

    setIsSubmitting(false);
    if (success) {
      setSuccessToast(
        isHi
          ? 'संदेश सफलतापूर्वक प्रसारित हो गया! लक्षित यूज़र्स की स्क्रीन पर यह तुरंत दिखेगा।'
          : 'Message broadcasted successfully! Targeted users will receive it instantly on their screens.'
      );
      setTimeout(() => setSuccessToast(''), 6000);
      // Reset fields
      setTitle('');
      setTitleHi('');
      setContent('');
      setContentHi('');
      setSelectedUserId('');
      setSelectedUserIds([]);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200" id="admin-messages-tab">
      {/* Toast Notification */}
      {successToast && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-bold flex items-center justify-between gap-2 shadow-lg animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast('')}
            className="text-emerald-400 hover:text-white text-xs px-2 py-1 rounded bg-emerald-950/60"
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. Header / Intro Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-slate-900 to-teal-500/15 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner shrink-0">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white">
                {isHi ? 'एडमिन संदेश व लाइव नोटिफिकेशन प्रसारण केंद्र' : 'Admin Messaging & Live Broadcast Center'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {isHi ? 'तत्काल रीयल-टाइम' : 'Instant Real-time'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isHi
                ? 'किसी भी एक यूज़र को व्यक्तिगत संदेश भेजें या सभी/चयनित यूज़र्स को तुरंत लाइव स्क्रीन पॉप-अप भेजें।'
                : 'Send direct messages to single users or bulk announcements to all/filtered investors with instant screen popup.'}
            </p>
          </div>
        </div>

        <button
          onClick={onRefreshMessages}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
          <span>{isHi ? 'रीफ़्रेश इतिहास' : 'Refresh Feed'}</span>
        </button>
      </div>

      {/* 2. Message Composer Form */}
      <form
        onSubmit={handleSend}
        className="p-4 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm sm:text-base text-white">
              {isHi ? 'नया संदेश या सूचना तैयार करें' : 'Compose New Message or Announcement'}
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {isHi ? 'पंजीकृत यूज़र्स:' : 'Total Users:'} <strong className="text-white font-mono">{regularUsers.length}</strong>
          </span>
        </div>

        {/* Quick Presets Buttons */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>{isHi ? 'त्वरित टेम्पलेट्स (Quick Presets):' : 'Quick Presets:'}</span>
          </label>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => applyTemplate('WITHDRAWAL_REMINDER')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] text-slate-200 cursor-pointer"
            >
              🗓️ {isHi ? '1-5 निकासी रिमाइंडर' : 'Withdrawal Window'}
            </button>
            <button
              type="button"
              onClick={() => applyTemplate('BANK_DETAILS_UPDATE')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] text-cyan-300 cursor-pointer"
            >
              🏦 {isHi ? 'बैंक/UPI अपडेट रिमाइंडर' : 'Update Bank/UPI'}
            </button>
            <button
              type="button"
              onClick={() => applyTemplate('REFERRAL_BONUS')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] text-amber-300 cursor-pointer"
            >
              🎁 {isHi ? 'रेफरल बोनस प्रचार' : 'Referral 8%+4%'}
            </button>
            <button
              type="button"
              onClick={() => applyTemplate('URGENT_NOTICE')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] text-rose-300 cursor-pointer"
            >
              ⚠️ {isHi ? 'UTR सत्यापन नोटिस' : 'UTR Verification'}
            </button>
            <button
              type="button"
              onClick={() => applyTemplate('SYSTEM_MAINTENANCE')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] text-purple-300 cursor-pointer"
            >
              ⚙️ {isHi ? 'सिस्टम अपग्रेड' : 'System Upgrade'}
            </button>
          </div>
        </div>

        {/* Target Audience Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-amber-400" />
              <span>{isHi ? 'प्राप्तकर्ता चुनें (Recipient Target):' : 'Recipient Target:'}</span>
            </label>
            <select
              value={targetType}
              onChange={(e: any) => setTargetType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
            >
              <option value="ALL">🌐 {isHi ? 'सभी यूज़र्स (All Registered Users - Bulk)' : 'All Registered Users (Bulk)'}</option>
              <option value="SINGLE">👤 {isHi ? 'एक विशिष्ट यूज़र (Single Specific User)' : 'Single Specific User'}</option>
              <option value="INVESTORS">💼 {isHi ? 'सक्रिय निवेशक केवल (Active Investors Only)' : 'Active Investors Only'}</option>
              <option value="POSITIVE_BALANCE">💰 {isHi ? 'पॉजिटिव बैलेंस यूज़र्स (Wallet Balance > 0)' : 'Users with Wallet Balance > 0'}</option>
              <option value="SELECTED">👥 {isHi ? 'कस्टम चयनित यूज़र्स (Multi-Selected List)' : 'Custom Selected Users'}</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-cyan-400" />
              <span>{isHi ? 'संदेश श्रेणी (Message Category):' : 'Message Category:'}</span>
            </label>
            <select
              value={category}
              onChange={(e: any) => setCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="ANNOUNCEMENT">📢 {isHi ? 'आधिकारिक घोषणा (Announcement)' : 'Official Announcement'}</option>
              <option value="ALERT">⚠️ {isHi ? 'चेतावनी / अलर्ट (Urgent Alert / Warning)' : 'Urgent Alert / Warning'}</option>
              <option value="INFO">ℹ️ {isHi ? 'सामान्य जानकारी / गाइड (Information)' : 'Information / Guide'}</option>
              <option value="BONUS">🎁 {isHi ? 'रिवॉर्ड / बोनस सूचना (Bonus & Rewards)' : 'Reward / Bonus Notice'}</option>
              <option value="SYSTEM">⚙️ {isHi ? 'सिस्टम / मेंटेनेंस (System Update)' : 'System / Maintenance'}</option>
            </select>
          </div>
        </div>

        {/* If Single User Selected -> Dropdown / Search */}
        {targetType === 'SINGLE' && (
          <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/40 space-y-2 animate-in fade-in duration-150">
            <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <User className="w-4 h-4" />
              <span>{isHi ? 'विशिष्ट यूज़र चुनें (Select Single User):' : 'Select Single User:'}</span>
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder={isHi ? 'नाम, आईडी या मोबाइल नंबर से खोजें...' : 'Search by name, ID or mobile...'}
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
            >
              <option value="">-- {isHi ? 'यूज़र चुनें' : 'Choose a User'} --</option>
              {filteredUsersList.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} (ID: {u.loginId} • 📞 {u.phone})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* If Multi-select Custom List Selected */}
        {targetType === 'SELECTED' && (
          <div className="p-3.5 rounded-xl bg-slate-950 border border-cyan-500/40 space-y-2 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                <span>{isHi ? 'यूज़र्स की सूची चुनें:' : 'Select Target Users:'}</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {isHi ? 'चयनित:' : 'Selected:'} <strong className="text-cyan-300">{selectedUserIds.length}</strong>
              </span>
            </div>

            <div className="max-h-40 overflow-y-auto space-y-1.5 p-2 bg-slate-900 rounded-lg border border-slate-800">
              {regularUsers.map((u) => {
                const isChecked = selectedUserIds.includes(u.id);
                return (
                  <label
                    key={u.id}
                    className={`flex items-center justify-between p-1.5 rounded text-xs cursor-pointer ${
                      isChecked ? 'bg-cyan-950/60 text-cyan-200' : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUserIds([...selectedUserIds, u.id]);
                          } else {
                            setSelectedUserIds(selectedUserIds.filter((id) => id !== u.id));
                          }
                        }}
                        className="rounded border-slate-700 text-cyan-500"
                      />
                      <span className="font-semibold truncate">{u.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({u.loginId})</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{u.phone}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* Options: Instant Popup & Priority */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showPopup}
              onChange={(e) => setShowPopup(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 text-amber-500 focus:ring-amber-400"
            />
            <div>
              <span className="text-xs font-bold text-white block">
                ⚡ {isHi ? 'यूज़र की स्क्रीन पर तुरंत पॉप-अप दिखाएं (Instant Screen Pop-up)' : 'Instant Pop-up on User Screen'}
              </span>
              <span className="text-[10px] text-slate-400">
                {isHi
                  ? 'यूज़र चाहे किसी भी पेज पर हो, यह अलर्ट तुरंत उसकी स्क्रीन पर आएगा और वह इसे कट कर सकता है।'
                  : 'Displays immediate alert modal wherever the user is; they can dismiss and resume work.'}
              </span>
            </div>
          </label>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">{isHi ? 'प्राथमिकता:' : 'Priority:'}</span>
            <button
              type="button"
              onClick={() => setPriority('NORMAL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                priority === 'NORMAL'
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-900 text-slate-500 hover:text-slate-300'
              }`}
            >
              {isHi ? 'सामान्य' : 'Normal'}
            </button>
            <button
              type="button"
              onClick={() => setPriority('URGENT')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                priority === 'URGENT'
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-slate-900 text-slate-500 hover:text-slate-300'
              }`}
            >
              🚨 {isHi ? 'अति-महत्वपूर्ण (Urgent)' : 'Urgent'}
            </button>
          </div>
        </div>

        {/* Title Inputs (English & Hindi) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">
              {isHi ? 'संदेश शीर्षक (Title - English):' : 'Title (English):'} *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Important Notice Regarding Monthly Withdrawals"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">
              {isHi ? 'संदेश शीर्षक (Title - हिंदी):' : 'Title (Hindi):'}
            </label>
            <input
              type="text"
              placeholder="उदा. मासिक निकासी विंडो और महत्वपूर्ण सूचना"
              value={titleHi}
              onChange={(e) => setTitleHi(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Message Content Inputs (English & Hindi) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">
              {isHi ? 'संदेश विवरण (Message Body - English):' : 'Message Body (English):'} *
            </label>
            <textarea
              required
              rows={4}
              placeholder="Write full message content here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400 leading-relaxed"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">
              {isHi ? 'संदेश विवरण (Message Body - हिंदी):' : 'Message Body (Hindi):'}
            </label>
            <textarea
              rows={4}
              placeholder="पूरा संदेश हिंदी में यहाँ लिखें..."
              value={contentHi}
              onChange={(e) => setContentHi(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400 leading-relaxed"
            />
          </div>
        </div>

        {/* Sender Name */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">{isHi ? 'प्रेषक का नाम:' : 'Sender Name:'}</span>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Submit / Broadcast Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-500 hover:from-amber-400 hover:to-teal-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/20 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>
              {isSubmitting
                ? isHi
                  ? 'प्रसारित हो रहा है...'
                  : 'Broadcasting...'
                : isHi
                ? '🚀 संदेश तुरंत लाइव भेजें (Broadcast Now)'
                : '🚀 Broadcast Message Now'}
            </span>
          </button>
        </div>
      </form>

      {/* 3. Sent Messages History & Management */}
      <div className="p-4 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm sm:text-base text-white">
              {isHi ? 'प्रसारित संदेश इतिहास' : 'Broadcast Message History'}
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {isHi ? 'कुल संदेश:' : 'Total:'} <strong className="text-white">{messages.length}</strong>
          </span>
        </div>

        {messages.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            {isHi ? 'अभी तक कोई संदेश प्रसारित नहीं किया गया है।' : 'No messages broadcasted yet.'}
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => {
              const readCount = Array.isArray(msg.readByUserIds) ? msg.readByUserIds.length : 0;
              return (
                <div
                  key={msg.id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-3"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {msg.category}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        🎯 {msg.targetType} {msg.targetUserName && `(${msg.targetUserName})`}
                      </span>
                      {msg.showPopup && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-500/15 text-teal-300">
                          ⚡ Screen Popup
                        </span>
                      )}
                      {msg.priority === 'URGENT' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500 text-white">
                          URGENT
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-sm text-white">{msg.title}</h4>
                    {msg.titleHi && msg.titleHi !== msg.title && (
                      <p className="text-xs text-slate-400">{msg.titleHi}</p>
                    )}
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mt-1">
                      {msg.content}
                    </p>

                    <div className="text-[11px] text-slate-500 flex items-center gap-3 pt-1 font-mono">
                      <span>{new Date(msg.timestamp).toLocaleString(isHi ? 'hi-IN' : 'en-IN')}</span>
                      <span>•</span>
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCheck className="w-3 h-3" />
                        {readCount} {isHi ? 'यूज़र्स ने पढ़ा' : 'users read'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <button
                      onClick={async () => {
                        if (confirm(isHi ? 'क्या आप वाकई इस संदेश को हटाना चाहते हैं?' : 'Are you sure you want to delete this message?')) {
                          await onDeleteMessage(msg.id);
                        }
                      }}
                      className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      title={isHi ? 'संदेश हटाएं' : 'Delete message'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{isHi ? 'हटाएं' : 'Delete'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
