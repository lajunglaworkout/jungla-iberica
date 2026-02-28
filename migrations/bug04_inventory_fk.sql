-- BUG-04: Crear FK inventory_movements -> inventory_items
-- Ejecutar en el SQL Editor de Supabase Dashboard
-- NOTA: Verificar primero que no existan registros huérfanos

-- 1. Verificar registros huérfanos (ejecutar primero como consulta)
-- SELECT im.id, im.item_id FROM inventory_movements im
-- LEFT JOIN inventory_items ii ON im.item_id = ii.id
-- WHERE ii.id IS NULL;

-- 2. Si no hay huérfanos, crear la FK
ALTER TABLE inventory_movements
ADD CONSTRAINT fk_inventory_movements_item
FOREIGN KEY (item_id) REFERENCES inventory_items(id)
ON DELETE CASCADE;

-- 3. Crear índice para mejorar el rendimiento de JOINs
CREATE INDEX IF NOT EXISTS idx_inventory_movements_item_id
ON inventory_movements(item_id);

-- 4. Verificar que la FK se creó correctamente
-- SELECT conname, conrelid::regclass, confrelid::regclass
-- FROM pg_constraint
-- WHERE conname = 'fk_inventory_movements_item';
