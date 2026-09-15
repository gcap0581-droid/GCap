/**
 * GCap Futuristic Startup & Opening Soundtrack Synthesizer
 * Uses high-fidelity Web Audio API with multi-oscillator pads, crystal bell arpeggios,
 * harmonic sweeps, and triumphant completion chords.
 */

class StartupAudioEngine {
  private static instance: StartupAudioEngine;
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private activeNodes: (AudioNode | { stop: (time?: number) => void })[] = [];

  private constructor() {
    // Check stored mute preference
    if (typeof window !== 'undefined') {
      const storedMute = localStorage.getItem('gcap_sound_muted');
      if (storedMute === 'true') {
        this.isMuted = true;
      }
    }
  }

  public static getInstance(): StartupAudioEngine {
    if (!StartupAudioEngine.instance) {
      StartupAudioEngine.instance = new StartupAudioEngine();
    }
    return StartupAudioEngine.instance;
  }

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && !this.masterGain) {
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.28, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
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
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.28, now);
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
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.28, now);
    }
  }

  /**
   * Plays a fast, energetic, tech-house style intro
   * Composed of:
   * 1. Punchy synth-bass kick
   * 2. Driving sawtooth bass drop
   * 3. Fast 16th-note synth arpeggio with bounce delay
   * 4. Bright synth-brass chord hit
   */
  public playOpeningTheme(durationSec: number = 2.4) {
    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;
    if (this.isMuted) return;

    this.stopAll();

    const now = ctx.currentTime;
    const dest = this.masterGain;

    // --- Modern Energetic / Tech-House Style Intro ---
    
    // Add a fast bounce delay for energy (16th note feel at approx 120bpm -> 0.125s)
    const delay = ctx.createDelay(1.0);
    delay.delayTime.value = 0.125; 
    const delayFeedback = ctx.createGain();
    delayFeedback.gain.value = 0.4;
    const delayFilter = ctx.createBiquadFilter();
    delayFilter.type = 'highpass';
    delayFilter.frequency.value = 500;

    delay.connect(delayFeedback);
    delayFeedback.connect(delayFilter);
    delayFilter.connect(delay);
    delay.connect(dest);

    // 1. Driving Kick (4-on-the-floor feel)
    for (let t = 0; t < durationSec; t += 0.5) {
      const kickOsc = ctx.createOscillator();
      const kickGain = ctx.createGain();
      kickOsc.type = 'sine';
      kickOsc.frequency.setValueAtTime(150, now + t);
      kickOsc.frequency.exponentialRampToValueAtTime(30, now + t + 0.1);
      kickGain.gain.setValueAtTime(0.6, now + t);
      kickGain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.4);
      kickOsc.connect(kickGain);
      kickGain.connect(dest);
      kickOsc.start(now + t);
      kickOsc.stop(now + t + 0.45);
      this.activeNodes.push(kickOsc);
    }

    // 2. Pulsing Tech Bass (Off-beat)
    for (let t = 0.25; t < durationSec; t += 0.5) {
      const bassOsc = ctx.createOscillator();
      const bassGain = ctx.createGain();
      bassOsc.type = 'sawtooth';
      bassOsc.frequency.setValueAtTime(55, now + t); // A1 approx
      
      const bassFilter = ctx.createBiquadFilter();
      bassFilter.type = 'lowpass';
      bassFilter.frequency.setValueAtTime(1500, now + t);
      bassFilter.frequency.exponentialRampToValueAtTime(100, now + t + 0.2);
      
      bassGain.gain.setValueAtTime(0.4, now + t);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.3);
      
      bassOsc.connect(bassFilter);
      bassFilter.connect(bassGain);
      bassGain.connect(dest);
      bassOsc.start(now + t);
      bassOsc.stop(now + t + 0.3);
      this.activeNodes.push(bassOsc);
    }

    // 3. Fast Energetic Arpeggio building up over durationSec
    const baseScale = [220.00, 261.63, 329.63, 440.00, 523.25, 659.25, 880.00, 1046.50];
    const arpCount = Math.floor(durationSec / 0.125); // 8 notes per second
    
    for (let i = 0; i < arpCount; i++) {
      const noteTime = now + (i * 0.125);
      const noteFreq = baseScale[i % baseScale.length] * (i > 15 ? 2 : 1);
      
      const arpOsc = ctx.createOscillator();
      const arpGain = ctx.createGain();
      const panner = ctx.createStereoPanner();
      
      panner.pan.value = i % 2 === 0 ? -0.5 : 0.5;
      arpOsc.type = 'square';
      arpOsc.frequency.setValueAtTime(noteFreq, noteTime);
      
      const arpFilter = ctx.createBiquadFilter();
      arpFilter.type = 'lowpass';
      arpFilter.frequency.setValueAtTime(2000 + (i * 150), noteTime);
      arpFilter.frequency.exponentialRampToValueAtTime(300, noteTime + 0.1);
      
      arpGain.gain.setValueAtTime(0.12, noteTime);
      arpGain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.15);
      
      arpOsc.connect(arpFilter);
      arpFilter.connect(arpGain);
      arpGain.connect(panner);
      panner.connect(dest);
      panner.connect(delay); // add bounce
      
      arpOsc.start(noteTime);
      arpOsc.stop(noteTime + 0.2);
      this.activeNodes.push(arpOsc);
    }

    // 4. Sweeping Pad/Chord to fill the space and build tension
    const chordNotes = [440.00, 523.25, 659.25, 880.00]; // A minor chord
    chordNotes.forEach(f => {
      const padOsc = ctx.createOscillator();
      const padGain = ctx.createGain();
      const padFilter = ctx.createBiquadFilter();
      
      padOsc.type = 'sawtooth';
      padOsc.frequency.setValueAtTime(f, now);
      
      padFilter.type = 'lowpass';
      padFilter.frequency.setValueAtTime(400, now);
      padFilter.frequency.exponentialRampToValueAtTime(5000, now + durationSec);
      
      padGain.gain.setValueAtTime(0.01, now);
      padGain.gain.linearRampToValueAtTime(0.10, now + durationSec - 0.2);
      padGain.gain.exponentialRampToValueAtTime(0.001, now + durationSec + 0.5);
      
      padOsc.connect(padFilter);
      padFilter.connect(padGain);
      padGain.connect(dest);
      padGain.connect(delay); 
      
      padOsc.start(now);
      padOsc.stop(now + durationSec + 0.6);
      this.activeNodes.push(padOsc);
    });
  }

  /**
   * Plays a crisp high-tech milestone ping (e.g. stage transition 30%, 65%, 90%)
   */
  public playStageMilestone(step: number = 1) {
    const ctx = this.initContext();
    if (!ctx || !this.masterGain || this.isMuted) return;

    const now = ctx.currentTime;
    const dest = this.masterGain;

    const baseFreq = 523.25 * Math.pow(1.2599, step - 1); // C5, E5, G5, C6
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.06);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  /**
   * Plays the triumphant unlock chord upon 100% completion
   */
  public playTriumphUnlock() {
    const ctx = this.initContext();
    if (!ctx || !this.masterGain || this.isMuted) return;

    const now = ctx.currentTime;
    const dest = this.masterGain;

    // Rich C-Major Triumph Chord (C4, E4, G4, C5, E5, G5)
    const chordNotes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99];

    chordNotes.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = i < 3 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(f, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.07, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + 0.75);
    });
  }

  /**
   * Stops all currently playing sounds
   */
  public stopAll() {
    this.activeNodes.forEach((node) => {
      try {
        if ('stop' in node && typeof node.stop === 'function') {
          node.stop();
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
