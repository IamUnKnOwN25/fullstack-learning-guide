import { describe, it, expect } from "vitest";
import { transpileToRunnableJs, buildSandboxSrcDoc } from "../lib/sandboxBuilder";
import { QUESTS } from "../data/quests";

describe("Sandbox Builder & TypeScript Transpiler", () => {
  it("strips TypeScript interfaces, generics, and type annotations into valid JavaScript", () => {
    const tsCode = `
      export interface ApiResponse<T> {
        success: boolean;
        data: T;
      }
      export function wrapResponse<T>(payload: T): ApiResponse<T> {
        const result: boolean = true;
        return { success: result, data: payload as any };
      }
    `;
    const js = transpileToRunnableJs(tsCode);
    expect(js).not.toContain("interface ApiResponse");
    expect(js).not.toContain("<T>");
    expect(() => new Function(js)).not.toThrow();
  });

  it("generates valid HTML preview documents with dark-mode styles injected", () => {
    const htmlDoc = buildSandboxSrcDoc("<h1>Hello Matrix</h1>", "html", "html");
    expect(htmlDoc).toContain("color-scheme: dark");
    expect(htmlDoc).toContain("<h1>Hello Matrix</h1>");
  });

  it("generates specialized interactive simulators for SQL, Dockerfile, and YAML quests", () => {
    const sqlDoc = buildSandboxSrcDoc("CREATE TABLE users (id SERIAL PRIMARY KEY);", "sql", "console");
    expect(sqlDoc).toContain("PostgreSQL 16 Engine Simulator");

    const dockerDoc = buildSandboxSrcDoc("FROM node:20-alpine\nWORKDIR /app", "dockerfile", "console");
    expect(dockerDoc).toContain("Docker BuildKit Layer Inspector");

    const yamlDoc = buildSandboxSrcDoc("on: [push, pull_request]\nsteps:\n  - run: npm test", "yaml", "console");
    expect(yamlDoc).toContain("GitHub Actions Runner Simulator");
  });

  it("safely builds sandbox srcDoc for every quest across all 12 realms", () => {
    for (const realmId in QUESTS) {
      for (const quest of QUESTS[realmId]) {
        const doc = buildSandboxSrcDoc(quest.starterCode, quest.language, quest.previewType);
        expect(doc.length).toBeGreaterThan(50);
      }
    }
  });
});
