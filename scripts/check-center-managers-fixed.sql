-- Script para verificar encargados de cada centro
-- Fecha: 2025-10-23

-- Ver todos los roles disponibles primero
SELECT DISTINCT role 
FROM employees 
WHERE is_active = true
ORDER BY role;

-- Ver empleados por centro con sus roles
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
WHERE e.is_active = true
ORDER BY c.name, e.role, e.name;

-- Buscar específicamente a Francisco y Salva
SELECT 
    e.id,
    e.name,
    e.email,
    e.role,
    e.center_id,
    c.name as center_name
FROM employees e
LEFT JOIN centers c ON e.center_id = c.id
WHERE (e.name ILIKE '%francisco%' OR e.name ILIKE '%salva%')
AND e.is_active = true;
