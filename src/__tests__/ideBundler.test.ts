import { describe, it, expect } from "vitest";
import {
  detectFileLanguage,
  bundleIdeProject,
  analyzeWorkspaceDiagnostics,
  IDE_PROJECT_TEMPLATES,
} from "../lib/ideBundler";

describe("Online Matrix IDE Bundler & Diagnostics Engine", () => {
  it("detects file languages from extensions accurately", () => {
    expect(detectFileLanguage("index.html")).toBe("html");
    expect(detectFileLanguage("styles.css")).toBe("css");
    expect(detectFileLanguage("app.js")).toBe("javascript");
    expect(detectFileLanguage("module.ts")).toBe("typescript");
    expect(detectFileLanguage("schema.sql")).toBe("sql");
    expect(detectFileLanguage("package.json")).toBe("json");
    expect(detectFileLanguage("README.md")).toBe("markdown");
  });

  it("bundles multi-file HTML, CSS, and TypeScript/JavaScript projects into a runnable srcDoc", () => {
    const srcDoc = bundleIdeProject([
      { name: "index.html", language: "html", content: "<h1 id='hero'>Hello IDE</h1>" },
      { name: "styles.css", language: "css", content: "#hero { color: #00ff9d; }" },
      {
        name: "app.ts",
        language: "typescript",
        content: "const count: number = 42;\nconsole.log('Count is', count);",
      },
    ]);

    expect(srcDoc).toContain("<h1 id='hero'>Hello IDE</h1>");
    expect(srcDoc).toContain("#hero { color: #00ff9d; }");
    expect(srcDoc).toContain("console.log('Count is', count);");
    expect(srcDoc).toContain("devquest-ide-preview");
  });

  it("flags static analysis diagnostics across HTML, JS/TS, and SQL files", () => {
    const diags = analyzeWorkspaceDiagnostics([
      { name: "index.html", language: "html", content: '<img src="avatar.png">' },
      { name: "legacy.ts", language: "typescript", content: "var x: any = 10;" },
      {
        name: "unsafe.sql",
        language: "sql",
        content: "SELECT * FROM users WHERE name = '${userInput}';",
      },
    ]);

    expect(diags.some((d) => d.file === "index.html" && d.message.includes("alt"))).toBe(true);
    expect(diags.some((d) => d.file === "legacy.ts" && d.message.includes("var"))).toBe(true);
    expect(diags.some((d) => d.file === "legacy.ts" && d.message.includes("any"))).toBe(true);
    expect(
      diags.some((d) => d.file === "unsafe.sql" && d.message.includes("SQL Injection"))
    ).toBe(true);
  });

  it("provides valid multi-file starter templates", () => {
    expect(IDE_PROJECT_TEMPLATES.length).toBeGreaterThanOrEqual(3);
    for (const tpl of IDE_PROJECT_TEMPLATES) {
      expect(tpl.files.length).toBeGreaterThanOrEqual(1);
      const doc = bundleIdeProject(tpl.files);
      expect(doc.length).toBeGreaterThan(50);
    }
  });
});
