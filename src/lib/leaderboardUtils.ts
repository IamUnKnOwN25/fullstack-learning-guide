import { LeaderboardEntry } from "@/data/leaderboard";

/**
 * Paginates a leaderboard array.
 * @param entries The array of leaderboard entries.
 * @param page The 1-indexed page number.
 * @param pageSize The number of entries per page.
 * @returns A slice of the entries for the specified page.
 */
export function paginateLeaderboard(
  entries: LeaderboardEntry[],
  page: number,
  pageSize: number
): LeaderboardEntry[] {
  if (!Array.isArray(entries)) return [];
  const safePage = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1;
  const safePageSize = Number.isFinite(pageSize) ? Math.max(1, Math.floor(pageSize)) : 10;
  const startIndex = (safePage - 1) * safePageSize;
  return entries.slice(startIndex, startIndex + safePageSize);
}

/**
 * Filters the leaderboard by a specific rank tier (e.g., "Novice Byte", "Type Warden").
 * Supports case-insensitive and trimmed tier matching.
 * @param entries The array of leaderboard entries.
 * @param tier The title of the rank tier to filter by.
 * @returns A filtered array of entries matching the tier.
 */
export function filterLeaderboardByTier(
  entries: LeaderboardEntry[],
  tier: string
): LeaderboardEntry[] {
  if (!Array.isArray(entries)) return [];
  if (typeof tier !== "string") return entries;
  const normalizedTier = tier.trim().toLowerCase();
  if (!normalizedTier) return entries;
  return entries.filter(
    (entry) =>
      Boolean(entry) &&
      typeof entry.title === "string" &&
      entry.title.trim().toLowerCase() === normalizedTier
  );
}

/**
 * Calculates the percentile of a given rank.
 * Represents the percentage of players the current player has outranked.
 * Higher percentile is better (e.g., 99th percentile means better than 99% of players).
 * @param rank The 1-indexed rank of the player.
 * @param totalPlayers The total number of players in the leaderboard.
 * @returns The calculated percentile (0-100).
 */
export function calculatePercentile(rank: number, totalPlayers: number): number {
  if (!Number.isFinite(totalPlayers) || totalPlayers <= 1) return 100;
  const safeRank = Number.isFinite(rank) ? Math.max(1, Math.min(Math.floor(rank), totalPlayers)) : 1;
  // Percentile formula: ((Total - Rank) / Total) * 100
  return Math.round(((totalPlayers - safeRank) / totalPlayers) * 100);
}

/**
 * Calculates the "Top X%" bracket for a player.
 * Lower top percentage is better (e.g., Top 1% is better than Top 10%).
 * @param rank The 1-indexed rank of the player.
 * @param totalPlayers The total number of players in the leaderboard.
 * @returns The top percentage (1-100).
 */
export function calculateTopPercentage(rank: number, totalPlayers: number): number {
  if (!Number.isFinite(totalPlayers) || totalPlayers <= 0) return 100;
  const safeRank = Number.isFinite(rank) ? Math.max(1, Math.min(Math.floor(rank), totalPlayers)) : 1;
  return Math.ceil((safeRank / totalPlayers) * 100);
}

/**
 * Deterministically sorts leaderboard entries by XP descending, breaking ties by level descending,
 * stars descending, bosses slain descending, and finally username ascending.
 */
export function sortLeaderboardEntries(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  if (!Array.isArray(entries)) return [];
  const validEntries = entries.filter((entry): entry is LeaderboardEntry => Boolean(entry));
  return validEntries.sort((a, b) => {
    const bXp = Number.isFinite(b.xp) ? b.xp : 0;
    const aXp = Number.isFinite(a.xp) ? a.xp : 0;
    if (bXp !== aXp) return bXp - aXp;

    const bLevel = Number.isFinite(b.level) ? b.level : 0;
    const aLevel = Number.isFinite(a.level) ? a.level : 0;
    if (bLevel !== aLevel) return bLevel - aLevel;

    const bStars = Number.isFinite(b.stars) ? b.stars : 0;
    const aStars = Number.isFinite(a.stars) ? a.stars : 0;
    if (bStars !== aStars) return bStars - aStars;

    const bBosses = Number.isFinite(b.bossesSlain) ? b.bossesSlain : 0;
    const aBosses = Number.isFinite(a.bossesSlain) ? a.bossesSlain : 0;
    if (bBosses !== aBosses) return bBosses - aBosses;

    const aUser = typeof a.username === "string" ? a.username : "";
    const bUser = typeof b.username === "string" ? b.username : "";
    return aUser.localeCompare(bUser);
  });
}

export type CompetitiveDivision = "Matrix Lord" | "Diamond" | "Platinum" | "Gold" | "Silver" | "Bronze";

