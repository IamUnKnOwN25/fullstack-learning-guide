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

/**
 * Calculates dynamic combo damage multiplier based on consecutive hits.
 * Clamps combo count to positive integers and caps multiplier at 3.0x.
 */
export function calculateComboMultiplier(comboCount: number): number {
  if (!Number.isFinite(comboCount) || comboCount <= 0) return 1.0;
  const validCombo = Math.floor(comboCount);
  // Multiplier grows +10% per hit up to combo of 20 (max 3.0x)
  const multiplier = 1.0 + Math.min(20, validCombo) * 0.1;
  return Number(multiplier.toFixed(2));
}

export interface ParticleVector {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  opacity: number;
}

/**
 * Generates deterministic particle emission vectors for critical hit or victory burst.
 */
export function generateParticleVectors(
  count: number,
  originX: number,
  originY: number,
  colorScheme: 'cyber' | 'gold' | 'neon' = 'cyber'
): ParticleVector[] {
  const safeCount = Math.min(50, Math.max(0, Math.floor(Number.isFinite(count) ? count : 0)));
  if (safeCount === 0) return [];

  const paletteMap: Record<string, string[]> = {
    cyber: ['#00FF66', '#00F0FF', '#39FF14'],
    gold: ['#FFD700', '#FFA500', '#FFFF00'],
    neon: ['#FF007F', '#7928CA', '#00DFD8'],
  };
  const palette = paletteMap[colorScheme] || paletteMap.cyber;

  const particles: ParticleVector[] = [];
  for (let i = 0; i < safeCount; i++) {
    const angle = (i / safeCount) * 2 * Math.PI;
    const speed = 2 + (i % 3);
    particles.push({
      x: originX,
      y: originY,
      vx: Number(Math.cos(angle) * speed),
      vy: Number(Math.sin(angle) * speed),
      color: palette[i % palette.length],
      size: 2 + (i % 4),
      opacity: 1.0,
    });
  }
  return particles;
}
