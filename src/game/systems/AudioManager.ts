/**
 * Procedural Web Audio API sound synthesizer
 * Zero external assets required, handles autoplay policies and mute controls.
 */
export class AudioManager {
  private ctx: AudioContext | null = null;
  public muted: boolean = false;

  constructor() {
    // Lazy initialization on first user interaction
  }

  public init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    return this.muted;
  }

  public playTone(
    freqStart: number,
    freqEnd: number,
    duration: number,
    type: OscillatorType = 'sine',
    gainVal: number = 0.2
  ) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(Math.max(10, freqStart), now);
      if (freqEnd !== freqStart) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(10, freqEnd), now + duration);
      }

      gain.gain.setValueAtTime(gainVal, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch {
      // Audio context error fallback
    }
  }

  public jump() {
    this.playTone(160, 420, 0.12, 'sine', 0.14);
  }

  public rewind() {
    // Descending sci-fi time-reversal sound
    this.playTone(720, 110, 0.38, 'sawtooth', 0.22);
  }

  public echoSpawn() {
    // Arpeggiated hologram creation
    [440, 660, 880, 1100].forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, freq * 1.05, 0.18, 'triangle', 0.12), idx * 45);
    });
  }

  public alert() {
    this.playTone(880, 1150, 0.2, 'square', 0.16);
  }

  public switchClick() {
    this.playTone(320, 90, 0.09, 'triangle', 0.24);
  }

  public coreCollect() {
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, freq, 0.3, 'sine', 0.18), idx * 75);
    });
  }

  public laserZap() {
    this.playTone(1200, 50, 0.28, 'sawtooth', 0.28);
  }

  public victory() {
    [392, 523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, freq, 0.9, 'triangle', 0.18), idx * 100);
    });
  }

  public defeat() {
    this.playTone(280, 45, 0.45, 'sawtooth', 0.25);
  }

  public uiClick() {
    this.playTone(550, 680, 0.05, 'sine', 0.1);
  }
}
