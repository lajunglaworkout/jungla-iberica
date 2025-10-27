-- Investigación detallada del problema de reuniones

-- 1. Ver TODAS las reuniones ordenadas por fecha de creación
SELECT id, title, department, date, start_time, status, created_at, updated_at
FROM meetings 
ORDER BY created_at DESC;

-- 2. Ver específicamente las reuniones de RRHH (ambos formatos)
SELECT id, title, department, date, start_time, status, created_at
FROM meetings 
WHERE department ILIKE '%rrhh%'
ORDER BY created_at DESC;

-- 3. Verificar si hay reuniones creadas hoy
SELECT id, title, department, date, start_time, status, created_at
FROM meetings 
WHERE DATE(created_at) = CURRENT_DATE
ORDER BY created_at DESC;

-- 4. Ver las últimas 20 reuniones para buscar patrones
SELECT id, title, department, date, start_time, status, created_at
FROM meetings 
ORDER BY created_at DESC
LIMIT 20;

-- 5. Verificar si hay algún trigger o proceso que esté eliminando reuniones
SELECT n.nspname as schema_name, c.relname as table_name, t.tgname as trigger_name, t.tgtype
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE c.relname = 'meetings';

-- 6. Verificar logs de la tabla (si existen)
-- SELECT * FROM meetings_audit ORDER BY created_at DESC LIMIT 10;
