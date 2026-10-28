import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Download,
  Copy,
  Check,
  Sparkles,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Tv,
  Film,
  Layers,
  ChevronRight,
  Share2,
  ShieldCheck,
  Award,
  Clock,
  Coins,
  TrendingUp,
  Building2,
  Phone,
  Mail,
  Video,
  FileText,
  HelpCircle,
  Headphones,
  FileDown,
} from 'lucide-react';
import { PRIMARY_COMPANY_LOGO } from '../utils/logoAssets';
import { CompanyProfile, AppRules } from '../types';
import { getStoredCompanyProfile } from '../utils/companyStorage';
import { getStoredRules } from '../utils/rulesStorage';

interface YouTubePromoStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: 'hi' | 'en';
  companyProfile?: CompanyProfile;
  rules?: AppRules;
}

interface VideoScene {
  id: number;
  title: string;
  duration: number; // in seconds
  voiceText: string;
  caption: string;
  badge: string;
}

const SCENES: VideoScene[] = [
  {
    id: 1,
    title: 'पावरफुल कॉर्पोरेट विजन',
    duration: 18,
    badge: 'MCA भारत सरकार पंजीकृत',
    voiceText:
      'जी हाँ दोस्तों!!! क्या आप अपनी वित्तीय आजादी की नई और धमाकेदार शुरुआत के लिए तैयार हैं? पेश है जीकैप प्राइवेट लिमिटेड!!! भारत सरकार द्वारा पंजीकृत एक ऐसा पावरफुल प्लेटफार्म, जो सिर्फ निवेश नहीं, बल्कि आपकी सफलता और अटूट भरोसे की नई पहचान है! जीकैप के साथ आज ही जुड़िए और अपने सुनहरे भविष्य को लोहे की तरह मजबूत बनाइये! जोश जगाइये, पैसा कमाइए!',
    caption: '🚀 जीकैप (OPC) प्राइवेट लिमिटेड • भरोसेमंद निवेश, उज्जवल भविष्य • Govt. Registered',
  },
  {
    id: 2,
    title: 'सुपरफास्ट 641-दिन ग्रोथ इंजन',
    duration: 18,
    badge: 'हाई-स्पीड रिटर्न्स',
    voiceText:
      'ध्यान से सुनिए! हमारा सबसे दमदार और सुपरहिट 641-दिन का शॉर्ट टर्म प्लान! यहाँ आपका पैसा सोता नहीं है, बल्कि हर 6 घंटे में बिजली की रफ्तार से बढ़ता है! सिर्फ 1 लाख के निवेश पर पाइये रोजाना 160 रुपये का सीधा और पक्का मुनाफा! वो भी शत-प्रतिशत मूलधन सुरक्षा की फौलादी गारंटी के साथ! ये मौका है अपनी कमाई को रॉकेट की तरह रफ्तार देने का! देरी मत कीजिये!',
    caption: '⚡ 641-Days Plan • 0.040% Return Every 6 Hours • ₹160/Day per Lakh • Guaranteed',
  },
  {
    id: 3,
    title: 'किंग साइज रॉयल्टी पाथवे',
    duration: 18,
    badge: 'लाइफटाइम रॉयल्टी अवसर',
    voiceText:
      'छोटे निवेश से शुरू कीजिये और बनिए बड़ी कामयाबी के किंग! हमारा विशेष 365-दिन का रॉयल्टी प्लान! यहाँ आपको मिलता है नॉन-स्टॉप दैनिक लाभ और 365 दिन बाद पूरा मूलधन वापस! लेकिन असली धमाका तो इसके बाद शुरू होगा—अगले 1461 दिनों तक लगातार रॉयल्टी की शानदार और शाही इनकम! अपनी सीट आज ही बुक करें और रॉयल्टी का आनंद लें!',
    caption: '👑 365-Days Royalty Plan • Start with ₹10K • Lifetime Earning Pathway',
  },
  {
    id: 4,
    title: 'स्मार्ट जीपी स्वैप - इंस्टेंट एक्सेस',
    duration: 16,
    badge: '0% FEES INSTANT SWAP',
    voiceText:
      'जीकैप में निवेश करना अब बच्चों का खेल है, वो भी सुपर-फास्ट! अपने यूपीआई या बैंक से तुरंत फंड जमा करें और हमारे जादुई "जीपी स्वैप" के जरिए मात्र एक रुपया बराबर 0.98 जीपी में बदलें! कोई हिडन चार्ज नहीं, कोई लंबा इंतज़ार नहीं! बस क्लिक करें और अपनी अमीरी का सफर शुरू करें! पूरी पारदर्शिता, पूरा भरोसा!',
    caption: '🪙 Smart GP Swap • ₹1 = 0.98 GP • Instant Activation • Transparent Process',
  },
  {
    id: 5,
    title: 'नॉन-स्टॉप 6-घंटे ऑटो पेआउट',
    duration: 16,
    badge: '24/7 ऑटोमेटेड सिस्टम',
    voiceText:
      'ये है असली डिजिटल पावर! जीकैप का सबसे अद्भुत "6-घंटे का ऑटो-रिटर्न चक्र"! दिन हो या रात, सुबह 6, दोपहर 12, शाम 6 और रात 12 बजे—आपका भारी-भरकम मुनाफा बिना किसी देरी के, अपने अपने आप आपके वॉलेट में आता रहेगा! जब पूरी दुनिया सो रही होगी, तब आपका पैसा आपके लिए काम कर रहा होगा! सोते हुए भी कमाएं, सिर्फ जीकैप के साथ!',
    caption: '⏱️ Automated 6-Hour Cycles • Earn While You Sleep • Direct Wallet Credit',
  },
  {
    id: 6,
    title: 'पावरफुल बैंक विथड्रॉल सिस्टम',
    duration: 17,
    badge: 'जीरो विथड्रॉल फीस',
    voiceText:
      'आपकी गाढ़ी कमाई, सीधे आपके बैंक खाते में! हर महीने की 1 से 5 तारीख अर्निंग के लिए और 6 से 10 तारीख रॉयल्टी के लिए! कोई झंझट नहीं, जीरो एक्स्ट्रा चार्ज—एक-एक पैसा आपका अपना है! न्यूनतम निकासी मात्र 200 रुपये से! पैसा निकालिये और अपनी खुशियों को उड़ान दीजिये! जीकैप मतलब पक्का भरोसा!',
    caption: '🏦 Fast Bank Payouts • 1-5th & 6-10th Monthly • 0% Fees • Safe & Reliable',
  },
  {
    id: 7,
    title: 'सफलता की ओर कदम बढ़ाएं!',
    duration: 17,
    badge: 'ज्वाइन जीकैप इंडिया',
    voiceText:
      'बिहार के सासाराम में हमारा हेड ऑफिस आपकी सेवा में 24 घंटे हाजिर है! अब सोचने में वक्त बर्बाद मत कीजिये, कामयाबी की ट्रेन छूट न जाए! आज ही डिस्क्रिप्शन में दिए लिंक से रजिस्टर करें और जीकैप के इस महान परिवार का हिस्सा बनें! वीडियो को लाइक करें और चैनल को सब्सक्राइब करना न भूलें! जय हिन्द, जय भारत, जय जीकैप!!!',
    caption: '🏛️ H.O. Sasaram, Bihar • Helpline: +91 8603504808 • Join Now!',
  },
];

