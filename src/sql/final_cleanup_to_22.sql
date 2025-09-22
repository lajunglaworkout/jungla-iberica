-- Limpieza final: eliminar usuarios sobrantes para llegar a 22 usuarios exactos
-- Ejecutar en Supabase SQL Editor

-- PASO 1: Eliminar todos los usuarios con emails .com (duplicados de los .es)
DELETE FROM employees 
WHERE email LIKE '%@lajungla.com' 
AND is_active = true;

-- PASO 2: Corregir base_role de encargados (están como 'employee', deben ser 'center_manager')
UPDATE employees 
SET base_role = 'center_manager'
WHERE role = 'Encargado' 
AND base_role = 'employee';

-- VERIFICACIÓN FINAL: Contar usuarios por centro
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

-- VERIFICACIÓN: Total debe ser 22 usuarios
SELECT COUNT(*) as total_usuarios FROM employees WHERE is_active = true;

-- VERIFICACIÓN: Lista final de los 22 usuarios
SELECT 
    ROW_NUMBER() OVER (ORDER BY center_id NULLS FIRST, base_role, name) as num,
    name,
    email,
    base_role,
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
