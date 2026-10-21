// Client-side Web Audio API Sound Synthesizer (Zero asset dependencies)

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.3;
  private bgmInterval: number | null = null;
  private isBgmPlaying: boolean = false;

  private init() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.isBgmPlaying) {
      this.stopBgm();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public playSfx(
    type:
      | "click"
      | "correct"
      | "error"
      | "attack"
      | "boss-hit"
      | "level-up"
      | "victory"
      | "skill-unlock"
      | "badge-inspect"
      | "heal"
  ) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    switch (type) {
      case "click": {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
        gain.gain.setValueAtTime(this.volume * 0.4, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.05);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
        break;
      }

      case "correct": {
        // High bright arpeggio (C5 -> E5 -> G5)
        [523.25, 659.25, 783.99].forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const noteTime = now + idx * 0.07;
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, noteTime);
          gain.gain.setValueAtTime(this.volume * 0.6, noteTime);
          gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.15);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(noteTime);
          osc.stop(noteTime + 0.16);
        });
        break;
      }

      case "error": {
        // Low dissonance buzz
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.18);
        gain.gain.setValueAtTime(this.volume * 0.7, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.18);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.18);
        break;
      }

      case "attack": {
        // Fast laser zap
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.12);
        gain.gain.setValueAtTime(this.volume * 0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.13);
        break;
      }

      case "boss-hit": {
        // Heavy crunchy explosion
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.25);
        gain.gain.setValueAtTime(this.volume * 0.9, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.26);
        break;
      }

      case "level-up": {
        // Fanfare arcade chord progression
        const notes = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const noteTime = now + idx * 0.08;
          osc.type = "square";
          osc.frequency.setValueAtTime(freq, noteTime);
          gain.gain.setValueAtTime(this.volume * 0.5, noteTime);
          gain.gain.exponentialRampToValueAtTime(0.01, noteTime + 0.2);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(noteTime);
          osc.stop(noteTime + 0.22);
        });
        break;
      }

      case "victory": {
        const chord = [392.0, 523.25, 659.25, 783.99];
        chord.forEach((freq) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(this.volume * 0.4, now);
          gain.gain.linearRampToValueAtTime(0, now + 0.8);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.85);
        });
        break;
      }

      case "skill-unlock": {
        // Futuristic cybernetic shimmer (ascending sine with vibrato)
        [440, 554.37, 659.25, 880].forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const noteTime = now + idx * 0.06;
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, noteTime);
          gain.gain.setValueAtTime(this.volume * 0.45, noteTime);
          gain.gain.exponentialRampToValueAtTime(0.01, noteTime + 0.18);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(noteTime);
          osc.stop(noteTime + 0.19);
        });
        break;
      }

      case "badge-inspect": {
        // Soft chime sparkle
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(784, now);
        osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.1);
        gain.gain.setValueAtTime(this.volume * 0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.21);
        break;
      }

      case "heal": {
        // Ascending harmonic pulse
        [330, 440, 660].forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const noteTime = now + idx * 0.08;
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, noteTime);
          gain.gain.setValueAtTime(this.volume * 0.4, noteTime);
          gain.gain.linearRampToValueAtTime(0, noteTime + 0.22);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(noteTime);
          osc.stop(noteTime + 0.23);
        });
        break;
      }
    }
  }

  public toggleBgm(play?: boolean): boolean {
    if (this.isMuted) return false;
    this.init();

    const shouldPlay = play !== undefined ? play : !this.isBgmPlaying;
    if (shouldPlay) {
      this.startBgm();
    } else {
      this.stopBgm();
    }
    return this.isBgmPlaying;
  }

  private startBgm() {
    if (typeof window === "undefined") return;
    if (this.isBgmPlaying || !this.ctx) return;
    this.isBgmPlaying = true;

    // Ambient retro chiptune arpeggiator in A minor / Pentatonic
    const notes = [220, 261.63, 329.63, 392, 440, 523.25, 440, 329.63];
    let noteIdx = 0;

    this.bgmInterval = window.setInterval(() => {
      if (!this.ctx || this.isMuted) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(notes[noteIdx % notes.length], now);
      gain.gain.setValueAtTime(this.volume * 0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.28);
      noteIdx++;
    }, 280);
  }

  private stopBgm() {
    if (this.bgmInterval !== null) {
      if (typeof window !== "undefined") {
        window.clearInterval(this.bgmInterval);
      } else {
        clearInterval(this.bgmInterval);
      }
      this.bgmInterval = null;
    }
    this.isBgmPlaying = false;
  }
}

export const soundEngine = new SoundEngine();
