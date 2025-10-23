-- Script para añadir la columna center_name a daily_checklists
-- Fecha: 2025-10-23
-- Problema: La columna center_name fue eliminada accidentalmente

-- 1. Verificar estructura actual de la tabla
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'daily_checklists' 
ORDER BY ordinal_position;

-- 2. Añadir la columna center_name si no existe
ALTER TABLE daily_checklists 
ADD COLUMN IF NOT EXISTS center_name TEXT;

-- 3. Actualizar registros existentes con el nombre del centro desde la tabla centers
UPDATE daily_checklists dc
SET center_name = c.name
FROM centers c
WHERE dc.center_id = c.id::text
AND dc.center_name IS NULL;

-- 4. Verificar que se añadió correctamente
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'daily_checklists' 
ORDER BY ordinal_position;

-- 5. Ver registros actualizados
SELECT id, center_id, center_name, date, status 
FROM daily_checklists 
ORDER BY date DESC 
LIMIT 10;
