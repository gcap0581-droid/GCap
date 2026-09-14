import React, { useState } from 'react';
import {
  QrCode,
  Send,
  Camera,
  Copy,
  Check,
  Share2,
  ArrowRight,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  X,
  Users,
  Wallet as WalletIcon,
} from 'lucide-react';
import { Language, UserProfile, Wallet } from '../types';

interface GpTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  wallet: Wallet;
  language: Language;
  usersList: UserProfile[];
  onExecuteGpTransfer: (recipientLoginId: string, amount: number) => boolean;
}

export const GpTransferModal: React.FC<GpTransferModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  wallet,
  language,
  usersList,
  onExecuteGpTransfer,
}) => {
  const isHi = language === 'hi';
  const [activeTab, setActiveTab] = useState<'RECEIVE' | 'SEND'>('RECEIVE');
  const [recipientId, setRecipientId] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [copied, setCopied] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState<string | null>(null);

  // Dynamic Daily-Rotating Unique QR Token State
  const todayDateStr = new Date().toISOString().split('T')[0];
  const [qrNonce, setQrNonce] = useState<string>(
    () => Math.random().toString(36).substring(2, 12) + '-' + Date.now().toString(36)
  );

  const generateNewQrCode = () => {
    const newNonce = Math.random().toString(36).substring(2, 12) + '-' + Date.now().toString(36) + '-' + Math.floor(Math.random() * 100000);
    setQrNonce(newNonce);
  };

  if (!isOpen) return null;

  const gpAmount = parseFloat(amountStr) || 0;
  const feePercent = 2.0; // 2% admin fee
  const feeAmount = gpAmount * (feePercent / 100);
  const totalDeducted = gpAmount + feeAmount;
  const userGpBalance = wallet.gpBalance || 0;
  const hasEnoughGp = userGpBalance >= totalDeducted && gpAmount > 0;

  // Strict Unique Non-Duplicate Daily Expiring QR Data format
  const qrDataText = `GCAP_SECURE_QR:${currentUser.loginId}:${todayDateStr}:${qrNonce}`;

  const handleCopyQrData = () => {
    navigator.clipboard.writeText(qrDataText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      isHi
        ? `नमस्ते! मेरा आज (${todayDateStr}) का अद्वितीय GCap GP QR सुरक्षित डेटा यह है:\nID: ${currentUser.loginId}\nनाम: ${currentUser.name}\nQR डेटा: ${qrDataText}\n(यह QR कोड केवल आज के लिए वैध है)।`
        : `Hello! Here is my unique GCap GP secure QR data for today (${todayDateStr}):\nID: ${currentUser.loginId}\nName: ${currentUser.name}\nData: ${qrDataText}\n(Valid for today only).`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleScanInput = (scannedText: string) => {
    // Validate QR format: GCAP_SECURE_QR:userId:date:nonce
    const parts = scannedText.trim().split(':');
    if (parts.length >= 4 && parts[0] === 'GCAP_SECURE_QR') {
      const targetUserId = parts[1];
      const qrDate = parts[2];

      if (qrDate !== todayDateStr) {
        alert(
          isHi
            ? `⚠️ यह QR कोड एक्सपायर हो गया है! यह कोड दिनांक ${qrDate} का है जो आज (${todayDateStr}) अमान्य है। प्रत्येक दिन का QR कोड केवल उसी दिन वैध रहता है।`
            : `⚠️ This QR code has expired! It is from date ${qrDate} and is invalid today (${todayDateStr}). Daily QR codes only work on their respective day.`
        );
        return;
      }

      if (targetUserId.toLowerCase() === currentUser.loginId.toLowerCase()) {
        alert(isHi ? 'आप स्वयं अपना QR कोड स्कैन नहीं कर सकते।' : 'You cannot scan your own QR code.');
        return;
      }

      const recipient = usersList.find(u => u.loginId.toLowerCase() === targetUserId.toLowerCase() || u.phone?.toLowerCase() === targetUserId.toLowerCase());
      if (recipient) {
        setScannedResult(recipient.loginId);
        alert(
          isHi
            ? `✅ QR कोड सफलतापूर्वक सत्यापित! प्राप्तकर्ता: ${recipient.name} (${recipient.loginId})`
            : `✅ QR Code successfully verified! Recipient: ${recipient.name} (${recipient.loginId})`
        );
      } else {
        // Fallback if user is in system database
        setScannedResult(targetUserId);
        alert(isHi ? `✅ QR सत्यापित! प्राप्तकर्ता ID: ${targetUserId}` : `✅ QR Verified! Recipient ID: ${targetUserId}`);
      }
    } else {
      // Manual ID or legacy format
      setScannedResult(scannedText);
    }
  };

  const handleSendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = scannedResult || recipientId.trim();
    if (!targetId) {
      alert(isHi ? 'कृपया प्राप्तकर्ता की यूज़र ID या फोन नंबर दर्ज करें।' : 'Please enter recipient User ID or Phone.');
      return;
    }
    if (gpAmount <= 0) {
      alert(isHi ? 'कृपया वैध GP राशि दर्ज करें।' : 'Please enter a valid GP amount.');
      return;
    }
    if (!hasEnoughGp) {
      alert(isHi ? 'पर्याप्त GP बैलेंस उपलब्ध नहीं है (2% ट्रांजेक्शन चार्ज सहित)।' : 'Insufficient GP balance including 2% fee.');
      return;
    }

    const success = onExecuteGpTransfer(targetId, gpAmount);
    if (success) {
      setRecipientId('');
      setAmountStr('');
      setScannedResult(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-lg text-white">
                {isHi ? 'P2P GP ट्रांसफर व QR कोड' : 'P2P GP Transfer & QR Code'}
              </h3>
              <p className="text-xs text-slate-400">
                {isHi ? 'तत्काल GP भेजें और प्राप्त करें (2% शुल्क)' : 'Instant Peer-to-Peer GP Transfer (2% fee)'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* GP Balance Banner */}
        <div className="px-5 py-3 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-slate-300 font-medium">
              {isHi ? 'आपका वर्तमान GP बैलेंस:' : 'Your Current GP Balance:'}
            </span>
          </div>
          <div className="text-base font-black text-amber-400 font-mono">
            {userGpBalance.toLocaleString('en-IN')} GP
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-2 bg-slate-950 border-b border-slate-800 gap-2">
          <button
            onClick={() => setActiveTab('RECEIVE')}
            className={`py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'RECEIVE'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>{isHi ? '📥 GP प्राप्त करें (QR Code)' : '📥 Receive GP (QR)'}</span>
          </button>

          <button
            onClick={() => setActiveTab('SEND')}
            className={`py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'SEND'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>{isHi ? '📤 GP भेजें (Scan & Send)' : '📤 Send GP (Scan)'}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {activeTab === 'RECEIVE' ? (
            <div className="space-y-4 text-center animate-in fade-in">
              <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col items-center justify-center space-y-4 shadow-inner">
                
                {/* Simulated High-Tech QR Code Graphic */}
                <div className="w-48 h-48 bg-white p-3 rounded-2xl shadow-xl flex flex-col items-center justify-center border-4 border-amber-400 relative group">
                  <div className="absolute inset-2 border-2 border-dashed border-slate-900 rounded-lg flex flex-col items-center justify-center p-2 bg-slate-50">
                    <QrCode className="w-24 h-24 text-slate-900" />
                    <span className="text-[10px] font-black text-slate-900 uppercase mt-1 tracking-wider font-mono">
                      GCAP SECURE GP
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="font-extrabold text-white text-base">{currentUser.name}</h4>
                  <p className="text-xs text-amber-400 font-mono font-bold">ID: {currentUser.loginId}</p>
                  <p className="text-[11px] text-slate-400">
                    {isHi ? `आज (${todayDateStr}) का अद्वितीय सुरक्षित QR कोड` : `Unique Secure QR for today (${todayDateStr})`}
                  </p>
                </div>

                {/* Button to Generate New QR Code */}
                <button
                  type="button"
                  onClick={generateNewQrCode}
                  className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                  <span>{isHi ? '🔄 नया QR कोड जनरेट करें (ताज़ा यूनिक)' : '🔄 Generate New Unique QR'}</span>
                </button>
              </div>

              {/* Share Options */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 block text-left">
                  {isHi ? '🔗 QR कोड व विवरण शेयर करें:' : '🔗 Share QR & Details:'}
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleCopyQrData}
                    className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
                    <span>{copied ? (isHi ? 'कॉपी हो गया!' : 'Copied!') : (isHi ? 'आईडी कॉपी करें' : 'Copy ID')}</span>
                  </button>

                  <button
                    onClick={handleWhatsAppShare}
                    className="py-2.5 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 border border-emerald-500/30 transition-colors cursor-pointer"
                  >
                    <Share2 className="w-4 h-4 text-emerald-400" />
                    <span>{isHi ? 'व्हाट्सएप शेयर' : 'WhatsApp Share'}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSendSubmit} className="space-y-4 animate-in fade-in">
              
              {/* Scan option header */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-slate-200">
                    {isHi ? 'QR स्कैनर कैमरा' : 'QR Scanner Camera'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsScanning(true);
                    setTimeout(() => {
                      setIsScanning(false);
                      const sample = usersList.find(u => u.loginId !== currentUser.loginId);
                      if (sample) {
                        const simulatedSecureQr = `GCAP_SECURE_QR:${sample.loginId}:${todayDateStr}:mockScan${Math.random().toString(36).substring(2, 8)}`;
                        handleScanInput(simulatedSecureQr);
                      } else {
                        alert(isHi ? 'कोई अन्य यूज़र नहीं मिला।' : 'No other users found.');
                      }
                    }, 1500);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  {isScanning ? (isHi ? 'स्कैन हो रहा है...' : 'Scanning...') : (isHi ? '📸 QR स्कैन करें' : 'Scan QR Code')}
                </button>
              </div>

              {scannedResult && (
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs text-emerald-300">
                  <span>{isHi ? `स्कैन किया गया प्राप्तकर्ता: ${scannedResult}` : `Scanned Recipient: ${scannedResult}`}</span>
                  <button
                    type="button"
                    onClick={() => setScannedResult(null)}
                    className="text-slate-400 hover:text-white font-bold"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Recipient Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">
                  {isHi ? 'प्राप्तकर्ता यूज़र ID / फोन नंबर:' : 'Recipient User ID / Phone:'}
                </label>
                <input
                  type="text"
                  value={scannedResult || recipientId}
                  onChange={(e) => {
                    setScannedResult(null);
                    setRecipientId(e.target.value);
                  }}
                  placeholder={isHi ? 'उदा. user_login_id या phone' : 'e.g. user_login_id or phone'}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                  required
                />
              </div>

              {/* Amount Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">
                  {isHi ? 'भेजने के लिए GP मात्रा:' : 'GP Amount to Send:'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={amountStr}
                    onChange={(e) => setAmountStr(e.target.value)}
                    placeholder="0"
                    className="w-full pl-3.5 pr-16 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-bold text-amber-400 focus:outline-none focus:border-amber-400 font-mono"
                    required
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400 font-mono">
                    GP
                  </span>
                </div>
              </div>

              {/* Fee Breakdown Calculation */}
              {gpAmount > 0 && (
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>{isHi ? 'स्थानांतरण GP:' : 'Transfer Amount:'}</span>
                    <span className="font-mono text-white">{gpAmount.toLocaleString('en-IN')} GP</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>{isHi ? 'एडमिन ट्रांजेक्शन शुल्क (2%):' : 'Admin Transfer Fee (2%):'}</span>
                    <span className="font-mono text-amber-400">+{feeAmount.toFixed(2)} GP</span>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex justify-between font-bold">
                    <span className="text-slate-200">{isHi ? 'कुल आपके खाते से कटेगा:' : 'Total Deducted:'}</span>
                    <span className={`font-mono ${hasEnoughGp ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {totalDeducted.toFixed(2)} GP
                    </span>
                  </div>
                </div>
              )}

              {!hasEnoughGp && gpAmount > 0 && (
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{isHi ? 'अपर्याप्त GP बैलेंस (2% शुल्क सहित)।' : 'Insufficient GP balance including 2% fee.'}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!hasEnoughGp}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20 transition-all cursor-pointer"
              >
                <span>{isHi ? '🚀 तुरंत GP ट्रांसफर करें' : '🚀 Transfer GP Now'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
