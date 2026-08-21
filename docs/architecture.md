# Architecture Guide

This is the annotated architecture for the **Aster HR Management System**. It complements [`docs/lifecycle.md`](./lifecycle.md) (runtime + lifecycle), [`docs/security.md`](./security.md), [`docs/testing.md`](./testing.md), and [`docs/best-practices.md`](./best-practices.md).

---

## 1. Overview

Aster is a **multi-tenant HR web application** built on the modern Next.js App Router. The frontend and backend live in the same process (no separate API server): pages and routes both live under `src/app/`.

**Tech stack (versions from `package.json`):**

| Layer | Technology |
| --- | --- |
| Framework | **Next.js 16.2.2** (App Router, **Turbopack** default bundler) |
| Language | **TypeScript** (strict, `next` tsconfig plugin, ES-module target) |
| React | React 19 / react-dom 19 |
| Styling | **Tailwind CSS v4** (`@import "tailwindcss"`) + **shadcn** / `@base-ui/react` primitives |
| Tables | **TanStack Table** (`@tanstack/react-table`) |
| Forms | **React Hook Form** + **Zod** (`@hookform/resolvers`) |
| Auth | **NextAuth v5** (`next-auth`) with Credentials provider |
| ORM | **Prisma 5** (`@prisma/client`) + **PostgreSQL** (local Docker / Neon on Vercel) |
| Password | **bcryptjs** (12 rounds, salt + pepper) |
| Validation | **Zod 4** schemas in `src/lib/validations/` |
| Icons | **lucide-react** |
| Util | **class-variance-authority** (CVA), `clsx`, `tailwind-merge` via `cn()` |
| Testing | **Vitest 4** (jsdom), `@testing-library/*`, `msw`, `jsdom` |

---

## 2. Directory map

