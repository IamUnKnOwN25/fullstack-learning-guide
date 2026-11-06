function toSafeString(val: unknown): string {
  if (typeof val === "string") return val;
  if (val == null) return "";
  try {
    return String(val);
  } catch {
    return "";
  }
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
}

export default SnippetResetGuard;
