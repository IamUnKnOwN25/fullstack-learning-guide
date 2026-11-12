import { create } from "zustand";
import { persist } from "zustand/middleware";

export const MAX_SPEEDRUN_SPLITS = 100;

export interface SpeedrunRecord {
  questId: string;
  bestTimeMs: number;
  lastTimeMs: number;
  completionCount: number;
}

export interface SpeedrunSplit {
  label: string;
  timeMs: number;
}

export interface SpeedrunState {
  records: Record<string, SpeedrunRecord>;
  activeRuns: Record<string, number>; // questId -> startTimeMs
  pausedRuns: Record<string, number>; // questId -> accumulatedMs
  splits: Record<string, SpeedrunSplit[]>; // questId -> split milestones
}

export interface SpeedrunActions {
  startRun: (questId: string) => void;
  pauseRun: (questId: string) => boolean;
  resumeRun: (questId: string) => boolean;
  isPaused: (questId: string) => boolean;
  hasActiveRun: (questId: string) => boolean;
  recordSplit: (questId: string, label: string, customTimeMs?: number) => number | null;
  getSplits: (questId: string) => SpeedrunSplit[];
  clearSplits: (questId?: string) => void;
  finishRun: (questId: string) => { timeMs: number; isNewRecord: boolean } | null;
  completeRun: (questId: string) => { timeMs: number; isNewRecord: boolean } | null;
  cancelRun: (questId: string) => void;
  resetRun: (questId: string) => void;
  getRecord: (questId: string) => SpeedrunRecord | null;
  getElapsedMs: (questId: string) => number | null;
  getTotalCompletions: () => number;
  clearAllRecords: () => void;
}

export const formatSpeedrunTime = (ms: number): string => {
  if (typeof ms !== "number" || !Number.isFinite(ms) || ms <= 0) {
    return "00:00";
  }
  const totalSeconds = Math.floor(ms / 1000);
  if (ms >= 3600000) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

export const formatSpeedrunTimeWithMs = (ms: number): string => {
  if (typeof ms !== "number" || !Number.isFinite(ms) || ms <= 0) {
    return "00:00.000";
  }
  const totalSeconds = Math.floor(ms / 1000);
  const millis = Math.floor(ms % 1000);
  if (ms >= 3600000) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(millis).padStart(3, "0")}`;
  }
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(millis).padStart(3, "0")}`;
};

export type SplitPaceStatus = "ahead" | "behind" | "even" | "first-run";

export interface SplitPaceComparison {
  deltaMs: number | null;
  status: SplitPaceStatus;
}

export const compareSplitPace = (
  currentMs: number,
  personalBestMs: number | null | undefined
): { deltaMs: number | null; status: "ahead" | "behind" | "even" | "first-run" } => {
  if (
    typeof personalBestMs !== "number" ||
    !Number.isFinite(personalBestMs) ||
    personalBestMs <= 0 ||
    typeof currentMs !== "number" ||
    !Number.isFinite(currentMs) ||
    currentMs < 0
  ) {
    return { deltaMs: null, status: "first-run" };
  }

  const deltaMs = currentMs - personalBestMs;
  if (deltaMs < 0) {
    return { deltaMs, status: "ahead" };
  }
  if (deltaMs > 0) {
    return { deltaMs, status: "behind" };
  }
  return { deltaMs: 0, status: "even" };
};

export const formatSpeedrunDiff = (deltaMs: number): string => {
  if (typeof deltaMs !== "number" || !Number.isFinite(deltaMs) || deltaMs === 0) {
    return "±00:00.00";
  }
  const sign = deltaMs < 0 ? "-" : "+";
  const absMs = Math.abs(deltaMs);
  const totalCentis = Math.floor(absMs / 10);
  const centis = totalCentis % 100;
  const totalSeconds = Math.floor(totalCentis / 100);

  if (absMs >= 3600000) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${sign}${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(centis).padStart(2, "0")}`;
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${sign}${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(centis).padStart(2, "0")}`;
};

