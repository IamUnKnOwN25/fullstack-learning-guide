# 07. Databases

A database stores data permanently and lets you search and change it safely and quickly. Start with **PostgreSQL** (SQL, tables with relationships). It is the best default choice for most applications. Then learn where NoSQL, Redis and search engines fit.

**Prerequisites:** file 06, level 1.

**Contents:** [Level 1](#level-1-fundamentals) | [Level 2](#level-2-intermediate) | [Level 3](#level-3-advanced) | [NoSQL and others](#beyond-relational) | [Projects](#projects)

---

## Level 1: Fundamentals

### 1.1 Tables, rows and keys

**Concept:** data lives in tables made of rows and columns. Every table has a **primary key** that uniquely identifies each row. Columns have types and constraints.

```sql
CREATE TABLE users (
  id         SERIAL PRIMARY KEY,                -- or: BIGINT GENERATED ALWAYS AS IDENTITY, or UUID
  name       TEXT NOT NULL,
  email      TEXT UNIQUE NOT NULL,
  age        INT CHECK (age >= 0),
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

Common types: `INT`, `BIGINT`, `NUMERIC(10,2)` (money, never `FLOAT`), `TEXT`, `BOOLEAN`, `DATE`, `TIMESTAMPTZ`, `UUID`, `JSONB`.

**Task:**

- [ ] Install PostgreSQL (or create a free hosted one on Neon or Supabase) and connect with `psql` or a GUI (DBeaver, TablePlus, pgAdmin)
- [ ] Create `authors` and `books` tables with sensible types and constraints

**Checkpoint:** why use `NUMERIC` for money? What is the difference between `PRIMARY KEY` and `UNIQUE`?

### 1.2 CRUD queries

```sql
INSERT INTO users (name, email) VALUES ('Chan', 'chan@example.com'), ('Ana', 'ana@example.com')
RETURNING id;

SELECT id, name FROM users
WHERE name LIKE 'C%' AND is_active
ORDER BY created_at DESC
LIMIT 10 OFFSET 0;

UPDATE users SET name = 'Chan R' WHERE id = 1;

DELETE FROM users WHERE id = 1;
```

Filtering tools: `=`, `<>`, `<`, `>`, `BETWEEN`, `IN (...)`, `LIKE`/`ILIKE`, `IS NULL`, `AND`/`OR`/`NOT`. Aggregates: `COUNT`, `SUM`, `AVG`, `MIN`, `MAX` with `GROUP BY` and `HAVING`. Use `DISTINCT` to remove duplicates.

```sql
SELECT country, COUNT(*) AS total, AVG(age) AS avg_age
FROM users
GROUP BY country
HAVING COUNT(*) > 5
ORDER BY total DESC;
```

**Order of execution:** `FROM`, `WHERE`, `GROUP BY`, `HAVING`, `SELECT`, `ORDER BY`, `LIMIT`.

**Task:**

- [ ] Insert 20 rows, then write one query each to filter, sort, paginate, count by group and update

**Checkpoint:** what happens if you run `UPDATE` or `DELETE` without a `WHERE`? What is the difference between `WHERE` and `HAVING`?

### 1.3 NULL

`NULL` means unknown. `NULL = NULL` is not true, use `IS NULL`. Aggregates ignore NULLs. `COALESCE(x, 'default')` provides a fallback.

---

## Level 2: Intermediate

### 2.1 Relationships and joins

**Concept:** instead of repeating data, store it once and link rows with a **foreign key**. Joins combine the tables back together when you query.

- **One-to-many:** a user has many posts (`posts.user_id`)
- **Many-to-many:** posts have many tags and tags have many posts (a join table `post_tags`)
- **One-to-one:** a user has one profile (unique foreign key)

```sql
CREATE TABLE posts (
  id         SERIAL PRIMARY KEY,
  user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  body       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE tags (id SERIAL PRIMARY KEY, name TEXT UNIQUE NOT NULL);
CREATE TABLE post_tags (
  post_id INT REFERENCES posts(id) ON DELETE CASCADE,
  tag_id  INT REFERENCES tags(id)  ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- Posts with their author
SELECT p.title, u.name
FROM posts p
JOIN users u ON u.id = p.user_id;

-- Post count per user, including users with zero posts
SELECT u.name, COUNT(p.id) AS post_count
FROM users u
LEFT JOIN posts p ON p.user_id = u.id
GROUP BY u.id
ORDER BY post_count DESC;

-- Users who never posted
SELECT u.* FROM users u LEFT JOIN posts p ON p.user_id = u.id WHERE p.id IS NULL;
```

Join types: `INNER` (matches only), `LEFT` (all from the left), `RIGHT`, `FULL`, `CROSS`. Self-joins model trees such as comments with replies.

**Task:**

- [ ] Link `books` to `authors`, add a many-to-many `genres` relationship, then write: books with authors, authors with their book counts, authors without books, and books with all their genres

**Checkpoint:** `JOIN` vs `LEFT JOIN`? What does `ON DELETE CASCADE` do, and when is it dangerous?

### 2.2 Schema design and normalization

**Rules of thumb:**

- One fact in one place (avoid duplicate data)
- **1NF:** each cell holds one value (no comma-separated lists)
- **2NF/3NF:** every column depends on the whole key and nothing but the key
- Use surrogate ids, add `created_at` and `updated_at`, name things consistently (`snake_case`, plural tables)
- Add constraints (`NOT NULL`, `UNIQUE`, `CHECK`, foreign keys): the database is your last line of defense
- Denormalize deliberately, only when measured performance needs it
- Prefer **soft delete** (`deleted_at`) only when you need history or undo

**Task:**

- [ ] Design the schema (on paper first) for an online store: users, products, orders, order items, addresses, reviews. Draw the ER diagram

### 2.3 Indexes

**Concept:** an index makes lookups fast (like a book index) but slows writes and uses space, so index columns you filter, join and sort on.

```sql
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE UNIQUE INDEX idx_users_email_lower ON users (lower(email));
CREATE INDEX idx_posts_user_created ON posts(user_id, created_at DESC);   -- composite: order matters
```

PostgreSQL does **not** index foreign keys automatically.

```sql
EXPLAIN ANALYZE SELECT * FROM posts WHERE user_id = 5;
```

Read the plan: `Seq Scan` on a big table usually means a missing index, `Index Scan` is good.

**Task:**

- [ ] Insert 200,000 rows with `generate_series`, run a query with and without an index, and compare times

### 2.4 Transactions and ACID

**Concept:** a transaction makes several changes succeed or fail together. **ACID:** Atomic (all or nothing), Consistent (rules hold), Isolated (concurrent transactions do not corrupt each other), Durable (committed data survives a crash).

```sql
BEGIN;
  UPDATE accounts SET balance = balance - 100 WHERE id = 1;
  UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;      -- or ROLLBACK; if anything failed
```

#### Isolation Levels & Concurrency Phenomena

| Isolation Level | Dirty Read | Non-Repeatable Read | Phantom Read | Serialization Anomaly |
|---|---|---|---|---|
| **Read Uncommitted** | Allowed | Allowed | Allowed | Allowed |
| **Read Committed** (Postgres default) | Prevented | Allowed | Allowed | Allowed |
| **Repeatable Read** | Prevented | Prevented | Prevented (in Postgres MVCC) | Allowed |
| **Serializable** | Prevented | Prevented | Prevented | Prevented |

#### Preventing Race Conditions (Double-Spending & Overselling)

When two users purchase the last concert seat at the exact same millisecond:

```sql
-- Pattern 1: Pessimistic Locking (SELECT ... FOR UPDATE)
-- Locks selected row against writes from concurrent transactions until COMMIT
BEGIN;
  SELECT stock FROM products WHERE id = 42 FOR UPDATE;
  -- If stock > 0, proceed:
  UPDATE products SET stock = stock - 1 WHERE id = 42;
COMMIT;

-- Pattern 2: Optimistic Concurrency Control (OCC with version column)
-- Zero lock contention; fails safely and triggers an application retry
UPDATE products
SET stock = stock - 1, version = version + 1
WHERE id = 42 AND version = 3 AND stock > 0;
-- If rows_affected === 0, another request won the race; retry or notify user
```

#### Connection Pooling Sizing Golden Rule
A common myth is that more database connections equal better performance. In reality, each PostgreSQL connection spawns an operating system process with dedicated RAM and thread overhead:
$$\text{Pool Size} = (\text{CPU Cores} \times 2) + \text{Disk Spindles}$$
On a 4-core database server with fast SSDs, an application connection pool of 8–10 connections handles tens of thousands of requests per second when paired with a connection proxy like **PgBouncer** or **Supabase Supavisor**.

**Task:**

- [ ] Build a money transfer that rolls back when the balance would go negative. Try to break it with two concurrent sessions
- [ ] Implement `SELECT ... FOR UPDATE` in a booking script to ensure a ticket is never double-booked

### 2.5 Using a database from Node

**Parameterized queries** (never build SQL with string concatenation, that is SQL injection):

```ts
import pg from "pg";
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);   // safe
// BAD: pool.query(`SELECT * FROM users WHERE email = '${email}'`);
```

**ORM (Prisma example):**

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String
  posts     Post[]
  createdAt DateTime @default(now())
}

model Post {
  id       Int    @id @default(autoincrement())
  title    String
  author   User   @relation(fields: [authorId], references: [id], onDelete: Cascade)
  authorId Int
  @@index([authorId])
}
```

```ts
const users = await prisma.user.findMany({
  where: { name: { startsWith: "C" } },
  include: { posts: true },
  orderBy: { id: "desc" },
  take: 10,
});

const post = await prisma.post.create({ data: { title: "Hello", authorId: 1 } });

await prisma.$transaction([
  prisma.account.update({ where: { id: 1 }, data: { balance: { decrement: 100 } } }),
  prisma.account.update({ where: { id: 2 }, data: { balance: { increment: 100 } } }),
]);
```

Commands: `npx prisma migrate dev` (create and apply a migration), `npx prisma studio` (browse data). Alternatives: **Drizzle** (SQL-like, great TypeScript), **Kysely**, **TypeORM**, **Knex**. Learn raw SQL anyway.

**Task:**

- [ ] Replace the in-memory array in your Notes API with PostgreSQL and Prisma, including migrations and a seed script

### 2.6 Migrations

Change the schema with versioned migration files committed to Git. Never edit a production database by hand. Make migrations backward compatible (add column, deploy code, then remove old column) so deployments have no downtime.

---

## Level 3: Advanced

### 3.1 Query performance

- Use `EXPLAIN (ANALYZE, BUFFERS)` and read the plan
- **N+1 problem:** loading 100 users and then one query per user for posts. Fix with a join, `include`, or a batched `WHERE id IN (...)`
- Select only the columns you need, paginate (keyset beats `OFFSET` on large tables)
- Avoid functions on indexed columns in `WHERE` (`WHERE lower(email) = ...` needs an expression index)
- `VACUUM` and statistics, connection pooling (PgBouncer), slow query log (`pg_stat_statements`)

```sql
-- Keyset pagination: fast at any depth
SELECT * FROM posts WHERE (created_at, id) < ($1, $2) ORDER BY created_at DESC, id DESC LIMIT 20;
```

**Task:**

- [ ] Find a slow query in your project with `EXPLAIN ANALYZE`, add the right index, and show the before and after plans

### 3.2 Advanced SQL

```sql
-- CTE
WITH recent AS (
  SELECT user_id, COUNT(*) AS n FROM posts WHERE created_at > now() - interval '7 days' GROUP BY user_id
)
SELECT u.name, r.n FROM recent r JOIN users u ON u.id = r.user_id ORDER BY r.n DESC;

-- Window functions
SELECT name, salary,
       RANK() OVER (ORDER BY salary DESC) AS rank,
       AVG(salary) OVER (PARTITION BY department) AS dept_avg,
       LAG(salary) OVER (ORDER BY hired_at) AS previous
FROM employees;

-- Latest post per user
SELECT DISTINCT ON (user_id) * FROM posts ORDER BY user_id, created_at DESC;

-- Upsert
INSERT INTO page_views (page, views) VALUES ('/home', 1)
ON CONFLICT (page) DO UPDATE SET views = page_views.views + 1;

-- JSONB
SELECT data->>'name' FROM events WHERE data @> '{"type": "click"}';

-- Recursive CTE (trees)
WITH RECURSIVE tree AS (
  SELECT id, parent_id, name FROM categories WHERE parent_id IS NULL
  UNION ALL
  SELECT c.id, c.parent_id, c.name FROM categories c JOIN tree t ON c.parent_id = t.id
)
SELECT * FROM tree;
```

Also: views and materialized views, triggers, stored procedures (use sparingly), full-text search (`tsvector`), row-level security, partitioning, generated columns, extensions (`pg_trgm`, `postgis`, `pgvector`).

**Task:**

- [ ] For each author show their most recent book (window function), and build a category tree query with a recursive CTE

### 3.3 Operations: backup, replication, scaling

- **Backups:** automated and tested. A backup you have never restored is not a backup. Learn `pg_dump`, point-in-time recovery
- **Replication:** a primary accepts writes, read replicas serve reads (replication lag!)
- **Scaling order:** fix queries, add indexes, add caching, add read replicas, then partition or shard
- **High availability and failover**, connection limits, and managed services (RDS, Cloud SQL, Neon, Supabase)
- **Security:** least-privilege database users, no public database port, encrypted connections, secrets rotation

---

## Beyond relational

### Redis (key-value, in-memory)

```ts
await redis.set("session:abc", JSON.stringify(user), { EX: 3600 });    // cache with expiry
await redis.incr("rate:ip:1.2.3.4");                                    // counters, rate limits
await redis.lPush("queue", "job1");                                     // lists as queues
await redis.zAdd("leaderboard", { score: 100, value: "chan" });         // sorted sets
```

Use for caching, sessions, rate limiting, queues (BullMQ), pub/sub and leaderboards. Data can be lost, so it is not your system of record.

### MongoDB (documents)

```ts
await db.collection("users").insertOne({ name: "Chan", tags: ["js", "ts"], address: { city: "QC" } });
await db.collection("users").find({ tags: "js" }).sort({ name: 1 }).limit(10).toArray();
await db.collection("orders").aggregate([{ $match: { status: "paid" } }, { $group: { _id: "$userId", total: { $sum: "$amount" } } }]).toArray();
```

Good for flexible, nested, rarely joined data. Many "NoSQL" needs are met by PostgreSQL `JSONB`.

### Other tools

- **SQLite:** zero-setup, great for small apps, tests and local-first software
- **Search engines:** Elasticsearch, OpenSearch, Meilisearch, Typesense (full-text, typo tolerance, facets)
- **Vector databases and `pgvector`:** embeddings for semantic search and AI features
- **Time series:** TimescaleDB, InfluxDB. **Graph:** Neo4j. **Warehouses:** BigQuery, Snowflake
- **Event sourcing and CQRS** (awareness): store events instead of current state

### Choosing

| Need | Choice |
|------|--------|
| Default for most apps | PostgreSQL |
| Cache, sessions, rate limits | Redis |
| Flexible documents, huge write volume | MongoDB |
| Embedded or tiny app | SQLite |
| Search with typos and facets | Meilisearch, Elasticsearch |
| Analytics over huge data | BigQuery, ClickHouse |

**Task:**

- [ ] Cache your slowest endpoint in Redis with an expiry, and add a leaderboard using a sorted set

#### DevQuest Campaign Combat Lore: Defeating The SQL Injection Behemoth

In the **Databases Realm**, cadets encounter *The SQL Injection Behemoth* (Corrupter of Schemas). The Behemoth smashes through naive string concatenation (`SELECT * FROM users WHERE email = '` + email + `'`), escaping quotes to execute malicious payload commands like `' OR '1'='1' -- DROP TABLE users;`.

To banish the Behemoth in the Boss Arena:
1. **Parameterized Shield of Protection:** Replace template literals with parameterized prepared statements (`client.query("SELECT * FROM users WHERE email = $1", [email])`).
2. **Strict Foreign Key Constraints:** Fortify relational tables with explicit referential integrity constraints (`ON DELETE CASCADE`, composite primary keys, and B-Tree indexes on indexed lookup columns).

---

## Projects

**Mini project: blog database**

- [ ] Users, posts, comments (with replies), tags (many-to-many) with proper constraints
- [ ] Indexes on every foreign key and one `EXPLAIN` before and after comparison
- [ ] A transaction for something that must be all-or-nothing
- [ ] Seed script and migrations in Git

**Challenge projects:**

- [ ] An online store schema with orders, stock decrement under concurrency (no overselling) and a sales report using window functions
- [ ] Full-text search over posts with ranking and highlighting
- [ ] A multi-tenant SaaS schema (`tenant_id` on every table) with row-level security
- [ ] Add read-through caching with Redis and measure the improvement

## Self-check

- [ ] Design 5 related tables, write the foreign keys and the joins that read them
- [ ] Explain indexes, transactions and the N+1 problem with examples
- [ ] Read an `EXPLAIN` output and fix a slow query
- [ ] Choose between PostgreSQL, Redis, MongoDB and a search engine for 5 scenarios
- [ ] Explain SQL injection and how parameterized queries prevent it
