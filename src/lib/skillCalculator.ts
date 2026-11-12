import { SKILL_TREE, SkillNode } from "../data/skills";

/**
 * Calculates the total skill points a player has earned based on their level.
 * Currently, players earn 1 skill point per level starting from level 1.
 * Safely guards against NaN, non-finite values, and fractional levels.
 */
export const calculateTotalEarnedSkillPoints = (level: number): number => {
  if (typeof level !== "number" || !Number.isFinite(level)) return 0;
  return Math.max(0, Math.floor(level));
};

/**
 * Calculates the total cost of all currently unlocked skills.
 */
export const calculateSpentSkillPoints = (unlockedSkills: string[]): number => {
  if (!Array.isArray(unlockedSkills)) return 0;
  return unlockedSkills.reduce((totalCost, skillId) => {
    const skill = SKILL_TREE.find((s) => s.id === skillId);
    return totalCost + (skill ? skill.cost : 0);
  }, 0);
};

/**
 * Calculates the remaining available skill points a player can spend.
 * Sanitizes level with Number.isFinite and Math.max(1, Math.floor(level)).
 * Ensures available skill points never return negative numbers (clamped to 0).
 */
export const calculateAvailableSkillPoints = (
  level: number,
  unlockedSkills: string[] = []
): number => {
  if (typeof level !== "number" || !Number.isFinite(level)) {
    return 0;
  }
  const sanitizedLevel = Math.max(1, Math.floor(level));
  const totalEarned = calculateTotalEarnedSkillPoints(sanitizedLevel);
  const totalSpent = calculateSpentSkillPoints(unlockedSkills || []);
  return Math.max(0, totalEarned - totalSpent);
};

/**
 * Result of a skill unlock validation.
 */
export interface SkillValidationResult {
  canUnlock: boolean;
  reason?: string;
}

/**
 * Validates if a player can unlock a specific skill.
 * Ensures skillId is a non-empty string and available points / level is finite and >= 0.
 */
export const validateSkillUnlock = (
  skillId: string,
  level: number,
  unlockedSkills: string[] = []
): SkillValidationResult => {
  if (!skillId || typeof skillId !== "string" || skillId.trim().length === 0) {
    return { canUnlock: false, reason: "Invalid skill ID." };
  }

  const skill = SKILL_TREE.find((s) => s.id === skillId);

  if (!skill) {
    return { canUnlock: false, reason: "Skill not found." };
  }

  const safeUnlocked = Array.isArray(unlockedSkills) ? unlockedSkills : [];

  if (safeUnlocked.includes(skillId) || skill.unlockedByDefault) {
    return { canUnlock: false, reason: "Skill is already unlocked." };
  }

  if (skill.prerequisiteId && !safeUnlocked.includes(skill.prerequisiteId)) {
    return { canUnlock: false, reason: "Prerequisite skill is missing." };
  }

  if (typeof level !== "number" || !Number.isFinite(level) || level < 0) {
    return { canUnlock: false, reason: "Not enough skill points." };
  }

  const availablePoints = calculateAvailableSkillPoints(level, safeUnlocked);
  if (!Number.isFinite(availablePoints) || availablePoints < 0 || availablePoints < skill.cost) {
    return { canUnlock: false, reason: "Not enough skill points." };
  }

  return { canUnlock: true };
};

/**
 * Summary metrics of a player's skill build.
 */
export interface SkillBuildSummary {
  totalUnlocked: number;
  totalCostSpent: number;
  byCategory: Record<string, number>;
  byTier: Record<number, number>;
}

/**
 * Calculates a summary of the player's current skill build,
 * tallying unique valid unlocked skills, total SP cost spent,
 * and skill counts grouped by category and tier.
 */
export const calculateSkillBuildSummary = (
  unlockedSkillIds: string[] = []
): {
  totalUnlocked: number;
  totalCostSpent: number;
  byCategory: Record<string, number>;
  byTier: Record<number, number>;
} => {
  if (!Array.isArray(unlockedSkillIds)) {
    return {
      totalUnlocked: 0,
      totalCostSpent: 0,
      byCategory: {},
      byTier: {},
    };
  }

  const uniqueIds = Array.from(
    new Set(
      unlockedSkillIds
        .filter((id): id is string => typeof id === "string" && id.trim().length > 0)
        .map((id) => id.trim())
    )
  );

  let totalUnlocked = 0;
  let totalCostSpent = 0;
  const byCategory: Record<string, number> = {};
  const byTier: Record<number, number> = {};

  for (const id of uniqueIds) {
    const skill = SKILL_TREE.find((s) => s.id === id);
    if (skill) {
      totalUnlocked += 1;
      const cost =
        typeof skill.cost === "number" && Number.isFinite(skill.cost) && skill.cost > 0
          ? skill.cost
          : 0;
      totalCostSpent += cost;

      if (skill.category) {
        byCategory[skill.category] = (byCategory[skill.category] || 0) + 1;
      }
      if (typeof skill.tier === "number" && Number.isFinite(skill.tier)) {
        byTier[skill.tier] = (byTier[skill.tier] || 0) + 1;
      }
    }
  }

  return {
    totalUnlocked,
    totalCostSpent,
    byCategory,
    byTier,
  };
};

