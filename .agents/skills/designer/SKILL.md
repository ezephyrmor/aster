# Skill: UI/UX Design & Implementation (Designer)

Use this playbook when building or modifying **any UI** in Aster. It encodes the project's design system so new screens match existing ones.

Read these first: `docs/architecture.md` (§2 components), `docs/best-practices.md` (§6 frontend).

---

## Design system (this codebase, in one place)

- **Styling engine:** Tailwind CSS **v4**, imported once in `src/app/globals.css` (`@import "tailwindcss"`). Do **not** add a Tailwind config; use utility classes in JSX. `globals.css` sets `html { background-color: #18181b }` to avoid a white-flash on load — preserve that.
- **Dark mode:** via `dark:` variants using the **zinc** palette (`dark:bg-zinc-800`, `dark:text-zinc-100`, `dark:border-zinc-700`, ...).
- **Class merging:** always compose with `cn()` (from `src/lib/utils.ts`). Do not write raw template strings of classes.
- **Components:** use the shadcn/base-ui primitives in `src/components/ui/` — `Button`, `Input`, `table`, `data-table`, `dropdown-menu`. Never hand-roll a control that already exists.
- **Component varianting:** extend via **CVA** (`class-variance-authority`) in `buttonVariants`-style maps rather than overriding inline.

---

## Core components & conventions

### Buttons (`src/components/ui/button.tsx`)

- Variants: `default` (really the **`blue` gradient** — this is the app's primary CTA), plus `blue/green/cyan/teal/lime/red/pink/purple` **gradient** variants, and `outline` / `secondary` / `ghost` / `destructive` / `link`.
- Sizes: `default`, `xs`, `sm`, `lg`, `icon`, `icon-xs`, `icon-sm`, `icon-lg`.
- Default variant is **`blue`**, default size **`default`**.
- Gradient variants carry built-in `shadow-lg shadow-{color}-500/50` + `focus:ring-4 focus:ring-{color}-300` + `hover:bg-gradient-to-br`.
- SVG icons inside buttons are sized via `[&_svg:not([class*='size-'])]:size-4` — do not add manual `w-4 h-4` to icons.

```tsx
// Primary action
<Button variant="blue">Save</Button>

// Secondary / outline
<Button variant="outline">Cancel</Button>

// Danger
<Button variant="destructive">Delete</Button>

// Ghost (quiet, icon-only rows)
<Button variant="ghost" size="icon-sm"><Icon /></Button>
```

### Inputs (`src/components/ui/input.tsx`)

- Consistent shape: `h-8 rounded-lg border-input bg-transparent px-2.5 text-base md:text-sm`, `focus-visible:ring-3 focus-visible:ring-ring/50`, `dark:bg-zinc-700 dark:border-zinc-600`.
- `aria-invalid` styling is pre-wired for validation errors (`aria-invalid:border-destructive`). Use it with React Hook Form errors instead of ad-hoc red styling.

### Layout / shell

- Root: `<body class="min-h-full flex flex-col">`; `html` has `h-full antialiased`.
- Dashboard uses a sidebar + responsive layout that must stay usable on small screens.

---

## Interaction patterns

- **Forms:** build them with the existing form components + **React Hook Form** + **Zod** (`@hookform/resolvers`). Reuse the shared validations in `src/lib/validations/*.schema.ts`. Wire `aria-invalid` and error messaging against RHF's `formState.errors`.
- **Tables:** prefer `ServerSideDataTable` (`src/components/tables/ServerSideDataTable.tsx`) + column definitions under `src/components/tables/columns/` and list wrappers under `lists/`. Use `data-table` (TanStack) for client-side tables.
- **Feedback:** use the toast system (`ToastProvider`, `src/components/feedback/Toast`) for success/error feedback rather than inline alerts.
- **Modals:** reuse `src/components/modals/Modal.tsx` (and `CaptchaModal` for captcha flows).
- **Icons:** `lucide-react` (already used in `Sidebar`, buttons, etc.).
- **Widgets:** reuse existing widgets (`CalendarWidget`, `ClockInButton`, `LookupDropdown`, `SessionTimer`) when the need matches.

---

## Palette & visual language

- Backgrounds: `bg-zinc-50` (light) / `bg-zinc-900` (dark) for pages; cards `white` / `dark:bg-zinc-800`.
- Primary CTAs: the blue→purple gradient family (login screen uses `from-blue-500 via-blue-600 to-blue-700`; the login page hero uses `from-blue-50 via-white to-purple-50` light / zinc dark). Keep the gradient + glow (`shadow-blue-500/50`) look for primary actions.
- Brand accent on login: blue gradient on the lock icon tile (`from-blue-500 to-purple-600`).
- Status colors already used in the app: red (destructive), green (success/presence), etc. Reuse semantic Tailwind colors, don't invent a new palette.

---

## Verify visually (mandatory step)

Before finishing any UI change:

1. Run `npm run dev` (rebuild if you touched Next.js core).
2. Check **both** light and dark modes.
3. Confirm **no horizontal overflow** on small (mobile) widths — the responsive shell must hold.
4. Confirm **button/input sizing and icon alignment** (icons centered, `size-4` within buttons).
5. Confirm focus rings and `aria-invalid` states are visible for forms.
6. Reuse of primitives (no duplicated control markup) where possible.

---

## Anti-patterns to avoid

- ❌ Adding a new `tailwind.config.*` or `@layer` overrides unless absolutely required.
- ❌ Inline `style={}` for layout/spacing — use utility classes.
- ❌ Hand-rolling buttons/inputs/modals/tables when `src/components/ui` has them.
- ❌ Hardcoding colors outside the existing palette / zinc dark-mode pattern.
- ❌ Raising toast-only feedback without `ToastProvider` present.
- ❌ Skipping dark-mode + mobile verification.