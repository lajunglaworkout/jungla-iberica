-- Script completo para restaurar estructura de daily_checklists
-- Fecha: 2025-10-23
-- Problema: Múltiples columnas faltantes (center_name, incidencias, etc.)

-- 1. Ver estructura actual
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'daily_checklists' 
ORDER BY ordinal_position;

-- 2. Añadir TODAS las columnas necesarias si no existen
ALTER TABLE daily_checklists 
ADD COLUMN IF NOT EXISTS center_name TEXT;

ALTER TABLE daily_checklists 
ADD COLUMN IF NOT EXISTS incidencias JSONB DEFAULT '[]'::jsonb;

ALTER TABLE daily_checklists 
ADD COLUMN IF NOT EXISTS apertura_tasks JSONB DEFAULT '[]'::jsonb;

ALTER TABLE daily_checklists 
ADD COLUMN IF NOT EXISTS limpieza_tasks JSONB DEFAULT '[]'::jsonb;

ALTER TABLE daily_checklists 
ADD COLUMN IF NOT EXISTS cierre_tasks JSONB DEFAULT '[]'::jsonb;

ALTER TABLE daily_checklists 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pendiente';

ALTER TABLE daily_checklists 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- 3. Actualizar registros existentes con valores por defecto si son NULL
UPDATE daily_checklists 
SET incidencias = '[]'::jsonb 
WHERE incidencias IS NULL;

UPDATE daily_checklists 
SET apertura_tasks = '[]'::jsonb 
WHERE apertura_tasks IS NULL;

UPDATE daily_checklists 
SET limpieza_tasks = '[]'::jsonb 
WHERE limpieza_tasks IS NULL;

UPDATE daily_checklists 
SET cierre_tasks = '[]'::jsonb 
WHERE cierre_tasks IS NULL;

UPDATE daily_checklists 
SET status = 'pendiente' 
WHERE status IS NULL;

-- 4. Actualizar center_name desde centers si es NULL
UPDATE daily_checklists dc
SET center_name = c.name
FROM centers c
WHERE dc.center_id = c.id::text
AND dc.center_name IS NULL;

-- 5. Verificar estructura final
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'daily_checklists' 
ORDER BY ordinal_position;

-- 6. Ver registros actualizados
SELECT id, center_id, center_name, date, status,
       jsonb_array_length(COALESCE(apertura_tasks, '[]'::jsonb)) as apertura_count,
       jsonb_array_length(COALESCE(limpieza_tasks, '[]'::jsonb)) as limpieza_count,
       jsonb_array_length(COALESCE(cierre_tasks, '[]'::jsonb)) as cierre_count,
       jsonb_array_length(COALESCE(incidencias, '[]'::jsonb)) as incidencias_count
FROM daily_checklists 
ORDER BY date DESC 
LIMIT 10;
