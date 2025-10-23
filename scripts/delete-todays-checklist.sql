-- Script para eliminar el checklist de hoy y forzar creación de uno nuevo
-- Fecha: 2025-10-23

-- Ver el checklist de hoy
SELECT id, center_id, center_name, date, 
       jsonb_array_length(apertura_tasks) as apertura_count
FROM daily_checklists 
WHERE date = '2025-10-23';

-- Eliminar el checklist de hoy (se creará uno nuevo con las tareas correctas)
DELETE FROM daily_checklists 
WHERE date = '2025-10-23';

-- Verificar que se eliminó
SELECT id, center_id, center_name, date 
FROM daily_checklists 
WHERE date = '2025-10-23';
