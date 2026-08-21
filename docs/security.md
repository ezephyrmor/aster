# Security Model & Guide

This document describes the **actual security architecture** implemented in Aster, plus operational guidance. Read it alongside [`docs/lifecycle.md`](./lifecycle.md) and the repo `SECURITY.md` (vulnerability reporting + supported versions).

---

## 1. Authentication & session security

### 1.1 Passwords — salt + pepper + bcrypt

`src/lib/password.ts` implements:

- **Per-user salt** — generated via `generateSalt()` (bcrypt `genSaltSync(12)`) and **stored** on the user row (`salt` column, explicit for demonstration).
- **Server-side pepper** — from `PASSWORD_PEPPER` env var, **never stored in DB**.

Formula:

```text
hash = bcrypt.hash(password + PEPPER, salt)   // 12 rounds
match = bcrypt.compare(password + PEPPER, storedHash)
```

Rules for agents:
- Hash/verify **only** through `hashPassword` / `comparePassword` — never raw `bcrypt`.
- Never log `password`, `pepper`, or `passwordHash`.

### 1.2 JWT session (NextAuth v5)

`src/lib/next-auth.ts` uses `session.strategy: "jwt"` with a Credentials provider. The JWT callback persists `id`, `username`, `roleId`, `companyId`, `companyName`, `role`, plus **security attributes captured at login**: client `ip`, `fingerprint`, `userAgent`, `timestamp`, and `nonce`.

Session cookies are **HTTP-only** (`next-auth.session-token`). `SESSION_CONFIG.maxAge` (3600s) bounds session lifetime; `updateAge` (240s) drives auto-refresh.

### 1.3 Session binding (`src/config/security.config.ts`)

`validateSessionSecurity(token, request)` runs in middleware on every request and enforces (all enabled by default):

| Control | What it does |
| --- | --- |
| `ipLockEnabled` | Session bound to the client IP captured at login |
| `fingerprintEnabled` | Session bound to a SHA-256 of UA/accept/language/encoding headers |
| `userAgentValidationEnabled` | UA must match the login-time UA |
| `antiReplayEnabled` | Login timestamp must be within `maxTokenAge` (300s) and nonce present |

On any failure, middleware deletes the auth cookies and redirects to `/login?reason=...`.

> Note: anti-replay against the login `timestamp`/`nonce` is meaningful at login; each revalidation uses the same token. Do not weaken these checks without an explicit threat-model change.

### 1.4 CAPTCHA

`src/lib/captcha.ts` + `src/app/api/captcha/*`:

- Issues a signed challenge token (HMAC-SHA256 over `answer:expiresAt`), valid ~5 min.
- `verifyCaptchaToken()` validates signature + expiry + case-insensitive answer server-side **before** login proceeds.
- Avoids confusing characters (`0O`, `1Il`) in the SVG text.

---

## 2. Authorization

### 2.1 API routes — `withAuth`

`src/lib/api-auth.ts` `requireAuth()` rejects (401) any handler call without a valid session/user; `withAuth` wraps handlers.

### 2.2 Multi-tenant isolation — `tenant-prisma.ts`

The strongest data-protection control. `getScopedPrisma(companyId)` returns a `Proxy` that **automatically** injects `companyId` into reads/writes for tenant tables (see `docs/architecture.md` §5). Cross-company access is structurally prevented when code uses the scoped client.

### 2.3 Page-level RBAC — `role-access-check.ts`

Server-side page authorization maps URLs to navigation items and enforces **granular action permissions** (`view` / `create` / `edit` / `delete` / `approve`) stored per navigation item. Dynamic route segments `[param]` are matched with a generated regex. A `SUPER_ADMIN_ROLE_ID` bypass is defined for feature-manager tooling.

---

## 3. Transport & cookies

- **HTTPS enforced in production** (Vercel). Session cookies are HTTP-only.
- Input validation with **Zod** server-side (`src/lib/validations/`).
- SQL-injection resistance from **Prisma ORM** (parameterized queries). Raw SQL is limited (`$queryRaw` in `role-access-check`), always parameterized.

---

## 4. Production checklist

1. Set a strong `NEXTAUTH_SECRET` (`openssl rand -base64 32`), never the sample value.
2. Set a strong `PASSWORD_PEPPER` (`openssl rand -base64 32`).
3. Set a strong `CAPTCHA_SECRET` (the code has a fallback for dev — override in prod).
4. Change the **default admin password** after first login / after any seed in a shared environment.
5. Use a strong DB password; keep `DATABASE_URL` (and Neon `DIRECT_URL`) secret.
6. Enforce HTTPS + the platform CSP / security headers.
7. Keep `DEMO_MODE` **off** in production and do not enable `debugSessionSecurity`.
---

## 5. Known cautions / review points (already in the code)

These are intentional or accepted trade-offs worth documenting so agents do not regress them or assume they are bugs:

- **`securityConfig.debugSessionSecurity: true`** — when on, the `session` callback attaches a `session.security` blob (IP, fingerprint, UA, timestamp, nonce) that can reach client code. It is a **dev-only debug aid**; production runs should disable it.
- **Hardcoded admin/super-admin role IDs** — `SUPER_ADMIN_ROLE_ID` (`role-access-check.ts`) and `ADMIN_ROLE_ID` (`Sidebar`) are seeded UUIDs (`...000000000201`). They act as the admin bypass; keep them in sync when seeding roles.
- **Default `performedBy` fallbacks** — several legacy routes default to `performedBy || "1"`. New code should resolve the actor from the authenticated session (`auth.user.id`) instead.
- **Legacy unscoped reads** — older routes hand-add `where: { companyId }`. Prefer `currentUser()`/`getScopedPrisma` for new code.
- **Middleware IP source** — `getClientIp` trusts `x-forwarded-for` / `x-real-ip`; ensure the reverse proxy strips/overwrites these to avoid spoofing on a direct connection.

---

## 6. Agent security rules (non-negotiable)

1. Never read a request header to make an authz decision unless it is server-controlled; treat client-submitted IP/UA as untrusted input for *binding*, not authorization.
2. Always validate input with the shared Zod schemas on the server.
3. Always use the tenant-scoped Prisma client for per-company data.
4. Always log out through `signOut` / middleware-flow; never add debug endpoints that leak session internals.
5. Never commit secrets; document new env vars in `sample.env` with placeholder-only examples.
6. When in doubt about a security-sensitive change, flag it for review rather than silently loosening a control.

---

See also: `docs/lifecycle.md`, `docs/architecture.md`, and the repo `SECURITY.md` for reporting/vulnerability policy.
8. Run `npm audit` for dependency vulnerabilities; keep `package-lock.json` committed for reproducible installs.