-- Verificar reuniones guardadas en la tabla meetings
SELECT id, title, department, date, start_time, status, created_at
FROM meetings 
ORDER BY created_at DESC
LIMIT 10;

-- Verificar si hay reuniones del departamento RRHH
SELECT id, title, department, date, start_time, status
FROM meetings 
WHERE department = 'rrhh' OR department = 'RRHH'
ORDER BY created_at DESC;

-- Ver todos los departamentos únicos en meetings
SELECT DISTINCT department, COUNT(*) as cantidad
FROM meetings 
GROUP BY department
ORDER BY cantidad DESC;
