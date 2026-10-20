# Full-Stack Web Development Learning Guide & DevQuest: Web Matrix

A comprehensive, zero-to-job-ready curriculum (13 Markdown modules) paired with **DevQuest: The Web Matrix Chronicles**, an interactive Next.js RPG learning application covering frontend, backend, databases, DevOps, testing, CS fundamentals, security, and capstone projects.

## Tech Stack
- **Framework**: Next.js 15.1 (App Router) + React 19
- **Language**: TypeScript 5.7 (`strict: true`, path alias `@/*` -> `./src/*`)
- **Styling & UI**: Tailwind CSS 3.4, `lucide-react`, `canvas-confetti`, `clsx`, `tailwind-merge`
- **State & Audio**: Zustand 5 (`persist` middleware to `localStorage`), procedural Web Audio API (`src/lib/audio.ts`)
- **Testing**: Vitest 5 (`src/__tests__/`)

## Build, Test & Run
- **Dev server**: `npm run dev`
- **Build**: `npm run build`
- **Typecheck**: `npm run typecheck` (`tsc --noEmit`)
- **Run tests**: `npm test` (`vitest run`)
- **Full validation gate**: `npm run validate` (`tsc --noEmit && vitest run && next build`)

## Project Structure
- `README.md` — Project overview, quickstart commands, and curriculum index.
- `00-curriculum-overview.md` to `12-roadmap-capstone-and-resources.md` — 13 sequenced curriculum Markdown modules at the repo root:
  - `00-curriculum-overview.md` — Curriculum index, methodology, study paces, progress tracker.
  - `01-html-and-semantics.md` to `03-modern-javascript.md` — Web foundations (HTML5 semantics, modern CSS/Flex/Grid, vanilla JS/DOM/async).
  - `04-strict-typescript.md` & `05-frontend-react-and-ecosystem.md` — TypeScript, React, Next.js, state management, forms.
  - `06-backend-nodejs.md` & `07-databases-and-sql.md` — Node.js, Express, REST/GraphQL, PostgreSQL, Prisma/ORMs, Redis.
  - `08-git-devops-deployment.md` & `09-testing-and-quality.md` — Git, Linux, Docker, CI/CD, unit/integration/E2E testing.
  - `10-cs-fundamentals-and-system-design.md` & `11-security-and-performance.md` — DSA, system design, OWASP, Core Web Vitals.
  - `12-roadmap-capstone-and-resources.md` — Study roadmap, project ladder, capstone spec, interview prep.
- `src/app/` — Next.js App Router pages (`/`, `/map`, `/world-map`, `/curriculum`, `/quest/[realmId]/[questId]`, `/boss/[realmId]`).
- `src/components/` — Client UI components (`QuestCodingWorkspace.tsx`, `BossBattleArena.tsx`, `WorldCampaignMap.tsx`, `ConstellationWorldMap.tsx`, `CurriculumViewer.tsx`, `NavigationHud.tsx`, `AchievementsModal.tsx`, `SkillTreeModal.tsx`, `CyberCompanionByte.tsx`).
- `src/data/` — Static RPG data definitions (`realms.ts`, `quests.ts`, `bosses.ts`, `skills.ts`).
- `src/lib/` — Core state store (`gameStore.ts`), Web Audio synthesizer (`soundEngine.ts`), and class merging helpers (`utils.ts`).
- `src/__tests__/` — Vitest suites validating quests, solution runners, boss battles, and store progression (`*.test.ts`).

## Code & Architecture Conventions
- **Component Naming**: PascalCase files in `src/components/` with `"use client"` directive where client state/hooks are used.
- **Data & Lib Naming**: camelCase/kebab-case modules in `src/data/` and `src/lib/`; test files in `src/__tests__/*.test.ts`.
- **Quest Validation**: Every quest in `src/data/quests.ts` defines a synchronous `testRunner(code: string) => { passed: boolean; message: string }` alongside `starterCode` and `solutionCode` (verified by `src/__tests__/solutions.test.ts`).
- **Git Workflow**: Conventional Commits with scope (`feat(companion):`, `feat(visualizer):`, `feat(map):`, `feat(boss):`, `fix:`) on `main`.

## Curriculum Content & Pedagogical Conventions
When editing or adding curriculum Markdown content (`00-README.md` – `12-*.md`), adhere strictly to the four-part format for every topic:
1. **Concept**: Plain-language definition explaining what it is and why it matters.
2. **Example**: Minimal, clean, idiomatic code snippet meant to be manually typed out and run.
3. **Task**: Actionable hands-on building exercises with Markdown checkboxes (`- [ ]`).
4. **Checkpoint**: Conceptual self-test questions to answer without looking at references.

### Topic Level Hierarchy & Markdown Style
- Organize every module into `## Level 1: Fundamentals`, `## Level 2: Intermediate`, `## Level 3: Advanced`, followed by `## Projects` and `## Self-check`.
- **File Naming**: Two-digit zero-padded prefix followed by kebab-case descriptor (`NN-topic-name.md`).
- **Code Blocks & Links**: Always include language tags for syntax highlighting and use relative markdown links between guide files (e.g., `[03-javascript.md](03-javascript.md)`).
- **Tone**: Direct, concise, practical, and mentor-like.
