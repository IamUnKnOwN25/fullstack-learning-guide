function toSafeString(val: unknown): string {
  if (typeof val === "string") return val;
  if (val == null) return "";
  try {
    return String(val);
  } catch {
    return "";
  }
}

export interface CodeDifferenceResult {
  hasChanged: boolean;
  lineDelta: number;
  charDelta: number;
  similarityRatio: number;
}

export interface BackupPayloadInspection {
  valid: boolean;
  keyCount: number;
  totalBytes: number;
}

function computeLevenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  let start = 0;
  while (start < a.length && start < b.length && a.charCodeAt(start) === b.charCodeAt(start)) {
    start++;
  }

  let aEnd = a.length - 1;
  let bEnd = b.length - 1;
  while (aEnd >= start && bEnd >= start && a.charCodeAt(aEnd) === b.charCodeAt(bEnd)) {
    aEnd--;
    bEnd--;
  }

  const aLen = aEnd - start + 1;
  const bLen = bEnd - start + 1;

  if (aLen <= 0) return bLen;
  if (bLen <= 0) return aLen;

  let s1 = a.slice(start, aEnd + 1);
  let s2 = b.slice(start, bEnd + 1);

  if (s1.length > s2.length) {
    const tmp = s1;
    s1 = s2;
    s2 = tmp;
  }

  const len1 = s1.length;
  const len2 = s2.length;
  const v0 = new Int32Array(len1 + 1);
  const v1 = new Int32Array(len1 + 1);

  for (let i = 0; i <= len1; i++) {
    v0[i] = i;
  }

  for (let j = 0; j < len2; j++) {
    v1[0] = j + 1;
    const s2Char = s2.charCodeAt(j);
    for (let i = 0; i < len1; i++) {
      const cost = s1.charCodeAt(i) === s2Char ? 0 : 1;
      v1[i + 1] = Math.min(v1[i] + 1, v0[i + 1] + 1, v0[i] + cost);
    }
    for (let i = 0; i <= len1; i++) {
      v0[i] = v1[i];
    }
  }

  return v0[len1];
}

/**
 * Computes difference telemetry between an original code snippet and current code snippet.
 * Normalizes CRLF line endings to LF, compares trimmed strings, and computes deltas and similarity ratio.
 */
export function computeCodeDifference(
  originalCode: string,
  currentCode: string
): CodeDifferenceResult {
  const normOrig = toSafeString(originalCode)
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
  const normCurr = toSafeString(currentCode)
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");

  const trimmedOrig = normOrig.trim();
  const trimmedCurr = normCurr.trim();

  const hasChanged = trimmedOrig !== trimmedCurr;

  const origLines = trimmedOrig.length === 0 ? 0 : trimmedOrig.split("\n").length;
  const currLines = trimmedCurr.length === 0 ? 0 : trimmedCurr.split("\n").length;
  const lineDelta = currLines - origLines;

  const charDelta = trimmedCurr.length - trimmedOrig.length;

  let similarityRatio: number;
  if (!hasChanged) {
    similarityRatio = 1;
  } else if (trimmedOrig.length === 0 || trimmedCurr.length === 0) {
    similarityRatio = 0;
  } else {
    const dist = computeLevenshtein(trimmedOrig, trimmedCurr);
    const maxLen = Math.max(trimmedOrig.length, trimmedCurr.length);
    const rawRatio = maxLen === 0 ? 1 : (maxLen - dist) / maxLen;
    similarityRatio = Math.max(0, Math.min(1, Math.round(rawRatio * 10000) / 10000));
  }

  return {
    hasChanged,
    lineDelta,
    charDelta,
    similarityRatio,
  };
}

/**
 * Safely parses and inspects a JSON backup payload map.
 * Returns valid = true only if it is a valid non-array plain object of string values.
 */
