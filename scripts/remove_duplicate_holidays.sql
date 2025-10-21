-- Script para eliminar festivos duplicados
-- Mantiene solo un registro por cada combinación de fecha + nombre + tipo

-- 1. Ver duplicados antes de eliminar (para verificar)
SELECT date, name, type, COUNT(*) as count
FROM holidays
GROUP BY date, name, type
HAVING COUNT(*) > 1
ORDER BY date;

-- 2. Eliminar duplicados manteniendo el registro con ID más bajo
DELETE FROM holidays
WHERE id NOT IN (
  SELECT MIN(id)
  FROM holidays
  GROUP BY date, name, type
);

-- 3. Verificar que no quedan duplicados
SELECT date, name, type, COUNT(*) as count
FROM holidays
GROUP BY date, name, type
HAVING COUNT(*) > 1;

-- 4. Ver festivos finales ordenados por fecha
SELECT id, date, name, type, center_id
FROM holidays
ORDER BY date;
