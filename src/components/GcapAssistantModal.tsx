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
import { Language, UserProfile } from '../types';

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
}

const INITIAL_WELCOME_MESSAGE: ChatMessage = {
  id: 'msg-welcome-0',
  role: 'assistant',
  content:
    '🙏 नमस्ते जी! मैं GCap Capital का आधिकारिक AI सहायक (GCap Assistant) हूँ। GCap परिवार में आपका हार्दिक स्वागत है! 🌟\n\nयहाँ आप GCap के बारे में सब कुछ विस्तार से जान सकते हैं:\n• GCap क्या है और यहाँ क्या-क्या और कैसे-कैसे काम होता है?\n• 641-दिन व 365-दिन निवेश प्लान्स और 6-घंटे का रिटर्न चक्र\n• पैसे जमा (Recharge/Deposit) और बैंक निकासी के नियम\n• GP पॉइंट्स को 1:1 कैश में स्वैप करने की प्रक्रिया\n\nआप नीचे लिखकर या 🎙️ माइक दबाकर बोलकर मुझसे पूछ सकते हैं। बताइए, आज मैं आपकी क्या सहायता करूँ?',
  timestamp: Date.now(),
};

const QUICK_SUGGESTIONS = [
  'GCap क्या है और कैसे काम करता है?',
  'यहाँ क्या-क्या और कैसे काम होता है?',
  '641-दिन का शॉर्ट टर्म प्लान क्या है?',
  '365-दिन का लॉन्ग टर्म प्लान क्या है?',
  'पैसा जमा (डिपॉजिट) कैसे करें?',
  'निकासी (विड्रॉल) के नियम क्या हैं?',
  'GP पॉइंट्स स्वैप कैसे करें?',
  'अलविदा / धन्यवाद 🙏',
];

