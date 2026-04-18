-- =============================================
-- Sri Discount Gallery — Supabase Table Setup
-- Run this in your Supabase SQL Editor
-- =============================================

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT DEFAULT '',
  password TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Orders table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  items JSONB NOT NULL,
  address JSONB NOT NULL,
  subtotal INTEGER NOT NULL,
  delivery_charge INTEGER NOT NULL DEFAULT 0,
  grand_total INTEGER NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'UPI',
  payment_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Insert default admin user (password: admin123)
INSERT INTO users (name, email, phone, password, is_admin)
VALUES ('Admin', 'admin@sridiscount.com', '+91 00000 00000', 'admin123', TRUE)
ON CONFLICT (email) DO NOTHING;

-- 4. Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies — allow all for anon key (simple setup)
CREATE POLICY "Allow all users read" ON users FOR SELECT USING (true);
CREATE POLICY "Allow all users insert" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all users update" ON users FOR UPDATE USING (true);

CREATE POLICY "Allow all orders read" ON orders FOR SELECT USING (true);
CREATE POLICY "Allow all orders insert" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all orders update" ON orders FOR UPDATE USING (true);
