# 09. Testing and Quality

Tests let you change code without fear. Good developers also debug methodically, review code well, and use tools that catch problems before users do.

**Prerequisites:** files 03, 04 and 06.

**Contents:** [Level 1](#level-1-fundamentals) | [Level 2](#level-2-intermediate) | [Level 3](#level-3-advanced) | [Debugging](#debugging-method) | [Projects](#projects)

---

## Level 1: Fundamentals

### 1.1 Why and what to test

**The test pyramid:**

- **Many unit tests:** one function or class, fast (milliseconds), no network or database
- **Some integration tests:** several parts together (route plus database)
- **Few end-to-end (E2E) tests:** a real browser clicking through real user journeys, slow but realistic

**Rules:**

- Test **behavior**, not implementation details (what it does, not how)
- A good test fails for one clear reason and its name says what broke
- Each test is independent and can run in any order
- Pattern: **Arrange, Act, Assert** (set up, do the thing, check the result)
- 100% coverage does not mean good tests. Aim to cover critical paths and edge cases

### 1.2 Your first unit tests (Vitest)

```bash
npm install -D vitest
npx vitest            # watch mode
```

```ts
// cart.ts
export type Item = { price: number; qty: number };
export function cartTotal(items: Item[], discount = 0): number {
  if (discount < 0 || discount > 1) throw new Error("discount must be between 0 and 1");
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  return Math.round(subtotal * (1 - discount) * 100) / 100;
}
```

```ts
// cart.test.ts
import { describe, it, expect } from "vitest";
import { cartTotal } from "./cart";

describe("cartTotal", () => {
  it("adds up price times quantity", () => {
    expect(cartTotal([{ price: 10, qty: 2 }, { price: 5, qty: 1 }])).toBe(25);
  });

  it("returns 0 for an empty cart", () => {
    expect(cartTotal([])).toBe(0);
  });

  it("applies a discount", () => {
    expect(cartTotal([{ price: 100, qty: 1 }], 0.1)).toBe(90);
  });

  it("rejects an invalid discount", () => {
    expect(() => cartTotal([], 2)).toThrow("discount");
  });
});
```

Common matchers: `toBe`, `toEqual`, `toBeTruthy`, `toContain`, `toHaveLength`, `toThrow`, `toBeCloseTo`, `resolves`, `rejects`.

**Task:**

- [ ] Write 8 unit tests for `isEven`, `isPalindrome`, `debounce` and `cartTotal`, including edge cases (empty, negative, huge, wrong type)
- [ ] Break the code on purpose and read the failure message

**Checkpoint:** what is an edge case? Why should tests not depend on each other?

---

## Level 2: Intermediate

### 2.1 Test doubles: mocks, stubs, spies and fakes

```ts
import { vi, it, expect, beforeEach } from "vitest";

// Spy and mock a function
const sendEmail = vi.fn().mockResolvedValue({ ok: true });
await registerUser({ email: "a@b.com" }, { sendEmail });
expect(sendEmail).toHaveBeenCalledWith("a@b.com", expect.stringContaining("Welcome"));

// Control time
vi.useFakeTimers();
const fn = vi.fn();
const debounced = debounce(fn, 300);
debounced(); debounced();
vi.advanceTimersByTime(300);
expect(fn).toHaveBeenCalledTimes(1);
vi.useRealTimers();

// Mock a module
vi.mock("./mailer", () => ({ send: vi.fn() }));
```

**Guidance:** mock things you do not own or that are slow or random (network, email, time, payment APIs). Prefer **fakes** (an in-memory repository) over heavy mocking, and design code with **dependency injection** (pass dependencies in) so it is easy to test.

**Task:**

- [ ] Write a `registerUser` service that takes a repository and a mailer as parameters, and test it with a fake repository and a mocked mailer (success, duplicate email, mail failure)

### 2.2 Testing APIs

```ts
// app.ts exports the express app without calling listen
import request from "supertest";
import { app } from "./app";

describe("POST /api/todos", () => {
  it("creates a todo", async () => {
    const res = await request(app).post("/api/todos").send({ text: "Learn testing" });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ text: "Learn testing", done: false });
  });

  it("rejects an empty text", async () => {
    const res = await request(app).post("/api/todos").send({ text: "" });
    expect(res.status).toBe(400);
  });

  it("requires login", async () => {
    const res = await request(app).get("/api/me");
    expect(res.status).toBe(401);
  });
});
```

**Database tests:** use a separate test database (Docker or Testcontainers), run migrations before the suite, and reset data between tests (truncate tables or wrap each test in a rolled-back transaction).

**Task:**

- [ ] Write API tests for your Notes API: register, login, create, list with pagination, forbidden access to another user's note, validation errors

### 2.3 Testing React components

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { it, expect } from "vitest";

it("increments the counter", async () => {
  render(<Counter />);
  await userEvent.click(screen.getByRole("button", { name: /clicked 0/i }));
  expect(screen.getByRole("button", { name: /clicked 1/i })).toBeInTheDocument();
});

it("shows an error when the request fails", async () => {
  server.use(http.get("/api/users", () => new HttpResponse(null, { status: 500 })));   // MSW mocks the network
  render(<Users />);
  expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
});
```

**Query by what users see** (`getByRole`, `getByLabelText`, `getByText`), not by CSS classes or test ids. Use **MSW** (Mock Service Worker) to fake API responses at the network layer.

**Task:**

- [ ] Test a login form: validation messages, a successful submit, a server error, and that the button is disabled while submitting

### 2.4 End-to-end tests with Playwright

```bash
npm init playwright@latest
```

```ts
import { test, expect } from "@playwright/test";

test("user can register, create a note and log out", async ({ page }) => {
  await page.goto("/register");
  await page.getByLabel("Email").fill(`user${Date.now()}@example.com`);
  await page.getByLabel("Password").fill("a-strong-password");
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page).toHaveURL("/notes");
  await page.getByRole("button", { name: "New note" }).click();
  await page.getByLabel("Title").fill("My first note");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("My first note")).toBeVisible();

  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL("/login");
});
```

Keep E2E tests to the critical journeys (sign up, checkout, core feature). Use auto-waiting assertions, avoid fixed sleeps, and run them in CI with traces and screenshots on failure. Alternatives: Cypress.

**Task:**

- [ ] Write one E2E test for the full login flow and one for your app's main feature, then run them in GitHub Actions

### 2.5 Linting, formatting and type-checking

- **ESLint** finds bugs and enforces rules (`eslint-plugin-react-hooks`, `typescript-eslint`)
- **Prettier** ends formatting arguments (run on save and in CI)
- **TypeScript** strict mode (`tsc --noEmit`)
- **Git hooks** (Husky and lint-staged) run checks on staged files before each commit
- **EditorConfig** keeps editors consistent

**Task:**

- [ ] Set up ESLint, Prettier, Husky and lint-staged so a commit with a lint error is rejected

---

## Level 3: Advanced

### 3.1 TDD (test-driven development)

**Loop:** write a failing test (red), write the simplest code to pass (green), clean up (refactor), repeat. TDD shines for business logic and bug fixes: **write a test that reproduces the bug first**, then fix it.

**Task:**

- [ ] Build a `PasswordValidator` (min length, upper, lower, digit, symbol, no common passwords) using strict TDD, committing after each red-green step

### 3.2 Property-based and snapshot testing

```ts
import fc from "fast-check";

