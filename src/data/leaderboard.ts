export interface LeaderboardEntry {
  id: string;
  rank: number;
  username: string;
  displayName: string;
  avatarEmoji: string;
  avatarBg: string;
  avatarBorder: string;
  title: string;
  level: number;
  xp: number;
  stars: number;
  bossesSlain: number;
  curriculumCompleted: number;
  countryCode: string;
  badge: string;
  tier?: string;
  isCurrentUser?: boolean;
}

export const TOP_OPERATIVES: Omit<LeaderboardEntry, "rank" | "isCurrentUser">[] = [
  {
    id: "op-1",
    username: "neo_architect",
    displayName: "Neo Architect",
    avatarEmoji: "👑",
    avatarBg: "from-matrix-neonGold/20 to-matrix-dark",
    avatarBorder: "border-matrix-neonGold",
    title: "Full-Stack Grandmaster",
    level: 50,
    xp: 62500,
    stars: 72,
    bossesSlain: 12,
    curriculumCompleted: 113,
    countryCode: "SG",
    badge: "Matrix Architect",
  },
  {
    id: "op-2",
    username: "ada_lovelace",
    displayName: "Ada Lovelace",
    avatarEmoji: "⚡",
    avatarBg: "from-matrix-accent/20 to-matrix-dark",
    avatarBorder: "border-matrix-accent",
    title: "Full-Stack Grandmaster",
    level: 48,
    xp: 57600,
    stars: 72,
    bossesSlain: 12,
    curriculumCompleted: 110,
    countryCode: "GB",
    badge: "Algorithmic Grandmaster",
  },
  {
    id: "op-3",
    username: "grace_hopper",
    displayName: "Grace Hopper",
    avatarEmoji: "🥷",
    avatarBg: "from-matrix-neonCyan/20 to-matrix-dark",
    avatarBorder: "border-matrix-neonCyan",
    title: "Aegis Sentinel",
    level: 44,
    xp: 48400,
    stars: 68,
    bossesSlain: 11,
    curriculumCompleted: 104,
    countryCode: "US",
    badge: "Aegis Sentinel",
  },
  {
    id: "op-4",
    username: "linus_kernel",
    displayName: "Linus Fleet",
    avatarEmoji: "🤖",
    avatarBg: "from-blue-500/20 to-matrix-dark",
    avatarBorder: "border-blue-400",
    title: "DevOps Fleet Admiral",
    level: 38,
    xp: 36100,
    stars: 64,
    bossesSlain: 10,
    curriculumCompleted: 95,
    countryCode: "FI",
    badge: "DevOps Fleet Admiral",
  },
  {
    id: "op-5",
    username: "alan_turing",
    displayName: "Alan Turing",
    avatarEmoji: "🔮",
    avatarBg: "from-pink-500/20 to-matrix-dark",
    avatarBorder: "border-pink-400",
    title: "Relational Sage",
    level: 32,
    xp: 25600,
    stars: 58,
    bossesSlain: 9,
    curriculumCompleted: 88,
    countryCode: "GB",
    badge: "Guardian of the Schema",
  },
  {
    id: "op-6",
    username: "margaret_apollo",
    displayName: "Margaret Hamilton",
    avatarEmoji: "🧙‍♂️",
    avatarBg: "from-matrix-neonPurple/20 to-matrix-dark",
    avatarBorder: "border-matrix-neonPurple",
    title: "Backend Conduit",
    level: 26,
    xp: 16900,
    stars: 50,
    bossesSlain: 8,
    curriculumCompleted: 75,
    countryCode: "US",
    badge: "Non-Blocking Architect",
  },
  {
    id: "op-7",
    username: "dennis_ritchie",
    displayName: "Dennis Ritchie",
    avatarEmoji: "⚡",
    avatarBg: "from-matrix-accent/20 to-matrix-dark",
    avatarBorder: "border-matrix-accent",
    title: "Component Artisan",
    level: 20,
    xp: 10000,
    stars: 42,
    bossesSlain: 6,
    curriculumCompleted: 62,
    countryCode: "US",
    badge: "Master of Pure Renders",
  },
  {
    id: "op-8",
    username: "brendan_script",
    displayName: "Brendan Eich",
    avatarEmoji: "🥷",
    avatarBg: "from-matrix-neonCyan/20 to-matrix-dark",
    avatarBorder: "border-matrix-neonCyan",
    title: "Type Warden",
    level: 15,
    xp: 5625,
    stars: 34,
    bossesSlain: 5,
    curriculumCompleted: 50,
    countryCode: "US",
    badge: "Discriminated Champion",
  },
  {
    id: "op-9",
    username: "hedy_frequency",
    displayName: "Hedy Lamarr",
    avatarEmoji: "🔮",
    avatarBg: "from-pink-500/20 to-matrix-dark",
    avatarBorder: "border-pink-400",
    title: "DOM Enchanter",
    level: 10,
    xp: 2500,
    stars: 26,
    bossesSlain: 4,
    curriculumCompleted: 38,
    countryCode: "AT",
    badge: "Async Spellcaster",
  },
  {
    id: "op-10",
    username: "tim_hypertext",
    displayName: "Tim Berners",
    avatarEmoji: "👑",
    avatarBg: "from-matrix-neonGold/20 to-matrix-dark",
    avatarBorder: "border-matrix-neonGold",
    title: "Style Weaver",
    level: 6,
    xp: 900,
    stars: 18,
    bossesSlain: 2,
    curriculumCompleted: 24,
    countryCode: "GB",
    badge: "Semantic Warden",
  },
];

