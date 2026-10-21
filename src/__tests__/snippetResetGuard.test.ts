import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { SnippetResetGuard } from "../lib/snippetResetGuard";

describe("SnippetResetGuard", () => {
  describe("isSafeToReset", () => {
    it("should return true if current code is empty", () => {
      expect(SnippetResetGuard.isSafeToReset("", "const a = 1;")).toBe(true);
      expect(SnippetResetGuard.isSafeToReset("   \n", "const a = 1;")).toBe(true);
    });

    it("should return false if starter code is empty and current code has content", () => {
      expect(SnippetResetGuard.isSafeToReset("const a = 1;", "")).toBe(false);
    });

    it("should return true if normalized codes match", () => {
      const current = `
        function test() {
          return true;
        }
      `;
      const starter = `function test(){return true;}`;
      expect(SnippetResetGuard.isSafeToReset(current, starter)).toBe(true);
    });

    it("should return false if normalized codes do not match", () => {
      const current = `function test(){return false;}`;
      const starter = `function test(){return true;}`;
      expect(SnippetResetGuard.isSafeToReset(current, starter)).toBe(false);
    });
  });

  describe("Backup operations", () => {
    let mockStorage: Record<string, string> = {};

    beforeEach(() => {
      mockStorage = {};

      // Mock window and localStorage
      vi.stubGlobal("window", {
        localStorage: {
          setItem: (key: string, value: string) => {
            if (key.includes("throw_error")) {
              throw new Error("QuotaExceededError");
            }
            mockStorage[key] = value;
          },
          getItem: (key: string) => mockStorage[key] || null,
          removeItem: (key: string) => {
            delete mockStorage[key];
          },
        },
      });
      vi.spyOn(console, "warn").mockImplementation(() => {});
    });

    afterEach(() => {
      vi.unstubAllGlobals();
      vi.restoreAllMocks();
    });

    it("should save backup correctly", () => {
      SnippetResetGuard.saveBackup("q1", "const x = 10;");
      expect(mockStorage["devquest_backup_q1"]).toBe("const x = 10;");
    });

    it("should handle error during save gracefully", () => {
      // By setting the id to "throw_error", our mock will throw an exception but it should be caught
      expect(() => SnippetResetGuard.saveBackup("throw_error", "code")).not.toThrow();
      expect(console.warn).toHaveBeenCalledWith("SnippetResetGuard: Failed to save backup", expect.any(Error));
    });

    it("should get backup correctly", () => {
      mockStorage["devquest_backup_q2"] = "let y = 20;";
      expect(SnippetResetGuard.getBackup("q2")).toBe("let y = 20;");
    });

    it("should return null if backup doesn't exist", () => {
      expect(SnippetResetGuard.getBackup("non_existent")).toBeNull();
    });

    it("should clear backup correctly", () => {
      mockStorage["devquest_backup_q3"] = "console.log('hi');";
      SnippetResetGuard.clearBackup("q3");
      expect(mockStorage["devquest_backup_q3"]).toBeUndefined();
    });

    it("should handle SSR environment gracefully", () => {
       // Temporarily set window to undefined
       vi.stubGlobal("window", undefined);

       expect(() => SnippetResetGuard.saveBackup("q1", "code")).not.toThrow();
       expect(SnippetResetGuard.getBackup("q1")).toBeNull();
       expect(() => SnippetResetGuard.clearBackup("q1")).not.toThrow();
    });
  });
});
