-- Añadir campos de permisos a la tabla employees existente
-- Ejecutar en Supabase SQL Editor

-- Añadir campos para el sistema de permisos
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS base_role VARCHAR(50) DEFAULT 'employee' 
CHECK (base_role IN ('ceo', 'director', 'center_manager', 'trainer', 'employee'));

ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS assigned_modules TEXT[] DEFAULT '{}';

-- Actualizar usuarios existentes con roles basados en sus datos
-- CEO
UPDATE employees SET 
    base_role = 'ceo',
    assigned_modules = ARRAY['logistics', 'maintenance', 'accounting', 'marketing', 'hr', 'online', 'events', 'reports']
WHERE name = 'Carlos Suarez Parra';

-- Benito - Director de múltiples departamentos
UPDATE employees SET 
    base_role = 'director',
    assigned_modules = ARRAY['logistics', 'maintenance', 'accounting']
WHERE name = 'Beni';

-- Directores de departamento
UPDATE employees SET 
    base_role = 'director',
    assigned_modules = ARRAY['hr']
WHERE name = 'Vicente';

UPDATE employees SET 
    base_role = 'director',
    assigned_modules = ARRAY['marketing']
WHERE name = 'Diego';

UPDATE employees SET 
    base_role = 'director',
    assigned_modules = ARRAY['events']
WHERE name = 'Antonio';

UPDATE employees SET 
    base_role = 'director',
    assigned_modules = ARRAY['online']
WHERE name = 'Yoni';

-- Encargados de centros
UPDATE employees SET 
    base_role = 'center_manager',
    assigned_modules = ARRAY[]::TEXT[]
WHERE name IN ('Francisco Giraldez', 'Salvador Cabrera');

UPDATE employees SET 
    base_role = 'center_manager',
    assigned_modules = ARRAY[]::TEXT[]
WHERE name IN ('Ivan Fernandez Gonzalez', 'Pablo Benitez Macarro');

-- Entrenadores - solo acceso básico
UPDATE employees SET 
    base_role = 'trainer',
    assigned_modules = ARRAY[]::TEXT[]
WHERE name IN ('Javier Surian', 'Jesus Arias', 'Jesus Rosado', 'Santiago Frias', 'Mario Muñoz Diaz');

-- Empleados - solo acceso básico
UPDATE employees SET 
    base_role = 'employee',
    assigned_modules = ARRAY[]::TEXT[]
WHERE name IN ('Jose Luis Rodriguez Muñoz', 'Antonio Jesus Duran', 'Francisco Estepa Crespo');

-- Asegurar que todos los usuarios tengan is_active = true por defecto
UPDATE employees SET is_active = true WHERE is_active IS NULL;
