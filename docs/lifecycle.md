# Lifecycle Guide

This document explains the full **lifecycle of the Aster HR system** — from first-time setup ("start"), through how a single request is handled, to how sessions/users/instances come to an "end". AI agents should read this before making changes that touch startup, routing, authentication, or teardown.

It is the companion to:

- [`docs/architecture.md`](./architecture.md) — what the codebase is made of
- [`docs/testing.md`](./testing.md) — how tests are written and run
- [`docs/security.md`](./security.md) — the security model in detail
- [`docs/best-practices.md`](./best-practices.md) — conventions to follow

---

## 1. The "Start" lifecycle (getting from zero to running)

The project ships a one-click setup wizard and a Docker Compose database definition. There are two supported paths.

### 1.1 Prerequisites

- **Node.js 18+** (we target modern JS features).
- **npm** (or pnpm).
- **Docker Desktop** (for the local PostgreSQL container). Production deployments on Vercel use managed PostgreSQL (Neon/Supabase).

### 1.2 Environment (`sample.env` → `.env`)

Copy `sample.env` to `.env` (the wizard does this for you). The important variables:

| Variable | Purpose | Notes |
| --- | --- | --- |
| `POSTGRES_DB` / `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_PORT` | Docker container defaults | Must match `DATABASE_URL` |
| `DATABASE_URL` | Prisma datasource URL | `postgresql://user:pass@host:port/db` |
| `DIRECT_URL` | Direct connection for Neon migrations | Only needed on Vercel + Neon |
| `NEXTAUTH_SECRET` | Signs session cookies | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | App base URL | `http://localhost:3000` locally |
| `PASSWORD_PEPPER` | Secret mixed into password hashes | `openssl rand -base64 32` — never persist in DB |
| `DEMO_MODE` | `"true"` runs the app without a database | Uses in-memory demo store |
| `CAPTCHA_SECRET` | Signs CAPTCHA tokens | Fallback secret exists — change in prod |
| `AUTHJS_LOGGER_LEVEL` | Silent by default | |

> ⚠️ `.env` is git-ignored (`.gitignore`). Never commit secrets. The values of `NEXTAUTH_SECRET` and `PASSWORD_PEPPER` are read at runtime, not build time.
### 1.3 Start the database

The quickest path is the wizard:

```bash
npm run setup
```

`scripts/setup.mjs` runs the full sequence: checks the toolbox, creates `.env`, runs `npm install`, starts Docker (`docker compose up -d`), generates the Prisma client, runs migrations, and seeds (idempotent — skips already-done steps).

Manual equivalent (what the setup wizard does under the hood):

```bash
# 1. Start PostgreSQL in Docker (see docker-compose.yml)
docker compose up -d

# 2. Install deps (runs `prisma generate` via postinstall hook)
npm install

# 3. Create/apply migrations
npx prisma migrate dev

# 4. Seed the database
npm run db:seed:all
```

`package.json` exposes these as scripts:

- `npm run generate` — `prisma generate`
- `npm run build` — `next build`
- `npm run start` — `next start`
- `npm run dev` / `npm run dev+` — dev server
- `npm run lint` — ESLint
- `npm run db:seed` / `db:seed:all` — seed
- `npm run db:reset` / `db:reset+` — reset DB (and sync schema)
- `npm run db:studio` — Prisma Studio
- `npm run test` / `test:unit` / `test:watch` / `test:coverage` — Vitest
- `npm run setup` — the one-shot setup wizard

### 1.4 Seeding

The seed runner is `scripts/seed/index.ts`, which runs phases in dependency order:

1. `01-core-system.ts` — default company, system roles, lookup tables (employee statuses, leave types, leave statuses, positions, departments, industries).
2. `02-organization.ts` — navigation templates, default admin/HR users, optional demo/starter data.

Default login after seeding:

```
Username: admin
Password: admin123
```

> ⚠️ Change the default password in any non-local environment.

### 1.5 Run the app

```bash
npm run dev        # development (Turbopack default bundler)
npm run dev+       # clean + dev
npm run build      # production build
npm run start      # production server
```

