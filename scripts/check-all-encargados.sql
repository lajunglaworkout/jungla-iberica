-- Verificar todos los encargados de todos los centros
-- Fecha: 2025-10-23

SELECT 
    c.id as center_id,
    c.name as center_name,
    e.id as employee_id,
    e.name as employee_name,
    e.email,
    e.role
FROM centers c
LEFT JOIN employees e ON e.center_id = c.id 
WHERE e.role = 'Encargado' 
AND e.is_active = true
ORDER BY c.name, e.name;
