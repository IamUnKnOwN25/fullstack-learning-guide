import { SKILL_TREE, SkillNode } from "../data/skills";

/**
 * Calculates the total skill points a player has earned based on their level.
 * Currently, players earn 1 skill point per level starting from level 1.
 */
export const calculateTotalEarnedSkillPoints = (level: number): number => {
  return Math.max(0, level);
};

/**
 * Calculates the total cost of all currently unlocked skills.
 */
export const calculateSpentSkillPoints = (unlockedSkills: string[]): number => {
  return unlockedSkills.reduce((totalCost, skillId) => {
    const skill = SKILL_TREE.find((s) => s.id === skillId);
    return totalCost + (skill ? skill.cost : 0);
  }, 0);
};

/**
 * Calculates the remaining available skill points a player can spend.
 */
export const calculateAvailableSkillPoints = (level: number, unlockedSkills: string[]): number => {
  const totalEarned = calculateTotalEarnedSkillPoints(level);
  const totalSpent = calculateSpentSkillPoints(unlockedSkills);
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
 */
export const validateSkillUnlock = (
  skillId: string,
  level: number,
  unlockedSkills: string[]
): SkillValidationResult => {
  const skill = SKILL_TREE.find((s) => s.id === skillId);

  if (!skill) {
    return { canUnlock: false, reason: "Skill not found." };
  }

  if (unlockedSkills.includes(skillId) || skill.unlockedByDefault) {
    return { canUnlock: false, reason: "Skill is already unlocked." };
  }

  if (skill.prerequisiteId && !unlockedSkills.includes(skill.prerequisiteId)) {
    return { canUnlock: false, reason: "Prerequisite skill is missing." };
  }

  const availablePoints = calculateAvailableSkillPoints(level, unlockedSkills);
  if (availablePoints < skill.cost) {
    return { canUnlock: false, reason: "Not enough skill points." };
  }

  return { canUnlock: true };
};
