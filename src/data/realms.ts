export interface Realm {
  id: string;
  order: number;
  title: string;
  realmName: string;
  description: string;
  icon: string;
  themeColor: string;
  borderGlow: string;
  fileRef: string;
  requiredLevel: number;
  bossId: string;
  lore: string;
}

export const REALMS: Realm[] = [
  {
    id: "html",
    order: 1,
    title: "HTML5 & Web Semantics",
    realmName: "The Ruined Foundations",
    description: "Rebuild the structural bones of the corrupted Web Matrix with semantic tags, forms, and accessibility wards.",
    icon: "Layout",
    themeColor: "from-orange-500/20 to-amber-500/10 text-orange-400 border-orange-500/30",
    borderGlow: "shadow-orange-500/20",
    fileRef: "01-html-and-semantics.md",
    requiredLevel: 1,
    bossId: "html_boss",
    lore: "Before any magic or styling can exist, the structure must be true. The Malformed Tag Abomination has collapsed the visual hierarchy into empty <div> catacombs.",
  },
  {
    id: "css",
    order: 2,
    title: "CSS, Flexbox & Grid",
    realmName: "The Citadel of Styles",
    description: "Harness layout grids, flexible boxes, responsive breakpoints, and modern utility spells against visual entropy.",
    icon: "Palette",
    themeColor: "from-blue-500/20 to-cyan-500/10 text-cyan-400 border-cyan-500/30",
    borderGlow: "shadow-cyan-500/20",
    fileRef: "02-css-layout-and-styling.md",
    requiredLevel: 2,
    bossId: "css_boss",
    lore: "Unstyled content chaos has broken the viewport boundaries! The dreaded Overflow Hydra is pushing layouts off screen and breaking mobile screens everywhere.",
  },
  {
    id: "javascript",
    order: 3,
    title: "Modern JavaScript (ES6+)",
    realmName: "The Scripting Wilds",
    description: "Awaken logic, interactivity, promises, closures, and the event loop to breathe life into static ruins.",
    icon: "Sparkles",
    themeColor: "from-yellow-500/20 to-amber-500/10 text-yellow-400 border-yellow-500/30",
    borderGlow: "shadow-yellow-500/20",
    fileRef: "03-modern-javascript.md",
    requiredLevel: 4,
    bossId: "js_boss",
    lore: "The Wilds are rampant with unhandled rejections and callback hell. The Callback Kraken drags developers into pyramid-shaped deep water unless async/await spells are cast.",
  },
  {
    id: "typescript",
    order: 4,
    title: "Strict TypeScript & Contracts",
    realmName: "The Sanctuary of Types",
    description: "Forge unshakeable type contracts, discriminated unions, and runtime schema validations with Zod.",
    icon: "ShieldCheck",
    themeColor: "from-blue-600/20 to-indigo-500/10 text-blue-400 border-blue-500/30",
    borderGlow: "shadow-blue-500/20",
    fileRef: "04-strict-typescript.md",
    requiredLevel: 6,
    bossId: "ts_boss",
    lore: "Runtime crashes occur when assumptions are false. The Any-Demon infects codebases with unchecked null pointers. Only strict compile-time wards can banish it.",
  },
  {
    id: "react",
    order: 5,
    title: "React & Next.js Ecosystem",
    realmName: "The Reactive Archipelago",
    description: "Assemble reactive state trees, custom hooks, and server-side components into fluid modern interfaces.",
    icon: "Atom",
    themeColor: "from-cyan-500/20 to-teal-500/10 text-teal-300 border-teal-500/30",
    borderGlow: "shadow-teal-500/20",
    fileRef: "05-frontend-react-and-ecosystem.md",
    requiredLevel: 8,
    bossId: "react_boss",
    lore: "The Infinite Re-render Fiend is draining player CPUs with un-memoized loops and hydration mismatches. Harmonize the component tree to restore peace.",
  },
  {
    id: "backend",
    order: 6,
    title: "Node.js & Server Architecture",
    realmName: "The Engine Bastion",
    description: "Construct asynchronous REST APIs, secure JWT authentication barriers, and resilient Express middleware.",
    icon: "Server",
    themeColor: "from-emerald-500/20 to-green-500/10 text-emerald-400 border-emerald-500/30",
    borderGlow: "shadow-emerald-500/20",
    fileRef: "06-backend-nodejs.md",
    requiredLevel: 11,
    bossId: "backend_boss",
    lore: "Deep in the server vaults, the Event Loop Blocker has frozen synchronous execution, starving waiting clients of their HTTP responses.",
  },
  {
    id: "databases",
    order: 7,
    title: "Databases, SQL & Prisma",
    realmName: "The Vault of Relics",
    description: "Query relational vaults with PostgreSQL, build lightning-fast B-tree indices, and manage cache with Redis.",
    icon: "Database",
    themeColor: "from-purple-500/20 to-fuchsia-500/10 text-purple-400 border-purple-500/30",
    borderGlow: "shadow-purple-500/20",
    fileRef: "07-databases-and-sql.md",
    requiredLevel: 14,
    bossId: "db_boss",
    lore: "Ancient tables of structured knowledge lie vulnerable. The SQL Injection Behemoth feeds on un-sanitized string concatenations, destroying database tables with DROP TABLE spells.",
  },
  {
    id: "devops",
    order: 8,
    title: "Git, Linux & Docker DevOps",
    realmName: "The Harbor of Containers",
    description: "Navigate Git branches, build multi-stage Docker vessels, and deploy automated CI/CD pipelines.",
    icon: "Cpu",
    themeColor: "from-sky-500/20 to-blue-500/10 text-sky-400 border-sky-500/30",
    borderGlow: "shadow-sky-500/20",
    fileRef: "08-git-devops-deployment.md",
    requiredLevel: 17,
    bossId: "devops_boss",
    lore: "A monstrous Merge Conflict Chimera has locked the deployment harbor, halting containerized releases across the cloud clusters.",
  },
  {
    id: "testing",
    order: 9,
    title: "Testing, TDD & Playwright",
    realmName: "The Proving Grounds",
    description: "Forge automated unit test suites with Vitest, mock third-party barriers, and drive end-to-end user browser checks.",
    icon: "CheckCircle",
    themeColor: "from-rose-500/20 to-red-500/10 text-rose-400 border-rose-500/30",
    borderGlow: "shadow-rose-500/20",
    fileRef: "09-testing-and-quality.md",
    requiredLevel: 20,
    bossId: "testing_boss",
    lore: "The Flaky Test Spectre haunts the automated test runners, causing false alarms and bypassing continuous deployment gates under cover of asynchronous timing bugs.",
  },
  {
    id: "cs",
    order: 10,
    title: "CS Fundamentals & System Design",
    realmName: "The Spire of Algorithms",
    description: "Conquer Big-O complexity, balance binary search trees, and architect distributed high-throughput backends.",
    icon: "Network",
    themeColor: "from-indigo-500/20 to-violet-500/10 text-indigo-400 border-indigo-500/30",
    borderGlow: "shadow-indigo-500/20",
    fileRef: "10-cs-fundamentals-and-system-design.md",
    requiredLevel: 24,
    bossId: "cs_boss",
    lore: "Scaling beyond a single machine requires algorithmic mastery. At the peak of the Spire towers the O(N!) Behemoth, devouring CPU cycles whenever bad complexity choices are made.",
  },
  {
    id: "security",
    order: 11,
    title: "Web Security & Web Vitals",
    realmName: "The Bastion of Aegis",
    description: "Shield endpoints against OWASP threats, enforce strict CSP headers, and tune Core Web Vitals (LCP, INP, CLS).",
    icon: "ShieldAlert",
    themeColor: "from-amber-500/20 to-red-500/10 text-amber-400 border-amber-500/30",
    borderGlow: "shadow-amber-500/20",
    fileRef: "11-security-and-performance.md",
    requiredLevel: 28,
    bossId: "security_boss",
    lore: "The XSS Phantom slips through unescaped innerHTML cracks, stealing cookies and session tokens. You must construct an impenetrable fortress of Content Security Policy and sanitization.",
  },
  {
    id: "capstone",
    order: 12,
    title: "The Capstone: Team Task Manager",
    realmName: "The Matrix Core",
    description: "Assemble every discipline—React, Node, Postgres, Docker, Testing, and Security—into a shipped production masterpiece.",
    icon: "Trophy",
    themeColor: "from-matrix-accent/20 to-neonCyan/10 text-matrix-accent border-matrix-accent/40",
    borderGlow: "shadow-matrix-accent/30",
    fileRef: "12-roadmap-capstone-and-resources.md",
    requiredLevel: 32,
    bossId: "final_boss",
    lore: "The final chamber where The Null Void itself dwells. Only a fully architected, battle-tested, end-to-end fullstack platform can restore the Web Matrix to eternal stability.",
  },
];

