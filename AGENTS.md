# AGENTS.md - Repository Guide & Continuous Dev Loop Protocol

Welcome to **DevQuest: The Web Matrix Chronicles** (`fullstack-learning-guide`).
This document guides automated coding agents (including Google Jules and Antigravity) to safely develop, test, and improve this repository.

---

## 1. Tech Stack & Architecture

- **Framework**: Next.js 15 (App Router, dynamic and static routing)
- **UI & Styling**: React 19, Tailwind CSS 3, Lucide React icons
- **State Management**: Zustand 5 (`src/lib/gameStore.ts`) with client persistence
- **Bundler & Virtual File System**: In-browser IDE bundler with dynamic target page resolution (`src/lib/ideBundler.ts`)
- **Testing**: Vitest 5 (`src/__tests__/*.test.ts`)
- **Type Checking**: TypeScript 5 (Strict Mode)

---

## 2. Deterministic Verification Gate

Before committing any code or creating a Pull Request, **all checks must pass with exit code 0**:

```bash
# Run the complete deterministic verification suite:
npm run validate
```

The `npm run validate` command executes:
1. `tsc --noEmit` — strict TypeScript compilation without type suppression.
2. `vitest run` — headless unit and integration test suites (87+ tests must pass).
3. `next build` — full production build verifying Next.js routes, server/client component boundaries, and SSR integrity.

Individual sub-commands:
- Run tests: `npm test`
- Run typecheck: `npm run typecheck`
- Run production build: `npm run build`

---

## 3. Continuous Dev Loop Protocol (`/continuous-dev-loop`)

When operating in continuous development mode:

### Mode A: RED MODE (Self-Healing)
- If `npm run validate` fails:
  1. Capture exact compiler, type, or test failure output.
  2. Locate root-cause file(s) and apply a surgical fix.
  3. Never weaken or delete test assertions to fake a pass.
  4. Verify that `npm run validate` returns exit code `0`.

### Mode B: GREEN MODE (Self-Improving)
- If `npm run validate` exits `0`:
  1. Identify the single highest-leverage improvement:
     - Additional unit tests for untested edge cases in `src/__tests__/`.
     - Type safety enhancements (eliminate any unsafe casts or loose types).
     - UI/UX polish, accessibility (ARIA attributes, keyboard navigation).
     - Dead code or redundant helper cleanup.
  2. Implement **ONE** isolated improvement.
  3. Run `npm run validate` to ensure 0 regressions.
  4. Update `AUTONOMOUS_PROGRESS.md` with the new cycle entry:
     ```markdown
     - **[YYYY-MM-DD HH:MM] Cycle N: <Title> (Tests: PASS)**
       - <Details of changes and tests added>
     ```
  5. Commit with conventional commit message (e.g., `test(autonomous): add edge case tests for ...` or `feat(autonomous): ...`).

---

## 4. Key Directory Structure

- `src/app/` — Next.js App Router pages (`/ide`, `/curriculum`, `/quest/[realmId]/[questId]`, `/boss/[realmId]`, `/world-map`).
- `src/components/` — UI components (`OnlineMatrixIde.tsx`, `CurriculumViewer.tsx`, `DualPaneQuestWorkspace.tsx`, etc.).
- `src/lib/` — Game state (`gameStore.ts`), IDE bundling (`ideBundler.ts`), quests & curriculum definitions.
- `src/__tests__/` — Vitest unit test suites covering state, IDE bundler, UI guards, level systems, and curriculum tasks.
- `AUTONOMOUS_PROGRESS.md` — Continuous development audit log tracking all autonomous improvement cycles.


## Autonomous Self-Learned Gotchas (Persistent Memory)

### [Learned: 2026-10-28] Web Audio Zero-Target Exponential Ramp DOMException
- **Symptom**: exponentialRampToValueAtTime throws DOMException when ramping to silence
- **Root Cause**: Web Audio specification mandates float target value must be strictly positive (> 0)
- **Mandatory Pattern**: `Guard AudioParam ramps with safeExponentialRamp that floors target value to 0.0001 or gracefully falls back to linearRampToValueAtTime for silence`
- **Anti-Pattern**: `Calling exponentialRampToValueAtTime(0, time) or unvalidated volume targets without positive clamping`
