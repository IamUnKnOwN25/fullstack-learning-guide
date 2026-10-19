export interface Quest {
  id: string;
  realmId: string;
  order: number;
  title: string;
  storyIntro: string;
  conceptSummary: string;
  starterCode: string;
  language: "html" | "css" | "javascript" | "typescript" | "sql";
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
};
