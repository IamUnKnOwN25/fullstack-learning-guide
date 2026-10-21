import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { useSpeedrunTimer, formatSpeedrunTime } from "../lib/speedrunTimer";

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

    it("formats milliseconds to minutes and seconds", () => {
      expect(formatSpeedrunTime(1000)).toBe("00:01");
      expect(formatSpeedrunTime(60000)).toBe("01:00");
      expect(formatSpeedrunTime(65000)).toBe("01:05");
      expect(formatSpeedrunTime(600000)).toBe("10:00");
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

    it("returns null when finishing a run that hasn't started", () => {
      const result = useSpeedrunTimer.getState().finishRun("unknown-quest");
      expect(result).toBeNull();
    });

    it("returns null when getting elapsed time for a run that hasn't started", () => {
      const result = useSpeedrunTimer.getState().getElapsedMs("unknown-quest");
      expect(result).toBeNull();
    });
  });
});