const REALM_ALIASES: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  db: "databases",
  database: "databases",
};

/**
 * Normalizes a realm identifier by trimming whitespace, converting to lowercase,
 * and resolving common shorthand aliases ('js' -> 'javascript', 'ts' -> 'typescript',
 * 'db' | 'database' -> 'databases'). Returns an empty string for nullish or non-string inputs.
 */
export function resolveRealmAlias(realmId: string): string {
  if (typeof realmId !== "string") {
    return "";
  }
  const cleaned = realmId.trim().toLowerCase();
  if (!cleaned) {
    return "";
  }
  return REALM_ALIASES[cleaned] ?? cleaned;
}

/**
 * Retrieves a realm by its identifier or shorthand alias.
 * Returns undefined if no matching realm is found.
 */
export function getRealmById(realmId: string): Realm | undefined {
  const resolved = resolveRealmAlias(realmId);
  if (!resolved) {
    return undefined;
  }
  return REALMS.find((realm) => realm.id === resolved);
}

/**
 * Retrieves a realm by its 1-based order index (1..12).
 * Returns undefined if order is invalid, out of bounds, or NaN.
 */
export function getRealmByOrder(order: number): Realm | undefined {
  if (typeof order !== "number" || !Number.isFinite(order) || Number.isNaN(order)) {
    return undefined;
  }
  return REALMS.find((realm) => realm.order === order);
}

