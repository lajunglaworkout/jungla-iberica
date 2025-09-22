-- Limpiar y corregir usuarios duplicados y mal clasificados
-- Ejecutar en Supabase SQL Editor

-- PASO 1: Eliminar duplicados por email (mantener el más reciente)
DELETE FROM employees 
WHERE id NOT IN (
    SELECT DISTINCT ON (email) id
    FROM employees 
    WHERE is_active = true
    ORDER BY email, created_at DESC
);

-- PASO 2: Corregir usuarios mal clasificados
-- Los entrenadores deben tener base_role = 'trainer', no 'employee'
UPDATE employees 
SET base_role = 'trainer'
WHERE base_role = 'employee' 
AND role = 'Empleado'
AND center_id IN (9, 10, 11);

-- PASO 3: Eliminar usuarios sobrantes en Sevilla (debe haber solo 2 encargados)
-- Mantener solo Francisco y Salva como encargados
DELETE FROM employees 
WHERE center_id = 9 
AND base_role = 'center_manager'
AND name NOT IN ('Francisco', 'Salva');

-- PASO 4: Corregir directores sobrantes (debe haber solo 4)
-- Mantener solo Vicente, Jonathan, Antonio Durán, Diego
DELETE FROM employees 
WHERE base_role = 'director'
AND name NOT IN ('Vicente Corbaón', 'Jonathan Padilla', 'Antonio Durán', 'Diego Montilla');

-- PASO 5: Eliminar usuario en "Otro" centro
DELETE FROM employees 
WHERE center_id NOT IN (9, 10, 11) 
AND center_id IS NOT NULL
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
