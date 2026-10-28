import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { useSpeedrunTimer, formatSpeedrunTime, formatSpeedrunTimeWithMs, MAX_SPEEDRUN_SPLITS } from "../lib/speedrunTimer";

describe("speedrunTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useSpeedrunTimer.getState().clearAllRecords();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("formatSpeedrunTime", () => {
    it("formats 0ms as 00:00", () => {
      expect(formatSpeedrunTime(0)).toBe("00:00");
    });

    it("formats sub-second durations as 00:00", () => {
      expect(formatSpeedrunTime(500)).toBe("00:00");
      expect(formatSpeedrunTime(999)).toBe("00:00");
    });

    it("formats milliseconds to minutes and seconds", () => {
      expect(formatSpeedrunTime(1000)).toBe("00:01");
      expect(formatSpeedrunTime(60000)).toBe("01:00");
      expect(formatSpeedrunTime(65000)).toBe("01:05");
      expect(formatSpeedrunTime(600000)).toBe("10:00");
    });

    it("formats large elapsed times over 60 minutes correctly", () => {
      expect(formatSpeedrunTime(3661000)).toBe("61:01");
      expect(formatSpeedrunTime(7200000)).toBe("120:00");
    });

    it("handles negative, NaN, and non-finite numbers safely", () => {
      expect(formatSpeedrunTime(-5000)).toBe("00:00");
      expect(formatSpeedrunTime(NaN)).toBe("00:00");
      expect(formatSpeedrunTime(Infinity)).toBe("00:00");
      expect(formatSpeedrunTime(null as any)).toBe("00:00");
    });
  });

  describe("formatSpeedrunTimeWithMs", () => {
    it("formats milliseconds with millisecond precision", () => {
      expect(formatSpeedrunTimeWithMs(0)).toBe("00:00.000");
      expect(formatSpeedrunTimeWithMs(500)).toBe("00:00.500");
      expect(formatSpeedrunTimeWithMs(1500)).toBe("00:01.500");
      expect(formatSpeedrunTimeWithMs(65123)).toBe("01:05.123");
      expect(formatSpeedrunTimeWithMs(3661042)).toBe("61:01.042");
    });

    it("handles negative and invalid values for formatSpeedrunTimeWithMs", () => {
      expect(formatSpeedrunTimeWithMs(-100)).toBe("00:00.000");
      expect(formatSpeedrunTimeWithMs(NaN)).toBe("00:00.000");
    });
  });

  describe("useSpeedrunTimer", () => {
    it("starts a run and tracks elapsed time", () => {
      const store = useSpeedrunTimer.getState();
      const now = Date.now();
      vi.setSystemTime(now);

      store.startRun("quest-1");
      expect(useSpeedrunTimer.getState().activeRuns["quest-1"]).toBe(now);

      vi.advanceTimersByTime(5000);
      expect(useSpeedrunTimer.getState().getElapsedMs("quest-1")).toBe(5000);
    });

    it("finishes a run and creates a new record", () => {
      const store = useSpeedrunTimer.getState();
      vi.setSystemTime(100000);

      store.startRun("quest-1");
      vi.advanceTimersByTime(15000); // 15 seconds

      const result = useSpeedrunTimer.getState().finishRun("quest-1");
      expect(result).toEqual({ timeMs: 15000, isNewRecord: true });

      const record = useSpeedrunTimer.getState().getRecord("quest-1");
      expect(record).toEqual({
        questId: "quest-1",
        bestTimeMs: 15000,
        lastTimeMs: 15000,
        completionCount: 1,
      });

      // active run should be cleared
      expect(useSpeedrunTimer.getState().activeRuns["quest-1"]).toBeUndefined();
    });

    it("cancels a run", () => {
      const store = useSpeedrunTimer.getState();
      store.startRun("quest-1");

      expect(useSpeedrunTimer.getState().activeRuns["quest-1"]).toBeDefined();

      useSpeedrunTimer.getState().cancelRun("quest-1");
      expect(useSpeedrunTimer.getState().activeRuns["quest-1"]).toBeUndefined();
    });

    it("safely handles cancelling a run that was never started", () => {
      expect(() => {
        useSpeedrunTimer.getState().cancelRun("nonexistent-quest");
      }).not.toThrow();
    });

    it("tracks multiple concurrent quest runs independently", () => {
      const store = useSpeedrunTimer.getState();
      vi.setSystemTime(100000);

      store.startRun("quest-html");
      vi.advanceTimersByTime(5000); // 5s in
      store.startRun("quest-css");
      vi.advanceTimersByTime(5000); // 10s for html, 5s for css

      expect(useSpeedrunTimer.getState().getElapsedMs("quest-html")).toBe(10000);
      expect(useSpeedrunTimer.getState().getElapsedMs("quest-css")).toBe(5000);

      const htmlResult = useSpeedrunTimer.getState().finishRun("quest-html");
      expect(htmlResult?.timeMs).toBe(10000);
      expect(useSpeedrunTimer.getState().activeRuns["quest-html"]).toBeUndefined();
      expect(useSpeedrunTimer.getState().activeRuns["quest-css"]).toBeDefined();
      expect(useSpeedrunTimer.getState().getElapsedMs("quest-css")).toBe(5000);
    });

    it("resets start timestamp when restarting an already running quest", () => {
      const store = useSpeedrunTimer.getState();
      vi.setSystemTime(100000);

      store.startRun("quest-1");
      vi.advanceTimersByTime(8000);
      expect(useSpeedrunTimer.getState().getElapsedMs("quest-1")).toBe(8000);

      // Restart run
      store.startRun("quest-1");
      expect(useSpeedrunTimer.getState().getElapsedMs("quest-1")).toBe(0);

      vi.advanceTimersByTime(3000);
      const res = useSpeedrunTimer.getState().finishRun("quest-1");
      expect(res?.timeMs).toBe(3000);
    });

    it("updates best time only if the new run is faster", () => {
      const store = useSpeedrunTimer.getState();

      // First run: 20 seconds
      vi.setSystemTime(100000);
      store.startRun("quest-1");
      vi.advanceTimersByTime(20000);
      useSpeedrunTimer.getState().finishRun("quest-1");

      expect(useSpeedrunTimer.getState().getRecord("quest-1")?.bestTimeMs).toBe(20000);
      expect(useSpeedrunTimer.getState().getRecord("quest-1")?.completionCount).toBe(1);

      // Second run: 15 seconds (FASTER)
      store.startRun("quest-1");
      vi.advanceTimersByTime(15000);
      const result2 = useSpeedrunTimer.getState().finishRun("quest-1");

      expect(result2?.isNewRecord).toBe(true);
      expect(useSpeedrunTimer.getState().getRecord("quest-1")?.bestTimeMs).toBe(15000);
      expect(useSpeedrunTimer.getState().getRecord("quest-1")?.lastTimeMs).toBe(15000);
      expect(useSpeedrunTimer.getState().getRecord("quest-1")?.completionCount).toBe(2);

      // Third run: 25 seconds (SLOWER)
      store.startRun("quest-1");
      vi.advanceTimersByTime(25000);
      const result3 = useSpeedrunTimer.getState().finishRun("quest-1");

      expect(result3?.isNewRecord).toBe(false);
      expect(useSpeedrunTimer.getState().getRecord("quest-1")?.bestTimeMs).toBe(15000);
      expect(useSpeedrunTimer.getState().getRecord("quest-1")?.lastTimeMs).toBe(25000);
      expect(useSpeedrunTimer.getState().getRecord("quest-1")?.completionCount).toBe(3);
    });

    it("safely clamps negative elapsed time if clock drifts backward during run", () => {
      const store = useSpeedrunTimer.getState();
      vi.setSystemTime(100000);
      store.startRun("quest-drift");

      // Clock moves backwards by 5000ms
      vi.setSystemTime(95000);
      expect(store.getElapsedMs("quest-drift")).toBe(0);

      const result = store.finishRun("quest-drift");
      expect(result?.timeMs).toBe(0);
    });

    it("returns null when finishing a run that hasn't started", () => {
      const result = useSpeedrunTimer.getState().finishRun("unknown-quest");
      expect(result).toBeNull();
    });

    it("returns null when getting elapsed time for a run that hasn't started", () => {
      const result = useSpeedrunTimer.getState().getElapsedMs("unknown-quest");
      expect(result).toBeNull();
    });

    it("returns null when getting record for nonexistent quest", () => {
      const result = useSpeedrunTimer.getState().getRecord("nonexistent-quest");
      expect(result).toBeNull();
    });

    it("clears all active runs and completed records on clearAllRecords", () => {
      const store = useSpeedrunTimer.getState();
      store.startRun("quest-1");
      store.finishRun("quest-1");
      store.startRun("quest-2");

      expect(Object.keys(useSpeedrunTimer.getState().records).length).toBe(1);
      expect(Object.keys(useSpeedrunTimer.getState().activeRuns).length).toBe(1);

      store.clearAllRecords();

      expect(useSpeedrunTimer.getState().records).toEqual({});
      expect(useSpeedrunTimer.getState().activeRuns).toEqual({});
    });

    describe("Pause, Resume & Split Lap Analytics", () => {
      it("pauses an active run and retains elapsed time without advancing during pause", () => {
        const store = useSpeedrunTimer.getState();
        vi.setSystemTime(100000);

        store.startRun("quest-pause");
        vi.advanceTimersByTime(4000); // 4s elapsed
        expect(store.getElapsedMs("quest-pause")).toBe(4000);

        const paused = store.pauseRun("quest-pause");
        expect(paused).toBe(true);
        expect(store.isPaused("quest-pause")).toBe(true);

        // Advance time during pause - elapsed time should freeze at 4000ms
        vi.advanceTimersByTime(10000);
        expect(store.getElapsedMs("quest-pause")).toBe(4000);

        // Resuming unpauses and continues accumulation
        const resumed = store.resumeRun("quest-pause");
        expect(resumed).toBe(true);
        expect(store.isPaused("quest-pause")).toBe(false);

        vi.advanceTimersByTime(3000); // 4s + 3s = 7s
        expect(store.getElapsedMs("quest-pause")).toBe(7000);

        const finishResult = store.finishRun("quest-pause");
        expect(finishResult?.timeMs).toBe(7000);
      });

      it("handles pausing when already paused or unstarted gracefully", () => {
        const store = useSpeedrunTimer.getState();
        expect(store.pauseRun("unstarted-quest")).toBe(false);
        expect(store.resumeRun("unstarted-quest")).toBe(false);

        store.startRun("quest-twice");
        store.pauseRun("quest-twice");
        expect(store.pauseRun("quest-twice")).toBe(false);
      });

      it("records split laps and allows querying them sequentially", () => {
        const store = useSpeedrunTimer.getState();
        vi.setSystemTime(100000);

        store.startRun("quest-splits");
        vi.advanceTimersByTime(2500);
        const split1 = store.recordSplit("quest-splits", "Warm-Up Drill");
        expect(split1).toBe(2500);

        vi.advanceTimersByTime(4000);
        const split2 = store.recordSplit("quest-splits", "Deep Dive Quiz");
        expect(split2).toBe(6500);

        const splits = store.getSplits("quest-splits");
        expect(splits).toEqual([
          { label: "Warm-Up Drill", timeMs: 2500 },
          { label: "Deep Dive Quiz", timeMs: 6500 },
        ]);
      });

      it("validates split lap names, trims whitespace, and rejects empty or non-string labels", () => {
        const store = useSpeedrunTimer.getState();
        store.startRun("quest-val");

        // Rejects empty string
        expect(store.recordSplit("quest-val", "")).toBeNull();

        // Rejects whitespace-only string
        expect(store.recordSplit("quest-val", "    \t \n ")).toBeNull();

        // Rejects non-string values
        expect(store.recordSplit("quest-val", null as any)).toBeNull();
        expect(store.recordSplit("quest-val", undefined as any)).toBeNull();
        expect(store.recordSplit("quest-val", 123 as any)).toBeNull();

        // Verifies no splits were saved for invalid entries
        expect(store.getSplits("quest-val")).toEqual([]);

        // Trims valid lap names
        const time = store.recordSplit("quest-val", "  Checkpoint Alpha  ");
        expect(time).toBeGreaterThanOrEqual(0);

        const splits = store.getSplits("quest-val");
        expect(splits).toHaveLength(1);
        expect(splits[0].label).toBe("Checkpoint Alpha");
      });

      it("rejects non-finite and invalid timestamps when recording splits", () => {
        const store = useSpeedrunTimer.getState();

        // Rejects split recording when quest has not started
        expect(store.recordSplit("unstarted-quest", "Lap 1")).toBeNull();
        expect(store.recordSplit("unstarted-quest", "Lap 1", 5000)).toBeNull();

        // Start quest
        store.startRun("quest-timestamp-val");

        // Rejects NaN, Infinity, -Infinity, negative numbers
        expect(store.recordSplit("quest-timestamp-val", "Lap 1", NaN)).toBeNull();
        expect(store.recordSplit("quest-timestamp-val", "Lap 2", Infinity)).toBeNull();
        expect(store.recordSplit("quest-timestamp-val", "Lap 3", -Infinity)).toBeNull();
        expect(store.recordSplit("quest-timestamp-val", "Lap 4", -100)).toBeNull();
        expect(store.recordSplit("quest-timestamp-val", "Lap 5", "not-a-number" as any)).toBeNull();

        expect(store.getSplits("quest-timestamp-val")).toEqual([]);

        // Accepts valid custom timestamps
        const splitTime = store.recordSplit("quest-timestamp-val", "Valid Lap", 4500.8);
        expect(splitTime).toBe(4500);
        expect(store.getSplits("quest-timestamp-val")).toEqual([
          { label: "Valid Lap", timeMs: 4500 },
        ]);
      });

      it("caps split list size to 100 entries to prevent memory leaks", () => {
        const store = useSpeedrunTimer.getState();
        store.startRun("quest-cap");

        expect(MAX_SPEEDRUN_SPLITS).toBe(100);

        // Fill up to 100 splits
        for (let i = 0; i < 100; i++) {
          const res = store.recordSplit("quest-cap", `Split ${i}`, i * 1000);
          expect(res).toBe(i * 1000);
        }

        const splits = store.getSplits("quest-cap");
        expect(splits).toHaveLength(100);
        expect(splits[0]).toEqual({ label: "Split 0", timeMs: 0 });
        expect(splits[99]).toEqual({ label: "Split 99", timeMs: 99000 });

        // Attempting to add 101st split returns null and does not increase list size
        const overflow = store.recordSplit("quest-cap", "Split 100 (Overflow)", 100000);
        expect(overflow).toBeNull();
        expect(store.getSplits("quest-cap")).toHaveLength(100);
        expect(store.getSplits("quest-cap")[99].label).toBe("Split 99");
      });

      it("resets split history via clearSplits for specific quest or all quests", () => {
        const store = useSpeedrunTimer.getState();
        store.startRun("quest-a");
        store.startRun("quest-b");

        store.recordSplit("quest-a", "A1", 1000);
        store.recordSplit("quest-a", "A2", 2000);
        store.recordSplit("quest-b", "B1", 1500);

        expect(store.getSplits("quest-a")).toHaveLength(2);
        expect(store.getSplits("quest-b")).toHaveLength(1);

        // Clear specific quest splits
        store.clearSplits("quest-a");
        expect(store.getSplits("quest-a")).toEqual([]);
        expect(store.getSplits("quest-b")).toHaveLength(1);

        // Clear all splits across all quests when called with no arguments
        store.clearSplits();
        expect(store.getSplits("quest-b")).toEqual([]);
        expect(store.splits).toEqual({});
      });

      it("cleans up paused runs and splits on cancelRun", () => {
        const store = useSpeedrunTimer.getState();
        store.startRun("quest-cleanup");
        store.pauseRun("quest-cleanup");
        store.recordSplit("quest-cleanup", "Lap 1");

        expect(store.getSplits("quest-cleanup").length).toBe(1);
        store.cancelRun("quest-cleanup");

        expect(store.isPaused("quest-cleanup")).toBe(false);
        expect(store.getSplits("quest-cleanup")).toEqual([]);
        expect(store.getElapsedMs("quest-cleanup")).toBeNull();
      });
    });
  });
});
