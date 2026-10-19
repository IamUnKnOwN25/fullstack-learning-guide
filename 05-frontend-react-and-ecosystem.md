# 05. Frontend: React and the Ecosystem

React builds interfaces from small reusable **components**. You describe what the screen should look like for the current data, and React updates the page when the data changes. Learn React deeply first. Vue, Svelte and Angular share most of the ideas.

**Prerequisites:** files 01 to 04 (especially async JavaScript and TypeScript basics).

**Contents:** [Level 1](#level-1-fundamentals) | [Level 2](#level-2-intermediate) | [Level 3](#level-3-advanced) | [Other frameworks](#other-frameworks-awareness) | [Frontend engineering](#frontend-engineering) | [Projects](#projects)

---

## Level 1: Fundamentals

### 1.1 Setup and components

**Concept:** a component is a function that returns JSX (HTML-like syntax inside JavaScript). Data flows in through **props**.

**Example:**

```bash
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install
npm run dev
```

```tsx
type GreetingProps = { name: string; excited?: boolean };

function Greeting({ name, excited = false }: GreetingProps) {
  return <h1>Hello, {name}{excited && "!"}</h1>;
}

export default function App() {
  return (
    <main>
      <Greeting name="Chan" excited />
      <Greeting name="Ana" />
    </main>
  );
}
```

JSX rules: one root element (or a fragment `<>...</>`), `className` instead of `class`, `htmlFor` instead of `for`, close every tag, and put JavaScript in `{ }`.

**Task:**

- [ ] Build a `ProfileCard` component (name, role, avatar) and render three of them
- [ ] Split the page into `Header`, `Main` and `Footer` components in separate files

**Checkpoint:** why must component names start with a capital letter? What are props, and can a child change them?

### 1.2 State and events

**Concept:** state is data that changes over time. Updating it re-renders the component. Never change state directly; always use the setter, and treat state as immutable.

```tsx
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(c => c + 1)}>
      Clicked {count} times
    </button>
  );
}

function NameEcho() {
  const [text, setText] = useState("");
  return (
    <>
      <input value={text} onChange={e => setText(e.target.value)} />
      <p>You typed: {text}</p>
    </>
  );
}

function Form() {
  const [user, setUser] = useState({ name: "", age: 0 });
  return <input value={user.name} onChange={e => setUser({ ...user, name: e.target.value })} />;
}
```

**Task:**

- [ ] Counter with +, - and reset; a show/hide toggle; a controlled input that echoes text
- [ ] A form with 3 controlled inputs stored in one state object

**Checkpoint:** why does `count++` not update the screen? Why use `setCount(c => c + 1)` instead of `setCount(count + 1)`?

### 1.3 Lists, keys and conditional rendering

```tsx
type Todo = { id: number; text: string; done: boolean };

function TodoList({ todos }: { todos: Todo[] }) {
  if (todos.length === 0) return <p>Nothing to do</p>;

  return (
    <ul>
      {todos.map(t => (
        <li key={t.id} className={t.done ? "done" : ""}>
          {t.text} {t.done && <span>(done)</span>}
        </li>
      ))}
    </ul>
  );
}
```

`key` must be stable and unique among siblings (an id, not the array index when items can reorder).

**Task:**

- [ ] Build a to-do app: add, toggle, delete, filter (all, active, done), and a counter of remaining items

### 1.4 Lifting state and component communication

When two components need the same data, move the state to their closest common parent and pass it down as props, with callbacks to change it.

```tsx
function Parent() {
  const [query, setQuery] = useState("");
  return (
    <>
      <SearchBox value={query} onChange={setQuery} />
      <Results query={query} />
    </>
  );
}
```

**Task:**

- [ ] Build a product list with a search box, a category filter and a sort dropdown, where each is its own component

---

## Level 2: Intermediate

### 2.1 Effects and data fetching

**Concept:** `useEffect` runs code that syncs with the outside world (fetching, timers, subscriptions). The dependency array says when to re-run it. The returned function cleans up.

```tsx
type User = { id: number; name: string };

function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch("https://jsonplaceholder.typicode.com/users", { signal: controller.signal })
      .then(res => { if (!res.ok) throw new Error("Request failed"); return res.json(); })
      .then(setUsers)
      .catch(err => { if (err.name !== "AbortError") setError(err.message); })
      .finally(() => setLoading(false));

    return () => controller.abort();   // cleanup on unmount or re-run
  }, []);                              // [] = run once

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}
```

**You probably do not need an effect** to derive data from props or state (compute it during render), to handle a click (use the handler), or to reset state (use a `key`).

**Task:**

- [ ] Rebuild your JavaScript user directory in React with loading, error and search
- [ ] Build a live clock with `setInterval` and proper cleanup

**Checkpoint:** what happens if you forget the dependency array? What happens if you forget cleanup?

### 2.2 Refs, reducers and context

```tsx
// useRef: a mutable box that does not re-render, or a handle to a DOM node
const inputRef = useRef<HTMLInputElement>(null);
useEffect(() => inputRef.current?.focus(), []);

// useReducer: complex state with named actions
type Action = { type: "add"; text: string } | { type: "toggle"; id: number };
function reducer(state: Todo[], action: Action): Todo[] {
  switch (action.type) {
    case "add": return [...state, { id: Date.now(), text: action.text, done: false }];
    case "toggle": return state.map(t => (t.id === action.id ? { ...t, done: !t.done } : t));
  }
}
const [todos, dispatch] = useReducer(reducer, []);

// Context: share data without passing props through every level
const ThemeContext = createContext<"light" | "dark">("light");
function Page() {
  const theme = useContext(ThemeContext);
  return <div className={theme}>...</div>;
}
```

**Task:**

- [ ] Rebuild the to-do app with `useReducer`
- [ ] Add a theme context with a toggle button available to every component

### 2.3 Custom hooks

A custom hook is a function starting with `use` that reuses stateful logic.

```tsx
function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    const saved = localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : initial;
  });
  useEffect(() => { localStorage.setItem(key, JSON.stringify(value)); }, [key, value]);
  return [value, setValue] as const;
}

function useDebounce<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
```

**Task:**

- [ ] Build `useLocalStorage`, `useDebounce`, `useFetch<T>(url)` and `useMediaQuery(query)` and use each in a project

### 2.4 Routing

```tsx
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate, Navigate, Outlet } from "react-router-dom";

function UserPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  return <button onClick={() => navigate(-1)}>Back from user {id}</button>;
}

export default function App() {
  return (
    <BrowserRouter>
      <nav><Link to="/">Home</Link> <Link to="/users/5">User 5</Link></nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/users/:id" element={<UserPage />} />
        <Route path="/admin" element={<RequireAuth><Admin /></RequireAuth>} />
        <Route path="*" element={<p>404</p>} />
      </Routes>
    </BrowserRouter>
  );
}
```

Know: nested routes (`Outlet`), protected routes, query params (`useSearchParams`), lazy-loaded routes, and the newer data-router APIs (loaders and actions).

### 2.5 Server state with TanStack Query

**Concept:** fetched data is not "state you own", it is a cache of the server. TanStack Query handles caching, loading, retries, refetching and invalidation.

```tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

function UsersPage() {
  const { data, isPending, error } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Failed");
      return (await res.json()) as User[];
    },
  });

  const qc = useQueryClient();
  const add = useMutation({
    mutationFn: (name: string) => fetch("/api/users", { method: "POST", body: JSON.stringify({ name }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });

  if (isPending) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  return <ul>{data.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}
```

**Task:**

- [ ] Build a list page and a detail page; notice going back is instant because of the cache
- [ ] Add create and delete with mutations and automatic list refresh

### 2.6 Forms and validation

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
});
type FormData = z.infer<typeof schema>;

function LoginForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  return (
    <form onSubmit={handleSubmit(async data => { await login(data); })}>
      <label htmlFor="email">Email</label>
      <input id="email" {...register("email")} />
      {errors.email && <p role="alert">{errors.email.message}</p>}

      <label htmlFor="pw">Password</label>
      <input id="pw" type="password" {...register("password")} />
      {errors.password && <p role="alert">{errors.password.message}</p>}

      <button disabled={isSubmitting}>Log in</button>
    </form>
  );
}
```

**Task:**

- [ ] Build login and registration forms with schema validation, server error display and a disabled submit while sending

### 2.7 Styling in React

- **CSS Modules:** `import styles from "./Card.module.css"` then `className={styles.card}`
- **Tailwind CSS:** utility classes (see file 02), the most common choice now
- **Component libraries:** shadcn/ui (copy-in components on Radix), MUI, Mantine, Chakra
- **CSS-in-JS:** styled-components, Emotion (runtime cost; less common in new projects)

**Task:**

- [ ] Build the same card in CSS Modules and in Tailwind and compare

### 2.8 Global state

**Rule of thumb:** local state first, then lifted state, then context (for rarely changing values), then a server-state library for API data, and a global store only when many distant components share client state.

```ts
import { create } from "zustand";

type CartState = { items: string[]; add: (item: string) => void; clear: () => void };

export const useCart = create<CartState>(set => ({
  items: [],
  add: item => set(state => ({ items: [...state.items, item] })),
  clear: () => set({ items: [] }),
}));

