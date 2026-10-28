import { buildSandboxSrcDoc } from "./sandboxBuilder";

export interface IdeFile {
  name: string;
  language: "html" | "css" | "javascript" | "typescript" | "sql" | "json" | "markdown";
  content: string;
}

export interface IdeProjectTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  files: IdeFile[];
}

export interface IdeDiagnostic {
  file: string;
  line: number;
  severity: "warning" | "info" | "error";
  message: string;
}

export function detectFileLanguage(
  filename: string
): "html" | "css" | "javascript" | "typescript" | "sql" | "json" | "markdown" {
  const lower = filename.trim().toLowerCase();
  if (lower.endsWith(".html") || lower.endsWith(".htm")) return "html";
  if (lower.endsWith(".css")) return "css";
  if (lower.endsWith(".ts") || lower.endsWith(".tsx")) return "typescript";
  if (lower.endsWith(".js") || lower.endsWith(".jsx") || lower.endsWith(".mjs")) return "javascript";
  if (lower.endsWith(".sql")) return "sql";
  if (lower.endsWith(".json")) return "json";
  if (lower.endsWith(".md") || lower.endsWith(".markdown")) return "markdown";
  return "javascript";
}

/**
 * Bundles multiple IDE files (HTML, CSS, JS/TS, SQL) into a single executable iframe srcDoc
 * that forwards console logs and runtime errors back to the parent IDE window via postMessage.
 */
/**
 * Strips interface declarations (including indented, multi-line, and nested bodies) cleanly.
 */
