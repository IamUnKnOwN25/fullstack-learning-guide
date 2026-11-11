export interface CompanionDialogueContext {
  justLeveledUp?: boolean;
  hasError?: boolean;
  realmId?: string;
}

export function getCompanionDialogue(context: CompanionDialogueContext): string {
  if (context.justLeveledUp) {
    return "Congratulations on leveling up! Your power grows!";
  }

  if (context.hasError) {
    return "Don't give up! Every error is a learning opportunity. You can do this!";
  }

  const normalizedRealm = context.realmId?.trim().toLowerCase();
  if (normalizedRealm) {
    switch (normalizedRealm) {
      case "html":
        return "A11y Wisdom: Using semantic HTML tags like <nav> and <main> lets screen-reader users navigate by landmarks.";
      case "css":
        return "Tip: In the CSS realm, switch to the Concept Visualizer tab to play with live flex-direction and justify-content!";
      case "javascript":
        return "Did you know? JavaScript Promises drain on the Microtask Queue before setTimeout(0) macrotasks fire!";
      case "typescript":
        return "Tactical Intel: The Any-Demon boss in Realm 04 is weak to Discriminated Unions and unknown type narrowing.";
      case "react":
        return "React Hint: Keep an eye on your dependency arrays in useEffect to prevent infinite render loops!";
      case "backend":
        return "Backend Tip: Always handle your promise rejections to prevent silent server crashes.";
      case "databases":
        return "Database Defense: Never concatenate user strings into raw SQL! Parameterized queries ($1, $2) neutralize injection.";
      case "devops":
        return "Docker Magic: Multi-stage builds compile artifacts in a build container, leaving the production image ultralight.";
      case "testing":
        return "Testing Fact: Flaky tests are often caused by race conditions or shared state between tests.";
      case "cs":
        return "CS Wisdom: Hash maps provide O(1) average time complexity for lookups, making them incredibly fast.";
      case "security":
        return "Security First: Always sanitize user input to prevent XSS attacks before rendering it in the DOM.";
      case "capstone":
        return "Capstone Insight: A robust architecture balances scalability, maintainability, and performance.";
      default:
        return "Stay alert! The matrix is ever-changing.";
    }
  }

  return "I'm Byte, your cyber-companion! Let's conquer the matrix together.";
}

export const DEFAULT_COMPANION_DIALOGUE =
  "Keep pushing forward! Every challenge in the matrix is an opportunity to learn and grow.";

export const COMPANION_QUEST_DIALOGUES: Record<string, Record<string, string>> = {
  html: {
    html_1_skeleton:
      "Anchor the matrix with semantic tags! A proper <!DOCTYPE html> and <head> structure ensures modern browser rendering.",
    html_2_forms:
      "Every form input needs an accessible label. Screen readers rely on clear form field bindings to navigate user input.",
  },
  css: {
    css_1_flexbox:
      "Flexbox aligns and distributes space dynamically across axes. Use justify-content and align-items to center elements effortlessly.",
    css_2_grid:
      "CSS Grid gives you full two-dimensional layout mastery. repeat(auto-fit, minmax(...)) creates responsive columns without media queries.",
  },
  javascript: {
    js_1_dom:
      "Manipulate DOM nodes cleanly. createElement and appendChild build reactive interfaces from fundamental primitives.",
    js_2_async:
      "Promises and async/await tame asynchronous streams. Microtasks always drain before the next macrotask executes!",
  },
  typescript: {
    ts_1_interfaces:
      "Interfaces enforce strict contracts at compile time. Declare required properties to catch bugs before runtime.",
    ts_2_generics:
      "Generics allow you to build reusable, type-safe data structures without sacrificing type information to 'any'.",
  },
  react: {
    react_1_hooks:
      "useState and useEffect power reactive component lifecycles. Always specify complete dependency arrays to avoid stale closures.",
    react_2_server_actions:
      "Server Actions execute securely on the server while feeling like direct client invocations.",
  },
  backend: {
    backend_1_express_rest:
      "RESTful endpoints should use standard HTTP verbs (GET, POST, PUT, DELETE) and status codes (200, 201, 404).",
    backend_2_jwt_auth:
      "Authenticate requests with signed JSON Web Tokens. Never expose secret keys in client-side code.",
  },
  databases: {
    db_1_postgres:
      "Relational tables enforce schema integrity with foreign keys. Always write deterministic SQL queries.",
    db_2_indexes_prisma:
      "B-Tree indexes reduce table scan overhead from O(N) to O(log N). Index high-cardinality foreign keys and filter columns.",
  },
  devops: {
    devops_1_docker:
      "Multi-stage Docker builds strip compiler tools from production containers, creating lightweight and secure runtime images.",
    devops_2_github_actions:
      "CI pipelines automate linting, typechecking, and test validation on every pull request.",
  },
  testing: {
    testing_1_unit_vitest:
      "Unit tests provide rapid feedback. Test edge cases, boundary values, and error conditions thoroughly.",
    testing_2_mocking:
      "Use spies and stubs to isolate units under test from external side-effects like databases or network calls.",
  },
  cs: {
    cs_1_binary_search:
      "Binary search cuts the search space in half with each iteration, achieving O(log N) speed on sorted arrays.",
    cs_2_hashmap_frequency:
      "Hash maps provide O(1) average lookup times, making them the ideal choice for frequency counting and fast lookups.",
  },
  security: {
    security_1_xss_sanitize:
      "Never inject unescaped user input into innerHTML. Always sanitize data before rendering in the DOM.",
    security_2_jwt_verification:
      "Always verify cryptographic signatures on incoming JWTs before trusting their claims or user identity.",
  },
  capstone: {
    capstone_1_architecture:
      "A resilient architecture separates concerns cleanly across presentation, business logic, and data layers.",
    capstone_2_health_probe:
      "Healthcheck endpoints should verify downstream database and cache connectivity concurrently with Promise.all.",
  },
};

