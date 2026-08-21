# Aster — Agent Guide

> **Note:** `CLAUDE.md` includes `@AGENTS.md` — keep them in sync; `AGENTS.md` is the single source of the guide.

This file is the **primary operating manual** for AI agents (and humans) working on the **Aster HR Management System** — a multi-tenant HR web app. It replaces the misleading Next.js-framework guide that previously lived here.

Follow these rules plus the deeper docs and skills linked below.

---

## 1. What this project is

Aster is a **self-contained Next.js application** (not the Next.js framework monorepo). It manages users, teams, brands, leaves, attendance, schedules, infractions, calendar events, and role-based navigation for multiple companies (tenants).

**Stack (from `package.json`):** Next.js 16 (App Router, Turbopack), React 19, TypeScript (strict), Tailwind CSS v4 + shadcn/base-ui, TanStack Table, React Hook Form + Zod, NextAuth v5 (Credentials, JWT), Prisma 5 + **PostgreSQL**, bcryptjs.

> DB is **PostgreSQL** — not MySQL (older docs say MySQL; ignore that).

---

## 2. Where to go for deep detail

`AGENTS.md` is the map; the following files are the territory. **Read the relevant one before a task.**

| Topic | File |
| --- | --- |
| Runtime + **start / request / end / auth lifecycles** | [`docs/lifecycle.md`](docs/lifecycle.md) |
| Annotated architecture, API inventory, data model, multi-tenancy, demo mode | [`docs/architecture.md`](docs/architecture.md) |
| Code conventions & best practices | [`docs/best-practices.md`](docs/best-practices.md) |
| Security model, production checklist, agent rules | [`docs/security.md`](docs/security.md) |
| Testing (Vitest) setup, patterns, how to run | [`docs/testing.md`](docs/testing.md) |
| Setup / onboarding for humans | [`SETUP.md`](SETUP.md), [`scripts/SEEDING_GUIDE.md`](scripts/SEEDING_GUIDE.md) |
| Feature overview | [`README.md`](README.md) |

### Reusable skills (invoke on matched tasks)

| Skill | When to use |
| --- | --- |
| `.agents/skills/api-route/SKILL.md` | Creating / modifying an API route |
| `.agents/skills/testing/SKILL.md` | Writing or updating a Vitest suite |
| `.agents/skills/designer/SKILL.md` | Building or changing any UI (design system) |
| `.agents/skills/ai-feature/SKILL.md` | Building any AI-backed feature (image/text models, API keys, proxy routes) |

Invoke a skill by reading its `SKILL.md` and following its checklist.

---

## 3. Layout (condensed)

```
src/
├── app/                  # App Router: pages + API routes
│   ├── api/              # HTTP API route handlers (withAuth + tenant-scoped)
│   ├── dashboard/        # Authenticated app pages (RBAC-guarded)
│   ├── login/            # Login page
│   ├── layout.tsx        # Root layout (fonts, ToastProvider, AuthProvider)
│   └── page.tsx          # Home → redirects by auth
├── components/           # ui/ (shadcn primitives), tables/, layout/, forms/, widgets/
├── config/               # session.config.ts + security.config.ts
├── data/                 # demo-data.json
├── hooks/                # useServerSideDataTable, ...
├── lib/
│   ├── db.ts             # Prisma singleton
│   ├── tenant-prisma.ts  # getScopedPrisma / currentUser (tenant isolation!)
│   ├── api-auth.ts       # withAuth / requireAuth
│   ├── next-auth.ts      # NextAuth v5 (Credentials + JWT)
│   ├── auth.tsx          # Client AuthProvider + useAuth()
│   ├── password.ts       # bcrypt + salt + pepper
│   ├── captcha.ts        # CAPTCHA token helper
│   ├── role-access-check.ts # server-side page RBAC
│   └── validations/      # Zod schemas
├── middleware.ts         # request gate (auth + session security + demo rewrite)
└── types/
prisma/
├── schema.prisma         # PostgreSQL schema
└── migrations/
scripts/
├── setup.mjs             # one-shot local setup wizard
└── seed/                 # seed phases
test/
├── api/  unit/  setup.ts # Vitest suites + global mocks
docs/                      # this documentation set
.agents/skills/            # agent playbooks
```

---

## 4. Commands reference

From `package.json`:

