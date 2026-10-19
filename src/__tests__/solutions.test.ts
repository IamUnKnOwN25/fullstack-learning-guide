import { describe, it, expect } from "vitest";
import { QUESTS } from "../data/quests";
import { BOSSES } from "../data/bosses";

const QUEST_SOLUTIONS: Record<string, string> = {
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
  gap: 1.5rem;
}`,

  css_2_grid: `.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}`,

  js_1_dom: `<button id="boost-btn">Cast Surge</button>
<div id="status">Power: 0</div>

<script>
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

  ts_1_interfaces: `export interface MatrixOperator {
  id: string;
  name: string;
  level: number;
  isOnline: boolean;
}

export const cadet: MatrixOperator = {
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
  return {
    success: true,
    data: payload,
    timestamp: Date.now(),
  };
}`,

  react_1_hooks: `import React, { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount((c) => c + 1)}>
      Count: {count}
    </button>
  );
}`,

  react_2_server_actions: `"use server";
import { revalidatePath } from "next/cache";

export async function addQuestAction(formData: FormData) {
  const title = formData.get("title") as string;
  revalidatePath("/quests");
  return { success: true };
}`,

  backend_1_express_rest: `import express from "express";
const app = express();
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "healthy" });
});

app.post("/api/tasks", (req, res) => {
  res.status(201).json({ id: "task-1", ...req.body });
});`,

  backend_2_jwt_auth: `import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = auth.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    res.locals.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}`,

  db_1_postgres: `CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);`,

  db_2_indexes_prisma: `CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_user_created ON tasks(user_id, created_at DESC);`,

  devops_1_docker: `FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
USER node
EXPOSE 3000
CMD ["node", "dist/server.js"]`,

  devops_2_github_actions: `name: CI Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

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
  it("calculates total with tax correctly", () => {
    const total = 99;
    expect(total).toBe(99);
  });

  it("throws an error for negative prices", () => {
    expect(() => { throw new Error("Invalid parameters"); }).toThrow();
  });
});`,

  testing_2_mocking: `import { vi, expect, it } from "vitest";

const sendNotification = vi.fn().mockResolvedValue({ delivered: true });

it("dispatches notification with recipient email", async () => {
  await sendNotification("user@example.com", "Quest completed!");
  expect(sendNotification).toHaveBeenCalledTimes(1);
  expect(sendNotification).toHaveBeenCalledWith("user@example.com", "Quest completed!");
});`,

  cs_1_binary_search: `export function binarySearch(arr: number[], target: number): number {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    if (arr[mid] === target) {
      return mid;
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return -1;
}`,

  cs_2_hashmap_frequency: `export function getTopElement<T extends string | number>(items: T[]): T | null {
  if (items.length === 0) return null;
  const counts = new Map<T, number>();
  let topItem: T = items[0];
  let maxCount = 0;

  for (const item of items) {
    const count = (counts.get(item) || 0) + 1;
    counts.set(item, count);
    if (count > maxCount) {
      maxCount = count;
      topItem = item;
    }
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

  security_2_jwt_verification: `import jwt from "jsonwebtoken";

export function verifyStrictToken(token: string, secret: string) {
  return jwt.verify(token, secret, {
    algorithms: ["HS256"],
  });
}`,

  capstone_1_architecture: `export interface TeamTask {
  id: string;
  title: string;
  description: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  assignedUserId: string;
  createdAt: string;
  updatedAt: string;
}

export function validateTask(task: Partial<TeamTask>): boolean {
  return Boolean(
    task.title &&
    task.status &&
    task.priority
  );
}`,

  capstone_2_health_probe: `export async function checkSystemReadiness(
  db: { isConnected: () => Promise<boolean> },
  cache: { ping: () => Promise<string> }
): Promise<{ status: "healthy" | "degraded"; timestamp: number }> {
  try {
    const [dbOk, cacheOk] = await Promise.all([
      db.isConnected(),
      cache.ping().then((res) => res === "PONG"),
    ]);

    if (dbOk && cacheOk) {
      return { status: "healthy", timestamp: Date.now() };
    }
    return { status: "degraded", timestamp: Date.now() };
  } catch {
    return { status: "degraded", timestamp: Date.now() };
  }
}`,
};

describe("DevQuest Solutions Verification Matrix", () => {
  it("verifies canonical solutions for all 24 interactive quests", () => {
    let checkedCount = 0;
    for (const realmId in QUESTS) {
      for (const quest of QUESTS[realmId]) {
        const solution = QUEST_SOLUTIONS[quest.id];
        expect(
          solution,
          `Quest ${quest.id} in realm ${realmId} must have a canonical solution defined`
        ).toBeDefined();

        const result = quest.testRunner(solution);
        expect(
          result.passed,
          `Solution for quest ${quest.id} failed: ${result.message}`
        ).toBe(true);
        checkedCount++;
      }
    }

    expect(checkedCount).toBe(24);
  });

  it("verifies hints for all 24 boss phases yield valid solutions", () => {
    let bossPhaseCount = 0;
    for (const realmId in BOSSES) {
      const boss = BOSSES[realmId];
      for (const phase of boss.phases) {
        const result = phase.testCondition(phase.hint);
        expect(
          result.passed,
          `Boss ${boss.id} phase ${phase.phaseNumber} hint failed: ${result.message}`
        ).toBe(true);
        bossPhaseCount++;
      }
    }

    expect(bossPhaseCount).toBe(24);
  });
});
