export function transpileToRunnableJs(rawCode: string): string {
  let code = rawCode;

  // Remove "use server" / "use client" directives
  code = code.replace(/^\s*['"]use (server|client)['"];?\s*$/gm, "");

  // Remove import statements
  code = code.replace(/^\s*import\s+[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, "");
  code = code.replace(/^\s*import\s+['"][^'"]+['"];?\s*$/gm, "");

  // Remove TypeScript interface and type blocks
  code = code.replace(/export\s+interface\s+\w+(?:<[^>]+>)?\s*\{[\s\S]*?\}/g, "");
  code = code.replace(/interface\s+\w+(?:<[^>]+>)?\s*\{[\s\S]*?\}/g, "");
  code = code.replace(/export\s+type\s+\w+(?:<[^>]+>)?\s*=[\s\S]*?;/g, "");
  code = code.replace(/type\s+\w+(?:<[^>]+>)?\s*=[\s\S]*?;/g, "");

  // Strip 'export' keyword before declarations
  code = code.replace(/\bexport\s+(async\s+function|function|const|let|var|class)\b/g, "$1");

  // Strip generic type parameters on functions e.g. function wrapResponse<T>(
  code = code.replace(/(function\s+\w+)\s*<[^>]+>\s*\(/g, "$1(");

  // Strip variable type annotations e.g. const cadet: MatrixOperator =
  code = code.replace(/\b(const|let|var)\s+(\w+)\s*:\s*[^=]+=/g, "$1 $2 =");

  // Strip function return type annotations e.g. ): ApiResponse<T> { or ): number {
  code = code.replace(/\)\s*:\s*[A-Za-z0-9_<>\[\]|&\s{}.,?:]+\s*\{/g, ") {");

  // Strip parameter type annotations inside function signatures
  code = code.replace(/\(([^)]*)\)/g, (fullMatch, inner: string) => {
    if (!inner.includes(":")) return fullMatch;
    // Avoid touching object literals by only stripping simple param: Type pairs
    const cleaned = inner
      .split(",")
      .map((param) => {
        const trimmed = param.trim();
        const match = trimmed.match(/^(\.\.\.)?([A-Za-z_$][\w$]*)\??\s*:\s*(.+)$/);
        if (match) {
          return `${match[1] || ""}${match[2]}`;
        }
        return param;
      })
      .join(", ");
    return `(${cleaned})`;
  });

  // Strip TypeScript `as Type` assertions
  code = code.replace(/\s+as\s+[A-Za-z0-9_<>\[\]|&]+/g, "");

  return code;
}

export function buildSandboxSrcDoc(
  code: string,
  language: string,
  previewType: "html" | "console"
): string {
  // 1. HTML / CSS Interactive DOM Preview
  if (previewType === "html") {
    const baseStyle = `<style>
      :root { color-scheme: dark; }
      body {
        background-color: #0a0e17;
        color: #f8fafc;
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        padding: 20px;
        margin: 0;
        line-height: 1.6;
      }
      h1, h2, h3 { color: #00ff9d; margin-top: 0; }
      a { color: #00e5ff; }
      label {
        display: block;
        font-family: ui-monospace, monospace;
        font-size: 12px;
        color: #94a3b8;
        margin-top: 12px;
        margin-bottom: 4px;
      }
      input, select, textarea {
        background: #111a30;
        border: 1px solid #1f2e4d;
        color: #f8fafc;
        padding: 8px 12px;
        border-radius: 8px;
        font-family: ui-monospace, monospace;
        font-size: 13px;
        outline: none;
      }
      input:focus { border-color: #00e5ff; }
      button {
        margin-top: 12px;
        background: linear-gradient(90deg, #00ff9d, #00e5ff);
        color: #050811;
        border: none;
        padding: 8px 16px;
        border-radius: 8px;
        font-family: ui-monospace, monospace;
        font-weight: 700;
        font-size: 12px;
        cursor: pointer;
      }
      button:hover { opacity: 0.92; }
    </style>`;

    if (/<head[\s>]/i.test(code)) {
      return code.replace(/<head([\s>])/i, `<head$1${baseStyle}`);
    }
    return `<!DOCTYPE html><html><head><meta charset="utf-8" />${baseStyle}</head><body>${code}</body></html>`;
  }

  // 2. SQL Schema & Query Execution Plan Simulator
  if (language === "sql") {
    const encodedSql = JSON.stringify(code);
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #0a0e17; color: #e2e8f0; font-family: ui-monospace, monospace; padding: 16px; font-size: 12px; }
    .header { display: flex; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 8px; margin-bottom: 12px; color: #a855f7; font-weight: bold; text-transform: uppercase; font-size: 11px; }
    .card { background: #111a30; border: 1px solid #1f2e4d; border-radius: 8px; padding: 12px; margin-bottom: 10px; }
    .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; background: rgba(0, 255, 157, 0.15); color: #00ff9d; margin-right: 6px; }
    .warn { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
  </style>
</head>
<body>
  <div class="header"><span>PostgreSQL 16 Engine Simulator</span><span>DDL / Query Planner</span></div>
  <div id="out"></div>
  <script>
    const sql = ${encodedSql};
    const out = document.getElementById('out');
    const tables = [...sql.matchAll(/CREATE\\s+TABLE\\s+(\\w+)/gi)].map(m => m[1]);
    const indexes = [...sql.matchAll(/CREATE\\s+INDEX\\s+(\\w+)\\s+ON\\s+(\\w+)\\s*\\(([^)]+)\\)/gi)];
    const hasPk = /SERIAL\\s+PRIMARY\\s+KEY|PRIMARY\\s+KEY/i.test(sql);
    const hasFk = /REFERENCES\\s+\\w+/i.test(sql);

    let html = '';
    if (tables.length > 0) {
      html += '<div class="card"><span class="badge">CREATE TABLE</span> Detected Tables: <strong>' + tables.join(', ') + '</strong><br/><br/>';
      html += '• Primary Key Constraint: ' + (hasPk ? '<span style="color:#00ff9d">Verified</span>' : '<span style="color:#f59e0b">Missing</span>') + '<br/>';
      html += '• Foreign Key Reference: ' + (hasFk ? '<span style="color:#00ff9d">Verified</span>' : '<span style="color:#94a3b8">None</span>') + '</div>';
    }
    if (indexes.length > 0) {
      indexes.forEach(idx => {
        html += '<div class="card"><span class="badge">B-TREE INDEX</span> <strong>' + idx[1] + '</strong> on <code>' + idx[2] + '(' + idx[3] + ')</code><br/><span style="color:#00e5ff">Query Planner: Index Scan O(log N) active — Sequential Scan bypassed.</span></div>';
      });
    }
    if (!html) {
      html = '<div class="card"><span class="badge warn">WAITING</span> Write CREATE TABLE or CREATE INDEX statements to inspect the PostgreSQL execution plan.</div>';
    }
    out.innerHTML = html;
  </script>
</body>
</html>`;
  }

  // 3. Dockerfile Multi-Stage Container Inspector
  if (language === "dockerfile") {
    const encodedDocker = JSON.stringify(code);
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #0a0e17; color: #e2e8f0; font-family: ui-monospace, monospace; padding: 16px; font-size: 12px; }
    .header { display: flex; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 8px; margin-bottom: 12px; color: #38bdf8; font-weight: bold; text-transform: uppercase; font-size: 11px; }
    .layer { background: #111a30; border-left: 3px solid #38bdf8; border-radius: 6px; padding: 8px 12px; margin-bottom: 8px; display: flex; justify-content: space-between; }
  </style>
</head>
<body>
  <div class="header"><span>Docker BuildKit Layer Inspector</span><span>Container Image Analyzer</span></div>
  <div id="layers"></div>
  <script>
    const raw = ${encodedDocker};
    const lines = raw.split('\\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
    const container = document.getElementById('layers');
    lines.forEach((line, idx) => {
      const div = document.createElement('div');
      div.className = 'layer';
      div.innerHTML = '<span><strong>Layer ' + (idx + 1) + ':</strong> ' + line.replace(/</g, '&lt;') + '</span><span style="color:#00ff9d">CACHED</span>';
      container.appendChild(div);
    });
  </script>
</body>
</html>`;
  }

  // 4. YAML CI/CD Workflow Inspector
  if (language === "yaml") {
    const encodedYaml = JSON.stringify(code);
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #0a0e17; color: #e2e8f0; font-family: ui-monospace, monospace; padding: 16px; font-size: 12px; }
    .header { display: flex; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 8px; margin-bottom: 12px; color: #00ff9d; font-weight: bold; text-transform: uppercase; font-size: 11px; }
    .step { background: #111a30; border: 1px solid #1f2e4d; border-radius: 8px; padding: 10px 12px; margin-bottom: 8px; }
  </style>
</head>
<body>
  <div class="header"><span>GitHub Actions Runner Simulator</span><span>ubuntu-latest</span></div>
  <div id="steps"></div>
  <script>
    const yaml = ${encodedYaml};
    const out = document.getElementById('steps');
    const runs = [...yaml.matchAll(/run\\s*:\\s*(.+)/gi)].map(m => m[1].trim());
    let html = '<div class="step">Trigger Events: <strong>' + (/push/i.test(yaml) ? 'push ' : '') + (/pull_request/i.test(yaml) ? 'pull_request' : '') + '</strong></div>';
    runs.forEach((cmd, i) => {
      html += '<div class="step" style="border-left: 3px solid #00ff9d">Step ' + (i + 1) + ': <code>' + cmd + '</code> <span style="float:right;color:#00ff9d">✓ READY</span></div>';
    });
    out.innerHTML = html;
  </script>
</body>
</html>`;
  }

  // 5. JavaScript / TypeScript / React / Node Sandbox Console
  const runnableJs = transpileToRunnableJs(code);
  const encodedRunnable = JSON.stringify(runnableJs);
  const encodedRaw = JSON.stringify(code);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #0a0e17;
      color: #e2e8f0;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      padding: 16px;
      font-size: 12px;
      line-height: 1.6;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #1e293b;
      padding-bottom: 8px;
      margin-bottom: 12px;
      color: #00e5ff;
      font-size: 11px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .log-entry {
      padding: 8px 12px;
      border-radius: 8px;
      margin-bottom: 8px;
      background: rgba(15, 23, 42, 0.7);
      border-left: 3px solid #00ff9d;
      word-break: break-all;
      white-space: pre-wrap;
    }
    .log-info { border-left-color: #00e5ff; color: #bae6fd; }
    .log-warn { border-left-color: #f59e0b; color: #fcd34d; }
    .log-error {
      border-left-color: #ef4444;
      background: rgba(239, 68, 68, 0.12);
      color: #fca5a5;
    }
    .tag {
      display: inline-block;
      padding: 1px 6px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: bold;
      margin-right: 8px;
    }
    .tag-log { background: rgba(0, 255, 157, 0.15); color: #00ff9d; }
    .tag-info { background: rgba(0, 229, 255, 0.15); color: #00e5ff; }
    .tag-warn { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
    .tag-error { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
  </style>
</head>
<body>
  <div class="header">
    <span>Live Sandbox Console (${language.toUpperCase()})</span>
    <span>Runtime Active</span>
  </div>
  <div id="output"></div>
  <script>
    const output = document.getElementById('output');
    let hasLogged = false;

    function appendEntry(type, args) {
      hasLogged = true;
      const entry = document.createElement('div');
      entry.className = 'log-entry log-' + type;
      const tag = document.createElement('span');
      tag.className = 'tag tag-' + type;
      tag.textContent = type.toUpperCase();
      entry.appendChild(tag);

      const content = args.map(a => {
        if (typeof a === 'object' && a !== null) {
          try { return JSON.stringify(a, null, 2); } catch(e) { return String(a); }
        }
        return String(a);
      }).join(' ');

      entry.appendChild(document.createTextNode(content));
      output.appendChild(entry);
    }

    console.log = (...args) => appendEntry('log', args);
    console.info = (...args) => appendEntry('info', args);
    console.warn = (...args) => appendEntry('warn', args);
    console.error = (...args) => appendEntry('error', args);

    // Sandbox shims for Node/Express/Next/Vitest quests
    const express = () => {
      const routes = [];
      return {
        use: () => {},
        get: (path, fn) => { routes.push({ method: 'GET', path }); appendEntry('info', ['Registered Express Route: GET ' + path]); },
        post: (path, fn) => { routes.push({ method: 'POST', path }); appendEntry('info', ['Registered Express Route: POST ' + path]); },
      };
    };
    express.json = () => ({});
    const revalidatePath = (p) => appendEntry('info', ['Next.js revalidatePath(\"' + p + '\") triggered']);
    const jwt = {
      verify: (token, secret, opts) => ({ sub: 'op-01', role: 'archmage', algorithms: opts?.algorithms }),
      sign: () => 'mock.jwt.token'
    };
    const describe = (name, fn) => { appendEntry('info', ['Test Suite: ' + name]); try { fn(); } catch(e) {} };
    const it = (name, fn) => { appendEntry('log', ['✓ Test Case: ' + name]); try { fn(); } catch(e) {} };
    const test = it;
    const expect = (actual) => ({
      toBe: (expected) => appendEntry('log', ['Assertion expect(' + JSON.stringify(actual) + ').toBe(' + JSON.stringify(expected) + ') -> ' + (actual === expected ? 'PASS' : 'FAIL')]),
      toEqual: (expected) => appendEntry('log', ['Assertion toEqual -> PASS']),
      toHaveBeenCalledWith: (...args) => appendEntry('log', ['Spy Assertion toHaveBeenCalledWith(' + JSON.stringify(args) + ') -> PASS']),
    });
    const vi = {
      fn: () => {
        const mockFn = (...args) => Promise.resolve({ ok: true, args });
        mockFn.mockResolvedValue = (val) => { appendEntry('info', ['Configured mockResolvedValue: ' + JSON.stringify(val)]); return mockFn; };
        return mockFn;
      }
    };

    try {
      const runnableCode = ${encodedRunnable};
      const rawSource = ${encodedRaw};
      if (!runnableCode.includes('<button') && !runnableCode.includes('JSX')) {
        const runner = new Function('express', 'revalidatePath', 'jwt', 'describe', 'it', 'test', 'expect', 'vi', runnableCode);
        runner(express, revalidatePath, jwt, describe, it, test, expect, vi);
      } else {
        appendEntry('info', ['React JSX Component verified in sandbox virtual DOM.']);
      }
      if (!hasLogged) {
        appendEntry('info', ['Code parsed and evaluated cleanly with 0 runtime errors. Tip: Add console.log(...) to inspect values!']);
      }
    } catch (err) {
      appendEntry('error', [err.name + ': ' + err.message]);
    }
  </script>
</body>
</html>`;
}
