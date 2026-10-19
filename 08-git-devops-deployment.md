# 08. Git, Linux, DevOps and Deployment

Shipping the app is part of the job. Learn Git and the terminal first, then deployment, then containers, then automation and operations.

**Contents:** [Level 1](#level-1-git-and-the-terminal) | [Level 2](#level-2-deployment-and-docker) | [Level 3](#level-3-automation-cloud-and-operations) | [Projects](#projects)

---

## Level 1: Git and the terminal

### 1.1 The terminal

```bash
pwd                       # where am I
ls -la                    # list files, including hidden
cd projects/app           # change directory (cd .. goes up, cd ~ goes home)
mkdir -p src/utils        # make folders
touch index.ts            # create an empty file
cp a.txt b.txt; mv a.txt docs/; rm file.txt; rm -r folder   # careful: no recycle bin
cat file.txt; less file.txt; head -n 20 file.txt; tail -f app.log
grep -rn "TODO" src/      # search text in files
find . -name "*.ts"       # find files
curl -i https://example.com
chmod +x script.sh        # make executable
echo $PATH; export API_KEY=abc
ps aux | grep node        # pipes send one command's output to another
kill -9 1234              # stop a process
```

Learn: pipes (`|`), redirects (`>`, `>>`), environment variables, shell scripts (`#!/usr/bin/env bash`, `set -euo pipefail`), `ssh`, `scp`, `tmux`, and `man <command>`.

**Task:**

- [ ] Write a script `setup.sh` that creates a project folder, runs `git init`, and installs dependencies
- [ ] Use `grep` and `find` to list every `TODO` comment in a project

### 1.2 Git basics

**Concept:** Git records snapshots (commits) of your project so you can undo mistakes and work in parallel on branches.

```bash
git init
git status
git add .                             # stage changes
git commit -m "Add login form"
git log --oneline --graph --all

git switch -c feature/profile         # new branch
git switch main
git merge feature/profile

git remote add origin <repo-url>
git push -u origin main
git pull
git clone <repo-url>

git diff                              # unstaged changes
git restore file.txt                  # discard changes in a file
git restore --staged file.txt         # unstage
```

**Rules:**

- Commit small and often, with messages that say **why** (`Fix crash when cart is empty`)
- Never commit secrets, `node_modules`, `.env` or build output: use `.gitignore`
- One branch per feature, merge through pull requests

**Task:**

- [ ] Put one of your projects on GitHub with a good README
- [ ] Create a branch, make a change, open a pull request, and merge it
- [ ] Create a merge conflict on purpose and resolve it

**Checkpoint:** what is the difference between `merge` and `rebase`? What does `git pull` do exactly?

### 1.3 Git in depth

```bash
git stash; git stash pop              # put work aside
git commit --amend                    # fix the last commit (before pushing)
git rebase -i HEAD~3                  # squash, reorder, edit recent commits
git cherry-pick <sha>                 # copy one commit to this branch
git revert <sha>                      # undo a commit by adding a new one (safe on shared branches)
git reset --soft HEAD~1               # undo commit, keep changes (reset --hard destroys changes)
git reflog                            # find "lost" commits: your safety net
git bisect start; git bisect bad; git bisect good <sha>   # binary search for the commit that broke things
git tag v1.0.0
git blame file.ts
git worktree add ../app-hotfix hotfix
```

**Workflows:** GitHub Flow (short-lived branches and pull requests into `main`, recommended), trunk-based development, Git Flow (heavier). Use **Conventional Commits** (`feat:`, `fix:`, `chore:`) for automated changelogs. Protect `main`: require reviews and passing CI. Never force-push to shared branches.

### 1.4 AI-assisted Git workflows & pairing hygiene

- **Spec-first pairing:** Provide coding assistants with explicit task boundaries, test criteria, and existing project conventions (`CLAUDE.md`, `AGENTS.md`).
- **Diff inspection:** Always run `git diff` before committing AI-generated code. Never commit code you cannot explain.
- **Atomic verified commits:** Ensure unit tests and build typechecks pass before committing: `npm run build && git commit -m "feat: add user auth"`.
- **Secret shielding:** Use `.gitignore` and tools like `gitleaks` to guarantee API keys, `.env` secrets, and credentials never reach Git history.

**Task:**

- [ ] Rewrite the history of a practice branch with an interactive rebase (squash 4 commits into 1)
- [ ] Break a project, then use `git bisect` to find the guilty commit
- [ ] Recover a deleted branch using `git reflog`
- [ ] Add a pre-commit hook (using Husky or Git hooks) that runs a linter before allowing a commit

---

## Level 2: Deployment and Docker

### 2.1 Environments and configuration

- **Environments:** local, staging (a copy of production), production
- **Configuration lives in environment variables**, not in the code. Keep `.env.example` (no secrets) in Git
- Different values per environment: database URL, API keys, allowed origins
- **Never** commit secrets. If you do, rotate the secret immediately (deleting the commit is not enough)

### 2.2 Deploy a full-stack app

**Steps:**

1. Frontend: `npm run build`, then host the static output on Vercel, Netlify or Cloudflare Pages
2. Backend: deploy to Render, Railway, Fly.io or a VPS
3. Database: a managed PostgreSQL (Neon, Supabase, Railway, RDS)
4. Set environment variables in each dashboard
5. Point a domain at it and enable HTTPS
6. Fix CORS and cookie settings (`secure`, `sameSite`) for the real domains

**Task:**

- [ ] Deploy your Notes app: frontend, API and database, with a real URL, and fix the CORS error you will almost certainly hit
- [ ] Run database migrations as part of the deploy

**Checkpoint:** why does it work locally and fail in production? List five common reasons (env vars, CORS, paths, case-sensitive files, missing build step).

### 2.3 Domains, DNS and HTTPS

- **DNS records:** `A` (name to IPv4), `AAAA` (IPv6), `CNAME` (alias), `MX` (mail), `TXT` (verification, SPF)
- **HTTPS** uses TLS certificates (free via Let's Encrypt, automatic on most platforms)
- **CDN** (Cloudflare, Fastly) caches static files near users and absorbs attacks
- Use `dig example.com`, `nslookup`, and browser DevTools Security tab to inspect

### 2.4 Docker

**Concept:** a container packages your app and everything it needs, so it runs the same everywhere. An **image** is the recipe, a **container** is a running instance.

```dockerfile
# Multi-stage build keeps the final image small
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
USER node
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

```bash
docker build -t notes-api .
docker run -p 3000:3000 --env-file .env notes-api
docker ps; docker logs -f <id>; docker exec -it <id> sh
docker system prune
```

Add a `.dockerignore` (`node_modules`, `.git`, `.env`). Order Dockerfile steps so rarely changing layers (dependencies) come first, for caching.

**Docker Compose** runs several services together:

```yaml
services:
  api:
    build: .
    ports: ["3000:3000"]
    environment:
      DATABASE_URL: postgres://app:secret@db:5432/app
      REDIS_URL: redis://cache:6379
    depends_on:
      db:
        condition: service_healthy
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: app
    volumes: ["pgdata:/var/lib/postgresql/data"]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app"]
      interval: 5s
  cache:
    image: redis:7
volumes:
  pgdata:
```

**Task:**

- [ ] Containerize your API with a multi-stage Dockerfile and start the full stack with `docker compose up`
- [ ] Make the image smaller and note the size before and after

### 2.5 Deploying to a VPS (to understand what platforms do)

```bash
ssh user@server
sudo apt update && sudo apt install -y nginx
# Run the app with a process manager
npm i -g pm2 && pm2 start dist/server.js --name api && pm2 save && pm2 startup
```

```nginx
server {
  listen 80;
  server_name api.example.com;
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $remote_addr;
  }
}
```

Then `sudo certbot --nginx` for HTTPS. Also learn: `systemd` services, firewall (`ufw allow 22,80,443`), SSH keys only (disable passwords), non-root users, `fail2ban`, automatic updates.

**Task:**

- [ ] Rent the cheapest VPS (or use a local VM), deploy your API behind Nginx with HTTPS, and lock it down

---

## Level 3: Automation, cloud and operations

### 3.1 CI/CD with GitHub Actions

**Concept:** every push automatically runs lint, tests and build, and deploys when they pass. CI (Continuous Integration) finds problems early. CD (Continuous Delivery or Deployment) ships safely and often.

`.github/workflows/ci.yml`

```yaml
name: CI
on:
  push: { branches: [main] }
  pull_request:
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env: { POSTGRES_PASSWORD: postgres }
        ports: ["5432:5432"]
        options: --health-cmd pg_isready --health-interval 5s
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run lint
      - run: npx tsc --noEmit
      - run: npm test
      - run: npm run build
        env:
          DATABASE_URL: postgres://postgres:postgres@localhost:5432/postgres
  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - run: echo "Trigger your platform's deploy hook here"
        env:
          HOOK: ${{ secrets.DEPLOY_HOOK }}
```

Know: secrets and environments in the repo settings, matrix builds, caching, reusable workflows, preview deployments per pull request, and dependency updates with Dependabot or Renovate.

**Task:**

- [ ] Add this pipeline to your repo, break a test on purpose and watch it fail, then require it to pass before merging into `main`

### 3.2 Deployment strategies and reliability

- **Zero-downtime deploys:** rolling updates, health checks, graceful shutdown (`SIGTERM`)
- **Blue-green** (two environments, switch traffic) and **canary** (a small percentage first)
- **Feature flags** to ship code dark and enable it gradually
- **Rollbacks:** know how to go back in under 5 minutes, and make migrations backward compatible
- **Backups, disaster recovery,** and the idea of RPO and RTO (how much data and time you can afford to lose)

### 3.3 Monitoring, logging and observability

- **Logs:** structured JSON to stdout, collected centrally (Grafana Loki, Datadog, CloudWatch, Better Stack)
- **Metrics:** request rate, error rate, latency (p50, p95, p99), CPU and memory (Prometheus and Grafana)
- **Traces:** follow a request across services (OpenTelemetry)
- **Error tracking:** Sentry captures crashes with stack traces and context
- **Uptime checks and alerts** that wake you only for problems that need action
- **SLIs, SLOs,** and incident basics: detect, mitigate, fix, write a blameless postmortem

**Task:**

- [ ] Add Sentry and a `/health` endpoint to your deployed API, trigger an error and find it in the dashboard, then set up an uptime alert

### 3.4 Cloud fundamentals

Learn the core ideas with one provider (AWS, GCP or Azure); the others map closely.

| Idea | AWS | GCP | Azure |
|------|-----|-----|-------|
| Virtual machines | EC2 | Compute Engine | Virtual Machines |
| Containers, serverless | ECS/Fargate, Lambda | Cloud Run, Cloud Functions | Container Apps, Functions |
| Object storage | S3 | Cloud Storage | Blob Storage |
| Managed SQL | RDS, Aurora | Cloud SQL | Azure SQL/PostgreSQL |
| Queues and events | SQS, SNS, EventBridge | Pub/Sub | Service Bus |
| CDN and DNS | CloudFront, Route 53 | Cloud CDN, Cloud DNS | Front Door, DNS |
| Identity | IAM | IAM | Entra ID |

**Principles:** least-privilege IAM, never use the root account for daily work, enable MFA, set billing alerts and budgets (surprise bills are real), use managed services before running your own, and tag resources.

**Task:**

- [ ] Create a free-tier account, set a budget alert, host a static site on object storage with a CDN, and deploy a container to a serverless container service

### 3.5 Infrastructure as code and Kubernetes (awareness)

- **Terraform** (or OpenTofu, Pulumi): describe cloud resources in code, review changes with `plan`, apply with `apply`
- **Kubernetes:** pods, deployments, services, ingress, config maps, secrets, autoscaling. Learn it when you need to run many containers; many teams are better served by a PaaS or serverless containers
- **Helm** for packaging, **GitOps** (ArgoCD, Flux) for deploying from Git
- **Serverless and edge:** Lambda, Cloudflare Workers, Vercel Functions. Great for spiky load and small APIs; know cold starts and limits

```hcl
resource "aws_s3_bucket" "site" {
  bucket = "my-site-bucket-12345"
}
```

### 3.6 Scaling and cost

- Scale **vertically** (bigger machine) first, then **horizontally** (more machines behind a load balancer)
- Keep servers **stateless**: sessions in Redis, files in object storage
- Autoscaling on CPU or request rate, load testing with k6 or Artillery
- Measure cost per feature and delete unused resources

---

## Projects

**Mini project: ship the Notes app**

- [ ] Frontend, API and database all live with HTTPS and a custom domain
- [ ] Dockerfile and Compose for local development
- [ ] GitHub Actions: lint, type-check, test, build, deploy on merge to `main`
- [ ] Sentry error tracking, `/health` endpoint, uptime alert
- [ ] A README with architecture diagram and a "how to deploy" section

**Challenge projects:**

- [ ] Preview environments: every pull request deploys to its own URL and is deleted when closed
- [ ] A zero-downtime deploy on a VPS with Nginx and a blue-green switch script
- [ ] Define the whole infrastructure (database, bucket, container service) with Terraform and destroy it with one command
- [ ] A load test with k6, find the bottleneck, fix it, and show the before and after graphs

## Self-check

- [ ] Fix a messy Git history, resolve conflicts and recover lost work
- [ ] Explain what a Dockerfile and a Compose file do, and write them from memory
- [ ] Describe your CI/CD pipeline stage by stage and what happens when a step fails
- [ ] Explain how you would roll back a bad deploy including a database migration
- [ ] Explain DNS, HTTPS and a CDN in two minutes to a friend
