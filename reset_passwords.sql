-- Script de actualización de contraseñas para Supabase
-- Ejecutar en la consola SQL de Supabase

-- 1. Actualizar usuarios de autenticación
UPDATE auth.users
SET encrypted_password = (
  SELECT crypt('jungla2025', gen_salt('bf'))
)
WHERE email IN (
  'carlossuarezparra@gmail.com',
  'beni.jungla@gmail.com',
  'lajunglacentral@gmail.com',
  'franciscogiraldezmorales@gmail.com',
  'javier.sevilla@lajungla.es'
);

-- 2. Actualizar empleados en tabla pública (opcional)
UPDATE employees
SET password = 'jungla2025'
WHERE email IN (
  'carlossuarezparra@gmail.com',
  'beni.jungla@gmail.com',
  'lajunglacentral@gmail.com',
  'franciscogiraldezmorales@gmail.com',
  'javier.sevilla@lajungla.es'
);

-- 3. Verificar cambios
SELECT id, email, created_at FROM auth.users;
SELECT id, nombre, email FROM employees;
