import { describe, it, expect } from "vitest";
import { calculateStreakBonus, updateStreak, StreakState } from "../lib/streakSystem";

describe("streakSystem", () => {
  describe("calculateStreakBonus", () => {
    it("should calculate bonus correctly", () => {
      expect(calculateStreakBonus(1)).toEqual({ multiplier: 1.0, bonusPercent: 0 });
      expect(calculateStreakBonus(2)).toEqual({ multiplier: 1.05, bonusPercent: 5 });
      expect(calculateStreakBonus(3)).toEqual({ multiplier: 1.10, bonusPercent: 10 });
      expect(calculateStreakBonus(5)).toEqual({ multiplier: 1.20, bonusPercent: 20 });
      expect(calculateStreakBonus(7)).toEqual({ multiplier: 1.30, bonusPercent: 30 });
      expect(calculateStreakBonus(14)).toEqual({ multiplier: 1.30, bonusPercent: 30 });
    });
  });

  describe("updateStreak", () => {
    it("should initialize streak on first login", () => {
      const currentStreak: StreakState = { streakDays: 0, lastLoginDate: null };
      const { streak, streakReset } = updateStreak(currentStreak, "2023-10-01");
      expect(streak).toEqual({ streakDays: 1, lastLoginDate: "2023-10-01" });
      expect(streakReset).toBe(false);
    });

    it("should not change streak if logging in on the same day", () => {
      const currentStreak: StreakState = { streakDays: 3, lastLoginDate: "2023-10-01" };
      const { streak, streakReset } = updateStreak(currentStreak, "2023-10-01");
      expect(streak).toEqual({ streakDays: 3, lastLoginDate: "2023-10-01" });
      expect(streakReset).toBe(false);
    });

    it("should increment streak if logging in on the consecutive day", () => {
      const currentStreak: StreakState = { streakDays: 3, lastLoginDate: "2023-10-01" };
      const { streak, streakReset } = updateStreak(currentStreak, "2023-10-02");
      expect(streak).toEqual({ streakDays: 4, lastLoginDate: "2023-10-02" });
      expect(streakReset).toBe(false);
    });

    it("should reset streak if logging in after missing a day", () => {
      const currentStreak: StreakState = { streakDays: 3, lastLoginDate: "2023-10-01" };
      const { streak, streakReset } = updateStreak(currentStreak, "2023-10-03");
      expect(streak).toEqual({ streakDays: 1, lastLoginDate: "2023-10-03" });
      expect(streakReset).toBe(true);
    });
    
    it("should correctly handle month boundaries", () => {
      const currentStreak: StreakState = { streakDays: 3, lastLoginDate: "2023-09-30" };
      const { streak, streakReset } = updateStreak(currentStreak, "2023-10-01");
      expect(streak).toEqual({ streakDays: 4, lastLoginDate: "2023-10-01" });
      expect(streakReset).toBe(false);
    });

    it("should correctly handle leap years", () => {
      const currentStreak: StreakState = { streakDays: 3, lastLoginDate: "2024-02-28" };
      const { streak, streakReset } = updateStreak(currentStreak, "2024-02-29");
      expect(streak).toEqual({ streakDays: 4, lastLoginDate: "2024-02-29" });
      expect(streakReset).toBe(false);
    });
    
    it("should gracefully handle past dates without resetting", () => {
      const currentStreak: StreakState = { streakDays: 3, lastLoginDate: "2023-10-02" };
      const { streak, streakReset } = updateStreak(currentStreak, "2023-10-01");
      expect(streak).toEqual({ streakDays: 3, lastLoginDate: "2023-10-02" });
      expect(streakReset).toBe(false);
    });
  });
});