export const COMPANION_DICTIONARY = COMPANION_QUEST_DIALOGUES;

/**
 * Sanitizes level and hpPercent numbers:
 * - level: validated with Number.isFinite, floored, and clamped to at least 1. Defaults to 1 if non-finite.
 * - hpPercent: validated with Number.isFinite and clamped between 0 and 100. Defaults to 100 if non-finite.
 */
export function sanitizeDialogueStats(
  level?: number | null,
  hpPercent?: number | null
): { level: number; hpPercent: number } {
  const sanitizedLevel =
    typeof level === "number" && Number.isFinite(level)
      ? Math.max(1, Math.floor(level))
      : 1;

  const sanitizedHp =
    typeof hpPercent === "number" && Number.isFinite(hpPercent)
      ? Math.min(100, Math.max(0, hpPercent))
      : 100;

  return { level: sanitizedLevel, hpPercent: sanitizedHp };
}

/**
 * Retrieves quest-specific pedagogical dialogue for active realm and quest context.
 * Gracefully falls back to an encouraging default dialogue if realmId or questId is not found.
 * Sanitizes level and hpPercent to prevent non-finite numbers from causing unexpected runtime errors.
 */
export function getDialogueForContext(
  realmId?: string | null,
  questId?: string | null,
  level?: number | null,
  hpPercent?: number | null
): string {
  // Sanitize level and hpPercent with Number.isFinite and clamp hpPercent between 0 and 100
  const { level: _safeLevel, hpPercent: _safeHp } = sanitizeDialogueStats(level, hpPercent);
  void _safeLevel;
  void _safeHp;

  if (!realmId || typeof realmId !== "string" || !questId || typeof questId !== "string") {
    return DEFAULT_COMPANION_DIALOGUE;
  }

  const normalizedRealm = realmId.trim().toLowerCase();
  const normalizedQuest = questId.trim().toLowerCase();

  const realmDict = COMPANION_QUEST_DIALOGUES[normalizedRealm];
  if (!realmDict) {
    return DEFAULT_COMPANION_DIALOGUE;
  }

  const dialogue = realmDict[normalizedQuest];
  if (!dialogue) {
    return DEFAULT_COMPANION_DIALOGUE;
  }

  return dialogue;
}

/**
 * Evaluates player HP and returns a tactical warning message if health drops below 25%.
 * Sanitizes non-finite inputs and returns null when maxHp <= 0 or when hp / maxHp > 0.25.
 */
