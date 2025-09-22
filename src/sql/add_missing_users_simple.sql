-- Añadir usuarios faltantes a la tabla employees
-- Ejecutar en Supabase SQL Editor

-- Directores (pertenecen a la marca, no a centros específicos - sin center_id)
INSERT INTO employees (name, email, role, base_role, assigned_modules, is_active)
VALUES 
    ('Vicente Corbaón', 'vicente@lajungla.es', 'Director', 'director', ARRAY['hr'], true),
    ('Jonathan Padilla', 'jonathan@lajungla.es', 'Director', 'director', ARRAY['online'], true),
    ('Antonio Durán', 'antonio@lajungla.es', 'Director', 'director', ARRAY['events'], true),
    ('Diego Montilla', 'diego@lajungla.es', 'Director', 'director', ARRAY['marketing'], true)
ON CONFLICT (email) DO NOTHING;

-- Encargados Sevilla (usando center_id='9')
INSERT INTO employees (name, email, role, base_role, center_id, assigned_modules, is_active)
VALUES 
    ('Francisco', 'francisco.sevilla@lajungla.es', 'Encargado', 'center_manager', '9', ARRAY[]::TEXT[], true),
    ('Salva', 'salva.sevilla@lajungla.es', 'Encargado', 'center_manager', '9', ARRAY[]::TEXT[], true)
ON CONFLICT (email) DO NOTHING;

-- Entrenadores Sevilla (usando center_id='9')
INSERT INTO employees (name, email, role, base_role, center_id, assigned_modules, is_active)
VALUES 
    ('Javier Surian', 'javier.sevilla@lajungla.es', 'Empleado', 'trainer', '9', ARRAY[]::TEXT[], true),
    ('Jesús Rosado', 'jesus.rosado@lajungla.es', 'Empleado', 'trainer', '9', ARRAY[]::TEXT[], true),
    ('Jesús Arias', 'jesus.arias@lajungla.es', 'Empleado', 'trainer', '9', ARRAY[]::TEXT[], true),
    ('Santi Frías', 'santi.sevilla@lajungla.es', 'Empleado', 'trainer', '9', ARRAY[]::TEXT[], true)
ON CONFLICT (email) DO NOTHING;

-- Encargados Jerez (usando center_id='10')
INSERT INTO employees (name, email, role, base_role, center_id, assigned_modules, is_active)
VALUES 
    ('Iván', 'ivan.jerez@lajungla.es', 'Encargado', 'center_manager', '10', ARRAY[]::TEXT[], true),
    ('Pablo', 'pablo.jerez@lajungla.es', 'Encargado', 'center_manager', '10', ARRAY[]::TEXT[], true)
ON CONFLICT (email) DO NOTHING;

-- Entrenadores Jerez (usando center_id='10')
INSERT INTO employees (name, email, role, base_role, center_id, assigned_modules, is_active)
VALUES 
    ('Rodri', 'rodri.jerez@lajungla.es', 'Empleado', 'trainer', '10', ARRAY[]::TEXT[], true),
    ('Mario', 'mario.jerez@lajungla.es', 'Empleado', 'trainer', '10', ARRAY[]::TEXT[], true),
    ('Antonio', 'antonio.jerez@lajungla.es', 'Empleado', 'trainer', '10', ARRAY[]::TEXT[], true),
    ('Fran', 'fran.jerez@lajungla.es', 'Empleado', 'trainer', '10', ARRAY[]::TEXT[], true)
ON CONFLICT (email) DO NOTHING;

-- Encargados Puerto (usando center_id='11')
INSERT INTO employees (name, email, role, base_role, center_id, assigned_modules, is_active)
VALUES 
    ('Guillermo', 'guillermo.puerto@lajungla.es', 'Encargado', 'center_manager', '11', ARRAY[]::TEXT[], true),
    ('Adrián', 'adrian.puerto@lajungla.es', 'Encargado', 'center_manager', '11', ARRAY[]::TEXT[], true)
ON CONFLICT (email) DO NOTHING;

-- Entrenadores Puerto (usando center_id='11')
INSERT INTO employees (name, email, role, base_role, center_id, assigned_modules, is_active)
VALUES 
    ('José', 'jose.puerto@lajungla.es', 'Empleado', 'trainer', '11', ARRAY[]::TEXT[], true),
    ('Keko', 'keko.puerto@lajungla.es', 'Empleado', 'trainer', '11', ARRAY[]::TEXT[], true),
    ('Jonathan', 'jonathan.puerto@lajungla.es', 'Empleado', 'trainer', '11', ARRAY[]::TEXT[], true),
    ('Fran', 'fran.puerto@lajungla.es', 'Empleado', 'trainer', '11', ARRAY[]::TEXT[], true)
ON CONFLICT (email) DO NOTHING;

-- Actualizar usuarios existentes que puedan tener roles incorrectos (directores sin centro)
UPDATE employees SET 
    base_role = 'director',
    center_id = NULL,
    assigned_modules = ARRAY['hr']
WHERE email = 'rrhhlajungla@gmail.com' AND (base_role IS NULL OR base_role != 'director');

UPDATE employees SET 
    base_role = 'director',
    center_id = NULL, 
    assigned_modules = ARRAY['marketing']
WHERE email = 'lajunglaworkoutmk@gmail.com' AND (base_role IS NULL OR base_role != 'director');

UPDATE employees SET 
    base_role = 'director',
    center_id = NULL,
    assigned_modules = ARRAY['events'] 
WHERE email = 'lajunglaeventos@gmail.com' AND (base_role IS NULL OR base_role != 'director');

UPDATE employees SET 
    base_role = 'director',
    center_id = NULL,
    assigned_modules = ARRAY['online']
WHERE email = 'lajunglaonline@gmail.com' AND (base_role IS NULL OR base_role != 'director');