export const YouTubePromoStudioModal: React.FC<YouTubePromoStudioModalProps> = ({
  isOpen,
  onClose,
  language = 'hi',
  companyProfile,
  rules,
}) => {
  const isHi = language === 'hi';
  const prof = companyProfile || getStoredCompanyProfile();
  const actRules = rules || getStoredRules();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentSceneIdx, setCurrentSceneIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingProgress, setRecordingProgress] = useState<number>(0);
  const [isVoiceMuted, setIsVoiceMuted] = useState<boolean>(false);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // High-precision player timeline refs (prevents desync and frozen states)
  const sceneElapsedRef = useRef<number>(0);
  const lastTickTimeRef = useRef<number>(Date.now());
  const currentSceneIdxRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(false);
  const sceneAudioFinishedRef = useRef<boolean>(true);
  const actualAudioDurationRef = useRef<number>(0);

  useEffect(() => {
    currentSceneIdxRef.current = currentSceneIdx;
  }, [currentSceneIdx]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const logoImageRef = useRef<HTMLImageElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioDestinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Pre-load company logo image for canvas rendering
  useEffect(() => {
    const img = new Image();
    img.src = PRIMARY_COMPANY_LOGO || '/logo.png';
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      logoImageRef.current = img;
    };
  }, []);

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'video' | 'script' | 'guide'>('video');
  const sceneAudiosRef = useRef<(HTMLAudioElement | null)[]>([]);

  // Preload all scene audio
  useEffect(() => {
    if (!isOpen) return;
    sceneAudiosRef.current = SCENES.map((scene) => {
      const timestamp = Date.now();
      const audio = new Audio(`/api/tts?text=${encodeURIComponent(scene.voiceText)}&voice=male_energetic&style=shouting&v=${timestamp}`);
      audio.playbackRate = 1.10; // Optimized for energy and clarity
      audio.crossOrigin = 'anonymous';
      
      audio.onerror = (e) => {
        console.error(`[Audio Preload Error] Scene ${scene.id}:`, e);
      };

      audio.load();
      return audio;
    });
    return () => {
      sceneAudiosRef.current.forEach((audio) => {
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
    };
  }, [isOpen]);

  // Load and cache SpeechSynthesis voices robustly
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const loadVoices = () => {
      try {
        const vList = window.speechSynthesis.getVoices();
        if (vList && vList.length > 0) {
          setVoices(vList);
        }
      } catch (_) {}
    };
    loadVoices();
    setTimeout(loadVoices, 100);
    setTimeout(loadVoices, 500);
    setTimeout(loadVoices, 1500);
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Stop any active audio or speech immediately
  const stopVoice = useCallback(() => {
    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
      } catch (_) {}
      currentAudioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (_) {}
    }
    sceneAudioFinishedRef.current = true;
    setIsSpeaking(false);
  }, []);

  // Reliable Fallback SpeechSynthesis engine (Zero chimes/beeps)
  const playSpeechSynthesisFallback = useCallback(
    (text: string) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        setIsSpeaking(false);
        sceneAudioFinishedRef.current = true;
        return;
      }
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'hi-IN';
        utterance.rate = 0.95;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        const availVoices = voices.length > 0 ? voices : window.speechSynthesis.getVoices();
        const hiVoice = availVoices.find(
          (v) =>
            v.name.toLowerCase().includes('hemant') ||
            v.name.toLowerCase().includes('google hindi') ||
            v.lang.toLowerCase().includes('hi')
        );
        if (hiVoice) {
          utterance.voice = hiVoice;
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
          setIsSpeaking(false);
          sceneAudioFinishedRef.current = true;
        };
        utterance.onerror = () => {
          setIsSpeaking(false);
          sceneAudioFinishedRef.current = true;
        };

        setIsSpeaking(true);
        window.speechSynthesis.speak(utterance);
      } catch (_) {
        setIsSpeaking(false);
        sceneAudioFinishedRef.current = true;
      }
    },
    [voices]
  );

  // Dual-Engine Hindi Speech Narration: Google Hindi Voice MP3 Stream with SpeechSynthesis Fallback (Zero Chimes/Beeps)
  const speakCurrentSceneVoice = useCallback(
    (sceneIdx: number) => {
      if (isVoiceMuted || typeof window === 'undefined') {
        sceneAudioFinishedRef.current = true;
        return;
      }

      const text = SCENES[sceneIdx]?.voiceText;
      if (!text) return;

      stopVoice();
      setIsSpeaking(true);
      sceneAudioFinishedRef.current = false;
      actualAudioDurationRef.current = 0;

      try {
        const audio = sceneAudiosRef.current[sceneIdx];
        if (!audio) {
          playSpeechSynthesisFallback(text);
          return;
        }

        audio.currentTime = 0;
        currentAudioRef.current = audio;

        audio.onloadedmetadata = () => {
          if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
            actualAudioDurationRef.current = audio.duration;
          }
        };

        // Try routing to Web Audio destination node for video recording capture
        try {
          if (!audioContextRef.current) {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioCtx) {
              audioContextRef.current = new AudioCtx();
              audioDestinationRef.current = audioContextRef.current.createMediaStreamDestination();
            }
          }
          if (audioContextRef.current && audioDestinationRef.current) {
            if (audioContextRef.current.state === 'suspended') {
              audioContextRef.current.resume();
            }
            // Disconnect old connections to prevent multiple sources
            // This is a simplification; for production-grade, manage nodes more carefully.
            try {
              const source = audioContextRef.current.createMediaElementSource(audio);
              source.connect(audioDestinationRef.current);
              source.connect(audioContextRef.current.destination);
            } catch (_) {}
          }
        } catch (_) {
          // Cross-origin audio routing fallback
        }

        audio.onended = () => {
          setIsSpeaking(false);
          sceneAudioFinishedRef.current = true;
        };

        audio.onerror = () => {
          playSpeechSynthesisFallback(text);
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            playSpeechSynthesisFallback(text);
          });
        }
      } catch (_) {
        playSpeechSynthesisFallback(text);
      }
    },
    [isVoiceMuted, stopVoice, playSpeechSynthesisFallback]
  );

  // Safe roundRect helper for canvas rendering across all browsers (prevents blank scene issues)
  const safeRoundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(x, y, w, h, r);
    } else {
      ctx.rect(x, y, w, h);
    }
  };



  // Canvas Drawing Engine: Renders 16:9 full HD frame (1280x720) with live motion graphics
  const drawScene = useCallback(
    (ctx: CanvasRenderingContext2D, sceneIdx: number, elapsedSceneTime: number) => {
      const W = 1280;
      const H = 720;
      const scene = SCENES[sceneIdx];
      const t = elapsedSceneTime;

      // 1. Rich Luxury Dark Gradient Background
      const bgGrad = ctx.createLinearGradient(0, 0, W, H);
      bgGrad.addColorStop(0, '#020617');
      bgGrad.addColorStop(0.5, '#051329');
      bgGrad.addColorStop(1, '#020617');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // Subtle Golden Mesh Grid Pattern
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.05)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < W; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y < H; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      // Floating ambient particle light streaks
      for (let i = 0; i < 15; i++) {
        const px = ((i * 97 + t * 40) % (W + 200)) - 100;
        const py = ((i * 61 + Math.sin(t + i) * 60 + 200) % H);
        const radius = (i % 4) + 1.5;
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.fillStyle = i % 2 === 0 ? 'rgba(245, 158, 11, 0.25)' : 'rgba(56, 189, 248, 0.2)';
        ctx.fill();
      }

      // 2. Top Header Brand Bar
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(40, 25, W - 80, 70);
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(40, 25, W - 80, 70);

      // Logo rendering in header
      if (logoImageRef.current) {
        ctx.drawImage(logoImageRef.current, 60, 35, 50, 50);
      } else {
        // Fallback Golden Emblem circle
        ctx.beginPath();
        ctx.arc(85, 60, 22, 0, Math.PI * 2);
        ctx.fillStyle = 'linear-gradient(135deg, #f59e0b, #d97706)';
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('G', 85, 67);
      }

      // Company Official Title
      ctx.textAlign = 'left';
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
      ctx.fillText('जीकैप (OPC) प्राइवेट लिमिटेड', 125, 55);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '13px monospace';
      ctx.fillText(`सीआईएन: ${prof.cin || 'U66190BR2026OPC088307'} • MCA भारत सरकार पंजीकृत`, 125, 76);

      // Scene Badge Top Right
      ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
      ctx.beginPath();
      safeRoundRect(ctx, W - 270, 40, 210, 40, 10);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 13px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`★ ${scene.badge} ★`, W - 165, 65);

      // 3. Main Center Stage Content (Based on Scene ID)
      ctx.textAlign = 'center';

      if (scene.id === 1) {
        // Scene 1: Mega Corporate Seal & Verification
        const pulse = Math.sin(t * 3) * 6;
        ctx.save();
        ctx.translate(W / 2, 230);

        // Glowing outer halo
        ctx.beginPath();
        ctx.arc(0, 0, 85 + pulse, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(245, 158, 11, 0.1)';
        ctx.fill();

        // Golden Badge
        ctx.beginPath();
        ctx.arc(0, 0, 75, 0, Math.PI * 2);
        const emblemGrad = ctx.createLinearGradient(-75, -75, 75, 75);
        emblemGrad.addColorStop(0, '#f59e0b');
        emblemGrad.addColorStop(0.5, '#b45309');
        emblemGrad.addColorStop(1, '#fbbf24');
        ctx.fillStyle = emblemGrad;
        ctx.fill();
        ctx.strokeStyle = '#fef3c7';
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.fillStyle = '#051329';
        ctx.font = '900 68px system-ui, sans-serif';
        ctx.fillText('G', 0, 24);
        ctx.restore();

        // Main Headings
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 42px system-ui, sans-serif';
        ctx.fillText('जीकैप (OPC) प्राइवेट लिमिटेड', W / 2, 380);

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 22px system-ui, sans-serif';
        ctx.fillText('भारत का अग्रणी सुरक्षित एवं उच्च-रिटर्न निवेश प्लेटफॉर्म', W / 2, 420);

        // Official Credential Chips
        const chips = [
          `सीआईएन: ${prof.cin || 'U66190BR2026OPC088307'}`,
          `पैन: ${prof.pan || 'AANCG4365Q'}`,
          'DPIIT मान्यता प्राप्त',
          'एक्सिस बैंक अधिकृत',
        ];
        chips.forEach((chip, idx) => {
          const cx = W / 2 - 360 + idx * 240;
          ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
          ctx.beginPath();
          safeRoundRect(ctx, cx - 100, 460, 200, 38, 8);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#e2e8f0';
          ctx.font = 'bold 13px monospace';
          ctx.fillText(chip, cx, 484);
        });
      } else if (scene.id === 2) {
        // Scene 2: 641-Day Short Term Plan Spotlight
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 20px system-ui, sans-serif';
        ctx.fillText('उच्च-रिटर्न सुरक्षित दैनिक फिक्स्ड निवेश', W / 2, 160);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 48px system-ui, sans-serif';
        ctx.fillText('⚡ 641-दिन शॉर्ट टर्म प्लान', W / 2, 215);

        // Feature Cards Box
        const cardWidth = 320;
        const cardHeight = 220;
        const startX = (W - (cardWidth * 3 + 40)) / 2;

        const cards = [
          {
            label: 'हर 6 घंटे में रिटर्न',
            val: '0.040%',
            sub: 'दिन में 4 बार स्वतः क्रेडिट',
            color: '#10b981',
          },
          {
            label: 'दैनिक रिटर्न (24h)',
            val: '0.160%',
            sub: '₹1 लाख पर ₹160 प्रतिदिन',
            color: '#f59e0b',
          },
          {
            label: 'कुल परिपक्वता (641D)',
            val: '₹2,02,560',
            sub: '₹1,02,560 मुनाफा + 100% मूलधन वापस',
            color: '#38bdf8',
          },
        ];

        cards.forEach((c, i) => {
          const bx = startX + i * (cardWidth + 20);
          const by = 260;

          ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
          ctx.strokeStyle = c.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          safeRoundRect(ctx, bx, by, cardWidth, cardHeight, 16);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#94a3b8';
          ctx.font = 'bold 15px system-ui, sans-serif';
          ctx.fillText(c.label, bx + cardWidth / 2, by + 45);

          ctx.fillStyle = c.color;
          ctx.font = '900 44px monospace';
          ctx.fillText(c.val, bx + cardWidth / 2, by + 115);

          ctx.fillStyle = '#cbd5e1';
          ctx.font = '14px system-ui, sans-serif';
          ctx.fillText(c.sub, bx + cardWidth / 2, by + 165);
        });
      } else if (scene.id === 3) {
        // Scene 3: 365-Day Long Term & Royalty Plan
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 20px system-ui, sans-serif';
        ctx.fillText('दीर्घकालिक सुरक्षित पूंजी निर्माण योजना', W / 2, 160);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 46px system-ui, sans-serif';
        ctx.fillText('👑 365-दिन लॉन्ग टर्म व रॉयल्टी प्लान', W / 2, 215);

        // Comparison cards
        const cardWidth = 480;
        const c1X = W / 2 - cardWidth - 20;
        const c2X = W / 2 + 20;
        const cY = 260;
        const cH = 220;

        // Card 1
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 2;
        ctx.beginPath();
        safeRoundRect(ctx, c1X, cY, cardWidth, cH, 16);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#c084fc';
        ctx.font = 'bold 18px system-ui, sans-serif';
        ctx.fillText('लचीली निवेश सीमा (न्यूनतम से अधिकतम)', c1X + cardWidth / 2, cY + 45);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 36px monospace';
        ctx.fillText('₹10,000 — ₹1,00,000', c1X + cardWidth / 2, cY + 105);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '15px system-ui, sans-serif';
        ctx.fillText('0.033% प्रति 6 घंटे • ₹13.20 दैनिक प्रति ₹10K', c1X + cardWidth / 2, cY + 155);

        // Card 2
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.strokeStyle = '#f59e0b';
        ctx.beginPath();
        safeRoundRect(ctx, c2X, cY, cardWidth, cH, 16);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 18px system-ui, sans-serif';
        ctx.fillText('365-दिन बाद 1461-दिन रॉयल्टी लाभ', c2X + cardWidth / 2, cY + 45);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 36px monospace';
        ctx.fillText('+ 1461 दिन निरंतर रॉयल्टी', c2X + cardWidth / 2, cY + 105);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '15px system-ui, sans-serif';
        ctx.fillText('मूलधन 100% सुरक्षित वापसी + निरंतर मासिक रॉयल्टी', c2X + cardWidth / 2, cY + 155);
      } else if (scene.id === 4) {
        // Scene 4: GP Swap
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 20px system-ui, sans-serif';
        ctx.fillText('शून्य शुल्क त्वरित रूपांतरण विधि', W / 2, 160);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 48px system-ui, sans-serif';
        ctx.fillText('🪙 जीपी स्वैप (GP Points Swap)', W / 2, 215);

        // Big Exchange Rate Banner
        ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.beginPath();
        safeRoundRect(ctx, W / 2 - 380, 265, 760, 110, 20);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 46px monospace';
        ctx.fillText('₹1 (1 रुपया)  =  0.98 GP पॉइंट', W / 2, 335);

        // 3 steps
        const stepTexts = [
          '1. UPI / बैंक से फंड जमा करें',
          '2. कैश को GP में बदलें (₹1 = 0.98 GP)',
          '3. 641D या 365D प्लान तुरंत सक्रिय करें',
        ];
        stepTexts.forEach((st, idx) => {
          const sx = W / 2 - 360 + idx * 360;
          ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
          ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
          ctx.beginPath();
          safeRoundRect(ctx, sx - 160, 410, 320, 70, 12);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#f8fafc';
          ctx.font = 'bold 15px system-ui, sans-serif';
          ctx.fillText(st, sx, 452);
        });
      } else if (scene.id === 5) {
        // Scene 5: 6-Hour Automated Payout Cycles
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 20px system-ui, sans-serif';
        ctx.fillText('24-घंटे स्वतः निश्चित चक्रवृद्धि लाभ', W / 2, 160);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 48px system-ui, sans-serif';
        ctx.fillText('⏱️ स्वचालित 6-घंटे का रिटर्न चक्र', W / 2, 215);

        const slots = [
          { time: '06:00 AM', name: 'सुबह का चक्र', icon: '🌅' },
          { time: '12:00 PM', name: 'दोपहर का चक्र', icon: '☀️' },
          { time: '06:00 PM', name: 'शाम का चक्र', icon: '🌆' },
          { time: '12:00 AM', name: 'मध्यरात्रि चक्र', icon: '🌙' },
        ];

        const slotW = 240;
        const totalW = slots.length * slotW + (slots.length - 1) * 20;
        const sStartX = (W - totalW) / 2;

        slots.forEach((s, idx) => {
          const sx = sStartX + idx * (slotW + 20);
          const sy = 280;

          // Glowing active ring for current animation
          const isActive = (Math.floor(t * 1.5) % 4) === idx;

          ctx.fillStyle = isActive ? 'rgba(245, 158, 11, 0.25)' : 'rgba(15, 23, 42, 0.85)';
          ctx.strokeStyle = isActive ? '#fbbf24' : 'rgba(148, 163, 184, 0.3)';
          ctx.lineWidth = isActive ? 3 : 1.5;
          ctx.beginPath();
          safeRoundRect(ctx, sx, sy, slotW, 180, 16);
          ctx.fill();
          ctx.stroke();

          ctx.font = '36px sans-serif';
          ctx.fillText(s.icon, sx + slotW / 2, sy + 55);

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 24px monospace';
          ctx.fillText(s.time, sx + slotW / 2, sy + 105);

          ctx.fillStyle = isActive ? '#fbbf24' : '#94a3b8';
          ctx.font = 'bold 15px system-ui, sans-serif';
          ctx.fillText(s.name, sx + slotW / 2, sy + 145);
        });
      } else if (scene.id === 6) {
        // Scene 6: Bank Withdrawals
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 20px system-ui, sans-serif';
        ctx.fillText('सीधे बैंक खाते में सुरक्षित एवं त्वरित भुगतान', W / 2, 160);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 48px system-ui, sans-serif';
        ctx.fillText('🏦 पारदर्शी बैंक निकासी नियम', W / 2, 215);

        // 2 big columns
        const colW = 460;
        const colH = 210;

        // Earnings
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        safeRoundRect(ctx, W / 2 - colW - 20, 270, colW, colH, 18);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 20px system-ui, sans-serif';
        ctx.fillText('मुनाफ़ा निकासी (अर्निंग पेआउट)', W / 2 - colW / 2 - 20, 315);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 40px monospace';
        ctx.fillText('1 से 5 तारीख', W / 2 - colW / 2 - 20, 370);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '15px system-ui, sans-serif';
        ctx.fillText('हर महीने सीधे बैंक / UPI में • न्यूनतम मात्र ₹200 (0% शुल्क)', W / 2 - colW / 2 - 20, 425);

        // Royalty
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.strokeStyle = '#38bdf8';
        ctx.beginPath();
        safeRoundRect(ctx, W / 2 + 20, 270, colW, colH, 18);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 20px system-ui, sans-serif';
        ctx.fillText('रॉयल्टी निकासी (रॉयल्टी पेआउट)', W / 2 + colW / 2 + 20, 315);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 40px monospace';
        ctx.fillText('6 से 10 तारीख', W / 2 + colW / 2 + 20, 370);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '15px system-ui, sans-serif';
        ctx.fillText('हर महीने स्वतः रिलीज • 24-48 घंटों में बैंक क्रेडिट', W / 2 + colW / 2 + 20, 425);
      } else if (scene.id === 7) {
        // Scene 7: Registered Address, Helpline & Call to Action
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 20px system-ui, sans-serif';
        ctx.fillText('आज ही अपनी वित्तीय आजादी की शुरुआत करें', W / 2, 160);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 46px system-ui, sans-serif';
        ctx.fillText('आज ही जीकैप परिवार का हिस्सा बनें!', W / 2, 215);

        // Office info banner
        ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        safeRoundRect(ctx, W / 2 - 480, 260, 960, 110, 16);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 16px system-ui, sans-serif';
        ctx.fillText('🏛️ पंजीकृत कॉर्पोरेट कार्यालय (Corporate Office):', W / 2, 295);

        ctx.fillStyle = '#e2e8f0';
        ctx.font = '15px system-ui, sans-serif';
        ctx.fillText(
          'खारी, बभनगांवा, श्री नगर, आर.आर.पी. नर्सिंग स्कूल के पास, सासाराम, रोहतास (बिहार) - 821113',
          W / 2,
          330
        );

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 15px monospace';
        ctx.fillText(`हेल्पलाइन: ${prof.supportPhone || '+91 8603504808'} • ईमेल: ${prof.supportEmail || 'support@gcapopc.com'}`, W / 2, 355);

        // Call to action button banner
        ctx.fillStyle = 'linear-gradient(90deg, #10b981, #059669)';
        ctx.beginPath();
        safeRoundRect(ctx, W / 2 - 280, 395, 560, 65, 32);
        ctx.fillStyle = '#059669';
        ctx.fill();
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 24px system-ui, sans-serif';
        ctx.fillText('🔔 लाइक करें • शेयर करें • सब्सक्राइब करें', W / 2, 437);
      }

      // 4. Bottom Subtitle / Captions Bar
      ctx.fillStyle = 'rgba(2, 6, 23, 0.95)';
      ctx.fillRect(40, H - 120, W - 80, 75);
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(40, H - 120, W - 80, 75);

      // Subtitle text with smooth glowing presentation
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 19px system-ui, -apple-system, sans-serif';
      ctx.fillText(scene.caption, W / 2, H - 75);

      // 5. Scene Progress Indicator Bar (at bottom)
      const totalScenes = SCENES.length;
      const barY = H - 25;
      const barW = W - 80;
      ctx.fillStyle = 'rgba(51, 65, 85, 0.5)';
      ctx.fillRect(40, barY, barW, 6);

      // Overall Progress
      const overallProgress = (sceneIdx + Math.min(t / scene.duration, 1)) / totalScenes;
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(40, barY, barW * overallProgress, 6);
    },
    [prof]
  );

  // Frame-by-frame auto-advancing animation & playback loop
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    lastTickTimeRef.current = Date.now();

    const render = () => {
      const now = Date.now();
      const dt = Math.min((now - lastTickTimeRef.current) / 1000, 0.1);
      lastTickTimeRef.current = now;

      if (isPlayingRef.current) {
        sceneElapsedRef.current += dt;
        const curIdx = currentSceneIdxRef.current;
        const baseDuration = SCENES[curIdx]?.duration || 16;
        const targetDuration = Math.max(baseDuration, (actualAudioDurationRef.current || 0) + 0.3);

        // Auto-advance ONLY when minimum target duration elapsed AND scene audio narration is 100% completed
        if (sceneElapsedRef.current >= targetDuration && (sceneAudioFinishedRef.current || isVoiceMuted)) {
          sceneElapsedRef.current = 0;
          sceneAudioFinishedRef.current = true;
          if (curIdx < SCENES.length - 1) {
            const nextIdx = curIdx + 1;
            currentSceneIdxRef.current = nextIdx;
            setCurrentSceneIdx(nextIdx);
            speakCurrentSceneVoice(nextIdx);
          } else {
            // Entire video (all 7 scenes) completed!
            isPlayingRef.current = false;
            setIsPlaying(false);
            stopVoice();
            if (isRecording) {
              handleStopRecording();
            }
          }
        }
      }

      drawScene(ctx, currentSceneIdxRef.current, sceneElapsedRef.current);
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isOpen, drawScene, isRecording, speakCurrentSceneVoice]);

  // Start Video Recording using native MediaRecorder in .mp4 format
  const handleStartRecording = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      // Ensure audio context is active
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }

      // Capture high-quality 30fps stream from canvas
      const canvasStream = canvas.captureStream(30);

      // Create a combined stream for the recorder
      const combinedStream = new MediaStream();
      
      // Add video tracks
      canvasStream.getVideoTracks().forEach(track => combinedStream.addTrack(track));

      // Combine with high-fidelity audio destination stream
      if (audioDestinationRef.current && audioDestinationRef.current.stream) {
        const audioTracks = audioDestinationRef.current.stream.getAudioTracks();
        audioTracks.forEach((track) => combinedStream.addTrack(track));
      }

      // Strict candidate list for MP4 format across browsers
      const candidateTypes = [
        'video/mp4;codecs=h264,aac',
        'video/mp4;codecs=h264',
        'video/mp4;codecs=avc1',
        'video/mp4',
        'video/webm;codecs=h264', // WebM container with H264 (often playable as MP4)
        'video/webm;codecs=vp9',
        'video/webm',
      ];

      let selectedMime = 'video/mp4';
      if (typeof MediaRecorder !== 'undefined') {
        for (const type of candidateTypes) {
          if (MediaRecorder.isTypeSupported(type)) {
            selectedMime = type;
            break;
          }
        }
      }

      const recorderOptions: MediaRecorderOptions = {
        videoBitsPerSecond: 5000000, // 5 Mbps for superior HD clarity
        audioBitsPerSecond: 128000,   // 128kbps crystal clear audio
      };
      if (selectedMime && typeof MediaRecorder !== 'undefined') {
        recorderOptions.mimeType = selectedMime;
      }

      const recorder = new MediaRecorder(combinedStream, recorderOptions);
      recordedChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        // Create the final video blob
        const blob = new Blob(recordedChunksRef.current, { type: selectedMime || 'video/mp4' });
        const url = URL.createObjectURL(blob);
        
        // Instant direct download as .mp4
        const a = document.createElement('a');
        a.href = url;
        // Always force .mp4 extension for the user
        a.download = `GCap_Official_Promo_${Date.now()}.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        setTimeout(() => URL.revokeObjectURL(url), 2000);
        setIsRecording(false);
        setRecordingProgress(100);
      };

      // Set chunk size to 1000ms for stable recording
      recorder.start(1000); 
      mediaRecorderRef.current = recorder;
      
      setIsRecording(true);
      setRecordingProgress(0);
      
      // Auto-start from beginning when recording starts
      currentSceneIdxRef.current = 0;
      setCurrentSceneIdx(0);
      sceneElapsedRef.current = 0;
      lastTickTimeRef.current = Date.now();
      isPlayingRef.current = true;
      setIsPlaying(true);
      
      // Sync voice start
      speakCurrentSceneVoice(0);
    } catch (err) {
      console.error('Failed to start recording:', err);
      alert(isHi ? 'वीडियो रिकॉर्डिंग शुरू करने में समस्या आई। कृपया पुनः प्रयास करें।' : 'Error starting video recording. Please try again.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    isPlayingRef.current = false;
    setIsPlaying(false);
    stopVoice();
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      isPlayingRef.current = false;
      setIsPlaying(false);
      stopVoice();
    } else {
      isPlayingRef.current = true;
      lastTickTimeRef.current = Date.now();
      setIsPlaying(true);
      // Synchronously trigger voice in user gesture handler for Android Chrome compatibility
      speakCurrentSceneVoice(currentSceneIdxRef.current);
    }
  };

  const handleNextScene = () => {
    if (currentSceneIdx < SCENES.length - 1) {
      const nextIdx = currentSceneIdx + 1;
      currentSceneIdxRef.current = nextIdx;
      setCurrentSceneIdx(nextIdx);
      sceneElapsedRef.current = 0;
      lastTickTimeRef.current = Date.now();
      if (isPlayingRef.current) {
        speakCurrentSceneVoice(nextIdx);
      }
    }
  };

  const handlePrevScene = () => {
    if (currentSceneIdx > 0) {
      const prevIdx = currentSceneIdx - 1;
      currentSceneIdxRef.current = prevIdx;
      setCurrentSceneIdx(prevIdx);
      sceneElapsedRef.current = 0;
      lastTickTimeRef.current = Date.now();
      if (isPlayingRef.current) {
        speakCurrentSceneVoice(prevIdx);
      }
    }
  };

  const handlePlaySceneAudio = (idx: number) => {
    currentSceneIdxRef.current = idx;
    setCurrentSceneIdx(idx);
    sceneElapsedRef.current = 0;
    lastTickTimeRef.current = Date.now();
    isPlayingRef.current = true;
    setIsPlaying(true);
    speakCurrentSceneVoice(idx);
  };

  const handleReset = () => {
    isPlayingRef.current = false;
    setIsPlaying(false);
    stopVoice();
    currentSceneIdxRef.current = 0;
    setCurrentSceneIdx(0);
    sceneElapsedRef.current = 0;
  };

  const handleClose = () => {
    isPlayingRef.current = false;
    setIsPlaying(false);
    stopVoice();
    if (isRecording) {
      handleStopRecording();
    }
    onClose();
  };

  // YouTube Upload Metadata Kit
  const youtubeTitle = `GCAP (OPC) PRIVATE LIMITED | हर 6 घंटे में सुरक्षित दैनिक रिटर्न | Best Investment Plans 2026`;
  const youtubeDescription = `GCAP (OPC) PRIVATE LIMITED - आधिकारिक कॉर्पोरेट पोर्टल
