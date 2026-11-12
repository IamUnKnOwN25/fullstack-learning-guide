import { PlayerStats } from "@/lib/gameStore";

export type AchievementCategory = "bosses" | "quests" | "scholar" | "mastery";
export type AchievementRarity = "common" | "rare" | "epic" | "legendary" | "mythic";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  icon: string;
  xpReward: number;
  badgeId?: string;
  checkProgress: (stats?: PlayerStats | null) => {
    current: number;
    target: number;
    isUnlocked: boolean;
  };
}

export const RARITY_CONFIG: Record<
  AchievementRarity,
  { label: string; color: string; border: string; bg: string }
> = {
  common: {
    label: "Common",
    color: "text-gray-300",
    border: "border-gray-500/50",
    bg: "bg-gray-500/10",
  },
  rare: {
    label: "Rare",
    color: "text-blue-400",
    border: "border-blue-400/50",
    bg: "bg-blue-400/10",
  },
  epic: {
    label: "Epic",
    color: "text-matrix-neonPurple",
    border: "border-matrix-neonPurple/50",
    bg: "bg-matrix-neonPurple/10",
  },
  legendary: {
    label: "Legendary",
    color: "text-matrix-neonGold",
    border: "border-matrix-neonGold/60",
    bg: "bg-matrix-neonGold/10",
  },
  mythic: {
    label: "Mythic",
    color: "text-matrix-neonCyan",
    border: "border-matrix-neonCyan/80",
    bg: "bg-matrix-neonCyan/15",
  },
};

function getSafeArray<T>(val: unknown): T[] {
  return Array.isArray(val) ? (val as T[]) : [];
}

export const DEFAULT_PLAYER_STATS: PlayerStats = {
  xp: 0,
  level: 1,
  hp: 100,
  maxHp: 100,
  mana: 50,
  maxMana: 50,
  streak: 0,
  rankTitle: "Initiate",
  completedQuests: [],
  completedBosses: [],
  unlockedRealms: [],
  stars: {},
  unlockedSkills: [],
  badges: [],
  completedCurriculumTasks: [],
  curriculumTaskAwards: {},
  completedChapters: [],
  claimedAchievements: [],
  audioMuted: false,
  bgmActive: false,
  pendingLevelUp: null,
  recentXpGain: null,
};

