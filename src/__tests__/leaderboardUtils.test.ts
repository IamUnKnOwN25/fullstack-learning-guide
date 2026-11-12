import { describe, it, expect } from "vitest";
import {
  paginateLeaderboard,
  filterLeaderboardByTier,
  calculatePercentile,
  calculateTopPercentage,
  sortLeaderboardEntries,
  getDivisionByPercentile,
  getCompetitiveDivision,
  findPlayerRank,
  computeDivisionDistribution,
  getAdjacentRankNeighbors,
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
      expect(result.map((e) => e.id)).toEqual(["2", "3"]);
    });

    it("should return empty array if no matches found", () => {
      const result = filterLeaderboardByTier(mockEntries, "Unknown Tier");
      expect(result.length).toBe(0);
    });

    it("should perform case-insensitive and trimmed tier matching", () => {
      const lower = filterLeaderboardByTier(mockEntries, "  type warden  ");
      expect(lower.length).toBe(2);
      expect(lower.map((e) => e.id)).toEqual(["2", "3"]);

      const upper = filterLeaderboardByTier(mockEntries, "NOVICE BYTE");
      expect(upper.length).toBe(1);
      expect(upper[0].id).toBe("4");
    });

    it("should return all entries if tier is empty string or whitespace only", () => {
      const emptyResult = filterLeaderboardByTier(mockEntries, "");
      expect(emptyResult.length).toBe(mockEntries.length);

      const whitespaceResult = filterLeaderboardByTier(mockEntries, "   ");
      expect(whitespaceResult.length).toBe(mockEntries.length);
    });

    it("should safely handle nullish or invalid entries and non-string tiers", () => {
      const entriesWithNull = [
        ...mockEntries,
        null as any,
        undefined as any,
        { id: "5", title: null as any } as any,
      ];
      const result = filterLeaderboardByTier(entriesWithNull, "novice byte");
      expect(result.length).toBe(1);
      expect(result[0].id).toBe("4");

      expect(filterLeaderboardByTier(mockEntries, null as any)).toEqual(mockEntries);
      expect(filterLeaderboardByTier(mockEntries, undefined as any)).toEqual(mockEntries);
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

    it("treats NaN and non-finite xp/level as 0 deterministically", () => {
      const entries: LeaderboardEntry[] = [
        { ...mockEntries[0], id: "nan-xp", username: "z_nan_xp", xp: NaN, level: 10 },
        { ...mockEntries[0], id: "valid-xp", username: "a_valid_xp", xp: 100, level: 1 },
        { ...mockEntries[0], id: "inf-xp", username: "b_inf_xp", xp: Infinity, level: 5 },
        { ...mockEntries[0], id: "nan-lvl", username: "c_nan_lvl", xp: 0, level: NaN },
      ];
      const sorted = sortLeaderboardEntries(entries);
      // valid-xp has xp 100 (> 0), so it comes first
      expect(sorted[0].id).toBe("valid-xp");
      // the others have xp treated as 0; nan-xp has level 10, so it comes next
      expect(sorted[1].id).toBe("nan-xp");
      // inf-xp has level 5, comes next
      expect(sorted[2].id).toBe("inf-xp");
      // nan-lvl has level treated as 0
      expect(sorted[3].id).toBe("nan-lvl");
    });

    it("filters out nullish items and handles nullish usernames without throwing", () => {
      const mixedEntries = [
        null as any,
        undefined as any,
        { ...mockEntries[0], id: "null-user", username: null as any, xp: 500, level: 5, stars: 0, bossesSlain: 0 },
        { ...mockEntries[0], id: "user-b", username: "bravo", xp: 500, level: 5, stars: 0, bossesSlain: 0 },
        null as any,
        { ...mockEntries[0], id: "user-a", username: "alpha", xp: 500, level: 5, stars: 0, bossesSlain: 0 },
      ];
      const sorted = sortLeaderboardEntries(mixedEntries);
      expect(sorted.length).toBe(3);
      // null username falls back to "", which precedes "alpha" and "bravo" in ascending order
      expect(sorted[0].id).toBe("null-user");
      expect(sorted[1].id).toBe("user-a");
      expect(sorted[2].id).toBe("user-b");
    });

    it("returns empty array for invalid inputs", () => {
      expect(sortLeaderboardEntries(null as any)).toEqual([]);
    });
  });

  describe("getCompetitiveDivision", () => {
    it("delegates to getDivisionByPercentile when passed a single percentile", () => {
      expect(getCompetitiveDivision(100)).toBe("Matrix Lord");
      expect(getCompetitiveDivision(92)).toBe("Diamond");
      expect(getCompetitiveDivision(77)).toBe("Platinum");
      expect(getCompetitiveDivision(55)).toBe("Gold");
      expect(getCompetitiveDivision(30)).toBe("Silver");
      expect(getCompetitiveDivision(10)).toBe("Bronze");
    });

    it("calculates percentile from rank and total players when totalPlayers is provided", () => {
      expect(getCompetitiveDivision(1, 100)).toBe("Matrix Lord");
      expect(getCompetitiveDivision(10, 100)).toBe("Diamond");
      expect(getCompetitiveDivision(25, 100)).toBe("Platinum");
      expect(getCompetitiveDivision(50, 100)).toBe("Gold");
      expect(getCompetitiveDivision(75, 100)).toBe("Silver");
      expect(getCompetitiveDivision(95, 100)).toBe("Bronze");
    });
  });

  describe("findPlayerRank", () => {
    const testPlayers = [
      { id: "p1", xp: 500 },
      { id: "p2", xp: 1500 },
      { id: "p3", xp: 100 },
      { id: "p4", xp: 800 },
    ];

    it("sorts descending by XP and identifies player rank and top percentile bracket", () => {
      // Order: p2 (1500), p4 (800), p1 (500), p3 (100)
      const resP2 = findPlayerRank(testPlayers, "p2");
      expect(resP2.rank).toBe(1);
      expect(resP2.total).toBe(4);
      expect(resP2.percentile).toBe(25); // Top 25%

      const resP4 = findPlayerRank(testPlayers, "p4");
      expect(resP4.rank).toBe(2);
      expect(resP4.total).toBe(4);
      expect(resP4.percentile).toBe(50); // Top 50%

      const resP3 = findPlayerRank(testPlayers, "p3");
      expect(resP3.rank).toBe(4);
      expect(resP3.total).toBe(4);
      expect(resP3.percentile).toBe(100); // Top 100%
    });

    it("deterministically breaks ties by player ID in alphabetical ascending order", () => {
      const tiePlayers = [
        { id: "zeta", xp: 1000 },
        { id: "alpha", xp: 1000 },
        { id: "gamma", xp: 1000 },
      ];
      // Tie-break: alpha (rank 1), gamma (rank 2), zeta (rank 3)
      expect(findPlayerRank(tiePlayers, "alpha").rank).toBe(1);
      expect(findPlayerRank(tiePlayers, "gamma").rank).toBe(2);
      expect(findPlayerRank(tiePlayers, "zeta").rank).toBe(3);
    });

    it("returns null rank and percentile when target player is not found in entries", () => {
      const res = findPlayerRank(testPlayers, "non-existent");
      expect(res.rank).toBeNull();
      expect(res.total).toBe(4);
      expect(res.percentile).toBeNull();
    });

    it("safely handles empty array or invalid inputs", () => {
      expect(findPlayerRank([], "p1")).toEqual({ rank: null, total: 0, percentile: null });
      expect(findPlayerRank(null as any, "p1")).toEqual({ rank: null, total: 0, percentile: null });
      expect(findPlayerRank(testPlayers, "")).toEqual({ rank: null, total: 4, percentile: null });
      expect(findPlayerRank(testPlayers, null as any)).toEqual({ rank: null, total: 4, percentile: null });
    });

    it("handles single player correctly as rank 1 with 100 percentile", () => {
      const single = [{ id: "solo", xp: 999 }];
      const res = findPlayerRank(single, "solo");
      expect(res.rank).toBe(1);
      expect(res.total).toBe(1);
      expect(res.percentile).toBe(100);
    });

    it("treats NaN and non-finite XP values as 0 deterministically", () => {
      const weirdXp = [
        { id: "a", xp: NaN },
        { id: "b", xp: 50 },
        { id: "c", xp: -Infinity },
      ];
      // b (50), then a (0, id 'a'), c (0, id 'c')
      expect(findPlayerRank(weirdXp, "b").rank).toBe(1);
      expect(findPlayerRank(weirdXp, "a").rank).toBe(2);
      expect(findPlayerRank(weirdXp, "c").rank).toBe(3);
    });
  });

  describe("computeDivisionDistribution", () => {
    it("returns all zeros for empty or nullish entries", () => {
      const emptyExpected = {
        "Matrix Lord": 0,
        "Diamond": 0,
        "Platinum": 0,
        "Gold": 0,
        "Silver": 0,
        "Bronze": 0,
      };
      expect(computeDivisionDistribution([])).toEqual(emptyExpected);
      expect(computeDivisionDistribution(null as any)).toEqual(emptyExpected);
    });

    it("correctly counts entries across competitive divisions for 100 players", () => {
      // 100 players with distinct XP descending
      const players = Array.from({ length: 100 }, (_, i) => ({ xp: 10000 - i * 100 }));
      const dist = computeDivisionDistribution(players);

      expect(dist["Matrix Lord"]).toBe(1);
      expect(dist["Diamond"]).toBe(9);
      expect(dist["Platinum"]).toBe(15);
      expect(dist["Gold"]).toBe(25);
      expect(dist["Silver"]).toBe(25);
      expect(dist["Bronze"]).toBe(25);

      const totalSum = Object.values(dist).reduce((acc, val) => acc + val, 0);
      expect(totalSum).toBe(100);
    });

    it("categorizes single entry into Matrix Lord", () => {
      const dist = computeDivisionDistribution([{ xp: 500 }]);
      expect(dist["Matrix Lord"]).toBe(1);
      expect(dist["Diamond"]).toBe(0);
      expect(dist["Platinum"]).toBe(0);
      expect(dist["Gold"]).toBe(0);
      expect(dist["Silver"]).toBe(0);
      expect(dist["Bronze"]).toBe(0);
    });
  });

  describe("getAdjacentRankNeighbors", () => {
    const list = [
      { id: "item1", val: 10 },
      { id: "item2", val: 20 },
      { id: "item3", val: 30 },
      { id: "item4", val: 40 },
      { id: "item5", val: 50 },
    ];

    it("returns immediate previous, target, and next neighbors with default radius 1", () => {
      const neighbors = getAdjacentRankNeighbors(list, "item3");
      expect(neighbors.map((n) => n.id)).toEqual(["item2", "item3", "item4"]);
    });

    it("clamps at array boundaries for start element", () => {
      const startNeighbors = getAdjacentRankNeighbors(list, "item1");
      expect(startNeighbors.map((n) => n.id)).toEqual(["item1", "item2"]);
    });

    it("clamps at array boundaries for end element", () => {
      const endNeighbors = getAdjacentRankNeighbors(list, "item5");
      expect(endNeighbors.map((n) => n.id)).toEqual(["item4", "item5"]);
    });

    it("respects custom radius parameter", () => {
      const radiusTwo = getAdjacentRankNeighbors(list, "item3", 2);
      expect(radiusTwo.map((n) => n.id)).toEqual(["item1", "item2", "item3", "item4", "item5"]);

      const radiusZero = getAdjacentRankNeighbors(list, "item3", 0);
      expect(radiusZero.map((n) => n.id)).toEqual(["item3"]);
    });

    it("returns empty array when targetId is not found", () => {
      expect(getAdjacentRankNeighbors(list, "missing")).toEqual([]);
    });

    it("returns empty array for invalid entries or empty targetId", () => {
      expect(getAdjacentRankNeighbors([], "item1")).toEqual([]);
      expect(getAdjacentRankNeighbors(null as any, "item1")).toEqual([]);
      expect(getAdjacentRankNeighbors(list, "")).toEqual([]);
      expect(getAdjacentRankNeighbors(list, null as any)).toEqual([]);
    });

    it("handles negative or NaN radius safely", () => {
      const negRadius = getAdjacentRankNeighbors(list, "item3", -1);
      expect(negRadius.map((n) => n.id)).toEqual(["item3"]);

      const nanRadius = getAdjacentRankNeighbors(list, "item3", NaN);
      expect(nanRadius.map((n) => n.id)).toEqual(["item2", "item3", "item4"]);
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
