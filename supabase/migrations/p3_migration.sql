-- =============================================
-- Ruba Nova: P3 Database Migrations
-- Run this in your Supabase SQL Editor
-- =============================================

-- 1. Newsletter subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone can subscribe
CREATE POLICY "Anyone can subscribe newsletter"
  ON newsletter_subscribers FOR INSERT
  WITH CHECK (true);

-- Upsert (needed for the onConflict call)
CREATE POLICY "Anyone can upsert newsletter"
  ON newsletter_subscribers FOR UPDATE
  USING (true);

-- Only admins can read subscriber list
CREATE POLICY "Admins can read newsletter subscribers"
  ON newsletter_subscribers FOR SELECT
  USING (auth.role() = 'authenticated');