export const ACHIEVEMENTS: Achievement[] = [
  // Boss Vanquisher Trophies
  {
    id: "first_blood_boss",
    name: "Semantic Warden",
    description: "Vanquish The Malformed Tag Abomination in the HTML Realm.",
    category: "bosses",
    rarity: "common",
    icon: "ShieldAlert",
    xpReward: 100,
    badgeId: "slayer_of_divs",
    checkProgress: (s) => {
      const bosses = getSafeArray<string>(s?.completedBosses);
      const isUnlocked = bosses.includes("html");
      return {
        current: isUnlocked ? 1 : 0,
        target: 1,
        isUnlocked,
      };
    },
  },
  {
    id: "slayer_of_hydra",
    name: "Master of Grids & Flow",
    description: "Tame horizontal scrollbars and slay The Overflow Hydra in the CSS Realm.",
    category: "bosses",
    rarity: "rare",
    icon: "Award",
    xpReward: 150,
    badgeId: "slayer_of_hydra",
    checkProgress: (s) => {
      const bosses = getSafeArray<string>(s?.completedBosses);
      const isUnlocked = bosses.includes("css");
      return {
        current: isUnlocked ? 1 : 0,
        target: 1,
        isUnlocked,
      };
    },
  },
  {
    id: "slayer_of_kraken",
    name: "Async Spellcaster",
    description: "Banish callback hell and master Promises against The Callback Kraken.",
    category: "bosses",
    rarity: "rare",
    icon: "Sparkles",
    xpReward: 200,
    badgeId: "slayer_of_kraken",
    checkProgress: (s) => {
      const bosses = getSafeArray<string>(s?.completedBosses);
      const isUnlocked = bosses.includes("javascript");
      return {
        current: isUnlocked ? 1 : 0,
        target: 1,
        isUnlocked,
      };
    },
  },
  {
    id: "slayer_of_any",
    name: "Discriminated Champion",
    description: "Banish type 'any' and enforce strict discriminated unions on The Any-Demon.",
    category: "bosses",
    rarity: "epic",
    icon: "Shield",
    xpReward: 250,
    badgeId: "slayer_of_any",
    checkProgress: (s) => {
      const bosses = getSafeArray<string>(s?.completedBosses);
      const isUnlocked = bosses.includes("typescript");
      return {
        current: isUnlocked ? 1 : 0,
        target: 1,
        isUnlocked,
      };
    },
  },
  {
    id: "boss_halfway",
    name: "Realm Vanguard",
    description: "Vanquish at least 6 realm boss monsters across the Web Matrix.",
    category: "bosses",
    rarity: "epic",
    icon: "Sword",
    xpReward: 350,
    checkProgress: (s) => {
      const bosses = getSafeArray<string>(s?.completedBosses);
      return {
        current: Math.min(6, bosses.length),
        target: 6,
        isUnlocked: bosses.length >= 6,
      };
    },
  },
  {
    id: "all_bosses_slain",
    name: "Matrix Conqueror",
    description: "Vanquish all 12 realm boss monsters from HTML to the Null Void.",
    category: "bosses",
    rarity: "mythic",
    icon: "Crown",
    xpReward: 1000,
    badgeId: "master_of_the_matrix",
    checkProgress: (s) => {
      const bosses = getSafeArray<string>(s?.completedBosses);
      return {
        current: Math.min(12, bosses.length),
        target: 12,
        isUnlocked: bosses.length >= 12,
      };
    },
  },

  // Quest & Coding Trials
  {
    id: "welcome_initiate",
    name: "Matrix Initiate",
    description: "Plug into DevQuest and begin your coding odyssey.",
    category: "quests",
    rarity: "common",
    icon: "Sparkles",
    xpReward: 50,
    badgeId: "welcome_recruit",
    checkProgress: () => ({ current: 1, target: 1, isUnlocked: true }),
  },
  {
    id: "speed_coder",
    name: "Flawless Syntax",
    description: "Achieve a perfect 3-star rating on any coding trial.",
    category: "quests",
    rarity: "rare",
    icon: "Star",
    xpReward: 100,
    badgeId: "speed_coder",
    checkProgress: (s) => {
      const stars = s?.stars && typeof s.stars === "object" && !Array.isArray(s.stars) ? s.stars : {};
      const hasThreeStar = Object.values(stars).some((stars) => stars === 3);
      return { current: hasThreeStar ? 1 : 0, target: 1, isUnlocked: hasThreeStar };
    },
  },
  {
    id: "quest_milestone_10",
    name: "Code Journeyman",
    description: "Solve and verify 10 distinct interactive coding quests.",
    category: "quests",
    rarity: "epic",
    icon: "CheckCircle2",
    xpReward: 300,
    checkProgress: (s) => {
      const quests = getSafeArray<string>(s?.completedQuests);
      return {
        current: Math.min(10, quests.length),
        target: 10,
        isUnlocked: quests.length >= 10,
      };
    },
  },
  {
    id: "quest_all_24",
    name: "Trial Grandmaster",
    description: "Solve all 24 interactive coding quests across the 12 realms.",
    category: "quests",
    rarity: "legendary",
    icon: "Trophy",
    xpReward: 750,
    checkProgress: (s) => {
      const quests = getSafeArray<string>(s?.completedQuests);
      return {
        current: Math.min(24, quests.length),
        target: 24,
        isUnlocked: quests.length >= 24,
      };
    },
  },
  {
    id: "stars_milestone_50",
    name: "Constellation Weaver",
    description: "Accumulate 50 or more gold stars across all coding trials.",
    category: "quests",
    rarity: "legendary",
    icon: "Star",
    xpReward: 500,
    checkProgress: (s) => {
      const stars = s?.stars && typeof s.stars === "object" && !Array.isArray(s.stars) ? s.stars : {};
      const sum = Object.values(stars).reduce((acc, st) => acc + (typeof st === "number" ? st : 0), 0);
      return { current: Math.min(50, sum), target: 50, isUnlocked: sum >= 50 };
    },
  },

  // Scholar & Curriculum
  {
    id: "tasks_milestone_25",
    name: "Syntax Scholar",
    description: "Check off 25 curriculum self-study checklist items in the Vault.",
    category: "scholar",
    rarity: "rare",
    icon: "BookOpen",
    xpReward: 150,
    checkProgress: (s) => {
      const tasks = getSafeArray<string>(s?.completedCurriculumTasks);
      return {
        current: Math.min(25, tasks.length),
        target: 25,
        isUnlocked: tasks.length >= 25,
      };
    },
  },
  {
    id: "chapters_milestone_5",
    name: "Vault Explorer",
    description: "Master 5 complete curriculum guides and test checkpoints.",
    category: "scholar",
    rarity: "epic",
    icon: "BookOpen",
    xpReward: 250,
    checkProgress: (s) => {
      const chapters = getSafeArray<string>(s?.completedChapters);
      return {
        current: Math.min(5, chapters.length),
        target: 5,
        isUnlocked: chapters.length >= 5,
      };
    },
  },
  {
    id: "chapters_all_13",
    name: "Curriculum Sage",
    description: "Master all 13 curriculum guidebooks from HTML to System Design.",
    category: "scholar",
    rarity: "mythic",
    icon: "Crown",
    xpReward: 800,
    checkProgress: (s) => {
      const chapters = getSafeArray<string>(s?.completedChapters);
      return {
        current: Math.min(13, chapters.length),
        target: 13,
        isUnlocked: chapters.length >= 13,
      };
    },
  },

  // Mastery & Progression
  {
    id: "skill_pioneer",
    name: "Cybernetic Pioneer",
    description: "Unlock your first talent in the Cybernetic Skill Tree.",
    category: "mastery",
    rarity: "common",
    icon: "Zap",
    xpReward: 100,
    badgeId: "skill_pioneer",
    checkProgress: (s) => {
      const skills = getSafeArray<string>(s?.unlockedSkills);
      return {
        current: skills.length > 0 ? 1 : 0,
        target: 1,
        isUnlocked: skills.length > 0,
      };
    },
  },
  {
    id: "streak_7_days",
    name: "Relentless Discipline",
    description: "Maintain an active 7-day coding streak and unlock max streak XP.",
    category: "mastery",
    rarity: "epic",
    icon: "Flame",
    xpReward: 400,
    checkProgress: (s) => {
      const streak = typeof s?.streak === "number" && !isNaN(s.streak) ? (s.streak || 1) : 1;
      return {
        current: Math.min(7, streak),
        target: 7,
        isUnlocked: streak >= 7,
      };
    },
  },
  {
    id: "level_25",
    name: "Backend Conduit Mastery",
    description: "Ascend to Level 25 or higher through diligent practice.",
    category: "mastery",
    rarity: "legendary",
    icon: "Award",
    xpReward: 500,
    checkProgress: (s) => {
      const level = typeof s?.level === "number" && !isNaN(s.level) ? s.level : 1;
      return {
        current: Math.min(25, level),
        target: 25,
        isUnlocked: level >= 25,
      };
    },
  },
  {
    id: "matrix_archmage_mastery",
    name: "Grandmaster Ascendant",
    description: "Attain Level 50 and master the Matrix Grandmaster skill.",
    category: "mastery",
    rarity: "mythic",
    icon: "Crown",
    xpReward: 1500,
    badgeId: "grandmaster_matrix",
    checkProgress: (s) => {
      const level = typeof s?.level === "number" && !isNaN(s.level) ? s.level : 1;
      const skills = getSafeArray<string>(s?.unlockedSkills);
      const unlocked = level >= 50 && skills.includes("matrix_grandmaster");
      return { current: unlocked ? 1 : 0, target: 1, isUnlocked: unlocked };
    },
  },
];

