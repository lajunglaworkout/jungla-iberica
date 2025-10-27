-- Script SQL para limpiar tareas pendientes sin departamento
-- Ejecutar en Supabase SQL Editor

-- Ver tareas a eliminar
SELECT COUNT(*) as total, COUNT(CASE WHEN departamento IS NULL OR departamento = 'Sin asignar' THEN 1 END) as sin_departamento
FROM tareas
WHERE estado = 'pendiente';

-- Eliminar tareas pendientes sin departamento
DELETE FROM tareas
WHERE estado = 'pendiente' AND (departamento IS NULL OR departamento = 'Sin asignar');

-- Verificar resultado
SELECT COUNT(*) as tareas_pendientes_restantes
FROM tareas
WHERE estado = 'pendiente';
