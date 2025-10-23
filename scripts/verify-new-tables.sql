-- Verificar que las nuevas tablas se crearon correctamente
-- Fecha: 2025-10-23

-- Ver todas las tablas de revisiones
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (table_name LIKE '%quarterly%' OR table_name LIKE '%review%')
ORDER BY table_name;

-- Ver columnas de quarterly_reviews (Inventario)
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'quarterly_reviews' 
ORDER BY ordinal_position;

-- Ver columnas de quarterly_inventory_assignments
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'quarterly_inventory_assignments' 
ORDER BY ordinal_position;

-- Ver columnas de quarterly_maintenance_reviews
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'quarterly_maintenance_reviews' 
ORDER BY ordinal_position;

-- Ver columnas de quarterly_maintenance_assignments
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'quarterly_maintenance_assignments' 
ORDER BY ordinal_position;
