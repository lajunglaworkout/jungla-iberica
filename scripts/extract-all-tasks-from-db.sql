-- Script para extraer TODAS las tareas completas de la base de datos
-- Fecha: 2025-10-23

-- TAREAS DE APERTURA
SELECT 
    'APERTURA' as tipo,
    jsonb_pretty(jsonb_array_elements(apertura_tasks)) as tarea
FROM daily_checklists 
WHERE id = 114;

-- TAREAS DE LIMPIEZA
SELECT 
    'LIMPIEZA' as tipo,
    jsonb_pretty(jsonb_array_elements(limpieza_tasks)) as tarea
FROM daily_checklists 
WHERE id = 114;

-- TAREAS DE CIERRE
SELECT 
    'CIERRE' as tipo,
    jsonb_pretty(jsonb_array_elements(cierre_tasks)) as tarea
FROM daily_checklists 
WHERE id = 114;