function getLocalAssistantReply(query: string, userName: string = 'साथी'): string {
  const q = (query || '').toLowerCase().trim();

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
    return `🙏 नमस्ते ${userName} जी! मैं GCap Capital का आधिकारिक AI सहायक हूँ।\n\nआप मुझसे GCap में निवेश, प्लान्स, रिचार्ज, निकासी, GP पॉइंट्स स्वैप या खाता संचालन के बारे में कुछ भी लिखकर या 🎙️ बोलकर पूछ सकते हैं। बताइए, आज मैं आपकी क्या सहायता करूँ?`;
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
    q.includes('बस इतना')
  ) {
    return `🙏 GCap Capital परिवार से जुड़ने के लिए आपका बहुत-बहुत धन्यवाद ${userName} जी! आपका दिन शुभ, मंगलमय और समृद्ध रहे। आपका निवेश निरंतर फलता-फूलता और लाभकारी रहे। जब भी आपको किसी सहायता की आवश्यकता हो, मैं हमेशा आपकी सेवा में उपस्थित हूँ। अलविदा और फिर मिलेंगे! ✨`;
  }

  // 3. How GCap Works / Kya kya aur kaise kaise kaam hota hai
  if (
    q.includes('kaise kam') ||
    q.includes('kaise kaam') ||
    q.includes('कैसे काम') ||
    q.includes('kya kya') ||
    q.includes('क्या क्या') ||
    q.includes('kaise kaise') ||
    q.includes('कैसे कैसे') ||
    q.includes('kya hai') ||
    q.includes('क्या है') ||
    q.includes('gcap kya hai') ||
    q.includes('shuru') ||
    q.includes('शुरू') ||
    q.includes('process')
  ) {
    return `🌟 **GCap Capital में क्या-क्या और कैसे-कैसे काम होता है:**\n\n**GCap क्या है?**\nGCap Capital भारत की एक पंजीकृत, सुरक्षित डिजिटल एसेट व वेल्थ मैनेजमेंट कंपनी है, जहाँ निवेशक अपने फंड्स पर हर 6 घंटे में स्वचालित और निश्चित रिटर्न कमाते हैं।\n\n**यहाँ काम करने की पूरी प्रक्रिया (Step-by-Step):**\n1️⃣ **खाता बनाएं**: मोबाइल नंबर और पासवर्ड से अपना सुरक्षित खाता बनाएं।\n2️⃣ **पैसा जमा करें (Deposit)**: 'डिपॉजिट' पर जाएँ और कंपनी के आधिकारिक Axis Bank खाते या UPI (8603504808@axisbank) में पैसे ट्रांसफर करके 12-अंकों का UTR नंबर सबमिट करें। एडमिन अप्रूवल के बाद कैश बैलेंस आपके वॉलेट में आ जाएगा।\n3️⃣ **GP पॉइंट्स में बदलें (Swap)**: 'जीपी स्वैप' से कैश को GP पॉइंट्स में बदलें (₹1 = 1 GP)। प्लान्स केवल GP पॉइंट्स से खरीदे जाते हैं।\n4️⃣ **प्लान में निवेश करें**: अपनी पसंद का प्लान चुनें:\n   • **641-दिन शॉर्ट टर्म प्लान**: न्यूनतम ₹1 लाख, 0.040%/6h रिटर्न (₹160 प्रतिदिन)।\n   • **365-दिन लॉन्ग टर्म प्लान**: ₹10,000 से ₹1 लाख, 0.033%/6h रिटर्न + रॉयल्टी।\n5️⃣ **6-घंटे का रिटर्न चक्र**: हर 6 घंटे में स्वचालित रूप से रिटर्न आपके वॉलेट में GP के रूप में क्रेडिट होता रहता है।\n6️⃣ **कैश स्वैप व बैंक निकासी**: रिटर्न में मिले GP को कभी भी 1:1 बिना किसी शुल्क के कैश में बदलें और हर महीने की 1 से 5 तारीख तक सीधे अपने बैंक खाते में निकासी (Withdrawal) लें!\n\nक्या आप किसी विशेष प्लान की जानकारी चाहते हैं?`;
  }

  // 4. Plans (641-Day Short Term & 365-Day Long Term)
  if (
    q.includes('plan') ||
    q.includes('प्लान') ||
    q.includes('scheme') ||
    q.includes('योजना') ||
    q.includes('641') ||
    q.includes('365') ||
    q.includes('return') ||
    q.includes('रिटर्न')
  ) {
    return `📦 **GCap Capital के 2 मुख्य निवेश प्लान्स:**\n\n⚡ **1. शॉर्ट टर्म प्लान (641-Day High Yield Growth Plan):**\n• न्यूनतम निवेश: ₹1,00,000 (1 लाख रुपये) से असीमित।\n• अवधि: 641 दिन (प्रारंभिक 24 घंटे का लॉक)।\n• रिटर्न दर: **0.040% हर 6 घंटे में** (दैनिक 0.160% यानी ₹1 लाख पर ₹160 प्रतिदिन)।\n• 641 दिन पूर्ण होने पर 100% मूलधन वापस या रिन्यूअल विकल्प।\n\n👑 **2. लॉन्ग टर्म प्लान (365-Day Royalty Asset Plan):**\n• निवेश सीमा: ₹10,000 से ₹1,00,000 तक।\n• अवधि: 365 दिन (प्रारंभिक 24 घंटे का लॉक) + 1461-दिन रॉयल्टी पाथवे।\n• रिटर्न दर: **0.033% हर 6 घंटे में** (दैनिक 0.132% यानी ₹10,000 पर ₹13.2 प्रतिदिन)।\n• 365 दिन बाद आजीवन रॉयल्टी का लाभ।\n\nदोनों ही प्लान्स में आपकी पूंजी 100% सुरक्षित और सरकार-सत्यापित है!`;
  }

  // 5. Withdrawal / Nikasi Rules
  if (
    q.includes('nikasi') ||
    q.includes('withdrawal') ||
    q.includes('निकासी') ||
    q.includes('nikal') ||
    q.includes('paisa nikal')
  ) {
    return `🏦 **GCap में पैसा निकालने (Withdrawal) के नियम:**\n\n• **अर्निंग निकासी**: हर महीने की 1 तारीख से 5 तारीख तक।\n• **रॉयल्टी निकासी**: हर महीने की 6 तारीख से 10 तारीख तक।\n• **न्यूनतम निकासी राशि**: मात्र ₹200।\n• **निकासी शुल्क**: 0% (कोई छिपा हुआ चार्ज नहीं)।\n• **ट्रांसफर का समय**: अनुरोध डालने के 24 से 48 घंटे के भीतर सीधे आपके बैंक खाते या UPI में एनईएफटी/आईएमपीएस द्वारा राशि भेज दी जाती है।\n\nविड्रॉल के लिए 'Withdraw' टैब पर जाकर अपना बैंक या UPI चुनें और राशि दर्ज करें।`;
  }

  // 6. Deposit / Paisa Jama Karne Ka Tarika
  if (
    q.includes('deposit') ||
    q.includes('डिपॉजिट') ||
    q.includes('jama') ||
    q.includes('जमा') ||
    q.includes('paisa dale') ||
    q.includes('recharge')
  ) {
    return `💰 **GCap में पैसा जमा (Recharge) करने का तरीका:**\n\n1️⃣ ऐप में **'पैसे जोड़ें (Deposit)'** बटन दबाएं।\n2️⃣ कंपनी की आधिकारिक **UPI ID**: \`8603504808@axisbank\` पर PhonePe, Google Pay, या Paytm से भुगतान करें।\n3️⃣ या बैंक ट्रांसफर करें: **Axis Bank**, खाता संख्या: \`924010002662307\`, IFSC: \`UTIB0001219\`।\n4️⃣ भुगतान के बाद 12-अंकों का **UTR/संदर्भ नंबर** ऐप में डालकर सबमिट करें।\n5️⃣ एडमिन सत्यापन के बाद तुरंत कैश बैलेंस आपके वॉलेट में जुड़ जाएगा। इसके बाद आप GP स्वैप करके कोई भी प्लान एक्टिवेट कर सकते हैं!`;
  }

  // 7. GP Points Swap
  if (
    q.includes('gp') ||
    q.includes('swap') ||
    q.includes('स्वैप') ||
    q.includes('point')
  ) {
    return `🪙 **GP पॉइंट्स और स्वैपिंग की पूरी जानकारी:**\n\n• **मूल्य दर**: 1 रुपया (₹1) = 1 GP पॉइंट।\n• **प्लान खरीदने के लिए**: कैश बैलेंस को 'GP Swap' में जाकर 1:1 बिना किसी शुल्क के GP में बदलें, क्योंकि प्लान्स केवल GP से एक्टिवेट होते हैं।\n• **रिटर्न निकासी के लिए**: हर 6 घंटे में मिला हुआ रिटर्न GP पॉइंट्स में आता है, जिसे आप कभी भी तुरंत कैश में स्वैप करके अपने बैंक में विड्रॉल कर सकते हैं!\n• स्वैप प्रक्रिया तुरंत और 100% मुफ़्त है।`;
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
    return `🏛️ **GCap Capital आधिकारिक एवं वैधानिक विवरण:**\n\n• **कंपनी**: GCap Assets & Wealth Management Private Limited\n• **CIN**: U66190JH2024PTC022718\n• **पैन (PAN)**: ABCPG1234F | **टैन (TAN)**: RCHG12345E\n• **पंजीकृत कार्यालय**: Grand Plaza, 4th Floor, Main Road, Ranchi, Jharkhand - 834001\n• **हेल्पलाइन ईमेल**: support@gcap.in\n• **कस्टमर केयर फ़ोन**: +91 98000 12345\n\nGCap भारत सरकार के कॉर्पोरेट मामलों के मंत्रालय (MCA) के अधीन पूरी तरह पंजीकृत एवं सुरक्षित परिसंपत्ति प्रबंधन संस्था है।`;
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
    return `🤝 **GCap रेफरल एवं टीम कमीशन प्रोग्राम:**\n\n• **लेवल 1 (डायरेक्ट रेफरल)**: आपके द्वारा सीधे जोड़े गए सदस्य की दैनिक कमाई पर 1% बोनस।\n• **लेवल 2 (टीम रेफरल)**: उनके नीचे जुड़े सदस्यों की दैनिक कमाई पर 0.5% बोनस।\n• रेफरल बोनस सीधे आपके वॉलेट में जुड़ता है और तुरंत निकासी योग्य होता है।\n• अपना रेफरल लिंक या कोड शेयर करने के लिए मेन्यू में 'रेफरल' पर जाएं।`;
  }

  // 10. Strict Redirection for Outside topics
  return `क्षमा करें ${userName} जी! मैं केवल GCap Capital प्लेटफॉर्म, इसकी निवेश योजनाओं (641-दिन व 365-दिन), 6-घंटे के रिटर्न, रिचार्ज/डिपॉजिट, और बैंक विथड्रॉल के बारे में ही जानकारी देने के लिए अधिकृत हूँ।\n\nकृपया GCap से संबंधित प्रश्न पूछें (जैसे: "प्लान्स क्या हैं?", "पैसा कैसे जमा करें?", "विड्रॉल के नियम क्या हैं?"), मुझे आपकी सेवा करने में अत्यंत प्रसन्नता होगी! 🙏`;
}

