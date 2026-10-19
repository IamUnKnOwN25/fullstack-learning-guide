# 10. Computer Science Fundamentals and System Design

These topics make you a stronger problem solver, help you pass interviews, and let you reason about why systems are slow or break. Study them a little every day alongside the web topics.

**Contents:** [Level 1](#level-1-fundamentals) | [Level 2](#level-2-intermediate) | [Level 3](#level-3-advanced) | [Professional skills](#professional-skills) | [Projects](#projects)

---

## Level 1: Fundamentals

### 1.1 Big-O notation

**Concept:** Big-O describes how the work grows as the input grows (not exact seconds).

| Notation | Name | Example |
|----------|------|---------|
| `O(1)` | Constant | Read an array item by index, hash map lookup |
| `O(log n)` | Logarithmic | Binary search (halving each step) |
| `O(n)` | Linear | One loop through the data |
| `O(n log n)` | Linearithmic | Good sorting (merge sort, `Array.sort`) |
| `O(n^2)` | Quadratic | Nested loops over the same data |
| `O(2^n)` | Exponential | Naive recursive subsets |

**Example: two ways to check for duplicates**

```ts
// O(n^2): compares every pair
function hasDuplicateSlow(nums: number[]): boolean {
  for (let i = 0; i < nums.length; i++)
    for (let j = i + 1; j < nums.length; j++)
      if (nums[i] === nums[j]) return true;
  return false;
}

// O(n) time, O(n) extra space: a Set remembers what it has seen
function hasDuplicate(nums: number[]): boolean {
  const seen = new Set<number>();
  for (const n of nums) {
    if (seen.has(n)) return true;
    seen.add(n);
  }
  return false;
}
```

Also track **space complexity** (extra memory) and remember the classic trade-off: use more memory to save time.

**Task:**

- [ ] Write the Big-O (time and space) of 10 functions you wrote before and justify each

**Checkpoint:** why is `O(n^2)` fine for 100 items but dangerous for 1,000,000?

### 1.2 Core data structures

| Structure | Strengths | Weakness | JS tool |
|-----------|-----------|----------|---------|
| Array | Index access `O(1)`, simple | Insert or delete in the middle `O(n)` | `[]` |
| Hash map | Lookup, insert, delete `O(1)` average | Unordered (Map keeps insertion order), memory | `Map`, `{}` |
| Set | Fast membership test and uniqueness | No index access | `Set` |
| Stack (LIFO) | Undo, parsing, DFS, call stack | Only the top is accessible | array `push`/`pop` |
| Queue (FIFO) | Scheduling, BFS | `shift` on arrays is `O(n)`, use an index or a linked list | array with head index |
| Linked list | Cheap insert and remove with a pointer | No random access | custom class |
| Tree | Hierarchy, fast search when balanced | Can degrade if unbalanced | custom class |
| Heap | Get min or max `O(1)`, push or pop `O(log n)` | Not for searching | custom or library |
| Graph | Networks, maps, dependencies | More complex algorithms | adjacency list with `Map` |

```ts
// Stack: valid parentheses
function isValid(s: string): boolean {
  const pairs: Record<string, string> = { ")": "(", "]": "[", "}": "{" };
  const stack: string[] = [];
  for (const ch of s) {
    if (ch in pairs) { if (stack.pop() !== pairs[ch]) return false; }
    else stack.push(ch);
  }
  return stack.length === 0;
}

// Hash map: two sum in O(n)
function twoSum(nums: number[], target: number): [number, number] | null {
  const seen = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need)!, i];
    seen.set(nums[i], i);
  }
  return null;
}

// Linked list: reverse
type ListNode = { val: number; next: ListNode | null };
function reverse(head: ListNode | null): ListNode | null {
  let prev: ListNode | null = null;
  while (head) { [head.next, prev, head] = [prev, head, head.next]; }
  return prev;
}
```

**Tasks:**

- [ ] Implement a stack, a queue, a linked list and a hash map from scratch (without using `Map`)
- [ ] Solve: Valid Parentheses, Two Sum, Reverse Linked List, Merge Two Sorted Lists, Contains Duplicate, Best Time to Buy and Sell Stock

### 1.3 Searching, sorting and recursion

```ts
function binarySearch(sorted: number[], target: number): number {
  let lo = 0, hi = sorted.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (sorted[mid] === target) return mid;
    if (sorted[mid] < target) lo = mid + 1; else hi = mid - 1;
  }
  return -1;
}

function mergeSort(a: number[]): number[] {
  if (a.length <= 1) return a;
  const mid = a.length >> 1;
  const left = mergeSort(a.slice(0, mid)), right = mergeSort(a.slice(mid));
  const out: number[] = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) out.push(left[i] <= right[j] ? left[i++] : right[j++]);
  return [...out, ...left.slice(i), ...right.slice(j)];
}

// Recursion needs a base case and a smaller problem
const factorial = (n: number): number => (n <= 1 ? 1 : n * factorial(n - 1));
```

Know bubble, selection and insertion sort (slow, simple), merge sort and quicksort (`O(n log n)`), and that `Array.sort` in JS sorts strings by default (pass a comparator for numbers).

**Task:**

- [ ] Implement binary search, bubble sort, merge sort and quicksort, and benchmark them on 100,000 numbers

---

## Level 2: Intermediate

### 2.1 Trees and graphs

```ts
type TreeNode = { val: number; left: TreeNode | null; right: TreeNode | null };

// Depth-first (recursion)
const maxDepth = (n: TreeNode | null): number => (n ? 1 + Math.max(maxDepth(n.left), maxDepth(n.right)) : 0);

// Breadth-first (queue): level by level
function levelOrder(root: TreeNode | null): number[][] {
  if (!root) return [];
  const result: number[][] = [];
  let queue = [root];
  while (queue.length) {
    result.push(queue.map(n => n.val));
    queue = queue.flatMap(n => [n.left, n.right].filter((c): c is TreeNode => c !== null));
  }
  return result;
}

// Graph as adjacency list, BFS shortest path in an unweighted graph
function shortestPath(graph: Map<string, string[]>, start: string, end: string): number {
  const queue: [string, number][] = [[start, 0]];
  const seen = new Set([start]);
  while (queue.length) {
    const [node, dist] = queue.shift()!;
    if (node === end) return dist;
    for (const next of graph.get(node) ?? []) if (!seen.has(next)) { seen.add(next); queue.push([next, dist + 1]); }
  }
  return -1;
}
```

Know: binary search trees, balanced trees (AVL, red-black: awareness), tries (autocomplete), union-find, topological sort (build order), Dijkstra (weighted shortest path).

**Task:**

- [ ] Solve: Max Depth of Binary Tree, Level Order Traversal, Number of Islands, Course Schedule, Clone Graph

### 2.2 Patterns that solve many problems

- **Two pointers:** sorted arrays, palindromes (`left` and `right` move inward)
- **Sliding window:** longest substring, subarray sums (grow and shrink a window)
- **Hash map for counting and lookup**
- **Prefix sums, monotonic stack, binary search on the answer**
- **Backtracking:** permutations, subsets, N-Queens (try, recurse, undo)
- **Greedy:** choose the locally best option (interval scheduling)
- **Dynamic programming:** break into overlapping subproblems and remember answers

```ts
// Sliding window: longest substring without repeating characters
function longestUnique(s: string): number {
  const last = new Map<string, number>();
  let start = 0, best = 0;
  for (let i = 0; i < s.length; i++) {
    if (last.has(s[i]) && last.get(s[i])! >= start) start = last.get(s[i])! + 1;
    last.set(s[i], i);
    best = Math.max(best, i - start + 1);
  }
  return best;
}

// Dynamic programming: climbing stairs (Fibonacci with memory)
function climb(n: number): number {
  let a = 1, b = 1;
  for (let i = 2; i <= n; i++) [a, b] = [b, a + b];
  return b;
}
```

**Task:**

- [ ] Solve 3 problems per pattern: Valid Palindrome, Longest Substring Without Repeating Characters, Subsets, Climbing Stairs, Coin Change, House Robber

### 2.3 How a computer runs your code

- **CPU, memory (RAM), disk, network:** each is orders of magnitude slower than the one before
- **Processes and threads:** a process has its own memory, threads share it. **Concurrency** is dealing with many things at once, **parallelism** is doing many at once
- **Stack and heap:** function calls live on the stack; objects live on the heap and are garbage collected in JavaScript
- **Compilation vs interpretation vs JIT:** V8 compiles hot code while running it
- **Networking:** IP, TCP (reliable) vs UDP (fast), DNS, HTTP/1.1, HTTP/2, HTTP/3 (QUIC), TLS handshake, latency vs bandwidth
- **Encoding:** bits and bytes, UTF-8, Base64, hashing vs encryption

### 2.4 How the browser works

URL typed, DNS lookup, TCP and TLS connection, HTTP request, HTML parsed into the **DOM**, CSS into the **CSSOM**, combined into a render tree, **layout** (sizes and positions), **paint**, **composite** (layers on the GPU). Scripts without `defer` block parsing. Changing layout is more expensive than changing color or transform. JavaScript runs on the main thread with rendering, so long tasks freeze the page.

**Task:**

- [ ] Record a page load in the DevTools Performance tab and name each phase you can see (parse, scripts, layout, paint)

---

## Level 3: Advanced

### 3.1 Software design principles

**SOLID:**

- **S**ingle responsibility: a module has one reason to change
- **O**pen/closed: extend behavior without editing existing code
- **L**iskov substitution: subtypes can replace their parents safely
- **I**nterface segregation: many small interfaces beat one large one
- **D**ependency inversion: depend on abstractions, pass dependencies in

**Also know:** DRY (but do not abstract too early: duplication is cheaper than the wrong abstraction), KISS, YAGNI, composition over inheritance, separation of concerns, Law of Demeter, immutability, and writing code that is easy to delete.

```ts
// Dependency inversion: the service depends on an interface, not on a concrete database
interface UserRepo { findByEmail(email: string): Promise<User | null>; save(user: User): Promise<void>; }

class SignupService {
  constructor(private repo: UserRepo, private mailer: Mailer) {}
  async signup(email: string) {
    if (await this.repo.findByEmail(email)) throw new Error("exists");
    await this.repo.save({ email });
    await this.mailer.send(email, "Welcome");
  }
}
```

### 3.2 Design patterns (know the names and the problems they solve)

| Pattern | Problem it solves | Web example |
|---------|-------------------|-------------|
| Factory | Create objects without hard-coding classes | `createLogger(env)` |
| Singleton | One shared instance | Database pool |
| Observer / Pub-Sub | Notify many listeners | Event emitter, Redux store |
| Strategy | Swap algorithms at runtime | Payment providers, sorting |
| Adapter | Make incompatible interfaces work together | Wrap a third-party API |
| Decorator / Middleware | Add behavior around something | Express middleware |
| Repository | Hide data access | `UserRepo` above |
| Command | Turn actions into objects | Undo/redo |
| State machine | Explicit states and transitions | Checkout flow, XState |

**Task:**

- [ ] Implement a payment module using the Strategy pattern (card, bank, wallet) and an undo/redo editor using Command

### 3.3 System design

**Concept:** designing an application that handles many users, stays available and can grow. Interviews ask this; real work needs it.

**Building blocks:**

- **Load balancer:** spreads requests across servers (round robin, least connections), health checks
- **Caching:** browser, CDN, application (Redis), database. Strategies: cache-aside, write-through. Hard part: invalidation
- **Database scaling:** indexes, read replicas, partitioning and sharding, connection pooling
- **Queues and streams:** decouple slow work (RabbitMQ, SQS, Kafka)
- **CDN and object storage** for static files and media
- **API gateway, rate limiting, authentication** at the edge
- **Idempotency, retries and backoff** so repeated requests are safe
- **Monolith vs microservices:** start monolith, split when team or scaling forces it
- **CAP theorem:** during a network partition choose consistency or availability. **Eventual consistency** is the common trade-off
- **Observability and failure:** timeouts, circuit breakers, graceful degradation, redundancy

**A method for any design question:**

1. Clarify requirements (features, users, read vs write ratio) and constraints
2. Estimate scale (requests per second, storage per year)
3. Sketch the high-level design (client, API, database, cache, queue)
4. Detail the data model and the API
5. Find bottlenecks and single points of failure, then scale them
6. Discuss trade-offs honestly

**Back-of-envelope numbers:** 1 million requests per day is about 12 per second. 86,400 seconds in a day. Memory read about 100 ns, SSD read about 100 microseconds, network round trip in a data center about 0.5 ms, across continents about 150 ms.

**Tasks:**

- [ ] Design a URL shortener: API, database schema, how IDs are generated, caching, what changes at 100 million links
- [ ] Design a chat app, a news feed, a rate limiter and a file-sharing service (one page each: diagram, data model, bottlenecks)

### 3.4 Concurrency and distributed systems (awareness)

Race conditions, locks, atomic operations, optimistic concurrency (version columns), idempotency keys, exactly-once myths, distributed transactions and sagas, consensus (Raft: awareness), clock problems, CRDTs for collaborative editing.

---

## Professional skills

- **Read documentation and source code** before asking, and ask good questions (what you tried, what you expected, what happened, a minimal example)
- **Write clearly:** READMEs, commit messages, design docs, pull request descriptions
- **Estimate** work in ranges, split big tasks into small ones, and communicate early when something slips
- **Work in a team:** Agile and Scrum basics (sprints, standups, retros), code reviews, working agreements
- **Use AI tools well:** let them draft and explain, but you review everything, write the tests, and understand every line you ship
- **Keep learning:** one deep topic per month, read other people's code, write notes or blog posts, and contribute to open source (start with documentation and small bug fixes)

---

## Projects

**Mini project: algorithm practice log**

- [ ] 60 solved problems in a Git repo (10 per topic: arrays and hash maps, two pointers and windows, stacks and queues, linked lists, trees, graphs and DP)
- [ ] A README table with problem, pattern, time and space complexity, and the key insight

**Challenge projects:**

- [ ] Build an LRU cache (hash map plus doubly linked list) with `O(1)` get and put, and use it in your API
- [ ] Implement a tiny search engine: tokenizer, inverted index, TF-IDF ranking
- [ ] Build a text editor core with undo and redo (Command pattern) and test it
- [ ] Write two system-design documents and have someone challenge them

## Self-check

- [ ] State the time and space complexity of any code you write
- [ ] Pick the right data structure for 5 different problems and justify it
- [ ] Solve a medium-level problem in 30 minutes with the pattern named out loud
- [ ] Draw and explain a scalable architecture for a simple app, including trade-offs
