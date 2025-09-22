-- Añadir usuarios faltantes a la tabla employees
-- Ejecutar en Supabase SQL Editor

-- Directores (usando center_id='9' - Sevilla como central)
INSERT INTO employees (name, email, role, base_role, center_id, assigned_modules, is_active)
VALUES 
    ('Vicente Corbaón', 'vicente@lajungla.es', 'Director', 'director', '9', ARRAY['hr'], true),
    ('Jonathan Padilla', 'jonathan@lajungla.es', 'Director', 'director', '9', ARRAY['online'], true),
    ('Antonio Durán', 'antonio@lajungla.es', 'Director', 'director', '9', ARRAY['events'], true),
    ('Diego Montilla', 'diego@lajungla.es', 'Director', 'director', '9', ARRAY['marketing'], true)
ON CONFLICT (email) DO NOTHING;

-- Entrenadores Sevilla (usando center_id='9')
INSERT INTO employees (name, email, role, base_role, center_id, assigned_modules, is_active)
VALUES 
    ('Javier Surian', 'javier.sevilla@lajungla.es', 'Empleado', 'trainer', '9', ARRAY[]::TEXT[], true),
    ('Jesús Rosado', 'jesus.rosado@lajungla.es', 'Empleado', 'trainer', '9', ARRAY[]::TEXT[], true),
    ('Jesús Arias', 'jesus.arias@lajungla.es', 'Empleado', 'trainer', '9', ARRAY[]::TEXT[], true),
    ('Santi Frías', 'santi.sevilla@lajungla.es', 'Empleado', 'trainer', '9', ARRAY[]::TEXT[], true)
ON CONFLICT (email) DO NOTHING;

-- Entrenadores Jerez (usando center_id='10')
INSERT INTO employees (name, email, role, base_role, center_id, assigned_modules, is_active)
VALUES 
    ('Rodri', 'rodri.jerez@lajungla.es', 'Empleado', 'trainer', '10', ARRAY[]::TEXT[], true),
    ('Mario', 'mario.jerez@lajungla.es', 'Empleado', 'trainer', '10', ARRAY[]::TEXT[], true),
    ('Antonio', 'antonio.jerez@lajungla.es', 'Empleado', 'trainer', '10', ARRAY[]::TEXT[], true),
    ('Fran', 'fran.jerez@lajungla.es', 'Empleado', 'trainer', '10', ARRAY[]::TEXT[], true)
ON CONFLICT (email) DO NOTHING;

-- Empleados Puerto (usando center_id='11')
INSERT INTO employees (name, email, role, base_role, center_id, assigned_modules, is_active)
VALUES 
    ('José', 'jose.puerto@lajungla.es', 'Empleado', 'employee', '11', ARRAY[]::TEXT[], true),
    ('Keko', 'keko.puerto@lajungla.es', 'Empleado', 'employee', '11', ARRAY[]::TEXT[], true),
    ('Jonathan', 'jonathan.puerto@lajungla.es', 'Empleado', 'employee', '11', ARRAY[]::TEXT[], true),
    ('Fran', 'fran.puerto@lajungla.es', 'Empleado', 'employee', '11', ARRAY[]::TEXT[], true)
ON CONFLICT (email) DO NOTHING;

-- Actualizar usuarios existentes que puedan tener roles incorrectos
UPDATE employees SET 
    base_role = 'director',
    center_id = '9',
    assigned_modules = ARRAY['hr']
WHERE email = 'rrhhlajungla@gmail.com' AND (base_role IS NULL OR base_role != 'director');

UPDATE employees SET 
    base_role = 'director',
    center_id = '9', 
    assigned_modules = ARRAY['marketing']
WHERE email = 'lajunglaworkoutmk@gmail.com' AND (base_role IS NULL OR base_role != 'director');

UPDATE employees SET 
    base_role = 'director',
    center_id = '9',
    assigned_modules = ARRAY['events'] 
WHERE email = 'lajunglaeventos@gmail.com' AND (base_role IS NULL OR base_role != 'director');

UPDATE employees SET 
    base_role = 'director',
    center_id = '9',
    assigned_modules = ARRAY['online']
WHERE email = 'lajunglaonline@gmail.com' AND (base_role IS NULL OR base_role != 'director');
