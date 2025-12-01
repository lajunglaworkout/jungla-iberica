-- 1. Añadir columna max_stock si no existe
ALTER TABLE inventory_items 
ADD COLUMN IF NOT EXISTS max_stock INTEGER DEFAULT 20;

-- 2. Actualizar valores nulos a 20 (o el valor por defecto que prefieras)
UPDATE inventory_items 
SET max_stock = 20 
WHERE max_stock IS NULL;

-- 3. Verificar que se ha creado correctamente
SELECT id, nombre_item, cantidad_actual, min_stock, max_stock 
FROM inventory_items 
LIMIT 5;