// In a component
const items = useCart(s => s.items);
```

Know the alternatives: **Redux Toolkit** (large apps, devtools, strict patterns), **Jotai/Recoil** (atoms), **XState** (state machines).

**Task:**

- [ ] Build a shopping cart with Zustand persisted to `localStorage`

---

## Level 3: Advanced

### 3.1 How React renders, and performance

**Concept:** a component re-renders when its state, props or context change (and, by default, when its parent re-renders). Rendering must be pure: same inputs, same output, no side effects.

```tsx
const Row = React.memo(function Row({ user }: { user: User }) { return <li>{user.name}</li>; });

const sorted = useMemo(() => [...users].sort(byName), [users]);
const onSelect = useCallback((id: number) => setSelected(id), []);

const Chart = lazy(() => import("./Chart"));
<Suspense fallback={<p>Loading chart...</p>}><Chart /></Suspense>

const [isPending, startTransition] = useTransition();   // keep the UI responsive during heavy updates
const deferred = useDeferredValue(query);
```

**Measure first** with the React DevTools Profiler. For very long lists, use virtualization (TanStack Virtual, react-window). The React Compiler can memoize automatically in newer versions.

**Task:**

- [ ] Render a list of 10,000 items, find what re-renders with the Profiler, then fix it with `memo` or virtualization

### 3.2 Error boundaries, portals and accessibility

```tsx
// Error boundary: catch render errors (use the react-error-boundary library)
import { ErrorBoundary } from "react-error-boundary";
<ErrorBoundary fallback={<p>Something went wrong</p>}><Widget /></ErrorBoundary>

// Portal: render a modal outside the parent's DOM tree
createPortal(<div className="modal">...</div>, document.body);
```

Always manage focus when opening modals, label every control, and use Radix or Headless UI for complex accessible widgets (dialogs, menus, comboboxes).

### 3.3 Next.js and server rendering

**Concept:** Next.js adds file-based routing, server rendering and API routes. Server Components fetch data on the server and send ready HTML, so less JavaScript reaches the browser.

```tsx
// app/users/page.tsx  (Server Component: no useEffect, no loading state boilerplate)
export default async function UsersPage() {
  const res = await fetch("https://jsonplaceholder.typicode.com/users", { next: { revalidate: 60 } });
  const users: { id: number; name: string }[] = await res.json();
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}

// app/users/[id]/page.tsx  (dynamic route)
export default async function UserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <h1>User {id}</h1>;
}

// A Client Component is needed for state, effects and browser APIs
"use client";

// app/actions.ts - React 19 / Next.js Server Actions
"use server";
import { revalidatePath, revalidateTag } from "next/cache";

export async function createPost(prevState: { error?: string } | null, formData: FormData) {
  const title = formData.get("title") as string;
  if (!title || title.trim().length === 0) return { error: "Title is required" };
  // await db.post.create({ data: { title } });
  revalidateTag("posts-feed");
  revalidatePath("/posts");
  return null;
}

// In a Client Component:
"use client";
import { useActionState, useOptimistic, use, Suspense } from "react";

