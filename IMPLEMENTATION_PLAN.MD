# Sushi Point — Order Management Dashboard
## Implementation Plan

### Stack
- Next.js 15 (App Router, TypeScript, Server Components)
- Tailwind CSS (Black + Gold brand palette)
- Supabase (Postgres + Auth) via `@supabase/ssr`
- Lucide React icons

### Brand tokens
- `background`: `#0A0A0A` (near-black)
- `surface`: `#171412` (sidebar/cards)
- `gold`: `#D4AF37` (primary accent, buttons, highlights)
- `gold-hover`: `#C9A227`
- `border`: `#2A2723`
- text: white / `#E5E1D8` (muted gold-white) / `#8A8578` (secondary)

---

### Step 1 — Project scaffolding
- `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`
- Tailwind v4 setup (`app/globals.css` with `@theme` tokens) — no separate `tailwind.config.ts` needed for v4, using CSS-based config
- `.eslintrc` / `eslint.config.mjs`
- `.gitignore`
- `.env.local.example` with the three Supabase variables

### Step 2 — Supabase client helpers (`lib/supabase/`)
- `lib/supabase/client.ts` — browser client (`createBrowserClient`) for Client Components
- `lib/supabase/server.ts` — server client (`createServerClient`) using `next/headers` cookies, for Server Components/Actions/Route Handlers
- `lib/supabase/middleware.ts` — `updateSession` helper that refreshes the auth cookie and is called from `middleware.ts`
- `lib/types.ts` — `Order`, `Producten` (JSONB line item shape) TypeScript interfaces

### Step 3 — Database schema (`supabase/migrations/`)
- `orders` table: `id uuid pk default gen_random_uuid()`, `naam text`, `email text`, `telefoonnummer text`, `adres text`, `producten jsonb`, `bezorgmethode text`, `betaalmethode text`, `created_at timestamptz default now()`
- Enable RLS on `orders`
- Policy: only authenticated users (staff) can `select`; inserts happen via a public order form using the anon key with a permissive `insert` policy (customer-facing checkout), or via service role from a server action — documented as a decision point
- Index on `created_at` for dashboard sorting

### Step 4 — Middleware & route protection
- `middleware.ts` at project root: runs `updateSession`, checks Supabase auth session, redirects unauthenticated requests hitting `/dashboard/**` to `/login`, redirects authenticated users away from `/login` to `/dashboard`
- `matcher` config excludes static assets/`_next`

### Step 5 — Auth pages
- `app/login/page.tsx` — Server Component shell rendering a Client Component form
- `app/login/login-form.tsx` — Client Component: email/password fields, calls `supabase.auth.signInWithPassword`, shows error state, redirects to `/dashboard` on success
- `app/auth/actions.ts` — optional Server Action alternative for sign-in/sign-out (used for sign-out button in sidebar)

### Step 6 — Dashboard layout
- `app/dashboard/layout.tsx` — Server Component: fetches session/user server-side, renders `<Sidebar />` + main content area, redirects to `/login` if no session (defense in depth alongside middleware)
- `components/sidebar.tsx` — black sidebar, gold active-state, nav items (Orders, [future: Menu, Settings]), sign-out button, Lucide icons
- `components/topbar.tsx` — optional top bar with page title / user email

### Step 7 — Orders list (data view)
- `app/dashboard/page.tsx` — Server Component: `createServerClient()`, `select * from orders order by created_at desc`, passes data to a table component
- `components/orders-table.tsx` — Client Component: black/gold styled table — columns: Naam, Email, Telefoon, Bezorgmethode, Betaalmethode, Totaal, Besteld op, and "Bekijk"/"Verwijder" row actions
- `app/dashboard/actions.ts` — `deleteOrder` Server Action, runs as the signed-in user (not the service role key) so the `delete` RLS policy in `0002_orders_delete_policy.sql` gates it; confirmed with a native `confirm()` prompt before deleting
- Empty/loading/error states

### Step 8 — Order detail view
- `components/order-detail-modal.tsx` — Client Component modal (Radix-free, simple headless implementation) showing full order: contact info, adres, bezorg/betaalmethode, and a formatted rendering of `producten` (JSONB array of line items: name, qty)
- Alternative deep-link route `app/dashboard/orders/[id]/page.tsx` for direct navigation (nice-to-have, kept for shareable links)

