# Testing Guide

How tests are structured and run in Aster. Read this before writing or modifying any test.

Companion files: [`docs/architecture.md`](./architecture.md), [`docs/best-practices.md`](./best-practices.md).

---

## 1. Framework & config

Tests use **Vitest 4** with a **jsdom environment** (no browser / DB required). The config lives in `vitest.config.ts`:

- `plugins: [react()]` — JSX support
- `environment: "jsdom"` — headless DOM for component tests
- `setupFiles: ["./test/setup.ts"]` — global mocks applied to every suite
- `include: ["**/*.test.ts", "**/*.test.tsx"]`
- `exclude: ["**/node_modules/**", "**/dist/**", "**/.next/**"]`

Run commands (from `package.json`):

| Command | Purpose |
| --- | --- |
| `npm run test` | Full Vitest run |
| `npm run test:unit` | Unit tests (jsdom) |
| `npm run test:watch` | Watch mode |
| `npm run test:coverage` | Run with coverage |

---

## 2. Global test setup — `test/setup.ts`

This file mocks common modules so component and route tests work without a running server:

- `@testing-library/jest-dom/vitest` + RTL `cleanup()`, `vi.clearAllMocks()` after each test.
- `next/navigation` → `useRouter`/`usePathname`/`useSearchParams` with no-op implementations.
- `next-auth/react` → `useSession()` returning `{ data: null, status: "unauthenticated" }`.
- `global.fetch` → `vi.fn()`.
- `console.error` → silenced during tests.

> You should **not** need to re-mock these in individual suites — rely on `test/setup.ts`.

---

## 3. Directory layout

```
test/
├── setup.ts                 # Global mocks (above)
├── api/                     # API-route suites (mocked DB)
│   ├── auth/me/route.test.ts
│   ├── teams/route.test.ts
│   ├── users/route.test.ts
│   ├── brands/route.test.ts
│   ├── leaves/requests.test.ts
│   ├── schedules/route.test.ts
│   └── attendance/clock.test.ts
└── unit/                   # Unit + component tests
    ├── auth/next-auth.test.ts
    ├── lib/password.test.ts
    └── components/LoginForm.test.tsx
---

## 4. The API-route test pattern (mock DB + auth)

API tests mock the two external dependencies — the Prisma client and the auth guard — using `vi.mock`. This is the canonical pattern (see `test/api/teams/route.test.ts`):

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "@/app/api/teams/route";
import prisma from "@/lib/db";

// 1. Mock the Prisma singleton — expose only the methods the route uses.
vi.mock("@/lib/db", () => ({
  default: {
    team: { count: vi.fn(), findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn() },
    brand: { findUnique: vi.fn(), findMany: vi.fn() },
    teamMember: { create: vi.fn() },
    teamHistory: { create: vi.fn() },
  },
}));

// 2. Mock withAuth to call the handler directly with a fake authed user.
vi.mock("@/lib/api-auth", () => ({
  withAuth: vi.fn((handler) => (request: Request) =>
    handler(request, {}, { user: { companyId: "1", id: 1 } }),
  ),
}));

describe("GET /api/teams", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("returns paginated teams for current company", async () => {
    (prisma.team.count as vi.Mock).mockResolvedValue(1);
    (prisma.team.findMany as vi.Mock).mockResolvedValue([{ id: 1, name: "Eng", companyId: "1" }]);
    (prisma.brand.findMany as vi.Mock).mockResolvedValue([{ id: 1, name: "Brand" }]);

    const response = await GET(new Request("http://localhost:3000/api/teams"));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.teams).toHaveLength(1);
    expect(data.pagination.total).toBe(1);
    // assert the tenant filter was applied
    expect(prisma.team.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { companyId: "1" } }),
    );
  });
});
```

### Key points

- **Mock `@/lib/db` (default export)** — but *only* the models/methods the route calls. If a route calls `prisma.team.count` and you omit it, the route fails at runtime.
- **Mock `@/lib/api-auth`** — the `withAuth` mock un-wraps the handler with a fake `{ user: { companyId: "1", id: 1 } }` session. This isolates the route handler.
- **Build real `Request` objects** to drive the handler: `new Request("http://localhost:3000/api/teams?brandId=5")`. For `POST`, pass `method: "POST"`, `Content-Type: application/json`, and a JSON `body`.
- **Assert tenant scoping** — include at least one `toHaveBeenCalledWith(expect.objectContaining({ where: { companyId: ... } }))` so regressions in tenant isolation are caught.
- **Silence `console.error`** in `beforeEach` when the route logs errors.
---

## 5. Unit / component tests

For pure logic and client components, drop the DB mock.

- **Library units** — e.g. `test/unit/lib/password.test.ts` asserts `hashPassword` / `comparePassword` behavior without DB.
- **NextAuth** — `test/unit/auth/next-auth.test.ts` covers the auth config.
- **Components** — `test/unit/components/LoginForm.test.tsx` uses `@testing-library/react` + the global mocks from `test/setup.ts`. Because `global.fetch` is mocked, you may need `vi.mocked(fetch).mockResolvedValue(...)` for anything calling the network.

---

## 6. What to test on new API routes

A new route should come with tests that cover, at minimum:

1. **200 success** with a correctly-shaped payload (and pagination where applicable).
2. **Tenant scoping** — the route scopes to `auth.user.companyId`.
3. **Query filters** — each supported query param produces the right `where`.
4. **Validation** — 400 on missing/invalid input (e.g. `POST` without a required field).
5. **500** on a Prisma/DB error (`mockRejectedValue`).

If you add a new data path, add the route test and run it with `npm run test`.

---

## 7. Naming & conventions

- Test files mirror source: `src/app/api/teams/route.ts` → `test/api/teams/route.test.ts`.
- Use `describe` / `it` / `expect` from Vitest. Prefer readable grouped `it`s over `test.each` overload.
- Mock with `vi.mock` at module top; reset with `vi.clearAllMocks()` in `beforeEach`.
- Never write tests that depend on a live DB, network, or time-of-day — everything is deterministic via mocks.

---

See also the `testing` playbook (`.agents/skills/testing/SKILL.md`) for the step-by-step recipe.
```