export type LeaderboardMetric =
  | "xp"
  | "stars"
  | "bosses"
  | "curriculum"
  | "bossesSlain"
  | "curriculumCompleted";

export interface LeaderboardStats {
  totalOperatives: number;
  averageXp: number;
  topXp: number;
  averageLevel: number;
}

function sanitizeNumber(val: unknown): number {
  if (typeof val === "number") {
    return Number.isFinite(val) ? val : 0;
  }
  if (typeof val === "string") {
    const parsed = Number(val);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function getMetricValue(
  entry: LeaderboardEntry | (Omit<LeaderboardEntry, "rank"> & { rank?: number }),
  metric: LeaderboardMetric
): number {
  switch (metric) {
    case "stars":
      return sanitizeNumber(entry.stars);
    case "bosses":
    case "bossesSlain":
      return sanitizeNumber(entry.bossesSlain);
    case "curriculum":
    case "curriculumCompleted":
      return sanitizeNumber(entry.curriculumCompleted);
    case "xp":
    default:
      return sanitizeNumber(entry.xp);
  }
}

/**
 * Builds a ranked leaderboard by sorting entries descending by the specified metric.
 * Falls back to XP, then Level, then Username (localeCompare).
 * Sanitizes nullish / NaN numeric fields and assigns sequential 1-based ranks.
 */
export function buildRankedLeaderboard(
  entries?: LeaderboardEntry[],
  metric?: LeaderboardMetric
): LeaderboardEntry[];
export function buildRankedLeaderboard(
  entries?: (Omit<LeaderboardEntry, "rank"> & { rank?: number })[],
  metric?: LeaderboardMetric
): LeaderboardEntry[];
export function buildRankedLeaderboard(
  entries?: (Omit<LeaderboardEntry, "rank"> & { rank?: number })[],
  metric: LeaderboardMetric = "xp"
): LeaderboardEntry[] {
  const source =
    entries !== undefined
      ? entries
      : (TOP_OPERATIVES as (Omit<LeaderboardEntry, "rank"> & { rank?: number })[]);

  const cloned = [...source].sort((a, b) => {
    // 1. Primary metric (descending)
    const metricDiff = getMetricValue(b, metric) - getMetricValue(a, metric);
    if (metricDiff !== 0) return metricDiff;

    // 2. Fallback to XP (descending)
    const xpDiff = sanitizeNumber(b.xp) - sanitizeNumber(a.xp);
    if (xpDiff !== 0) return xpDiff;

    // 3. Fallback to Level (descending)
    const levelDiff = sanitizeNumber(b.level) - sanitizeNumber(a.level);
    if (levelDiff !== 0) return levelDiff;

    // 4. Fallback to username (ascending localeCompare)
    const userA = String(a.username ?? "");
    const userB = String(b.username ?? "");
    const nameDiff = userA.localeCompare(userB);
    if (nameDiff !== 0) return nameDiff;

    // 5. Final fallback to ID
    return String(a.id ?? "").localeCompare(String(b.id ?? ""));
  });

  return cloned.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  })) as LeaderboardEntry[];
}

/**
 * Filters leaderboard entries case-insensitively by username, displayName, title, tier, or badge.
 */
export function filterLeaderboardEntries(
  entries: LeaderboardEntry[],
  query: string
): LeaderboardEntry[] {
  if (!Array.isArray(entries)) return [];
  if (!query || typeof query !== "string") return [...entries];
  const q = query.trim().toLowerCase();
  if (!q) return [...entries];

  return entries.filter((entry) => {
    if (!entry) return false;
    const username = (entry.username ?? "").toLowerCase();
    const displayName = (entry.displayName ?? "").toLowerCase();
    const title = (entry.title ?? "").toLowerCase();
    const tier = (entry.tier != null ? String(entry.tier) : "").toLowerCase();
    const badge = (entry.badge ?? "").toLowerCase();

    return (
      username.includes(q) ||
      displayName.includes(q) ||
      title.includes(q) ||
      tier.includes(q) ||
      badge.includes(q)
    );
  });
}

/**
 * Look up an operative by ID from the ranked leaderboard.
 */
export function getOperativeById(id: string): LeaderboardEntry | undefined {
  if (!id || typeof id !== "string") return undefined;
  return buildRankedLeaderboard().find((entry) => entry.id === id);
}

/**
 * Compute aggregate telemetry stats across leaderboard entries.
 */
export function getLeaderboardStats(entries?: LeaderboardEntry[]): {
  totalOperatives: number;
  averageXp: number;
  topXp: number;
  averageLevel: number;
} {
  const source = entries !== undefined ? entries : buildRankedLeaderboard();
  if (!Array.isArray(source) || source.length === 0) {
    return {
      totalOperatives: 0,
      averageXp: 0,
      topXp: 0,
      averageLevel: 0,
    };
  }

  const totalOperatives = source.length;
  let totalXp = 0;
  let totalLevel = 0;
  let topXp = 0;

  for (const entry of source) {
    const xp = sanitizeNumber(entry?.xp);
    const level = sanitizeNumber(entry?.level);
    totalXp += xp;
    totalLevel += level;
    if (xp > topXp) {
      topXp = xp;
    }
  }

  const averageXp = Math.round((totalXp / totalOperatives) * 100) / 100;
  const averageLevel = Math.round((totalLevel / totalOperatives) * 100) / 100;

  return {
    totalOperatives,
    averageXp,
    topXp,
    averageLevel,
  };
}