### Step 9 — Types & data access
- `lib/types.ts` shared across server/client
- `lib/orders.ts` — thin data-access functions (`getOrders`, `getOrderById`) wrapping Supabase queries, called from Server Components only

### Step 10 — Polish & security pass
- Confirm `SUPABASE_SERVICE_ROLE_KEY` is never imported in any file under `app/**/page.tsx`/client components — only allowed in trusted server-only utilities if ever needed (not required for this read-mostly dashboard)
- Verify RLS policies block anonymous `select` on `orders`
- Responsive check: sidebar collapses to a top bar / drawer on mobile
- Lucide icons for nav, actions, empty states
- README with setup instructions (Supabase project creation, running the SQL migration, env vars, `npm run dev`)

### Step 11 — n8n order ingestion (replaces the Excel-writing step)
- `app/api/orders/route.ts` — `POST` webhook n8n calls in place of its Excel step. Authenticates via a shared secret (`x-webhook-secret` header, compared with `timingSafeEqual`), not a Supabase key — n8n never holds anything that bypasses RLS.
- `lib/producten.ts` — validates the `producten` field (an array of `{ name, amount }` objects, as sent by n8n) and maps it to the `{ naam, aantal }[]` shape the `orders` table expects
- `lib/supabase/admin.ts` — service-role client, used only inside this route, to perform the insert (the `orders` table has no anon/authenticated insert policy by design)
- `totaalprijs` isn't in the source data yet, so it defaults to `0` if n8n doesn't send it; the route accepts it as an optional field for when a price source is wired up later

### Step 12 — Vapi voice widget
- `components/vapi-widget.tsx` — loads Vapi's official floating-button script (`html-script-tag`), mounted site-wide in `app/layout.tsx`. Not an iframe: `vapi.ai` sends `frame-ancestors 'none'`, so the shareable demo link (`?demo=true&shareKey=...`) can't be framed — the officially embeddable widget (public API key + assistant ID) is the only way to get a real in-page floating/expanding widget
- Requires `NEXT_PUBLIC_VAPI_PUBLIC_KEY` (Vapi dashboard → Settings → API Keys → Public Key); degrades to a no-op with a console warning if unset, rather than breaking the page

---

### Deliverables produced in this pass
`IMPLEMENTATION_PLAN.MD`, `.env.local.example`, `lib/supabase/server.ts`, `lib/supabase/client.ts`, `lib/supabase/middleware.ts`, `middleware.ts`, `lib/types.ts`, `lib/orders.ts`, `supabase/migrations/0001_orders.sql`, `app/login/page.tsx`, `app/login/login-form.tsx`, `app/dashboard/layout.tsx`, `app/dashboard/page.tsx`, `components/sidebar.tsx`, `components/orders-table.tsx`, `components/order-detail-modal.tsx`, plus standard Next.js/Tailwind config files.

---

## Mobile Responsiveness Follow-up

Step 10 flagged "sidebar collapses to a top bar / drawer on mobile" as a responsive check, but it was never built — the dashboard is currently unusable on phones. This section is the plan for closing that gap.

### Problem

- [components/sidebar.tsx](components/sidebar.tsx) renders a fixed `w-64` `<aside>` unconditionally — it eats ~40% of a phone screen's width and has no collapse/hide behavior.
- [components/orders-table.tsx](components/orders-table.tsx) renders a single 8-column `<table>` wrapped only in `overflow-x-auto` — on mobile this just clips columns off-screen (confirmed via screenshot: NAAM / E-MAIL / TELEFOO… cut off) instead of being readable.
- [components/order-detail-modal.tsx](components/order-detail-modal.tsx) is mostly fine (already has a `sm:grid-cols-2` responsive grid) but its inner "Producten" table has no horizontal-scroll fallback.

No breakpoint/responsive work exists today beyond that one `sm:grid-cols-2` in the modal. Tailwind v4 default breakpoints (`sm`/`md`/`lg`) are available via `app/globals.css`; no config changes needed.

### Step A — Client-side shell to hold open/close state

**New file:** `components/dashboard-shell.tsx` (`"use client"`)

`app/dashboard/layout.tsx` is currently an async **server** component (it does the `supabase.auth.getUser()` check), so it can't hold `useState` for the mobile drawer itself. Introduce a thin client wrapper between it and `Sidebar`:

- Holds `const [open, setOpen] = useState(false)`.
- Renders a mobile-only top bar (`md:hidden`): hamburger button (`Menu` icon from `lucide-react`) + "Sushi Point" wordmark, `h-14` fixed at the top.
- Renders `Sidebar` (see Step B), passing `open`/`onClose`.
- Renders a backdrop (`fixed inset-0 bg-black/60 z-30 md:hidden`) shown only when `open`, `onClick` closes the drawer.
- Closes the drawer automatically on route change (`useEffect` keyed on `usePathname()`).
- Wraps `children` in a `<main>` with adjusted top padding on mobile to clear the fixed top bar (`pt-20 md:pt-6 lg:pt-8` or similar), keeping the existing `p-6 lg:p-8`.

**Edit:** `app/dashboard/layout.tsx` — replace the current `<div className="flex ..."><Sidebar/><main>...` markup with `<DashboardShell userEmail={...}>{children}</DashboardShell>`, keeping the existing auth redirect logic untouched.

### Step B — Sidebar becomes a slide-in drawer below `md`

**Edit:** `components/sidebar.tsx`

- Accept new props: `open: boolean`, `onClose: () => void`.
- Change the root `<aside>` classes from `flex w-64 flex-col ...` to:
  `fixed inset-y-0 left-0 z-40 flex w-64 flex-col ... transition-transform duration-200 md:static md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`
- On `md:` and up this renders exactly as it does today (static, always visible). Below `md`, it's an off-canvas drawer that slides in/out.
- Each `<Link>` in `navItems.map` should call `onClose()` on click so tapping a nav item on mobile closes the drawer immediately.
- Keep the logo header, nav list, and sign-out footer as-is — only the outer positioning/transform classes change.

### Step C — Orders table becomes readable on mobile

**Edit:** `components/orders-table.tsx`

Keep the existing `<table>` markup, but only show it at `md:` and above; add a stacked card list for smaller screens, reusing the existing `formatDate`/`formatPrice` helpers and the same `handleDelete`/`setSelected` handlers.

- Wrap the current table's outer `<div className="overflow-x-auto ...">` in `hidden md:block`.
- Add a sibling `<div className="space-y-3 md:hidden">` mapping over `orders`, one card per order:
  - Header row: `order.naam` (bold) + total price (`text-gold`).
  - Label/value rows for E-mail, Telefoon, Bezorging, Betaling, Besteld op as stacked `flex justify-between` pairs (label `text-muted`, value `text-white`) instead of table cells, so nothing gets clipped.
  - Footer row with the same "Bekijk" / "Verwijder" buttons as the desktop table.
- Empty-state block stays untouched.

### Step D — Order detail modal: safety net for the products table

**Edit:** `components/order-detail-modal.tsx`

- Add `overflow-x-auto` to the Producten table's wrapper div so a long product name on a narrow phone scrolls instead of wrapping awkwardly or breaking the layout. No other changes — the outer modal and info grid are already responsive.

### Step E — Verify

Using the Browser pane against the local dev server:

1. `resize_window` to the `mobile` preset (375×812).
2. Confirm: hamburger visible, sidebar hidden by default, tapping it slides the drawer in with backdrop, tapping a nav link or backdrop closes it.
3. Confirm: orders list renders as stacked cards with all fields visible (no clipping), Bekijk/Verwijder buttons work.
4. Open the order detail modal on mobile, confirm the info grid stacks to one column and the products table scrolls horizontally if needed.
5. Resize to `tablet` (768×1024) and `desktop` (1280×800) to confirm the `md:` breakpoint switch-over (drawer → static sidebar, cards → table) and no desktop regressions.

### Files touched

| File | Change |
|---|---|
| `components/dashboard-shell.tsx` | **New** — client wrapper holding mobile drawer open/close state, hamburger top bar, backdrop |
| `app/dashboard/layout.tsx` | Delegate rendering to `DashboardShell`, keep server-side auth check |
| `components/sidebar.tsx` | Accept `open`/`onClose`, become an off-canvas drawer below `md` |
| `components/orders-table.tsx` | Add mobile card list (`md:hidden`), hide table on mobile (`hidden md:block`) |
| `components/order-detail-modal.tsx` | Add `overflow-x-auto` to the products table wrapper |

No changes needed to `app/globals.css`, `lib/*`, or the orders API — this is purely a presentation-layer change.
