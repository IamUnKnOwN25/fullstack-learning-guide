export interface Quest {
  id: string;
  realmId: string;
  order: number;
  title: string;
  storyIntro: string;
  conceptSummary: string;
  starterCode: string;
  language: "html" | "css" | "javascript" | "typescript" | "sql" | "dockerfile" | "yaml" | "bash";
  previewType: "html" | "console";
  tasks: string[];
  testRunner: (code: string) => { passed: boolean; message: string; output?: string };
  hints: string[];
  xpReward: number;
}

export const QUESTS: Record<string, Quest[]> = {
  html: [
    {
      id: "html_1_skeleton",
      realmId: "html",
      order: 1,
      title: "Awaken the Page Skeleton",
      storyIntro: "Byte speaks: 'Cadet! The fundamental anchor of the Matrix has decayed. Without <!DOCTYPE html> and an accessible <head> shell, no browser engine can interpret our coordinates!'",
      conceptSummary: "Every modern webpage begins with <!DOCTYPE html> to prevent quirks mode. The <head> stores metadata and viewport configuration, while <body> holds visible content.",
      starterCode: `<!DOCTYPE html>
<html lang="en">
  <head>
    <!-- Add UTF-8 charset meta here -->
    <!-- Add responsive viewport meta here -->
    <title>DevQuest Matrix Node</title>
  </head>
  <body>
    <!-- Add an <h1> title and a <p> description -->
  </body>
</html>`,
      language: "html",
      previewType: "html",
      tasks: [
        "Include <meta charset='UTF-8'>",
        "Include <meta name='viewport' content='width=device-width, initial-scale=1.0'>",
        "Add a primary <h1> heading inside the <body>",
        "Add a descriptive <p> paragraph inside the <body>",
      ],
      testRunner: (code: string) => {
        const hasDoctype = /<!doctype html>/i.test(code);
        const hasCharset = /<meta\s+charset=["']utf-8["']/i.test(code);
        const hasViewport = /<meta\s+name=["']viewport["']/i.test(code);
        const hasH1 = /<h1[\s\S]*?>[\s\S]+?<\/h1>/i.test(code);
        const hasP = /<p[\s\S]*?>[\s\S]+?<\/p>/i.test(code);

        if (!hasDoctype) return { passed: false, message: "Missing <!DOCTYPE html> at line 1." };
        if (!hasCharset) return { passed: false, message: "Missing <meta charset='UTF-8'> in the <head>." };
        if (!hasViewport) return { passed: false, message: "Missing responsive <meta name='viewport'> tag." };
        if (!hasH1) return { passed: false, message: "Add an <h1> heading inside your <body>." };
        if (!hasP) return { passed: false, message: "Add a <p> paragraph describing your node." };

        return {
          passed: true,
          message: "Structure online! The page skeleton stands resolute against the digital void.",
        };
      },
      hints: [
        "Add <meta charset='UTF-8'> inside <head>",
        "Add <meta name='viewport' content='width=device-width, initial-scale=1.0'> inside <head>",
        "Write <h1>Matrix Online</h1> inside <body>",
      ],
      xpReward: 100,
    },
    {
      id: "html_2_forms",
      realmId: "html",
      order: 2,
      title: "The Accessible Command Console",
      storyIntro: "Byte alerts: 'Intruders detected! We need an authentication form. But remember: screen readers and keyboard pilots must navigate it flawlessly!'",
      conceptSummary: "Semantic forms require explicit <label> associations via 'for' and 'id'. Inputs must declare appropriate types (email, password) and accessibility attributes.",
      starterCode: `<form action="/api/login" method="POST">
  <!-- Build an accessible email input with label -->

  <!-- Build an accessible password input with label -->

  <!-- Add a submit button -->
</form>`,
      language: "html",
      previewType: "html",
      tasks: [
        "Create <label for='email'> and <input id='email' type='email' required>",
        "Create <label for='password'> and <input id='password' type='password' required minlength='8'>",
        "Add a <button type='submit'>Login</button>",
      ],
      testRunner: (code: string) => {
        const hasEmailLabel = /<label[^>]*for=["']email["']/i.test(code);
        const hasEmailInput = /<input[^>]*id=["']email["'][^>]*type=["']email["']/i.test(code) ||
                              /<input[^>]*type=["']email["'][^>]*id=["']email["']/i.test(code);
        const hasPassLabel = /<label[^>]*for=["']password["']/i.test(code);
        const hasPassInput = /<input[^>]*type=["']password["']/i.test(code);
        const hasSubmitBtn = /<button[^>]*type=["']submit["'][\s\S]*?>[\s\S]*?<\/button>/i.test(code);

        if (!hasEmailLabel || !hasEmailInput) return { passed: false, message: "Ensure you link <label for='email'> to <input id='email' type='email'>." };
        if (!hasPassLabel || !hasPassInput) return { passed: false, message: "Ensure you link <label for='password'> to <input id='password' type='password'>." };
        if (!hasSubmitBtn) return { passed: false, message: "Add a <button type='submit'> to submit the credentials." };

        return {
          passed: true,
          message: "Accessible form locked and verified! Screen readers salute your compliance.",
        };
      },
      hints: [
        "<label for='email'>Email Address</label>\n<input id='email' type='email' name='email' required>",
        "<label for='password'>Password</label>\n<input id='password' type='password' name='password' required minlength='8'>",
        "<button type='submit'>Authorize</button>",
      ],
      xpReward: 120,
    },
  ],

  css: [
    {
      id: "css_1_flexbox",
      realmId: "css",
      order: 1,
      title: "Mastering the Flex Matrix",
      storyIntro: "Byte reports: 'Look at this command deck! The gauges and buttons are tumbling over each other in standard block flow. We need Flexbox to align them horizontally and center them vertically!'",
      conceptSummary: "Flexbox aligns items along a main axis (justify-content) and cross axis (align-items). Set display: flex on the parent container to activate the flex formatting context.",
      starterCode: `<div class="hud-bar">
  <div class="hud-item">HP: 100</div>
  <div class="hud-item">MANA: 50</div>
  <div class="hud-item">LEVEL: 1</div>
</div>

<style>
.hud-bar {
  /* Turn into a flex container */
  /* Space items evenly with space-between */
  /* Center items along the cross axis */
  /* Add 1rem padding and background: #111a30 */
  padding: 1rem;
  background: #111a30;
  color: #00ff9d;
  font-family: monospace;
}
.hud-item {
  padding: 0.5rem 1rem;
  border: 1px solid #00ff9d;
  border-radius: 4px;
}
</style>`,
      language: "html",
      previewType: "html",
      tasks: [
        "Add display: flex to .hud-bar",
        "Add justify-content: space-between (or space-around)",
        "Add align-items: center",
      ],
      testRunner: (code: string) => {
        const hasDisplayFlex = /display\s*:\s*flex/i.test(code);
        const hasJustify = /justify-content\s*:\s*(space-between|space-around|space-evenly)/i.test(code);
        const hasAlign = /align-items\s*:\s*center/i.test(code);

        if (!hasDisplayFlex) return { passed: false, message: "Add 'display: flex;' to .hud-bar." };
        if (!hasJustify) return { passed: false, message: "Add 'justify-content: space-between;' to distribute the HUD items evenly." };
        if (!hasAlign) return { passed: false, message: "Add 'align-items: center;' to center items on the cross axis." };

        return {
          passed: true,
          message: "Flexbox alignment achieved! The HUD elements snap into flawless harmony.",
        };
      },
      hints: [
        ".hud-bar {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}",
      ],
      xpReward: 120,
    },
    {
      id: "css_2_grid",
      realmId: "css",
      order: 2,
      title: "The Dynamic 2D Labyrinth",
      storyIntro: "Byte points forward: 'We are approaching the Labyrinth of Cards. Flexbox is 1-dimensional, but this grid requires dual-axis repeat(auto-fit) power to render across all screen sizes!'",
      conceptSummary: "CSS Grid excels at two-dimensional layouts. Using `grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))` creates inherently responsive card layouts with zero media queries.",
      starterCode: `<div class="grid-container">
  <div class="card">Quest 1</div>
  <div class="card">Quest 2</div>
  <div class="card">Quest 3</div>
  <div class="card">Quest 4</div>
</div>

<style>
.grid-container {
  /* Make this a CSS Grid */
  /* Use repeat(auto-fit, minmax(200px, 1fr)) */
  /* Add gap: 1rem */
}
.card {
  background: #0f172a;
  color: #38bdf8;
  padding: 1.5rem;
  border: 1px solid #38bdf8;
  border-radius: 8px;
  text-align: center;
}
</style>`,
      language: "html",
      previewType: "html",
      tasks: [
        "Set display: grid on .grid-container",
        "Set grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))",
        "Set gap: 1rem",
      ],
      testRunner: (code: string) => {
        const hasGrid = /display\s*:\s*grid/i.test(code);
        const hasRepeat = /grid-template-columns\s*:\s*repeat\s*\(\s*auto-fit\s*,\s*minmax\s*\(\s*200px\s*,\s*1fr\s*\)\s*\)/i.test(code);
        const hasGap = /gap\s*:\s*1rem/i.test(code);

        if (!hasGrid) return { passed: false, message: "Add 'display: grid;' to .grid-container." };
        if (!hasRepeat) return { passed: false, message: "Use 'grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));'." };
        if (!hasGap) return { passed: false, message: "Add 'gap: 1rem;' to separate grid cells." };

        return {
          passed: true,
          message: "Responsive grid spell activated! Cards adapt gracefully across infinite resolutions.",
        };
      },
      hints: [
        "display: grid;\ngrid-template-columns: repeat(auto-fit, minmax(200px, 1fr));\ngap: 1rem;",
      ],
      xpReward: 140,
    },
  ],

  javascript: [
    {
      id: "js_1_dom",
      realmId: "javascript",
      order: 1,
      title: "Awaken the Reactive Core",
      storyIntro: "Byte announces: 'Static HTML is lifeless. We need JavaScript to bind event listeners and update DOM state dynamically when an operator clicks the energy conduit!'",
      conceptSummary: "The DOM represents documents as a tree of objects. `document.querySelector` locates elements, `addEventListener` attaches handlers, and `textContent` or `classList` mutates the UI safely.",
      starterCode: `<button id="boost-btn">Cast Surge</button>
<div id="status">Power: 0</div>

<script>
let power = 0;
const btn = document.querySelector('#boost-btn');
const statusDiv = document.querySelector('#status');

// Add a click listener to increment power by 10
// Update statusDiv.textContent to "Power: " + power
</script>`,
      language: "html",
      previewType: "html",
      tasks: [
        "Attach a 'click' event listener to btn",
        "Increment power by 10 inside the callback",
        "Update statusDiv.textContent to reflect the new power value",
      ],
      testRunner: (code: string) => {
        const hasEventListener = /addEventListener\s*\(\s*['"]click['"]/i.test(code);
        const hasPowerIncrement = /power\s*(\+=\s*10|\+\+)/i.test(code);
        const hasTextContent = /textContent\s*=\s*/i.test(code);

        if (!hasEventListener) return { passed: false, message: "Attach an event listener for 'click' on the button." };
        if (!hasPowerIncrement) return { passed: false, message: "Increment the power variable inside your handler." };
        if (!hasTextContent) return { passed: false, message: "Update statusDiv.textContent with the new power." };

        return {
          passed: true,
          message: "Reactivity energized! The button now pulses with interactive DOM electricity.",
        };
      },
      hints: [
        "btn.addEventListener('click', () => {\n  power += 10;\n  statusDiv.textContent = 'Power: ' + power;\n});",
      ],
      xpReward: 150,
    },
    {
      id: "js_2_async",
      realmId: "javascript",
      order: 2,
      title: "The Asynchronous Conduit",
      storyIntro: "Byte urgently signals: 'Teleport coordinates are stored on a remote server. We cannot freeze the browser thread with synchronous operations. Summon async/await!'",
      conceptSummary: "Promises handle asynchronous actions without blocking execution. `async/await` provides clean sequential syntax over Promises, protected by `try...catch` blocks for robust error recovery.",
      starterCode: `async function fetchMatrixCoordinates(endpoint) {
  // Use try/catch
  // const res = await fetch(endpoint)
  // Check if res.ok, otherwise throw new Error("Fetch failed: " + res.status)
  // return await res.json()
}`,
      language: "javascript",
      previewType: "console",
      tasks: [
        "Wrap the operation in a try/catch block",
        "await fetch(endpoint)",
        "Check res.ok and throw an Error if false",
        "return await res.json()",
      ],
      testRunner: (code: string) => {
        const hasTryCatch = /try\s*\{[\s\S]*\}\s*catch/i.test(code);
        const hasAwaitFetch = /await\s+fetch\s*\(/i.test(code);
        const hasResOk = /(res|response)\.ok/i.test(code);
        const hasJson = /\.json\s*\(\s*\)/i.test(code);

        if (!hasTryCatch) return { passed: false, message: "Always protect async calls with try / catch." };
        if (!hasAwaitFetch) return { passed: false, message: "Use await fetch(endpoint) to initiate the request." };
        if (!hasResOk) return { passed: false, message: "Verify response.ok before parsing JSON." };
        if (!hasJson) return { passed: false, message: "Parse the response body with .json()." };

        return {
          passed: true,
          message: "Asynchronous stream stabilized! Teleport coordinates received safely.",
        };
      },
      hints: [
        "try {\n  const res = await fetch(endpoint);\n  if (!res.ok) throw new Error('Status: ' + res.status);\n  return await res.json();\n} catch (err) {\n  console.error(err);\n  throw err;\n}",
      ],
      xpReward: 160,
    },
  ],

  typescript: [
    {
      id: "ts_1_interfaces",
      realmId: "typescript",
      order: 1,
      title: "The Ironclad Type Contract",
      storyIntro: "Byte states: 'JavaScript without types is like walking a tightrope in the dark. In the Sanctuary of Types, we define immutable contracts using TypeScript interfaces!'",
      conceptSummary: "TypeScript contracts ensure data matches anticipated shapes at compile time. Interfaces define object signatures, optional fields (?), and readonly modifiers.",
      starterCode: `// Define an interface for a MatrixOperator
interface MatrixOperator {
  id: string;
  name: string;
  level: number;
  isOnline: boolean;
  avatarUrl?: string; // Optional field
}

// Instantiate a valid operator object conforming to the interface
const cadet: MatrixOperator = {
  // Fill in required fields
};`,
      language: "typescript",
      previewType: "console",
      tasks: [
        "Provide string 'id'",
        "Provide string 'name'",
        "Provide number 'level'",
        "Provide boolean 'isOnline'",
      ],
      testRunner: (code: string) => {
        const hasCadet = /const\s+cadet\s*:\s*MatrixOperator\s*=\s*\{[\s\S]*?\}/i.test(code);
        const hasId = /id\s*:\s*['"][\w-]+['"]/i.test(code);
        const hasName = /name\s*:\s*['"][^'"]+['"]/i.test(code);
        const hasLevel = /level\s*:\s*\d+/i.test(code);
        const hasIsOnline = /isOnline\s*:\s*(true|false)/i.test(code);

        if (!hasCadet) return { passed: false, message: "Declare const cadet: MatrixOperator." };
        if (!hasId || !hasName || !hasLevel || !hasIsOnline) {
          return { passed: false, message: "Ensure all required fields (id, name, level, isOnline) are filled with correct types." };
        }

        return {
          passed: true,
          message: "Type contract verified! The compiler shields your operator from undefined property errors.",
        };
      },
      hints: [
        "const cadet: MatrixOperator = {\n  id: 'op-01',\n  name: 'Cipher',\n  level: 10,\n  isOnline: true\n};",
      ],
      xpReward: 150,
    },
  ],

  react: [
    {
      id: "react_1_hooks",
      realmId: "react",
      order: 1,
      title: "The Reactive State Conduit",
      storyIntro: "Byte speaks: 'The UI components have lost their reactive pulse! We must implement a stateful counter that increments cleanly on button click!'",
      conceptSummary: "React components re-render when state changes. useState returns [value, setter]. Always use the functional updater form `setCount(c => c + 1)` when new state depends on previous state.",
      starterCode: `import React, { useState } from "react";

export function Counter() {
  // Initialize count state to 0
  const [count, setCount] = useState(0);

  // Return button that increments count on click
  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  );
}`,
      language: "typescript",
      previewType: "console",
      tasks: [
        "Initialize useState with 0",
        "Render a <button> element",
        "Attach an onClick handler calling setCount(c => c + 1)",
      ],
      testRunner: (code: string) => {
        const hasUseState = /useState\s*\(\s*0\s*\)/i.test(code);
        const hasOnClick = /onClick\s*=\s*\{[\s\S]*?setCount/i.test(code);
        const hasButton = /<button[\s\S]*?>[\s\S]*?<\/button>/i.test(code);

        if (!hasUseState) return { passed: false, message: "Use useState(0) to hold the counter state." };
        if (!hasOnClick || !hasButton) return { passed: false, message: "Render a <button> with an onClick calling setCount." };

        return {
          passed: true,
          message: "State conduit energized! The component pulses with clean reactive renders.",
        };
      },
      hints: [
        "const [count, setCount] = useState(0);\nreturn <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>;",
      ],
      xpReward: 180,
    },
    {
      id: "react_2_server_actions",
      realmId: "react",
      order: 2,
      title: "Next.js Server Action Invocation",
      storyIntro: "Byte explains: 'In modern Next.js 15, we can execute secure server mutations directly from forms without writing boilerplate REST endpoints!'",
      conceptSummary: "Server Actions are marked with 'use server'. They accept form data, mutate the database, and trigger cache revalidation via revalidatePath.",
      starterCode: `// app/actions.ts
"use server";
import { revalidatePath } from "next/cache";

export async function addQuestAction(formData: FormData) {
  const title = formData.get("title") as string;
  // Verify title exists, revalidate '/quests' path, and return { success: true }
}`,
      language: "typescript",
      previewType: "console",
      tasks: [
        "Include 'use server' directive",
        "Extract 'title' from formData",
        "Call revalidatePath('/quests')",
        "Return { success: true }",
      ],
      testRunner: (code: string) => {
        const hasUseServer = /['"]use server['"]/i.test(code);
        const hasFormData = /formData\.get\s*\(\s*['"]title['"]\s*\)/i.test(code);
        const hasRevalidate = /revalidatePath\s*\(\s*['"]\/quests['"]\s*\)/i.test(code);

        if (!hasUseServer) return { passed: false, message: "Declare 'use server' at the top of the action." };
        if (!hasFormData) return { passed: false, message: "Extract title using formData.get('title')." };
        if (!hasRevalidate) return { passed: false, message: "Revalidate the path with revalidatePath('/quests')." };

        return {
          passed: true,
          message: "Server action dispatched! The server executes seamlessly without client bundle bloat.",
        };
      },
      hints: [
        "if (!title) throw new Error('Missing title');\nrevalidatePath('/quests');\nreturn { success: true };",
      ],
      xpReward: 200,
    },
  ],

  backend: [
    {
      id: "backend_1_express_rest",
      realmId: "backend",
      order: 1,
      title: "Constructing the REST Citadel",
      storyIntro: "Byte signals: 'The server endpoints have disconnected. We must route incoming HTTP traffic with Express and return formatted JSON with appropriate 200/201 status codes!'",
      conceptSummary: "Express routes map HTTP verbs (GET, POST, PUT, DELETE) and URL paths to request handlers. Always set status codes explicitly (`res.status(201).json(...)`).",
      starterCode: `import express from "express";
const app = express();
app.use(express.json());

// Implement GET /api/health returning status 200 and { status: "healthy" }
// Implement POST /api/tasks returning status 201 and { id: "task-1", ...req.body }
`,
      language: "typescript",
      previewType: "console",
      tasks: [
        "Define app.get('/api/health')",
        "Return res.status(200).json({ status: 'healthy' })",
        "Define app.post('/api/tasks')",
        "Return res.status(201).json(...)",
      ],
      testRunner: (code: string) => {
        const hasGet = /app\.get\s*\(\s*['"]\/api\/health['"]/i.test(code);
        const hasStatus200 = /res\.status\s*\(\s*200\s*\)\.json/i.test(code);
        const hasPost = /app\.post\s*\(\s*['"]\/api\/tasks['"]/i.test(code);
        const hasStatus201 = /res\.status\s*\(\s*201\s*\)\.json/i.test(code);

        if (!hasGet || !hasStatus200) return { passed: false, message: "Implement GET /api/health with status 200." };
        if (!hasPost || !hasStatus201) return { passed: false, message: "Implement POST /api/tasks with status 201." };

        return {
          passed: true,
          message: "REST Citadel online! HTTP requests are processed with pristine status codes.",
        };
      },
      hints: [
        "app.get('/api/health', (req, res) => res.status(200).json({ status: 'healthy' }));\napp.post('/api/tasks', (req, res) => res.status(201).json({ id: 'task-1', ...req.body }));",
      ],
      xpReward: 200,
    },
    {
      id: "backend_2_jwt_auth",
      realmId: "backend",
      order: 2,
      title: "The Cryptographic JWT Ward",
      storyIntro: "Byte warns: 'Unauthenticated requests are breaching the inner sanctum. We need middleware to verify JSON Web Tokens from the Authorization header!'",
      conceptSummary: "Authentication middleware extracts `Bearer <token>` from req.headers.authorization, verifies it with `jwt.verify(token, secret)`, and stores payload in `res.locals.user`.",
      starterCode: `import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // Extract token from Authorization header: "Bearer <token>"
  // Verify token using process.env.JWT_SECRET!
  // If valid: attach decoded to res.locals.user and call next()
  // If invalid or missing: return res.status(401).json({ error: "Unauthorized" })
}`,
      language: "typescript",
      previewType: "console",
      tasks: [
        "Extract Bearer token from req.headers.authorization",
        "Verify token with jwt.verify",
        "Set res.locals.user = decoded and call next()",
        "Return status 401 on error",
      ],
      testRunner: (code: string) => {
        const hasAuthHeader = /req\.headers\.authorization/i.test(code);
        const hasVerify = /jwt\.verify\s*\(/i.test(code);
        const hasResLocals = /res\.locals\.user\s*=/i.test(code);
        const has401 = /res\.status\s*\(\s*401\s*\)/i.test(code);

        if (!hasAuthHeader) return { passed: false, message: "Check req.headers.authorization for Bearer token." };
        if (!hasVerify) return { passed: false, message: "Call jwt.verify(token, secret)." };
        if (!hasResLocals) return { passed: false, message: "Store decoded payload in res.locals.user." };
        if (!has401) return { passed: false, message: "Return status 401 when verification fails." };

        return {
          passed: true,
          message: "Cryptographic ward active! Unauthorized intruders are repelled.",
        };
      },
      hints: [
        "const auth = req.headers.authorization;\nif (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });\nconst token = auth.split(' ')[1];\ntry {\n  res.locals.user = jwt.verify(token, process.env.JWT_SECRET!);\n  next();\n} catch {\n  res.status(401).json({ error: 'Unauthorized' });\n}",
      ],
      xpReward: 220,
    },
  ],

  databases: [
    {
      id: "db_1_postgres",
      realmId: "databases",
      order: 1,
      title: "Architecting the Relational Schema",
      storyIntro: "Byte descends into the vault: 'Scattered unindexed data is decaying. We must forge a PostgreSQL schema with primary keys, foreign key constraints, and timestamps!'",
      conceptSummary: "Relational schemas guarantee data integrity through types, PRIMARY KEYs, and FOREIGN KEY constraints with referential actions (e.g. ON DELETE CASCADE).",
      starterCode: `-- Create the users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create the tasks table linked to users
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);`,
      language: "sql",
      previewType: "console",
      tasks: [
        "Define users table with UUID primary key and UNIQUE email",
        "Define tasks table with FOREIGN KEY referencing users(id)",
        "Add ON DELETE CASCADE to foreign key",
      ],
      testRunner: (code: string) => {
        const hasCreateUsers = /create\s+table\s+users/i.test(code);
        const hasCreateTasks = /create\s+table\s+tasks/i.test(code);
        const hasReferences = /references\s+users\s*\(\s*id\s*\)/i.test(code);
        const hasOnDelete = /on\s+delete\s+cascade/i.test(code);

        if (!hasCreateUsers) return { passed: false, message: "Create the users table with id and email." };
        if (!hasCreateTasks) return { passed: false, message: "Create the tasks table." };
        if (!hasReferences || !hasOnDelete) return { passed: false, message: "Add foreign key REFERENCES users(id) ON DELETE CASCADE." };

        return {
          passed: true,
          message: "Relational schema verified! Referential integrity is permanently enforced.",
        };
      },
      hints: [
        "CREATE TABLE tasks (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,\n  title TEXT NOT NULL\n);",
      ],
      xpReward: 220,
    },
  ],

  devops: [
    {
      id: "devops_1_docker",
      realmId: "devops",
      order: 1,
      title: "The Multi-Stage Docker Vessel",
      storyIntro: "Byte prepares the launch bay: 'Deploying bloated 1GB Node.js images wastes bandwidth and exposes build tools. We must forge a lightweight multi-stage Dockerfile!'",
      conceptSummary: "Multi-stage Docker builds separate the build environment (compilation, devDependencies) from the lean production runtime, slashing image sizes and attack surfaces.",
      starterCode: `# Stage 1: Build environment
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production runtime
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
USER node
EXPOSE 3000
CMD ["node", "dist/server.js"]`,
      language: "dockerfile",
      previewType: "console",
      tasks: [
        "Create build stage AS build",
        "Compile assets with RUN npm run build",
        "Create runner stage FROM node:22-alpine",
        "Copy build artifacts with COPY --from=build",
        "Run as non-root with USER node",
      ],
      testRunner: (code: string) => {
        const hasBuildStage = /FROM\s+node:[\w.-]+\s+AS\s+build/i.test(code);
        const hasRunnerStage = /FROM\s+node:[\w.-]+(\s+AS\s+runner)?/i.test(code);
        const hasCopyFrom = /COPY\s+--from=build/i.test(code);
        const hasUserNode = /USER\s+node/i.test(code);

        if (!hasBuildStage) return { passed: false, message: "Define the first stage with AS build." };
        if (!hasCopyFrom) return { passed: false, message: "Copy compiled assets using COPY --from=build." };
        if (!hasUserNode) return { passed: false, message: "Enforce security by setting USER node." };

        return {
          passed: true,
          message: "Multi-stage vessel forged! Container image compressed to minimal production footprint.",
        };
      },
      hints: [
        "FROM node:22-alpine AS build\n...\nFROM node:22-alpine AS runner\nCOPY --from=build /app/dist ./dist\nUSER node",
      ],
      xpReward: 240,
    },
  ],
};
