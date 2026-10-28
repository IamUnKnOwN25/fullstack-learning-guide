import { create } from "zustand";
import { persist } from "zustand/middleware";

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
  recordSplit: (questId: string, label: string) => number | null;
  getSplits: (questId: string) => SpeedrunSplit[];
  finishRun: (questId: string) => { timeMs: number; isNewRecord: boolean } | null;
  cancelRun: (questId: string) => void;
  getRecord: (questId: string) => SpeedrunRecord | null;
  getElapsedMs: (questId: string) => number | null;
  clearAllRecords: () => void;
}

export const formatSpeedrunTime = (ms: number): string => {
  if (typeof ms !== "number" || !Number.isFinite(ms) || ms <= 0) {
    return "00:00";
  }
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

export const formatSpeedrunTimeWithMs = (ms: number): string => {
  if (typeof ms !== "number" || !Number.isFinite(ms) || ms <= 0) {
    return "00:00.000";
  }
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const millis = Math.floor(ms % 1000);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(millis).padStart(3, "0")}`;
};

export const useSpeedrunTimer = create<SpeedrunState & SpeedrunActions>()(
  persist(
    (set, get) => ({
      records: {},
      activeRuns: {},
      pausedRuns: {},
      splits: {},

      startRun: (questId) => {
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
        const state = get();
        if (state.activeRuns[questId] !== undefined) return false; // Already running
        if (state.pausedRuns[questId] === undefined) return false; // Not paused

        set((s) => ({
          activeRuns: { ...s.activeRuns, [questId]: Date.now() },
        }));
        return true;
      },

      isPaused: (questId) => {
        const state = get();
        return state.activeRuns[questId] === undefined && state.pausedRuns[questId] !== undefined;
      },

      recordSplit: (questId, label) => {
        const elapsed = get().getElapsedMs(questId);
        if (elapsed === null) return null;

        const split: SpeedrunSplit = { label, timeMs: elapsed };
        set((s) => ({
          splits: {
            ...s.splits,
            [questId]: [...(s.splits[questId] || []), split],
          },
        }));
        return elapsed;
      },

      getSplits: (questId) => {
        return get().splits[questId] || [];
      },

      finishRun: (questId) => {
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

      cancelRun: (questId) => {
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

      getRecord: (questId) => {
        return get().records[questId] || null;
      },

      getElapsedMs: (questId) => {
        const state = get();
        const startTime = state.activeRuns[questId];
        const pausedMs = state.pausedRuns[questId] || 0;

        if (!startTime && state.pausedRuns[questId] === undefined) return null;
        const currentSegment = startTime ? Math.max(0, Date.now() - startTime) : 0;
        return pausedMs + currentSegment;
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
