# Skill: Write a Vitest Suite for a Route or Unit

Use this playbook to write or update a test. Read `docs/testing.md` for the full patterns and `vitest.config.ts` + `test/setup.ts` for the environment.

---

## Principles

- **jsdom** environment, no live DB / network.
- Mock the two external dependencies of API routes: the **Prisma client** (`@/lib/db`) and the **auth guard** (`@/lib/api-auth`).
- `test/setup.ts` already mocks `next/navigation`, `next-auth/react`, `global.fetch`, and silences `console.error` — don't re-mock these.

---

## Steps

### 1. Locate the mirror path

Source → test mirror:

```
src/app/api/teams/route.ts        -> test/api/teams/route.test.ts
src/lib/password.ts               -> test/unit/lib/password.test.ts
src/components/forms/LoginForm.tsx -> test/unit/components/LoginForm.test.tsx
```

### 2. API route suite skeleton

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "@/app/api/<resource>/route";
import prisma from "@/lib/db";

// Mock ONLY the models/methods the route uses.
vi.mock("@/lib/db", () => ({
  default: {
    <Model>: { count: vi.fn(), findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn() },
    // ...every model referenced in the route
  },
}));

// Unwrap withAuth with a fake authed user.
vi.mock("@/lib/api-auth", () => ({
  withAuth: vi.fn((handler) => (request: Request) =>
    handler(request, {}, { user: { companyId: "1", id: 1 } }),
  ),
}));

describe("GET /api/<resource>", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("returns 200 with pagination and tenant scoping", async () => {
    (prisma.<Model>.count as vi.Mock).mockResolvedValue(1);
    (prisma.<Model>.findMany as vi.Mock).mockResolvedValue([{ id: 1, companyId: "1" }]);

    const response = await GET(new Request("http://localhost:3000/api/<resource>"));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.items).toHaveLength(1);
    expect(data.pagination.total).toBe(1);
    expect(prisma.<Model>.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { companyId: "1" } }),
    );
  });

  it("handles query filters", async () => {
    (prisma.<Model>.count as vi.Mock).mockResolvedValue(0);
    (prisma.<Model>.findMany as vi.Mock).mockResolvedValue([]);

    await GET(new Request("http://localhost:3000/api/<resource>?brandId=5"));

    expect(prisma.<Model>.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ brandId: "5" }) }),
    );
  });

  it("returns 500 on DB error", async () => {
    (prisma.<Model>.count as vi.Mock).mockRejectedValue(new Error("db"));
    const response = await GET(new Request("http://localhost:3000/api/<resource>"));
    expect(response.status).toBe(500);
  });
});

describe("POST /api/<resource>", () => {
  it("returns 201 on valid input", async () => {
    (prisma.<Model>.create as vi.Mock).mockResolvedValue({ id: 1, name: "X" });
    const request = new Request("http://localhost:3000/api/<resource>", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "X" }),
    });
    const response = await POST(request);
    expect(response.status).toBe(201);
  });

  it("returns 400 on invalid input", async () => {
    const response = await POST(
      new Request("http://localhost:3000/api/<resource>", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }),
    );
    expect(response.status).toBe(400);
  });
});
```

### 3. Unit / component tests

- Pure logic: call the function directly, assert output (see `test/unit/lib/password.test.ts`).
- Components: render with `@testing-library/react`; since `global.fetch` is mocked, use `vi.mocked(fetch).mockResolvedValue(...)` when the component fetches.

### 4. Run

```bash
npm run test            # full suite
npm run test:unit       # unit only
```

---

## Coverage gate for a new route (must include)

- [ ] 200 success + payload/pagination shape
- [ ] tenant scoping asserted (`where: { companyId }`)
- [ ] each filter param behavior
- [ ] 400 validation
- [ ] 500 DB error

If you changed a tenant model without a test, you changed the wrong thing — add one.