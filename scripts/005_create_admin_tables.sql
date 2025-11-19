-- Create admin_users table for role-based access control
create table if not exists public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role in ('superadmin', 'admin', 'moderator')),
  permissions jsonb default '[]'::jsonb,
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.admin_users enable row level security;

create policy "admin_users_select_self"
  on public.admin_users for select
  using (auth.uid() = id);

-- Create promotions table
create table if not exists public.promotions (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  description text,
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  discount_value decimal(10, 2) not null,
  min_purchase_amount decimal(10, 2),
  max_uses integer,
  uses_count integer default 0,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  is_active boolean default true,
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.promotions enable row level security;

create policy "promotions_select_all"
  on public.promotions for select
  using (true);

-- Create content table for homepage banners and other static content
create table if not exists public.content (
  id uuid primary key default gen_random_uuid(),
  section text unique not null,
  title text,
  description text,
  image_url text,
  button_text text,
  button_link text,
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.content enable row level security;

create policy "content_select_all"
  on public.content for select
  using (true);

-- Create settings table
create table if not exists public.settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.settings enable row level security;

create policy "settings_select_all"
  on public.settings for select
  using (true);

-- Create activity_logs table
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  action text not null,
  entity_type text,
  entity_id uuid,
  details jsonb,
  created_at timestamp with time zone default now()
);

alter table public.activity_logs enable row level security;

create policy "activity_logs_select_own"
  on public.activity_logs for select
  using (auth.uid() = user_id);

-- Update orders table to add more fields
alter table public.orders add column if not exists shipping_address text;
alter table public.orders add column if not exists shipping_method text default 'home_delivery';
alter table public.orders add column if not exists payment_method text default 'mpesa';
alter table public.orders add column if not exists notes text;

-- Add admin policy for products
create policy "products_insert_admin"
  on public.products for insert
  with check (
    exists (
      select 1 from public.admin_users
      where admin_users.id = auth.uid() and admin_users.is_active = true
    )
  );

create policy "products_update_admin"
  on public.products for update
  using (
    exists (
      select 1 from public.admin_users
      where admin_users.id = auth.uid() and admin_users.is_active = true
    )
  );

create policy "products_delete_admin"
  on public.products for delete
  using (
    exists (
      select 1 from public.admin_users
      where admin_users.id = auth.uid() and admin_users.is_active = true
    )
  );

-- Add admin policies for orders
create policy "orders_select_admin"
  on public.orders for select
  using (
    exists (
      select 1 from public.admin_users
      where admin_users.id = auth.uid() and admin_users.is_active = true
    ) or auth.uid() = user_id
  );

create policy "orders_update_admin"
  on public.orders for update
  using (
    exists (
      select 1 from public.admin_users
      where admin_users.id = auth.uid() and admin_users.is_active = true
    )
  );
