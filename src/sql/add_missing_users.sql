-- Añadir usuarios faltantes a la tabla employees
-- Ejecutar en Supabase SQL Editor

-- Verificar si Vicente existe, si no, añadirlo
INSERT INTO employees (name, email, base_role, center_id, assigned_modules, is_active)
SELECT 'Vicente Corbaón', 'vicente@lajungla.es', 'director', '1', ARRAY['hr'], true
WHERE NOT EXISTS (
    SELECT 1 FROM employees WHERE email = 'vicente@lajungla.es'
);

-- Verificar si Jonathan existe, si no, añadirlo
INSERT INTO employees (name, email, base_role, center_id, assigned_modules, is_active)
SELECT 'Jonathan Padilla', 'jonathan@lajungla.es', 'director', '1', ARRAY['online'], true
WHERE NOT EXISTS (
    SELECT 1 FROM employees WHERE email = 'jonathan@lajungla.es'
);

-- Verificar si Antonio existe, si no, añadirlo
INSERT INTO employees (name, email, base_role, center_id, assigned_modules, is_active)
SELECT 'Antonio Durán', 'antonio@lajungla.es', 'director', '1', ARRAY['events'], true
WHERE NOT EXISTS (
    SELECT 1 FROM employees WHERE email = 'antonio@lajungla.es'
);

-- Verificar si Diego existe, si no, añadirlo
INSERT INTO employees (name, email, base_role, center_id, assigned_modules, is_active)
SELECT 'Diego Montilla', 'diego@lajungla.es', 'director', '1', ARRAY['marketing'], true
WHERE NOT EXISTS (
    SELECT 1 FROM employees WHERE email = 'diego@lajungla.es'
);

-- Añadir más empleados de centros si no existen
INSERT INTO employees (name, email, base_role, center_id, assigned_modules, is_active)
SELECT 'Javier Surian', 'javier.sevilla@lajungla.es', 'trainer', '2', ARRAY[]::TEXT[], true
WHERE NOT EXISTS (
    SELECT 1 FROM employees WHERE email = 'javier.sevilla@lajungla.es'
);

INSERT INTO employees (name, email, base_role, center_id, assigned_modules, is_active)
SELECT 'Jesús Rosado', 'jesus.rosado@lajungla.es', 'trainer', '2', ARRAY[]::TEXT[], true
WHERE NOT EXISTS (
    SELECT 1 FROM employees WHERE email = 'jesus.rosado@lajungla.es'
);

INSERT INTO employees (name, email, base_role, center_id, assigned_modules, is_active)
SELECT 'Jesús Arias', 'jesus.arias@lajungla.es', 'trainer', '2', ARRAY[]::TEXT[], true
WHERE NOT EXISTS (
    SELECT 1 FROM employees WHERE email = 'jesus.arias@lajungla.es'
);

INSERT INTO employees (name, email, base_role, center_id, assigned_modules, is_active)
SELECT 'Santi Frías', 'santi.sevilla@lajungla.es', 'trainer', '2', ARRAY[]::TEXT[], true
WHERE NOT EXISTS (
    SELECT 1 FROM employees WHERE email = 'santi.sevilla@lajungla.es'
);

-- Empleados de Jerez
INSERT INTO employees (name, email, base_role, center_id, assigned_modules, is_active)
SELECT 'Rodri', 'rodri.jerez@lajungla.es', 'trainer', '3', ARRAY[]::TEXT[], true
WHERE NOT EXISTS (
    SELECT 1 FROM employees WHERE email = 'rodri.jerez@lajungla.es'
);

INSERT INTO employees (name, email, base_role, center_id, assigned_modules, is_active)
SELECT 'Mario', 'mario.jerez@lajungla.es', 'trainer', '3', ARRAY[]::TEXT[], true
WHERE NOT EXISTS (
    SELECT 1 FROM employees WHERE email = 'mario.jerez@lajungla.es'
);

INSERT INTO employees (name, email, base_role, center_id, assigned_modules, is_active)
SELECT 'Antonio', 'antonio.jerez@lajungla.es', 'trainer', '3', ARRAY[]::TEXT[], true
WHERE NOT EXISTS (
    SELECT 1 FROM employees WHERE email = 'antonio.jerez@lajungla.es'
);

INSERT INTO employees (name, email, base_role, center_id, assigned_modules, is_active)
SELECT 'Fran', 'fran.jerez@lajungla.es', 'trainer', '3', ARRAY[]::TEXT[], true
WHERE NOT EXISTS (
    SELECT 1 FROM employees WHERE email = 'fran.jerez@lajungla.es'
);

-- Empleados de Puerto
INSERT INTO employees (name, email, base_role, center_id, assigned_modules, is_active)
SELECT 'José', 'jose.puerto@lajungla.es', 'employee', '4', ARRAY[]::TEXT[], true
WHERE NOT EXISTS (
    SELECT 1 FROM employees WHERE email = 'jose.puerto@lajungla.es'
);

INSERT INTO employees (name, email, base_role, center_id, assigned_modules, is_active)
SELECT 'Keko', 'keko.puerto@lajungla.es', 'employee', '4', ARRAY[]::TEXT[], true
WHERE NOT EXISTS (
    SELECT 1 FROM employees WHERE email = 'keko.puerto@lajungla.es'
);

INSERT INTO employees (name, email, base_role, center_id, assigned_modules, is_active)
SELECT 'Jonathan', 'jonathan.puerto@lajungla.es', 'employee', '4', ARRAY[]::TEXT[], true
WHERE NOT EXISTS (
    SELECT 1 FROM employees WHERE email = 'jonathan.puerto@lajungla.es'
);

INSERT INTO employees (name, email, base_role, center_id, assigned_modules, is_active)
SELECT 'Fran', 'fran.puerto@lajungla.es', 'employee', '4', ARRAY[]::TEXT[], true
WHERE NOT EXISTS (
    SELECT 1 FROM employees WHERE email = 'fran.puerto@lajungla.es'
);

-- Actualizar usuarios existentes que puedan tener roles incorrectos
UPDATE employees SET 
    base_role = 'director',
    center_id = '1',
    assigned_modules = ARRAY['hr']
WHERE email = 'rrhhlajungla@gmail.com' AND base_role IS NULL;

UPDATE employees SET 
    base_role = 'director',
    center_id = '1', 
    assigned_modules = ARRAY['marketing']
WHERE email = 'lajunglaworkoutmk@gmail.com' AND base_role IS NULL;

UPDATE employees SET 
    base_role = 'director',
    center_id = '1',
    assigned_modules = ARRAY['events'] 
WHERE email = 'lajunglaeventos@gmail.com' AND base_role IS NULL;

UPDATE employees SET 
    base_role = 'director',
    center_id = '1',
    assigned_modules = ARRAY['online']
WHERE email = 'lajunglaonline@gmail.com' AND base_role IS NULL;