CIN: ${prof.cin || 'U66190BR2026OPC088307'} | PAN: ${prof.pan || 'AANCG4365Q'} | TAN: ${prof.tan || 'PTNG16977C'}
पंजीकृत कार्यालय: ${prof.registeredAddress || 'Khari, Babhangawa, Sasaram, Bihar - 821113'}

🌟 मुख्य बिंदु (Highlights):
⏱️ 0:00 - आधिकारिक कॉर्पोरेट परिचय (Official Intro & CIN)
⏱️ 0:15 - 641-दिन शॉर्ट टर्म प्लान (0.040% प्रति 6 घंटे / ₹160 प्रतिदिन प्रति लाख)
⏱️ 0:35 - 365-दिन लॉन्ग टर्म व रॉयल्टी प्लान (0.033% प्रति 6 घंटे)
⏱️ 0:55 - जीपी स्वैप (GP Swap) विधि (₹1 = 0.98 GP)
⏱️ 1:15 - स्वचालित 6-घंटे चक्र (दिन में 4 बार रिटर्न)
⏱️ 1:35 - पारदर्शी बैंक निकासी नियम (1-5 तारीख अर्निंग, 6-10 तारीख रॉयल्टी)
⏱️ 1:55 - पंजीकृत कार्यालय, हेल्पलाइन व कॉल टू एक्शन