/**
 * Returns IDs of locked skills whose level, cost, and prerequisite requirements
 * are currently met, sorted by cost ascending then tier ascending.
 */
export const getRecommendedNextSkills = (
  unlockedSkillIds: string[] = [],
  playerLevel: number = 1,
  availablePoints: number = 0
): string[] => {
  if (
    typeof playerLevel !== "number" ||
    !Number.isFinite(playerLevel) ||
    typeof availablePoints !== "number" ||
    !Number.isFinite(availablePoints) ||
    availablePoints < 0
  ) {
    return [];
  }

  const safeUnlocked = new Set(
    Array.isArray(unlockedSkillIds)
      ? unlockedSkillIds
          .filter((id): id is string => typeof id === "string" && id.trim().length > 0)
          .map((id) => id.trim())
      : []
  );

  const eligibleSkills: SkillNode[] = [];

  for (const skill of SKILL_TREE) {
    // 1. Must be locked (not in unlockedSkillIds and not unlockedByDefault)
    if (safeUnlocked.has(skill.id) || skill.unlockedByDefault === true) {
      continue;
    }

    // 2. Level requirement
    const requiredLevel =
      typeof skill.requiredLevel === "number" && Number.isFinite(skill.requiredLevel)
        ? skill.requiredLevel
        : 1;
    if (playerLevel < requiredLevel) {
      continue;
    }

    // 3. Cost requirement
    const cost =
      typeof skill.cost === "number" && Number.isFinite(skill.cost) && skill.cost >= 0
        ? skill.cost
        : 0;
    if (availablePoints < cost) {
      continue;
    }

    // 4. Prerequisite requirement
    const prereqIds: string[] = [];
    if (skill.prerequisiteId && typeof skill.prerequisiteId === "string" && skill.prerequisiteId.trim()) {
      prereqIds.push(skill.prerequisiteId.trim());
    }
    if (Array.isArray(skill.prerequisites)) {
      for (const p of skill.prerequisites) {
        if (typeof p === "string" && p.trim()) {
          prereqIds.push(p.trim());
        }
      }
    }

    const allPrereqsMet = prereqIds.every(
      (pid) => safeUnlocked.has(pid) || SKILL_TREE.find((s) => s.id === pid)?.unlockedByDefault === true
    );

    if (!allPrereqsMet) {
      continue;
    }

    eligibleSkills.push(skill);
  }

  // Sort by cost ascending, then tier ascending, then id ascending for determinism
  eligibleSkills.sort((a, b) => {
    const costA = typeof a.cost === "number" ? a.cost : 0;
    const costB = typeof b.cost === "number" ? b.cost : 0;
    if (costA !== costB) {
      return costA - costB;
    }
    const tierA = typeof a.tier === "number" ? a.tier : 1;
    const tierB = typeof b.tier === "number" ? b.tier : 1;
    if (tierA !== tierB) {
      return tierA - tierB;
    }
    return a.id.localeCompare(b.id);
  });

  return eligibleSkills.map((s) => s.id);
};

/**
 * Result of a skill refund feasibility check.
 */
export interface SkillRefundValidationResult {
  canRefund: boolean;
  dependentSkillIds: string[];
}

/**
 * Checks whether refunding skillIdToRefund would orphan any currently unlocked
 * downstream skill that lists it in prerequisites (or prerequisiteId).
 */
export const validateSkillRefund = (
  skillIdToRefund: string,
  unlockedSkillIds: string[] = []
): { canRefund: boolean; dependentSkillIds: string[] } => {
  if (!skillIdToRefund || typeof skillIdToRefund !== "string" || !skillIdToRefund.trim()) {
    return { canRefund: false, dependentSkillIds: [] };
  }

  const targetId = skillIdToRefund.trim();
  const safeUnlocked = Array.isArray(unlockedSkillIds)
    ? unlockedSkillIds
        .filter((id): id is string => typeof id === "string" && id.trim().length > 0)
        .map((id) => id.trim())
    : [];

  const skill = SKILL_TREE.find((s) => s.id === targetId);
  if (!skill) {
    return { canRefund: false, dependentSkillIds: [] };
  }

  const isUnlocked = safeUnlocked.includes(targetId) || skill.unlockedByDefault === true;
  if (!isUnlocked) {
    return { canRefund: false, dependentSkillIds: [] };
  }

  // Find all currently unlocked skills that list targetId as prerequisite
  const dependentSkillIds = safeUnlocked.filter((unlockedId) => {
    if (unlockedId === targetId) return false;
    const node = SKILL_TREE.find((s) => s.id === unlockedId);
    if (!node) return false;
    const matchesPrereqId = node.prerequisiteId === targetId;
    const matchesPrereqsArray =
      Array.isArray(node.prerequisites) && node.prerequisites.includes(targetId);
    return matchesPrereqId || matchesPrereqsArray;
  });

  const uniqueDependents = Array.from(new Set(dependentSkillIds));

  return {
    canRefund: uniqueDependents.length === 0,
    dependentSkillIds: uniqueDependents,
  };
};
