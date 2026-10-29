/**
 * Pure calculation helpers for battle effects such as boss HP smooth transitions,
 * critical hit screen shakes, and confetti triggers.
 */

/**
 * Sanitizes particle counts to non-negative integers, guarding against NaN and non-finite values.
 */
export function sanitizeParticleCount(count: number): number {
  if (!Number.isFinite(count) || count <= 0) return 0;
  return Math.floor(count);
}

/**
 * Clamps screen shake damage to [0, 10], guarding against non-finite values.
 */
export function sanitizeScreenShakeDamage(damage: number): number {
  if (!Number.isFinite(damage) || damage <= 0) return 0;
  return Math.min(10, damage);
}

/**
 * Clamps HP percentage between 0 and 100 for boss HP smooth transitions.
 * Ensures both currentHp and maxHp are checked with Number.isFinite and maxHp > 0 before dividing.
 * @param currentHp The current HP of the boss.
 * @param maxHp The maximum HP of the boss.
 * @returns The HP percentage clamped between 0 and 100.
 */
export function calculateHpPercentage(currentHp: number, maxHp: number): number {
  if (!Number.isFinite(currentHp) || !Number.isFinite(maxHp) || maxHp <= 0 || currentHp <= 0) {
    return 0;
  }
  if (currentHp >= maxHp) return 100;
  const percentage = (currentHp / maxHp) * 100;
  return Math.min(100, Math.max(0, percentage));
}

export interface ScreenShakeOptions {
  damage: number;
  maxHp?: number;
  isCritical?: boolean;
}

/**
 * Returns intensity and duration for critical hit screen shakes based on damage percent or critical hits.
 * When called with damage only (or maxHp omitted), checks Number.isFinite and clamps damage >= 0 up to max 10.
 * @param damageOrOptions The amount of damage dealt or a ScreenShakeOptions configuration.
 * @param maxHp The maximum HP of the target (optional). If omitted, damage is clamped to [0, 10].
 * @param isCritical Whether the hit was a critical hit.
 * @returns The screen shake intensity string ('none', 'sm', 'md', 'lg', 'xl').
 */
export function calculateScreenShakeIntensity(
  damageOrOptions: number | ScreenShakeOptions,
  maxHp?: number,
  isCritical: boolean = false
): string {
  let damage: number;
  let targetMaxHp = maxHp;
  let hitIsCritical = isCritical;

  if (typeof damageOrOptions === 'object' && damageOrOptions !== null) {
    damage = damageOrOptions.damage;
    if (damageOrOptions.maxHp !== undefined) targetMaxHp = damageOrOptions.maxHp;
    if (damageOrOptions.isCritical !== undefined) hitIsCritical = Boolean(damageOrOptions.isCritical);
  } else {
    damage = damageOrOptions;
  }

  if (!Number.isFinite(damage) || damage <= 0) return 'none';

  // If maxHp is omitted, clamp damage >= 0 up to max 10 and scale relative to 10
  if (targetMaxHp === undefined) {
    const clampedDamage = sanitizeScreenShakeDamage(damage);
    if (clampedDamage <= 0) return 'none';
    const damagePercentage = clampedDamage / 10;
    if (damagePercentage >= 0.5) return 'xl';
    if (hitIsCritical || damagePercentage >= 0.25) return 'lg';
    if (damagePercentage >= 0.1) return 'md';
    return 'sm';
  }

  if (!Number.isFinite(targetMaxHp) || targetMaxHp <= 0) return 'none';

  const damagePercentage = damage / targetMaxHp;

  if (damagePercentage >= 0.5) return 'xl';
  if (hitIsCritical || damagePercentage >= 0.25) return 'lg';
  if (damagePercentage >= 0.1) return 'md';
  return 'sm';
}

export interface ConfettiEvent {
  isBossDefeated?: boolean;
  comboCount?: number;
  particleCount?: number;
  [key: string]: unknown;
}

/**
 * Determines the number of confetti triggers upon defeating a boss.
 * Accepts either boolean defeat state or an event object with particle/combo counts sanitized to positive integers.
 * @param isBossDefeatedOrEvent Whether the boss has been defeated or an event object.
 * @param comboCount The number of consecutive hits or combo multiplier.
 * @returns The number of confetti triggers.
 */
export function calculateConfettiTriggers(
  isBossDefeatedOrEvent: boolean | ConfettiEvent,
  comboCount?: number
): number {
  let isBossDefeated: boolean;
  let rawCount: number | undefined;

  if (typeof isBossDefeatedOrEvent === 'object' && isBossDefeatedOrEvent !== null) {
    isBossDefeated = Boolean(isBossDefeatedOrEvent.isBossDefeated);
    rawCount = typeof isBossDefeatedOrEvent.particleCount === 'number'
      ? isBossDefeatedOrEvent.particleCount
      : typeof isBossDefeatedOrEvent.comboCount === 'number'
        ? isBossDefeatedOrEvent.comboCount
        : undefined;
  } else {
    isBossDefeated = Boolean(isBossDefeatedOrEvent);
    rawCount = comboCount;
  }

  if (!isBossDefeated) return 0;

  // Base trigger for defeating a boss
  let triggers = 1;

  if (rawCount === undefined || !Number.isFinite(rawCount) || rawCount <= 0) {
    return triggers;
  }

  const sanitizedCount = sanitizeParticleCount(rawCount);

  if (sanitizedCount > 10) {
    triggers += 3;
  } else if (sanitizedCount > 5) {
    triggers += 2;
  } else if (sanitizedCount > 0) {
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
  const safeCount = Math.min(50, sanitizeParticleCount(count));
  if (safeCount === 0) return [];

  const safeOriginX = Number.isFinite(originX) ? originX : 0;
  const safeOriginY = Number.isFinite(originY) ? originY : 0;

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
      x: safeOriginX,
      y: safeOriginY,
      vx: Number(Math.cos(angle) * speed),
      vy: Number(Math.sin(angle) * speed),
      color: palette[i % palette.length],
      size: 2 + (i % 4),
      opacity: 1.0,
    });
  }
  return particles;
}
