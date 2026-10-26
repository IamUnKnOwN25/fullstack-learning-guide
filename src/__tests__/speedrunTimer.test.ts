import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { useSpeedrunTimer, formatSpeedrunTime, formatSpeedrunTimeWithMs } from "../lib/speedrunTimer";

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
  });
});
