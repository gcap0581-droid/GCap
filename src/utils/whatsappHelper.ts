/**
 * GCap 1-Click WhatsApp Alert & Notification Dispatcher (100% Free - Zero Cost)
 * Sends pre-formatted, professional corporate transaction receipts, alerts, and notifications.
 * Automatically maintains persistent dispatch audit ledger & records.
 */

import { formatINR } from './storage';
import { getStoredCompanyProfile } from './companyStorage';
import { getStoredRules } from './rulesStorage';
import { Transaction, UserProfile, ActiveInvestment, WhatsAppDispatchLog, WhatsAppAlertType, MetaCloudApiConfig } from '../types';

export interface WhatsAppAlertOptions {
  phone?: string;
  message: string;
  type?: WhatsAppAlertType;
  title?: string;
  recipientName?: string;
  recipientRole?: 'ADMIN' | 'INVESTOR' | 'USER';
  amount?: number;
  referenceId?: string;
  status?: 'DISPATCHED' | 'TEST_SAMPLE';
}

const WHATSAPP_LOGS_STORAGE_KEY = 'gcap_whatsapp_audit_dispatch_logs_v1';
const META_CLOUD_API_STORAGE_KEY = 'gcap_meta_cloud_api_config_v1';

export const DEFAULT_META_CONFIG: MetaCloudApiConfig = {
  enabled: false,
  phoneNumberId: '',
  wabaId: '',
  accessToken: '',
  verifiedDisplayName: 'GCAP PRIVATE LIMITED',
};

/**
 * Retrieves stored Meta WhatsApp Cloud API credentials
 */
export function getMetaCloudApiConfig(): MetaCloudApiConfig {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(META_CLOUD_API_STORAGE_KEY) : null;
    if (!raw) return DEFAULT_META_CONFIG;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_META_CONFIG, ...parsed };
  } catch {
    return DEFAULT_META_CONFIG;
  }
}

/**
 * Saves Meta WhatsApp Cloud API credentials
 */
export function saveMetaCloudApiConfig(config: MetaCloudApiConfig): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(META_CLOUD_API_STORAGE_KEY, JSON.stringify(config));
    }
  } catch (err) {
    console.error('Failed to save Meta Cloud API config', err);
  }
}

/**
 * Retrieves all stored WhatsApp dispatch audit logs
 */
export function getStoredWhatsAppLogs(): WhatsAppDispatchLog[] {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(WHATSAPP_LOGS_STORAGE_KEY) : null;
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load WhatsApp logs', err);
    return [];
  }
}

/**
 * Saves a new WhatsApp dispatch record to the audit ledger
 */
