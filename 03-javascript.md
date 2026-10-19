# 03. JavaScript

JavaScript makes pages interactive, and with Node.js it also runs servers, tools and scripts. Practice in the browser console (F12) or run files with `node file.js`.

**Contents:** [Level 1](#level-1-fundamentals) | [Level 2](#level-2-intermediate) | [Level 3](#level-3-advanced) | [Projects](#projects)

---

## Level 1: Fundamentals

### 1.1 Variables and types

**Concept:** use `const` by default, `let` when the value must change, and never `var`. Primitive types: string, number, boolean, null, undefined, bigint, symbol. Everything else is an object (arrays and functions included).

**Example:**

```js
const name = "Chan";     // cannot be reassigned
let score = 0;           // can be reassigned
score += 10;

console.log(typeof name, typeof score, typeof null);  // string number object (a famous quirk)
console.log("5" + 1);     // "51"  (joined as text)
console.log("5" - 1);     // 4     (converted to number)
console.log(5 === "5");   // false (strict, compares type too)
console.log(5 == "5");    // true  (loose, avoid)
console.log(0.1 + 0.2);   // 0.30000000000000004 (floating-point)
```

**Task:**

- [ ] Write a temperature converter (Celsius to Fahrenheit) that prints a sentence
- [ ] Predict the output of 5 type-coercion puzzles, then check in the console

**Checkpoint:** why does `"5" + 1` give `"51"`? Which values are falsy?

### 1.2 Strings, numbers, Math and Date

**Example:**

```js
const s = "  Hello, World  ";
s.trim().toUpperCase();          // "HELLO, WORLD"
s.includes("World");             // true
s.slice(2, 7);                   // "Hello"
s.split(",");                    // ["  Hello", " World  "]
"ab".repeat(3);                  // "ababab"
`Total: ${(19.999).toFixed(2)}`; // "Total: 20.00"

Math.round(4.6); Math.floor(4.9); Math.max(1, 5, 3); Math.random();
Number("42"); parseInt("42px"); Number.isNaN(NaN);

const d = new Date("2026-10-12T08:00:00");
d.getFullYear(); d.toLocaleDateString("en-PH", { dateStyle: "long" });
```

**Task:**

- [ ] Write a function that turns "hello world" into "Hello World" and another that returns a random integer between two numbers

### 1.3 Operators, conditionals and loops

**Example:**

```js
const age = 20;
if (age >= 18 && age < 65) console.log("adult");
else if (age >= 65) console.log("senior");
else console.log("minor");

const label = age >= 18 ? "adult" : "minor";   // ternary

switch (new Date().getDay()) {
  case 0: case 6: console.log("weekend"); break;
  default: console.log("weekday");
}

for (let i = 1; i <= 5; i++) console.log(i);
let n = 0; while (n < 3) n++;
do { n--; } while (n > 0);
for (const ch of "abc") console.log(ch);
```

Falsy values: `false`, `0`, `""`, `null`, `undefined`, `NaN`. Everything else is truthy.

**Task:**

- [ ] Solve FizzBuzz (1 to 100)
- [ ] Print a pyramid of stars using nested loops

### 1.4 Functions

**Concept:** a function packages reusable logic. Arrow functions are the short form. Parameters can have defaults and a rest parameter collects the extras.

**Example:**

```js
function add(a, b = 0) { return a + b; }
const multiply = (a, b) => a * b;
const square = n => n * n;
const sum = (...nums) => nums.reduce((t, n) => t + n, 0);

console.log(add(2, 3), multiply(2, 3), square(4), sum(1, 2, 3, 4)); // 5 6 16 10
```

**Task:**

- [ ] Write `isEven`, `maxOf(array)`, `countVowels(text)`, `isPalindrome(text)`

**Checkpoint:** what does a function return if it has no `return`? What is the difference between a parameter and an argument?

### 1.5 Arrays and objects

**Example:**

```js
const nums = [1, 2, 3];
nums.push(4);  nums.pop();  nums.unshift(0);  nums.shift();
nums.includes(2); nums.indexOf(3); nums.slice(1); nums.splice(1, 1);

const user = { name: "Chan", age: 25, skills: ["js", "css"] };
console.log(user.name, user["age"], nums.length);
user.email = "chan@example.com";
delete user.age;
Object.keys(user); Object.values(user); Object.entries(user);

for (const n of nums) console.log(n);
for (const key in user) console.log(key, user[key]);
```

**Task:**

- [ ] Create an array of 5 student objects (name, grade) and print each as `Name: grade`

### 1.6 The DOM and events

**Concept:** the DOM is the page as JavaScript objects. You select an element, listen for an event, then change the page.

**Example:**

```html
<button id="btn">Click me</button>
<p id="out">0</p>
<ul id="list"></ul>

<script>
  let count = 0;
  const btn = document.querySelector("#btn");
  const out = document.querySelector("#out");

  btn.addEventListener("click", () => {
    count++;
    out.textContent = count;
  });

  const list = document.querySelector("#list");
  const li = document.createElement("li");
  li.textContent = "New item";
  li.classList.add("item");
  list.append(li);
</script>
```

**Task:**

- [ ] Build a counter with +, - and reset
- [ ] Build a to-do list where you add, complete and remove items

**Checkpoint:** what is the difference between `textContent` and `innerHTML`, and which is safer with user input?

### 1.7 Events in depth and forms

**Concept:** events **bubble** from the target up to its parents, so you can listen once on a parent (**event delegation**).

**Example:**

```js
document.querySelector("#list").addEventListener("click", e => {
  const item = e.target.closest("li");
  if (!item) return;
  item.classList.toggle("done");
});

const form = document.querySelector("#signup");
form.addEventListener("submit", e => {
  e.preventDefault();                       // stop the page reload
  const data = Object.fromEntries(new FormData(form));
  console.log(data);
});

document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });
```

**Task:**

- [ ] Rewrite your to-do list using event delegation, so new items work without adding listeners

---

## Level 2: Intermediate

### 2.1 Array methods

**Concept:** `map` transforms every item, `filter` keeps some, `reduce` combines into one value, `find` gets the first match. They replace most loops.

**Example:**

```js
const prices = [10, 20, 30];
prices.map(p => p * 2);                  // [20, 40, 60]
prices.filter(p => p > 15);              // [20, 30]
prices.reduce((sum, p) => sum + p, 0);   // 60
prices.find(p => p > 15);                // 20
prices.some(p => p > 25);                // true
prices.every(p => p > 5);                // true
[[1, 2], [3]].flat();                    // [1, 2, 3]
[3, 1, 2].toSorted((a, b) => a - b);     // [1, 2, 3] (does not mutate)
Object.groupBy(["a", "bb", "cc"], s => s.length);
```

**Task:**

- [ ] Given products (name, price, inStock), return the names of in-stock items sorted by price and the total stock value

### 2.2 Destructuring, spread and safe access

**Example:**

```js
const user = { name: "Chan", age: 25, address: null };

const { name, age = 18 } = user;
const [first, ...rest] = [1, 2, 3];
const updated = { ...user, age: 26 };       // copy and change
const merged = [...[1, 2], ...[3, 4]];
console.log(`Hello ${name}`);
console.log(user.address?.city ?? "Unknown");   // ?. safe access, ?? default for null/undefined
const copy = structuredClone(user);          // deep copy
```

**Task:**

- [ ] Rewrite your student code using destructuring and spread, never mutating the original array

### 2.3 Map, Set and JSON

**Example:**

```js
const unique = [...new Set([1, 2, 2, 3])];           // [1, 2, 3]
const ages = new Map([["Chan", 25]]);
ages.set("Ana", 30); ages.get("Ana"); ages.has("Bob");

const json = JSON.stringify({ a: 1, b: [2, 3] });    // object to string
const obj = JSON.parse(json);                         // string to object
```

**Task:**

- [ ] Count the frequency of each word in a paragraph using a `Map`

### 2.4 Scope, hoisting and closures

**Concept:** an inner function remembers the variables around it, even after the outer function has finished. This is how private state and many patterns work.

**Example:**

```js
function makeCounter() {
  let count = 0;
  return () => ++count;
}
const next = makeCounter();
next(); next();
console.log(next()); // 3

// Classic trap
for (var i = 0; i < 3; i++) setTimeout(() => console.log(i)); // 3 3 3
for (let j = 0; j < 3; j++) setTimeout(() => console.log(j)); // 0 1 2
```

**Task:**

- [ ] Write `makeMultiplier(n)` and `once(fn)` (runs a function only the first time)

**Checkpoint:** why is `count` not accessible outside? Why does the `var` loop print 3 3 3?

### 2.5 `this`, classes and prototypes

**Example:**

```js
class Account {
  #balance = 0;                      // private field
  static count = 0;

  constructor(owner) { this.owner = owner; Account.count++; }
  deposit(amount) { this.#balance += amount; return this; }
  get balance() { return this.#balance; }
}

class Savings extends Account {
  addInterest(rate) { this.deposit(this.balance * rate); }
}

const acc = new Savings("Chan");
acc.deposit(100).addInterest(0.05);
console.log(acc.balance);            // 105

// Under the hood, classes use prototypes
console.log(Object.getPrototypeOf(acc) === Savings.prototype); // true

// "this" depends on HOW a function is called
const obj = { name: "A", hi() { return this.name; } };
const loose = obj.hi;
// loose() loses "this"; fix with obj.hi.bind(obj) or an arrow function
```

**Task:**

- [ ] Build `BankAccount` with `withdraw` that throws a custom error when funds are insufficient

### 2.6 Error handling

**Example:**

```js
class ValidationError extends Error {
  constructor(message, field) { super(message); this.name = "ValidationError"; this.field = field; }
}

try {
  throw new ValidationError("Email is required", "email");
} catch (err) {
  if (err instanceof ValidationError) console.log(err.field);
  else throw err;                     // do not swallow unknown errors
} finally {
  console.log("always runs");
}
```

### 2.7 Asynchronous JavaScript

**Concept:** slow work (network, files, timers) returns a **Promise**. `await` pauses only the current function until it settles. Always handle errors, and check `res.ok` because `fetch` does not throw on 404 or 500.

**Example:**

```js
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function getUsers() {
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/users");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("Failed:", err.message);
    return [];
  }
}

// Parallel
const [users, posts] = await Promise.all([
  fetch("https://jsonplaceholder.typicode.com/users").then(r => r.json()),
  fetch("https://jsonplaceholder.typicode.com/posts").then(r => r.json()),
]);

// Others: Promise.allSettled (never rejects), Promise.race, Promise.any

// POST with JSON
await fetch("/api/todos", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ text: "Learn async" }),
});
```

**Task:**

- [ ] Build a user directory: fetch, show cards, loading state, error state, search box
- [ ] Write `retry(fn, times)` that retries a failing async function with a growing delay

**Checkpoint:** when do you use `Promise.all` instead of two awaits in a row? What is CORS and who enforces it?

### 2.8 Modules

**Example:**

```js
// math.js
export const add = (a, b) => a + b;
export default function greet(name) { return `Hi ${name}`; }

// app.js  (load with <script type="module" src="app.js">)
import greet, { add } from "./math.js";
import * as math from "./math.js";
const { default: lazy } = await import("./heavy.js");   // dynamic import
```

### 2.9 Browser storage, URL and history

**Example:**

```js
localStorage.setItem("user", JSON.stringify({ name: "Chan" }));   // survives restarts
const saved = JSON.parse(localStorage.getItem("user") ?? "null");
sessionStorage.setItem("step", "2");                              // per tab
document.cookie = "theme=dark; max-age=31536000; SameSite=Lax";   // sent to the server

const url = new URL("https://example.com/search?q=js&page=2");
url.searchParams.get("q");
history.pushState({}, "", "/products/5");                         // change URL without reload
window.addEventListener("popstate", () => render(location.pathname));
```

For large or structured data use **IndexedDB** (via the `idb` library). Never store secrets or tokens that must stay private in `localStorage`.

**Task:**

- [ ] Persist your to-do list in `localStorage`, split code into `storage.js`, `ui.js`, `app.js` modules
- [ ] Build a tiny client-side router using the History API

### 2.10 Regular expressions

```js
/^\d{4}-\d{2}-\d{2}$/.test("2026-10-12");              // true
"a1b22".match(/\d+/g);                                  // ["1", "22"]
"John Smith".replace(/(\w+) (\w+)/, "$2, $1");          // "Smith, John"
const { groups } = /(?<year>\d{4})-(?<month>\d{2})/.exec("2026-10");
```

**Task:**

- [ ] Write regexes for an email, a Philippine mobile number and a strong password

---

## Level 3: Advanced

### 3.1 The event loop

**Concept:** JavaScript runs one thing at a time. Order: all synchronous code, then microtasks (Promises, `queueMicrotask`), then macrotasks (timers, events).

**Example (predict before running):**

```js
console.log("1");
setTimeout(() => console.log("2"), 0);
Promise.resolve().then(() => console.log("3"));
queueMicrotask(() => console.log("4"));
console.log("5");
// 1, 5, 3, 4, 2
```

**Task:**

- [ ] Write 5 mixed snippets (timers, promises, `async/await`) and predict each output
- [ ] Explain why a heavy loop freezes the page and how to fix it (chunking or a Web Worker)

### 3.2 Iterators, generators and Symbols

```js
function* count(max) { for (let i = 1; i <= max; i++) yield i; }
for (const n of count(3)) console.log(n);

const range = { from: 1, to: 3, *[Symbol.iterator]() { for (let i = this.from; i <= this.to; i++) yield i; } };
console.log([...range]);   // [1, 2, 3]

async function* pages() { for (let p = 1; p <= 3; p++) yield await fetch(`/api?page=${p}`).then(r => r.json()); }
for await (const page of pages()) console.log(page);
```

**Task:**

- [ ] Write an infinite ID generator and take the first 5 values; paginate an API with an async generator

### 3.3 Proxy, Reflect and tagged templates

```js
const watched = new Proxy({ count: 0 }, {
  set(target, key, value) { console.log(`${String(key)} = ${value}`); target[key] = value; return true; },
});
watched.count = 5;

const upper = (strings, ...vals) => strings.reduce((out, s, i) => out + s + (vals[i] ? String(vals[i]).toUpperCase() : ""), "");
upper`Hello ${"world"}!`;
```

Reactive frameworks (Vue) are built on Proxy.

### 3.4 Memory, WeakMap and leaks

**Concept:** memory is freed when nothing references an object. Leaks happen from forgotten listeners, timers, detached DOM nodes and unbounded caches.

```js
const cache = new WeakMap();   // keys can be garbage collected
function process(obj) { if (!cache.has(obj)) cache.set(obj, expensive(obj)); return cache.get(obj); }

const controller = new AbortController();
window.addEventListener("resize", onResize, { signal: controller.signal });
controller.abort();            // removes the listener
```

**Task:**

- [ ] Use the DevTools Memory tab to take two heap snapshots and find a leak you create on purpose

### 3.5 Performance patterns and observers

```js
function debounce(fn, delay = 300) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
}
function throttle(fn, limit = 200) {
  let waiting = false;
  return (...args) => { if (waiting) return; fn(...args); waiting = true; setTimeout(() => (waiting = false), limit); };
}

const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); } });
});
document.querySelectorAll(".reveal").forEach(el => io.observe(el));

new ResizeObserver(entries => console.log(entries[0].contentRect.width)).observe(document.body);
new MutationObserver(m => console.log("DOM changed")).observe(document.body, { childList: true, subtree: true });

requestAnimationFrame(function loop() { /* draw */ requestAnimationFrame(loop); });
```

**Task:**

- [ ] Debounce your search, throttle a scroll handler, and lazy-reveal cards with `IntersectionObserver`

### 3.6 Cancellation and robust networking

```js
const controller = new AbortController();
fetch("/api/slow", { signal: controller.signal }).catch(e => console.log(e.name)); // AbortError
controller.abort();

AbortSignal.timeout(5000);   // abort after 5 seconds
```

**Task:**

- [ ] Cancel the previous search request whenever a new one starts so stale results never appear

### 3.7 Web Workers, Service Workers and PWAs

```js
// main.js: move heavy work off the UI thread
const worker = new Worker(new URL("./worker.js", import.meta.url), { type: "module" });
worker.postMessage({ numbers: bigArray });
worker.onmessage = e => console.log("sum:", e.data);

// worker.js
self.onmessage = e => self.postMessage(e.data.numbers.reduce((a, b) => a + b, 0));

// Service worker: caching and offline support
navigator.serviceWorker.register("/sw.js");
```

**Task:**

- [ ] Compute primes up to 5 million in a Web Worker and keep the UI responsive
- [ ] Make a small site work offline with a service worker and a web manifest

### 3.8 Real-time and device APIs

```js
const ws = new WebSocket("wss://example.com/chat");
ws.onmessage = e => console.log(JSON.parse(e.data));
ws.send(JSON.stringify({ text: "hi" }));

const es = new EventSource("/api/stream");          // Server-Sent Events: server to client only
es.onmessage = e => console.log(e.data);

await navigator.clipboard.writeText("copied");
navigator.geolocation.getCurrentPosition(pos => console.log(pos.coords));
const ro = Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(1234.5);
```

### 3.9 Design patterns and functional style

```js
// Module (closure)
const counter = (() => { let c = 0; return { inc: () => ++c, get: () => c }; })();

// Observer / pub-sub
function createEmitter() {
  const handlers = {};
  return {
    on: (evt, fn) => (handlers[evt] ??= []).push(fn),
    emit: (evt, data) => (handlers[evt] ?? []).forEach(fn => fn(data)),
  };
}

// Factory
const makeUser = (name, role = "user") => ({ name, role, isAdmin: role === "admin" });

// Currying and composition
const add = a => b => a + b;
const compose = (...fns) => x => fns.reduceRight((v, f) => f(v), x);
const slugify = compose(s => s.replaceAll(" ", "-"), s => s.toLowerCase(), s => s.trim());
```

Also know: immutability, pure functions, memoization, the strategy and singleton patterns, and why `Object.freeze` is shallow.

### 3.10 Tooling

- **Package managers:** npm, pnpm, yarn; `package.json`, scripts, semver (`^1.2.3`), lock files
- **Bundlers:** Vite (dev server and build), esbuild, Rollup, webpack (legacy)
- **Transpilers:** Babel, SWC
- **Quality:** ESLint (finds bugs), Prettier (formats)
- **Debugging:** `debugger`, breakpoints, the Network and Sources tabs, `console.table`, `console.time`
- **Testing:** see file 09

### 3.11 WebAssembly (awareness)

WebAssembly lets near-native code (Rust, C++, Go) run in the browser for heavy tasks such as video, games or image processing. Learn it only when you have a performance problem JavaScript cannot solve.

### 3.12 Modern ECMAScript (ES2022–ES2024+) & Engine Internals

JavaScript evolves continuously through the TC39 standardization process. Modern production codebases rely heavily on these runtime features:

#### Change Array by Copy (ES2023)
Traditional methods (`sort()`, `reverse()`, `splice()`) mutate arrays in-place. The modern methods return fresh, mutated clones without modifying the original:

```js
const items = ["banana", "apple", "cherry"];

const sorted = items.toSorted();     // ["apple", "banana", "cherry"]
const reversed = items.toReversed(); // ["cherry", "apple", "banana"]
const replaced = items.with(1, "mango"); // ["banana", "mango", "cherry"]
const spliced = items.toSpliced(0, 1, "grape"); // ["grape", "apple", "cherry"]

console.log(items); // Original remains completely untouched!
```

#### Object.groupBy & Map.groupBy (ES2024)
Group collections into buckets natively without importing Lodash or writing boilerplate `reduce`:

```js
const inventory = [
  { name: "Asparagus", type: "vegetables", quantity: 5 },
  { name: "Bananas", type: "fruit", quantity: 0 },
  { name: "Cherries", type: "fruit", quantity: 12 },
  { name: "Fish", type: "meat", quantity: 22 },
];

const result = Object.groupBy(inventory, ({ type }) => type);
// {
//   vegetables: [{ name: "Asparagus", ... }],
//   fruit: [{ name: "Bananas", ... }, { name: "Cherries", ... }],
//   meat: [{ name: "Fish", ... }]
// }

// Group into a Map using complex objects or primitives as keys:
const restockBuckets = Map.groupBy(inventory, ({ quantity }) =>
  quantity > 10 ? "sufficient" : "low"
);
```

#### Promise.withResolvers() (ES2024)
Eliminates awkward Promise executor closures when managing external event-driven cancellation, deferred execution, or stream bridges:

```js
// Before:
// let resolve, reject;
// const promise = new Promise((res, rej) => { resolve = res; reject = rej; });

// Modern:
const { promise, resolve, reject } = Promise.withResolvers();

// Resolve or reject from anywhere (event handlers, timeouts, message queues):
setTimeout(() => resolve("Operation completed!"), 1000);
const data = await promise;
```

#### Deep Cloning with structuredClone()
Standard native replacement for `JSON.parse(JSON.stringify(x))` and third-party deepClone utilities:

```js
const original = {
  date: new Date(),
  set: new Set([1, 2, 3]),
  map: new Map([["key", "value"]]),
  nested: { count: 42 }
};
original.self = original; // Circular reference!

const copy = structuredClone(original);
console.log(copy.date instanceof Date); // true (JSON converts to string!)
console.log(copy.self === copy);        // true (handles circular cycles safely!)
```

#### Rendering Pipeline, Frame Budgets & `scheduler.yield()`
To maintain 60-120fps responsiveness and score green on Core Web Vitals (**INP - Interaction to Next Paint**), JavaScript must yield execution to the browser before exceeding the 50ms Long Task threshold:

```js
// Long task broken down with cooperative yielding
async function processLargeDataset(items) {
  for (let i = 0; i < items.length; i++) {
    expensiveComputation(items[i]);

    // Yield every 50 items so browser can process user clicks & render frames
    if (i % 50 === 0) {
      if ("scheduler" in window && "yield" in window.scheduler) {
        await window.scheduler.yield(); // Native task yield
      } else {
        await new Promise(resolve => setTimeout(resolve, 0)); // Fallback macrotask yield
      }
    }
  }
}
```

#### DevQuest Campaign Combat Lore: Defeating The Callback Kraken

In the **JavaScript Realm**, cadets encounter *The Callback Kraken* (Dread of the Deep Event Loop). The Kraken ensnares applications in 8-level-deep pyramid of doom callback hell and unhandled Promise rejections.

To banish the Kraken in the Boss Arena:
1. **Sever Callback Tendrils:** Refactor deeply nested asynchronous callbacks (`getUser(id, (err, user) => getOrders(user.id, (err, orders) => ...))`) into sequential linear `async/await` with `try / catch`.
2. **Resilient Parallel Coordination:** Use `Promise.allSettled()` instead of brittle `Promise.all()` so that a single rejected downstream request does not crash sibling tasks.

---

## Projects

**Mini project: GitHub profile finder**

- [ ] Search a username, fetch from the GitHub API, show avatar, bio and repositories
- [ ] Loading and error states, debounced input, cancelled stale requests
- [ ] Last search saved in `localStorage`, split into ES modules
- [ ] At least 5 tests (see file 09)

**Challenge projects:**

- [ ] A Kanban board with drag and drop, saved to `localStorage`
- [ ] A weather dashboard with geolocation and a 5-day forecast
- [ ] A tiny reactive framework: a `Proxy`-based `state` that re-renders a template when values change
- [ ] A markdown note app that works offline (service worker)

## Self-check

- [ ] Explain closures, `this` and the event loop with examples
- [ ] Write an async function with timeout, retries and cancellation
- [ ] Build a UI feature using only the DOM API in under an hour
- [ ] Explain the difference between `==`, `===`, `null`, `undefined` and `NaN`
- [ ] Explain what a Promise is without using the word "promise"
