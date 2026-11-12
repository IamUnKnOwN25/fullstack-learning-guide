import { describe, it, expect } from "vitest";
import { QUESTS } from "../data/quests";
import {
  evaluateQuestTasks,
  getQuestTaskDiagnostics,
  stripComments,
  getRegisteredQuestIds,
  getQuestTaskRuleCount,
  calculateEvaluationProgress,
  getMissingTaskIndices,
  validateQuestRulesIntegrity,
} from "../lib/questTaskEvaluator";

const CANONICAL_SOLUTIONS: Record<string, string> = {
  html_1_skeleton: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DevQuest Node</title>
  </head>
  <body>
    <h1>Matrix Awakened</h1>
    <p>The matrix skeleton is restored and online.</p>
  </body>
</html>`,
  html_2_forms: `<form action="/api/login" method="POST">
  <label for="email">Cadet Email</label>
  <input id="email" type="email" required>
  <label for="password">Security Key</label>
  <input id="password" type="password" required minlength="8">
  <button type="submit">Initialize Uplink</button>
</form>`,
  css_1_flexbox: `.matrix-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
}`,
  css_2_grid: `.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}`,
  js_1_dom: `<script>
let power = 0;
const btn = document.querySelector('#boost-btn');
const statusDiv = document.querySelector('#status');
btn.addEventListener('click', () => {
  power += 10;
  statusDiv.textContent = "Power: " + power;
});
</script>`,
  js_2_async: `async function fetchMatrixCoordinates(endpoint) {
  try {
    const res = await fetch(endpoint);
    if (!res.ok) throw new Error("Fetch failed: " + res.status);
    return await res.json();
  } catch (err) {
    throw err;
  }
}`,
  ts_1_interfaces: `export const cadet: MatrixOperator = {
  id: "op-001",
  name: "Trinity",
  level: 12,
  isOnline: true,
};`,
  ts_2_generics: `export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: number;
}
export function wrapResponse<T>(payload: T): ApiResponse<T> {
  return { success: true, data: payload, timestamp: Date.now() };
}`,
  react_1_hooks: `export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>;
}`,
  react_2_server_actions: `"use server";
import { revalidatePath } from "next/cache";
export async function addQuestAction(formData: FormData) {
  const title = formData.get("title") as string;
  revalidatePath("/quests");
  return { success: true };
}`,
  backend_1_express_rest: `app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "healthy" });
});
app.post("/api/tasks", (req, res) => {
  res.status(201).json({ id: "task-1", ...req.body });
});`,
  backend_2_jwt_auth: `export function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "Unauthorized" });
  const decoded = jwt.verify(auth, "secret");
  res.locals.user = decoded;
  next();
}`,
  db_1_postgres: `CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL
);
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL
);`,
  db_2_indexes_prisma: `CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_user_created ON tasks(user_id, created_at DESC);`,
  devops_1_docker: `FROM node:22-alpine AS build
RUN npm run build
FROM node:22-alpine AS runner
COPY --from=build /app/dist ./dist
USER node`,
  devops_2_github_actions: `name: CI