/**
 * Retrieves the realm immediately following the given realm in campaign progression.
 * Returns undefined if the current realm is the last realm (order 12) or does not exist.
 */
export function getNextRealm(currentRealmId: string): Realm | undefined {
  const current = getRealmById(currentRealmId);
  if (!current) {
    return undefined;
  }
  return getRealmByOrder(current.order + 1);
}

/**
 * Retrieves the realm immediately preceding the given realm in campaign progression.
 * Returns undefined if the current realm is the first realm (order 1) or does not exist.
 */
export function getPreviousRealm(currentRealmId: string): Realm | undefined {
  const current = getRealmById(currentRealmId);
  if (!current) {
    return undefined;
  }
  return getRealmByOrder(current.order - 1);
}

/**
 * Determines whether a realm is unlocked for a player based on their level
 * or explicit membership in an unlocked realms list.
 */
export function isRealmUnlocked(
  realmId: string,
  playerLevel: number,
  unlockedRealms?: string[]
): boolean {
  const realm = getRealmById(realmId);
  if (!realm) {
    return false;
  }

  if (Array.isArray(unlockedRealms)) {
    const isExplicitlyUnlocked = unlockedRealms.some(
      (entry) => resolveRealmAlias(entry) === realm.id
    );
    if (isExplicitlyUnlocked) {
      return true;
    }
  }

  const safePlayerLevel =
    typeof playerLevel === "number" && Number.isFinite(playerLevel) && !Number.isNaN(playerLevel)
      ? playerLevel
      : 0;

  return safePlayerLevel >= realm.requiredLevel;
}


export const normalizeRealmId = resolveRealmAlias;

export interface RealmNavigationContext {
  prev: Realm | null;
  current: Realm | null;
  next: Realm | null;
}

/**
 * Calculates campaign progression statistics based on a list of completed realm identifiers.
 * Deduplicates and normalizes realm IDs against known REALMS, returning the completed count,
 * total realm count, and a rounded completion percentage between 0 and 100.
 */
export function getCampaignProgression(completedRealmIds: string[]): {
  completedCount: number;
  totalCount: number;
  percentage: number;
} {
  const totalCount = REALMS.length;
  if (!Array.isArray(completedRealmIds) || totalCount === 0) {
    return {
      completedCount: 0,
      totalCount,
      percentage: 0,
    };
  }

  const validCompletedSet = new Set<string>();

  for (const rawId of completedRealmIds) {
    const realm = getRealmById(rawId);
    if (realm) {
      validCompletedSet.add(realm.id);
    }
  }

  const completedCount = validCompletedSet.size;
  const rawPercentage = (completedCount / totalCount) * 100;
  const percentage = Math.min(100, Math.max(0, Math.round(rawPercentage)));

  return {
    completedCount,
    totalCount,
    percentage,
  };
}

/**
 * Filters realms that are available up to a given player level (requiredLevel <= floor(playerLevel)).
 * Returns an empty array if playerLevel is less than 1 or non-finite.
 */
export function filterRealmsByMaxLevel(playerLevel: number): Realm[] {
  if (typeof playerLevel !== "number" || !Number.isFinite(playerLevel) || playerLevel < 1) {
    return [];
  }
  const flooredLevel = Math.floor(playerLevel);
  return REALMS.filter((realm) => realm.requiredLevel <= flooredLevel);
}

/**
 * Retrieves a realm associated with a specific boss identifier, matching case-insensitively.
 * Returns undefined if no matching realm is found or if bossId is invalid.
 */
export function getRealmByBossId(bossId: string): Realm | undefined {
  if (typeof bossId !== "string") {
    return undefined;
  }
  const cleaned = bossId.trim().toLowerCase();
  if (!cleaned) {
    return undefined;
  }
  return REALMS.find((realm) => realm.bossId.toLowerCase() === cleaned);
}

/**
 * Resolves the navigation context (previous, current, and next realms) for a given realm ID.
 * Supports realm aliases and returns null for predecessor/successor at boundaries or when
 * the realm cannot be resolved.
 */
export function getRealmNavigationContext(realmId: string): RealmNavigationContext {
  const current = getRealmById(realmId) ?? null;
  if (!current) {
    return {
      prev: null,
      current: null,
      next: null,
    };
  }

  const prev = getPreviousRealm(current.id) ?? null;
  const next = getNextRealm(current.id) ?? null;

  return {
    prev,
    current,
    next,
  };
}