export function recordWhatsAppDispatchLog(logData: Partial<WhatsAppDispatchLog>): WhatsAppDispatchLog {
  const newLog: WhatsAppDispatchLog = {
    id: logData.id || `WA-LOG-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    type: logData.type || 'CUSTOM_TEST',
    title: logData.title || 'WhatsApp Message',
    recipientPhone: logData.recipientPhone || '',
    recipientName: logData.recipientName || 'User',
    recipientRole: logData.recipientRole || 'ADMIN',
    messageBody: logData.messageBody || '',
    timestamp: logData.timestamp || Date.now(),
    dateStr: logData.dateStr || new Date().toLocaleString('hi-IN'),
    status: logData.status || 'DISPATCHED',
    referenceId: logData.referenceId,
    amount: logData.amount,
  };

  try {
    const existing = getStoredWhatsAppLogs();
    const updated = [newLog, ...existing].slice(0, 300); // keep up to 300 logs
    if (typeof window !== 'undefined') {
      localStorage.setItem(WHATSAPP_LOGS_STORAGE_KEY, JSON.stringify(updated));
    }
  } catch (err) {
    console.error('Failed to persist WhatsApp log', err);
  }

  return newLog;
}

/**
 * Clears stored WhatsApp audit logs
 */
export function clearWhatsAppLogs(): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(WHATSAPP_LOGS_STORAGE_KEY);
    }
  } catch (err) {
    console.error('Failed to clear WhatsApp logs', err);
  }
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
 * Gets the configured Admin Alert WhatsApp Number
 */
export function getAdminWhatsAppAlertNumber(): string {
  const profile = getStoredCompanyProfile();
  if (profile.adminWhatsAppNumber && profile.adminWhatsAppNumber.trim()) {
    return profile.adminWhatsAppNumber.trim();
  }
  const rules = getStoredRules();
  if (rules.adminWhatsAppNumber && rules.adminWhatsAppNumber.trim()) {
    return rules.adminWhatsAppNumber.trim();
  }
  return profile.supportPhone || '+91 8603504808';
}

/**
 * Triggers 1-Click WhatsApp Dispatch & automatically records the audit log
 */
export function sendWhatsAppAlert(options: WhatsAppAlertOptions): boolean {
  try {
    const { phone, message, type, title, recipientName, recipientRole, amount, referenceId, status } = options;
    const cleanPhone = formatPhoneNumberForWhatsApp(phone);
    const encodedText = encodeURIComponent(message);
    
    let url = '';
    if (cleanPhone) {
      url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
    } else {
      url = `https://api.whatsapp.com/send?text=${encodedText}`;
    }

    // Record audit log
    recordWhatsAppDispatchLog({
      type: type || 'CUSTOM_TEST',
      title: title || 'WhatsApp Alert',
      recipientPhone: phone || 'Default Receiver',
      recipientName: recipientName || 'Investor / Admin',
      recipientRole: recipientRole || 'ADMIN',
      messageBody: message,
      amount,
      referenceId,
      status: status || 'DISPATCHED',
    });

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
 * Prepares a formatted Deposit Alert message to Admin's WhatsApp
 */
export function createAdminDepositAlertMessage(
  tx: Partial<Transaction>,
  userName?: string,
  userLoginId?: string,
  userPhone?: string
): WhatsAppAlertOptions {
  const profile = getStoredCompanyProfile();
  const companyName = profile.companyName || 'GCAP CAPITAL PRIVATE LIMITED';
  const adminPhone = getAdminWhatsAppAlertNumber();
  const amountStr = formatINR(tx.amount || 0);

  const message = `*🚨 नया डिपॉजिट भुगतान अलर्ट (New Deposit Alert)*\n\n` +
    `*🏛️ कंपनी:* ${companyName}\n\n` +
    `👤 *निवेशक का नाम:* ${userName || tx.userName || 'निवेशक'}\n` +
    (userLoginId ? `🆔 *यूज़र आईडी:* ${userLoginId}\n` : '') +
    (userPhone ? `📱 *मोबाइल नंबर:* ${userPhone}\n` : '') +
    `💵 *जमा राशि (Amount):* *${amountStr}*\n` +
    `💳 *भुगतान विधि:* ${tx.method || 'UPI / QR'}\n` +
    (tx.referenceId ? `🏷️ *UTR / Ref No:* ${tx.referenceId}\n` : '') +
    `🔢 *लेनदेन आईडी:* ${tx.id || 'GCAP-TX-' + Date.now().toString().slice(-6)}\n` +
    `📅 *दिनांक व समय:* ${new Date(tx.timestamp || Date.now()).toLocaleString('hi-IN')}\n\n` +
    `🔒 *कार्रवाई आवश्यक:* कृपया एडमिन पैनल में जाकर पेमेंट स्लिप जांचें और अप्रूव करें।\n\n` +
    `*GCAP Global Asset Management Portal*`;

  return {
    phone: adminPhone,
    message,
    type: 'DEPOSIT_ALERT',
    title: 'डिपॉजिट अनुरोध अलर्ट',
    recipientName: userName || 'Admin',
    recipientRole: 'ADMIN',
    amount: tx.amount,
    referenceId: tx.referenceId || tx.id,
  };
}

/**
 * Prepares a formatted Withdrawal Request message to Admin's WhatsApp
 */
export function createAdminWithdrawalAlertMessage(
  tx: Partial<Transaction>,
  userName?: string,
  userLoginId?: string,
  userPhone?: string
): WhatsAppAlertOptions {
  const profile = getStoredCompanyProfile();
  const companyName = profile.companyName || 'GCAP CAPITAL PRIVATE LIMITED';
  const adminPhone = getAdminWhatsAppAlertNumber();
  const gross = tx.grossAmount ?? tx.amount ?? 0;
  const tds = tx.tdsAmount ?? 0;
  const net = tx.netAmount ?? (gross - tds);

  const message = `*🚨 नया निकासी अनुरोध अलर्ट (New Withdrawal Request)*\n\n` +
    `*🏛️ कंपनी:* ${companyName}\n\n` +
    `👤 *निवेशक का नाम:* ${userName || tx.userName || 'निवेशक'}\n` +
    (userLoginId ? `🆔 *यूज़र आईडी:* ${userLoginId}\n` : '') +
    (userPhone ? `📱 *मोबाइल नंबर:* ${userPhone}\n` : '') +
    `💰 *कुल निकासी (Gross):* ${formatINR(gross)}\n` +
    `📉 *TDS कटौती:* ${formatINR(tds)}\n` +
    `💳 *नेट भुगतेय राशि (Net Payable):* *${formatINR(net)}*\n` +
    `🏦 *भुगतान माध्यम:* ${tx.destinationDetails || tx.method || 'UPI / Bank'}\n` +
    `🔢 *अनुरोध आईडी:* ${tx.id || tx.referenceId || 'GCAP-WDR-' + Date.now().toString().slice(-6)}\n` +
    `📅 *दिनांक व समय:* ${new Date(tx.timestamp || Date.now()).toLocaleString('hi-IN')}\n\n` +
    `🔒 *कार्रवाई:* कृपया एडमिन पैनल में जाकर फंड ट्रांसफर करें और अप्रूव करें।\n\n` +
    `*GCAP Payout Management*`;

  return {
    phone: adminPhone,
    message,
    type: 'WITHDRAWAL_ALERT',
    title: 'निकासी अनुरोध अलर्ट',
    recipientName: userName || 'Admin',
    recipientRole: 'ADMIN',
    amount: gross,
    referenceId: tx.referenceId || tx.id,
  };
}

/**
 * Prepares a formatted Deposit Alert message to User's WhatsApp
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
    type: 'DEPOSIT_ALERT',
    title: 'डिपॉजिट पुष्टि रसीद',
    recipientName: name,
    recipientRole: 'INVESTOR',
    amount: tx.amount,
    referenceId: tx.referenceId || tx.id,
  };
}

/**
 * Prepares a formatted Withdrawal Alert message to User's WhatsApp
 */
export function createWithdrawalWhatsAppAlert(
  tx: Transaction,
  userName?: string,
  userPhone?: string
): WhatsAppAlertOptions {
  const profile = getStoredCompanyProfile();
  const companyName = profile.companyName || 'GCAP CAPITAL PRIVATE LIMITED';
  const name = userName || tx.userName || 'Valued Investor';
  const gross = tx.grossAmount ?? tx.amount ?? 0;
  const tds = tx.tdsAmount ?? 0;
  const adminFee = tx.adminFeeAmount ?? 0;
  const net = tx.netAmount ?? Math.max(0, gross - tds - adminFee);
  const isPaid = tx.status === 'APPROVED' || tx.status === 'SUCCESS';
  const statusStr = isPaid
    ? '✅ बैंक/UPI खाते में भुगतान सफल (PAYMENT COMPLETED)'
    : tx.status === 'REJECTED'
    ? '❌ अस्वीकृत (REJECTED)'
    : '⏳ प्रोसेस में है (PROCESSING / PENDING)';

  const message = `*🏛️ ${companyName} — आधिकारिक निकासी वाउचर (Withdrawal Payout Receipt)*\n\n` +
    `नमस्ते *${name}*,\n\n` +
    `आपकी निकासी (Withdrawal) का संपूर्ण विवरण निम्नलिखित है:\n\n` +
    `👤 *निवेशक का नाम:* ${name}\n` +
    `💰 *कुल निकासी राशि (Gross):* ${formatINR(gross)}\n` +
    `📉 *सरकारी TDS कटौती:* -${formatINR(tds)}\n` +
    (adminFee > 0 ? `💼 *एडमिन सेवा शुल्क:* -${formatINR(adminFee)}\n` : '') +
    `💳 *खाते में भेजी गई शुद्ध राशि (Net Transferred):* *${formatINR(net)}*\n` +
    `📊 *भुगतान स्थिति (Status):* *${statusStr}*\n` +
    (tx.destinationDetails ? `🏦 *प्राप्तकर्ता बैंक/UPI:* ${tx.destinationDetails}\n` : '') +
    `🔢 *वाउचर / संदर्भ संख्या (Ref ID):* ${tx.referenceId || tx.id}\n` +
    `📅 *दिनांक व समय:* ${new Date(tx.timestamp || Date.now()).toLocaleString('hi-IN')}\n\n` +
    (isPaid
      ? `🛡️ *पुष्टि प्रमाण:* कंपनी मुख्य बैलेंस द्वारा आपके बैंक/UPI खाते में राशि सफलतापूर्वक ट्रांसफर कर दी गई है।\n\n`
      : `⏳ *समीक्षा:* आपका निकासी अनुरोध एडमिन पैनल में समीक्षाधीन है। अप्रूव होते ही राशि आपके खाते में क्रेडिट होगी।\n\n`) +
    `*GCAP Global Asset Management & Payouts*`;

  return {
    phone: userPhone || tx.userPhone,
    message,
    type: 'PAYMENT_VOUCHER',
    title: 'भुगतान वाउचर रसीद',
    recipientName: name,
    recipientRole: 'INVESTOR',
    amount: gross,
    referenceId: tx.referenceId || tx.id,
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
    type: 'MATURITY_CERTIFICATE',
    title: 'प्रोजेक्ट समापन व मूलधन वापसी प्रमाण पत्र',
    recipientName: name,
    recipientRole: 'INVESTOR',
    amount: investment.investedAmount,
    referenceId: investment.certificateNumber || investment.id,
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
    `📞 *हेल्पलाइन:* ${profile.supportPhone || '+91 8503504808'}\n` +
    `🌐 *वेबसाइट पोर्टल:* GCAP Global Asset Portal`;

  return {
    phone: userPhone,
    message,
    type: 'BROADCAST_NOTICE',
    title: `ब्रॉडकास्ट: ${title}`,
    recipientName: 'समस्त निवेशक / ऑल यूज़र्स',
    recipientRole: 'INVESTOR',
  };
}

/**
 * =========================================================================
 * ALL 7 TYPES OF TEST SAMPLES (Live Testing & Simulator Suite)
 * =========================================================================
 */

export interface WhatsAppSampleDefinition {
  id: WhatsAppAlertType;
  nameHi: string;
  nameEn: string;
  description: string;
  icon: string;
  generateAlert: (targetPhone?: string) => WhatsAppAlertOptions;
}

export const WHATSAPP_TEST_SAMPLES: WhatsAppSampleDefinition[] = [
  {
    id: 'DEPOSIT_ALERT',
    nameHi: '1. नया डिपॉजिट अनुरोध अलर्ट (Admin Alert)',
    nameEn: '1. New Deposit Request Alert (To Admin)',
    description: 'जब कोई निवेशक नया डिपॉजिट करता है, एडमिन को त्वरित स्वीकृति हेतु जाने वाला मैसेज।',
    icon: '💵',
    generateAlert: (targetPhone) => {
      const profile = getStoredCompanyProfile();
      const companyName = profile.companyName || 'GCAP PRIVATE LIMITED';
      const phone = targetPhone || getAdminWhatsAppAlertNumber();
      const message = `*🚨 [टेस्ट सैंपल] नया डिपॉजिट भुगतान अलर्ट (New Deposit Alert)*\n\n` +
        `*🏛️ कंपनी:* ${companyName}\n\n` +
        `👤 *निवेशक का नाम:* AMIT KUMAR\n` +
        `🆔 *यूज़र आईडी:* GCAP-99412\n` +
        `📱 *मोबाइल नंबर:* +91 98000 12345\n` +
        `💵 *जमा राशि (Amount):* *₹50,000.00*\n` +
        `💳 *भुगतान विधि:* UPI (PhonePe / GPay)\n` +
        `🏷️ *UTR / Ref No:* 429183049102\n` +
        `🔢 *लेनदेन आईडी:* GCAP-TX-774912\n` +
        `📅 *दिनांक व समय:* ${new Date().toLocaleString('hi-IN')}\n\n` +
        `🔒 *कार्रवाई आवश्यक:* कृपया एडमिन पैनल में जाकर पेमेंट स्लिप जांचें और अप्रूव करें।\n\n` +
        `*GCAP Global Asset Management Portal*`;

      return {
        phone,
        message,
        type: 'DEPOSIT_ALERT',
        title: '[टेस्ट सैंपल] नया डिपॉजिट अलर्ट',
        recipientName: 'एडमिनिस्ट्रेटर',
        recipientRole: 'ADMIN',
        amount: 50000,
        referenceId: '429183049102',
        status: 'TEST_SAMPLE',
      };
    },
  },
  {
    id: 'WITHDRAWAL_ALERT',
    nameHi: '2. नया निकासी अनुरोध अलर्ट (Admin Alert)',
    nameEn: '2. New Withdrawal Request Alert (To Admin)',
    description: 'जब कोई निवेशक निकासी डालता है, एडमिन को बैंक ट्रांसफर हेतु जाने वाला मैसेज।',
    icon: '💸',
    generateAlert: (targetPhone) => {
      const profile = getStoredCompanyProfile();
      const companyName = profile.companyName || 'GCAP PRIVATE LIMITED';
      const phone = targetPhone || getAdminWhatsAppAlertNumber();
      const message = `*🚨 [टेस्ट सैंपल] नया निकासी अनुरोध अलर्ट (New Withdrawal Request)*\n\n` +
        `*🏛️ कंपनी:* ${companyName}\n\n` +
        `👤 *निवेशक का नाम:* ROHIT VERMA\n` +
        `🆔 *यूज़र आईडी:* GCAP-38102\n` +
        `📱 *मोबाइल नंबर:* +91 98765 43210\n` +
        `💰 *कुल निकासी (Gross):* ₹10,000.00\n` +
        `📉 *TDS कटौती (5%):* ₹500.00\n` +
        `💳 *नेट भुगतेय राशि (Net Payable):* *₹9,500.00*\n` +
        `🏦 *भुगतान माध्यम:* UPI: rohit@oksbi\n` +
        `🔢 *अनुरोध आईडी:* GCAP-WTH-992104\n` +
        `📅 *दिनांक व समय:* ${new Date().toLocaleString('hi-IN')}\n\n` +
        `🔒 *कार्रवाई:* कृपया एडमिन पैनल में जाकर फंड ट्रांसफर करें और अप्रूव करें।\n\n` +
        `*GCAP Payout Management*`;

      return {
        phone,
        message,
        type: 'WITHDRAWAL_ALERT',
        title: '[टेस्ट सैंपल] नया निकासी अलर्ट',
        recipientName: 'एडमिनिस्ट्रेटर',
        recipientRole: 'ADMIN',
        amount: 10000,
        referenceId: 'GCAP-WTH-992104',
        status: 'TEST_SAMPLE',
      };
    },
  },
  {
    id: 'PAYMENT_VOUCHER',
    nameHi: '3. आधिकारिक भुगतान वाउचर रसीद (To Investor)',
    nameEn: '3. Official Payout Voucher (To Investor)',
    description: 'भुगतान पूरा होने पर निवेशक को जाने वाला विस्तृत वाउचर एवं टैक्स कटौती प्रमाण।',
    icon: '🧾',
    generateAlert: (targetPhone) => {
      const profile = getStoredCompanyProfile();
      const companyName = profile.companyName || 'GCAP PRIVATE LIMITED';
      const phone = targetPhone || getAdminWhatsAppAlertNumber();
      const message = `*🏛️ ${companyName} — आधिकारिक भुगतान वाउचर (Withdrawal Voucher)*\n\n` +
        `नमस्ते *AMIT KUMAR*,\n\n` +
        `आपकी निकासी (Withdrawal) का आधिकारिक विवरण निम्नलिखित है:\n\n` +
        `💰 *कुल निकासी (Gross Amount):* ₹25,000.00\n` +
        `📉 *TDS कटौती (5% Govt TDS):* ₹1,250.00\n` +
        `💳 *शुद्ध प्राप्त राशि (Net Paid Amount):* *₹23,750.00*\n` +
        `📊 *वर्तमान स्थिति (Status):* ✅ खाते में भेजा गया (SUCCESS)\n` +
        `🔢 *वाउचर क्रमांक (Voucher No):* VOUCHER-2026-99381\n` +
        `🏦 *भुगतान माध्यम:* HDFC Bank A/C ****8921\n` +
        `📅 *समय:* ${new Date().toLocaleString('hi-IN')}\n\n` +
        `🛡️ *पुष्टि:* राशि आपके बैंक खाते में सुरक्षित क्रेडिट की गई है।\n\n` +
        `शुभकामनाएं,\n*GCAP Payout Department*`;

      return {
        phone,
        message,
        type: 'PAYMENT_VOUCHER',
        title: '[टेस्ट सैंपल] भुगतान वाउचर रसीद',
        recipientName: 'AMIT KUMAR',
        recipientRole: 'INVESTOR',
        amount: 25000,
        referenceId: 'VOUCHER-2026-99381',
        status: 'TEST_SAMPLE',
      };
    },
  },
  {
    id: 'MATURITY_CERTIFICATE',
    nameHi: '4. प्रोजेक्ट समाप्ति एवं 100% मूलधन प्रमाण पत्र',
    nameEn: '4. Project Maturity & 100% Principal Refund Certificate',
    description: 'प्लान चक्र पूरा होने पर 100% मूलधन सुरक्षित वापसी का बधाई पत्र।',
    icon: '👑',
    generateAlert: (targetPhone) => {
      const profile = getStoredCompanyProfile();
      const companyName = profile.companyName || 'GCAP PRIVATE LIMITED';
      const phone = targetPhone || getAdminWhatsAppAlertNumber();
      const message = `*👑 ${companyName} — प्रोजेक्ट समापन एवं 100% मूलधन वापसी प्रमाण पत्र*\n\n` +
        `बधाई हो *AMIT KUMAR*! 🎉\n\n` +
        `आपने अपनी निवेश योजना को शत-प्रतिशत सफलता के साथ पूर्ण कर लिया है:\n\n` +
        `📋 *प्रोजेक्ट का नाम:* GCAP VIP Wealth Builder (30 Days)\n` +
        `💵 *मूलधन निवेश (Principal):* ₹1,00,000.00\n` +
        `📈 *कुल प्राप्त रिटर्न (Total Returns):* ₹1,48,000.00\n` +
        `💎 *100% मूलधन स्थिति:* ✅ 100% सुरक्षित वापस (Refunded to Wallet)\n` +
        `📜 *प्रमाण पत्र आईडी:* GCAP-CERT-994120\n\n` +
        `🏛️ *डिजिटल सील:* CIN: ${profile.cin || 'U66190BR2026OPC088307'}\n\n` +
        `GCAP पर भरोसा करने के लिए बहुत-बहुत धन्यवाद!\n*GCAP Executive Board*`;

      return {
        phone,
        message,
        type: 'MATURITY_CERTIFICATE',
        title: '[टेस्ट सैंपल] प्रोजेक्ट समाप्ति प्रमाण पत्र',
        recipientName: 'AMIT KUMAR',
        recipientRole: 'INVESTOR',
        amount: 100000,
        referenceId: 'GCAP-CERT-994120',
        status: 'TEST_SAMPLE',
      };
    },
  },
  {
    id: 'BROADCAST_NOTICE',
    nameHi: '5. कंपनी आधिकारिक महत्वपूर्ण सूचना (Broadcast)',
    nameEn: '5. Corporate Important Announcement Broadcast',
    description: 'सभी निवेशकों को सामूहिक नोटिस या महत्वपूर्ण घोषणा का मैसेज।',
    icon: '📢',
    generateAlert: (targetPhone) => {
      const profile = getStoredCompanyProfile();
      const companyName = profile.companyName || 'GCAP PRIVATE LIMITED';
      const phone = targetPhone || getAdminWhatsAppAlertNumber();
      const message = `*📢 ${companyName} — आधिकारिक महत्वपूर्ण सूचना*\n\n` +
        `*मासिक निकासी विंडो और नए प्रोजेक्ट्स का शुभारंभ*\n\n` +
        `सभी सम्मानित निवेशकों को सूचित किया जाता है कि मासिक अर्निंग निकासी विंडो 1 से 5 तारीख तक सक्रिय है। साथ ही नए हाई-रिटर्न 6-Hour कम्पाउंडिंग प्रोजेक्ट्स लाइव हो चुके हैं।\n\n` +
        `──────────────────\n` +
        `📞 *हेल्पलाइन:* ${profile.supportPhone || '+91 8503504808'}\n` +
        `🌐 *वेबसाइट पोर्टल:* https://gcap.in`;

      return {
        phone,
        message,
        type: 'BROADCAST_NOTICE',
        title: '[टेस्ट सैंपल] आधिकारिक ब्रॉडकास्ट सूचना',
        recipientName: 'समस्त निवेशक',
        recipientRole: 'INVESTOR',
        status: 'TEST_SAMPLE',
      };
    },
  },
  {
    id: 'ROYALTY_REWARD',
    nameHi: '6. रॉयल्टी व रेफरल इंसेंटिव क्रेडिट अलर्ट',
    nameEn: '6. Royalty & Referral Reward Credit Alert',
    description: 'रॉयल्टी क्लब या रेफरल इंसेंटिव वॉलेट में जुड़ने पर जाने वाला बधाई अलर्ट।',
    icon: '🎁',
    generateAlert: (targetPhone) => {
      const profile = getStoredCompanyProfile();
      const companyName = profile.companyName || 'GCAP PRIVATE LIMITED';
      const phone = targetPhone || getAdminWhatsAppAlertNumber();
      const message = `*🎁 ${companyName} — रॉयल्टी बोनस क्रेडिट अलर्ट*\n\n` +
        `बधाई हो *AMIT KUMAR*! 🌟\n\n` +
        `आपके खाते में रॉयल्टी क्लब रिवॉर्ड सफलतापूर्वक क्रेडिट कर दिया गया है:\n\n` +
        `💎 *रॉयल्टी बोनस राशि:* *₹12,500.00*\n` +
        `📊 *रॉयल्टी स्तर:* लेवल 2 सुपर क्लब\n` +
        `📅 *क्रेडिट तिथि:* ${new Date().toLocaleDateString('hi-IN')}\n\n` +
        `आप इसे 6 से 10 तारीख की रॉयल्टी निकासी विंडो में कभी भी निकाल सकते हैं।\n\n` +
        `धन्यवाद,\n*GCAP Wealth Partner Program*`;

      return {
        phone,
        message,
        type: 'ROYALTY_REWARD',
        title: '[टेस्ट सैंपल] रॉयल्टी बोनस अलर्ट',
        recipientName: 'AMIT KUMAR',
        recipientRole: 'INVESTOR',
        amount: 12500,
        referenceId: 'ROYALTY-2026-992',
        status: 'TEST_SAMPLE',
      };
    },
  },
  {
    id: 'SECURITY_ALERT',
    nameHi: '7. खाता सुरक्षा व लॉगिन अलर्ट (Security Alert)',
    nameEn: '7. Account Security & Login Alert',
    description: 'नए डिवाइस लॉगिन या सुरक्षा सत्यापन हेतु निवेशक को अलर्ट।',
    icon: '🛡️',
    generateAlert: (targetPhone) => {
      const profile = getStoredCompanyProfile();
      const companyName = profile.companyName || 'GCAP PRIVATE LIMITED';
      const phone = targetPhone || getAdminWhatsAppAlertNumber();
      const message = `*🛡️ ${companyName} — खाता सुरक्षा अलर्ट*\n\n` +
        `नमस्ते *AMIT KUMAR*,\n\n` +
        `आपके GCAP खाते में नया सफल लॉगिन दर्ज किया गया है:\n\n` +
        `📱 *डिवाइस:* Android Chrome Mobile\n` +
        `🌐 *आईपी लोकेशन:* India (Secured SSL)\n` +
        `⏰ *समय:* ${new Date().toLocaleString('hi-IN')}\n\n` +
        `यदि यह लॉगिन आपने नहीं किया है, तो कृपया तुरंत एडमिन हेल्पलाइन ${profile.supportPhone || '+91 8503504808'} पर संपर्क करें।\n\n` +
        `*GCAP Security & Compliance Wing*`;

      return {
        phone,
        message,
        type: 'SECURITY_ALERT',
        title: '[टेस्ट सैंपल] खाता सुरक्षा अलर्ट',
        recipientName: 'AMIT KUMAR',
        recipientRole: 'INVESTOR',
        status: 'TEST_SAMPLE',
      };
    },
  },
];
