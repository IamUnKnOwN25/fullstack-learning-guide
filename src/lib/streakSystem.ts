export interface StreakState {
  streakDays: number;
  lastLoginDate: string | null; // Format: YYYY-MM-DD
}

function parseDateUtc(dateStr: string | null | undefined): number | null {
  if (!dateStr || typeof dateStr !== "string") return null;
  const parts = dateStr.trim().split("-");
  if (parts.length !== 3) return null;
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return null;
  }
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }
  const timestamp = Date.UTC(year, month - 1, day);
  if (!Number.isFinite(timestamp)) {
    return null;
  }
  const d = new Date(timestamp);
  if (d.getUTCFullYear() !== year || d.getUTCMonth() !== month - 1 || d.getUTCDate() !== day) {
    return null;
  }
  return timestamp;
}

export function calculateStreakBonus(streakDays: number): {
  multiplier: number;
  bonusPercent: number;
} {
  const safeDays = Number.isFinite(streakDays) ? Math.max(1, Math.floor(streakDays)) : 1;
  const bonusPercent = Math.min(30, (safeDays - 1) * 5);
  const multiplier = Number((1 + bonusPercent / 100).toFixed(2));
  return { multiplier, bonusPercent };
}

export interface StreakMilestone {
  days: number;
  title: string;
  badge: string;
  description: string;
}

export const STREAK_MILESTONES: StreakMilestone[] = [
  { days: 1, title: "Initiate", badge: "🌱", description: "First step into the Matrix." },
  { days: 3, title: "Consistent Hacker", badge: "⚡", description: "3 consecutive days of coding." },
  { days: 7, title: "Weekly Sentinel", badge: "🛡️", description: "A full week of persistent discipline." },
  { days: 14, title: "Fortnight Champion", badge: "⚔️", description: "Two weeks without missing a directive." },
  { days: 30, title: "Monthly Grandmaster", badge: "👑", description: "30-day streak in the Web Matrix." },
  { days: 100, title: "Century Legend", badge: "🌟", description: "Unstoppable 100-day matrix titan." },
];

export function getStreakMilestone(streakDays: number): StreakMilestone {
  const safeDays = Number.isFinite(streakDays) ? Math.max(1, Math.floor(streakDays)) : 1;
  let earned = STREAK_MILESTONES[0];
  for (const m of STREAK_MILESTONES) {
    if (safeDays >= m.days) {
      earned = m;
    } else {
      break;
    }
  }
  return earned;
}

export function getNextStreakMilestone(streakDays: number): {
  milestone: StreakMilestone;
  daysRemaining: number;
} | null {
  if (typeof streakDays === "number" && streakDays >= 100) {
    return null;
  }
  const safeDays =
    Number.isFinite(streakDays) && streakDays > 0
      ? Math.floor(streakDays)
      : 1;

  if (safeDays >= 100) {
    return null;
  }

  for (const m of STREAK_MILESTONES) {
    if (m.days > safeDays) {
      return {
        milestone: m,
        daysRemaining: m.days - safeDays,
      };
    }
  }

  return null;
}

/**
 * Determines if the player's streak is at risk of breaking (1 day since last login, hasn't checked in today).
 */
export function isStreakAtRisk(lastLoginDate: string | null, todayDateStr: string): boolean {
  const lastTime = parseDateUtc(lastLoginDate);
  const todayTime = parseDateUtc(todayDateStr);
  if (lastTime === null || todayTime === null) return false;

  const diffDays = Math.round((todayTime - lastTime) / (1000 * 60 * 60 * 24));
  return diffDays === 1;
}

