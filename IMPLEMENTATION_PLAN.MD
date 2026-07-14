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
- `components/orders-table.tsx` — Client Component: black/gold styled table — columns: Naam, Email, Telefoon, Bezorgmethode, Betaalmethode, Besteld op, and a "Bekijk" action that opens the detail modal
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
- `lib/producten.ts` — parses the free-text `producten` field (e.g. `"1x The Box - Gold , 2x Coca Cola Zero"`) into the `{ naam, aantal }[]` shape the `orders` table expects
- `lib/supabase/admin.ts` — service-role client, used only inside this route, to perform the insert (the `orders` table has no anon/authenticated insert policy by design)
- `totaalprijs` isn't in the source data yet, so it defaults to `0` if n8n doesn't send it; the route accepts it as an optional field for when a price source is wired up later

---

### Deliverables produced in this pass
`IMPLEMENTATION_PLAN.MD`, `.env.local.example`, `lib/supabase/server.ts`, `lib/supabase/client.ts`, `lib/supabase/middleware.ts`, `middleware.ts`, `lib/types.ts`, `lib/orders.ts`, `supabase/migrations/0001_orders.sql`, `app/login/page.tsx`, `app/login/login-form.tsx`, `app/dashboard/layout.tsx`, `app/dashboard/page.tsx`, `components/sidebar.tsx`, `components/orders-table.tsx`, `components/order-detail-modal.tsx`, plus standard Next.js/Tailwind config files.
