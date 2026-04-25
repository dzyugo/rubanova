-- =============================================
-- Ruba Nova: P2 Database Migrations
-- Run this in your Supabase SQL Editor
-- =============================================

-- 1. Add stock column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INT DEFAULT 0;
