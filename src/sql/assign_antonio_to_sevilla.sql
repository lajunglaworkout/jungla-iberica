-- Asignar usuario antonionavarro al centro Sevilla (center_id = 9)
-- El usuario actualmente está asignado a Central - Almacén Principal pero debería estar en Sevilla

-- Primero verificar el usuario actual
SELECT id, name, email, center_id, role 
FROM employees 
WHERE email ILIKE '%antonionavarro%' 
   OR name ILIKE '%antonio navarro%'
   OR email ILIKE '%antonio%navarro%';

-- Actualizar el center_id a Sevilla (9)
UPDATE employees 
SET center_id = '9'
WHERE email ILIKE '%antonionavarro%' 
   OR email ILIKE '%antonio%navarro%';

-- Verificar el cambio
SELECT 
    e.id, 
    e.name, 
    e.email, 
    e.center_id,
    c.name as center_name,
    e.role 
FROM employees e
LEFT JOIN centers c ON c.id::text = e.center_id
WHERE e.email ILIKE '%antonionavarro%' 
   OR e.name ILIKE '%antonio navarro%'
   OR e.email ILIKE '%antonio%navarro%';
