# Mental Health Platform

A TypeScript monorepo for a mental health platform with mood tracking, user authentication, and a shared component library.

## Tech Stack

| Layer    | Technology                          |
| -------- | ----------------------------------- |
| Frontend | Vue 3, Vite, Tailwind CSS v4        |
| Backend  | Fastify 5, Node.js                  |
| Database | PostgreSQL + Drizzle ORM            |
| Auth     | JWT (jose), scrypt password hashing |
| Language | TypeScript throughout               |
| Monorepo | pnpm workspaces + Turborepo         |
| Admin    | Strapi 5 (optional)                 |

## Project Structure

```
mental-health/
├── apps/
│   ├── client/          # Vue 3 frontend (port 5173)
│   ├── backend/         # Fastify API (port 3000)
│   └── admin-panel/     # Strapi CMS (port 1337, optional)
├── packages/
│   ├── contract/        # Shared TypeScript types & API interfaces
│   ├── auth/            # JWT signing/verification, password hashing
│   ├── db/              # Drizzle ORM schema & database client
│   ├── domain/          # Business logic (user, mood services)
│   └── design-system/   # Vue 3 component library
├── docker-compose.dev.yml
└── turbo.json
```

---

## Prerequisites

- **Node.js** ≥ 20
- **pnpm** ≥ 10 — install via `npm install -g pnpm` or `corepack enable`
- **Docker Desktop** — for the full stack (PostgreSQL + all services)
- **PostgreSQL** ≥ 15 — only if running locally without Docker

> **pnpm only.** npm and yarn are blocked via the `preinstall` hook.

---

## Running Locally (No Docker)

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set at minimum:

```env
DATABASE_URL=postgres://dev:devpassword@localhost:5432/mentalhealth
JWT_SECRET=your-secret-here
```

### 3. Start a local PostgreSQL database

Option A — Docker (just the DB):

```bash
docker run -d \
  --name mh-postgres \
  -e POSTGRES_DB=mentalhealth \
  -e POSTGRES_USER=dev \
  -e POSTGRES_PASSWORD=devpassword \
  -p 5432:5432 \
  postgres:17-alpine
```

Option B — use any existing local PostgreSQL installation and create the database:

```sql
CREATE DATABASE mentalhealth;
CREATE USER dev WITH PASSWORD 'devpassword';
GRANT ALL PRIVILEGES ON DATABASE mentalhealth TO dev;
```

### 4. Push the database schema

```bash
pnpm --filter @mental-health/db db:push
```

### 5. Start the dev servers

**Backend + Frontend only** (recommended for local dev, skips Strapi):

```bash
pnpm dev:local
```

**All apps** (requires Strapi to be configured):

```bash
pnpm dev
```

| Service     | URL                   |
| ----------- | --------------------- |
| Frontend    | http://localhost:5173 |
| Backend API | http://localhost:3000 |
| Admin Panel | http://localhost:1337 |

---

## Running with Docker (Full Stack)

This starts PostgreSQL, backend, frontend, and admin panel with hot reload.

### 1. Configure environment

```bash
cp .env.example .env
```

### 2. Start all services

```bash
docker compose -f docker-compose.dev.yml up --build
```

Services start in dependency order: PostgreSQL → backend → frontend.

### 3. Push the database schema

In a separate terminal, after the services are healthy:

```bash
pnpm --filter @mental-health/db db:push
```

### 4. Rebuild after dependency changes

When you change any `package.json`, rebuild the images:

```bash
docker compose -f docker-compose.dev.yml up --build
```

> **Hot reload:** Changes to `src/` directories in `apps/` and `packages/` are reflected immediately — no rebuild needed.

---

## API Endpoints

| Method | Path             | Auth       | Description         |
| ------ | ---------------- | ---------- | ------------------- |
| GET    | `/health`        | —          | Health check        |
| POST   | `/auth/register` | —          | Register a new user |
| POST   | `/auth/login`    | —          | Login, returns JWT  |
| GET    | `/mood`          | Bearer JWT | List mood entries   |
| POST   | `/mood`          | Bearer JWT | Create mood entry   |

### Example: Register + Login

```bash
# Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Password123","name":"Alice"}'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Password123"}'

# Create mood entry (replace TOKEN)
curl -X POST http://localhost:3000/mood \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"score":8,"note":"Feeling good today"}'
```

---

## Available Scripts

### Root (runs across all packages via Turborepo)

```bash
pnpm dev           # Start all apps with hot reload
pnpm dev:local     # Start backend + client only (skips Strapi)
pnpm build         # Build all packages and apps
pnpm lint          # Lint all files
pnpm lint:fix      # Lint and auto-fix
pnpm type-check    # TypeScript check across all packages
pnpm format        # Format all files with Prettier
```

### Database (packages/db)

```bash
pnpm --filter @mental-health/db db:push      # Push schema to DB (dev)
pnpm --filter @mental-health/db db:generate  # Generate migration files
pnpm --filter @mental-health/db db:migrate   # Run migrations
pnpm --filter @mental-health/db db:studio    # Open Drizzle Studio (DB GUI)
```

---

## Git Commit Convention

Husky enforces commit format on every commit. Allowed types:

| Type     | Use for                   |
| -------- | ------------------------- |
| `feat`   | New features              |
| `fix`    | Bug fixes                 |
| `chore`  | Maintenance, config, deps |
| `ci`     | CI/CD changes             |
| `hotfix` | Critical production fixes |

**Format:** `type(optional-scope): description`

```bash
# Valid
git commit -m "feat(auth): add password reset flow"
git commit -m "fix: resolve CORS issue on /mood endpoint"
git commit -m "chore: update drizzle-kit to latest"

# Invalid — will be rejected
git commit -m "updated stuff"
git commit -m "refactor: clean up routes"  # 'refactor' not allowed
```

Pre-commit hooks also run ESLint, Prettier, and per-file TypeScript checks on staged files.

---

## Adding a New Package

```bash
mkdir packages/my-package
cd packages/my-package
```

Create `package.json`:

```json
{
  "name": "@mental-health/my-package",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "default": "./src/index.ts"
    }
  },
  "scripts": {
    "type-check": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "^5.8.0"
  }
}
```

Create `tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "noEmit": true,
    "allowImportingTsExtensions": true
  },
  "include": ["src/**/*"]
}
```

Then reference it from any app: `"@mental-health/my-package": "workspace:*"` in that app's `package.json`, followed by `pnpm install`.

---

## Troubleshooting

### `ERR_PNPM_UNSUPPORTED_ENGINE` on install

Make sure you're using Node.js ≥ 20:

```bash
node --version
```

### Backend crashes on startup

Check that `DATABASE_URL` in `.env` points to a running PostgreSQL instance:

```bash
psql "$DATABASE_URL" -c "SELECT 1"
```

### Docker: `node_modules` mismatch

If you installed packages on the host and volumes are stale:

```bash
docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.dev.yml up --build
```

The `-v` flag removes named volumes (including cached `node_modules`) and forces a clean reinstall.

### Tailwind styles not applying

The project uses Tailwind CSS v4. Ensure the import in [apps/client/src/style.css](apps/client/src/style.css) is:

```css
@import 'tailwindcss';
```

No `tailwind.config.js` is needed — v4 uses CSS-first configuration.

### `vue-tsc` vs `tsc` for type checking

The design system and client contain `.vue` files, so they use `vue-tsc`:

```bash
pnpm --filter @mental-health/client run type-check
pnpm --filter @mental-health/design-system run type-check
```

Backend and other packages use plain `tsc`:

```bash
pnpm --filter @mental-health/backend run type-check
```
