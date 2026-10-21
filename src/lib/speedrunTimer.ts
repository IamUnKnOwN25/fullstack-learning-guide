import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SpeedrunRecord {
  questId: string;
  bestTimeMs: number;
  lastTimeMs: number;
  completionCount: number;
}

export interface SpeedrunState {
  records: Record<string, SpeedrunRecord>;
  activeRuns: Record<string, number>; // questId -> startTimeMs
}

export interface SpeedrunActions {
  startRun: (questId: string) => void;
  finishRun: (questId: string) => { timeMs: number; isNewRecord: boolean } | null;
  cancelRun: (questId: string) => void;
  getRecord: (questId: string) => SpeedrunRecord | null;
  getElapsedMs: (questId: string) => number | null;
  clearAllRecords: () => void;
}

export const formatSpeedrunTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

export const useSpeedrunTimer = create<SpeedrunState & SpeedrunActions>()(
  persist(
    (set, get) => ({
      records: {},
      activeRuns: {},

      startRun: (questId) => {
        set((state) => ({
          activeRuns: { ...state.activeRuns, [questId]: Date.now() },
        }));
      },

      finishRun: (questId) => {
        const state = get();
        const startTime = state.activeRuns[questId];
        if (!startTime) return null;

        const timeMs = Date.now() - startTime;
        const existingRecord = state.records[questId];
        const isNewRecord = !existingRecord || timeMs < existingRecord.bestTimeMs;

        const newRecord: SpeedrunRecord = {
          questId,
          bestTimeMs: isNewRecord ? timeMs : existingRecord.bestTimeMs,
          lastTimeMs: timeMs,
          completionCount: (existingRecord?.completionCount || 0) + 1,
        };

        set((state) => {
          const newActiveRuns = { ...state.activeRuns };
          delete newActiveRuns[questId];

          return {
            activeRuns: newActiveRuns,
            records: { ...state.records, [questId]: newRecord },
          };
        });

        return { timeMs, isNewRecord };
      },

      cancelRun: (questId) => {
        set((state) => {
          const newActiveRuns = { ...state.activeRuns };
          delete newActiveRuns[questId];
          return { activeRuns: newActiveRuns };
        });
      },

      getRecord: (questId) => {
        return get().records[questId] || null;
      },

      getElapsedMs: (questId) => {
        const startTime = get().activeRuns[questId];
        if (!startTime) return null;
        return Date.now() - startTime;
      },

      clearAllRecords: () => {
        set({ records: {}, activeRuns: {} });
      },
    }),
    {
      name: "devquest-speedrun-timer",
    }
  )
);