export function getLowHealthWarning(hp: number, maxHp: number): string | null {
  if (
    typeof hp !== "number" ||
    typeof maxHp !== "number" ||
    !Number.isFinite(hp) ||
    !Number.isFinite(maxHp) ||
    maxHp <= 0
  ) {
    return null;
  }

  const ratio = hp / maxHp;
  if (ratio > 0.25) {
    return null;
  }

  if (ratio <= 0.1) {
    return "CRITICAL WARNING: Matrix integrity critically compromised (<10%)! Evade incoming attacks and execute recovery protocols immediately!";
  }

  return "Tactical Warning: Health dropped below 25%! Check your code syntax and defenses before your runtime crashes!";
}

export const DEFAULT_BOSS_INTRO_DIALOGUE =
  "Boss encounter initiated! Analyze attack patterns, write clean code, and exploit weakness vectors to prevail.";

export const BOSS_REALM_ALIASES: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  db: "databases",
  database: "databases",
};

export const BOSS_INTRO_DIALOGUES: Record<string, string> = {
  html: "Boss Alert: The Malformed Tag Abomination corrupts structure! Use semantic HTML elements like <nav>, <header>, and <main> to break its shield.",
  css: "Boss Alert: The Overflow Hydra is breaking layout boundaries! Deploy flex-wrap, justify-content, and grid templates to contain it.",
  javascript: "Boss Alert: The Event Loop Leviathan floods the macrotask queue! Chain Promises properly and utilize async/await to outpace it.",
  typescript: "Boss Alert: The Any-Demon corrupts compile-time safety! Wield Discriminated Unions and strict type guards to banish loose any types.",
  react: "Boss Alert: The Infinite Re-render Fiend threatens UI stability! Stabilize useEffect dependency arrays and memoize expensive state calculations.",
  backend: "Boss Alert: The Rogue Gateway returns unhandled 500s! Enforce strict REST status codes and wrap async operations in resilient try-catch blocks.",
  databases: "Boss Alert: The SQL Injection Golem breaches data stores! Parameterize all database queries and index foreign keys to withstand the onslaught.",
  devops: "Boss Alert: The Monolithic Container Colossus overwhelms system resources! Leverage multi-stage Docker builds and automated CI pipelines to slice it down.",
  testing: "Boss Alert: The Flaky Spectre evades test coverage! Eliminate async race conditions and isolate component tests with deterministic stubs.",
  cs: "Boss Alert: The Quadratic Complexity Behemoth chokes CPU execution! Refactor brute-force loops into O(1) hash maps and O(log N) binary searches.",
  security: "Boss Alert: The Zero-Day Phantom exploits untrusted inputs! Sanitize DOM bindings to neutralize XSS and cryptographically verify all auth tokens.",
  capstone: "Boss Alert: The Web Matrix Core demands complete fullstack mastery! Integrate frontend, backend, database, and devops layers into an unbreakable architecture.",
};

/**
 * Returns realm-specific boss battle advice, normalizing case, whitespace,
 * and shorthand aliases ('js', 'ts', 'db'). Falls back to a safe default for unknown realms.
 */
export function getBossIntroDialogue(realmId: string): string {
  if (!realmId || typeof realmId !== "string") {
    return DEFAULT_BOSS_INTRO_DIALOGUE;
  }

  const normalized = realmId.trim().toLowerCase();
  const resolvedRealm = BOSS_REALM_ALIASES[normalized] || normalized;

  return BOSS_INTRO_DIALOGUES[resolvedRealm] || DEFAULT_BOSS_INTRO_DIALOGUE;
}

export const CATEGORY_ALIASES: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  db: "databases",
  database: "databases",
  cs: "theory",
  algorithms: "theory",
  boss: "bosses",
  quest: "quests",
  "front-end": "frontend",
  "back-end": "backend",
};

