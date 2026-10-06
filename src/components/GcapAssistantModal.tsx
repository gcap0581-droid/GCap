import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  X,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  RotateCcw,
  MessageSquare,
  HelpCircle,
  TrendingUp,
  Layers,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { Language, UserProfile, AppRules, CompanyProfile } from '../types';
import { getStoredCompanyProfile } from '../utils/companyStorage';
import { getStoredRules } from '../utils/rulesStorage';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface GcapAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  currentUser?: UserProfile | null;
  rules?: AppRules;
  companyProfile?: CompanyProfile;
}

const INITIAL_WELCOME_MESSAGE: ChatMessage = {
  id: 'msg-welcome-0',
  role: 'assistant',
  content:
    '🙏 नमस्ते जी! मैं GCap Capital का आधिकारिक AI सहायक हूँ। GCap परिवार में आपका स्वागत है!\n\nआप मुझसे GCap के बारे में कुछ भी पूछ सकते हैं:\n• GCap सॉफ्टवेयर में काम कैसे करें (Step-by-Step)\n• पैसा जमा (Deposit), GP स्वैप व बैंक निकासी की विधि\n• 641-दिन व 365-दिन निवेश प्लान्स और 6-घंटे का रिटर्न\n• कंपनी की कानूनी जानकारी व कार्यालय विवरण\n\nबताइए, आज मैं आपकी क्या सहायता करूँ?',
  timestamp: Date.now(),
};

const QUICK_SUGGESTIONS = [
  'पैसा जमा (डिपॉजिट) कैसे करें?',
  'GP स्वैप कैसे करें (₹1 = 0.98 GP)?',
  'प्लान में निवेश कैसे करें?',
  'बैंक निकासी (विड्रॉल) कैसे करें?',
  '641-दिन का शॉर्ट टर्म प्लान क्या है?',
  'कंपनी की पूरी जानकारी व CIN',
  'अलविदा / धन्यवाद 🙏',
];

