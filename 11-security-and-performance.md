# 11. Security and Performance

Security and speed are not extras at the end. Build them in from the first commit. This file gathers what you need across the whole stack.

**Prerequisites:** files 03, 05, 06 and 07.

**Contents:** [Part A: Security](#part-a-web-security) | [Part B: Performance](#part-b-web-performance) | [Projects](#projects)

---

# Part A: Web Security

## Level 1: Fundamentals

### A1.1 The mindset

- **Never trust input.** Anything from the browser, URL, headers, files, cookies and third-party APIs can be hostile
- **Defense in depth:** several layers, so one mistake is not a disaster
- **Least privilege:** give each user, service and database account only what it needs
- **Secure by default,** fail closed, and keep it simple (complexity hides bugs)
- **Security is checked on the server.** Hiding a button is not authorization

### A1.2 The basics you must always do

- [ ] Use HTTPS everywhere and redirect HTTP to it
- [ ] Hash passwords with **argon2** or **bcrypt**, never store or log plain passwords
- [ ] Use parameterized queries or an ORM, never string-built SQL
- [ ] Validate input on the server with a schema (Zod)
- [ ] Escape output, never insert user HTML into the page
- [ ] Keep secrets in environment variables or a secrets manager, never in Git
- [ ] Keep dependencies updated and run `npm audit`
- [ ] Check ownership and role on every protected request

**Checkpoint:** why is hiding the "Delete" button from non-admins not a security measure?

---

## Level 2: Intermediate

### A2.1 OWASP Top 10: what they are and how to defend

**1. Broken access control** (the number one problem)

```ts
// BAD: any logged-in user can read any note
app.get("/api/notes/:id", requireAuth, async (req, res) => res.json(await db.note.findUnique({ where: { id: +req.params.id } })));

// GOOD: scope every query to the current user
app.get("/api/notes/:id", requireAuth, async (req, res) => {
  const note = await db.note.findFirst({ where: { id: +req.params.id, userId: res.locals.user.sub } });
  if (!note) return res.status(404).json({ error: "Not found" });
  res.json(note);
});
```

This flaw is called IDOR (insecure direct object reference). Test by logging in as user A and requesting user B's ids.

**2. Injection (SQL, NoSQL, command)**

```ts
// BAD
await pool.query(`SELECT * FROM users WHERE email = '${email}'`);   // email = ' OR '1'='1
// GOOD
await pool.query("SELECT * FROM users WHERE email = $1", [email]);
```

Never pass user input to `exec`, `eval` or shell commands. If you must run a command, use an argument array (`execFile`) and an allow-list.

**3. Cross-site scripting (XSS)**

An attacker gets their JavaScript to run on your page and steals sessions or acts as the user.

```tsx
// React escapes by default. Danger zones:
<div dangerouslySetInnerHTML={{ __html: userHtml }} />   // sanitize with DOMPurify first
element.innerHTML = userText;                            // use textContent
<a href={userUrl}>link</a>                               // validate: block javascript: URLs
```

Defenses: output encoding, sanitize any HTML you must allow (DOMPurify), a strict **Content Security Policy**, `HttpOnly` cookies so scripts cannot read them.

**4. Cross-site request forgery (CSRF)**

A malicious site makes the victim's browser send a request to your site with their cookies.

Defenses: `SameSite=Lax` or `Strict` cookies, CSRF tokens for cookie-based sessions, check the `Origin` header, require custom headers or JSON content type for APIs. Bearer tokens in headers are not sent automatically, so they are not CSRF-prone (but are exposed to XSS if stored in `localStorage`).

**5. Authentication failures**

- Rate limit and lock out repeated login attempts, same error for wrong email and wrong password
- Strong password rules (length over complexity, check against breached passwords), MFA
- Short-lived tokens, rotate refresh tokens, invalidate sessions on logout and password change
- Secure password reset: single-use, expiring tokens sent by email, never reveal if an email exists

**6. Security misconfiguration**

- Remove debug modes, default credentials and stack traces in production
- Set security headers with `helmet`
- Lock down CORS to your real origins (never `*` with credentials)
- Close unused ports, do not expose databases to the internet

**7. Vulnerable and outdated components**

Run `npm audit`, enable Dependabot or Renovate, use lock files, review new dependencies (popularity, maintenance, install scripts), and watch for typosquatting packages.

**8. Server-side request forgery (SSRF)**

If your server fetches a user-supplied URL, an attacker may point it at internal services (`http://169.254.169.254/` cloud metadata). Allow-list hosts, block private IP ranges, and do not follow redirects blindly.

**9. Logging and monitoring failures**

Log logins, failures, permission denials and admin actions with a request id. Alert on spikes. Do not log secrets or personal data.

**10. Insecure design and data exposure**

Return only needed fields (never send `passwordHash` in a response), threat-model new features, encrypt sensitive data at rest, and collect less personal data.

### A2.2 Security headers and cookies

```ts
import helmet from "helmet";
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],   // clickjacking protection
    },
  },
}));

res.cookie("session", token, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 3600_000, path: "/" });
```

Headers to know: `Strict-Transport-Security` (HSTS), `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`. Test your site with securityheaders.com and the Mozilla Observatory.

### A2.3 CORS explained

CORS is a browser rule: a page from origin A may read responses from origin B only if B says so via `Access-Control-Allow-Origin`. It protects users, not your server (it does nothing against `curl`). For credentials, set a specific origin and `Access-Control-Allow-Credentials: true`. Preflight `OPTIONS` requests happen for non-simple requests.

**Tasks:**

- [ ] Take your Notes API and try to attack it: read another user's note by id, inject SQL in the search box, store a `<script>` in a note title and see if it runs, and send a request from another origin
- [ ] Fix each issue and write a regression test for each
- [ ] Add `helmet`, a CSP, strict CORS, rate limits on auth routes, and secure cookie flags, then scan with securityheaders.com

---

## Level 3: Advanced

### A3.1 Authentication done properly

- Prefer a battle-tested solution (Auth.js, Clerk, Auth0, Supabase Auth, Lucia, Keycloak) over writing your own
- **OAuth 2.0 with PKCE** (Proof Key for Code Exchange) for public and single-page clients, **OpenID Connect** for federated identity
- **Passkeys (WebAuthn)** are phishing-resistant, cryptographically backed by device secure enclaves, and the industry gold standard

#### Refresh Token Rotation & Token Family Revocation
When using short-lived Access Tokens (e.g., 15 minutes) paired with Refresh Tokens (e.g., 7 days):

```ts
// On each refresh request:
// 1. Look up submitted refresh token
const tokenRecord = await db.refreshToken.findUnique({ where: { token: submittedToken } });

if (!tokenRecord) {
  // Panic: Unknown token or token was already revoked!
  return res.status(401).json({ error: "Invalid token" });
}

if (tokenRecord.isRevoked) {
  // CRITICAL: Token reuse detected! (An attacker or victim is presenting an expired token)
  // Revoke ALL tokens belonging to this user's token family immediately!
  await db.refreshToken.updateMany({
    where: { familyId: tokenRecord.familyId },
    data: { isRevoked: true },
  });
  return res.status(403).json({ error: "Compromised session. Please log in again." });
}

// 2. Invalidate current token and issue fresh child token in the same family
await db.refreshToken.update({ where: { id: tokenRecord.id }, data: { isRevoked: true } });
const newRefreshToken = generateSecureToken();
await db.refreshToken.create({
  data: { token: newRefreshToken, familyId: tokenRecord.familyId, userId: tokenRecord.userId },
});
```

#### Dynamic CSP Nonces in Modern SSR
Avoid `'unsafe-inline'` by generating a per-request cryptographically secure nonce in your server middleware:

```ts
// middleware.ts
import { NextResponse } from "next/server";

export function middleware(request: Request) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic';
    style-src 'self' 'nonce-${nonce}';
    img-src 'self' blob: data:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
  `.replace(/\s{2,}/g, " ").trim();

  const response = NextResponse.next();
  response.headers.set("Content-Security-Policy", cspHeader);
  response.headers.set("x-nonce", nonce);
  return response;
}
```

### A3.2 Secrets, supply chain and infrastructure

- Use a secrets manager (AWS Secrets Manager, Vault, Doppler), rotate secrets, scan commits with gitleaks or GitHub secret scanning
- Pin dependency versions, use `npm ci`, review `postinstall` scripts, enable provenance and signed packages where possible
- Scan container images (Trivy), run as a non-root user, keep images minimal
- Least-privilege cloud roles, private networks for databases, MFA for all accounts, audit logs enabled
- Backups protected from the same credentials that run production (ransomware thinking)

### A3.3 Privacy and compliance (awareness)

- Collect the minimum data, tell users what you store, allow export and deletion (GDPR and similar laws, the Philippines Data Privacy Act)
- Encrypt in transit (TLS) and at rest, hash or tokenize sensitive values, never store card data yourself (use Stripe or similar, PCI DSS scope)
- Keep an audit trail for sensitive actions and have an incident response plan

### A3.4 Testing security

- Automated: `npm audit`, Semgrep or CodeQL (static analysis), OWASP ZAP (dynamic scan), dependency and secret scanners in CI
- Manual: threat modeling (STRIDE: spoofing, tampering, repudiation, information disclosure, denial of service, elevation of privilege), code review with a security checklist
- Practice safely: PortSwigger Web Security Academy, OWASP Juice Shop, Hack The Box (only on systems you are allowed to test)

---

# Part B: Web Performance

## Level 1: Fundamentals

### B1.1 Measure first

- **Lighthouse** (DevTools), **PageSpeed Insights**, **WebPageTest**, and real-user monitoring (Core Web Vitals in Search Console)
- **Core Web Vitals:**
  - **LCP (Largest Contentful Paint, < 2.5s):** measures loading speed of primary hero image or text block.
  - **INP (Interaction to Next Paint, < 200ms):** measures overall responsiveness across user clicks, taps, and keyboard events.
  - **CLS (Cumulative Layout Shift, < 0.1):** measures visual stability; reserve space for images and ads with `aspect-ratio`.
- **Anatomy of an INP Interaction:**
  $$\text{INP} = \text{Input Delay} + \text{Processing Time} + \text{Presentation Delay}$$
  - *Input Delay:* Main thread was blocked by unrelated long tasks when user clicked. (Fix: yield with `scheduler.yield()`).
  - *Processing Time:* Your JavaScript event handler took too long. (Fix: offload heavy work to Web Workers).
  - *Presentation Delay:* Browser struggled to re-render DOM/layout. (Fix: avoid synchronous DOM layout thrashing).
- Test on a throttled network and a 4x/6x slow CPU (DevTools), because your dev machine is 10x faster than real-world mobile devices.
- Set a **performance budget** (for example under 150 KB initial gzipped JS).

### B1.2 Quick wins

- [ ] Compress and resize images, use AVIF or WebP, set `width` and `height`, lazy-load below the fold, `fetchpriority="high"` for the hero image
- [ ] Enable Brotli or gzip compression and HTTP caching on the server or CDN
- [ ] Use `defer` for scripts, remove unused JavaScript and CSS, avoid heavy libraries (check bundle size before adding)
- [ ] Self-host fonts, subset them, use `font-display: swap`, preload the main one
- [ ] Serve static files from a CDN

**Task:**

- [ ] Run Lighthouse on one of your sites, record the scores, apply the five quick wins, and record the new scores

---

## Level 2: Intermediate

### B2.1 Frontend performance

- **Code splitting:** `lazy(() => import("./Chart"))`, split routes, load heavy libraries on demand
- **Tree shaking** needs ES modules and side-effect-free packages. Analyze bundles with `vite-bundle-visualizer` or `source-map-explorer`
- **Rendering:** avoid layout thrashing (reading and writing layout in a loop), animate `transform` and `opacity`, virtualize long lists, memoize only where the Profiler shows a problem
- **Long tasks:** break up heavy JavaScript (chunk with `setTimeout`/`scheduler.yield`), move work to a Web Worker
- **Third-party scripts** (analytics, chat widgets, ads) are often the biggest cost: load them late, or not at all
- **Server rendering and streaming** (Next.js, Remix, Astro) improve first paint
- **Prefetch** likely next pages and use the browser cache effectively with fingerprinted file names and `Cache-Control: max-age=31536000, immutable`

### B2.2 Backend performance

- Find slow endpoints with logs, APM (Datadog, New Relic, OpenTelemetry) and p95 or p99 latency, not averages
- Fix database first: indexes, `EXPLAIN ANALYZE`, remove N+1 queries, select fewer columns, paginate (file 07)
- Cache: HTTP caching, Redis, in-memory caches for hot data, with sensible expiry
- Do slow work in background jobs, stream large responses, compress JSON
- Connection pooling, keep-alive, avoid blocking the Node event loop (no heavy synchronous loops, no `*Sync` file functions in handlers)
- **Load test** with k6 or Artillery, find the breaking point, fix the first bottleneck, repeat

```ts
// Blocking the event loop: every request waits
app.get("/slow", (req, res) => { for (let i = 0; i < 1e10; i++); res.send("done"); });

