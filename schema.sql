-- Supabase Schema DDL for Dhanti Masala eCommerce

-- Enable UUID extension if not enabled
create extension if not exists "uuid-ossp";

-- 1. Categories Table
create table if not exists categories (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    slug text not null unique,
    description text,
    image_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Products Table
create table if not exists products (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    slug text not null unique,
    short_description text,
    description text,
    category_id uuid references categories(id) on delete set null,
    images text[] default '{}'::text[] not null,
    price numeric not null, -- base price for small variant
    discount_price numeric,
    weight_variants text[] default '{}'::text[] not null, -- e.g. ['250g', '500g', '1kg']
    stock_quantities jsonb default '{}'::jsonb not null, -- e.g. {"250g": 50, "500g": 30, "1kg": 15}
    sku text,
    featured boolean default false,
    status text default 'active' check (status in ('active', 'draft', 'archived')),
    seo_title text,
    seo_description text,
    shelf_life text default '6 Months from date of packaging',
    origin text default 'Bangalore, Karnataka, India',
    purity_checklist text default '100% Preservative-free, Handcrafted, Roasted traditionally',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Coupons Table
create table if not exists coupons (
    id uuid default gen_random_uuid() primary key,
    code text not null unique,
    discount_type text not null check (discount_type in ('percentage', 'flat')),
    discount_value numeric not null,
    expiry_date timestamp with time zone,
    min_order_amount numeric default 0 not null,
    usage_limit integer,
    usage_count integer default 0 not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Orders Table
create table if not exists orders (
    id uuid default gen_random_uuid() primary key,
    customer_name text not null,
    customer_email text not null,
    customer_phone text not null,
    shipping_address text not null,
    pincode text not null,
    city text not null,
    state text not null,
    items jsonb not null, -- Array of objects: [{"productId": "...", "name": "...", "variant": "250g", "qty": 2, "price": 150, "image": "..."}]
    subtotal numeric not null,
    discount numeric default 0 not null,
    total numeric not null,
    payment_method text not null check (payment_method in ('online', 'cod')),
    payment_status text default 'pending' check (payment_status in ('pending', 'paid', 'failed')),
    delivery_status text default 'pending' check (delivery_status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    transaction_id text,
    coupon_code text references coupons(code) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Customers Table
create table if not exists customers (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    email text not null unique,
    phone text not null,
    total_orders integer default 0 not null,
    total_spent numeric default 0 not null,
    last_order_date timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. CMS Content Table
create table if not exists cms_content (
    key text primary key,
    value jsonb not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Contact Queries Table
create table if not exists contact_queries (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    email text not null,
    phone text,
    message text not null,
    status text default 'pending' check (status in ('pending', 'resolved')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- SEED DATA STATEMENT --

-- Seed Categories with hardcoded UUIDs to ensure consistent references in products seed
insert into categories (id, name, slug, description, image_url)
values
('c1111111-1111-1111-1111-111111111111', 'Spices & Masalas', 'spices-masalas', 'Traditional aromatic South Indian spice blends, handcrafted in small batches.', '/images/category_masala.jpg'),
('c2222222-2222-2222-2222-222222222222', 'Nutritional Health Mixes', 'health-mixes', 'Nutrient-rich, roasted grains and flour mixes for daily wellness.', '/images/category_health.jpg')
on conflict (id) do update set
    name = excluded.name,
    slug = excluded.slug,
    description = excluded.description,
    image_url = excluded.image_url;


-- Seed Products
insert into products (id, name, slug, short_description, description, category_id, images, price, discount_price, weight_variants, stock_quantities, sku, featured, status, seo_title, seo_description)
values
(
    'a1111111-1111-1111-1111-111111111111',
    'Traditional Rasam Powder',
    'rasam-powder',
    'Handcrafted, authentic Bangalore-style Rasam powder with zero preservatives.',
    'Bring the authentic flavor of traditional South Indian kitchens to your home with Dhanti Masala’s signature Rasam Powder. Prepared using a heritage recipe passed down through generations in Bangalore, our ingredients are carefully hand-sorted, dry-roasted to perfection, and ground in small batches to preserve natural aromas and oils.\n\nIngredients: Coriander seeds, cumin seeds, black pepper, red chillies, fenugreek, mustard, hing (asafoetida), and fresh curry leaves.',
    'c1111111-1111-1111-1111-111111111111',
    array['/rasam_powder.jpg'],
    150.00,
    140.00,
    array['250g', '500g', '1kg'],
    '{"250g": 120, "500g": 80, "1kg": 40}'::jsonb,
    'DM-RASAM-001',
    true,
    'active',
    'Traditional Rasam Powder - Handcrafted Bangalore Style | Dhanti Masala',
    'Handcrafted, authentic Bangalore-style Rasam powder. Made with organic spices, roasted traditionally in small batches, no artificial colors or preservatives.'
),
(
    'b2222222-2222-2222-2222-222222222222',
    'Nutritious Ragi Hurihittu',
    'ragi-hurihittu',
    'Traditional roasted finger millet health mix, rich in calcium and iron.',
    'Experience the nourishment of Karnataka’s traditional superfood. Ragi Hurihittu (popped and roasted finger millet flour) is a wholesome nutritional supplement for all ages. Made from finest quality Ragi grains that are washed, sprouted, gently roasted, and ground, it carries a delightful earthy aroma and a sweet, toasted flavor.\n\nEnjoy it as a warm porridge mixed with milk and jaggery, or roll it into nutritious laddus with ghee and nuts.',
    'c2222222-2222-2222-2222-222222222222',
    array['/ragi_hurihittu.jpg'],
    120.00,
    110.00,
    array['250g', '500g', '1kg'],
    '{"250g": 150, "500g": 100, "1kg": 50}'::jsonb,
    'DM-RAGI-002',
    true,
    'active',
    'Nutritious Ragi Hurihittu - Wholesome Finger Millet Mix | Dhanti Masala',
    'Authentic Ragi Hurihittu roasted to perfection. Rich in nutrients, calcium, fiber, and iron. Ideal health drink mix for kids and adults alike.'
)
on conflict (id) do update set
    name = excluded.name,
    slug = excluded.slug,
    short_description = excluded.short_description,
    description = excluded.description,
    category_id = excluded.category_id,
    images = excluded.images,
    price = excluded.price,
    discount_price = excluded.discount_price,
    weight_variants = excluded.weight_variants,
    stock_quantities = excluded.stock_quantities,
    sku = excluded.sku,
    featured = excluded.featured,
    status = excluded.status;

-- Seed Coupons
insert into coupons (code, discount_type, discount_value, expiry_date, min_order_amount, usage_limit, usage_count)
values
('DHANTI10', 'percentage', 10.00, null, 0.00, 1000, 0),
('NAMMAKANNADA', 'percentage', 15.00, null, 500.00, 500, 0)
on conflict (code) do update set
    discount_type = excluded.discount_type,
    discount_value = excluded.discount_value,
    min_order_amount = excluded.min_order_amount,
    usage_limit = excluded.usage_limit;

-- Seed CMS Content
insert into cms_content (key, value)
values
('hero', '{"title": "Authentic Homemade Flavours from Karnataka", "subheading": "Experience the purity and rich heritage of Bangalore-style home cooking. Crafted in small batches, roasted traditionally, and ground with passion.", "cta_shop": "Shop Now", "cta_learn": "Learn Our Story", "banner_image": "/hero_masala.jpg"}'::jsonb),
('why_choose_us', '{"items": [{"title": "Traditional Recipes", "description": "Generational family recipes from old Mysore/Bangalore region, preserving absolute authenticity.", "icon": "recipe"}, {"title": "Fresh Ingredients", "description": "Sourced locally directly from farmers, selected carefully, and washed clean.", "icon": "ingredients"}, {"title": "No Preservatives", "description": "100% natural spices, zero artificial colors, zero MSG, and zero anti-caking agents.", "icon": "pure"}, {"title": "Small Batches", "description": "Prepared in small batches weekly to ensure it arrives fresh and aromatic at your doorstep.", "icon": "batches"}]}'::jsonb),
('quality_process', '{"steps": [{"title": "Sourcing", "description": "We handpick high-grade dry red chillies, premium coriander seeds, and organic Ragi grains from trusted local vendors."}, {"title": "Traditional Roasting", "description": "Ingredients are dry-roasted at low temperatures in iron kadhais to release essential aromatic oils."}, {"title": "Stone Grinding", "description": "Ground gently to maintain a coarser, authentic texture that locks in flavors."}, {"title": "Hygienic Packing", "description": "Packed immediately in moisture-lock premium zip pouches to preserve long-lasting freshness."}]}'::jsonb),
('testimonials', '[{"name": "Radha Murthy", "location": "Jayanagar, Bangalore", "stars": 5, "comment": "The Rasam powder tastes exactly like how my mother used to make. It has the perfect balance of pepper and cumin. Truly authentic!"}, {"name": "Anil Gowda", "location": "Indiranagar, Bangalore", "stars": 5, "comment": "Ragi Hurihittu is a savior for my breakfast. Just mix with hot milk and organic jaggery. It keeps me energized and full for hours. High quality grains."}]'::jsonb),
('featured_meal_section', '{"title": "The Soul of South Indian Dining", "subheading": "Rasam is not just food; it is comfort. Ragi Hurihittu is not just flour; it is pure nutrition. Bring the taste of Karnataka back to your dining table.", "button_text": "View Recipes"}'::jsonb),
('company_settings', '{"company_name": "Dhanti Masala", "logo_url": "/images/category_masala.jpg", "phone": "+91 98765 43210", "email": "contact@dhantimasala.com", "address": "NO 28, 1ST FLOOR, 8TH CROSS, GANAPATHY NAGAR, RAJAGOPAL NAGAR AREA, II STAGE PEENYA, BANGALORE, B.B.M.P West, Karnataka - 560058", "gstin": "29XXXXX1234F1Z5", "fssai": "11226332000065", "footer_tagline": "Traditional aromatic South Indian spices, handcrafted in small batches.", "social_instagram": "https://instagram.com/dhanti_masala", "social_facebook": "https://facebook.com/dhantimasala"}'::jsonb)
on conflict (key) do update set
    value = excluded.value;


-- ===================================================
-- 7. Row Level Security (RLS) & Policies
-- ===================================================

-- Enable Row Level Security on all tables
alter table categories enable row level security;
alter table products enable row level security;
alter table coupons enable row level security;
alter table orders enable row level security;
alter table customers enable row level security;
alter table cms_content enable row level security;

-- Drop existing policies if any to prevent conflicts
drop policy if exists "Allow public read access to categories" on categories;
drop policy if exists "Allow public insert to categories" on categories;
drop policy if exists "Allow public update to categories" on categories;
drop policy if exists "Allow public delete to categories" on categories;

drop policy if exists "Allow public read access to products" on products;
drop policy if exists "Allow public insert to products" on products;
drop policy if exists "Allow public update to products" on products;
drop policy if exists "Allow public delete to products" on products;

drop policy if exists "Allow public read access to coupons" on coupons;
drop policy if exists "Allow public insert to coupons" on coupons;
drop policy if exists "Allow public update to coupons" on coupons;
drop policy if exists "Allow public delete to coupons" on coupons;

drop policy if exists "Allow public read access to cms_content" on cms_content;
drop policy if exists "Allow public insert to cms_content" on cms_content;
drop policy if exists "Allow public update to cms_content" on cms_content;

drop policy if exists "Allow public read access to orders" on orders;
drop policy if exists "Allow public insert to orders" on orders;
drop policy if exists "Allow public update to orders" on orders;

drop policy if exists "Allow public read access to customers" on customers;
drop policy if exists "Allow public insert to customers" on customers;
drop policy if exists "Allow public update to customers" on customers;

-- Categories policies
create policy "Allow public read access to categories" on categories for select using (true);
create policy "Allow public insert to categories" on categories for insert with check (true);
create policy "Allow public update to categories" on categories for update using (true);
create policy "Allow public delete to categories" on categories for delete using (true);

-- Products policies
create policy "Allow public read access to products" on products for select using (true);
create policy "Allow public insert to products" on products for insert with check (true);
create policy "Allow public update to products" on products for update using (true);
create policy "Allow public delete to products" on products for delete using (true);

-- Coupons policies
create policy "Allow public read access to coupons" on coupons for select using (true);
create policy "Allow public insert to coupons" on coupons for insert with check (true);
create policy "Allow public update to coupons" on coupons for update using (true);
create policy "Allow public delete to coupons" on coupons for delete using (true);

-- CMS Content policies
create policy "Allow public read access to cms_content" on cms_content for select using (true);
create policy "Allow public insert to cms_content" on cms_content for insert with check (true);
create policy "Allow public update to cms_content" on cms_content for update using (true);

-- Orders policies
create policy "Allow public read access to orders" on orders for select using (true);
create policy "Allow public insert to orders" on orders for insert with check (true);
create policy "Allow public update to orders" on orders for update using (true);

-- Customers policies
create policy "Allow public read access to customers" on customers for select using (true);
create policy "Allow public insert to customers" on customers for insert with check (true);
create policy "Allow public update to customers" on customers for update using (true);

-- Contact Queries policies
alter table contact_queries enable row level security;
create policy "Allow public read access to contact_queries" on contact_queries for select using (true);
create policy "Allow public insert to contact_queries" on contact_queries for insert with check (true);
create policy "Allow public update to contact_queries" on contact_queries for update using (true);
create policy "Allow public delete to contact_queries" on contact_queries for delete using (true);



-- ===================================================
-- MIGRATION: RUN THE FOLLOWING IN SUPABASE SQL EDITOR 
-- ===================================================
-- ALTER TABLE products ADD COLUMN IF NOT EXISTS shelf_life text DEFAULT '6 Months from date of packaging';
-- ALTER TABLE products ADD COLUMN IF NOT EXISTS origin text DEFAULT 'Bangalore, Karnataka, India';
-- ALTER TABLE products ADD COLUMN IF NOT EXISTS purity_checklist text DEFAULT '100% Preservative-free, Handcrafted, Roasted traditionally';


