import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, TrendingUp, Lock, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { Language, UserProfile } from '../types';

interface GcapSplashIntroProps {
  user: UserProfile;
  language: Language;
  onComplete: () => void;
}

export const GcapSplashIntro: React.FC<GcapSplashIntroProps> = ({ user, language, onComplete }) => {
  const isHi = language === 'hi';
  const [progress, setProgress] = useState(0);
  const [stageText, setStageText] = useState(isHi ? 'सुरक्षित सत्र आरंभ हो रहा है...' : 'Initializing 256-Bit Encrypted Session...');
  const [isDone, setIsDone] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const onCompleteRef = useRef(onComplete);
  const isHiRef = useRef(isHi);
  const completedRef = useRef(false);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    isHiRef.current = isHi;
  }, [isHi]);

  const handleFinish = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    setIsDone(true);
    if (onCompleteRef.current) {
      onCompleteRef.current();
    }
  };

  // Background particle animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle system
    const particles: { x: number; y: number; size: number; speedY: number; speedX: number; opacity: number; color: string }[] = [];
    const colors = ['#10b981', '#f59e0b', '#3b82f6', '#34d399', '#fbbf24'];

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.5 + 1,
        speedY: -(Math.random() * 1.2 + 0.3),
        speedX: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.7 + 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Radial glow center
      const gradient = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, Math.max(width, height) * 0.6);
      gradient.addColorStop(0, 'rgba(16, 185, 129, 0.15)');
      gradient.addColorStop(0.4, 'rgba(245, 158, 11, 0.08)');
      gradient.addColorStop(1, 'rgba(2, 6, 23, 0.95)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Draw particles
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.shadowBlur = 12;
        ctx.shadowColor = p.color;
        ctx.fill();

        p.y += p.speedY;
        p.x += p.speedX;
        if (p.y < 0) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Progress simulation & stage updates (Stable timer that runs once)
  useEffect(() => {
    const startTime = Date.now();
    const duration = 1800; // Snappy 1.8 seconds transition to enter dashboard immediately

    const interval = setInterval(() => {
      if (completedRef.current) {
        clearInterval(interval);
        return;
      }

      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(currentProgress);

      const hi = isHiRef.current;
      if (currentProgress < 30) {
        setStageText(hi ? '🔒 256-बिट एन्क्रिप्टेड सत्र लोड हो रहा है...' : '🔒 Authenticating Encrypted Session...');
      } else if (currentProgress < 65) {
        setStageText(hi ? '⚡ दैनिक ROI नेटवर्क पोर्टफोलियो सिंक हो रहा है...' : '⚡ Syncing Daily ROI Portfolio Engine...');
      } else if (currentProgress < 90) {
        setStageText(hi ? '🏛️ वॉल्ट एवं अर्निंग्स वॉलेट तैयार हैं...' : '🏛️ Verifying Vault Assets & Wallet Balance...');
      } else {
        setStageText(hi ? '✅ स्वागत है! प्रवेश हो रहा है...' : '✅ Session Verified! Launching Dashboard...');
      }

      if (currentProgress >= 100) {
        clearInterval(interval);
        handleFinish();
      }
    }, 30);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {!isDone && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="fixed inset-0 z-[99999] bg-slate-950 flex flex-col items-center justify-between p-6 sm:p-10 select-none overflow-hidden"
        >
          {/* Background Canvas Particles */}
          <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />

          {/* Top Bar: Skip Button & Security Badge */}
          <div className="w-full max-w-4xl flex items-center justify-between z-10">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-emerald-500/30 text-[11px] font-bold text-emerald-300 backdrop-blur-md">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isHi ? 'सुरक्षित एन्क्रिप्टेड नेटवर्क' : '256-Bit Encrypted Vault'}</span>
            </div>

            <button
              onClick={handleFinish}
              className="px-4 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-xs font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1.5 backdrop-blur-md transition-all cursor-pointer shadow-lg active:scale-95"
            >
              <span>{isHi ? 'स्किप करें (Skip)' : 'Skip Intro'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Center Stage: Glowing GCap Emblem & Motion Typography */}
          <div className="flex-1 flex flex-col items-center justify-center text-center z-10 max-w-2xl px-4 py-8">
            {/* Animated Crest Logo */}
            <div className="relative mb-8">
              {/* Outer Rotating Laser Tech Ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                className="w-36 h-36 sm:w-44 sm:h-44 rounded-full border-2 border-dashed border-emerald-500/40 absolute -inset-4 sm:-inset-5 pointer-events-none"
              />

              {/* Reverse Rotating Accent Ring */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border border-dotted border-amber-500/30 absolute -inset-2 sm:-inset-3 pointer-events-none"
              />

              {/* Pulsing Backlight Glow */}
              <motion.div
                animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 bg-gradient-to-r from-emerald-500/40 via-amber-500/30 to-emerald-400/40 rounded-3xl filter blur-2xl z-0"
              />

              {/* Main 3D Golden GCap Box */}
              <motion.div
                initial={{ scale: 0.3, rotate: -20, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-br from-amber-400 via-amber-500 to-emerald-600 p-1 shadow-2xl shadow-amber-500/30 flex items-center justify-center"
              >
                <div className="w-full h-full bg-slate-950 rounded-[22px] flex flex-col items-center justify-center p-3 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-amber-950/40" />

                  <div className="relative z-10 flex items-center justify-center gap-1 text-amber-400">
                    <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
                    <ShieldCheck className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]" />
                  </div>

                  <span className="relative z-10 text-xl sm:text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-emerald-300 mt-1 font-mono">
                    GCAP
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Title & Subtitle Fade-In */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="space-y-2"
            >
              <h1 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-emerald-200 to-amber-400 tracking-wider">
                GCAP CAPITAL MANAGEMENT
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-emerald-400/90 tracking-wide flex items-center justify-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>{isHi ? 'ऑटोमेटेड डेली ROI एवं कैपिटल मैनेजमेंट सिस्टम' : 'Automated Daily ROI & Wealth Security Engine'}</span>
              </p>
            </motion.div>

            {/* Personalized Welcome Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="mt-5 px-4 py-2 rounded-2xl bg-slate-900/90 border border-amber-500/40 shadow-xl flex items-center justify-center gap-2 backdrop-blur-md"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs sm:text-sm font-bold text-slate-200">
                {isHi ? 'आपका स्वागत है:' : 'Welcome back:'}{' '}
                <strong className="text-amber-300 font-black">{user.name}</strong>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold uppercase">
                {user.role}
              </span>
            </motion.div>
          </div>

          {/* Bottom Progress Bar & Status Text */}
          <div className="w-full max-w-md z-10 space-y-3 pb-2">
            <div className="flex items-center justify-between text-xs font-mono font-bold">
              <span className="text-slate-300 flex items-center gap-1.5 truncate">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">{stageText}</span>
              </span>
              <span className="text-amber-400 font-black ml-2">{progress}%</span>
            </div>

            {/* Progress Bar Track */}
            <div className="w-full h-2.5 rounded-full bg-slate-900 border border-slate-800 p-0.5 overflow-hidden shadow-inner">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-300 shadow-[0_0_12px_rgba(245,158,11,0.6)]"
                style={{ width: `${progress}%` }}
                transition={{ ease: 'easeOut' }}
              />
            </div>

            <p className="text-[10px] text-center text-slate-400 font-medium tracking-wider">
              {isHi ? 'सुरक्षित 256-Bit SSL एन्क्रिप्शन • GCap AI भारत' : 'Secured by 256-Bit SSL Encryption • GCap Capital'}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
