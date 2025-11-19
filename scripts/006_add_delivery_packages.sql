-- Table to store Pickup Mtaani delivery package data and link to orders
create table if not exists public.delivery_packages (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  package_id text not null, -- Pickup Mtaani package id
  tracking_code text,
  status text not null default 'created',
  shipping_method text not null default 'pickup_agent', -- or 'doorstep'
  delivery_fee decimal(10,2),
  payment_mode text default 'PREPAID', -- PREPAID or COD
  mpesa_transaction_id text,
  last_event jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.delivery_packages enable row level security;

create policy "delivery_packages_select_own"
  on public.delivery_packages for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = delivery_packages.order_id
      and o.user_id = auth.uid()
    )
  );

create policy "delivery_packages_insert_own"
  on public.delivery_packages for insert
  with check (
    exists (
      select 1 from public.orders o
      where o.id = delivery_packages.order_id
      and o.user_id = auth.uid()
    )
  );

create policy "delivery_packages_update_admin"
  on public.delivery_packages for update
  using (
    exists (
      select 1 from public.admin_users a
      where a.id = auth.uid() and a.is_active = true
    )
  );
