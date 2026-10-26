export interface RankTier {
  level: number;
  title: string;
  subtitle: string;
  realmTheme: string;
  color: string;
  badgeIcon: string;
  lore: string;
}

export interface LevelProgress {
  currentLevel: number;
  nextLevel: number;
  currentLevelBaseXp: number;
  nextLevelTargetXp: number;
  xpIntoCurrentLevel: number;
  xpNeededForNextLevel: number;
  progressPercent: number;
}

export interface XpGainEvent {
  amount: number;
  source: string;
  streakBonus: number;
  timestamp: number;
}

export interface LevelUpNotification {
  previousLevel: number;
  newLevel: number;
  newRankTitle: string;
  isNewRank: boolean;
  unlockedSkillPoints: number;
  maxHp: number;
  maxMana: number;
}

export const RANKS: RankTier[] = [
  {
    level: 1,
    title: "Novice Byte",
    subtitle: "Awakened in the Digital Void",
    realmTheme: "HTML Foundations",
    color: "text-gray-300",
    badgeIcon: "Terminal",
    lore: "Freshly booted cadet learning the foundational syntax of the Web Matrix.",
  },
  {
    level: 3,
    title: "Markup Apprentice",
    subtitle: "Structuring Semantic Realities",
    realmTheme: "HTML & Semantics",
    color: "text-matrix-neonCyan",
    badgeIcon: "FileCode",
    lore: "Commanding semantic document trees, accessible landmarks, and SEO metadata.",
  },
  {
    level: 6,
    title: "Style Weaver",
    subtitle: "Bending Cascade, Grid & Flexbox",
    realmTheme: "CSS Citadel",
    color: "text-matrix-accent",
    badgeIcon: "Sparkles",
    lore: "Weaving fluid responsive layouts, CSS variables, and modern visual aesthetics.",
  },
  {
    level: 10,
    title: "DOM Enchanter",
    subtitle: "Mastering Asynchronous Event Loops",
    realmTheme: "Modern JavaScript",
    color: "text-matrix-neonGold",
    badgeIcon: "Zap",
    lore: "Harnessing closures, promises, microtask queues, and dynamic DOM manipulation.",
  },
  {
    level: 15,
    title: "Type Warden",
    subtitle: "Banishing the Any-Demon",
    realmTheme: "Strict TypeScript",
    color: "text-blue-400",
    badgeIcon: "Shield",
    lore: "Enforcing strict compile-time type safety with discriminated unions and generics.",
  },
  {
    level: 20,
    title: "Component Artisan",
    subtitle: "Orchestrating Pure State Flow",
    realmTheme: "React & Next.js",
    color: "text-cyan-400",
    badgeIcon: "Atom",
    lore: "Architecting modular reactive components, custom hooks, and server actions.",
  },
  {
    level: 26,
    title: "Backend Conduit",
    subtitle: "Piping Microservices & REST APIs",
    realmTheme: "Node.js Engine",
    color: "text-emerald-400",
    badgeIcon: "Server",
    lore: "Directing non-blocking HTTP event loops, Express pipelines, and JWT security.",
  },
  {
    level: 32,
    title: "Relational Sage",
    subtitle: "Binding ACID Transactions",
    realmTheme: "Databases & SQL",
    color: "text-amber-400",
    badgeIcon: "Database",
    lore: "Optimizing balanced B-Trees, relational schemas, indexes, and parameterized queries.",
  },
  {
    level: 38,
    title: "DevOps Fleet Admiral",
    subtitle: "Commanding Immutable Docker Vessels",
    realmTheme: "DevOps & Cloud",
    color: "text-indigo-400",
    badgeIcon: "Cpu",
    lore: "Deploying multi-stage container pipelines, CI/CD orchestration, and cloud clusters.",
  },
  {
    level: 44,
    title: "Aegis Sentinel",
    subtitle: "Hardening Against Zero-Day Exploits",
    realmTheme: "Security & Testing",
    color: "text-pink-400",
    badgeIcon: "Lock",
    lore: "Constructing deterministic TDD suites and shielding against XSS, CSRF, and injection.",
  },
  {
    level: 50,
    title: "Full-Stack Grandmaster",
    subtitle: "The Matrix Core Bends to Your Code",
    realmTheme: "Matrix Core Capstone",
    color: "text-matrix-neonGold",
    badgeIcon: "Crown",
    lore: "Supreme mastery over the full web development stack from bare metal to UX.",
  },
];

