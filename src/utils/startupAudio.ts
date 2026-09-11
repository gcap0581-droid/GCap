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
   * Plays the grand, splendid opening soundtrack
   * Composed of:
   * 1. Sub-bass swell + Warm cinematic drone
   * 2. Ascending crystal harmonic arpeggios
   * 3. Shimmering high frequencies
   * 4. Ambient stereo spatial layers
   */
  public playOpeningTheme(durationSec: number = 2.4) {
    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;
    if (this.isMuted) return;

    this.stopAll();

    const now = ctx.currentTime;
    const dest = this.masterGain;

    // --- Layer 1: Ambient Cinematic Pad Swell (Cmaj9) ---
    const padFreqs = [130.81, 196.00, 246.94, 293.66, 392.00]; // C3, G3, B3, D4, G4
    padFreqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      // Subtle pitch drift for analog lushness
      osc.frequency.linearRampToValueAtTime(freq * 1.002, now + durationSec);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, now);
      filter.frequency.exponentialRampToValueAtTime(2400, now + durationSec * 0.7);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.09 / padFreqs.length, now + 0.4);
      gain.gain.setValueAtTime(0.09 / padFreqs.length, now + durationSec - 0.5);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec + 0.3);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + durationSec + 0.35);
      this.activeNodes.push(osc);
    });

    // --- Layer 2: Deep Sub Bass Foundation ---
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(65.41, now); // C2
    subOsc.frequency.exponentialRampToValueAtTime(130.81, now + durationSec * 0.8);

    subGain.gain.setValueAtTime(0.001, now);
    subGain.gain.linearRampToValueAtTime(0.18, now + 0.3);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + durationSec);

    subOsc.connect(subGain);
    subGain.connect(dest);
    subOsc.start(now);
    subOsc.stop(now + durationSec + 0.1);
    this.activeNodes.push(subOsc);

    // --- Layer 3: Ascending Crystal Bell Arpeggiation ---
    // Notes: C4, E4, G4, B4, D5, E5, G5, C6 (Lush golden progression)
    const melodyNotes = [
      { f: 261.63, t: 0.05, dur: 0.45 }, // C4
      { f: 329.63, t: 0.25, dur: 0.45 }, // E4
      { f: 392.00, t: 0.48, dur: 0.50 }, // G4
      { f: 493.88, t: 0.72, dur: 0.55 }, // B4
      { f: 587.33, t: 0.98, dur: 0.60 }, // D5
      { f: 659.25, t: 1.22, dur: 0.65 }, // E5
      { f: 783.99, t: 1.45, dur: 0.75 }, // G5
      { f: 1046.50, t: 1.70, dur: 0.95 }, // C6 (Crystal Peak)
    ];

    melodyNotes.forEach((note) => {
      const noteTime = now + note.t;

      // Primary Crystal Tone
      const bellOsc = ctx.createOscillator();
      const bellGain = ctx.createGain();

      bellOsc.type = 'sine';
      bellOsc.frequency.setValueAtTime(note.f, noteTime);

      bellGain.gain.setValueAtTime(0.001, noteTime);
      bellGain.gain.linearRampToValueAtTime(0.14, noteTime + 0.02);
      bellGain.gain.exponentialRampToValueAtTime(0.0001, noteTime + note.dur);

      bellOsc.connect(bellGain);
      bellGain.connect(dest);

      bellOsc.start(noteTime);
      bellOsc.stop(noteTime + note.dur + 0.05);
      this.activeNodes.push(bellOsc);

      // Shimmer Harmonic (Overtone)
      const shimmerOsc = ctx.createOscillator();
      const shimmerGain = ctx.createGain();
      shimmerOsc.type = 'sine';
      shimmerOsc.frequency.setValueAtTime(note.f * 2, noteTime); // 1 Octave higher shimmer

      shimmerGain.gain.setValueAtTime(0.001, noteTime);
      shimmerGain.gain.linearRampToValueAtTime(0.04, noteTime + 0.015);
      shimmerGain.gain.exponentialRampToValueAtTime(0.0001, noteTime + note.dur * 0.7);

      shimmerOsc.connect(shimmerGain);
      shimmerGain.connect(dest);

      shimmerOsc.start(noteTime);
      shimmerOsc.stop(noteTime + note.dur * 0.7 + 0.05);
      this.activeNodes.push(shimmerOsc);
    });

    // --- Layer 4: Tech Laser Shimmer / Sparkle Sweep ---
    const sweepOsc = ctx.createOscillator();
    const sweepGain = ctx.createGain();
    const sweepFilter = ctx.createBiquadFilter();

    sweepOsc.type = 'sawtooth';
    sweepOsc.frequency.setValueAtTime(220, now + 0.8);
    sweepOsc.frequency.exponentialRampToValueAtTime(880, now + 1.8);

    sweepFilter.type = 'bandpass';
    sweepFilter.Q.setValueAtTime(4.0, now + 0.8);
    sweepFilter.frequency.setValueAtTime(800, now + 0.8);
    sweepFilter.frequency.exponentialRampToValueAtTime(3200, now + 1.8);

    sweepGain.gain.setValueAtTime(0.0001, now + 0.8);
    sweepGain.gain.linearRampToValueAtTime(0.05, now + 1.2);
    sweepGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.85);

    sweepOsc.connect(sweepFilter);
    sweepFilter.connect(sweepGain);
    sweepGain.connect(dest);

    sweepOsc.start(now + 0.8);
    sweepOsc.stop(now + 1.9);
    this.activeNodes.push(sweepOsc);
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
