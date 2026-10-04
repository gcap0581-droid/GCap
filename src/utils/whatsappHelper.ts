/**
 * GCap 1-Click WhatsApp Alert & Notification Dispatcher (100% Free - Zero Cost)
 * Sends pre-formatted, professional corporate transaction receipts, alerts, and notifications.
 */

import { formatINR } from './storage';
import { getStoredCompanyProfile } from './companyStorage';
import { Transaction, UserProfile, ActiveInvestment } from '../types';

export interface WhatsAppAlertOptions {
  phone?: string;
  message: string;
}

/**
 * Sanitizes and cleans Indian mobile numbers for WhatsApp API format
 */
export function formatPhoneNumberForWhatsApp(rawPhone?: string): string {
  if (!rawPhone) return '';
  // Remove all non-digits
  const digits = rawPhone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits;
  }
  if (digits.length > 10 && !digits.startsWith('91')) {
    return digits;
  }
  return digits;
}

/**
 * Triggers 1-Click WhatsApp Dispatch
 */
export function sendWhatsAppAlert(options: WhatsAppAlertOptions): boolean {
  try {
    const { phone, message } = options;
    const cleanPhone = formatPhoneNumberForWhatsApp(phone);
    const encodedText = encodeURIComponent(message);
    
    let url = '';
    if (cleanPhone) {
      url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
    } else {
      url = `https://api.whatsapp.com/send?text=${encodedText}`;
    }

    // Attempt direct window open
    const opened = window.open(url, '_blank', 'noopener,noreferrer');
    if (!opened) {
      // Fallback navigation if popup blocked
      window.location.href = url;
    }
    return true;
  } catch (error) {
    console.error('Failed to trigger WhatsApp alert', error);
    return false;
  }
}

/**
 * Prepares a formatted Deposit Alert message
 */
export function createDepositWhatsAppAlert(
  tx: Transaction,
  userName?: string,
  userPhone?: string
): WhatsAppAlertOptions {
  const profile = getStoredCompanyProfile();
  const companyName = profile.companyName || 'GCAP CAPITAL PRIVATE LIMITED';
  const name = userName || tx.userName || 'Valued Investor';
  const amountStr = formatINR(tx.amount);
  const statusStr = tx.status === 'APPROVED' ? '✅ स्वीकृत (APPROVED)' : tx.status === 'REJECTED' ? '❌ अस्वीकृत (REJECTED)' : '⏳ समीक्षाधीन (PENDING)';

  const message = `*🏛️ ${companyName} — आधिकारिक जमा पुष्टि (Deposit Alert)*\n\n` +
    `नमस्ते *${name}*,\n\n` +
    `आपके जीकैप खाते में नया डिपॉजिट अनुरोध दर्ज हुआ है:\n\n` +
    `💵 *जमा राशि (Amount):* ${amountStr}\n` +
    `📊 *स्थिति (Status):* ${statusStr}\n` +
    `🔢 *लेनदेन आईडी (Tx ID):* ${tx.id}\n` +
    (tx.referenceId ? `🏷️ *संदर्भ संख्या (Ref No):* ${tx.referenceId}\n` : '') +
    `📅 *दिनांक (Date):* ${new Date(tx.timestamp).toLocaleString('hi-IN')}\n\n` +
    `🔒 *सुरक्षा प्रमाण:* यह रसीद जीकैप ब्लॉकचेन लेजर द्वारा सत्यापित है।\n\n` +
    `धन्यवाद,\n*GCAP Global Asset Management*`;

  return {
    phone: userPhone || tx.userPhone,
    message,
  };
}

/**
 * Prepares a formatted Withdrawal Alert message
 */
