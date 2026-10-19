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
};
