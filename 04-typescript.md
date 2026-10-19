# 04. TypeScript

TypeScript is JavaScript plus **types**. It catches mistakes while you type, before the code runs, and makes editors much smarter (autocomplete, safe renames). Browsers cannot run it directly, so it is compiled (or run with `tsx`) into JavaScript. Types are erased at runtime, which matters later.

**Contents:** [Level 1](#level-1-fundamentals) | [Level 2](#level-2-intermediate) | [Level 3](#level-3-advanced) | [Projects](#projects)

---

## Level 1: Fundamentals

### 1.1 Setup and basic types

**Example:**

```bash
mkdir ts-practice && cd ts-practice
npm init -y
npm install -D typescript tsx @types/node
npx tsc --init
npx tsx index.ts        # run directly
npx tsc --noEmit        # type-check only
```

```ts
const name: string = "Chan";
let age: number = 25;
const active: boolean = true;
const tags: string[] = ["a", "b"];          // or Array<string>
const point: [number, number] = [10, 20];   // tuple: fixed length and types
let id: string | number = 1;                // union
let anything: unknown;                      // safe "could be anything"

// age = "x";   // Error: Type 'string' is not assignable to type 'number'
```

Types are usually **inferred**: `const n = 5` is already `number`. Write types where TypeScript cannot guess them: function parameters, empty arrays, and public APIs.

**Task:**

- [ ] Set up the project above and deliberately cause 5 type errors. Read each message and fix it

**Checkpoint:** what does the compiler say when you assign a string to a `number`? What is the difference between `string` and `"hello"` as a type?

### 1.2 Functions

```ts
function add(a: number, b: number): number {
  return a + b;
}
const greet = (name: string, greeting = "Hello"): string => `${greeting}, ${name}`;
const log = (message: string, ...rest: unknown[]): void => console.log(message, ...rest);
function find(id: number, fallback?: string): string { return fallback ?? String(id); }   // optional param

type Operation = (a: number, b: number) => number;
const subtract: Operation = (a, b) => a - b;
```

**Task:**

- [ ] Type five small functions: one with an optional parameter, one with a default, one with rest parameters, one returning `void`, one accepting a callback

### 1.3 Objects, `interface` and `type`

**Concept:** an `interface` or `type` describes the shape of an object. Literal unions restrict a value to specific options.

```ts
interface User {
  id: number;
  name: string;
  email?: string;            // optional
  readonly createdAt: Date;  // cannot be reassigned
}

type Status = "active" | "inactive" | "banned";          // literal union
type Point = { x: number; y: number };
type Admin = User & { permissions: string[] };           // intersection

function describe(user: User, status: Status = "active"): string {
  return `${user.name} is ${status}`;
}
```

**Interface vs type:** both describe objects. Interfaces can be extended and merged (`extends`, declaration merging). Types can also name unions, tuples and primitives. Pick one convention per project (many teams use `interface` for objects and `type` for everything else).

**Task:**

- [ ] Define `Product` and `CartItem` types and write `cartTotal(items: CartItem[]): number`

**Checkpoint:** when can you use `type` but not `interface`?

### 1.4 Enums, `any`, `unknown`, `never`, `void`

```ts
enum Role { Admin, User }                       // compiles to a runtime object
const Roles = { Admin: "admin", User: "user" } as const;   // popular alternative
type RoleName = (typeof Roles)[keyof typeof Roles];        // "admin" | "user"

let a: any = 5;          // turns checking OFF: avoid
let u: unknown = 5;      // forces you to check before use
// u.toFixed();          // Error until narrowed
function fail(msg: string): never { throw new Error(msg); }   // never returns
```

**Rule:** use `unknown`, not `any`. Turn on the ESLint rule `no-explicit-any`.

---

## Level 2: Intermediate

### 2.1 Narrowing

**Concept:** TypeScript narrows a type inside checks, so each branch is safe.

```ts
function format(value: string | number | null): string {
  if (value === null) return "none";
  if (typeof value === "string") return value.toUpperCase();   // string here
  return value.toFixed(2);                                      // number here
}

function isUser(x: unknown): x is User {                        // type guard
  return typeof x === "object" && x !== null && "name" in x;
}

if (err instanceof Error) console.log(err.message);
```

### 2.2 Discriminated unions

**Concept:** a shared literal field (`kind`, `type`, `status`) tells TypeScript exactly which variant you have.

```ts
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; size: number };

function area(s: Shape): number {
  switch (s.kind) {
    case "circle": return Math.PI * s.radius ** 2;
    case "square": return s.size ** 2;
    default: {
      const _exhaustive: never = s;     // compile error if a case is missing
      return _exhaustive;
    }
  }
}

type LoadState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; message: string };
```

**Task:**

- [ ] Model a `PaymentMethod` union (card, cash, bank transfer, each with different fields) and write `describe(payment)` with exhaustive checking
- [ ] Use `LoadState<User[]>` in your React user directory (file 05)

### 2.3 Generics

**Concept:** type parameters let one function or type work with many types without losing safety.

```ts
function first<T>(items: T[]): T | undefined { return items[0]; }

interface ApiResponse<T> { data: T; error: string | null; }

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as T;
}
const users = await fetchJson<User[]>("/api/users");

function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {   // constraint
  return items.map(i => i[key]);
}
pluck(users, "name");   // string[]

class Stack<T> {
  private items: T[] = [];
  push(item: T) { this.items.push(item); }
  pop(): T | undefined { return this.items.pop(); }
}
```

**Task:**

- [ ] Write a generic `groupBy<T>(items: T[], key: keyof T)` and a generic `Result<T, E>` type with helper functions `ok` and `err`

### 2.4 Utility types

```ts
type UserUpdate  = Partial<User>;                 // all optional
type FullUser    = Required<User>;                // all required
type PublicUser  = Omit<User, "email">;           // remove fields
type NameOnly    = Pick<User, "name" | "id">;     // keep fields
type UserMap     = Record<number, User>;          // keyed object
type Frozen      = Readonly<User>;
type NotNull     = NonNullable<string | null>;    // string
type Fn          = ReturnType<typeof add>;        // number
type Args        = Parameters<typeof add>;        // [a: number, b: number]
type Resolved    = Awaited<ReturnType<typeof fetchJson<User[]>>>;
```

**Task:**

- [ ] From one `User` type, derive `CreateUserInput` (no `id`, no `createdAt`), `UpdateUserInput` (all optional) and `PublicUser` without rewriting fields

### 2.5 Classes and OOP in TypeScript

```ts
abstract class Shape {
  constructor(public readonly name: string) {}   // parameter properties
  abstract area(): number;
  describe() { return `${this.name}: ${this.area().toFixed(2)}`; }
}

class Circle extends Shape {
  constructor(private radius: number) { super("circle"); }
  area() { return Math.PI * this.radius ** 2; }
}

interface Logger { log(msg: string): void; }
class ConsoleLogger implements Logger { log(msg: string) { console.log(msg); } }
```

Access modifiers: `public`, `private`, `protected` (compile-time only; use `#field` for real runtime privacy).

### 2.6 Strict mode and `tsconfig.json`

Turn these on in every new project:

- `strict: true` (enables `strictNullChecks`, `noImplicitAny` and more)
- `noUncheckedIndexedAccess: true` (array and record access may be `undefined`)
- `noImplicitReturns`, `noFallthroughCasesInSwitch`
- `exactOptionalPropertyTypes`, `verbatimModuleSyntax`

Other settings to understand: `target` (output JS version), `module` and `moduleResolution` (`bundler` for Vite, `NodeNext` for Node), `lib`, `jsx`, `paths` (import aliases), `outDir`, `rootDir`, `skipLibCheck`, `isolatedModules`, `esModuleInterop`.

**Task:**

- [ ] Rename a small JavaScript project to `.ts`, enable `strict`, and fix every error without using `any`

### 2.7 Typing common things

```ts
// DOM
const input = document.querySelector<HTMLInputElement>("#email");
input?.addEventListener("input", e => console.log((e.target as HTMLInputElement).value));

// Express
import type { Request, Response } from "express";
app.get("/users/:id", (req: Request<{ id: string }>, res: Response<User | { error: string }>) => { /* ... */ });

// React
type ButtonProps = React.ComponentProps<"button"> & { variant?: "primary" | "ghost" };
const [user, setUser] = useState<User | null>(null);

// Events and JSON
function parseJson(text: string): unknown { return JSON.parse(text); }

// Type-only imports (erased at build time)
import type { User } from "./types";
```

---

## Level 3: Advanced

### 3.1 `keyof`, `typeof`, indexed access and `as const`

```ts
const routes = { home: "/", about: "/about" } as const;
type RouteName = keyof typeof routes;          // "home" | "about"
type RoutePath = (typeof routes)[RouteName];   // "/" | "/about"

type UserKeys = keyof User;                    // "id" | "name" | "email" | "createdAt"
type EmailType = User["email"];                // string | undefined

const config = { port: 3000, debug: true } satisfies Record<string, number | boolean>;
```

`satisfies` checks a value against a type without widening it (you keep the exact literal types).

### 3.2 Mapped and conditional types

```ts
type Optional<T> = { [K in keyof T]?: T[K] };
type Nullable<T> = { [K in keyof T]: T[K] | null };
type Getters<T> = { [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K] };

type ElementOf<T> = T extends (infer U)[] ? U : never;
type A = ElementOf<string[]>;                  // string

type IsString<T> = T extends string ? true : false;
type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };
```

**Task:**

- [ ] Write `DeepReadonly<T>`, `PickByType<T, U>` (keep only properties of type `U`), and `Getters<T>` as above

### 3.3 Template literal types

```ts
type Method = "GET" | "POST";
type Endpoint = `/api/${"users" | "posts"}`;
type Handler = `${Lowercase<Method>}Handler`;     // "getHandler" | "postHandler"
type EventName<T extends string> = `on${Capitalize<T>}`;
```

### 3.4 Advanced patterns

```ts
// Branded types: stop mixing up IDs
type UserId = number & { readonly __brand: "UserId" };
type PostId = number & { readonly __brand: "PostId" };
const userId = 5 as UserId;
// function getPost(id: PostId) {}  getPost(userId)  // Error

// Const type parameters (TypeScript 5.0+)
// Infers exact literal tuple/object types without requiring the caller to write "as const"
function createConfig<const T extends Record<string, readonly string[]>>(config: T): T {
  return config;
}
const appConfig = createConfig({ envs: ["prod", "stage"] });
// typeof appConfig.envs is readonly ["prod", "stage"], NOT string[]!

// Type Predicates (Narrowing without unsound assertions)
interface Cat { meow(): void; }
interface Dog { bark(): void; }
function isDog(animal: Cat | Dog): animal is Dog {
  return "bark" in animal;
}

// Assertion functions
function assertIsString(v: unknown): asserts v is string {
  if (typeof v !== "string") throw new Error("Not a string");
}

// Function overloads
function toArray(x: string): string[];
function toArray(x: number): number[];
function toArray(x: string | number) { return [x]; }

// Variance, readonly arrays
function sum(nums: readonly number[]) { return nums.reduce((a, b) => a + b, 0); }
```

#### Production Compiler Hygiene: `noUncheckedIndexedAccess`
By default, TypeScript assumes array indices and string record keys always exist (`arr[0]` is typed as `string`), causing silent runtime `TypeError: Cannot read properties of undefined`:

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true
  }
}
```

```ts
const items: string[] = [];
const first = items[0]; // With flag: string | undefined (forces safety checks!)
```

### 3.5 Declaration files and module augmentation

```ts
// types/express.d.ts: add a property to Express's Request
declare global {
  namespace Express {
    interface Request { user?: { id: number; role: "admin" | "user" }; }
  }
}
export {};

