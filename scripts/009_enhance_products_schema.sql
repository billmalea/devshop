-- Enhance products table with additional fields for better product management

-- Add new columns to products table
alter table public.products 
  add column if not exists slug text unique,
  add column if not exists short_description text,
  add column if not exists long_description text,
  add column if not exists main_category text,
  add column if not exists sub_category text,
  add column if not exists tags text[],
  add column if not exists colors text[],
  add column if not exists sizes text[],
  add column if not exists weight_kg decimal(10, 2),
  add column if not exists dimensions_cm text, -- format: "L x W x H"
  add column if not exists sku text unique,
  add column if not exists is_featured boolean default false,
  add column if not exists is_active boolean default true,
  add column if not exists discount_percentage integer default 0,
  add column if not exists ai_generated_image boolean default false,
  add column if not exists ai_generated_description boolean default false,
  add column if not exists meta_title text,
  add column if not exists meta_description text,
  add column if not exists updated_at timestamp with time zone default now();

-- Create function to auto-generate slug from name
create or replace function generate_product_slug()
returns trigger as $$
declare
  base_slug text;
  final_slug text;
  counter integer := 0;
begin
  -- Generate base slug from name
  base_slug := lower(regexp_replace(new.name, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  
  final_slug := base_slug;
  
  -- Check for uniqueness and append number if needed
  while exists (select 1 from products where slug = final_slug and id != coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid)) loop
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  end loop;
  
  new.slug := final_slug;
  new.updated_at := now();
  
  return new;
end;
$$ language plpgsql;

-- Create trigger for auto-generating slugs
drop trigger if exists products_generate_slug on public.products;
create trigger products_generate_slug
  before insert or update of name on public.products
  for each row
  execute function generate_product_slug();

-- Create product categories reference table
create table if not exists public.product_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  parent_category text,
  display_order integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

alter table public.product_categories enable row level security;

create policy "product_categories_select_all"
  on public.product_categories for select
  using (true);

-- Seed initial categories
insert into public.product_categories (name, slug, description, parent_category) values
('Apparel', 'apparel', 'Clothing and wearables', null),
('Accessories', 'accessories', 'Tech accessories and add-ons', null),
('Hoodies', 'hoodies', 'Hooded sweatshirts', 'Apparel'),
('T-Shirts', 'tshirts', 'T-shirt collection', 'Apparel'),
('Sweatshirts', 'sweatshirts', 'Crew neck sweatshirts', 'Apparel'),
('Stickers', 'stickers', 'Vinyl stickers and decals', 'Accessories'),
('Headbands', 'headbands', 'Sports and casual headbands', 'Accessories')
on conflict (slug) do nothing;

-- Create product brands reference table
create table if not exists public.product_brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  logo_url text,
  website_url text,
  display_order integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

alter table public.product_brands enable row level security;

create policy "product_brands_select_all"
  on public.product_brands for select
  using (true);

-- Seed initial brands
insert into public.product_brands (name, slug, description) values
('Amazon', 'amazon', 'Amazon and AWS merchandise'),
('AWS', 'aws', 'Amazon Web Services branded items'),
('Vercel', 'vercel', 'Vercel platform merchandise'),
('Anthropic', 'anthropic', 'Anthropic AI branded products'),
('Google', 'google', 'Google products and services merch'),
('Microsoft', 'microsoft', 'Microsoft and Azure merchandise'),
('GitHub', 'github', 'GitHub developer merchandise'),
('Meta', 'meta', 'Meta platforms merchandise'),
('OpenAI', 'openai', 'OpenAI branded products'),
('Stripe', 'stripe', 'Stripe payment platform merch')
on conflict (slug) do nothing;

-- Update existing products with main_category and sub_category
update public.products
set 
  main_category = 'Apparel',
  sub_category = category,
  short_description = description,
  is_active = true
where main_category is null;

-- Create index for better search performance
create index if not exists idx_products_slug on public.products(slug);
create index if not exists idx_products_brand on public.products(brand);
create index if not exists idx_products_category on public.products(category);
create index if not exists idx_products_main_category on public.products(main_category);
create index if not exists idx_products_tags on public.products using gin(tags);
create index if not exists idx_products_is_active on public.products(is_active);
create index if not exists idx_products_is_featured on public.products(is_featured);
