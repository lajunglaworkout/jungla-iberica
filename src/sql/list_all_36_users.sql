-- Ver los 36 usuarios actuales organizados por centro
-- Ejecutar en Supabase SQL Editor

-- RESUMEN POR CENTRO Y ROL
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

-- LISTA COMPLETA DE LOS 36 USUARIOS
SELECT 
    ROW_NUMBER() OVER (ORDER BY center_id NULLS FIRST, base_role, name) as num,
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
    center_id
FROM employees 
WHERE is_active = true
ORDER BY center_id NULLS FIRST, base_role, name;

-- VERIFICAR TOTAL
SELECT COUNT(*) as total_usuarios FROM employees WHERE is_active = true;
