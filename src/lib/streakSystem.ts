export interface StreakState {
  streakDays: number;
  lastLoginDate: string | null; // Format: YYYY-MM-DD
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

/**
 * Determines if the player's streak is at risk of breaking (1 day since last login, hasn't checked in today).
 */
export function isStreakAtRisk(lastLoginDate: string | null, todayDateStr: string): boolean {
  if (!lastLoginDate || !todayDateStr) return false;
  const lastDateParts = lastLoginDate.split("-");
  const todayParts = todayDateStr.split("-");
  if (lastDateParts.length !== 3 || todayParts.length !== 3) return false;

  const lastDate = new Date(Date.UTC(+lastDateParts[0], +lastDateParts[1] - 1, +lastDateParts[2]));
  const todayDate = new Date(Date.UTC(+todayParts[0], +todayParts[1] - 1, +todayParts[2]));
  const diffDays = Math.round((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays === 1;
}

export function updateStreak(currentStreak: StreakState, todayDateStr: string): {
  streak: StreakState;
  streakReset: boolean;
} {
  if (!currentStreak || !currentStreak.lastLoginDate) {
    return {
      streak: { streakDays: 1, lastLoginDate: todayDateStr },
      streakReset: false,
    };
  }

  const lastDateParts = currentStreak.lastLoginDate.split('-');
  const todayParts = (todayDateStr || "").split('-');
  
  if (lastDateParts.length !== 3 || todayParts.length !== 3) {
    return {
      streak: { streakDays: 1, lastLoginDate: todayDateStr },
      streakReset: true,
    };
  }

  const lastDate = new Date(Date.UTC(+lastDateParts[0], +lastDateParts[1] - 1, +lastDateParts[2]));
  const todayDate = new Date(Date.UTC(+todayParts[0], +todayParts[1] - 1, +todayParts[2]));

  const diffMs = todayDate.getTime() - lastDate.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return { streak: currentStreak, streakReset: false };
  } else if (diffDays === 1) {
    return {
      streak: { streakDays: currentStreak.streakDays + 1, lastLoginDate: todayDateStr },
      streakReset: false,
    };
  } else if (diffDays > 1) {
    return {
      streak: { streakDays: 1, lastLoginDate: todayDateStr },
      streakReset: true,
    };
  } else {
    // Time traveling to the past, ignore
    return { streak: currentStreak, streakReset: false };
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

  if (!currentStreak || !currentStreak.lastLoginDate) {
    return {
      streak: { streakDays: 1, lastLoginDate: todayDateStr },
      streakReset: false,
      freezesRemaining: safeFreezes,
      freezeConsumed: false,
    };
  }

  const lastDateParts = currentStreak.lastLoginDate.split("-");
  const todayParts = (todayDateStr || "").split("-");

  if (lastDateParts.length !== 3 || todayParts.length !== 3) {
    return {
      streak: { streakDays: 1, lastLoginDate: todayDateStr },
      streakReset: true,
      freezesRemaining: safeFreezes,
      freezeConsumed: false,
    };
  }

  const lastDate = new Date(Date.UTC(+lastDateParts[0], +lastDateParts[1] - 1, +lastDateParts[2]));
  const todayDate = new Date(Date.UTC(+todayParts[0], +todayParts[1] - 1, +todayParts[2]));

  const diffMs = todayDate.getTime() - lastDate.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return {
      streak: currentStreak,
      streakReset: false,
      freezesRemaining: safeFreezes,
      freezeConsumed: false,
    };
  }

  if (diffDays === 1) {
    return {
      streak: { streakDays: currentStreak.streakDays + 1, lastLoginDate: todayDateStr },
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
      streak: { streakDays: currentStreak.streakDays + 1, lastLoginDate: todayDateStr },
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
  const atRisk = isStreakAtRisk(lastLoginDate, todayDateStr);

  return {
    streakDays: safeDays,
    lastLoginDate,
    multiplier: bonus.multiplier,
    bonusPercent: bonus.bonusPercent,
    milestone,
    isAtRisk: atRisk,
    freezesAvailable: Math.max(0, Math.floor(freezesAvailable || 0)),
  };
}
