-- Create categories table for managing product categories and subcategories

create table if not exists categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  description text,
  parent_id uuid references categories(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create index on parent_id for faster subcategory queries
create index if not exists categories_parent_id_idx on categories(parent_id);

-- Create index on slug for faster lookups
create index if not exists categories_slug_idx on categories(slug);

-- Enable RLS
alter table categories enable row level security;

-- Allow public read access to categories
create policy "Categories are viewable by everyone"
  on categories for select
  using (true);

-- Allow authenticated users to insert/update/delete categories (admin only in practice)
create policy "Authenticated users can manage categories"
  on categories for all
  using (auth.role() = 'authenticated');

-- Insert some default categories
insert into categories (name, slug, description) values
  ('Apparel', 'apparel', 'Clothing and wearables'),
  ('Accessories', 'accessories', 'Tech accessories and gadgets'),
  ('Drinkware', 'drinkware', 'Mugs, bottles, and drink containers')
on conflict (slug) do nothing;

-- Insert some default subcategories
insert into categories (name, slug, description, parent_id)
select 'T-Shirts', 't-shirts', 'Short and long sleeve t-shirts', id from categories where slug = 'apparel'
on conflict (slug) do nothing;

insert into categories (name, slug, description, parent_id)
select 'Hoodies', 'hoodies', 'Hooded sweatshirts and jackets', id from categories where slug = 'apparel'
on conflict (slug) do nothing;

insert into categories (name, slug, description, parent_id)
select 'Mugs', 'mugs', 'Coffee mugs and cups', id from categories where slug = 'drinkware'
on conflict (slug) do nothing;