// Fix: worker thread or queue
import { Worker } from "node:worker_threads";
```

### B2.3 HTTP caching cheat sheet

| Resource | Header | Why |
|----------|--------|-----|
| Hashed assets (`app.3f9a1c.js`) | `Cache-Control: public, max-age=31536000, immutable` | Name changes when content changes |
| HTML pages | `Cache-Control: no-cache` (revalidate) | Always fresh, cheap with `ETag` |
| API responses (public) | `Cache-Control: public, max-age=60, stale-while-revalidate=300` | Short cache, refresh in background |
| Private data | `Cache-Control: private, no-store` | Never in shared caches |

**Tasks:**

- [ ] Reduce your React app's initial JavaScript by 40% using route splitting and by removing or replacing one heavy library, and prove it with a bundle visualizer screenshot
- [ ] Load test your API with k6 at 100 virtual users, find the slowest endpoint, add an index or cache, and compare p95 latency before and after

---

## Level 3: Advanced

- **Edge and CDN strategies:** cache HTML at the edge, stale-while-revalidate, edge functions for personalization
- **HTTP/2 and HTTP/3,** connection reuse, resource hints (`preconnect`, `preload`, `modulepreload`), priority hints
- **Image pipelines:** responsive variants, on-the-fly resizing (Cloudflare Images, imgix, Next.js Image), blur placeholders
- **Database at scale:** read replicas, partitioning, materialized views, denormalized read models, caching layers
- **Profiling:** Chrome Performance panel flame charts, Node `--inspect` with the profiler, `clinic.js`, heap snapshots for leaks
- **Capacity planning,** autoscaling, queue depth monitoring, graceful degradation under load (serve cached or reduced responses)
- **Performance culture:** budgets in CI (Lighthouse CI), dashboards, and measuring real users, not just lab tests

**Task:**

- [ ] Add Lighthouse CI to your pipeline with budgets (performance score, JavaScript size, LCP) that fail the build when exceeded

---

## Projects

**Mini project: harden and speed up the Notes app**

- [ ] A written threat model (assets, entry points, top 5 threats, mitigations)
- [ ] Fixes and regression tests for access control, injection, XSS and CSRF
- [ ] Security headers and CSP with a score of A on securityheaders.com
- [ ] Lighthouse 90+ on performance, accessibility, best practices and SEO
- [ ] A load test result showing the API stays healthy at your target load

**Challenge projects:**

- [ ] Do a full write-up of vulnerabilities you found in OWASP Juice Shop (attack, cause, fix)
- [ ] Add passkey (WebAuthn) login to your app
- [ ] Reduce a deliberately slow demo page (unoptimized images, blocking scripts, huge bundle) from a Lighthouse score of 30 to 95 and document each step and its effect

## Self-check

- [ ] Explain XSS, CSRF, SQL injection and IDOR with a defense for each
- [ ] Explain CORS in one minute and why it is not a security tool for your server
- [ ] Name Core Web Vitals and three ways to improve each
- [ ] Find and fix a slow endpoint from logs to database index with before and after numbers