// React 19 useOptimistic: Instant optimistic UI update before server roundtrip
function MessageThread({ messages, onSend }: { messages: string[]; onSend: (msg: string) => Promise<void> }) {
  const [optimisticMessages, setOptimisticMessages] = useOptimistic(
    messages,
    (state, newMsg: string) => [...state, `${newMsg} (sending...)`]
  );

  async function formAction(formData: FormData) {
    const text = formData.get("message") as string;
    setOptimisticMessages(text);
    await onSend(text);
  }

  return (
    <div>
      <ul>{optimisticMessages.map((m, i) => <li key={i}>{m}</li>)}</ul>
      <form action={formAction}>
        <input name="message" required />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

// React 19 use() API: Unwrap Promises directly inside components
function UserProfile({ userPromise }: { userPromise: Promise<{ name: string; role: string }> }) {
  const user = use(userPromise);
  return <div>Welcome, {user.name} ({user.role})</div>;
}
```

#### Next.js 15 App Router & Partial Prerendering (PPR)

**Partial Prerendering (PPR)** marries static shell delivery with dynamic server streaming in the exact same HTTP response:

```
┌────────────────────────────────────────────────────────┐
│ STATIC SHELL (Served instantly from Edge CDN cache)    │
│ Navbar • Product Layout • Sidebar • Footer             │
├────────────────────────────────────────────────────────┤
│ <Suspense fallback={<ProductReviewsSkeleton />}>       │
│   DYNAMIC HOLE (Streamed directly from server runtime) │
│   Live User Inventory • Real-Time Stock Status         │
│ </Suspense>                                            │
└────────────────────────────────────────────────────────┘
```

```tsx
// app/product/[id]/page.tsx
import { Suspense } from "react";

export const experimental_ppr = true; // Enables Partial Prerendering

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // Next.js 15: params is an async Promise

  return (
    <main>
      <h1>Product Catalog Item: {id}</h1>
      <StaticProductSpecs id={id} />
      <Suspense fallback={<p>Streaming live inventory from warehouse...</p>}>
        <LiveStockFeed productId={id} />
      </Suspense>
    </main>
  );
}
```

#### DevQuest Campaign Combat Lore: Defeating The Infinite Re-Render Fiend

In the **React Realm**, cadets encounter *The Infinite Re-Render Fiend*. This monster spawns when:
1. `useEffect` updates a state variable (`setCount(c => c + 1)`) without a dependency array or with an unstable object reference in its dependency list (`[ { id: 1 } ]`).
2. An event handler calls the setter immediately during render (`onClick={setCount(count + 1)}` instead of `onClick={() => setCount(c => c + 1)}`).
3. To vanquish the Fiend in the Boss Arena: pass functional state updates, extract inline object literals outside the component or wrap with stable references, and bind arrow functions inside JSX callbacks.

**Task:**

- [ ] Build a blog in Next.js with a list page, a dynamic `[slug]` page, metadata for SEO and a contact form using a Server Action. Deploy it to Vercel
- [ ] Implement `useOptimistic` in a to-do or comment feed for zero-latency interactions

**Checkpoint:** what is the difference between SSR, SSG and ISR? When do you need `"use client"`? How does `useOptimistic` prevent UI stutter?

### 3.4 Architecture and testing

- Organize by feature (`features/todos/{components,hooks,api,types}`), not by file type
- Keep components small; move logic to hooks and pure functions
- Separate server state, client state, and URL state
- Test behavior with Testing Library (see file 09), and develop components in isolation with **Storybook**

---

## Other frameworks (awareness)

Learn one deeply. Spend an afternoon with each of these so you can read them.

| Framework | Idea | Tiny example |
|-----------|------|--------------|
| **Vue** | Template-based, reactive refs | `const count = ref(0)` and `<button @click="count++">{{ count }}</button>` |
| **Svelte** | Compiler, minimal boilerplate | `let count = $state(0)` and `<button onclick={() => count++}>{count}</button>` |
| **Angular** | Full framework with TypeScript, DI, RxJS | `@Component({...}) class AppComponent {}` |
| **Solid** | Fine-grained reactivity, JSX | `const [count, setCount] = createSignal(0)` |
| **Astro** | Content sites, ships little JS | `.astro` files with islands of interactivity |

---

## Frontend engineering

### Performance and Core Web Vitals

- **LCP** (largest paint) under 2.5 s: optimize the hero image, server-render, preload fonts
- **INP** (interaction delay) under 200 ms: reduce long JavaScript tasks, split code
- **CLS** (layout shift) under 0.1: set image sizes, reserve space for ads and embeds
- Tools: Lighthouse, PageSpeed Insights, WebPageTest, bundle analyzers (`vite-bundle-visualizer`)
- Techniques: code splitting, lazy images, modern formats (AVIF, WebP), caching, tree shaking, removing unused dependencies

### Accessibility, SEO and internationalization

- Audit with axe and Lighthouse, test keyboard and screen reader flows
- SEO: titles, meta descriptions, canonical URLs, sitemap, structured data, server rendering
- i18n: `react-i18next` or `next-intl`, `Intl` APIs for dates and numbers, right-to-left support

### PWA and offline

Web app manifest, service worker (Workbox), install prompt, offline fallback pages, push notifications.

### Design workflow

Read Figma files (spacing, tokens, components), build a design system with tokens, document components in Storybook.

### Animation

Prefer CSS transitions first; use **Framer Motion** for layout and gesture animations; respect `prefers-reduced-motion`.

**Task:**

- [ ] Take any of your projects, hit Lighthouse 90+ in all four categories, and write down what you changed

---

## Projects

**Mini project: movie browser**

- [ ] Search a movie API with debounced input, TanStack Query and routing
- [ ] Detail page, favorites list saved to `localStorage`
- [ ] Loading skeletons, error states, responsive layout, dark mode
- [ ] A component test with Testing Library

**Challenge projects:**

- [ ] A Kanban board with drag and drop (dnd-kit), optimistic updates and undo
- [ ] A dashboard with charts (Recharts), filters in the URL and CSV export
- [ ] A Next.js e-commerce storefront with cart, checkout form and SEO metadata
- [ ] A multi-language, installable PWA to-do app that works offline

## Self-check

- [ ] Explain what causes a re-render, and fix an unnecessary one
- [ ] Choose between local state, context, a store and server state for 4 scenarios
- [ ] Build a form with validation, loading and error states, accessible by keyboard
- [ ] Explain Server vs Client Components and when to use each
