/**
 * GCap Smart Audio & Voice Message Announcement Engine
 * Operates purely in the background with crystal chimes and natural SpeechSynthesis.
 * Plays once per event and ends cleanly without cluttering the user's screen.
 */

import { startupAudio } from './startupAudio';

export interface AudioVoiceAnnouncementOptions {
  userName?: string;
  amount?: number;
  planName?: string;
  gpAmount?: number;
  method?: string;
  language?: 'hi' | 'en';
}

class AudioAnnouncerEngine {
  private static instance: AudioAnnouncerEngine;

  private constructor() {}

  public static getInstance(): AudioAnnouncerEngine {
    if (!AudioAnnouncerEngine.instance) {
      AudioAnnouncerEngine.instance = new AudioAnnouncerEngine();
    }
    return AudioAnnouncerEngine.instance;
  }

  /**
   * Play an elegant high-fidelity chime before voice message (Digital crystal ping)
   */
  private playPreSpeechChime() {
    if (typeof window === 'undefined') return;
    if (startupAudio.getIsMuted()) return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Sparkling double chime (C6 -> G6)
      const freqs = [1046.5, 1318.51, 1567.98]; // C6, E6, G6
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + idx * 0.08);

        gain.gain.setValueAtTime(0.001, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.4);
      });
    } catch (_) {}
  }

  /**
   * Speak a voice message in Hindi or English purely in the background
   */
  public speak(text: string, lang: 'hi' | 'en' = 'hi', delayMs: number = 280) {
    if (typeof window === 'undefined') return;
    if (startupAudio.getIsMuted()) return;

    // Play pleasant crystal ping sound first
    this.playPreSpeechChime();

    setTimeout(() => {
      if (!('speechSynthesis' in window)) {
        return;
      }

      try {
        window.speechSynthesis.cancel(); // Cleanly reset any lingering utterance

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.98; // Clear, natural pacing
        utterance.pitch = 1.05; // Polite and clear
        utterance.volume = 1.0;

        // Find best matching voice
        const voices = window.speechSynthesis.getVoices();
        if (lang === 'hi') {
          utterance.lang = 'hi-IN';
          const hiVoice = voices.find(
            (v) =>
              v.lang.toLowerCase().includes('hi') ||
              v.name.toLowerCase().includes('hindi') ||
              v.name.toLowerCase().includes('india')
          );
          if (hiVoice) {
            utterance.voice = hiVoice;
          }
        } else {
          utterance.lang = 'en-IN';
          const enVoice = voices.find(
            (v) =>
              v.lang.toLowerCase().includes('en-in') ||
              v.lang.toLowerCase().includes('en_in') ||
              v.name.toLowerCase().includes('india')
          );
          if (enVoice) {
            utterance.voice = enVoice;
          }
        }

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('[AudioAnnouncer] Speech synthesis error:', err);
      }
    }, delayMs);
  }

  /**
   * 1. New Registration Voice Announcement
   */
  public announceRegistration(options: AudioVoiceAnnouncementOptions) {
    const rawName = options.userName?.trim() || 'साथी';
    const name = rawName.split(' ')[0] || rawName;
    const isHi = options.language !== 'en';

    const text = isHi
      ? `नमस्ते ${name} जी! जी-कैप कैपिटल में आपका स्वागत है। आपका सुरक्षित खाता सफलतापूर्वक बन गया है!`
      : `Welcome ${name} to GCap Capital! Your secure account has been created successfully!`;

    this.speak(text, isHi ? 'hi' : 'en');
  }

  /**
   * 2. Plan Investment Voice Announcement
   */
  public announceInvestment(options: AudioVoiceAnnouncementOptions) {
    const rawName = options.userName?.trim() || 'साथी';
    const name = rawName.split(' ')[0] || rawName;
    const amount = options.amount ? Math.round(options.amount).toLocaleString('en-IN') : '0';
    const plan = options.planName || 'दैनिक रिटर्न प्लान';
    const isHi = options.language !== 'en';

    const text = isHi
      ? `बधाई हो ${name} जी! आपका ${amount} रुपये का ${plan} निवेश सफलतापूर्वक शुरू हो गया है!`
      : `Congratulations ${name}! Your investment of ${amount} rupees in ${plan} is successfully activated!`;

    this.speak(text, isHi ? 'hi' : 'en');
  }

  /**
   * 3. Withdrawal Request Voice Announcement
   */
  public announceWithdrawal(options: AudioVoiceAnnouncementOptions) {
    const rawName = options.userName?.trim() || 'साथी';
    const name = rawName.split(' ')[0] || rawName;
    const amount = options.amount ? Math.round(options.amount).toLocaleString('en-IN') : '0';
    const isHi = options.language !== 'en';

    const text = isHi
      ? `नमस्ते ${name} जी! आपका ${amount} रुपये की निकासी का अनुरोध सफलतापूर्वक प्रोसेस हो रहा है!`
      : `Dear ${name}, your withdrawal request of ${amount} rupees has been processed successfully!`;

    this.speak(text, isHi ? 'hi' : 'en');
  }

  /**
   * 4. GP Swapping Voice Announcement
   */
  public announceGpSwap(options: AudioVoiceAnnouncementOptions) {
    const rawName = options.userName?.trim() || 'साथी';
    const name = rawName.split(' ')[0] || rawName;
    const cashAmount = options.amount ? Math.round(options.amount).toLocaleString('en-IN') : '0';
    const gpAmount = options.gpAmount ? Math.round(options.gpAmount).toLocaleString('en-IN') : cashAmount;
    const isHi = options.language !== 'en';

    const text = isHi
      ? `बधाई हो ${name} जी! आपने ${gpAmount} जीपी को ${cashAmount} रुपये कैश में सफलतापूर्वक बदल लिया है!`
      : `Congratulations ${name}! You have successfully converted ${cashAmount} rupees to ${gpAmount} GP points!`;

    this.speak(text, isHi ? 'hi' : 'en');
  }

  /**
   * 5. Money Deposit / Add Cash Voice Announcement
   */
  public announceDeposit(options: AudioVoiceAnnouncementOptions) {
    const rawName = options.userName?.trim() || 'साथी';
    const name = rawName.split(' ')[0] || rawName;
    const amount = options.amount ? Math.round(options.amount).toLocaleString('en-IN') : '0';
    const isHi = options.language !== 'en';

    const text = isHi
      ? `नमस्ते ${name} जी! आपका ${amount} रुपये जमा करने का अनुरोध सफलतापूर्वक दर्ज हो गया है!`
      : `Hello ${name}! Your deposit request of ${amount} rupees has been submitted successfully!`;

    this.speak(text, isHi ? 'hi' : 'en');
  }

  /**
   * 6. Password Change Voice Announcement
   */
  public announcePasswordChange(options: AudioVoiceAnnouncementOptions) {
    const rawName = options.userName?.trim() || 'साथी';
    const name = rawName.split(' ')[0] || rawName;
    const isHi = options.language !== 'en';

    const text = isHi
      ? `नमस्ते ${name} जी! आपका खाता पासवर्ड सफलतापूर्वक बदल दिया गया है!`
      : `Hello ${name}! Your account password has been changed successfully!`;

    this.speak(text, isHi ? 'hi' : 'en');
  }
}

export const audioAnnouncer = AudioAnnouncerEngine.getInstance();
