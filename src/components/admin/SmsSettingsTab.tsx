import React, { useState, useEffect } from 'react';
import { SmsSettings, SmsTemplateConfig } from '../../types';
import { saveSmsSettingsToFirestore } from '../../lib/firestoreBridge';
import { CheckCircle2, AlertCircle, Save, Smartphone, MessageSquare, KeyRound } from 'lucide-react';

interface SmsSettingsTabProps {
  smsSettings: SmsSettings | null;
  language: 'en' | 'hi';
}

export const SmsSettingsTab: React.FC<SmsSettingsTabProps> = ({ smsSettings, language }) => {
  const isHi = language === 'hi';
  const [isSmsEnabled, setIsSmsEnabled] = useState(smsSettings?.isSmsEnabled ?? true);
  const [senderId, setSenderId] = useState(smsSettings?.senderId ?? 'GCAPPL');
  
  const [sendOtpSms, setSendOtpSms] = useState<SmsTemplateConfig>(
    smsSettings?.sendOtpSms ?? { enabled: true, template: 'Your GCap verification OTP is {otp}. Valid for 10 minutes.' }
  );
  const [sendRegistrationSms, setSendRegistrationSms] = useState<SmsTemplateConfig>(
    smsSettings?.sendRegistrationSms ?? { enabled: true, template: 'Welcome to GCap! Your account is successfully registered. Login ID: {loginId}' }
  );
  const [sendDepositApprovalSms, setSendDepositApprovalSms] = useState<SmsTemplateConfig>(
    smsSettings?.sendDepositApprovalSms ?? { enabled: true, template: 'GCap Update: Your deposit of ₹{amount} has been approved and credited to your wallet.' }
  );
  const [sendWithdrawalApprovalSms, setSendWithdrawalApprovalSms] = useState<SmsTemplateConfig>(
    smsSettings?.sendWithdrawalApprovalSms ?? { enabled: true, template: 'GCap Update: Your withdrawal request of ₹{amount} has been approved and transferred.' }
  );
  const [sendInvestmentSuccessSms, setSendInvestmentSuccessSms] = useState<SmsTemplateConfig>(
    smsSettings?.sendInvestmentSuccessSms ?? { enabled: true, template: 'GCap: Investment of ₹{amount} in {planName} activated successfully!' }
  );
  const [sendRoiPayoutSms, setSendRoiPayoutSms] = useState<SmsTemplateConfig>(
    smsSettings?.sendRoiPayoutSms ?? { enabled: true, template: 'GCap Payout: Daily ROI of ₹{amount} credited to your wallet successfully!' }
  );

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    if (smsSettings) {
      setIsSmsEnabled(smsSettings.isSmsEnabled ?? true);
      setSenderId(smsSettings.senderId ?? 'GCAPPL');
      if (smsSettings.sendOtpSms) setSendOtpSms(smsSettings.sendOtpSms);
      if (smsSettings.sendRegistrationSms) setSendRegistrationSms(smsSettings.sendRegistrationSms);
      if (smsSettings.sendDepositApprovalSms) setSendDepositApprovalSms(smsSettings.sendDepositApprovalSms);
      if (smsSettings.sendWithdrawalApprovalSms) setSendWithdrawalApprovalSms(smsSettings.sendWithdrawalApprovalSms);
      if (smsSettings.sendInvestmentSuccessSms) setSendInvestmentSuccessSms(smsSettings.sendInvestmentSuccessSms);
      if (smsSettings.sendRoiPayoutSms) setSendRoiPayoutSms(smsSettings.sendRoiPayoutSms);
    }
  }, [smsSettings]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const newSettings: SmsSettings = {
        isSmsEnabled,
        senderId: senderId.trim() || 'GCAPPL',
        sendOtpSms,
        sendRegistrationSms,
        sendDepositApprovalSms,
        sendWithdrawalApprovalSms,
        sendInvestmentSuccessSms,
        sendRoiPayoutSms,
        lastUpdated: new Date().toISOString(),
      };
      await saveSmsSettingsToFirestore(newSettings);
      setSaveMessage(isHi ? 'सभी SMS सेटिंग्स और Sender ID सफलतापूर्वक सेव कर दी गई हैं!' : 'All SMS settings and Sender ID saved successfully!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      setSaveMessage(isHi ? 'सेटिंग्स सेव करने में त्रुटि!' : 'Error saving SMS settings!');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {isHi ? '📱 मोबाइल SMS एवं Sender ID सेटिंग्स' : '📱 Mobile SMS & Sender ID Gateway'}
            </h3>
            <p className="text-xs text-slate-400">
              {isHi ? 'यूज़र्स के मोबाइल पर किस Sender ID (जैसे GCAPPL) से SMS जाएगा, इसे सेट करें।' : 'Configure the DLT Sender ID / Header Name from which SMS will be sent.'}
            </p>
          </div>
        </div>

        {/* Master SMS Switch */}
        <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
          <span className="text-xs font-bold text-slate-300">
            {isHi ? 'मास्टर SMS स्विच' : 'Master SMS Switch'}
          </span>
          <button
            onClick={() => setIsSmsEnabled(!isSmsEnabled)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isSmsEnabled ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                isSmsEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Sender ID Configuration Card */}
      <div className="p-4 bg-slate-950/90 rounded-xl border border-emerald-500/30 space-y-2">
        <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
          <KeyRound className="w-4 h-4" />
          {isHi ? 'SMS Sender ID / हेडर नाम (उदा. GCAPPL, MYCOMP)' : 'SMS Sender ID / Header Name (e.g. GCAPPL, MYCOMP)'}
        </label>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={senderId}
            onChange={(e) => setSenderId(e.target.value.toUpperCase())}
            maxLength={6}
            className="w-full sm:w-64 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-mono font-bold tracking-widest focus:outline-none focus:border-emerald-500 uppercase"
            placeholder="GCAPPL"
          />
          <span className="text-xs text-slate-400">
            {isHi ? '(अधिकतम 6 अक्षर / DLT स्वीकृत हेडर)' : '(Max 6 chars / DLT Approved Header)'}
          </span>
        </div>
      </div>

      {/* Granular SMS Configuration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. OTP SMS */}
        <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              {isHi ? '🔑 OTP सत्यापन SMS' : '🔑 OTP Verification SMS'}
            </span>
            <input
              type="checkbox"
              checked={sendOtpSms.enabled}
              onChange={(e) => setSendOtpSms({ ...sendOtpSms, enabled: e.target.checked })}
              className="w-4 h-4 accent-emerald-500 cursor-pointer"
            />
          </div>
          <textarea
            value={sendOtpSms.template}
            onChange={(e) => setSendOtpSms({ ...sendOtpSms, template: e.target.value })}
            rows={2}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
            placeholder="OTP SMS Template..."
          />
        </div>

        {/* 2. Registration Welcome SMS */}
        <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              {isHi ? '👋 स्वागत (Registration) SMS' : '👋 Registration Welcome SMS'}
            </span>
            <input
              type="checkbox"
              checked={sendRegistrationSms.enabled}
              onChange={(e) => setSendRegistrationSms({ ...sendRegistrationSms, enabled: e.target.checked })}
              className="w-4 h-4 accent-emerald-500 cursor-pointer"
            />
          </div>
          <textarea
            value={sendRegistrationSms.template}
            onChange={(e) => setSendRegistrationSms({ ...sendRegistrationSms, template: e.target.value })}
            rows={2}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
            placeholder="Registration SMS Template..."
          />
        </div>

        {/* 3. Deposit Approval SMS */}
        <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              {isHi ? '📥 डिपॉजिट अप्रूवल SMS' : '📥 Deposit Approval SMS'}
            </span>
            <input
              type="checkbox"
              checked={sendDepositApprovalSms.enabled}
              onChange={(e) => setSendDepositApprovalSms({ ...sendDepositApprovalSms, enabled: e.target.checked })}
              className="w-4 h-4 accent-emerald-500 cursor-pointer"
            />
          </div>
          <textarea
            value={sendDepositApprovalSms.template}
            onChange={(e) => setSendDepositApprovalSms({ ...sendDepositApprovalSms, template: e.target.value })}
            rows={2}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
            placeholder="Deposit SMS Template..."
          />
        </div>

        {/* 4. Withdrawal Approval SMS */}
        <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-rose-400" />
              {isHi ? '📤 निकासी (Withdrawal) SMS' : '📤 Withdrawal Approval SMS'}
            </span>
            <input
              type="checkbox"
              checked={sendWithdrawalApprovalSms.enabled}
              onChange={(e) => setSendWithdrawalApprovalSms({ ...sendWithdrawalApprovalSms, enabled: e.target.checked })}
              className="w-4 h-4 accent-emerald-500 cursor-pointer"
            />
          </div>
          <textarea
            value={sendWithdrawalApprovalSms.template}
            onChange={(e) => setSendWithdrawalApprovalSms({ ...sendWithdrawalApprovalSms, template: e.target.value })}
            rows={2}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
            placeholder="Withdrawal SMS Template..."
          />
        </div>

        {/* 5. Investment Success SMS */}
        <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-purple-400" />
              {isHi ? '📈 निवेश (Investment) SMS' : '📈 Investment Success SMS'}
            </span>
            <input
              type="checkbox"
              checked={sendInvestmentSuccessSms.enabled}
              onChange={(e) => setSendInvestmentSuccessSms({ ...sendInvestmentSuccessSms, enabled: e.target.checked })}
              className="w-4 h-4 accent-emerald-500 cursor-pointer"
            />
          </div>
          <textarea
            value={sendInvestmentSuccessSms.template}
            onChange={(e) => setSendInvestmentSuccessSms({ ...sendInvestmentSuccessSms, template: e.target.value })}
            rows={2}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
            placeholder="Investment SMS Template..."
          />
        </div>

        {/* 6. Daily ROI Payout SMS */}
        <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              {isHi ? '💰 दैनिक ROI Payout SMS' : '💰 Daily ROI Payout SMS'}
            </span>
            <input
              type="checkbox"
              checked={sendRoiPayoutSms.enabled}
              onChange={(e) => setSendRoiPayoutSms({ ...sendRoiPayoutSms, enabled: e.target.checked })}
              className="w-4 h-4 accent-emerald-500 cursor-pointer"
            />
          </div>
          <textarea
            value={sendRoiPayoutSms.template}
            onChange={(e) => setSendRoiPayoutSms({ ...sendRoiPayoutSms, template: e.target.value })}
            rows={2}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
            placeholder="ROI SMS Template..."
          />
        </div>
      </div>

      {saveMessage && (
        <div className={`p-4 rounded-xl flex items-center gap-2 ${saveMessage.includes('त्रुटि') || saveMessage.includes('Error') ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'}`}>
          {saveMessage.includes('त्रुटि') || saveMessage.includes('Error') ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          <span>{saveMessage}</span>
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold transition-all cursor-pointer shadow-lg active:scale-95 disabled:opacity-50"
      >
        <Save className="w-4 h-4" />
        <span>{isSaving ? (isHi ? 'सेव हो रहा है...' : 'Saving...') : (isHi ? 'सभी SMS सेटिंग्स और Sender ID सेव करें' : 'Save All SMS Settings & Sender ID')}</span>
      </button>
    </div>
  );
};