export function inspectBackupPayload(
  rawJson: string | null | undefined
): BackupPayloadInspection {
  if (typeof rawJson !== "string" || rawJson.trim() === "") {
    return { valid: false, keyCount: 0, totalBytes: 0 };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    return { valid: false, keyCount: 0, totalBytes: 0 };
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    Array.isArray(parsed)
  ) {
    return { valid: false, keyCount: 0, totalBytes: 0 };
  }

  const entries = Object.entries(parsed as Record<string, unknown>);
  let totalBytes = 0;

  for (const [, val] of entries) {
    if (typeof val !== "string") {
      return { valid: false, keyCount: 0, totalBytes: 0 };
    }
    const byteLen =
      typeof TextEncoder !== "undefined"
        ? new TextEncoder().encode(val).length
        : val.length;
    totalBytes += byteLen;
  }

  return {
    valid: true,
    keyCount: entries.length,
    totalBytes,
  };
}

export class SnippetResetGuard {
  static readonly PREFIX = "devquest_backup_";
  static readonly BACKUP_PREFIX = "devquest_backup_";

  readonly PREFIX = SnippetResetGuard.PREFIX;
  readonly BACKUP_PREFIX = SnippetResetGuard.BACKUP_PREFIX;

  /**
   * Compares the current code against the starter code.
   * Returns true if it is safe to reset (i.e. the code has not been significantly modified).
   * Strips all whitespace for a robust comparison.
   * Safe against non-string and nullish inputs.
   */
  static isSafeToReset(currentCode: string, starterCode: string): boolean {
    const cur = typeof currentCode === "string" ? currentCode : (currentCode == null ? "" : toSafeString(currentCode));
    const starter = typeof starterCode === "string" ? starterCode : (starterCode == null ? "" : toSafeString(starterCode));

    if (!cur || cur.trim() === "") {
      return true;
    }
    if ((!starter || starter.trim() === "") && cur.trim() !== "") {
      return false;
    }

    const normalize = (str: string) => str.replace(/\s+/g, "");
    return normalize(cur) === normalize(starter);
  }

  /**
   * Saves a draft of the code to localStorage.
   * Fails gracefully in SSR, invalid inputs, or if quota is exceeded.
   */
  static saveBackup(id: string, code: string): void {
    SnippetResetGuard.backupSnippet(id, code);
  }

  /**
   * Alias for saveBackup matching the snippet reset guard specification.
   */
  static backupSnippet(id: string, code: string): void {
    if (typeof window === "undefined" || typeof window.localStorage === "undefined") return;
    if (!id || typeof id !== "string" || id.trim() === "") return;
    if (typeof code !== "string") return;
    try {
      window.localStorage.setItem(`${SnippetResetGuard.PREFIX}${id.trim()}`, code);
    } catch (e) {
      console.warn("SnippetResetGuard: Failed to save backup", e);
    }
  }

  /**
   * Retrieves a draft of the code from localStorage.
   */
  static getBackup(id: string): string | null {
    return SnippetResetGuard.restoreSnippet(id);
  }

  /**
   * Alias for getBackup matching the snippet reset guard specification.
   */
  static restoreSnippet(id: string): string | null {
    if (typeof window === "undefined" || typeof window.localStorage === "undefined") return null;
    if (!id || typeof id !== "string" || id.trim() === "") return null;
    try {
      return window.localStorage.getItem(`${SnippetResetGuard.PREFIX}${id.trim()}`);
    } catch (e) {
      console.warn("SnippetResetGuard: Failed to retrieve backup", e);
      return null;
    }
  }

  /**
   * Checks whether a backup exists for the given snippet ID.
   */
  static hasBackup(id: string): boolean {
    if (typeof window === "undefined" || typeof window.localStorage === "undefined") return false;
    if (!id || typeof id !== "string" || id.trim() === "") return false;
    try {
      return window.localStorage.getItem(`${SnippetResetGuard.PREFIX}${id.trim()}`) !== null;
    } catch (e) {
      console.warn("SnippetResetGuard: Failed to check backup", e);
      return false;
    }
  }

