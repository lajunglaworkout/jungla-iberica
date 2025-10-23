-- Crear tabla quarterly_review_items
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

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_quarterly_review_items_assignment_id ON quarterly_review_items(assignment_id);
CREATE INDEX IF NOT EXISTS idx_quarterly_review_items_inventory_item_id ON quarterly_review_items(inventory_item_id);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_quarterly_review_items_updated_at
  BEFORE UPDATE ON quarterly_review_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