```
├── src/
│   ├── app/                    # Next.js App Router (pages + API routes)
│   │   ├── api/                # HTTP API routes (withAuth + tenant-scoped)
│   │   ├── dashboard/          # Authenticated app pages (RBAC-guarded)
│   │   ├── login/              # Login page
│   │   ├── layout.tsx          # Root layout (fonts, ToastProvider, AuthProvider)
│   │   ├── globals.css         # Tailwind v4 import + global styles
│   │   └── page.tsx            # Home — redirects by auth state
│   ├── components/             # Reusable UI
│   │   ├── DataTable/          # TanStack-powered data tables
│   │   ├── tables/             # Server-side data tables + column defs + lists
│   │   ├── forms/ & form/      # Form components (LoginForm, UserForm, ...)
│   │   ├── layout/             # DashboardLayout, Sidebar, PageAccessGuard
│   │   ├── ui/                 # shadcn/base-ui primitives (button, input, table...)
│   │   ├── feedback/           # Toasts / feedback UI
│   │   ├── modals/             # Modal + CaptchaModal
│   │   └── widgets/            # CalendarWidget, ClockInButton, LookupDropdown, SessionTimer
│   ├── config/                 # Central config (session + security)
│   ├── data/                   # demo-data.json (demo-mode dataset)
│   ├── hooks/                  # Custom hooks (useServerSideDataTable)
│   ├── lib/                    # Core runtime helpers
│   │   ├── db.ts               # Prisma singleton
│   │   ├── tenant-prisma.ts    # Multi-tenant Prisma proxy (getScopedPrisma / currentUser)
│   │   ├── api-auth.ts          # withAuth / requireAuth guards
│   │   ├── next-auth.ts         # NextAuth v5 config (Credentials + JWT)
│   │   ├── auth.tsx             # Client AuthProvider + useAuth() context
│   │   ├── password.ts          # salt + pepper + bcrypt hashing
│   │   ├── captcha.ts           # HMAC-signed CAPTCHA token helper
│   │   ├── role-access-check.ts # Server-side page-level RBAC
│   │   ├── navigation-builder.ts# Builds user navigation from role
│   │   ├── validations/       # Zod schemas (user, team, brand, schedule, ...)
│   │   ├── utils.ts            # cn() + formatting helpers
│   │   └── demo/               # In-memory demo store (DEMO_MODE)
│   ├── middleware.ts           # Global request gate (auth + security + demo rewrite)
│   └── types/                  # Shared TS types (navigation, next-auth)
├── prisma/
│   ├── schema.prisma           # DB schema (PostgreSQL)
│   └── migrations/             # Applied migrations
├── scripts/
│   ├── setup.mjs               # One-shot local setup wizard
│   ├── seed/                   # Modular seed phases (index.ts, 01-core-system, 02-organization)
│   └── seed-legacy/            # Backward-compat seeders
├── test/
│   ├── api/                    # Vitest API-route suites
│   ├── unit/                   # Vitest unit tests
│   └── setup.ts                # Global Vitest mocks
├── public/                     # Static assets
├── docs/                       # This documentation set
└── .agents/skills/             # Agent playbooks (api-route, testing, designer)
---

## 3. API route inventory

All HTTP routes live under `src/app/api/**/route.ts` and follow this shape:

```ts
export const GET = withAuth(async (request, context, auth) => { ... });
export async function POST(request: NextRequest) { ... }
```

A representative set (each is a REST resource with optional `[id]` subroutes):

- **auth** — `/api/auth/[...nextauth]`, `/api/auth/me`, `/api/captcha/generate`, `/api/captcha/verify`
- **users** — `/api/users`, `/api/users/search`, `/api/users/[id]`, `/api/users/[id]/status`
- **teams** — `/api/teams`, `/api/teams/[id]`, `/api/teams/[id]/members`, `/api/teams/[id]/members/[memberId]`
- **brands** — `/api/brands`, `/api/brands/[id]`, `/api/brands/[id]/manager`, `/api/brands/[id]/manager/history`
- **leaves** — `/api/leaves/types`, `/api/leaves/statuses`, `/api/leaves/credits`, `/api/leaves/requests`, `/api/leaves/requests/[id]`
- **attendance / schedules** — `/api/attendance/clock`, `/api/schedules`, `/api/schedules/[id]`
- **infractions** — `/api/infraction-types`, `/api/infraction-offenses`, `/api/infractions`, `/api/infractions/[id]`, `/api/infractions/[id]/acknowledge`, plus `/api/my-infractions`
- **calendar** — `/api/calendar/events`, `/api/calendar/events/[id]`
- **navigation / roles / features** — `/api/role-navigation`, `/api/roles`, `/api/features`, `/api/navigation`, `/api/role-access/check`, `/api/feature-manager/navigation/*`
- **lookups** — `/api/departments`, `/api/positions`, `/api/industries`, `/api/employee-statuses`
- **analytics** — `/api/analytics`
- **demo** — `/api/demo/[...path]` (rewrites the above when `DEMO_MODE=true`)

Dashboard pages under `src/app/dashboard/**` map roughly one-to-one to these resources (`users`, `teams`, `brands`, `leaves`, `infractions`, `schedules`, `calendar`, `analytics`, `settings`, `feature-manager`, ...).

---

## 4. Data model (highlights)

`prisma/schema.prisma` defines the PostgreSQL schema. Conventions matter:

- **Snake_case** table + column names via `@@map` / `@map`.
- **UUID string PKs** (`@default(uuid())`), camelCase field names in code.
- **Soft-archive** fields on lookup/template models: `archived`, `archivedAt`, `archivedBy`.
- **History tables** (`teamHistory`, `brandManagerHistory`, `team_member` history) log mutations.
- **Multi-tenant** — tenant-scoped models carry a `companyId` (default `"1"`). The full guid-like default `"1"` is used in several older seed rows.

Core models: `Company`, `User`, `EmployeeProfile`, `Role`, `Brand`, `Team`, `TeamMember`, `LeaveType`, `LeaveCredit`, `LeaveRequest`, `LeaveUsage`, `WorkSchedule`, `Attendance`, `Infraction`, `InfractionType`, `InfractionOffense`, `CalendarEvent`, `Position`, `Department`, `Industry`, plus navigation/permission models (`Feature`, `FeatureNavigationTemplate`, `FeatureNavigationItem`, `RoleNavigation`).

### Migrations

- Add schema changes via a **new migration** (`npx prisma migrate dev` / `npm run db:reset+`).
- Do **not** edit already-applied migrations in `prisma/migrations/`.
- `npm run generate` regenerates the typed client from `schema.prisma`.

---

## 5. Multi-tenancy (the critical isolation layer)

`src/lib/tenant-prisma.ts` is the heart of tenant isolation.

- `getScopedPrisma(companyId)` returns a `Proxy` over the raw Prisma client. For a defined set of **tenant tables**, it automatically:
  - adds `companyId` to the `where` of `findMany/count/aggregate/...`
  - injects `companyId` into `data` on `create/createMany`
  - adds `companyId` to the filter of `update/updateMany/delete/deleteMany/upsert`
- `currentUser()` resolves the session and returns `{ user, prisma }` where `prisma` is already scoped to the user's company.

**Agent rule:** use `currentUser()` / `getScopedPrisma(companyId)` for any per-company read or write. If you add a new tenant-scoped model, register it in the `tenantTables` array.

> The legacy routes (e.g. the pre-refactor `teams` GET example) manually push `{ companyId }` into where clauses. Prefer the proxy for new code.

---

## 6. Demo mode (no database)

Set `DEMO_MODE=true` to run without PostgreSQL:

- The middleware rewrites `/api/*` → `/api/demo/*`.
- `src/lib/demo/store.ts` (`demoStore`) serves users/teams/brands/schedules/attendance/leaves/infractions/calendar/analytics from `src/data/demo-data.json`.
- `authorize()` in `next-auth.ts` validates demo credentials against `demoStore` instead of Prisma.

Demo state is **in-memory and non-persistent** — a restart resets it. It is for onboarding/demos only, never production.

---

See also: `docs/lifecycle.md`, `docs/best-practices.md`, `docs/security.md`, `docs/testing.md`.
```