export function updateStreak(currentStreak: StreakState, todayDateStr: string): {
  streak: StreakState;
  streakReset: boolean;
} {
  const safeStreakDays =
    currentStreak && Number.isFinite(currentStreak.streakDays) && currentStreak.streakDays > 0
      ? Math.floor(currentStreak.streakDays)
      : 1;

  if (!currentStreak || !currentStreak.lastLoginDate) {
    return {
      streak: { streakDays: 1, lastLoginDate: todayDateStr },
      streakReset: false,
    };
  }

  const lastTime = parseDateUtc(currentStreak.lastLoginDate);
  const todayTime = parseDateUtc(todayDateStr);

  if (lastTime === null || todayTime === null) {
    return {
      streak: { streakDays: 1, lastLoginDate: todayDateStr },
      streakReset: true,
    };
  }

  const diffMs = todayTime - lastTime;
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (!Number.isFinite(diffDays)) {
    return {
      streak: { streakDays: 1, lastLoginDate: todayDateStr },
      streakReset: true,
    };
  }

  if (diffDays === 0) {
    return {
      streak: {
        streakDays: safeStreakDays,
        lastLoginDate: currentStreak.lastLoginDate,
      },
      streakReset: false,
    };
  } else if (diffDays === 1) {
    return {
      streak: { streakDays: safeStreakDays + 1, lastLoginDate: todayDateStr },
      streakReset: false,
    };
  } else if (diffDays > 1) {
    return {
      streak: { streakDays: 1, lastLoginDate: todayDateStr },
      streakReset: true,
    };
  } else {
    // Time traveling to the past, ignore
    return {
      streak: {
        streakDays: safeStreakDays,
        lastLoginDate: currentStreak.lastLoginDate,
      },
      streakReset: false,
    };
  }
}

export interface StreakFreezeResult {
  streak: StreakState;
  streakReset: boolean;
  freezesRemaining: number;
  freezeConsumed: boolean;
}

/**
 * Updates streak with freeze protection. If days are missed and sufficient freezes exist,
 * freezes are consumed to preserve the current streak.
 */
export function updateStreakWithFreeze(
  currentStreak: StreakState,
  todayDateStr: string,
  freezesAvailable: number
): StreakFreezeResult {
  const safeFreezes = Number.isFinite(freezesAvailable)
    ? Math.max(0, Math.floor(freezesAvailable))
    : 0;

  const safeStreakDays =
    currentStreak && Number.isFinite(currentStreak.streakDays) && currentStreak.streakDays > 0
      ? Math.floor(currentStreak.streakDays)
      : 1;

  if (!currentStreak || !currentStreak.lastLoginDate) {
    return {
      streak: { streakDays: 1, lastLoginDate: todayDateStr },
      streakReset: false,
      freezesRemaining: safeFreezes,
      freezeConsumed: false,
    };
  }

  const lastTime = parseDateUtc(currentStreak.lastLoginDate);
  const todayTime = parseDateUtc(todayDateStr);

  if (lastTime === null || todayTime === null) {
    return {
      streak: { streakDays: 1, lastLoginDate: todayDateStr },
      streakReset: true,
      freezesRemaining: safeFreezes,
      freezeConsumed: false,
    };
  }

  const diffMs = todayTime - lastTime;
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (!Number.isFinite(diffDays)) {
    return {
      streak: { streakDays: 1, lastLoginDate: todayDateStr },
      streakReset: true,
      freezesRemaining: safeFreezes,
      freezeConsumed: false,
    };
  }

  if (diffDays <= 0) {
    return {
      streak: {
        streakDays: safeStreakDays,
        lastLoginDate: currentStreak.lastLoginDate,
      },
      streakReset: false,
      freezesRemaining: safeFreezes,
      freezeConsumed: false,
    };
  }

  if (diffDays === 1) {
    return {
      streak: { streakDays: safeStreakDays + 1, lastLoginDate: todayDateStr },
      streakReset: false,
      freezesRemaining: safeFreezes,
      freezeConsumed: false,
    };
  }

  // diffDays > 1 (missed at least one day)
  const missedDays = diffDays - 1;
  if (safeFreezes >= missedDays) {
    // Preserved via freeze shield
    return {
      streak: { streakDays: safeStreakDays + 1, lastLoginDate: todayDateStr },
      streakReset: false,
      freezesRemaining: safeFreezes - missedDays,
      freezeConsumed: true,
    };
  }

  // Not enough freezes, streak resets
  return {
    streak: { streakDays: 1, lastLoginDate: todayDateStr },
    streakReset: true,
    freezesRemaining: safeFreezes,
    freezeConsumed: false,
  };
}

