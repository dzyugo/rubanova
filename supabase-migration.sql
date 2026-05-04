-- =============================================
-- Ruba Nova — Full Supabase Migration
-- =============================================

-- 1. PROFILES (extends auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  role text not null default 'shopper' check (role in ('admin','shopper')),
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "Anyone can read profiles" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Admins can update profiles" on public.profiles for update using (public.is_admin());
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, name, role)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', ''), 'shopper');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper: is current user an admin?
create or replace function public.is_admin()
returns boolean language sql security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Helper: delete user account securely
create or replace function public.delete_user_account(target_user_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then
    raise exception 'Unauthorized: Only admins can delete accounts.';
  end if;
  -- Deleting from auth.users cascades to public.profiles
  delete from auth.users where id = target_user_id;
end;
$$;

-- 2. PRODUCTS
create table public.products (
  slug text primary key,
  name text not null,
  tagline text not null default '',
  description text not null default '',
  price numeric(10,2) not null default 0,
  unit text not null default '',
  image text not null default '',
  category text not null default '',
  badges text[] not null default '{}',
  nutrition jsonb not null default '{}',
  is_featured boolean not null default false,
  sort_order int not null default 0
);
alter table public.products enable row level security;

create policy "Anyone can read products" on public.products for select using (true);
create policy "Admins can insert products" on public.products for insert with check (public.is_admin());
create policy "Admins can update products" on public.products for update using (public.is_admin());
create policy "Admins can delete products" on public.products for delete using (public.is_admin());


-- 3. CATEGORIES
create table public.categories (
  id serial primary key,
  name text unique not null,
  sort_order int not null default 0
);
alter table public.categories enable row level security;

create policy "Anyone can read categories" on public.categories for select using (true);
create policy "Admins can insert categories" on public.categories for insert with check (public.is_admin());
create policy "Admins can update categories" on public.categories for update using (public.is_admin());
create policy "Admins can delete categories" on public.categories for delete using (public.is_admin());


-- 4. ORDERS
create table public.orders (
  id text primary key,
  user_id uuid references public.profiles(id) on delete set null,
  items jsonb not null default '[]',
  subtotal numeric(10,2) not null default 0,
  shipping numeric(10,2) not null default 0,
  tax numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  shipping_method text not null default 'standard',
  payment_method text not null default 'card',
  address jsonb not null default '{}',
  status text not null default 'Processing' check (status in ('Processing','Shipped','Delivered','Cancelled')),
  created_at timestamptz not null default now()
);
alter table public.orders enable row level security;

create policy "Users can read own orders" on public.orders for select using (auth.uid() = user_id or public.is_admin());
create policy "Users can create orders" on public.orders for insert with check (auth.uid() = user_id);
create policy "Guests can create orders" on public.orders for insert with check (user_id is null);
create policy "Admins can update orders" on public.orders for update using (public.is_admin());


-- 5. ADDRESSES
create table public.addresses (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null references public.profiles(id) on delete cascade,
  label text not null default 'Home',
  full_name text not null default '',
  street text not null default '',
  city text not null default '',
  zip text not null default '',
  is_default boolean not null default false
);
alter table public.addresses enable row level security;

create policy "Users can read own addresses" on public.addresses for select using (auth.uid() = user_id);
create policy "Users can insert own addresses" on public.addresses for insert with check (auth.uid() = user_id);
create policy "Users can update own addresses" on public.addresses for update using (auth.uid() = user_id);
create policy "Users can delete own addresses" on public.addresses for delete using (auth.uid() = user_id);


-- 6. CART ITEMS
create table public.cart_items (
  id serial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_slug text not null references public.products(slug) on delete cascade,
  qty int not null default 1 check (qty > 0),
  unique (user_id, product_slug)
);
alter table public.cart_items enable row level security;

create policy "Users can read own cart" on public.cart_items for select using (auth.uid() = user_id);
create policy "Users can insert own cart" on public.cart_items for insert with check (auth.uid() = user_id);
create policy "Users can update own cart" on public.cart_items for update using (auth.uid() = user_id);
create policy "Users can delete own cart" on public.cart_items for delete using (auth.uid() = user_id);


-- 7. SITE SETTINGS (single row)
create table public.site_settings (
  id int primary key default 1 check (id = 1),
  settings jsonb not null default '{}'
);
alter table public.site_settings enable row level security;

create policy "Anyone can read site settings" on public.site_settings for select using (true);
create policy "Admins can update site settings" on public.site_settings for update using (public.is_admin());
create policy "Admins can insert site settings" on public.site_settings for insert with check (public.is_admin());


-- =============================================
-- SEED DATA
-- =============================================

-- Seed categories
insert into public.categories (name, sort_order) values
  ('Leafy Greens', 1),
  ('Fresh Fruits', 2),
  ('Whole Grains', 3),
  ('Root Vegetables', 4),
  ('Drinks', 5);

-- Seed products
insert into public.products (slug, name, tagline, description, price, unit, image, category, badges, nutrition, is_featured, sort_order) values
  ('organic-lacinato-kale', 'Organic Lacinato Kale', 'Vibrant, nutrient-dense heirloom variety', 'Vibrant, nutrient-dense heirloom variety. Harvested daily from our regenerative farm in Ojai.', 4.99, '250g bunch', '/images/product-kale.jpg', 'Leafy Greens', '{"Organic","Vegan"}', '{"servingSize":"100g","calories":"49 kcal","vitaminK":"681% DV","vitaminC":"134% DV","fiber":"4.1g"}', true, 1),
  ('cherry-radish-bundle', 'Cherry Radish Bundle', 'Farm-to-table crunch in every bite', 'Crisp, peppery cherry radishes with their greens still attached. Picked at sunrise, on shelves by noon.', 4.20, 'bunch', '/images/product-radish.jpg', 'Root Vegetables', '{"Organic","Vegan"}', '{"servingSize":"100g","calories":"16 kcal","vitaminC":"25% DV","fiber":"1.6g"}', false, 2),
  ('wild-blueberries', 'Wild Blueberries', 'Antioxidant-rich berries from high altitudes', 'Tiny, intensely flavored wild blueberries — packed with anthocyanins. Sustainably foraged.', 6.75, '150g box', '/images/product-blueberries.jpg', 'Fresh Fruits', '{"Organic","Vegan"}', '{"servingSize":"100g","calories":"57 kcal","vitaminC":"16% DV","fiber":"2.4g"}', true, 3),
  ('heritage-rainbow-carrots', 'Heritage Rainbow Carrots', 'Multi-colored root vegetables, earthy and sweet', 'Purple, orange and golden heirloom carrots with feathery tops. Sweet and earthy.', 5.30, 'bunch (~500g)', '/images/product-carrots.jpg', 'Root Vegetables', '{"Organic","Vegan","Gluten-Free"}', '{"servingSize":"100g","calories":"41 kcal","vitaminC":"10% DV","fiber":"2.8g"}', false, 4),
  ('ancient-white-quinoa', 'Ancient White Quinoa', 'Pure, high-protein grains for lasting energy', 'Single-origin Andean quinoa — naturally gluten-free, complete protein, light fluffy texture.', 12.50, '500g pack', '/images/product-quinoa.jpg', 'Whole Grains', '{"Organic","Vegan","Gluten-Free"}', '{"servingSize":"100g","calories":"368 kcal","fiber":"7g"}', false, 5),
  ('heirloom-tomatoes', 'Heirloom Tomatoes', 'Sun-ripened, vine to table', 'A mix of heirloom varieties — Brandywine, Green Zebra, Cherokee Purple — grown without sprays.', 6.20, '1kg mixed', '/images/product-tomatoes.jpg', 'Fresh Fruits', '{"Organic","Vegan","Gluten-Free"}', '{"servingSize":"100g","calories":"18 kcal","vitaminC":"23% DV","fiber":"1.2g"}', false, 6),
  ('hass-avocados', 'Hass Avocados', 'Creamy, ripe, ready-to-eat', 'Single-origin Ojai Valley Hass avocados, hand-selected at peak ripeness.', 2.40, 'each', '/images/product-avocado.jpg', 'Fresh Fruits', '{"Organic","Vegan","Gluten-Free"}', '{"servingSize":"100g","calories":"160 kcal","fiber":"6.7g"}', false, 7),
  ('heirloom-vineyard-mix', 'Heirloom Vineyard Mix', 'Sweet, crisp, and bursting with antioxidants', 'Hand-picked dark grapes from regenerative vineyards. Best-seller for snacking and salads.', 12.50, '1kg', '/images/product-grapes.jpg', 'Fresh Fruits', '{"Organic","Vegan"}', '{"servingSize":"100g","calories":"69 kcal","vitaminC":"5% DV","fiber":"0.9g"}', true, 8),
  ('vitality-green-juice', 'Vitality Green Juice', 'Cold-pressed, raw, never pasteurized', 'Kale, cucumber, apple, lemon and ginger — pressed daily and bottled within the hour.', 9.00, '330ml', '/images/product-juice-red.jpg', 'Drinks', '{"Organic","Vegan","Gluten-Free"}', '{"servingSize":"330ml","calories":"120 kcal","vitaminC":"85% DV"}', false, 9);

-- Seed site settings
insert into public.site_settings (id, settings) values (1, '{
  "name": "Ruba Nova",
  "tagline": "Verdant vitality for your soul.",
  "logoUrl": "",
  "contactEmail": "hello@rubanova.com",
  "contactPhone": "+1 (555) 123-4567",
  "address": "742 Greenhouse Lane, Portland OR",
  "heroEyebrow": "100% Sustainably Sourced",
  "heroTitle": "Verdant Vitality",
  "heroAccent": "For Your Soul.",
  "heroSubtitle": "Experience the rejuvenating power of nature through curated organic produce delivered with transparency and care.",
  "heroImageUrl": "",
  "footerNote": "Sustainably grown, thoughtfully curated."
}');
