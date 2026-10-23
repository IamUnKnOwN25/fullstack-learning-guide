import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { QUESTS } from "../data/quests";
import { REALMS } from "../data/realms";

describe("DevQuest Quests Matrix", () => {
  it("has quests registered for every realm in REALMS", () => {
    for (const realm of REALMS) {
      const realmQuests = QUESTS[realm.id];
      expect(
        realmQuests,
        `Realm ${realm.id} (${realm.realmName}) should have quests registered`
      ).toBeDefined();
      expect(
        realmQuests.length,
        `Realm ${realm.id} should have at least 2 quests`
      ).toBeGreaterThanOrEqual(2);
    }
  });

  it("guarantees unique IDs across all quests", () => {
    const allIds = new Set<string>();
    let totalCount = 0;

    for (const realmId in QUESTS) {
      for (const quest of QUESTS[realmId]) {
        totalCount++;
        expect(allIds.has(quest.id), `Quest ID '${quest.id}' must be unique`).toBe(false);
        allIds.add(quest.id);
      }
    }

    expect(totalCount).toBeGreaterThanOrEqual(24);
  });

  it("ensures each quest has valid metadata, tasks, and reward structure", () => {
    for (const realmId in QUESTS) {
      for (const quest of QUESTS[realmId]) {
        expect(quest.title.trim().length, `Quest ${quest.id} title`).toBeGreaterThan(3);
        expect(quest.storyIntro.trim().length, `Quest ${quest.id} storyIntro`).toBeGreaterThan(10);
        expect(quest.conceptSummary.trim().length, `Quest ${quest.id} conceptSummary`).toBeGreaterThan(10);
        expect(quest.starterCode.trim().length, `Quest ${quest.id} starterCode`).toBeGreaterThan(5);
        expect(quest.tasks.length, `Quest ${quest.id} tasks count`).toBeGreaterThanOrEqual(1);
        expect(quest.hints.length, `Quest ${quest.id} hints count`).toBeGreaterThanOrEqual(1);
        expect(quest.xpReward, `Quest ${quest.id} xpReward`).toBeGreaterThanOrEqual(50);
        expect(quest.realmId).toBe(realmId);
      }
    }
  });

  it("handles empty or corrupt input safely in test runners without throwing", () => {
    for (const realmId in QUESTS) {
      for (const quest of QUESTS[realmId]) {
        expect(() => {
          const res = quest.testRunner("");
          expect(res.passed).toBe(false);
          expect(typeof res.message).toBe("string");
        }).not.toThrow();

        expect(() => {
          const res = quest.testRunner("// Random junk input with no syntax match");
          expect(res.passed).toBe(false);
        }).not.toThrow();
      }
    }
  });

  it("ensures starterCode does not pass immediately before user changes it", () => {
    for (const realmId in QUESTS) {
      for (const quest of QUESTS[realmId]) {
        const result = quest.testRunner(quest.starterCode);
        expect(
          result.passed,
          `Quest starterCode for '${quest.id}' should require user input and not pass immediately`
        ).toBe(false);
      }
    }
  });

  it("verifies all 12 realms have interactive concept visualizers configured and valid curriculum fileRefs on disk", () => {
    const realms = [
      "html", "css", "javascript", "typescript", "react", "backend",
      "databases", "devops", "testing", "cs", "security", "capstone"
    ];
    const visualizerSource = fs.readFileSync(
      path.join(process.cwd(), "src/components/RealmConceptVisualizer.tsx"),
      "utf-8"
    );
    for (const r of realms) {
      const realm = REALMS.find((item) => item.id === r);
      expect(realm).toBeDefined();
      expect(
        visualizerSource.includes(`case "${r}":`),
        `RealmConceptVisualizer must implement interactive case "${r}":`
      ).toBe(true);
      const filePath = path.join(process.cwd(), realm!.fileRef);
      expect(
        fs.existsSync(filePath),
        `Curriculum file '${realm!.fileRef}' for realm '${r}' must exist on disk`
      ).toBe(true);
    }
  });

  it("verifies both canonical modules and HMR-safe compatibility shims exist on disk", () => {
    const requiredFiles = [
      "src/components/QuestCodingWorkspace.tsx",
      "src/components/DualPaneWorkspace.tsx",
      "src/components/NavigationHud.tsx",
      "src/components/HUD.tsx",
      "src/components/AchievementsModal.tsx",
      "src/components/InventoryModal.tsx",
      "src/components/WorldCampaignMap.tsx",
      "src/components/QuestMap.tsx",
      "src/lib/gameStore.ts",
      "src/lib/store.ts",
      "src/lib/soundEngine.ts",
      "src/lib/audio.ts",
    ];
    for (const relPath of requiredFiles) {
      expect(
        fs.existsSync(path.join(process.cwd(), relPath)),
        `Required module '${relPath}' must exist on disk to prevent Webpack HMR errors`
      ).toBe(true);
    }
  });

  describe("Realm TestRunners: CSS & JavaScript", () => {
    it("evaluates css_1_flexbox solution and failure states", () => {
      const quest = QUESTS.css.find((q) => q.id === "css_1_flexbox")!;
      expect(quest).toBeDefined();

      const validCode = `.hud-bar { display: flex; justify-content: space-between; align-items: center; }`;
      expect(quest.testRunner(validCode).passed).toBe(true);

      const missingFlex = `.hud-bar { justify-content: space-between; align-items: center; }`;
      const resFlex = quest.testRunner(missingFlex);
      expect(resFlex.passed).toBe(false);
      expect(resFlex.message).toContain("display: flex");

      const missingJustify = `.hud-bar { display: flex; align-items: center; }`;
      const resJustify = quest.testRunner(missingJustify);
      expect(resJustify.passed).toBe(false);
      expect(resJustify.message).toContain("justify-content");

      const missingAlign = `.hud-bar { display: flex; justify-content: space-between; }`;
      const resAlign = quest.testRunner(missingAlign);
      expect(resAlign.passed).toBe(false);
      expect(resAlign.message).toContain("align-items");
    });

    it("evaluates css_2_grid solution and failure states", () => {
      const quest = QUESTS.css.find((q) => q.id === "css_2_grid")!;
      expect(quest).toBeDefined();

      const validCode = `.grid-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }`;
      expect(quest.testRunner(validCode).passed).toBe(true);

      const missingGrid = `.grid-container { grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }`;
      expect(quest.testRunner(missingGrid).passed).toBe(false);

      const missingRepeat = `.grid-container { display: grid; gap: 1rem; }`;
      expect(quest.testRunner(missingRepeat).passed).toBe(false);

      const missingGap = `.grid-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); }`;
      expect(quest.testRunner(missingGap).passed).toBe(false);
    });

    it("evaluates js_1_dom solution and failure states", () => {
      const quest = QUESTS.javascript.find((q) => q.id === "js_1_dom")!;
      expect(quest).toBeDefined();

      const validCode = `btn.addEventListener('click', () => { power += 10; statusDiv.textContent = 'Power: ' + power; });`;
      expect(quest.testRunner(validCode).passed).toBe(true);

      const missingListener = `function onClick() { power += 10; statusDiv.textContent = 'Power: ' + power; }`;
      expect(quest.testRunner(missingListener).passed).toBe(false);

      const missingIncrement = `btn.addEventListener('click', () => { statusDiv.textContent = 'Power: ' + power; });`;
      expect(quest.testRunner(missingIncrement).passed).toBe(false);

      const missingText = `btn.addEventListener('click', () => { power += 10; });`;
      expect(quest.testRunner(missingText).passed).toBe(false);
    });

    it("evaluates js_2_async solution and failure states", () => {
      const quest = QUESTS.javascript.find((q) => q.id === "js_2_async")!;
      expect(quest).toBeDefined();

      const validCode = `async function fetchMatrixCoordinates(endpoint) {
        try {
          const res = await fetch(endpoint);
          if (!res.ok) throw new Error("Fetch failed: " + res.status);
          return await res.json();
        } catch (err) {
          console.error(err);
        }
      }`;
      expect(quest.testRunner(validCode).passed).toBe(true);

      const missingTry = `async function fetchMatrixCoordinates(endpoint) {
        const res = await fetch(endpoint);
        if (!res.ok) throw new Error();
        return await res.json();
      }`;
      expect(quest.testRunner(missingTry).passed).toBe(false);

      const missingAwait = `async function fetchMatrixCoordinates(endpoint) {
        try {
          const res = fetch(endpoint);
          if (!res.ok) throw new Error();
          return await res.json();
        } catch (e) {}
      }`;
      expect(quest.testRunner(missingAwait).passed).toBe(false);
    });
  });

  describe("Realm TestRunners: TypeScript & React", () => {
    it("evaluates ts_1_interfaces solution and failure states", () => {
      const quest = QUESTS.typescript.find((q) => q.id === "ts_1_interfaces")!;
      expect(quest).toBeDefined();

      const validCode = `const cadet: MatrixOperator = {
        id: "cadet-007",
        name: "Cipher Cadet",
        level: 1,
        isOnline: true
      };`;
      expect(quest.testRunner(validCode).passed).toBe(true);

      const missingIsOnline = `const cadet: MatrixOperator = {
        id: "cadet-007",
        name: "Cipher Cadet",
        level: 1
      };`;
      expect(quest.testRunner(missingIsOnline).passed).toBe(false);

      const missingCadetDecl = `const op = { id: "1", name: "User", level: 1, isOnline: true };`;
      expect(quest.testRunner(missingCadetDecl).passed).toBe(false);
    });

    it("evaluates ts_2_generics solution and failure states", () => {
      const quest = QUESTS.typescript.find((q) => q.id === "ts_2_generics")!;
      expect(quest).toBeDefined();

      const validCode = `export interface ApiResponse<T> {
        success: boolean;
        data: T;
        timestamp: number;
      }
      export function wrapResponse<T>(payload: T): ApiResponse<T> {
        return { success: true, data: payload, timestamp: Date.now() };
      }`;
      expect(quest.testRunner(validCode).passed).toBe(true);

      const missingInterface = `export function wrapResponse<T>(payload: T) {
        return { success: true, data: payload };
      }`;
      expect(quest.testRunner(missingInterface).passed).toBe(false);

      const missingGenericFn = `export interface ApiResponse<T> {
        data: T;
      }
      export function wrapData(payload: any) {}`;
      expect(quest.testRunner(missingGenericFn).passed).toBe(false);
    });

    it("evaluates react_1_hooks solution and failure states", () => {
      const quest = QUESTS.react.find((q) => q.id === "react_1_hooks")!;
      expect(quest).toBeDefined();

      const validCode = `import React, { useState } from "react";
      export function Counter() {
        const [count, setCount] = useState(0);
        return <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>;
      }`;
      expect(quest.testRunner(validCode).passed).toBe(true);

      const missingState = `export function Counter() {
        return <button onClick={() => setCount(1)}>Click</button>;
      }`;
      expect(quest.testRunner(missingState).passed).toBe(false);

      const missingButton = `export function Counter() {
        const [count, setCount] = useState(0);
        return <div>Count: {count}</div>;
      }`;
      expect(quest.testRunner(missingButton).passed).toBe(false);
    });

    it("evaluates react_2_server_actions solution and failure states", () => {
      const quest = QUESTS.react.find((q) => q.id === "react_2_server_actions")!;
      expect(quest).toBeDefined();

      const validCode = `"use server";
      import { revalidatePath } from "next/cache";
      export async function addQuestAction(formData: FormData) {
        const title = formData.get("title") as string;
        revalidatePath("/quests");
        return { success: true };
      }`;
      expect(quest.testRunner(validCode).passed).toBe(true);

      const missingDirective = `import { revalidatePath } from "next/cache";
      export async function addQuestAction(formData: FormData) {
        const title = formData.get("title");
        revalidatePath("/quests");
      }`;
      expect(quest.testRunner(missingDirective).passed).toBe(false);

      const missingFormData = `"use server";
      import { revalidatePath } from "next/cache";
      export async function addQuestAction(formData: FormData) {
        revalidatePath("/quests");
      }`;
      expect(quest.testRunner(missingFormData).passed).toBe(false);
    });
  });

  describe("Realm TestRunners: Backend & Databases", () => {
    it("evaluates backend_1_express_rest solution and failure states", () => {
      const quest = QUESTS.backend.find((q) => q.id === "backend_1_express_rest")!;
      expect(quest).toBeDefined();

      const validCode = `app.get('/api/health', (req, res) => {
        res.status(200).json({ status: "healthy" });
      });
      app.post('/api/tasks', (req, res) => {
        res.status(201).json({ id: "task-1", ...req.body });
      });`;
      expect(quest.testRunner(validCode).passed).toBe(true);

      const missingGet = `app.post('/api/tasks', (req, res) => {
        res.status(201).json({ id: "task-1" });
      });`;
      expect(quest.testRunner(missingGet).passed).toBe(false);

      const missingPost = `app.get('/api/health', (req, res) => {
        res.status(200).json({ status: "healthy" });
      });`;
      expect(quest.testRunner(missingPost).passed).toBe(false);

      const wrongGetStatus = `app.get('/api/health', (req, res) => {
        res.json({ status: "healthy" });
      });
      app.post('/api/tasks', (req, res) => {
        res.status(201).json({ id: "1" });
      });`;
      expect(quest.testRunner(wrongGetStatus).passed).toBe(false);
    });

    it("evaluates backend_2_jwt_auth solution and failure states", () => {
      const quest = QUESTS.backend.find((q) => q.id === "backend_2_jwt_auth")!;
      expect(quest).toBeDefined();

      const validCode = `const authHeader = req.headers.authorization;
      if (!authHeader) return res.status(401).json({ error: "Unauthorized" });
      try {
        const decoded = jwt.verify(token, "secret");
        res.locals.user = decoded;
        next();
      } catch (err) {
        return res.status(401).json({ error: "Invalid token" });
      }`;
      expect(quest.testRunner(validCode).passed).toBe(true);

      const missingAuthHeader = `try {
        const decoded = jwt.verify(token, "secret");
        res.locals.user = decoded;
        next();
      } catch (e) {
        res.status(401).json({});
      }`;
      expect(quest.testRunner(missingAuthHeader).passed).toBe(false);

      const missingVerify = `const auth = req.headers.authorization;
      res.locals.user = { id: 1 };
      res.status(401);`;
      expect(quest.testRunner(missingVerify).passed).toBe(false);

      const missingLocals = `const auth = req.headers.authorization;
      jwt.verify(token, "secret");
      res.status(401);`;
      expect(quest.testRunner(missingLocals).passed).toBe(false);

      const missing401 = `const auth = req.headers.authorization;
      const decoded = jwt.verify(token, "secret");
      res.locals.user = decoded;`;
      expect(quest.testRunner(missing401).passed).toBe(false);
    });

    it("evaluates db_1_postgres solution and failure states", () => {
      const quest = QUESTS.databases.find((q) => q.id === "db_1_postgres")!;
      expect(quest).toBeDefined();

      const validSql = `CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL
      );
      CREATE TABLE tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL
      );`;
      expect(quest.testRunner(validSql).passed).toBe(true);

      const missingUsersTable = `CREATE TABLE tasks (
        id UUID PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE
      );`;
      expect(quest.testRunner(missingUsersTable).passed).toBe(false);

      const missingTasksTable = `CREATE TABLE users (
        id UUID PRIMARY KEY,
        email TEXT UNIQUE NOT NULL
      );`;
      expect(quest.testRunner(missingTasksTable).passed).toBe(false);

      const missingCascade = `CREATE TABLE users (id UUID);
      CREATE TABLE tasks (
        id UUID PRIMARY KEY,
        user_id UUID REFERENCES users(id)
      );`;
      expect(quest.testRunner(missingCascade).passed).toBe(false);
    });

    it("evaluates db_2_indexes_prisma solution and failure states", () => {
      const quest = QUESTS.databases.find((q) => q.id === "db_2_indexes_prisma")!;
      expect(quest).toBeDefined();

      const validSql = `CREATE INDEX idx_tasks_user_id ON tasks(user_id);
      CREATE INDEX idx_tasks_user_created ON tasks(user_id, created_at DESC);`;
      expect(quest.testRunner(validSql).passed).toBe(true);

      const missingSingleIndex = `CREATE INDEX idx_tasks_user_created ON tasks(user_id, created_at DESC);`;
      expect(quest.testRunner(missingSingleIndex).passed).toBe(false);

      const missingCompositeIndex = `CREATE INDEX idx_tasks_user_id ON tasks(user_id);`;
      expect(quest.testRunner(missingCompositeIndex).passed).toBe(false);
    });
  });

  describe("Realm TestRunners: DevOps, Testing, CS, Security & Capstone", () => {
    it("evaluates devops_1_docker and devops_2_github_actions testRunners", () => {
      const dockerQuest = QUESTS.devops.find((q) => q.id === "devops_1_docker")!;
      expect(dockerQuest).toBeDefined();

      const validDocker = `FROM node:22-alpine AS build
      WORKDIR /app
      RUN npm run build

      FROM node:22-alpine AS runner
      COPY --from=build /app/dist ./dist
      USER node
      CMD ["node", "dist/server.js"]`;
      expect(dockerQuest.testRunner(validDocker).passed).toBe(true);

      const missingUserNode = `FROM node:22-alpine AS build
      COPY --from=build /app/dist ./dist`;
      expect(dockerQuest.testRunner(missingUserNode).passed).toBe(false);

      const ciQuest = QUESTS.devops.find((q) => q.id === "devops_2_github_actions")!;
      expect(ciQuest).toBeDefined();

      const validCi = `name: CI
      on: [push, pull_request]
      jobs:
        build:
          runs-on: ubuntu-latest
          steps:
            - uses: actions/checkout@v4
            - uses: actions/setup-node@v4
            - run: npm test`;
      expect(ciQuest.testRunner(validCi).passed).toBe(true);

      const missingCiTrigger = `jobs:
        build:
          runs-on: ubuntu-latest
          steps:
            - uses: actions/checkout@v4
            - uses: actions/setup-node@v4
            - run: npm test`;
      expect(ciQuest.testRunner(missingCiTrigger).passed).toBe(false);
    });

    it("evaluates testing_1_unit_vitest and testing_2_mocking testRunners", () => {
      const unitQuest = QUESTS.testing.find((q) => q.id === "testing_1_unit_vitest")!;
      expect(unitQuest).toBeDefined();

      const validUnit = `describe("calculateTotal", () => {
        it("calculates price correctly", () => {
          expect(calculateTotal(100, 0.1, 10)).toBe(99);
        });
        it("throws error for negative values", () => {
          expect(() => calculateTotal(-1, 0.1)).toThrow();
        });
      });`;
      expect(unitQuest.testRunner(validUnit).passed).toBe(true);

      const missingToThrow = `describe("calculateTotal", () => {
        it("calculates price correctly", () => {
          expect(calculateTotal(100, 0.1, 10)).toBe(99);
        });
      });`;
      expect(unitQuest.testRunner(missingToThrow).passed).toBe(false);

      const mockQuest = QUESTS.testing.find((q) => q.id === "testing_2_mocking")!;
      expect(mockQuest).toBeDefined();

      const validMock = `const spy = vi.fn().mockResolvedValue({ delivered: true });
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith("cadet@matrix.net");`;
      expect(mockQuest.testRunner(validMock).passed).toBe(true);

      const missingWith = `const spy = vi.fn();
      expect(spy).toHaveBeenCalledTimes(1);`;
      expect(mockQuest.testRunner(missingWith).passed).toBe(false);
    });

    it("evaluates cs_1_binary_search and cs_2_hashmap_frequency testRunners", () => {
      const bsQuest = QUESTS.cs.find((q) => q.id === "cs_1_binary_search")!;
      expect(bsQuest).toBeDefined();

      const validBs = `while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (arr[mid] === target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
      }
      return -1;`;
      expect(bsQuest.testRunner(validBs).passed).toBe(true);

      const missingMidBs = `while (left <= right) {
        left = mid + 1;
        right = mid - 1;
      }
      return -1;`;
      expect(bsQuest.testRunner(missingMidBs).passed).toBe(false);

      const hashQuest = QUESTS.cs.find((q) => q.id === "cs_2_hashmap_frequency")!;
      expect(hashQuest).toBeDefined();

      const validHash = `const counts = new Map<T, number>();
      for (const item of items) {
        counts.set(item, (counts.get(item) || 0) + 1);
      }`;
      expect(hashQuest.testRunner(validHash).passed).toBe(true);

      const missingMapHash = `const counts = {};
      for (const item of items) {}`;
      expect(hashQuest.testRunner(missingMapHash).passed).toBe(false);
    });

    it("evaluates security_1_xss_sanitize and security_2_jwt_verification testRunners", () => {
      const xssQuest = QUESTS.security.find((q) => q.id === "security_1_xss_sanitize")!;
      expect(xssQuest).toBeDefined();

      const validXss = `return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");`;
      expect(xssQuest.testRunner(validXss).passed).toBe(true);

      const missingAmpXss = `return unsafe.replace(/</g, "&lt;").replace(/>/g, "&gt;");`;
      expect(xssQuest.testRunner(missingAmpXss).passed).toBe(false);

      const jwtQuest = QUESTS.security.find((q) => q.id === "security_2_jwt_verification")!;
      expect(jwtQuest).toBeDefined();

      const validJwt = `return jwt.verify(token, secret, { algorithms: ["HS256"] });`;
      expect(jwtQuest.testRunner(validJwt).passed).toBe(true);

      const missingAlgoJwt = `return jwt.verify(token, secret);`;
      expect(jwtQuest.testRunner(missingAlgoJwt).passed).toBe(false);
    });

    it("evaluates capstone_1_architecture and capstone_2_health_probe testRunners", () => {
      const archQuest = QUESTS.capstone.find((q) => q.id === "capstone_1_architecture")!;
      expect(archQuest).toBeDefined();

      const validArch = `export interface TeamTask {
        status: "TODO" | "IN_PROGRESS" | "DONE";
        priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
      }
      export function validateTask(t: Partial<TeamTask>) { return true; }`;
      expect(archQuest.testRunner(validArch).passed).toBe(true);

      const missingPriorityArch = `export interface TeamTask {
        status: "TODO" | "IN_PROGRESS" | "DONE";
      }
      export function validateTask(t: Partial<TeamTask>) { return true; }`;
      expect(archQuest.testRunner(missingPriorityArch).passed).toBe(false);

      const healthQuest = QUESTS.capstone.find((q) => q.id === "capstone_2_health_probe")!;
      expect(healthQuest).toBeDefined();

      const validHealth = `const [dbOk, cacheOk] = await Promise.all([
        db.isConnected(),
        cache.ping()
      ]);
      return { status: "healthy", timestamp: Date.now() };`;
      expect(healthQuest.testRunner(validHealth).passed).toBe(true);

      const missingPromiseAllHealth = `const dbOk = await db.isConnected();
      const cacheOk = await cache.ping();
      return { status: "healthy" };`;
      expect(healthQuest.testRunner(missingPromiseAllHealth).passed).toBe(false);
    });
  });
});