// Typing an untyped JS library
declare module "legacy-lib" {
  export function doThing(input: string): number;
}
```

Install types for JavaScript libraries from `@types/*` (for example `npm i -D @types/node`).

### 3.6 Runtime validation with Zod

**Concept:** types disappear at runtime, so API data is never truly checked. A schema validates real data and gives you the type for free (single source of truth).

```ts
import { z } from "zod";

const UserSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  email: z.string().email().optional(),
  role: z.enum(["admin", "user"]).default("user"),
});
type User = z.infer<typeof UserSchema>;

const result = UserSchema.safeParse(await res.json());
if (!result.success) console.error(result.error.flatten());
else result.data;   // fully typed User
```

Also look at **tRPC** and **OpenAPI generators** for end-to-end typed APIs, and **Valibot** as a smaller alternative.

**Task:**

- [ ] Validate the GitHub API response in your profile finder with Zod and show a friendly error when the shape is wrong

### 3.6b Decorators (awareness)

Decorators (`@Injectable()`, `@Controller()`) appear in Angular and NestJS. Learn them when you need those frameworks.

### 3.7 Performance and tooling

- Use `tsc --noEmit` in CI and your editor for checking; use esbuild/SWC/Vite for building
- Prefer simple types over deeply nested conditional types (they slow the compiler)
- Use **project references** and `incremental` builds in monorepos
- Test types with `expectTypeOf` (Vitest) or `tsd`

---

## Projects

**Mini project:** convert the GitHub profile finder (file 03) to TypeScript

- [ ] Strict mode on, zero `any`
- [ ] Typed API functions with generics
- [ ] A discriminated union for loading, success and error states
- [ ] Responses validated with Zod

**Challenge projects:**

- [ ] A typed event emitter: `emitter.on("login", user => ...)` where event names and payloads are checked
- [ ] A typed fetch wrapper `api.get<User[]>("/users")` that validates with a schema and returns `Result<T, ApiError>`
- [ ] A type-safe form builder where the field config object determines the output type

## Self-check

- [ ] Explain `unknown` vs `any`, `type` vs `interface`, and why generics exist
- [ ] Write a discriminated union with an exhaustive `switch`
- [ ] Derive new types from existing ones with utility and mapped types
- [ ] Explain why TypeScript types do not protect you from bad API data, and fix it