export const COMPANION_CATEGORY_TIPS: Record<string, string[]> = {
  foundations: [
    "Foundations Tip: Use semantic HTML landmarks (<main>, <nav>, <header>) so screen readers can navigate structure effortlessly.",
    "Foundations Tip: Provide explicit form labels and aria attributes for accessible, robust user interactions.",
    "Foundations Tip: Keep HTML document structure valid with proper <!DOCTYPE html> and viewport meta tags.",
  ],
  frontend: [
    "Frontend Tip: Master Flexbox and CSS Grid to build responsive, accessible layouts without brittle media query hacks.",
    "Frontend Tip: Keep React component renders pure and maintain complete dependency arrays in useEffect.",
    "Frontend Tip: Manipulate DOM state cleanly and debounce user inputs on high-frequency search fields.",
  ],
  backend: [
    "Backend Tip: Structure endpoints with RESTful semantics and always handle rejected promises to prevent unhandled crashes.",
    "Backend Tip: Store cryptographic keys in environment variables and authenticate sensitive routes with signed tokens.",
    "Backend Tip: Validate incoming request payloads strictly at the controller boundary before hitting services.",
  ],
  databases: [
    "Database Tip: Always parameterize queries ($1, $2) to eliminate SQL injection vulnerabilities completely.",
    "Database Tip: Place B-tree indexes on high-cardinality foreign keys and frequent filter columns.",
    "Database Tip: Enforce relational referential integrity with foreign key constraints and atomic transactions.",
  ],
  devops: [
    "DevOps Tip: Use multi-stage Docker builds to keep production containers lean and free of build-time dependencies.",
    "DevOps Tip: Automate linting, typechecking, and test validation on every branch with CI workflows.",
    "DevOps Tip: Configure healthcheck probes to verify database and external dependency readiness.",
  ],
  testing: [
    "Testing Tip: Write focused unit tests that verify boundary conditions and edge cases with deterministic assertions.",
    "Testing Tip: Use mocks and spies to isolate the unit under test from network and database dependencies.",
    "Testing Tip: Eliminate shared global state and timing race conditions to keep test suites blazing fast and reliable.",
  ],
  theory: [
    "Theory Tip: Use hash tables for O(1) average lookup and frequency counting in high-throughput loops.",
    "Theory Tip: Binary search reduces search spaces in O(log N) time on sorted data sets.",
    "Theory Tip: Analyze both time and space complexity before choosing an algorithmic data structure.",
  ],
  security: [
    "Security Tip: Sanitize all untrusted user inputs before injecting them into the DOM to prevent XSS attacks.",
    "Security Tip: Always verify JWT cryptographic signatures and token expiration before trusting claims.",
    "Security Tip: Enforce strict Content Security Policy (CSP) headers and avoid storing secrets in client bundles.",
  ],
  mastery: [
    "Mastery Tip: Strive for high cohesion and loose coupling across presentation, business logic, and data layers.",
    "Mastery Tip: Measure performance bottlenecks with real profiling data before applying speculative optimizations.",
    "Mastery Tip: Continuously validate your entire application stack with automated end-to-end and typecheck gates.",
  ],
  bosses: [
    "Boss Combat Tip: Study the boss phase prompts closely to identify the exact keywords and patterns required.",
    "Boss Combat Tip: Keep an eye on your HP bar and verify syntax before submitting code to avoid taking damage.",
    "Boss Combat Tip: Exploit realm-specific weaknesses like Discriminated Unions and parameterized SQL queries.",
  ],
  quests: [
    "Quest Tip: Read the quest objective and requirements carefully before writing your solution.",
    "Quest Tip: Test your solution incrementally and use the in-browser IDE preview to verify rendering.",
    "Quest Tip: Leveling up unlocks new realm regions and equips your cyber-avatar with advanced abilities.",
  ],
};

/**
 * Returns a deterministic tip for the given category and seedIndex.
 * Safely falls back to DEFAULT_COMPANION_DIALOGUE for unknown categories,
 * negative seedIndex, or non-finite/NaN seedIndex.
 */
export function getCompanionTipByCategory(category: string, seedIndex = 0): string {
  if (
    !category ||
    typeof category !== "string" ||
    typeof seedIndex !== "number" ||
    !Number.isFinite(seedIndex) ||
    seedIndex < 0
  ) {
    return DEFAULT_COMPANION_DIALOGUE;
  }

  const normalized = category.trim().toLowerCase();
  const resolvedCategory = CATEGORY_ALIASES[normalized] || normalized;

  const tips = COMPANION_CATEGORY_TIPS[resolvedCategory];
  if (!tips || tips.length === 0) {
    return DEFAULT_COMPANION_DIALOGUE;
  }

  const index = Math.floor(seedIndex) % tips.length;
  return tips[index];
}
