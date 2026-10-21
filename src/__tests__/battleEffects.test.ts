import { describe, it, expect } from 'vitest';
import {
  calculateHpPercentage,
  calculateScreenShakeIntensity,
  calculateConfettiTriggers
} from '../lib/battleEffects';

describe('battleEffects', () => {
  describe('calculateHpPercentage', () => {
    it('should correctly calculate HP percentage for normal values', () => {
      expect(calculateHpPercentage(50, 100)).toBe(50);
      expect(calculateHpPercentage(25, 100)).toBe(25);
      expect(calculateHpPercentage(75, 150)).toBe(50);
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

    it('should return "sm" for small damage percentage (< 10%)', () => {
      expect(calculateScreenShakeIntensity(5, 100, false)).toBe('sm');
      expect(calculateScreenShakeIntensity(9, 100, false)).toBe('sm');
    });

    it('should return "md" for medium damage percentage (>= 10% and < 25%)', () => {
      expect(calculateScreenShakeIntensity(10, 100, false)).toBe('md');
      expect(calculateScreenShakeIntensity(24, 100, false)).toBe('md');
    });

    it('should return "lg" for large damage percentage (>= 25% and < 50%)', () => {
      expect(calculateScreenShakeIntensity(25, 100, false)).toBe('lg');
      expect(calculateScreenShakeIntensity(49, 100, false)).toBe('lg');
    });

    it('should return "xl" for huge damage percentage (>= 50%)', () => {
      expect(calculateScreenShakeIntensity(50, 100, false)).toBe('xl');
      expect(calculateScreenShakeIntensity(100, 100, false)).toBe('xl');
      expect(calculateScreenShakeIntensity(150, 100, false)).toBe('xl');
    });

    it('should return "lg" for critical hits even if damage percentage is small or medium', () => {
      expect(calculateScreenShakeIntensity(5, 100, true)).toBe('lg'); // normally sm
      expect(calculateScreenShakeIntensity(15, 100, true)).toBe('lg'); // normally md
    });

    it('should return "xl" for critical hits if damage percentage is huge (>= 50%)', () => {
       expect(calculateScreenShakeIntensity(60, 100, true)).toBe('xl');
    });
  });

  describe('calculateConfettiTriggers', () => {
    it('should return 0 if boss is not defeated', () => {
      expect(calculateConfettiTriggers(false, 0)).toBe(0);
      expect(calculateConfettiTriggers(false, 100)).toBe(0);
    });

    it('should return 1 trigger (base) if boss is defeated with 0 combo', () => {
      expect(calculateConfettiTriggers(true, 0)).toBe(1);
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
      expect(calculateConfettiTriggers(true, 20)).toBe(4);
    });
  });
});
