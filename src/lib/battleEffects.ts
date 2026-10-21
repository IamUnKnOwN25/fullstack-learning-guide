/**
 * Pure calculation helpers for battle effects such as boss HP smooth transitions,
 * critical hit screen shakes, and confetti triggers.
 */

/**
 * Clamps HP percentage between 0 and 100 for boss HP smooth transitions.
 * @param currentHp The current HP of the boss.
 * @param maxHp The maximum HP of the boss.
 * @returns The HP percentage clamped between 0 and 100.
 */
export function calculateHpPercentage(currentHp: number, maxHp: number): number {
  if (maxHp <= 0) return 0;
  if (currentHp <= 0) return 0;
  if (currentHp >= maxHp) return 100;
  return (currentHp / maxHp) * 100;
}

/**
 * Returns intensity and duration for critical hit screen shakes based on damage percent or critical hits.
 * @param damage The amount of damage dealt.
 * @param maxHp The maximum HP of the target.
 * @param isCritical Whether the hit was a critical hit.
 * @returns The screen shake intensity string ('none', 'sm', 'md', 'lg', 'xl').
 */
export function calculateScreenShakeIntensity(damage: number, maxHp: number, isCritical: boolean): string {
  if (damage <= 0 || maxHp <= 0) return 'none';

  const damagePercentage = damage / maxHp;

  if (damagePercentage >= 0.5) return 'xl';
  if (isCritical || damagePercentage >= 0.25) return 'lg';
  if (damagePercentage >= 0.1) return 'md';
  return 'sm';
}

/**
 * Determines the number of confetti triggers upon defeating a boss.
 * @param isBossDefeated Whether the boss has been defeated.
 * @param comboCount The number of consecutive hits or combo multiplier.
 * @returns The number of confetti triggers.
 */
export function calculateConfettiTriggers(isBossDefeated: boolean, comboCount: number): number {
  if (!isBossDefeated) return 0;

  // Base trigger for defeating a boss
  let triggers = 1;

  if (comboCount > 10) {
    triggers += 3;
  } else if (comboCount > 5) {
    triggers += 2;
  } else if (comboCount > 0) {
    triggers += 1;
  }

  return triggers;
}
