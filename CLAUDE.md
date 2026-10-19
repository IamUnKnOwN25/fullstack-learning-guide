# Full-Stack Web Development Learning Guide

A comprehensive, zero-to-job-ready curriculum and reference guide covering frontend, backend, databases, DevOps, testing, CS fundamentals, security, and capstone projects.

## Project Structure

This repository is a structured documentation and curriculum codebase composed of 13 sequenced Markdown files:

- `00-README.md` — Curriculum index, methodology, prerequisites, rules, study paces, progress tracker.
- `01-html.md` to `03-javascript.md` — Web foundations (HTML5 semantics, modern CSS/Flex/Grid, vanilla JS core/DOM/async).
- `04-typescript.md` & `05-frontend-react-and-ecosystem.md` — TypeScript, React, Next.js, state management, forms, architecture.
- `06-backend-nodejs.md` & `07-databases.md` — Node.js, Express, REST/GraphQL APIs, PostgreSQL, Prisma/ORMs, Redis, NoSQL.
- `08-git-devops-deployment.md` & `09-testing-and-quality.md` — Git workflows, Linux, Docker, CI/CD, unit/integration/E2E testing.
- `10-cs-fundamentals-and-system-design.md` & `11-security-and-performance.md` — Data structures, algorithms, system design, OWASP, Core Web Vitals.
- `12-roadmap-capstone-and-resources.md` — Phased study roadmap, project ladder, capstone project spec (Team Task Manager), interview prep.

## Content & Pedagogical Conventions

When editing or adding content, adhere strictly to the established four-part format for every topic:

1. **Concept**: Plain-language definition explaining what it is and why it matters.
2. **Example**: Minimal, clean, idiomatic code snippet meant to be manually typed out and run.
3. **Task**: Actionable hands-on building exercises with Markdown checkboxes (`- [ ]`).
4. **Checkpoint**: Conceptual self-test questions to answer without looking at references.

### Topic Level Hierarchy

Every module organizes topics into three consistent levels:
- `## Level 1: Fundamentals` — Mandatory foundations required to build anything.
- `## Level 2: Intermediate` — Patterns used daily in production environments.
- `## Level 3: Advanced` — Deep concepts distinguishing mid-level from senior developers.
- Followed by `## Projects` (graded mini-projects) and `## Self-check` (readiness checklists).

## Style & Formatting Rules

- **File Naming**: Two-digit zero-padded prefix followed by kebab-case descriptor (`NN-topic-name.md`).
- **Code Blocks**: Always provide language tags for syntax highlighting (`html`, `css`, `javascript`, `typescript`, `sql`, `bash`, `dockerfile`, etc.).
- **Links**: Use relative markdown links between guide files (e.g., `[03-javascript.md](03-javascript.md)`).
- **Tone**: Direct, concise, practical, and mentor-like. Avoid fluff or copy-pasted theory.
- **Git**: Not currently initialized as a git repository. If initialized, use Conventional Commits (`feat:`, `fix:`, `docs:`) and GitHub Flow.
