import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  SnippetResetGuard,
  computeCodeDifference,
  inspectBackupPayload,
} from "../lib/snippetResetGuard";

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

  describe("computeCodeDifference", () => {
    it("returns zero deltas, hasChanged=false, and similarityRatio=1 for identical code", () => {
      const code = "function add(a: number, b: number) {\n  return a + b;\n}";
      const result = computeCodeDifference(code, code);

      expect(result).toEqual({
        hasChanged: false,
        lineDelta: 0,
        charDelta: 0,
        similarityRatio: 1,
      });
    });

    it("normalizes CRLF to LF and compares trimmed strings without false diffs", () => {
      const windowsCode = "const x = 10;\r\nconst y = 20;\r\n";
      const unixCode = "  const x = 10;\nconst y = 20;  \n";
      const result = computeCodeDifference(windowsCode, unixCode);

      expect(result.hasChanged).toBe(false);
      expect(result.lineDelta).toBe(0);
      expect(result.charDelta).toBe(0);
      expect(result.similarityRatio).toBe(1);
    });

    it("accurately calculates positive line and character deltas when code is appended", () => {
      const original = "const title = 'DevQuest';";
      const current = "const title = 'DevQuest';\nconst level = 10;\nconst xp = 500;";
      const result = computeCodeDifference(original, current);

      expect(result.hasChanged).toBe(true);
      expect(result.lineDelta).toBe(2);
      expect(result.charDelta).toBe(current.length - original.length);
      expect(result.similarityRatio).toBeGreaterThan(0.4);
      expect(result.similarityRatio).toBeLessThan(1.0);
    });

    it("accurately calculates negative line and character deltas when lines are removed", () => {
      const original = "line 1\nline 2\nline 3\nline 4";
      const current = "line 1\nline 2";
      const result = computeCodeDifference(original, current);

      expect(result.hasChanged).toBe(true);
      expect(result.lineDelta).toBe(-2);
      expect(result.charDelta).toBeLessThan(0);
      expect(result.similarityRatio).toBeCloseTo(0.5, 1);
    });

    it("returns similarityRatio=1 when both inputs are empty", () => {
      expect(computeCodeDifference("", "")).toEqual({
        hasChanged: false,
        lineDelta: 0,
        charDelta: 0,
        similarityRatio: 1,
      });
    });

    it("returns similarityRatio=0 when one snippet is empty and the other has content", () => {
      const emptyToCode = computeCodeDifference("", "const active = true;");
      expect(emptyToCode.hasChanged).toBe(true);
      expect(emptyToCode.lineDelta).toBe(1);
      expect(emptyToCode.similarityRatio).toBe(0);

      const codeToEmpty = computeCodeDifference("const active = true;", "");
      expect(codeToEmpty.hasChanged).toBe(true);
      expect(codeToEmpty.lineDelta).toBe(-1);
      expect(codeToEmpty.similarityRatio).toBe(0);
    });

    it("handles null, undefined, and non-string inputs safely without throwing", () => {
      expect(() => computeCodeDifference(null as any, undefined as any)).not.toThrow();
      expect(computeCodeDifference(null as any, undefined as any)).toEqual({
        hasChanged: false,
        lineDelta: 0,
        charDelta: 0,
        similarityRatio: 1,
      });

      expect(() => computeCodeDifference(12345 as any, "12345")).not.toThrow();
      expect(computeCodeDifference(12345 as any, "12345").hasChanged).toBe(false);

      expect(() => computeCodeDifference("const a = 1;", {} as any)).not.toThrow();
      const objDiff = computeCodeDifference("const a = 1;", {} as any);
      expect(objDiff.hasChanged).toBe(true);
      expect(objDiff.similarityRatio).toBeGreaterThan(0);
      expect(objDiff.similarityRatio).toBeLessThan(1);

      const nullDiff = computeCodeDifference("const a = 1;", null as any);
      expect(nullDiff.hasChanged).toBe(true);
      expect(nullDiff.similarityRatio).toBe(0);
    });

    it("clamps similarityRatio strictly between 0 and 1 for disjoint and similar strings", () => {
      const disjoint = computeCodeDifference("abcd", "wxyz");
      expect(disjoint.similarityRatio).toBe(0);
      expect(disjoint.hasChanged).toBe(true);
      expect(disjoint.similarityRatio).toBeGreaterThanOrEqual(0);
      expect(disjoint.similarityRatio).toBeLessThanOrEqual(1);

      const minorEdit = computeCodeDifference("const port = 3000;", "const port = 3001;");
      expect(minorEdit.hasChanged).toBe(true);
      expect(minorEdit.similarityRatio).toBeGreaterThan(0.9);
      expect(minorEdit.similarityRatio).toBeLessThan(1.0);
    });

    it("supports static and instance delegates on SnippetResetGuard", () => {
      const staticRes = SnippetResetGuard.computeCodeDifference("const a = 1;", "const a = 2;");
      expect(staticRes.hasChanged).toBe(true);
      expect(staticRes.lineDelta).toBe(0);

      const guard = new SnippetResetGuard();
      const instanceRes = guard.computeCodeDifference("const a = 1;", "const a = 2;");
      expect(instanceRes).toEqual(staticRes);
    });
  });

  describe("inspectBackupPayload", () => {
    it("safely inspects a valid JSON backup map of string snippets", () => {
      const payload = JSON.stringify({
        quest_intro: "console.log('Matrix initialized');",
        quest_variables: "const heroName = 'Neo';",
      });

      const inspection = inspectBackupPayload(payload);
      expect(inspection.valid).toBe(true);
      expect(inspection.keyCount).toBe(2);
      expect(inspection.totalBytes).toBe(
        "console.log('Matrix initialized');".length + "const heroName = 'Neo';".length
      );
    });

    it("returns valid=true, keyCount=0, totalBytes=0 for an empty JSON object", () => {
      const inspection = inspectBackupPayload("{}");
      expect(inspection).toEqual({
        valid: true,
        keyCount: 0,
        totalBytes: 0,
      });
    });

    it("accurately computes multi-byte UTF-8 bytes for emojis and unicode snippets", () => {
      const payload = JSON.stringify({
        matrix_gem: "const gem = '💎';",
      });
      const inspection = inspectBackupPayload(payload);
      expect(inspection.valid).toBe(true);
      expect(inspection.keyCount).toBe(1);
      const expectedBytes = new TextEncoder().encode("const gem = '💎';").length;
      expect(inspection.totalBytes).toBe(expectedBytes);
    });

    it("rejects null, undefined, empty, or whitespace-only inputs as invalid", () => {
      expect(inspectBackupPayload(null)).toEqual({ valid: false, keyCount: 0, totalBytes: 0 });
      expect(inspectBackupPayload(undefined)).toEqual({ valid: false, keyCount: 0, totalBytes: 0 });
      expect(inspectBackupPayload("")).toEqual({ valid: false, keyCount: 0, totalBytes: 0 });
      expect(inspectBackupPayload("   \n\t  ")).toEqual({ valid: false, keyCount: 0, totalBytes: 0 });
    });

    it("rejects malformed JSON syntax gracefully", () => {
      expect(inspectBackupPayload("{ not valid json : ;")).toEqual({
        valid: false,
        keyCount: 0,
        totalBytes: 0,
      });
      expect(inspectBackupPayload("{ 'singleQuotes': true }")).toEqual({
        valid: false,
        keyCount: 0,
        totalBytes: 0,
      });
    });

    it("rejects JSON primitives and null as invalid backup payloads", () => {
      expect(inspectBackupPayload("12345")).toEqual({ valid: false, keyCount: 0, totalBytes: 0 });
      expect(inspectBackupPayload('"just a string"')).toEqual({ valid: false, keyCount: 0, totalBytes: 0 });
      expect(inspectBackupPayload("true")).toEqual({ valid: false, keyCount: 0, totalBytes: 0 });
      expect(inspectBackupPayload("null")).toEqual({ valid: false, keyCount: 0, totalBytes: 0 });
    });

    it("rejects JSON arrays as invalid backup payloads", () => {
      const arrayJson = JSON.stringify(["snippet 1", "snippet 2"]);
      expect(inspectBackupPayload(arrayJson)).toEqual({
        valid: false,
        keyCount: 0,
        totalBytes: 0,
      });
    });

    it("rejects objects containing non-string values (numbers, booleans, nested objects)", () => {
      const withNumber = JSON.stringify({ q1: "valid code", q2: 42 });
      expect(inspectBackupPayload(withNumber)).toEqual({ valid: false, keyCount: 0, totalBytes: 0 });

      const withBoolean = JSON.stringify({ q1: "valid code", q2: false });
      expect(inspectBackupPayload(withBoolean)).toEqual({ valid: false, keyCount: 0, totalBytes: 0 });

      const withNull = JSON.stringify({ q1: "valid code", q2: null });
      expect(inspectBackupPayload(withNull)).toEqual({ valid: false, keyCount: 0, totalBytes: 0 });

      const withNested = JSON.stringify({ q1: "valid code", nested: { q2: "code" } });
      expect(inspectBackupPayload(withNested)).toEqual({ valid: false, keyCount: 0, totalBytes: 0 });
    });

    it("handles non-string arguments safely without throwing", () => {
      expect(inspectBackupPayload(12345 as any)).toEqual({ valid: false, keyCount: 0, totalBytes: 0 });
      expect(inspectBackupPayload({} as any)).toEqual({ valid: false, keyCount: 0, totalBytes: 0 });
      expect(inspectBackupPayload([] as any)).toEqual({ valid: false, keyCount: 0, totalBytes: 0 });
    });

    it("supports static and instance delegates on SnippetResetGuard", () => {
      const payload = JSON.stringify({ s1: "const a = 1;" });
      const staticRes = SnippetResetGuard.inspectBackupPayload(payload);
      expect(staticRes.valid).toBe(true);
      expect(staticRes.keyCount).toBe(1);

      const guard = new SnippetResetGuard();
      const instanceRes = guard.inspectBackupPayload(payload);
      expect(instanceRes).toEqual(staticRes);
    });
  });
});