function stripInterfaceDeclarations(code: string): string {
  const interfaceRegex = /\b(?:export\s+)?interface\s+[A-Za-z0-9_$]+[^{]*\{/g;
  let match: RegExpExecArray | null;
  let result = code;

  while ((match = interfaceRegex.exec(result)) !== null) {
    let startIndex = match.index;
    while (startIndex > 0 && (result[startIndex - 1] === " " || result[startIndex - 1] === "\t")) {
      startIndex--;
    }
    const openBrace = result.indexOf("{", match.index);
    if (openBrace === -1) continue;

    let depth = 1;
    let endIndex = -1;
    let inString: string | null = null;
    let inComment = false;
    let inBlockComment = false;

    for (let i = openBrace + 1; i < result.length; i++) {
      const ch = result[i];
      const prev = result[i - 1];

      if (inString) {
        if (ch === inString && prev !== "\\") {
          inString = null;
        }
        continue;
      }
      if (inComment) {
        if (ch === "\n") {
          inComment = false;
        }
        continue;
      }
      if (inBlockComment) {
        if (prev === "*" && ch === "/") {
          inBlockComment = false;
        }
        continue;
      }

      if (ch === '"' || ch === "'" || ch === "`") {
        inString = ch;
      } else if (ch === "/" && result[i + 1] === "/") {
        inComment = true;
        i++;
      } else if (ch === "/" && result[i + 1] === "*") {
        inBlockComment = true;
        i++;
      } else if (ch === "{") {
        depth++;
      } else if (ch === "}") {
        depth--;
        if (depth === 0) {
          endIndex = i + 1;
          break;
        }
      }
    }

    if (endIndex !== -1) {
      while (
        endIndex < result.length &&
        (result[endIndex] === " " || result[endIndex] === "\t" || result[endIndex] === ";")
      ) {
        endIndex++;
      }
      if (endIndex < result.length && result[endIndex] === "\r") endIndex++;
      if (endIndex < result.length && result[endIndex] === "\n") endIndex++;

      result = result.slice(0, startIndex) + result.slice(endIndex);
      interfaceRegex.lastIndex = startIndex;
    }
  }

  return result;
}

/**
 * Strips TypeScript annotations minimally so browser JS engine can execute TS files in multi-file mode.
 * Supports custom return type identifiers (e.g., ': CustomResult', ': UserData[]'),
 * indented or multi-line interface declarations, generics, and variable types.
 */
export function stripTypeScriptForBrowser(raw: string): string {
  let code = raw;

  // 1. Remove import statements
  code = code.replace(/^\s*import\s+[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, "");
  code = code.replace(/^\s*import\s+['"][^'"]+['"];?\s*$/gm, "");

  // 2. Remove export modifiers
  code = code.replace(/^\s*export\s+default\s+/gm, "");
  code = code.replace(/^\s*export\s+(?=(const|let|var|function|class|async)\b)/gm, "");

  // 3. Remove interface declarations (supports indented, multi-line, nested braces)
  code = stripInterfaceDeclarations(code);

  // 4. Remove type alias declarations
  code = code.replace(/^\s*(?:export\s+)?type\s+[A-Za-z0-9_$]+(?:\s*<[^>]+>)?\s*=[\s\S]*?;/gm, "");

  // 5. Remove return type annotations (supports custom identifiers, arrays, generics, unions)
  // e.g., '): CustomResult {', '): UserData[] {', '): Promise<CustomResult> =>'
  const typePart =
    "(?:(?:[A-Za-z0-9_$]+(?:\\s*<(?:[^<>]|<[^<>]*>)*>)?(?:\\s*\\[\\])*)|(?:\\{[^{}]*\\}))";
  const fullType = typePart + "(?:\\s*[|&]\\s*" + typePart + ")*";
  const returnTypeRegex = new RegExp("(\\))\\s*:\\s*" + fullType + "\\s*(?=\\{|=>)", "g");
  code = code.replace(returnTypeRegex, "$1 ");

  // 6. Remove primitive/built-in type annotations in parameters, variables, etc.
  code = code.replace(/:\s*(string|number|boolean|any|unknown|void|never)(\[\])?(?=[,)=;\s])/g, "");

  // 7. Remove variable type annotations for custom types (e.g. const cadet: MatrixOperator = ...)
  code = code.replace(/\b(const|let|var)\s+(\w+)\s*:\s*[^=]+=/g, "$1 $2 =");

  // 8. Remove `as Type` assertions
  code = code.replace(/\s+as\s+[A-Za-z0-9_<>\[\]|&]+/g, "");

  return code;
}

export function bundleIdeProject(files: IdeFile[], activeFileName?: string): string {
  const activeFile = files.find((f) => f.name === activeFileName) || files[0];
  const allHtmlFiles = files.filter((f) => f.language === "html");
  const cssFiles = files.filter((f) => f.language === "css");
  const jsTsFiles = files.filter(
    (f) => f.language === "javascript" || f.language === "typescript"
  );

  // Determine target HTML file:
  // 1. If an active file is provided and is an HTML file, prioritize rendering it!
  // 2. If activeFileName matches an HTML file by name, use it
  // 3. If there is an 'index.html', use it
  // 4. Fallback to first HTML file in workspace
  const htmlFile =
    (activeFile && activeFile.language === "html")
      ? activeFile
      : allHtmlFiles.find((f) => f.name.toLowerCase() === activeFileName?.toLowerCase()) ||
        allHtmlFiles.find((f) => f.name.toLowerCase() === "index.html") ||
        allHtmlFiles[0];

  // If the active file is SQL, CSS, JSON, or Markdown and there is no HTML file, use sandboxBuilder or preview
  if (!htmlFile && activeFile) {
    if (activeFile.language === "sql") {
      return buildSandboxSrcDoc(activeFile.content, "sql", "console");
    }
    if (activeFile.language === "css") {
      return `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>:root{color-scheme:dark;}body{background:#0a0e17;color:#f8fafc;font-family:ui-monospace,monospace;padding:20px;}${activeFile.content}</style></head><body><div id="devquest-ide-preview"><h2>CSS Preview (${activeFile.name})</h2><p>Active stylesheet applied.</p></div></body></html>`;
    }
    return buildSandboxSrcDoc(
      activeFile.content,
      activeFile.language === "typescript" ? "typescript" : "javascript",
      "console"
    );
  }

  const rawHtml =
    htmlFile?.content ||
    `<div id="app" style="padding:16px;font-family:monospace;color:#00ff9d;">Running scripts...</div>`;

  const combinedCss = cssFiles.map((f) => `/* ${f.name} */\n${f.content}`).join("\n\n");













  const combinedJs = jsTsFiles
    .map((f) => {
      const runnable =
        f.language === "typescript" ? stripTypeScriptForBrowser(f.content) : f.content;
      return `// --- ${f.name} ---\n${runnable}`;
    })
    .join("\n\n");

  // Escape closing script tags inside user JS
  const safeJs = combinedJs.replace(/<\/script>/gi, "<\\/script>");

  const injectedStyle = `<style data-devquest-theme="true">
    body {
      background: #0b0f19;
      color: #e2e8f0;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      margin: 0;
      padding: 16px;
    }
    ${combinedCss}
  </style>`;

  const injectedScript = `<script data-devquest-engine="true">
    (function() {
      const sendToIde = (level, args) => {
        try {
          const text = args.map(a => {
            if (a instanceof Error) return a.stack || a.message;
            if (typeof a === 'object' && a !== null) {
              try { return JSON.stringify(a, null, 2); } catch { return String(a); }
            }
            return String(a);
          }).join(' ');
          window.parent.postMessage({ source: 'devquest-ide-preview', level, text }, '*');
        } catch (err) {}
      };
    

      const origLog = console.log;
      const origWarn = console.warn;
      const origError = console.error;

      console.log = (...args) => { origLog(...args); sendToIde('log', args); };
      console.warn = (...args) => { origWarn(...args); sendToIde('warn', args); };
      console.error = (...args) => { origError(...args); sendToIde('error', args); };

      window.addEventListener('error', (event) => {
        sendToIde('error', [event.message + (event.lineno ? ' (line ' + event.lineno + ')' : '')]);
      });

      // Intercept local relative links (e.g. href="page2.html" or href="./about.html") to navigate in Matrix IDE
      document.addEventListener('click', function(e) {
        const anchor = e.target && e.target.closest ? e.target.closest('a') : null;
        if (anchor) {
          const href = anchor.getAttribute('href');
          if (href && !href.startsWith('http://') && !href.startsWith('https://') && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('javascript:')) {
            e.preventDefault();
            const targetName = href.replace(/^(\\.\\/|\\/)/, '');
            window.parent.postMessage({
              source: 'devquest-ide-preview',
              type: 'navigate',
              target: targetName
            }, '*');
          }
        }
      });

      try {
        ${safeJs}
      } catch (err) {
        sendToIde('error', [err instanceof Error ? err.message : String(err)]);
      }
    })();
  </script>`;

  const isFullDocument = /<!DOCTYPE|<html|<head|<body/i.test(rawHtml);

  if (isFullDocument) {
    let processedHtml = rawHtml;

    // Prevent 404 network requests for workspace CSS files linked via <link rel="stylesheet">
    cssFiles.forEach((cf) => {
      const escaped = cf.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(
        `<link\\s+[^>]*href=["'](?:\\.\\/)?${escaped}["'][^>]*>`,
        "gi"
      );
      processedHtml = processedHtml.replace(re, `<!-- Inlined: ${cf.name} -->`);
    });

    // Prevent 404 network requests for workspace JS/TS files linked via <script src="...">
    jsTsFiles.forEach((jf) => {
      const escaped = jf.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(
        `<script\\s+[^>]*src=["'](?:\\.\\/)?${escaped}["'][^>]*>\\s*<\\/script>`,
        "gi"
      );
      processedHtml = processedHtml.replace(re, `<!-- Inlined: ${jf.name} -->`);
    });

    // Inject styles
    if (/<\/head>/i.test(processedHtml)) {
      processedHtml = processedHtml.replace(/<\/head>/i, `${injectedStyle}\n</head>`);
    } else if (/<body/i.test(processedHtml)) {
      processedHtml = processedHtml.replace(/<body/i, `${injectedStyle}\n<body`);
    } else {
      processedHtml = `${injectedStyle}\n${processedHtml}`;
    }

    // Inject scripts
    if (/<\/body>/i.test(processedHtml)) {
      processedHtml = processedHtml.replace(/<\/body>/i, `${injectedScript}\n</body>`);
    } else if (/<\/html>/i.test(processedHtml)) {
      processedHtml = processedHtml.replace(/<\/html>/i, `${injectedScript}\n</html>`);
    } else {
      processedHtml = `${processedHtml}\n${injectedScript}`;
    }

    return processedHtml;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  ${injectedStyle}
</head>
<body>
  ${rawHtml}
  ${injectedScript}
</body>
</html>`;
}

/**
 * Runs static diagnostics on workspace files to populate the VS Code "Problems" panel.
 */
export function analyzeWorkspaceDiagnostics(files: IdeFile[]): IdeDiagnostic[] {
  const diagnostics: IdeDiagnostic[] = [];

  for (const file of files) {
    const lines = file.content.split("\n");
    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      if (file.language === "javascript" || file.language === "typescript") {
        if (/\bvar\s+\w+/.test(line)) {
          diagnostics.push({
            file: file.name,
            line: lineNum,
            severity: "warning",
            message: "Prefer 'const' or 'let' over legacy 'var' declarations to avoid hoisting bugs.",
          });
        }
        if (file.language === "typescript" && /:\s*any\b/.test(line)) {
          diagnostics.push({
            file: file.name,
            line: lineNum,
            severity: "warning",
            message: "Avoid explicit 'any'. Use 'unknown', generics, or a discriminated union.",
          });
        }
        if (/eval\s*\(/.test(line)) {
          diagnostics.push({
            file: file.name,
            line: lineNum,
            severity: "error",
            message: "Security risk: 'eval()' executes arbitrary code strings.",
          });
        }
      }

      if (file.language === "html") {
        if (/<img\b(?![^>]*\balt=)/i.test(line)) {
          diagnostics.push({
            file: file.name,
            line: lineNum,
            severity: "warning",
            message: "Accessibility (A11y): <img> elements should include a descriptive 'alt' attribute.",
          });
        }
      }

      if (file.language === "sql") {
        if (/\+\s*req\.|\$\{/.test(line)) {
          diagnostics.push({
            file: file.name,
            line: lineNum,
            severity: "error",
            message: "SQL Injection risk: Use parameterized placeholders ($1, $2) instead of string interpolation.",
          });
        }
      }
    });
  }

  return diagnostics;
}

export const IDE_PROJECT_TEMPLATES: IdeProjectTemplate[] = [
  {
    id: "fullstack-starter",
    name: "Interactive Web Matrix App",
    category: "Frontend (HTML + CSS + JS)",
    description: "Multi-file web application with semantic HTML5, modern CSS Grid/Flexbox, and reactive DOM scripts.",
    files: [
      {
        name: "index.html",
        language: "html",
        content: `<main class="matrix-shell">
  <header class="hero-header">
    <span class="badge">LIVE MATRIX IDE</span>
    <h1 id="title">Cybernetic Command Deck</h1>
    <p class="subtitle">Edit index.html, styles.css, and app.js just like in VS Code!</p>
  </header>

  <section class="stats-grid">
    <article class="stat-card">
      <span class="label">NODES ONLINE</span>
      <strong id="counter-value" class="value">12</strong>
    </article>
    <article class="stat-card">
      <span class="label">SYSTEM STATUS</span>
      <strong id="status-text" class="value status-ok">OPTIMAL</strong>
    </article>
  </section>

  <div class="actions">
    <button id="boost-btn" class="btn-primary">⚡ Boost Signal (+1)</button>
    <button id="ping-btn" class="btn-secondary">📡 Run Diagnostics</button>
  </div>

  <ul id="log-list" class="log-list"></ul>
</main>`,
      },
      {
        name: "styles.css",
        language: "css",
        content: `.matrix-shell {
  max-width: 560px;
  margin: 0 auto;
  background: #111827;
  border: 1px solid #1f2e4d;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
}

.badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-family: monospace;
  font-weight: 700;
  background: rgba(0, 255, 157, 0.15);
  color: #00ff9d;
  border: 1px solid rgba(0, 255, 157, 0.4);
}

.hero-header h1 {
  margin: 10px 0 4px;
  font-size: 22px;
  color: #ffffff;
}

.subtitle {
  margin: 0 0 18px;
  font-size: 13px;
  color: #94a3b8;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.stat-card {
  background: #0b0f19;
  border: 1px solid #1e293b;
  border-radius: 12px;
  padding: 12px;
}

.stat-card .label {
  display: block;
  font-size: 10px;
  font-family: monospace;
  color: #64748b;
}

.stat-card .value {
  font-size: 20px;
  font-family: monospace;
  color: #00e5ff;
}

.status-ok {
  color: #00ff9d !important;
}

.actions {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

button {
  cursor: pointer;
  font-family: monospace;
  font-weight: 700;
  font-size: 12px;
  padding: 10px 14px;
  border-radius: 10px;
  border: none;
  transition: transform 0.12s ease, opacity 0.12s ease;
}

button:hover {
  transform: translateY(-1px);
}

.btn-primary {
  background: linear-gradient(90deg, #00ff9d, #00e5ff);
  color: #0b0f19;
}

.btn-secondary {
  background: #1e293b;
  color: #e2e8f0;
  border: 1px solid #334155;
}

.log-list {
  list-style: none;
  padding: 0;
  margin: 0;
  font-family: monospace;
  font-size: 12px;
  color: #a5b4fc;
}

.log-list li {
  padding: 6px 10px;
  border-radius: 6px;
  background: rgba(15, 23, 42, 0.7);
  margin-bottom: 6px;
  border-left: 3px solid #00e5ff;
}`,
      },
      {
        name: "app.js",
        language: "javascript",
        content: `let signalPower = 12;
const counterEl = document.getElementById("counter-value");
const boostBtn = document.getElementById("boost-btn");
const pingBtn = document.getElementById("ping-btn");
const logList = document.getElementById("log-list");

function appendLog(message) {
  console.log("[Matrix Telemetry]", message);
  if (!logList) return;
  const li = document.createElement("li");
  li.textContent = \`[\${new Date().toLocaleTimeString()}] \${message}\`;
  logList.prepend(li);
}

if (boostBtn) {
  boostBtn.addEventListener("click", () => {
    signalPower += 1;
    if (counterEl) counterEl.textContent = String(signalPower);
    appendLog(\`Signal boosted to \${signalPower} THz\`);
  });
}

if (pingBtn) {
  pingBtn.addEventListener("click", () => {
    appendLog("All 12 full-stack realms responding in 1.4ms ✅");
  });
}

appendLog("Matrix IDE initialized and ready.");`,
      },
      {
        name: "README.md",
        language: "markdown",
        content: `# Interactive Web Matrix App

Welcome to the **DevQuest Online Matrix IDE**!

- Edit \`index.html\`, \`styles.css\`, and \`app.js\` in the file tree.
- Press **Ctrl + Enter** or click **Run & Preview** to execute your project.
- Open the **Integrated Terminal** at the bottom to inspect \`console.log\` output or run shell commands (\`help\`, \`ls\`, \`node app.js\`, \`test\`).`,
      },
    ],
  },
  {
    id: "ts-algorithms-lab",
    name: "TypeScript & Algorithms Workbench",
    category: "TypeScript + CS",
    description: "Strict TypeScript playground with binary search, memoized dynamic programming, and discriminated unions.",
    files: [
      {
        name: "algorithms.ts",
        language: "typescript",
        content: `interface SearchResult {
  found: boolean;
  index: number;
  comparisons: number;
}

export function binarySearch(sorted: number[], target: number): SearchResult {
  let low = 0;
  let high = sorted.length - 1;
  let comparisons = 0;

  while (low <= high) {
    comparisons++;
    const mid = Math.floor((low + high) / 2);
    if (sorted[mid] === target) {
      return { found: true, index: mid, comparisons };
    }
    if (sorted[mid] < target) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return { found: false, index: -1, comparisons };
}

const dataset = [2, 7, 14, 19, 25, 33, 42, 58, 64, 77, 89, 95];
const result = binarySearch(dataset, 42);
console.log("Binary Search Result for 42:", result);`,
      },
      {
        name: "index.html",
        language: "html",
        content: `<div style="font-family:monospace;padding:16px;background:#111827;border-radius:12px;border:1px solid #1f2e4d;">
  <h2 style="color:#00e5ff;margin-top:0;">TypeScript Algorithm Sandbox</h2>
  <p style="color:#94a3b8;font-size:13px;">Check the Integrated Console below to see your TypeScript execution output!</p>
</div>`,
      },
    ],
  },
  {
    id: "sql-postgres-lab",
    name: "PostgreSQL Schema & Query Lab",
    category: "Backend & Databases",
    description: "Design relational tables, B-Tree indexes, and parameterized prepared statements.",
    files: [
      {
        name: "schema.sql",
        language: "sql",
        content: `-- PostgreSQL 16 Production Schema & B-Tree Index Lab
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) DEFAULT 'operator',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users (email);

-- Parameterized Prepared Statement ($1)
SELECT id, email, role
FROM users
WHERE email = $1;`,
      },
    ],
  },
];
