-- Añadir Beni al equipo de marca
-- Ejecutar en Supabase SQL Editor

-- Añadir Beni como director con sus módulos específicos
INSERT INTO employees (name, email, role, base_role, assigned_modules, is_active)
VALUES ('Beni', 'beni.jungla@gmail.com', 'Director', 'director', ARRAY['logistics', 'maintenance', 'accounting'], true)
ON CONFLICT (email) DO NOTHING;

-- VERIFICACIÓN: Contar usuarios finales por centro
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

-- VERIFICACIÓN: Total debe ser 23 usuarios (22 + Beni)
SELECT COUNT(*) as total_usuarios FROM employees WHERE is_active = true;

-- VERIFICACIÓN: Lista final completa
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
