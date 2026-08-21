# Skill: Add a Tenant-Scoped, Auth-Guarded, Validated API Route

Use this playbook when creating or modifying a **Next.js API route** in `src/app/api/**.`

It guarantees the four invariants the codebase enforces:
1. **Auth** — every handler is wrapped in `withAuth`.
2. **Tenant isolation** — every per-company query goes through the scoped Prisma client.
3. **Validation** — all input is validated server-side with Zod.
4. **Errors + tenant scoping are tested** (see the `testing` skill).

---

## Requirements

- Read `docs/lifecycle.md` (§2), `docs/architecture.md` (§3, §5), `docs/security.md` (§2, §6) first.
- For a new table: also update `prisma/schema.prisma` (new migration) **and** register the model in `tenantTables` in `src/lib/tenant-prisma.ts`.

---

## Steps

### 1. Create the route file

```
src/app/api/<resource>/route.ts        # collection (GET, POST)
src/app/api/<resource>/[id]/route.ts   # item (GET, PATCH, DELETE)
```

### 2. Wrap collection handlers with `withAuth`

```ts
import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api-auth";
import { currentUser } from "@/lib/tenant-prisma";
import { resourceSchema } from "@/lib/validations";

export const GET = withAuth(async (req: NextRequest, _ctx: any, auth: any) => {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 100);
  const search = searchParams.get("search") || "";

  // Allowlist sort fields — never pass a raw user string to orderBy.
  const validSort = ["name", "createdAt"];
  const sortBy = validSort.includes(searchParams.get("sortBy") || "")
    ? searchParams.get("sortBy")!
    : "createdAt";
  const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

  // Tenant scope: use currentUser() so every query is company-filtered.
  const { prisma, user } = await currentUser();

  const where = {
    companyId: user.companyId,
    ...(search ? { name: { contains: search.toLowerCase() } } : {}),
  };

  const [total, items] = await Promise.all([
    prisma.<Model>.count({ where }),
    prisma.<Model>.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { [sortBy]: sortOrder } }),
  ]);

  return NextResponse.json({
    items,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
});
```

### 3. Validate POST / update bodies with Zod

```ts
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = resourceSchema.safeParse(body);   // src/lib/validations/*.schema.ts
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const { prisma, user } = await currentUser();
    const item = await prisma.<Model>.create({ data: { ...parsed.data, companyId: user.companyId } });
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("POST /api/<resource> failed:", error);
    return NextResponse.json({ error: "Failed to create resource" }, { status: 500 });
  }
}
```

- Add/find the Zod schema in `src/lib/validations/<resource>.schema.ts` and export it from `src/lib/validations/index.ts`.

### 4. Tenant scoping checklist

- [ ] Created data → `companyId` comes from the **session** (`currentUser()`), never from the request body.
- [ ] Reads/filters/deletes → the scoped `prisma` is used (not the raw `@/lib/db` client).
- [ ] If the model is tenant-scoped, it is listed in `tenantTables` in `tenant-prisma.ts`.
- [ ] `auth.user.companyId` (or `currentUser().user.companyId`) is the only source of tenant identity.

### 5. Tests (mandatory)

Follow the `testing` skill. Minimum cases:

- `200` success + pagination shape
- tenant scoping asserted (`where: { companyId }`)
- each filter param → correct `where`
- `400` on invalid/missing input
- `500` on DB error

---

## Anti-patterns to avoid

- ❌ Reading `companyId` from the body/request — always derive it from the session.
- ❌ Using the raw `@/lib/db` client for tenant data.
- ❌ Passing user-controlled values straight into `orderBy` / `where`.
- ❌ Skipping `withAuth`.
- ❌ Skipping server-side Zod validation.