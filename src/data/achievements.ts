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
  checkProgress: (stats: PlayerStats) => {
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
    checkProgress: (s) => ({
      current: s.completedBosses.includes("html") ? 1 : 0,
      target: 1,
      isUnlocked: s.completedBosses.includes("html"),
    }),
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
    checkProgress: (s) => ({
      current: s.completedBosses.includes("css") ? 1 : 0,
      target: 1,
      isUnlocked: s.completedBosses.includes("css"),
    }),
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
    checkProgress: (s) => ({
      current: s.completedBosses.includes("javascript") ? 1 : 0,
      target: 1,
      isUnlocked: s.completedBosses.includes("javascript"),
    }),
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
    checkProgress: (s) => ({
      current: s.completedBosses.includes("typescript") ? 1 : 0,
      target: 1,
      isUnlocked: s.completedBosses.includes("typescript"),
    }),
  },
  {
    id: "boss_halfway",
    name: "Realm Vanguard",
    description: "Vanquish at least 6 realm boss monsters across the Web Matrix.",
    category: "bosses",
    rarity: "epic",
    icon: "Sword",
    xpReward: 350,
    checkProgress: (s) => ({
      current: Math.min(6, s.completedBosses.length),
      target: 6,
      isUnlocked: s.completedBosses.length >= 6,
    }),
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
    checkProgress: (s) => ({
      current: Math.min(12, s.completedBosses.length),
      target: 12,
      isUnlocked: s.completedBosses.length >= 12,
    }),
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
      const hasThreeStar = Object.values(s.stars || {}).some((stars) => stars === 3);
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
    checkProgress: (s) => ({
      current: Math.min(10, s.completedQuests.length),
      target: 10,
      isUnlocked: s.completedQuests.length >= 10,
    }),
  },
  {
    id: "quest_all_24",
    name: "Trial Grandmaster",
    description: "Solve all 24 interactive coding quests across the 12 realms.",
    category: "quests",
    rarity: "legendary",
    icon: "Trophy",
    xpReward: 750,
    checkProgress: (s) => ({
      current: Math.min(24, s.completedQuests.length),
      target: 24,
      isUnlocked: s.completedQuests.length >= 24,
    }),
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
      const sum = Object.values(s.stars || {}).reduce((acc, st) => acc + st, 0);
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
    checkProgress: (s) => ({
      current: Math.min(25, (s.completedCurriculumTasks || []).length),
      target: 25,
      isUnlocked: (s.completedCurriculumTasks || []).length >= 25,
    }),
  },
  {
    id: "chapters_milestone_5",
    name: "Vault Explorer",
    description: "Master 5 complete curriculum guides and test checkpoints.",
    category: "scholar",
    rarity: "epic",
    icon: "BookOpen",
    xpReward: 250,
    checkProgress: (s) => ({
      current: Math.min(5, (s.completedChapters || []).length),
      target: 5,
      isUnlocked: (s.completedChapters || []).length >= 5,
    }),
  },
  {
    id: "chapters_all_13",
    name: "Curriculum Sage",
    description: "Master all 13 curriculum guidebooks from HTML to System Design.",
    category: "scholar",
    rarity: "mythic",
    icon: "Crown",
    xpReward: 800,
    checkProgress: (s) => ({
      current: Math.min(13, (s.completedChapters || []).length),
      target: 13,
      isUnlocked: (s.completedChapters || []).length >= 13,
    }),
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
    checkProgress: (s) => ({
      current: s.unlockedSkills.length > 0 ? 1 : 0,
      target: 1,
      isUnlocked: s.unlockedSkills.length > 0,
    }),
  },
  {
    id: "streak_7_days",
    name: "Relentless Discipline",
    description: "Maintain an active 7-day coding streak and unlock max streak XP.",
    category: "mastery",
    rarity: "epic",
    icon: "Flame",
    xpReward: 400,
    checkProgress: (s) => ({
      current: Math.min(7, s.streak || 1),
      target: 7,
      isUnlocked: (s.streak || 1) >= 7,
    }),
  },
  {
    id: "level_25",
    name: "Backend Conduit Mastery",
    description: "Ascend to Level 25 or higher through diligent practice.",
    category: "mastery",
    rarity: "legendary",
    icon: "Award",
    xpReward: 500,
    checkProgress: (s) => ({
      current: Math.min(25, s.level),
      target: 25,
      isUnlocked: s.level >= 25,
    }),
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
      const unlocked = s.level >= 50 && s.unlockedSkills.includes("matrix_grandmaster");
      return { current: unlocked ? 1 : 0, target: 1, isUnlocked: unlocked };
    },
  },
];
