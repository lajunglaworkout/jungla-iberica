-- Script para solucionar el error "updated_at" en la tabla tareas
-- Fecha: 27 de Octubre 2025

-- 1. Verificar si existe la columna updated_at
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'tareas'
AND column_name = 'updated_at';

-- 2. Verificar triggers existentes en la tabla tareas
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'tareas';

-- 3. Si existe un trigger de updated_at, deshabilitarlo temporalmente
-- (Ejecutar solo si hay triggers problemáticos)
-- DROP TRIGGER IF EXISTS handle_updated_at ON tareas;

-- 4. Verificar políticas RLS que puedan estar causando el problema
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'tareas';

-- 5. Intentar actualizar una tarea específica para probar
-- UPDATE tareas 
-- SET estado = 'completada', 
--     completada_por = 'test@example.com', 
--     notas_cierre = 'Prueba de actualización',
--     fecha_completada = NOW()
-- WHERE id = 'e88c9654-c689-4b70-9191-5fe280365a80';

-- 6. Si el problema persiste, crear la columna updated_at si no existe
-- ALTER TABLE tareas ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 7. Crear un trigger simple para updated_at si es necesario
-- CREATE OR REPLACE FUNCTION update_updated_at_column()
-- RETURNS TRIGGER AS $$
-- BEGIN
--     NEW.updated_at = NOW();
--     RETURN NEW;
-- END;
-- $$ language 'plpgsql';

-- CREATE TRIGGER update_tareas_updated_at BEFORE UPDATE ON tareas
--     FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. Verificar el resultado
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'tareas'
ORDER BY ordinal_position;
