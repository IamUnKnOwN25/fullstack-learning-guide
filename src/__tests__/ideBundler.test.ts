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
    expect(detectFileLanguage("unknown_file")).toBe("javascript");
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

  it("bundles non-HTML projects (pure SQL or pure TS/JS) into interactive console sandboxes", () => {
    // Pure SQL file without HTML
    const sqlDoc = bundleIdeProject([
      {
        name: "query.sql",
        language: "sql",
        content: "SELECT id, username FROM operatives WHERE level > 5;",
      },
    ]);
    expect(sqlDoc).toContain("SELECT id, username FROM operatives");
    expect(sqlDoc).toContain("PostgreSQL 16 Engine Simulator");

    // Pure TypeScript file without HTML
    const tsDoc = bundleIdeProject([
      {
        name: "algorithm.ts",
        language: "typescript",
        content: "console.log('Fibonacci matrix calculated');",
      },
    ]);
    expect(tsDoc).toContain("Fibonacci matrix calculated");
    expect(tsDoc).toContain("Live Sandbox Console (TYPESCRIPT)");
  });

  it("safely escapes nested closing script tags inside user JavaScript code", () => {
    const doc = bundleIdeProject([
      { name: "index.html", language: "html", content: "<div id='out'></div>" },
      {
        name: "app.js",
        language: "javascript",
        content: "const template = '</script><div>Injected</div>';",
      },
    ]);

    expect(doc).toContain("<\\/script>");
    expect(doc).not.toMatch(/<\/script><div>Injected<\/div>/);
  });

  it("strips TypeScript type annotations and interface definitions for browser execution", () => {
    const doc = bundleIdeProject([
      { name: "index.html", language: "html", content: "<div id='app'></div>" },
      {
        name: "model.ts",
        language: "typescript",
        content: `interface UserProfile {
  id: string;
  rank: number;
}
export const score: number = 999;
console.log('Score:', score);`,
      },
    ]);

    expect(doc).toContain("const score = 999;");
    expect(doc).toContain("console.log('Score:', score);");
    expect(doc).not.toContain("interface UserProfile");
  });

  it("flags static analysis diagnostics across HTML, JS/TS, and SQL files", () => {
    const diags = analyzeWorkspaceDiagnostics([
      { name: "index.html", language: "html", content: '<img src="avatar.png">' },
      { name: "legacy.ts", language: "typescript", content: "var x: any = 10;\neval('console.log(x)');" },
      {
        name: "unsafe.sql",
        language: "sql",
        content: "SELECT * FROM users WHERE name = '${userInput}';",
      },
    ]);

    expect(diags.some((d) => d.file === "index.html" && d.message.includes("alt"))).toBe(true);
    expect(diags.some((d) => d.file === "legacy.ts" && d.message.includes("var"))).toBe(true);
    expect(diags.some((d) => d.file === "legacy.ts" && d.message.includes("any"))).toBe(true);
    expect(diags.some((d) => d.file === "legacy.ts" && d.message.includes("eval()"))).toBe(true);
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

  it("prioritizes newly created or selected HTML files in live preview over default index.html", () => {
    const files = [
      { name: "index.html", language: "html" as const, content: "<h1>Index Home</h1>" },
      { name: "about.html", language: "html" as const, content: "<h1>About Page</h1>" },
      { name: "styles.css", language: "css" as const, content: "body { color: cyan; }" },
    ];

    const aboutDoc = bundleIdeProject(files, "about.html");
    expect(aboutDoc).toContain("<h1>About Page</h1>");
    expect(aboutDoc).not.toContain("<h1>Index Home</h1>");
    expect(aboutDoc).toContain("body { color: cyan; }");

    const indexDoc = bundleIdeProject(files, "index.html");
    expect(indexDoc).toContain("<h1>Index Home</h1>");
    expect(indexDoc).not.toContain("<h1>About Page</h1>");
  });

  it("correctly injects styles and scripts into full HTML documents without duplicate doctype tags", () => {
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Custom Document</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <h1>Full Document Header</h1>
  <script src="main.js"></script>
</body>
</html>`;

    const doc = bundleIdeProject([
      { name: "page.html", language: "html", content: fullHtml },
      { name: "styles.css", language: "css", content: "h1 { font-size: 32px; }" },
      { name: "main.js", language: "javascript", content: "console.log('Script running');" },
    ], "page.html");

    expect(doc).toContain("Full Document Header");
    expect(doc).toContain("h1 { font-size: 32px; }");
    expect(doc).toContain("console.log('Script running');");
    expect(doc).toContain("<!-- Inlined: styles.css -->");
    expect(doc).toContain("<!-- Inlined: main.js -->");
    const doctypeMatches = doc.match(/<!DOCTYPE/gi);
    expect(doctypeMatches?.length).toBe(1);
  });

  it("handles empty files array gracefully in bundleIdeProject and analyzeWorkspaceDiagnostics", () => {
    const emptyDoc = bundleIdeProject([]);
    expect(emptyDoc).toContain("<!DOCTYPE html>");
    expect(emptyDoc).toContain("devquest-ide-preview");

    const diags = analyzeWorkspaceDiagnostics([]);
    expect(diags).toEqual([]);
  });

  it("provides styled HTML preview for standalone CSS files without HTML", () => {
    const cssDoc = bundleIdeProject([
      { name: "theme.css", language: "css", content: ".card { background: red; }" },
    ]);
    expect(cssDoc).toContain("CSS Preview (theme.css)");
    expect(cssDoc).toContain(".card { background: red; }");
    expect(cssDoc).toContain("Active stylesheet applied.");
  });

  it("ensures postMessage communication bridge is injected into bundled preview", () => {
    const doc = bundleIdeProject([
      { name: "index.html", language: "html", content: "<h1>Bridge Test</h1>" },
    ]);
    expect(doc).toContain("window.parent.postMessage");
    expect(doc).toContain("source: 'devquest-ide-preview'");
  });
});