| Task | Command |
| --- | --- |
| First-time setup (env → Docker → migrate → seed) | `npm run setup` |
| Dev server | `npm run dev` / `npm run dev+` (clean + dev) |
| Production build / start | `npm run build` / `npm run start` |
| Lint | `npm run lint` |
| Tests (all / unit / watch / coverage) | `npm run test` / `test:unit` / `test:watch` / `test:coverage` |
| Regenerate Prisma client | `npm run generate` |
| Seed | `npm run db:seed` / `npm run db:seed:all` |
| Reset DB + reseed | `npm run db:reset` |
| Sync schema + reset + reseed | `npm run db:reset+` |
| Prisma Studio | `npm run db:studio` |
| Local DB (Docker) | `docker compose up -d` / `docker compose down` |

**Testing:** `npm run test:unit` runs the full Vitest suite headless (jsdom). For a single file, pass the path to Vitest (e.g. `npx vitest run test/api/teams/route.test.ts`).

---

## 5. Environment variables

Set in `.env` (git-ignored; copy from `sample.env`).

| Variable | Purpose | Required? |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL connection string | Yes (not in demo mode) |
| `DIRECT_URL` | Direct connection (Neon migrations) | Neon/Vercel only |
| `NEXTAUTH_SECRET` | Session cookie signing | Yes |
| `NEXTAUTH_URL` | App base URL | Yes |
| `PASSWORD_PEPPER` | Pepper for password hashing | Yes (fallback exists for dev) |
| `CAPTCHA_SECRET` | CAPTCHA token signing | Optional (dev fallback exists) |
| `DEMO_MODE` | `"true"` to run without a database | Optional |
| `AUTHJS_LOGGER_LEVEL` | Auth logs (silent in sample) | Optional |
| `OPENAI_API_KEY` / `STABILITY_API_KEY` / `GOOGLE_API_KEY` / `OPENROUTER_API_KEY` | Server-only AI provider key (one per provider) | Only for AI features (see `ai-feature` skill) |
| `AI_PROVIDER` | Default AI provider (`openai \| stability \| google \| openrouter \| mock`) | Optional (default `mock`) |
| `AI_MODEL` | Override the image model id (used by the openrouter worker) | Optional |

Never commit secrets. Document any new env var in `sample.env` with placeholder values.

---

## 6. Mandatory agent rules

These are non-negotiable and mirror the deeper docs.

1. **Tenant scope every per-company query** with `currentUser()` / `getScopedPrisma` (`src/lib/tenant-prisma.ts`). Do not hand-write `where: { companyId }` — the proxy auto-injects it. Register new tenant tables in its `tenantTables` array.
2. **Auth-guard every API handler** with `withAuth` (`src/lib/api-auth.ts`). Never re-implement session checks inline.
3. **Validate all input server-side with Zod** (`src/lib/validations/`). Reuse the shared schemas; add new ones there.
4. **Write tests for every route** (mocking `@/lib/db` + `@/lib/api-auth`). See `docs/testing.md` + the `testing` skill. Assert tenant scoping in at least one test.
5. **Match the UI design system** — reuse `src/components/ui` primitives, `cn()`, Tailwind v4 + zinc dark mode, and the gradient-button conventions. See the `designer` skill.
6. **Do not loosen security.** Keep `validateSessionSecurity`, password hashing (salt+pepper+bcrypt), HTTP-only cookies, and CAPTCHA intact. Use `docs/security.md` as the authority.
7. **AI keys stay server-side.** For any AI feature, provider API keys live in server env vars and are called only through a `withAuth` proxy route — never in client code. See the `ai-feature` skill.
8. **DB changes go through migrations.** New/edited `schema.prisma` models require a new migration; preserve `@@map`/`@@index` conventions and soft-delete/archive patterns.
9. **Demo mode & `debugSessionSecurity` are dev aids** — keep them out of production paths.

---

## 7. Lifecycle cheatsheet (see `docs/lifecycle.md`)

- **Start:** `npm run setup` → Docker Postgres → generate → migrate → seed → `npm run dev`. Default login `admin` / `admin123` (change it in shared envs).
- **Request:** `src/middleware.ts` (public allowlist → session gate → `validateSessionSecurity` → demo rewrite) → route → `withAuth` → tenant-scoped Prisma → `NextResponse`.
- **End:** session expires per `SESSION_CONFIG.maxAge`; security-binding failures clear `next-auth.*` cookies and bounce to `/login?reason=...`; entities use soft-archive (`archivedAt`/`archivedBy`) rather than destructive deletes.

---

Remember: `AGENTS.md`/`CLAUDE.md` is the map. Drill into `docs/*` and `.agents/skills/*` before each task.