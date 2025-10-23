-- Ver el contenido real de las tareas
SELECT 
    id,
    center_name,
    date,
    apertura_tasks->0 as primera_tarea_apertura,
    limpieza_tasks->0 as primera_tarea_limpieza,
    cierre_tasks->0 as primera_tarea_cierre
FROM daily_checklists 
WHERE id = 114;

-- Ver todas las tareas de apertura del checklist más reciente
SELECT 
    jsonb_array_elements(apertura_tasks) as tarea
FROM daily_checklists 
WHERE id = 114;
