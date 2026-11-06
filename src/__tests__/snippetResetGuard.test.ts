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

    it("handles null or undefined inputs safely", () => {
      expect(SnippetResetGuard.isSafeToReset(null as any, "const x = 1;")).toBe(true);
      expect(SnippetResetGuard.isSafeToReset("const x = 1;", null as any)).toBe(false);
      expect(SnippetResetGuard.isSafeToReset(null as any, null as any)).toBe(true);
      expect(SnippetResetGuard.isSafeToReset(undefined as any, "const x = 1;")).toBe(true);
      expect(SnippetResetGuard.isSafeToReset("const x = 1;", undefined as any)).toBe(false);
      expect(SnippetResetGuard.isSafeToReset(undefined as any, undefined as any)).toBe(true);
    });

    it("handles non-string inputs safely without throwing TypeError", () => {
      expect(() => SnippetResetGuard.isSafeToReset(123 as any, "const x = 1;")).not.toThrow();
      expect(SnippetResetGuard.isSafeToReset(123 as any, "const x = 1;")).toBe(false);
      expect(SnippetResetGuard.isSafeToReset(123 as any, "123")).toBe(true);
      expect(SnippetResetGuard.isSafeToReset(123 as any, 123 as any)).toBe(true);
      expect(() => SnippetResetGuard.isSafeToReset({} as any, "const x = 1;")).not.toThrow();
      expect(() => SnippetResetGuard.isSafeToReset("const x = 1;", {} as any)).not.toThrow();
      expect(() => SnippetResetGuard.isSafeToReset(true as any, false as any)).not.toThrow();
    });

    it("ignores tabs, carriage returns, and mixed indentation", () => {
      const codeWithTabs = "\tconst\t\tx\t=\t1;\r\n";
      const codeWithSpaces = "  const   x = 1;\n";
      expect(SnippetResetGuard.isSafeToReset(codeWithTabs, codeWithSpaces)).toBe(true);
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
          getItem: (key: string) => (mockStorage[key] !== undefined ? mockStorage[key] : null),
          removeItem: (key: string) => {
            delete mockStorage[key];
          },
          key: (index: number) => {
            const keys = Object.keys(mockStorage);
            return keys[index] ?? null;
          },
          get length() {
            return Object.keys(mockStorage).length;
          },
          clear: () => {
            mockStorage = {};
          },
        },
      });
      vi.spyOn(console, "warn").mockImplementation(() => {});
    });

    afterEach(() => {
      vi.unstubAllGlobals();
      vi.restoreAllMocks();
    });

    it("should save backup correctly via saveBackup and backupSnippet", () => {
      SnippetResetGuard.saveBackup("q1", "const x = 10;");
      expect(mockStorage["devquest_backup_q1"]).toBe("const x = 10;");

      SnippetResetGuard.backupSnippet("q1_alias", "const z = 30;");
      expect(mockStorage["devquest_backup_q1_alias"]).toBe("const z = 30;");
    });

    it("should handle error during save gracefully", () => {
      expect(() => SnippetResetGuard.saveBackup("throw_error", "code")).not.toThrow();
      expect(console.warn).toHaveBeenCalledWith("SnippetResetGuard: Failed to save backup", expect.any(Error));
    });

    it("should guard saveBackup and backupSnippet against nullish and non-string inputs", () => {
      expect(() => SnippetResetGuard.saveBackup(null as any, "code")).not.toThrow();
      expect(() => SnippetResetGuard.saveBackup(undefined as any, "code")).not.toThrow();
      expect(() => SnippetResetGuard.saveBackup(123 as any, "code")).not.toThrow();
      expect(() => SnippetResetGuard.saveBackup({} as any, "code")).not.toThrow();
      expect(() => SnippetResetGuard.saveBackup("", "code")).not.toThrow();
      expect(() => SnippetResetGuard.saveBackup("   ", "code")).not.toThrow();
      expect(() => SnippetResetGuard.saveBackup("q_null_code", null as any)).not.toThrow();
      expect(() => SnippetResetGuard.saveBackup("q_num_code", 12345 as any)).not.toThrow();

      expect(() => SnippetResetGuard.backupSnippet(null as any, "code")).not.toThrow();
      expect(() => SnippetResetGuard.backupSnippet(123 as any, "code")).not.toThrow();
      expect(() => SnippetResetGuard.backupSnippet("q_safe", undefined as any)).not.toThrow();
      expect(mockStorage["devquest_backup_q_null_code"]).toBeUndefined();
    });

    it("should get backup correctly via getBackup and restoreSnippet", () => {
      mockStorage["devquest_backup_q2"] = "let y = 20;";
      expect(SnippetResetGuard.getBackup("q2")).toBe("let y = 20;");
      expect(SnippetResetGuard.restoreSnippet("q2")).toBe("let y = 20;");
    });

    it("should return null if backup doesn't exist", () => {
      expect(SnippetResetGuard.getBackup("non_existent")).toBeNull();
      expect(SnippetResetGuard.restoreSnippet("non_existent")).toBeNull();
    });

    it("should guard getBackup and restoreSnippet against nullish and non-string inputs", () => {
      expect(SnippetResetGuard.getBackup(null as any)).toBeNull();
      expect(SnippetResetGuard.getBackup(undefined as any)).toBeNull();
      expect(SnippetResetGuard.getBackup(123 as any)).toBeNull();
      expect(SnippetResetGuard.getBackup({} as any)).toBeNull();
      expect(SnippetResetGuard.getBackup("")).toBeNull();
      expect(SnippetResetGuard.getBackup("   ")).toBeNull();

      expect(SnippetResetGuard.restoreSnippet(null as any)).toBeNull();
      expect(SnippetResetGuard.restoreSnippet(undefined as any)).toBeNull();
      expect(SnippetResetGuard.restoreSnippet(456 as any)).toBeNull();
    });

    it("should check if backup exists via hasBackup", () => {
      mockStorage["devquest_backup_q_exist"] = "exists";
      expect(SnippetResetGuard.hasBackup("q_exist")).toBe(true);
      expect(SnippetResetGuard.hasBackup("q_not_exist")).toBe(false);
      expect(SnippetResetGuard.hasBackup(null as any)).toBe(false);
      expect(SnippetResetGuard.hasBackup(undefined as any)).toBe(false);
      expect(SnippetResetGuard.hasBackup(123 as any)).toBe(false);
      expect(SnippetResetGuard.hasBackup("")).toBe(false);
      expect(SnippetResetGuard.hasBackup("   ")).toBe(false);
    });

    it("should list all backup snippet IDs via listBackups", () => {
      mockStorage["devquest_backup_quest1"] = "code 1";
      mockStorage["devquest_backup_quest2"] = "code 2";
      mockStorage["other_key_unrelated"] = "not a backup";

      const backups = SnippetResetGuard.listBackups();
      expect(backups).toHaveLength(2);
      expect(backups).toContain("quest1");
      expect(backups).toContain("quest2");
      expect(backups).not.toContain("other_key_unrelated");
    });

    it("should return empty list when no backups exist", () => {
      mockStorage["unrelated_data"] = "xyz";
      expect(SnippetResetGuard.listBackups()).toEqual([]);
    });

    it("should clear backup correctly", () => {
      mockStorage["devquest_backup_q3"] = "console.log('hi');";
      SnippetResetGuard.clearBackup("q3");
      expect(mockStorage["devquest_backup_q3"]).toBeUndefined();
    });

    it("should guard clearBackup against nullish and non-string inputs", () => {
      expect(() => SnippetResetGuard.clearBackup(null as any)).not.toThrow();
      expect(() => SnippetResetGuard.clearBackup(undefined as any)).not.toThrow();
      expect(() => SnippetResetGuard.clearBackup(123 as any)).not.toThrow();
      expect(() => SnippetResetGuard.clearBackup({} as any)).not.toThrow();
      expect(() => SnippetResetGuard.clearBackup("")).not.toThrow();
      expect(() => SnippetResetGuard.clearBackup("   ")).not.toThrow();
    });

    it("should clear all backups via clearAllBackups without touching other storage keys", () => {
      mockStorage["devquest_backup_q1"] = "code 1";
      mockStorage["devquest_backup_q2"] = "code 2";
      mockStorage["other_unrelated_setting"] = "keep this";

      SnippetResetGuard.clearAllBackups();

      expect(mockStorage["devquest_backup_q1"]).toBeUndefined();
      expect(mockStorage["devquest_backup_q2"]).toBeUndefined();
      expect(mockStorage["other_unrelated_setting"]).toBe("keep this");
      expect(SnippetResetGuard.listBackups()).toEqual([]);
    });

    it("should handle SSR environment gracefully across all methods", () => {
      vi.stubGlobal("window", undefined);

      expect(() => SnippetResetGuard.saveBackup("q1", "code")).not.toThrow();
      expect(() => SnippetResetGuard.backupSnippet("q1", "code")).not.toThrow();
      expect(SnippetResetGuard.getBackup("q1")).toBeNull();
      expect(SnippetResetGuard.restoreSnippet("q1")).toBeNull();
      expect(SnippetResetGuard.hasBackup("q1")).toBe(false);
      expect(SnippetResetGuard.listBackups()).toEqual([]);
      expect(() => SnippetResetGuard.clearBackup("q1")).not.toThrow();
      expect(() => SnippetResetGuard.clearAllBackups()).not.toThrow();
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
      expect(SnippetResetGuard.restoreSnippet("any_id")).toBeNull();
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

    it("should handle error during hasBackup gracefully when localStorage throws", () => {
      vi.stubGlobal("window", {
        localStorage: {
          getItem: () => {
            throw new Error("SecurityError: Access denied");
          },
        },
      });

      expect(SnippetResetGuard.hasBackup("any_id")).toBe(false);
      expect(console.warn).toHaveBeenCalledWith(
        "SnippetResetGuard: Failed to check backup",
        expect.any(Error)
      );
    });

    it("should handle error during listBackups gracefully when localStorage throws", () => {
      vi.stubGlobal("window", {
        localStorage: {
          get length(): number {
            throw new Error("SecurityError: Access denied");
          },
          key: () => {
            throw new Error("SecurityError: Access denied");
          },
        },
      });

      expect(SnippetResetGuard.listBackups()).toEqual([]);
      expect(console.warn).toHaveBeenCalledWith(
        "SnippetResetGuard: Failed to list backups",
        expect.any(Error)
      );
    });

    it("preserves unicode, emojis, and multiline formatting across backup cycles", () => {
      const complexSnippet = "const matrixSymbol = '💎';\n/* \t\r\n Matrix Core */\nreturn 42;";
      SnippetResetGuard.saveBackup("unicode_test", complexSnippet);
      const retrieved = SnippetResetGuard.getBackup("unicode_test");
      expect(retrieved).toBe(complexSnippet);
    });

    it("supports instance methods delegating to static implementation", () => {
      const guard = new SnippetResetGuard();
      expect(guard.isSafeToReset("", "const a = 1;")).toBe(true);

      guard.backupSnippet("instance_q", "const inst = true;");
      expect(guard.hasBackup("instance_q")).toBe(true);
      expect(guard.restoreSnippet("instance_q")).toBe("const inst = true;");
      expect(guard.getBackup("instance_q")).toBe("const inst = true;");
      expect(guard.listBackups()).toContain("instance_q");

      guard.clearBackup("instance_q");
      expect(guard.hasBackup("instance_q")).toBe(false);

      guard.saveBackup("instance_all", "code");
      expect(guard.hasBackup("instance_all")).toBe(true);
      guard.clearAllBackups();
      expect(guard.hasBackup("instance_all")).toBe(false);
    });
  });
});
