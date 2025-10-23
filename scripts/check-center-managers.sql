-- Script para verificar encargados de cada centro
-- Fecha: 2025-10-23

-- Ver todos los empleados con rol center_manager
SELECT 
    e.id,
    e.name,
    e.email,
    e.role,
    e.center_id,
    c.name as center_name,
    e.is_active
FROM employees e
LEFT JOIN centers c ON e.center_id = c.id
WHERE e.role = 'center_manager'
ORDER BY c.name, e.name;

-- Ver todos los centros y sus encargados
SELECT 
    c.id as center_id,
    c.name as center_name,
    COUNT(e.id) as num_encargados,
    STRING_AGG(e.name, ', ') as encargados
FROM centers c
LEFT JOIN employees e ON e.center_id = c.id AND e.role = 'center_manager' AND e.is_active = true
GROUP BY c.id, c.name
ORDER BY c.name;