function getLocalAssistantReply(
  query: string, 
  userName: string = 'साथी',
  rules?: AppRules,
  companyProfile?: CompanyProfile
): string {
  const q = (query || '').toLowerCase().trim();

  // Load current bank info dynamically
  const activeProfile = companyProfile || getStoredCompanyProfile();
  const activeRules = rules || (typeof getStoredRules === 'function' ? getStoredRules() : null);

  const companyUpiId = activeProfile?.companyUpiId || activeRules?.companyUpiId || '8603504808@axisbank';
  const companyBankAccountNumber = activeProfile?.bankAccountNumber || activeRules?.companyBankAccountNumber || '924010008662307';
  const companyBankName = activeProfile?.bankName || activeRules?.companyBankName || 'Axis Bank Ltd.';
  const companyBankIfsc = activeProfile?.bankIfsc || activeRules?.companyBankIfsc || 'UTIB0001219';

  // Language detection: if user queries entirely in English
  const isEnglishQuery = /^[a-z0-9\s\?\.,!@#\$%\^&\*\(\)_\+\-\=\[\]\{\};:'"\\\|`~]+$/.test(q) && !q.includes('kaise') && !q.includes('kya') && !q.includes('paisa') && !q.includes('batao') && !q.includes('karo') && !q.includes('mein') && !q.includes('ko');

  if (isEnglishQuery && q.length > 3) {
    if (q.includes('hello') || q.includes('hi')) {
      return `Hello ${userName}! I am the official GCap Capital AI Assistant. How can I assist you with GCap investment plans, deposits, GP swaps, or withdrawals today?`;
    }
    if (q.includes('deposit') || q.includes('recharge')) {
      return `💰 **Step-by-Step Guide to Deposit Funds in GCap:**\n1️⃣ Tap **'Add Money (Deposit)'** in your dashboard.\n2️⃣ Transfer funds to official UPI ID: \`${companyUpiId}\` or \`${companyBankName}\` A/C: \`${companyBankAccountNumber}\` (IFSC: \`${companyBankIfsc}\`).\n3️⃣ Enter the 12-digit UTR/reference number and submit.\n4️⃣ Once verified by admin, cash balance is credited instantly to your wallet.`;
    }
    if (q.includes('swap') || q.includes('gp')) {
      return `🪙 **Step-by-Step Guide to GP Swap:**\n1️⃣ Go to **'GP Swap'** from the menu.\n2️⃣ Enter the cash amount you wish to convert (Exchange rate: ₹1 = 0.98 GP).\n3️⃣ Tap **'Swap Now'** to instantly convert cash to GP points for activating investment plans.`;
    }
    if (q.includes('withdraw')) {
      return `🏦 **Withdrawal Rules & Guide:**\n• Earnings withdrawal: 1st to 5th of every month.\n• Royalty withdrawal: 6th to 10th of every month.\n• Minimum amount: ₹200 (0% fee).\n• Transferred directly to your verified bank or UPI within 24-48 hours.`;
    }
  }

  // 1. Greetings (Namaste / Welcome)
  if (
    q === 'hi' ||
    q === 'hello' ||
    q.includes('namaste') ||
    q.includes('नमस्ते') ||
    q.includes('pranam') ||
    q.includes('प्रणाम') ||
    q.includes('kaise ho') ||
    q.includes('kya hal')
  ) {
    return `🙏 नमस्ते ${userName} जी! मैं GCap Capital का आधिकारिक AI सहायक हूँ।\n\nआप मुझसे GCap सॉफ्टवेयर में काम करने के तरीके (Step-by-Step), निवेश प्लान्स, डिपॉजिट, निकासी या कंपनी की जानकारी पूछ सकते हैं। बताइए, आज मैं आपकी क्या सहायता करूँ?`;
  }

  // 2. Farewell / Bidai Sandesh (Alvida, Bye, Thanks, Fir Milenge)
  if (
    q.includes('alvida') ||
    q.includes('अलविदा') ||
    q.includes('bye') ||
    q.includes('बाय') ||
    q.includes('dhanyawad') ||
    q.includes('धन्यवाद') ||
    q.includes('shukriya') ||
    q.includes('शुक्रिया') ||
    q.includes('thanks') ||
    q.includes('theek hai') ||
    q.includes('ठीक है') ||
    q.includes('chalte') ||
    q.includes('fir milenge') ||
    q.includes('phir milenge') ||
    q.includes('फिर मिलेंगे') ||
    q.includes('ram ram') ||
    q.includes('राम राम') ||
    q.includes('bas itna') ||
    q.includes('बस उतना')
  ) {
    return `🙏 GCap Capital परिवार से जुड़ने के लिए आपका बहुत-बहुत धन्यवाद ${userName} जी! आपका दिन शुभ, मंगलमय और समृद्ध रहे। आपका निवेश निरंतर फलता-फूलता रहे। जब भी आपको किसी सहायता की आवश्यकता हो, मैं हमेशा उपस्थित हूँ। अलविदा और फिर मिलेंगे! ✨`;
  }

  // 3. STEP-BY-STEP: Deposit / Paisa Jama Karne Ka Tarika
  if (
    q.includes('deposit') ||
    q.includes('डिपॉजिट') ||
    q.includes('jama') ||
    q.includes('जमा') ||
    q.includes('paisa dale') ||
    q.includes('recharge') ||
    (q.includes('kaise') && (q.includes('jama') || q.includes('kare')))
  ) {
    return `💰 **GCap सॉफ्टवेयर में पैसा जमा (Deposit) करने की चरण-दर-चरण विधि (Step-by-Step):**\n\n1️⃣ **स्टेप 1**: ऐप के होम पेज पर **'पैसे जोड़ें (Deposit)'** बटन पर क्लिक करें।\n2️⃣ **स्टेप 2**: कंपनी की आधिकारिक **UPI ID**: \`${companyUpiId}\` पर अपने PhonePe, Google Pay या Paytm से राशि ट्रांसफर करें।\n   *(या बैंक ट्रांसफर करें: ${companyBankName}, खाता संख्या: \`${companyBankAccountNumber}\`, IFSC: \`${companyBankIfsc}\`)*\n3️⃣ **स्टेप 3**: भुगतान करने के बाद मिले **12-अंकों का UTR/संदर्भ नंबर** और जमा राशि को ऐप में दिए गए फॉर्म में भरें।\n4️⃣ **स्टेप 4**: **'सबमिट (Submit)'** बटन दबाएं। एडमिन द्वारा सत्यापन होते ही कैश बैलेंस तुरंत आपके वॉलेट में जुड़ जाएगा!\n\nक्या आप GP स्वैप या प्लान खरीदने की विधि जानना चाहते हैं?`;
  }

  // 4. STEP-BY-STEP: GP Swap (Cash to GP)
  if (
    q.includes('gp') ||
    q.includes('swap') ||
    q.includes('स्वैप') ||
    q.includes('point') ||
    (q.includes('kaise') && q.includes('swap'))
  ) {
    return `🪙 **कैश को GP पॉइंट्स में बदलने (GP Swap) की चरण-दर-चरण विधि (Step-by-Step):**\n\n• **विनिमय दर**: ₹1 (1 रुपया) = **0.98 GP पॉइंट**।\n\n1️⃣ **स्टेप 1**: ऐप के मुख्य मेन्यू या वॉलेट से **'जीपी स्वैप (GP Swap)'** विकल्प पर क्लिक करें।\n2️⃣ **स्टेप 2**: अपने कैश वॉलेट से वह राशि दर्ज करें जिसे आप GP में बदलना चाहते हैं।\n3️⃣ **स्टेप 3**: स्क्रीन पर आपको मिलने वाले GP पॉइंट्स दिख जाएंगे (दर: ₹1 = 0.98 GP)।\n4️⃣ **स्टेप 4**: **'स्वैप करें (Swap Now)'** बटन दबाएं। आपके GP पॉइंट्स तुरंत एक्टिवेट हो जाएंगे, जिससे आप निवेश प्लान खरीद सकते हैं!\n\nस्वैप प्रक्रिया 100% निःशुल्क है।`;
  }

  // 5. STEP-BY-STEP: Plan Return, 6-Hour Cycle & Exact Calculations
  if (
    q.includes('6 ghant') ||
    q.includes('6-hour') ||
    q.includes('6 hour') ||
    q.includes('6 घंटे') ||
    q.includes('earning') ||
    q.includes('percent') ||
    q.includes('प्रतिशत') ||
    q.includes('पर्सेंट') ||
    q.includes('calculation') ||
    q.includes('कैलकुलेशन') ||
    q.includes('हिसाब') ||
    q.includes('kitna milega') ||
    q.includes('kitna aayega') ||
    q.includes('kitna return') ||
    q.includes('roi') ||
    q.includes('daily roi')
  ) {
    return `📊 **GCap प्लान्स का 6-घंटे का रिटर्न प्रतिशत एवं सटीक कैलकुलेशन (Exact ROI):**\n\n⚡ **1. शॉर्ट टर्म प्लान (641-Day Short Term Plan):**\n• **न्यूनतम निवेश**: ₹1,00,000 (1 लाख रुपये) से असीमित।\n• **6-घंटे का रिटर्न दर**: **0.040%** (शून्य दशमलव शून्य चार शून्य प्रतिशत प्रति 6 घंटे)।\n• **24-घंटे (दैनिक) रिटर्न**: **0.160%** (दिन भर में 4 चक्र: 4 × 0.040% = 0.160%)।\n• **सटीक कैलकुलेशन (₹1 लाख के निवेश पर):**\n   - हर 6 घंटे में: **₹40** (40 GP)\n   - प्रतिदिन (24 घंटे में): **₹160** (160 GP)\n   - 30 दिन (महीने) में: **₹4,800**\n   - 641 दिनों में कुल मुनाफा: **₹1,02,560**\n   - परिपक्वता पर कुल राशि: **₹2,02,560** (₹1,02,560 मुनाफा + ₹1,00,000 मूलधन सुरक्षित वापसी)!\n\n👑 **2. लॉन्ग टर्म प्लान (365-Day Long Term & Royalty Plan):**\n• **निवेश सीमा**: ₹10,000 से ₹1,00,000 तक।\n• **6-घंटे का रिटर्न दर**: **0.033%** (शून्य दशमलव शून्य तीन तीन प्रतिशत प्रति 6 घंटे)।\n• **24-घंटे (दैनिक) रिटर्न**: **0.132%** (दिन भर में 4 चक्र: 4 × 0.033% = 0.132%)।\n• **सटीक कैलकुलेशन:**\n   - **₹10,000 के निवेश पर:**\n     * हर 6 घंटे में: **₹3.30** (3.30 GP)\n     * प्रतिदिन (24 घंटे में): **₹13.20** (13.20 GP)\n     * 30 दिन (महीने) में: **₹396**\n     * 365 दिनों में कुल मुनाफा: **₹4,818** (+ ₹10,000 मूलधन = कुल ₹14,818)\n   - **₹1,00,000 (1 लाख) के निवेश पर:**\n     * हर 6 घंटे में: **₹33** (33 GP)\n     * प्रतिदिन (24 घंटे में): **₹132** (132 GP)\n     * 30 दिन (महीने) में: **₹3,960**\n     * 365 दिनों में कुल मुनाफा: **₹48,180** (+ मूलधन वापसी + 1461 दिन रॉयल्टी पाथवे)!\n\n🔒 **नोट**: निवेश सक्रिय होते ही पहले 24 घंटे का लॉक रहता है, उसके बाद हर 6 घंटे में अर्निंग स्वतः आपके वॉलेट में GP के रूप में जुड़ती है।`;
  }

  // 6. STEP-BY-STEP: Plan Purchase / Investment Overview
  if (
    q.includes('plan') ||
    q.includes('प्लान') ||
    q.includes('scheme') ||
    q.includes('योजना') ||
    q.includes('641') ||
    q.includes('365') ||
    q.includes('return') ||
    q.includes('रिटर्न') ||
    (q.includes('kaise') && (q.includes('plan') || q.includes('invest')))
  ) {
    return `📦 **GCap में निवेश प्लान खरीदने की चरण-दर-चरण विधि (Step-by-Step):**\n\n1️⃣ **स्टेप 1**: अपने कैश को 'GP Swap' से GP पॉइंट्स में बदल लें (क्योंकि प्लान्स केवल GP से खरीदे जाते हैं)।\n2️⃣ **स्टेप 2**: ऐप के **'उपलब्ध प्लान्स (Plans List)'** टैब पर जाएं।\n3️⃣ **स्टेप 3**: अपनी पसंद का प्लान चुनें:\n   • **641-दिन शॉर्ट टर्म प्लान**: न्यूनतम ₹1,00,000 (1 लाख), 0.040% हर 6 घंटे में (₹160 प्रतिदिन = 0.160%)।\n   • **365-दिन लॉन्ग टर्म प्लान**: ₹10,000 से ₹1,00,000, 0.033% हर 6 घंटे में (₹13.2 प्रति ₹10,000 = 0.132%) + रॉयल्टी।\n4️⃣ **स्टेप 4**: **'निवेश करें (Invest)'** बटन दबाकर GP पॉइंट्स से प्लान को तुरंत सक्रिय (Activate) करें।\n5️⃣ हर 6 घंटे में स्वचालित रिटर्न आपके वॉलेट में क्रेडिट होने लगेगा!`;
  }

  // 6. STEP-BY-STEP: Withdrawal / Nikasi
  if (
    q.includes('nikasi') ||
    q.includes('withdrawal') ||
    q.includes('निकासी') ||
    q.includes('nikal') ||
    q.includes('paisa nikal') ||
    (q.includes('kaise') && (q.includes('nikal') || q.includes('withdrawal')))
  ) {
    return `🏦 **GCap से बैंक निकासी (Withdrawal) के नियम व चरण (Step-by-Step):**\n\n• **अर्निंग निकासी समय**: हर महीने की 1 तारीख से 5 तारीख तक।\n• **रॉयल्टी निकासी समय**: हर महीने की 6 तारीख से 10 तारीख तक।\n• **न्यूनतम निकासी राशि**: मात्र ₹200 (शुल्क: 0%)।\n\n**निकासी करने की विधि:**\n1️⃣ **स्टेप 1**: ऐप में **'निकासी (Withdraw)'** टैब खोलें।\n2️⃣ **स्टेप 2**: अपना बैंक खाता या UPI आईडी चुनें/सत्यापित करें।\n3️⃣ **स्टेप 3**: निकासी राशि दर्ज करें और अपना ट्रांजैक्शन पासवर्ड डालकर अनुरोध सबमिट करें।\n4️⃣ **स्टेप 4**: 24 से 48 घंटों के भीतर राशि सीधे आपके बैंक खाते में भेज दी जाती है।`;
  }

  // 7. STEP-BY-STEP: General Software / How GCap works
  if (
    q.includes('kaise kam') ||
    q.includes('kaise kaam') ||
    q.includes('कैसे काम') ||
    q.includes('kya hai') ||
    q.includes('क्या है') ||
    q.includes('gcap kya hai') ||
    q.includes('shuru') ||
    q.includes('शुरू') ||
    q.includes('process')
  ) {
    return `🌟 **GCap Capital सॉफ्टवेयर में काम करने की पूरी प्रक्रिया (Step-by-Step):**\n\n1️⃣ **खाता बनाएं**: मोबाइल नंबर और पासवर्ड से तुरंत लॉगइन करें।\n2️⃣ **डिपॉजिट करें**: कंपनी के UPI/बैंक में पैसे भेजकर UTR सबमिट करें।\n3️⃣ **GP स्वैप करें**: कैश को GP पॉइंट्स में बदलें (₹1 = 0.98 GP)।\n4️⃣ **प्लान खरीदें**: 641-दिन या 365-दिन का निवेश प्लान GP से एक्टिवेट करें।\n5️⃣ **6-घंटे का रिटर्न लें**: हर 6 घंटे में स्वतः रिटर्न वॉलेट में आएगा।\n6️⃣ **बैंक विथड्रॉल लें**: महीने की 1-5 तारीख को अपनी कमाई बैंक में ट्रांसफर करें।\n\nबताइए, इनमें से किस स्टेप के बारे में आप विस्तार से जानना चाहते हैं?`;
  }

  // 8. Company Profile / Legal / Trust
  if (
    q.includes('company') ||
    q.includes('कंपनी') ||
    q.includes('cin') ||
    q.includes('pan') ||
    q.includes('legal') ||
    q.includes('safe') ||
    q.includes('surakshit') ||
    q.includes('office') ||
    q.includes('address')
  ) {
    const prof = getStoredCompanyProfile();
    return `🏛️ **${prof.companyName} आधिकारिक एवं वैधानिक विवरण:**\n\n• **कंपनी का नाम**: ${prof.companyName}\n• **CIN**: ${prof.cin || 'N/A'}\n• **पैन (PAN)**: ${prof.pan || 'N/A'} | **टैन (TAN)**: ${prof.tan || 'N/A'}\n• **निदेशक / अधिकृत हस्ताक्षरकर्ता**: ${prof.authorizedSignatory || 'Director'}\n• **पंजीकृत कार्यालय**: ${prof.registeredAddress}\n• **हेल्पलाइन ईमेल**: ${prof.supportEmail}\n• **कस्टमर केयर फ़ोन**: ${prof.supportPhone}\n\n${prof.companyName} भारत सरकार के कॉर्पोरेट मामलों के मंत्रालय (MCA) के अधीन पूरी तरह पंजीकृत एवं सुरक्षित परिसंपत्ति प्रबंधन संस्था है।`;
  }

  // 9. Referral & Team Income
  if (
    q.includes('referral') ||
    q.includes('रेफरल') ||
    q.includes('commission') ||
    q.includes('कमीशन') ||
    q.includes('team') ||
    q.includes('टीम')
  ) {
    return `🤝 **GCap रेफरल एवं टीम कमीशन (Step-by-Step):**\n\n1️⃣ ऐप में **'रेफरल (Referral)'** मेनू पर जाएं।\n2️⃣ अपना अनूठा रेफरल लिंक या कोड कॉपी करें।\n3️⃣ अपने दोस्तों या परिजनों के साथ शेयर करें।\n4️⃣ **कमीशन लाभ**: डायरेक्ट मेंबर की कमाई का 1% और टीम मेंबर की कमाई का 0.5% बोनस सीधे आपके वॉलेट में जुड़ता है!`;
  }

  // 10. Strict Redirection for Outside topics
  return `🙏 नमस्ते ${userName} जी! मैं GCap Capital का आधिकारिक AI सहायक हूँ।\n\nमैं GCap सॉफ्टवेयर में काम करने के तरीके (Step-by-Step), निवेश प्लान्स, डिपॉजिट, GP स्वैप (₹1 = 0.98 GP), और बैंक निकासी के बारे में आपकी सहायता कर सकता हूँ।\n\nकृपया GCap से जुड़ा प्रश्न पूछें, मैं विस्तार से मदद करूँगा!`;
}

export const GcapAssistantModal: React.FC<GcapAssistantModalProps> = ({
  isOpen,
  onClose,
  language,
  currentUser,
  rules,
  companyProfile,
}) => {
  const isHi = language === 'hi';
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_WELCOME_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll to bottom on message change
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Speech synthesis
  const speakText = (text: string, msgId: string) => {
    if (!isVoiceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      
      // Preserve all numbers and percentages while stripping markdown and emojis cleanly
      const cleanText = text
        .replace(/[*#`_~•]/g, ' ') // Strip markdown formatting and bullet points
        .replace(/[0-9]️⃣/g, '') // Strip number-box emojis like 1️⃣, 2️⃣ without stripping the actual numbers
        .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '') // Strip unicode emojis
        .replace(/₹\s*([0-9,.]+)/g, '$1 रुपये') // Pronounce ₹ nicely as रुपये
        .replace(/([0-9.]+)\s*%/g, '$1 प्रतिशत') // Pronounce % nicely as प्रतिशत
        .replace(/\b6h\b/gi, '6 घंटे')
        .replace(/\s+/g, ' ')
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'hi-IN';
      utterance.rate = 0.95; // Slightly slower for natural Hindi comprehension
      utterance.pitch = 1.0;

      // Select best Hindi voice if available
      const voices = window.speechSynthesis.getVoices();
      const hiVoice = voices.find(
        (v) =>
          v.lang.toLowerCase().includes('hi') ||
          v.name.toLowerCase().includes('hindi') ||
          v.name.toLowerCase().includes('india')
      );
      if (hiVoice) {
        utterance.voice = hiVoice;
      }

      utterance.onstart = () => setCurrentlySpeakingId(msgId);
      utterance.onend = () => setCurrentlySpeakingId(null);
      utterance.onerror = () => setCurrentlySpeakingId(null);

      window.speechSynthesis.speak(utterance);
    } catch {
      setCurrentlySpeakingId(null);
    }
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setCurrentlySpeakingId(null);
  };

  // Speech recognition (Mic input)
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(isHi ? 'आपके ब्राउज़र में वॉइस स्पीच रिकग्निशन समर्थित नहीं है। कृपया लिखकर पूछें।' : 'Speech recognition not supported in this browser.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'hi-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText(transcript);
          handleSendMessage(transcript);
        }
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);
    stopSpeaking();

    try {
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: historyPayload,
          userName: currentUser?.name || 'साथी',
        }),
      });

      const data = await res.json();
      const reply = data.reply || getLocalAssistantReply(text, currentUser?.name || 'साथी', rules, companyProfile);

      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      if (isVoiceEnabled) {
        speakText(reply, assistantMsg.id);
      }
    } catch (err) {
      console.warn('[Assistant Chat Error]:', err);
      const fallbackReply = getLocalAssistantReply(text, currentUser?.name || 'साथी', rules, companyProfile);
      const fallbackMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: fallbackReply,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      if (isVoiceEnabled) {
        speakText(fallbackMsg.content, fallbackMsg.id);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    stopSpeaking();
    setMessages([
      {
        ...INITIAL_WELCOME_MESSAGE,
        id: `msg-welcome-${Date.now()}`,
        timestamp: Date.now(),
      },
    ]);
  };

  const handleClose = () => {
    stopSpeaking();
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="w-full sm:max-w-md bg-slate-900 border border-emerald-500/30 rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col h-[85vh] sm:h-[620px] overflow-hidden">
        
        {/* Compact & Sleek Header */}
        <div className="p-3 bg-gradient-to-r from-emerald-950 via-slate-900 to-cyan-950 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-black text-white">
                  {isHi ? 'GCap सहायक (24/7)' : 'GCap Assistant'}
                </h3>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <p className="text-[10px] text-slate-400">
                {isHi ? 'शुद्ध हिंदी में स्टेप-बाय-स्टेप गाइड' : 'Step-by-step Hindi guide'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Voice Mute / Unmute Toggle */}
            <button
              onClick={() => {
                if (isVoiceEnabled) {
                  stopSpeaking();
                  setIsVoiceEnabled(false);
                } else {
                  setIsVoiceEnabled(true);
                }
              }}
              className={`p-1.5 rounded-lg border text-xs transition-all cursor-pointer ${
                isVoiceEnabled
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
              title={isVoiceEnabled ? 'Mute Voice' : 'Enable Voice'}
            >
              {isVoiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>

            {/* Clear conversation button */}
            <button
              onClick={handleResetChat}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
              title="Reset Chat"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Close button */}
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-900/50 text-slate-300 hover:text-red-300 border border-slate-700 cursor-pointer transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Suggestion Pills Bar */}
        <div className="px-3 py-2 bg-slate-950/80 border-b border-slate-800/80 overflow-x-auto flex gap-1.5 shrink-0 scrollbar-none">
          {QUICK_SUGGESTIONS.map((sug, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(sug)}
              className="px-3 py-1 rounded-full bg-slate-800/80 hover:bg-emerald-600/30 border border-slate-700 hover:border-emerald-500/50 text-xs text-slate-200 whitespace-nowrap transition-all cursor-pointer shadow-sm active:scale-95"
            >
              {sug}
            </button>
          ))}
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-950 scrollbar-thin scrollbar-thumb-slate-800">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            const isSpeaking = currentlySpeakingId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-md">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-md ${
                    isUser
                      ? 'bg-emerald-600 text-white rounded-br-none'
                      : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-bl-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans">{msg.content}</div>

                  {!isUser && (
                    <div className="mt-2 flex items-center justify-between pt-1.5 border-t border-slate-800/60 text-[11px] text-slate-400">
                      <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <button
                        onClick={() => {
                          if (isSpeaking) {
                            stopSpeaking();
                          } else {
                            speakText(msg.content, msg.id);
                          }
                        }}
                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md transition-colors ${
                          isSpeaking ? 'bg-emerald-500 text-slate-950 font-bold' : 'hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>{isSpeaking ? 'रुकें' : 'सुनें'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-2.5 items-center text-slate-400 text-sm py-1">
              <div className="w-7 h-7 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                <Bot className="w-3.5 h-3.5 animate-bounce" />
              </div>
              <span className="italic">सहायक सोच रहा है...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-2.5 bg-slate-900 border-t border-slate-800 shrink-0 flex items-center gap-2">
          {/* Voice Mic Button */}
          <button
            onClick={toggleListening}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              isListening
                ? 'bg-red-600 border-red-500 text-white animate-pulse shadow-lg shadow-red-600/40'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
            }`}
            title={isListening ? 'सुन रहा है... (सुनना बंद करें)' : 'बोलकर पूछें (Voice Input)'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={isListening ? 'बोलिए, मैं सुन रहा हूँ...' : 'यहाँ GCap के बारे में लिखकर पूछें...'}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading}
            className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold transition-all cursor-pointer shadow-md shadow-emerald-600/30 flex items-center justify-center"
            title="भेजें"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
