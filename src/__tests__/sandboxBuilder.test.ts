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

  it("strips use client/server directives and export type aliases", () => {
    const tsCode = `
      "use client";
      export type ThemeMode = "dark" | "light";
      export const defaultTheme: ThemeMode = "dark";
    `;
    const js = transpileToRunnableJs(tsCode);
    expect(js).not.toContain('"use client"');
    expect(js).not.toContain("type ThemeMode");
    expect(js).toContain('const defaultTheme = "dark"');
  });

  it("cleans typed function parameters including optional and rest parameters", () => {
    const tsCode = `
      function calculateDamage(base: number, modifier?: number, ...buffs: number[]): number {
        return base + (modifier || 0);
      }
    `;
    const js = transpileToRunnableJs(tsCode);
    expect(js).toContain("function calculateDamage(base, modifier, ...buffs) {");
    expect(() => new Function(js)).not.toThrow();
  });

  it("generates valid HTML preview documents with dark-mode styles injected", () => {
    // Fragment without head
    const htmlFragmentDoc = buildSandboxSrcDoc("<h1>Hello Matrix</h1>", "html", "html");
    expect(htmlFragmentDoc).toContain("color-scheme: dark");
    expect(htmlFragmentDoc).toContain("<h1>Hello Matrix</h1>");

    // Full HTML document with existing head tag
    const fullHtmlDoc = buildSandboxSrcDoc(
      "<!DOCTYPE html><html><head><title>Test</title></head><body><h1>Matrix</h1></body></html>",
      "html",
      "html"
    );
    expect(fullHtmlDoc).toContain("color-scheme: dark");
    expect(fullHtmlDoc).toContain("<title>Test</title>");
  });

  it("generates specialized interactive simulators for SQL, Dockerfile, and YAML quests", () => {
    const sqlDoc = buildSandboxSrcDoc("CREATE TABLE users (id SERIAL PRIMARY KEY);", "sql", "console");
    expect(sqlDoc).toContain("PostgreSQL 16 Engine Simulator");
    expect(sqlDoc).toContain("CREATE TABLE");

    const dockerDoc = buildSandboxSrcDoc("FROM node:20-alpine\nWORKDIR /app", "dockerfile", "console");
    expect(dockerDoc).toContain("Docker BuildKit Layer Inspector");
    expect(dockerDoc).toContain("FROM node:20-alpine");
    expect(dockerDoc).toContain("CACHED");

    const yamlDoc = buildSandboxSrcDoc("on: [push, pull_request]\nsteps:\n  - run: npm test", "yaml", "console");
    expect(yamlDoc).toContain("GitHub Actions Runner Simulator");
    expect(yamlDoc).toContain("Trigger Events");
  });

  it("injects testing and framework runtime shims into JavaScript/TypeScript console sandbox", () => {
    const jsDoc = buildSandboxSrcDoc("console.log('Testing shims');", "javascript", "console");
    expect(jsDoc).toContain("Registered Express Route");
    expect(jsDoc).toContain("revalidatePath");
    expect(jsDoc).toContain("mockResolvedValue");
    expect(jsDoc).toContain("Live Sandbox Console");
  });

  it("handles empty or whitespace-only code strings across preview types", () => {
    const emptyHtml = buildSandboxSrcDoc("", "html", "html");
    expect(emptyHtml).toContain("<!DOCTYPE html>");
    expect(emptyHtml).toContain("color-scheme: dark");

    const emptySql = buildSandboxSrcDoc("   ", "sql", "console");
    expect(emptySql).toContain("PostgreSQL 16 Engine Simulator");
    expect(emptySql).toContain("WAITING");

    const emptyJs = buildSandboxSrcDoc("", "javascript", "console");
    expect(emptyJs).toContain("Live Sandbox Console");
    expect(emptyJs).toContain("Runtime Active");
  });

  it("transpiles complex generic return types and stripped type assertions", () => {
    const complexTs = `
      export async function checkSystemReadiness(
        db: { isConnected: () => Promise<boolean> }
      ): Promise<{ status: "healthy" | "degraded"; timestamp: number }> {
        const ok = (await db.isConnected()) as boolean;
        return { status: "healthy", timestamp: Date.now() };
      }
    `;
    const js = transpileToRunnableJs(complexTs);
    expect(js).not.toContain("Promise<{");
    expect(js).toContain("async function checkSystemReadiness(db) {");
    expect(js).toContain("const ok = (await db.isConnected());");
  });

  it("generates SQL simulator displaying primary key and foreign key constraint badges", () => {
    const sqlWithConstraints = `
      CREATE TABLE users (id SERIAL PRIMARY KEY, email TEXT NOT NULL);
      CREATE TABLE orders (id SERIAL PRIMARY KEY, user_id INT REFERENCES users(id));
      CREATE INDEX idx_orders_user ON orders(user_id);
    `;
    const doc = buildSandboxSrcDoc(sqlWithConstraints, "sql", "console");
    expect(doc).toContain("Detected Tables");
    expect(doc).toContain("Primary Key Constraint");
    expect(doc).toContain("Foreign Key Reference");
    expect(doc).toContain("B-TREE INDEX");
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
