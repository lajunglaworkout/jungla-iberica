-- Agregar columnas faltantes a quarterly_review_items
ALTER TABLE quarterly_review_items
ADD COLUMN IF NOT EXISTS regular_quantity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS deteriorated_quantity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS to_remove_quantity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS observations TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Crear trigger si no existe
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_quarterly_review_items_updated_at ON quarterly_review_items;
CREATE TRIGGER update_quarterly_review_items_updated_at
  BEFORE UPDATE ON quarterly_review_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