export function getStreakSummary(
  streakDays: number,
  lastLoginDate: string | null,
  todayDateStr: string,
  freezesAvailable: number = 0
) {
  const safeDays = Number.isFinite(streakDays) ? Math.max(1, Math.floor(streakDays)) : 1;
  const bonus = calculateStreakBonus(safeDays);
  const milestone = getStreakMilestone(safeDays);
  const nextMilestone = getNextStreakMilestone(safeDays);
  const atRisk = isStreakAtRisk(lastLoginDate, todayDateStr);

  return {
    streakDays: safeDays,
    lastLoginDate,
    multiplier: bonus.multiplier,
    bonusPercent: bonus.bonusPercent,
    milestone,
    nextMilestone,
    isAtRisk: atRisk,
    freezesAvailable: Math.max(0, Math.floor(freezesAvailable || 0)),
  };
}

export type StreakTier = "none" | "spark" | "flame" | "inferno" | "supernova";

export interface StreakTierResult {
  tier: StreakTier;
  multiplier: number;
}

export function getStreakTier(streakDays: number): StreakTierResult {
  const safeDays = Number.isFinite(streakDays) ? Math.floor(streakDays) : 0;
  if (safeDays <= 0) {
    return { tier: "none", multiplier: 1.0 };
  }
  if (safeDays <= 2) {
    return { tier: "spark", multiplier: 1.05 };
  }
  if (safeDays <= 6) {
    return { tier: "flame", multiplier: 1.1 };
  }
  if (safeDays <= 13) {
    return { tier: "inferno", multiplier: 1.25 };
  }
  return { tier: "supernova", multiplier: 1.5 };
}

export interface StreakProjectionResult {
  survivingStreak: number;
  freezesRemaining: number;
  broken: boolean;
}

export function projectStreakStatus(
  currentStreak: number,
  daysMissed: number,
  freezesAvailable: number
): StreakProjectionResult {
  const safeStreak = Number.isFinite(currentStreak) ? Math.max(0, Math.floor(currentStreak)) : 0;
  const safeMissed = Number.isFinite(daysMissed) ? Math.max(0, Math.floor(daysMissed)) : 0;
  const safeFreezes = Number.isFinite(freezesAvailable) ? Math.max(0, Math.floor(freezesAvailable)) : 0;

  if (safeMissed === 0) {
    return {
      survivingStreak: safeStreak,
      freezesRemaining: safeFreezes,
      broken: false,
    };
  }

  if (safeFreezes >= safeMissed) {
    return {
      survivingStreak: safeStreak,
      freezesRemaining: safeFreezes - safeMissed,
      broken: false,
    };
  }

  return {
    survivingStreak: 0,
    freezesRemaining: safeFreezes,
    broken: true,
  };
}

export interface StreakActivityEntry {
  date: string;
  active: boolean;
}

function formatDateUtc(timestamp: number): string {
  const d = new Date(timestamp);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function generateStreakActivityMap(
  activeDates: string[],
  referenceDateStr: string,
  daysCount: number = 7
): StreakActivityEntry[] {
  const refTime = parseDateUtc(referenceDateStr);
  if (refTime === null) {
    return [];
  }

  const safeCount = Number.isFinite(daysCount) ? Math.max(0, Math.floor(daysCount)) : 7;
  if (safeCount <= 0) {
    return [];
  }

  const activeSet = new Set(Array.isArray(activeDates) ? activeDates : []);
  const result: StreakActivityEntry[] = [];
  const DAY_MS = 24 * 60 * 60 * 1000;

  for (let i = safeCount - 1; i >= 0; i--) {
    const timestamp = refTime - i * DAY_MS;
    const dateStr = formatDateUtc(timestamp);
    result.push({
      date: dateStr,
      active: activeSet.has(dateStr),
    });
  }

  return result;
}
