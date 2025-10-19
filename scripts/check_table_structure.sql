-- Script para verificar la estructura de daily_checklists
-- Ejecutar en Supabase SQL Editor

-- Ver estructura completa de la tabla
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns
WHERE table_name = 'daily_checklists'
ORDER BY ordinal_position;

-- Ver constraints de la tabla
SELECT
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'daily_checklists';

-- Intentar insertar un registro de prueba para ver qué falla
-- (comentado para no ejecutar automáticamente)
/*
INSERT INTO daily_checklists (
    center_id,
    date,
    tasks,
    apertura_tasks,
    limpieza_tasks,
    cierre_tasks,
    status
) VALUES (
    '9',
    '2025-10-19',
    '{"apertura":[],"limpieza":[],"cierre":[],"incidencias":[]}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    'en_progreso'
) RETURNING *;
*/
