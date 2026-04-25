-- =============================================
-- Ruba Nova: P0 Database Migrations
-- Run this in your Supabase SQL Editor
-- =============================================

-- 1. Contact Messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Allow anonymous inserts for contact form
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert contact messages"
  ON contact_messages FOR INSERT
  WITH CHECK (true);
CREATE POLICY "Admins can read contact messages"
  ON contact_messages FOR SELECT
  USING (auth.role() = 'authenticated');

-- 2. Banners table
CREATE TABLE IF NOT EXISTS banners (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  image_url TEXT DEFAULT '',
  link TEXT DEFAULT '/shop',
  "order" INT DEFAULT 0,
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read banners"
  ON banners FOR SELECT
  USING (true);
CREATE POLICY "Authenticated users can manage banners"
  ON banners FOR ALL
  USING (auth.role() = 'authenticated');

-- 3. Shipping Companies table
CREATE TABLE IF NOT EXISTS shipping_companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  default_desk_rate NUMERIC DEFAULT 400,
  default_home_rate NUMERIC DEFAULT 600,
  rates JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE shipping_companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read shipping companies"
  ON shipping_companies FOR SELECT
  USING (true);
CREATE POLICY "Authenticated users can manage shipping"
  ON shipping_companies FOR ALL
  USING (auth.role() = 'authenticated');

-- 4. Seed default shipping companies (optional, remove if you already have data)
INSERT INTO shipping_companies (id, name, default_desk_rate, default_home_rate, rates, active)
VALUES
  ('yalidine', 'Yalidine Express', 400, 600, '{"16 - Alger": {"desk": 300, "home": 400}, "09 - Blida": {"desk": 350, "home": 450}}', true),
  ('zre', 'ZR Express', 350, 500, '{}', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Seed default banner (optional)
INSERT INTO banners (id, title, image_url, link, "order", status)
VALUES
  ('b1', 'Launch Offer: -15%', '/images/hero-produce.jpg', '/shop', 0, 'Active')
ON CONFLICT (id) DO NOTHING;

-- 6. Create storage bucket for product images
-- NOTE: Run this in Supabase Dashboard > Storage > New Bucket
-- Bucket name: product-images
-- Public: Yes
-- Or run this SQL:
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public reads on product images
CREATE POLICY "Public read product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Allow authenticated uploads
CREATE POLICY "Authenticated upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- Allow authenticated deletes
CREATE POLICY "Authenticated delete product images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
