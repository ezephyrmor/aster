# Best Practices & Conventions

This file documents the conventions AI agents (and humans) should follow when working in this codebase. It pairs with [`docs/architecture.md`](./architecture.md), [`docs/security.md`](./security.md), [`docs/testing.md`](./testing.md), and [`docs/lifecycle.md`](./lifecycle.md).

---

## 1. Path aliases & TypeScript

- `@/*` is aliased to `./src/*` (see `tsconfig.json` and `vitest.config.ts`). Import project code as `@/lib/...`, `@/components/...`.
- The project uses the **`next` tsconfig plugin** and strict typing (`strict: true`). Follow the existing `include`/`exclude` rules; `scripts/` is excluded from the global TS include.
- TypeScript target is `ES2017` with `dom`/`dom.iterable`/`esnext` libs — avoid exotic runtime constructs.

## 2. Server-side request handling

- **Wrap every API handler in `withAuth`** (`src/lib/api-auth.ts`). Do not re-implement session checks inline.
- **Tenant-scope every query** through `getScopedPrisma`/`currentUser` (`src/lib/tenant-prisma.ts`). Hand-written `companyId` filters are fragile and easy to miss.
- Validate **query params** before use (e.g. allowlist `sortBy` fields, coerce `page`/`limit` to ints, clamp ranges). See `src/app/api/teams/route.ts`.
- Return structured `NextResponse.json({ ..., pagination })` responses with clear error messages and correct status codes.
- Do **not** log secrets or user input verbatim.

## 3. Validation (Zod)

- All user/entity schemas live in **`src/lib/validations/*.schema.ts`**, re-exported from `src/lib/validations/index.ts`.
- Validate **server-side** — never trust client-side validation alone.
- Use the same schema in server routes and (via `@hookform/resolvers`) in client forms (React Hook Form) to keep a single source of truth.

## 4. Security-sensitive code

- Password hashing **only** through `src/lib/password.ts` (`hashPassword`/`comparePassword`), never raw `bcrypt` calls elsewhere.
- Do not loosen the session binding (IP / fingerprint / user-agent / anti-replay) unless intentionally changing the threat model — keep `validateSessionSecurity` intact.
- Keep secrets in `.env` (git-ignored); you never commit `NEXTAUTH_SECRET` / `PASSWORD_PEPPER` / `DATABASE_URL`.
- Be careful with the demo-mode and `debugSessionSecurity` paths — they are dev aids, not production features.

## 5. Database (Prisma)

- New or changed columns/relations go through `schema.prisma` + a **new migration**.
- Preserve `@@map` (snake_case) naming and `@@index` on `companyId` and other hot filters.
- Prefer **soft-delete/archive** (`archivedAt`/`archivedBy`/`archived`) for lookup entities; log important mutations to history tables.
- When creating per-tenant models, add them to the `tenantTables` list in `tenant-prisma.ts`.

## 6. Frontend / UI

- Reuse the shadcn/base-ui primitives in `src/components/ui/` (`Button`, `Input`, `table`, `data-table`, `dropdown-menu`) instead of hand-rolling controls.
- Compose classes with `cn()` from `src/lib/utils.ts`; extend variants via CVA (`class-variance-authority`) rather than overriding styles inline.
- Tailwind v4 is imported once in `src/app/globals.css` (`@import "tailwindcss"`); prefer utility classes there and `dark:` variants using the **zinc** palette. Do **not** add a separate Tailwind config.
- Default `Button` variant in this codebase is the **`blue` gradient**; use `outline`/`ghost`/`destructive` for secondary/danger.
- Icons come from `lucide-react`; keep button svg sizing via the existing `[&_svg:...]:size-*` conventions.
- Preserve the responsive dashboard shell (`min-h-full flex flex-col`, `h-full`) and test dark + light modes.

See also the dedicated designer skill (`.agents/skills/designer/SKILL.md`).

## 7. Code style & linting

- `npm run lint` runs **ESLint** (`eslint.config.mjs`, `eslint-config-next`).
- Run lint + prettier on changed files before pushing. Match existing import ordering, formatting, and naming (camelCase variables, PascalCase components, snake_case DB columns).
- Do not introduce unused dependencies; keep `package.json` tidy.

## 8. Commands cheat-sheet

| Task | Command |
| --- | --- |
| Dev server | `npm run dev` |
| Prod build / start | `npm run build` / `npm run start` |
| Unit / all tests | `npm run test:unit` / `npm run test` |
| Watch tests | `npm run test:watch` |
| Coverage | `npm run test:coverage` |
| Lint | `npm run lint` |
| Reset DB + seed | `npm run db:reset` |
| Prisma Studio | `npm run db:studio` |
| Regenerate client | `npm run generate` |
| First-time setup | `npm run setup` |

---

See also: `docs/lifecycle.md`, `docs/architecture.md`, `docs/security.md`, `docs/testing.md`, and the `.agents/skills/` playbooks.