-- Limpiar usuarios duplicados en la tabla employees
-- Ejecutar en Supabase SQL Editor

-- Primero, ver los duplicados por email
SELECT email, COUNT(*) as count, STRING_AGG(name, ', ') as names
FROM employees 
WHERE is_active = true
GROUP BY email 
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- Ver todos los usuarios para identificar duplicados
SELECT id, name, email, role, base_role, center_id, created_at
FROM employees 
WHERE is_active = true
ORDER BY email, created_at;

-- Eliminar duplicados manteniendo solo el más reciente por email
-- (Ejecutar solo después de revisar los resultados anteriores)
/*
DELETE FROM employees 
WHERE id NOT IN (
    SELECT DISTINCT ON (email) id
    FROM employees 
    WHERE is_active = true
    ORDER BY email, created_at DESC
);
*/

-- Contar usuarios finales por centro
SELECT 
    CASE 
        WHEN center_id IS NULL THEN 'Marca/Central'
        WHEN center_id = 9 THEN 'Sevilla'
        WHEN center_id = 10 THEN 'Jerez' 
        WHEN center_id = 11 THEN 'Puerto'
        ELSE 'Otro'
    END as centro,
    base_role,
    COUNT(*) as total
FROM employees 
WHERE is_active = true
GROUP BY center_id, base_role
ORDER BY centro, base_role;
