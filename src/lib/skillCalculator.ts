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