📞 हेल्पलाइन सपोर्ट: ${prof.supportPhone || '+91 8603504808'} | ${prof.supportEmail || 'support@gcapopc.com'}
🌐 आधिकारिक वेबसाइट: https://ais-pre-uh2lixxuk2xqat24sbmmqm-80829483615.asia-east1.run.app

#GCap #GCapOPCPrivateLimited #DailyReturn #InvestmentPlan #FixedGrowth #BiharBusiness #MakeInIndia`;

  const youtubeTags = `GCAP, GCap OPC Private Limited, GCap Capital, Daily ROI, 6 Hour Cycle, Fixed Return India, Short Term Investment, Royalty Plan, GP Swap, Sasaram Bihar, Best Investment 2026`;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleDownloadScriptText = () => {
    let content = `=======================================================\n`;
    content += `GCAP (OPC) PRIVATE LIMITED - आधिकारिक यूट्यूब प्रोमो वीडियो व ऑडियो स्क्रिप्ट\n`;
    content += `CIN: ${prof.cin || 'U66190BR2026OPC088307'} | पंजीकृत: सासाराम, बिहार\n`;
    content += `वेबसाइट: https://ais-pre-uh2lixxuk2xqat24sbmmqm-80829483615.asia-east1.run.app\n`;
    content += `=======================================================\n\n`;
    SCENES.forEach((sc, idx) => {
      content += `[सीन ${idx + 1}] ${sc.title} (${sc.duration} सेकंड)\n`;
      content += `स्क्रीन कैप्शन: ${sc.caption}\n`;
      content += `हिंदी वॉयसओवर (Audio Narration):\n"${sc.voiceText}"\n\n`;
    });
    content += `\n=======================================================\n`;
    content += `यूट्यूब वीडियो विवरण (YouTube Description with Timestamps):\n`;
    content += `=======================================================\n`;
    content += `${youtubeDescription}\n\n`;
    content += `यूट्यूब टैग्स:\n${youtubeTags}\n`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GCap_Official_Video_Hindi_Script_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fadeIn overflow-y-auto">
      <div className="w-full max-w-5xl bg-slate-900 border border-amber-500/40 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[96vh]">
        
        {/* Header Bar */}
        <div className="p-3 sm:p-4 bg-gradient-to-r from-amber-950/80 via-slate-900 to-emerald-950/80 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/30 shrink-0">
              <Film className="w-5 h-5 text-amber-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white">
                  {isHi ? 'GCap यूट्यूब प्रोमो व वीडियो स्टूडियो (1080p HD)' : 'GCap YouTube Promo & Video Studio'}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-red-600 text-[10px] font-black text-white tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  YOUTUBE READY
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isHi
                  ? 'कंपनी के 7 मुख्य बिंदुओं पर स्वचालित वीडियो व हिंदी वॉइस'
                  : 'Automated animated explainer video with synchronized Hindi voiceover'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsVoiceMuted(!isVoiceMuted)}
              className={`p-2 rounded-xl border text-xs transition-all cursor-pointer ${
                !isVoiceMuted
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
              title={isVoiceMuted ? 'Unmute Hindi Voiceover' : 'Mute Hindi Voiceover'}
            >
              {!isVoiceMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={handleClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-red-900/60 text-slate-300 hover:text-red-300 border border-slate-700 cursor-pointer transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video Canvas Container (16:9 Aspect Ratio) */}
        <div className="relative bg-black w-full overflow-hidden flex items-center justify-center shrink-0 border-b border-slate-800">
          <div className="w-full max-w-4xl aspect-video relative flex items-center justify-center">
            <canvas
              ref={canvasRef}
              width={1280}
              height={720}
              className="w-full h-full object-contain block shadow-2xl"
            />

            {/* Overlaid Recording Indicator */}
            {isRecording && (
              <div className="absolute top-3 left-4 px-3 py-1 rounded-full bg-red-600/90 text-white text-xs font-black flex items-center gap-2 shadow-lg animate-pulse backdrop-blur-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-white" />
                <span>REC • रिकॉर्ड हो रहा है ({currentSceneIdx + 1}/{SCENES.length})</span>
              </div>
            )}

            {/* Overlaid Voice Speaking Indicator */}
            {isSpeaking && (
              <div className="absolute bottom-3 right-4 px-3 py-1 rounded-full bg-emerald-600/90 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg animate-pulse backdrop-blur-sm">
                <Volume2 className="w-3.5 h-3.5" />
                <span>हिंदी आवाज़ चालू है...</span>
              </div>
            )}
          </div>
        </div>

        {/* Playback Controls & Action Buttons */}
        <div className="p-3 sm:p-4 bg-slate-950 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            {/* Previous Scene Button */}
            <button
              onClick={handlePrevScene}
              disabled={currentSceneIdx === 0}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 border border-slate-700 cursor-pointer active:scale-95 transition-all"
              title={isHi ? 'पिछला सीन देखें' : 'Previous Scene'}
            >
              <SkipBack className="w-4 h-4" />
            </button>

            {/* Play / Pause Video */}
            <button
              onClick={handleTogglePlay}
              className={`px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95 ${
                isPlaying
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30'
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              <span>{isPlaying ? (isHi ? '⏸️ वीडियो रोकें' : 'Pause') : (isHi ? '▶️ पूरा वीडियो चलाएं (1-7)' : 'Play Full Video')}</span>
            </button>

            {/* Next Scene Button */}
            <button
              onClick={handleNextScene}
              disabled={currentSceneIdx === SCENES.length - 1}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 border border-slate-700 cursor-pointer active:scale-95 transition-all"
              title={isHi ? 'अगला सीन देखें' : 'Next Scene'}
            >
              <SkipForward className="w-4 h-4" />
            </button>

            {/* Current Scene Badge */}
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-[11px] sm:text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
              <span>सीन {currentSceneIdx + 1} / {SCENES.length}</span>
            </div>

            {/* Direct Hindi Voice Button */}
            <button
              onClick={() => {
                if (isSpeaking) {
                  stopVoice();
                } else {
                  handlePlaySceneAudio(currentSceneIdx);
                }
              }}
              className={`px-3.5 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-md active:scale-95 border ${
                isSpeaking
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border-slate-700'
              }`}
              title="वर्तमान सीन की हिंदी आवाज़ सुनें"
            >
              <Volume2 className="w-4 h-4" />
              <span>{isSpeaking ? (isHi ? '🔊 आवाज़ रोकें' : 'Stop Audio') : (isHi ? '🔊 हिंदी आवाज़ सुनें' : 'Listen Hindi')}</span>
            </button>

            {/* Restart */}
            <button
              onClick={handleReset}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer active:scale-95"
              title="रीस्टार्ट (शुरू से चलाएं)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Direct Download / Record Video Button */}
          <div className="flex items-center gap-2">
            {!isRecording ? (
              <button
                onClick={handleStartRecording}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-xl shadow-red-900/40 active:scale-95 border border-red-400/40"
              >
                <Download className="w-4 h-4" />
                <span>{isHi ? '🎥 वीडियो रिकॉर्ड व डाउनलोड करें (.mp4 / HD)' : 'Record & Download Video (.mp4)'}</span>
              </button>
            ) : (
              <button
                onClick={handleStopRecording}
                className="px-5 py-2.5 rounded-xl bg-red-700 hover:bg-red-600 text-white font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-xl animate-pulse"
              >
                <X className="w-4 h-4" />
                <span>{isHi ? '🛑 रिकॉर्डिंग रोकें और सेव करें' : 'Stop & Save Video'}</span>
              </button>
            )}
          </div>
        </div>

        {/* 3 Secondary Navigation Tabs */}
        <div className="bg-slate-900/95 border-b border-slate-800 px-3 py-2 flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('video')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
              activeTab === 'video'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{isHi ? '📋 यूट्यूब अपलोड किट' : 'YouTube Upload Kit'}</span>
          </button>

          <button
            onClick={() => setActiveTab('script')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
              activeTab === 'script'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800'
            }`}
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>{isHi ? '🎙️ 7 सीन्स की हिंदी आवाज़ व स्क्रिप्ट' : '7 Scenes Audio & Script'}</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
              activeTab === 'guide'
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
            <span>{isHi ? '💡 कैसे सुनें व डाउनलोड करें? (गाइड)' : 'How to Listen & Download'}</span>
          </button>
        </div>

        {/* Scene Selector Pills */}
        <div className="p-2.5 bg-slate-900/80 border-b border-slate-800/80 overflow-x-auto flex gap-2 shrink-0 scrollbar-none">
          {SCENES.map((sc, idx) => (
            <button
              key={sc.id}
              onClick={() => handlePlaySceneAudio(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 border ${
                currentSceneIdx === idx
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                  : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-slate-700 flex items-center justify-center text-[10px] text-white">
                {idx + 1}
              </span>
              <span>{sc.title}</span>
            </button>
          ))}
        </div>

        {/* Dynamic Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950">
          
          {/* TAB 1: YOUTUBE UPLOAD KIT */}
          {activeTab === 'video' && (
            <div className="space-y-4 animate-in fade-in-50 duration-150">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Share2 className="w-4 h-4" />
                  {isHi ? 'यूट्यूब अपलोड किट (Title, Description व Tags)' : 'YouTube Upload Kit'}
                </h4>
                <span className="text-[11px] text-slate-400">
                  {isHi ? 'यूट्यूब पर अपलोड करते समय 1-क्लिक में कॉपी करें' : 'One-click copy for YouTube upload'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* Title Card */}
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-300">📌 यूट्यूब वीडियो टाइटल (Title):</span>
                    <button
                      onClick={() => copyToClipboard(youtubeTitle, 'title')}
                      className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer border border-slate-700 active:scale-95"
                    >
                      {copiedType === 'title' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedType === 'title' ? 'कॉपी हो गया' : 'टाइटल कॉपी करें'}</span>
                    </button>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-lg text-slate-200 font-mono text-[11px] border border-slate-800 select-all">
                    {youtubeTitle}
                  </div>
                </div>

                {/* Tags Card */}
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-300">🏷️ यूट्यूब टैग्स (Tags):</span>
                    <button
                      onClick={() => copyToClipboard(youtubeTags, 'tags')}
                      className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer border border-slate-700 active:scale-95"
                    >
                      {copiedType === 'tags' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedType === 'tags' ? 'कॉपी हो गया' : 'टैग्स कॉपी करें'}</span>
                    </button>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-lg text-slate-400 font-mono text-[11px] border border-slate-800 select-all truncate">
                    {youtubeTags}
                  </div>
                </div>
              </div>

              {/* Description Card */}
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300">📝 पूरा यूट्यूब वीडियो विवरण (Description with CIN & Timestamps):</span>
                  <button
                    onClick={() => copyToClipboard(youtubeDescription, 'desc')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-emerald-600/30 active:scale-95"
                  >
                    {copiedType === 'desc' ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedType === 'desc' ? 'डिस्क्रिप्शन कॉपी हो गया!' : 'पूरा विवरण कॉपी करें'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 rounded-lg text-slate-300 font-mono text-[11px] border border-slate-800 whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto select-all">
                  {youtubeDescription}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 2: SCENE BY SCENE AUDIO & SCRIPT */}
          {activeTab === 'script' && (
            <div className="space-y-4 animate-in fade-in-50 duration-150">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-3 rounded-2xl border border-slate-800">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                    <Headphones className="w-4 h-4 text-emerald-400" />
                    <span>{isHi ? 'सभी 7 सीन्स की हिंदी आवाज़ व स्क्रिप्ट' : 'All 7 Scenes Hindi Voice & Script'}</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {isHi ? 'प्रत्येक सीन के "🔊 आवाज़ सुनें" बटन पर क्लिक करके उस सीन को हिंदी में सुनें' : 'Click "Listen Voice" on any scene to hear the narration in Hindi.'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Direct Download Action */}
                  <button
                    onClick={handleStartRecording}
                    disabled={isRecording}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-all ${
                      isRecording
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500/40'
                    }`}
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>{isHi ? '🎥 वीडियो डाउनलोड' : 'Download Video'}</span>
                  </button>

                  <button
                    onClick={handleDownloadScriptText}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>{isHi ? '📥 स्क्रिप्ट (.txt)' : 'Download Script'}</span>
                  </button>
                  <button
                    onClick={() => {
                      const allText = SCENES.map((s, i) => `[सीन ${i+1}: ${s.title}]\n"${s.voiceText}"`).join('\n\n');
                      copyToClipboard(allText, 'allScript');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                  >
                    {copiedType === 'allScript' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedType === 'allScript' ? 'कॉपी हो गया' : 'पूरी स्क्रिप्ट कॉपी करें'}</span>
                  </button>
                </div>
              </div>

              {/* List of 7 Scenes with Individual Listen Buttons */}
              <div className="space-y-3">
                {SCENES.map((sc, idx) => {
                  const isCurrent = currentSceneIdx === idx;
                  return (
                    <div
                      key={sc.id}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isCurrent
                          ? 'bg-amber-950/30 border-amber-500/60 shadow-lg shadow-amber-950/50'
                          : 'bg-slate-900 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-amber-400">
                            {sc.id}
                          </span>
                          <h5 className="font-bold text-xs sm:text-sm text-white">{sc.title}</h5>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                            ⏱️ {sc.duration} सेकंड
                          </span>
                        </div>

                        {/* Individual Audio Listen Button */}
                        <button
                          onClick={() => handlePlaySceneAudio(idx)}
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-950/40 active:scale-95"
                        >
                          <Volume2 className="w-3.5 h-3.5 fill-white" />
                          <span>{isHi ? '🔊 इस सीन की आवाज़ सुनें' : 'Play Voice'}</span>
                        </button>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                        <span className="text-amber-400 font-bold mr-1">हिंदी वॉयसओवर:</span>
                        "{sc.voiceText}"
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: STEP-BY-STEP GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-4 animate-in fade-in-50 duration-150 text-xs sm:text-sm">
              <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4 sm:p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    💡
                  </span>
                  <div>
                    <h4 className="font-extrabold text-white text-sm sm:text-base">
                      {isHi ? 'सरल गाइड: हिंदी में कैसे सुनें और वीडियो कैसे डाउनलोड करें?' : 'Quick Guide: How to Listen & Download'}
                    </h4>
                    <p className="text-slate-400 text-xs">
                      {isHi ? 'केवल 3 आसान चरणों में वीडियो बनाएं और अपने यूट्यूब चैनल पर डालें' : 'Follow these 3 simple steps'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                  {/* Step 1: Listen in Hindi */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">
                        1
                      </span>
                      <h5 className="font-bold text-emerald-400 text-xs uppercase tracking-wider">
                        {isHi ? 'हिंदी में कैसे सुनें?' : 'How to Listen in Hindi'}
                      </h5>
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      {isHi
                        ? 'ऊपर दिए गए हरे बटन "▶️ वीडियो चलाएं" पर क्लिक करें। आपका फोन या लैपटॉप सभी 7 सीन्स को स्पष्ट हिंदी आवाज़ (Voiceover) में बोलकर सुनाएगा।'
                        : 'Click "Play Preview" or "Listen Hindi" to hear the full narration through your speakers.'}
                    </p>
                    <p className="text-slate-400 text-[11px]">
                      {isHi ? '👉 आप "7 सीन्स की हिंदी आवाज़" टैब से किसी भी सीन को अलग से भी सुन सकते हैं।' : ''}
                    </p>
                  </div>

                  {/* Step 2: Download Video */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-red-500/30 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-red-600 text-white font-black text-xs flex items-center justify-center">
                        2
                      </span>
                      <h5 className="font-bold text-red-400 text-xs uppercase tracking-wider">
                        {isHi ? 'वीडियो कैसे डाउनलोड करें?' : 'How to Download Video'}
                      </h5>
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      {isHi
                        ? 'ऊपर लाल बटन "🎥 वीडियो रिकॉर्ड व डाउनलोड करें (.mp4 / HD)" पर क्लिक करें। 1080p एचडी .mp4 वीडियो आपके फोन में अपने आप डाउनलोड होकर सेव हो जाएगी।'
                        : 'Click "Record & Download Video (.mp4)". The crystal clear 1080p MP4 video file will be saved to your Downloads.'}
                    </p>
                    <p className="text-slate-400 text-[11px]">
                      {isHi ? '👉 आप कभी भी "🛑 रोकें और सेव करें" दबाकर तुरंत वीडियो डाउनलोड कर सकते हैं।' : ''}
                    </p>
                  </div>

                  {/* Step 3: Upload to YouTube */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-sky-500/30 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-sky-500 text-slate-950 font-black text-xs flex items-center justify-center">
                        3
                      </span>
                      <h5 className="font-bold text-sky-400 text-xs uppercase tracking-wider">
                        {isHi ? 'यूट्यूब पर कैसे अपलोड करें?' : 'Upload to YouTube'}
                      </h5>
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      {isHi
                        ? 'अपने मोबाइल में YouTube ऐप खोलें और नीचे दिए गए "+" बटन पर क्लिक करके "Upload a video" चुनें। फिर डाउनलोड की गई वीडियो फ़ाइल को सेलेक्ट करें।'
                        : 'Open YouTube App, tap "+" -> "Upload a video", and select the downloaded file.'}
                    </p>
                    <p className="text-slate-400 text-[11px]">
                      {isHi ? '👉 यहाँ से 1-क्लिक में "टाइटल", "डिस्क्रिप्शन" और "टैग्स" कॉपी करके यूट्यूब में चिपका दें।' : ''}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
