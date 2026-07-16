-- Products now carry a per-item price, so require "prijs" alongside
-- "naam" and "aantal" in the stored jsonb shape.
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
    if not (item ? 'naam' and item ? 'aantal' and item ? 'prijs') then
      return false;
    end if;
  end loop;

  return true;
end;
$$;
