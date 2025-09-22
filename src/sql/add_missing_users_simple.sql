-- Añadir usuarios faltantes a la tabla employees
-- Ejecutar en Supabase SQL Editor

-- Directores
INSERT INTO employees (name, email, role, base_role, center_id, assigned_modules, is_active)
VALUES 
    ('Vicente Corbaón', 'vicente@lajungla.es', 'Director RRHH', 'director', '1', ARRAY['hr'], true),
    ('Jonathan Padilla', 'jonathan@lajungla.es', 'Director Online', 'director', '1', ARRAY['online'], true),
    ('Antonio Durán', 'antonio@lajungla.es', 'Director Eventos', 'director', '1', ARRAY['events'], true),
    ('Diego Montilla', 'diego@lajungla.es', 'Director Marketing', 'director', '1', ARRAY['marketing'], true)
ON CONFLICT (email) DO NOTHING;

-- Entrenadores Sevilla
INSERT INTO employees (name, email, role, base_role, center_id, assigned_modules, is_active)
VALUES 
    ('Javier Surian', 'javier.sevilla@lajungla.es', 'Entrenador', 'trainer', '2', ARRAY[]::TEXT[], true),
    ('Jesús Rosado', 'jesus.rosado@lajungla.es', 'Entrenador', 'trainer', '2', ARRAY[]::TEXT[], true),
    ('Jesús Arias', 'jesus.arias@lajungla.es', 'Entrenador', 'trainer', '2', ARRAY[]::TEXT[], true),
    ('Santi Frías', 'santi.sevilla@lajungla.es', 'Entrenador', 'trainer', '2', ARRAY[]::TEXT[], true)
ON CONFLICT (email) DO NOTHING;

-- Entrenadores Jerez
INSERT INTO employees (name, email, role, base_role, center_id, assigned_modules, is_active)
VALUES 
    ('Rodri', 'rodri.jerez@lajungla.es', 'Entrenador', 'trainer', '3', ARRAY[]::TEXT[], true),
    ('Mario', 'mario.jerez@lajungla.es', 'Entrenador', 'trainer', '3', ARRAY[]::TEXT[], true),
    ('Antonio', 'antonio.jerez@lajungla.es', 'Entrenador', 'trainer', '3', ARRAY[]::TEXT[], true),
    ('Fran', 'fran.jerez@lajungla.es', 'Entrenador', 'trainer', '3', ARRAY[]::TEXT[], true)
ON CONFLICT (email) DO NOTHING;

-- Empleados Puerto
INSERT INTO employees (name, email, role, base_role, center_id, assigned_modules, is_active)
VALUES 
    ('José', 'jose.puerto@lajungla.es', 'Empleado', 'employee', '4', ARRAY[]::TEXT[], true),
    ('Keko', 'keko.puerto@lajungla.es', 'Empleado', 'employee', '4', ARRAY[]::TEXT[], true),
    ('Jonathan', 'jonathan.puerto@lajungla.es', 'Empleado', 'employee', '4', ARRAY[]::TEXT[], true),
    ('Fran', 'fran.puerto@lajungla.es', 'Empleado', 'employee', '4', ARRAY[]::TEXT[], true)
ON CONFLICT (email) DO NOTHING;

-- Actualizar usuarios existentes que puedan tener roles incorrectos
UPDATE employees SET 
    role = 'Director RRHH',
    base_role = 'director',
    center_id = '1',
    assigned_modules = ARRAY['hr']
WHERE email = 'rrhhlajungla@gmail.com' AND (base_role IS NULL OR base_role != 'director');

UPDATE employees SET 
    role = 'Director Marketing',
    base_role = 'director',
    center_id = '1', 
    assigned_modules = ARRAY['marketing']
WHERE email = 'lajunglaworkoutmk@gmail.com' AND (base_role IS NULL OR base_role != 'director');

UPDATE employees SET 
    role = 'Director Eventos',
    base_role = 'director',
    center_id = '1',
    assigned_modules = ARRAY['events'] 
WHERE email = 'lajunglaeventos@gmail.com' AND (base_role IS NULL OR base_role != 'director');

UPDATE employees SET 
    role = 'Director Online',
    base_role = 'director',
    center_id = '1',
    assigned_modules = ARRAY['online']
WHERE email = 'lajunglaonline@gmail.com' AND (base_role IS NULL OR base_role != 'director');
