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

    it("should handle error during retrieval gracefully when localStorage throws", () => {
      vi.stubGlobal("window", {
        localStorage: {
          getItem: () => {
            throw new Error("SecurityError: Access denied");
          },
        },
      });

      expect(SnippetResetGuard.getBackup("any_id")).toBeNull();
      expect(console.warn).toHaveBeenCalledWith(
        "SnippetResetGuard: Failed to retrieve backup",
        expect.any(Error)
      );
    });

    it("should handle error during clearBackup gracefully when localStorage throws", () => {
      vi.stubGlobal("window", {
        localStorage: {
          removeItem: () => {
            throw new Error("SecurityError: Access denied");
          },
        },
      });

      expect(() => SnippetResetGuard.clearBackup("any_id")).not.toThrow();
      expect(console.warn).toHaveBeenCalledWith(
        "SnippetResetGuard: Failed to clear backup",
        expect.any(Error)
      );
    });

    it("preserves unicode, emojis, and multiline formatting across backup cycles", () => {
      const complexSnippet = "const matrixSymbol = '💎';\n/* \t\r\n Matrix Core */\nreturn 42;";
      SnippetResetGuard.saveBackup("unicode_test", complexSnippet);
      const retrieved = SnippetResetGuard.getBackup("unicode_test");
      expect(retrieved).toBe(complexSnippet);
    });
  });

  describe("isSafeToReset edge cases", () => {
    it("handles null or undefined inputs safely", () => {
      expect(SnippetResetGuard.isSafeToReset(null as any, "const x = 1;")).toBe(true);
      expect(SnippetResetGuard.isSafeToReset("const x = 1;", null as any)).toBe(false);
      expect(SnippetResetGuard.isSafeToReset(null as any, null as any)).toBe(true);
    });

    it("ignores tabs, carriage returns, and mixed indentation", () => {
      const codeWithTabs = "\tconst\t\tx\t=\t1;\r\n";
      const codeWithSpaces = "  const   x = 1;\n";
      expect(SnippetResetGuard.isSafeToReset(codeWithTabs, codeWithSpaces)).toBe(true);
    });
  });
});