export const GcapAssistantModal: React.FC<GcapAssistantModalProps> = ({
  isOpen,
  onClose,
  language,
  currentUser,
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
  }, [messages, isOpen, isLoading]);

  // Voice speech synthesis helper (speaks in Hindi)
  const speakText = (text: string, msgId?: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      if (!isVoiceEnabled) return;

      const cleanText = text
        .replace(/[#*_`]/g, '')
        .replace(/🙏|⚡|👑|💰|🏦|🪙|🏛️|🤝|🌟|•/g, '')
        .trim();

      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'hi-IN';
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

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

      utterance.onstart = () => {
        if (msgId) setCurrentlySpeakingId(msgId);
      };
      utterance.onend = () => {
        setCurrentlySpeakingId(null);
      };
      utterance.onerror = () => {
        setCurrentlySpeakingId(null);
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('[Assistant Speech Synthesis]:', e);
    }
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setCurrentlySpeakingId(null);
  };

  // Web Speech Recognition (Mic Input)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'hi-IN';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText(transcript);
          // Auto send after speech
          handleSendMessage(transcript);
        }
      };

      recognition.onerror = (err: any) => {
        console.warn('[Speech Recognition Error]:', err);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      stopSpeaking();
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert(isHi ? 'आपके ब्राउज़र में वॉइस इनपुट सपोर्ट उपलब्ध नहीं है।' : 'Voice input not supported in this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      stopSpeaking();
      try {
        recognitionRef.current.start();
      } catch {
        recognitionRef.current.abort();
        setTimeout(() => recognitionRef.current.start(), 150);
      }
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
          userName: currentUser?.name || 'Investor',
        }),
      });

      const data = await res.json();
      const reply = data.reply || (isHi ? 'माफ़ कीजिए, मुझे आपका सवाल समझने में समस्या आई। कृपया पुनः पूछें।' : 'I could not process that request. Please ask again.');

      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Speak reply automatically if voice is enabled
      if (isVoiceEnabled) {
        speakText(reply, assistantMsg.id);
      }
    } catch (err) {
      console.warn('[Assistant Chat Error]:', err);
      const fallbackReply = getLocalAssistantReply(text, currentUser?.name || (isHi ? 'साथी' : 'Investor'));
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="w-full sm:max-w-2xl bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col h-[90vh] sm:h-[82vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-cyan-950/80 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 shrink-0">
              <Bot className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white">
                  {isHi ? 'GCap AI सहायक' : 'GCap AI Assistant'}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>24/7 लाइव</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {isHi ? 'बोलकर या लिखकर GCap के बारे में सब कुछ पूछें' : 'Ask anything about GCap via Voice or Text'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
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
              className={`p-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                isVoiceEnabled
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
              title={isVoiceEnabled ? (isHi ? 'आवाज़ बंद करें (Mute Voice)' : 'Mute Voice') : (isHi ? 'आवाज़ चालू करें (Enable Voice)' : 'Enable Voice')}
            >
              {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Clear conversation button */}
            <button
              onClick={handleResetChat}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold cursor-pointer"
              title={isHi ? 'नई बातचीत शुरू करें' : 'Start Fresh Chat'}
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Close button */}
            <button
              onClick={handleClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Suggestion Chips Banner */}
        <div className="px-3 py-2 bg-slate-950/60 border-b border-slate-800/80 overflow-x-auto no-scrollbar shrink-0 flex items-center gap-1.5">
          <span className="text-[10px] text-slate-500 font-bold shrink-0 flex items-center gap-1 mr-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            {isHi ? 'सुझाव:' : 'Topics:'}
          </span>
          {QUICK_SUGGESTIONS.map((topic, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(topic)}
              className="shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-emerald-500/40 text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              {topic}
            </button>
          ))}
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900">
          {messages.map((m) => {
            const isUser = m.role === 'user';
            const isSpeaking = currentlySpeakingId === m.id;

            return (
              <div
                key={m.id}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center text-white shrink-0 shadow-md">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-3.5 text-xs leading-relaxed space-y-2 shadow-md ${
                    isUser
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-none'
                      : 'bg-slate-850 border border-slate-750 text-slate-200 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-line select-text">{m.content}</p>

                  <div className="flex items-center justify-between gap-3 text-[10px] opacity-75 pt-1 border-t border-white/10">
                    <span>
                      {new Date(m.timestamp).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </span>

                    {!isUser && (
                      <button
                        onClick={() => {
                          if (isSpeaking) {
                            stopSpeaking();
                          } else {
                            speakText(m.content, m.id);
                          }
                        }}
                        className="inline-flex items-center gap-1 font-bold text-emerald-400 hover:text-emerald-300 cursor-pointer"
                      >
                        {isSpeaking ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            <span>{isHi ? 'रोकें' : 'Stop'}</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3" />
                            <span>{isHi ? 'आवाज़ में सुनें' : 'Listen'}</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold shrink-0">
                    {(currentUser?.name || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2.5 text-slate-400 text-xs py-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center text-white shrink-0 animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-slate-850 border border-slate-800">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] text-slate-300 font-medium ml-1">
                  {isHi ? 'GCap सहायक सोच रहा है...' : 'GCap Assistant is thinking...'}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Voice Listening Active Indicator Banner */}
        {isListening && (
          <div className="p-2.5 bg-rose-950/80 border-t border-rose-500/40 flex items-center justify-between text-rose-300 text-xs animate-pulse shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span className="font-bold">
                {isHi ? '🎙️ आपकी आवाज़ सुन रहा हूँ... बोलिए!' : '🎙️ Listening to you... speak now!'}
              </span>
            </div>
            <button
              onClick={toggleListening}
              className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/30 text-rose-200 cursor-pointer"
            >
              {isHi ? 'रद्द करें' : 'Cancel'}
            </button>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            {/* Microphone Button (Bolkar Poochhein) */}
            <button
              type="button"
              onClick={toggleListening}
              className={`p-3 rounded-2xl border transition-all cursor-pointer shrink-0 ${
                isListening
                  ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-600/40 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border-slate-700'
              }`}
              title={isListening ? (isHi ? 'सुनना बंद करें' : 'Stop Listening') : (isHi ? 'बोलकर पूछें (माइक ऑन करें)' : 'Speak via Mic')}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Text Input (Likhkar Poochhein) */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isHi ? 'GCap के बारे में कुछ भी लिखें या माइक से बोलें...' : 'Ask anything about GCap or use mic...'}
              className="flex-1 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all font-medium"
              disabled={isLoading || isListening}
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="p-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-md shadow-emerald-600/20 cursor-pointer transition-all shrink-0"
              title={isHi ? 'भेजें' : 'Send'}
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
