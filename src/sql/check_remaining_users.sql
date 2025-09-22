-- Ver qué usuarios quedan después de la primera limpieza
-- Ejecutar en Supabase SQL Editor

-- Resumen por centro y rol
SELECT 
    CASE 
        WHEN center_id IS NULL THEN '🏢 Marca/Central'
        WHEN center_id = 9 THEN '🏪 Sevilla'
        WHEN center_id = 10 THEN '🏪 Jerez' 
        WHEN center_id = 11 THEN '🏪 Puerto'
        ELSE 'Otro (' || center_id || ')'
    END as centro,
    base_role,
    COUNT(*) as total
FROM employees 
WHERE is_active = true
GROUP BY center_id, base_role
ORDER BY centro, base_role;

-- Lista detallada de usuarios actuales
SELECT 
    name,
    email,
    role,
    base_role,
    center_id,
    CASE 
        WHEN center_id IS NULL THEN 'Marca/Central'
        WHEN center_id = 9 THEN 'Sevilla'
        WHEN center_id = 10 THEN 'Jerez' 
        WHEN center_id = 11 THEN 'Puerto'
        ELSE 'Centro ' || center_id
    END as centro
FROM employees 
WHERE is_active = true
ORDER BY center_id NULLS FIRST, base_role, name;

-- Buscar posibles duplicados por nombre (sin email)
SELECT name, COUNT(*) as count, STRING_AGG(email, ', ') as emails
FROM employees 
WHERE is_active = true
GROUP BY name 
HAVING COUNT(*) > 1
ORDER BY count DESC;
