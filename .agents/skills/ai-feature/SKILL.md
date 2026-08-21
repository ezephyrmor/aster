# Skill: Build an AI-Backed Feature (AI Feature)

Use this playbook when implementing or modifying any **AI-powered feature** in Aster — image/text generation, chat, classification, embeddings, or similar. It encodes the security, key-handling, and architecture rules specific to calling external model providers.

> **Working example in this skill:** an **AI sticker generator** page. The pattern generalizes to any provider/model call.

Read these first:
- `docs/architecture.md` (§2 components, §3 API routes, §5 multi-tenancy)
- `docs/security.md` (§2 authz, §6 agent rules)
- `.agents/skills/api-route/SKILL.md` (route invariants)
- `.agents/skills/testing/SKILL.md` (route tests)
- `.agents/skills/designer/SKILL.md` (if you build UI)

---

## 1. Non-negotiable: API keys stay server-side

This is the #1 rule. These are mirrored in `docs/security.md`.

1. **Keys live only in server env vars** (`process.env`), read at runtime. Never hardcode, commit, or ship a key to the browser.
2. **Document keys in `sample.env` with placeholder values only** (existing convention: `CAPTCHA_SECRET`, `PASSWORD_PEPPER`). `.env` is git-ignored — never commit it.
3. **Clients never call the model provider.** All provider calls go through a **server-side proxy route** under `src/app/api/ai/...` wrapped in `withAuth`. The browser talks only to that route; the key never leaves the server.
4. **No provider SDK in client components.** A `"use client"` file must never import the OpenAI/Anthropic/etc. SDK or a module that reads the key.
5. **Follow the dev-fallback but not in prod.** e.g. `process.env.X || "dev-fallback"` is fine for local convenience (as `captcha.ts`/`password.ts` do). In production there is **no fallback** — a missing key should yield a clear non-secret error.

```ts
// src/lib/ai/provider.ts  (server-only; never imported by a "use client" file)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;   // no placeholder in prod
export function isAiConfigured() {
  return Boolean(OPENAI_API_KEY);
}
```

### Multi-provider keys & response shapes

The sticker generator's `src/lib/ai/provider.ts` supports several providers; each reads **its own** key, so only the key for your selected provider is required:

| Provider | Env key | Negative prompt |
| --- | --- | --- |
| `openai` | `OPENAI_API_KEY` | injected into the prompt text |
| `stability` | `STABILITY_API_KEY` | native `negative_prompt` |
| `google` (Imagen) | `GOOGLE_API_KEY` | injected into the prompt text |
| `openrouter` | `OPENROUTER_API_KEY` | native `negative_prompt` |
| `mock` | *(none)* | n/a — renders a placeholder image |

- `AI_PROVIDER` selects the default provider (`mock` when unset); a saved pack may override it.
- `AI_MODEL` overrides the model id used by the OpenRouter worker.
- Provider responses may return **base64 or an image URL** — the shared fetch helper handles both (`extractFirstB64` → `extractFirstImageUrl`, downloading the URL when needed).

---

## 2. Architecture for an AI feature

```
Browser (client component)
  └─ fetch POST /api/ai/.../generate        // key never present here
       └─ route.ts (withAuth + Zod + tenant)
            └─ src/lib/ai/provider.ts       // reads key, calls external API
                 └─ provider (OpenAI/Anthropic/...)
```

### 2.1 Provider wrapper — `src/lib/ai/*.ts` (server-only)

- A thin module that reads the key and calls the model. It should **not** contain auth or tenant logic — routes own that.
- Provide an `isAiConfigured()` (or per-mode) helper so the UI can disable/guard when no API key is set.
- For **demo/mock**, export a mock implementation (see §4) so the page works without a key (mirrors the existing `src/lib/demo/` pattern).

### 2.2 Proxy route — `src/app/api/ai/.../route.ts`

- Wrapped in `withAuth` like any route.
- Validates input with Zod (see §3).
### 2.3 Persistence

- Persist only **metadata + result URLs**, never the key and never unnecessary raw prompts.
- Use the **tenant-scoped** Prisma client (`currentUser()`); new models go in `tenantTables` (`src/lib/tenant-prisma.ts`) and get a migration. See `api-route` skill.

---

## 3. Validation (Zod) & prompt hygiene

Add/use a schema in `src/lib/validations/` (export it from `index.ts`). For a sticker generator:

```ts
// src/lib/validations/ai.schema.ts
import { z } from "zod";

export const stickerGenerateSchema = z
  .object({
    prompt: z.string().trim().min(1).max(500),          // cap length — cost + abuse guard
    style: z.enum(["cute", "bold", "minimal", "3d"]).optional(),
    size: z.enum(["256", "512", "1024"]).default("512"),
  })
  .strict();
```

- **Validate before** sending anything to the provider.
- **Sanitize / bound the prompt.** Never pass raw user input into a system-prompt template unguarded (prompt-injection risk), and always cap length/tokens.
- Reject unsupported sizes/styles (allowlist, like the sort-field pattern).

---

## 4. Concrete example — AI sticker generator

### 4.1 `POST /api/ai/stickers/generate`

```ts
import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api-auth";
import { currentUser } from "@/lib/tenant-prisma";
import { stickerGenerateSchema } from "@/lib/validations";
import { generateSticker, isAiConfigured } from "@/lib/ai/stickers";

export const POST = withAuth(async (request: NextRequest, _ctx: any, auth: any) => {
  try {
    if (!isAiConfigured()) {
      return NextResponse.json({ error: "AI is not configured on this server" }, { status: 503 });
    }

    const body = await request.json();
    const parsed = stickerGenerateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { prisma, user } = await currentUser();
    const result = await generateSticker(parsed.data);      // provider call, server-side

    const record = await prisma.aiSticker.create({
      data: {
        prompt: parsed.data.prompt,
        style: parsed.data.style ?? null,
        imageUrl: result.url,           // object URL / data URI — not a key
        companyId: user.companyId,
        createdById: auth.user.id,
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error("Sticker generation failed:", error);   // do NOT log the key / raw prompt
    return NextResponse.json({ error: "Failed to generate sticker" }, { status: 500 });
  }
});
```

### 4.2 `GET /api/ai/stickers` (list own / company stickers)

List via the **tenant-scoped** client (`currentUser()`), scoped to `auth.user.companyId`; return `pagination` per convention.

### 4.3 Client page (`src/app/dashboard/ai-stickers/page.tsx`)

- A client component (or a combination page) that renders the form and calls the **proxy route** with `fetch("/api/ai/stickers/generate", { method: "POST", ... })`.
- Respect the `designer` skill UI: `src/components/ui/Button` (blue gradient CTA), input with `aria-invalid`, dark-mode zinc palette.
- Show errors from the route (including the `503` "not configured" case) as toasts; disable the button while in-flight.

---

## 5. Best practices for model calls

- **Timeout + abort**: set a generous-but-bounded request timeout; never let the route hang. Use `Promise.race`/SDK timeout options and handle client abort.
- **Retries** — provider rate-limit / 5xx can retry with backoff (+ jitter), bounded (e.g. 3 with capped delays).
- **Cost/quota guard** — cap requests per user/tenant per window; cap prompt-length and output tokens.
- **Cache** — deterministic requests (same prompt+params) can be cached to avoid re-billing the provider.
- **Idempotency** — a client-sent request id makes retries safe (route ignores duplicates).
- **Error shading** — map provider errors to distinct codes so the UI can explain "rate limited" vs "bad input" vs "server config error".
---

## 6. Security checklist (AI features)

- [ ] API key is a server-only `process.env` var; placeholder in `sample.env`; none in the client.
- [ ] All provider calls go through a `withAuth` proxy route.
- [ ] Never log the key, raw prompts, or full responses.
- [ ] Prompt/input validated + length-capped with Zod.
- [ ] Rate-limit + cost guard per user/tenant.
- [ ] Output is served safely (object URL / data URI), never the key.
- [ ] Persisted data is tenant-scoped & only metadata.

---

## 7. Anti-patterns to avoid

- ❌ Importing the provider SDK or reading the key in a `"use client"` file or server component.
- ❌ Returning the key or a raw provider payload to the client.
- ❌ Committing a real `.env` or a hardcoded key.
- ❌ Logging prompts or full responses.
- ❌ Calling the provider without Zod validation / length caps (abuse + cost).
- ❌ Skipping `withAuth` on the AI route.
- ❌ Using the raw Prisma client for persisted AI results.

---

See also: `docs/security.md`, `docs/best-practices.md`, and the `api-route` / `testing` / `designer` skills.
- Calls the provider wrapper, **never touches the key in handlers**, and returns a shape the client can safely render (an object `/data:` URI / signed URL — never the key, never a raw provider auth payload).