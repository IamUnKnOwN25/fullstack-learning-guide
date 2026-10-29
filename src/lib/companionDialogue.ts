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
