-- Verificar la restricción de departamento en la tabla meetings
SELECT conname, consrc 
FROM pg_constraint 
WHERE conrelid = 'meetings'::regclass 
AND conname = 'meetings_department_check';

-- Ver qué valores están permitidos actualmente
SELECT DISTINCT department 
FROM meetings 
WHERE department IS NOT NULL;

-- Eliminar la restricción problemática
ALTER TABLE meetings DROP CONSTRAINT IF EXISTS meetings_department_check;

-- Crear nueva restricción que permita todos los departamentos necesarios
ALTER TABLE meetings ADD CONSTRAINT meetings_department_check 
CHECK (department IN ('direccion', 'rrhh', 'procedimientos', 'logistica', 'mantenimiento', 'marketing', 'centros', 'marca', 'incidencias'));

-- Verificar que se puede insertar ahora
-- INSERT INTO meetings (title, department, type, date, start_time, end_time, duration_minutes, participants, leader_email, agenda, objectives, kpis, tasks, notes, summary, status, completion_percentage, created_by)
-- VALUES ('Test', 'rrhh', 'weekly', '2025-10-27', '10:00:00', '11:00:00', 60, '[]', 'test@test.com', 'test', '[]', '{}', '[]', null, 'test', 'completed', 100, 'test@test.com');
