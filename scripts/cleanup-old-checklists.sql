-- Script para limpiar registros antiguos de daily_checklists
-- Fecha: 2025-10-23
-- Problema: Registros antiguos con center_id en formato texto y center_name null

-- 1. Ver registros problemáticos
SELECT id, center_id, center_name, date, status 
FROM daily_checklists 
WHERE center_name IS NULL;

-- 2. OPCIÓN A: Actualizar manualmente los registros antiguos
UPDATE daily_checklists 
SET center_name = 'Sevilla'
WHERE id = 1 AND center_id = 'sevilla';

UPDATE daily_checklists 
SET center_name = 'Jerez'
WHERE id = 2 AND center_id = 'jerez';

-- 3. OPCIÓN B (RECOMENDADA): Eliminar registros muy antiguos (más de 30 días)
-- Estos registros son de octubre 3, ya no son necesarios
DELETE FROM daily_checklists 
WHERE date < CURRENT_DATE - INTERVAL '30 days'
AND center_name IS NULL;

-- 4. Verificar que ya no hay registros con center_name null
SELECT id, center_id, center_name, date, status 
FROM daily_checklists 
WHERE center_name IS NULL;

-- 5. Ver registros actuales (últimos 10)
SELECT id, center_id, center_name, date, status 
FROM daily_checklists 
ORDER BY date DESC 
LIMIT 10;
