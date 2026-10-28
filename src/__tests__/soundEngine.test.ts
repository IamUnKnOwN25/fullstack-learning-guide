import { describe, it, expect, vi, beforeEach } from 'vitest';
import { soundEngine, SoundEngine } from '../lib/soundEngine';
import { soundEngine as audioSoundEngine } from '../lib/audio';

describe('SoundEngine', () => {
  let mockAudioContext: any;
  let mockOscillator: any;
  let mockGain: any;

  beforeEach(() => {
    mockOscillator = {
      type: 'sine',
      frequency: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };

    mockGain = {
      gain: {
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    };

    mockAudioContext = {
      state: 'suspended',
      resume: vi.fn(),
      currentTime: 0,
      createOscillator: vi.fn(() => mockOscillator),
      createGain: vi.fn(() => mockGain),
      destination: {},
    };

    (global as any).window = {
      AudioContext: vi.fn().mockImplementation(function() { return mockAudioContext; }),
      setInterval: vi.fn(),
      clearInterval: vi.fn(),
    };

    soundEngine.setMuted(false);
    soundEngine.setVolume(0.3);
  });

  it('re-exports soundEngine singleton identically from src/lib/audio', () => {
    expect(audioSoundEngine).toBe(soundEngine);
  });

  it('initializes AudioContext on playSfx and resumes if suspended', () => {
    soundEngine.playSfx('click');
    expect(window.AudioContext).toHaveBeenCalled();
    expect(mockAudioContext.resume).toHaveBeenCalled();
  });

  it('respects volume settings and clamps out-of-range volume', () => {
    soundEngine.setVolume(0.5);
    soundEngine.playSfx('click');
    expect(mockGain.gain.setValueAtTime).toHaveBeenCalledWith(0.5 * 0.4, 0);

    // Test volume clamping to max 1.0
    soundEngine.setVolume(1.8);
    soundEngine.playSfx('click');
    expect(mockGain.gain.setValueAtTime).toHaveBeenCalledWith(1.0 * 0.4, 0);

    // Test volume clamping to min 0.0
    soundEngine.setVolume(-0.5);
    soundEngine.playSfx('click');
    expect(mockGain.gain.setValueAtTime).toHaveBeenCalledWith(0.0 * 0.4, 0);
  });

  it('respects muted state and halts execution early', () => {
    soundEngine.setMuted(true);
    soundEngine.playSfx('click');
    expect(mockOscillator.start).not.toHaveBeenCalled();
  });

  describe('playSfx full suite', () => {
    it('plays click sound with sine wave', () => {
      soundEngine.playSfx('click');
      expect(mockOscillator.type).toBe('sine');
      expect(mockOscillator.start).toHaveBeenCalled();
    });

    it('plays correct sound with triangle wave arpeggio', () => {
      soundEngine.playSfx('correct');
      expect(mockOscillator.type).toBe('triangle');
      expect(mockOscillator.start).toHaveBeenCalled();
    });

    it('plays error sound with sawtooth wave dissonance', () => {
      soundEngine.playSfx('error');
      expect(mockOscillator.type).toBe('sawtooth');
      expect(mockOscillator.start).toHaveBeenCalled();
    });

    it('plays attack sound with square wave strike', () => {
      soundEngine.playSfx('attack');
      expect(mockOscillator.type).toBe('square');
      expect(mockOscillator.start).toHaveBeenCalled();
    });

    it('plays boss-hit sound effect', () => {
      soundEngine.playSfx('boss-hit');
      expect(mockOscillator.start).toHaveBeenCalled();
    });

    it('plays level-up celebratory fanfare', () => {
      soundEngine.playSfx('level-up');
      expect(mockOscillator.start).toHaveBeenCalled();
    });

    it('plays victory triumphant chords', () => {
      soundEngine.playSfx('victory');
      expect(mockOscillator.start).toHaveBeenCalled();
    });

    it('plays skill-unlock shimmer', () => {
      soundEngine.playSfx('skill-unlock');
      expect(mockOscillator.start).toHaveBeenCalled();
    });

    it('plays badge-inspect gentle chime', () => {
      soundEngine.playSfx('badge-inspect');
      expect(mockOscillator.start).toHaveBeenCalled();
    });

    it('plays heal restorative sweep', () => {
      soundEngine.playSfx('heal');
      expect(mockOscillator.start).toHaveBeenCalled();
    });
  });

  describe('BGM controls', () => {
    it('toggles BGM correctly', () => {
      const isPlayingOn = soundEngine.toggleBgm();
      expect(isPlayingOn).toBe(true);
      expect(window.setInterval).toHaveBeenCalled();

      const isPlayingOff = soundEngine.toggleBgm();
      expect(isPlayingOff).toBe(false);
      expect(window.clearInterval).toHaveBeenCalled();
    });

    it('can force play or stop BGM', () => {
      soundEngine.toggleBgm(true);
      expect(window.setInterval).toHaveBeenCalled();

      soundEngine.toggleBgm(false);
      expect(window.clearInterval).toHaveBeenCalled();
    });

    it('stops BGM when muted', () => {
      soundEngine.toggleBgm(true);
      expect(window.setInterval).toHaveBeenCalled();

      soundEngine.setMuted(true);
      expect(window.clearInterval).toHaveBeenCalled();

      const playAttempt = soundEngine.toggleBgm(true);
      expect(playAttempt).toBe(false);
    });
  });

  describe('Getters & State Toggles', () => {
    it('returns muted state and allows toggleMute', () => {
      soundEngine.setMuted(false);
      expect(soundEngine.getIsMuted()).toBe(false);

      const isNowMuted = soundEngine.toggleMute();
      expect(isNowMuted).toBe(true);
      expect(soundEngine.getIsMuted()).toBe(true);

      const isUnmuted = soundEngine.toggleMute();
      expect(isUnmuted).toBe(false);
      expect(soundEngine.getIsMuted()).toBe(false);
    });

    it('returns volume and clamps out-of-bounds inputs', () => {
      soundEngine.setVolume(0.75);
      expect(soundEngine.getVolume()).toBe(0.75);

      soundEngine.setVolume(-1.5);
      expect(soundEngine.getVolume()).toBe(0);

      soundEngine.setVolume(2.5);
      expect(soundEngine.getVolume()).toBe(1);

      // Defensively handles NaN and non-finite inputs
      soundEngine.setVolume(NaN);
      expect(soundEngine.getVolume()).toBe(0);

      soundEngine.setVolume(Infinity);
      expect(soundEngine.getVolume()).toBe(0);

      soundEngine.setVolume(-Infinity);
      expect(soundEngine.getVolume()).toBe(0);
    });

    it('instantiates new isolated SoundEngine instances with correct defaults', () => {
      const customEngine = new SoundEngine();
      expect(customEngine.getIsMuted()).toBe(false);
      expect(customEngine.getVolume()).toBe(0.3);
      expect(customEngine.isAudioContextReady()).toBe(false);
    });

    it('falls back to webkitAudioContext when standard AudioContext is absent', () => {
      const mockWebkitCtx = {
        state: 'running',
        resume: vi.fn(),
        currentTime: 0,
        createOscillator: vi.fn(() => mockOscillator),
        createGain: vi.fn(() => mockGain),
        destination: {},
      };
      (global as any).window = {
        webkitAudioContext: vi.fn().mockImplementation(function() { return mockWebkitCtx; }),
      };

      const customEngine = new SoundEngine();
      customEngine.playSfx('click');
      expect((global as any).window.webkitAudioContext).toHaveBeenCalled();
      expect(customEngine.isAudioContextReady()).toBe(true);
    });

    it('handles disposal cleanly by stopping BGM and closing AudioContext', () => {
      const mockClose = vi.fn();
      const mockCtxWithClose = {
        ...mockAudioContext,
        state: 'running',
        close: mockClose,
      };
      (global as any).window = {
        AudioContext: vi.fn().mockImplementation(function() { return mockCtxWithClose; }),
        clearInterval: vi.fn(),
      };

      const customEngine = new SoundEngine();
      customEngine.playSfx('click');
      expect(customEngine.isAudioContextReady()).toBe(true);

      customEngine.dispose();
      expect(mockClose).toHaveBeenCalled();
      expect(customEngine.isAudioContextReady()).toBe(false);
    });
  });
});
