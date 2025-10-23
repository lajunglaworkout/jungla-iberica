-- Script para verificar la estructura de las tareas en daily_checklists
-- Fecha: 2025-10-23

-- Ver estructura de una tarea de apertura
SELECT 
    id,
    center_name,
    date,
    jsonb_pretty(apertura_tasks) as apertura_tasks_structure
FROM daily_checklists 
WHERE jsonb_array_length(apertura_tasks) > 0
LIMIT 1;

-- Ver estructura de una tarea de limpieza
SELECT 
    id,
    center_name,
    date,
    jsonb_pretty(limpieza_tasks) as limpieza_tasks_structure
FROM daily_checklists 
WHERE jsonb_array_length(limpieza_tasks) > 0
LIMIT 1;

-- Ver estructura de una tarea de cierre
SELECT 
    id,
    center_name,
    date,
    jsonb_pretty(cierre_tasks) as cierre_tasks_structure
FROM daily_checklists 
WHERE jsonb_array_length(cierre_tasks) > 0
LIMIT 1;

-- Ver los campos disponibles en las tareas
SELECT DISTINCT jsonb_object_keys(task) as campo
FROM daily_checklists,
     jsonb_array_elements(apertura_tasks) as task
WHERE jsonb_array_length(apertura_tasks) > 0;
