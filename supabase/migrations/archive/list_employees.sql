-- Script para listar todos los empleados en Supabase
-- Enfocado en empleados de Sevilla (ID centro 9)

-- 1. Listar todos los empleados con información básica
SELECT 
  id,
  name AS nombre_completo,
  email,
  center_id AS centro_id,
  CASE 
    WHEN center_id = '9' THEN 'Sevilla'
    WHEN center_id = '10' THEN 'Jerez'
    WHEN center_id = '11' THEN 'El Puerto'
    ELSE 'Oficina Central'
  END AS centro_nombre,
  position AS puesto,
  is_active AS activo
FROM employees
ORDER BY center_id, name;

-- 2. Contar empleados por centro
SELECT 
  CASE 
    WHEN center_id = '9' THEN 'Sevilla'
    WHEN center_id = '10' THEN 'Jerez'
    WHEN center_id = '11' THEN 'El Puerto'
    ELSE 'Oficina Central'
  END AS centro,
  COUNT(*) AS total_empleados,
  SUM(CASE WHEN is_active THEN 1 ELSE 0 END) AS activos,
  SUM(CASE WHEN NOT is_active THEN 1 ELSE 0 END) AS inactivos
FROM employees
GROUP BY centro
ORDER BY centro;

-- 3. Detalle de empleados de Sevilla
SELECT 
  id,
  name AS nombre,
  email,
  phone AS telefono,
  position AS puesto,
  hire_date AS fecha_contratacion,
  is_active AS activo
FROM employees
WHERE center_id = '9'
ORDER BY name;
