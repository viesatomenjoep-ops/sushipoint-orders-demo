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

4. Run the migration in `supabase/migrations/0001_orders.sql` against your
   project — either paste it into the Supabase SQL editor, or with the CLI:

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
      { "name": "sushi rol", "amount": 1 },
      { "name": "Coca Cola Zero", "amount": 2 }
    ],
    "bezorgmethode": "bezorgen",
    "betaalmethode": "contant"
  }
  ```

`producten` must be a non-empty array of `{ name, amount }` objects — `name`
a non-empty string, `amount` a positive number. Each entry is mapped to
`{ naam, aantal }` and stored in the `producten` jsonb column. `totaalprijs`
is optional in the request body — it defaults to `0` if omitted.

If your Vercel project has Deployment Protection enabled, n8n also needs an
`x-vercel-protection-bypass` header (Vercel → Settings → Deployment
Protection → Protection Bypass for Automation) or the deployment must have
protection disabled for Production, or every request — including this one —
gets rejected by Vercel before it reaches this route.

Set `N8N_ORDERS_WEBHOOK_SECRET` (a long random value, e.g.
`openssl rand -hex 32`) in `.env.local` and in your deployment's environment
variables, and use the same value in n8n's header.

## Security notes

- `SUPABASE_SERVICE_ROLE_KEY` is used in exactly one place:
  `lib/supabase/admin.ts`, which is only imported by `app/api/orders/route.ts`
  to insert orders on n8n's behalf. It bypasses RLS, so that route is the
  only place in the codebase that should ever import it.
- Every other query runs through `@supabase/ssr` with the publishable key,
  scoped by the signed-in user's session and enforced by the RLS policy in
  the migration.
- `orders` has RLS enabled with a `select`-only policy for authenticated
  staff. There are no `insert`/`update`/`delete` policies, so the webhook
  route above (using the service role key) is the only supported way to
  create an order — never insert directly from the browser.
- `middleware.ts` refreshes the auth session on every request and redirects
  unauthenticated requests to `/dashboard/**` to `/login`. `app/dashboard/layout.tsx`
  re-checks the session server-side as defense in depth.
