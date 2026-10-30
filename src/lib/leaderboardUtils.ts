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
