-- 1. Create or replace the foreign key from inventory_movements to inventory_items
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_inventory_movements_item_id'
  ) THEN
    ALTER TABLE inventory_movements
    ADD CONSTRAINT fk_inventory_movements_item_id
    FOREIGN KEY (inventory_item_id)
    REFERENCES inventory_items(id)
    ON DELETE CASCADE;
  END IF;
END $$;

-- 2. Ensure quantity column exists in inventory_items (canonical column)
-- and try to backfill from cantidad_actual if quantity is empty
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 0;

UPDATE inventory_items 
SET quantity = cantidad_actual 
WHERE cantidad_actual IS NOT NULL AND (quantity IS NULL OR quantity = 0);

-- 3. Unify column data (drop old custom columns if you are 100% sure, but here we just leave them)
-- ALTER TABLE inventory_items DROP COLUMN IF EXISTS cantidad_actual;

-- 4. Check the schema to confirm column names
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'inventory_items';
