export interface BossPhase {
  phaseNumber: number;
  phaseTitle: string;
  bossDialogue: string;
  prompt: string;
  initialCode: string;
  language: string;
  solutionKeywords: string[];
  testCondition: (code: string) => { passed: boolean; message: string };
  hint: string;
  damageToBoss: number;
  damageToPlayer: number;
}

export interface Boss {
  id: string;
  realmId: string;
  name: string;
  title: string;
  maxHp: number;
  xpReward: number;
  badge: {
    id: string;
    name: string;
    icon: string;
    description: string;
  };
  introLore: string;
  defeatQuote: string;
  phases: BossPhase[];
}

export const BOSSES: Record<string, Boss> = {
  html: {
    id: "html_boss",
    realmId: "html",
    name: "The Malformed Tag Abomination",
    title: "Lord of Broken Semantics",
    maxHp: 100,
    xpReward: 350,
    badge: {
      id: "slayer_of_divs",
      name: "Semantic Warden",
      icon: "ShieldAlert",
      description: "Purged the HTML realm of meaningless unclosed tags and nested <div> abominations.",
    },
    introLore: "A towering monstrosity composed of unclosed <p> tags, misplaced <div> wrappers, and broken form labels roars in the digital abyss!",
    defeatQuote: "My structure... has collapsed into clean, semantic perfection... Arrrgh!",
    phases: [
      {
        phaseNumber: 1,
        phaseTitle: "Strike 1: Restore the Semantic Landmark",
        bossDialogue: "Mwahaha! I wrapped your entire navigation in a <b> tag with no role!",
        prompt: "Replace the non-semantic <b> tag with a proper semantic <nav> element containing an unordered list with links to Home ('/') and About ('/about').",
        initialCode: `<!-- Fix this broken navigation -->\n<b>\n  <a href="/">Home</a>\n  <a href="/about">About</a>\n</b>`,
        language: "html",
        solutionKeywords: ["<nav>", "</nav>", "href=\"/\"", "href=\"/about\""],
        testCondition: (code: string) => {
          const hasNav = /<nav[\s\S]*?>[\s\S]*?<\/nav>/i.test(code);
          const hasHome = /href=["']\/["']/i.test(code);
          const hasAbout = /href=["']\/about["']/i.test(code);
          if (hasNav && hasHome && hasAbout) {
            return { passed: true, message: "Clean <nav> landmark established! The Abomination recoils!" };
          }
          return { passed: false, message: "Ensure you wrap the links inside a valid <nav> element with both links." };
        },
        hint: "Use <nav> around the links instead of <b> tags.",
        damageToBoss: 50,
        damageToPlayer: 25,
      },
      {
        phaseNumber: 2,
        phaseTitle: "Strike 2: Accessible Form Defense",
        bossDialogue: "You cannot touch me! My input fields have no labels and no accessibility hooks!",
        prompt: "Fix the input below so it has an associated <label> with for='user-email' and type='email' with required attribute.",
        initialCode: `<!-- Fix the inaccessible input -->\n<span>Enter Email:</span>\n<input type="text" name="email">`,
        language: "html",
        solutionKeywords: ["<label", "for=\"user-email\"", "id=\"user-email\"", "type=\"email\"", "required"],
        testCondition: (code: string) => {
          const hasLabel = /<label[^>]*for=["']user-email["']/i.test(code);
          const hasInputId = /id=["']user-email["']/i.test(code);
          const hasTypeEmail = /type=["']email["']/i.test(code);
          const hasRequired = /required/i.test(code);
          if (hasLabel && hasInputId && hasTypeEmail && hasRequired) {
            return { passed: true, message: "Accessibility barrier activated! 100% Critical Semantic Strike!" };
          }
          return { passed: false, message: "Make sure <label for='user-email'> matches <input id='user-email' type='email' required>." };
        },
        hint: "Add for='user-email' to <label>, id='user-email', type='email', and 'required' to <input>.",
        damageToBoss: 50,
        damageToPlayer: 25,
      },
    ],
  },

  css: {
    id: "css_boss",
    realmId: "css",
    name: "The Overflow Hydra",
    title: "Devourer of Viewports",
    maxHp: 100,
    xpReward: 450,
    badge: {
      id: "slayer_of_hydra",
      name: "Master of Grids & Flow",
      icon: "Palette",
      description: "Tamed horizontal scrollbars and vanquished The Overflow Hydra using Flexbox & Grid spells.",
    },
    introLore: "Multiple heads of nested 100vw fixed widths and un-responsive elements thrash about, causing chaotic horizontal scrollbars!",
    defeatQuote: "Nooo! My fixed pixel widths have been made fluid and responsive!",
    phases: [
      {
        phaseNumber: 1,
        phaseTitle: "Strike 1: Slay the Horizontal Scrollbar",
        bossDialogue: "Feel the wrath of width: 100vw + padding: 40px! Scroll sideways forever, mortal!",
        prompt: "Fix the container CSS so box-sizing is border-box and max-width is 100% or 1200px with auto horizontal margins.",
        initialCode: `.container {\n  width: 100vw;\n  padding: 40px;\n  margin-left: 50px;\n}`,
        language: "css",
        solutionKeywords: ["box-sizing", "border-box", "max-width", "margin"],
        testCondition: (code: string) => {
          const hasBoxSizing = /box-sizing\s*:\s*border-box/i.test(code);
          const hasMaxWidth = /max-width\s*:\s*(100%|1200px)/i.test(code);
          const hasAutoMargin = /margin\s*:\s*(0\s+auto|auto)/i.test(code) || /margin-inline\s*:\s*auto/i.test(code);
          if (hasBoxSizing && (hasMaxWidth || hasAutoMargin)) {
            return { passed: true, message: "Viewport restored! The Hydra's left head explodes into responsive dust!" };
          }
          return { passed: false, message: "Ensure 'box-sizing: border-box;' and 'max-width: 1200px;' with 'margin: 0 auto;'." };
        },
        hint: "Set box-sizing: border-box; max-width: 1200px; margin: 0 auto; instead of width: 100vw.",
        damageToBoss: 50,
        damageToPlayer: 25,
      },
      {
        phaseNumber: 2,
        phaseTitle: "Strike 2: Perfect Responsive Grid Blast",
        bossDialogue: "My children are hardcoded floats! You can never align them without JavaScript!",
        prompt: "Create a modern CSS grid that automatically fits items with repeat(auto-fit, minmax(250px, 1fr)) and a 1.5rem gap.",
        initialCode: `.card-grid {\n  display: block;\n  float: left;\n}`,
        language: "css",
        solutionKeywords: ["display: grid", "grid-template-columns", "auto-fit", "minmax", "gap"],
        testCondition: (code: string) => {
          const hasGrid = /display\s*:\s*grid/i.test(code);
          const hasAutoFit = /repeat\s*\(\s*auto-fit\s*,\s*minmax/i.test(code);
          const hasGap = /gap\s*:\s*/i.test(code);
          if (hasGrid && hasAutoFit && hasGap) {
            return { passed: true, message: "Ultimate Responsive Grid unleashed! The Overflow Hydra is vanquished!" };
          }
          return { passed: false, message: "Use 'display: grid;', 'grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));', and 'gap: 1.5rem;'." };
        },
        hint: "display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;",
        damageToBoss: 50,
        damageToPlayer: 25,
      },
    ],
  },

  javascript: {
    id: "js_boss",
    realmId: "javascript",
    name: "The Callback Kraken",
    title: "Terror of the Event Loop",
    maxHp: 100,
    xpReward: 550,
    badge: {
      id: "slayer_of_kraken",
      name: "Async Spellcaster",
      icon: "Sparkles",
      description: "Banished callback hell and mastered async/await & Promise orchestration.",
    },
    introLore: "Rising from the depths of the asynchronous event loop, tentacles of deeply nested pyramid callbacks threaten to crash the browser thread!",
    defeatQuote: "You escaped my pyramid of doom... with clean, readable async/await?! Impossiblllllle!",
    phases: [
      {
        phaseNumber: 1,
        phaseTitle: "Strike 1: Vanquish Callback Hell with Async/Await",
        bossDialogue: "Sink into my 6-level nested callback pyramid! You will never reach the bottom!",
        prompt: "Refactor the fetch function to use modern async/await and try/catch instead of manual chaining.",
        initialCode: `async function fetchUserData(userId) {\n  // Implement with async/await and try/catch\n  // fetch from 'https://api.example.com/users/' + userId\n  // return response.json()\n}`,
        language: "javascript",
        solutionKeywords: ["try", "catch", "await fetch", "await", ".json()"],
        testCondition: (code: string) => {
          const hasTryCatch = /try\s*\{[\s\S]*\}\s*catch/i.test(code);
          const hasAwaitFetch = /await\s+fetch\s*\(/i.test(code);
          const hasAwaitJson = /await\s+[\w.]+\.json\(\)/i.test(code);
          if (hasTryCatch && hasAwaitFetch && hasAwaitJson) {
            return { passed: true, message: "Clean async spell cast! Tentacles severed with pure asynchronous elegance!" };
          }
          return { passed: false, message: "Wrap your code in try { const res = await fetch(...); return await res.json(); } catch (err) { ... }" };
        },
        hint: "Use try { const res = await fetch(`https://api.example.com/users/${userId}`); return await res.json(); } catch(err) { throw err; }",
        damageToBoss: 50,
        damageToPlayer: 25,
      },
      {
        phaseNumber: 2,
        phaseTitle: "Strike 2: Parallel Promise Barrage",
        bossDialogue: "Sequential requests take 10 seconds! Your users will leave before the data arrives!",
        prompt: "Use Promise.all to fetch both 'users' and 'posts' concurrently, returning an array containing both results.",
        initialCode: `async function loadDashboardData() {\n  // Fetch in parallel using Promise.all\n  const usersPromise = fetch('/api/users').then(r => r.json());\n  const postsPromise = fetch('/api/posts').then(r => r.json());\n  \n  // Return the resolved tuple\n}`,
        language: "javascript",
        solutionKeywords: ["Promise.all", "await Promise.all", "usersPromise", "postsPromise"],
        testCondition: (code: string) => {
          const hasPromiseAll = /Promise\.all\s*\(\s*\[[\s\S]*?\]\s*\)/i.test(code);
          const hasAwait = /await\s+Promise\.all/i.test(code);
          if (hasPromiseAll && hasAwait) {
            return { passed: true, message: "Parallel execution spell blasts the Kraken! The Event Loop is liberated!" };
          }
          return { passed: false, message: "Return await Promise.all([usersPromise, postsPromise]);" };
        },
        hint: "return await Promise.all([usersPromise, postsPromise]);",
        damageToBoss: 50,
        damageToPlayer: 25,
      },
    ],
  },

  typescript: {
    id: "ts_boss",
    realmId: "typescript",
    name: "The Any-Demon",
    title: "Infiltrator of Unchecked Types",
    maxHp: 100,
    xpReward: 600,
    badge: {
      id: "slayer_of_any",
      name: "Discriminated Champion",
      icon: "ShieldCheck",
      description: "Banished type 'any' and enforced strict compile-time discriminated unions.",
    },
    introLore: "A dark entity shrouded in runtime undefined errors emerges, corrupting strong typing with type 'any'!",
    defeatQuote: "No! The compiler... checked every single branch! My undefined errors have nowhere to hide!",
    phases: [
      {
        phaseNumber: 1,
        phaseTitle: "Strike 1: Banish Type 'any' with Discriminated Unions",
        bossDialogue: "Why specify types when you can just declare everything as any?! Muahaha!",
        prompt: "Refactor the NetworkState type to use a discriminated union with a common 'status' discriminator: { status: 'loading' } | { status: 'success'; data: string } | { status: 'error'; error: Error }.",
        initialCode: `// Fix this dangerous 'any' type with a discriminated union\ntype NetworkState = any;`,
        language: "typescript",
        solutionKeywords: ["status: 'loading'", "status: 'success'", "status: 'error'"],
        testCondition: (code: string) => {
          const hasStatus = /status:\s*['"]loading['"]/i.test(code) &&
                            /status:\s*['"]success['"]/i.test(code) &&
                            /status:\s*['"]error['"]/i.test(code);
          const hasNoAny = !/type\s+NetworkState\s*=\s*any/i.test(code);
          if (hasStatus && hasNoAny) {
            return { passed: true, message: "Type contract enforced! The Any-Demon is staggered by compile-time safety!" };
          }
          return { passed: false, message: "Declare NetworkState as a discriminated union containing status: 'loading', 'success', and 'error'." };
        },
        hint: "type NetworkState = { status: 'loading' } | { status: 'success'; data: string } | { status: 'error'; error: Error };",
        damageToBoss: 50,
        damageToPlayer: 25,
      },
      {
        phaseNumber: 2,
        phaseTitle: "Strike 2: Forge Type-Safe Narrowing Guard",
        bossDialogue: "Even with unions, your runtime checks are blind! A rogue object will slip past your switch statements!",
        prompt: "Create a custom type predicate function `isString(val: unknown): val is string` returning `typeof val === 'string'`.",
        initialCode: `// Implement type predicate to safely narrow unknown values\nfunction isString(val: unknown): boolean {\n  // Change return type to 'val is string' and check typeof\n  return false;\n}`,
        language: "typescript",
        solutionKeywords: ["val is string", "typeof val === 'string'"],
        testCondition: (code: string) => {
          const hasPredicate = /function\s+isString\s*\(\s*val\s*:\s*unknown\s*\)\s*:\s*val\s+is\s+string/i.test(code);
          const hasTypeof = /typeof\s+val\s*===?\s*['"]string['"]/i.test(code);
          if (hasPredicate && hasTypeof) {
            return { passed: true, message: "Type narrowing ward erected! Unknown data narrowed with complete compiler certainty!" };
          }
          return { passed: false, message: "Declare function isString(val: unknown): val is string { return typeof val === 'string'; }" };
        },
        hint: "function isString(val: unknown): val is string {\n  return typeof val === 'string';\n}",
        damageToBoss: 50,
        damageToPlayer: 25,
      },
    ],
  },

  react: {
    id: "react_boss",
    realmId: "react",
    name: "The Infinite Re-Render Fiend",
    title: "Consumer of CPU Cycles",
    maxHp: 100,
    xpReward: 650,
    badge: {
      id: "slayer_of_rerenders",
      name: "Master of Pure Renders",
      icon: "Atom",
      description: "Defeated the Infinite Re-Render Fiend using stable callbacks and memoized state dependencies.",
    },
    introLore: "The browser tab freezes as thousands of cascading state updates loop relentlessly in an un-memoized effect!",
    defeatQuote: "My infinite render cycle... stabilized into pristine dependency arrays!",
    phases: [
      {
        phaseNumber: 1,
        phaseTitle: "Strike 1: Break the Infinite useEffect Loop",
        bossDialogue: "I set state inside useEffect without a dependency array! Your laptop fan will spin forever!",
        prompt: "Fix the useEffect below so it only runs once on mount by passing an empty dependency array [].",
        initialCode: `import { useEffect, useState } from "react";\n\nfunction Tracker() {\n  const [data, setData] = useState(null);\n  // Fix this infinite render loop!\n  useEffect(() => {\n    fetchData().then(d => setData(d));\n  });\n}`,
        language: "typescript",
        solutionKeywords: ["useEffect", "[]"],
        testCondition: (code: string) => {
          const hasEmptyDeps = /useEffect\s*\([\s\S]*?,\s*\[\s*\]\s*\)/i.test(code);
          if (hasEmptyDeps) {
            return { passed: true, message: "Render cycle stabilized! CPU usage plummets from 100% to 0%!" };
          }
          return { passed: false, message: "Add an empty dependency array [] as the second argument to useEffect." };
        },
        hint: "useEffect(() => { ... }, []);",
        damageToBoss: 50,
        damageToPlayer: 25,
      },
      {
        phaseNumber: 2,
        phaseTitle: "Strike 2: Slay Unnecessary Re-Renders with useCallback",
        bossDialogue: "Every time parent state updates, child components recreate inline handlers and re-render the whole subtree! Meltdown!",
        prompt: "Wrap the handleClick function with useCallback(() => { ... }, []) to preserve reference identity across renders.",
        initialCode: `import { useCallback } from "react";\n\nfunction ParentComponent() {\n  // Wrap with useCallback to prevent recreating on every render\n  const handleClick = () => {\n    console.log("Button clicked!");\n  };\n}`,
        language: "typescript",
        solutionKeywords: ["useCallback", "[]"],
        testCondition: (code: string) => {
          const hasUseCallback = /const\s+handleClick\s*=\s*useCallback\s*\(\s*\(\)\s*=>\s*\{[\s\S]*?\}\s*,\s*\[\s*\]\s*\)/i.test(code);
          if (hasUseCallback) {
            return { passed: true, message: "Callback memoized! Component tree renders only when relevant props mutate!" };
          }
          return { passed: false, message: "Wrap with const handleClick = useCallback(() => { console.log('Button clicked!'); }, []);" };
        },
        hint: "const handleClick = useCallback(() => {\n  console.log('Button clicked!');\n}, []);",
        damageToBoss: 50,
        damageToPlayer: 25,
      },
    ],
  },

  backend: {
    id: "backend_boss",
    realmId: "backend",
    name: "The Event Loop Blocker",
    title: "Choker of Server Threads",
    maxHp: 100,
    xpReward: 700,
    badge: {
      id: "slayer_of_blocker",
      name: "Non-Blocking Architect",
      icon: "Server",
      description: "Protected Node.js single-threaded event loop from synchronous CPU-blocking stalls.",
    },
    introLore: "The server stops responding to incoming HTTP health checks because a synchronous while(true) loop has seized the event loop!",
    defeatQuote: "You offloaded the heavy work to worker threads and asynchronous timers... Gasp!",
    phases: [
      {
        phaseNumber: 1,
        phaseTitle: "Strike 1: Liberate the Thread with Async Non-Blocking APIs",
        bossDialogue: "I use fs.readFileSync in the middle of request handlers! Every client must wait in line!",
        prompt: "Replace the blocking fs.readFileSync call with asynchronous fs.promises.readFile and await.",
        initialCode: `// Replace sync file read with async/await\nasync function readConfigFile(path: string) {\n  return fs.readFileSync(path, 'utf-8');\n}`,
        language: "typescript",
        solutionKeywords: ["await", "fs.promises.readFile"],
        testCondition: (code: string) => {
          const hasAsync = /await\s+(fs\.promises\.readFile|readFile)/i.test(code);
          const hasNoSync = !/readFileSync/i.test(code);
          if (hasAsync && hasNoSync) {
            return { passed: true, message: "Asynchronous stream restored! Node.js processes 10,000 req/sec concurrently!" };
          }
          return { passed: false, message: "Use 'await fs.promises.readFile(path, 'utf-8')' instead of readFileSync." };
        },
        hint: "return await fs.promises.readFile(path, 'utf-8');",
        damageToBoss: 50,
        damageToPlayer: 25,
      },
      {
        phaseNumber: 2,
        phaseTitle: "Strike 2: Enforce Centralized Express Error Handling",
        bossDialogue: "Unhandled promise rejections crash the entire Node process! One bad request will take down your server cluster!",
        prompt: "Implement an Express 4-parameter error handler (err, req, res, next) returning status 500 and { error: err.message }.",
        initialCode: `// Implement Express error handling middleware with 4 parameters: (err, req, res, next)\nfunction errorHandler(err: any, req: any, res: any, next: any) {\n  // TODO: Send 500 status code and JSON object containing error message\n}`,
        language: "typescript",
        solutionKeywords: ["err", "req", "res", "next", "status(500)", "json"],
        testCondition: (code: string) => {
          const has4Params = /function\s+errorHandler\s*\(\s*err[\s\S]*?,\s*req[\s\S]*?,\s*res[\s\S]*?,\s*next[\s\S]*?\)/i.test(code);
          const hasStatus500 = /res\.status\s*\(\s*500\s*\)\.json\s*\(\s*\{[\s\S]*?error/i.test(code);
          if (has4Params && hasStatus500) {
            return { passed: true, message: "Error boundary established! Uncaught exceptions caught cleanly without crashing Node." };
          }
          return { passed: false, message: "Implement function errorHandler(err, req, res, next) { res.status(500).json({ error: err.message }); }" };
        },
        hint: "function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {\n  res.status(500).json({ error: err.message });\n}",
        damageToBoss: 50,
        damageToPlayer: 25,
      },
    ],
  },

  databases: {
    id: "db_boss",
    realmId: "databases",
    name: "The SQL Injection Behemoth",
    title: "Destroyer of Relational Tables",
    maxHp: 100,
    xpReward: 750,
    badge: {
      id: "slayer_of_injection",
      name: "Guardian of the Schema",
      icon: "Database",
      description: "Eradicated SQL injection vulnerabilities using parameterized prepared statements.",
    },
    introLore: "A monstrous entity built from concatenated string queries: `SELECT * FROM users WHERE email = '' OR '1'='1'`!",
    defeatQuote: "Prepared statements?! My injection payloads were parsed as mere string literals!",
    phases: [
      {
        phaseNumber: 1,
        phaseTitle: "Strike 1: Cast the Parameterized Query Barrier",
        bossDialogue: "Concatenate my input directly into your SQL string! Let me DROP all your tables!",
        prompt: "Fix the query to use parameterized query syntax ($1) instead of vulnerable template string concatenation.",
        initialCode: `// Vulnerable to SQL injection:\nconst query = \`SELECT * FROM users WHERE email = '\${userInput}'\`;\n// Fix using parameterized query: text and values [$1]`,
        language: "typescript",
        solutionKeywords: ["$1", "values"],
        testCondition: (code: string) => {
          const hasParam = /\$1/.test(code);
          const hasNoDirectInterpolation = !/WHERE\s+email\s*=\s*['"]\$\{userInput\}['"]/i.test(code);
          if (hasParam && hasNoDirectInterpolation) {
            return { passed: true, message: "Parameterized query locked in! The Injection Behemoth dissolves into inert parameters!" };
          }
          return { passed: false, message: "Use parameterized placeholder $1 and pass userInput in values: [userInput]." };
        },
        hint: "const query = { text: 'SELECT * FROM users WHERE email = $1', values: [userInput] };",
        damageToBoss: 50,
        damageToPlayer: 25,
      },
      {
        phaseNumber: 2,
        phaseTitle: "Strike 2: Enforce Atomicity with ACID Transactions",
        bossDialogue: "Money was deducted from Account A, but the server crashed before Account B received it! Your ledger is ruined!",
        prompt: "Wrap multiple database operations inside a BEGIN and COMMIT transaction block, adding ROLLBACK in case of failure.",
        initialCode: `async function transferFunds(client: any, fromId: string, toId: string, amount: number) {\n  // Execute 'BEGIN'\n  // Update balances\n  // Execute 'COMMIT'\n  // On error execute 'ROLLBACK'\n}`,
        language: "typescript",
        solutionKeywords: ["BEGIN", "COMMIT", "ROLLBACK"],
        testCondition: (code: string) => {
          const hasBegin = /client\.query\s*\(\s*['"]BEGIN['"]\s*\)/i.test(code);
          const hasCommit = /client\.query\s*\(\s*['"]COMMIT['"]\s*\)/i.test(code);
          const hasRollback = /client\.query\s*\(\s*['"]ROLLBACK['"]\s*\)/i.test(code);
          if (hasBegin && hasCommit && hasRollback) {
            return { passed: true, message: "ACID transaction sealed! Data consistency is mathematically guaranteed." };
          }
          return { passed: false, message: "Call client.query('BEGIN'), client.query('COMMIT'), and client.query('ROLLBACK') in a try/catch block." };
        },
        hint: "try {\n  await client.query('BEGIN');\n  // ...\n  await client.query('COMMIT');\n} catch (err) {\n  await client.query('ROLLBACK');\n  throw err;\n}",
        damageToBoss: 50,
        damageToPlayer: 25,
      },
    ],
  },

  devops: {
    id: "devops_boss",
    realmId: "devops",
    name: "The Merge Conflict Chimera",
    title: "Blocker of CI/CD Pipelines",
    maxHp: 100,
    xpReward: 800,
    badge: {
      id: "slayer_of_conflict",
      name: "DevOps Fleet Admiral",
      icon: "Cpu",
      description: "Resolved intractable Git merge conflicts and automated container deployment pipelines.",
    },
    introLore: "A grotesque chimera of `<<<<<<< HEAD`, `=======`, and `>>>>>>> branch` blocks the deployment gateway!",
    defeatQuote: "Clean linear history... interactive rebase passed... Deploying to production!",
    phases: [
      {
        phaseNumber: 1,
        phaseTitle: "Strike 1: Resolve the Merge Conflict",
        bossDialogue: "Resolve both conflicting sides into one unified feature or suffer failed builds!",
        prompt: "Clean up the merge conflict markers (<<<<<<<, =======, >>>>>>>) and combine both features properly.",
        initialCode: `<<<<<<< HEAD\nconst port = process.env.PORT || 3000;\n=======\nconst port = process.env.PORT || 8080;\nconst host = "0.0.0.0";\n>>>>>>> feature/deployment`,
        language: "typescript",
        solutionKeywords: ["const port", "const host"],
        testCondition: (code: string) => {
          const hasNoMarkers = !/<{7}|={7}|>{7}/.test(code);
          const hasPortAndHost = /const\s+port/i.test(code) && /const\s+host/i.test(code);
          if (hasNoMarkers && hasPortAndHost) {
            return { passed: true, message: "Conflict resolved cleanly! Automated CI/CD pipeline turns emerald green!" };
          }
          return { passed: false, message: "Remove all conflict markers (<<<<, ====, >>>>) and preserve both port and host." };
        },
        hint: "const port = process.env.PORT || 3000;\nconst host = '0.0.0.0';",
        damageToBoss: 50,
        damageToPlayer: 25,
      },
      {
        phaseNumber: 2,
        phaseTitle: "Strike 2: Container Healthcheck Sentinel",
        bossDialogue: "Your containers start, but the web service crashes silently 3 seconds later! The load balancer routes traffic to dead pods!",
        prompt: "Add a Docker HEALTHCHECK instruction using curl to ping http://localhost:3000/api/health.",
        initialCode: `FROM node:22-alpine\nWORKDIR /app\nCOPY . .\n# TODO: Add container HEALTHCHECK pinging http://localhost:3000/api/health\nCMD ["node", "server.js"]`,
        language: "dockerfile",
        solutionKeywords: ["HEALTHCHECK", "CMD curl -f http://localhost:3000/api/health"],
        testCondition: (code: string) => {
          const hasHealthcheck = /^[^#\n\r]*HEALTHCHECK[\s\S]+?CMD\s+curl\s+-f\s+http:\/\/localhost:3000\/api\/health/im.test(code);
          if (hasHealthcheck) {
            return { passed: true, message: "Healthcheck sentinel deployed! Unhealthy containers are automatically recycled." };
          }
          return { passed: false, message: "Add: HEALTHCHECK --interval=30s CMD curl -f http://localhost:3000/api/health || exit 1" };
        },
        hint: "HEALTHCHECK --interval=30s CMD curl -f http://localhost:3000/api/health || exit 1",
        damageToBoss: 50,
        damageToPlayer: 25,
      },
    ],
  },

  testing: {
    id: "testing_boss",
    realmId: "testing",
    name: "The Flaky Test Spectre",
    title: "Haunter of CI Runners",
    maxHp: 100,
    xpReward: 850,
    badge: {
      id: "slayer_of_flakiness",
      name: "TDD Purist",
      icon: "CheckCircle",
      description: "Exorcised asynchronous timing race conditions with deterministic mock clocks and awaits.",
    },
    introLore: "A ghastly apparition that causes test suites to pass locally but randomly fail on remote CI runners!",
    defeatQuote: "No more race conditions... every promise is awaited... I am banished!",
    phases: [
      {
        phaseNumber: 1,
        phaseTitle: "Strike 1: Exorcise the Un-Awaited Promise",
        bossDialogue: "Your assertions fire before the asynchronous database write finishes! Flaky tests forever!",
        prompt: "Make the test function async and await the async service call before running expect assertions.",
        initialCode: `// Fix this flaky test\nit("creates user successfully", () => {\n  createUser({ name: "Alex" });\n  expect(getUserCount()).toBe(1);\n});`,
        language: "typescript",
        solutionKeywords: ["async", "await"],
        testCondition: (code: string) => {
          const hasAsync = /it\s*\(\s*['"][^'"]+['"]\s*,\s*async/i.test(code);
          const hasAwait = /await\s+createUser/i.test(code);
          if (hasAsync && hasAwait) {
            return { passed: true, message: "Deterministic execution achieved! The Flaky Spectre dissolves into passing green ticks!" };
          }
          return { passed: false, message: "Make the callback async: it('...', async () => { await createUser(...); expect(...); });" };
        },
        hint: "it('creates user successfully', async () => {\n  await createUser({ name: 'Alex' });\n  expect(getUserCount()).toBe(1);\n});",
        damageToBoss: 50,
        damageToPlayer: 25,
      },
      {
        phaseNumber: 2,
        phaseTitle: "Strike 2: Tame Asynchronous DOM State with waitFor",
        bossDialogue: "The modal takes 200ms to animate into the DOM! Your assertions run immediately and fail every time!",
        prompt: "Use await waitFor(() => { expect(screen.getByText('Saved')).toBeInTheDocument(); }); to wait for asynchronous UI changes.",
        initialCode: `import { waitFor, screen, expect, it } from "@testing-library/react";\n\nit("shows success toast after save", async () => {\n  triggerSave();\n  // TODO: Wrap the expect assertion in an asynchronous waitFor block\n  expect(screen.getByText("Saved")).toBeInTheDocument();\n});`,
        language: "typescript",
        solutionKeywords: ["await waitFor", "expect(screen.getByText('Saved'))"],
        testCondition: (code: string) => {
          const hasWaitFor = /await\s+waitFor\s*\(\s*\(\)\s*=>\s*\{[\s\S]*?expect\s*\(\s*screen\.getByText\s*\(\s*['"]Saved['"]\s*\)/i.test(code);
          if (hasWaitFor) {
            return { passed: true, message: "Asynchronous UI mutation observed! DOM flakiness banished permanently." };
          }
          return { passed: false, message: "Wrap expect with await waitFor(() => { expect(screen.getByText('Saved')).toBeInTheDocument(); });" };
        },
        hint: "await waitFor(() => {\n  expect(screen.getByText('Saved')).toBeInTheDocument();\n});",
        damageToBoss: 50,
        damageToPlayer: 25,
      },
    ],
  },

  cs: {
    id: "cs_boss",
    realmId: "cs",
    name: "The O(N!) Goliath",
    title: "Titan of Combinatorial Explosion",
    maxHp: 100,
    xpReward: 900,
    badge: {
      id: "slayer_of_goliath",
      name: "Algorithmic Grandmaster",
      icon: "Network",
      description: "Tamed factorial algorithmic complexity with dynamic programming and memoization.",
    },
    introLore: "A monolithic beast with billions of redundant recursive branches devouring available heap memory!",
    defeatQuote: "Memoization cache... reduced my operations from billions to O(N)... Impossible!",
    phases: [
      {
        phaseNumber: 1,
        phaseTitle: "Strike 1: Tame Exponential Recursion with Memoization",
        bossDialogue: "Calculating fibonacci(50) naively takes 2^50 operations! Your CPU will melt before completing!",
        prompt: "Add a memoization cache map to fibonacci so repeated subproblems return in O(1) time.",
        initialCode: `const memo = new Map<number, number>();\n\nfunction fib(n: number): number {\n  if (n <= 1) return n;\n  // Check if memo has n; if so, return it\n  // Otherwise calculate, store in memo, and return\n}`,
        language: "typescript",
        solutionKeywords: ["memo.has", "memo.get", "memo.set"],
        testCondition: (code: string) => {
          const hasGet = /memo\.(has|get)/i.test(code);
          const hasSet = /memo\.set/i.test(code);
          if (hasGet && hasSet) {
            return { passed: true, message: "Dynamic programming strike landed! Exponential branch pruned to linear O(N) perfection!" };
          }
          return { passed: false, message: "Check memo.has(n) ? memo.get(n) : calculate, memo.set(n, val), return val." };
        },
        hint: "if (memo.has(n)) return memo.get(n)!;\nconst res = fib(n - 1) + fib(n - 2);\nmemo.set(n, res);\nreturn res;",
        damageToBoss: 50,
        damageToPlayer: 25,
      },
      {
        phaseNumber: 2,
        phaseTitle: "Strike 2: Level-Order Breadth-First Search (BFS)",
        bossDialogue: "Traversing this massive dependency graph with deep recursion blows the call stack with Maximum call stack size exceeded!",
        prompt: "Use an iterative BFS queue (const queue = [root]; while (queue.length > 0) ...) to traverse nodes level by level without blowing the stack.",
        initialCode: `interface TreeNode { val: number; left?: TreeNode; right?: TreeNode; }\n\nfunction levelOrder(root: TreeNode | undefined): number[] {\n  if (!root) return [];\n  const result: number[] = [];\n  // TODO: Initialize const queue = [root]\n  // TODO: while (queue.length > 0) shift current, push val to result, push children\n  return result;\n}`,
        language: "typescript",
        solutionKeywords: ["queue = [root]", "queue.shift()", "while (queue.length > 0)"],
        testCondition: (code: string) => {
          const hasQueue = /const\s+queue\s*=\s*\[\s*root\s*\]/i.test(code);
          const hasShift = /queue\.shift\s*\(\s*\)/i.test(code);
          const hasWhile = /while\s*\(\s*queue\.length\s*>\s*0\s*\)/i.test(code);
          if (hasQueue && hasShift && hasWhile) {
            return { passed: true, message: "BFS queue traversal complete! Memory bounded and stack overflow averted!" };
          }
          return { passed: false, message: "Initialize const queue = [root]; while (queue.length > 0) { const curr = queue.shift()!; ... }" };
        },
        hint: "const queue = [root];\nwhile (queue.length > 0) {\n  const curr = queue.shift()!;\n  result.push(curr.val);\n  if (curr.left) queue.push(curr.left);\n  if (curr.right) queue.push(curr.right);\n}",
        damageToBoss: 50,
        damageToPlayer: 25,
      },
    ],
  },

  security: {
    id: "security_boss",
    realmId: "security",
    name: "The XSS Phantom",
    title: "Shadow of Malicious Scripts",
    maxHp: 100,
    xpReward: 950,
    badge: {
      id: "slayer_of_xss",
      name: "Aegis Sentinel",
      icon: "ShieldAlert",
      description: "Secured web applications against Cross-Site Scripting with Content-Security-Policy headers.",
    },
    introLore: "A shadowy spectre that lurks inside innerHTML injections, attempting to exfiltrate session cookies!",
    defeatQuote: "Content-Security-Policy: default-src 'self'... My injected script refused to execute!",
    phases: [
      {
        phaseNumber: 1,
        phaseTitle: "Strike 1: Enforce Strict Content-Security-Policy",
        bossDialogue: "I can execute inline scripts from anywhere on the internet! You cannot stop eval()!",
        prompt: "Construct a CSP header string restricting default-src to 'self' and script-src to 'self'.",
        initialCode: `// Configure strict CSP header value\nconst cspHeader = "default-src *; script-src 'unsafe-inline' *;"; // Replace dangerous wildcard with 'self'`,
        language: "typescript",
        solutionKeywords: ["default-src 'self'", "script-src 'self'"],
        testCondition: (code: string) => {
          const hasDefaultSrc = /default-src\s+['"]self['"]/i.test(code);
          const hasScriptSrc = /script-src\s+['"]self['"]/i.test(code);
          if (hasDefaultSrc && hasScriptSrc) {
            return { passed: true, message: "Content Security Policy erected! Inline malicious scripts are blocked by the browser engine!" };
          }
          return { passed: false, message: "Ensure default-src 'self' and script-src 'self' are declared." };
        },
        hint: "const cspHeader = \"default-src 'self'; script-src 'self';\";",
        damageToBoss: 50,
        damageToPlayer: 25,
      },
      {
        phaseNumber: 2,
        phaseTitle: "Strike 2: Cross-Origin Resource Sharing (CORS) Whitelist",
        bossDialogue: "Any random rogue domain can issue credentialed fetch requests to your API! Origin header spoofing will bleed your session data!",
        prompt: "Configure CORS options to only allow origin 'https://app.devquest.io' and set credentials to true.",
        initialCode: `// Configure secure CORS options\nexport const corsOptions = {\n  origin: "*", // Dangerous! Fix to specific origin 'https://app.devquest.io'\n  credentials: false, // Fix to true\n};`,
        language: "typescript",
        solutionKeywords: ["https://app.devquest.io", "credentials: true"],
        testCondition: (code: string) => {
          const hasOrigin = /origin\s*:\s*['"]https:\/\/app\.devquest\.io['"]/i.test(code);
          const hasCreds = /credentials\s*:\s*true/i.test(code);
          if (hasOrigin && hasCreds) {
            return { passed: true, message: "CORS perimeter locked down! Unauthorized origins rejected at the HTTP gateway!" };
          }
          return { passed: false, message: "Set origin to 'https://app.devquest.io' and credentials to true." };
        },
        hint: "export const corsOptions = {\n  origin: 'https://app.devquest.io',\n  credentials: true,\n};",
        damageToBoss: 50,
        damageToPlayer: 25,
      },
    ],
  },

  capstone: {
    id: "final_boss",
    realmId: "capstone",
    name: "The Null Void",
    title: "Source of the Web Matrix Corruption",
    maxHp: 150,
    xpReward: 1500,
    badge: {
      id: "master_of_the_matrix",
      name: "Matrix Architect",
      icon: "Trophy",
      description: "Banished The Null Void and completed the Full-Stack Web Development Capstone Odyssey.",
    },
    introLore: "The ultimate void of unhandled rejections, race conditions, and corrupted architectures gathers into a towering cosmic anomaly!",
    defeatQuote: "Full-stack mastery... from HTML structure to distributed production systems... The Web Matrix is whole once more!",
    phases: [
      {
        phaseNumber: 1,
        phaseTitle: "Phase 1: Assemble the Production Fullstack Engine",
        bossDialogue: "You have conquered individual realms, but can your architecture withstand the totality of production scale?!",
        prompt: "Implement an end-to-end healthcheck handler that queries the database, checks cache readiness, and returns status: 'operational'.",
        initialCode: `async function systemHealthCheck(db: { ping: () => Promise<boolean> }, redis: { ping: () => Promise<boolean> }) {\n  // Await both db.ping() and redis.ping() concurrently\n  // Return { status: 'operational', timestamp: Date.now() }\n}`,
        language: "typescript",
        solutionKeywords: ["Promise.all", "db.ping", "redis.ping", "status: 'operational'"],
        testCondition: (code: string) => {
          const hasPromiseAll = /Promise\.all/i.test(code);
          const hasPings = /db\.ping/i.test(code) && /redis\.ping/i.test(code);
          const hasOperational = /status:\s*['"]operational['"]/i.test(code);
          if (hasPromiseAll && hasPings && hasOperational) {
            return { passed: true, message: "Production engine online! The Null Void shatters under the weight of flawless fullstack harmony!" };
          }
          return { passed: false, message: "Await Promise.all([db.ping(), redis.ping()]) and return { status: 'operational', timestamp: Date.now() }." };
        },
        hint: "await Promise.all([db.ping(), redis.ping()]);\nreturn { status: 'operational', timestamp: Date.now() };",
        damageToBoss: 75,
        damageToPlayer: 35,
      },
      {
        phaseNumber: 2,
        phaseTitle: "Phase 2: Resilient Distributed Retry with Exponential Backoff",
        bossDialogue: "Network partitions! Upstream microservices will drop 5% of requests! Your users will see blank 500 error screens!",
        prompt: "Implement retry logic with exponential backoff: compute delay with Math.pow(2, attempt), catch errors, and retry.",
        initialCode: `// Implement retry with exponential backoff\nasync function retryWithBackoff<T>(\n  fn: () => Promise<T>,\n  maxRetries: number = 3,\n  baseDelay: number = 100\n): Promise<T> {\n  // TODO: Loop through attempts up to maxRetries\n  // TODO: Wrap fn() in try/catch and delay retries exponentially: baseDelay * 2^attempt\n  return fn();\n}`,
        language: "typescript",
        solutionKeywords: ["Math.pow", "catch", "attempt"],
        testCondition: (code: string) => {
          const hasPow = /Math\.pow\s*\(\s*2\s*,\s*attempt\s*\)/i.test(code) || /2\s*\*\*\s*attempt/i.test(code);
          const hasCatch = /catch/i.test(code);
          if (hasPow && hasCatch) {
            return { passed: true, message: "Distributed resiliency achieved! Transient failures swallowed and resolved in microseconds!" };
          }
          return { passed: false, message: "Implement retry loop with catch handler calculating delay using Math.pow(2, attempt)." };
        },
        hint: "for (let attempt = 0; attempt < maxRetries; attempt++) {\n  try { return await fn(); }\n  catch (err) { if (attempt === maxRetries - 1) throw err; await sleep(baseDelay * Math.pow(2, attempt)); }\n}",
        damageToBoss: 75,
        damageToPlayer: 40,
      },
    ],
  },
};
