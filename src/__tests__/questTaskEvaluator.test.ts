import { describe, it, expect } from "vitest";
import { QUESTS } from "../data/quests";
import { evaluateQuestTasks, getQuestTaskDiagnostics } from "../lib/questTaskEvaluator";

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
});
