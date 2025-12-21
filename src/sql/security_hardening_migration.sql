-- SECURITY HARDENING MIGRATION
-- This script consolidates table creations that were previously done securely via frontend.
-- Run this in the Supabase SQL Editor.

-- 1. Ensure 'inventory_items' has the 'max_stock' column
ALTER TABLE inventory_items 
ADD COLUMN IF NOT EXISTS max_stock INTEGER DEFAULT 20;

-- 2. Create 'inventory_movements' table
CREATE TABLE IF NOT EXISTS inventory_movements (
  id BIGSERIAL PRIMARY KEY,
  inventory_item_id BIGINT REFERENCES inventory_items(id),
  user_id TEXT,
  user_name TEXT,
  center_id BIGINT,
  type TEXT,
  quantity_change INTEGER,
  previous_quantity INTEGER,
  new_quantity INTEGER,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure columns exist (in case table existed but without them)
ALTER TABLE inventory_movements ADD COLUMN IF NOT EXISTS center_id BIGINT;
ALTER TABLE inventory_movements ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE inventory_movements ADD COLUMN IF NOT EXISTS user_name TEXT;
ALTER TABLE inventory_movements ADD COLUMN IF NOT EXISTS type TEXT;

-- Indexes for 'inventory_movements'
CREATE INDEX IF NOT EXISTS idx_inventory_movements_item_id ON inventory_movements(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_center_id ON inventory_movements(center_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_created_at ON inventory_movements(created_at);

-- 3. Create 'quarterly_review_items' table
CREATE TABLE IF NOT EXISTS quarterly_review_items (
  id BIGSERIAL PRIMARY KEY,
  assignment_id BIGINT NOT NULL REFERENCES quarterly_inventory_assignments(id) ON DELETE CASCADE,
  inventory_item_id BIGINT NOT NULL REFERENCES inventory_items(id),
  product_name TEXT NOT NULL,
  category TEXT,
  current_system_quantity INTEGER NOT NULL DEFAULT 0,
  counted_quantity INTEGER DEFAULT 0,
  regular_quantity INTEGER DEFAULT 0,
  deteriorated_quantity INTEGER DEFAULT 0,
  to_remove_quantity INTEGER DEFAULT 0,
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(assignment_id, inventory_item_id)
);

-- Ensure columns exist (in case table existed but without them)
ALTER TABLE quarterly_review_items ADD COLUMN IF NOT EXISTS assignment_id BIGINT REFERENCES quarterly_inventory_assignments(id) ON DELETE CASCADE;
ALTER TABLE quarterly_review_items ADD COLUMN IF NOT EXISTS inventory_item_id BIGINT REFERENCES inventory_items(id);
ALTER TABLE quarterly_review_items ADD COLUMN IF NOT EXISTS current_system_quantity INTEGER DEFAULT 0;


-- Indexes for 'quarterly_review_items'
CREATE INDEX IF NOT EXISTS idx_quarterly_review_items_assignment_id ON quarterly_review_items(assignment_id);
CREATE INDEX IF NOT EXISTS idx_quarterly_review_items_inventory_item_id ON quarterly_review_items(inventory_item_id);

-- 4. Enable Row Level Security (RLS)
-- This ensures that even if someone gets the anon key, they can't modify schema, and data access is controlled.
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE quarterly_review_items ENABLE ROW LEVEL SECURITY;

-- 5. Create Policies (Permissive for now, to replicate previous behavior but secure schema)
-- Allow all authenticated users to read/write these tables.
-- You can restrict this further based on roles (e.g. only 'authenticated' role).

-- Policy for inventory_movements
CREATE POLICY "Enable all access for authenticated users" ON inventory_movements
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Policy for quarterly_review_items
CREATE POLICY "Enable all access for authenticated users" ON quarterly_review_items
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- IMPORTANT: You should also check if 'exec_sql' RPC exists and remove it or restrict it.
-- DROP FUNCTION IF EXISTS exec_sql;