/**
 * Retrieve achievements filtered by category or returns all if 'all' or undefined.
 */
export function getAchievementsByCategory(category?: AchievementCategory | "all"): Achievement[] {
  if (!category || category === "all") {
    return ACHIEVEMENTS;
  }
  return ACHIEVEMENTS.filter((a) => a.category === category);
}

/**
 * Retrieve achievements filtered by rarity tier.
 */
export function getAchievementsByRarity(rarity: AchievementRarity): Achievement[] {
  return ACHIEVEMENTS.filter((a) => a.rarity === rarity);
}

/**
 * Find a specific achievement by its unique identifier.
 */
export function getAchievementById(id: string): Achievement | undefined {
  if (!id) return undefined;
  return ACHIEVEMENTS.find((a) => a.id === id);
}

export interface AchievementProgressSummary {
  total: number;
  unlocked: number;
  claimed: number;
  claimable: number;
  percentUnlocked: number;
  totalXpAvailable: number;
  totalXpClaimed: number;
}

/**
 * Calculate comprehensive achievement unlock and claim statistics for given player stats.
 */
export function calculateAchievementProgress(
  stats?: PlayerStats | null,
  claimedList?: string[]
): AchievementProgressSummary {
  const total = ACHIEVEMENTS.length;
  if (total === 0) {
    return {
      total: 0,
      unlocked: 0,
      claimed: 0,
      claimable: 0,
      percentUnlocked: 0,
      totalXpAvailable: 0,
      totalXpClaimed: 0,
    };
  }

  const safeStats: PlayerStats = stats ? { ...DEFAULT_PLAYER_STATS, ...stats } : DEFAULT_PLAYER_STATS;
  const safeClaimed = Array.isArray(claimedList)
    ? claimedList
    : (Array.isArray(safeStats.claimedAchievements) ? safeStats.claimedAchievements : []);

  let unlocked = 0;
  let claimed = 0;
  let claimable = 0;
  let totalXpAvailable = 0;
  let totalXpClaimed = 0;

  for (const ach of ACHIEVEMENTS) {
    totalXpAvailable += ach.xpReward;
    const isClaimed = safeClaimed.includes(ach.id);
    const progress = ach.checkProgress(safeStats);
    const isUnlocked = Boolean(progress && progress.isUnlocked);

    if (isUnlocked) {
      unlocked++;
      if (!isClaimed) {
        claimable++;
      }
    }
    if (isClaimed) {
      claimed++;
      totalXpClaimed += ach.xpReward;
    }
  }

  const percentUnlocked = Math.round((unlocked / total) * 100);

  return {
    total,
    unlocked,
    claimed,
    claimable,
    percentUnlocked,
    totalXpAvailable,
    totalXpClaimed,
  };
}


