import { describe, it, expect } from "vitest";
import {
  paginateLeaderboard,
  filterLeaderboardByTier,
  calculatePercentile,
  calculateTopPercentage,
  sortLeaderboardEntries,
  getDivisionByPercentile,
} from "../lib/leaderboardUtils";
import { LeaderboardEntry } from "../data/leaderboard";

describe("leaderboardUtils", () => {
  const mockEntries: LeaderboardEntry[] = [
    {
      id: "1",
      rank: 1,
      username: "user1",
      displayName: "User One",
      avatarEmoji: "😀",
      avatarBg: "bg-red",
      avatarBorder: "border-red",
      title: "Full-Stack Grandmaster",
      level: 50,
      xp: 50000,
      stars: 50,
      bossesSlain: 10,
      curriculumCompleted: 100,
      countryCode: "US",
      badge: "Badge1",
    },
    {
      id: "2",
      rank: 2,
      username: "user2",
      displayName: "User Two",
      avatarEmoji: "😀",
      avatarBg: "bg-blue",
      avatarBorder: "border-blue",
      title: "Type Warden",
      level: 15,
      xp: 15000,
      stars: 15,
      bossesSlain: 5,
      curriculumCompleted: 50,
      countryCode: "UK",
      badge: "Badge2",
    },
    {
      id: "3",
      rank: 3,
      username: "user3",
      displayName: "User Three",
      avatarEmoji: "😀",
      avatarBg: "bg-green",
      avatarBorder: "border-green",
      title: "Type Warden",
      level: 16,
      xp: 16000,
      stars: 16,
      bossesSlain: 6,
      curriculumCompleted: 55,
      countryCode: "CA",
      badge: "Badge3",
    },
    {
      id: "4",
      rank: 4,
      username: "user4",
      displayName: "User Four",
      avatarEmoji: "😀",
      avatarBg: "bg-yellow",
      avatarBorder: "border-yellow",
      title: "Novice Byte",
      level: 1,
      xp: 100,
      stars: 1,
      bossesSlain: 0,
      curriculumCompleted: 1,
      countryCode: "AU",
      badge: "Badge4",
    },
  ];

  describe("paginateLeaderboard", () => {
    it("should return the correct slice for page 1", () => {
      const result = paginateLeaderboard(mockEntries, 1, 2);
      expect(result.length).toBe(2);
      expect(result[0].id).toBe("1");
      expect(result[1].id).toBe("2");
    });

    it("should return the correct slice for page 2", () => {
      const result = paginateLeaderboard(mockEntries, 2, 2);
      expect(result.length).toBe(2);
      expect(result[0].id).toBe("3");
      expect(result[1].id).toBe("4");
    });

    it("should handle out of bounds pages gracefully", () => {
      const result = paginateLeaderboard(mockEntries, 3, 2);
      expect(result.length).toBe(0);

      const hugePage = paginateLeaderboard(mockEntries, 999, 10);
      expect(hugePage.length).toBe(0);
    });

    it("should handle pageSize larger than total entries without errors", () => {
      const result = paginateLeaderboard(mockEntries, 1, 100);
      expect(result.length).toBe(mockEntries.length);
      expect(result).toEqual(mockEntries);
    });

    it("should handle empty entry arrays safely", () => {
      const result = paginateLeaderboard([], 1, 10);
      expect(result).toEqual([]);
    });

    it("should handle negative or zero page and size gracefully", () => {
      const result = paginateLeaderboard(mockEntries, 0, 0);
      expect(result.length).toBe(1); // max(1, page) = 1, max(1, pageSize) = 1
      expect(result[0].id).toBe("1");

      const negResult = paginateLeaderboard(mockEntries, -5, -10);
      expect(negResult.length).toBe(1);
      expect(negResult[0].id).toBe("1");
    });
  });

  describe("filterLeaderboardByTier", () => {
    it("should filter entries by exact tier match", () => {
      const result = filterLeaderboardByTier(mockEntries, "Type Warden");
      expect(result.length).toBe(2);
      expect(result.map(e => e.id)).toEqual(["2", "3"]);
    });

    it("should return empty array if no matches found", () => {
      const result = filterLeaderboardByTier(mockEntries, "Unknown Tier");
      expect(result.length).toBe(0);
    });

    it("should perform exact case-sensitive matching", () => {
      const lower = filterLeaderboardByTier(mockEntries, "type warden");
      expect(lower.length).toBe(0);
    });

    it("should return all entries if tier is empty string", () => {
      const result = filterLeaderboardByTier(mockEntries, "");
      expect(result.length).toBe(mockEntries.length);
    });
  });

  describe("calculatePercentile", () => {
    it("should calculate correct percentile for rank 1 of 10", () => {
      expect(calculatePercentile(1, 10)).toBe(90);
    });

    it("should calculate correct percentile for rank 5 of 10", () => {
      expect(calculatePercentile(5, 10)).toBe(50);
    });

    it("should calculate correct percentile for rank 10 of 10", () => {
      expect(calculatePercentile(10, 10)).toBe(0);
    });

    it("should clamp ranks exceeding total player count", () => {
      expect(calculatePercentile(15, 10)).toBe(0);
      expect(calculatePercentile(999, 10)).toBe(0);
    });

    it("should clamp ranks below 1", () => {
      expect(calculatePercentile(0, 10)).toBe(90);
      expect(calculatePercentile(-5, 10)).toBe(90);
    });

    it("should return 100 for totalPlayers <= 1", () => {
      expect(calculatePercentile(1, 1)).toBe(100);
      expect(calculatePercentile(1, 0)).toBe(100);
      expect(calculatePercentile(1, -5)).toBe(100);
    });

    it("should accurately compute percentiles for large operative cohorts", () => {
      expect(calculatePercentile(1, 1000)).toBe(100);
      expect(calculatePercentile(10, 1000)).toBe(99);
      expect(calculatePercentile(500, 1000)).toBe(50);
    });
  });

  describe("calculateTopPercentage", () => {
    it("should calculate top 10% for rank 1 of 10", () => {
      expect(calculateTopPercentage(1, 10)).toBe(10);
    });

    it("should calculate top 50% for rank 5 of 10", () => {
      expect(calculateTopPercentage(5, 10)).toBe(50);
    });

    it("should calculate top 100% for rank 10 of 10", () => {
      expect(calculateTopPercentage(10, 10)).toBe(100);
    });

    it("should clamp rank exceeding totalPlayers to 100%", () => {
      expect(calculateTopPercentage(15, 10)).toBe(100);
      expect(calculateTopPercentage(100, 10)).toBe(100);
    });

    it("should clamp rank below 1 to rank 1", () => {
      expect(calculateTopPercentage(0, 10)).toBe(10);
      expect(calculateTopPercentage(-3, 10)).toBe(10);
    });

    it("should return 100 for totalPlayers 0", () => {
      expect(calculateTopPercentage(1, 0)).toBe(100);
    });

    it("should calculate top 1% for rank 1 of 1000", () => {
      expect(calculateTopPercentage(1, 1000)).toBe(1);
      expect(calculateTopPercentage(10, 1000)).toBe(1);
      expect(calculateTopPercentage(25, 1000)).toBe(3);
    });

    it("handles non-finite and NaN inputs safely", () => {
      expect(calculateTopPercentage(NaN, 100)).toBe(1);
      expect(calculateTopPercentage(1, NaN)).toBe(100);
      expect(calculatePercentile(NaN, 100)).toBe(99);
      expect(calculatePercentile(1, NaN)).toBe(100);
    });
  });

  describe("filterLeaderboardByTier and pagination safety", () => {
    it("returns empty array when passed non-array entries", () => {
      expect(filterLeaderboardByTier(null as any, "Novice Byte")).toEqual([]);
      expect(paginateLeaderboard(null as any, 1, 10)).toEqual([]);
    });
  });

  describe("sortLeaderboardEntries", () => {
    it("sorts primarily by XP descending", () => {
      const sorted = sortLeaderboardEntries(mockEntries);
      expect(sorted[0].xp).toBe(50000);
      expect(sorted[1].xp).toBe(16000);
      expect(sorted[2].xp).toBe(15000);
      expect(sorted[3].xp).toBe(100);
    });

    it("breaks ties by level, stars, and alphabetical username", () => {
      const tieEntries: LeaderboardEntry[] = [
        { ...mockEntries[0], id: "a", username: "charlie", xp: 1000, level: 10, stars: 5 },
        { ...mockEntries[0], id: "b", username: "alice", xp: 1000, level: 10, stars: 5 },
        { ...mockEntries[0], id: "c", username: "bob", xp: 1000, level: 12, stars: 1 },
        { ...mockEntries[0], id: "d", username: "david", xp: 1000, level: 10, stars: 10 },
      ];

      const sorted = sortLeaderboardEntries(tieEntries);
      // Highest level first (bob, lvl 12)
      expect(sorted[0].username).toBe("bob");
      // Next, level 10 with highest stars (david, stars 10)
      expect(sorted[1].username).toBe("david");
      // Next, level 10 stars 5 alphabetical: alice before charlie
      expect(sorted[2].username).toBe("alice");
      expect(sorted[3].username).toBe("charlie");
    });

    it("returns empty array for invalid inputs", () => {
      expect(sortLeaderboardEntries(null as any)).toEqual([]);
    });
  });

  describe("getDivisionByPercentile", () => {
    it("maps percentiles to competitive divisions accurately", () => {
      expect(getDivisionByPercentile(100)).toBe("Matrix Lord");
      expect(getDivisionByPercentile(99)).toBe("Matrix Lord");
      expect(getDivisionByPercentile(95)).toBe("Diamond");
      expect(getDivisionByPercentile(90)).toBe("Diamond");
      expect(getDivisionByPercentile(80)).toBe("Platinum");
      expect(getDivisionByPercentile(75)).toBe("Platinum");
      expect(getDivisionByPercentile(60)).toBe("Gold");
      expect(getDivisionByPercentile(50)).toBe("Gold");
      expect(getDivisionByPercentile(30)).toBe("Silver");
      expect(getDivisionByPercentile(25)).toBe("Silver");
      expect(getDivisionByPercentile(10)).toBe("Bronze");
      expect(getDivisionByPercentile(0)).toBe("Bronze");
    });

    it("handles NaN and non-finite numbers safely", () => {
      expect(getDivisionByPercentile(NaN)).toBe("Bronze");
      expect(getDivisionByPercentile(-10)).toBe("Bronze");
      expect(getDivisionByPercentile(Infinity)).toBe("Bronze");
    });
  });
});
