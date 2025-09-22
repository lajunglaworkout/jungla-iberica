-- Consultar centros existentes para ver qué center_id son válidos
-- Ejecutar en Supabase SQL Editor

SELECT id, name, city, type, status 
FROM centers 
ORDER BY id;

-- También verificar la estructura de la tabla centers
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'centers' 
ORDER BY ordinal_position;