export function calculateLevel(xp: number): number {
  if (!Number.isFinite(xp) || xp <= 0) return 1;
  return Math.floor(Math.sqrt(xp / 25)) + 1;
}

export function getXpForLevel(level: number): number {
  const safeLevel = Number.isFinite(level) ? Math.max(1, Math.floor(level)) : 1;
  return Math.pow(safeLevel - 1, 2) * 25;
}

export function getNextLevelXp(level: number): number {
  const safeLevel = Number.isFinite(level) ? Math.max(1, Math.floor(level)) : 1;
  return Math.pow(safeLevel, 2) * 25;
}

export function getLevelProgress(xp: number): LevelProgress {
  const safeXp = Number.isFinite(xp) ? Math.max(0, xp) : 0;
  const currentLevel = calculateLevel(safeXp);
  const nextLevel = currentLevel + 1;
  const currentLevelBaseXp = getXpForLevel(currentLevel);
  const nextLevelTargetXp = getNextLevelXp(currentLevel);
  const span = Math.max(1, nextLevelTargetXp - currentLevelBaseXp);
  const xpIntoCurrentLevel = Math.max(0, safeXp - currentLevelBaseXp);
  const xpNeededForNextLevel = Math.max(0, nextLevelTargetXp - safeXp);
  const progressPercent = Math.min(
    100,
    Math.max(0, (xpIntoCurrentLevel / span) * 100)
  );

  return {
    currentLevel,
    nextLevel,
    currentLevelBaseXp,
    nextLevelTargetXp,
    xpIntoCurrentLevel,
    xpNeededForNextLevel,
    progressPercent,
  };
}

export function calculateRank(level: number): string {
  const safeLevel = Number.isFinite(level) ? Math.max(1, Math.floor(level)) : 1;
  let currentTitle = RANKS[0].title;
  for (const r of RANKS) {
    if (safeLevel >= r.level) {
      currentTitle = r.title;
    } else {
      break;
    }
  }
  return currentTitle;
}

export function getRankTier(level: number): RankTier {
  const safeLevel = Number.isFinite(level) ? Math.max(1, Math.floor(level)) : 1;
  let currentTier = RANKS[0];
  for (const r of RANKS) {
    if (safeLevel >= r.level) {
      currentTier = r;
    } else {
      break;
    }
  }
  return currentTier;
}

export function calculateStreakBonus(streakDays: number): {
  multiplier: number;
  bonusPercent: number;
} {
  const safeDays = Number.isFinite(streakDays) ? Math.max(1, Math.floor(streakDays)) : 1;
  // 1 day = 0% bonus (1.0x), 2 days = 5% (1.05x), up to 30% max (1.30x)
  const bonusPercent = Math.min(30, (safeDays - 1) * 5);
  const multiplier = Number((1 + bonusPercent / 100).toFixed(2));
  return { multiplier, bonusPercent };
}

export function calculateHpForLevel(level: number): number {
  const safeLevel = Number.isFinite(level) ? Math.max(1, Math.floor(level)) : 1;
  return 100 + (safeLevel - 1) * 10;
}

export function calculateManaForLevel(level: number): number {
  const safeLevel = Number.isFinite(level) ? Math.max(1, Math.floor(level)) : 1;
  return 50 + (safeLevel - 1) * 5;
}

/**
 * Evaluates whether an XP increment produces one or multiple level-ups.
 * Calculates exact new level, whether new rank tier was crossed, and unlocked skill points.
 */
export function evaluateLevelUp(
  currentXp: number,
  earnedXp: number
): {
  previousLevel: number;
  newLevel: number;
  didLevelUp: boolean;
  levelsGained: number;
  previousRank: string;
  newRank: string;
  isNewRank: boolean;
} {
  const safeCurrentXp = Number.isFinite(currentXp) ? Math.max(0, currentXp) : 0;
  const safeEarnedXp = Number.isFinite(earnedXp) ? Math.max(0, earnedXp) : 0;
  const previousLevel = calculateLevel(safeCurrentXp);
  const newLevel = calculateLevel(safeCurrentXp + safeEarnedXp);
  const didLevelUp = newLevel > previousLevel;
  const levelsGained = Math.max(0, newLevel - previousLevel);
  const previousRank = calculateRank(previousLevel);
  const newRank = calculateRank(newLevel);
  const isNewRank = didLevelUp && newRank !== previousRank;

  return {
    previousLevel,
    newLevel,
    didLevelUp,
    levelsGained,
    previousRank,
    newRank,
    isNewRank,
  };
}
