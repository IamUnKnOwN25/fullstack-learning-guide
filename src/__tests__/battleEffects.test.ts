import { describe, it, expect } from 'vitest';
import {
  calculateHpPercentage,
  calculateScreenShakeIntensity,
  calculateConfettiTriggers,
  calculateComboMultiplier,
  generateParticleVectors,
  sanitizeParticleCount,
  sanitizeScreenShakeDamage,
} from '../lib/battleEffects';

describe('battleEffects', () => {
  describe('calculateHpPercentage', () => {
    it('should correctly calculate HP percentage for normal values', () => {
      expect(calculateHpPercentage(50, 100)).toBe(50);
      expect(calculateHpPercentage(25, 100)).toBe(25);
      expect(calculateHpPercentage(75, 150)).toBe(50);
    });

    it('handles floating point values with high precision', () => {
      expect(calculateHpPercentage(33.33, 100)).toBeCloseTo(33.33);
      expect(calculateHpPercentage(1, 3)).toBeCloseTo(33.333, 2);
    });

    it('should clamp HP percentage to 100 if currentHp > maxHp', () => {
      expect(calculateHpPercentage(150, 100)).toBe(100);
      expect(calculateHpPercentage(200, 100)).toBe(100);
    });

    it('should return 0 if currentHp is negative', () => {
      expect(calculateHpPercentage(-10, 100)).toBe(0);
      expect(calculateHpPercentage(-50, 100)).toBe(0);
    });

    it('should return 0 if currentHp is 0', () => {
      expect(calculateHpPercentage(0, 100)).toBe(0);
    });

    it('should return 0 if maxHp is 0 or negative', () => {
      expect(calculateHpPercentage(50, 0)).toBe(0);
      expect(calculateHpPercentage(50, -100)).toBe(0);
    });

    it('should return 0 if currentHp is NaN, Infinity, or -Infinity', () => {
      expect(calculateHpPercentage(NaN, 100)).toBe(0);
      expect(calculateHpPercentage(Infinity, 100)).toBe(0);
      expect(calculateHpPercentage(-Infinity, 100)).toBe(0);
    });

    it('should return 0 if maxHp is NaN, Infinity, or -Infinity', () => {
      expect(calculateHpPercentage(50, NaN)).toBe(0);
      expect(calculateHpPercentage(50, Infinity)).toBe(0);
      expect(calculateHpPercentage(50, -Infinity)).toBe(0);
    });

    it('should return 0 if both arguments are NaN or non-finite', () => {
      expect(calculateHpPercentage(NaN, NaN)).toBe(0);
      expect(calculateHpPercentage(Infinity, Infinity)).toBe(0);
      expect(calculateHpPercentage(-Infinity, -Infinity)).toBe(0);
    });
  });

  describe('calculateScreenShakeIntensity', () => {
    it('should return "none" if damage is 0 or negative', () => {
      expect(calculateScreenShakeIntensity(0, 100, false)).toBe('none');
      expect(calculateScreenShakeIntensity(-10, 100, false)).toBe('none');
    });

    it('should return "none" if maxHp is 0 or negative', () => {
      expect(calculateScreenShakeIntensity(10, 0, false)).toBe('none');
      expect(calculateScreenShakeIntensity(10, -100, false)).toBe('none');
    });

    it('should return "none" if damage is NaN, Infinity, or -Infinity', () => {
      expect(calculateScreenShakeIntensity(NaN, 100, false)).toBe('none');
      expect(calculateScreenShakeIntensity(Infinity, 100, false)).toBe('none');
      expect(calculateScreenShakeIntensity(-Infinity, 100, false)).toBe('none');
    });

    it('should return "none" if maxHp is NaN, Infinity, or -Infinity', () => {
      expect(calculateScreenShakeIntensity(10, NaN, false)).toBe('none');
      expect(calculateScreenShakeIntensity(10, Infinity, false)).toBe('none');
      expect(calculateScreenShakeIntensity(10, -Infinity, false)).toBe('none');
    });

    it('should return "sm" for small damage percentage (< 10%)', () => {
      expect(calculateScreenShakeIntensity(5, 100, false)).toBe('sm');
      expect(calculateScreenShakeIntensity(9.99, 100, false)).toBe('sm');
    });

    it('should return "md" for medium damage percentage (>= 10% and < 25%)', () => {
      expect(calculateScreenShakeIntensity(10, 100, false)).toBe('md');
      expect(calculateScreenShakeIntensity(24.99, 100, false)).toBe('md');
    });

    it('should return "lg" for large damage percentage (>= 25% and < 50%)', () => {
      expect(calculateScreenShakeIntensity(25, 100, false)).toBe('lg');
      expect(calculateScreenShakeIntensity(49.99, 100, false)).toBe('lg');
    });

    it('should return "xl" for huge damage percentage (>= 50%)', () => {
      expect(calculateScreenShakeIntensity(50, 100, false)).toBe('xl');
      expect(calculateScreenShakeIntensity(100, 100, false)).toBe('xl');
      expect(calculateScreenShakeIntensity(150, 100, false)).toBe('xl');
    });

    it('should return "lg" for critical hits with low damage percentage', () => {
      expect(calculateScreenShakeIntensity(5, 100, true)).toBe('lg');
      expect(calculateScreenShakeIntensity(1, 100, true)).toBe('lg');
    });

    it('should return "xl" for critical hits with >= 50% damage percentage', () => {
      expect(calculateScreenShakeIntensity(50, 100, true)).toBe('xl');
      expect(calculateScreenShakeIntensity(60, 100, true)).toBe('xl');
    });

    it('supports 1-argument call clamping damage >= 0 up to max 10', () => {
      expect(calculateScreenShakeIntensity(0)).toBe('none');
      expect(calculateScreenShakeIntensity(-5)).toBe('none');
      expect(calculateScreenShakeIntensity(NaN)).toBe('none');
      expect(calculateScreenShakeIntensity(Infinity)).toBe('none');
      expect(calculateScreenShakeIntensity(-Infinity)).toBe('none');

      expect(calculateScreenShakeIntensity(0.5)).toBe('sm');
      expect(calculateScreenShakeIntensity(1)).toBe('md');
      expect(calculateScreenShakeIntensity(2)).toBe('md');
      expect(calculateScreenShakeIntensity(3)).toBe('lg');
      expect(calculateScreenShakeIntensity(5)).toBe('xl');
      expect(calculateScreenShakeIntensity(10)).toBe('xl');
      expect(calculateScreenShakeIntensity(25)).toBe('xl'); // clamped to max 10
    });

    it('supports options object signature', () => {
      expect(calculateScreenShakeIntensity({ damage: 50, maxHp: 100, isCritical: false })).toBe('xl');
      expect(calculateScreenShakeIntensity({ damage: 5, maxHp: 100, isCritical: true })).toBe('lg');
      expect(calculateScreenShakeIntensity({ damage: NaN, maxHp: 100 })).toBe('none');
      expect(calculateScreenShakeIntensity({ damage: 10, maxHp: NaN })).toBe('none');
      expect(calculateScreenShakeIntensity({ damage: 8 })).toBe('xl');
    });
  });

  describe('calculateConfettiTriggers', () => {
    it('should return 0 if boss is not defeated', () => {
      expect(calculateConfettiTriggers(false, 0)).toBe(0);
      expect(calculateConfettiTriggers(false, 100)).toBe(0);
      expect(calculateConfettiTriggers(false, -5)).toBe(0);
      expect(calculateConfettiTriggers(false, NaN)).toBe(0);
      expect(calculateConfettiTriggers(false, Infinity)).toBe(0);
    });

    it('should return 1 trigger (base) if boss is defeated with 0, negative, or non-finite combo', () => {
      expect(calculateConfettiTriggers(true, 0)).toBe(1);
      expect(calculateConfettiTriggers(true, -3)).toBe(1);
      expect(calculateConfettiTriggers(true, NaN)).toBe(1);
      expect(calculateConfettiTriggers(true, Infinity)).toBe(1);
      expect(calculateConfettiTriggers(true, -Infinity)).toBe(1);
    });

    it('should return 2 triggers if boss is defeated with combo > 0 and <= 5', () => {
      expect(calculateConfettiTriggers(true, 1)).toBe(2);
      expect(calculateConfettiTriggers(true, 5)).toBe(2);
    });

    it('should return 3 triggers if boss is defeated with combo > 5 and <= 10', () => {
      expect(calculateConfettiTriggers(true, 6)).toBe(3);
      expect(calculateConfettiTriggers(true, 10)).toBe(3);
    });

    it('should return 4 triggers if boss is defeated with combo > 10', () => {
      expect(calculateConfettiTriggers(true, 11)).toBe(4);
      expect(calculateConfettiTriggers(true, 100)).toBe(4);
      expect(calculateConfettiTriggers(true, 9999)).toBe(4);
    });

    it('sanitizes floating-point combo values down to integers', () => {
      expect(calculateConfettiTriggers(true, 5.9)).toBe(2);
      expect(calculateConfettiTriggers(true, 10.9)).toBe(3);
    });

    it('supports ConfettiEvent object and sanitizes particle counts to positive integers', () => {
      expect(calculateConfettiTriggers({ isBossDefeated: false, particleCount: 50 })).toBe(0);
      expect(calculateConfettiTriggers({ isBossDefeated: true, particleCount: 0 })).toBe(1);
      expect(calculateConfettiTriggers({ isBossDefeated: true, particleCount: -10 })).toBe(1);
      expect(calculateConfettiTriggers({ isBossDefeated: true, particleCount: NaN })).toBe(1);
      expect(calculateConfettiTriggers({ isBossDefeated: true, particleCount: Infinity })).toBe(1);

      expect(calculateConfettiTriggers({ isBossDefeated: true, particleCount: 3 })).toBe(2);
      expect(calculateConfettiTriggers({ isBossDefeated: true, particleCount: 8 })).toBe(3);
      expect(calculateConfettiTriggers({ isBossDefeated: true, particleCount: 20 })).toBe(4);
      expect(calculateConfettiTriggers({ isBossDefeated: true, particleCount: 5.8 })).toBe(2);

      // supports comboCount property in event
      expect(calculateConfettiTriggers({ isBossDefeated: true, comboCount: 15 })).toBe(4);
    });
  });

  describe('sanitizeParticleCount', () => {
    it('returns 0 for non-positive or non-finite counts', () => {
      expect(sanitizeParticleCount(0)).toBe(0);
      expect(sanitizeParticleCount(-10)).toBe(0);
      expect(sanitizeParticleCount(NaN)).toBe(0);
      expect(sanitizeParticleCount(Infinity)).toBe(0);
      expect(sanitizeParticleCount(-Infinity)).toBe(0);
    });

    it('returns positive floored integers for valid numbers', () => {
      expect(sanitizeParticleCount(1)).toBe(1);
      expect(sanitizeParticleCount(15)).toBe(15);
      expect(sanitizeParticleCount(23.7)).toBe(23);
    });
  });

  describe('sanitizeScreenShakeDamage', () => {
    it('returns 0 for non-positive or non-finite damage', () => {
      expect(sanitizeScreenShakeDamage(0)).toBe(0);
      expect(sanitizeScreenShakeDamage(-10)).toBe(0);
      expect(sanitizeScreenShakeDamage(NaN)).toBe(0);
      expect(sanitizeScreenShakeDamage(Infinity)).toBe(0);
      expect(sanitizeScreenShakeDamage(-Infinity)).toBe(0);
    });

    it('clamps damage to [0, 10]', () => {
      expect(sanitizeScreenShakeDamage(4.5)).toBe(4.5);
      expect(sanitizeScreenShakeDamage(10)).toBe(10);
      expect(sanitizeScreenShakeDamage(25)).toBe(10);
      expect(sanitizeScreenShakeDamage(999)).toBe(10);
    });
  });

  describe('calculateComboMultiplier', () => {
    it('returns 1.0 for 0, negative, NaN or non-finite inputs', () => {
      expect(calculateComboMultiplier(0)).toBe(1.0);
      expect(calculateComboMultiplier(-5)).toBe(1.0);
      expect(calculateComboMultiplier(NaN)).toBe(1.0);
      expect(calculateComboMultiplier(Infinity)).toBe(1.0);
    });

    it('scales linearly by 0.1 per combo step', () => {
      expect(calculateComboMultiplier(1)).toBe(1.1);
      expect(calculateComboMultiplier(5)).toBe(1.5);
      expect(calculateComboMultiplier(10)).toBe(2.0);
    });

    it('caps combo scaling at 3.0x for 20+ combos', () => {
      expect(calculateComboMultiplier(20)).toBe(3.0);
      expect(calculateComboMultiplier(50)).toBe(3.0);
      expect(calculateComboMultiplier(999)).toBe(3.0);
    });

    it('truncates fractional combos without crashing', () => {
      expect(calculateComboMultiplier(3.7)).toBe(1.3);
    });
  });

  describe('generateParticleVectors', () => {
    it('returns empty array when count is 0 or negative or non-finite', () => {
      expect(generateParticleVectors(0, 100, 100)).toEqual([]);
      expect(generateParticleVectors(-10, 100, 100)).toEqual([]);
      expect(generateParticleVectors(NaN, 100, 100)).toEqual([]);
      expect(generateParticleVectors(Infinity, 100, 100)).toEqual([]);
    });

    it('handles non-finite origin coordinates safely', () => {
      const p = generateParticleVectors(5, NaN, Infinity);
      expect(p.length).toBe(5);
      expect(p[0].x).toBe(0);
      expect(p[0].y).toBe(0);
    });

    it('generates specified number of particle vectors clamped to 50 max', () => {
      const p10 = generateParticleVectors(10, 50, 50, 'cyber');
      expect(p10.length).toBe(10);
      expect(p10[0].x).toBe(50);
      expect(p10[0].y).toBe(50);
      expect(p10[0].opacity).toBe(1.0);

      const p100 = generateParticleVectors(100, 0, 0, 'gold');
      expect(p100.length).toBe(50);
    });

    it('applies selected color scheme palette correctly', () => {
      const cyber = generateParticleVectors(3, 0, 0, 'cyber');
      expect(cyber[0].color).toBe('#00FF66');

      const gold = generateParticleVectors(3, 0, 0, 'gold');
      expect(gold[0].color).toBe('#FFD700');

      const neon = generateParticleVectors(3, 0, 0, 'neon');
      expect(neon[0].color).toBe('#FF007F');
    });
  });
});