export interface CategoryAchievementStats {
  unlocked: number;
  total: number;
  percentage: number;
}

/**
 * Computes category breakdown for achievements: unlocked count, total count, and rounded percentage [0, 100].
 */
export function getCategoryAchievementStats(
  unlockedIds: string[] = []
): Record<string, CategoryAchievementStats> {
  const safeUnlocked = new Set(Array.isArray(unlockedIds) ? unlockedIds : []);
  const stats: Record<string, CategoryAchievementStats> = {};

  for (const ach of ACHIEVEMENTS) {
    if (!stats[ach.category]) {
      stats[ach.category] = { unlocked: 0, total: 0, percentage: 0 };
    }
    stats[ach.category].total += 1;
    if (safeUnlocked.has(ach.id)) {
      stats[ach.category].unlocked += 1;
    }
  }

  for (const cat of Object.keys(stats)) {
    const s = stats[cat];
    s.percentage = s.total > 0 ? Math.min(100, Math.max(0, Math.round((s.unlocked / s.total) * 100))) : 0;
  }

  return stats;
}

/**
 * Calculates rarity score summing xpReward across unique valid unlocked achievements.
 */
export function calculateAchievementRarityScore(unlockedIds: string[] = []): number {
  if (!Array.isArray(unlockedIds) || unlockedIds.length === 0) {
    return 0;
  }
  const safeUnlocked = new Set(unlockedIds);
  let totalScore = 0;
  for (const ach of ACHIEVEMENTS) {
    if (safeUnlocked.has(ach.id)) {
      totalScore += ach.xpReward;
    }
  }
  return totalScore;
}

/**
 * Returns all achievements not present in unlockedIds, optionally filtered by category.
 */
export function getLockedAchievementsByCategory(
  unlockedIds: string[] = [],
  category?: string
): Achievement[] {
  const safeUnlocked = new Set(Array.isArray(unlockedIds) ? unlockedIds : []);
  return ACHIEVEMENTS.filter((ach) => {
    if (safeUnlocked.has(ach.id)) {
      return false;
    }
    if (category && category !== "all" && ach.category !== category) {
      return false;
    }
    return true;
  });
}
