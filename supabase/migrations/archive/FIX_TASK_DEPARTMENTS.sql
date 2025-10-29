-- Script para corregir departamentos de tareas existentes
-- Basado en los emails de los usuarios asignados

-- Actualizar tareas asignadas a Vicente (lajunglacentral@gmail.com) -> rrhh
UPDATE tareas 
SET departamento = 'rrhh'
WHERE asignado_a = 'lajunglacentral@gmail.com' 
AND departamento = 'Sin asignar';

-- Actualizar tareas asignadas a Carlos (carlossuarezparra@gmail.com) -> direccion
UPDATE tareas 
SET departamento = 'direccion'
WHERE asignado_a = 'carlossuarezparra@gmail.com' 
AND departamento = 'Sin asignar';

-- Verificar los cambios
SELECT DISTINCT departamento, COUNT(*) as cantidad
FROM tareas 
WHERE estado = 'pendiente'
GROUP BY departamento
ORDER BY cantidad DESC;

-- Ver tareas actualizadas
SELECT id, titulo, departamento, asignado_a, estado
FROM tareas 
WHERE estado = 'pendiente'
AND departamento != 'Sin asignar'
LIMIT 10;
