-- Complete Categories Initialization Script
-- Run this in Supabase SQL Editor to set up categories table and populate with initial data

-- 1. Create categories table
create table if not exists categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  description text,
  parent_id uuid references categories(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create indexes
create index if not exists categories_parent_id_idx on categories(parent_id);
create index if not exists categories_slug_idx on categories(slug);

-- 3. Enable RLS
alter table categories enable row level security;

-- 4. Create policies
drop policy if exists "Categories are viewable by everyone" on categories;
create policy "Categories are viewable by everyone"
  on categories for select
  using (true);

drop policy if exists "Authenticated users can manage categories" on categories;
create policy "Authenticated users can manage categories"
  on categories for all
  using (auth.role() = 'authenticated');

-- 5. Insert Main Categories
insert into categories (name, slug, description) values
  ('Apparel', 'apparel', 'Clothing and wearables for developers and tech enthusiasts'),
  ('Accessories', 'accessories', 'Tech accessories, gadgets, and gear'),
  ('Drinkware', 'drinkware', 'Mugs, bottles, and drink containers'),
  ('Stickers & Decals', 'stickers-decals', 'Laptop stickers, decals, and vinyl art'),
  ('Office & Desk', 'office-desk', 'Desk accessories and office supplies'),
  ('Bags & Backpacks', 'bags-backpacks', 'Tech bags, backpacks, and carrying cases')
on conflict (slug) do nothing;

-- 6. Insert Subcategories for Apparel
insert into categories (name, slug, description, parent_id)
select 'T-Shirts', 't-shirts', 'Short and long sleeve t-shirts', id from categories where slug = 'apparel'
on conflict (slug) do nothing;

insert into categories (name, slug, description, parent_id)
select 'Hoodies', 'hoodies', 'Hooded sweatshirts and jackets', id from categories where slug = 'apparel'
on conflict (slug) do nothing;

insert into categories (name, slug, description, parent_id)
select 'Sweatshirts', 'sweatshirts', 'Crew neck sweatshirts', id from categories where slug = 'apparel'
on conflict (slug) do nothing;

insert into categories (name, slug, description, parent_id)
select 'Jackets', 'jackets', 'Zip-up jackets and outerwear', id from categories where slug = 'apparel'
on conflict (slug) do nothing;

insert into categories (name, slug, description, parent_id)
select 'Hats & Caps', 'hats-caps', 'Baseball caps, beanies, and headwear', id from categories where slug = 'apparel'
on conflict (slug) do nothing;

-- 7. Insert Subcategories for Accessories
insert into categories (name, slug, description, parent_id)
select 'Phone Cases', 'phone-cases', 'Protective cases for smartphones', id from categories where slug = 'accessories'
on conflict (slug) do nothing;

insert into categories (name, slug, description, parent_id)
select 'Laptop Sleeves', 'laptop-sleeves', 'Protective sleeves and cases for laptops', id from categories where slug = 'accessories'
on conflict (slug) do nothing;

insert into categories (name, slug, description, parent_id)
select 'Tech Gadgets', 'tech-gadgets', 'USB drives, cables, and tech accessories', id from categories where slug = 'accessories'
on conflict (slug) do nothing;

insert into categories (name, slug, description, parent_id)
select 'Keychains', 'keychains', 'Tech-themed keychains and accessories', id from categories where slug = 'accessories'
on conflict (slug) do nothing;

insert into categories (name, slug, description, parent_id)
select 'Pins & Badges', 'pins-badges', 'Enamel pins and badges', id from categories where slug = 'accessories'
on conflict (slug) do nothing;

-- 8. Insert Subcategories for Drinkware
insert into categories (name, slug, description, parent_id)
select 'Mugs', 'mugs', 'Coffee mugs and tea cups', id from categories where slug = 'drinkware'
on conflict (slug) do nothing;

insert into categories (name, slug, description, parent_id)
select 'Water Bottles', 'water-bottles', 'Reusable water bottles and tumblers', id from categories where slug = 'drinkware'
on conflict (slug) do nothing;

insert into categories (name, slug, description, parent_id)
select 'Travel Mugs', 'travel-mugs', 'Insulated travel mugs and thermoses', id from categories where slug = 'drinkware'
on conflict (slug) do nothing;

-- 9. Insert Subcategories for Stickers & Decals
insert into categories (name, slug, description, parent_id)
select 'Laptop Stickers', 'laptop-stickers', 'Vinyl stickers for laptops', id from categories where slug = 'stickers-decals'
on conflict (slug) do nothing;

insert into categories (name, slug, description, parent_id)
select 'Die-Cut Stickers', 'die-cut-stickers', 'Custom shaped stickers', id from categories where slug = 'stickers-decals'
on conflict (slug) do nothing;

insert into categories (name, slug, description, parent_id)
select 'Sticker Packs', 'sticker-packs', 'Bundled sticker collections', id from categories where slug = 'stickers-decals'
on conflict (slug) do nothing;

-- 10. Insert Subcategories for Office & Desk
insert into categories (name, slug, description, parent_id)
select 'Notebooks', 'notebooks', 'Journals and notebooks', id from categories where slug = 'office-desk'
on conflict (slug) do nothing;

insert into categories (name, slug, description, parent_id)
select 'Pens & Pencils', 'pens-pencils', 'Writing instruments', id from categories where slug = 'office-desk'
on conflict (slug) do nothing;

insert into categories (name, slug, description, parent_id)
select 'Desk Mats', 'desk-mats', 'Mouse pads and desk mats', id from categories where slug = 'office-desk'
on conflict (slug) do nothing;

insert into categories (name, slug, description, parent_id)
select 'Organizers', 'organizers', 'Desk organizers and storage', id from categories where slug = 'office-desk'
on conflict (slug) do nothing;

-- 11. Insert Subcategories for Bags & Backpacks
insert into categories (name, slug, description, parent_id)
select 'Backpacks', 'backpacks', 'Tech backpacks and laptop bags', id from categories where slug = 'bags-backpacks'
on conflict (slug) do nothing;

insert into categories (name, slug, description, parent_id)
select 'Messenger Bags', 'messenger-bags', 'Shoulder bags and messenger bags', id from categories where slug = 'bags-backpacks'
on conflict (slug) do nothing;

insert into categories (name, slug, description, parent_id)
select 'Tote Bags', 'tote-bags', 'Canvas tote bags', id from categories where slug = 'bags-backpacks'
on conflict (slug) do nothing;

insert into categories (name, slug, description, parent_id)
select 'Pouches', 'pouches', 'Small pouches and organizers', id from categories where slug = 'bags-backpacks'
on conflict (slug) do nothing;

-- Success message
do $$
begin
  raise notice 'Categories initialized successfully!';
  raise notice 'Total categories created: %', (select count(*) from categories);
  raise notice 'Main categories: %', (select count(*) from categories where parent_id is null);
  raise notice 'Subcategories: %', (select count(*) from categories where parent_id is not null);
end $$;
