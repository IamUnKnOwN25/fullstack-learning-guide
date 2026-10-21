export interface StreakState {
  streakDays: number;
  lastLoginDate: string | null; // Format: YYYY-MM-DD
}

export function calculateStreakBonus(streakDays: number): {
  multiplier: number;
  bonusPercent: number;
} {
  const safeDays = Math.max(1, streakDays || 1);
  const bonusPercent = Math.min(30, (safeDays - 1) * 5);
  const multiplier = 1 + bonusPercent / 100;
  return { multiplier, bonusPercent };
}

export function updateStreak(currentStreak: StreakState, todayDateStr: string): {
  streak: StreakState;
  streakReset: boolean;
} {
  if (!currentStreak.lastLoginDate) {
    return {
      streak: { streakDays: 1, lastLoginDate: todayDateStr },
      streakReset: false,
    };
  }

  const lastDateParts = currentStreak.lastLoginDate.split('-');
  const todayParts = todayDateStr.split('-');
  
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