  /**
   * Lists all snippet IDs that have saved backups.
   * Returns stripped snippet IDs for keys matching the backup prefix.
   */
  static listBackups(): string[] {
    if (typeof window === "undefined" || typeof window.localStorage === "undefined") return [];
    try {
      const ids: string[] = [];
      const prefix = SnippetResetGuard.PREFIX;

      // 1. Standard Web Storage API: length and key(index)
      if (typeof window.localStorage.length === "number" && typeof window.localStorage.key === "function") {
        for (let i = 0; i < window.localStorage.length; i++) {
          const key = window.localStorage.key(i);
          if (typeof key === "string" && key.startsWith(prefix)) {
            const id = key.slice(prefix.length);
            if (id.length > 0 && !ids.includes(id)) {
              ids.push(id);
            }
          }
        }
      }

      // 2. Fallback: enumerable properties on localStorage
      try {
        const objectKeys = Object.keys(window.localStorage);
        for (const key of objectKeys) {
          if (typeof key === "string" && key.startsWith(prefix)) {
            const id = key.slice(prefix.length);
            if (id.length > 0 && !ids.includes(id)) {
              ids.push(id);
            }
          }
        }
      } catch {
        // Enumerable properties extraction fallback safe
      }

      return ids;
    } catch (e) {
      console.warn("SnippetResetGuard: Failed to list backups", e);
      return [];
    }
  }

  /**
   * Clears a draft of the code from localStorage.
   */
  static clearBackup(id: string): void {
    if (typeof window === "undefined" || typeof window.localStorage === "undefined") return;
    if (!id || typeof id !== "string" || id.trim() === "") return;
    try {
      window.localStorage.removeItem(`${SnippetResetGuard.PREFIX}${id.trim()}`);
    } catch (e) {
      console.warn("SnippetResetGuard: Failed to clear backup", e);
    }
  }

  /**
   * Clears all saved snippet backups from localStorage without affecting other keys.
   */
  static clearAllBackups(): void {
    if (typeof window === "undefined" || typeof window.localStorage === "undefined") return;
    try {
      const ids = SnippetResetGuard.listBackups();
      for (const id of ids) {
        SnippetResetGuard.clearBackup(id);
      }
    } catch (e) {
      console.warn("SnippetResetGuard: Failed to clear all backups", e);
    }
  }

  // Instance method delegates for runtime flexibility
  isSafeToReset(currentCode: string, starterCode: string): boolean {
    return SnippetResetGuard.isSafeToReset(currentCode, starterCode);
  }

  saveBackup(id: string, code: string): void {
    SnippetResetGuard.saveBackup(id, code);
  }

  backupSnippet(id: string, code: string): void {
    SnippetResetGuard.backupSnippet(id, code);
  }

  getBackup(id: string): string | null {
    return SnippetResetGuard.getBackup(id);
  }

  restoreSnippet(id: string): string | null {
    return SnippetResetGuard.restoreSnippet(id);
  }

  hasBackup(id: string): boolean {
    return SnippetResetGuard.hasBackup(id);
  }

  listBackups(): string[] {
    return SnippetResetGuard.listBackups();
  }

  clearBackup(id: string): void {
    SnippetResetGuard.clearBackup(id);
  }

  clearAllBackups(): void {
    SnippetResetGuard.clearAllBackups();
  }

  static computeCodeDifference(originalCode: string, currentCode: string): CodeDifferenceResult {
    return computeCodeDifference(originalCode, currentCode);
  }

  static inspectBackupPayload(rawJson: string | null | undefined): BackupPayloadInspection {
    return inspectBackupPayload(rawJson);
  }

  computeCodeDifference(originalCode: string, currentCode: string): CodeDifferenceResult {
    return computeCodeDifference(originalCode, currentCode);
  }

  inspectBackupPayload(rawJson: string | null | undefined): BackupPayloadInspection {
    return inspectBackupPayload(rawJson);
  }
}

export default SnippetResetGuard;
