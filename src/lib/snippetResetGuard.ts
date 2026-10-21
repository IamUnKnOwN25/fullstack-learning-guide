export class SnippetResetGuard {
  /**
   * Compares the current code against the starter code.
   * Returns true if it is safe to reset (i.e. the code has not been significantly modified).
   * Strips all whitespace for a robust comparison.
   */
  static isSafeToReset(currentCode: string, starterCode: string): boolean {
    if (!currentCode || currentCode.trim() === "") {
      return true;
    }
    if (!starterCode && currentCode.trim() !== "") {
      return false;
    }

    const normalize = (str: string) => str.replace(/\s+/g, "");
    return normalize(currentCode) === normalize(starterCode);
  }

  /**
   * Saves a draft of the code to localStorage.
   * Fails gracefully in SSR or if quota is exceeded.
   */
  static saveBackup(id: string, code: string): void {
    if (typeof window === "undefined" || typeof window.localStorage === "undefined") return;
    try {
      window.localStorage.setItem(`devquest_backup_${id}`, code);
    } catch (e) {
      console.warn("SnippetResetGuard: Failed to save backup", e);
    }
  }

  /**
   * Retrieves a draft of the code from localStorage.
   */
  static getBackup(id: string): string | null {
    if (typeof window === "undefined" || typeof window.localStorage === "undefined") return null;
    try {
      return window.localStorage.getItem(`devquest_backup_${id}`);
    } catch (e) {
      console.warn("SnippetResetGuard: Failed to retrieve backup", e);
      return null;
    }
  }

  /**
   * Clears a draft of the code from localStorage.
   */
  static clearBackup(id: string): void {
    if (typeof window === "undefined" || typeof window.localStorage === "undefined") return;
    try {
      window.localStorage.removeItem(`devquest_backup_${id}`);
    } catch (e) {
      console.warn("SnippetResetGuard: Failed to clear backup", e);
    }
  }
}
