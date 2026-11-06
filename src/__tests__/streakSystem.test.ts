import { describe, it, expect } from "vitest";
import {
  calculateStreakBonus,
  updateStreak,
  updateStreakWithFreeze,
  getStreakMilestone,
  getNextStreakMilestone,
  isStreakAtRisk,
  getStreakSummary,
  StreakState,
  STREAK_MILESTONES,
} from "../lib/streakSystem";

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

    it("should handle 0, negative, or invalid streak days safely", () => {
      expect(calculateStreakBonus(0)).toEqual({ multiplier: 1.0, bonusPercent: 0 });
      expect(calculateStreakBonus(-10)).toEqual({ multiplier: 1.0, bonusPercent: 0 });
      expect(calculateStreakBonus(NaN)).toEqual({ multiplier: 1.0, bonusPercent: 0 });
      expect(calculateStreakBonus(null as unknown as number)).toEqual({ multiplier: 1.0, bonusPercent: 0 });
    });

    it("should cap bonus at 30% for ultra-long streaks", () => {
      expect(calculateStreakBonus(30)).toEqual({ multiplier: 1.30, bonusPercent: 30 });
      expect(calculateStreakBonus(100)).toEqual({ multiplier: 1.30, bonusPercent: 30 });
      expect(calculateStreakBonus(365)).toEqual({ multiplier: 1.30, bonusPercent: 30 });
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

    it("should correctly handle non-leap year February transition", () => {
      const currentStreak: StreakState = { streakDays: 5, lastLoginDate: "2023-02-28" };
      const { streak, streakReset } = updateStreak(currentStreak, "2023-03-01");
      expect(streak).toEqual({ streakDays: 6, lastLoginDate: "2023-03-01" });
      expect(streakReset).toBe(false);
    });

    it("should correctly handle year end boundaries", () => {
      const currentStreak: StreakState = { streakDays: 10, lastLoginDate: "2023-12-31" };
      const { streak, streakReset } = updateStreak(currentStreak, "2024-01-01");
      expect(streak).toEqual({ streakDays: 11, lastLoginDate: "2024-01-01" });
      expect(streakReset).toBe(false);
    });

    it("should reset streak on invalid or malformed date strings", () => {
      const currentStreak: StreakState = { streakDays: 5, lastLoginDate: "invalid-date" };
      const { streak, streakReset } = updateStreak(currentStreak, "2024-01-01");
      expect(streak).toEqual({ streakDays: 1, lastLoginDate: "2024-01-01" });
      expect(streakReset).toBe(true);

      const validStreak: StreakState = { streakDays: 5, lastLoginDate: "2024-01-01" };
      const res = updateStreak(validStreak, "malformed");
      expect(res.streak).toEqual({ streakDays: 1, lastLoginDate: "malformed" });
      expect(res.streakReset).toBe(true);
    });

    it("should reset streak on 3-part malformed date strings like 'abc-def-ghi'", () => {
      const currentStreak: StreakState = { streakDays: 5, lastLoginDate: "abc-def-ghi" };
      const { streak, streakReset } = updateStreak(currentStreak, "2024-01-01");
      expect(streak).toEqual({ streakDays: 1, lastLoginDate: "2024-01-01" });
      expect(streakReset).toBe(true);
    });

    it("should reject calendar rollover dates like non-leap Feb 29, Feb 30, and Apr 31", () => {
      const currentStreak: StreakState = { streakDays: 5, lastLoginDate: "2023-02-28" };

      // Non-leap Feb 29 (2023 is not a leap year)
      const resNonLeapFeb29 = updateStreak(currentStreak, "2023-02-29");
      expect(resNonLeapFeb29.streakReset).toBe(true);
      expect(resNonLeapFeb29.streak.streakDays).toBe(1);

      // Feb 30 does not exist
      const resFeb30 = updateStreak({ streakDays: 5, lastLoginDate: "2024-02-29" }, "2024-02-30");
      expect(resFeb30.streakReset).toBe(true);
      expect(resFeb30.streak.streakDays).toBe(1);

      // Apr 31 does not exist (April has 30 days)
      const resApr31 = updateStreak({ streakDays: 5, lastLoginDate: "2023-04-30" }, "2023-04-31");
      expect(resApr31.streakReset).toBe(true);
      expect(resApr31.streak.streakDays).toBe(1);

      // When invalid date is used as lastLoginDate
      const resInvalidLast = updateStreak({ streakDays: 5, lastLoginDate: "2023-02-29" }, "2023-03-01");
      expect(resInvalidLast.streakReset).toBe(true);
      expect(resInvalidLast.streak.streakDays).toBe(1);

      // Calendar rollovers in isStreakAtRisk should return false
      expect(isStreakAtRisk("2023-02-29", "2023-03-01")).toBe(false);
      expect(isStreakAtRisk("2023-04-30", "2023-04-31")).toBe(false);
      expect(isStreakAtRisk("2024-02-30", "2024-03-01")).toBe(false);
    });

    it("should sanitize non-finite or corrupted streak days", () => {
      const corruptedStreak: StreakState = { streakDays: NaN, lastLoginDate: "2024-01-01" };
      const resSameDay = updateStreak(corruptedStreak, "2024-01-01");
      expect(resSameDay.streak.streakDays).toBe(1);

      const resNextDay = updateStreak({ streakDays: -5, lastLoginDate: "2024-01-01" }, "2024-01-02");
      expect(resNextDay.streak.streakDays).toBe(2);
    });
    
    it("should gracefully handle past dates without resetting", () => {
      const currentStreak: StreakState = { streakDays: 3, lastLoginDate: "2023-10-02" };
      const { streak, streakReset } = updateStreak(currentStreak, "2023-10-01");
      expect(streak).toEqual({ streakDays: 3, lastLoginDate: "2023-10-02" });
      expect(streakReset).toBe(false);
    });
  });

  describe("Streak Milestones & At-Risk Status", () => {
    it("returns correct streak milestones across progression tiers", () => {
      expect(getStreakMilestone(1).title).toBe("Initiate");
      expect(getStreakMilestone(3).title).toBe("Consistent Hacker");
      expect(getStreakMilestone(5).title).toBe("Consistent Hacker");
      expect(getStreakMilestone(7).title).toBe("Weekly Sentinel");
      expect(getStreakMilestone(14).title).toBe("Fortnight Champion");
      expect(getStreakMilestone(30).title).toBe("Monthly Grandmaster");
      expect(getStreakMilestone(150).title).toBe("Century Legend");
      expect(getStreakMilestone(NaN).title).toBe("Initiate");
    });

    it("returns next streak milestone and days remaining across progression tiers", () => {
      // Tier 1 (1 day): Next is Consistent Hacker (3 days)
      const next1 = getNextStreakMilestone(1);
      expect(next1).toEqual({
        milestone: STREAK_MILESTONES[1],
        daysRemaining: 2,
      });

      // Mid-tier 1->2 (2 days): Next is Consistent Hacker (3 days)
      const next2 = getNextStreakMilestone(2);
      expect(next2?.milestone.title).toBe("Consistent Hacker");
      expect(next2?.daysRemaining).toBe(1);

      // Tier 2 (3 days): Next is Weekly Sentinel (7 days)
      const next3 = getNextStreakMilestone(3);
      expect(next3).toEqual({
        milestone: STREAK_MILESTONES[2],
        daysRemaining: 4,
      });

      // Mid-tier 2->3 (5 days): Next is Weekly Sentinel (7 days)
      const next5 = getNextStreakMilestone(5);
      expect(next5?.milestone.title).toBe("Weekly Sentinel");
      expect(next5?.daysRemaining).toBe(2);

      // Tier 3 (7 days): Next is Fortnight Champion (14 days)
      const next7 = getNextStreakMilestone(7);
      expect(next7).toEqual({
        milestone: STREAK_MILESTONES[3],
        daysRemaining: 7,
      });

      // Mid-tier 3->4 (10 days): Next is Fortnight Champion (14 days)
      const next10 = getNextStreakMilestone(10);
      expect(next10?.milestone.title).toBe("Fortnight Champion");
      expect(next10?.daysRemaining).toBe(4);

      // Tier 4 (14 days): Next is Monthly Grandmaster (30 days)
      const next14 = getNextStreakMilestone(14);
      expect(next14).toEqual({
        milestone: STREAK_MILESTONES[4],
        daysRemaining: 16,
      });

      // Mid-tier 4->5 (20 days): Next is Monthly Grandmaster (30 days)
      const next20 = getNextStreakMilestone(20);
      expect(next20?.milestone.title).toBe("Monthly Grandmaster");
      expect(next20?.daysRemaining).toBe(10);

      // Tier 5 (30 days): Next is Century Legend (100 days)
      const next30 = getNextStreakMilestone(30);
      expect(next30).toEqual({
        milestone: STREAK_MILESTONES[5],
        daysRemaining: 70,
      });

      // Near max (99 days): Next is Century Legend (100 days)
      const next99 = getNextStreakMilestone(99);
      expect(next99).toEqual({
        milestone: STREAK_MILESTONES[5],
        daysRemaining: 1,
      });

      // Max tier and beyond (>= 100 days): returns null
      expect(getNextStreakMilestone(100)).toBeNull();
      expect(getNextStreakMilestone(150)).toBeNull();
      expect(getNextStreakMilestone(Infinity)).toBeNull();
    });

    it("sanitizes non-finite or non-positive streak days safely in getNextStreakMilestone", () => {
      // Non-positive (0 or negative) and non-finite fall back safely to 1-day baseline
      expect(getNextStreakMilestone(0)).toEqual({
        milestone: STREAK_MILESTONES[1],
        daysRemaining: 2,
      });
      expect(getNextStreakMilestone(-5)).toEqual({
        milestone: STREAK_MILESTONES[1],
        daysRemaining: 2,
      });
      expect(getNextStreakMilestone(NaN)).toEqual({
        milestone: STREAK_MILESTONES[1],
        daysRemaining: 2,
      });
      expect(getNextStreakMilestone(null as unknown as number)).toEqual({
        milestone: STREAK_MILESTONES[1],
        daysRemaining: 2,
      });
    });

    it("evaluates whether a streak is at risk of breaking", () => {
      // 1 day apart -> at risk
      expect(isStreakAtRisk("2024-03-01", "2024-03-02")).toBe(true);
      // Same day -> not at risk
      expect(isStreakAtRisk("2024-03-01", "2024-03-01")).toBe(false);
      // 2+ days apart -> already broken, not at risk
      expect(isStreakAtRisk("2024-03-01", "2024-03-03")).toBe(false);
      // Missing or malformed
      expect(isStreakAtRisk(null, "2024-03-02")).toBe(false);
      expect(isStreakAtRisk("invalid", "2024-03-02")).toBe(false);
      expect(isStreakAtRisk("abc-def-ghi", "2024-03-02")).toBe(false);
    });
  });

  describe("Streak Freeze Protection & Summary Suite", () => {
    it("preserves streak and consumes freeze when exactly one day is missed", () => {
      const currentStreak: StreakState = { streakDays: 7, lastLoginDate: "2024-03-01" };
      // Missed 2024-03-02, logs in on 2024-03-03 (diffDays = 2, missedDays = 1)
      const res = updateStreakWithFreeze(currentStreak, "2024-03-03", 2);

      expect(res.streakReset).toBe(false);
      expect(res.freezeConsumed).toBe(true);
      expect(res.freezesRemaining).toBe(1);
      expect(res.streak.streakDays).toBe(8);
      expect(res.streak.lastLoginDate).toBe("2024-03-03");
    });

    it("resets streak when days are missed but player has 0 freezes", () => {
      const currentStreak: StreakState = { streakDays: 7, lastLoginDate: "2024-03-01" };
      const res = updateStreakWithFreeze(currentStreak, "2024-03-03", 0);

      expect(res.streakReset).toBe(true);
      expect(res.freezeConsumed).toBe(false);
      expect(res.freezesRemaining).toBe(0);
      expect(res.streak.streakDays).toBe(1);
    });

    it("handles multiple missed days consuming matching freezes", () => {
      const currentStreak: StreakState = { streakDays: 12, lastLoginDate: "2024-03-01" };
      // Logs in 3 days later (diffDays = 3, missedDays = 2)
      const res = updateStreakWithFreeze(currentStreak, "2024-03-04", 3);

      expect(res.streakReset).toBe(false);
      expect(res.freezeConsumed).toBe(true);
      expect(res.freezesRemaining).toBe(1); // 3 - 2 = 1
      expect(res.streak.streakDays).toBe(13);
    });

    it("resets streak when missed days exceed available freezes", () => {
      const currentStreak: StreakState = { streakDays: 12, lastLoginDate: "2024-03-01" };
      // Missed 3 days, only 1 freeze available
      const res = updateStreakWithFreeze(currentStreak, "2024-03-05", 1);

      expect(res.streakReset).toBe(true);
      expect(res.freezeConsumed).toBe(false);
      expect(res.freezesRemaining).toBe(1);
      expect(res.streak.streakDays).toBe(1);
    });

    it("sanitizes invalid or negative freezes gracefully", () => {
      const currentStreak: StreakState = { streakDays: 4, lastLoginDate: "2024-03-01" };
      const res = updateStreakWithFreeze(currentStreak, "2024-03-03", -5);
      expect(res.freezesRemaining).toBe(0);
      expect(res.streakReset).toBe(true);

      const resNaN = updateStreakWithFreeze(currentStreak, "2024-03-03", NaN);
      expect(resNaN.freezesRemaining).toBe(0);
      expect(resNaN.streakReset).toBe(true);
    });

    it("resets streak when date strings are malformed in freeze protection", () => {
      const currentStreak: StreakState = { streakDays: 7, lastLoginDate: "invalid-date-part" };
      const res = updateStreakWithFreeze(currentStreak, "2024-03-03", 2);
      expect(res.streakReset).toBe(true);
      expect(res.streak.streakDays).toBe(1);
      expect(res.freezeConsumed).toBe(false);

      const res2 = updateStreakWithFreeze({ streakDays: 7, lastLoginDate: "2024-03-01" }, "bad-today-date", 2);
      expect(res2.streakReset).toBe(true);
      expect(res2.streak.streakDays).toBe(1);
    });

    it("generates comprehensive streak summary object", () => {
      const summary = getStreakSummary(7, "2024-03-01", "2024-03-02", 2);
      expect(summary.streakDays).toBe(7);
      expect(summary.multiplier).toBe(1.30);
      expect(summary.bonusPercent).toBe(30);
      expect(summary.milestone.title).toBe("Weekly Sentinel");
      expect(summary.nextMilestone?.milestone.title).toBe("Fortnight Champion");
      expect(summary.nextMilestone?.daysRemaining).toBe(7);
      expect(summary.isAtRisk).toBe(true);
      expect(summary.freezesAvailable).toBe(2);

      const maxSummary = getStreakSummary(100, "2024-03-01", "2024-03-02", 2);
      expect(maxSummary.nextMilestone).toBeNull();
    });
  });
});
