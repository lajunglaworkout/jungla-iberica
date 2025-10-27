-- Verificar restricciones existentes en la tabla meetings
SELECT conname, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'meetings'::regclass 
AND contype = 'c';

-- Ver qué valores de departamento existen actualmente
SELECT DISTINCT department 
FROM meetings 
WHERE department IS NOT NULL;

-- Ver filas que podrían estar causando problemas
SELECT id, title, department 
FROM meetings 
WHERE department NOT IN ('direccion', 'rrhh', 'procedimientos', 'logistica', 'mantenimiento', 'marketing', 'centros', 'marca', 'incidencias')
OR department IS NULL;

-- PASO 1: Eliminar la restricción problemática
ALTER TABLE meetings DROP CONSTRAINT IF EXISTS meetings_department_check;

-- PASO 2: Actualizar valores problemáticos si existen
UPDATE meetings 
SET department = 'direccion' 
WHERE department IS NULL OR department = '';

-- PASO 3: Crear nueva restricción que permita todos los departamentos necesarios
-- Incluir TODOS los departamentos que aparecen en el dashboard
ALTER TABLE meetings ADD CONSTRAINT meetings_department_check 
CHECK (department IN (
  -- Nombres exactos del dashboard
  'Dirección', 
  'RRHH', 
  'RRHH y Procedimientos',
  'Procedimientos',
  'Logística',
  'Mantenimiento',
  'Contabilidad',
  'Marketing',
  'Online',
  'Eventos',
  'Academy',
  'Ventas',
  'Jungla Tech',
  'Centros Operativos',
  'Varios',
  -- También permitir los nombres en minúscula que usa el código
  'direccion', 
  'rrhh', 
  'procedimientos', 
  'logistica', 
  'mantenimiento', 
  'contabilidad',
  'marketing', 
  'online',
  'eventos',
  'academy',
  'ventas',
  'tech',
  'centros', 
  'varios',
  'marca', 
  'incidencias'
));

-- Verificar que se puede insertar ahora
-- INSERT INTO meetings (title, department, type, date, start_time, end_time, duration_minutes, participants, leader_email, agenda, objectives, kpis, tasks, notes, summary, status, completion_percentage, created_by)
-- VALUES ('Test', 'rrhh', 'weekly', '2025-10-27', '10:00:00', '11:00:00', 60, '[]', 'test@test.com', 'test', '[]', '{}', '[]', null, 'test', 'completed', 100, 'test@test.com');