on: [push, pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm test
      - run: npm run build`,
  testing_1_unit_vitest: `import { describe, it, expect } from "vitest";
describe("calculateTotal", () => {
  it("calculates", () => {
    expect(calculateTotal(100, 0.1, 10)).toBe(99);
  });
  it("throws", () => {
    expect(() => calculateTotal(-1, 0.1)).toThrow();
  });
});`,
  testing_2_mocking: `const sendNotification = vi.fn().mockResolvedValue({ delivered: true });
await sendNotification("user@example.com", "Quest completed!");
expect(sendNotification).toHaveBeenCalledTimes(1);
expect(sendNotification).toHaveBeenCalledWith("user@example.com", "Quest completed!");`,
  cs_1_binary_search: `export function binarySearch(arr: number[], target: number): number {
  let left = 0;
  let right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`,
  cs_2_hashmap_frequency: `export function getTopElement<T extends string | number>(items: T[]): T | null {
  const counts = new Map<T, number>();
  let topItem = items[0];
  let maxCount = 0;
  for (const item of items) {
    counts.set(item, (counts.get(item) || 0) + 1);
  }
  return topItem;
}`,
  security_1_xss_sanitize: `export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}`,
  security_2_jwt_verification: `export function verifyStrictToken(token: string, secret: string) {
  return jwt.verify(token, secret, { algorithms: ["HS256"] });
}`,
  capstone_1_architecture: `export interface TeamTask {
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
}
export function validateTask(task: Partial<TeamTask>): boolean {
  return Boolean(task.title && task.status && task.priority);
}`,
  capstone_2_health_probe: `export async function checkSystemReadiness(db, cache) {
  const [dbOk, cacheOk] = await Promise.all([db.isConnected(), cache.ping()]);
  if (dbOk && cacheOk) return { status: "healthy", timestamp: Date.now() };
  return { status: "degraded", timestamp: Date.now() };
}`,
};

describe("questTaskEvaluator", () => {
  it("does not mark all objectives passed on starter code for any quest", () => {
    for (const realmId in QUESTS) {
      for (const quest of QUESTS[realmId]) {
        const results = evaluateQuestTasks(quest.id, quest.tasks, quest.starterCode);
        expect(results.length).toBe(quest.tasks.length);
        const allPassedOnStarter = results.every(Boolean);
        expect(
          allPassedOnStarter,
          `Quest ${quest.id} should not pass all objectives on starterCode`
        ).toBe(false);
      }
    }
  });

  it("marks 100% of objectives passed on canonical solutions across all 24 quests", () => {
    for (const realmId in QUESTS) {
      for (const quest of QUESTS[realmId]) {
        const solution = CANONICAL_SOLUTIONS[quest.id];
        expect(solution, `Missing canonical solution for ${quest.id}`).toBeDefined();

        const diagnostics = getQuestTaskDiagnostics(quest.id, quest.tasks, solution);
        expect(diagnostics.length).toBe(quest.tasks.length);

        for (const diag of diagnostics) {
          expect(
            diag.passed,
            `Quest ${quest.id} task #${diag.index + 1} ("${diag.task}") did not pass on canonical solution`
          ).toBe(true);
        }
      }
    }
  });

  it("handles unknown quest IDs and empty code safely", () => {
    const unknownResults = evaluateQuestTasks("non_existent_realm_quest", ["Task A", "Task B"], "some code");
    expect(unknownResults).toEqual([false, false]);

    const emptyResults = evaluateQuestTasks("html_1_skeleton", ["T1", "T2", "T3", "T4"], "");
    expect(emptyResults).toEqual([false, false, false, false]);
  });

  it("ensures commented-out patterns in all 5 comment syntaxes do not pass objectives", () => {
    // 1. HTML comment
    const htmlWithCommentedMeta = "<!-- <meta charset='utf-8'> -->\n<p>Hello</p>";
    const htmlRes = evaluateQuestTasks("html_1_skeleton", ["meta", "viewport", "h1", "p"], htmlWithCommentedMeta);
    expect(htmlRes[0]).toBe(false); // charset was commented out
    expect(htmlRes[3]).toBe(true);  // p is real

    // 2. JS single-line comment
    const jsSingleComment = "// await fetch(endpoint);\nconst res = null;";
    const jsRes = evaluateQuestTasks("js_2_async", ["try", "fetch", "ok", "json"], jsSingleComment);
    expect(jsRes[1]).toBe(false);

    // 3. JS multi-line comment
    const jsMultiComment = "/* await fetch(endpoint); */\nconst res = null;";
    const jsRes2 = evaluateQuestTasks("js_2_async", ["try", "fetch", "ok", "json"], jsMultiComment);
    expect(jsRes2[1]).toBe(false);

    // 4. SQL comment
    const sqlComment = "-- REFERENCES users(id)\nCREATE TABLE tasks (id INT);";
    const sqlRes = evaluateQuestTasks("db_1_postgres", ["users", "tasks", "cascade"], sqlComment);
    expect(sqlRes[1]).toBe(false);

    // 5. Shell / Docker comment
    const dockerComment = "# USER node\nFROM node:22-alpine";
    const dockerRes = evaluateQuestTasks("devops_1_docker", ["build", "run", "two_from", "copy", "user"], dockerComment);
    expect(dockerRes[4]).toBe(false);
  });

  it("correctly identifies partial completions and produces accurate diagnostics", () => {
    const partialHtml = `<!DOCTYPE html><html><body><h1>Header Only</h1></body></html>`;
    const tasks = ["Include <meta charset='UTF-8'>", "Include viewport", "Add <h1>", "Add <p>"];
    const diags = getQuestTaskDiagnostics("html_1_skeleton", tasks, partialHtml);

    expect(diags).toHaveLength(4);
    expect(diags[0]).toEqual({ index: 0, task: tasks[0], passed: false });
    expect(diags[1]).toEqual({ index: 1, task: tasks[1], passed: false });
    expect(diags[2]).toEqual({ index: 2, task: tasks[2], passed: true });
    expect(diags[3]).toEqual({ index: 3, task: tasks[3], passed: false });
  });

  it("preserves URLs with // during comment stripping while stripping real comments", () => {
    const codeWithUrls = `
      // Setup API endpoint
      const httpsUrl = "https://api.devquest.matrix/v1/quests";
      const httpUrl = "http://localhost:3000/health"; // Local fallback
      /* Multi-line url comment
         https://ignored.com */
      const rawUrl = https://matrix.network/stream;
    `;
    const stripped = stripComments(codeWithUrls);

    // Comments should be gone
    expect(stripped).not.toContain("Setup API endpoint");
    expect(stripped).not.toContain("Local fallback");
    expect(stripped).not.toContain("Multi-line url comment");
    expect(stripped).not.toContain("https://ignored.com");

    // URLs should be intact
    expect(stripped).toContain("https://api.devquest.matrix/v1/quests");
    expect(stripped).toContain("http://localhost:3000/health");
    expect(stripped).toContain("https://matrix.network/stream");
  });

  it("handles null, undefined, and non-string inputs safely without throwing", () => {
    expect(stripComments(null)).toBe("");
    expect(stripComments(undefined)).toBe("");
    expect(stripComments("" as unknown as string)).toBe("");
    // @ts-expect-error Testing invalid runtime input
    expect(stripComments(12345)).toBe("");

    expect(evaluateQuestTasks(null as unknown as string, ["task1"], "code")).toEqual([false]);
    expect(evaluateQuestTasks(undefined as unknown as string, ["task1"], "code")).toEqual([false]);
    expect(evaluateQuestTasks("html_1_skeleton", null as unknown as string[], "code")).toEqual([]);
    expect(evaluateQuestTasks("html_1_skeleton", undefined as unknown as string[], "code")).toEqual([]);
    expect(evaluateQuestTasks("html_1_skeleton", ["task1"], null as unknown as string)).toEqual([false]);
    expect(evaluateQuestTasks("html_1_skeleton", ["task1"], undefined as unknown as string)).toEqual([false]);

    expect(getQuestTaskDiagnostics(null as unknown as string, null as unknown as string[], null as unknown as string)).toEqual([]);
    expect(getQuestTaskDiagnostics("html_1_skeleton", ["t1"], null as unknown as string)).toEqual([
      { index: 0, task: "t1", passed: false },
    ]);
  });

  it("exposes getRegisteredQuestIds returning all supported quest identifiers", () => {
    const questIds = getRegisteredQuestIds();
    expect(Array.isArray(questIds)).toBe(true);
    expect(questIds.length).toBe(24);
    expect(questIds).toContain("html_1_skeleton");
    expect(questIds).toContain("react_1_hooks");
    expect(questIds).toContain("capstone_2_health_probe");

    for (const id of questIds) {
      const res = evaluateQuestTasks(id, ["dummy"], "");
      expect(res).toHaveLength(1);
    }
  });

  it("strips trailing inline SQL comments cleanly without corrupting code or strings", () => {
    const sqlCode = `
      CREATE TABLE users (
        id UUID PRIMARY KEY, -- Primary key identifier
        email TEXT UNIQUE NOT NULL -- User email address
      ); -- End of users table
    `;
    const cleanSql = stripComments(sqlCode);
    expect(cleanSql).not.toContain("Primary key identifier");
    expect(cleanSql).not.toContain("User email address");
    expect(cleanSql).not.toContain("End of users table");
    expect(cleanSql).toContain("id UUID PRIMARY KEY,");
    expect(cleanSql).toContain("email TEXT UNIQUE NOT NULL");

    // Commented-out patterns in trailing inline SQL comments must not pass objectives
    const commentedTask = `
      CREATE TABLE tasks (
        id UUID PRIMARY KEY,
        title TEXT NOT NULL -- REFERENCES users(id) ON DELETE CASCADE
      );
    `;
    const evalResults = evaluateQuestTasks("db_1_postgres", ["users", "tasks", "cascade"], commentedTask);
    expect(evalResults[1]).toBe(false);
    expect(evalResults[2]).toBe(false);

    // String literals with SQL comments must remain intact
    const sqlInString = `const q = "SELECT * FROM users -- not a comment";`;
    expect(stripComments(sqlInString)).toContain('"SELECT * FROM users -- not a comment"');
  });

  it("preserves CSS hex colors, CSS custom properties (--var-name), and #id selectors intact", () => {
    const cssCode = `
      :root {
        --primary-glow: #00f0ff;
        --matrix-green: #00ff66;
        --bg-dark: #121212;
        --alpha-color: #12345678;
        --short-hex: #fff;
      }
      #main-terminal {
        color: var(--matrix-green);
        background: #000;
        border: 1px solid var(--primary-glow);
      }
      #app_root {
        display: flex;
      }
      /* Real CSS comment */
      # USER node (in dockerfile)
      # Real shell comment
    `;
    const stripped = stripComments(cssCode);

    // CSS variables must be preserved
    expect(stripped).toContain("--primary-glow: #00f0ff;");
    expect(stripped).toContain("--matrix-green: #00ff66;");
    expect(stripped).toContain("--bg-dark: #121212;");
    expect(stripped).toContain("--alpha-color: #12345678;");
    expect(stripped).toContain("--short-hex: #fff;");
    expect(stripped).toContain("var(--matrix-green)");
    expect(stripped).toContain("var(--primary-glow)");

    // Hex colors and selectors must be preserved
    expect(stripped).toContain("#main-terminal");
    expect(stripped).toContain("#app_root");
    expect(stripped).toContain("#000");

    // Actual comments must be stripped
    expect(stripped).not.toContain("Real CSS comment");
    expect(stripped).not.toContain("USER node");
    expect(stripped).not.toContain("Real shell comment");

    // HTML attributes like href="#section" must remain intact
    const htmlWithAnchor = `<a href="#uplink-node" id="link-1">Status</a>`;
    const strippedHtml = stripComments(htmlWithAnchor);
    expect(strippedHtml).toContain('href="#uplink-node"');
  });

  it("accepts HTML input attributes (type, id, required) in any arbitrary order for html_2_forms", () => {
    const tasks = [
      "Create <label for='email'> and <input id='email' type='email' required>",
      "Create <label for='password'> and <input id='password' type='password' required minlength='8'>",
      "Add a <button type='submit'>Login</button>",
    ];

    // Permutation 1: type, id, required
    const perm1 = `
      <form action="/login">
        <label for="email">Email</label>
        <input type="email" id="email" required>
        <label for="password">Password</label>
        <input type="password" id="password" required minlength="8">
        <button type="submit">Submit</button>
      </form>
    `;
    expect(evaluateQuestTasks("html_2_forms", tasks, perm1)).toEqual([true, true, true]);

    // Permutation 2: required, id, type
    const perm2 = `
      <form action="/login">
        <label for="email">Email</label>
        <input required id="email" type="email">
        <label for="password">Password</label>
        <input required id="password" type="password" minlength="8">
        <button type="submit">Submit</button>
      </form>
    `;
    expect(evaluateQuestTasks("html_2_forms", tasks, perm2)).toEqual([true, true, true]);

    // Permutation 3: required, type, id
    const perm3 = `
      <form action="/login">
        <label for="email">Email</label>
        <input required type="email" id="email">
        <label for="password">Password</label>
        <input required type="password" id="password" minlength="8">
        <button type="submit">Submit</button>
      </form>
    `;
    expect(evaluateQuestTasks("html_2_forms", tasks, perm3)).toEqual([true, true, true]);

    // Permutation 4: id, required, type
    const perm4 = `
      <form action="/login">
        <label for="email">Email</label>
        <input id="email" required type="email">
        <label for="password">Password</label>
        <input id="password" required type="password" minlength="8">
        <button type="submit">Submit</button>
      </form>
    `;
    expect(evaluateQuestTasks("html_2_forms", tasks, perm4)).toEqual([true, true, true]);

    // Permutation 5: type, required, id
    const perm5 = `
      <form action="/login">
        <label for="email">Email</label>
        <input type="email" required id="email">
        <label for="password">Password</label>
        <input type="password" required id="password" minlength="8">
        <button type="submit">Submit</button>
      </form>
    `;
    expect(evaluateQuestTasks("html_2_forms", tasks, perm5)).toEqual([true, true, true]);
  });

  it("exposes getQuestTaskRuleCount returning rule counts and 0 for unknown/nullish IDs", () => {
    expect(getQuestTaskRuleCount("html_1_skeleton")).toBe(4);
    expect(getQuestTaskRuleCount("html_2_forms")).toBe(3);
    expect(getQuestTaskRuleCount("css_1_flexbox")).toBe(3);
    expect(getQuestTaskRuleCount("devops_1_docker")).toBe(5);

    // All registered quest IDs should return positive rule counts
    for (const questId of getRegisteredQuestIds()) {
      expect(getQuestTaskRuleCount(questId)).toBeGreaterThan(0);
    }

    // Unknown or nullish IDs must safely return 0
    expect(getQuestTaskRuleCount("non_existent_quest_id")).toBe(0);
    expect(getQuestTaskRuleCount(null)).toBe(0);
    expect(getQuestTaskRuleCount(undefined)).toBe(0);
    expect(getQuestTaskRuleCount("")).toBe(0);
    // @ts-expect-error Testing invalid runtime inputs
    expect(getQuestTaskRuleCount(12345)).toBe(0);
  });

  describe("calculateEvaluationProgress", () => {
    it("calculates progress correctly for empty, partial, and complete passed sets", () => {
      // 0 of 4 tasks passed
      const empty = calculateEvaluationProgress([], 4);
      expect(empty).toEqual({
        passedCount: 0,
        remainingCount: 4,
        percentage: 0,
        isComplete: false,
      });

      // 1 of 4 tasks passed (25%)
      const one = calculateEvaluationProgress([0], 4);
      expect(one).toEqual({
        passedCount: 1,
        remainingCount: 3,
        percentage: 25,
        isComplete: false,
      });

      // 2 of 3 tasks passed (67% rounded)
      const twoOfThree = calculateEvaluationProgress([0, 2], 3);
      expect(twoOfThree).toEqual({
        passedCount: 2,
        remainingCount: 1,
        percentage: 67,
        isComplete: false,
      });

      // 4 of 4 tasks passed (100% complete)
      const complete = calculateEvaluationProgress([0, 1, 2, 3], 4);
      expect(complete).toEqual({
        passedCount: 4,
        remainingCount: 0,
        percentage: 100,
        isComplete: true,
      });
    });

    it("deduplicates redundant indices and discards out-of-range indices", () => {
      // Duplicate 0, duplicate 1, out-of-range -5, 99, 4 on totalTasks = 4
      const deduplicated = calculateEvaluationProgress([0, 1, 0, 1, -5, 99, 4], 4);
      expect(deduplicated).toEqual({
        passedCount: 2,
        remainingCount: 2,
        percentage: 50,
        isComplete: false,
      });
    });

    it("handles totalTasks <= 0 and non-finite inputs safely", () => {
      expect(calculateEvaluationProgress([0, 1], 0)).toEqual({
        passedCount: 0,
        remainingCount: 0,
        percentage: 0,
        isComplete: false,
      });

      expect(calculateEvaluationProgress([0, 1], -3)).toEqual({
        passedCount: 0,
        remainingCount: 0,
        percentage: 0,
        isComplete: false,
      });

      expect(calculateEvaluationProgress([0, 1], NaN)).toEqual({
        passedCount: 0,
        remainingCount: 0,
        percentage: 0,
        isComplete: false,
      });

      expect(calculateEvaluationProgress([0, 1], null as unknown as number)).toEqual({
        passedCount: 0,
        remainingCount: 0,
        percentage: 0,
        isComplete: false,
      });

      expect(calculateEvaluationProgress([0, 1], undefined as unknown as number)).toEqual({
        passedCount: 0,
        remainingCount: 0,
        percentage: 0,
        isComplete: false,
      });
    });

    it("handles null, undefined, and non-array passedIndices safely", () => {
      expect(calculateEvaluationProgress(null, 5)).toEqual({
        passedCount: 0,
        remainingCount: 5,
        percentage: 0,
        isComplete: false,
      });

      expect(calculateEvaluationProgress(undefined, 5)).toEqual({
        passedCount: 0,
        remainingCount: 5,
        percentage: 0,
        isComplete: false,
      });

      // @ts-expect-error Testing non-array runtime input
      expect(calculateEvaluationProgress("not-an-array", 5)).toEqual({
        passedCount: 0,
        remainingCount: 5,
        percentage: 0,
        isComplete: false,
      });
    });
  });

  describe("getMissingTaskIndices", () => {
    it("returns all indices when no tasks have passed", () => {
      expect(getMissingTaskIndices([], 4)).toEqual([0, 1, 2, 3]);
    });

    it("returns empty array when all tasks have passed", () => {
      expect(getMissingTaskIndices([0, 1, 2], 3)).toEqual([]);
    });

    it("returns sorted missing indices for partial completions", () => {
      expect(getMissingTaskIndices([2, 0], 4)).toEqual([1, 3]);
      expect(getMissingTaskIndices([3], 5)).toEqual([0, 1, 2, 4]);
    });

    it("filters out duplicates and invalid or out-of-range indices gracefully", () => {
      expect(getMissingTaskIndices([1, 1, -1, 99, 100], 3)).toEqual([0, 2]);
    });

    it("safely handles totalTasks <= 0 or invalid inputs", () => {
      expect(getMissingTaskIndices([0, 1], 0)).toEqual([]);
      expect(getMissingTaskIndices([0, 1], -5)).toEqual([]);
      expect(getMissingTaskIndices([0, 1], NaN)).toEqual([]);
      expect(getMissingTaskIndices(null, 3)).toEqual([0, 1, 2]);
      expect(getMissingTaskIndices(undefined, 2)).toEqual([0, 1]);
      // @ts-expect-error Testing non-array runtime input
      expect(getMissingTaskIndices("invalid", 3)).toEqual([0, 1, 2]);
    });
  });

  describe("validateQuestRulesIntegrity", () => {
    it("verifies that all 24 registered quests have valid non-empty rule sets", () => {
      const integrity = validateQuestRulesIntegrity();
      expect(integrity.valid).toBe(true);
      expect(integrity.questCount).toBe(24);
      expect(integrity.invalidQuestIds).toEqual([]);
    });

    it("detects empty or invalid quest rules when passed custom rules", () => {
      // Empty rules record
      const emptyCheck = validateQuestRulesIntegrity({});
      expect(emptyCheck.valid).toBe(false);
      expect(emptyCheck.questCount).toBe(0);
      expect(emptyCheck.invalidQuestIds).toEqual([]);

      // Quest rule with empty array
      const emptyArrayCheck = validateQuestRulesIntegrity({
        invalid_quest_1: [],
      });
      expect(emptyArrayCheck.valid).toBe(false);
      expect(emptyArrayCheck.questCount).toBe(1);
      expect(emptyArrayCheck.invalidQuestIds).toEqual(["invalid_quest_1"]);

      // Quest rule with non-function item
      const nonFunctionCheck = validateQuestRulesIntegrity({
        // @ts-expect-error Testing invalid runtime rule type
        corrupted_quest: ["not-a-function"],
      });
      expect(nonFunctionCheck.valid).toBe(false);
      expect(nonFunctionCheck.questCount).toBe(1);
      expect(nonFunctionCheck.invalidQuestIds).toEqual(["corrupted_quest"]);

      // Valid custom rule set
      const validCustomCheck = validateQuestRulesIntegrity({
        mock_quest: [(code) => code.length > 0],
      });
      expect(validCustomCheck.valid).toBe(true);
      expect(validCustomCheck.questCount).toBe(1);
      expect(validCustomCheck.invalidQuestIds).toEqual([]);
    });
  });
});
