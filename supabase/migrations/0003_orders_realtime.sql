-- Lets the dashboard subscribe to live INSERT/DELETE events on `orders`
-- so the list refreshes automatically instead of requiring a manual reload.
alter publication supabase_realtime add table public.orders;