export interface SpeedrunStats {
  completedQuests: number;
  totalTimeMs: number;
  averageTimeMs: number;
  fastestTimeMs: number | null;
}

export const getSpeedrunStats = (
  records: Record<string, number>
): { completedQuests: number; totalTimeMs: number; averageTimeMs: number; fastestTimeMs: number | null } => {
  if (!records || typeof records !== "object") {
    return {
      completedQuests: 0,
      totalTimeMs: 0,
      averageTimeMs: 0,
      fastestTimeMs: null,
    };
  }

  const validTimes = Object.values(records).filter(
    (time): time is number => typeof time === "number" && Number.isFinite(time) && time > 0
  );

  if (validTimes.length === 0) {
    return {
      completedQuests: 0,
      totalTimeMs: 0,
      averageTimeMs: 0,
      fastestTimeMs: null,
    };
  }

  const completedQuests = validTimes.length;
  const totalTimeMs = validTimes.reduce((acc, t) => acc + t, 0);
  const averageTimeMs = Math.round(totalTimeMs / completedQuests);
  const fastestTimeMs = Math.min(...validTimes);

  return {
    completedQuests,
    totalTimeMs,
    averageTimeMs,
    fastestTimeMs,
  };
};

export const useSpeedrunTimer = create<SpeedrunState & SpeedrunActions>()(
  persist(
    (set, get) => ({
      records: {},
      activeRuns: {},
      pausedRuns: {},
      splits: {},

      startRun: (questId) => {
        if (!questId || typeof questId !== "string") return;
        set((state) => {
          const newPausedRuns = { ...state.pausedRuns };
          delete newPausedRuns[questId];
          const newSplits = { ...state.splits };
          delete newSplits[questId];

          return {
            activeRuns: { ...state.activeRuns, [questId]: Date.now() },
            pausedRuns: newPausedRuns,
            splits: newSplits,
          };
        });
      },

      pauseRun: (questId) => {
        if (!questId || typeof questId !== "string") return false;
        const state = get();
        const startTime = state.activeRuns[questId];
        if (!startTime) return false;

        const currentSegment = Math.max(0, Date.now() - startTime);
        const accumulated = (state.pausedRuns[questId] || 0) + currentSegment;

        set((s) => {
          const newActive = { ...s.activeRuns };
          delete newActive[questId];
          return {
            activeRuns: newActive,
            pausedRuns: { ...s.pausedRuns, [questId]: accumulated },
          };
        });
        return true;
      },

      resumeRun: (questId) => {
        if (!questId || typeof questId !== "string") return false;
        const state = get();
        if (state.activeRuns[questId] !== undefined) return false; // Already running
        if (state.pausedRuns[questId] === undefined) return false; // Not paused

        const accumulated = state.pausedRuns[questId] || 0;
        set((s) => {
          const newPaused = { ...s.pausedRuns };
          delete newPaused[questId];
          return {
            activeRuns: { ...s.activeRuns, [questId]: Date.now() - accumulated },
            pausedRuns: newPaused,
          };
        });
        return true;
      },

      isPaused: (questId) => {
        if (!questId || typeof questId !== "string") return false;
        const state = get();
        return state.activeRuns[questId] === undefined && state.pausedRuns[questId] !== undefined;
      },

      hasActiveRun: (questId) => {
        if (!questId || typeof questId !== "string") return false;
        return get().activeRuns[questId] !== undefined;
      },

      recordSplit: (questId, label, customTimeMs) => {
        if (!questId || typeof questId !== "string") return null;
        if (!label || typeof label !== "string") return null;

        const trimmedLabel = label.trim();
        if (!trimmedLabel) return null;

        const state = get();
        const isRunStarted = state.activeRuns[questId] !== undefined || state.pausedRuns[questId] !== undefined;
        if (!isRunStarted) return null;

        const currentSplits = state.splits[questId] || [];
        if (currentSplits.length >= MAX_SPEEDRUN_SPLITS) return null;

        const rawElapsed = customTimeMs !== undefined ? customTimeMs : state.getElapsedMs(questId);
        if (rawElapsed === null || typeof rawElapsed !== "number" || !Number.isFinite(rawElapsed) || rawElapsed < 0) {
          return null;
        }

        const timeMs = Math.floor(rawElapsed);
        const split: SpeedrunSplit = { label: trimmedLabel, timeMs };

        set((s) => {
          const list = [...(s.splits[questId] || []), split];
          return {
            splits: {
              ...s.splits,
              [questId]: list.slice(0, MAX_SPEEDRUN_SPLITS),
            },
          };
        });

        return timeMs;
      },

      getSplits: (questId) => {
        if (!questId || typeof questId !== "string") return [];
        return get().splits[questId] || [];
      },

      clearSplits: (questId?: string) => {
        set((s) => {
          if (questId) {
            const newSplits = { ...s.splits };
            delete newSplits[questId];
            return { splits: newSplits };
          }
          return { splits: {} };
        });
      },

      finishRun: (questId) => {
        if (!questId || typeof questId !== "string") return null;
        const state = get();
        const startTime = state.activeRuns[questId];
        const pausedMs = state.pausedRuns[questId] || 0;

        if (!startTime && state.pausedRuns[questId] === undefined) return null;

        const currentSegment = startTime ? Math.max(0, Date.now() - startTime) : 0;
        const timeMs = pausedMs + currentSegment;
        const existingRecord = state.records[questId];
        const isNewRecord = !existingRecord || timeMs < existingRecord.bestTimeMs;

        const newRecord: SpeedrunRecord = {
          questId,
          bestTimeMs: isNewRecord ? timeMs : existingRecord.bestTimeMs,
          lastTimeMs: timeMs,
          completionCount: (existingRecord?.completionCount || 0) + 1,
        };

        set((s) => {
          const newActiveRuns = { ...s.activeRuns };
          delete newActiveRuns[questId];
          const newPausedRuns = { ...s.pausedRuns };
          delete newPausedRuns[questId];

          return {
            activeRuns: newActiveRuns,
            pausedRuns: newPausedRuns,
            records: { ...s.records, [questId]: newRecord },
          };
        });

        return { timeMs, isNewRecord };
      },

      completeRun: (questId) => {
        if (!questId || typeof questId !== "string") return null;
        return get().finishRun(questId);
      },

      cancelRun: (questId) => {
        if (!questId || typeof questId !== "string") return;
        set((state) => {
          const newActiveRuns = { ...state.activeRuns };
          delete newActiveRuns[questId];
          const newPausedRuns = { ...state.pausedRuns };
          delete newPausedRuns[questId];
          const newSplits = { ...state.splits };
          delete newSplits[questId];

          return {
            activeRuns: newActiveRuns,
            pausedRuns: newPausedRuns,
            splits: newSplits,
          };
        });
      },

      resetRun: (questId) => {
        if (!questId || typeof questId !== "string") return;
        get().cancelRun(questId);
      },

      getRecord: (questId) => {
        if (!questId || typeof questId !== "string") return null;
        return get().records[questId] || null;
      },

      getElapsedMs: (questId) => {
        if (!questId || typeof questId !== "string") return null;
        const state = get();
        const startTime = state.activeRuns[questId];
        const pausedMs = state.pausedRuns[questId] || 0;

        if (!startTime && state.pausedRuns[questId] === undefined) return null;
        const currentSegment = startTime ? Math.max(0, Date.now() - startTime) : 0;
        const total = pausedMs + currentSegment;
        return Number.isFinite(total) && total >= 0 ? total : null;
      },

      getTotalCompletions: () => {
        const records = get().records;
        if (!records) return 0;
        return Object.values(records).reduce((total, record) => {
          const count = record?.completionCount;
          return total + (typeof count === "number" && Number.isFinite(count) && count > 0 ? count : 0);
        }, 0);
      },

      clearAllRecords: () => {
        set({ records: {}, activeRuns: {}, pausedRuns: {}, splits: {} });
      },
    }),
    {
      name: "devquest-speedrun-timer",
    }
  )
);
