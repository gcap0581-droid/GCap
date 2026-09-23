/**
 * GCap Decent & Prestigious Wealth Startup Soundtrack Synthesizer
 * 
 * Replaces aggressive techno kicks/sawtooth buzz with an elegant,
 * warm, soothing acoustic chime & harmonic wealth resonance.
 * Inspired by premium private banking, Apple Pay clarity, and acoustic marimba tones.
 */

class StartupAudioEngine {
  private static instance: StartupAudioEngine;
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private activeNodes: (AudioNode | { stop: (time?: number) => void })[] = [];
  private hasUserInteracted: boolean = false;

  private constructor() {
    if (typeof window !== 'undefined') {
      const storedMute = localStorage.getItem('gcap_sound_muted');
      if (storedMute === 'true') {
        this.isMuted = true;
      }

      // Auto-unlock AudioContext on first user gesture if browser suspended it
      const unlockAudio = () => {
        this.hasUserInteracted = true;
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
        window.removeEventListener('pointerdown', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
      };

      window.addEventListener('pointerdown', unlockAudio, { passive: true });
      window.addEventListener('touchstart', unlockAudio, { passive: true });
      window.addEventListener('keydown', unlockAudio, { passive: true });
    }
  }

  public static getInstance(): StartupAudioEngine {
    if (!StartupAudioEngine.instance) {
      StartupAudioEngine.instance = new StartupAudioEngine();
    }
    return StartupAudioEngine.instance;
  }

  private async ensureRunningContext(): Promise<AudioContext | null> {
    if (typeof window === 'undefined') return null;
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return null;
      try {
        this.ctx = new AudioCtx({ sampleRate: 44100 });
      } catch (_) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && !this.masterGain) {
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.18, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
      } catch (_) {}
    }
    return this.ctx;
  }

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return null;
      try {
        this.ctx = new AudioCtx({ sampleRate: 44100 });
      } catch (_) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && !this.masterGain) {
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.18, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    return this.ctx;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('gcap_sound_muted', this.isMuted ? 'true' : 'false');
    }
    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.18, now);
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('gcap_sound_muted', this.isMuted ? 'true' : 'false');
    }
    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.18, now);
    }
  }

  /**
   * Plays a decent, prestigious, soothing Wealth Chime
   * Character:
   * - Soft acoustic marimba/celeste 4-note ascending chord progression
   * - Warm ambient harmonic bed in C-Major 9
   * - Gentle spatial resonance with zero harsh electronic artifacts
   */
  public async playOpeningTheme(durationSec: number = 2.4) {
    const ctx = await this.ensureRunningContext();
    if (!ctx || !this.masterGain) return;
    if (this.isMuted) return;

    // If context is still suspended (due to mobile autoplay policy), wait for user touch gesture
    if (ctx.state === 'suspended') {
      const playOnTouch = async () => {
        try {
          await ctx.resume();
          if (ctx.state === 'running') {
            this.playOpeningTheme(durationSec);
          }
        } catch (_) {}
      };
      window.addEventListener('pointerdown', playOnTouch, { once: true });
      window.addEventListener('touchstart', playOnTouch, { once: true });
      return;
    }

    this.stopAll();

    const now = ctx.currentTime;
    const dest = this.masterGain;

    // Ambient Warm Reverb / Spatial Echo simulation
    const delay = ctx.createDelay(1.0);
    delay.delayTime.setValueAtTime(0.24, now); // Gentle 240ms acoustic room bounce
    const delayGain = ctx.createGain();
    delayGain.gain.setValueAtTime(0.18, now);
    
    const delayFilter = ctx.createBiquadFilter();
    delayFilter.type = 'lowpass';
    delayFilter.frequency.setValueAtTime(1800, now); // Warm room absorption

    delay.connect(delayFilter);
    delayFilter.connect(delayGain);
    delayGain.connect(delay);
    delayGain.connect(dest);

    // 1. Warm Acoustic Harmonic Swell (Gentle, breathing C-Maj9 chord)
    // Notes: C3 (130.81Hz), G3 (196.00Hz), E4 (329.63Hz), B4 (493.88Hz)
    const warmChord = [130.81, 196.00, 329.63, 493.88];
    warmChord.forEach((freq, idx) => {
      const padOsc = ctx.createOscillator();
      const padGain = ctx.createGain();
      const padFilter = ctx.createBiquadFilter();

      padOsc.type = 'sine';
      padOsc.frequency.setValueAtTime(freq, now);

      padFilter.type = 'lowpass';
      padFilter.frequency.setValueAtTime(600, now); // Silky warm lowpass

      // Silky smooth envelope: soft breath-in and gentle decay
      padGain.gain.setValueAtTime(0.0001, now);
      padGain.gain.linearRampToValueAtTime(0.045 / (idx + 1), now + 0.35);
      padGain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec + 0.5);

      padOsc.connect(padFilter);
      padFilter.connect(padGain);
      padGain.connect(dest);
      padGain.connect(delay);

      padOsc.start(now);
      padOsc.stop(now + durationSec + 0.6);
      this.activeNodes.push(padOsc);
    });

    // 2. Decent Ascending Crystal Bell / Marimba Chime
    // Note Sequence: G4 (392Hz) -> C5 (523.25Hz) -> E5 (659.25Hz) -> G5 (783.99Hz)
    // Gives that prestigious "Apple Pay / Google Pay / Bloomberg" wealth confirmation feel
    const chimeMelody = [
      { time: 0.00, freq: 392.00, pan: -0.15, vol: 0.35 }, // G4
      { time: 0.32, freq: 523.25, pan: 0.10, vol: 0.40 },  // C5
      { time: 0.68, freq: 659.25, pan: -0.05, vol: 0.42 }, // E5
      { time: 1.05, freq: 783.99, pan: 0.15, vol: 0.45 },  // G5 (triumphant harmonic peak)
    ];

    chimeMelody.forEach((note) => {
      const startTime = now + note.time;

      // Pure Fundamental Sine
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.freq, startTime);

      // Acoustic Bell Harmonic (warm second partial overtone)
      const harmonicOsc = ctx.createOscillator();
      const harmonicGain = ctx.createGain();
      harmonicOsc.type = 'triangle';
      harmonicOsc.frequency.setValueAtTime(note.freq * 2.01, startTime); // Subtle natural chorusing

      // Natural acoustic marimba/bell envelope
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(note.vol * 0.3, startTime + 0.018); // 18ms soft attack (no click)
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.4);      // Gentle acoustic bell decay

      harmonicGain.gain.setValueAtTime(0.0001, startTime);
      harmonicGain.gain.linearRampToValueAtTime(note.vol * 0.08, startTime + 0.012);
      harmonicGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.45); // Quick harmonic decay

      // Panner for subtle natural spatial breathing
      let pannerNode: StereoPannerNode | null = null;
      try {
        if (typeof ctx.createStereoPanner === 'function') {
          pannerNode = ctx.createStereoPanner();
          pannerNode.pan.setValueAtTime(note.pan, startTime);
        }
      } catch (_) {}

      osc.connect(gain);
      harmonicOsc.connect(harmonicGain);

      if (pannerNode) {
        gain.connect(pannerNode);
        harmonicGain.connect(pannerNode);
        pannerNode.connect(dest);
        pannerNode.connect(delay);
      } else {
        gain.connect(dest);
        harmonicGain.connect(dest);
        gain.connect(delay);
      }

      osc.start(startTime);
      harmonicOsc.start(startTime);
      osc.stop(startTime + 1.45);
      harmonicOsc.stop(startTime + 0.5);

      this.activeNodes.push(osc);
      this.activeNodes.push(harmonicOsc);
    });

    // 3. Gentle C6 crystal air sparkle at 1.4s (very quiet, soothing high chime)
    const sparkleTime = now + 1.40;
    const sparkleOsc = ctx.createOscillator();
    const sparkleGain = ctx.createGain();

    sparkleOsc.type = 'sine';
    sparkleOsc.frequency.setValueAtTime(1046.50, sparkleTime); // C6

    sparkleGain.gain.setValueAtTime(0.0001, sparkleTime);
    sparkleGain.gain.linearRampToValueAtTime(0.08, sparkleTime + 0.02);
    sparkleGain.gain.exponentialRampToValueAtTime(0.0001, sparkleTime + 0.9);

    sparkleOsc.connect(sparkleGain);
    sparkleGain.connect(dest);
    sparkleGain.connect(delay);

    sparkleOsc.start(sparkleTime);
    sparkleOsc.stop(sparkleTime + 0.95);
    this.activeNodes.push(sparkleOsc);
  }

  /**
   * Plays a delicate, polite acoustic droplet tick (stage 30%, 65%, 90%)
   * Much more decent than robotic beeps.
   */
  public async playStageMilestone(step: number = 1) {
    const ctx = await this.ensureRunningContext();
    if (!ctx || !this.masterGain || this.isMuted) return;
    if (ctx.state === 'suspended') return;

    const now = ctx.currentTime;
    const dest = this.masterGain;

    // Gentle soft droplet tone: E5, G5, B5
    const freqs = [659.25, 783.99, 987.77];
    const freq = freqs[(step - 1) % freqs.length] || 783.99;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    // Extremely soft and quick (like a luxury haptic sound)
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.04, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  /**
   * Plays a warm, comforting acoustic resolution chime upon entering the app
   */
  public async playTriumphUnlock() {
    const ctx = await this.ensureRunningContext();
    if (!ctx || !this.masterGain || this.isMuted) return;
    if (ctx.state === 'suspended') return;

    const now = ctx.currentTime;
    const dest = this.masterGain;

    // Soothing warm chord (C4 + E4 + G4 + C5)
    const notes = [261.63, 329.63, 392.00, 523.25];

    notes.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.035 / (i + 1), now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + 0.9);
    });
  }

  /**
   * Stops all currently playing sounds cleanly
   */
  public stopAll() {
    this.activeNodes.forEach((node) => {
      try {
        if ('stop' in node && typeof (node as any).stop === 'function') {
          (node as any).stop();
        }
      } catch (_) {}
    });
    this.activeNodes = [];
  }
}

export const startupAudio = StartupAudioEngine.getInstance();

export function playStartupMusic(durationSec: number = 2.4): void {
  startupAudio.playOpeningTheme(durationSec);
}

export function playStartupStageMilestone(step: number): void {
  startupAudio.playStageMilestone(step);
}

export function playStartupTriumph(): void {
  startupAudio.playTriumphUnlock();
}

export function toggleStartupSoundMute(): boolean {
  return startupAudio.toggleMute();
}

export function getStartupSoundMuted(): boolean {
  return startupAudio.getIsMuted();
}
