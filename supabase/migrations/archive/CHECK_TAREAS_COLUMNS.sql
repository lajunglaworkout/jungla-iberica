-- Verificar columnas de la tabla tareas
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'tareas'
ORDER BY ordinal_position;

-- Ver una tarea de ejemplo
SELECT * FROM tareas LIMIT 1;