it("reversing twice returns the original", () => {
  fc.assert(fc.property(fc.array(fc.integer()), arr => {
    expect(reverse(reverse(arr))).toEqual(arr);
  }));
});

it("renders the receipt", () => {
  expect(renderReceipt(order)).toMatchSnapshot();   // use sparingly; review diffs carefully
});
```

Property-based tests generate hundreds of random inputs and find edge cases you never thought of.

### 3.3 Non-functional testing

- **Accessibility:** `jest-axe` or `@axe-core/playwright` in tests, plus manual keyboard and screen reader checks
- **Performance:** Lighthouse CI for budgets, **k6** or Artillery for load tests (find the breaking point)
- **Visual regression:** Playwright screenshots, Chromatic or Percy
- **Security:** `npm audit`, dependency scanning, secret scanning, OWASP ZAP, SAST in CI
- **Contract testing:** Pact checks that the frontend and backend still agree on the API
- **Mutation testing** (Stryker): checks that your tests actually fail when the code is wrong

### 3.4 Fighting flaky tests

Common causes: shared state between tests, real time and randomness, race conditions, fixed sleeps, order dependence, external services. Fix by controlling time, seeding data, awaiting conditions (not delays), isolating state, and quarantining a flaky test with a ticket rather than ignoring it.

### 3.5 Code review

**As an author:** keep pull requests small (under about 300 changed lines), explain why in the description, add screenshots for UI changes, self-review first, and keep CI green.

**As a reviewer:** check correctness, tests, security, readability, naming, error handling and edge cases. Ask questions instead of giving orders, separate must-fix from nitpicks, and review within a day.

**Task:**

- [ ] Review an open-source pull request (without commenting publicly) and write down 5 observations, then compare with the maintainers' comments

---

## Debugging method

1. **Reproduce** the problem reliably, with the smallest example
2. **Read** the error message and stack trace fully (the first line of your code in the trace is usually the clue)
3. **Form a hypothesis**, then test it (one change at a time)
4. **Isolate:** comment out, bisect the code (or use `git bisect`), print values with `console.table`, add `debugger` and step through
5. **Use the right tool:** browser DevTools (Sources, Network, Performance, Memory), VS Code debugger for Node, logs with request ids, database `EXPLAIN`
6. **Fix the cause, not the symptom**, add a regression test, and write down what you learned
7. Stuck for 30 minutes? Explain the problem aloud to a rubber duck (or write the question to a teammate): you often find the answer while writing it

**Task:**

- [ ] Take a deliberately buggy project (or write one with 5 hidden bugs), fix each with the method above, and write a test for every fix

---

## Projects

**Mini project: test suite for the Notes app**

- [ ] 10 or more unit tests, 8 API tests, 3 component tests, 2 E2E tests
- [ ] ESLint, Prettier, TypeScript check and all tests running in GitHub Actions
- [ ] Husky pre-commit hook, coverage report with a sensible minimum on critical code
- [ ] A short `TESTING.md` explaining how to run each kind of test

**Challenge projects:**

- [ ] Add Lighthouse CI and axe checks with budgets that fail the build
- [ ] Write a load test that proves your API handles 200 requests per second, and fix the first bottleneck
- [ ] Add contract tests between your frontend and API

## Self-check

- [ ] Explain the test pyramid and what you test at each level
- [ ] Write a test before the code for a new function, from memory
- [ ] Explain when to mock and when not to
- [ ] Debug an unknown error using the steps above without guessing randomly
