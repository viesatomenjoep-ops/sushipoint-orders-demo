create extension if not exists "pgcrypto";

-- CHECK constraints can't contain subqueries directly, so the array-shape
-- validation lives in this immutable function instead.
create or replace function public.valid_producten(items jsonb)
returns boolean
language plpgsql
immutable
as $$
declare
  item jsonb;
begin
  if jsonb_typeof(items) <> 'array' then
    return false;
  end if;

  for item in select * from jsonb_array_elements(items)
  loop
    if not (item ? 'naam' and item ? 'aantal') then
      return false;
    end if;
  end loop;

  return true;
end;
$$;

create table if not exists public.orders (
  id              uuid primary key default gen_random_uuid(),
  naam            text not null,
  email           text not null,
  telefoonnummer  text not null,
  adres           text not null,
  -- Array of { "naam": text, "aantal": number }, e.g.
  -- [{"naam": "California Roll", "aantal": 2}]
  producten       jsonb not null default '[]'::jsonb,
  bezorgmethode   text not null,
  betaalmethode   text not null,
  totaalprijs     numeric(10, 2) not null default 0,
  created_at      timestamptz not null default now(),

  constraint totaalprijs_non_negative check (totaalprijs >= 0),

  constraint producten_shape check (public.valid_producten(producten))
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);

alter table public.orders enable row level security;

-- Staff (any authenticated dashboard user) can read all orders.
create policy "Authenticated staff can view orders"
  on public.orders
  for select
  to authenticated
  using (true);

-- No insert/update/delete policies are defined: this app is a read-only
-- staff dashboard. Orders should be created by a trusted server-side
-- process (e.g. a checkout API route using the service role key, which
-- bypasses RLS) rather than directly from the browser.
