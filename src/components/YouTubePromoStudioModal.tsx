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
  const [studioToast, setStudioToast] = useState<string | null>(null);

  const showNotice = useCallback((msg: string) => {
    setStudioToast(msg);
    setTimeout(() => {
      setStudioToast((curr) => (curr === msg ? null : curr));
    }, 4500);
  }, []);

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
    img.crossOrigin = 'anonymous'; // MUST be before src
    img.src = PRIMARY_COMPANY_LOGO || '/logo.png';
    img.onload = () => {
      logoImageRef.current = img;
    };
    img.onerror = () => {
      console.log("[GCAP-Studio] Logo load failed, using fallback");
    };
  }, []);

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'video' | 'script' | 'guide'>('video');
  const [isTranscoding, setIsTranscoding] = useState<boolean>(false);
  const [lastMasterBlob, setLastMasterBlob] = useState<Blob | null>(null);
  const [isMasterDownloading, setIsMasterDownloading] = useState<boolean>(false);
  const sceneAudiosRef = useRef<(HTMLAudioElement | null)[]>([]);

  // Preload all scene audio with direct pre-rendered high-fidelity WAV assets
  useEffect(() => {
    if (!isOpen) return;
    sceneAudiosRef.current = SCENES.map((scene) => {
      const audio = new Audio();
      audio.crossOrigin = 'anonymous'; // Set before src to guarantee CORS-safe Web Audio
      audio.src = `/assets/audio/scene_${scene.id}.wav`;
      audio.playbackRate = 1.05; // Punchy, professional YouTube promo tempo
      audio.preload = 'auto';

      audio.onerror = () => {
        // Silent fallback - no window error dispatch
      };

      return audio;
    });
    return () => {
      sceneAudiosRef.current.forEach((audio) => {
        if (audio) {
          try {
            audio.pause();
            audio.currentTime = 0;
          } catch (_) {}
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

  const audioSourceNodesRef = useRef<Map<HTMLAudioElement, MediaElementAudioSourceNode>>(new Map());

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

  // Reliable AudioContext & Destination initialization
  const initAudioSystem = useCallback(() => {
    if (typeof window === 'undefined') return null;
    try {
      if (!audioContextRef.current) {
        const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          audioContextRef.current = new AudioCtx();
          audioDestinationRef.current = audioContextRef.current.createMediaStreamDestination();
          
          // Permanent silent oscillator to keep the audio clock running and prevent "empty track" issues
          const osc = audioContextRef.current.createOscillator();
          const gain = audioContextRef.current.createGain();
          gain.gain.value = 0.0001;
          osc.connect(gain);
          gain.connect(audioDestinationRef.current);
          osc.start();
          console.log("[GCAP-Studio] Audio Pipeline Initialized");
        }
      }
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
      return { ctx: audioContextRef.current, dest: audioDestinationRef.current };
    } catch (err) {
      console.log("[GCAP-Studio] Audio Init Error:", err);
      return null;
    }
  }, []);

  // Dual-Engine Hindi Speech Narration: Google Hindi Voice MP3 Stream with SpeechSynthesis Fallback
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

        const updateDuration = () => {
          if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
            actualAudioDurationRef.current = audio.duration;
            console.log(`[GCAP-Studio] Scene ${sceneIdx+1} Audio Duration: ${audio.duration.toFixed(2)}s`);
          }
        };

        if (audio.readyState >= 1) {
          updateDuration();
        } else {
          audio.onloadedmetadata = updateDuration;
        }

        // Proper AudioContext integration for recording
        const audioSys = initAudioSystem();
        if (audioSys && audioSys.ctx && audioSys.dest) {
          const { ctx, dest } = audioSys;
          if (ctx.state === 'suspended') {
            ctx.resume().catch(() => {});
          }
          
          let sourceNode = audioSourceNodesRef.current.get(audio);
          if (!sourceNode) {
            try {
              sourceNode = ctx.createMediaElementSource(audio);
              audioSourceNodesRef.current.set(audio, sourceNode);
              sourceNode.connect(dest);
              sourceNode.connect(ctx.destination);
            } catch (_) {}
          } else {
            try { sourceNode.connect(dest); } catch (_) {}
            try { sourceNode.connect(ctx.destination); } catch (_) {}
          }
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
      } catch (err) {
        console.log(`[GCAP-Studio] speakCurrentSceneVoice Error:`, err);
        playSpeechSynthesisFallback(text);
      }
    },
    [isVoiceMuted, stopVoice, playSpeechSynthesisFallback, initAudioSystem]
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

      // 1. Ultra-Luxury "Shandar" Background
      const bgGrad = ctx.createRadialGradient(W / 2, H / 2, 50, W / 2, H / 2, W * 0.8);
      bgGrad.addColorStop(0, '#0f172a');
      bgGrad.addColorStop(0.5, '#020617');
      bgGrad.addColorStop(1, '#000000');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // Moving High-Tech Light Beams (Josila Energy)
      ctx.globalCompositeOperation = 'screen';
      for (let i = 0; i < 6; i++) {
        const offset = (t * 80 + i * 200) % (W + 400);
        const beamGrad = ctx.createLinearGradient(offset - 200, 0, offset, H);
        beamGrad.addColorStop(0, 'transparent');
        beamGrad.addColorStop(0.5, i % 2 === 0 ? 'rgba(245, 158, 11, 0.08)' : 'rgba(56, 189, 248, 0.08)');
        beamGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = beamGrad;
        ctx.beginPath();
        ctx.moveTo(offset - 300, 0);
        ctx.lineTo(offset, 0);
        ctx.lineTo(offset + 300, H);
        ctx.lineTo(offset, H);
        ctx.closePath();
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';

      // Subtle Golden Particles
      for (let i = 0; i < 25; i++) {
        const px = ((i * 131 + t * 50) % (W + 200)) - 100;
        const py = (i * 79 + Math.cos(t * 0.5 + i) * 100 + 400) % H;
        const radius = (i % 3) + 1;
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.fillStyle = i % 2 === 0 ? 'rgba(251, 191, 36, 0.3)' : 'rgba(255, 255, 255, 0.15)';
        ctx.fill();
      }

      // 2. Premium Top Navigation / Brand Bar
      const headerH = 85;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.fillRect(0, 0, W, headerH);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, headerH);
      ctx.lineTo(W, headerH);
      ctx.stroke();

      // Logo rendering in header
      if (logoImageRef.current) {
        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(245, 158, 11, 0.5)';
        ctx.drawImage(logoImageRef.current, 50, 12, 60, 60);
        ctx.restore();
      }

      // Company Official Title (High Impact)
      ctx.textAlign = 'left';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px system-ui, sans-serif';
      ctx.fillText('GCAP (OPC) PRIVATE LIMITED', 125, 42);

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 16px system-ui, sans-serif';
      ctx.fillText(`CIN: ${prof.cin || 'U66190BR2026OPC088307'} • भारत सरकार द्वारा पंजीकृत`, 125, 68);

      // LIVE News Ticker (Bottom)
      const tickerY = H - 35;
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(0, tickerY - 10, W, 45);
      
      const tickerText = `🚀 ब्रेकिंग न्यूज़: जीकैप भारत का सबसे भरोसेमंद निवेश प्लेटफॉर्म • 0% विथड्रॉल फीस • हर 6 घंटे में पक्का रिटर्न • 100% मूलधन सुरक्षा • सासाराम, बिहार में मुख्य कार्यालय • ज्वाइन करें ${prof.supportPhone || '+91 8603504808'}`;
      const tickerPos = (t * 120) % 2000;
      ctx.textAlign = 'left';
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 20px system-ui, sans-serif';
      ctx.fillText(tickerText, W - tickerPos, tickerY + 18);
      ctx.fillText(tickerText, W - tickerPos + 2000, tickerY + 18);

      // 3. Main Center Stage Content (Based on Scene ID)
      ctx.textAlign = 'center';

      if (scene.id === 1) {
        // Scene 1: MEGA INTRO
        const scale = 1 + Math.sin(t * 2) * 0.05;
        ctx.save();
        ctx.translate(W / 2, 240);
        ctx.scale(scale, scale);
        
        // Gold Halo
        const halo = ctx.createRadialGradient(0, 0, 50, 0, 0, 150);
        halo.addColorStop(0, 'rgba(245, 158, 11, 0.4)');
        halo.addColorStop(1, 'transparent');
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(0, 0, 150, 0, Math.PI * 2);
        ctx.fill();

        if (logoImageRef.current) {
          ctx.drawImage(logoImageRef.current, -80, -80, 160, 160);
        }
        ctx.restore();

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 52px system-ui, sans-serif';
        ctx.fillText('सुनहरा भविष्य, आपका अपना जीकैप!', W / 2, 420);
        
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 24px system-ui, sans-serif';
        ctx.fillText('भरोसेमंद निवेश • सुरक्षित कल • बड़ी कामयाबी', W / 2, 465);
      } else if (scene.id === 2) {
        // Scene 2: 641D Plan
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 22px system-ui, sans-serif';
        ctx.fillText('⚡ धमाकेदार 641-दिन शॉर्ट टर्म प्लान ⚡', W / 2, 170);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 64px system-ui, sans-serif';
        ctx.fillText('0.160% डेली रिटर्न', W / 2, 250);

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 32px system-ui, sans-serif';
        ctx.fillText('₹1 लाख निवेश पर ₹160 प्रतिदिन पक्का!', W / 2, 310);

        // Feature Tags
        const tags = ['100% मूलधन सुरक्षा', '24h लॉक के बाद कभी भी निकासी', 'हर 6 घंटे में कमाई'];
        tags.forEach((tag, idx) => {
          ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 2;
          const tx = W / 2 - 350 + idx * 350;
          const ty = 380;
          ctx.beginPath();
          safeRoundRect(ctx, tx - 160, ty, 320, 50, 25);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 18px system-ui, sans-serif';
          ctx.fillText(tag, tx, ty + 32);
        });
      } else if (scene.id === 3) {
        // Scene 3: Royalty
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 22px system-ui, sans-serif';
        ctx.fillText('👑 शाही रॉयल्टी पाथवे - लाइफटाइम इनकम 👑', W / 2, 170);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 64px system-ui, sans-serif';
        ctx.fillText('365 दिन + 1461 दिन रॉयल्टी', W / 2, 250);

        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 32px system-ui, sans-serif';
        ctx.fillText('₹10,000 से शुरू करें अपनी शाही आमदनी!', W / 2, 310);
      } else if (scene.id === 4) {
        // Scene 4: GP Swap
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 22px system-ui, sans-serif';
        ctx.fillText('🪙 सुपर-फास्ट जीपी स्वैप (Instant) 🪙', W / 2, 170);
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.beginPath();
        safeRoundRect(ctx, W / 2 - 300, 210, 600, 120, 20);
        ctx.fill();
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 72px monospace';
        ctx.fillText('₹1 = 0.98 GP', W / 2, 295);

        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 20px system-ui, sans-serif';
        ctx.fillText('कोई झंझट नहीं, कोई एक्स्ट्रा चार्ज नहीं!', W / 2, 360);
      } else if (scene.id === 5) {
        // Scene 5: 6h Cycles
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 60px system-ui, sans-serif';
        ctx.fillText('हर 6 घंटे में ऑटो-पेआउट!', W / 2, 220);
        
        const slots = ['🌅 06:00 AM', '☀️ 12:00 PM', '🌆 06:00 PM', '🌙 12:00 AM'];
        slots.forEach((s, idx) => {
          const sx = W / 2 - 450 + idx * 300;
          ctx.fillStyle = (Math.floor(t * 2) % 4 === idx) ? '#f59e0b' : '#334155';
          ctx.font = 'bold 32px monospace';
          ctx.fillText(s, sx, 320);
        });
      } else if (scene.id === 6) {
        // Scene 6: Bank
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 22px system-ui, sans-serif';
        ctx.fillText('🏦 बैंक निकासी: सीधी, सुरक्षित और सरल 🏦', W / 2, 170);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 56px system-ui, sans-serif';
        ctx.fillText('1-5 तारीख और 6-10 तारीख', W / 2, 260);

        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 24px system-ui, sans-serif';
        ctx.fillText('न्यूनतम निकासी मात्र ₹200 • सीधे आपके बैंक खाते में', W / 2, 320);
      } else if (scene.id === 7) {
        // Scene 7: CTA
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 24px system-ui, sans-serif';
        ctx.fillText('ज्वाइन जीकैप इंडिया - आपका उज्जवल भविष्य!', W / 2, 170);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 64px system-ui, sans-serif';
        ctx.fillText('अभी रजिस्टर करें!', W / 2, 260);

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 28px monospace';
        ctx.fillText(`संपर्क: ${prof.supportPhone || '+91 8603504808'}`, W / 2, 330);
      }

      // 4. Premium Subtitle Overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(40, H - 160, W - 80, 85);
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
      ctx.lineWidth = 2;
      ctx.strokeRect(40, H - 160, W - 80, 85);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px system-ui, sans-serif';
      ctx.fillText(scene.caption, W / 2, H - 110);

      // Progress Bar with Energy
      const totalScenes = SCENES.length;
      const overallProgress = (sceneIdx + Math.min(t / scene.duration, 1)) / totalScenes;
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fillRect(40, H - 170, W - 80, 6);
      ctx.fillStyle = '#f59e0b';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#f59e0b';
      ctx.fillRect(40, H - 170, (W - 80) * overallProgress, 6);
      ctx.shadowBlur = 0;
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

    // Force unmute if user forgot, to ensure audio is captured in the video
    if (isVoiceMuted) {
      setIsVoiceMuted(false);
    }

    try {
      // 1. Warm up the Audio System (synchronous call inside user gesture handler)
      const audioSys = initAudioSystem();

      // 2. Capture high-quality stream from canvas
      const canvasStream = canvas.captureStream ? canvas.captureStream(30) : (canvas as any).mozCaptureStream?.(30);
      if (!canvasStream) {
        showNotice(isHi ? 'ब्राउज़र में कैनवास रिकॉर्डिंग समर्थित नहीं है।' : 'Canvas recording not supported in this browser.');
        return;
      }

      const combinedStream = new MediaStream();
      canvasStream.getVideoTracks().forEach(track => combinedStream.addTrack(track));

      // 3. Add audio tracks from our destination node if available
      if (audioSys && audioSys.dest) {
        try {
          const audioTracks = audioSys.dest.stream.getAudioTracks();
          if (audioTracks.length > 0) {
            audioTracks.forEach(track => combinedStream.addTrack(track));
            console.log("[GCAP-Studio] Audio tracks attached to combined stream:", audioTracks.length);
          }
        } catch (aErr) {
          console.log("[GCAP-Studio] Audio attach notice:", aErr);
        }
      }

      // 4. Determine preferred MIME type (Priority: MP4)
      const candidateTypes = [
        'video/mp4;codecs=h264,aac',
        'video/mp4;codecs=avc1,mp4a.40.2',
        'video/mp4',
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm;codecs=h264,opus',
        'video/webm',
      ];

      let selectedMime = '';
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported) {
        for (const type of candidateTypes) {
          if (MediaRecorder.isTypeSupported(type)) {
            selectedMime = type;
            break;
          }
        }
      }

      console.log("[GCAP-Studio] Initializing MediaRecorder. Mime:", selectedMime || 'default');

      // 5. Construct recorder with fail-safe fallbacks
      let recorder: MediaRecorder;
      try {
        const recorderOptions: MediaRecorderOptions = {};
        if (selectedMime) {
          recorderOptions.mimeType = selectedMime;
        }
        recorderOptions.videoBitsPerSecond = 3000000; // 3 Mbps safe for all mobile & desktop browsers
        recorderOptions.audioBitsPerSecond = 128000;
        recorder = new MediaRecorder(combinedStream, recorderOptions);
      } catch (optErr) {
        console.log("[GCAP-Studio] Fallback with basic stream without bitrate limits:", optErr);
        try {
          recorder = selectedMime ? new MediaRecorder(combinedStream, { mimeType: selectedMime }) : new MediaRecorder(combinedStream);
        } catch (streamErr) {
          console.log("[GCAP-Studio] Fallback with canvas video stream only:", streamErr);
          recorder = new MediaRecorder(canvasStream);
        }
      }

      recordedChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        console.log("[GCAP-Studio] Recording stopped. Chunks:", recordedChunksRef.current.length);
        if (recordedChunksRef.current.length === 0) {
          showNotice(isHi ? 'रिकॉर्डिंग डेटा उपलब्ध नहीं हो सका।' : 'No recording chunks captured.');
          return;
        }
        
        setIsTranscoding(true);
        showNotice(isHi ? '⚡ व्हाट्सएप व यूट्यूब के लिए HD MP4 (फुल हिंदी आवाज़) तैयार हो रहा है...' : 'Processing WhatsApp & YouTube compatible HD MP4 with full voice...');

        try {
          const actualMime = recorder.mimeType || selectedMime || 'video/webm';
          const rawBlob = new Blob(recordedChunksRef.current, { type: actualMime });

          // Send to server FFmpeg converter to ensure genuine H.264 + AAC audio (stops WhatsApp mute)
          let finalBlob = rawBlob;
          try {
            const convertRes = await fetch('/api/convert-video-for-whatsapp', {
              method: 'POST',
              headers: { 'Content-Type': actualMime },
              body: rawBlob,
            });
            if (convertRes.ok) {
              finalBlob = await convertRes.blob();
              console.log("[GCAP-Studio] Server WhatsApp transcode success. Size:", finalBlob.size);
            }
          } catch (transErr) {
            console.log("[GCAP-Studio] Server transcode fallback to local blob:", transErr);
          }

          setLastMasterBlob(finalBlob);
          const url = URL.createObjectURL(finalBlob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = `GCap_Official_Promo_HD_${Date.now()}.mp4`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          
          showNotice(isHi ? '✅ 100% WhatsApp-कंपैटिबल HD MP4 (फुल आवाज़) डाउनलोड हो गया!' : '✅ 100% WhatsApp compatible HD MP4 downloaded!');
          setTimeout(() => {
            try { URL.revokeObjectURL(url); } catch (_) {}
          }, 15000);
        } catch (downloadErr) {
          console.log("[GCAP-Studio] Download handling notice:", downloadErr);
        } finally {
          setIsTranscoding(false);
        }
      };

      // Reset timeline to beginning
      currentSceneIdxRef.current = 0;
      setCurrentSceneIdx(0);
      sceneElapsedRef.current = 0;
      lastTickTimeRef.current = Date.now();
      isPlayingRef.current = true;
      setIsPlaying(true);

      // Start recording
      setTimeout(() => {
        try {
          recorder.start(1000);
          mediaRecorderRef.current = recorder;
          setIsRecording(true);
          setRecordingProgress(0);
          showNotice(isHi ? '🔴 रिकॉर्डिंग शुरू! 7 सीन पूरे होने पर MP4 डाउनलोड होगा।' : '🔴 Recording started! MP4 will download after 7 scenes.');
          
          // Trigger audio for first scene
          speakCurrentSceneVoice(0);
        } catch (startErr) {
          console.log("[GCAP-Studio] Recorder start notice:", startErr);
          showNotice(isHi ? 'रिकॉर्डिंग शुरू करने में बाधा आई।' : 'Could not start recording.');
        }
      }, 150);

    } catch (err) {
      console.log('[GCAP-Studio] Failed to start recording (Handled):', err);
      showNotice(isHi ? 'रिकॉर्डिंग शुरू नहीं हो सकी। कृपया पुनः प्रयास करें।' : 'Could not start recording. Please try again.');
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

  // 1-Click Instant Download of Pre-Rendered Master Promo MP4 (100% WhatsApp AAC Sound Guaranteed)
  const handleDownloadMasterPromo = async () => {
    try {
      setIsMasterDownloading(true);
      showNotice(isHi ? '⚡ ऑफिशियल प्रोमो वीडियो डाउनलोड हो रहा है...' : '⚡ Downloading official promo video...');
      const response = await fetch('/assets/video/GCap_Official_Promo_HD.mp4');
      if (!response.ok) {
        throw new Error(`Status ${response.status}`);
      }
      const blob = await response.blob();
      setLastMasterBlob(blob);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `GCap_Official_Promo_HD.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => {
        try { URL.revokeObjectURL(url); } catch (_) {}
      }, 15000);
      showNotice(isHi ? '✅ 100% WhatsApp-रेडी HD प्रोमो वीडियो डाउनलोड हो गया!' : '✅ WhatsApp-ready HD Promo Video Downloaded!');
    } catch (err) {
      console.log("[GCap-Studio] Master promo download error:", err);
      // Direct browser fallback
      window.open('/assets/video/GCap_Official_Promo_HD.mp4', '_blank');
    } finally {
      setIsMasterDownloading(false);
    }
  };

  // Direct WhatsApp Share via Web Share API or WhatsApp link
  const handleShareToWhatsApp = async () => {
    try {
      let videoBlob = lastMasterBlob;
      if (!videoBlob) {
        showNotice(isHi ? 'वीडियो लोड हो रहा है, कृपया 1 सेकंड प्रतीक्षा करें...' : 'Loading video for WhatsApp share...');
        try {
          const res = await fetch('/assets/video/GCap_Official_Promo_HD.mp4');
          if (res.ok) {
            videoBlob = await res.blob();
            setLastMasterBlob(videoBlob);
          }
        } catch (_) {}
      }

      const shareText = `🚀 *जीकैप (GCap) ऑफिशियल प्रोमो वीडियो - 2026*\n\n` +
        `• भारत का नंबर 1 ट्रस्टेड डिजिटल एसेट प्लेटफॉर्म\n` +
        `• 0.160% डेली रिटर्न (641D प्लान)\n` +
        `• हर 6 घंटे में ऑटो-पेआउट (24x7)\n` +
        `• 0% विथड्रॉल फीस • 100% मूलधन सुरक्षा\n` +
        `• मुख्य कार्यालय: सासाराम, रोहतास, बिहार\n` +
        `• संपर्क/ज्वाइन करें: ${prof.supportPhone || '+91 8603504808'}\n\n` +
        `👉 ऐप लिंक: ${window.location.origin}`;

      if (videoBlob && typeof navigator !== 'undefined' && 'canShare' in navigator) {
        const file = new File([videoBlob], 'GCap_Official_Promo_HD.mp4', { type: 'video/mp4' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'GCap Official Promo HD',
            text: shareText,
            files: [file],
          });
          showNotice(isHi ? '✅ WhatsApp पर सफलता से शेयर हो गया!' : '✅ Shared to WhatsApp successfully!');
          return;
        }
      }

      // Fallback: If Web Share file API is not supported on desktop / browser
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
      window.open(waUrl, '_blank');
      showNotice(isHi ? '👉 WhatsApp खुल गया! डाउनलोड की गई वीडियो फ़ाइल को अटैच करें।' : 'WhatsApp opened! Attach the downloaded video file.');
    } catch (err) {
      console.log("[GCap-Studio] WhatsApp share notice:", err);
    }
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
            {/* Quick Refresh Button to force reload latest screen assets */}
            <button
              onClick={() => {
                sessionStorage.clear();
                if ('caches' in window) {
                  caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
                }
                window.location.reload();
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 cursor-pointer active:scale-95 flex items-center gap-1 text-xs font-bold"
              title="स्क्रीन ताज़ा करें (रिफ्रेश)"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] hidden sm:inline">{isHi ? 'रिफ्रेश' : 'Refresh'}</span>
            </button>

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
              <div className="absolute top-3 left-4 px-3 py-1 rounded-full bg-red-600/90 text-white text-xs font-black flex items-center gap-2 shadow-lg animate-pulse backdrop-blur-sm z-20">
                <span className="w-2.5 h-2.5 rounded-full bg-white" />
                <span>REC • रिकॉर्ड हो रहा है ({currentSceneIdx + 1}/{SCENES.length})</span>
              </div>
            )}

            {/* In-Studio Toast Notification */}
            {studioToast && (
              <div className="absolute top-3 right-4 px-3.5 py-1.5 rounded-xl bg-slate-900/95 border border-amber-500/60 text-amber-300 text-xs font-bold shadow-2xl backdrop-blur-md animate-fadeIn flex items-center gap-2 z-20">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{studioToast}</span>
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

          {/* Download & Share Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* 1-Click Instant Master Promo Video Download */}
            <button
              onClick={handleDownloadMasterPromo}
              disabled={isMasterDownloading || isTranscoding}
              className={`px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-xl shadow-emerald-950/50 active:scale-95 border border-emerald-400/40 ${
                isMasterDownloading ? 'opacity-70 animate-pulse' : ''
              }`}
              title="1-क्लिक में 7 सीन्स का फुल HD प्रोमो वीडियो हिंदी आवाज़ के साथ डाउनलोड करें (WhatsApp Ready)"
            >
              <Download className="w-4 h-4" />
              <span>
                {isMasterDownloading
                  ? (isHi ? 'डाउनलोड हो रहा है...' : 'Downloading...')
                  : (isHi ? '⚡ HD प्रोमो डाउनलोड (फुल आवाज़)' : '⚡ Download HD Promo')}
              </span>
            </button>

            {/* Direct WhatsApp Share Button */}
            <button
              onClick={handleShareToWhatsApp}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-xl shadow-green-950/40 active:scale-95 border border-green-400/40"
              title="WhatsApp पर सीधे HD वीडियो व कंपनी विवरण शेयर करें"
            >
              <Share2 className="w-4 h-4" />
              <span>{isHi ? '📲 WhatsApp शेयर' : 'WhatsApp Share'}</span>
            </button>

            {/* Live Custom Canvas Record Button */}
            {!isRecording ? (
              <button
                onClick={handleStartRecording}
                disabled={isTranscoding}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer border border-amber-500/40 active:scale-95"
                title="कैनवास पर लाइव 7 सीन रिकॉर्ड करके नया वीडियो बनाएं"
              >
                <Video className="w-4 h-4 text-red-400" />
                <span>{isTranscoding ? (isHi ? 'प्रक्रिया जारी...' : 'Processing...') : (isHi ? '🎥 लाइव रिकॉर्ड' : 'Live Record')}</span>
              </button>
            ) : (
              <button
                onClick={handleStopRecording}
                className="px-4 py-2.5 rounded-xl bg-red-700 hover:bg-red-600 text-white font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-xl animate-pulse"
              >
                <X className="w-4 h-4" />
                <span>{isHi ? '🛑 रिकॉर्डिंग रोकें' : 'Stop Recording'}</span>
              </button>
            )}
          </div>
        </div>

        {/* WhatsApp Audio Fixed Notification Banner */}
        <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-emerald-950/80 border-b border-emerald-500/30 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[11px] border border-emerald-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              {isHi ? 'WhatsApp आवाज़ फ़िक्स' : 'WhatsApp Audio Fixed'}
            </span>
            <span className="text-slate-300 text-[11px] sm:text-xs">
              {isHi
                ? '✅ वीडियो अब अंतरराष्ट्रीय AAC ऑडियो में है — WhatsApp पर शेयर करने पर आवाज़ कभी म्यूट नहीं होगी।'
                : '✅ Encoded in native AAC audio — voice will not be muted when shared on WhatsApp.'}
            </span>
          </div>
          <span className="text-amber-300 font-bold text-[11px] bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
            {isHi ? '💡 WhatsApp टिप: बेहतर क्वालिटी के लिए "Document" के रूप में भेजें' : 'Tip: Send as Document in WhatsApp for 100% original quality'}
          </span>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
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

                  {/* Step 4: WhatsApp Audio Guide */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-green-500/40 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-green-500 text-slate-950 font-black text-xs flex items-center justify-center">
                        4
                      </span>
                      <h5 className="font-bold text-green-400 text-xs uppercase tracking-wider">
                        {isHi ? 'व्हाट्सएप (WhatsApp) पर फुल आवाज़' : 'WhatsApp Full Audio'}
                      </h5>
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      {isHi
                        ? 'व्हाट्सएप का अपना कंप्रेसर होता है जो गैर-मानक वीडियो की आवाज़ काट देता है। हमारा नया वीडियो अंतरराष्ट्रीय मानक AAC ऑडियो में है जिससे आवाज़ नहीं कटती।'
                        : 'WhatsApp compressor strips non-standard audio. Our new video has AAC audio built-in.'}
                    </p>
                    <p className="text-emerald-300 font-bold text-[11px] bg-emerald-950/60 p-2 rounded-lg border border-emerald-500/30">
                      {isHi
                        ? '⭐ प्रो टिप: व्हाट्सएप में हमेशा "+" या पेपरक्लिप दबाकर "Document" (दस्तावेज़) के रूप में भेजें। इससे 100% ओरिजिनल आवाज़ रहती है!'
                        : '⭐ Pro Tip: Send as "Document" in WhatsApp for 100% untouched crystal-clear audio!'}
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
