# 12. Roadmap, Capstone Project and Resources

This file ties everything together: what to study in which order, the projects that prove your skills, how to prepare for interviews, and where to learn more.

**Contents:** [Roadmap](#the-roadmap) | [Weekly routine](#weekly-routine) | [Project ladder](#project-ladder) | [Capstone](#capstone-project-team-task-manager) | [Portfolio and job search](#portfolio-and-job-search) | [Interview prep](#interview-preparation) | [Resources](#resources) | [Final checklist](#final-self-assessment)

---

## The roadmap

Times assume about 10 to 15 hours per week. Go faster or slower, but keep the order.

### Phase 1: Foundations (4 to 6 weeks)

**Study:** terminal and Git basics (file 08, level 1), HTML (file 01), CSS (file 02), JavaScript levels 1 (file 03).

**Build:** personal portfolio page, a responsive landing page, a counter and a to-do app with plain JavaScript.

**Exit test:** you can build a responsive page from a screenshot, and write a small interactive app without a tutorial.

### Phase 2: Real JavaScript (4 to 6 weeks)

**Study:** JavaScript level 2 (async, modules, storage, errors), start DOM-heavy projects, testing basics (file 09, levels 1 to 2 for unit tests), algorithms level 1 (file 10).

**Build:** GitHub profile finder, weather app, a Kanban board.

**Exit test:** you can fetch data, handle loading and errors, split code into modules, and explain closures and the event loop.

### Phase 3: TypeScript (2 to 3 weeks)

**Study:** file 04, levels 1 and 2, then strict mode and Zod.

**Build:** convert your profile finder and Kanban board to strict TypeScript.

**Exit test:** zero `any`, discriminated unions for states, generics for a fetch helper.

### Phase 4: Frontend framework (6 to 8 weeks)

**Study:** file 05 (React levels 1 and 2, then Next.js basics), accessibility and performance basics.

**Build:** movie browser, a shopping cart app, a Next.js blog.

**Exit test:** you can build a multi-page, data-driven, accessible, responsive app with forms and tests.

### Phase 5: Backend and databases (6 to 8 weeks)

**Study:** file 06 (levels 1 and 2), file 07 (levels 1 and 2), security basics (file 11, part A level 1 and 2).

**Build:** Notes API with authentication and PostgreSQL, then connect it to your React frontend.

**Exit test:** you can design tables and endpoints for a new feature, validate input, protect routes, and explain how login works.

### Phase 6: Ship it (3 to 4 weeks)

**Study:** file 08 (Docker, CI/CD, deployment), file 09 (API, component and E2E tests), file 11 (hardening and performance).

**Build:** deploy the full-stack app with CI, monitoring, tests and a real domain.

**Exit test:** your app is live, tested automatically, and you can roll it back.

### Phase 7: Capstone and depth (8 to 12 weeks)

**Study:** the "Level 3" sections of the topics your capstone needs, system design (file 10), then choose a specialization.

**Build:** the capstone project below.

**Choose a direction after the capstone:**

- **Frontend specialist:** design systems, animation, performance, accessibility, testing, Next.js internals
- **Backend specialist:** distributed systems, queues, databases at scale, security, Go or another language
- **Full-stack product engineer:** end-to-end ownership, payments, analytics, experimentation
- **DevOps and platform:** Kubernetes, Terraform, observability, reliability
- **AI engineer:** LLM APIs, embeddings and vector search, RAG, evaluation, prompt and tool design

### Ongoing, every week

- One data-structures or algorithms problem per day (15 to 30 minutes)
- Read one article or documentation page deeply
- Re-do one old task from memory
- Write 5 lines about what you learned (a learning log in a Git repo)

---

## Weekly routine

| Day | Focus (2 hours on weekdays, longer on weekends) |
|-----|-----------------------------------------------|
| Mon | New concept: read, type every example |
| Tue | Do the topic's tasks without looking at the examples |
| Wed | Build a project step toward the phase goal |
| Thu | Build, then algorithm practice (30 minutes) |
| Fri | Fix, refactor, write tests for what you built |
| Sat | Longer project session, push to GitHub, deploy |
| Sun | Review: what was hard, what to redo, plan next week |

Use the **Feynman check** weekly: explain one concept in simple words, out loud or in writing. If you get stuck, that is the gap to study.

---

## Project ladder

Build in this order. Each project must be on GitHub with a README (what, why, screenshot, how to run, tech used, what you learned).

| # | Project | Skills proven |
|---|---------|---------------|
| 1 | Personal portfolio | HTML, CSS, responsive, accessibility |
| 2 | Landing page with dark mode and animations | CSS depth |
| 3 | To-do app (vanilla JS) | DOM, events, storage |
| 4 | GitHub profile finder | Async, fetch, errors, modules |
| 5 | Kanban board or expense tracker | State, drag and drop, data structures |
| 6 | Movie or recipe browser (React) | Components, routing, server state |
| 7 | Notes API with authentication | Node, Express, Zod, auth, PostgreSQL |
| 8 | Full-stack Notes app, deployed | Integration, CORS, Docker, CI/CD |
| 9 | Real-time chat or live dashboard | WebSockets, queues, caching |
| 10 | Capstone: Team Task Manager | Everything |

**Bonus project ideas** (pick what interests you):

- [ ] E-commerce store with Stripe test payments, inventory and order emails
- [ ] A link-in-bio and URL shortener platform with analytics
- [ ] A habit tracker PWA that works offline and sends reminders
- [ ] A markdown blog engine with search, tags and RSS
- [ ] A booking system (appointments, availability, conflicts, emails)
- [ ] An expense splitter for groups with debts simplification (a graph problem)
- [ ] A developer tool: CLI, VS Code extension, or an npm package with tests and docs
- [ ] An AI-powered app: chat with your notes using embeddings and a vector search (`pgvector`)

---

## Capstone project: Team Task Manager

Build one complete product that uses everything above.

### Features

- [ ] Register, login, logout, email verification, password reset
- [ ] Projects with members and roles (owner, admin, member)
- [ ] Tasks with title, description, status, priority, due date, assignee, labels and comments
- [ ] Kanban board with drag and drop and a list view with sorting, filtering, search and pagination
- [ ] Notifications (in-app via WebSockets and email via a queue)
- [ ] File attachments uploaded directly to object storage
- [ ] Activity log of changes per task
- [ ] Responsive, accessible UI with loading, empty and error states, dark mode and keyboard shortcuts
- [ ] Optional: payments for a paid plan, an audit trail, import and export as CSV

### Technical requirements

- [ ] TypeScript everywhere, strict mode, zero `any`
- [ ] React or Next.js frontend, Node and Express (or NestJS or Fastify) API, PostgreSQL with Prisma or Drizzle migrations
- [ ] Zod validation on both sides, shared types between frontend and backend
- [ ] Authentication with secure cookies or short-lived tokens, role-based permissions with ownership checks and tests proving users cannot access others' data
- [ ] Redis for caching or rate limits, and a job queue for emails and notifications
- [ ] Unit, API, component and at least three E2E tests, running in GitHub Actions
- [ ] Dockerfile and Compose for local development, deployed frontend, API and database with a real URL
- [ ] Logging, error tracking (Sentry), health checks and an uptime alert
- [ ] Security headers, rate limits, `npm audit` clean or documented, a short threat model
- [ ] Lighthouse 90 or higher on key pages
- [ ] A README with screenshots, architecture diagram, data model diagram, setup steps, API docs (OpenAPI) and a "decisions and trade-offs" section

### Capstone Architecture Blueprint

```
┌────────────────────────────────────────────────────────────────────────┐
│                        NEXT.JS EDGE FRONTEND                           │
│           (Server Components, useOptimistic, TanStack Query)           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTPS / REST / WebSockets
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     EXPRESS / NESTJS API GATEWAY                       │
│           (Rate Limiting, JWT Verification, RBAC Guards)               │
└───────┬───────────────────────────┬────────────────────────────┬───────┘
        │                           │                            │
        ▼                           ▼                            ▼
┌──────────────┐            ┌──────────────┐             ┌───────────────┐
│  POSTGRESQL  │            │ REDIS ENGINE │             │ OBJECT STORE  │
│  (Neon / RDS │            │ (BullMQ Jobs │             │ (Cloudflare R2│
│  Prisma / SQL│            │ Rate Limits) │             │ AWS S3 / MinIO│
└──────────────┘            └──────────────┘             └───────────────┘
```

#### DevQuest Campaign Combat Lore: Defeating The Null Void

In the **Capstone Realm**, cadets face the ultimate matrix abomination: *The Null Void*. This cosmic entity represents systemic cascading failure across distributed microservices, network partitions, unhandled rejection voids, and unhandled null pointer crashes.

To banish The Null Void and attain the title of **Matrix Architect**:
1. Implement **Circuit Breaker Patterns** so failing downstreams degrade gracefully with cached fallbacks instead of crashing the API.
2. Enforce strict **Schema DTO Contracts** with Zod so untrusted external input cannot corrupt internal domain entities.
3. Deploy distributed **Liveness and Readiness Probes** (`/health/readiness`) verifying DB connections and background worker health before routing client traffic.

### Build order

1. Data model and API with tests (week 1 to 2)
2. Authentication, roles and permissions (week 3)
3. Frontend: list, create, edit, board (week 4 to 6)
4. Real-time, notifications, queue (week 7)
5. Files, search, polish, accessibility (week 8)
6. Hardening, performance, monitoring, deployment, docs (week 9 to 10)

---

## Portfolio and job search

### Portfolio checklist

- [ ] A clean portfolio site with 3 to 5 best projects (not 20 tutorials)
- [ ] Each project: live link, repo, short description of the problem, your role, the tech and one hard problem you solved
- [ ] A GitHub profile README, pinned repositories, readable commit history
- [ ] A short "About" with what you are looking for
- [ ] Optional: 3 to 5 blog posts explaining things you built or learned

### Resume checklist

- [ ] One page, results first: "Reduced API p95 latency from 800 ms to 120 ms by adding indexes and caching"
- [ ] Skills grouped (languages, frontend, backend, data, tools), links to projects
- [ ] No fluff, no skill bars, no photos (unless your country expects them)

### Job search

- [ ] Learn the market: job descriptions for the roles you want, and their repeated requirements
- [ ] Apply to many, tailor the top 10, send short personal messages to engineers and recruiters
- [ ] Contribute to open source (documentation fixes, `good first issue` labels)
- [ ] Join communities (Discord, local meetups, conferences), share your projects, ask for feedback
- [ ] Consider internships, freelance gigs, volunteer projects and apprenticeships for first experience
- [ ] Track applications in a spreadsheet and review what is working weekly

---

## Interview preparation

### What to expect

1. **Recruiter screen:** your story, expectations, availability
2. **Technical screen:** coding problem or a live task (45 to 60 minutes)
3. **Take-home or pairing:** build a small feature, tests and README matter
4. **System design** (mid-level and up) and **frontend or backend deep dive**
5. **Behavioral:** teamwork, conflict, mistakes, learning

### Topics checklist

**JavaScript and TypeScript**

- [ ] Closures, `this`, prototypes, event loop, promises, async/await
- [ ] Equality and coercion, hoisting, scope, modules
- [ ] Generics, narrowing, utility types, `unknown` vs `any`

**Frontend**

- [ ] The critical rendering path, reflow vs repaint, accessibility, semantic HTML
- [ ] React: rendering, state, effects, keys, context, memoization, custom hooks, Server Components
- [ ] CSS: specificity, box model, Flexbox, Grid, responsive design, stacking context
- [ ] Performance: Core Web Vitals, code splitting, caching, images

**Backend and data**

- [ ] HTTP, REST, status codes, idempotency, authentication, sessions vs JWT, CORS
- [ ] SQL joins, indexes, transactions, N+1, normalization
- [ ] Caching, queues, rate limiting, WebSockets

**Engineering**

- [ ] Git workflow, code review, testing strategy, CI/CD, Docker
- [ ] Security: OWASP, XSS, CSRF, injection
- [ ] Big-O, arrays, hash maps, stacks, queues, trees, graphs, two pointers, sliding window, recursion, basic DP
- [ ] System design: URL shortener, chat, news feed, rate limiter

### Behavioral answers (STAR)

Prepare 6 stories using **Situation, Task, Action, Result**: a hard bug, a disagreement, a failure and what you changed, a time you learned something fast, a project you are proud of, and a time you helped a teammate.

### Practice

- [ ] 60 or more algorithm problems solved with patterns named
- [ ] 3 mock interviews with a friend or a platform (pramp, interviewing.io)
- [ ] Explain your capstone's architecture in 5 minutes without notes
- [ ] Ask good questions at the end: team practices, on-call, code review, growth, how success is measured

---

## Resources

**Reference and documentation (use these constantly)**

- MDN Web Docs: https://developer.mozilla.org (HTML, CSS, JavaScript, Web APIs)
- TypeScript Handbook: https://www.typescriptlang.org/docs
- React docs: https://react.dev
- Next.js docs: https://nextjs.org/docs
- Node.js docs: https://nodejs.org/docs
- PostgreSQL docs: https://www.postgresql.org/docs
- web.dev (performance, accessibility, best practices): https://web.dev
- OWASP: https://owasp.org

**Structured courses and tutorials**

- freeCodeCamp: https://www.freecodecamp.org
- The Odin Project: https://www.theodinproject.com
- javascript.info: https://javascript.info
- Full Stack Open (University of Helsinki): https://fullstackopen.com
- CS50 (Harvard): https://cs50.harvard.edu
- Total TypeScript (Matt Pocock) and Epic React / Epic Web (Kent C. Dodds) for deeper paid study

**Practice**

- Frontend Mentor (design-to-code challenges), CSS Battle, Flexbox Froggy, Grid Garden
- LeetCode, NeetCode (patterns roadmap), Exercism, Codewars
- PortSwigger Web Security Academy and OWASP Juice Shop (security)
- SQLBolt, pgexercises (SQL)

**Roadmaps and overviews**

- roadmap.sh: visual roadmaps for frontend, backend, DevOps and more

**Books worth reading**

- *Eloquent JavaScript* (Marijn Haverbeke), free online
- *You Don't Know JS Yet* (Kyle Simpson), free online
- *Designing Data-Intensive Applications* (Martin Kleppmann), for backend and system design depth
- *The Pragmatic Programmer*, *Clean Code* (read critically), *A Philosophy of Software Design* (Ousterhout)
- *Refactoring* (Martin Fowler)

**Communities and staying current**

- Hacker News, Reddit r/webdev, dev.to, JavaScript Weekly, Node Weekly, React Status, TLDR newsletter
- Discord servers for the frameworks you use, local meetups and conferences
- Read changelogs of your main tools, and re-check this guide every 6 months because tools change faster than fundamentals

---

## Final self-assessment

You are ready for a junior full-stack role when you can, without looking things up:

**Frontend**

- [ ] Build a responsive, accessible page from a design using semantic HTML and modern CSS
- [ ] Explain closures, `this`, the event loop and promises with examples
- [ ] Build a React app with routing, forms, validation, server state, loading and error states
- [ ] Explain what causes a re-render, and fix an unnecessary one

**Backend and data**

- [ ] Design REST endpoints, status codes and error shapes for a new feature in 10 minutes
- [ ] Design three related tables, write the joins, add the right indexes, and explain a transaction
- [ ] Explain authentication vs authorization, sessions vs JWT, and defend against XSS, CSRF, SQL injection and IDOR

**Engineering**

- [ ] Use Git confidently: branches, pull requests, conflicts, rebasing, recovering lost work
- [ ] Write unit, API, component and E2E tests, and run them in CI
- [ ] Containerize an app, deploy it with HTTPS and a domain, and roll back a bad release
- [ ] Debug an unknown problem methodically with logs, DevTools and `EXPLAIN`
- [ ] Solve a medium algorithm problem in 30 minutes and state its complexity

**Product and communication**

- [ ] Explain your capstone's architecture, trade-offs and what you would change
- [ ] Write a clear README, pull request description and bug report

When all boxes are ticked: ship the capstone, polish the portfolio, and start applying. You will keep learning on the job, and that is expected.
