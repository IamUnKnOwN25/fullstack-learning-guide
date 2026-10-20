# Full-Stack Web Development: Complete Learning Guide

From zero to job-ready: HTML, CSS, JavaScript, TypeScript, React, Node.js, databases, DevOps, testing, security, computer science and system design. Every topic has a concept, an example, a task and a checkpoint question.

---

## 🎮 Play the Interactive Game: DevQuest (The Web Matrix Chronicles)

This repository includes a built-in interactive RPG learning game built with Next.js, TypeScript, and Tailwind CSS. Instead of just reading text, you can play through the 12 realms, solve code challenges in a dual-pane editor, see live previews, defeat Bug Monster bosses, and level up with 8-bit sound effects.

### How to play:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

- 🗺️ **World Quest Map:** Navigate through the 12 curriculum realms.
- ⚡ **Dual-Pane Terminal:** Concept briefings on the left, live code editor, browser preview, and test runner on the right.
- ⚔️ **Boss Battles:** Face off against the *Overflow Hydra*, *Callback Kraken*, and *Any-Demon* in turn-based debugging battles.
- 🛡️ **RPG Skill Tree & Badges:** Earn XP, level up, unlock perks, and collect achievements.
- 🎵 **8-Bit Web Audio:** Enjoy retro sound effects and procedural chiptunes with a mute toggle.

### Automated Verification & Testing

DevQuest includes automated unit tests covering player mechanics, quests, and boss encounters:

```bash
# Run Vitest unit tests (Store, Quests, Bosses)
npm run test

# Run full deterministic verification gate (Typecheck + Unit Tests + Static Production Build)
npm run validate
```

### 🗺️ The 12 Realms & Boss Guardians

| # | Realm | Theme | Boss Guardian | Trophy Badge |
|---|-------|-------|---------------|--------------|
| 01 | HTML5 & Semantics | Ruined Foundations | The Malformed Tag Abomination | Semantic Warden |
| 02 | CSS, Flexbox & Grid | Citadel of Styles | The Overflow Hydra | Layout Alchemist |
| 03 | Modern JavaScript | Scripting Wilds | The Callback Kraken | Async Spellcaster |
| 04 | Strict TypeScript | Sanctuary of Types | The Any-Demon | Discriminated Champion |
| 05 | React & Next.js | Reactive Archipelago | The Infinite Re-Render Fiend | Master of Pure Renders |
| 06 | Node.js Backend | Engine Bastion | The Event Loop Blocker | Non-Blocking Architect |
| 07 | Databases & SQL | Vault of Relics | The SQL Injection Behemoth | Guardian of the Schema |
| 08 | DevOps & Docker | Harbor of Containers | The Merge Conflict Chimera | DevOps Fleet Admiral |
| 09 | Testing & TDD | Proving Grounds | The Flaky Test Spectre | TDD Purist |
| 10 | CS & System Design | Spire of Algorithms | The O(N!) Goliath | Algorithmic Grandmaster |
| 11 | Web Security & Performance | Bastion of Aegis | The XSS Phantom | Aegis Sentinel |
| 12 | Full-Stack Capstone | The Matrix Core | The Null Void | Matrix Architect |


---

## How every topic is written

Each topic follows the same four-part pattern:

| Part | Meaning |
|------|---------|
| **Concept** | What it is, in plain words |
| **Example** | Small code to type out and run |
| **Task** | Something you build yourself (tick the box) |
| **Checkpoint** | A question to answer without looking |

Topics are grouped into three levels in every file:

- **Level 1, Fundamentals:** you cannot build anything without these
- **Level 2, Intermediate:** used almost every day in real jobs
- **Level 3, Advanced:** separates mid-level developers from seniors

## The files

| # | File | What it covers |
|---|------|----------------|
| 01 | [01-html-and-semantics.md](01-html-and-semantics.md) | Structure, semantics, forms, media, SEO, accessibility, web components |
| 02 | [02-css-layout-and-styling.md](02-css-layout-and-styling.md) | Box model, Flexbox, Grid, responsive design, animation, architecture, Tailwind |
| 03 | [03-modern-javascript.md](03-modern-javascript.md) | Language core, DOM, async, modules, browser APIs, patterns, workers |
| 04 | [04-strict-typescript.md](04-strict-typescript.md) | Types, generics, narrowing, utility types, advanced types, config, Zod |
| 05 | [05-frontend-react-and-ecosystem.md](05-frontend-react-and-ecosystem.md) | React, Next.js, state, forms, other frameworks, performance, PWA |
| 06 | [06-backend-nodejs.md](06-backend-nodejs.md) | HTTP, Node, Express, REST, auth, GraphQL, real-time, jobs, architecture |
| 07 | [07-databases-and-sql.md](07-databases-and-sql.md) | SQL, design, indexes, transactions, ORMs, NoSQL, Redis, scaling |
| 08 | [08-git-devops-deployment.md](08-git-devops-deployment.md) | Git, Linux, Docker, CI/CD, cloud, Kubernetes, monitoring |
| 09 | [09-testing-and-quality.md](09-testing-and-quality.md) | Unit, integration, API, component, E2E, TDD, debugging |
| 10 | [10-cs-fundamentals-and-system-design.md](10-cs-fundamentals-and-system-design.md) | Algorithms, data structures, design patterns, system design |
| 11 | [11-security-and-performance.md](11-security-and-performance.md) | OWASP, auth hardening, headers, Core Web Vitals, caching |
| 12 | [12-roadmap-capstone-and-resources.md](12-roadmap-capstone-and-resources.md) | Study order, projects, capstone, interview prep, resources |

## Setup checklist (do once)

- [ ] Install VS Code with the extensions: Prettier, ESLint, GitLens, Thunder Client
- [ ] Install Node.js (LTS) and check with `node -v` and `npm -v`
- [ ] Install Git and create a GitHub account
- [ ] Install PostgreSQL (or create a free hosted database)
- [ ] Install Docker Desktop (needed from file 08)
- [ ] Learn to open Chrome DevTools (F12): Elements, Console, Network, Performance, Lighthouse

## The rules

1. **Type the examples yourself.** Copy-paste teaches nothing.
2. **Finish the task before moving on.** Reading is not learning.
3. **Break things on purpose.** Learn what each error message looks like.
4. **Build a project at the end of every level.** Projects force topics to connect.
5. **Use AI as a tutor, not a replacement.** Try first, then ask why your attempt failed, and never submit code you cannot explain.
6. **Review weekly.** Re-do one old task from memory each week.

## Suggested pace

| Pace | Time per day | Total to job-ready |
|------|--------------|--------------------|
| Part-time | 1 to 2 hours | 12 to 18 months |
| Serious | 3 to 4 hours | 8 to 10 months |
| Full-time | 6 to 8 hours | 5 to 7 months |

## Progress tracker

Tick a file when you finish all its tasks and its mini projects.

- [ ] 01 HTML
- [ ] 02 CSS
- [ ] 03 JavaScript
- [ ] 04 TypeScript
- [ ] 05 Frontend
- [ ] 06 Backend
- [ ] 07 Databases
- [ ] 08 DevOps
- [ ] 09 Testing
- [ ] 10 CS Fundamentals
- [ ] 11 Security and Performance
- [ ] 12 Capstone project shipped