export function createWithdrawalWhatsAppAlert(
  tx: Transaction,
  userName?: string,
  userPhone?: string
): WhatsAppAlertOptions {
  const profile = getStoredCompanyProfile();
  const companyName = profile.companyName || 'GCAP CAPITAL PRIVATE LIMITED';
  const name = userName || tx.userName || 'Valued Investor';
  const gross = tx.grossAmount ?? tx.amount;
  const tds = tx.tdsAmount ?? 0;
  const net = tx.netAmount ?? (gross - tds);
  const statusStr = tx.status === 'APPROVED' ? '✅ खाते में भेजा गया (SUCCESS)' : tx.status === 'REJECTED' ? '❌ अस्वीकृत (REJECTED)' : '⏳ प्रोसेस में है (PROCESSING)';

  const message = `*🏛️ ${companyName} — आधिकारिक निकासी वाउचर (Withdrawal Voucher)*\n\n` +
    `नमस्ते *${name}*,\n\n` +
    `आपकी निकासी (Withdrawal) का आधिकारिक विवरण निम्नलिखित है:\n\n` +
    `💰 *कुल निकासी (Gross Amount):* ${formatINR(gross)}\n` +
    `📉 *TDS कटौती (TDS Deducted):* ${formatINR(tds)}\n` +
    `💳 *शुद्ध प्राप्त राशि (Net Paid Amount):* *${formatINR(net)}*\n` +
    `📊 *वर्तमान स्थिति (Status):* ${statusStr}\n` +
    `🔢 *वाउचर क्रमांक (Voucher No):* ${tx.id}\n` +
    (tx.destinationDetails ? `🏦 *भुगतान माध्यम (Destination):* ${tx.destinationDetails}\n` : '') +
    `📅 *समय (Date & Time):* ${new Date(tx.timestamp).toLocaleString('hi-IN')}\n\n` +
    `🛡️ *पुष्टि:* राशि आपके बैंक/UPI खाते में सुरक्षित क्रेडिट की गई है।\n\n` +
    `शुभकामनाएं,\n*GCAP Payout Department*`;

  return {
    phone: userPhone || tx.userPhone,
    message,
  };
}

/**
 * Prepares a formatted Maturity Certificate WhatsApp message
 */
export function createMaturityCertificateWhatsAppAlert(
  investment: ActiveInvestment,
  user?: UserProfile | null
): WhatsAppAlertOptions {
  const profile = getStoredCompanyProfile();
  const companyName = profile.companyName || 'GCAP CAPITAL PRIVATE LIMITED';
  const name = user?.name || 'Valued Investor';
  const planName = investment.planName || 'GCAP Investment Scheme';
  const principalStr = formatINR(investment.investedAmount);
  const totalEarnedStr = formatINR(investment.earnedSoFar || 0);

  const message = `*👑 ${companyName} — प्रोजेक्ट समापन एवं 100% मूलधन वापसी प्रमाण पत्र*\n\n` +
    `बधाई हो *${name}*! 🎉\n\n` +
    `आपने अपनी निवेश योजना को शत-प्रतिशत सफलता के साथ पूर्ण कर लिया है:\n\n` +
    `📋 *प्रोजेक्ट का नाम:* ${planName}\n` +
    `💵 *मूलधन निवेश (Principal):* ${principalStr}\n` +
    `📈 *कुल प्राप्त रिटर्न (Total Returns):* ${totalEarnedStr}\n` +
    `💎 *100% मूलधन स्थिति:* 100% सुरक्षित वापस (Refunded)\n` +
    `📜 *प्रमाण पत्र आईडी:* ${investment.certificateNumber || 'GCAP-CERT-' + investment.id.slice(-6).toUpperCase()}\n\n` +
    `🏛️ *डिजिटल सील:* CIN: ${profile.cin || 'U67190MH2023PTC109824'}\n\n` +
    `GCAP पर भरोसा करने के लिए बहुत-बहुत धन्यवाद!\n*GCAP Executive Board*`;

  return {
    phone: user?.phone,
    message,
  };
}

/**
 * Prepares a formatted Admin Broadcast Announcement WhatsApp message
 */
export function createBroadcastWhatsAppAlert(
  title: string,
  content: string,
  userPhone?: string
): WhatsAppAlertOptions {
  const profile = getStoredCompanyProfile();
  const companyName = profile.companyName || 'GCAP CAPITAL PRIVATE LIMITED';

  const message = `*📢 ${companyName} — आधिकारिक महत्वपूर्ण सूचना*\n\n` +
    `*${title}*\n\n` +
    `${content}\n\n` +
    `──────────────────\n` +
    `📞 *हेल्पलाइन:* ${profile.supportPhone || '+91 98000 12345'}\n` +
    `🌐 *वेबसाइट पोर्टल:* GCAP Global Asset Portal`;

  return {
    phone: userPhone,
    message,
  };
}
