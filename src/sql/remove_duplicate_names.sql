-- Eliminar usuarios duplicados por nombre (mantener solo emails .es)
-- Ejecutar en Supabase SQL Editor

-- PASO 1: Eliminar duplicados de Jesús Arias (mantener .es)
DELETE FROM employees 
WHERE name = 'Jesús Arias' 
AND email = 'jesus.arias@lajungla.com';

-- PASO 2: Eliminar duplicados de Jonathan Padilla (mantener .es)
DELETE FROM employees 
WHERE name = 'Jonathan Padilla' 
AND email = 'jonathan.padilla@lajungla.com';

-- PASO 3: Eliminar duplicados de Jesús Rosado (mantener .es)
DELETE FROM employees 
WHERE name = 'Jesús Rosado' 
AND email = 'jesus.rosado@lajungla.com';

-- PASO 4: Eliminar uno de los Fran (mantener solo el de Jerez)
DELETE FROM employees 
WHERE name = 'Fran' 
AND email = 'fran.puerto@lajungla.es';

-- VERIFICACIÓN: Ver usuarios restantes por centro
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

-- VERIFICACIÓN: Total de usuarios
SELECT COUNT(*) as total_usuarios FROM employees WHERE is_active = true;

-- VERIFICACIÓN: No debe haber más duplicados por nombre
SELECT name, COUNT(*) as count
FROM employees 
WHERE is_active = true
GROUP BY name 
HAVING COUNT(*) > 1
ORDER BY count DESC;
