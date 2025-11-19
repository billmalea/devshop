-- Function to decrement product stock
create or replace function public.decrement_stock(p_product_id uuid, p_qty integer)
returns void
language plpgsql
security definer
as $$
begin
  update public.products
  set stock = greatest(stock - p_qty, 0)
  where id = p_product_id;
end;
$$;
