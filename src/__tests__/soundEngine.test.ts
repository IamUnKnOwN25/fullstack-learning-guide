import { describe, it, expect, vi, beforeEach } from 'vitest';
import { soundEngine } from '../lib/soundEngine';

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

    // Reset singleton state if possible, though since it's a singleton we can test it directly
    // Let's set it to unmuted and reset volume just in case.
    soundEngine.setMuted(false);
    soundEngine.setVolume(0.3);
  });

  it('initializes AudioContext on playSfx and resumes if suspended', () => {
    soundEngine.playSfx('click');
    expect(window.AudioContext).toHaveBeenCalled();
    expect(mockAudioContext.resume).toHaveBeenCalled();
  });

  it('respects volume settings', () => {
    soundEngine.setVolume(0.5);
    soundEngine.playSfx('click');
    expect(mockGain.gain.setValueAtTime).toHaveBeenCalledWith(0.5 * 0.4, 0); // volume * 0.4 for click
  });

  it('respects muted state', () => {
    soundEngine.setMuted(true);
    soundEngine.playSfx('click');
    // If it was already initialized, it might just return early.
    // Let's make sure start isn't called after mute.
    expect(mockOscillator.start).not.toHaveBeenCalled();
  });

  describe('playSfx', () => {
    it('plays click sound with sine wave', () => {
      soundEngine.playSfx('click');
      expect(mockOscillator.type).toBe('sine');
      expect(mockOscillator.start).toHaveBeenCalled();
    });

    it('plays correct sound with triangle wave', () => {
      soundEngine.playSfx('correct');
      expect(mockOscillator.type).toBe('triangle');
      expect(mockOscillator.start).toHaveBeenCalled();
    });

    it('plays error sound with sawtooth wave', () => {
      soundEngine.playSfx('error');
      expect(mockOscillator.type).toBe('sawtooth');
      expect(mockOscillator.start).toHaveBeenCalled();
    });

    it('plays attack sound with square wave', () => {
      soundEngine.playSfx('attack');
      expect(mockOscillator.type).toBe('square');
      expect(mockOscillator.start).toHaveBeenCalled();
    });
  });

  describe('BGM controls', () => {
    it('toggles BGM correctly', () => {
      // Toggle on
      const isPlayingOn = soundEngine.toggleBgm();
      expect(isPlayingOn).toBe(true);
      expect(window.setInterval).toHaveBeenCalled();

      // Toggle off
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

      // Should not start BGM if muted
      const playAttempt = soundEngine.toggleBgm(true);
      expect(playAttempt).toBe(false);
    });
  });
});
