# 06. Backend with Node.js

The backend receives requests from the frontend, applies rules, talks to the database and sends back responses. All examples use TypeScript on Node.js with Express, but the ideas apply to any language or framework.

**Prerequisites:** files 03 and 04. Do file 07 (databases) alongside this one.

**Contents:** [Level 1](#level-1-fundamentals) | [Level 2](#level-2-intermediate) | [Level 3](#level-3-advanced) | [Projects](#projects)

---

## Level 1: Fundamentals

### 1.1 How the web works

**Concept:** when you open a URL: the browser asks DNS for the IP address, opens a TCP connection, negotiates TLS (HTTPS), sends an HTTP **request**, and the server sends back an HTTP **response**.

**A request has:** method, URL (path and query string), headers, optional body.
**A response has:** status code, headers, optional body.

**Methods:**

- `GET`: read data (never changes anything, can be cached)
- `POST`: create something new
- `PUT`: replace a resource, `PATCH`: update part of it
- `DELETE`: remove
- `OPTIONS`, `HEAD`: used by browsers for CORS and metadata

**Status codes:**

- `2xx` success: `200` OK, `201` Created, `204` No Content
- `3xx` redirect: `301` permanent, `302/307` temporary, `304` not modified (cache)
- `4xx` client error: `400` bad input, `401` not logged in, `403` not allowed, `404` not found, `409` conflict, `422` unprocessable, `429` too many requests
- `5xx` server error: `500` bug, `502/503/504` upstream or overload

**Important headers:** `Content-Type`, `Authorization`, `Cookie`/`Set-Cookie`, `Cache-Control`, `ETag`, `Origin`, `Access-Control-Allow-Origin`.

**Task:**

- [ ] Open the Network tab, load any site, and find a GET, a POST (submit any form), a redirect and a 404
- [ ] Use `curl -i https://example.com` and read the raw response

**Checkpoint:** 401 vs 403? What does HTTPS protect against? What is idempotency and which methods are idempotent?

### 1.2 Node.js basics

```ts
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { createServer } from "node:http";
import { EventEmitter } from "node:events";
import crypto from "node:crypto";

const text = await fs.readFile(path.join(import.meta.dirname, "data.txt"), "utf8");
await fs.writeFile("out.json", JSON.stringify({ ok: true }));

console.log(process.env.NODE_ENV, process.argv, process.cwd());

createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ hello: "world" }));
}).listen(3000);

crypto.randomUUID();
crypto.createHash("sha256").update("text").digest("hex");
```

Know: the event loop, non-blocking I/O, streams (`fs.createReadStream` for big files), `process.on("SIGTERM")` for graceful shutdown, environment variables with `.env` (`node --env-file=.env`), and worker threads for CPU-heavy work.

**Task:**

- [ ] Write a script that reads a CSV, converts it to JSON and writes it to a file, using streams for a 1 GB file idea
- [ ] Build a plain `http` server with 3 routes without Express, to see what Express hides

### 1.3 Your first API with Express

```bash
npm init -y
npm install express
npm install -D typescript tsx @types/express @types/node
```

```ts
import express from "express";

const app = express();
app.use(express.json());

type Todo = { id: number; text: string; done: boolean };
let todos: Todo[] = [];
let nextId = 1;

app.get("/api/todos", (req, res) => {
  res.json(todos);
});

app.get("/api/todos/:id", (req, res) => {
  const todo = todos.find(t => t.id === Number(req.params.id));
  if (!todo) return res.status(404).json({ error: "Not found" });
  res.json(todo);
});

app.post("/api/todos", (req, res) => {
  const text = req.body?.text;
  if (typeof text !== "string" || text.trim() === "") {
    return res.status(400).json({ error: "text is required" });
  }
  const todo: Todo = { id: nextId++, text, done: false };
  todos.push(todo);
  res.status(201).json(todo);
});

app.patch("/api/todos/:id", (req, res) => {
  const todo = todos.find(t => t.id === Number(req.params.id));
  if (!todo) return res.status(404).json({ error: "Not found" });
  Object.assign(todo, req.body);
  res.json(todo);
});

app.delete("/api/todos/:id", (req, res) => {
  todos = todos.filter(t => t.id !== Number(req.params.id));
  res.status(204).end();
});

app.listen(3000, () => console.log("Listening on http://localhost:3000"));
```

**Task:**

- [ ] Run it with `npx tsx server.ts` and test every route with Thunder Client or Postman
- [ ] Connect your React to-do app to this API instead of `localStorage`

**Checkpoint:** why is data lost when the server restarts, and what will fix it?

---

## Level 2: Intermediate

### 2.1 Middleware and error handling

**Concept:** middleware functions run between the request and your route. They log, parse, authenticate, validate and catch errors.

```ts
import type { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";

app.use(helmet());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(morgan("dev"));
app.use(express.json({ limit: "1mb" }));

// Custom error class
class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

// Wrap async handlers so errors reach the error middleware
const wrap = (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);

app.get("/api/users/:id", wrap(async (req, res) => {
  const user = await findUser(Number(req.params.id));
  if (!user) throw new HttpError(404, "User not found");
  res.json(user);
}));

// 404 handler, then error handler (4 parameters, always last)
app.use((req, res) => res.status(404).json({ error: "Route not found" }));
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const status = err instanceof HttpError ? err.status : 500;
  if (status === 500) console.error(err);
  res.status(status).json({ error: status === 500 ? "Something went wrong" : err.message });
});
```

**Task:**

- [ ] Add request logging with timing, a 404 handler, a global error handler, and CORS configured for your frontend only

### 2.2 Validation

**Concept:** never trust the client. Validate every body, query and parameter on the server.

```ts
import { z } from "zod";

const CreateTodo = z.object({ text: z.string().trim().min(1).max(200) });
const ListQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  search: z.string().optional(),
});

function validate<T extends z.ZodTypeAny>(schema: T, source: "body" | "query" | "params" = "body") {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) return res.status(400).json({ errors: result.error.flatten() });
    (req as any)[source] = result.data;
    next();
  };
}

app.post("/api/todos", validate(CreateTodo), (req, res) => { /* req.body is clean */ });
```

**Task:**

- [ ] Validate all routes with Zod and return clear field errors the frontend can display

### 2.3 Project structure

```
src/
  app.ts            # builds the express app (no listen), easy to test
  server.ts         # starts listening
  config/env.ts     # validates environment variables with Zod
  routes/           # URL to controller mapping
  controllers/      # HTTP layer: parse request, send response
  services/         # business logic (no Express types here)
  repositories/     # database access
  middleware/       # auth, validation, error handler
  lib/              # db client, logger, mailer
  types/
tests/
```

**Rule:** controllers stay thin; business rules live in services so they can be tested and reused.

### 2.4 Authentication and authorization

**Concept:** authentication proves who you are. Authorization decides what you may do. Store a **hash** of the password, never the password.

```ts
import bcrypt from "bcrypt";   // or argon2
import jwt from "jsonwebtoken";

// Register
const passwordHash = await bcrypt.hash(password, 12);

// Login
const ok = await bcrypt.compare(password, user.passwordHash);
if (!ok) return res.status(401).json({ error: "Invalid credentials" });   // same message for unknown email

const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: "15m" });
res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 15 * 60 * 1000 });

// Protect routes
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies.token ?? (req.headers.authorization ?? "").replace("Bearer ", "");
  try {
    res.locals.user = jwt.verify(token, process.env.JWT_SECRET!);
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
}

// Authorize by role, and always check ownership
const requireRole = (role: string) => (req: Request, res: Response, next: NextFunction) =>
  res.locals.user.role === role ? next() : res.status(403).json({ error: "Forbidden" });
```

**Choices to understand:**

- **Sessions** (server stores session, cookie holds the id): simple and easy to revoke
- **JWT** (signed token the client holds): stateless, but hard to revoke, so keep it short-lived and use refresh tokens
- **OAuth 2.0 / OpenID Connect:** "Log in with Google or GitHub" (use libraries like Passport, Auth.js or Lucia)
- **MFA, password reset flows, email verification, account lockout**
- **RBAC** (roles) and **ABAC** (attributes and rules), and always check that a user owns the record they touch

**Task:**

- [ ] Build `POST /register`, `POST /login`, `POST /logout`, `GET /me`, make todos belong to the logged-in user, and prove user A cannot read user B's todos
- [ ] Add "Log in with GitHub" using OAuth

**Checkpoint:** why is hashing different from encrypting? Why a short-lived access token plus refresh token?

### 2.5 REST API design

**Rules:**

- Nouns not verbs: `/api/todos`, not `/api/getTodos`
- Plural collections, nested one level: `/api/users/5/todos`
- Use the right method and status code
- Consistent error shape: `{ "error": { "code": "VALIDATION", "message": "...", "details": [...] } }`
- Version when you break things: `/api/v1/...`
- Pagination, filtering, sorting through query parameters

```ts
app.get("/api/todos", (req, res) => {
  const { page, limit, search } = ListQuery.parse(req.query);
  const filtered = todos.filter(t => !search || t.text.includes(search));
  const start = (page - 1) * limit;
  res.json({ page, limit, total: filtered.length, data: filtered.slice(start, start + limit) });
});
```

**Pagination styles:** offset (`page`, `limit`, simple, slow on huge tables) and cursor (`after=<id>`, fast and stable for feeds).

**Document your API** with OpenAPI (Swagger) and serve it with Swagger UI or Scalar.

**Task:**

- [ ] Add pagination, sorting and search to a list route and describe the API with an OpenAPI file

### 2.6 File uploads, email and configuration

```ts
import multer from "multer";
const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (req, file, cb) => cb(null, file.mimetype.startsWith("image/")) });
app.post("/api/avatar", requireAuth, upload.single("avatar"), (req, res) => res.json({ size: req.file?.size }));
```

- Store files in object storage (S3, Cloudflare R2) and save only the URL in the database; use presigned URLs so browsers upload directly
- Send email with a provider (Resend, SendGrid, SES, Nodemailer) from a background job
- Validate environment variables at startup so a missing secret fails fast

```ts
const Env = z.object({ DATABASE_URL: z.string().url(), JWT_SECRET: z.string().min(32), PORT: z.coerce.number().default(3000) });
export const env = Env.parse(process.env);
```

**Task:**

- [ ] Add profile picture upload that checks type and size and stores the file in an S3-compatible bucket

### 2.7 Logging and observability basics

- Structured JSON logs with levels using **pino**; include a request id on every line
- Never log passwords, tokens or full card numbers
- Add a `/health` route (and `/ready`) for platforms to probe

#### Request Tracing with AsyncLocalStorage
Propagate request IDs, correlation tokens, and current user identity across deeply nested async functions without prop-drilling parameters through every service and repository layer:

```ts
import { AsyncLocalStorage } from "node:async_hooks";
import crypto from "node:crypto";

export const traceStorage = new AsyncLocalStorage<{ requestId: string; userId?: string }>();

// In Express middleware:
app.use((req, res, next) => {
  const requestId = (req.headers["x-request-id"] as string) || crypto.randomUUID();
  res.setHeader("X-Request-ID", requestId);
  traceStorage.run({ requestId }, () => next());
});

// In any deep database query or domain service:
function auditLog(action: string) {
  const store = traceStorage.getStore();
  logger.info({ requestId: store?.requestId, action });
}
```

---

## Level 3: Advanced

### 3.1 Caching and rate limiting

```ts
import rateLimit from "express-rate-limit";
app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true }));

// Cache-aside pattern with Redis
async function getUser(id: number) {
  const cached = await redis.get(`user:${id}`);
  if (cached) return JSON.parse(cached);

  const user = await db.user.findUnique({ where: { id } });
  await redis.set(`user:${id}`, JSON.stringify(user), { EX: 60 });
  return user;
}
```

Also: HTTP caching (`Cache-Control`, `ETag`), CDN caching, cache invalidation strategies (TTL, event-based), and the cache stampede problem.

**Task:**

- [ ] Limit login attempts, cache one slow route, and measure response time before and after

### 3.2 Background jobs and queues

**Concept:** do slow work (email, image processing, reports) outside the request so the response returns fast and failures can be retried.

```ts
import { Queue, Worker } from "bullmq";

const emailQueue = new Queue("email", { connection: { host: "localhost" } });
await emailQueue.add("welcome", { to: "a@b.com" }, { attempts: 3, backoff: { type: "exponential", delay: 1000 } });

new Worker("email", async job => sendEmail(job.data.to), { connection: { host: "localhost" } });
```

Also: scheduled jobs (cron), idempotent job design (running twice must be safe), dead-letter queues.

### 3.3 Real-time: WebSockets and Server-Sent Events

```ts
import { createServer } from "node:http";
import { Server } from "socket.io";

const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "http://localhost:5173" } });

io.use((socket, next) => verifyToken(socket.handshake.auth.token) ? next() : next(new Error("unauthorized")));
io.on("connection", socket => {
  socket.join("room-1");
  socket.on("chat", message => io.to("room-1").emit("chat", message));
});
httpServer.listen(3000);
```

Use **SSE** when only the server pushes (notifications, progress). Use **WebSockets** for two-way. Scaling WebSockets across servers needs a shared pub/sub (Redis adapter).

**Task:**

- [ ] Build a chat room with authentication, typing indicators and message history

### 3.4 GraphQL, tRPC and gRPC

- **GraphQL:** clients ask for exactly the fields they need. Learn schemas, resolvers, the N+1 problem (DataLoader), and when REST is simpler
- **tRPC:** end-to-end types between a TypeScript frontend and backend without a schema file
- **gRPC:** fast binary RPC between internal services (Protocol Buffers)
- **Webhooks:** receive events from Stripe, GitHub and others, and always verify the signature

```ts
// tRPC procedure
export const appRouter = router({
  userById: publicProcedure.input(z.number()).query(({ input }) => db.user.findUnique({ where: { id: input } })),
});
export type AppRouter = typeof appRouter;
```

**Task:**

- [ ] Rebuild one resource as a GraphQL endpoint and another with tRPC, and write which you prefer and why

### 3.5 Other frameworks and languages (awareness)

| Tool | Why look at it |
|------|----------------|
| **Fastify** | Faster than Express, built-in schema validation |
| **NestJS** | Structured, Angular-style modules and dependency injection |
| **Hono** | Tiny, runs on edge runtimes and Bun/Deno |
| **Next.js route handlers** | API inside a frontend project |
| **Django / Flask / FastAPI (Python)** | Batteries included, great for data and AI |
| **Spring Boot (Java), ASP.NET (C#)** | Enterprise standard |
| **Go, Rust** | Performance, small binaries, concurrency |
| **Bun, Deno** | Alternative runtimes with built-in tooling |

### 3.6 Architecture

- **Monolith first.** Split into services only when a clear need (team size, scaling) appears
- Layered architecture: routes, controllers, services, repositories
- **Clean/hexagonal architecture:** business logic does not depend on frameworks or databases
- Domain events, the outbox pattern, saga pattern for distributed transactions (awareness)
- **12-factor app:** config in env, stateless processes, logs to stdout, disposable processes

### 3.7 Payments, search and third-party APIs

- **Payments:** Stripe Checkout and webhooks (never store card numbers; never trust the client for the price)
- **Search:** PostgreSQL full-text first, then Meilisearch, Typesense or Elasticsearch
- **Third-party APIs:** timeouts, retries with backoff, circuit breakers, and secrets in environment variables

### 3.8 Security essentials

See file 11 for the full list. At minimum: validate input, hash passwords, parameterized queries, check ownership, HTTPS, `helmet`, strict CORS, rate limits, and `npm audit`.

#### DevQuest Campaign Combat Lore: Defeating The Event Loop Blocker

In the **Backend Realm**, cadets face *The Event Loop Blocker* (Staller of Concurrent Requests). This fiend halts Node's single-threaded event loop by running synchronous heavy CPU operations or `fs.readFileSync` in request handlers, causing all other incoming HTTP connections to stall and time out.

To vanquish the Blocker in the Boss Arena:
1. **Unblock the Main Thread:** Replace synchronous blocking I/O calls (`fs.readFileSync()`, `crypto.pbkdf2Sync()`) with their asynchronous non-blocking counterparts (`fs.promises.readFile()`, async crypto, or Worker Threads).
2. **Streaming Pipeline Shield:** Stream large file payloads with `pipeline(readStream, transform, writeStream)` rather than buffering gigabytes of binary data in memory.

---

## Projects

**Mini project: Notes API**

- [ ] Register, login (cookie or JWT) and CRUD notes that belong to the user
- [ ] Zod validation, pagination, search, central error handler
- [ ] Rate-limited login, secrets in `.env`, helmet and CORS
- [ ] PostgreSQL with Prisma (file 07)
- [ ] API tests with Supertest (file 09) and OpenAPI docs

**Challenge projects:**

- [ ] A URL shortener with click analytics, caching and rate limits
- [ ] A job queue system that sends welcome emails and weekly digests with retries
- [ ] A real-time collaborative to-do list with WebSockets
- [ ] A Stripe-powered checkout flow with webhooks, idempotency keys and order status

## Self-check

- [ ] Explain the request-response cycle from URL typed to page shown
- [ ] Explain authentication vs authorization, sessions vs JWT, and three attacks you defend against
- [ ] Design REST endpoints, status codes and error shapes for a new feature in 10 minutes
- [ ] Explain when to use a queue, a cache, WebSockets and a webhook
