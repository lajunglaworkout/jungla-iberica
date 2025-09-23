-- Agregar columna min_stock a la tabla inventory_items
-- Este script añade el campo faltante para el stock mínimo

-- Agregar la columna min_stock con valor por defecto 5
ALTER TABLE inventory_items 
ADD COLUMN IF NOT EXISTS min_stock INTEGER DEFAULT 5;

-- Actualizar registros existentes con valores por defecto basados en la categoría
UPDATE inventory_items 
SET min_stock = CASE 
    WHEN categoria = 'Barras' THEN 2
    WHEN categoria = 'Mancuernas' THEN 5
    WHEN categoria = 'Material Deportivo' THEN 3
    WHEN categoria = 'Limpieza' THEN 10
    WHEN categoria = 'Vestuario' THEN 15
    ELSE 5
END
WHERE min_stock IS NULL OR min_stock = 5;

-- Verificar que la columna se agregó correctamente
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'inventory_items' 
AND column_name = 'min_stock';

-- Mostrar algunos registros para verificar
SELECT id, nombre_item, categoria, cantidad_actual, min_stock 
FROM inventory_items 
WHERE center_id = 9 
LIMIT 10;
