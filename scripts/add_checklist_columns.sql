-- Script para agregar columnas de tareas al formato nuevo en daily_checklists
-- Ejecutar este script en el SQL Editor de Supabase

-- Agregar las nuevas columnas para el formato estructurado
ALTER TABLE daily_checklists
ADD COLUMN IF NOT EXISTS apertura_tasks JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS limpieza_tasks JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS cierre_tasks JSONB DEFAULT '[]'::jsonb;

-- Migrar datos del campo 'tasks' antiguo al nuevo formato (si existe)
UPDATE daily_checklists
SET 
  apertura_tasks = COALESCE((tasks->>'apertura')::jsonb, '[]'::jsonb),
  limpieza_tasks = COALESCE((tasks->>'limpieza')::jsonb, '[]'::jsonb),
  cierre_tasks = COALESCE((tasks->>'cierre')::jsonb, '[]'::jsonb)
WHERE tasks IS NOT NULL
  AND (apertura_tasks = '[]'::jsonb OR apertura_tasks IS NULL);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_daily_checklists_center_date 
ON daily_checklists(center_id, date);

CREATE INDEX IF NOT EXISTS idx_daily_checklists_status 
ON daily_checklists(status);

-- Comentarios para documentación
COMMENT ON COLUMN daily_checklists.apertura_tasks IS 'Tareas de apertura del centro en formato JSON';
COMMENT ON COLUMN daily_checklists.limpieza_tasks IS 'Tareas de limpieza del centro en formato JSON';
COMMENT ON COLUMN daily_checklists.cierre_tasks IS 'Tareas de cierre del centro en formato JSON';

-- Mostrar el esquema actualizado
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'daily_checklists'
ORDER BY ordinal_position;
