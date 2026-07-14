-- Allows authenticated staff to delete orders from the dashboard.
create policy "Authenticated staff can delete orders"
  on public.orders
  for delete
  to authenticated
  using (true);
