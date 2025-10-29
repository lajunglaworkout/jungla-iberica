-- Verificar departamentos de las tareas existentes
SELECT DISTINCT departamento, COUNT(*) as cantidad
FROM tareas 
WHERE estado = 'pendiente'
GROUP BY departamento
ORDER BY cantidad DESC;

-- Ver algunas tareas de ejemplo con sus departamentos
SELECT id, titulo, departamento, asignado_a, estado
FROM tareas 
WHERE estado = 'pendiente'
LIMIT 10;