/**
 * Categorizes an operative into a competitive division based on their percentile standing.
 */
export function getDivisionByPercentile(percentile: number): CompetitiveDivision {
  const safe = Number.isFinite(percentile) ? Math.max(0, Math.min(100, percentile)) : 0;
  if (safe >= 99) return "Matrix Lord";
  if (safe >= 90) return "Diamond";
  if (safe >= 75) return "Platinum";
  if (safe >= 50) return "Gold";
  if (safe >= 25) return "Silver";
  return "Bronze";
}

/**
 * Categorizes an operative into a competitive division based on percentile or rank/total.
 */
export function getCompetitiveDivision(
  percentileOrRank: number,
  totalPlayers?: number
): CompetitiveDivision {
  if (typeof totalPlayers === "number" && totalPlayers > 0) {
    const percentile = calculatePercentile(percentileOrRank, totalPlayers);
    return getDivisionByPercentile(percentile);
  }
  return getDivisionByPercentile(percentileOrRank);
}

export interface PlayerRankResult {
  rank: number | null;
  total: number;
  percentile: number | null;
}

/**
 * Finds the 1-based rank and top percentile [1, 100] of an operative in the leaderboard.
 * Sorts entries descending by xp (tie-breaking by id).
 */
export function findPlayerRank(
  entries: Array<{ id: string; xp: number }>,
  targetId: string
): PlayerRankResult {
  if (!Array.isArray(entries)) {
    return { rank: null, total: 0, percentile: null };
  }

  const validEntries = entries.filter((e) => Boolean(e) && typeof e === "object");
  const total = validEntries.length;

  if (typeof targetId !== "string" || !targetId) {
    return { rank: null, total, percentile: null };
  }

  const sorted = [...validEntries].sort((a, b) => {
    const aXp = Number.isFinite(a.xp) ? a.xp : 0;
    const bXp = Number.isFinite(b.xp) ? b.xp : 0;
    if (bXp !== aXp) return bXp - aXp;
    const aId = typeof a.id === "string" ? a.id : String(a.id ?? "");
    const bId = typeof b.id === "string" ? b.id : String(b.id ?? "");
    return aId.localeCompare(bId);
  });

  const index = sorted.findIndex((e) => e.id === targetId);
  if (index === -1) {
    return { rank: null, total, percentile: null };
  }

  const rank = index + 1;
  const percentile = calculateTopPercentage(rank, total);

  return {
    rank,
    total,
    percentile,
  };
}

/**
 * Computes the distribution of operatives across competitive divisions.
 */
export function computeDivisionDistribution(
  entries: Array<{ xp: number }>
): Record<CompetitiveDivision, number> {
  const distribution: Record<CompetitiveDivision, number> = {
    "Matrix Lord": 0,
    "Diamond": 0,
    "Platinum": 0,
    "Gold": 0,
    "Silver": 0,
    "Bronze": 0,
  };

  if (!Array.isArray(entries) || entries.length === 0) {
    return distribution;
  }

  const validEntries = entries.filter((e) => Boolean(e) && typeof e === "object");
  const total = validEntries.length;
  if (total === 0) {
    return distribution;
  }

  const sorted = [...validEntries].sort((a, b) => {
    const aXp = Number.isFinite(a.xp) ? a.xp : 0;
    const bXp = Number.isFinite(b.xp) ? b.xp : 0;
    if (bXp !== aXp) return bXp - aXp;
    if ("id" in a && "id" in b) {
      return String((a as any).id).localeCompare(String((b as any).id));
    }
    return 0;
  });

  for (let i = 0; i < total; i++) {
    const rank = i + 1;
    const division = getCompetitiveDivision(rank, total);
    distribution[division] = (distribution[division] || 0) + 1;
  }

  return distribution;
}

/**
 * Returns a slice of entries centered around targetId (index - radius to index + radius).
 * Defaults to radius = 1, returning up to 3 entries (previous, target, next).
 * Returns [] if targetId is not found or entries is invalid.
 */
export function getAdjacentRankNeighbors<T extends { id: string }>(
  entries: T[],
  targetId: string,
  radius: number = 1
): T[] {
  if (!Array.isArray(entries) || entries.length === 0) {
    return [];
  }
  if (typeof targetId !== "string" || !targetId) {
    return [];
  }

  const targetIndex = entries.findIndex(
    (entry) => Boolean(entry) && typeof entry === "object" && entry.id === targetId
  );

  if (targetIndex === -1) {
    return [];
  }

  const safeRadius = Number.isFinite(radius) ? Math.max(0, Math.floor(radius)) : 1;
  const startIndex = Math.max(0, targetIndex - safeRadius);
  const endIndex = Math.min(entries.length, targetIndex + safeRadius + 1);

  return entries.slice(startIndex, endIndex);
}
