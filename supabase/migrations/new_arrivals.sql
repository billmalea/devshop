-- New Arrivals / Hero Images Table
-- This table stores images for the hero section (web) and new arrivals slider (mobile)

create table if not exists new_arrivals (
  id uuid primary key default uuid_generate_v4(),
  image_url text not null,
  title text,
  description text,
  link_url text,
  display_order int not null default 0,
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Add RLS policies
alter table new_arrivals enable row level security;

-- Allow public read access
create policy "Allow public read access"
  on new_arrivals for select
  using (is_active = true);

-- Allow authenticated users to manage
create policy "Allow authenticated users to manage"
  on new_arrivals for all
  using (auth.role() = 'authenticated');

-- Create index for ordering
create index if not exists new_arrivals_display_order_idx on new_arrivals(display_order);

-- Add trigger for updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_new_arrivals_updated_at
  before update on new_arrivals
  for each row
  execute function update_updated_at_column();
