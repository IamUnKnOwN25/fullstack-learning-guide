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
  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, pageSize);
  const startIndex = (safePage - 1) * safePageSize;
  return entries.slice(startIndex, startIndex + safePageSize);
}

/**
 * Filters the leaderboard by a specific rank tier (e.g., "Novice Byte", "Type Warden").
 * @param entries The array of leaderboard entries.
 * @param tier The exact title of the rank tier to filter by.
 * @returns A filtered array of entries matching the tier.
 */
export function filterLeaderboardByTier(
  entries: LeaderboardEntry[],
  tier: string
): LeaderboardEntry[] {
  if (!tier) return entries;
  return entries.filter((entry) => entry.title === tier);
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
  if (totalPlayers <= 1) return 100;
  const safeRank = Math.max(1, Math.min(rank, totalPlayers));
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
  if (totalPlayers === 0) return 100;
  const safeRank = Math.max(1, Math.min(rank, totalPlayers));
  return Math.ceil((safeRank / totalPlayers) * 100);
}