Visit http://localhost:3000.

### 1.6 Production / Vercel bootstrap

The standard Vercel **build command** is:

```bash
npx prisma migrate deploy && next build
```

Deploy wires these environment variables: `DATABASE_URL`, `DIRECT_URL` (Neon-only, used for migrations), `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (auto-set by Vercel), `PASSWORD_PEPPER`. The app forces HTTPS on production. During the container start, the root layout (`src/app/layout.tsx`) loads fonts and providers before any page renders.

---

## 2. The request lifecycle (per HTTP request)

A single request flows like this:

```
Browser
  → Next.js middleware (src/middleware.ts)
  → matched route handler (page or API route)
  → guard helpers (src/lib/api-auth.ts, src/lib/tenant-prisma.ts)
  → Prisma / demo store
  → NextResponse → browser
```

### 2.1 Middleware — the front door

`src/middleware.ts` matches `/dashboard/:path*` and `/api/:path*` (see `config.matcher`).

1. **Public-path allowlist** — `/login`, `/_next`, `/favicon.ico`, `/api/auth`, `/api/captcha` skip the session check.
2. **Demo-mode API rewrite** — when `DEMO_MODE=true`, public API paths are rewritten from `/api/...` → `/api/demo/...` and served from the in-memory demo store.
3. **Session gate** — for everything else, it awaits `auth()`. Without a session it redirects to `/login?callbackUrl=...`.
4. **Session security validation** — if a session token exists, it runs `validateSessionSecurity(token, request)` from `src/config/security.config.ts`. On failure it logs the reason, deletes the `next-auth.session-token` and `next-auth.csrf-token` cookies, and redirects to `/login?reason=...`.
### 2.2 Route handlers

- **API routes** live under `src/app/api/**/route.ts`. The pattern is:

  ```ts
  export const GET = withAuth(async (request, context, auth) => {
    // auth.user.companyId — tenant context
    // Validate query params (sort fields allowlist, etc.)
    // prisma / scopedPrisma query
    // NextResponse.json(payload)
  });
  ```

  `withAuth` (in `src/lib/api-auth.ts`) runs `requireAuth()` first, which returns `401` for an invalid session, otherwise passes `{ user, userId }` to your handler.

- **Authenticated pages** live under `src/app/dashboard/**`. Page-level authorization is enforced server-side via `src/lib/role-access-check.ts` (see `docs/security.md`). The UI additionally gates page access through the `Sidebar` and a page-access guard.

### 2.3 Tenant scoping

Never read `companyId` from a raw query — use the **tenant-scoped Prisma proxy**:

```ts
const { user, prisma } = await currentUser();      // src/lib/tenant-prisma.ts
const teams = await prisma.team.findMany();        // auto-filtered to user.companyId
```

`getScopedPrisma(companyId)` returns a `Proxy` that automatically injects a `companyId` filter on `findMany/count/create/update/delete/...` for the listed tenant tables (`user`, `team`, `brand`, `role`, ...). This is the **primary safeguard** against cross-company data leakage.

> If you need the raw (unscoped) client — e.g. global lookups — be explicit and justify it. Prefer the scoped client.

### 2.4 Response

Handlers return `NextResponse.json(...)` or render a page. The middleware never intercepts the response body; it only lets the request through or redirects.

---

## 3. The authentication lifecycle (login → session → logout)

### 3.1 Login

```
src/app/login/page.tsx (LoginForm)
  → src/lib/auth.tsx AuthContext.login()
  → signIn("credentials", { username, password, captchaToken, redirect:false })
      → NextAuth Credential provider (src/lib/next-auth.ts)
          - captcha already validated server-side (src/app/api/captcha/verify)
          - authorize(): DEMO_MODE branch OR prisma password check
              - comparePassword(password, hash, salt)  // bcrypt(password + pepper)
          - returns { id, roleId, companyId, ..., ip, fingerprint, userAgent, timestamp, nonce }
      → jwt callback: stores id/role/company + security attrs on the JWT
      → session callback: exposes user.id / role / companyId (and, when
        securityConfig.debugSessionSecurity, a debug-only session.security blob)
```

Key details:

- **Password** — `src/lib/password.ts` hashes with **bcrypt 12 rounds + a per-user salt + a server-side pepper**, formula `bcrypt.hash(password + pepper, salt)`. Comparison uses the same formula.
- **CAPTCHA** — `src/app/api/captcha/*` issues an HMAC-signed token that expires in ~5 minutes; `verifyCaptchaToken()` validates signature + expiry before login proceeds.
- **JWT session** — `strategy: "jwt"`, with `maxAge` (3600s) and `updateAge` (240s) from `SESSION_CONFIG`.

### 3.2 Middleware revalidation

On every request, the middleware re-validates the session against the live request (see `validateSessionSecurity` in `src/config/security.config.ts`):

| Check | Enabled? | Failure → reason |
| --- | --- | --- |
| IP lock | `ipLockEnabled: true` | `"IP address mismatch"` |
| Fingerprint | `fingerprintEnabled: true` | `"Browser fingerprint mismatch"` |
| User-Agent | `userAgentValidationEnabled: true` | `"User agent mismatch"` |
| Anti-replay (nonce + timestamp age) | `antiReplayEnabled: true` | `"Token expired or invalid timestamp"` |
---

## 4. The "end" lifecycle

### 4.1 Session expiration & revalidation

- **Expiry** — `SESSION_CONFIG.maxAge` (default `3600`s). NextAuth refuses sessions older than this.
- **Auto-refresh** — `updateAge` (240s) lets NextAuth extend the session on recent activity; the client also has a session timer + warning modal.
- **Security validation failure** — if any §3.2 check fails, the middleware clears the `next-auth.session-token` and `next-auth.csrf-token` cookies and bounces to `/login?reason=...`.
- **Logout** — `useAuth().logout()` calls `signOut()`. Cookies are removed client + server side; the user returns to `/login`.

### 4.2 User / record "end" (soft delete)

Most entities in this app do **not** hard-delete. They use an **archival** pattern:

- Lookup tables (`Feature`, `EmployeeStatus`, industry-linked rows, etc.) carry `archivedAt`, `archivedBy`, and `archived` boolean fields — records are *archived*, not removed.
- History tables (`teamHistory`, `brandManagerHistory`) record removals/promotions as actions.
- The schema uses `@@map` (snake_case table names) and `@map` (snake_case columns); preserve these conventions when adding fields.

> When implementing a "delete" flow, prefer soft-delete/archive + history logging over destructive removal, and always keep `performedBy`/`archivedBy` context.

### 4.3 Database / instance teardown

- **Local** — `docker compose down` stops the container; `npm run db:reset` (`prisma migrate reset --force && db:seed:all`) wipes and reseeds.
- **Migrations** — do not edit applied migrations. Add a new migration (`npx prisma migrate dev`) for schema changes.
- **Demo mode** — in-memory data lives only for the process lifetime; restarting the app resets demo state (no persistence by design).

---

## 5. Rules of thumb for agents

1. The **tenant-scoped Prisma client is mandatory** for any per-company query — never hand-craft `where: { companyId }` when `getScopedPrisma`/`currentUser` exist.
2. Wrap every API handler in `withAuth` — do not add ad-hoc auth logic.
3. Validate **all** user input server-side with Zod (`src/lib/validations/*.schema.ts`).
4. Reuse the middleware + cookie conventions: never rely on a request header outside the public allowlist to make an auth decision.
5. For new per-tenant tables: add the model to `schema.prisma` (with `@@map`/`@@index` conventions), and add it to `tenantTables` in `getScopedPrisma`.
6. Preserve the lifecycle invariants above — startup, routing, auth, tenant-scoping, and soft-delete are the highest-risk surfaces.

---

See also: `docs/architecture.md`, `docs/best-practices.md`, `docs/security.md`, `docs/testing.md`, and the `.agents/skills/` playbooks.
5. **Demo rewrite (protected paths)** — rewrites protected `/api/*` to `/api/demo/*` before the route runs.