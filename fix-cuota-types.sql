-- Script para limpiar y recrear los tipos de cuotas correctos
-- Ejecutar en Supabase SQL Editor

-- 1. Añadir columna lleva_iva si no existe
ALTER TABLE cuota_types ADD COLUMN IF NOT EXISTS lleva_iva BOOLEAN DEFAULT true;

-- 2. Eliminar constraint de precio si existe (para permitir precio 0)
ALTER TABLE cuota_types DROP CONSTRAINT IF EXISTS cuota_types_precio_check;

-- 3. Limpiar datos existentes
DELETE FROM cuota_types WHERE center_id = 'sevilla';

-- 4. Insertar los 6 tipos de cuotas correctos para Sevilla (sin Gratuidad por ahora)
INSERT INTO cuota_types (center_id, nombre, precio, lleva_iva, created_at) VALUES
('sevilla', 'Fundador', 45.00, false, NOW()),           -- SUBVENCIONADA - SIN IVA
('sevilla', 'Nuevos', 55.00, true, NOW()),              -- COMERCIAL - CON IVA
('sevilla', 'Bono 5 sesiones', 30.00, true, NOW()),     -- COMERCIAL - CON IVA
('sevilla', 'Bono 10 sesiones', 55.00, true, NOW()),    -- COMERCIAL - CON IVA
('sevilla', 'Fundador 1/2 mes', 20.00, false, NOW()),   -- SUBVENCIONADA - SIN IVA
('sevilla', 'Nuevos medio mes', 25.00, true, NOW());    -- COMERCIAL - CON IVA

-- 4. Verificar que se crearon correctamente
SELECT nombre, precio, lleva_iva, 
       CASE WHEN lleva_iva THEN 'CON IVA' ELSE 'SIN IVA' END as tipo_fiscal
FROM cuota_types 
WHERE center_id = 'sevilla' 
ORDER BY precio DESC;
