import { describe, it, expect, vi, beforeEach } from 'vitest';
import { soundEngine, SoundEngine, isValidSfxType, VALID_SFX_TYPES } from '../lib/soundEngine';
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

    // Test volume clamping to min 0.0 and silent state handling
    mockOscillator.start.mockClear();
    soundEngine.setVolume(-0.5);
    expect(soundEngine.getVolume()).toBe(0);
    soundEngine.playSfx('click');
    expect(mockOscillator.start).not.toHaveBeenCalled();
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

  describe('Silent states & exponential ramp safety', () => {
    it('returns early from playSfx when volume is 0 or negative', () => {
      soundEngine.setVolume(0);
      soundEngine.playSfx('correct');
      expect(mockOscillator.start).not.toHaveBeenCalled();
    });

    it('safely handles resume promise rejections on suspended context', async () => {
      const rejectingResume = vi.fn().mockRejectedValue(new Error('Autoplay policy'));
      mockAudioContext.resume = rejectingResume;
      soundEngine.setVolume(0.5);
      expect(() => soundEngine.playSfx('click')).not.toThrow();
    });

    it('clamps exponential ramp target values to >= 0.0001', () => {
      soundEngine.setVolume(0.5);
      soundEngine.playSfx('correct');
      const calls = mockGain.gain.exponentialRampToValueAtTime.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      for (const [targetVal] of calls) {
        expect(targetVal).toBeGreaterThanOrEqual(0.0001);
      }
    });

    it('falls back gracefully to linear ramp if exponential ramp throws', () => {
      mockGain.gain.exponentialRampToValueAtTime.mockImplementationOnce(() => {
        throw new Error('IndexSizeError: The float value provided must be greater than 0');
      });
      soundEngine.setVolume(0.5);
      expect(() => soundEngine.playSfx('correct')).not.toThrow();
      expect(mockGain.gain.linearRampToValueAtTime).toHaveBeenCalled();
    });

    it('does not start BGM when volume is 0', () => {
      soundEngine.setVolume(0);
      const started = soundEngine.toggleBgm(true);
      expect(started).toBe(false);
      expect(window.setInterval).not.toHaveBeenCalled();
    });
  });

  describe('isValidSfxType and playSfx type safety', () => {
    it('returns true for all valid SFX literals', () => {
      const validTypes = [
        'click',
        'correct',
        'error',
        'attack',
        'boss-hit',
        'level-up',
        'victory',
        'skill-unlock',
        'badge-inspect',
        'heal',
      ];
      for (const t of validTypes) {
        expect(isValidSfxType(t)).toBe(true);
      }
      expect(VALID_SFX_TYPES).toEqual(validTypes);
    });

    it('returns false for invalid strings, unknown literals, and non-string inputs', () => {
      expect(isValidSfxType('invalid-type')).toBe(false);
      expect(isValidSfxType('jump')).toBe(false);
      expect(isValidSfxType('')).toBe(false);
      expect(isValidSfxType('CLICK')).toBe(false);
      expect(isValidSfxType(null)).toBe(false);
      expect(isValidSfxType(undefined)).toBe(false);
      expect(isValidSfxType(123)).toBe(false);
      expect(isValidSfxType({})).toBe(false);
      expect(isValidSfxType([])).toBe(false);
      expect(isValidSfxType(true)).toBe(false);
    });

    it('safely handles unknown or nullish sfx types in playSfx without throwing', () => {
      mockOscillator.start.mockClear();
      expect(() => (soundEngine.playSfx as any)('invalid-sound')).not.toThrow();
      expect(mockOscillator.start).not.toHaveBeenCalled();

      expect(() => (soundEngine.playSfx as any)(null)).not.toThrow();
      expect(mockOscillator.start).not.toHaveBeenCalled();

      expect(() => (soundEngine.playSfx as any)(undefined)).not.toThrow();
      expect(mockOscillator.start).not.toHaveBeenCalled();

      expect(() => (soundEngine.playSfx as any)({})).not.toThrow();
      expect(mockOscillator.start).not.toHaveBeenCalled();
    });

    it('retains void return type on playSfx ensuring spy mock compatibility', () => {
      const spy = vi.spyOn(soundEngine, 'playSfx').mockImplementation(() => {});
      soundEngine.playSfx('click');
      expect(spy).toHaveBeenCalledWith('click');
      spy.mockRestore();
    });
  });

  describe('getIsBgmPlaying lifecycle', () => {
    let engine: SoundEngine;

    beforeEach(() => {
      engine = new SoundEngine();
      engine.setMuted(false);
      engine.setVolume(0.5);
    });

    it('returns false initially and tracks active playing state correctly', () => {
      expect(engine.getIsBgmPlaying()).toBe(false);
      expect(soundEngine.getIsBgmPlaying()).toBe(false);

      const playing = engine.toggleBgm(true);
      expect(playing).toBe(true);
      expect(engine.getIsBgmPlaying()).toBe(true);

      engine.toggleBgm(false);
      expect(engine.getIsBgmPlaying()).toBe(false);
    });

    it('returns false when muted even if previously started', () => {
      engine.toggleBgm(true);
      expect(engine.getIsBgmPlaying()).toBe(true);

      engine.setMuted(true);
      expect(engine.getIsBgmPlaying()).toBe(false);
    });

    it('returns false when volume drops to 0', () => {
      engine.toggleBgm(true);
      expect(engine.getIsBgmPlaying()).toBe(true);

      engine.setVolume(0);
      expect(engine.getIsBgmPlaying()).toBe(false);
    });

    it('returns false when disposed', () => {
      engine.toggleBgm(true);
      expect(engine.getIsBgmPlaying()).toBe(true);

      engine.dispose();
      expect(engine.getIsBgmPlaying()).toBe(false);
    });
  });

  describe('safeExponentialRamp endTime clamping', () => {
    let engine: SoundEngine;

    beforeEach(() => {
      engine = new SoundEngine();
      (engine as any).init();
    });

    it('clamps endTime in the past to strictly greater than currentTime', () => {
      mockAudioContext.currentTime = 5.0;

      (engine as any).safeExponentialRamp(mockGain.gain, 0.05, 3.0);
      expect(mockGain.gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(
        0.05,
        5.001
      );
    });

    it('clamps endTime equal to currentTime to strictly greater than currentTime', () => {
      mockAudioContext.currentTime = 10.0;

      (engine as any).safeExponentialRamp(mockGain.gain, 0.05, 10.0);
      expect(mockGain.gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(
        0.05,
        10.001
      );
    });

    it('clamps non-finite endTime (NaN, Infinity, -Infinity) to strictly greater than currentTime', () => {
      mockAudioContext.currentTime = 2.0;

      (engine as any).safeExponentialRamp(mockGain.gain, 0.05, NaN);
      expect(mockGain.gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(
        0.05,
        2.01
      );

      mockGain.gain.exponentialRampToValueAtTime.mockClear();
      (engine as any).safeExponentialRamp(mockGain.gain, 0.05, Infinity);
      expect(mockGain.gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(
        0.05,
        2.01
      );

      mockGain.gain.exponentialRampToValueAtTime.mockClear();
      (engine as any).safeExponentialRamp(mockGain.gain, 0.05, -Infinity);
      expect(mockGain.gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(
        0.05,
        2.01
      );
    });

    it('preserves valid future endTime', () => {
      mockAudioContext.currentTime = 1.0;

      (engine as any).safeExponentialRamp(mockGain.gain, 0.05, 1.5);
      expect(mockGain.gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(
        0.05,
        1.5
      );
    });

    it('passes clamped safeEndTime to linear fallback when exponential ramp throws', () => {
      mockGain.gain.exponentialRampToValueAtTime.mockImplementationOnce(() => {
        throw new Error('RangeError: The float value provided must be greater than 0');
      });
      mockAudioContext.currentTime = 4.0;

      (engine as any).safeExponentialRamp(mockGain.gain, 0.05, 2.0);
      expect(mockGain.gain.linearRampToValueAtTime).toHaveBeenCalledWith(
        0.05,
        4.001
      );
    });

    it('safely handles clamping when AudioContext is null', () => {
      const detachedEngine = new SoundEngine();
      expect(() => {
        (detachedEngine as any).safeExponentialRamp(mockGain.gain, 0.05, -5);
      }).not.toThrow();
      expect(mockGain.gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(
        0.05,
        0.001
      );
    });
  });
});
