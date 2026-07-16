# Sushi Point — Order Dashboard

Order management dashboard for Sushi Point, built with Next.js 15 (App
Router), Tailwind CSS, and Supabase.

See [IMPLEMENTATION_PLAN.MD](./IMPLEMENTATION_PLAN.MD) for the full design.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a Supabase project at [supabase.com](https://supabase.com).

3. Copy the env template and fill in your project's keys (Project Settings →
   API):

   ```bash
   cp .env.local.example .env.local
   ```

4. Run the migrations in `supabase/migrations/` against your project, in
   order (`0001_orders.sql`, `0002_orders_delete_policy.sql`, then
   `0003_orders_producten_prijs.sql`) — either paste them into the Supabase
   SQL editor, or with the CLI:

   ```bash
   supabase db push
   ```

5. Create a staff user to log in with (Supabase Dashboard → Authentication →
   Users → Add user), and insert a test order or two into the `orders`
   table so the dashboard has data to show.

6. Start the dev server:

   ```bash
   npm run dev
   ```

7. Visit `http://localhost:3000` — you'll be redirected to `/login`. Sign in
   with the staff user you created to reach `/dashboard`.

## n8n integration

`app/api/orders/route.ts` replaces the Excel-writing step in your n8n
workflow. Point the HTTP Request node that used to write the spreadsheet row
at this endpoint instead:

- **Method:** `POST`
- **URL:** `https://<your-deployment>/api/orders`
- **Headers:** `x-webhook-secret: <N8N_ORDERS_WEBHOOK_SECRET value>`
- **Body (JSON):**

  ```json
  {
    "naam": "Sophie",
    "email": "sophie.jansen@gmail.com",
    "telefoonnummer": "31612345678",
    "adres": "Kerkstraat 25, 4901 JD Oosterhout",
    "producten": [
      { "name": "sushi rol", "amount": 1, "price": 12.95 },
      { "name": "Coca Cola Zero", "amount": 2, "price": 2.75 }
    ],
    "bezorgmethode": "bezorgen",
    "betaalmethode": "contant"
  }
  ```

`producten` must be a non-empty array of `{ name, amount, price }` objects —
`name` a non-empty string, `amount` a positive number, `price` a
non-negative number (per-item price). Each entry is mapped to
`{ naam, aantal, prijs }` and stored in the `producten` jsonb column.
`totaalprijs` is calculated server-side as the sum of `price * amount`
across all products — it's not read from the request body.

If your Vercel project has Deployment Protection enabled, n8n also needs an
`x-vercel-protection-bypass` header (Vercel → Settings → Deployment
Protection → Protection Bypass for Automation) or the deployment must have
protection disabled for Production, or every request — including this one —
gets rejected by Vercel before it reaches this route.

Set `N8N_ORDERS_WEBHOOK_SECRET` (a long random value, e.g.
`openssl rand -hex 32`) in `.env.local` and in your deployment's environment
variables, and use the same value in n8n's header.

## Voice widget (Vapi)

`components/vapi-widget.tsx` loads Vapi's official floating voice-agent
widget (a script tag, not an iframe — vapi.ai sends
`Content-Security-Policy: frame-ancestors 'none'`, so it can't be embedded
any other way) site-wide via `app/layout.tsx`. It renders its own floating
button and expanding call UI once loaded.

Set `NEXT_PUBLIC_VAPI_PUBLIC_KEY` in `.env.local` and your deployment's
environment variables — get it from the Vapi dashboard under
**Settings → API Keys → Public Key** (this is different from the `shareKey`
used in Vapi's shareable demo links). The assistant ID is hardcoded in
`components/vapi-widget.tsx` (`VAPI_ASSISTANT_ID`); if `NEXT_PUBLIC_VAPI_PUBLIC_KEY`
is unset, the widget silently does nothing (logs a console warning) instead
of breaking the page.

## Security notes

- `SUPABASE_SERVICE_ROLE_KEY` is used in exactly one place:
  `lib/supabase/admin.ts`, which is only imported by `app/api/orders/route.ts`
  to insert orders on n8n's behalf. It bypasses RLS, so that route is the
  only place in the codebase that should ever import it.
- Every other query runs through `@supabase/ssr` with the publishable key,
  scoped by the signed-in user's session and enforced by the RLS policy in
  the migration.
- `orders` has RLS enabled with `select` and `delete` policies for
  authenticated staff (dashboard users). There's no `insert`/`update`
  policy, so the webhook route above (using the service role key) is the
  only supported way to create an order — never insert directly from the
  browser. Deleting an order is done via `app/dashboard/actions.ts`'s
  `deleteOrder`, which runs as the signed-in user through normal RLS (no
  service role key involved) — only authenticated staff can delete.
- `middleware.ts` refreshes the auth session on every request and redirects
  unauthenticated requests to `/dashboard/**` to `/login`. `app/dashboard/layout.tsx`
  re-checks the session server-side as defense in depth.
