-- Ver usuarios actuales organizados por centro y rol
-- Ejecutar en Supabase SQL Editor

-- Resumen por centro
SELECT 
    CASE 
        WHEN center_id IS NULL THEN '🏢 Marca/Central'
        WHEN center_id = 9 THEN '🏪 Sevilla'
        WHEN center_id = 10 THEN '🏪 Jerez' 
        WHEN center_id = 11 THEN '🏪 Puerto'
        ELSE 'Otro (' || center_id || ')'
    END as centro,
    COUNT(*) as total
FROM employees 
WHERE is_active = true
GROUP BY center_id
ORDER BY centro;

-- Detalle completo de usuarios
SELECT 
    name,
    email,
    role,
    base_role,
    CASE 
        WHEN center_id IS NULL THEN 'Marca/Central'
        WHEN center_id = 9 THEN 'Sevilla'
        WHEN center_id = 10 THEN 'Jerez' 
        WHEN center_id = 11 THEN 'Puerto'
        ELSE 'Centro ' || center_id
    END as centro,
    created_at
FROM employees 
WHERE is_active = true
ORDER BY center_id NULLS FIRST, base_role, name;

-- Buscar duplicados específicos por nombre similar
SELECT name, COUNT(*) as count
FROM employees 
WHERE is_active = true
GROUP BY name 
HAVING COUNT(*) > 1
ORDER BY count DESC;
